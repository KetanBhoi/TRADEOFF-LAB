import React, { useState, useEffect, useRef } from 'react';
import {
  ScenarioId,
  ThemeId,
} from '../../types';
import {
  Search,
  Sliders,
  Dices,
  Target,
  FolderKanban,
  FileText,
  PieChart,
  Columns,
  Calculator,
  RefreshCw,
  Palette,
  CheckCircle2,
  X,
  Zap,
  Globe,
  ArrowRight,
  Download,
} from 'lucide-react';

export interface CommandItem {
  id: string;
  title: string;
  category: 'Scenarios' | 'Simulations & Analytics' | 'Reports & Presets' | 'Appearance & Actions';
  shortcut?: string;
  icon: React.ReactNode;
  action: () => void;
  keywords?: string;
}

interface CommandPaletteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectScenario: (sc: ScenarioId) => void;
  onOpenMonteCarlo: () => void;
  onOpenGoalSeek: () => void;
  onOpenTornado: () => void;
  onOpenPresets: () => void;
  onOpenDecisionReport: () => void;
  onOpenPortfolio: () => void;
  onOpenExport?: () => void;
  onOpenSplitView: () => void;
  onOpenSanityCheck: () => void;
  onOpenGuide: () => void;
  onResetScenario: () => void;
  onSelectTheme: (theme: ThemeId) => void;
}

