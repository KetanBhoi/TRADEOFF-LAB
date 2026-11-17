import React from 'react';
import { ThemeId, ThemeOption } from '../types';
import { Check, Sparkles } from 'lucide-react';

export const THEME_OPTIONS: ThemeOption[] = [
  {
    id: 'slate',
    name: 'Slate Minimalist',
    badge: 'Pro SaaS',
    primaryColor: '#0f172a',
    accentColor: '#0d9488',
    description: 'Clean, neutral professional SaaS design system with studio charcoal & teal accents',
  },
  {
    id: 'emerald',
    name: 'Emerald Capital',
    badge: 'Wealth & Mint',
    primaryColor: '#059669',
    accentColor: '#10b981',
    description: 'Wealth, portfolio health, and financial accounting green palette',
  },
  {
    id: 'marathon',
    name: 'Marathon Kinetic',
    badge: 'Race Orange',
    primaryColor: '#ea580c',
    accentColor: '#f97316',
    description: 'High-energy race day palette for pacing & performance models',
  },
  {
    id: 'collegiate',
    name: 'Campus Collegiate',
    badge: 'Navy & Gold',
    primaryColor: '#1d4ed8',
    accentColor: '#d97706',
    description: 'Academic varsity styling for coursework, grading & campus models',
  },
  {
    id: 'crimson',
    name: 'Crimson Ivy',
    badge: 'Editorial Wine',
    primaryColor: '#be123c',
    accentColor: '#e11d48',
    description: 'Refined editorial academic theme for high-stakes risk evaluation',
  },
];

interface ThemeSelectorProps {
  currentTheme: ThemeId;
  onSelectTheme: (id: ThemeId) => void;
}

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({
  currentTheme,
  onSelectTheme,
}) => {
  return (
    <div className="w-full lg:w-auto max-w-full min-w-0 flex items-center gap-1.5 p-1 bg-white/90 rounded-xl border border-slate-200 shadow-2xs overflow-x-auto no-scrollbar">
      {THEME_OPTIONS.map((theme) => {
        const isActive = currentTheme === theme.id;
        return (
          <button
            key={theme.id}
            type="button"
            onClick={() => onSelectTheme(theme.id)}
            title={`${theme.name} (${theme.badge}) — ${theme.description}`}
            className={`group relative flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200 whitespace-nowrap shrink-0 cursor-pointer ${
              isActive
                ? 'bg-slate-900 text-white shadow-sm ring-1 ring-slate-900 font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/90'
            }`}
          >
            {/* Color Swatch Dot with Accent Border */}
            <span className="relative flex items-center justify-center shrink-0">
              <span
                className="w-3.5 h-3.5 rounded-full border border-white/60 shadow-2xs transition-transform group-hover:scale-110"
                style={{
                  background: `linear-gradient(135deg, ${theme.primaryColor} 0%, ${theme.accentColor} 100%)`,
                }}
                aria-hidden="true"
              />
              {isActive && (
                <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-emerald-400 ring-1 ring-slate-900" />
              )}
            </span>

            {/* Theme Name */}
            <span className="tracking-tight">{theme.name.split(' ')[0]}</span>

            {/* Personality Badge */}
            <span
              className={`text-[9px] font-mono px-1.5 py-0.2 rounded font-medium transition-colors ${
                isActive
                  ? 'bg-white/20 text-slate-200'
                  : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200'
              }`}
            >
              {theme.badge}
            </span>

            {/* Active Check Indicator */}
            {isActive && (
              <Check className="w-3 h-3 text-emerald-400 shrink-0 ml-0.5" />
            )}
          </button>
        );
      })}
    </div>
  );
};
