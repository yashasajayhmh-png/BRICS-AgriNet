import React, { useState, useEffect } from 'react';
import {
  UserCheck,
  ShieldAlert,
  CheckCircle2,
  AlertCircle,
  FileText,
  DollarSign,
  TrendingUp,
  Award,
  Sparkles,
  Search,
  ExternalLink,
  ChevronRight,
  Send,
  Lock,
  Layers,
  Leaf,
  Info,
  Calendar,
  Building2,
  Clock,
  Phone,
  MapPin,
  Flame,
  Bot,
  RefreshCw,
  FileCheck,
  AlertTriangle,
} from 'lucide-react';
import { ESCALATED_TICKETS, BRICS_PLOTS, RAG_GROUNDING_SOURCES } from '../data/mockData';
import { EscalatedTicket, PlotTelemetry, CopilotAssistResponse, CreditAssessmentResponse } from '../types';
import { authFetch } from '../services/api';
import { getTicketsFromFirestore, getPlotsFromFirestore, updateTicketInFirestore } from '../services/firestoreService';

export function ExtensionCopilotTab() {
  const [tickets, setTickets] = useState<EscalatedTicket[]>(ESCALATED_TICKETS);
  const [selectedTicket, setSelectedTicket] = useState<EscalatedTicket>(tickets[0]);
  const [agronomistNoteInput, setAgronomistNoteInput] = useState<string>('');
  const [prescriptionInput, setPrescriptionInput] = useState<string>('');
  const [activeSubTab, setActiveSubTab] = useState<'triage' | 'credit_mrv' | 'knowledge'>('triage');
  const [plots, setPlots] = useState<PlotTelemetry[]>(BRICS_PLOTS);
  const [selectedPlotForCredit, setSelectedPlotForCredit] = useState<PlotTelemetry>(BRICS_PLOTS[0]);

  // Load persistent tickets and plots from Firestore / SQLite DB
  const loadDatabaseRecords = async () => {
    try {
      const [fsTickets, fsPlots] = await Promise.all([
        getTicketsFromFirestore(),
        getPlotsFromFirestore(),
      ]);
      if (fsTickets && fsTickets.length > 0) {
        setTickets(fsTickets);
        setSelectedTicket(fsTickets[0]);
      }
      if (fsPlots && fsPlots.length > 0) {
        setPlots(fsPlots);
        setSelectedPlotForCredit(fsPlots[0]);
      }
    } catch (err) {
      console.warn('Falling back to SQLite endpoint for copilot:', err);
      try {
        const [ticketsRes, plotsRes] = await Promise.all([
          authFetch('/api/db/tickets'),
          authFetch('/api/db/plots'),
        ]);
        const ticketsJson = await ticketsRes.json();
        if (ticketsJson.success && Array.isArray(ticketsJson.data) && ticketsJson.data.length > 0) {
          setTickets(ticketsJson.data);
          setSelectedTicket(ticketsJson.data[0]);
        }
        const plotsJson = await plotsRes.json();
        if (plotsJson.success && Array.isArray(plotsJson.data) && plotsJson.data.length > 0) {
          setPlots(plotsJson.data);
          setSelectedPlotForCredit(plotsJson.data[0]);
        }
      } catch (e) {
        console.warn('Failed to fetch fallback SQLite records:', e);
      }
    }
  };

  useEffect(() => {
    loadDatabaseRecords();
  }, []);

  // AI Copilot Assist State
  const [isCopilotDrafting, setIsCopilotDrafting] = useState<boolean>(false);
  const [copilotAssistData, setCopilotAssistData] = useState<CopilotAssistResponse | null>(null);

  // Credit Assessment State
  const [isAssessingCredit, setIsAssessingCredit] = useState<boolean>(false);
  const [creditAssessmentData, setCreditAssessmentData] = useState<CreditAssessmentResponse | null>(null);

  // Request AI Extension Copilot to draft verification & prescription
  const handleRequestCopilotAssist = async () => {
    setIsCopilotDrafting(true);
    try {
      const res = await authFetch('/api/agent/copilot-ai-assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticket: selectedTicket,
          fieldNotes: agronomistNoteInput,
        }),
      });
      const json = await res.json();
      if (json.success && json.data) {
        const assist: CopilotAssistResponse = json.data;
        setCopilotAssistData(assist);
        setAgronomistNoteInput(
          `${assist.differentialDiagnosis}\n\n[Checklist]:\n- ${assist.fieldVerificationChecklist.join('\n- ')}`
        );
        setPrescriptionInput(assist.recommendedPrescription);
      }
    } catch (err) {
      console.warn('Copilot assist fallback:', err);
    } finally {
      setIsCopilotDrafting(false);
    }
  };

  // Request AI SmartRisk & dMRV assessment for plot
  const handleRunCreditAssessment = async () => {
    setIsAssessingCredit(true);
    try {
      const res = await authFetch('/api/agent/copilot-credit-assessment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plotTelemetry: selectedPlotForCredit,
        }),
      });
      const json = await res.json();
      if (json.success && json.data) {
        setCreditAssessmentData(json.data);
      }
    } catch (err) {
      console.warn('Credit assessment fallback:', err);
    } finally {
      setIsAssessingCredit(false);
    }
  };

  const handleApproveTicket = async (ticketId: string) => {
    const finalNotes =
      agronomistNoteInput || selectedTicket.agronomistNotes || 'Verified by Senior Extension Agronomist.';
    const finalPrescription =
      prescriptionInput || selectedTicket.prescribedTreatment || 'Proceed with approved integrated pest management protocol.';

    setTickets((prev) =>
      prev.map((t) =>
        t.id === ticketId
          ? {
              ...t,
              status: 'VERIFIED_BY_AGENT',
              agronomistNotes: finalNotes,
              prescribedTreatment: finalPrescription,
            }
          : t
      )
    );
    setSelectedTicket((prev) => ({
      ...prev,
      status: 'VERIFIED_BY_AGENT',
      agronomistNotes: finalNotes,
      prescribedTreatment: finalPrescription,
    }));

    // Persist to Firestore and SQLite DB
    try {
      await updateTicketInFirestore(ticketId, {
        status: 'VERIFIED_BY_AGENT',
        agronomistNotes: finalNotes,
        prescribedTreatment: finalPrescription,
      });
    } catch (e) {
      console.warn('Firestore ticket update fallback:', e);
    }

    try {
      await authFetch(`/api/db/tickets/${ticketId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'VERIFIED_BY_AGENT',
          agronomistNotes: finalNotes,
          prescribedTreatment: finalPrescription,
        }),
      });
    } catch (err) {
      console.error('Failed to update ticket in SQLite:', err);
    }
  };

  const pendingCount = tickets.filter((t) => t.status === 'PENDING_REVIEW').length;

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-emerald-900/20 border border-emerald-700/30 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-800/60 text-emerald-300">
              <UserCheck className="w-5 h-5" />
            </span>
            <h2 className="text-base sm:text-lg font-bold text-white">
              Extension-Agent Copilot Console
            </h2>
            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-700">
              Human-in-the-Loop Triage
            </span>
          </div>
          <p className="text-xs sm:text-sm text-stone-300 mt-1 max-w-3xl">
            Empowering field extension officers (KVK India, EMATER Brazil, ARC South Africa) to supervise AI reasoning,
            triage low-confidence cases (&lt; 70%), verify RAG grounding citations, and authorize agri-credit readiness via real Gemini Copilot endpoints.
          </p>
        </div>

        {/* Sub-tab navigation */}
        <div className="flex items-center gap-1.5 bg-stone-900 p-1.5 rounded-xl border border-stone-800 self-start md:self-auto" role="tablist" aria-label="Extension Copilot Subtabs">
          <button
            type="button"
            role="tab"
            aria-selected={activeSubTab === 'triage'}
            aria-label="Escalation Triage Subtab"
            onClick={() => setActiveSubTab('triage')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all focus:outline-none focus:ring-2 focus:ring-emerald-400 ${
              activeSubTab === 'triage'
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Escalation Triage</span>
            {pendingCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-stone-950 text-[10px] font-bold">
                {pendingCount}
              </span>
            )}
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeSubTab === 'credit_mrv'}
            aria-label="Agri-Credit and dMRV Subtab"
            onClick={() => setActiveSubTab('credit_mrv')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all focus:outline-none focus:ring-2 focus:ring-emerald-400 ${
              activeSubTab === 'credit_mrv'
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Agri-Credit &amp; dMRV</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeSubTab === 'knowledge'}
            aria-label="RAG Knowledge Corpus Subtab"
            onClick={() => setActiveSubTab('knowledge')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all focus:outline-none focus:ring-2 focus:ring-emerald-400 ${
              activeSubTab === 'knowledge'
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" aria-hidden="true" />
            <span>RAG Knowledge Corpus</span>
          </button>
        </div>
      </div>

      {/* Mandatory Scope Caption */}
      <div className="bg-amber-950/40 border border-amber-800/60 rounded-xl p-3 flex items-start gap-2.5 text-xs text-amber-200">
        <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <strong className="text-amber-300">Human-in-the-Loop Design Principle:</strong> Every deployed advisory system
          (Digital Green FarmerChat, Plantix community) treats AI as an extension-worker force multiplier — not a replacement.
          Low-confidence diagnoses automatically route to human agronomists before farmers take high-risk chemical actions.
        </div>
      </div>

      {/* SUB-TAB 1: ESCALATION TRIAGE QUEUE */}
      {activeSubTab === 'triage' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Triage Tickets List (4 cols) */}
          <div className="lg:col-span-4 space-y-3">
            <div className="flex items-center justify-between text-xs text-stone-400 px-1">
              <span className="font-semibold uppercase tracking-wider text-white flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-emerald-400" />
                Escalated Farmer Cases ({tickets.length})
              </span>
              <span className="text-amber-400 font-medium">{pendingCount} pending review</span>
            </div>

            <div className="space-y-2">
              {tickets.map((t) => {
                const isSelected = selectedTicket.id === t.id;
                return (
                  <div
                    key={t.id}
                    onClick={() => {
                      setSelectedTicket(t);
                      setCopilotAssistData(null);
                      setAgronomistNoteInput(t.agronomistNotes || '');
                      setPrescriptionInput(t.prescribedTreatment || '');
                    }}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all space-y-2 ${
                      isSelected
                        ? 'bg-stone-900 border-emerald-500 shadow-md ring-1 ring-emerald-500/50'
                        : 'bg-stone-900/60 hover:bg-stone-900 border-stone-800 text-stone-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{t.flag}</span>
                        <div>
                          <div className="text-xs font-bold text-white">{t.farmerName}</div>
                          <div className="text-[10px] text-stone-400">{t.crop}</div>
                        </div>
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                          t.status === 'VERIFIED_BY_AGENT'
                            ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                            : 'bg-amber-950 text-amber-300 border-amber-800'
                        }`}
                      >
                        {t.status === 'VERIFIED_BY_AGENT' ? 'VERIFIED' : 'ACTION REQ'}
                      </span>
                    </div>

                    <div className="text-xs text-stone-300 font-medium truncate">
                      {t.aiSuggestedCondition}
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-stone-400 pt-1 border-t border-stone-800/80">
                      <span className="text-amber-400 font-semibold">AI Conf: {t.confidenceScore}%</span>
                      <span>{t.region}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Active Ticket Inspector & Action Station (8 cols) */}
          <div className="lg:col-span-8 bg-stone-900 rounded-2xl border border-stone-800 p-5 shadow-lg space-y-5">
            {/* Top Details */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-800">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xl">{selectedTicket.flag}</span>
                  <h3 className="font-bold text-base sm:text-lg text-white">
                    {selectedTicket.farmerName} • {selectedTicket.crop}
                  </h3>
                  <span className="text-xs text-stone-400 font-mono">({selectedTicket.id})</span>
                </div>
                <div className="text-xs text-stone-400 flex flex-wrap items-center gap-3 mt-1">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-emerald-400" />
                    {selectedTicket.region}, {selectedTicket.country}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Phone className="w-3 h-3 text-emerald-400" />
                    {selectedTicket.farmerPhone}
                  </span>
                  <span>•</span>
                  <span>Logged: {selectedTicket.timestamp}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto">
                <div className="text-right">
                  <div className="text-[10px] text-stone-400">AI Diagnosis Confidence</div>
                  <div className="text-base font-extrabold text-amber-400">
                    {selectedTicket.confidenceScore}%
                  </div>
                </div>
              </div>
            </div>

            {/* Photo & Diagnosis Card */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-start">
              <div className="sm:col-span-5 rounded-xl overflow-hidden border border-stone-800 bg-stone-950 aspect-video sm:aspect-square relative">
                <img
                  src={selectedTicket.photoUrl}
                  alt="Crop issue"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-2 left-2 bg-stone-950/80 text-[10px] text-stone-300 px-2 py-0.5 rounded border border-stone-700">
                  Uploaded Leaf Photo
                </div>
              </div>

              <div className="sm:col-span-7 space-y-3">
                <div className="bg-stone-950 p-3.5 rounded-xl border border-stone-800 space-y-1.5">
                  <div className="text-[11px] font-semibold text-emerald-400 flex items-center justify-between">
                    <span>AI Suggested Classification</span>
                    <span className="text-amber-400 text-[10px] font-mono">Escalation Triggered</span>
                  </div>
                  <div className="text-sm font-bold text-white">
                    {selectedTicket.aiSuggestedCondition}
                  </div>
                  <div className="text-xs text-stone-400 leading-relaxed">
                    <strong className="text-stone-300">Triage Justification:</strong> {selectedTicket.triageReason}
                  </div>
                </div>

                {/* Grounding RAG Citations */}
                <div className="space-y-1.5">
                  <div className="text-[11px] font-semibold text-stone-300 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Grounding Citations Retrieved from Agronomic Repositories</span>
                  </div>
                  {selectedTicket.ragCitations.map((cite, idx) => (
                    <div
                      key={idx}
                      className="bg-stone-950/80 p-2.5 rounded-lg border border-stone-800/80 text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between font-bold text-emerald-300 text-[11px]">
                        <span>{cite.name}</span>
                        <span className="text-stone-500 font-mono text-[10px]">{cite.year}</span>
                      </div>
                      <p className="text-[11px] text-stone-400 line-clamp-2">{cite.snippet}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* AI COPILOT DRAFT STATION (LIVE GEMINI COPILOT ENDPOINT) */}
            <div className="bg-stone-950/90 p-4 rounded-xl border border-emerald-800/50 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-stone-800">
                <div className="flex items-center gap-2">
                  <Bot className="w-4 h-4 text-emerald-400" />
                  <h4 className="text-xs sm:text-sm font-bold text-white">
                    AI Agronomist Copilot Assistant
                  </h4>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-700">
                    Gemini 3.7 Copilot
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleRequestCopilotAssist}
                  disabled={isCopilotDrafting}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-semibold shadow transition-all self-start sm:self-auto"
                >
                  <Sparkles className={`w-3.5 h-3.5 ${isCopilotDrafting ? 'animate-spin' : ''}`} />
                  <span>{isCopilotDrafting ? 'Consulting RAG Repositories...' : 'Draft Verification with AI Copilot'}</span>
                </button>
              </div>

              {copilotAssistData && (
                <div className="space-y-3 text-xs animate-in fade-in">
                  <div className="bg-stone-900/80 p-3 rounded-lg border border-stone-800 space-y-1">
                    <span className="text-stone-400 font-semibold block text-[11px]">Differential Diagnosis:</span>
                    <p className="text-stone-200">{copilotAssistData.differentialDiagnosis}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px]">
                    <div className="bg-amber-950/40 p-2.5 rounded-lg border border-amber-800/60 text-amber-200 space-y-1">
                      <span className="font-bold flex items-center gap-1 text-amber-300">
                        <AlertTriangle className="w-3.5 h-3.5" /> Safety Contraindications
                      </span>
                      <ul className="list-disc pl-4 space-y-0.5">
                        {copilotAssistData.safetyContraindications.map((contra, i) => (
                          <li key={i}>{contra}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-emerald-950/40 p-2.5 rounded-lg border border-emerald-800/60 text-emerald-200 space-y-1">
                      <span className="font-bold flex items-center gap-1 text-emerald-300">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Field Verification Steps
                      </span>
                      <ul className="list-disc pl-4 space-y-0.5">
                        {copilotAssistData.fieldVerificationChecklist.map((step, i) => (
                          <li key={i}>{step}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Agronomist Review & Sign-off Form */}
            <div className="bg-stone-950/80 p-4 rounded-xl border border-stone-800 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4 text-emerald-400" />
                  Senior Agronomist Verification &amp; Prescription
                </h4>
                {selectedTicket.status === 'VERIFIED_BY_AGENT' && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-700 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Signed &amp; Dispatched to Farmer
                  </span>
                )}
              </div>

              <div className="space-y-2">
                <div>
                  <label className="text-[11px] font-semibold text-stone-300 block mb-1">
                    Agronomist Triage Observations:
                  </label>
                  <textarea
                    rows={3}
                    value={agronomistNoteInput || selectedTicket.agronomistNotes || ''}
                    onChange={(e) => setAgronomistNoteInput(e.target.value)}
                    placeholder="Enter diagnostic verification notes or instructions for the field worker..."
                    className="w-full bg-stone-900 text-stone-100 text-xs rounded-lg p-2.5 border border-stone-700 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-sans"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-stone-300 block mb-1">
                    Prescribed Treatment / Action Protocol:
                  </label>
                  <input
                    type="text"
                    value={prescriptionInput || selectedTicket.prescribedTreatment || ''}
                    onChange={(e) => setPrescriptionInput(e.target.value)}
                    placeholder="e.g., Apply Propiconazole 25% EC @ 200ml/acre; hold irrigation for 48h."
                    className="w-full bg-stone-900 text-stone-100 text-xs rounded-lg p-2.5 border border-stone-700 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-sans"
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <div className="text-[11px] text-stone-400 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Audit logged to Ministry Extension Registry</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleApproveTicket(selectedTicket.id)}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md transition-all flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Approve &amp; Send to Farmer</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: AGRI-WORTHINESS CREDIT SCORING & DIGITAL MRV */}
      {activeSubTab === 'credit_mrv' && (
        <div className="space-y-6">
          {/* Plot Selector & Real-Time Calculation Trigger */}
          <div className="bg-stone-900 rounded-2xl border border-stone-800 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-emerald-400" />
              <span className="text-xs sm:text-sm font-bold text-white">
                Select Smallholder Plot for Credit &amp; Carbon Audit:
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex flex-wrap gap-2">
                {BRICS_PLOTS.slice(0, 3).map((plot) => (
                  <button
                    key={plot.id}
                    type="button"
                    onClick={() => {
                      setSelectedPlotForCredit(plot);
                      setCreditAssessmentData(null);
                    }}
                    className={`text-xs px-3 py-1.5 rounded-lg border transition-all flex items-center gap-1.5 ${
                      selectedPlotForCredit.id === plot.id
                        ? 'bg-emerald-950 border-emerald-500 text-emerald-200 font-bold'
                        : 'bg-stone-950 hover:bg-stone-800 text-stone-300 border-stone-800'
                    }`}
                  >
                    <span>{plot.flag}</span>
                    <span>{plot.region}</span>
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={handleRunCreditAssessment}
                disabled={isAssessingCredit}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-semibold shadow transition-all shrink-0"
              >
                <Sparkles className={`w-3.5 h-3.5 ${isAssessingCredit ? 'animate-spin' : ''}`} />
                <span>{isAssessingCredit ? 'Evaluating Credit Profile...' : 'Live Cropin SmartRisk Assessment'}</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Card 1: Agri-Worthiness Credit Scoring */}
            <div className="bg-stone-900 rounded-2xl border border-stone-800 p-5 shadow-lg space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-stone-800">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-emerald-950 text-emerald-400 border border-emerald-800/60">
                    <DollarSign className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm sm:text-base text-white">
                      Agri-Worthiness Credit Scoring
                    </h3>
                    <p className="text-[11px] text-stone-400">
                      Cropin SmartRisk-inspired AI Creditworthiness Engine
                    </p>
                  </div>
                </div>
                <span className="text-xs font-bold px-2.5 py-1 rounded bg-emerald-950 text-emerald-300 border border-emerald-700">
                  Grade {creditAssessmentData?.ratingGrade || selectedPlotForCredit.creditProfile?.ratingGrade || 'A+'}
                </span>
              </div>

              {/* Big Score Meter */}
              <div className="bg-stone-950 p-4 rounded-xl border border-stone-800 text-center space-y-2">
                <div className="text-xs text-stone-400 font-semibold uppercase tracking-wider">
                  Composite Farm Credit Readiness Score
                </div>
                <div className="text-4xl font-extrabold text-emerald-400 font-mono">
                  {creditAssessmentData?.creditScore || selectedPlotForCredit.creditProfile?.creditScore || 88} / 100
                </div>
                <div className="text-xs text-emerald-300 font-medium">
                  Status: Pre-Approved for Microfinance (Default Risk:{' '}
                  {creditAssessmentData?.defaultProbabilityPct || 2.1}%)
                </div>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 gap-2.5 text-xs">
                <div className="bg-stone-950/80 p-3 rounded-xl border border-stone-800">
                  <span className="text-stone-400 text-[10px] block">Advisory Adherence</span>
                  <span className="text-sm font-bold text-white">
                    {selectedPlotForCredit.creditProfile?.advisoryAdherenceRate || 92}% compliance
                  </span>
                </div>
                <div className="bg-stone-950/80 p-3 rounded-xl border border-stone-800">
                  <span className="text-stone-400 text-[10px] block">Satellite NDVI Stability</span>
                  <span className="text-sm font-bold text-teal-300">
                    {selectedPlotForCredit.creditProfile?.ndviStabilityIndex || 0.88} / 1.0
                  </span>
                </div>
                <div className="bg-stone-950/80 p-3 rounded-xl border border-stone-800">
                  <span className="text-stone-400 text-[10px] block">Max Pre-Approved Credit</span>
                  <span className="text-sm font-bold text-emerald-400">
                    ${creditAssessmentData?.maxMicroLoanUSD || selectedPlotForCredit.creditProfile?.maxMicroLoanUSD || 4800} USD
                  </span>
                </div>
                <div className="bg-stone-950/80 p-3 rounded-xl border border-stone-800">
                  <span className="text-stone-400 text-[10px] block">Yield Consistency</span>
                  <span className="text-sm font-bold text-amber-300">
                    {selectedPlotForCredit.creditProfile?.historicalYieldConsistency || 94}%
                  </span>
                </div>
              </div>

              {creditAssessmentData && (
                <div className="bg-stone-950/80 p-3 rounded-xl border border-emerald-800/60 text-xs text-stone-300 space-y-1">
                  <span className="text-[11px] font-semibold text-emerald-400 block">
                    AI Underwriting Justification:
                  </span>
                  <p className="text-[11px] text-stone-300 leading-relaxed">
                    {creditAssessmentData.justification}
                  </p>
                </div>
              )}
            </div>

            {/* Card 2: Digital MRV for Carbon */}
            <div className="bg-stone-900 rounded-2xl border border-stone-800 p-5 shadow-lg space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-stone-800">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-teal-950 text-teal-400 border border-teal-800/60">
                    <Leaf className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm sm:text-base text-white">
                      Digital MRV (Carbon &amp; Soil Impact)
                    </h3>
                    <p className="text-[11px] text-teal-300">
                      Automated Satellite &amp; In-situ Verification Protocol
                    </p>
                  </div>
                </div>
                <span className="text-xs font-bold px-2.5 py-1 rounded bg-teal-950 text-teal-300 border border-teal-700">
                  dMRV Active
                </span>
              </div>

              {/* Carbon Sequestration Card */}
              <div className="bg-stone-950 p-4 rounded-xl border border-stone-800 text-center space-y-2">
                <div className="text-xs text-stone-400 font-semibold uppercase tracking-wider">
                  Estimated Carbon Sequestered
                </div>
                <div className="text-4xl font-extrabold text-teal-400 font-mono">
                  +{selectedPlotForCredit.dmrvRecord?.carbonSequesteredTonsHa || 1.65} t CO₂e/ha
                </div>
                <div className="text-xs text-teal-300 font-medium">
                  Carbon Credit Revenue: ${creditAssessmentData?.carbonCreditsEarnedUSD || selectedPlotForCredit.dmrvRecord?.carbonCreditEligibleUSD || 72.00} / ha
                </div>
              </div>

              {/* Environmental Metrics */}
              <div className="grid grid-cols-2 gap-2.5 text-xs">
                <div className="bg-stone-950/80 p-3 rounded-xl border border-stone-800">
                  <span className="text-stone-400 text-[10px] block">N-Runoff Reduction</span>
                  <span className="text-sm font-bold text-emerald-400">
                    -{selectedPlotForCredit.dmrvRecord?.nitrogenRunoffReducedPercent || 24}% leaching
                  </span>
                </div>
                <div className="bg-stone-950/80 p-3 rounded-xl border border-stone-800">
                  <span className="text-stone-400 text-[10px] block">Soil Organic Carbon (SOC)</span>
                  <span className="text-sm font-bold text-teal-300">
                    +{selectedPlotForCredit.dmrvRecord?.soilOrganicCarbonIncrease || 0.12}% gain
                  </span>
                </div>
              </div>

              {/* Logged Practices List */}
              <div className="bg-stone-950/80 p-3 rounded-xl border border-stone-800 text-xs space-y-2">
                <span className="text-[11px] font-semibold text-stone-300 block">
                  Verified Regenerative Practices:
                </span>
                <div className="space-y-1">
                  {(selectedPlotForCredit.dmrvRecord?.regenerativePracticesLogged || []).map((prac, i) => (
                    <div key={i} className="flex items-center gap-1.5 text-[11px] text-stone-400">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>{prac}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: RAG KNOWLEDGE CORPUS REPOSITORIES */}
      {activeSubTab === 'knowledge' && (
        <div className="space-y-4">
          <div className="bg-stone-900 rounded-2xl border border-stone-800 p-5 shadow-lg space-y-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-emerald-400" />
              Sovereign Agronomic Knowledge Repositories (RAG Grounding Corpus)
            </h3>
            <p className="text-xs sm:text-sm text-stone-300">
              The AI advisory and diagnosis agents retrieve domain citations directly from certified national research bodies
              (ICAR in India, EMBRAPA in Brazil, ARC in South Africa, FAO DLIS) before synthesizing advice to eliminate hallucinations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {RAG_GROUNDING_SOURCES.map((source) => (
              <div
                key={source.id}
                className="bg-stone-900 rounded-2xl border border-stone-800 p-5 shadow-lg space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-700">
                      {source.type}
                    </span>
                    <span className="text-xs font-mono text-stone-400">{source.year}</span>
                  </div>
                  <h4 className="text-sm font-bold text-white leading-snug">{source.name}</h4>
                  <div className="text-xs font-medium text-emerald-400">{source.institution}</div>
                  <div className="bg-stone-950 p-3 rounded-xl border border-stone-800 text-xs text-stone-300 font-serif leading-relaxed italic">
                    "{source.snippet}"
                  </div>
                </div>

                <div className="pt-2 border-t border-stone-800 flex items-center justify-between text-[11px] text-stone-400">
                  <span>Indexed in Vertex AI Vector Search</span>
                  <span className="text-emerald-400 font-mono">ID: {source.id}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
