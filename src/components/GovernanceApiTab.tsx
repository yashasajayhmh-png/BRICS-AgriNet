import React, { useState } from 'react';
import {
  OpenApiEndpointDoc,
  BricsDataStandard,
  CrossBorderModelRegistry,
  ComplianceAuditLog,
  DataSourceConnector,
  ModelMonitoringTelemetry,
  AgronomistAdvisoryTemplate,
} from '../types';
import {
  OPEN_API_DOCS,
  BRICS_DATA_STANDARDS,
  CROSS_BORDER_MODELS,
  INITIAL_AUDIT_LOGS,
  DATA_SOURCE_CONNECTORS,
  MODEL_MONITORING_METRICS,
  ADVISORY_TEMPLATES,
} from '../data/governanceData';
import {
  Code,
  Globe,
  Cpu,
  ShieldCheck,
  Server,
  Activity,
  FileText,
  Copy,
  Check,
  ExternalLink,
  Lock,
  RefreshCw,
  Sliders,
  Sparkles,
  Layers,
  Database,
  Terminal,
} from 'lucide-react';

export function GovernanceApiTab() {
  const [activeSubTab, setActiveSubTab] = useState<
    'openapi' | 'standards' | 'models' | 'connectors' | 'monitoring' | 'templates' | 'audit'
  >('openapi');

  const [selectedEndpoint, setSelectedEndpoint] = useState<OpenApiEndpointDoc>(OPEN_API_DOCS[0]);
  const [selectedStandard, setSelectedStandard] = useState<BricsDataStandard>(BRICS_DATA_STANDARDS[0]);
  const [copiedCodeKey, setCopiedCodeKey] = useState<string | null>(null);

  // Template editor state
  const [templates, setTemplates] = useState<AgronomistAdvisoryTemplate[]>(ADVISORY_TEMPLATES);
  const [selectedTemplate, setSelectedTemplate] = useState<AgronomistAdvisoryTemplate>(ADVISORY_TEMPLATES[0]);

  // Model trigger simulation state
  const [retrainingStatus, setRetrainingStatus] = useState<string | null>(null);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCodeKey(key);
    setTimeout(() => setCopiedCodeKey(null), 2500);
  };

  const handleTriggerRetraining = (modelId: string) => {
    setRetrainingStatus(`Triggered DP-FedAvg differential privacy gradient epoch for ${modelId}...`);
    setTimeout(() => {
      setRetrainingStatus(`Epoch converged! Global sovereign weights updated with zero raw data transfer.`);
      setTimeout(() => setRetrainingStatus(null), 5000);
    }, 2500);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-stone-900 via-stone-900 to-indigo-950/50 border border-stone-800 rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-950/80 border border-indigo-700/50 text-indigo-300 text-xs font-semibold">
              <Globe className="w-3.5 h-3.5 text-indigo-400" />
              <span>Sovereign Cross-Border Interoperability &amp; Standards</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white font-serif">
              Open API Gateway, Shared Standards &amp; Model Governance
            </h1>
            <p className="text-xs sm:text-sm text-stone-300 max-w-2xl leading-relaxed">
              Decentralized API specifications, AgGateway ADAPT schemas, cryptographic cross-border model registries, admin data connectors, and immutable audit logs.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-stone-950/80 border border-stone-800 rounded-2xl p-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-bold text-white font-mono">Consortium Gateway v4.2</span>
            </div>
          </div>
        </div>

        {/* Sub Navigation Strip */}
        <div className="flex items-center gap-2 overflow-x-auto pt-6 border-t border-stone-800/80 mt-6 section-scrollbar pb-1">
          {[
            { id: 'openapi', label: 'Open API Explorer', icon: Code },
            { id: 'standards', label: 'BRICS Data Standards', icon: Layers },
            { id: 'models', label: 'Cross-Border Model Registry', icon: Cpu },
            { id: 'connectors', label: 'Admin Data Sources', icon: Server },
            { id: 'monitoring', label: 'Model Drift & Retraining', icon: Activity },
            { id: 'templates', label: 'Advisory Content Editor', icon: FileText },
            { id: 'audit', label: 'Compliance Audit Logs', icon: ShieldCheck },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveSubTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                  activeSubTab === tab.id
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-stone-800 text-stone-300 hover:bg-stone-700 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB 1: OPEN API EXPLORER */}
      {activeSubTab === 'openapi' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Endpoint List */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Available Consortium REST Endpoints
            </h3>
            {OPEN_API_DOCS.map((ep) => (
              <button
                key={ep.path}
                type="button"
                onClick={() => setSelectedEndpoint(ep)}
                className={`w-full text-left p-4 rounded-2xl border transition-all space-y-2 ${
                  selectedEndpoint.path === ep.path
                    ? 'bg-stone-900 border-indigo-500 shadow-md ring-1 ring-indigo-400/50'
                    : 'bg-stone-950 border-stone-800 hover:border-stone-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                      ep.method === 'POST'
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                        : 'bg-indigo-950 text-indigo-400 border border-indigo-800'
                    }`}
                  >
                    {ep.method}
                  </span>
                  <span className="font-mono text-xs text-white truncate">{ep.path}</span>
                </div>
                <div className="text-xs text-stone-300 font-semibold">{ep.summary}</div>
              </button>
            ))}
          </div>

          {/* Endpoint Details & Sample JSON */}
          <div className="lg:col-span-2 bg-stone-900 border border-stone-800 rounded-3xl p-6 space-y-5 shadow-lg">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-stone-800">
              <div className="flex items-center gap-2.5">
                <span
                  className={`px-2.5 py-1 rounded text-xs font-mono font-bold ${
                    selectedEndpoint.method === 'POST'
                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                      : 'bg-indigo-950 text-indigo-400 border border-indigo-800'
                  }`}
                >
                  {selectedEndpoint.method}
                </span>
                <span className="font-mono text-sm font-bold text-white">{selectedEndpoint.path}</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    copyToClipboard(
                      `curl -X ${selectedEndpoint.method} "https://api.brics-agrinet.org${selectedEndpoint.path}" \\\n  -H "Authorization: Bearer <SOVEREIGN_TOKEN>" \\\n  -H "Content-Type: application/json"`,
                      'curl'
                    )
                  }
                  className="px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-semibold flex items-center gap-1.5 transition-all"
                >
                  {copiedCodeKey === 'curl' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>Copy cURL</span>
                </button>
              </div>
            </div>

            <p className="text-xs text-stone-300 leading-relaxed">{selectedEndpoint.description}</p>

            {/* Sample Request Payload */}
            {selectedEndpoint.sampleRequestJson && (
              <div className="space-y-2">
                <div className="text-xs font-bold text-stone-400 flex items-center justify-between">
                  <span>Sample Request Body (JSON)</span>
                  <span className="text-[10px] text-stone-500 font-mono">application/json</span>
                </div>
                <div className="relative bg-stone-950 rounded-2xl p-4 border border-stone-800 text-[11px] font-mono text-emerald-300 overflow-x-auto section-scrollbar max-h-56">
                  <pre>{selectedEndpoint.sampleRequestJson}</pre>
                </div>
              </div>
            )}

            {/* Sample Response Payload */}
            <div className="space-y-2">
              <div className="text-xs font-bold text-stone-400 flex items-center justify-between">
                <span>Sample Response Body (200 OK)</span>
                <span className="text-[10px] text-stone-500 font-mono">application/json</span>
              </div>
              <div className="relative bg-stone-950 rounded-2xl p-4 border border-stone-800 text-[11px] font-mono text-indigo-300 overflow-x-auto section-scrollbar max-h-64">
                <pre>{selectedEndpoint.sampleResponseJson}</pre>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: BRICS DATA STANDARDS */}
      {activeSubTab === 'standards' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Harmonized Data Schemas</h3>
            {BRICS_DATA_STANDARDS.map((std) => (
              <button
                key={std.schemaName}
                type="button"
                onClick={() => setSelectedStandard(std)}
                className={`w-full text-left p-4 rounded-2xl border transition-all space-y-2 ${
                  selectedStandard.schemaName === std.schemaName
                    ? 'bg-stone-900 border-indigo-500 shadow-md ring-1 ring-indigo-400/50'
                    : 'bg-stone-950 border-stone-800 hover:border-stone-700'
                }`}
              >
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-950 text-indigo-300 font-bold border border-indigo-800">
                  {std.standardBody}
                </span>
                <div className="font-bold text-xs text-white leading-snug">{std.schemaName}</div>
              </button>
            ))}
          </div>

          <div className="lg:col-span-2 bg-stone-900 border border-stone-800 rounded-3xl p-6 space-y-4 shadow-lg">
            <h3 className="text-base font-bold text-white">{selectedStandard.schemaName}</h3>
            <p className="text-xs text-stone-300 leading-relaxed">{selectedStandard.description}</p>
            <div className="bg-stone-950 rounded-2xl p-4 border border-stone-800 text-[11px] font-mono text-stone-300 overflow-x-auto section-scrollbar max-h-96">
              <pre>{selectedStandard.sampleJson}</pre>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: CROSS-BORDER MODEL REGISTRY */}
      {activeSubTab === 'models' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {CROSS_BORDER_MODELS.map((model) => (
              <div
                key={model.modelId}
                className="bg-stone-900 border border-stone-800 rounded-2xl p-6 space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-stone-950 text-stone-300 border border-stone-800 font-semibold">
                      {model.flag} {model.country}
                    </span>
                    <span className="text-xs font-mono font-bold text-indigo-400">v{model.version}</span>
                  </div>

                  <h3 className="font-bold text-sm text-white">{model.name}</h3>
                  <div className="text-xs text-stone-400 font-mono">{model.hostSilo}</div>

                  <div className="p-2.5 rounded-xl bg-stone-950 border border-stone-800/80 space-y-1">
                    <div className="text-[10px] text-stone-500 font-semibold uppercase">SHA-256 Weights Checksum:</div>
                    <div className="text-[10px] font-mono text-emerald-400 break-all">{model.sha256Checksum}</div>
                  </div>
                </div>

                <div className="pt-3 border-t border-stone-800 flex items-center justify-between text-xs">
                  <span className="text-stone-400">
                    {model.parametersMillion}M Parameters • DP ε = {model.dpBudgetEpsilon}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleTriggerRetraining(model.modelId)}
                    className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-all flex items-center gap-1.5 shadow"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Sync Gradients</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {retrainingStatus && (
            <div className="p-4 rounded-2xl bg-indigo-950 border border-indigo-600 text-indigo-200 text-xs font-semibold flex items-center gap-2 shadow-lg">
              <Activity className="w-4 h-4 text-indigo-400 animate-spin" />
              <span>{retrainingStatus}</span>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: ADMIN DATA SOURCE CONNECTORS */}
      {activeSubTab === 'connectors' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {DATA_SOURCE_CONNECTORS.map((c) => (
            <div
              key={c.id}
              className="bg-stone-900 border border-stone-800 rounded-2xl p-5 space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 font-bold border border-emerald-700/50">
                    ● {c.status}
                  </span>
                  <span className="text-xs font-mono text-stone-400">{c.latencyMs} ms</span>
                </div>
                <h3 className="font-bold text-sm text-white">{c.name}</h3>
                <div className="text-xs text-indigo-400 font-medium">{c.institution}</div>
              </div>

              <div className="pt-3 border-t border-stone-800 text-xs space-y-1">
                <div className="flex justify-between text-stone-400">
                  <span>24h Ingested:</span>
                  <span className="font-bold text-white font-mono">{c.recordsIngested24h.toLocaleString()} records</span>
                </div>
                <div className="text-[10px] font-mono text-stone-500 truncate">{c.endpointUrl}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 5: MODEL MONITORING & RETRAINING */}
      {activeSubTab === 'monitoring' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {MODEL_MONITORING_METRICS.map((m) => (
              <div key={m.modelId} className="bg-stone-900 border border-stone-800 rounded-3xl p-6 space-y-4 shadow-lg">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-base text-white">{m.modelName}</h3>
                  <span className="text-xs font-bold text-emerald-300 bg-emerald-950 px-2.5 py-0.5 rounded-full border border-emerald-700/50">
                    F1 Score: {(m.currentF1Score * 100).toFixed(1)}%
                  </span>
                </div>

                <p className="text-xs text-stone-400">{m.architecture}</p>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-stone-950 border border-stone-800">
                    <div className="text-stone-500">Population Drift (PSI)</div>
                    <div className="text-lg font-bold text-emerald-400 font-mono mt-0.5">{m.driftMetricPSI}</div>
                    <div className="text-[10px] text-stone-400">Low Drift (&lt;0.10)</div>
                  </div>

                  <div className="p-3 rounded-xl bg-stone-950 border border-stone-800">
                    <div className="text-stone-500">DP Privacy Spent (ε)</div>
                    <div className="text-lg font-bold text-indigo-400 font-mono mt-0.5">{m.dpEpsilonConsumed} / 1.0</div>
                    <div className="text-[10px] text-stone-400">Differential Privacy Safe</div>
                  </div>
                </div>

                {/* Loss history */}
                <div className="space-y-1.5 pt-2 border-t border-stone-800">
                  <div className="text-[11px] text-stone-400">Validation Loss Progression Across Rounds:</div>
                  <div className="flex items-end gap-2 h-14 bg-stone-950 p-2 rounded-xl border border-stone-800">
                    {m.validationLossHistory.map((loss, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center gap-1">
                        <div
                          className="w-full bg-indigo-500/80 rounded-t"
                          style={{ height: `${Math.round(loss * 80)}px` }}
                        />
                        <span className="text-[9px] text-stone-400 font-mono">{loss}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: ADVISORY CONTENT EDITOR */}
      {activeSubTab === 'templates' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Agronomist Advisory Standards</h3>
            {templates.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setSelectedTemplate(t)}
                className={`w-full text-left p-4 rounded-2xl border transition-all space-y-2 ${
                  selectedTemplate.id === t.id
                    ? 'bg-stone-900 border-indigo-500 shadow-md ring-1 ring-indigo-400/50'
                    : 'bg-stone-950 border-stone-800 hover:border-stone-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">{t.crop}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 font-bold border border-emerald-700/50">
                    {t.approvalStatus}
                  </span>
                </div>
                <div className="text-xs text-stone-300 font-medium leading-snug">{t.title}</div>
              </button>
            ))}
          </div>

          <div className="lg:col-span-2 bg-stone-900 border border-stone-800 rounded-3xl p-6 space-y-5 shadow-lg">
            <div className="flex items-center justify-between pb-4 border-b border-stone-800">
              <div>
                <h3 className="text-base font-bold text-white">{selectedTemplate.title}</h3>
                <div className="text-xs text-stone-400">Author: {selectedTemplate.authorAgronomist}</div>
              </div>
              <span className="text-xs px-3 py-1 rounded-full bg-emerald-950 text-emerald-300 font-bold border border-emerald-700/60">
                Peer-Reviewed Standard
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="font-bold text-white">Recommended Action Sequence:</div>
              <div className="space-y-2">
                {selectedTemplate.recommendedSteps.map((step, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-stone-950 border border-stone-800 flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-indigo-950 text-indigo-300 font-bold flex items-center justify-center text-[10px] shrink-0 border border-indigo-700/50">
                      {idx + 1}
                    </span>
                    <span className="text-stone-300">{step}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-2">
              <div className="p-4 rounded-xl bg-stone-950 border border-stone-800 space-y-1">
                <div className="font-bold text-emerald-400">🌿 Biological Alternative:</div>
                <p className="text-stone-300 leading-relaxed">{selectedTemplate.organicAlternative}</p>
              </div>

              <div className="p-4 rounded-xl bg-stone-950 border border-stone-800 space-y-1">
                <div className="font-bold text-amber-400">🧪 Synthetic Intervention:</div>
                <p className="text-stone-300 leading-relaxed">{selectedTemplate.chemicalAlternative}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 7: COMPLIANCE AUDIT LOGS */}
      {activeSubTab === 'audit' && (
        <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 space-y-4 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <span>Immutable Sovereign Access Audit Ledger</span>
              </h3>
              <p className="text-xs text-stone-400">
                Every inference call, gradient exchange, and telemetry query is recorded with cryptographic SHA-256 checksums.
              </p>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            {INITIAL_AUDIT_LOGS.map((log) => (
              <div
                key={log.id}
                className="p-4 rounded-2xl bg-stone-950 border border-stone-800 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] text-stone-500">{log.timestamp}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-950 text-indigo-300 border border-indigo-800">
                      {log.actionType}
                    </span>
                    <span className="font-bold text-white">{log.actorId}</span>
                    <span className="text-stone-400">({log.actorRole})</span>
                  </div>
                  <div className="text-stone-300 font-mono text-[11px]">{log.resourceTarget}</div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="font-mono text-[10px] text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded-lg border border-emerald-800/50">
                    {log.cryptographicHash}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-700/50">
                    {log.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
