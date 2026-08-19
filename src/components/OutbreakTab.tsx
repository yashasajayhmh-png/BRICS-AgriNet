import React, { useState } from 'react';
import { OutbreakReport } from '../types';
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
} from 'lucide-react';

export function OutbreakTab() {
  const [reports, setReports] = useState<OutbreakReport[]>(OUTBREAK_REPORTS);
  const [filterCountry, setFilterCountry] = useState<string>('ALL');
  const [clusteringThresholdKm, setClusteringThresholdKm] = useState<number>(10.0); // km to border
  const [activeZone, setActiveZone] = useState<'all' | 'brazil-paraguay' | 'india-pakistan' | 'limpopo'>('all');

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

  // Calculate cluster alert for Brazil-Paraguay border corridor
  const borderCorridorReports = reports.filter(
    (r) => r.distanceToBorderKm <= clusteringThresholdKm
  );
  const hasTransboundaryCluster = borderCorridorReports.length >= 2;

  // Add a simulated incident report
  const addSimulatedIncident = () => {
    const newReport: OutbreakReport = {
      id: `out-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      country: 'Brazil',
      flag: '🇧🇷',
      region: 'Mato Grosso do Sul (Coronel Sapucaia Border Zone)',
      crop: 'Soybean',
      pestDisease: 'Asian Soybean Rust Spore Plume',
      severity: 'Critical',
      sporeDensityIndex: 96,
      coordinates: { lat: -23.2725, lng: -55.5342 },
      distanceToBorderKm: 1.8,
      neighboringCountry: 'Paraguay (Capitán Bado Corridor)',
      verifiedBy: 'EMATER-MS Fast-Response Team',
    };
    setReports([newReport, ...reports]);
  };

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
              🚨 Simulated Early-Warning Layer
            </span>
          </div>
          <p className="text-xs sm:text-sm text-stone-300 mt-1 max-w-3xl">
            Detects high-density phytosanitary spore clouds and pest swarms clustering along shared sovereign borders.
            When clustering crosses spatial risk thresholds, automated bilateral early warning protocols are triggered.
          </p>
        </div>

        <button
          type="button"
          onClick={addSimulatedIncident}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-rose-700 hover:bg-rose-600 text-white shadow-md transition-all shrink-0 border border-rose-500/40"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Simulate Spore Spike (+1)</span>
        </button>
      </div>

      {/* TRANSBOUNDARY OUTBREAK ALERT BANNER (FAO Desert Locust early-warning pattern) */}
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
                Spore Density Index: <strong className="text-rose-400">92/100 (Severe Diffusion)</strong>
              </span>
            </div>
          </div>

          {/* FAO Desert Locust Model Analogy Caption */}
          <div className="bg-stone-950/80 rounded-xl p-3 border border-rose-900/60 text-xs space-y-2">
            <div className="flex items-center gap-1.5 font-bold text-amber-300">
              <Wind className="w-4 h-4 text-amber-400" />
              Modelled on FAO Desert Locust &amp; Transboundary Spore Early-Warning Protocol
            </div>
            <p className="text-stone-300 leading-relaxed text-[11px]">
              Airborne fungal pathogens (e.g. <em>Phakopsora pachyrhizi</em> / Asian Soybean Rust) and locust swarms
              ignore political boundaries. Just as the FAO Locust Watch coordinates joint aerial spraying across Red Sea
              borders, this sentinel automatically synchronizes biopesticide barriers between neighboring BRICS nations.
            </p>
          </div>

          {/* Recommended Joint Mitigation Checklist */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 text-xs">
            <div className="bg-stone-900/90 p-2.5 rounded-xl border border-stone-800 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block">Synchronized Spray Window</strong>
                <span className="text-stone-400 text-[11px]">Deploy triazole/carboxamide within 36 hrs across 20km buffer.</span>
              </div>
            </div>

            <div className="bg-stone-900/90 p-2.5 rounded-xl border border-stone-800 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block">Automated Spore Trap Mesh</strong>
                <span className="text-stone-400 text-[11px]">Activate optical particulate sensors along border highways.</span>
              </div>
            </div>

            <div className="bg-stone-900/90 p-2.5 rounded-xl border border-stone-800 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block">Farmer SMS Blast Dispatch</strong>
                <span className="text-stone-400 text-[11px]">Push geo-fenced WhatsApp/SMS alerts to 4,200 border smallholders.</span>
              </div>
            </div>
          </div>
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

      {/* Map-less Incident Reports Grid */}
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
                {/* Top row: Flag, Date, Severity */}
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

                {/* Pest & Region */}
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

                {/* Border Proximity Banner */}
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

                {/* Verification Authority */}
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
    </div>
  );
}
