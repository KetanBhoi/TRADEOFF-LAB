import React from 'react';
import { ScenarioId, ThemeId } from '../types';
import { ThemeSelector } from './ThemeSelector';
import {
  ListChecks,
  RefreshCw,
  Download,
  History,
  Columns,
  Globe,
  Calculator,
  Sliders,
  Dices,
  Target,
  FolderKanban,
  FileText,
  PieChart,
  Zap,
  Search,
  Palette,
} from 'lucide-react';

interface NavbarProps {
  activeScenario: ScenarioId;
  onSelectScenario: (scenario: ScenarioId) => void;
  currentTheme: ThemeId;
  onSelectTheme: (theme: ThemeId) => void;
  onOpenGuide: () => void;
  onOpenSanityCheck: () => void;
  onOpenExport: () => void;
  onOpenHistory: () => void;
  onOpenSplitView: () => void;
  onOpenGoogleSearch?: (query?: string) => void;
  onOpenMonteCarlo: () => void;
  onOpenGoalSeek: () => void;
  onOpenTornado: () => void;
  onOpenPresets: () => void;
  onOpenDecisionReport: () => void;
  onOpenPortfolio?: () => void;
  onOpenCommandPalette: () => void;
  onResetActiveScenario: () => void;
  completedTasksCount: number;
  historyCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeScenario,
  onSelectScenario,
  currentTheme,
  onSelectTheme,
  onOpenGuide,
  onOpenSanityCheck,
  onOpenExport,
  onOpenHistory,
  onOpenSplitView,
  onOpenGoogleSearch,
  onOpenMonteCarlo,
  onOpenGoalSeek,
  onOpenTornado,
  onOpenPresets,
  onOpenDecisionReport,
  onOpenPortfolio,
  onOpenCommandPalette,
  onResetActiveScenario,
  completedTasksCount,
  historyCount,
}) => {
  const scenarios: { id: ScenarioId; label: string; code: string }[] = [
    { id: 'running', label: 'Running Pace', code: 'PACE' },
    { id: 'housing', label: 'Living Choices', code: 'RENT' },
    { id: 'gpa', label: 'Course GPA', code: 'ACAD' },
    { id: 'budget', label: 'Event Budget', code: 'FIN' },
    { id: 'trading', label: 'Portfolio & Trading', code: 'PORT' },
    { id: 'custom', label: 'Custom Sandbox', code: 'MATH' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              onSelectScenario('running');
            }}
            className="flex items-center gap-2.5 group"
          >
            <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-xs shadow-xs group-hover:bg-slate-800 transition-colors">
              <Sliders className="w-4 h-4 text-orange-400" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-bold tracking-tight text-slate-900 block leading-tight">
                  TradeOff Lab
                </span>
                <span className="px-1.5 py-0.2 text-[9px] font-mono font-bold uppercase tracking-wider bg-slate-100 text-slate-600 rounded border border-slate-200">
                  PRO
                </span>
              </div>
              <span className="text-[10px] font-medium text-slate-500 block leading-none font-mono">
                Decision Engineering
              </span>
            </div>
          </a>
        </div>

        {/* Zone 2: Segmented Scenario Navigation Controls */}
        <nav className="hidden lg:flex items-center gap-1 p-1 bg-slate-100/90 rounded-lg border border-slate-200/80">
          {scenarios.map((sc) => {
            const isActive = activeScenario === sc.id;
            return (
              <button
                key={sc.id}
                onClick={() => onSelectScenario(sc.id)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all whitespace-nowrap flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-white text-slate-950 shadow-2xs font-bold border border-slate-200/90'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                }`}
              >
                <span>{sc.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Consolidated Executive Toolbar */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Quick Command Palette Button */}
          <button
            onClick={onOpenCommandPalette}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100/90 hover:bg-slate-200/80 border border-slate-200/90 rounded-lg transition-colors whitespace-nowrap shadow-2xs"
            title="Open Command Palette (Press ⌘K or /)"
          >
            <Search className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <span className="hidden lg:inline text-slate-600">Commands</span>
            <kbd className="hidden sm:inline-flex items-center justify-center px-1.5 py-0.2 text-[9px] font-mono font-bold bg-white text-slate-700 border border-slate-200 rounded">
              ⌘K
            </kbd>
          </button>

          {/* Archetype Presets */}
          <button
            onClick={onOpenPresets}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors whitespace-nowrap shadow-2xs"
            title="Load realistic life & industry archetypes or save custom presets (Press 'P')"
          >
            <FolderKanban className="w-3.5 h-3.5 text-orange-600 shrink-0" />
            <span className="hidden xl:inline">Archetypes</span>
            <kbd className="hidden md:inline-flex items-center justify-center px-1.5 py-0.2 text-[9px] font-mono font-bold bg-slate-100 text-slate-600 border border-slate-200 rounded">
              P
            </kbd>
          </button>

          {/* Reverse Goal Seek Optimizer */}
          <button
            onClick={onOpenGoalSeek}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50/70 hover:bg-indigo-100/80 border border-indigo-200/80 rounded-lg transition-colors whitespace-nowrap shadow-2xs"
            title="Reverse Goal Seek: Automatically optimize levers to hit target outcome (Press 'O')"
          >
            <Target className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
            <span className="hidden xl:inline">Goal Seek</span>
            <kbd className="hidden md:inline-flex items-center justify-center px-1.5 py-0.2 text-[9px] font-mono font-bold bg-white text-indigo-700 border border-indigo-200 rounded">
              O
            </kbd>
          </button>

          {/* Tornado Sensitivity Diagram */}
          <button
            onClick={onOpenTornado}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-amber-900 bg-amber-50/80 hover:bg-amber-100 border border-amber-200/80 rounded-lg transition-colors whitespace-nowrap shadow-2xs"
            title="Tornado Sensitivity Diagram: Outcome swing ranking & dominant lever (Press 'Y')"
          >
            <Zap className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span className="hidden xl:inline">Tornado</span>
            <kbd className="hidden md:inline-flex items-center justify-center px-1.5 py-0.2 text-[9px] font-mono font-bold bg-white text-amber-900 border border-amber-200 rounded">
              Y
            </kbd>
          </button>

          {/* Monte Carlo Stochastic Simulation */}
          <button
            onClick={onOpenMonteCarlo}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-orange-800 bg-orange-50/80 hover:bg-orange-100 border border-orange-200/80 rounded-lg transition-colors whitespace-nowrap shadow-2xs"
            title="Monte Carlo: 1,000 trial stochastic simulation & risk histogram (Press 'M')"
          >
            <Dices className="w-3.5 h-3.5 text-orange-600 shrink-0" />
            <span className="hidden xl:inline">Monte Carlo</span>
            <kbd className="hidden md:inline-flex items-center justify-center px-1.5 py-0.2 text-[9px] font-mono font-bold bg-white text-orange-800 border border-orange-200 rounded">
              M
            </kbd>
          </button>

          {/* Decision Brief Report */}
          <button
            onClick={onOpenDecisionReport}
            className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors whitespace-nowrap shadow-2xs"
            title="Executive Decision Intelligence Brief & CSV Export (Press 'R')"
          >
            <FileText className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <span className="hidden xl:inline">Decision Brief</span>
            <kbd className="hidden md:inline-flex items-center justify-center px-1.5 py-0.2 text-[9px] font-mono font-bold bg-slate-100 text-slate-600 border border-slate-200 rounded">
              R
            </kbd>
          </button>

          {/* Portfolio TradeOff Matrix */}
          {onOpenPortfolio && (
            <button
              onClick={onOpenPortfolio}
              className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors whitespace-nowrap shadow-2xs"
              title="Portfolio Tradeoff Radar Matrix (Press 'T')"
            >
              <PieChart className="w-3.5 h-3.5 text-orange-600 shrink-0" />
              <span className="hidden xl:inline">Radar Matrix</span>
              <kbd className="hidden md:inline-flex items-center justify-center px-1.5 py-0.2 text-[9px] font-mono font-bold bg-slate-100 text-slate-600 border border-slate-200 rounded">
                T
              </kbd>
            </button>
          )}

          {/* Dedicated Export Button (PDF / CSV / JSON) */}
          <button
            onClick={onOpenExport}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50/90 hover:bg-emerald-100 border border-emerald-200/90 rounded-lg transition-colors whitespace-nowrap shadow-2xs"
            title="Export Scenario Data as PDF or CSV (Press 'E')"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span className="font-bold">Export</span>
            <kbd className="hidden md:inline-flex items-center justify-center px-1.5 py-0.2 text-[9px] font-mono font-bold bg-white text-emerald-800 border border-emerald-200 rounded">
              E
            </kbd>
          </button>

          {/* Split View */}
          <button
            onClick={onOpenSplitView}
            className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors whitespace-nowrap shadow-2xs"
            title="Split-View: Compare two snapshots side-by-side (Press 'S')"
          >
            <Columns className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
            <span className="hidden xl:inline">Split View</span>
            <kbd className="hidden md:inline-flex items-center justify-center px-1.5 py-0.2 text-[9px] font-mono font-bold bg-slate-100 text-slate-600 border border-slate-200 rounded">
              S
            </kbd>
          </button>

          {/* History */}
          <button
            onClick={onOpenHistory}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors whitespace-nowrap shadow-2xs"
            title="View last 5 configurations & checkpoints (Press 'H')"
          >
            <History className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <span className="hidden sm:inline">History</span>
            {historyCount > 0 && (
              <span className="font-mono text-[10px] text-slate-700 bg-slate-100 px-1 py-0.2 rounded border border-slate-200">
                {historyCount}
              </span>
            )}
            <kbd className="hidden md:inline-flex items-center justify-center px-1.5 py-0.2 text-[9px] font-mono font-bold bg-slate-100 text-slate-600 border border-slate-200 rounded">
              H
            </kbd>
          </button>

          {/* Reset Levers */}
          <button
            onClick={onResetActiveScenario}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            title="Reset active scenario sliders to baseline"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Sub-Header Bar: Dedicated Theme & Workspace Selector Under the First Header */}
      <div className="bg-slate-50/95 backdrop-blur-md border-t border-slate-200/90 px-4 sm:px-6 lg:px-8 py-2">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-2.5">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
            <span className="p-1 rounded-md bg-white border border-slate-200 text-indigo-600 shadow-2xs">
              <Palette className="w-3.5 h-3.5" />
            </span>
            <span>Workspace Theme Palette:</span>
            <span className="text-[11px] font-mono text-slate-500 font-normal hidden sm:inline">
              Select cognitive visual palette for graphs, accents & analytics
            </span>
          </div>

          <ThemeSelector currentTheme={currentTheme} onSelectTheme={onSelectTheme} />
        </div>
      </div>

      {/* Mobile/Tablet Scenario Navigation Bar */}
      <div className="lg:hidden flex items-center overflow-x-auto px-4 py-2 bg-slate-50 border-t border-slate-200 gap-1.5 no-scrollbar">
        {scenarios.map((sc) => {
          const isActive = activeScenario === sc.id;
          return (
            <button
              key={sc.id}
              onClick={() => onSelectScenario(sc.id)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md whitespace-nowrap transition-colors ${
                isActive
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {sc.label}
            </button>
          );
        })}
      </div>
    </header>
  );
};
