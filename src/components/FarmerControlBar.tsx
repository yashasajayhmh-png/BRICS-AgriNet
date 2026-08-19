import React, { useState, useRef, useEffect } from 'react';
import { NavigationTab, PlotTelemetry, FarmerProfile } from '../types';
import { BRICS_PLOTS } from '../data/mockData';
import {
  Search,
  Sprout,
  MessageSquare,
  Camera,
  UserCheck,
  Network,
  AlertTriangle,
  Info,
  MapPin,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Droplets,
  Sliders,
  Check,
  User,
  LogIn,
  Layers,
  LayoutDashboard,
  CloudRain,
  RotateCcw,
  Gauge,
  X,
} from 'lucide-react';

interface FarmerControlBarProps {
  activeTab: NavigationTab;
  setActiveTab: (tab: NavigationTab) => void;
  currentFarmer: FarmerProfile | null;
  onOpenAuth: () => void;
  plots: PlotTelemetry[];
  selectedPlot: PlotTelemetry;
  setSelectedPlot: (plot: PlotTelemetry) => void;
  onOpenSearch: () => void;
}

export function FarmerControlBar({
  activeTab,
  setActiveTab,
  currentFarmer,
  onOpenAuth,
  plots,
  selectedPlot,
  setSelectedPlot,
  onOpenSearch,
}: FarmerControlBarProps) {
  const [isPlotDropdownOpen, setIsPlotDropdownOpen] = useState(false);
  const [isSliderDrawerOpen, setIsSliderDrawerOpen] = useState(false);
  const [plotFilter, setPlotFilter] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const sliderRef = useRef<HTMLDivElement>(null);
  const tabsScrollRef = useRef<HTMLDivElement>(null);

  // Close popovers on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsPlotDropdownOpen(false);
      }
      if (sliderRef.current && !sliderRef.current.contains(event.target as Node)) {
        setIsSliderDrawerOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleScrollTabs = (direction: 'left' | 'right') => {
    if (tabsScrollRef.current) {
      const scrollAmount = 240;
      tabsScrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  const handleSliderUpdate = (updates: Partial<PlotTelemetry>) => {
    setSelectedPlot({
      ...selectedPlot,
      ...updates,
    });
  };

  const handleResetPlotDefaults = () => {
    const original = BRICS_PLOTS.find((p) => p.id === selectedPlot.id);
    if (original) {
      setSelectedPlot({ ...original });
    }
  };

  const dashboards: {
    id: NavigationTab;
    label: string;
    shortLabel: string;
    icon: any;
    badge?: string;
    badgeColor?: string;
  }[] = [
    {
      id: 'landing',
      label: 'Platform Overview',
      shortLabel: 'Overview',
      icon: LayoutDashboard,
    },
    {
      id: 'advisory',
      label: 'Farmer Advisory',
      shortLabel: 'Advisory',
      icon: MessageSquare,
      badge: 'Gemini 3.7',
      badgeColor: 'bg-emerald-950 text-emerald-300 border-emerald-700/60',
    },
    {
      id: 'diagnosis',
      label: 'Crop Diagnosis',
      shortLabel: 'Diagnosis',
      icon: Camera,
      badge: 'Multimodal',
      badgeColor: 'bg-emerald-950 text-emerald-300 border-emerald-700/60',
    },
    {
      id: 'satellite_soil',
      label: 'Satellite & Soil',
      shortLabel: 'Satellite',
      icon: Sprout,
      badge: 'Sentinel-2',
      badgeColor: 'bg-emerald-950 text-emerald-300 border-emerald-700/60',
    },
    {
      id: 'farm_profile',
      label: 'Farm Mapping & GeoJSON',
      shortLabel: 'My Farm',
      icon: MapPin,
      badge: 'GPS',
      badgeColor: 'bg-teal-950 text-teal-300 border-teal-700/60',
    },
    {
      id: 'copilot',
      label: 'Extension Copilot',
      shortLabel: 'Copilot',
      icon: UserCheck,
      badge: 'dMRV',
      badgeColor: 'bg-teal-950 text-teal-300 border-teal-700/60',
    },
    {
      id: 'fpo_marketplace',
      label: 'FPO & Marketplace',
      shortLabel: 'Market',
      icon: Sparkles,
      badge: 'Hub',
      badgeColor: 'bg-amber-950 text-amber-300 border-amber-700/60',
    },
    {
      id: 'federated',
      label: 'Federated Commons',
      shortLabel: 'Federated',
      icon: Network,
      badge: 'ε=0.5',
      badgeColor: 'bg-stone-800 text-stone-300 border-stone-700',
    },
    {
      id: 'outbreak',
      label: 'Outbreak Radar',
      shortLabel: 'Outbreak',
      icon: AlertTriangle,
      badge: '14-Day',
      badgeColor: 'bg-amber-950 text-amber-300 border-amber-700/60',
    },
    {
      id: 'governance_api',
      label: 'Open API & Standards',
      shortLabel: 'API & Standards',
      icon: Layers,
      badge: 'REST',
      badgeColor: 'bg-indigo-950 text-indigo-300 border-indigo-700/60',
    },
    {
      id: 'knowledge',
      label: 'Knowledge & Training',
      shortLabel: 'Guides',
      icon: Info,
      badge: 'Agro-Wiki',
      badgeColor: 'bg-teal-950 text-teal-300 border-teal-700/60',
    },
    {
      id: 'architecture',
      label: 'System Specs',
      shortLabel: 'Specs',
      icon: Info,
    },
  ];

  const filteredPlots = plots.filter((p) => {
    if (!plotFilter) return true;
    const term = plotFilter.toLowerCase();
    return (
      p.name.toLowerCase().includes(term) ||
      p.country.toLowerCase().includes(term) ||
      p.region.toLowerCase().includes(term) ||
      p.crop.toLowerCase().includes(term)
    );
  });

  return (
    <div className="bg-stone-900 border border-stone-800/90 rounded-2xl p-3 sm:p-4 mb-6 shadow-lg space-y-3.5">
      {/* Top Row: Farmer Profile & Active Plot & Quick Search */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Left: Farmer Profile Status & Quick Switch */}
        <div className="flex items-center gap-3">
          {currentFarmer ? (
            <div className="flex items-center gap-3 bg-stone-950/80 border border-stone-800 rounded-xl px-3 py-2">
              <div className="w-10 h-10 rounded-lg bg-stone-800 border border-stone-700 flex items-center justify-center text-xl shrink-0 overflow-hidden shadow-inner">
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

              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-bold text-white truncate">
                    {currentFarmer.farmerName}
                  </span>
                  <span className="text-xs">{currentFarmer.flag}</span>
                  <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/50 shrink-0">
                    {currentFarmer.role === 'extension_officer' ? 'Extension Agronomist' : 'Smallholder'}
                  </span>
                </div>
                <div className="text-[11px] text-stone-400 truncate flex items-center gap-2">
                  <span>{currentFarmer.region}</span>
                  <span className="text-stone-600">•</span>
                  <span className="text-emerald-400 font-medium">{currentFarmer.cropFocus}</span>
                  {currentFarmer.farmSizeHa > 0 && (
                    <>
                      <span className="text-stone-600">•</span>
                      <span>{currentFarmer.farmSizeHa} ha</span>
                    </>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={onOpenAuth}
                className="ml-2 text-xs font-semibold px-2.5 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 transition-colors shrink-0"
              >
                Switch
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2.5 bg-stone-950/80 border border-stone-800 rounded-xl px-3 py-2">
              <div className="w-9 h-9 rounded-lg bg-emerald-950 border border-emerald-800 flex items-center justify-center text-emerald-400">
                <User className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-white">Guest Session</div>
                <div className="text-[11px] text-stone-400">Sign in to save farm profile &amp; plot history</div>
              </div>
              <button
                type="button"
                onClick={onOpenAuth}
                className="ml-2 text-xs font-semibold px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition-all"
              >
                Sign In
              </button>
            </div>
          )}
        </div>

        {/* Center/Right: Plot Selector + Quick Search Button */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Active Plot Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setIsPlotDropdownOpen(!isPlotDropdownOpen)}
              className="flex items-center justify-between gap-2.5 px-3 py-2 bg-stone-950/80 hover:bg-stone-950 border border-stone-700/80 hover:border-emerald-600/60 rounded-xl text-left transition-all text-xs font-medium text-stone-200 min-w-[220px]"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-base">{selectedPlot.flag}</span>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-white truncate flex items-center gap-1.5">
                    <span>{selectedPlot.name}</span>
                    <span className="text-[10px] text-emerald-400 font-normal">({selectedPlot.crop})</span>
                  </div>
                  <div className="text-[10px] text-stone-400 flex items-center gap-1.5">
                    <Droplets className="w-3 h-3 text-cyan-400 shrink-0" />
                    <span>Moist: {selectedPlot.soilMoisture}%</span>
                    <span className="text-stone-600">•</span>
                    <span>pH: {selectedPlot.soilPH}</span>
                  </div>
                </div>
              </div>
              <ChevronDown className="w-4 h-4 text-stone-400 shrink-0" />
            </button>

            {/* Popover */}
            {isPlotDropdownOpen && (
              <div className="absolute right-0 sm:left-0 top-full mt-1.5 w-72 sm:w-80 bg-stone-900 border border-stone-700 rounded-xl shadow-2xl p-2 z-50 animate-in fade-in duration-100">
                <div className="px-2 py-1.5 border-b border-stone-800">
                  <input
                    type="text"
                    value={plotFilter}
                    onChange={(e) => setPlotFilter(e.target.value)}
                    placeholder="Filter BRICS plots..."
                    className="w-full bg-stone-950 border border-stone-700 rounded-lg px-2.5 py-1 text-xs text-stone-100 placeholder-stone-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div className="max-h-60 overflow-y-auto mt-1 space-y-1">
                  {filteredPlots.map((plot) => {
                    const isSelected = plot.id === selectedPlot.id;
                    return (
                      <button
                        key={plot.id}
                        type="button"
                        onClick={() => {
                          setSelectedPlot(plot);
                          setIsPlotDropdownOpen(false);
                        }}
                        className={`w-full p-2 rounded-lg text-left transition-all flex items-center justify-between text-xs ${
                          isSelected
                            ? 'bg-emerald-950 text-emerald-300 font-bold border border-emerald-800/60'
                            : 'hover:bg-stone-800 text-stone-300'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-base">{plot.flag}</span>
                          <div className="min-w-0">
                            <div className="truncate text-white font-medium">{plot.name}</div>
                            <div className="text-[10px] text-stone-400 truncate">
                              {plot.crop} • {plot.region}
                            </div>
                          </div>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-emerald-400 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Telemetry Sliders Quick Popover Button */}
          <div className="relative" ref={sliderRef}>
            <button
              type="button"
              onClick={() => setIsSliderDrawerOpen(!isSliderDrawerOpen)}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all border shadow-sm ${
                isSliderDrawerOpen
                  ? 'bg-emerald-950 text-emerald-200 border-emerald-500 ring-1 ring-emerald-400/50'
                  : 'bg-stone-950/80 hover:bg-stone-950 text-stone-300 border-stone-700/80 hover:border-emerald-600/60'
              }`}
              title="Open Environmental Simulation Sliders"
            >
              <Sliders className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Telemetry Sliders</span>
              <span className="sm:hidden">Sliders</span>
            </button>

            {/* Sliders Popover */}
            {isSliderDrawerOpen && (
              <div className="absolute right-0 top-full mt-1.5 w-80 sm:w-96 bg-stone-900 border border-stone-700 rounded-2xl shadow-2xl p-4 z-50 animate-in fade-in duration-100 space-y-3.5">
                <div className="flex items-center justify-between pb-2 border-b border-stone-800">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                    <Sliders className="w-4 h-4 text-emerald-400" />
                    <span>Plot What-If Sliders ({selectedPlot.flag} {selectedPlot.crop})</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={handleResetPlotDefaults}
                      className="text-[10px] px-2 py-0.5 rounded bg-stone-800 hover:bg-stone-700 text-stone-300 border border-stone-700"
                    >
                      Reset
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsSliderDrawerOpen(false)}
                      className="p-1 text-stone-400 hover:text-stone-200 rounded"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="space-y-3 text-xs">
                  {/* Slider 1: Soil Moisture */}
                  <div className="space-y-1 bg-stone-950/60 p-2.5 rounded-xl border border-stone-800">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-stone-300 flex items-center gap-1">
                        <Droplets className="w-3.5 h-3.5 text-blue-400" />
                        <span>Soil Moisture</span>
                      </span>
                      <span className="font-mono font-bold text-white">{selectedPlot.soilMoisture}%</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="85"
                      step="1"
                      value={selectedPlot.soilMoisture}
                      onChange={(e) => handleSliderUpdate({ soilMoisture: Number(e.target.value) })}
                      aria-label="Adjust Soil Moisture"
                      className="w-full h-1.5 bg-stone-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                    />
                    <div className="flex justify-between text-[10px] text-stone-500">
                      <span>10% (Dry)</span>
                      <span className={selectedPlot.soilMoisture < 35 ? 'text-amber-400' : 'text-emerald-400'}>
                        {selectedPlot.soilMoisture < 35 ? 'Deficit' : 'Optimal'}
                      </span>
                      <span>85% (Wet)</span>
                    </div>
                  </div>

                  {/* Slider 2: Rain Forecast */}
                  <div className="space-y-1 bg-stone-950/60 p-2.5 rounded-xl border border-stone-800">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-stone-300 flex items-center gap-1">
                        <CloudRain className="w-3.5 h-3.5 text-cyan-400" />
                        <span>7-Day Rain Forecast</span>
                      </span>
                      <span className="font-mono font-bold text-white">{selectedPlot.rainfallForecast7d} mm</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="1"
                      value={selectedPlot.rainfallForecast7d}
                      onChange={(e) => handleSliderUpdate({ rainfallForecast7d: Number(e.target.value) })}
                      aria-label="Adjust Rainfall Forecast"
                      className="w-full h-1.5 bg-stone-700 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                    />
                    <div className="flex justify-between text-[10px] text-stone-500">
                      <span>0 mm</span>
                      <span className={selectedPlot.rainfallForecast7d > 45 ? 'text-rose-400' : 'text-emerald-400'}>
                        {selectedPlot.rainfallForecast7d > 45 ? 'Heavy Leaching Risk' : 'Normal'}
                      </span>
                      <span>100 mm</span>
                    </div>
                  </div>

                  {/* Slider 3: Nitrogen */}
                  <div className="space-y-1 bg-stone-950/60 p-2.5 rounded-xl border border-stone-800">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-stone-300 flex items-center gap-1">
                        <Gauge className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Nitrogen (N)</span>
                      </span>
                      <span className="font-mono font-bold text-white">{selectedPlot.nitrogen} kg/ha</span>
                    </div>
                    <input
                      type="range"
                      min="30"
                      max="280"
                      step="5"
                      value={selectedPlot.nitrogen}
                      onChange={(e) => handleSliderUpdate({ nitrogen: Number(e.target.value) })}
                      aria-label="Adjust Nitrogen"
                      className="w-full h-1.5 bg-stone-700 rounded-lg appearance-none cursor-pointer accent-emerald-400"
                    />
                    <div className="flex justify-between text-[10px] text-stone-500">
                      <span>30 (Low)</span>
                      <span className="text-emerald-400">Nutrient Status</span>
                      <span>280 kg/ha</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Quick Search Trigger Bar */}
          <button
            type="button"
            onClick={onOpenSearch}
            className="flex items-center gap-2.5 px-3.5 py-2 bg-stone-950/80 hover:bg-stone-950 border border-stone-700/80 hover:border-emerald-600/70 rounded-xl text-xs text-stone-400 hover:text-stone-200 transition-all shadow-inner group"
            title="Open Global Search (Ctrl+K)"
          >
            <Search className="w-3.5 h-3.5 text-emerald-400 group-hover:scale-110 transition-transform" />
            <span className="hidden sm:inline">Search dashboards, plots, queries...</span>
            <span className="sm:hidden">Search...</span>
            <kbd className="hidden md:inline-block font-mono text-[10px] px-1.5 py-0.5 rounded bg-stone-800 text-stone-400 border border-stone-700">
              ⌘K
            </kbd>
          </button>
        </div>
      </div>

      {/* Bottom Row: Comfortable Visual Dashboard Selector Pills with Visible Scrollbar */}
      <div className="pt-2.5 border-t border-stone-800/80 space-y-1.5">
        <div className="flex items-center justify-between text-[11px] text-stone-400">
          <span className="font-bold text-stone-300 uppercase tracking-wider flex items-center gap-1.5">
            <LayoutDashboard className="w-3.5 h-3.5 text-emerald-400" />
            <span>Active Dashboard Modules:</span>
          </span>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-stone-500 hidden sm:inline">
              Scroll horizontally or click to switch section
            </span>
            <button
              type="button"
              onClick={() => handleScrollTabs('left')}
              title="Scroll left"
              aria-label="Scroll dashboard sections left"
              className="p-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white border border-stone-700 transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => handleScrollTabs('right')}
              title="Scroll right"
              aria-label="Scroll dashboard sections right"
              className="p-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white border border-stone-700 transition-colors"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Scrollable Container with Visible Emerald Scrollbar Just Below */}
        <div
          ref={tabsScrollRef}
          role="tablist"
          aria-label="BRICS AgriNet Dashboard Modules"
          className="section-scrollbar flex items-center gap-2.5 overflow-x-auto pb-2.5 pt-0.5"
        >
          {dashboards.map((dash) => {
            const Icon = dash.icon;
            const isActive = activeTab === dash.id;

            return (
              <button
                key={dash.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveTab(dash.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all group shrink-0 shadow-sm ${
                  isActive
                    ? 'bg-gradient-to-r from-emerald-700 to-teal-800 text-white shadow-md ring-1 ring-emerald-400/50'
                    : 'bg-stone-950/80 hover:bg-stone-800 text-stone-300 hover:text-white border border-stone-800 hover:border-stone-700'
                }`}
              >
                <Icon
                  className={`w-3.5 h-3.5 ${
                    isActive ? 'text-emerald-200' : 'text-stone-400 group-hover:text-emerald-400'
                  }`}
                />
                <span>{dash.label}</span>
                {dash.badge && (
                  <span
                    className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full border ${
                      isActive ? 'bg-emerald-950 text-emerald-200 border-emerald-400/60' : dash.badgeColor
                    }`}
                  >
                    {dash.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
