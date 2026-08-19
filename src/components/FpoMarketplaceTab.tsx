import React, { useState } from 'react';
import { FpoCooperative, MarketplaceItem, FarmerFeedbackEntry } from '../types';
import { FPO_COOPERATIVES, MARKETPLACE_ITEMS, INITIAL_FEEDBACK_LOGS } from '../data/cooperativeData';
import {
  Users,
  ShoppingBag,
  TrendingUp,
  Award,
  ShieldCheck,
  Star,
  CheckCircle2,
  DollarSign,
  MessageSquare,
  Building,
  Sparkles,
  ArrowUpRight,
  Filter,
} from 'lucide-react';

export function FpoMarketplaceTab() {
  const [activeTab, setActiveTab] = useState<'coop' | 'marketplace' | 'feedback'>('coop');
  const [selectedCoop, setSelectedCoop] = useState<FpoCooperative>(FPO_COOPERATIVES[0]);
  const [marketplaceFilter, setMarketplaceFilter] = useState<'all' | 'input_supplier' | 'insurance' | 'buyer'>('all');
  const [feedbackList, setFeedbackList] = useState<FarmerFeedbackEntry[]>(INITIAL_FEEDBACK_LOGS);

  // New feedback form state
  const [newFeedbackPlot, setNewFeedbackPlot] = useState<string>('Malwa Agro-Station Plot #4');
  const [newFeedbackRating, setNewFeedbackRating] = useState<number>(5);
  const [newFeedbackNote, setNewFeedbackNote] = useState<string>('');
  const [newFeedbackYield, setNewFeedbackYield] = useState<number>(5.4);
  const [feedbackSuccess, setFeedbackSuccess] = useState<boolean>(false);

  const handleAddFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFeedbackNote.trim()) return;

    const newEntry: FarmerFeedbackEntry = {
      id: `fb-${Date.now()}`,
      targetId: 'adv-user-submission',
      farmerId: 'farmer_user',
      farmerName: 'Field Producer (Verified)',
      plotName: newFeedbackPlot,
      ratingScore: newFeedbackRating,
      isConfirmedAccurate: newFeedbackRating >= 4,
      fieldOutcomeNote: newFeedbackNote,
      actualHarvestYieldTonsHa: newFeedbackYield,
      timestamp: new Date().toISOString(),
      verifiedByKVK: true,
    };

    setFeedbackList([newEntry, ...feedbackList]);
    setNewFeedbackNote('');
    setFeedbackSuccess(true);
    setTimeout(() => setFeedbackSuccess(false), 4000);
  };

  const filteredItems = marketplaceFilter === 'all'
    ? MARKETPLACE_ITEMS
    : MARKETPLACE_ITEMS.filter((item) => item.type === marketplaceFilter);

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-stone-900 via-stone-900 to-amber-950/50 border border-stone-800 rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-950/80 border border-amber-700/50 text-amber-300 text-xs font-semibold">
              <Users className="w-3.5 h-3.5 text-amber-400" />
              <span>Collective Smallholder Economic Empowerment</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white font-serif">
              FPO Hub, Green Marketplace &amp; Feedback Loop
            </h1>
            <p className="text-xs sm:text-sm text-stone-300 max-w-2xl leading-relaxed">
              Farmer Producer Organizations (FPOs) aggregate collective grain volume for premium prices, bulk-order bio-fertilizers at wholesale discounts, and verify AI accuracy in field conditions.
            </p>
          </div>

          {/* Sub Navigation Tabs */}
          <div className="flex items-center gap-2 bg-stone-950/90 border border-stone-800 rounded-2xl p-1.5 shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab('coop')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === 'coop'
                  ? 'bg-amber-600 text-white shadow-md'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              <Building className="w-4 h-4" />
              <span>FPO Collective Dashboard</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('marketplace')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === 'marketplace'
                  ? 'bg-amber-600 text-white shadow-md'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Sovereign Marketplace</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('feedback')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === 'feedback'
                  ? 'bg-amber-600 text-white shadow-md'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>Farmer Feedback Loop</span>
            </button>
          </div>
        </div>
      </div>

      {/* TAB 1: FPO COLLECTIVE DASHBOARD */}
      {activeTab === 'coop' && (
        <div className="space-y-6">
          {/* FPO Selector Strip */}
          <div className="flex items-center gap-3 overflow-x-auto pb-1 section-scrollbar">
            {FPO_COOPERATIVES.map((coop) => (
              <button
                key={coop.id}
                type="button"
                onClick={() => setSelectedCoop(coop)}
                className={`p-4 rounded-2xl border text-left transition-all shrink-0 w-72 space-y-2 ${
                  selectedCoop.id === coop.id
                    ? 'bg-stone-900 border-amber-500 shadow-md ring-1 ring-amber-400/50'
                    : 'bg-stone-950 border-stone-800 hover:border-stone-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-lg">{coop.flag}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-950 text-amber-300 font-bold border border-amber-700/50">
                    {coop.memberFarmerCount} Members
                  </span>
                </div>
                <div className="font-bold text-sm text-white line-clamp-1">{coop.name}</div>
                <div className="text-[11px] text-stone-400">{coop.region}, {coop.country}</div>
              </button>
            ))}
          </div>

          {/* Selected FPO Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 space-y-2">
              <div className="text-xs text-stone-400">Total Cultivated Area</div>
              <div className="text-3xl font-bold text-white font-mono">{selectedCoop.totalHa} Ha</div>
              <div className="text-[11px] text-emerald-400">Aggregated across {selectedCoop.memberFarmerCount} smallholders</div>
            </div>

            <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 space-y-2">
              <div className="text-xs text-stone-400">Collective Harvest Forecast</div>
              <div className="text-3xl font-bold text-amber-400 font-mono">
                {selectedCoop.collectiveYieldForecastTons.toLocaleString()} Tons
              </div>
              <div className="text-[11px] text-stone-300">Guaranteed buyer procurement contracts</div>
            </div>

            <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 space-y-2">
              <div className="text-xs text-stone-400">Bulk Input Group Discount</div>
              <div className="text-3xl font-bold text-emerald-400 font-mono">
                -{selectedCoop.bulkOrderDiscountsActive}% OFF
              </div>
              <div className="text-[11px] text-stone-300">Wholesale seeds, bio-NPK &amp; solar pumps</div>
            </div>

            <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 space-y-2">
              <div className="text-xs text-stone-400">Aggregate FPO Credit Line</div>
              <div className="text-sm font-bold text-teal-300 font-mono mt-1">
                {selectedCoop.aggregateCreditRating}
              </div>
              <div className="text-[11px] text-stone-400">Backed by sovereign NDB green window</div>
            </div>
          </div>

          {/* Collective Crop Breakdown */}
          <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-amber-400" />
              <span>Collective Crop Portfolio &amp; Sovereign Quality Standards</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              {selectedCoop.primaryCrops.map((crop, i) => (
                <div key={i} className="p-3.5 rounded-xl bg-stone-950 border border-stone-800 text-xs space-y-1">
                  <div className="font-bold text-white">{crop}</div>
                  <div className="text-[10px] text-emerald-400 font-semibold">100% Traceable dMRV</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SOVEREIGN GREEN MARKETPLACE */}
      {activeTab === 'marketplace' && (
        <div className="space-y-6">
          {/* Category Filter */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 section-scrollbar">
            {[
              { key: 'all', label: 'All Verified Offerings' },
              { key: 'input_supplier', label: '🌱 Certified Bio-Inputs & Seeds' },
              { key: 'insurance', label: '🛡️ Parametric Satellite Insurance' },
              { key: 'buyer', label: '🤝 Fair-Trade Grain Buyers' },
            ].map((f) => (
              <button
                key={f.key}
                type="button"
                onClick={() => setMarketplaceFilter(f.key as any)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 ${
                  marketplaceFilter === f.key
                    ? 'bg-amber-600 text-white shadow'
                    : 'bg-stone-900 text-stone-300 hover:bg-stone-800'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Items Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className="bg-stone-900 border border-stone-800 rounded-2xl p-6 flex flex-col justify-between space-y-4 hover:border-stone-700 transition-all"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-stone-950 text-stone-300 border border-stone-800 font-semibold">
                      {item.flag} {item.country}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-amber-400 font-bold">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span>{item.rating}</span>
                    </span>
                  </div>

                  <h3 className="font-bold text-sm text-white leading-snug">{item.name}</h3>
                  <div className="text-xs text-emerald-400 font-semibold">{item.provider}</div>
                  <p className="text-xs text-stone-300 leading-relaxed">{item.description}</p>
                </div>

                <div className="pt-4 border-t border-stone-800 space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-stone-400">Terms / Rate:</span>
                    <span className="font-bold text-amber-300 font-mono">{item.priceOrRate}</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => alert(`Connecting with ${item.provider} for: ${item.name}`)}
                    className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition-all flex items-center justify-center gap-2 shadow"
                  >
                    <span>{item.contactOrPurchaseAction}</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: FARMER FEEDBACK LOOP */}
      {activeTab === 'feedback' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Submission Form */}
          <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 space-y-4 shadow-lg h-fit">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-amber-400" />
              <span>Confirm Field Outcome &amp; Advisory Accuracy</span>
            </h3>
            <p className="text-xs text-stone-400">
              Your real harvest data closes the feedback loop, retraining regional agricultural agents with ground-truth verification.
            </p>

            {feedbackSuccess && (
              <div className="p-3.5 rounded-xl bg-emerald-950 border border-emerald-600 text-emerald-200 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Feedback recorded into sovereign fine-tuning pipeline!</span>
              </div>
            )}

            <form onSubmit={handleAddFeedback} className="space-y-4 text-xs">
              <div>
                <label className="block text-stone-400 mb-1 font-semibold">Field Parcel:</label>
                <select
                  value={newFeedbackPlot}
                  onChange={(e) => setNewFeedbackPlot(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl p-2.5 text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="Malwa Agro-Station Plot #4">Malwa Agro-Station Plot #4 (Punjab)</option>
                  <option value="Cerrado Pilot Plot #12">Cerrado Pilot Plot #12 (Mato Grosso)</option>
                  <option value="Highveld Plot #8">Highveld Plot #8 (Free State)</option>
                </select>
              </div>

              <div>
                <label className="block text-stone-400 mb-1 font-semibold">Advisory Practical Accuracy Rating:</label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setNewFeedbackRating(star)}
                      className="p-1.5 focus:outline-none"
                    >
                      <Star
                        className={`w-6 h-6 transition-all ${
                          star <= newFeedbackRating
                            ? 'text-amber-400 fill-amber-400 scale-110'
                            : 'text-stone-600'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-bold text-amber-400 ml-2">{newFeedbackRating}/5 Stars</span>
                </div>
              </div>

              <div>
                <label className="block text-stone-400 mb-1 font-semibold">Actual Harvest Yield Achieved (t/ha):</label>
                <input
                  type="number"
                  step="0.05"
                  value={newFeedbackYield}
                  onChange={(e) => setNewFeedbackYield(parseFloat(e.target.value))}
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl p-2.5 text-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-stone-400 mb-1 font-semibold">Field Outcome Note / Observations:</label>
                <textarea
                  rows={3}
                  placeholder="e.g. Applied recommended biochar and foliar spray; leaf yellowing halted within 4 days."
                  value={newFeedbackNote}
                  onChange={(e) => setNewFeedbackNote(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl p-2.5 text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs transition-all shadow"
              >
                Submit Ground-Truth Feedback
              </button>
            </form>
          </div>

          {/* Historical Verified Logs */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center justify-between">
              <span>Verified In-Field Advisory Logs</span>
              <span className="text-xs text-stone-400 font-normal">{feedbackList.length} Entries Logged</span>
            </h3>

            <div className="space-y-3">
              {feedbackList.map((entry) => (
                <div
                  key={entry.id}
                  className="bg-stone-900 border border-stone-800 rounded-2xl p-5 space-y-3 text-xs"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white">{entry.farmerName}</span>
                      <span className="text-stone-400">• {entry.plotName}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="flex items-center">
                        {Array.from({ length: entry.ratingScore }).map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        ))}
                      </div>
                      <span className="text-[10px] text-stone-500 font-mono">
                        {new Date(entry.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <p className="text-stone-300 leading-relaxed bg-stone-950 p-3 rounded-xl border border-stone-800/80">
                    &quot;{entry.fieldOutcomeNote}&quot;
                  </p>

                  <div className="flex items-center justify-between text-[11px] pt-1">
                    <span className="text-emerald-400 font-mono font-semibold">
                      Actual Yield: {entry.actualHarvestYieldTonsHa} t/ha
                    </span>
                    <span className="text-stone-400 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
                      <span>KVK Agronomist Verified</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
