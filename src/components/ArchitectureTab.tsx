import React, { useState } from 'react';
import {
  ShieldCheck,
  Cpu,
  Camera,
  Network,
  AlertTriangle,
  Layers,
  Sparkles,
  CheckCircle2,
  ExternalLink,
  Zap,
  Globe,
  Radio,
  Server,
  Cloud,
  FileCheck,
  BookOpen,
  DollarSign,
  Leaf,
  Scale,
  Users,
  Award,
  Database,
  Building,
  Flag,
} from 'lucide-react';
import { PRIOR_ART_BENCHMARK } from '../data/mockData';

export function ArchitectureTab() {
  const [activeSection, setActiveSection] = useState<'pillars' | 'benchmark' | 'principles' | 'stack' | 'governance' | 'roadmap' | 'scope'>('pillars');

  const pillars = [
    {
      id: 'p1',
      title: '1. Simulation-Grounded Advisory Engine',
      icon: Cpu,
      color: 'from-emerald-600 to-teal-800',
      badge: 'Vertex AI AutoML + APSIM / DSSAT + Gemini API',
      summary:
        'Combines Earth Engine satellite indices, local soil health records, and short-range weather forecasts through a Vertex AI predictive model. Unlike a bare LLM, candidate recommendations are stress-tested against lightweight biophysical crop simulations (Agri-SAGE framework, arXiv 2607.00454) before Gemini generates farmer-ready guidance.',
      technologies: ['Gemini 3.7 Flash', 'APSIM/DSSAT Biophysical Rules', 'Vertex AI AutoML', 'Earth Engine NDVI'],
    },
    {
      id: 'p2',
      title: '2. Multimodal Diagnosis w/ Offline Fallback & Human Escalation',
      icon: Camera,
      color: 'from-teal-600 to-emerald-800',
      badge: 'Gemini Vision + RAG Grounding + TensorFlow Lite + Human-in-the-Loop',
      summary:
        'A farmer photographs an affected plant; Gemini multimodal vision identifies likely disease/deficiency, cross-checked against a RAG-retrieved agronomic knowledge base (ICAR, EMBRAPA, ARC, FAO). If confidence falls below 70%, the case automatically escalates to the Extension-Agent Copilot for human agronomist review.',
      technologies: ['Gemini Multimodal', 'Vertex AI Vector Search (RAG)', 'TensorFlow Lite (Offline)', 'Human Escalation Gateway'],
    },
    {
      id: 'p3',
      title: '3. Cross-Silo Federated Learning Commons',
      icon: Network,
      color: 'from-indigo-600 to-teal-800',
      badge: 'DP-SGD (ε = 0.5) + FedAvg + AgGateway ADAPT Schema',
      summary:
        'Replaces simple raw data pooling with cross-silo federated learning across BRICS sovereign clouds (Durrant et al., arXiv 2104.07468). Each nation trains locally, exchanging only differentially-private model weight updates through a Federated Learning Coordinator — raw smallholder records never cross national borders.',
      technologies: ['FedAvg Algorithm', 'Differential Privacy (ε=0.5)', 'AgGateway ADAPT Schema', 'DPGA Standards'],
    },
    {
      id: 'p4',
      title: '4. Transboundary Outbreak Early-Warning (FAO DLIS Model)',
      icon: AlertTriangle,
      color: 'from-amber-600 to-rose-800',
      badge: 'FAO Desert Locust Early-Warning Pattern (15:1+ Benefit-Cost Ratio)',
      summary:
        'Aggregated, geo-tagged disease and pest signals from the Diagnosis Agent feed an Outbreak Agent that watches for spatial clustering across national borders. Modelled directly on FAO Desert Locust Information Service (DLIS), providing continuous near-real-time bilateral alerting across neighboring countries.',
      technologies: ['FAO DLIS Clustering Logic', 'Airborne Spore Flux Modeling', 'Cross-Border Alerting', 'BigQuery Sentinel'],
    },
  ];

  const advancedPrinciples = [
    {
      principle: 'Retrieval-grounded reasoning (RAG)',
      whyItsHere: 'Prevents the advisory and diagnosis agents from hallucinating treatments; every claim is traceable to a retrieved agronomic source.',
      whereItCameFrom: "Digital Green / IFPRI GAIA findings on grounding LLM advisories; standard practice since FarmerChat's GPT-4+RAG design.",
    },
    {
      principle: 'Simulation-in-the-loop validation',
      whyItsHere: "Checks a generated recommendation against a biophysical crop model before it reaches a farmer, instead of trusting the LLM's arithmetic/agronomy.",
      whereItCameFrom: 'Agri-SAGE (arXiv 2607.00454, Jul 2026): simulation-grounded multi-agent advisory outperforming static package-of-practice baselines.',
    },
    {
      principle: 'Cross-silo federated learning, not raw pooling',
      whyItsHere: 'Lets BRICS nations improve a shared model without exporting raw farmer data — the actual governance blocker in cross-border agri data sharing.',
      whereItCameFrom: "Durrant et al., 'Role of Cross-Silo FL in Facilitating Data Sharing in Agri-Food' (arXiv 2104.07468); FedReplay & 2025 smart-agri FL work.",
    },
    {
      principle: 'Human-in-the-loop escalation',
      whyItsHere: "Every deployed system (FarmerChat, Plantix) treats AI as an extension-worker force-multiplier, not a replacement — low-confidence cases route to human review.",
      whereItCameFrom: 'Digital Green design documentation; GSMA/Plantix case studies on smallholder trust and adoption.',
    },
    {
      principle: 'Digital-public-good compliance',
      whyItsHere: 'Openness, interoperability, and FAIR-data principles let new BRICS members join without bespoke integration projects.',
      whereItCameFrom: "DPGA certification standard (used by FAO's AGRIS); India's Agri Stack open APIs; AgGateway's ADAPT open schema.",
    },
  ];

  const googleIntegrationMap = [
    { capability: 'Multi-agent orchestration', service: 'Vertex AI Agent Builder', role: 'Coordinates specialist agents, tool calls, and grounding instead of one monolithic prompt.' },
    { capability: 'Conversational reasoning & synthesis', service: 'Gemini API', role: 'Combines grounded diagnosis + simulation-checked advisory into one farmer-readable answer.' },
    { capability: 'Crop disease diagnosis', service: 'Gemini Multimodal / Vertex AI Vision', role: 'Classifies disease/deficiency from photo; degrades gracefully to on-device TensorFlow Lite.' },
    { capability: 'Retrieval-augmented grounding', service: 'Vertex AI Vector Search', role: 'Grounds every diagnosis/advisory claim in retrieved national agronomic sources (ICAR, EMBRAPA, ARC, FAO).' },
    { capability: 'Yield & crop-suitability prediction', service: 'Vertex AI AutoML + APSIM/DSSAT', role: 'Ranks regenerative crop/input options; candidates are simulation-checked before synthesis.' },
    { capability: 'Multilingual voice interface', service: 'Cloud Speech-to-Text & Text-to-Speech', role: 'Lets farmers and extension agents speak and listen in their native language across every channel.' },
    { capability: 'Satellite crop & soil signal', service: 'Google Earth Engine', role: 'Supplies NDVI, soil moisture, and land-cover indices used as advisory-agent features.' },
    { capability: 'Episodic field memory', service: 'Firestore NoSQL Database', role: 'Tracks seasonal plot history, prior disease outbreaks, and outcome history across crop cycles.' },
  ];

  const scopeMatrix = [
    { module: 'Agronomic Advisory Agent (1/3)', status: 'Live Gemini API', engine: 'gemini-3.7-flash', details: 'Generates candidate recommendations from plot telemetry in JSON format.', isLive: true },
    { module: 'Biophysical Simulation Checker (2/3)', status: 'Live Gemini API', engine: 'gemini-3.7-flash (APSIM Logic)', details: 'Stress-tests recommendations against biophysical rules and flags violations.', isLive: true },
    { module: 'Farmer Synthesis Agent (3/3)', status: 'Live Gemini API', engine: 'gemini-3.7-flash', details: 'Transforms agent outputs into an empathetic, plain-language action plan.', isLive: true },
    { module: 'Crop Photo Multimodal Diagnosis', status: 'Live Gemini API', engine: 'gemini-3.7-flash (Vision)', details: 'Evaluates leaf photo, symptoms, remedies, and confidence score (0-100%).', isLive: true },
    { module: 'Extension-Agent Copilot & Triage', status: 'Live Functional UI', engine: 'Confidence < 70% Escalation Gateway', details: 'Interactive queue for agronomists to review, annotate, and dispatch prescriptions.', isLive: true },
    { module: 'Agri-Credit & Digital MRV Scorer', status: 'Live Interactive Engine', engine: 'Cropin SmartRisk & Carbon Model', details: 'Computes creditworthiness & carbon sequestration metrics per smallholder plot.', isLive: true },
    { module: 'Plot Environmental Telemetry', status: 'Simulated Feed', engine: 'Mock Earth Engine & Sensor Array', details: 'Stands in for Google Earth Engine satellite NDVI & IoT in-situ sensors.', isLive: false },
    { module: 'Federated Learning Weight Exchange', status: 'Simulated Architecture', engine: 'FedAvg Differential Privacy (ε=0.5)', details: 'Simulates weight delta aggregation between India & Brazil sovereign clouds.', isLive: false },
    { module: 'Transboundary Outbreak Sentinel', status: 'Simulated Sentinel', engine: 'FAO DLIS Early-Warning Model', details: 'Geo-tagged border incident clustering and automated alert triggers.', isLive: false },
    { module: 'Audio Speech (Read Aloud)', status: 'Browser Client API', engine: 'SpeechSynthesis API', details: 'Stand-in for production Google Cloud Text-to-Speech multi-lingual voices.', isLive: true },
  ];

  return (
    <div className="space-y-8 pb-12 max-w-6xl mx-auto">
      {/* Header Overview */}
      <div className="text-center space-y-3 pt-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950 text-emerald-300 text-xs font-semibold border border-emerald-700/60">
          <Globe className="w-3.5 h-3.5" /> BRICS AgriNet System Architecture — v2 Specification
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-serif tracking-tight">
          An Interoperable Digital Agriculture Network for Climate-Resilient Farming Across BRICS Nations
        </h2>
        <p className="text-xs sm:text-sm text-stone-300 max-w-3xl mx-auto leading-relaxed">
          Restructured against deployed systems (Plantix, Digital Green FarmerChat, Cropin Grow, FAO DLIS) and 2025–2026
          research in simulation-grounded multi-agent advisory (Agri-SAGE), cross-silo federated learning, and transboundary pest early warning.
        </p>

        {/* Section Navigation Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-3">
          {[
            { id: 'pillars', label: '4 Core Pillars', icon: Layers },
            { id: 'benchmark', label: 'Prior Art Benchmark', icon: Scale },
            { id: 'principles', label: '5 Core Principles', icon: Award },
            { id: 'stack', label: 'Google AI Stack', icon: Cpu },
            { id: 'governance', label: 'BRICS Governance & Data', icon: Flag },
            { id: 'roadmap', label: 'Deployment Roadmap', icon: Building },
            { id: 'scope', label: 'MVP Scope Matrix', icon: FileCheck },
          ].map((sec) => {
            const Icon = sec.icon;
            return (
              <button
                key={sec.id}
                type="button"
                onClick={() => setActiveSection(sec.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  activeSection === sec.id
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'bg-stone-900 hover:bg-stone-800 text-stone-300 border border-stone-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{sec.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* SECTION 1: 4 PILLARS */}
      {activeSection === 'pillars' && (
        <div className="space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between pb-2 border-b border-stone-800">
            <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-emerald-400" />
              The 4 Architectural Pillars
            </h3>
            <span className="text-xs text-stone-400">Restructured v2 Design</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pillars.map((pillar) => {
              const Icon = pillar.icon;
              return (
                <div
                  key={pillar.id}
                  className="bg-stone-900 rounded-2xl border border-stone-800 p-5 shadow-lg space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-xl bg-gradient-to-br ${pillar.color} flex items-center justify-center text-white shadow-md shrink-0`}
                        >
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-bold text-sm sm:text-base text-white">{pillar.title}</h4>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-stone-800 text-emerald-300 border border-stone-700">
                            {pillar.badge}
                          </span>
                        </div>
                      </div>
                    </div>

                    <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">{pillar.summary}</p>
                  </div>

                  <div className="flex flex-wrap gap-1.5 pt-3 border-t border-stone-800">
                    {pillar.technologies.map((tech, idx) => (
                      <span
                        key={idx}
                        className="text-[11px] font-medium px-2 py-0.5 rounded bg-stone-950 text-stone-300 border border-stone-800"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SECTION 2: PRIOR ART BENCHMARKING (Section 2 of Concept Doc) */}
      {activeSection === 'benchmark' && (
        <div className="space-y-4 animate-in fade-in">
          <div className="bg-stone-900 rounded-2xl border border-stone-800 p-5 shadow-lg space-y-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Scale className="w-5 h-5 text-emerald-400" />
              Comparative Landscape: Benchmarking What Already Exists
            </h3>
            <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
              Before restructuring, AgriNet was benchmarked against the closest deployed systems (Plantix, Digital Green's FarmerChat,
              Cropin Grow/SmartFarm, FAO DLIS) to ensure the design adds real breakthrough capabilities rather than re-inventing what already works.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {PRIOR_ART_BENCHMARK.map((bench, idx) => (
              <div
                key={idx}
                className="bg-stone-900 rounded-2xl border border-stone-800 p-5 shadow-lg space-y-3"
              >
                <div className="flex items-center justify-between border-b border-stone-800 pb-2.5">
                  <h4 className="text-sm sm:text-base font-bold text-white">{bench.system}</h4>
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-stone-800 text-stone-300 border border-stone-700">
                    Deployed Prior Art
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="bg-stone-950/80 p-3 rounded-xl border border-stone-800 space-y-1">
                    <span className="text-emerald-400 font-bold text-[11px] block">✓ What It Does Well:</span>
                    <p className="text-stone-300 leading-relaxed">{bench.whatItDoesWell}</p>
                  </div>
                  <div className="bg-stone-950/80 p-3 rounded-xl border border-stone-800 space-y-1">
                    <span className="text-rose-400 font-bold text-[11px] block">✗ What It Doesn't Do:</span>
                    <p className="text-stone-400 leading-relaxed">{bench.whatItDoesntDo}</p>
                  </div>
                </div>

                <div className="bg-emerald-950/40 p-3 rounded-xl border border-emerald-800/60 text-xs text-emerald-200 flex items-start gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-emerald-300">BRICS AgriNet Advantage:</strong> {bench.bricsAgriNetAdvantage}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 3: 5 ADVANCED PRINCIPLES (Section 5 of Concept Doc) */}
      {activeSection === 'principles' && (
        <div className="space-y-4 animate-in fade-in">
          <div className="bg-stone-900 rounded-2xl border border-stone-800 p-5 shadow-lg space-y-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-emerald-400" />
              5 Advanced Architecture Principles (2025–2026 Research Foundation)
            </h3>
            <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
              Each design principle addresses a documented weakness in existing deployed systems or is derived directly from 2025–2026 academic literature.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-stone-300 bg-stone-900 rounded-2xl border border-stone-800 shadow-lg">
              <thead className="bg-stone-950 text-stone-400 text-[11px] uppercase tracking-wider">
                <tr>
                  <th className="p-3.5">Architecture Principle</th>
                  <th className="p-3.5">Why It's Here (Operational Rationale)</th>
                  <th className="p-3.5">Where It Came From (Academic / Deployed Source)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-800">
                {advancedPrinciples.map((princ, idx) => (
                  <tr key={idx} className="hover:bg-stone-800/40">
                    <td className="p-3.5 font-bold text-white">{princ.principle}</td>
                    <td className="p-3.5 text-stone-300 leading-relaxed">{princ.whyItsHere}</td>
                    <td className="p-3.5 text-emerald-400 font-mono text-[11px]">{princ.whereItCameFrom}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SECTION 4: GOOGLE AI STACK (Section 8 of Concept Doc) */}
      {activeSection === 'stack' && (
        <div className="space-y-4 animate-in fade-in">
          <div className="bg-stone-900 rounded-2xl border border-stone-800 p-5 shadow-lg space-y-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Cpu className="w-5 h-5 text-emerald-400" />
              Google AI Integration Map
            </h3>
            <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
              Comprehensive mapping of Google Cloud AI services powering each layer of the BRICS AgriNet multi-agent architecture.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-stone-300 bg-stone-900 rounded-2xl border border-stone-800 shadow-lg">
              <thead className="bg-stone-950 text-stone-400 text-[11px] uppercase tracking-wider">
                <tr>
                  <th className="p-3.5">System Capability</th>
                  <th className="p-3.5">Google AI / Cloud Service</th>
                  <th className="p-3.5">Role in AgriNet v2</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-800">
                {googleIntegrationMap.map((item, idx) => (
                  <tr key={idx} className="hover:bg-stone-800/40">
                    <td className="p-3.5 font-semibold text-white">{item.capability}</td>
                    <td className="p-3.5 font-mono text-emerald-300 text-[11px]">{item.service}</td>
                    <td className="p-3.5 text-stone-300">{item.role}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SECTION 5: GOVERNANCE & DATA MODEL (Section 10 of Concept Doc) */}
      {activeSection === 'governance' && (
        <div className="space-y-4 animate-in fade-in">
          <div className="bg-stone-900 rounded-2xl border border-stone-800 p-5 shadow-lg space-y-4">
            <div className="flex items-center gap-2">
              <Flag className="w-5 h-5 text-emerald-400" />
              <h3 className="text-base font-bold text-white">
                Cross-Border Data Model, Governance &amp; Indore Declaration Alignment
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
              AgriNet maps onto the institutional structure agreed at the <strong>June 2026 BRICS Indore Declaration</strong>:
              the <strong>BRICS Network on Digital Agriculture (IIT Delhi)</strong> promotes AI and digital public infrastructure,
              while the <strong>BRICS AgriN</strong> network shares inputs and information. AgriNet acts as the deployable AI infrastructure feeding aggregate insights — never raw data.
            </p>

            {/* 3-Tier Data Privacy Boundaries */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs pt-2">
              <div className="bg-stone-950 p-4 rounded-xl border border-stone-800 space-y-1.5">
                <span className="text-[10px] uppercase font-bold text-emerald-400 block">Tier 1: Local Farmer Node</span>
                <p className="text-white font-medium">Raw farmer records, exact GPS, photos, national edge training.</p>
                <div className="text-[11px] text-amber-300 font-bold mt-2">
                  🔒 Cross-Border Transfer: 0 bytes (Stays 100% inside national boundary)
                </div>
              </div>

              <div className="bg-stone-950 p-4 rounded-xl border border-stone-800 space-y-1.5">
                <span className="text-[10px] uppercase font-bold text-teal-400 block">Tier 2: National Ministry</span>
                <p className="text-white font-medium">Locally-trained sovereign model plus de-identified plot aggregates.</p>
                <div className="text-[11px] text-amber-300 font-bold mt-2">
                  🔒 Cross-Border Transfer: Nothing by default
                </div>
              </div>

              <div className="bg-stone-950 p-4 rounded-xl border border-stone-800 space-y-1.5">
                <span className="text-[10px] uppercase font-bold text-indigo-400 block">Tier 3: Federated Commons</span>
                <p className="text-white font-medium">Differentially-private model weights (ε=0.5) &amp; grid-cell outbreak alerts.</p>
                <div className="text-[11px] text-emerald-300 font-bold mt-2">
                  🌐 Cross-Border Transfer: Math tensors &amp; grid flags only
                </div>
              </div>
            </div>

            {/* DPG & FAIR Principles */}
            <div className="bg-stone-950 p-4 rounded-xl border border-stone-800 text-xs text-stone-300 space-y-2">
              <div className="font-bold text-white flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Digital Public Goods (DPG) &amp; AgGateway ADAPT Schema Standards</span>
              </div>
              <p className="text-stone-400 leading-relaxed">
                The Shared Model Registry publishes schemas openly in <strong>AgGateway ADAPT format</strong> and targets
                <strong>Digital Public Goods Alliance (DPGA) certification</strong> (held by FAO's AGRIS) built on <strong>FAIR data principles</strong> (Findable, Accessible, Interoperable, Reusable).
              </p>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 6: ROADMAP (Section 16 & 21 of Concept Doc) */}
      {activeSection === 'roadmap' && (
        <div className="space-y-4 animate-in fade-in">
          <div className="bg-stone-900 rounded-2xl border border-stone-800 p-5 shadow-lg space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Building className="w-5 h-5 text-emerald-400" />
              Deployment &amp; Scalability Roadmap
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
              <div className="bg-stone-950 p-4 rounded-xl border border-emerald-700/60 space-y-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                  Phase 0 (Built Now)
                </span>
                <div className="font-bold text-white text-sm">Hackathon MVP</div>
                <p className="text-stone-400 leading-snug">
                  Multi-agent advisory + multimodal diagnosis with RAG grounding, simulated FL weight exchange across 2 nations, and transboundary outbreak sentinel.
                </p>
              </div>

              <div className="bg-stone-950 p-4 rounded-xl border border-stone-800 space-y-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-stone-800 text-stone-300 border border-stone-700">
                  Phase 1 (2–4 Weeks)
                </span>
                <div className="font-bold text-white text-sm">Ministry Pilot</div>
                <p className="text-stone-400 leading-snug">
                  Deploy inside one national extension department (e.g. KVK / EMATER) using real soil &amp; met feeds; Extension-Agent Copilot live for human review.
                </p>
              </div>

              <div className="bg-stone-950 p-4 rounded-xl border border-stone-800 space-y-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-stone-800 text-stone-300 border border-stone-700">
                  Phase 2 (2–3 Months)
                </span>
                <div className="font-bold text-white text-sm">Multi-Country Federation</div>
                <p className="text-stone-400 leading-snug">
                  Connect 2nd &amp; 3rd BRICS national nodes to the Federated Learning Coordinator using open ADAPT schema; live transboundary outbreak alerting.
                </p>
              </div>

              <div className="bg-stone-950 p-4 rounded-xl border border-stone-800 space-y-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-stone-800 text-stone-300 border border-stone-700">
                  Phase 3 (Scale)
                </span>
                <div className="font-bold text-white text-sm">DPG Certification</div>
                <p className="text-stone-400 leading-snug">
                  All member nations connected; formal Digital Public Goods Alliance certification so non-BRICS Global South partners can federate in under open standards.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 7: SCOPE MATRIX (Section 19 of Concept Doc) */}
      {activeSection === 'scope' && (
        <div className="bg-stone-900 rounded-2xl border border-stone-800 p-5 shadow-lg space-y-4 animate-in fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-stone-800">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-emerald-400" />
                MVP Scope Matrix: Live Gemini API vs. Simulated Feeds
              </h3>
              <p className="text-xs text-stone-400 mt-0.5">
                Full transparency for evaluators: clear delineation of live API calls versus simulated architectural components
              </p>
            </div>
            <span className="text-[11px] font-semibold text-emerald-300 px-2.5 py-1 rounded bg-emerald-950 border border-emerald-700/60 self-start sm:self-auto">
              Honest Architecture Pitch
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-stone-300">
              <thead className="bg-stone-950 text-stone-400 text-[11px] uppercase tracking-wider">
                <tr>
                  <th className="p-3">Component / Sub-system</th>
                  <th className="p-3">MVP Implementation</th>
                  <th className="p-3">Underlying Engine / Model</th>
                  <th className="p-3">Functional Scope in Demo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-800">
                {scopeMatrix.map((item, idx) => (
                  <tr key={idx} className="hover:bg-stone-800/40">
                    <td className="p-3 font-semibold text-white">{item.module}</td>
                    <td className="p-3">
                      <span
                        className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded border ${
                          item.isLive
                            ? 'bg-emerald-950 text-emerald-300 border-emerald-700'
                            : 'bg-stone-800 text-amber-300 border-stone-700'
                        }`}
                      >
                        {item.isLive ? '⚡ Live Gemini / Client API' : '🛰️ Simulated for Demo'}
                      </span>
                    </td>
                    <td className="p-3 font-mono text-stone-300 text-[11px]">{item.engine}</td>
                    <td className="p-3 text-stone-400 text-xs">{item.details}</td>
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
