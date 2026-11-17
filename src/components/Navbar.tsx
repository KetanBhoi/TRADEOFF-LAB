import React, { useEffect, useRef, useState } from 'react';
import { ScenarioId, ThemeId } from '../types';
import { ThemeSelector } from './ThemeSelector';
import {
  RefreshCw,
  Download,
  History,
  Columns,
  Sliders,
  Dices,
  Target,
  FolderKanban,
  FileText,
  PieChart,
  Zap,
  Search,
  Palette,
  ChevronDown,
  Wrench,
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
  onOpenExport,
  onOpenHistory,
  onOpenSplitView,
  onOpenMonteCarlo,
  onOpenGoalSeek,
  onOpenTornado,
  onOpenPresets,
  onOpenDecisionReport,
  onOpenPortfolio,
  onOpenCommandPalette,
  onResetActiveScenario,
  historyCount,
}) => {
  const [isToolsMenuOpen, setIsToolsMenuOpen] = useState(false);
  const toolsMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isToolsMenuOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (toolsMenuRef.current && !toolsMenuRef.current.contains(e.target as Node)) {
        setIsToolsMenuOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsToolsMenuOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isToolsMenuOpen]);

  const scenarios: { id: ScenarioId; label: string; code: string }[] = [
    { id: 'running', label: 'Running Pace', code: 'PACE' },
    { id: 'housing', label: 'Living Choices', code: 'RENT' },
    { id: 'gpa', label: 'Course GPA', code: 'ACAD' },
    { id: 'budget', label: 'Event Budget', code: 'FIN' },
    { id: 'trading', label: 'Portfolio & Trading', code: 'PORT' },
    { id: 'custom', label: 'Custom Sandbox', code: 'MATH' },
  ];

  const analysisTools = [
    {
      label: 'Archetypes & Presets',
      shortcut: 'P',
      icon: <FolderKanban className="w-3.5 h-3.5 text-orange-600 shrink-0" />,
      onClick: onOpenPresets,
    },
    {
      label: 'Reverse Goal Seek',
      shortcut: 'O',
      icon: <Target className="w-3.5 h-3.5 text-indigo-600 shrink-0" />,
      onClick: onOpenGoalSeek,
    },
    {
      label: 'Tornado Sensitivity',
      shortcut: 'Y',
      icon: <Zap className="w-3.5 h-3.5 text-amber-600 shrink-0" />,
      onClick: onOpenTornado,
    },
    {
      label: 'Monte Carlo (1k Runs)',
      shortcut: 'M',
      icon: <Dices className="w-3.5 h-3.5 text-orange-600 shrink-0" />,
      onClick: onOpenMonteCarlo,
    },
    {
      label: 'Executive Decision Brief',
      shortcut: 'R',
      icon: <FileText className="w-3.5 h-3.5 text-slate-600 shrink-0" />,
      onClick: onOpenDecisionReport,
    },
    ...(onOpenPortfolio
      ? [
          {
            label: 'Portfolio Radar Matrix',
            shortcut: 'T',
            icon: <PieChart className="w-3.5 h-3.5 text-orange-600 shrink-0" />,
            onClick: onOpenPortfolio,
          },
        ]
      : []),
    {
      label: 'Split-View Comparison',
      shortcut: 'S',
      icon: <Columns className="w-3.5 h-3.5 text-indigo-600 shrink-0" />,
      onClick: onOpenSplitView,
    },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center shrink-0">
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              onSelectScenario('running');
            }}
            className="flex items-center gap-2.5 group"
          >
            <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-xs shadow-xs group-hover:bg-slate-800 transition-colors shrink-0">
              <Sliders className="w-4 h-4 text-orange-400" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-bold tracking-tight text-slate-900 block leading-tight whitespace-nowrap">
                  TradeOff Lab
                </span>
                <span className="px-1.5 py-0.5 text-[9px] font-mono font-bold uppercase tracking-wider bg-slate-100 text-slate-600 rounded border border-slate-200 shrink-0">
                  PRO
                </span>
              </div>
              <span className="text-[10px] font-medium text-slate-500 block leading-none font-mono whitespace-nowrap">
                Decision Engineering
              </span>
            </div>
          </a>
        </div>

        {/* Zone 2: Segmented Scenario Navigation Controls */}
        <nav className="hidden lg:flex items-center gap-0.5 xl:gap-1 p-1 bg-slate-100/90 rounded-lg border border-slate-200/80 min-w-0">
          {scenarios.map((sc) => {
            const isActive = activeScenario === sc.id;
            return (
              <button
                key={sc.id}
                type="button"
                onClick={() => onSelectScenario(sc.id)}
                className={`px-2 xl:px-2.5 py-1.5 text-[11px] xl:text-xs font-semibold rounded-md transition-all whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
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

        {/* Zone 3: Balanced Executive Toolbar (Zero horizontal overflow) */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Quick Command Palette Button */}
          <button
            type="button"
            onClick={onOpenCommandPalette}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100/90 hover:bg-slate-200/80 border border-slate-200/90 rounded-lg transition-colors whitespace-nowrap shrink-0 shadow-2xs"
            title="Open Command Palette (Press ⌘K or /)"
          >
            <Search className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <span className="hidden xl:inline text-slate-600">Commands</span>
            <kbd className="hidden sm:inline-flex items-center justify-center px-1.5 py-0.5 text-[9px] font-mono font-bold bg-white text-slate-700 border border-slate-200 rounded">
              ⌘K
            </kbd>
          </button>

          {/* Consolidated Analysis & Simulation Tools Menu */}
          <div className="relative shrink-0" ref={toolsMenuRef}>
            <button
              type="button"
              onClick={() => setIsToolsMenuOpen((o) => !o)}
              aria-expanded={isToolsMenuOpen}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold border rounded-lg transition-colors whitespace-nowrap shrink-0 shadow-2xs ${
                isToolsMenuOpen
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'text-slate-700 bg-white hover:bg-slate-50 border-slate-200'
              }`}
              title="Open Modeling, Sensitivity & Simulation Tools"
            >
              <Wrench className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
              <span className="hidden sm:inline">Lab Tools</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isToolsMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {isToolsMenuOpen && (
              <div className="absolute right-0 mt-2 w-64 rounded-xl bg-white border border-slate-200 shadow-xl py-1.5 z-50">
                <div className="px-3 py-1.5 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                  Decision Science Toolkit
                </div>
                {analysisTools.map((tool) => (
                  <button
                    key={tool.label}
                    type="button"
                    onClick={() => {
                      setIsToolsMenuOpen(false);
                      tool.onClick();
                    }}
                    className="w-full px-3 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-950 flex items-center justify-between gap-2 transition-colors"
                  >
                    <span className="flex items-center gap-2 min-w-0 truncate">
                      {tool.icon}
                      <span className="truncate">{tool.label}</span>
                    </span>
                    <kbd className="px-1.5 py-0.5 text-[10px] font-mono font-bold bg-slate-100 text-slate-600 border border-slate-200 rounded shrink-0">
                      {tool.shortcut}
                    </kbd>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Dedicated Export Button (PDF / CSV / JSON) */}
          <button
            type="button"
            onClick={onOpenExport}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50/90 hover:bg-emerald-100 border border-emerald-200/90 rounded-lg transition-colors whitespace-nowrap shrink-0 shadow-2xs"
            title="Export Scenario Data as PDF or CSV (Press 'E')"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span className="hidden sm:inline font-bold">Export</span>
            <kbd className="hidden xl:inline-flex items-center justify-center px-1.5 py-0.5 text-[9px] font-mono font-bold bg-white text-emerald-800 border border-emerald-200 rounded">
              E
            </kbd>
          </button>

          {/* History */}
          <button
            type="button"
            onClick={onOpenHistory}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors whitespace-nowrap shrink-0 shadow-2xs"
            title="View last 5 configurations & checkpoints (Press 'H')"
          >
            <History className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <span className="hidden xl:inline">History</span>
            {historyCount > 0 && (
              <span className="font-mono text-[10px] text-slate-700 bg-slate-100 px-1 py-0.5 rounded border border-slate-200">
                {historyCount}
              </span>
            )}
            <kbd className="hidden xl:inline-flex items-center justify-center px-1.5 py-0.5 text-[9px] font-mono font-bold bg-slate-100 text-slate-600 border border-slate-200 rounded">
              H
            </kbd>
          </button>

          {/* Reset Levers */}
          <button
            type="button"
            onClick={onResetActiveScenario}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors shrink-0"
            title="Reset active scenario sliders to baseline"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Sub-Header Bar: Dedicated Theme & Workspace Selector Under the First Header */}
      <div className="bg-slate-50/95 backdrop-blur-md border-t border-slate-200/90 px-4 sm:px-6 lg:px-8 py-2">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row lg:items-center justify-between gap-2.5">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 min-w-0">
            <span className="p-1 rounded-md bg-white border border-slate-200 text-indigo-600 shadow-2xs shrink-0">
              <Palette className="w-3.5 h-3.5" />
            </span>
            <span className="whitespace-nowrap">Workspace Theme Palette:</span>
            <span className="text-[11px] font-mono text-slate-500 font-normal hidden sm:inline truncate">
              Select cognitive visual palette for graphs, accents &amp; analytics
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
              type="button"
              onClick={() => onSelectScenario(sc.id)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md whitespace-nowrap shrink-0 transition-colors ${
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
