import { NavigationTab } from '../types';
import {
  Sprout,
  MessageSquare,
  Camera,
  Network,
  AlertTriangle,
  Info,
  Radio,
  UserCheck,
} from 'lucide-react';

interface NavbarProps {
  activeTab: NavigationTab;
  setActiveTab: (tab: NavigationTab) => void;
}

export function Navbar({ activeTab, setActiveTab }: NavbarProps) {
  const navItems: {
    id: NavigationTab;
    label: string;
    icon: any;
    liveBadge?: boolean;
    simBadge?: boolean;
    triageBadge?: boolean;
  }[] = [
    { id: 'advisory', label: 'Farmer Advisory', icon: MessageSquare, liveBadge: true },
    { id: 'diagnosis', label: 'Crop Diagnosis', icon: Camera, liveBadge: true },
    { id: 'copilot', label: 'Extension Copilot', icon: UserCheck, triageBadge: true },
    { id: 'federated', label: 'Federated Commons', icon: Network, simBadge: true },
    { id: 'outbreak', label: 'Outbreak Early-Warning', icon: AlertTriangle, simBadge: true },
    { id: 'architecture', label: 'Architecture & Scope', icon: Info },
  ];

  return (
    <header className="sticky top-0 z-50 bg-stone-900 text-stone-100 border-b border-stone-800 shadow-md">
      {/* Top Banner with Pitch & Honest Scope Note */}
      <div className="bg-emerald-950/90 border-b border-emerald-800/40 px-4 py-1.5 text-xs text-emerald-200 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 font-semibold px-2 py-0.5 rounded bg-emerald-800/60 text-emerald-100 text-[11px] border border-emerald-600/40">
            <Radio className="w-3 h-3 text-emerald-400 animate-pulse" /> Phase 0 MVP Demo
          </span>
          <span className="text-stone-300">
            Multi-Agent AI Farming Platform for BRICS Smallholder Farmers
          </span>
        </div>
        <div className="flex items-center gap-3 text-[11px] text-stone-300">
          <span className="inline-flex items-center gap-1 text-amber-300">
            <span className="w-2 h-2 rounded-full bg-amber-400 inline-block animate-ping"></span>
            Sequential Gemini 3.7 Flash Multi-Agent Pipeline (Live)
          </span>
          <span className="hidden sm:inline text-stone-500">•</span>
          <span className="hidden sm:inline text-stone-400">
            Simulated In-situ Soil/Satellite Telemetry
          </span>
        </div>
      </div>

      {/* Main Navigation Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Title */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('advisory')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-800 flex items-center justify-center shadow-inner border border-emerald-500/30">
              <Sprout className="w-6 h-6 text-emerald-100" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg tracking-tight text-white font-serif">
                  BRICS AgriNet
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  Global South Alliance
                </span>
              </div>
              <p className="text-xs text-stone-400 hidden sm:block">
                Federated Agronomy &amp; Biophysical AI Sentinel
              </p>
            </div>
          </div>

          {/* Nav Tabs */}
          <nav className="flex space-x-1 sm:space-x-2 overflow-x-auto py-1 scrollbar-none">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-tab-${item.id}`}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-emerald-700/90 text-white shadow-sm ring-1 ring-emerald-500/50'
                      : 'text-stone-300 hover:bg-stone-800 hover:text-white'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-300' : 'text-stone-400'}`} />
                  <span>{item.label}</span>
                  {item.liveBadge && (
                    <span className="hidden md:inline-block text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 border border-emerald-700/60">
                      LIVE
                    </span>
                  )}
                  {item.triageBadge && (
                    <span className="hidden md:inline-block text-[9px] font-bold px-1.5 py-0.2 rounded bg-teal-950 text-teal-300 border border-teal-700/60">
                      COPILOT
                    </span>
                  )}
                  {item.simBadge && (
                    <span className="hidden md:inline-block text-[9px] font-bold px-1.5 py-0.2 rounded bg-stone-800 text-stone-400 border border-stone-700">
                      SIM
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
}
