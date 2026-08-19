import React, { useRef } from 'react';
import { NavigationTab, FarmerProfile, PlotTelemetry } from '../types';
import {
  Sprout,
  MessageSquare,
  Camera,
  Network,
  AlertTriangle,
  UserCheck,
  ShieldCheck,
  Globe,
  ArrowRight,
  Sparkles,
  Zap,
  Leaf,
  Layers,
  Activity,
  Award,
  CheckCircle2,
  Lock,
  ChevronRight,
  ChevronLeft,
  Database,
  Satellite,
  LogIn,
  Sliders,
  Compass,
  LayoutDashboard,
} from 'lucide-react';

interface LandingPageProps {
  onNavigate: (tab: NavigationTab) => void;
  onOpenAuth: () => void;
  currentFarmer: FarmerProfile | null;
  plots: PlotTelemetry[];
  onSelectPlot: (plot: PlotTelemetry) => void;
}

export function LandingPage({
  onNavigate,
  onOpenAuth,
  currentFarmer,
  plots,
  onSelectPlot,
}: LandingPageProps) {
  const overviewNavRef = useRef<HTMLDivElement>(null);
  const capabilitiesScrollRef = useRef<HTMLDivElement>(null);
  const plotsScrollRef = useRef<HTMLDivElement>(null);

  const scrollContainer = (ref: React.RefObject<HTMLDivElement>, direction: 'left' | 'right') => {
    if (ref.current) {
      const amount = 300;
      ref.current.scrollBy({
        left: direction === 'left' ? -amount : amount,
        behavior: 'smooth',
      });
    }
  };

  const overviewSections = [
    { id: 'hero-section', label: 'Platform Mission', icon: Sparkles },
    { id: 'capabilities-section', label: 'Multi-Agent Capabilities', icon: Layers },
    { id: 'plots-section', label: 'BRICS In-Situ Plots', icon: Globe },
    { id: 'sovereignty-section', label: 'Data Sovereignty Spec', icon: Lock },
    { id: 'advisory', label: 'Launch Advisory Hub', icon: MessageSquare, isAction: true },
    { id: 'diagnosis', label: 'Crop Photo Vision', icon: Camera, isAction: true },
    { id: 'federated', label: 'Federated Commons', icon: Network, isAction: true },
    { id: 'outbreak', label: 'Outbreak Radar', icon: AlertTriangle, isAction: true },
  ];

  const scrollToSection = (sectionId: string, isAction?: boolean) => {
    if (isAction) {
      onNavigate(sectionId as NavigationTab);
      return;
    }
    const elem = document.getElementById(sectionId);
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };
  const capabilities = [
    {
      id: 'advisory',
      tab: 'advisory' as NavigationTab,
      title: 'Sequential Multi-Agent Advisory',
      badge: 'Live Gemini 3.7 Flash',
      badgeColor: 'bg-emerald-950 text-emerald-300 border-emerald-700/60',
      icon: MessageSquare,
      description:
        'A 3-stage agent pipeline: Agronomic Advisory Agent generates recommendations, Biophysical Simulation Agent verifies moisture/soil physics against APSIM/DSSAT models, and Plain-Language Synthesis Agent outputs actionable local-dialect steps.',
      highlights: ['Biophysical safety checks', 'NPK & moisture sensor telemetry', 'Episodic seasonal memory'],
    },
    {
      id: 'diagnosis',
      tab: 'diagnosis' as NavigationTab,
      title: 'Multimodal Crop Vision & Escalation',
      badge: 'Live Multimodal AI',
      badgeColor: 'bg-emerald-950 text-emerald-300 border-emerald-700/60',
      icon: Camera,
      description:
        'Analyzes in-field smartphone photos for foliar pathogens, pests, and nutrient stress. Automatically escalates ambiguous diagnoses (<70% confidence) to regional KVK agronomists for Human-in-the-Loop triage.',
      highlights: ['Calibrated confidence scoring', 'In-field pocket lens guidance', 'Instant extension escalation'],
    },
    {
      id: 'copilot',
      tab: 'copilot' as NavigationTab,
      title: 'Extension Copilot & Agri-Credit dMRV',
      badge: 'Copilot AI',
      badgeColor: 'bg-teal-950 text-teal-300 border-teal-700/60',
      icon: UserCheck,
      description:
        'Equips agricultural extension workers with AI RAG triage notes, microfinance credit scores (Cropin SmartRisk), and Sentinel-2 digital MRV carbon sequestration credit verification.',
      highlights: ['One-click ticket prescription', 'Soil carbon dMRV audit', 'Microfinance rating grades'],
    },
    {
      id: 'federated',
      tab: 'federated' as NavigationTab,
      title: 'Sovereign Federated Learning Commons',
      badge: 'Privacy Preserving',
      badgeColor: 'bg-stone-800 text-stone-300 border-stone-700',
      icon: Network,
      description:
        'Coordinates DP-FedAvg gradient training across sovereign national research silos (ICAR, Embrapa, ARC, CAAS) without raw farmer data ever crossing international borders.',
      highlights: ['Differential Privacy (ε=0.5)', 'Non-IID divergence audit', 'Cryptographic compliance proofs'],
    },
    {
      id: 'outbreak',
      tab: 'outbreak' as NavigationTab,
      title: 'Transboundary Outbreak Early-Warning',
      badge: 'Radar Sentinel',
      badgeColor: 'bg-amber-950 text-amber-300 border-amber-700/60',
      icon: AlertTriangle,
      description:
        'Spatial border clustering and 14-day spore dispersion vector models for airborne pathogens (Yellow Rust, Asian Soybean Rust, Desert Locust) across sensitive international borders.',
      highlights: ['Bilateral alert propagation', 'Spore density heatmaps', '14-day trajectory forecast'],
    },
  ];

  const stats = [
    { label: 'Smallholders Targeted', value: '500M+', sub: 'Across BRICS Corridors' },
    { label: 'Data Sovereignty', value: '100%', sub: 'Zero Raw Data Export' },
    { label: 'Sequential Multi-Agent', value: '3-Tier', sub: 'Advisory → Sim → Synthesis' },
    { label: 'Calibrated Triage', value: '<70%', sub: 'Auto Human-in-the-Loop' },
  ];

  return (
    <div className="space-y-10 pb-12 animate-in fade-in duration-300">
      {/* OVERVIEW SECTIONS NAVIGATION STRIP WITH VISIBLE SCROLLBAR */}
      <div className="bg-stone-900/90 border border-stone-800 rounded-2xl p-3 sm:p-4 shadow-lg space-y-2">
        <div className="flex items-center justify-between text-xs text-stone-300">
          <div className="flex items-center gap-2 font-bold text-white">
            <Compass className="w-4 h-4 text-emerald-400" />
            <span>Overview &amp; Platform Sections Navigator</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-stone-500 hidden sm:inline">
              Scroll horizontally to access all sections &amp; modules
            </span>
            <button
              type="button"
              onClick={() => scrollContainer(overviewNavRef, 'left')}
              title="Scroll overview sections left"
              aria-label="Scroll overview sections left"
              className="p-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white border border-stone-700 transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => scrollContainer(overviewNavRef, 'right')}
              title="Scroll overview sections right"
              aria-label="Scroll overview sections right"
              className="p-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white border border-stone-700 transition-colors"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Scrollable Container with Visible Scrollbar Just Below */}
        <div
          ref={overviewNavRef}
          role="navigation"
          aria-label="Overview Section Links"
          className="section-scrollbar flex items-center gap-2 overflow-x-auto pb-2.5 pt-1"
        >
          {overviewSections.map((sec) => {
            const Icon = sec.icon;
            return (
              <button
                key={sec.id}
                type="button"
                onClick={() => scrollToSection(sec.id, sec.isAction)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all shrink-0 shadow-sm ${
                  sec.isAction
                    ? 'bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-700/60 text-emerald-200 hover:text-white'
                    : 'bg-stone-950/90 hover:bg-stone-800 border border-stone-800 text-stone-300 hover:text-white'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${sec.isAction ? 'text-emerald-400' : 'text-stone-400'}`} />
                <span>{sec.label}</span>
                {sec.isAction && <span className="text-[9px] px-1 py-0.2 rounded bg-emerald-900 text-emerald-300">Live</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Hero Section */}
      <section id="hero-section" className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-stone-900 via-stone-900 to-stone-950 border border-stone-800 p-6 sm:p-10 lg:p-12 shadow-2xl">
        {/* Subtle Decorative Elements */}
        <div className="absolute top-0 right-0 -mr-24 -mt-24 w-96 h-96 rounded-full bg-emerald-600/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-24 -mb-24 w-96 h-96 rounded-full bg-teal-600/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-4xl space-y-6">
          {/* Top Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-950/80 border border-emerald-700/50 text-emerald-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>Sovereign AI Infrastructure for Global South Agriculture</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          </div>

          {/* Main Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white font-serif leading-[1.15]">
            Empowering 500 Million Smallholders with{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-200">
              Sovereign Multi-Agent AI
            </span>
          </h1>

          {/* Subheading */}
          <p className="text-base sm:text-lg text-stone-300 max-w-3xl leading-relaxed">
            BRICS AgriNet unifies in-situ telemetry, sequential Gemini 3.7 Flash multi-agent agronomy,
            multimodal foliar pathogen diagnostics, and privacy-preserving federated commons across
            India, Brazil, South Africa, China, Egypt, and Ethiopia.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => onNavigate('advisory')}
              className="px-6 py-3.5 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white font-semibold text-sm rounded-xl shadow-lg hover:shadow-emerald-900/30 transition-all flex items-center gap-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-400"
            >
              <span>Launch Farmer Advisory</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => onNavigate('diagnosis')}
              className="px-5 py-3.5 bg-stone-800/90 hover:bg-stone-700 border border-stone-700 text-stone-100 font-semibold text-sm rounded-xl transition-all flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-emerald-400"
            >
              <Camera className="w-4 h-4 text-emerald-400" />
              <span>Diagnose Plant Photo</span>
            </button>

            {!currentFarmer ? (
              <button
                type="button"
                onClick={onOpenAuth}
                className="px-5 py-3.5 bg-emerald-950/70 hover:bg-emerald-900 border border-emerald-600/50 text-emerald-200 font-semibold text-sm rounded-xl transition-all flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-emerald-400"
              >
                <LogIn className="w-4 h-4 text-emerald-400" />
                <span>Farmer Sign In (1-Click Demo)</span>
              </button>
            ) : (
              <div className="flex items-center gap-2.5 px-4 py-2.5 bg-stone-800/70 border border-stone-700 rounded-xl text-xs text-stone-300">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Signed in as <strong className="text-white">{currentFarmer.farmerName}</strong> ({currentFarmer.country})</span>
              </div>
            )}
          </div>
        </div>

        {/* Stats Row */}
        <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-4 mt-10 pt-8 border-t border-stone-800/80">
          {stats.map((stat, idx) => (
            <div key={idx} className="space-y-1">
              <div className="text-2xl sm:text-3xl font-bold text-white tracking-tight font-serif">
                {stat.value}
              </div>
              <div className="text-xs font-semibold text-stone-200">{stat.label}</div>
              <div className="text-[11px] text-stone-400">{stat.sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Core Capabilities Bento Grid with Scrollbar */}
      <section id="capabilities-section" className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
              Autonomous Sovereign Agents
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white font-serif mt-1">
              Engineered for Smallholder Resilience
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-stone-400 hidden sm:inline">
              Scroll across all 5 autonomous agent capabilities
            </span>
            <button
              type="button"
              onClick={() => scrollContainer(capabilitiesScrollRef, 'left')}
              title="Scroll capabilities left"
              aria-label="Scroll capabilities left"
              className="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white border border-stone-700"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => scrollContainer(capabilitiesScrollRef, 'right')}
              title="Scroll capabilities right"
              aria-label="Scroll capabilities right"
              className="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white border border-stone-700"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Capabilities Row with Visible Scrollbar Just Below */}
        <div
          ref={capabilitiesScrollRef}
          role="region"
          aria-label="Core Agent Capabilities List"
          className="section-scrollbar flex gap-4 overflow-x-auto pb-3 pt-1"
        >
          {capabilities.map((cap) => {
            const Icon = cap.icon;
            return (
              <div
                key={cap.id}
                className="w-80 sm:w-96 shrink-0 bg-stone-900/90 border border-stone-800 rounded-2xl p-6 flex flex-col justify-between hover:border-emerald-700/60 hover:bg-stone-900 transition-all group shadow-md"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-emerald-950 border border-emerald-800/60 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${cap.badgeColor}`}>
                      {cap.badge}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-white group-hover:text-emerald-300 transition-colors">
                      {cap.title}
                    </h3>
                    <p className="text-xs text-stone-400 mt-2 leading-relaxed min-h-[4rem]">
                      {cap.description}
                    </p>
                  </div>

                  <div className="space-y-1.5 pt-2">
                    {cap.highlights.map((h, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-stone-300">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>{h}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-5 mt-4 border-t border-stone-800/80">
                  <button
                    type="button"
                    onClick={() => onNavigate(cap.tab)}
                    className="w-full py-2 px-3 bg-stone-950 hover:bg-emerald-950/60 border border-stone-800 hover:border-emerald-700/50 rounded-xl text-xs font-semibold text-stone-300 hover:text-emerald-300 transition-all flex items-center justify-center gap-1.5 group/btn"
                  >
                    <span>Open {cap.title.split(' ')[0]} Module</span>
                    <ChevronRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Interactive Agricultural Corridors Showcase with Visible Scrollbar */}
      <section id="plots-section" className="bg-stone-900 border border-stone-800 rounded-3xl p-6 sm:p-8 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                Live In-Situ Telemetry Corridors
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white font-serif mt-1">
              Active BRICS Member Test Plots ({plots.length} Corridors)
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-stone-400 hidden sm:inline">
              Scroll horizontally to view all regional test plots
            </span>
            <button
              type="button"
              onClick={() => scrollContainer(plotsScrollRef, 'left')}
              title="Scroll plots left"
              aria-label="Scroll plots left"
              className="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white border border-stone-700"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => scrollContainer(plotsScrollRef, 'right')}
              title="Scroll plots right"
              aria-label="Scroll plots right"
              className="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white border border-stone-700"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Test Plots Row with Visible Emerald Scrollbar Just Below */}
        <div
          ref={plotsScrollRef}
          role="region"
          aria-label="BRICS Member Plots Carousel"
          className="section-scrollbar flex gap-3.5 overflow-x-auto pb-3 pt-1"
        >
          {plots.map((plot) => (
            <button
              key={plot.id}
              type="button"
              onClick={() => {
                onSelectPlot(plot);
                onNavigate('advisory');
              }}
              className="w-72 sm:w-80 shrink-0 p-4 rounded-xl bg-stone-950/80 border border-stone-800 hover:border-emerald-600/70 text-left transition-all hover:bg-stone-950 group flex flex-col justify-between shadow-md"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xl">{plot.flag}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-stone-800 text-stone-300 border border-stone-700">
                    {plot.country}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-white mt-2 group-hover:text-emerald-300 transition-colors">
                  {plot.name}
                </h4>
                <p className="text-xs text-stone-400 mt-0.5">
                  {plot.crop} • {plot.region}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-stone-800/80 grid grid-cols-3 gap-2 text-center text-[10px]">
                <div className="bg-stone-900 rounded p-1.5 border border-stone-800">
                  <div className="text-stone-500">Moisture</div>
                  <div className="font-bold text-emerald-400">{plot.soilMoisture}%</div>
                </div>
                <div className="bg-stone-900 rounded p-1.5 border border-stone-800">
                  <div className="text-stone-500">Soil pH</div>
                  <div className="font-bold text-stone-200">{plot.soilPH}</div>
                </div>
                <div className="bg-stone-900 rounded p-1.5 border border-stone-800">
                  <div className="text-stone-500">NDVI</div>
                  <div className="font-bold text-teal-400">{plot.ndviCurrent}</div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Sovereign Governance & Security Callout */}
      <section id="sovereignty-section" className="rounded-3xl bg-gradient-to-r from-emerald-950/70 via-stone-900 to-stone-900 border border-emerald-800/40 p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
            <Lock className="w-4 h-4" />
            <span>National Data Sovereignty Architecture</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-white font-serif">
            Zero-Leakage Federated Agronomy
          </h3>
          <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
            Raw farmer data, soil sensor telemetry, and crop imagery remain strictly inside national borders under the custody of ICAR (India), Embrapa (Brazil), ARC (South Africa), CAAS (China), and ARC (Egypt).
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => onNavigate('architecture')}
            className="w-full sm:w-auto px-5 py-3 bg-stone-800 hover:bg-stone-700 text-stone-100 font-semibold text-xs rounded-xl border border-stone-700 transition-all flex items-center justify-center gap-2"
          >
            <Database className="w-4 h-4 text-emerald-400" />
            <span>View Architecture Spec</span>
          </button>
          <button
            type="button"
            onClick={onOpenAuth}
            className="w-full sm:w-auto px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
          >
            <LogIn className="w-4 h-4" />
            <span>Sign In as Smallholder</span>
          </button>
        </div>
      </section>
    </div>
  );
}
