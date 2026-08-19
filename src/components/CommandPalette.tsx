import React, { useState, useEffect, useRef } from 'react';
import { NavigationTab, PlotTelemetry, FarmerProfile } from '../types';
import { SAMPLE_FARMER_QUERIES } from '../data/mockData';
import {
  Search,
  X,
  MessageSquare,
  Camera,
  UserCheck,
  Network,
  AlertTriangle,
  Info,
  LayoutDashboard,
  MapPin,
  HelpCircle,
  ArrowRight,
  Sparkles,
  Command,
  CheckCircle2,
  CornerDownLeft,
} from 'lucide-react';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tab: NavigationTab) => void;
  plots: PlotTelemetry[];
  onSelectPlot: (plot: PlotTelemetry) => void;
  onSelectQuery?: (queryText: string, plotId?: string) => void;
  currentFarmer: FarmerProfile | null;
  onOpenAuth: () => void;
}

export function CommandPalette({
  isOpen,
  onClose,
  onNavigate,
  plots,
  onSelectPlot,
  onSelectQuery,
  currentFarmer,
  onOpenAuth,
}: CommandPaletteProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<'all' | 'dashboards' | 'plots' | 'queries'>('all');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setSearchTerm('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Dashboards list
  const dashboardItems = [
    {
      id: 'landing',
      tab: 'landing' as NavigationTab,
      title: 'Platform Overview & Missions',
      desc: 'System architecture, Global South metrics, and sovereign AI vision',
      icon: LayoutDashboard,
      category: 'dashboards',
      keywords: 'home landing overview stats brics summary mission',
    },
    {
      id: 'advisory',
      tab: 'advisory' as NavigationTab,
      title: 'Sequential Farmer Advisory Hub',
      desc: '3-stage Gemini 3.7 Flash advisory with APSIM/DSSAT biophysical simulation checks',
      icon: MessageSquare,
      badge: 'Live Gemini',
      category: 'dashboards',
      keywords: 'advisory fertilizer irrigation weather wheat soil simulation gemini agronomy',
    },
    {
      id: 'diagnosis',
      tab: 'diagnosis' as NavigationTab,
      title: 'Multimodal Crop Vision & Pathogen Diagnosis',
      desc: 'Instant foliar disease scan with <70% calibrated Human-in-the-Loop escalation',
      icon: Camera,
      badge: 'Multimodal Vision',
      category: 'dashboards',
      keywords: 'camera photo diagnosis pest disease leaf yellow rust spot fungus vision triage',
    },
    {
      id: 'satellite_soil',
      tab: 'satellite_soil' as NavigationTab,
      title: 'Satellite Spectral & Soil Health Intelligence',
      desc: 'Sentinel-2 NDVI/NDRE, NPK micro-nutrients radar, 7-day weather alerts, and DSSAT yield prediction',
      icon: LayoutDashboard,
      badge: 'Sentinel-2',
      category: 'dashboards',
      keywords: 'satellite ndvi ndre soil npk zinc moisture weather dssat yield spectral sentinel',
    },
    {
      id: 'farm_profile',
      tab: 'farm_profile' as NavigationTab,
      title: 'My Farm Profile & Boundary Mapping',
      desc: 'Interactive GeoJSON parcel polygon mapper, offline cached advisories, and data consent',
      icon: MapPin,
      badge: 'GeoJSON',
      category: 'dashboards',
      keywords: 'farm field mapping polygon geojson offline cache consent privacy gps parcel',
    },
    {
      id: 'copilot',
      tab: 'copilot' as NavigationTab,
      title: 'Extension Officer Copilot & Agri-Credit dMRV',
      desc: 'Ticket management, RAG triage prescriptions, and Sentinel-2 carbon credit ratings',
      icon: UserCheck,
      badge: 'KVK Extension',
      category: 'dashboards',
      keywords: 'extension copilot ticket kisan kvk credit smartrisk dmrv carbon audit agronomist',
    },
    {
      id: 'fpo_marketplace',
      tab: 'fpo_marketplace' as NavigationTab,
      title: 'FPO Hub, Green Marketplace & Feedback Loop',
      desc: 'Cooperative grain pooling, bulk bio-input discounts, parametric insurance, and outcome confirmation',
      icon: Sparkles,
      badge: 'FPO Hub',
      category: 'dashboards',
      keywords: 'fpo cooperative marketplace buyer seed biofertilizer feedback rating insurance',
    },
    {
      id: 'federated',
      tab: 'federated' as NavigationTab,
      title: 'Sovereign Federated Learning Commons',
      badge: 'Privacy Commons',
      desc: 'DP-FedAvg model training across ICAR, Embrapa, ARC, and CAAS silos',
      icon: Network,
      category: 'dashboards',
      keywords: 'federated privacy dp-fedavg sovereign learning silos gradient epsilon non-iid',
    },
    {
      id: 'outbreak',
      tab: 'outbreak' as NavigationTab,
      title: 'Transboundary Outbreak Early-Warning Radar',
      badge: '14-Day Vector Forecast',
      desc: 'Spore flux modeling and bilateral border quarantine hazard mapping',
      icon: AlertTriangle,
      category: 'dashboards',
      keywords: 'outbreak spore rust locust radar warning border transboundary pest vector',
    },
    {
      id: 'governance_api',
      tab: 'governance_api' as NavigationTab,
      title: 'Open API Layer, Standards & Model Governance',
      badge: 'REST & ADAPT',
      desc: 'Interactive OpenAPI explorer, AgGateway schemas, SHA-256 model registry, and audit logs',
      icon: Command,
      category: 'dashboards',
      keywords: 'openapi rest adapt standard schema audit model drift connector governance',
    },
    {
      id: 'knowledge',
      tab: 'knowledge' as NavigationTab,
      title: 'Agronomy Knowledge Base & Field Training',
      badge: 'Multilingual',
      desc: 'Regenerative farming manuals, IPM checklists, and downloadable field action guides',
      icon: HelpCircle,
      category: 'dashboards',
      keywords: 'knowledge guide training manual pest biochar soil organic carbon checklist wiki',
    },
    {
      id: 'architecture',
      tab: 'architecture' as NavigationTab,
      title: 'Technical Architecture & Verification Specs',
      desc: 'Full stack specs, latency metrics, and mathematical DP proof documentation',
      icon: Info,
      category: 'dashboards',
      keywords: 'architecture latency benchmarks spec metrics documentation sqlite code',
    },
  ];

  // Plots list
  const plotItems = plots.map((p) => ({
    id: p.id,
    title: `${p.flag} ${p.name}`,
    desc: `${p.crop} in ${p.region}, ${p.country} • Moisture: ${p.soilMoisture}% • pH: ${p.soilPH}`,
    plot: p,
    icon: MapPin,
    category: 'plots',
    keywords: `${p.name} ${p.country} ${p.region} ${p.crop} plot soil telemetry`,
  }));

  // Agronomic Query templates
  const queryItems = SAMPLE_FARMER_QUERIES.map((q) => {
    const matchedPlot = plots.find((p) => p.id === q.plotId);
    return {
      id: q.id,
      title: q.label,
      desc: q.text,
      queryText: q.text,
      plotId: q.plotId,
      crop: matchedPlot?.crop || 'Crop',
      icon: HelpCircle,
      category: 'queries',
      keywords: `${q.label} ${q.text} ${matchedPlot?.crop || ''} ${matchedPlot?.name || ''} question advisory query`,
    };
  });

  // Combine and filter
  const allItems: any[] = [];

  if (activeCategory === 'all' || activeCategory === 'dashboards') {
    allItems.push(...dashboardItems);
  }
  if (activeCategory === 'all' || activeCategory === 'plots') {
    allItems.push(...plotItems);
  }
  if (activeCategory === 'all' || activeCategory === 'queries') {
    allItems.push(...queryItems);
  }

  const query = searchTerm.toLowerCase().trim();
  const filteredItems = allItems.filter((item) => {
    if (!query) return true;
    const titleMatch = item.title.toLowerCase().includes(query);
    const descMatch = item.desc?.toLowerCase().includes(query);
    const kwMatch = item.keywords?.toLowerCase().includes(query);
    return titleMatch || descMatch || kwMatch;
  });

  // Clamp selection
  useEffect(() => {
    setSelectedIndex(0);
  }, [searchTerm, activeCategory]);

  const handleSelectItem = (item: any) => {
    if (item.category === 'dashboards') {
      onNavigate(item.tab);
    } else if (item.category === 'plots') {
      onSelectPlot(item.plot);
      onNavigate('advisory');
    } else if (item.category === 'queries') {
      if (item.plotId) {
        const matchedPlot = plots.find((p) => p.id === item.plotId);
        if (matchedPlot) onSelectPlot(matchedPlot);
      }
      if (onSelectQuery) {
        onSelectQuery(item.queryText, item.plotId);
      }
      onNavigate('advisory');
    }
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredItems.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredItems.length) % Math.max(1, filteredItems.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredItems[selectedIndex]) {
        handleSelectItem(filteredItems[selectedIndex]);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="command-palette-title"
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="bg-stone-900 border border-stone-700/80 rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl flex flex-col max-h-[80vh] ring-1 ring-emerald-500/20"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Search Header Bar */}
        <div className="p-4 bg-stone-950 border-b border-stone-800 flex items-center gap-3">
          <Search className="w-5 h-5 text-emerald-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            id="command-palette-title"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search dashboards, plots, queries, or AI tools..."
            className="w-full bg-transparent text-stone-100 placeholder-stone-500 text-sm sm:text-base focus:outline-none"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              className="p-1 rounded text-stone-500 hover:text-stone-300 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <div className="hidden sm:flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded bg-stone-800 text-stone-400 border border-stone-700">
            <span>ESC</span>
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-1.5 px-4 py-2 bg-stone-950/60 border-b border-stone-800 overflow-x-auto text-xs scrollbar-none">
          <span className="text-[11px] text-stone-500 font-semibold mr-1 shrink-0">Filter:</span>
          {[
            { id: 'all', label: 'All Items' },
            { id: 'dashboards', label: 'Dashboards & Tools' },
            { id: 'plots', label: 'BRICS Plots' },
            { id: 'queries', label: 'Agronomic Queries' },
          ].map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategory(cat.id as any)}
              className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition-all ${
                activeCategory === cat.id
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-700/60 shadow-sm'
                  : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Results List */}
        <div className="p-2 overflow-y-auto space-y-1 divide-y divide-stone-800/40">
          {filteredItems.length === 0 ? (
            <div className="py-12 text-center text-stone-500 space-y-2">
              <Sparkles className="w-8 h-8 mx-auto text-stone-600" />
              <p className="text-sm font-medium">No results found for "{searchTerm}"</p>
              <p className="text-xs text-stone-600">
                Try searching for "advisory", "wheat", "Punjab", "photo", or "tickets"
              </p>
            </div>
          ) : (
            filteredItems.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              const Icon = item.icon;

              return (
                <button
                  key={`${item.category}-${item.id}`}
                  type="button"
                  onClick={() => handleSelectItem(item)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`w-full p-3 rounded-xl text-left transition-all flex items-start justify-between gap-3 group ${
                    isSelected
                      ? 'bg-emerald-950/60 text-white ring-1 ring-emerald-500/50'
                      : 'hover:bg-stone-800/60 text-stone-300'
                  }`}
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                        item.category === 'dashboards'
                          ? 'bg-emerald-900/40 text-emerald-400 border border-emerald-700/40'
                          : item.category === 'plots'
                          ? 'bg-teal-900/40 text-teal-400 border border-teal-700/40'
                          : 'bg-amber-900/40 text-amber-400 border border-amber-700/40'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>

                    <div className="min-w-0 space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors truncate">
                          {item.title}
                        </span>
                        {item.badge && (
                          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 border border-emerald-700/50 shrink-0">
                            {item.badge}
                          </span>
                        )}
                        <span className="text-[10px] text-stone-500 uppercase tracking-wider font-semibold">
                          {item.category}
                        </span>
                      </div>
                      <p className="text-xs text-stone-400 line-clamp-1">{item.desc}</p>
                    </div>
                  </div>

                  <div className="hidden sm:flex items-center gap-1 text-stone-500 group-hover:text-emerald-400 transition-colors shrink-0 mt-1">
                    <CornerDownLeft className="w-3.5 h-3.5" />
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Footer Shortcut Guide */}
        <div className="px-4 py-2.5 bg-stone-950 border-t border-stone-800 flex items-center justify-between text-[11px] text-stone-500">
          <div className="flex items-center gap-3">
            <span>
              <strong className="text-stone-400">↑↓</strong> Navigate
            </span>
            <span>
              <strong className="text-stone-400">↵</strong> Select &amp; Open
            </span>
            <span>
              <strong className="text-stone-400">ESC</strong> Close
            </span>
          </div>

          {currentFarmer ? (
            <span className="text-emerald-400 flex items-center gap-1">
              <span>{currentFarmer.flag}</span>
              <span>{currentFarmer.farmerName}</span>
            </span>
          ) : (
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenAuth();
              }}
              className="text-emerald-400 hover:underline"
            >
              Sign In as Farmer
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
