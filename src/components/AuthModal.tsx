import React, { useState, useEffect } from 'react';
import { FarmerProfile, PlotTelemetry } from '../types';
import { DEMO_FARMERS } from '../data/mockData';
import { setStoredAuthToken } from '../services/api';
import { signInWithGoogle } from '../lib/firebase';
import { saveUserProfileToFirestore } from '../services/firestoreService';
import {
  X,
  User,
  Phone,
  Sprout,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  MapPin,
  Building,
  LogIn,
  UserPlus,
  Globe,
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentFarmer: FarmerProfile | null;
  onLoginSuccess: (farmer: FarmerProfile) => void;
  availablePlots: PlotTelemetry[];
}

export function AuthModal({
  isOpen,
  onClose,
  currentFarmer,
  onLoginSuccess,
  availablePlots,
}: AuthModalProps) {
  const [authMode, setAuthMode] = useState<'demo' | 'login' | 'register'>('demo');
  const [identifier, setIdentifier] = useState('');
  const [farmersList, setFarmersList] = useState<FarmerProfile[]>(DEMO_FARMERS as FarmerProfile[]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Registration Form State
  const [regName, setRegName] = useState('');
  const [regContact, setRegContact] = useState('');
  const [regCountry, setRegCountry] = useState('India');
  const [regRegion, setRegRegion] = useState('');
  const [regCrop, setRegCrop] = useState('');
  const [regFarmSize, setRegFarmSize] = useState('2.5');
  const [regPlotId, setRegPlotId] = useState('in-punjab-01');
  const [regRole, setRegRole] = useState<'farmer' | 'extension_officer'>('farmer');

  // Load server-persisted farmers
  useEffect(() => {
    if (isOpen) {
      fetch('/api/auth/farmers')
        .then((res) => res.json())
        .then((json) => {
          if (json.success && Array.isArray(json.data) && json.data.length > 0) {
            setFarmersList(json.data);
          }
        })
        .catch(() => {
          // fallback to demo farmers
          setFarmersList(DEMO_FARMERS as FarmerProfile[]);
        });
      setErrorMsg(null);
      setSuccessMsg(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleDemoSelect = async (farmer: FarmerProfile) => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: farmer.id }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        if (data.token) {
          setStoredAuthToken(data.token);
        }
        setSuccessMsg(`Welcome, ${data.data.farmerName}!`);
        setTimeout(() => {
          onLoginSuccess(data.data);
          onClose();
        }, 500);
      } else {
        // Fallback to local profile
        onLoginSuccess(farmer);
        onClose();
      }
    } catch {
      onLoginSuccess(farmer);
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const user = await signInWithGoogle();
      if (user) {
        const idToken = await user.getIdToken();
        setStoredAuthToken(idToken);
        const googleFarmer: FarmerProfile = {
          id: user.uid,
          farmerName: user.displayName || user.email?.split('@')[0] || 'BRICS Producer',
          phoneOrEmail: user.email || user.phoneNumber || user.uid,
          country: 'India',
          flag: '🇮🇳',
          region: 'BRICS Unified Agricultural Node',
          cropFocus: 'Multispectral Mixed Crops',
          farmSizeHa: 3.5,
          plotId: 'in-punjab-01',
          role: user.email === 'yashasajayhmh@gmail.com' ? 'admin' : 'farmer',
          avatarUrl: user.photoURL || undefined,
          createdAt: new Date().toISOString().split('T')[0],
        };
        // Persist profile to Firestore
        await saveUserProfileToFirestore(googleFarmer);
        setSuccessMsg(`Welcome, ${googleFarmer.farmerName}! Signed in via Firebase Auth.`);
        setTimeout(() => {
          onLoginSuccess(googleFarmer);
          onClose();
        }, 500);
      }
    } catch (err: any) {
      console.warn('Firebase Google Auth error:', err);
      setErrorMsg(err.message || 'Google Sign-In failed or popup was closed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    if (!identifier.trim()) {
      setErrorMsg('Please enter your phone number, email, or Farmer ID.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: identifier.trim() }),
      });
      const data = await res.json();

      if (data.success && data.data) {
        if (data.token) {
          setStoredAuthToken(data.token);
        }
        setSuccessMsg(`Authenticated successfully! Welcome, ${data.data.farmerName}.`);
        setTimeout(() => {
          onLoginSuccess(data.data);
          onClose();
        }, 600);
      } else {
        setErrorMsg(data.error || 'Farmer profile not found. Please try a registered demo profile or create a new account.');
      }
    } catch (err: any) {
      setErrorMsg('Network error while connecting to authentication service.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }
    if (!regContact.trim()) {
      setErrorMsg('Please provide a valid phone number or email address.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const countryFlags: Record<string, string> = {
      India: '🇮🇳',
      Brazil: '🇧🇷',
      'South Africa': '🇿🇦',
      China: '🇨🇳',
      Egypt: '🇪🇬',
      Ethiopia: '🇪🇹',
      Russia: '🇷🇺',
    };

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          farmerName: regName.trim(),
          phoneOrEmail: regContact.trim(),
          country: regCountry,
          flag: countryFlags[regCountry] || '🌐',
          region: regRegion.trim() || `${regCountry} Agricultural Corridor`,
          cropFocus: regCrop.trim() || 'Mixed Crops',
          farmSizeHa: parseFloat(regFarmSize) || 2.0,
          plotId: regPlotId,
          role: regRole,
        }),
      });
      const data = await res.json();

      if (data.success && data.data) {
        if (data.token) {
          setStoredAuthToken(data.token);
        }
        setSuccessMsg(`Registration complete! Welcome to BRICS AgriNet, ${data.data.farmerName}.`);
        setTimeout(() => {
          onLoginSuccess(data.data);
          onClose();
        }, 800);
      } else {
        setErrorMsg(data.error || 'Failed to register farmer profile.');
      }
    } catch (err: any) {
      setErrorMsg('Network error during registration. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="bg-stone-900 border border-stone-800 rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-emerald-950 via-stone-900 to-stone-900 border-b border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-700/30 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Sprout className="w-5 h-5" />
            </div>
            <div>
              <h2 id="auth-modal-title" className="text-lg font-bold text-white font-serif tracking-tight">
                Farmer &amp; Agronomist Authentication
              </h2>
              <p className="text-xs text-stone-400">
                Sovereign access to localized agronomy, AI diagnostics &amp; in-situ telemetry
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-400"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Toggle */}
        <div className="flex border-b border-stone-800 bg-stone-950/60 px-6 pt-3 gap-2">
          <button
            type="button"
            onClick={() => {
              setAuthMode('demo');
              setErrorMsg(null);
            }}
            className={`pb-3 px-3 text-xs sm:text-sm font-semibold transition-all border-b-2 flex items-center gap-2 ${
              authMode === 'demo'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>1-Click BRICS Demo Profiles</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setAuthMode('login');
              setErrorMsg(null);
            }}
            className={`pb-3 px-3 text-xs sm:text-sm font-semibold transition-all border-b-2 flex items-center gap-2 ${
              authMode === 'login'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <LogIn className="w-4 h-4" />
            <span>Sign In</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setAuthMode('register');
              setErrorMsg(null);
            }}
            className={`pb-3 px-3 text-xs sm:text-sm font-semibold transition-all border-b-2 flex items-center gap-2 ${
              authMode === 'register'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            <span>Register New Farmer</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto space-y-4">
          {errorMsg && (
            <div className="p-3 bg-red-950/50 border border-red-800/60 rounded-xl text-red-300 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-950/50 border border-emerald-800/60 rounded-xl text-emerald-300 text-xs flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Firebase Google Auth Button */}
          <button
            type="button"
            disabled={isLoading}
            onClick={handleGoogleSignIn}
            className="w-full py-3 px-4 bg-stone-950 hover:bg-stone-800 border border-stone-700 hover:border-emerald-500/80 rounded-xl text-sm font-semibold text-white transition-all shadow-md flex items-center justify-center gap-3 focus:outline-none focus:ring-2 focus:ring-emerald-400 group cursor-pointer disabled:opacity-50"
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span className="group-hover:text-emerald-300 transition-colors">
              Continue with Firebase Google Auth
            </span>
          </button>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-stone-800" />
            <span className="text-[11px] font-medium text-stone-500 uppercase tracking-wider">or sign in with identity</span>
            <div className="flex-1 h-px bg-stone-800" />
          </div>

          {/* MODE 1: 1-Click Demo Profiles */}
          {authMode === 'demo' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-stone-300 uppercase tracking-wider">
                  Select a Verified BRICS Smallholder Profile
                </span>
                <span className="text-[11px] text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800/50">
                  Instant Simulation Sign-In
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {farmersList.map((farmer) => {
                  const isCurrent = currentFarmer?.id === farmer.id;
                  return (
                    <button
                      key={farmer.id}
                      type="button"
                      disabled={isLoading}
                      onClick={() => handleDemoSelect(farmer)}
                      className={`p-3 rounded-xl border text-left transition-all relative flex items-start gap-3 group ${
                        isCurrent
                          ? 'bg-emerald-950/40 border-emerald-500/80 shadow-md ring-1 ring-emerald-500/40'
                          : 'bg-stone-950/60 border-stone-800 hover:border-emerald-700/60 hover:bg-stone-900'
                      }`}
                    >
                      <div className="w-10 h-10 rounded-lg bg-stone-800 border border-stone-700 flex items-center justify-center text-xl shrink-0 overflow-hidden">
                        {farmer.avatarUrl ? (
                          <img
                            src={farmer.avatarUrl}
                            alt={farmer.farmerName}
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <span>{farmer.flag}</span>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-bold text-white truncate group-hover:text-emerald-300 transition-colors">
                            {farmer.farmerName}
                          </span>
                          <span className="text-xs">{farmer.flag}</span>
                        </div>
                        <div className="text-[11px] text-stone-400 truncate flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-stone-500 shrink-0" />
                          <span>{farmer.region}</span>
                        </div>
                        <div className="mt-1 flex items-center justify-between text-[10px] text-stone-400">
                          <span className="text-emerald-400 font-medium truncate">
                            {farmer.cropFocus}
                          </span>
                          {farmer.farmSizeHa > 0 && (
                            <span className="text-stone-500 shrink-0">
                              {farmer.farmSizeHa} ha
                            </span>
                          )}
                        </div>
                      </div>

                      {isCurrent && (
                        <div className="absolute top-2 right-2 text-emerald-400">
                          <CheckCircle2 className="w-4 h-4" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* MODE 2: Standard Sign In */}
          {authMode === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4 py-2">
              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                  Phone Number, Kisan ID, or Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-500">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="e.g. ramesh.patel@punjab.kisan.in or +91 98765 43210"
                    className="w-full bg-stone-950 border border-stone-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-stone-100 placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  />
                </div>
                <p className="text-[11px] text-stone-500 mt-1.5">
                  Smallholder passkeys are verified against the local BRICS sovereign agronomy database.
                </p>
              </div>

              <div className="bg-stone-950/80 rounded-xl p-3.5 border border-stone-800 text-xs text-stone-400 space-y-1.5">
                <div className="font-semibold text-stone-300 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Sovereign &amp; Zero-Leakage Privacy</span>
                </div>
                <p>
                  Your farm telemetry, fertilizer receipts, and visual leaf diagnoses are protected under differential privacy federated guarantees.
                </p>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-emerald-400 disabled:opacity-50"
              >
                {isLoading ? (
                  <span>Authenticating...</span>
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    <span>Sign In to AgriNet</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* MODE 3: Register New Farmer */}
          {authMode === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5 py-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1">
                    Farmer / Agronomist Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="e.g. Chen Jing or Kwame Nkosi"
                    className="w-full bg-stone-950 border border-stone-700 rounded-lg px-3 py-2 text-xs sm:text-sm text-stone-100 placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1">
                    Mobile Number / Email *
                  </label>
                  <input
                    type="text"
                    required
                    value={regContact}
                    onChange={(e) => setRegContact(e.target.value)}
                    placeholder="e.g. +86 138 0000 1234"
                    className="w-full bg-stone-950 border border-stone-700 rounded-lg px-3 py-2 text-xs sm:text-sm text-stone-100 placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1">
                    BRICS Nation
                  </label>
                  <select
                    value={regCountry}
                    onChange={(e) => {
                      setRegCountry(e.target.value);
                      // Auto pick matching plot
                      const plot = availablePlots.find((p) => p.country === e.target.value);
                      if (plot) setRegPlotId(plot.id);
                    }}
                    className="w-full bg-stone-950 border border-stone-700 rounded-lg px-3 py-2 text-xs sm:text-sm text-stone-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="India">🇮🇳 India</option>
                    <option value="Brazil">🇧🇷 Brazil</option>
                    <option value="South Africa">🇿🇦 South Africa</option>
                    <option value="China">🇨🇳 China</option>
                    <option value="Egypt">🇪🇬 Egypt</option>
                    <option value="Ethiopia">🇪🇹 Ethiopia</option>
                    <option value="Russia">🇷🇺 Russia</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1">
                    Role
                  </label>
                  <select
                    value={regRole}
                    onChange={(e) => setRegRole(e.target.value as any)}
                    className="w-full bg-stone-950 border border-stone-700 rounded-lg px-3 py-2 text-xs sm:text-sm text-stone-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="farmer">Smallholder Farmer</option>
                    <option value="extension_officer">Extension Agronomist</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1">
                    Farm Size (Hectares)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    value={regFarmSize}
                    onChange={(e) => setRegFarmSize(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-700 rounded-lg px-3 py-2 text-xs sm:text-sm text-stone-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1">
                    District / Region
                  </label>
                  <input
                    type="text"
                    value={regRegion}
                    onChange={(e) => setRegRegion(e.target.value)}
                    placeholder="e.g. Henan Plain, Yellow River Basin"
                    className="w-full bg-stone-950 border border-stone-700 rounded-lg px-3 py-2 text-xs sm:text-sm text-stone-100 placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1">
                    Primary Crop Focus
                  </label>
                  <input
                    type="text"
                    value={regCrop}
                    onChange={(e) => setRegCrop(e.target.value)}
                    placeholder="e.g. Winter Wheat, Safrinha Corn, Groundnut"
                    className="w-full bg-stone-950 border border-stone-700 rounded-lg px-3 py-2 text-xs sm:text-sm text-stone-100 placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">
                  Associated Telemetry Plot
                </label>
                <select
                  value={regPlotId}
                  onChange={(e) => setRegPlotId(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-700 rounded-lg px-3 py-2 text-xs sm:text-sm text-stone-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {availablePlots.map((plot) => (
                    <option key={plot.id} value={plot.id}>
                      {plot.flag} {plot.name} ({plot.crop} • {plot.region})
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-emerald-400 disabled:opacity-50 mt-2"
              >
                {isLoading ? (
                  <span>Registering Profile...</span>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span>Create Profile &amp; Enter Platform</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-stone-950 border-t border-stone-800 flex items-center justify-between text-xs text-stone-500">
          <span>BRICS Sovereign Agricultural Federated Network</span>
          <span className="text-emerald-400">Phase 0 MVP</span>
        </div>
      </div>
    </div>
  );
}
