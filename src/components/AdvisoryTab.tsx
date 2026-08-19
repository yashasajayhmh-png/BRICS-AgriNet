import React, { useState, useEffect, useRef } from 'react';
import {
  PlotTelemetry,
  MultiAgentState,
  AdvisoryAgentResponse,
  SimulationAgentResponse,
  SynthesisAgentResponse,
} from '../types';
import { SAMPLE_FARMER_QUERIES, PRIMARY_TOGGLE_REGIONS, BRICS_PLOTS } from '../data/mockData';
import { TelemetryPanel } from './TelemetryPanel';
import {
  Send,
  Sparkles,
  Bot,
  ShieldCheck,
  FileCheck2,
  Volume2,
  VolumeX,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  ArrowRight,
  Lightbulb,
  Cpu,
  Info,
  Clock,
} from 'lucide-react';

interface AdvisoryTabProps {
  selectedPlot: PlotTelemetry;
  setSelectedPlot: (plot: PlotTelemetry) => void;
  presetQuery?: string | null;
}

export function AdvisoryTab({ selectedPlot, setSelectedPlot, presetQuery }: AdvisoryTabProps) {
  const activeRegionConfig = PRIMARY_TOGGLE_REGIONS.find((r) => r.id === selectedPlot.id);
  const [query, setQuery] = useState(
    presetQuery ||
      activeRegionConfig?.defaultQuery ||
      'Should I apply 45 kg/ha Urea top-dressing to my wheat in Ludhiana given 14mm rain forecast on days 3-4 and soil pH 7.4?'
  );

  useEffect(() => {
    if (presetQuery) {
      setQuery(presetQuery);
    }
  }, [presetQuery]);
  const [agentState, setAgentState] = useState<MultiAgentState>({
    currentStep: 0,
    advisoryStatus: 'idle',
    simulationStatus: 'idle',
    synthesisStatus: 'idle',
    advisoryData: null,
    simulationData: null,
    synthesisData: null,
    error: null,
  });

  // Text to Speech State
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechRate, setSpeechRate] = useState(1.0);
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Stop speech when component unmounts or query changes
  useEffect(() => {
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleSelectPlot = (plot: PlotTelemetry) => {
    setSelectedPlot(plot);
    // Reset TTS if playing
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
    const matchedRegion = PRIMARY_TOGGLE_REGIONS.find((r) => r.id === plot.id);
    if (matchedRegion) {
      setQuery(matchedRegion.defaultQuery);
    }
  };

  const handleSelectSampleQuery = (sample: typeof SAMPLE_FARMER_QUERIES[0]) => {
    setQuery(sample.text);
    const plot = BRICS_PLOTS.find((p) => p.id === sample.plotId);
    if (plot) {
      setSelectedPlot(plot);
    }
  };

  const handleReadAloud = (textToRead: string) => {
    if (!('speechSynthesis' in window)) {
      alert('Speech synthesis is not supported in this browser.');
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel(); // clear previous
    // Clean markdown text for smoother reading
    const cleanText = textToRead
      .replace(/[#*_`]/g, '')
      .replace(/\n+/g, '. ')
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = speechRate;
    utterance.pitch = 1.0;

    utterance.onend = () => {
      setIsSpeaking(false);
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
    };

    speechRef.current = utterance;
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const runSequentialMultiAgentPipeline = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;

    // Reset TTS
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }

    // Initialize state
    setAgentState({
      currentStep: 1,
      advisoryStatus: 'running',
      simulationStatus: 'idle',
      synthesisStatus: 'idle',
      advisoryData: null,
      simulationData: null,
      synthesisData: null,
      error: null,
    });

    try {
      // Connect to real-time Server-Sent Events (SSE) streaming pipeline
      const response = await fetch('/api/agent/stream-pipeline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: query,
          plotTelemetry: selectedPlot,
        }),
      });

      if (!response.ok || !response.body) {
        throw new Error(`Streaming failed with status: ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let accumulatedSynthesis = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const blocks = buffer.split('\n\n');
        buffer = blocks.pop() || '';

        for (const block of blocks) {
          if (!block.trim()) continue;
          const eventMatch = block.match(/^event:\s*(.+)$/m);
          const dataMatch = block.match(/^data:\s*(.+)$/m);
          if (!eventMatch || !dataMatch) continue;

          const eventName = eventMatch[1].trim();
          let dataObj: any = null;
          try {
            dataObj = JSON.parse(dataMatch[1].trim());
          } catch {
            continue;
          }

          if (eventName === 'agent_start') {
            if (dataObj.agent === 'advisory') {
              setAgentState((prev) => ({
                ...prev,
                currentStep: 1,
                advisoryStatus: 'running',
              }));
            } else if (dataObj.agent === 'simulation') {
              setAgentState((prev) => ({
                ...prev,
                currentStep: 2,
                simulationStatus: 'running',
              }));
            } else if (dataObj.agent === 'synthesis') {
              setAgentState((prev) => ({
                ...prev,
                currentStep: 3,
                synthesisStatus: 'running',
              }));
            }
          } else if (eventName === 'agent_completed') {
            if (dataObj.agent === 'advisory') {
              setAgentState((prev) => ({
                ...prev,
                currentStep: 2,
                advisoryStatus: 'completed',
                simulationStatus: 'running',
                advisoryData: dataObj.data,
              }));
            } else if (dataObj.agent === 'simulation') {
              setAgentState((prev) => ({
                ...prev,
                currentStep: 3,
                simulationStatus: 'completed',
                synthesisStatus: 'running',
                simulationData: dataObj.data,
              }));
            } else if (dataObj.agent === 'synthesis') {
              setAgentState((prev) => ({
                ...prev,
                currentStep: 0,
                synthesisStatus: 'completed',
                synthesisData: dataObj.data,
              }));
            }
          } else if (eventName === 'synthesis_chunk') {
            accumulatedSynthesis += dataObj.chunk || '';
            setAgentState((prev) => ({
              ...prev,
              currentStep: 3,
              synthesisStatus: 'running',
              synthesisData: {
                agent: 'Farmer Synthesis Agent',
                finalAnswerMarkdown: accumulatedSynthesis,
              },
            }));
          } else if (eventName === 'done') {
            setAgentState((prev) => ({
              ...prev,
              currentStep: 0,
            }));
          } else if (eventName === 'error') {
            throw new Error(dataObj.message || 'Streaming pipeline execution error');
          }
        }
      }
    } catch (err: any) {
      console.warn('SSE Streaming fallback to sequential mode:', err);
      // Fallback: execute sequential requests if stream connection was interrupted
      try {
        const advisoryRes = await fetch('/api/agent/advisory', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: query,
            plotTelemetry: selectedPlot,
          }),
        });
        const advisoryJson = (await advisoryRes.json()).data;
        setAgentState((prev) => ({
          ...prev,
          currentStep: 2,
          advisoryStatus: 'completed',
          simulationStatus: 'running',
          advisoryData: advisoryJson,
        }));

        const simRes = await fetch('/api/agent/simulation-check', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: query,
            plotTelemetry: selectedPlot,
            candidateRecommendations: advisoryJson.candidateRecommendations,
          }),
        });
        const simJson = (await simRes.json()).data;
        setAgentState((prev) => ({
          ...prev,
          currentStep: 3,
          simulationStatus: 'completed',
          synthesisStatus: 'running',
          simulationData: simJson,
        }));

        const synthRes = await fetch('/api/agent/synthesis', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: query,
            plotTelemetry: selectedPlot,
            advisoryResult: advisoryJson,
            simulationResult: simJson,
          }),
        });
        const synthJson = (await synthRes.json()).data;
        setAgentState((prev) => ({
          ...prev,
          currentStep: 0,
          synthesisStatus: 'completed',
          synthesisData: synthJson,
        }));
      } catch (fallbackErr: any) {
        setAgentState((prev) => ({
          ...prev,
          currentStep: 0,
          advisoryStatus: prev.advisoryStatus === 'running' ? 'error' : prev.advisoryStatus,
          simulationStatus: prev.simulationStatus === 'running' ? 'error' : prev.simulationStatus,
          synthesisStatus: prev.synthesisStatus === 'running' ? 'error' : prev.synthesisStatus,
          error: fallbackErr.message || 'Error occurred during multi-agent reasoning.',
        }));
      }
    }
  };

  const isPipelineRunning =
    agentState.advisoryStatus === 'running' ||
    agentState.simulationStatus === 'running' ||
    agentState.synthesisStatus === 'running';

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner Explaining Multi-Agent Flow */}
      <div className="bg-emerald-900/20 border border-emerald-700/30 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-800/60 text-emerald-300">
              <Bot className="w-5 h-5" />
            </span>
            <h2 className="text-base sm:text-lg font-bold text-white">
              Multi-Agent Advisory Architecture
            </h2>
            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-700/60 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-emerald-400" />
              <span>Streaming Multi-Agent SSE</span>
            </span>
          </div>
          <p className="text-xs sm:text-sm text-stone-300 mt-1 max-w-3xl">
            Unlike a single black-box LLM, BRICS AgriNet streams reasoning in real-time across specialist agents:
            <strong className="text-emerald-300"> 1. Agronomic Advisor</strong> (generates candidates) ➔
            <strong className="text-amber-300"> 2. Biophysical Simulation Checker</strong> (validates against soil/weather physics) ➔
            <strong className="text-teal-300"> 3. Farmer Synthesis Agent</strong> (real-time token streaming).
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs bg-stone-900/80 px-3 py-2 rounded-xl border border-stone-800 text-stone-300 shrink-0">
          <Info className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Transparent Agent Cards reveal reasoning at each step</span>
        </div>
      </div>

      {/* Telemetry Panel with 3-Region Switcher */}
      <TelemetryPanel selectedPlot={selectedPlot} onSelectPlot={handleSelectPlot} />

      {/* Query Input Section */}
      <div className="bg-stone-900 rounded-2xl border border-stone-800 p-4 sm:p-5 shadow-lg space-y-4">
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="farmer-query-input" className="text-sm font-semibold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" aria-hidden="true" />
              <span>Farmer Query (Plain Language)</span>
            </label>
            <span id="query-context-hint" className="text-xs text-stone-400">
              Context bound to: <strong className="text-emerald-400">{selectedPlot.crop} ({selectedPlot.country})</strong>
            </span>
          </div>

          {/* Quick Prompt Chips */}
          <div className="space-y-2 mb-3">
            {activeRegionConfig && (
              <div className="flex flex-wrap items-center gap-1.5 bg-stone-950/60 p-2 rounded-xl border border-stone-800/80 text-xs">
                <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1 mr-1">
                  <span aria-hidden="true">{activeRegionConfig.flag}</span>
                  <span>{activeRegionConfig.name} Suggested Prompts:</span>
                </span>
                {activeRegionConfig.quickQuestions.map((qq, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setQuery(qq)}
                    aria-label={`Use suggested prompt: ${qq}`}
                    className="text-[11px] px-2.5 py-1 rounded-md bg-stone-800 hover:bg-emerald-950/80 text-stone-300 hover:text-emerald-200 border border-stone-700 hover:border-emerald-700/60 transition-all text-left flex items-center gap-1 focus:outline-none focus:ring-1 focus:ring-emerald-400"
                  >
                    <span>{qq}</span>
                  </button>
                ))}
              </div>
            )}

            <div className="flex flex-wrap gap-2" role="group" aria-label="Sample Farmer Questions">
              <span className="text-xs text-stone-400 self-center mr-1">All Sample Questions:</span>
              {SAMPLE_FARMER_QUERIES.map((sample) => (
                <button
                  key={sample.id}
                  type="button"
                  id={`sample-query-${sample.id}`}
                  onClick={() => handleSelectSampleQuery(sample)}
                  aria-label={`Load sample query: ${sample.label}`}
                  className={`text-xs px-2.5 py-1.5 rounded-lg border transition-all text-left flex items-center gap-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-400 ${
                    selectedPlot.id === sample.plotId
                      ? 'bg-emerald-950/60 border-emerald-600/60 text-emerald-200 font-medium'
                      : 'bg-stone-800 hover:bg-stone-700 text-stone-200 border-stone-700 hover:border-stone-600'
                  }`}
                >
                  <span>{sample.label}</span>
                  <ChevronRight className="w-3 h-3 text-stone-400" aria-hidden="true" />
                </button>
              ))}
            </div>
          </div>

          {/* Text Area Form */}
          <form onSubmit={runSequentialMultiAgentPipeline} aria-label="Farmer Advisory Form" className="space-y-3">
            <div className="relative">
              <textarea
                id="farmer-query-input"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ask about sowing dates, fertilizer dosage, irrigation, pest risks, or weather precautions..."
                rows={3}
                aria-required="true"
                aria-describedby="query-context-hint"
                className="w-full bg-stone-950 text-stone-100 text-sm rounded-xl p-3.5 border border-stone-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent placeholder-stone-500 resize-none font-sans"
              />
              <div className="absolute bottom-3 right-3 flex items-center gap-2">
                <button
                  type="submit"
                  id="submit-advisory-pipeline"
                  disabled={isPipelineRunning || !query.trim()}
                  aria-busy={isPipelineRunning}
                  aria-label={isPipelineRunning ? "Running multi-agent pipeline" : "Run Multi-Agent Advisory Pipeline"}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-emerald-400 ${
                    isPipelineRunning || !query.trim()
                      ? 'bg-stone-800 text-stone-500 cursor-not-allowed border border-stone-700'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white border border-emerald-400/40 hover:scale-[1.02] active:scale-[0.98]'
                  }`}
                >
                  {isPipelineRunning ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-emerald-300" aria-hidden="true" />
                      <span>Running Multi-Agent Pipeline...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" aria-hidden="true" />
                      <span>Run Multi-Agent Advisory</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Multi-Agent Sequential Execution Cards */}
      {(agentState.currentStep > 0 || agentState.advisoryData || agentState.synthesisData) && (
        <section aria-label="Multi-Agent Reasoning Pipeline Execution" aria-live="polite" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Cpu className="w-5 h-5 text-emerald-400" aria-hidden="true" />
              <span>Multi-Agent Reasoning Pipeline</span>
            </h3>
            <span className="text-xs text-stone-400 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-stone-400" aria-hidden="true" />
              <span>Sequential Agent Execution</span>
            </span>
          </div>

          {/* STEP 1: Agronomic Advisory Agent */}
          <div
            role="region"
            aria-label="Step 1: Agronomic Advisory Agent"
            className={`rounded-2xl border transition-all duration-300 p-4 sm:p-5 ${
              agentState.advisoryStatus === 'running'
                ? 'bg-emerald-950/40 border-emerald-500 shadow-emerald-900/20 shadow-lg ring-1 ring-emerald-500/50 animate-pulse'
                : agentState.advisoryStatus === 'completed'
                ? 'bg-stone-900 border-emerald-800/60 shadow-md'
                : 'bg-stone-900/60 border-stone-800 opacity-60'
            }`}
          >
            <div className="flex items-start sm:items-center justify-between gap-3 pb-3 border-b border-stone-800">
              <div className="flex items-center gap-3">
                <div
                  aria-hidden="true"
                  className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs ${
                    agentState.advisoryStatus === 'completed'
                      ? 'bg-emerald-600 text-white'
                      : agentState.advisoryStatus === 'running'
                      ? 'bg-emerald-500 text-stone-900 animate-spin'
                      : 'bg-stone-800 text-stone-400'
                  }`}
                >
                  {agentState.advisoryStatus === 'completed' ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : (
                    '1'
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-sm sm:text-base text-white">
                      Agent 1: Agronomic Advisory Agent
                    </h4>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-700/60">
                      ⚡ Live Gemini 3.7 Flash Call
                    </span>
                  </div>
                  <p className="text-xs text-stone-400">
                    Ingests plot telemetry and generates 1-2 localized agronomic candidate strategies
                  </p>
                </div>
              </div>

              <div role="status" aria-live="polite">
                {agentState.advisoryStatus === 'running' && (
                  <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" aria-hidden="true" /> Analyzing telemetry...
                  </span>
                )}
                {agentState.advisoryStatus === 'completed' && (
                  <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" aria-hidden="true" /> Formulated Candidates
                  </span>
                )}
              </div>
            </div>

            {/* Content for Step 1 */}
            {agentState.advisoryData && (
              <div className="mt-4 space-y-3 text-xs sm:text-sm">
                <div className="bg-stone-950/70 rounded-xl p-3 border border-stone-800">
                  <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider block mb-1">
                    Telemetry Assessment
                  </span>
                  <p className="text-stone-300">{agentState.advisoryData.telemetryAssessment}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3" role="list" aria-label="Candidate Agronomic Recommendations">
                  {agentState.advisoryData.candidateRecommendations.map((rec, idx) => (
                    <div
                      key={rec.id || idx}
                      role="listitem"
                      className="bg-stone-800/80 rounded-xl p-3.5 border border-stone-700/70 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-emerald-300">{rec.id}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-stone-700 text-stone-300">
                          Candidate {idx + 1}
                        </span>
                      </div>
                      <h5 className="font-bold text-white text-sm">{rec.title}</h5>
                      <p className="text-xs text-stone-300">{rec.summary}</p>
                      <div className="text-xs text-stone-400 pt-1 border-t border-stone-700/50">
                        <strong className="text-stone-300">Inputs:</strong> {rec.inputAdvice}
                      </div>
                      {rec.potentialRisks && (
                        <div className="text-[11px] text-amber-300/90 flex items-start gap-1">
                          <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-400" aria-hidden="true" />
                          <span>Risk: {rec.potentialRisks}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {agentState.advisoryData.reasoningSteps && (
                  <div className="bg-stone-950/40 rounded-xl p-3 border border-stone-800/80">
                    <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider block mb-1">
                      Internal Advisory Reasoning
                    </span>
                    <ul className="list-disc list-inside space-y-1 text-xs text-stone-400">
                      {agentState.advisoryData.reasoningSteps.map((step, i) => (
                        <li key={i}>{step}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* STEP 2: Biophysical Simulation Check Agent */}
          <div
            role="region"
            aria-label="Step 2: Biophysical Simulation Check Agent"
            className={`rounded-2xl border transition-all duration-300 p-4 sm:p-5 ${
              agentState.simulationStatus === 'running'
                ? 'bg-amber-950/30 border-amber-500 shadow-amber-900/20 shadow-lg ring-1 ring-amber-500/50 animate-pulse'
                : agentState.simulationStatus === 'completed'
                ? 'bg-stone-900 border-amber-700/60 shadow-md'
                : 'bg-stone-900/60 border-stone-800 opacity-60'
            }`}
          >
            <div className="flex items-start sm:items-center justify-between gap-3 pb-3 border-b border-stone-800">
              <div className="flex items-center gap-3">
                <div
                  aria-hidden="true"
                  className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs ${
                    agentState.simulationStatus === 'completed'
                      ? 'bg-amber-600 text-white'
                      : agentState.simulationStatus === 'running'
                      ? 'bg-amber-500 text-stone-900 animate-spin'
                      : 'bg-stone-800 text-stone-400'
                  }`}
                >
                  {agentState.simulationStatus === 'completed' ? (
                    <ShieldCheck className="w-5 h-5" />
                  ) : (
                    '2'
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-sm sm:text-base text-white">
                      Agent 2: Biophysical Simulation Check Agent
                    </h4>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-700/60">
                      ⚡ Live Gemini 3.7 Flash Call
                    </span>
                  </div>
                  <p className="text-xs text-stone-400">
                    Rule-based plausibility engine simulating APSIM-SoilWat / DSSAT CROPGRO biophysical equations
                  </p>
                </div>
              </div>

              <div role="status" aria-live="polite">
                {agentState.simulationStatus === 'running' && (
                  <span className="text-xs font-semibold text-amber-400 flex items-center gap-1.5">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" aria-hidden="true" /> Stress-testing physics...
                  </span>
                )}
                {agentState.simulationStatus === 'completed' && (
                  <span
                    className={`text-xs font-bold px-2.5 py-1 rounded-lg border flex items-center gap-1.5 ${
                      agentState.simulationData?.overallVerdict === 'PASSED'
                        ? 'bg-emerald-950 text-emerald-300 border-emerald-700'
                        : 'bg-amber-950 text-amber-300 border-amber-700'
                    }`}
                  >
                    <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Verdict: {agentState.simulationData?.overallVerdict}</span>
                  </span>
                )}
              </div>
            </div>

            {/* Content for Step 2 */}
            {agentState.simulationData && (
              <div className="mt-4 space-y-3 text-xs sm:text-sm">
                <div className="flex flex-wrap items-center justify-between gap-2 bg-stone-950/70 p-3 rounded-xl border border-stone-800 text-xs">
                  <span className="text-stone-300">
                    Engine Simulation: <strong className="text-white">{agentState.simulationData.engineSimulated}</strong>
                  </span>
                  <span className="text-amber-300 font-bold">
                    Plausibility Score: {agentState.simulationData.plausibilityScore}/100
                  </span>
                </div>

                {/* Biophysical Checks List */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3" role="list" aria-label="Biophysical Equation Check Modules">
                  {agentState.simulationData.biophysicalChecks.map((check, idx) => (
                    <div
                      key={idx}
                      role="listitem"
                      className="bg-stone-800/80 rounded-xl p-3 border border-stone-700/70 space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-white truncate">{check.module}</span>
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                            check.verdict === 'PASS'
                              ? 'bg-emerald-900/80 text-emerald-300 border border-emerald-700'
                              : check.verdict === 'WARNING'
                              ? 'bg-amber-900/80 text-amber-300 border border-amber-700'
                              : 'bg-rose-900/80 text-rose-300 border border-rose-700'
                          }`}
                        >
                          {check.verdict}
                        </span>
                      </div>
                      <div className="text-[10px] text-stone-400">Metric: {check.simulatedMetric}</div>
                      <p className="text-xs text-stone-300 leading-snug">{check.observation}</p>
                    </div>
                  ))}
                </div>

                {/* Required Modifications */}
                {agentState.simulationData.requiredModifications && (
                  <div className="bg-amber-950/40 rounded-xl p-3 border border-amber-800/60 text-xs">
                    <span className="font-bold text-amber-300 flex items-center gap-1.5 mb-1">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-400" aria-hidden="true" />
                      <span>Simulation-Enforced Guardrails</span>
                    </span>
                    <p className="text-amber-100/90">{agentState.simulationData.requiredModifications}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* STEP 3: Final Synthesis Output */}
          <div
            role="region"
            aria-label="Step 3: Final Synthesized Farmer Advisory"
            className={`rounded-2xl border transition-all duration-300 p-4 sm:p-6 ${
              agentState.synthesisStatus === 'running'
                ? 'bg-teal-950/30 border-teal-500 shadow-teal-900/20 shadow-lg ring-1 ring-teal-500/50 animate-pulse'
                : agentState.synthesisStatus === 'completed'
                ? 'bg-gradient-to-b from-stone-900 to-stone-950 border-teal-600/60 shadow-xl'
                : 'bg-stone-900/60 border-stone-800 opacity-60'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-800">
              <div className="flex items-center gap-3">
                <div
                  aria-hidden="true"
                  className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs ${
                    agentState.synthesisStatus === 'completed'
                      ? 'bg-teal-600 text-white'
                      : agentState.synthesisStatus === 'running'
                      ? 'bg-teal-500 text-stone-900 animate-spin'
                      : 'bg-stone-800 text-stone-400'
                  }`}
                >
                  {agentState.synthesisStatus === 'completed' ? (
                    <FileCheck2 className="w-5 h-5" />
                  ) : (
                    '3'
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-base sm:text-lg text-white">
                      Final Synthesized Advisory for Farmer
                    </h4>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-teal-950 text-teal-300 border border-teal-700/60">
                      ⚡ Live Gemini 3.7 Flash Call
                    </span>
                  </div>
                  <p className="text-xs text-stone-400">
                    Combined agronomic guidance &amp; biophysical simulation safeguards in plain, accessible language
                  </p>
                </div>
              </div>

              {/* Read Aloud & Voice Speed Slider Controls */}
              {agentState.synthesisData && (
                <div className="flex flex-wrap items-center gap-2.5">
                  <div className="flex items-center gap-1.5 bg-stone-950/80 px-2.5 py-1 rounded-xl border border-stone-800 text-xs">
                    <span className="text-[11px] text-stone-400">Speed:</span>
                    <input
                      type="range"
                      min="0.5"
                      max="1.8"
                      step="0.1"
                      value={speechRate}
                      onChange={(e) => setSpeechRate(Number(e.target.value))}
                      aria-label="Adjust spoken speech playback rate"
                      className="w-16 h-1 bg-stone-700 rounded-lg appearance-none cursor-pointer accent-teal-400"
                    />
                    <span className="text-[11px] font-mono text-teal-300 font-bold w-7 text-right">
                      {speechRate.toFixed(1)}x
                    </span>
                  </div>

                  <button
                    type="button"
                    id="read-aloud-btn"
                    aria-pressed={isSpeaking}
                    aria-label={isSpeaking ? "Stop spoken reading of advisory" : "Read advisory aloud using text-to-speech"}
                    onClick={() => handleReadAloud(agentState.synthesisData!.finalAnswerMarkdown)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border focus:outline-none focus:ring-2 focus:ring-teal-400 ${
                      isSpeaking
                        ? 'bg-amber-600 text-white border-amber-400 animate-pulse'
                        : 'bg-stone-800 hover:bg-stone-700 text-stone-200 border-stone-700'
                    }`}
                  >
                    {isSpeaking ? (
                      <>
                        <VolumeX className="w-4 h-4 text-white" aria-hidden="true" />
                        <span>Stop Speech</span>
                      </>
                    ) : (
                      <>
                        <Volume2 className="w-4 h-4 text-teal-400" aria-hidden="true" />
                        <span>Read Aloud</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* Synthesis Markdown Display */}
            {agentState.synthesisStatus === 'running' && !agentState.synthesisData && (
              <div role="status" aria-live="polite" className="py-8 text-center space-y-3">
                <RefreshCw className="w-8 h-8 text-teal-400 animate-spin mx-auto" aria-hidden="true" />
                <p className="text-sm text-stone-300 font-medium">
                  Synthesizing agronomic recommendations with biophysical simulation safeguards...
                </p>
                <div className="text-[11px] text-teal-400 font-mono flex items-center justify-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 animate-pulse" aria-hidden="true" />
                  <span>Connecting to real-time Gemini token stream...</span>
                </div>
              </div>
            )}

            {agentState.synthesisData && (
              <div className="mt-5 space-y-4">
                {/* Streaming in progress banner */}
                {agentState.synthesisStatus === 'running' && (
                  <div role="status" aria-live="polite" className="bg-teal-950/40 border border-teal-700/50 rounded-xl p-2.5 flex items-center justify-between text-xs text-teal-300">
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-teal-400 animate-ping" aria-hidden="true" />
                      <span className="font-semibold">Streaming synthesis tokens live...</span>
                    </span>
                    <span className="font-mono text-[10px] text-teal-400 bg-teal-900/60 px-2 py-0.5 rounded">
                      SSE Channel Active
                    </span>
                  </div>
                )}

                {/* Audio Wave Indicator if speaking */}
                {isSpeaking && (
                  <div role="status" aria-live="polite" className="bg-teal-950/50 border border-teal-800/60 rounded-xl p-2.5 flex items-center justify-between gap-3 text-xs text-teal-200">
                    <div className="flex items-center gap-2">
                      <Volume2 className="w-4 h-4 text-teal-400 animate-bounce" aria-hidden="true" />
                      <span>Reading advisory to farmer...</span>
                    </div>
                    <div className="flex items-center gap-1" aria-hidden="true">
                      <span className="w-1.5 h-4 bg-teal-400 rounded-full animate-pulse" />
                      <span className="w-1.5 h-6 bg-teal-300 rounded-full animate-pulse delay-75" />
                      <span className="w-1.5 h-3 bg-teal-500 rounded-full animate-pulse delay-150" />
                      <span className="w-1.5 h-5 bg-teal-400 rounded-full animate-pulse delay-100" />
                    </div>
                  </div>
                )}

                {/* Final Plain-language content */}
                <div
                  role="region"
                  aria-label="Synthesized Farmer Action Plan"
                  aria-live="polite"
                  className="prose prose-invert prose-emerald max-w-none text-stone-200 text-sm leading-relaxed space-y-3 bg-stone-950/60 p-5 rounded-xl border border-stone-800/80 relative"
                >
                  <div
                    className="whitespace-pre-wrap font-sans"
                    dangerouslySetInnerHTML={{
                      __html: agentState.synthesisData.finalAnswerMarkdown
                        .replace(/### (.*)/g, '<h3 class="text-base sm:text-lg font-bold text-teal-300 mt-4 mb-2">$1</h3>')
                        .replace(/#### (.*)/g, '<h4 class="text-sm font-bold text-amber-300 mt-3 mb-1">$1</h4>')
                        .replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>')
                        .replace(/\*(.*?)\*/g, '<em class="text-stone-300">$1</em>'),
                    }}
                  />
                  {agentState.synthesisStatus === 'running' && (
                    <span className="inline-block w-2 h-4 bg-teal-400 animate-pulse align-middle ml-1" aria-hidden="true" />
                  )}
                </div>
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
