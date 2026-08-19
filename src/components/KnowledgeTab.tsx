import React, { useState } from 'react';
import { KnowledgeArticle, SupportedLanguage } from '../types';
import { KNOWLEDGE_ARTICLES } from '../data/knowledgeData';
import {
  BookOpen,
  Search,
  CheckCircle2,
  Clock,
  Globe,
  Download,
  Share2,
  Bookmark,
  Sparkles,
  ArrowRight,
  Leaf,
  Bug,
  Droplets,
} from 'lucide-react';

interface KnowledgeTabProps {
  currentLanguage: SupportedLanguage;
}

export function KnowledgeTab({ currentLanguage }: KnowledgeTabProps) {
  const [selectedArticle, setSelectedArticle] = useState<KnowledgeArticle>(KNOWLEDGE_ARTICLES[0]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);

  const toggleBookmark = (id: string) => {
    if (bookmarkedIds.includes(id)) {
      setBookmarkedIds(bookmarkedIds.filter((item) => item !== id));
    } else {
      setBookmarkedIds([...bookmarkedIds, id]);
    }
  };

  const filteredArticles = KNOWLEDGE_ARTICLES.filter((art) => {
    const matchesSearch =
      art.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      art.summary.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || art.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-stone-900 via-stone-900 to-teal-950/60 border border-stone-800 rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-950/80 border border-teal-700/50 text-teal-300 text-xs font-semibold">
              <BookOpen className="w-3.5 h-3.5 text-teal-400" />
              <span>Smallholder Farmer Training &amp; Best Practices</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white font-serif">
              Agronomy Knowledge Base &amp; Climate-Smart Guides
            </h1>
            <p className="text-xs sm:text-sm text-stone-300 max-w-2xl leading-relaxed">
              Peer-reviewed regenerative agriculture manuals, integrated pest management protocols, soil organic carbon enhancement strategies, and vernacular field checklists.
            </p>
          </div>

          {/* Search bar */}
          <div className="relative w-full lg:w-72">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search guides &amp; protocols..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-stone-950 border border-stone-800 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pt-6 border-t border-stone-800/80 mt-6 section-scrollbar pb-1">
          {['All', 'Soil Management', 'Pest Control', 'Climate Resilience'].map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 ${
                selectedCategory === cat
                  ? 'bg-teal-600 text-white shadow-md'
                  : 'bg-stone-800 text-stone-300 hover:bg-stone-700 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Article List */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Available Modules ({filteredArticles.length})
          </h3>

          <div className="space-y-3">
            {filteredArticles.map((article) => (
              <div
                key={article.id}
                onClick={() => setSelectedArticle(article)}
                className={`p-5 rounded-2xl border transition-all cursor-pointer space-y-2.5 ${
                  selectedArticle.id === article.id
                    ? 'bg-stone-900 border-teal-500 shadow-md ring-1 ring-teal-400/50'
                    : 'bg-stone-950 border-stone-800 hover:border-stone-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-950 text-teal-300 font-bold border border-teal-700/50">
                    {article.category}
                  </span>
                  <span className="text-[11px] text-stone-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{article.readTimeMinutes} min read</span>
                  </span>
                </div>

                <h4 className="font-bold text-sm text-white leading-snug">{article.title}</h4>
                <p className="text-xs text-stone-400 line-clamp-2 leading-relaxed">{article.summary}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right 2 Columns: Full Guide Reader & Practical Checklist */}
        <div className="lg:col-span-2 bg-stone-900 border border-stone-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-800">
            <div className="space-y-1">
              <span className="text-xs font-bold text-teal-400 uppercase tracking-wider">
                {selectedArticle.category}
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-white font-serif">
                {selectedArticle.title}
              </h2>
              <div className="flex items-center gap-4 text-xs text-stone-400 pt-1">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-teal-400" />
                  <span>{selectedArticle.readTimeMinutes} Min Practical Read</span>
                </span>
                <span className="flex items-center gap-1">
                  <Globe className="w-3.5 h-3.5 text-teal-400" />
                  <span>Available in {selectedArticle.languagesAvailable.length} BRICS Languages</span>
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => toggleBookmark(selectedArticle.id)}
                className={`p-2.5 rounded-xl border transition-all ${
                  bookmarkedIds.includes(selectedArticle.id)
                    ? 'bg-teal-950 border-teal-600 text-teal-300'
                    : 'bg-stone-800 border-stone-700 text-stone-300 hover:bg-stone-700'
                }`}
                title="Bookmark Guide"
              >
                <Bookmark className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => alert(`Downloaded printable field manual: ${selectedArticle.title}`)}
                className="px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow"
              >
                <Download className="w-4 h-4" />
                <span>Field PDF</span>
              </button>
            </div>
          </div>

          {/* Article Summary Box */}
          <div className="p-4 rounded-2xl bg-stone-950 border border-stone-800 text-xs text-stone-300 leading-relaxed italic">
            &quot;{selectedArticle.summary}&quot;
          </div>

          {/* Rendered Guide Content */}
          <div className="prose prose-invert max-w-none text-xs sm:text-sm text-stone-200 space-y-4 leading-relaxed whitespace-pre-line">
            {selectedArticle.contentMarkdown}
          </div>

          {/* Actionable Field Checklist */}
          {selectedArticle.practicalActionChecklist && (
            <div className="pt-4 border-t border-stone-800 space-y-3">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-400" />
                <span>Practical Field Action Checklist</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {selectedArticle.practicalActionChecklist.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-stone-950 border border-stone-800 flex items-start gap-2.5 text-xs text-stone-300"
                  >
                    <input
                      type="checkbox"
                      id={`check-${idx}`}
                      className="w-4 h-4 accent-teal-500 rounded cursor-pointer mt-0.5 shrink-0"
                    />
                    <label htmlFor={`check-${idx}`} className="cursor-pointer">
                      {item}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
