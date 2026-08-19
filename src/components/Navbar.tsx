import React, { KeyboardEvent } from 'react';
import { NavigationTab, FarmerProfile } from '../types';
import {
  Sprout,
  MessageSquare,
  Camera,
  Network,
  AlertTriangle,
  Info,
  Radio,
  UserCheck,
  Globe,
  User,
  LogIn,
  LogOut,
  Sparkles,
  LayoutDashboard,
  Search,
} from 'lucide-react';

interface NavbarProps {
  activeTab: NavigationTab;
  setActiveTab: (tab: NavigationTab) => void;
  currentFarmer: FarmerProfile | null;
  onOpenAuth: () => void;
  onSignOut: () => void;
  onOpenSearch: () => void;
}

export function Navbar({
  activeTab,
  setActiveTab,
  currentFarmer,
  onOpenAuth,
  onSignOut,
  onOpenSearch,
}: NavbarProps) {
  const navItems: {
    id: NavigationTab;
    label: string;
    icon: any;
    badgeText?: string;
    badgeType?: 'live' | 'copilot' | 'sim';
  }[] = [
    { id: 'landing', label: 'Overview', icon: LayoutDashboard },
    { id: 'advisory', label: 'Farmer Advisory', icon: MessageSquare, badgeText: 'LIVE AI', badgeType: 'live' },
    { id: 'diagnosis', label: 'Crop Diagnosis', icon: Camera, badgeText: 'LIVE AI', badgeType: 'live' },
    { id: 'satellite_soil', label: 'Satellite & Soil', icon: Sprout, badgeText: 'SENTINEL-2', badgeType: 'live' },
    { id: 'farm_profile', label: 'Farm Profile', icon: Globe, badgeText: 'GEOJSON', badgeType: 'copilot' },
    { id: 'copilot', label: 'Extension Copilot', icon: UserCheck, badgeText: 'COPILOT', badgeType: 'copilot' },
    { id: 'fpo_marketplace', label: 'FPO & Marketplace', icon: Sparkles, badgeText: 'HUB', badgeType: 'copilot' },
    { id: 'federated', label: 'Federated Commons', icon: Network, badgeText: 'SIMULATED', badgeType: 'sim' },
    { id: 'outbreak', label: 'Outbreak Early-Warning', icon: AlertTriangle, badgeText: 'RADAR', badgeType: 'sim' },
    { id: 'governance_api', label: 'Open API & Standards', icon: Radio, badgeText: 'STANDARDS', badgeType: 'sim' },
    { id: 'knowledge', label: 'Knowledge Base', icon: Info, badgeText: 'GUIDES', badgeType: 'sim' },
    { id: 'architecture', label: 'Architecture & Scope', icon: Info },
  ];

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const currentIndex = navItems.findIndex((item) => item.id === activeTab);
    if (currentIndex === -1) return;

    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      const nextIndex = (currentIndex + 1) % navItems.length;
      setActiveTab(navItems[nextIndex].id);
      document.getElementById(`nav-tab-${navItems[nextIndex].id}`)?.focus();
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      const prevIndex = (currentIndex - 1 + navItems.length) % navItems.length;
      setActiveTab(navItems[prevIndex].id);
      document.getElementById(`nav-tab-${navItems[prevIndex].id}`)?.focus();
    } else if (e.key === 'Home') {
      e.preventDefault();
      setActiveTab(navItems[0].id);
      document.getElementById(`nav-tab-${navItems[0].id}`)?.focus();
    } else if (e.key === 'End') {
      e.preventDefault();
      setActiveTab(navItems[navItems.length - 1].id);
      document.getElementById(`nav-tab-${navItems[navItems.length - 1].id}`)?.focus();
    }
  };

  return (
    <header role="banner" className="sticky top-0 z-50 bg-stone-900 text-stone-100 border-b border-stone-800 shadow-md">
      {/* Top Banner with Pitch & Honest Scope Note */}
      <aside aria-label="Application Status and Scope Notice" className="bg-emerald-950/90 border-b border-emerald-800/40 px-4 py-1.5 text-xs text-emerald-200 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 font-semibold px-2 py-0.5 rounded bg-emerald-800/60 text-emerald-100 text-[11px] border border-emerald-600/40">
            <Radio className="w-3 h-3 text-emerald-400 animate-pulse" aria-hidden="true" />
            <span>Phase 0 MVP Demo</span>
          </span>
          <span className="text-stone-300">
            Multi-Agent AI Farming Platform for BRICS Smallholder Farmers
          </span>
        </div>
        <div className="flex items-center gap-3 text-[11px] text-stone-300">
          <span className="inline-flex items-center gap-1 text-amber-300">
            <span className="w-2 h-2 rounded-full bg-amber-400 inline-block animate-ping" aria-hidden="true"></span>
            <span>Sequential Gemini 3.7 Flash Multi-Agent Pipeline (Live)</span>
          </span>
          <span className="hidden sm:inline text-stone-500" aria-hidden="true">•</span>
          <span className="hidden sm:inline text-stone-400">
            Simulated In-situ Soil/Satellite Telemetry
          </span>
        </div>
      </aside>

      {/* Main Navigation Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo & Title */}
          <button
            type="button"
            onClick={() => setActiveTab('landing')}
            aria-label="BRICS AgriNet Home - Go to Overview"
            className="flex items-center gap-3 text-left focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:rounded-lg p-1 shrink-0"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-800 flex items-center justify-center shadow-inner border border-emerald-500/30" aria-hidden="true">
              <Sprout className="w-6 h-6 text-emerald-100" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg tracking-tight text-white font-serif">
                  BRICS AgriNet
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 hidden sm:inline-block">
                  Global South
                </span>
              </div>
              <p className="text-xs text-stone-400 hidden sm:block">
                Federated Agronomy &amp; Biophysical AI Sentinel
              </p>
            </div>
          </button>

          {/* Nav Tabs */}
          <nav aria-label="Main Navigation" role="navigation" className="flex-1 overflow-hidden min-w-0">
            <div
              role="tablist"
              aria-label="Platform Views"
              onKeyDown={handleKeyDown}
              className="section-scrollbar flex space-x-1 sm:space-x-1.5 overflow-x-auto py-1"
            >
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                const accessibleLabel = `${item.label}${item.badgeText ? ` (${item.badgeText})` : ''}`;

                return (
                  <button
                    key={item.id}
                    id={`nav-tab-${item.id}`}
                    role="tab"
                    aria-selected={isActive}
                    aria-controls={`tabpanel-${item.id}`}
                    tabIndex={isActive ? 0 : -1}
                    aria-label={accessibleLabel}
                    onClick={() => setActiveTab(item.id)}
                    className={`flex items-center gap-1.5 px-2 sm:px-2.5 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-emerald-400 ${
                      isActive
                        ? 'bg-emerald-700/90 text-white shadow-sm ring-1 ring-emerald-500/50'
                        : 'text-stone-300 hover:bg-stone-800 hover:text-white'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-300' : 'text-stone-400'}`} aria-hidden="true" />
                    <span>{item.label}</span>
                    {item.badgeType === 'live' && (
                      <span className="hidden lg:inline-block text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-700/60" aria-hidden="true">
                        LIVE
                      </span>
                    )}
                    {item.badgeType === 'copilot' && (
                      <span className="hidden lg:inline-block text-[9px] font-bold px-1.5 py-0.5 rounded bg-teal-950 text-teal-300 border border-teal-700/60" aria-hidden="true">
                        COPILOT
                      </span>
                    )}
                    {item.badgeType === 'sim' && (
                      <span className="hidden lg:inline-block text-[9px] font-bold px-1.5 py-0.5 rounded bg-stone-800 text-stone-400 border border-stone-700" aria-hidden="true">
                        SIM
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </nav>

          {/* Search Button & Farmer Authentication Profile Control */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={onOpenSearch}
              title="Search Dashboards & Telemetry (Ctrl+K)"
              aria-label="Global Search"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-stone-950 hover:bg-stone-800 border border-stone-800 text-stone-300 hover:text-white text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-400"
            >
              <Search className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden xl:inline">Search</span>
              <kbd className="hidden md:inline-block font-mono text-[9px] px-1 py-0.5 rounded bg-stone-800 text-stone-400 border border-stone-700">
                ⌘K
              </kbd>
            </button>

            {currentFarmer ? (
              <div className="flex items-center gap-2 bg-stone-950 border border-stone-800 rounded-xl px-2.5 py-1.5">
                <button
                  type="button"
                  onClick={onOpenAuth}
                  className="flex items-center gap-2 text-left hover:opacity-80 transition-opacity focus:outline-none focus:ring-1 focus:ring-emerald-400 rounded-lg p-0.5"
                  title="Switch Farmer Profile"
                >
                  <div className="w-7 h-7 rounded-lg bg-stone-800 border border-stone-700 flex items-center justify-center text-sm overflow-hidden">
                    {currentFarmer.avatarUrl ? (
                      <img
                        src={currentFarmer.avatarUrl}
                        alt={currentFarmer.farmerName}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <span>{currentFarmer.flag}</span>
                    )}
                  </div>
                  <div className="hidden md:block leading-tight">
                    <div className="text-xs font-bold text-white flex items-center gap-1">
                      <span>{currentFarmer.farmerName}</span>
                      <span className="text-[11px]">{currentFarmer.flag}</span>
                    </div>
                    <div className="text-[10px] text-emerald-400">
                      {currentFarmer.role === 'extension_officer' ? 'Agronomist' : `${currentFarmer.cropFocus}`}
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={onSignOut}
                  title="Sign Out"
                  aria-label="Sign out of farmer account"
                  className="p-1 text-stone-400 hover:text-stone-200 hover:bg-stone-800 rounded-lg transition-colors focus:outline-none focus:ring-1 focus:ring-emerald-400"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={onOpenAuth}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-700/80 hover:bg-emerald-600 border border-emerald-500/40 text-white text-xs font-semibold shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-emerald-400"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Farmer Sign In</span>
                <span className="sm:hidden">Sign In</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

