import React, { useState } from 'react';
import { FarmerProfile, FarmFieldProfile, FarmerConsentSettings, PushAlertNotification } from '../types';
import { DEMO_FARM_FIELDS, INITIAL_NOTIFICATIONS } from '../data/cooperativeData';
import { INITIAL_CONSENT_SETTINGS } from '../data/governanceData';
import {
  MapPin,
  Layers,
  ShieldCheck,
  Bell,
  WifiOff,
  Wifi,
  Download,
  Trash2,
  Plus,
  CheckCircle2,
  Save,
  Lock,
  Database,
  Smartphone,
  Sparkles,
  Info,
} from 'lucide-react';

interface FarmProfileTabProps {
  currentFarmer: FarmerProfile | null;
  onOpenAuth: () => void;
}

export function FarmProfileTab({ currentFarmer, onOpenAuth }: FarmProfileTabProps) {
  const [fields, setFields] = useState<FarmFieldProfile[]>(DEMO_FARM_FIELDS);
  const [selectedField, setSelectedField] = useState<FarmFieldProfile>(DEMO_FARM_FIELDS[0]);
  const [consentSettings, setConsentSettings] = useState<FarmerConsentSettings>(INITIAL_CONSENT_SETTINGS);
  const [notifications, setNotifications] = useState<PushAlertNotification[]>(INITIAL_NOTIFICATIONS);
  const [isOfflineModeSimulated, setIsOfflineModeSimulated] = useState<boolean>(false);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);

  // New field creator state
  const [showNewFieldModal, setShowNewFieldModal] = useState<boolean>(false);
  const [newFieldName, setNewFieldName] = useState<string>('');
  const [newFieldAreaHa, setNewFieldAreaHa] = useState<number>(2.5);
  const [newFieldIrrigation, setNewFieldIrrigation] = useState<FarmFieldProfile['irrigationType']>('Solar Canal');
  const [newFieldSoil, setNewFieldSoil] = useState<string>('Alluvial Loam');

  const handleAddNewField = () => {
    if (!newFieldName.trim()) return;
    const newField: FarmFieldProfile = {
      id: `field-custom-${Date.now()}`,
      farmerId: currentFarmer?.id || 'farmer_guest',
      fieldName: newFieldName,
      areaHa: newFieldAreaHa,
      soilTexture: newFieldSoil,
      irrigationType: newFieldIrrigation,
      boundaryGeoJson: {
        type: 'Polygon',
        coordinates: [
          [75.860, 30.905],
          [75.864, 30.905],
          [75.864, 30.900],
          [75.860, 30.900],
          [75.860, 30.905],
        ],
      },
      cropHistory: [{ season: 'Current Season', crop: currentFarmer?.cropFocus || 'Wheat', yieldTons: 12.5 }],
      fieldHealthScore: 90,
      hasSoilSensorConnected: true,
    };
    setFields([...fields, newField]);
    setSelectedField(newField);
    setNewFieldName('');
    setShowNewFieldModal(false);
    showNotice('New parcel polygon registered to your sovereign farm profile.');
  };

  const handleSaveConsent = () => {
    setConsentSettings({
      ...consentSettings,
      lastUpdated: new Date().toISOString().split('T')[0],
    });
    showNotice('Data sovereignty consent settings updated on secure local ledger.');
  };

  const showNotice = (msg: string) => {
    setSaveSuccessMessage(msg);
    setTimeout(() => setSaveSuccessMessage(null), 4000);
  };

  const handleExportData = () => {
    const exportPayload = {
      farmer: currentFarmer,
      fields,
      consentSettings,
      exportTimestamp: new Date().toISOString(),
      format: 'AgGateway_ADAPT_JSON_V4',
    };
    const blob = new Blob([JSON.stringify(exportPayload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `brics-farmer-profile-${currentFarmer?.id || 'export'}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showNotice('Full farm profile & GeoJSON exported in AgGateway ADAPT standard.');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-12">
      {/* Toast Notice */}
      {saveSuccessMessage && (
        <div className="p-4 rounded-2xl bg-emerald-950/90 border border-emerald-600 text-emerald-200 text-xs font-semibold flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{saveSuccessMessage}</span>
          </div>
        </div>
      )}

      {/* Header Profile Section */}
      <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-emerald-950 border border-emerald-700/60 flex items-center justify-center text-3xl shadow-inner shrink-0">
              {currentFarmer?.avatarUrl ? (
                <img
                  src={currentFarmer.avatarUrl}
                  alt={currentFarmer.farmerName}
                  className="w-full h-full object-cover rounded-2xl"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <span>{currentFarmer?.flag || '🌾'}</span>
              )}
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-bold text-white font-serif">
                  {currentFarmer ? currentFarmer.farmerName : 'Smallholder Farm Profile'}
                </h1>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-700/50 font-bold uppercase">
                  {currentFarmer?.role || 'Farmer'}
                </span>
              </div>
              <p className="text-xs text-stone-300">
                {currentFarmer
                  ? `${currentFarmer.region}, ${currentFarmer.country} • ${currentFarmer.farmSizeHa} Hectares • Crop Focus: ${currentFarmer.cropFocus}`
                  : 'Manage parcel boundary GeoJSON, offline cached advisories, alerts, and data sovereignty consent.'}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setIsOfflineModeSimulated(!isOfflineModeSimulated)}
              className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 border transition-all ${
                isOfflineModeSimulated
                  ? 'bg-amber-950/80 border-amber-600 text-amber-200'
                  : 'bg-stone-800 border-stone-700 text-stone-200 hover:bg-stone-700'
              }`}
            >
              {isOfflineModeSimulated ? (
                <>
                  <WifiOff className="w-4 h-4 text-amber-400" />
                  <span>Offline Mode (Cached Sync)</span>
                </>
              ) : (
                <>
                  <Wifi className="w-4 h-4 text-emerald-400" />
                  <span>Online (Connected)</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleExportData}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 transition-all flex items-center gap-2"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span>Export Farm Profile</span>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT 2 COLUMNS: FIELD MAPPING & PARCELS */}
        <div className="lg:col-span-2 space-y-6">
          {/* Field Selector & Interactive SVG GeoJSON Boundary Canvas */}
          <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 space-y-4 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-emerald-400" />
                  <span>Interactive Field Mapping &amp; Polygon Boundary (GeoJSON)</span>
                </h3>
                <p className="text-xs text-stone-400">
                  Select a farm parcel to inspect boundary coordinates, soil texture, and sensor health.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowNewFieldModal(true)}
                className="px-3 py-1.5 rounded-xl bg-emerald-950 hover:bg-emerald-900 border border-emerald-700/60 text-emerald-200 text-xs font-semibold flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Parcel</span>
              </button>
            </div>

            {/* Field Pills Selector */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 section-scrollbar">
              {fields.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setSelectedField(f)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
                    selectedField.id === f.id
                      ? 'bg-emerald-950 text-emerald-200 border-emerald-500 shadow-sm ring-1 ring-emerald-400/50'
                      : 'bg-stone-950 text-stone-300 border-stone-800 hover:border-stone-700'
                  }`}
                >
                  {f.fieldName} ({f.areaHa} ha)
                </button>
              ))}
            </div>

            {/* Interactive Vector Map Canvas Mockup */}
            <div className="relative rounded-2xl bg-stone-950 border border-stone-800 p-6 overflow-hidden min-h-[260px] flex flex-col justify-between">
              <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:16px_16px]" />

              {/* Map Header Overlay */}
              <div className="relative z-10 flex items-center justify-between text-xs">
                <span className="font-mono text-emerald-400 bg-stone-900/90 px-3 py-1 rounded-lg border border-stone-800">
                  CRS: EPSG:4326 (WGS 84) • Sentinel-2 Grid
                </span>
                <span className="text-emerald-300 font-bold bg-emerald-950/80 px-2.5 py-1 rounded-lg border border-emerald-700/50">
                  Field Health Score: {selectedField.fieldHealthScore}/100
                </span>
              </div>

              {/* Simulated GeoJSON Polygon SVG */}
              <div className="relative z-10 my-4 flex items-center justify-center">
                <svg viewBox="0 0 300 160" className="w-full max-w-sm h-36 drop-shadow-md">
                  {/* Surrounding background field parcels */}
                  <polygon points="10,20 120,10 110,70 20,80" fill="#1c1917" stroke="#44403c" strokeWidth="1" strokeDasharray="3 3" />
                  <polygon points="130,15 280,30 270,90 125,75" fill="#1c1917" stroke="#44403c" strokeWidth="1" strokeDasharray="3 3" />
                  {/* Active highlighted field polygon */}
                  <polygon
                    points="60,60 220,50 200,140 50,130"
                    fill="rgba(16, 185, 129, 0.25)"
                    stroke="#10b981"
                    strokeWidth="2.5"
                    className="animate-pulse"
                  />
                  {/* Vertex pins */}
                  <circle cx="60" cy="60" r="4" fill="#34d399" />
                  <circle cx="220" cy="50" r="4" fill="#34d399" />
                  <circle cx="200" cy="140" r="4" fill="#34d399" />
                  <circle cx="50" cy="130" r="4" fill="#34d399" />
                  {/* Centroid label */}
                  <text x="135" y="100" fill="#ffffff" fontSize="11" fontWeight="bold" textAnchor="middle">
                    {selectedField.fieldName}
                  </text>
                  <text x="135" y="115" fill="#6ee7b7" fontSize="9" textAnchor="middle">
                    {selectedField.areaHa} Ha • {selectedField.irrigationType}
                  </text>
                </svg>
              </div>

              {/* GeoJSON Raw Coordinates Viewer */}
              <div className="relative z-10 bg-stone-900/90 rounded-xl p-3 border border-stone-800 text-[11px] font-mono text-stone-300 overflow-x-auto section-scrollbar">
                <span className="text-emerald-400">Boundary Polygon Vertices: </span>
                {JSON.stringify(selectedField.boundaryGeoJson.coordinates)}
              </div>
            </div>

            {/* Field Details Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="bg-stone-950 p-3 rounded-xl border border-stone-800">
                <div className="text-stone-500">Soil Texture</div>
                <div className="font-bold text-white mt-0.5">{selectedField.soilTexture}</div>
              </div>
              <div className="bg-stone-950 p-3 rounded-xl border border-stone-800">
                <div className="text-stone-500">Irrigation Mode</div>
                <div className="font-bold text-white mt-0.5">{selectedField.irrigationType}</div>
              </div>
              <div className="bg-stone-950 p-3 rounded-xl border border-stone-800">
                <div className="text-stone-500">IoT Sensor Node</div>
                <div className="font-bold text-emerald-400 mt-0.5">
                  {selectedField.hasSoilSensorConnected ? '✅ LoRaWAN Active' : 'Manual Sampling'}
                </div>
              </div>
              <div className="bg-stone-950 p-3 rounded-xl border border-stone-800">
                <div className="text-stone-500">Crop Seasons Logged</div>
                <div className="font-bold text-white mt-0.5">{selectedField.cropHistory.length} Seasons</div>
              </div>
            </div>
          </div>

          {/* Granular Data Sovereignty & Consent Settings */}
          <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 space-y-4 shadow-lg">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <span>Granular Data Privacy &amp; Consent Management (Zero-Leakage)</span>
              </h3>
              <button
                type="button"
                onClick={handleSaveConsent}
                className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Consent</span>
              </button>
            </div>
            <p className="text-xs text-stone-400">
              BRICS AgriNet guarantees that raw data never leaves sovereign national custody. Control how anonymized parameters are used.
            </p>

            <div className="space-y-3 pt-2">
              {[
                {
                  key: 'shareGpsForAdvisories',
                  label: 'Field GPS Polygon for Local Weather & Satellite NDVI',
                  desc: 'Enables high-precision 10m Sentinel-2 spectral analysis and microclimate alerts.',
                },
                {
                  key: 'shareSoilTestAnonymously',
                  label: 'Anonymous Soil Test Contribution to Sovereign Nutrient Registry',
                  desc: 'Assists ICAR, Embrapa, and ARC in training sovereign regional fertility maps without identifying your farm.',
                },
                {
                  key: 'shareCropImageryForResearch',
                  label: 'Anonymized Leaf Pathogen Photos for AI Diagnostic Retraining',
                  desc: 'Shares disease crop images stripped of EXIF metadata for cross-border research.',
                },
                {
                  key: 'allowFederatedGradients',
                  label: 'Participate in Privacy-Preserving DP-FedAvg Gradient Rounds',
                  desc: 'Only mathematical model weight deltas with differential privacy (epsilon=0.5) are computed.',
                },
                {
                  key: 'optInSmsAlerts',
                  label: 'Emergency SMS / USSD Broadcast for Transboundary Pest Warnings',
                  desc: 'Receives critical cellular alerts even without internet access.',
                },
              ].map((item) => (
                <div
                  key={item.key}
                  className="p-3.5 rounded-xl bg-stone-950 border border-stone-800 flex items-start justify-between gap-4"
                >
                  <div className="space-y-0.5">
                    <div className="font-bold text-xs text-white">{item.label}</div>
                    <div className="text-[11px] text-stone-400">{item.desc}</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={(consentSettings as any)[item.key]}
                    onChange={(e) =>
                      setConsentSettings({
                        ...consentSettings,
                        [item.key]: e.target.checked,
                      })
                    }
                    className="w-4 h-4 accent-emerald-500 rounded cursor-pointer mt-1"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: PUSH NOTIFICATIONS & OFFLINE CACHE */}
        <div className="space-y-6">
          {/* Notifications Center */}
          <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 space-y-4 shadow-lg">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Bell className="w-4 h-4 text-emerald-400" />
                <span>Push Alerts &amp; Advisories</span>
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 font-bold border border-emerald-700/50">
                {notifications.filter((n) => !n.read).length} Unread
              </span>
            </div>

            <div className="space-y-3">
              {notifications.map((n) => (
                <div
                  key={n.id}
                  className={`p-3.5 rounded-xl border text-xs space-y-1.5 transition-all ${
                    !n.read
                      ? 'bg-stone-950/90 border-emerald-700/60'
                      : 'bg-stone-950/50 border-stone-800 text-stone-400'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-bold text-white">{n.title}</span>
                    <span className="text-[10px] text-stone-500 shrink-0">{n.timestamp}</span>
                  </div>
                  <p className="text-[11px] text-stone-300 leading-relaxed">{n.body}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Offline Cache Status Card */}
          <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 space-y-4 shadow-lg">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Database className="w-4 h-4 text-emerald-400" />
              <span>Offline Database &amp; Sync Cache</span>
            </h3>
            <p className="text-xs text-stone-400">
              Cached agronomic advisories, diagnostic photo history, and weather forecasts remain accessible in remote field locations without network connectivity.
            </p>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between p-2.5 rounded-xl bg-stone-950 border border-stone-800">
                <span className="text-stone-400">Cached In-Situ Telemetries:</span>
                <span className="font-bold text-white font-mono">6 BRICS Plots</span>
              </div>
              <div className="flex justify-between p-2.5 rounded-xl bg-stone-950 border border-stone-800">
                <span className="text-stone-400">Offline Diagnostic Models:</span>
                <span className="font-bold text-emerald-400 font-mono">Loaded (IndexedDB)</span>
              </div>
              <div className="flex justify-between p-2.5 rounded-xl bg-stone-950 border border-stone-800">
                <span className="text-stone-400">Last Synced with Sovereign Node:</span>
                <span className="font-bold text-stone-300">Just now</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal for adding a new field parcel */}
      {showNewFieldModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-stone-700 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="text-lg font-bold text-white">Register New Field Parcel</h3>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-stone-400 mb-1 font-semibold">Parcel Name / Identifier:</label>
                <input
                  type="text"
                  placeholder="e.g. North Khasra #8B"
                  value={newFieldName}
                  onChange={(e) => setNewFieldName(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl p-2.5 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-stone-400 mb-1 font-semibold">Area (Hectares):</label>
                <input
                  type="number"
                  step="0.1"
                  value={newFieldAreaHa}
                  onChange={(e) => setNewFieldAreaHa(parseFloat(e.target.value))}
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl p-2.5 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-stone-400 mb-1 font-semibold">Irrigation Mode:</label>
                <select
                  value={newFieldIrrigation}
                  onChange={(e) => setNewFieldIrrigation(e.target.value as any)}
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl p-2.5 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="Solar Canal">Solar Canal</option>
                  <option value="Drip Micro-irrigation">Drip Micro-irrigation</option>
                  <option value="Sprinkler">Sprinkler</option>
                  <option value="Rainfed Lowland">Rainfed Lowland</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={() => setShowNewFieldModal(false)}
                className="px-4 py-2 rounded-xl bg-stone-800 text-stone-300 text-xs font-semibold hover:bg-stone-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddNewField}
                className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-500"
              >
                Save Parcel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
