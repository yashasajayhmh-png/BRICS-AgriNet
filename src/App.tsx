/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { NavigationTab, PlotTelemetry } from './types';
import { BRICS_PLOTS } from './data/mockData';
import { Navbar } from './components/Navbar';
import { AdvisoryTab } from './components/AdvisoryTab';
import { DiagnosisTab } from './components/DiagnosisTab';
import { ExtensionCopilotTab } from './components/ExtensionCopilotTab';
import { FederatedTab } from './components/FederatedTab';
import { OutbreakTab } from './components/OutbreakTab';
import { ArchitectureTab } from './components/ArchitectureTab';
import { Sprout, Globe } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavigationTab>('advisory');
  const [selectedPlot, setSelectedPlot] = useState<PlotTelemetry>(BRICS_PLOTS[0]);

  // Bind helper to window for global query switching
  (window as any).__findPlotById = (plotId: string) => {
    const found = BRICS_PLOTS.find((p) => p.id === plotId);
    if (found) setSelectedPlot(found);
    return found;
  };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col font-sans selection:bg-emerald-700 selection:text-white">
      {/* Header & Navigation */}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'advisory' && (
          <AdvisoryTab selectedPlot={selectedPlot} setSelectedPlot={setSelectedPlot} />
        )}
        {activeTab === 'diagnosis' && <DiagnosisTab />}
        {activeTab === 'copilot' && <ExtensionCopilotTab />}
        {activeTab === 'federated' && <FederatedTab />}
        {activeTab === 'outbreak' && <OutbreakTab />}
        {activeTab === 'architecture' && <ArchitectureTab />}
      </main>

      {/* Footer */}
      <footer className="bg-stone-900 border-t border-stone-800 py-6 text-stone-400 text-xs mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Sprout className="w-4 h-4 text-emerald-400" />
            <span className="font-semibold text-stone-200">BRICS AgriNet</span>
            <span className="text-stone-500">•</span>
            <span>Empowering smallholders across Global South agricultural corridors</span>
          </div>

          <div className="flex items-center gap-4 text-stone-400 text-[11px]">
            <span className="flex items-center gap-1 text-emerald-400">
              <Globe className="w-3.5 h-3.5" /> India • Brazil • South Africa • China • Russia • Egypt • Ethiopia
            </span>
            <span className="text-stone-600 hidden sm:inline">•</span>
            <span className="text-stone-500 hidden sm:inline">Built with Gemini 3.7 Flash &amp; Google Cloud AI</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
