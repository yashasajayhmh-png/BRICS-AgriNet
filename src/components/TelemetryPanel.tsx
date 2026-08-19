import React, { useState } from 'react';
import { PlotTelemetry } from '../types';
import { BRICS_PLOTS, PRIMARY_TOGGLE_REGIONS } from '../data/mockData';
import {
  Satellite,
  Droplets,
  Thermometer,
  CloudRain,
  Activity,
  Layers,
  MapPin,
  Sparkles,
  CheckCircle2,
  Globe2,
  History,
  DollarSign,
  Leaf,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface TelemetryPanelProps {
  selectedPlot: PlotTelemetry;
  onSelectPlot: (plot: PlotTelemetry) => void;
}

export function TelemetryPanel({ selectedPlot, onSelectPlot }: TelemetryPanelProps) {
  const [showMemory, setShowMemory] = useState<boolean>(true);
  const days = ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7'];
  const maxRain = Math.max(...selectedPlot.rainfallDaily, 15);

  return (
    <section aria-label="Plot Environmental Telemetry" className="bg-stone-900 text-stone-100 rounded-2xl border border-stone-800 p-4 sm:p-5 shadow-lg space-y-4">
      {/* Header with Title and Simulated Label */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-800">
        <div>
          <div className="flex items-center gap-2">
            <Satellite className="w-4 h-4 text-emerald-400" aria-hidden="true" />
            <h3 className="font-semibold text-sm sm:text-base text-white">
              Plot Environmental Telemetry
            </h3>
            <span className="text-[10px] font-semibold tracking-wide uppercase px-2 py-0.5 rounded bg-stone-800 text-amber-300 border border-stone-700">
              🛰️ Simulated Sensor Feed
            </span>
          </div>
          <p className="text-xs text-stone-400 mt-0.5">
            Synthetic Earth Engine satellite index &amp; in-situ soil IoT parameters provided as real-time context to the multi-agent system
          </p>
        </div>

        {/* Extended Pan-BRICS Dropdown Option */}
        <div className="flex items-center gap-2">
          <label htmlFor="plot-select" className="text-xs text-stone-400 font-medium whitespace-nowrap">
            All BRICS Hubs:
          </label>
          <select
            id="plot-select"
            value={selectedPlot.id}
            aria-label="Select agricultural hub or plot"
            onChange={(e) => {
              const found = BRICS_PLOTS.find((p) => p.id === e.target.value);
              if (found) onSelectPlot(found);
            }}
            className="bg-stone-800 text-stone-100 text-xs rounded-lg px-2.5 py-1.5 border border-stone-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium cursor-pointer"
          >
            {BRICS_PLOTS.map((plot) => (
              <option key={plot.id} value={plot.id}>
                {plot.flag} {plot.country}: {plot.region} ({plot.crop})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 3-Sample Regions Toggle Segment */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-stone-300 flex items-center gap-1.5">
            <Globe2 className="w-3.5 h-3.5 text-emerald-400" aria-hidden="true" />
            <span>Switch Mock Farmer Region:</span>
          </span>
          <span className="text-[11px] text-emerald-400 font-medium">
            3 High-Diversity Agro-Ecological Zones
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5" role="group" aria-label="Quick Region Selection">
          {PRIMARY_TOGGLE_REGIONS.map((region) => {
            const isSelected = selectedPlot.id === region.id;
            const plotData = BRICS_PLOTS.find((p) => p.id === region.id);

            return (
              <button
                key={region.id}
                type="button"
                id={`toggle-region-${region.id}`}
                aria-pressed={isSelected}
                aria-label={`Select region ${region.name}, country ${plotData?.country}, crop ${plotData?.crop}`}
                onClick={() => {
                  if (plotData) onSelectPlot(plotData);
                }}
                className={`relative text-left p-3 rounded-xl border transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-400 ${
                  isSelected
                    ? 'bg-emerald-950/70 border-emerald-500 text-white shadow-md shadow-emerald-950/50 ring-1 ring-emerald-500/50'
                    : 'bg-stone-800/60 border-stone-700/80 text-stone-300 hover:bg-stone-800 hover:border-stone-600'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl" aria-hidden="true">{region.flag}</span>
                    <div>
                      <div className="font-bold text-sm text-white flex items-center gap-1.5">
                        {region.name}
                      </div>
                      <div className="text-[11px] text-stone-400 line-clamp-1">
                        {plotData?.crop}
                      </div>
                    </div>
                  </div>
                  {isSelected && (
                    <span className="p-0.5 rounded-full bg-emerald-500 text-stone-950" aria-hidden="true">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </span>
                  )}
                </div>

                {/* Sub-metrics preview */}
                <div className="mt-2 pt-2 border-t border-stone-700/50 flex items-center justify-between text-[11px] text-stone-400">
                  <span className="truncate pr-1">{region.zone}</span>
                  <span className={`shrink-0 font-medium ${isSelected ? 'text-emerald-300' : 'text-stone-300'}`}>
                    pH {plotData?.soilPH} • {plotData?.soilMoisture}% Moist
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Plot Info Banner */}
      <div className="bg-gradient-to-r from-emerald-950/60 to-stone-800/80 rounded-xl p-3 border border-emerald-800/30 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <span className="text-2xl" aria-hidden="true">{selectedPlot.flag}</span>
          <div>
            <div className="font-bold text-white text-sm flex items-center gap-2">
              <span>{selectedPlot.name}</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-900/60 text-emerald-300 border border-emerald-700/40">
                {selectedPlot.country}
              </span>
            </div>
            <div className="text-stone-300 flex items-center gap-1 text-xs">
              <MapPin className="w-3.5 h-3.5 text-emerald-400" aria-hidden="true" />
              <span>{selectedPlot.region} • <strong className="text-emerald-300 font-semibold">{selectedPlot.crop}</strong></span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 text-stone-300">
          <div>
            <span className="text-stone-400 block text-[10px]">SOIL CLASSIFICATION</span>
            <span className="font-medium text-stone-200">{selectedPlot.soilType}</span>
          </div>
          <div>
            <span className="text-stone-400 block text-[10px]">ORGANIC CARBON</span>
            <span className="font-medium text-stone-200">{selectedPlot.organicCarbonPercent}%</span>
          </div>
          <div>
            <span className="text-stone-400 block text-[10px]">HIST. YIELD</span>
            <span className="font-medium text-stone-200">{selectedPlot.historicalYieldAvg} t/ha</span>
          </div>
        </div>
      </div>

      {/* Sensor Metric Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Soil pH */}
        <div className="bg-stone-800/80 rounded-xl p-3 border border-stone-700/60" aria-label={`Soil pH: ${selectedPlot.soilPH}`}>
          <div className="flex items-center justify-between text-stone-400 text-xs mb-1">
            <span>Soil pH</span>
            <Layers className="w-3.5 h-3.5 text-amber-400" aria-hidden="true" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-bold text-white">{selectedPlot.soilPH}</span>
            <span className="text-[10px] text-stone-400">
              {selectedPlot.soilPH < 6.0 ? '(Acidic)' : selectedPlot.soilPH > 7.5 ? '(Alkaline)' : '(Optimal)'}
            </span>
          </div>
          {/* Visual pH bar */}
          <div className="w-full bg-stone-700 h-1.5 rounded-full mt-2 overflow-hidden" aria-hidden="true">
            <div
              className={`h-full rounded-full ${
                selectedPlot.soilPH < 6.0 ? 'bg-amber-500' : selectedPlot.soilPH > 7.5 ? 'bg-indigo-400' : 'bg-emerald-500'
              }`}
              style={{ width: `${Math.min((selectedPlot.soilPH / 10) * 100, 100)}%` }}
            />
          </div>
        </div>

        {/* Soil Moisture */}
        <div className="bg-stone-800/80 rounded-xl p-3 border border-stone-700/60" aria-label={`Soil Moisture: ${selectedPlot.soilMoisture} percent`}>
          <div className="flex items-center justify-between text-stone-400 text-xs mb-1">
            <span>Soil Moisture</span>
            <Droplets className="w-3.5 h-3.5 text-blue-400" aria-hidden="true" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-bold text-white">{selectedPlot.soilMoisture}%</span>
            <span className="text-[10px] text-stone-400">
              {selectedPlot.soilMoisture < 45 ? 'Deficit / Dry' : selectedPlot.soilMoisture > 65 ? 'High / Saturated' : 'Adequate'}
            </span>
          </div>
          <div className="w-full bg-stone-700 h-1.5 rounded-full mt-2 overflow-hidden" aria-hidden="true">
            <div
              className={`h-full rounded-full ${
                selectedPlot.soilMoisture < 45 ? 'bg-amber-500' : selectedPlot.soilMoisture > 65 ? 'bg-blue-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${selectedPlot.soilMoisture}%` }}
            />
          </div>
        </div>

        {/* Weather & Temp */}
        <div className="bg-stone-800/80 rounded-xl p-3 border border-stone-700/60" aria-label={`Temperature range: ${selectedPlot.tempRange.min} to ${selectedPlot.tempRange.max} degrees Celsius, Relative Humidity: ${selectedPlot.humidityPercent} percent`}>
          <div className="flex items-center justify-between text-stone-400 text-xs mb-1">
            <span>Temp &amp; Humidity</span>
            <Thermometer className="w-3.5 h-3.5 text-rose-400" aria-hidden="true" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-bold text-white">
              {selectedPlot.tempRange.min}°-{selectedPlot.tempRange.max}°C
            </span>
          </div>
          <div className="text-[10px] text-stone-400 mt-1 flex items-center justify-between">
            <span>RH: {selectedPlot.humidityPercent}%</span>
            <span className={selectedPlot.humidityPercent > 80 ? 'text-amber-400 font-medium' : 'text-emerald-400 font-medium'}>
              {selectedPlot.humidityPercent > 80 ? 'High Fungus Risk' : 'Normal Range'}
            </span>
          </div>
        </div>

        {/* NDVI Vegetation Index */}
        <div className="bg-stone-800/80 rounded-xl p-3 border border-stone-700/60" aria-label={`NDVI Vegetation Health: ${selectedPlot.ndviCurrent}`}>
          <div className="flex items-center justify-between text-stone-400 text-xs mb-1">
            <span>NDVI Health</span>
            <Activity className="w-3.5 h-3.5 text-emerald-400" aria-hidden="true" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-bold text-emerald-400">{selectedPlot.ndviCurrent}</span>
            <span className="text-[10px] text-stone-400">Canopy Vigour</span>
          </div>
          {/* Mini sparkline */}
          <div className="flex items-end gap-1 h-3 mt-2" aria-hidden="true">
            {selectedPlot.ndviTrend.map((v, i) => (
              <div
                key={i}
                className="flex-1 bg-emerald-500/80 rounded-xs transition-all"
                style={{ height: `${Math.round(v * 100)}%` }}
                title={`Week ${i + 1}: ${v}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Row 2: N-P-K Nutrients & 7-Day Rainfall Forecast */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 pt-1">
        {/* N-P-K Nutrient Bars */}
        <div className="bg-stone-800/50 rounded-xl p-3 border border-stone-700/40" role="region" aria-label={`Soil N-P-K Nutrients: Nitrogen ${selectedPlot.nitrogen} kg/ha, Phosphorus ${selectedPlot.phosphorus} kg/ha, Potassium ${selectedPlot.potassium} kg/ha`}>
          <div className="flex items-center justify-between text-xs font-semibold text-stone-300 mb-2">
            <span>Soil N-P-K Nutrient Status (kg/ha)</span>
            <span className="text-[10px] text-stone-400">OC: {selectedPlot.organicCarbonPercent}%</span>
          </div>
          <div className="space-y-2 text-xs">
            {/* Nitrogen */}
            <div>
              <div className="flex justify-between text-[11px] mb-0.5">
                <span className="text-stone-300">Nitrogen (N)</span>
                <span className="font-semibold text-white">{selectedPlot.nitrogen} kg/ha</span>
              </div>
              <div className="w-full bg-stone-700 h-2 rounded-full overflow-hidden" aria-hidden="true">
                <div
                  className="bg-emerald-500 h-full rounded-full"
                  style={{ width: `${Math.min((selectedPlot.nitrogen / 300) * 100, 100)}%` }}
                />
              </div>
            </div>
            {/* Phosphorus */}
            <div>
              <div className="flex justify-between text-[11px] mb-0.5">
                <span className="text-stone-300">Phosphorus (P)</span>
                <span className="font-semibold text-white">{selectedPlot.phosphorus} kg/ha</span>
              </div>
              <div className="w-full bg-stone-700 h-2 rounded-full overflow-hidden" aria-hidden="true">
                <div
                  className="bg-amber-500 h-full rounded-full"
                  style={{ width: `${Math.min((selectedPlot.phosphorus / 60) * 100, 100)}%` }}
                />
              </div>
            </div>
            {/* Potassium */}
            <div>
              <div className="flex justify-between text-[11px] mb-0.5">
                <span className="text-stone-300">Potassium (K)</span>
                <span className="font-semibold text-white">{selectedPlot.potassium} kg/ha</span>
              </div>
              <div className="w-full bg-stone-700 h-2 rounded-full overflow-hidden" aria-hidden="true">
                <div
                  className="bg-indigo-400 h-full rounded-full"
                  style={{ width: `${Math.min((selectedPlot.potassium / 350) * 100, 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* 7-Day Rainfall Forecast */}
        <div className="bg-stone-800/50 rounded-xl p-3 border border-stone-700/40" role="region" aria-label={`7-Day Precipitation Forecast, Total ${selectedPlot.rainfallForecast7d} millimeters`}>
          <div className="flex items-center justify-between text-xs font-semibold text-stone-300 mb-2">
            <span className="flex items-center gap-1.5">
              <CloudRain className="w-3.5 h-3.5 text-blue-400" aria-hidden="true" />
              <span>7-Day Precipitation Forecast ({selectedPlot.rainfallForecast7d} mm total)</span>
            </span>
            <span className="text-[10px] text-blue-300 font-medium">
              {selectedPlot.rainfallForecast7d > 50 ? 'Heavy Rain Cycle' : selectedPlot.rainfallForecast7d < 15 ? 'Dry Outlook' : 'Moderate'}
            </span>
          </div>

          <div className="flex items-end justify-between gap-1.5 h-16 pt-2" aria-hidden="true">
            {selectedPlot.rainfallDaily.map((mm, idx) => {
              const heightPercent = Math.max((mm / maxRain) * 100, 8);
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-[9px] text-stone-400">{mm}mm</span>
                  <div className="w-full bg-stone-700 rounded-t h-10 flex items-end">
                    <div
                      className={`w-full rounded-t transition-all ${
                        mm > 15 ? 'bg-blue-500' : mm > 5 ? 'bg-blue-400/80' : 'bg-stone-600'
                      }`}
                      style={{ height: `${heightPercent}%` }}
                    />
                  </div>
                  <span className="text-[9px] text-stone-400">{days[idx]}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* EPISODIC FIELD MEMORY & FINANCIAL READINESS SECTION (Section 7.4 & 14) */}
      {selectedPlot.episodicMemories && selectedPlot.episodicMemories.length > 0 && (
        <div className="bg-stone-950/70 rounded-xl border border-stone-800 p-3.5 space-y-3">
          <div
            className="flex items-center justify-between cursor-pointer focus:outline-none"
            onClick={() => setShowMemory(!showMemory)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setShowMemory(!showMemory);
              }
            }}
            role="button"
            tabIndex={0}
            aria-expanded={showMemory}
            aria-controls="episodic-memory-section"
            aria-label={`Toggle Episodic Field Memory, ${selectedPlot.episodicMemories.length} seasons available`}
          >
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-emerald-400" aria-hidden="true" />
              <span className="text-xs font-bold text-white">
                Episodic Field Memory (Firestore Multi-Season Plot History)
              </span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-stone-800 text-stone-300 border border-stone-700">
                {selectedPlot.episodicMemories.length} Historic Seasons
              </span>
            </div>
            <div className="text-stone-400 hover:text-white text-xs flex items-center gap-1">
              <span>{showMemory ? 'Collapse' : 'Expand'}</span>
              {showMemory ? <ChevronUp className="w-3.5 h-3.5" aria-hidden="true" /> : <ChevronDown className="w-3.5 h-3.5" aria-hidden="true" />}
            </div>
          </div>

          {showMemory && (
            <div id="episodic-memory-section" className="space-y-2 pt-1 border-t border-stone-800/80">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs" role="list" aria-label="Historic plot seasons">
                {selectedPlot.episodicMemories.map((event, idx) => (
                  <div
                    key={idx}
                    role="listitem"
                    className="bg-stone-900/90 p-3 rounded-lg border border-stone-800 space-y-1.5"
                  >
                    <div className="flex items-center justify-between text-[11px] font-bold">
                      <span className="text-emerald-400">
                        {event.season} {event.year} • {event.crop}
                      </span>
                      <span className="text-stone-400">{event.yieldAchieved} t/ha yield</span>
                    </div>
                    <div className="text-stone-300 text-[11px] leading-snug">
                      <strong className="text-amber-400">Prior Issue:</strong> {event.observedIssue}
                    </div>
                    <div className="text-stone-400 text-[10px]">
                      <strong className="text-stone-300">Action:</strong> {event.actionTaken}
                    </div>
                  </div>
                ))}
              </div>

              {/* Agri-Worthiness & dMRV Quick Badges (Section 14) */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-stone-800/60 text-[11px]">
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                    <DollarSign className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Agri-Credit Score: {selectedPlot.creditProfile?.creditScore || 84}/100 (Grade {selectedPlot.creditProfile?.ratingGrade || 'A'})</span>
                  </span>
                  <span className="text-stone-600" aria-hidden="true">•</span>
                  <span className="flex items-center gap-1 text-teal-300">
                    <Leaf className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>dMRV Carbon: +{selectedPlot.dmrvRecord?.carbonSequesteredTonsHa || 1.65} t CO₂e/ha</span>
                  </span>
                </div>
                <span className="text-[10px] text-stone-500 italic">
                  Episodic memory prevents re-diagnosing repeat issues from scratch each season
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
