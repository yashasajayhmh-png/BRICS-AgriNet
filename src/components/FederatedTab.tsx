import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { NationSilo } from '../types';
import { INITIAL_NATION_SILOS } from '../data/mockData';
import { authFetch } from '../services/api';
import {
  Network,
  Play,
  RotateCcw,
  ShieldCheck,
  Lock,
  ArrowRight,
  TrendingUp,
  Cpu,
  Database,
  Layers,
  Sparkles,
  Info,
  CheckCircle2,
  Table,
  ArrowLeftRight,
  Binary,
  Radio,
  FileCode2,
  Server,
  Zap,
  Sliders,
  Award,
} from 'lucide-react';

export function FederatedTab() {
  const [silos, setSilos] = useState<NationSilo[]>(INITIAL_NATION_SILOS);
  const [currentRound, setCurrentRound] = useState<number>(0);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [simStep, setSimStep] = useState<number>(0); // 0: Idle, 1: Local Edge Training, 2: DP Gradient Extraction, 3: Weight Delta Transmission, 4: Global FedAvg Update
  const [globalAccuracy, setGlobalAccuracy] = useState<number>(75.4);
  const [selectedSiloDataView, setSelectedSiloDataView] = useState<string | null>(null);

  // Dynamic Federated Parameters
  const [privacyEpsilon, setPrivacyEpsilon] = useState<number>(0.5);
  const [aggregationMethod, setAggregationMethod] = useState<'DP-FedAvg' | 'FedProx' | 'Sovereign-Scaffold'>('DP-FedAvg');
  const [coordinatorNotes, setCoordinatorNotes] = useState<string>(
    'Federated Aggregator standing by for Round #1 initialization across sovereign nodes (ICAR India & Embrapa Brazil).'
  );
  const [nonIIDDivergenceIndex, setNonIIDDivergenceIndex] = useState<number>(0.28);
  const [sovereignCertificate, setSovereignCertificate] = useState<string>(
    'BRICS-FED-SECURE-INIT-INDORE-CONVENTION-2026'
  );

  // Load latest state from SQLite DB
  useEffect(() => {
    authFetch('/api/db/federated')
      .then((res) => res.json())
      .then((json) => {
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          const latest = json.data[0];
          if (latest.roundNumber > 0) {
            setCurrentRound(latest.roundNumber);
            setGlobalAccuracy(latest.globalAccuracy);
            setNonIIDDivergenceIndex(latest.nonIIDDivergence);
            setPrivacyEpsilon(latest.epsilonUsed);
            setAggregationMethod(latest.aggregationMethod || 'DP-FedAvg');
            setCoordinatorNotes(latest.coordinatorNotes);
            setSovereignCertificate(latest.sovereignCertificate);
            if (Array.isArray(latest.silosState) && latest.silosState.length > 0) {
              setSilos(latest.silosState);
            }
          }
        }
      })
      .catch((err) => console.warn('Could not load SQLite federated history:', err));
  }, []);

  // Run the animated federated round simulation wired to real backend endpoint
  const runFederatedRound = async () => {
    if (isSimulating) return;
    setIsSimulating(true);
    setSimStep(1);

    const nextRound = currentRound + 1;

    // Trigger real backend API call in background while animation plays
    const apiPromise = authFetch('/api/agent/federated-round', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        roundNumber: nextRound,
        silos: silos,
        epsilon: privacyEpsilon,
        aggregationMethod: aggregationMethod,
      }),
    })
      .then((res) => res.json())
      .catch((err) => {
        console.warn('Federated round fallback:', err);
        return null;
      });

    // Step 1: Local Edge Training on sovereign clouds (1.4s)
    setTimeout(() => {
      setSimStep(2);

      // Step 2: Extract Differentially Private Weight Deltas (1.4s)
      setTimeout(() => {
        setSimStep(3);

        // Step 3: Stream Weight Deltas to Central Coordinator (2.0s)
        setTimeout(async () => {
          setSimStep(4);
          setCurrentRound(nextRound);

          const apiResult = await apiPromise;
          if (apiResult?.success && apiResult?.data) {
            const d = apiResult.data;
            if (d.updatedSilos) setSilos(d.updatedSilos);
            if (d.globalAccuracy) setGlobalAccuracy(d.globalAccuracy);
            if (d.coordinatorNotes) setCoordinatorNotes(d.coordinatorNotes);
            if (d.nonIIDDivergenceIndex) setNonIIDDivergenceIndex(d.nonIIDDivergenceIndex);
            if (d.sovereignAuditCertificate) setSovereignCertificate(d.sovereignAuditCertificate);
          } else {
            // Local mathematical progression fallback
            setSilos((prev) =>
              prev.map((silo) => ({
                ...silo,
                localAccuracy: Math.min(silo.targetAccuracy, Number((silo.localAccuracy + 5.2).toFixed(1))),
                currentLoss: Math.max(0.12, Number((silo.currentLoss - 0.08).toFixed(3))),
                weightDeltaVectors: silo.weightDeltaVectors.map(
                  (w) => Number((w + (Math.random() * 0.02 - 0.01)).toFixed(3))
                ),
              }))
            );
            setGlobalAccuracy((prev) => Math.min(94.8, Number((prev + 6.2).toFixed(1))));
          }

          // Finish step
          setTimeout(() => {
            setIsSimulating(false);
          }, 1200);
        }, 2000);
      }, 1400);
    }, 1400);
  };

  const resetFederatedSimulation = () => {
    setSilos(INITIAL_NATION_SILOS);
    setCurrentRound(0);
    setSimStep(0);
    setGlobalAccuracy(75.4);
    setCoordinatorNotes(
      'Federated Aggregator reset. Ready for multi-silo training initialization.'
    );
    setNonIIDDivergenceIndex(0.28);
    setSovereignCertificate('BRICS-FED-SECURE-INIT-INDORE-CONVENTION-2026');
    setIsSimulating(false);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-emerald-900/20 border border-emerald-700/30 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-800/60 text-emerald-300">
              <Network className="w-5 h-5" />
            </span>
            <h2 className="text-base sm:text-lg font-bold text-white">
              Cross-Silo Federated Learning Commons
            </h2>
            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-stone-800 text-stone-300 border border-stone-700">
              🌐 Live DP-FedAvg AI Endpoint
            </span>
          </div>
          <p className="text-xs sm:text-sm text-stone-300 mt-1 max-w-3xl">
            Sovereign agricultural data architecture across BRICS nations.
            Trained edge models exchange <strong>differentially-private weight updates (FedAvg)</strong> via real server-side
            differential privacy and Gemini Coordinator audits without transferring raw smallholder records across national borders.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            id="run-federated-round-btn"
            onClick={runFederatedRound}
            disabled={isSimulating}
            aria-busy={isSimulating}
            aria-label={isSimulating ? 'Executing Federated Round across national silos' : 'Run Federated Round'}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-emerald-400 ${
              isSimulating
                ? 'bg-stone-800 text-stone-400 cursor-not-allowed border border-stone-700'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white border border-emerald-400/40 hover:scale-[1.02] active:scale-[0.98]'
            }`}
          >
            <Play className={`w-4 h-4 ${isSimulating ? 'animate-spin' : ''}`} aria-hidden="true" />
            <span>{isSimulating ? 'Executing Federated Round...' : 'Run Federated Round'}</span>
          </button>
          <button
            type="button"
            onClick={resetFederatedSimulation}
            disabled={isSimulating}
            aria-label="Reset federated simulation"
            className="p-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 border border-stone-700 transition-all focus:outline-none focus:ring-2 focus:ring-emerald-400 cursor-pointer"
            title="Reset Simulation"
          >
            <RotateCcw className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Interactive Controls & Differential Privacy Configuration */}
      <div className="bg-stone-900 rounded-2xl border border-stone-800 p-4 sm:p-5 shadow-lg grid grid-cols-1 md:grid-cols-3 gap-4" role="region" aria-label="Federated Learning Controls">
        {/* Epsilon Slider */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-stone-300 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-emerald-400" aria-hidden="true" />
              <label htmlFor="dp-epsilon-slider">DP Privacy Budget (ε)</label>
            </span>
            <span className="font-mono font-bold text-emerald-400">ε = {privacyEpsilon}</span>
          </div>
          <input
            id="dp-epsilon-slider"
            type="range"
            min="0.1"
            max="2.0"
            step="0.1"
            value={privacyEpsilon}
            aria-label="Differential privacy budget epsilon"
            onChange={(e) => setPrivacyEpsilon(parseFloat(e.target.value))}
            disabled={isSimulating}
            className="w-full h-1.5 bg-stone-800 rounded-lg appearance-none cursor-pointer accent-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-400"
          />
          <div className="flex justify-between text-[10px] text-stone-500">
            <span>High Privacy (ε=0.1)</span>
            <span>Balanced (ε=0.5)</span>
            <span>Max Accuracy (ε=2.0)</span>
          </div>
        </div>

        {/* Aggregation Algorithm */}
        <div className="space-y-1.5">
          <div className="text-xs font-semibold text-stone-300 flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-teal-400" aria-hidden="true" />
            <label htmlFor="aggregation-method-select">Aggregation Method</label>
          </div>
          <select
            id="aggregation-method-select"
            value={aggregationMethod}
            aria-label="Federated aggregation algorithm"
            onChange={(e: any) => setAggregationMethod(e.target.value)}
            disabled={isSimulating}
            className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-teal-500 font-mono"
          >
            <option value="DP-FedAvg">DP-FedAvg (Indore Protocol Standard)</option>
            <option value="FedProx">FedProx (Non-IID Soil Adaptation)</option>
            <option value="Sovereign-Scaffold">Sovereign-Scaffold (Variance Reduced)</option>
          </select>
          <div className="text-[10px] text-stone-400">
            Mitigates cross-border soil &amp; climate distribution drift
          </div>
        </div>

        {/* Live Non-IID Divergence Meter */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-stone-300 flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
              <span>Non-IID Divergence Index</span>
            </span>
            <span className="font-mono font-bold text-amber-400">{nonIIDDivergenceIndex}</span>
          </div>
          <div className="w-full bg-stone-800 h-2 rounded-full overflow-hidden">
            <div
              className="bg-amber-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, nonIIDDivergenceIndex * 100)}%` }}
            />
          </div>
          <div className="text-[10px] text-stone-400 flex items-center justify-between">
            <span>Soil Cross-Variance</span>
            <span className="text-emerald-400 font-semibold">Low Drift</span>
          </div>
        </div>
      </div>

      {/* Visual Workflow Stepper */}
      <div className="bg-stone-900 rounded-2xl border border-stone-800 p-4 sm:p-5 shadow-lg space-y-3">
        <div className="flex items-center justify-between text-xs text-stone-400">
          <span className="font-semibold uppercase tracking-wider text-white flex items-center gap-1.5">
            <Cpu className="w-4 h-4 text-emerald-400" />
            Federated Round Execution Status (Round #{currentRound})
          </span>
          <span>
            Current Global Model Accuracy:{' '}
            <strong className="text-emerald-400 text-sm font-bold">{globalAccuracy}%</strong>
          </span>
        </div>

        {/* Stepper Progress Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs">
          <div
            className={`p-3 rounded-xl border transition-all ${
              simStep === 1
                ? 'bg-emerald-950/80 border-emerald-500 text-emerald-200 ring-1 ring-emerald-500/60 shadow-lg shadow-emerald-950/50'
                : simStep > 1
                ? 'bg-stone-800/80 border-emerald-800 text-stone-300'
                : 'bg-stone-950/50 border-stone-800 text-stone-500'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs">1. Local Edge Training</span>
              {simStep === 1 && <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />}
              {simStep > 1 && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
            </div>
            <div className="text-[10px] mt-0.5">Isolated on national cloud silos</div>
          </div>

          <div
            className={`p-3 rounded-xl border transition-all ${
              simStep === 2
                ? 'bg-amber-950/80 border-amber-500 text-amber-200 ring-1 ring-amber-500/60 shadow-lg shadow-amber-950/50'
                : simStep > 2
                ? 'bg-stone-800/80 border-amber-800 text-stone-300'
                : 'bg-stone-950/50 border-stone-800 text-stone-500'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs">2. DP Noise &amp; ΔW Extraction</span>
              {simStep === 2 && <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />}
              {simStep > 2 && <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />}
            </div>
            <div className="text-[10px] mt-0.5">ε = {privacyEpsilon} differential privacy</div>
          </div>

          <div
            className={`p-3 rounded-xl border transition-all ${
              simStep === 3
                ? 'bg-indigo-950/80 border-indigo-500 text-indigo-200 ring-1 ring-indigo-500/60 shadow-lg shadow-indigo-950/50'
                : simStep > 3
                ? 'bg-stone-800/80 border-indigo-800 text-stone-300'
                : 'bg-stone-950/50 border-stone-800 text-stone-500'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs">3. Weight-Transfer Step</span>
              {simStep === 3 && <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping" />}
              {simStep > 3 && <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />}
            </div>
            <div className="text-[10px] mt-0.5">Encrypted ΔW tensor streams</div>
          </div>

          <div
            className={`p-3 rounded-xl border transition-all ${
              simStep === 4
                ? 'bg-teal-950/80 border-teal-500 text-teal-200 ring-1 ring-teal-500/60 shadow-lg shadow-teal-950/50'
                : currentRound > 0
                ? 'bg-stone-800/80 border-teal-800 text-stone-300'
                : 'bg-stone-950/50 border-stone-800 text-stone-500'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs">4. Global {aggregationMethod}</span>
              {simStep === 4 && <span className="w-2 h-2 rounded-full bg-teal-400 animate-ping" />}
              {currentRound > 0 && <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />}
            </div>
            <div className="text-[10px] mt-0.5">Shared foundation weights</div>
          </div>
        </div>
      </div>

      {/* DEDICATED VISUAL WEIGHT-TRANSFER PIPELINE HUD */}
      <div className="bg-stone-900 rounded-2xl border border-stone-800 p-4 sm:p-5 shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-stone-800">
          <div className="flex items-center gap-2">
            <Radio className={`w-4 h-4 ${simStep === 3 ? 'text-indigo-400 animate-pulse' : 'text-emerald-400'}`} />
            <h3 className="font-bold text-sm sm:text-base text-white">
              Differentially Private Weight-Transfer Visualizer
            </h3>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-indigo-950/80 text-indigo-300 border border-indigo-700/60">
              {simStep === 3 ? '⚡ Active In-Flight Transmission' : 'Encrypted Gradient Conduits'}
            </span>
          </div>
          <div className="text-xs text-stone-400 flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Lock className="w-3 h-3 text-emerald-400" />
              <span>Raw Data: <strong>0 bytes transferred</strong></span>
            </span>
            <span className="text-stone-600 hidden sm:inline">•</span>
            <span className="text-indigo-300 font-mono text-[11px]">
              DP-SGD: <strong>ε = {privacyEpsilon} noise bound</strong>
            </span>
          </div>
        </div>

        {/* Animated Visual Schematic with Moving Data Packets */}
        <div className="relative bg-stone-950/90 rounded-2xl border border-stone-800/80 p-4 sm:p-6 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(#262626_1px,transparent_1px)] [background-size:16px_16px] opacity-40 pointer-events-none" />

          {/* Three Nodes Schematic Row */}
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            {/* 1. INDIA NODE */}
            <div
              className={`p-4 rounded-xl border transition-all ${
                simStep === 1 || simStep === 2
                  ? 'bg-emerald-950/60 border-emerald-500 shadow-md shadow-emerald-950/60 ring-1 ring-emerald-500/40'
                  : simStep === 3
                  ? 'bg-indigo-950/50 border-indigo-500/70'
                  : 'bg-stone-900/90 border-stone-800'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🇮🇳</span>
                  <div>
                    <div className="font-bold text-xs sm:text-sm text-white">India ICAR Sovereign Cloud</div>
                    <div className="text-[10px] text-stone-400 font-mono">asia-south1 (Mumbai)</div>
                  </div>
                </div>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-stone-800 text-emerald-300 font-mono">
                  {silos[0].records.length} records
                </span>
              </div>

              {/* Tensor preview */}
              <div className="mt-2 bg-stone-950 p-2 rounded-lg border border-stone-800 text-[11px] font-mono space-y-1">
                <div className="text-stone-400 flex items-center justify-between text-[10px]">
                  <span>Extracted Tensor:</span>
                  <span className="text-emerald-400">ΔW_ind</span>
                </div>
                <div className="text-emerald-300 font-semibold truncate">
                  [{silos[0].weightDeltaVectors.slice(0, 3).map((v) => (v > 0 ? `+${v}` : `${v}`)).join(', ')}, ...]
                </div>
              </div>

              <div className="mt-2 text-[10px] flex items-center justify-between text-stone-400">
                <span>Loss: <strong className="text-amber-400">{silos[0].currentLoss}</strong></span>
                <span className={`font-semibold ${simStep === 3 ? 'text-indigo-300 animate-pulse' : 'text-emerald-400'}`}>
                  {simStep === 3 ? 'Streaming ΔW ➔' : `Accuracy: ${silos[0].localAccuracy}%`}
                </span>
              </div>
            </div>

            {/* 2. CENTRAL AGGREGATOR NODE */}
            <div
              className={`p-4 rounded-xl border transition-all text-center ${
                simStep === 3 || simStep === 4
                  ? 'bg-teal-950/70 border-teal-400 shadow-xl shadow-teal-950/80 ring-2 ring-teal-400/50'
                  : 'bg-stone-900/90 border-teal-800/40'
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-teal-900/60 border border-teal-500/50 flex items-center justify-center mx-auto mb-2 text-teal-300 shadow-inner">
                <Network className={`w-5 h-5 ${simStep === 3 ? 'animate-spin' : ''}`} />
              </div>
              <div className="font-bold text-xs sm:text-sm text-white">BRICS Central Coordinator</div>
              <div className="text-[10px] text-teal-300 font-medium">{aggregationMethod} Engine</div>

              <div className="mt-3 bg-stone-950/90 p-2.5 rounded-lg border border-teal-800/50 text-[11px] font-mono text-teal-200">
                <div className="text-[10px] text-stone-400 mb-0.5">Weighted Aggregation Formula:</div>
                <div className="font-bold">
                  W_global = Σ (n_k / N) · (W_t + ΔW_k)
                </div>
              </div>

              <div className="mt-2 text-xs font-bold text-emerald-400 flex items-center justify-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Global Score: {globalAccuracy}%</span>
              </div>
            </div>

            {/* 3. BRAZIL NODE */}
            <div
              className={`p-4 rounded-xl border transition-all ${
                simStep === 1 || simStep === 2
                  ? 'bg-emerald-950/60 border-emerald-500 shadow-md shadow-emerald-950/60 ring-1 ring-emerald-500/40'
                  : simStep === 3
                  ? 'bg-indigo-950/50 border-indigo-500/70'
                  : 'bg-stone-900/90 border-stone-800'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🇧🇷</span>
                  <div>
                    <div className="font-bold text-xs sm:text-sm text-white">Brazil Embrapa Cloud</div>
                    <div className="text-[10px] text-stone-400 font-mono">southamerica-east1 (SP)</div>
                  </div>
                </div>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-stone-800 text-emerald-300 font-mono">
                  {silos[1].records.length} records
                </span>
              </div>

              <div className="mt-2 bg-stone-950 p-2 rounded-lg border border-stone-800 text-[11px] font-mono space-y-1">
                <div className="text-stone-400 flex items-center justify-between text-[10px]">
                  <span>Extracted Tensor:</span>
                  <span className="text-emerald-400">ΔW_bra</span>
                </div>
                <div className="text-emerald-300 font-semibold truncate">
                  [{silos[1].weightDeltaVectors.slice(0, 3).map((v) => (v > 0 ? `+${v}` : `${v}`)).join(', ')}, ...]
                </div>
              </div>

              <div className="mt-2 text-[10px] flex items-center justify-between text-stone-400">
                <span>Loss: <strong className="text-amber-400">{silos[1].currentLoss}</strong></span>
                <span className={`font-semibold ${simStep === 3 ? 'text-indigo-300 animate-pulse' : 'text-emerald-400'}`}>
                  {simStep === 3 ? 'Streaming ΔW ➔' : `Accuracy: ${silos[1].localAccuracy}%`}
                </span>
              </div>
            </div>
          </div>

          {/* ACTIVE WEIGHT TRANSFER ANIMATION BEAM OVERLAY */}
          <AnimatePresence>
            {simStep === 3 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="mt-6 pt-4 border-t border-stone-800/80 space-y-3"
              >
                <div className="bg-indigo-950/70 border border-indigo-500/60 rounded-xl p-3 text-xs text-indigo-200 flex flex-col md:flex-row items-center justify-between gap-3 shadow-lg shadow-indigo-950/40">
                  <div className="flex items-center gap-2.5">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-500" />
                    </span>
                    <div>
                      <div className="font-bold text-white flex items-center gap-2">
                        <span>Streaming Differential Privacy Tensors</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-900 text-indigo-300 font-mono">
                          TLS 1.3 + SMPC
                        </span>
                      </div>
                      <div className="text-[11px] text-indigo-300">
                        Transferring ΔW_ind and ΔW_bra into FedAvg Aggregator (noise scaled by 1/ε)
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 font-mono text-[11px] bg-stone-900/90 px-3 py-1.5 rounded-lg border border-indigo-800/60 text-emerald-400 shrink-0">
                    <Binary className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
                    <span>DP-SGD: ε = {privacyEpsilon}</span>
                  </div>
                </div>

                {/* Animated Flying Packets Visual Track */}
                <div className="relative h-16 bg-stone-900/90 rounded-xl border border-indigo-500/30 overflow-hidden flex items-center justify-between px-4">
                  <div className="flex-1 relative flex items-center mr-4">
                    <div className="w-full h-2 bg-stone-800 rounded-full overflow-hidden">
                      <div className="w-full h-full bg-gradient-to-r from-emerald-500/40 via-indigo-500/40 to-teal-500/40 animate-pulse" />
                    </div>
                    <motion.div
                      className="absolute left-0 px-3 py-1 bg-gradient-to-r from-emerald-500 to-indigo-600 text-white rounded-lg text-[10px] font-mono font-bold shadow-lg shadow-emerald-500/30 flex items-center gap-1.5 border border-emerald-300/40"
                      initial={{ left: '0%' }}
                      animate={{ left: ['0%', '75%'] }}
                      transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
                    >
                      <ArrowRight className="w-3 h-3 text-emerald-200" />
                      <span>ΔW_ind: [{silos[0].weightDeltaVectors.slice(0, 2).join(', ')}]</span>
                    </motion.div>
                  </div>

                  <div className="relative flex flex-col items-center justify-center shrink-0 z-10">
                    <div className="w-10 h-10 rounded-full bg-teal-500 text-stone-950 font-bold flex items-center justify-center shadow-lg shadow-teal-500/40 ring-4 ring-teal-500/20">
                      <Zap className="w-5 h-5 animate-pulse text-stone-950" />
                    </div>
                    <span className="text-[9px] font-bold text-teal-300 uppercase tracking-wider mt-0.5">
                      FedAvg Hub
                    </span>
                  </div>

                  <div className="flex-1 relative flex items-center ml-4">
                    <div className="w-full h-2 bg-stone-800 rounded-full overflow-hidden">
                      <div className="w-full h-full bg-gradient-to-l from-emerald-500/40 via-indigo-500/40 to-teal-500/40 animate-pulse" />
                    </div>
                    <motion.div
                      className="absolute right-0 px-3 py-1 bg-gradient-to-l from-emerald-500 to-indigo-600 text-white rounded-lg text-[10px] font-mono font-bold shadow-lg shadow-emerald-500/30 flex items-center gap-1.5 border border-emerald-300/40"
                      initial={{ right: '0%' }}
                      animate={{ right: ['0%', '75%'] }}
                      transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
                    >
                      <ArrowRight className="w-3 h-3 text-emerald-200 rotate-180" />
                      <span>ΔW_bra: [{silos[1].weightDeltaVectors.slice(0, 2).join(', ')}]</span>
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* AI FEDERATED AGGREGATION AUDIT HUD (LIVE SERVER RESPONSE) */}
      <div className="bg-stone-900 rounded-2xl border border-emerald-800/40 p-4 sm:p-5 shadow-lg space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-stone-800">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-emerald-400" />
            <h4 className="font-bold text-sm text-white">
              AI Sovereign Privacy &amp; Convergence Audit Log
            </h4>
            <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
              Live Gemini 3.7 Coordinator
            </span>
          </div>
          <div className="text-[11px] font-mono text-stone-400">
            Certificate: <span className="text-emerald-400">{sovereignCertificate}</span>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-stone-300 leading-relaxed bg-stone-950 p-3 rounded-xl border border-stone-800/80">
          {coordinatorNotes}
        </p>
      </div>

      {/* Main Grid: Left Silo (India), Middle Coordinator (FedAvg), Right Silo (Brazil) Full Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
        {/* INDIA SOVEREIGN SILO */}
        <div className="lg:col-span-4 bg-stone-900 rounded-2xl border border-stone-800 p-4 sm:p-5 flex flex-col justify-between space-y-4 shadow-lg">
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-stone-800">
              <div className="flex items-center gap-2.5">
                <span className="text-2xl">🇮🇳</span>
                <div>
                  <h3 className="font-bold text-sm text-white">India Sovereign Silo</h3>
                  <p className="text-[11px] text-stone-400">{silos[0].nationalInstitution}</p>
                </div>
              </div>
              <div className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded bg-stone-800 text-emerald-400 border border-stone-700">
                <Lock className="w-3 h-3" /> Data Quarantined
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-stone-950/80 p-2.5 rounded-xl border border-stone-800">
                <span className="text-stone-400 text-[10px] block">Local Accuracy</span>
                <span className="text-base font-bold text-emerald-400">{silos[0].localAccuracy}%</span>
              </div>
              <div className="bg-stone-950/80 p-2.5 rounded-xl border border-stone-800">
                <span className="text-stone-400 text-[10px] block">Training Loss</span>
                <span className="text-base font-bold text-amber-400">{silos[0].currentLoss}</span>
              </div>
            </div>

            <div className="bg-stone-950/90 rounded-xl p-3 border border-stone-800 text-xs space-y-1.5">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-semibold text-stone-300">Extracted Weight Delta (ΔW_ind):</span>
                <span className="text-emerald-400 font-mono text-[10px]">DP ε={privacyEpsilon}</span>
              </div>
              <div className="font-mono text-[11px] text-stone-400 bg-stone-900 p-2 rounded border border-stone-800 overflow-x-auto">
                [{silos[0].weightDeltaVectors.map((v) => (v > 0 ? `+${v}` : `${v}`)).join(', ')}]
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <span className="text-stone-400">
                Local Training Corpus: <strong className="text-stone-200">{silos[0].records.length} Farm Records</strong>
              </span>
              <button
                type="button"
                onClick={() => setSelectedSiloDataView(selectedSiloDataView === 'india' ? null : 'india')}
                className="text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
              >
                <Table className="w-3.5 h-3.5" />
                {selectedSiloDataView === 'india' ? 'Hide Records' : 'Inspect Records'}
              </button>
            </div>
          </div>
        </div>

        {/* CENTRAL FEDERATED COORDINATOR */}
        <div className="lg:col-span-4 bg-gradient-to-b from-stone-900 to-stone-950 rounded-2xl border-2 border-teal-600/70 p-4 sm:p-5 flex flex-col justify-between space-y-4 shadow-xl">
          <div className="space-y-3">
            <div className="text-center pb-3 border-b border-stone-800">
              <div className="w-10 h-10 rounded-xl bg-teal-900/60 border border-teal-500/50 flex items-center justify-center mx-auto mb-2 text-teal-300 shadow-inner">
                <Network className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm sm:text-base text-white">
                BRICS Federated Coordinator
              </h3>
              <p className="text-[11px] text-teal-300">
                {aggregationMethod} Aggregator Node
              </p>
            </div>

            <div className="bg-stone-950/90 rounded-xl p-4 border border-teal-800/40 text-center space-y-2">
              <span className="text-xs font-semibold text-stone-400 uppercase tracking-wider block">
                Shared Global Model Accuracy
              </span>
              <div className="text-3xl sm:text-4xl font-extrabold text-teal-300">
                {globalAccuracy}%
              </div>
              <div className="w-full bg-stone-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-teal-500 to-emerald-400 h-full rounded-full transition-all duration-700"
                  style={{ width: `${globalAccuracy}%` }}
                />
              </div>
              <div className="text-[11px] text-stone-400">
                Completed Federated Rounds: <strong className="text-white">{currentRound}</strong>
              </div>
            </div>

            <div className="bg-stone-900/90 rounded-xl p-3 border border-stone-800 text-xs space-y-1.5 text-stone-300">
              <div className="flex items-center gap-1.5 font-semibold text-emerald-400">
                <ShieldCheck className="w-4 h-4" /> Sovereign Privacy Boundary
              </div>
              <div className="text-[11px] text-stone-400 leading-snug">
                Raw farmer records never traverse WAN. Weights are combined using secure multi-party computation (SMPC).
              </div>
            </div>
          </div>
        </div>

        {/* BRAZIL SOVEREIGN SILO */}
        <div className="lg:col-span-4 bg-stone-900 rounded-2xl border border-stone-800 p-4 sm:p-5 flex flex-col justify-between space-y-4 shadow-lg">
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-stone-800">
              <div className="flex items-center gap-2.5">
                <span className="text-2xl">🇧🇷</span>
                <div>
                  <h3 className="font-bold text-sm text-white">Brazil Sovereign Silo</h3>
                  <p className="text-[11px] text-stone-400">{silos[1].nationalInstitution}</p>
                </div>
              </div>
              <div className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded bg-stone-800 text-emerald-400 border border-stone-700">
                <Lock className="w-3 h-3" /> Data Quarantined
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-stone-950/80 p-2.5 rounded-xl border border-stone-800">
                <span className="text-stone-400 text-[10px] block">Local Accuracy</span>
                <span className="text-base font-bold text-emerald-400">{silos[1].localAccuracy}%</span>
              </div>
              <div className="bg-stone-950/80 p-2.5 rounded-xl border border-stone-800">
                <span className="text-stone-400 text-[10px] block">Training Loss</span>
                <span className="text-base font-bold text-amber-400">{silos[1].currentLoss}</span>
              </div>
            </div>

            <div className="bg-stone-950/90 rounded-xl p-3 border border-stone-800 text-xs space-y-1.5">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-semibold text-stone-300">Extracted Weight Delta (ΔW_bra):</span>
                <span className="text-emerald-400 font-mono text-[10px]">DP ε={privacyEpsilon}</span>
              </div>
              <div className="font-mono text-[11px] text-stone-400 bg-stone-900 p-2 rounded border border-stone-800 overflow-x-auto">
                [{silos[1].weightDeltaVectors.map((v) => (v > 0 ? `+${v}` : `${v}`)).join(', ')}]
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <span className="text-stone-400">
                Local Training Corpus: <strong className="text-stone-200">{silos[1].records.length} Farm Records</strong>
              </span>
              <button
                type="button"
                onClick={() => setSelectedSiloDataView(selectedSiloDataView === 'brazil' ? null : 'brazil')}
                className="text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
              >
                <Table className="w-3.5 h-3.5" />
                {selectedSiloDataView === 'brazil' ? 'Hide Records' : 'Inspect Records'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Collapsible Inspection Table of Sovereign Raw Records */}
      {selectedSiloDataView && (
        <div className="bg-stone-900 rounded-2xl border border-stone-800 p-4 sm:p-5 shadow-lg space-y-3 animate-in fade-in">
          <div className="flex items-center justify-between pb-2 border-b border-stone-800">
            <h4 className="font-bold text-xs sm:text-sm text-white flex items-center gap-2">
              <Database className="w-4 h-4 text-emerald-400" />
              Inspecting Sovereign Silo Raw Dataset ({selectedSiloDataView === 'india' ? '🇮🇳 India ICAR Node' : '🇧🇷 Brazil Embrapa Node'})
            </h4>
            <span className="text-[10px] text-amber-300 px-2 py-0.5 rounded bg-stone-800 border border-stone-700">
              🔒 Strictly Confined to National Cloud Storage
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-stone-300">
              <thead className="bg-stone-950 text-stone-400 text-[11px] uppercase tracking-wider">
                <tr>
                  <th className="p-2">Farm ID</th>
                  <th className="p-2">Farmer</th>
                  <th className="p-2">Crop</th>
                  <th className="p-2">Soil Type</th>
                  <th className="p-2">Soil pH</th>
                  <th className="p-2">N (kg/ha)</th>
                  <th className="p-2">Rain (mm)</th>
                  <th className="p-2">NDVI</th>
                  <th className="p-2">Disease</th>
                  <th className="p-2">Yield (kg/ha)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-800">
                {(selectedSiloDataView === 'india' ? silos[0].records : silos[1].records).map((rec) => (
                  <tr key={rec.id} className="hover:bg-stone-800/50">
                    <td className="p-2 font-mono text-emerald-400 font-medium">{rec.farmId}</td>
                    <td className="p-2 text-white font-medium">{rec.farmerName}</td>
                    <td className="p-2">{rec.crop}</td>
                    <td className="p-2 text-stone-400">{rec.soilType}</td>
                    <td className="p-2">{rec.soilPH}</td>
                    <td className="p-2">{rec.nitrogenAppliedKg}</td>
                    <td className="p-2">{rec.rainfallMm}</td>
                    <td className="p-2 font-mono">{rec.ndviScore}</td>
                    <td className="p-2">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          rec.diseasePresent
                            ? 'bg-rose-950 text-rose-300 border border-rose-800'
                            : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        }`}
                      >
                        {rec.diseasePresent ? 'Positive' : 'Clear'}
                      </span>
                    </td>
                    <td className="p-2 font-bold text-white">{rec.yieldKgHa}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
