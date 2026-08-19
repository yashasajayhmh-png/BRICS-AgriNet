import React, { useState } from 'react';
import { PlotTelemetry } from '../types';
import {
  SOIL_HEALTH_DATA,
  SATELLITE_SPECTRAL_DATA,
  WEATHER_FORECAST_DATA,
  YIELD_PREDICTIONS_DATA,
} from '../data/regenerativeData';
import {
  Satellite,
  Droplets,
  Layers,
  Thermometer,
  CloudRain,
  Activity,
  Wind,
  Sun,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Sliders,
  Sparkles,
  Leaf,
  ShieldAlert,
  Calendar,
  Gauge,
  Zap,
} from 'lucide-react';

interface SatelliteSoilTabProps {
  selectedPlot: PlotTelemetry;
  onSelectPlot: (plot: PlotTelemetry) => void;
}

export function SatelliteSoilTab({ selectedPlot, onSelectPlot }: SatelliteSoilTabProps) {
  const [activeSubTab, setActiveSubTab] = useState<'satellite' | 'soil' | 'weather' | 'yield'>('satellite');

  // Interactive What-If simulation slider states for yield biophysical modeling
  const [nitrogenAdjustment, setNitrogenAdjustment] = useState<number>(0); // -40% to +40%
  const [irrigationAdjustment, setIrrigationAdjustment] = useState<number>(0); // -50mm to +50mm
  const [sowingDateShiftDays, setSowingDateShiftDays] = useState<number>(0); // -15 to +15 days

  const soil = SOIL_HEALTH_DATA[selectedPlot.id] || SOIL_HEALTH_DATA['in-punjab-01'];
  const satellite = SATELLITE_SPECTRAL_DATA[selectedPlot.id] || SATELLITE_SPECTRAL_DATA['in-punjab-01'];
  const weatherList = WEATHER_FORECAST_DATA[selectedPlot.id] || WEATHER_FORECAST_DATA['in-punjab-01'];
  const yieldData = YIELD_PREDICTIONS_DATA[selectedPlot.id] || YIELD_PREDICTIONS_DATA['in-punjab-01'];

  // Calculate dynamic simulated yield based on sensitivity parameters
  const simulatedYield = (
    yieldData.aiPredictedYieldTonsHa +
    (nitrogenAdjustment / 20) * yieldData.whatIfSensitivity.nitrogenBoostPlus20Pct +
    (irrigationAdjustment / 30) * yieldData.whatIfSensitivity.additionalIrrigationPlus30Mm +
    (sowingDateShiftDays / 10) * yieldData.whatIfSensitivity.delayPlantingMinus10Days
  ).toFixed(2);

  const yieldDeltaPct = (
    ((parseFloat(simulatedYield) - yieldData.baselineHistoricalYieldTonsHa) /
      yieldData.baselineHistoricalYieldTonsHa) *
    100
  ).toFixed(1);

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-stone-900 via-stone-900 to-emerald-950/60 border border-stone-800 rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-700/50 text-emerald-300 text-xs font-semibold">
              <Satellite className="w-3.5 h-3.5 text-emerald-400" />
              <span>Sentinel-2 &amp; SoilGrids Telemetry Fusion</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white font-serif">
              Satellite Spectral &amp; Soil Health Intelligence
            </h1>
            <p className="text-xs sm:text-sm text-stone-300 max-w-2xl leading-relaxed">
              Real-time multispectral vegetation indexes (NDVI, NDRE), capacitive soil moisture, laboratory NPK assays, 7-day microclimate risk alerts, and biophysical DSSAT yield forecasting.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 bg-stone-950/80 border border-stone-800 rounded-2xl p-4">
            <div className="space-y-1">
              <div className="text-[11px] text-stone-400 font-semibold">Active Parcel</div>
              <div className="text-sm font-bold text-white flex items-center gap-2">
                <span>{selectedPlot.flag}</span>
                <span>{selectedPlot.name}</span>
              </div>
              <div className="text-[11px] text-emerald-400">{selectedPlot.crop} • {selectedPlot.region}</div>
            </div>
          </div>
        </div>

        {/* Sub-Navigation Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pt-6 border-t border-stone-800/80 mt-6 section-scrollbar pb-1">
          <button
            type="button"
            onClick={() => setActiveSubTab('satellite')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
              activeSubTab === 'satellite'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-stone-800 text-stone-300 hover:bg-stone-700 hover:text-white'
            }`}
          >
            <Satellite className="w-4 h-4" />
            <span>Sentinel-2 Spectral Indices (NDVI / NDRE / SMI)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('soil')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
              activeSubTab === 'soil'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-stone-800 text-stone-300 hover:bg-stone-700 hover:text-white'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Soil Health &amp; NPK Micronutrient Radar</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('weather')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
              activeSubTab === 'weather'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-stone-800 text-stone-300 hover:bg-stone-700 hover:text-white'
            }`}
          >
            <CloudRain className="w-4 h-4" />
            <span>7-Day Microclimate &amp; Spray Window Alerts</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('yield')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
              activeSubTab === 'yield'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-stone-800 text-stone-300 hover:bg-stone-700 hover:text-white'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>DSSAT Yield Prediction &amp; What-If Simulation</span>
          </button>
        </div>
      </div>

      {/* TAB 1: SATELLITE SPECTRAL INDICES */}
      {activeSubTab === 'satellite' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* NDVI Card */}
            <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">NDVI Index</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-700/50">
                  Sentinel-2 MSI
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-white font-mono">{satellite.ndviCurrent}</span>
                <span className="text-xs text-emerald-400 font-semibold">+12% vs 6-wk avg</span>
              </div>
              <p className="text-[11px] text-stone-400">
                Normalized Difference Vegetation Index (B8 - B4)/(B8 + B4). Indicates robust chlorophyll biomass density.
              </p>
              {/* Mini Trend Bar */}
              <div className="space-y-1 pt-2 border-t border-stone-800">
                <div className="text-[10px] text-stone-500">6-Week Historical Trend</div>
                <div className="flex items-end gap-1.5 h-10">
                  {satellite.ndviTrend.map((val, idx) => (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                      <div
                        className="w-full bg-emerald-500/80 rounded-t"
                        style={{ height: `${Math.round(val * 100 * 0.4)}px` }}
                      />
                      <span className="text-[9px] text-stone-500 font-mono">{val}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* NDRE Card */}
            <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">NDRE (Red Edge)</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-950 text-teal-300 border border-teal-700/50">
                  Canopy Nitrogen
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-white font-mono">{satellite.ndreRedEdgeCurrent}</span>
                <span className="text-xs text-teal-300 font-semibold">Optimal</span>
              </div>
              <p className="text-[11px] text-stone-400">
                Normalized Difference Red Edge (B8 - B5)/(B8 + B5). Sensitive to upper-canopy nitrogen content without saturation.
              </p>
              <div className="pt-3 border-t border-stone-800 flex items-center justify-between text-xs">
                <span className="text-stone-500">Sensor Tile:</span>
                <span className="text-stone-300 font-mono text-[11px]">{satellite.tileId}</span>
              </div>
            </div>

            {/* SMI Moisture Index */}
            <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">Soil Moisture SMI</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-700/50">
                  Capacitive SWIR
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-white font-mono">{satellite.soilMoistureIndexSMI}</span>
                <span className="text-xs text-cyan-300 font-semibold">52% Volumetric</span>
              </div>
              <p className="text-[11px] text-stone-400">
                Soil Moisture Index derived from short-wave infrared (B11/B12). Adequate capillary reserve in root zone.
              </p>
              <div className="pt-3 border-t border-stone-800 flex items-center justify-between text-xs">
                <span className="text-stone-500">Surface Temp:</span>
                <span className="text-stone-300 font-mono font-bold">{satellite.landSurfaceTempCelsius}°C</span>
              </div>
            </div>

            {/* EVI Index */}
            <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">EVI Index</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-700/50">
                  Atmospheric Corrected
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-white font-mono">{satellite.enhancedVegetationIndexEVI}</span>
                <span className="text-xs text-amber-300 font-semibold">High Vigor</span>
              </div>
              <p className="text-[11px] text-stone-400">
                Enhanced Vegetation Index with atmospheric aerosol resistance. Prevents canopy saturation in high-biomass stages.
              </p>
              <div className="pt-3 border-t border-stone-800 flex items-center justify-between text-xs">
                <span className="text-stone-500">Cloud Obscuration:</span>
                <span className="text-stone-300 font-mono">{satellite.cloudCoveragePercent}%</span>
              </div>
            </div>
          </div>

          {/* Spectral Reflectance Visualization */}
          <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-400" />
                  <span>Sentinel-2 Multispectral Surface Reflectance Curve (B1 - B12)</span>
                </h3>
                <p className="text-xs text-stone-400">
                  Pass timestamp: {satellite.lastPassDate} • 10-meter spatial resolution
                </p>
              </div>
              <span className="text-xs font-mono text-emerald-400 bg-emerald-950/80 px-3 py-1 rounded-lg border border-emerald-800/50">
                Vegetation Red Edge Step Detected
              </span>
            </div>

            <div className="grid grid-cols-6 sm:grid-cols-12 gap-2 pt-2 text-center text-xs">
              {[
                { band: 'B1 (Coastal)', val: '0.04', type: 'atm' },
                { band: 'B2 (Blue)', val: '0.05', type: 'vis' },
                { band: 'B3 (Green)', val: '0.08', type: 'vis' },
                { band: 'B4 (Red)', val: '0.04', type: 'vis' },
                { band: 'B5 (RE1)', val: '0.18', type: 're' },
                { band: 'B6 (RE2)', val: '0.36', type: 're' },
                { band: 'B7 (RE3)', val: '0.42', type: 're' },
                { band: 'B8 (NIR)', val: '0.48', type: 'nir' },
                { band: 'B8A (Narrow NIR)', val: '0.49', type: 'nir' },
                { band: 'B9 (Water Vapor)', val: '0.12', type: 'atm' },
                { band: 'B11 (SWIR-1)', val: '0.22', type: 'swir' },
                { band: 'B12 (SWIR-2)', val: '0.11', type: 'swir' },
              ].map((item, i) => (
                <div
                  key={i}
                  className={`p-2.5 rounded-xl border flex flex-col justify-between ${
                    item.type === 'nir' || item.type === 're'
                      ? 'bg-emerald-950/60 border-emerald-700/60 text-emerald-200'
                      : item.type === 'swir'
                      ? 'bg-cyan-950/40 border-cyan-800/40 text-cyan-200'
                      : 'bg-stone-950 border-stone-800 text-stone-300'
                  }`}
                >
                  <div className="text-[10px] font-mono text-stone-400">{item.band}</div>
                  <div className="text-base font-bold font-mono my-1">{item.val}</div>
                  <div className="text-[9px] text-stone-500 uppercase">{item.type}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SOIL HEALTH & NPK RADAR */}
      {activeSubTab === 'soil' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* Primary Macronutrients */}
            <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Leaf className="w-4 h-4 text-emerald-400" />
                  <span>Primary Macronutrients (NPK)</span>
                </h3>
                <span className="text-[10px] text-stone-400">In-Situ Probe</span>
              </div>

              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-stone-400">Available Nitrogen (N)</span>
                    <span className="font-bold text-white font-mono">{soil.nitrogenKgHa} kg/ha (Medium)</span>
                  </div>
                  <div className="w-full h-2 bg-stone-800 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: '65%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-stone-400">Available Phosphorus (P2O5)</span>
                    <span className="font-bold text-white font-mono">{soil.phosphorusKgHa} kg/ha (Adequate)</span>
                  </div>
                  <div className="w-full h-2 bg-stone-800 rounded-full overflow-hidden">
                    <div className="h-full bg-teal-500 rounded-full" style={{ width: '75%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-stone-400">Exchangeable Potassium (K2O)</span>
                    <span className="font-bold text-white font-mono">{soil.potassiumKgHa} kg/ha (High)</span>
                  </div>
                  <div className="w-full h-2 bg-stone-800 rounded-full overflow-hidden">
                    <div className="h-full bg-cyan-500 rounded-full" style={{ width: '85%' }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Physicochemical & Organic Carbon */}
            <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Gauge className="w-4 h-4 text-emerald-400" />
                <span>Physicochemical Properties</span>
              </h3>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-stone-950 p-3 rounded-xl border border-stone-800">
                  <div className="text-stone-500">Soil pH</div>
                  <div className="text-xl font-bold text-white font-mono mt-0.5">{soil.soilPH}</div>
                  <div className="text-[10px] text-stone-400">Neutral / Slightly Alkaline</div>
                </div>

                <div className="bg-stone-950 p-3 rounded-xl border border-stone-800">
                  <div className="text-stone-500">Organic Carbon (SOC)</div>
                  <div className="text-xl font-bold text-emerald-400 font-mono mt-0.5">{soil.organicCarbonSOCPct}%</div>
                  <div className="text-[10px] text-stone-400">{soil.organicCarbonSOCPct < 0.75 ? 'Low (<0.75%)' : 'Good (>1.0%)'}</div>
                </div>

                <div className="bg-stone-950 p-3 rounded-xl border border-stone-800">
                  <div className="text-stone-500">Electrical Conductivity</div>
                  <div className="text-xl font-bold text-white font-mono mt-0.5">{soil.electroConductivityEC} dS/m</div>
                  <div className="text-[10px] text-stone-400">{soil.electroConductivityEC > 2.0 ? 'Saline Stress' : 'Non-Saline'}</div>
                </div>

                <div className="bg-stone-950 p-3 rounded-xl border border-stone-800">
                  <div className="text-stone-500">Cation Exchange (CEC)</div>
                  <div className="text-xl font-bold text-teal-400 font-mono mt-0.5">{soil.cationExchangeCapacityCEC}</div>
                  <div className="text-[10px] text-stone-400">meq/100g</div>
                </div>
              </div>
            </div>

            {/* Micronutrients Zinc, Boron, Iron */}
            <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span>Critical Micronutrients (ppm)</span>
              </h3>

              <div className="space-y-3 text-xs">
                <div className="p-2.5 rounded-xl bg-stone-950 border border-stone-800 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-white">Zinc (Zn)</div>
                    <div className="text-[10px] text-stone-400">Critical threshold: 0.90 ppm</div>
                  </div>
                  <div className={`font-mono font-bold text-sm ${soil.zincPpm < 0.9 ? 'text-amber-400' : 'text-emerald-400'}`}>
                    {soil.zincPpm} ppm {soil.zincPpm < 0.9 && '⚠️ Deficient'}
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-stone-950 border border-stone-800 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-white">Boron (B)</div>
                    <div className="text-[10px] text-stone-400">Critical threshold: 0.50 ppm</div>
                  </div>
                  <div className="font-mono font-bold text-sm text-emerald-400">
                    {soil.boronPpm} ppm
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-stone-950 border border-stone-800 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-white">Iron (Fe)</div>
                    <div className="text-[10px] text-stone-400">DTPA Extractable</div>
                  </div>
                  <div className="font-mono font-bold text-sm text-emerald-400">
                    {soil.ironPpm} ppm
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Remediation & Action Roadmap */}
          <div className="bg-gradient-to-r from-stone-900 via-stone-900 to-emerald-950/40 border border-stone-800 rounded-2xl p-6 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span>Regenerative Soil Health Remediation Roadmap</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {soil.remediationPlan.map((step, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-stone-950/90 border border-stone-800 space-y-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-emerald-950 text-emerald-400 font-bold flex items-center justify-center text-[10px] border border-emerald-700/60">
                      {idx + 1}
                    </span>
                    <span className="font-bold text-white">Priority Step {idx + 1}</span>
                  </div>
                  <p className="text-stone-300 leading-relaxed">{step}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: 7-DAY WEATHER & SPRAY WINDOW ALERTS */}
      {activeSubTab === 'weather' && (
        <div className="space-y-6">
          <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <CloudRain className="w-5 h-5 text-emerald-400" />
                  <span>7-Day Microclimate Agrometeorology &amp; Atmospheric Risks</span>
                </h3>
                <p className="text-xs text-stone-400">
                  ERA5 &amp; In-Situ AWS station models calculate hourly Growing Degree Days (GDD) and spore dispersion risk.
                </p>
              </div>
              <span className="text-xs font-bold text-emerald-300 bg-emerald-950 px-3 py-1.5 rounded-xl border border-emerald-700/60">
                Next Favorable Spray Window: Day 1 &amp; Day 2 (6 - 10 AM)
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 pt-2">
              {weatherList.map((day, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-xl border flex flex-col justify-between space-y-3 transition-all ${
                    day.pestSporeRiskAlert
                      ? 'bg-amber-950/40 border-amber-700/60 text-amber-200'
                      : day.rainfallMm > 0
                      ? 'bg-cyan-950/40 border-cyan-800/50 text-cyan-200'
                      : 'bg-stone-950 border-stone-800 text-stone-300'
                  }`}
                >
                  <div className="text-center pb-2 border-b border-stone-800/80">
                    <div className="font-bold text-xs text-white">{day.day}</div>
                    <div className="text-[10px] text-stone-400">{day.date}</div>
                  </div>

                  <div className="space-y-1.5 text-xs text-center">
                    <div className="text-lg font-bold text-white font-mono">
                      {day.tempMinC}° - {day.tempMaxC}°C
                    </div>
                    <div className="flex items-center justify-center gap-1 text-[11px] text-stone-400">
                      <CloudRain className="w-3 h-3 text-cyan-400" />
                      <span>{day.rainfallMm} mm rain</span>
                    </div>
                    <div className="flex items-center justify-center gap-1 text-[11px] text-stone-400">
                      <Wind className="w-3 h-3 text-stone-400" />
                      <span>{day.windSpeedKmh} km/h</span>
                    </div>
                    <div className="flex items-center justify-center gap-1 text-[11px] text-stone-400">
                      <Droplets className="w-3 h-3 text-teal-400" />
                      <span>{day.humidityPct}% RH</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-stone-800/80 text-center">
                    <div
                      className={`text-[9px] font-bold px-2 py-1 rounded-md leading-tight ${
                        day.sprayRecommendation.includes('Favorable')
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          : day.sprayRecommendation.includes('Avoid')
                          ? 'bg-rose-950 text-rose-300 border border-rose-800'
                          : 'bg-amber-950 text-amber-300 border border-amber-800'
                      }`}
                    >
                      {day.sprayRecommendation}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: DSSAT YIELD PREDICTION & WHAT-IF SIMULATION */}
      {activeSubTab === 'yield' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Yield Projection Card */}
            <div className="lg:col-span-1 bg-stone-900 border border-stone-800 rounded-2xl p-6 space-y-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                  DSSAT / APSIM Model
                </span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-700/60 font-mono">
                  {yieldData.confidenceScorePct}% Confidence
                </span>
              </div>

              <div>
                <div className="text-xs text-stone-400">AI Biophysical Projected Yield</div>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-4xl font-bold text-white font-mono">{simulatedYield}</span>
                  <span className="text-sm font-semibold text-stone-300">tons / hectare</span>
                </div>
                <div className="text-xs font-semibold text-emerald-400 mt-1">
                  {parseFloat(yieldDeltaPct) >= 0 ? `+${yieldDeltaPct}%` : `${yieldDeltaPct}%`} vs regional historical baseline ({yieldData.baselineHistoricalYieldTonsHa} t/ha)
                </div>
              </div>

              <div className="pt-4 border-t border-stone-800 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-stone-400">Optimistic Potential:</span>
                  <span className="font-bold text-white font-mono">{yieldData.optimisticYieldTonsHa} t/ha</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-400">Pessimistic Stress Floor:</span>
                  <span className="font-bold text-stone-400 font-mono">{yieldData.pessimisticYieldTonsHa} t/ha</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-400">Estimated Harvest Date:</span>
                  <span className="font-bold text-emerald-300">{yieldData.projectedHarvestDate}</span>
                </div>
              </div>

              <div className="pt-4 border-t border-stone-800 space-y-1.5 text-xs">
                <div className="font-bold text-white flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                  <span>Primary Biophysical Limiting Factors:</span>
                </div>
                {yieldData.limitingFactors.map((factor, i) => (
                  <div key={i} className="text-stone-400 pl-4 border-l border-amber-600/40 text-[11px] leading-relaxed">
                    {factor}
                  </div>
                ))}
              </div>
            </div>

            {/* What-If Sensitivity Sliders */}
            <div className="lg:col-span-2 bg-stone-900 border border-stone-800 rounded-2xl p-6 space-y-6">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-emerald-400" />
                  <span>Interactive &quot;What-If&quot; Parameter Sensitivity Simulation</span>
                </h3>
                <p className="text-xs text-stone-400 mt-1">
                  Adjust agronomic inputs to see live yield projections recalculated by the surrogate biophysical neural model.
                </p>
              </div>

              <div className="space-y-6">
                {/* Nitrogen Top Dressing Slider */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-white">Nitrogen Fertigation Shift:</span>
                    <span className="font-bold font-mono text-emerald-400">
                      {nitrogenAdjustment > 0 ? `+${nitrogenAdjustment}%` : `${nitrogenAdjustment}%`}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="-40"
                    max="40"
                    step="5"
                    value={nitrogenAdjustment}
                    onChange={(e) => setNitrogenAdjustment(parseInt(e.target.value))}
                    className="w-full accent-emerald-500 bg-stone-800 rounded-lg cursor-pointer h-2"
                  />
                  <div className="flex justify-between text-[10px] text-stone-500">
                    <span>-40% (Deficit)</span>
                    <span>Baseline (0%)</span>
                    <span>+40% (High Top-dress)</span>
                  </div>
                </div>

                {/* Additional Irrigation Slider */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-white">Supplemental Canal/Drip Irrigation:</span>
                    <span className="font-bold font-mono text-cyan-400">
                      {irrigationAdjustment > 0 ? `+${irrigationAdjustment} mm` : `${irrigationAdjustment} mm`}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="-40"
                    max="50"
                    step="5"
                    value={irrigationAdjustment}
                    onChange={(e) => setIrrigationAdjustment(parseInt(e.target.value))}
                    className="w-full accent-cyan-500 bg-stone-800 rounded-lg cursor-pointer h-2"
                  />
                  <div className="flex justify-between text-[10px] text-stone-500">
                    <span>-40mm (Rainfed only)</span>
                    <span>Baseline (0 mm)</span>
                    <span>+50mm (Full Canal Drip)</span>
                  </div>
                </div>

                {/* Sowing Date Shift Slider */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-white">Planting Date Window Shift:</span>
                    <span className="font-bold font-mono text-amber-400">
                      {sowingDateShiftDays > 0 ? `+${sowingDateShiftDays} days (Delayed)` : `${sowingDateShiftDays} days (Early)`}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="-15"
                    max="15"
                    step="1"
                    value={sowingDateShiftDays}
                    onChange={(e) => setSowingDateShiftDays(parseInt(e.target.value))}
                    className="w-full accent-amber-500 bg-stone-800 rounded-lg cursor-pointer h-2"
                  />
                  <div className="flex justify-between text-[10px] text-stone-500">
                    <span>-15 Days (Early Sowing)</span>
                    <span>Optimal Date</span>
                    <span>+15 Days (Delayed Monsoonal)</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-stone-950 border border-stone-800 flex items-center justify-between text-xs">
                  <span className="text-stone-400">Simulation Output:</span>
                  <div className="flex items-center gap-2">
                    <span className="text-stone-300">Projected Yield:</span>
                    <span className="font-bold text-emerald-400 font-mono text-base">{simulatedYield} t/ha</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