export const CommandPaletteModal: React.FC<CommandPaletteModalProps> = ({
  isOpen,
  onClose,
  onSelectScenario,
  onOpenMonteCarlo,
  onOpenGoalSeek,
  onOpenTornado,
  onOpenPresets,
  onOpenDecisionReport,
  onOpenPortfolio,
  onOpenExport,
  onOpenSplitView,
  onOpenSanityCheck,
  onOpenGuide,
  onResetScenario,
  onSelectTheme,
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const commands: CommandItem[] = [
    // Scenarios
    {
      id: 'sc-running',
      title: 'Running Pace Optimization (Half-Marathon Sub-2:00)',
      category: 'Scenarios',
      icon: <Sliders className="w-4 h-4 text-orange-500" />,
      action: () => onSelectScenario('running'),
      keywords: 'pace half marathon mile runs speedwork race',
    },
    {
      id: 'sc-housing',
      title: 'Living Choices & Rent Allocator (Commute vs Roommates)',
      category: 'Scenarios',
      icon: <Sliders className="w-4 h-4 text-emerald-500" />,
      action: () => onSelectScenario('housing'),
      keywords: 'rent housing apartment roommate commute living',
    },
    {
      id: 'sc-gpa',
      title: 'Course Exam Stakes & GPA Target (Final Exam Calibrator)',
      category: 'Scenarios',
      icon: <Sliders className="w-4 h-4 text-indigo-500" />,
      action: () => onSelectScenario('gpa'),
      keywords: 'gpa grade college exam midterm final assignment course',
    },
    {
      id: 'sc-budget',
      title: 'Campus Event Budget & Break-Even Elasticity',
      category: 'Scenarios',
      icon: <Sliders className="w-4 h-4 text-blue-500" />,
      action: () => onSelectScenario('budget'),
      keywords: 'event budget ticket attendees catering break even finance profit',
    },
    {
      id: 'sc-trading',
      title: 'IPO Tracker & Live Trading Desk (Broker API & Strategy Engine)',
      category: 'Scenarios',
      icon: <Sliders className="w-4 h-4 text-emerald-600" />,
      action: () => onSelectScenario('trading'),
      keywords: 'trading ipo stocks nse bse broker zerodha upstox angel one gmp allotment backtest risk kill switch',
    },
    {
      id: 'sc-custom',
      title: 'Custom Mathematical Sandbox (Multi-Lever Model)',
      category: 'Scenarios',
      icon: <Sliders className="w-4 h-4 text-purple-500" />,
      action: () => onSelectScenario('custom'),
      keywords: 'custom formula sandbox sandbox multi lever',
    },

    // Simulations & Analytics
    {
      id: 'act-monte-carlo',
      title: 'Run Monte Carlo Stochastic Risk Simulation',
      category: 'Simulations & Analytics',
      shortcut: 'M',
      icon: <Dices className="w-4 h-4 text-orange-600" />,
      action: onOpenMonteCarlo,
      keywords: 'monte carlo risk probability distribution gaussian trials stochastics',
    },
    {
      id: 'act-goal-seek',
      title: 'Reverse Goal Seek / Parameter Optimizer',
      category: 'Simulations & Analytics',
      shortcut: 'O',
      icon: <Target className="w-4 h-4 text-indigo-600" />,
      action: onOpenGoalSeek,
      keywords: 'goal seek optimizer reverse solver root finding target solve',
    },
    {
      id: 'act-tornado',
      title: 'Tornado Diagram & Lever Elasticity Sensitivity',
      category: 'Simulations & Analytics',
      shortcut: 'Y',
      icon: <Zap className="w-4 h-4 text-amber-500" />,
      action: onOpenTornado,
      keywords: 'tornado sensitivity elasticity swing dominant leverage ranking',
    },
    {
      id: 'act-portfolio',
      title: 'Portfolio Tradeoff Radar Matrix',
      category: 'Simulations & Analytics',
      shortcut: 'T',
      icon: <PieChart className="w-4 h-4 text-orange-600" />,
      action: onOpenPortfolio,
      keywords: 'portfolio radar matrix cross scenario risk capital',
    },
    {
      id: 'act-sanity-check',
      title: 'Sanity-Check Math & Boundary Step Inspection',
      category: 'Simulations & Analytics',
      shortcut: 'C',
      icon: <Calculator className="w-4 h-4 text-slate-600" />,
      action: onOpenSanityCheck,
      keywords: 'math proof formula steps equations verify audit',
    },

    // Reports & Presets
    {
      id: 'act-presets',
      title: 'Archetypes & Custom Saved Configurations',
      category: 'Reports & Presets',
      shortcut: 'P',
      icon: <FolderKanban className="w-4 h-4 text-orange-600" />,
      action: onOpenPresets,
      keywords: 'archetypes presets bookmark template saved load',
    },
    {
      id: 'act-export',
      title: 'Export Scenario Data (Save as PDF, CSV, or JSON)',
      category: 'Reports & Presets',
      shortcut: 'E',
      icon: <Download className="w-4 h-4 text-emerald-600" />,
      action: onOpenExport || (() => {}),
      keywords: 'export save pdf csv download data spreadsheet json scenario print',
    },
    {
      id: 'act-decision-report',
      title: 'Generate Executive Decision Intelligence Memo & CSV',
      category: 'Reports & Presets',
      shortcut: 'R',
      icon: <FileText className="w-4 h-4 text-slate-700" />,
      action: onOpenDecisionReport,
      keywords: 'report memo executive brief export csv markdown print',
    },
    {
      id: 'act-split-view',
      title: 'Split-View Snapshot Comparator (Side-by-Side Diff)',
      category: 'Reports & Presets',
      shortcut: 'S',
      icon: <Columns className="w-4 h-4 text-indigo-600" />,
      action: onOpenSplitView,
      keywords: 'split compare diff snapshots side by side baseline',
    },
    {
      id: 'act-guide',
      title: 'Interactive 10-Step Decision Pipeline Checklist',
      category: 'Reports & Presets',
      icon: <CheckCircle2 className="w-4 h-4 text-emerald-600" />,
      action: onOpenGuide,
      keywords: 'checklist guide pipeline workflow steps tasks',
    },

    // Appearance & Actions
    {
      id: 'theme-marathon',
      title: 'Switch Theme: Marathon Amber',
      category: 'Appearance & Actions',
      icon: <Palette className="w-4 h-4 text-amber-500" />,
      action: () => onSelectTheme('marathon'),
      keywords: 'theme color orange amber marathon',
    },
    {
      id: 'theme-collegiate',
      title: 'Switch Theme: Collegiate Blue',
      category: 'Appearance & Actions',
      icon: <Palette className="w-4 h-4 text-indigo-500" />,
      action: () => onSelectTheme('collegiate'),
      keywords: 'theme color blue collegiate indigo',
    },
    {
      id: 'theme-emerald',
      title: 'Switch Theme: Emerald Living',
      category: 'Appearance & Actions',
      icon: <Palette className="w-4 h-4 text-emerald-500" />,
      action: () => onSelectTheme('emerald'),
      keywords: 'theme color green emerald living',
    },
    {
      id: 'theme-slate',
      title: 'Switch Theme: Modern Slate',
      category: 'Appearance & Actions',
      icon: <Palette className="w-4 h-4 text-slate-500" />,
      action: () => onSelectTheme('slate'),
      keywords: 'theme color slate gray monochrome',
    },
    {
      id: 'act-reset',
      title: 'Reset Active Scenario Sliders to Baseline',
      category: 'Appearance & Actions',
      icon: <RefreshCw className="w-4 h-4 text-slate-400" />,
      action: onResetScenario,
      keywords: 'reset baseline restore defaults clear sliders',
    },
  ];

  const filtered = commands.filter((cmd) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      cmd.title.toLowerCase().includes(q) ||
      cmd.category.toLowerCase().includes(q) ||
      (cmd.keywords && cmd.keywords.toLowerCase().includes(q))
    );
  });

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filtered.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filtered.length) % Math.max(1, filtered.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filtered[selectedIndex]) {
        filtered[selectedIndex].action();
        onClose();
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-start justify-center pt-20 px-4 animate-in fade-in duration-100"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-xl w-full overflow-hidden flex flex-col animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="p-3.5 border-b border-slate-200 flex items-center gap-3 bg-white">
          <Search className="w-5 h-5 text-slate-400 shrink-0 ml-1" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Type a command, scenario, or simulation tool..."
            className="flex-1 text-sm bg-transparent border-0 focus:outline-hidden text-slate-900 placeholder:text-slate-400 font-medium"
          />
          <kbd className="hidden sm:inline-flex items-center px-2 py-0.5 text-[10px] font-mono font-bold bg-slate-100 text-slate-500 rounded border border-slate-200">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-2 divide-y divide-slate-100">
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              No matching commands or scenarios found for "{query}".
            </div>
          ) : (
            filtered.map((cmd, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <button
                  key={cmd.id}
                  onClick={() => {
                    cmd.action();
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`w-full text-left px-3.5 py-2.5 rounded-xl flex items-center justify-between gap-3 text-xs transition-colors ${
                    isSelected ? 'bg-slate-100/90 text-slate-950 font-bold' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-7 h-7 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0">
                      {cmd.icon}
                    </div>
                    <div className="truncate">
                      <span className="block truncate text-slate-900 font-semibold">{cmd.title}</span>
                      <span className="block text-[10px] text-slate-400 font-mono">{cmd.category}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {cmd.shortcut && (
                      <kbd className="px-1.5 py-0.5 text-[9px] font-mono font-bold bg-white text-slate-600 rounded border border-slate-200 shadow-2xs">
                        {cmd.shortcut}
                      </kbd>
                    )}
                    {isSelected && <ArrowRight className="w-3.5 h-3.5 text-slate-400" />}
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Footer Shortcut Legend */}
        <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-400 font-mono">
          <div className="flex items-center gap-3">
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
            <span>ESC Close</span>
          </div>
          <span>TradeOff Lab OS</span>
        </div>
      </div>
    </div>
  );
};
