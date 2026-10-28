import React, { useState, useRef, useEffect } from 'react';
import { useI18n } from '../lib/i18nContext';
import { SupportedLanguage } from '../types';
import { Globe, ChevronDown, Check } from 'lucide-react';

interface LanguageSelectorProps {
  variant?: 'compact' | 'full' | 'dropdown';
  className?: string;
}

export function LanguageSelector({ variant = 'compact', className = '' }: LanguageSelectorProps) {
  const { language, setLanguage, availableLanguages, currentLanguageInfo } = useI18n();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (variant === 'full') {
    return (
      <div className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 ${className}`}>
        {availableLanguages.map((lang) => {
          const isSelected = lang.code === language;
          return (
            <button
              key={lang.code}
              type="button"
              onClick={() => setLanguage(lang.code)}
              className={`flex items-center gap-3 p-3 rounded-2xl border text-left transition-all focus:outline-none focus:ring-2 focus:ring-emerald-400 ${
                isSelected
                  ? 'bg-emerald-950/80 border-emerald-500/80 text-white shadow-md'
                  : 'bg-stone-900/90 border-stone-800 text-stone-300 hover:bg-stone-800 hover:text-white'
              }`}
            >
              <span className="text-xl" aria-hidden="true">
                {lang.flag}
              </span>
              <div className="flex-1 min-w-0 leading-tight">
                <div className="text-xs font-bold flex items-center justify-between">
                  <span className="truncate">{lang.nativeName}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                </div>
                <div className="text-[10px] text-stone-400 truncate">{lang.name}</div>
              </div>
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div ref={containerRef} className={`relative inline-block ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        title={`Language: ${currentLanguageInfo.nativeName} (${currentLanguageInfo.name})`}
        aria-label={`Language selector: currently ${currentLanguageInfo.nativeName}`}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-stone-950 hover:bg-stone-800 border border-stone-800 text-stone-200 hover:text-white text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-400"
      >
        <Globe className="w-3.5 h-3.5 text-emerald-400" aria-hidden="true" />
        <span className="text-sm leading-none" aria-hidden="true">
          {currentLanguageInfo.flag}
        </span>
        <span className="font-semibold">{currentLanguageInfo.nativeName}</span>
        <ChevronDown
          className={`w-3 h-3 text-stone-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          aria-hidden="true"
        />
      </button>

      {isOpen && (
        <div
          role="listbox"
          aria-label="Available Languages"
          className="absolute right-0 top-full mt-2 w-64 max-h-80 overflow-y-auto section-scrollbar bg-stone-900 border border-stone-700 rounded-2xl p-1.5 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150"
        >
          <div className="px-3 py-1.5 text-[10px] uppercase font-bold tracking-wider text-stone-400 border-b border-stone-800 mb-1 flex items-center justify-between">
            <span>BRICS & Regional Languages</span>
            <span className="text-emerald-400 font-mono text-[9px]">11 Native</span>
          </div>

          <div className="space-y-0.5">
            {availableLanguages.map((lang) => {
              const isSelected = lang.code === language;
              return (
                <button
                  key={lang.code}
                  role="option"
                  aria-selected={isSelected}
                  type="button"
                  onClick={() => {
                    setLanguage(lang.code as SupportedLanguage);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between gap-2 px-2.5 py-2 rounded-xl text-xs transition-colors text-left focus:outline-none focus:ring-1 focus:ring-emerald-400 ${
                    isSelected
                      ? 'bg-emerald-900/60 text-emerald-200 font-semibold border border-emerald-700/50'
                      : 'text-stone-300 hover:bg-stone-800 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-base" aria-hidden="true">
                      {lang.flag}
                    </span>
                    <div className="leading-tight truncate">
                      <div className="font-medium text-white">{lang.nativeName}</div>
                      <div className="text-[10px] text-stone-400">
                        {lang.name} • {lang.countryLabel}
                      </div>
                    </div>
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
