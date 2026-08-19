import React, { KeyboardEvent } from 'react';
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
    badgeText?: string;
    badgeType?: 'live' | 'copilot' | 'sim';
  }[] = [
    { id: 'advisory', label: 'Farmer Advisory', icon: MessageSquare, badgeText: 'LIVE AI', badgeType: 'live' },
    { id: 'diagnosis', label: 'Crop Diagnosis', icon: Camera, badgeText: 'LIVE AI', badgeType: 'live' },
    { id: 'copilot', label: 'Extension Copilot', icon: UserCheck, badgeText: 'COPILOT', badgeType: 'copilot' },
    { id: 'federated', label: 'Federated Commons', icon: Network, badgeText: 'SIMULATED', badgeType: 'sim' },
    { id: 'outbreak', label: 'Outbreak Early-Warning', icon: AlertTriangle, badgeText: 'SIMULATED', badgeType: 'sim' },
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
        <div className="flex items-center justify-between h-16">
          {/* Logo & Title */}
          <button
            type="button"
            onClick={() => setActiveTab('advisory')}
            aria-label="BRICS AgriNet Home - Go to Farmer Advisory"
            className="flex items-center gap-3 text-left focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:rounded-lg p-1"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-800 flex items-center justify-center shadow-inner border border-emerald-500/30" aria-hidden="true">
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
          </button>

          {/* Nav Tabs */}
          <nav aria-label="Main Navigation" role="navigation">
            <div
              role="tablist"
              aria-label="Platform Views"
              onKeyDown={handleKeyDown}
              className="flex space-x-1 sm:space-x-2 overflow-x-auto py-1 scrollbar-none"
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
                    className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-emerald-400 ${
                      isActive
                        ? 'bg-emerald-700/90 text-white shadow-sm ring-1 ring-emerald-500/50'
                        : 'text-stone-300 hover:bg-stone-800 hover:text-white'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-300' : 'text-stone-400'}`} aria-hidden="true" />
                    <span>{item.label}</span>
                    {item.badgeType === 'live' && (
                      <span className="hidden md:inline-block text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-700/60" aria-hidden="true">
                        LIVE
                      </span>
                    )}
                    {item.badgeType === 'copilot' && (
                      <span className="hidden md:inline-block text-[9px] font-bold px-1.5 py-0.5 rounded bg-teal-950 text-teal-300 border border-teal-700/60" aria-hidden="true">
                        COPILOT
                      </span>
                    )}
                    {item.badgeType === 'sim' && (
                      <span className="hidden md:inline-block text-[9px] font-bold px-1.5 py-0.5 rounded bg-stone-800 text-stone-400 border border-stone-700" aria-hidden="true">
                        SIM
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}
