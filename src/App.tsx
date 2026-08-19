/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { NavigationTab, PlotTelemetry, FarmerProfile } from './types';
import { BRICS_PLOTS, DEMO_FARMERS } from './data/mockData';
import { Navbar } from './components/Navbar';
import { LandingPage } from './components/LandingPage';
import { AdvisoryTab } from './components/AdvisoryTab';
import { DiagnosisTab } from './components/DiagnosisTab';
import { ExtensionCopilotTab } from './components/ExtensionCopilotTab';
import { FederatedTab } from './components/FederatedTab';
import { OutbreakTab } from './components/OutbreakTab';
import { ArchitectureTab } from './components/ArchitectureTab';
import { SatelliteSoilTab } from './components/SatelliteSoilTab';
import { FarmProfileTab } from './components/FarmProfileTab';
import { FpoMarketplaceTab } from './components/FpoMarketplaceTab';
import { GovernanceApiTab } from './components/GovernanceApiTab';
import { KnowledgeTab } from './components/KnowledgeTab';
import { AuthModal } from './components/AuthModal';
import { CommandPalette } from './components/CommandPalette';
import { FarmerControlBar } from './components/FarmerControlBar';
import { authFetch, removeStoredAuthToken, setStoredAuthToken } from './services/api';
import { auth, onAuthStateChanged } from './lib/firebase';
import { subscribePlots, getPlotsFromFirestore } from './services/firestoreService';
import { Sprout, Globe } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavigationTab>('landing');
  const [plots, setPlots] = useState<PlotTelemetry[]>(BRICS_PLOTS);
  const [selectedPlot, setSelectedPlot] = useState<PlotTelemetry>(BRICS_PLOTS[0]);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [presetQuery, setPresetQuery] = useState<string | null>(null);

  // Farmer Authentication State (persisted to localStorage)
  const [currentFarmer, setCurrentFarmer] = useState<FarmerProfile | null>(() => {
    try {
      const saved = localStorage.getItem('agrinet_active_farmer');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // ignore
    }
    // Default to first demo farmer for immediate exploration
    return DEMO_FARMERS[0] as FarmerProfile;
  });

  // Global Keyboard Shortcut for Command Palette (⌘K / Ctrl+K / /)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      } else if (
        e.key === '/' &&
        !['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)
      ) {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Listen to Firebase Auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const token = await firebaseUser.getIdToken();
          setStoredAuthToken(token);
        } catch (e) {
          console.warn('Firebase token retrieval error:', e);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  // Load persistent plots from Firestore with fallback to local backend API
  useEffect(() => {
    // 1. Initial load from Firestore
    getPlotsFromFirestore()
      .then((loadedPlots) => {
        if (loadedPlots && loadedPlots.length > 0) {
          setPlots(loadedPlots);
          if (currentFarmer?.plotId) {
            const match = loadedPlots.find((p) => p.id === currentFarmer.plotId);
            if (match) setSelectedPlot(match);
          }
        }
      })
      .catch(() => {
        // Fallback to backend API
        authFetch('/api/db/plots')
          .then((res) => res.json())
          .then((json) => {
            if (json.success && Array.isArray(json.data) && json.data.length > 0) {
              setPlots(json.data);
            }
          })
          .catch(() => {});
      });

    // 2. Real-time Firestore subscription
    const unsubscribePlots = subscribePlots((updatedPlots) => {
      setPlots(updatedPlots);
    });

    return () => {
      if (unsubscribePlots) unsubscribePlots();
    };
  }, [currentFarmer?.plotId]);

  const handleLoginSuccess = (farmer: FarmerProfile) => {
    setCurrentFarmer(farmer);
    try {
      localStorage.setItem('agrinet_active_farmer', JSON.stringify(farmer));
    } catch {
      // ignore
    }

    // Automatically align active telemetry plot with farmer's plot
    if (farmer.plotId) {
      const matchingPlot = plots.find((p) => p.id === farmer.plotId) || BRICS_PLOTS.find((p) => p.id === farmer.plotId);
      if (matchingPlot) {
        setSelectedPlot(matchingPlot);
      }
    }

    // Switch to advisory tab on login
    setActiveTab('advisory');
  };

  const handleSignOut = () => {
    setCurrentFarmer(null);
    removeStoredAuthToken();
    try {
      localStorage.removeItem('agrinet_active_farmer');
    } catch {
      // ignore
    }
  };

  // Bind helper to window for global query switching
  (window as any).__findPlotById = (plotId: string) => {
    const found = plots.find((p) => p.id === plotId) || BRICS_PLOTS.find((p) => p.id === plotId);
    if (found) setSelectedPlot(found);
    return found;
  };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col font-sans selection:bg-emerald-700 selection:text-white">
      {/* Skip to Main Content Link for Screen Readers and Keyboard Nav */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:px-4 focus:py-2.5 focus:bg-emerald-600 focus:text-white focus:font-semibold focus:rounded-lg focus:shadow-2xl focus:ring-2 focus:ring-white focus:outline-none"
      >
        Skip to main content
      </a>

      {/* Header & Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentFarmer={currentFarmer}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onSignOut={handleSignOut}
        onOpenSearch={() => setIsSearchOpen(true)}
      />

      {/* Main Content Area */}
      <main
        id="main-content"
        tabIndex={-1}
        role="main"
        aria-label="Main Application Content"
        className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 focus:outline-none"
      >
        {/* Comfortable Farmer Dashboard Hub & Quick Plot Switcher (Active on all tabs) */}
        <FarmerControlBar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          currentFarmer={currentFarmer}
          onOpenAuth={() => setIsAuthModalOpen(true)}
          plots={plots}
          selectedPlot={selectedPlot}
          setSelectedPlot={setSelectedPlot}
          onOpenSearch={() => setIsSearchOpen(true)}
        />

        <div
          role="tabpanel"
          id={`tabpanel-${activeTab}`}
          aria-labelledby={`nav-tab-${activeTab}`}
          tabIndex={0}
          className="focus:outline-none"
        >
          {activeTab === 'landing' && (
            <LandingPage
              onNavigate={setActiveTab}
              onOpenAuth={() => setIsAuthModalOpen(true)}
              currentFarmer={currentFarmer}
              plots={plots}
              onSelectPlot={setSelectedPlot}
            />
          )}
          {activeTab === 'advisory' && (
            <AdvisoryTab
              selectedPlot={selectedPlot}
              setSelectedPlot={setSelectedPlot}
              presetQuery={presetQuery}
            />
          )}
          {activeTab === 'diagnosis' && <DiagnosisTab />}
          {activeTab === 'satellite_soil' && (
            <SatelliteSoilTab
              selectedPlot={selectedPlot}
              onSelectPlot={setSelectedPlot}
            />
          )}
          {activeTab === 'farm_profile' && (
            <FarmProfileTab
              currentFarmer={currentFarmer}
              onOpenAuth={() => setIsAuthModalOpen(true)}
            />
          )}
          {activeTab === 'copilot' && <ExtensionCopilotTab />}
          {activeTab === 'fpo_marketplace' && <FpoMarketplaceTab />}
          {activeTab === 'federated' && <FederatedTab />}
          {activeTab === 'outbreak' && <OutbreakTab />}
          {activeTab === 'governance_api' && <GovernanceApiTab />}
          {activeTab === 'knowledge' && (
            <KnowledgeTab
              currentLanguage="en"
            />
          )}
          {activeTab === 'architecture' && <ArchitectureTab />}
        </div>
      </main>

      {/* Farmer Authentication Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentFarmer={currentFarmer}
        onLoginSuccess={handleLoginSuccess}
        availablePlots={plots}
      />

      {/* Global Command Palette & Dashboard Search */}
      <CommandPalette
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onNavigate={setActiveTab}
        plots={plots}
        onSelectPlot={setSelectedPlot}
        onSelectQuery={(queryText) => {
          setPresetQuery(queryText);
        }}
        currentFarmer={currentFarmer}
        onOpenAuth={() => {
          setIsSearchOpen(false);
          setIsAuthModalOpen(true);
        }}
      />

      {/* Footer */}
      <footer role="contentinfo" className="bg-stone-900 border-t border-stone-800 py-6 text-stone-400 text-xs mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Sprout className="w-4 h-4 text-emerald-400" aria-hidden="true" />
            <span className="font-semibold text-stone-200">BRICS AgriNet</span>
            <span className="text-stone-500" aria-hidden="true">•</span>
            <span>Empowering smallholders across Global South agricultural corridors</span>
          </div>

          <div className="flex items-center gap-4 text-stone-400 text-[11px]">
            <span className="flex items-center gap-1 text-emerald-400">
              <Globe className="w-3.5 h-3.5" aria-hidden="true" />
              <span>India • Brazil • South Africa • China • Russia • Egypt • Ethiopia</span>
            </span>
            <span className="text-stone-600 hidden sm:inline" aria-hidden="true">•</span>
            <span className="text-stone-500 hidden sm:inline">Built with Gemini 3.7 Flash &amp; Google Cloud AI</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
