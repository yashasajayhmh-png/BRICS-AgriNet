/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { NavigationTab, PlotTelemetry } from './types';
import { BRICS_PLOTS } from './data/mockData';
import { Navbar } from './components/Navbar';
import { AdvisoryTab } from './components/AdvisoryTab';
import { DiagnosisTab } from './components/DiagnosisTab';
import { ExtensionCopilotTab } from './components/ExtensionCopilotTab';
import { FederatedTab } from './components/FederatedTab';
import { OutbreakTab } from './components/OutbreakTab';
import { ArchitectureTab } from './components/ArchitectureTab';
import { Sprout, Globe, Database } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavigationTab>('advisory');
  const [plots, setPlots] = useState<PlotTelemetry[]>(BRICS_PLOTS);
  const [selectedPlot, setSelectedPlot] = useState<PlotTelemetry>(BRICS_PLOTS[0]);

  // Load persistent plots from SQLite DB
  useEffect(() => {
    fetch('/api/db/plots')
      .then((res) => res.json())
      .then((json) => {
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          setPlots(json.data);
          setSelectedPlot(json.data[0]);
        }
      })
      .catch((err) => console.warn('Could not load SQLite plots:', err));
  }, []);

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
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Area */}
      <main
        id="main-content"
        tabIndex={-1}
        role="main"
        aria-label="Main Application Content"
        className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 focus:outline-none"
      >
        <div
          role="tabpanel"
          id={`tabpanel-${activeTab}`}
          aria-labelledby={`nav-tab-${activeTab}`}
          tabIndex={0}
          className="focus:outline-none"
        >
          {activeTab === 'advisory' && (
            <AdvisoryTab selectedPlot={selectedPlot} setSelectedPlot={setSelectedPlot} />
          )}
          {activeTab === 'diagnosis' && <DiagnosisTab />}
          {activeTab === 'copilot' && <ExtensionCopilotTab />}
          {activeTab === 'federated' && <FederatedTab />}
          {activeTab === 'outbreak' && <OutbreakTab />}
          {activeTab === 'architecture' && <ArchitectureTab />}
        </div>
      </main>

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
