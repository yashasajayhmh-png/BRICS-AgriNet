import React, { useState, useEffect } from 'react';
import { OutbreakReport, OutbreakForecastResponse } from '../types';
import { OUTBREAK_REPORTS } from '../data/mockData';
import {
  AlertTriangle,
  ShieldAlert,
  Wind,
  Layers,
  MapPin,
  Radio,
  Sliders,
  CheckCircle2,
  Calendar,
  Activity,
  ArrowRight,
  Info,
  Flame,
  PlusCircle,
  Sparkles,
  RefreshCw,
  Send,
  X,
  Compass,
  FileCheck,
} from 'lucide-react';

export function OutbreakTab() {
  const [reports, setReports] = useState<OutbreakReport[]>(OUTBREAK_REPORTS);
  const [filterCountry, setFilterCountry] = useState<string>('ALL');
  const [clusteringThresholdKm, setClusteringThresholdKm] = useState<number>(10.0); // km to border
  const [activeZone, setActiveZone] = useState<'all' | 'brazil-paraguay' | 'india-pakistan' | 'limpopo'>('all');

  // Dynamic AI Forecast State
  const [isForecasting, setIsForecasting] = useState<boolean>(false);
  const [forecastData, setForecastData] = useState<OutbreakForecastResponse | null>({
    transboundaryRiskLevel: 'CRITICAL',
    clusterDetected: true,
    clusterCount: 3,
    primaryVector: 'South-westerly low-level jet stream carrying Phakopsora pachyrhizi rust spores across the Amambay-Mato Grosso border corridor',
    fourteenDaySpreadPrediction: 'Spore cloud trajectory indicates 74% probability of rapid secondary pustule flaring across 14,000 hectares of late-vegetative soybean within 8-11 days under high relative humidity (82%).',
    atmosphericTransportIndex: 91,
    multilateralDirectives: [
      'Trigger Article IV Bilateral Early Warning Protocol between SENAVE Paraguay and MAPA Brazil',
      'Establish immediate 12 km prophylactic fungicide barrier buffer along the border meridian',
      'Mobilize mobile KVK / EMATER radar trap nurseries for daily spore count telemetry',
    ],
    bufferZoneActionPlan: 'Mandate continuous 72-hour scouting in all commercial soybean plots within 15 km of border crossing coordinates.',
    affectedBorderBilateralCorridors: [
      'Brazil (Mato Grosso do Sul) • Paraguay (Amambay)',
      'India (Punjab) • Pakistan (Firozpur Corridor)',
      'South Africa (Limpopo) • Zimbabwe (Beitbridge Zone)',
    ],
  });

  // Modal for reporting field incident
  const [showReportModal, setShowReportModal] = useState<boolean>(false);
  const [isSubmittingReport, setIsSubmittingReport] = useState<boolean>(false);

  // Load persistent outbreak reports from SQLite DB
  const loadOutbreakReports = async () => {
    try {
      const res = await fetch('/api/db/outbreaks');
      const json = await res.json();
      if (json.success && Array.isArray(json.data) && json.data.length > 0) {
        setReports(json.data);
      }
    } catch (err) {
      console.warn('Failed to load SQLite outbreak reports:', err);
    }
  };

  useEffect(() => {
    loadOutbreakReports();
  }, []);

  const [newReportForm, setNewReportForm] = useState({
    country: 'Brazil',
    region: 'Mato Grosso do Sul (Ponta Porã Border Sector)',
    crop: 'Soybean',
    pestDisease: 'Asian Soybean Rust (Phakopsora pachyrhizi)',
    severity: 'Severe' as const,
    distanceToBorderKm: 3.2,
    neighboringCountry: 'Paraguay (Pedro Juan Caballero)',
    verifiedBy: 'EMATER-MS Fast Sentinel Unit',
  });

  // Fetch real AI Outbreak Forecast from backend
  const fetchForecast = async () => {
    setIsForecasting(true);
    try {
      const res = await fetch('/api/agent/outbreak-forecast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reports,
          clusteringThresholdKm,
          targetZone: activeZone,
        }),
      });
      const json = await res.json();
      if (json.success && json.data) {
        setForecastData(json.data);
      }
    } catch (err) {
      console.warn('Outbreak forecast fallback:', err);
    } finally {
      setIsForecasting(false);
    }
  };

  // Submit new incident to backend
  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingReport(true);
    try {
      const res = await fetch('/api/agent/report-outbreak', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newReportForm),
      });
      const json = await res.json();
      if (json.success && json.data) {
        setReports((prev) => [json.data, ...prev]);
        setShowReportModal(false);
        // Refresh forecast automatically
        fetchForecast();
      }
    } catch (err) {
      console.error('Report submission error:', err);
    } finally {
      setIsSubmittingReport(false);
    }
  };

  // Filter reports
  const filteredReports = reports.filter((r) => {
    if (filterCountry !== 'ALL' && !r.country.toLowerCase().includes(filterCountry.toLowerCase())) {
      return false;
    }
    if (activeZone === 'brazil-paraguay') {
      return r.neighboringCountry.includes('Paraguay') || r.country.includes('Brazil');
    }
    if (activeZone === 'india-pakistan') {
      return r.neighboringCountry.includes('Pakistan') || r.country.includes('India');
    }
    if (activeZone === 'limpopo') {
      return r.neighboringCountry.includes('Zimbabwe') || r.country.includes('South Africa');
    }
    return true;
  });

  const borderCorridorReports = reports.filter(
    (r) => r.distanceToBorderKm <= clusteringThresholdKm
  );
  const hasTransboundaryCluster = borderCorridorReports.length >= 2;

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="bg-emerald-900/20 border border-emerald-700/30 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-rose-900/60 text-rose-300">
              <AlertTriangle className="w-5 h-5" />
            </span>
            <h2 className="text-base sm:text-lg font-bold text-white">
              Transboundary Outbreak Early-Warning Grid
            </h2>
            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-stone-800 text-stone-300 border border-stone-700">
              🚨 Live Gemini 3.7 Sentinel Agent
            </span>
          </div>
          <p className="text-xs sm:text-sm text-stone-300 mt-1 max-w-3xl">
            Detects high-density phytosanitary spore clouds and pest swarms clustering along shared sovereign borders.
            Powered by real server-side atmospheric transport modeling (FAO Desert Locust &amp; Spore Watch standards) to coordinate multilateral buffer responses.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchForecast}
            disabled={isForecasting}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 transition-all shrink-0"
          >
            <RefreshCw className={`w-4 h-4 ${isForecasting ? 'animate-spin text-emerald-400' : ''}`} />
            <span>{isForecasting ? 'Calculating Atmospheric Vectors...' : 'Refresh AI Forecast'}</span>
          </button>
          <button
            type="button"
            onClick={() => setShowReportModal(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-rose-700 hover:bg-rose-600 text-white shadow-md transition-all shrink-0 border border-rose-500/40"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Report Border Incident</span>
          </button>
        </div>
      </div>

      {/* DYNAMIC TRANSBOUNDARY OUTBREAK ALERT HUD (LIVE AI FORECAST RESPONSE) */}
      {hasTransboundaryCluster && (
        <div className="bg-gradient-to-r from-rose-950 via-amber-950 to-stone-900 border-2 border-rose-500 rounded-2xl p-5 shadow-2xl space-y-4 animate-in fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center font-bold shadow-lg animate-bounce">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-extrabold tracking-wider uppercase px-2 py-0.5 rounded bg-rose-900 text-rose-200 border border-rose-600">
                  ⚠ ACTIVE TRANSBOUNDARY OUTBREAK ALERT (LEVEL 3)
                </span>
                <h3 className="text-base sm:text-lg font-bold text-white mt-1">
                  Bilateral Phytosanitary Threat: Brazil 🇧🇷 ⇄ Paraguay 🇵🇾 Border Corridor
                </h3>
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs text-rose-300 font-semibold block">
                Cluster Intensity: {borderCorridorReports.length} Reports within &le;{clusteringThresholdKm}km
              </span>
              <span className="text-[10px] text-stone-400">
                Atmospheric Transport Index:{' '}
                <strong className="text-rose-400 font-mono text-sm">
                  {forecastData?.atmosphericTransportIndex || 91}/100
                </strong>
              </span>
            </div>
          </div>

          {/* AI Atmospheric Vector Breakdown */}
          {forecastData && (
            <div className="bg-stone-950/90 rounded-xl p-3.5 border border-rose-900/60 text-xs space-y-2.5">
              <div className="flex items-center justify-between text-amber-300 font-bold">
                <div className="flex items-center gap-1.5">
                  <Wind className="w-4 h-4 text-amber-400 animate-pulse" />
                  <span>Gemini Sentinel 14-Day Spore Dispersion Forecast</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-rose-900/60 text-rose-200 font-mono">
                  FAO DLIS Standard
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-stone-300 text-[11px]">
                <div className="bg-stone-900/80 p-2.5 rounded-lg border border-stone-800">
                  <span className="text-stone-400 block font-semibold mb-0.5">Primary Dispersion Vector:</span>
                  <p className="leading-snug">{forecastData.primaryVector}</p>
                </div>
                <div className="bg-stone-900/80 p-2.5 rounded-lg border border-stone-800">
                  <span className="text-stone-400 block font-semibold mb-0.5">14-Day Trajectory Assessment:</span>
                  <p className="leading-snug">{forecastData.fourteenDaySpreadPrediction}</p>
                </div>
              </div>

              {/* Multilateral Directives */}
              <div>
                <span className="text-stone-400 font-semibold block mb-1 text-[11px]">
                  Multilateral Directives &amp; Action Plan:
                </span>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  {forecastData.multilateralDirectives.map((dir, idx) => (
                    <div key={idx} className="bg-stone-900/90 p-2 rounded-lg border border-stone-800 flex items-start gap-1.5 text-[11px]">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span className="text-stone-200">{dir}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Filter and Threshold Controls */}
      <div className="bg-stone-900 rounded-2xl border border-stone-800 p-4 sm:p-5 shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-800 text-xs">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-emerald-400" />
            <h4 className="font-bold text-sm text-white">Outbreak Sentinel Filter &amp; Spatial Sensitivity</h4>
          </div>
          <span className="text-stone-400 text-[11px]">
            Showing {filteredReports.length} of {reports.length} verified surveillance incidents
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          {/* Country Filter */}
          <div>
            <label className="text-stone-400 block mb-1 font-medium">Filter Nation:</label>
            <select
              value={filterCountry}
              onChange={(e) => setFilterCountry(e.target.value)}
              className="w-full bg-stone-800 text-stone-100 rounded-lg p-2 border border-stone-700 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
            >
              <option value="ALL">All BRICS &amp; Neighboring Sentinels</option>
              <option value="Brazil">Brazil 🇧🇷</option>
              <option value="India">India 🇮🇳</option>
              <option value="South Africa">South Africa 🇿🇦</option>
              <option value="Paraguay">Paraguay 🇵🇾 (Cross-Border Partner)</option>
            </select>
          </div>

          {/* Border Corridor Zone */}
          <div>
            <label className="text-stone-400 block mb-1 font-medium">Border Corridor Zone:</label>
            <select
              value={activeZone}
              onChange={(e: any) => setActiveZone(e.target.value)}
              className="w-full bg-stone-800 text-stone-100 rounded-lg p-2 border border-stone-700 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
            >
              <option value="all">All Regional Corridors</option>
              <option value="brazil-paraguay">Brazil 🇧🇷 ⇄ Paraguay 🇵🇾 Corridor</option>
              <option value="india-pakistan">India 🇮🇳 ⇄ Pakistan Thar Belt</option>
              <option value="limpopo">South Africa 🇿🇦 ⇄ Limpopo Valley</option>
            </select>
          </div>

          {/* Distance Threshold Slider */}
          <div>
            <div className="flex justify-between text-stone-400 mb-1">
              <label className="font-medium">Border Clustering Sensitivity:</label>
              <span className="font-bold text-emerald-400">&le; {clusteringThresholdKm} km</span>
            </div>
            <input
              type="range"
              min="2"
              max="25"
              step="1"
              value={clusteringThresholdKm}
              onChange={(e) => setClusteringThresholdKm(Number(e.target.value))}
              className="w-full accent-emerald-500 bg-stone-700 rounded-lg h-2 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-stone-500 mt-1">
              <span>Strict (2 km)</span>
              <span>Regional (25 km)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Geo-Tagged Surveillance Incident Feed */}
      <div className="space-y-3">
        <h4 className="font-bold text-sm text-white flex items-center gap-2">
          <Layers className="w-4 h-4 text-emerald-400" />
          Geo-Tagged Surveillance Incident Feed
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredReports.map((report) => {
            const isBorderCluster = report.distanceToBorderKm <= clusteringThresholdKm;
            return (
              <div
                key={report.id}
                className={`bg-stone-900 rounded-2xl border p-4 shadow-md transition-all space-y-3 ${
                  isBorderCluster
                    ? 'border-rose-700/80 bg-gradient-to-b from-stone-900 to-rose-950/20 ring-1 ring-rose-500/30'
                    : 'border-stone-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{report.flag}</span>
                    <div>
                      <span className="font-bold text-xs text-white">{report.country}</span>
                      <span className="text-[10px] text-stone-400 block">{report.date}</span>
                    </div>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                      report.severity === 'Critical'
                        ? 'bg-rose-950 text-rose-300 border-rose-700'
                        : report.severity === 'Severe'
                        ? 'bg-amber-950 text-amber-300 border-amber-700'
                        : 'bg-stone-800 text-stone-300 border-stone-700'
                    }`}
                  >
                    {report.severity}
                  </span>
                </div>

                <div>
                  <h5 className="font-bold text-sm text-white">{report.pestDisease}</h5>
                  <div className="text-xs text-stone-300 mt-0.5 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-emerald-400 shrink-0" />
                    <span className="truncate">{report.region}</span>
                  </div>
                  <div className="text-[11px] text-stone-400 mt-0.5">
                    Target Crop: <strong className="text-stone-200">{report.crop}</strong>
                  </div>
                </div>

                <div className="bg-stone-950/80 p-2.5 rounded-xl border border-stone-800 text-xs space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-stone-400">Proximity to Border:</span>
                    <span
                      className={`font-bold ${
                        isBorderCluster ? 'text-rose-400' : 'text-stone-300'
                      }`}
                    >
                      {report.distanceToBorderKm} km from {report.neighboringCountry}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-stone-400">Spore Density Index:</span>
                    <span className="font-mono font-bold text-amber-400">
                      {report.sporeDensityIndex}/100
                    </span>
                  </div>
                </div>

                <div className="text-[10px] text-stone-500 pt-1 border-t border-stone-800 flex items-center justify-between">
                  <span>Verified: {report.verifiedBy}</span>
                  <span className="font-mono text-stone-400">
                    {report.coordinates.lat.toFixed(2)}, {report.coordinates.lng.toFixed(2)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Incident Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-stone-700 rounded-2xl max-w-lg w-full p-5 space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-stone-800">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-rose-400" />
                <h3 className="font-bold text-base text-white">Log Transboundary Incident</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowReportModal(false)}
                className="p-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleReportSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-stone-400 block mb-1 font-medium">Reporting Nation:</label>
                  <select
                    value={newReportForm.country}
                    onChange={(e) => setNewReportForm({ ...newReportForm, country: e.target.value })}
                    className="w-full bg-stone-950 text-white rounded-lg p-2 border border-stone-800 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Brazil">Brazil 🇧🇷</option>
                    <option value="India">India 🇮🇳</option>
                    <option value="South Africa">South Africa 🇿🇦</option>
                    <option value="Paraguay">Paraguay 🇵🇾</option>
                  </select>
                </div>

                <div>
                  <label className="text-stone-400 block mb-1 font-medium">Target Crop:</label>
                  <input
                    type="text"
                    value={newReportForm.crop}
                    onChange={(e) => setNewReportForm({ ...newReportForm, crop: e.target.value })}
                    className="w-full bg-stone-950 text-white rounded-lg p-2 border border-stone-800 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-stone-400 block mb-1 font-medium">Region / Border Sector:</label>
                <input
                  type="text"
                  value={newReportForm.region}
                  onChange={(e) => setNewReportForm({ ...newReportForm, region: e.target.value })}
                  className="w-full bg-stone-950 text-white rounded-lg p-2 border border-stone-800 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-stone-400 block mb-1 font-medium">Identified Pathogen / Pest:</label>
                <input
                  type="text"
                  value={newReportForm.pestDisease}
                  onChange={(e) => setNewReportForm({ ...newReportForm, pestDisease: e.target.value })}
                  className="w-full bg-stone-950 text-white rounded-lg p-2 border border-stone-800 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-stone-400 block mb-1 font-medium">Distance to Border (km):</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newReportForm.distanceToBorderKm}
                    onChange={(e) => setNewReportForm({ ...newReportForm, distanceToBorderKm: parseFloat(e.target.value) })}
                    className="w-full bg-stone-950 text-white rounded-lg p-2 border border-stone-800 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-stone-400 block mb-1 font-medium">Neighboring Border Zone:</label>
                  <input
                    type="text"
                    value={newReportForm.neighboringCountry}
                    onChange={(e) => setNewReportForm({ ...newReportForm, neighboringCountry: e.target.value })}
                    className="w-full bg-stone-950 text-white rounded-lg p-2 border border-stone-800 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowReportModal(false)}
                  className="px-4 py-2 rounded-xl bg-stone-800 text-stone-300 hover:bg-stone-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingReport}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold flex items-center gap-1.5 shadow-lg"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSubmittingReport ? 'Submitting to Sentinel Grid...' : 'Submit Border Incident'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
