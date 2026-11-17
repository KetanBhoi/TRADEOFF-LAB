import React, { useState, useEffect, useRef } from 'react';
import {
  ScenarioId,
  ThemeId,
  RunningParams,
  HousingParams,
  GpaParams,
  BudgetParams,
  CustomParams,
  TradingParams,
} from './types';
import { Navbar } from './components/Navbar';
import { RunningScenario } from './components/scenarios/RunningScenario';
import { HousingScenario } from './components/scenarios/HousingScenario';
import { GpaScenario } from './components/scenarios/GpaScenario';
import { BudgetScenario } from './components/scenarios/BudgetScenario';
import { CustomScenario } from './components/scenarios/CustomScenario';
import { TradingScenario } from './components/scenarios/TradingScenario';
import { ProcessGuideDrawer, INITIAL_CHECKLIST_STEPS } from './components/ProcessGuideDrawer';
import { SanityCheckModal } from './components/SanityCheckModal';
import { ExportModal } from './components/common/ExportModal';
import { HistoryDrawer } from './components/common/HistoryDrawer';
import { SplitViewModal } from './components/common/SplitViewModal';
import { GoogleSearchModal } from './components/common/GoogleSearchModal';
import { MonteCarloModal } from './components/modals/MonteCarloModal';
import { GoalSeekModal } from './components/modals/GoalSeekModal';
import { PresetsModal } from './components/modals/PresetsModal';
import { DecisionReportModal } from './components/modals/DecisionReportModal';
import { PortfolioMatrixModal } from './components/modals/PortfolioMatrixModal';
import { TornadoSensitivityModal } from './components/modals/TornadoSensitivityModal';
import { CommandPaletteModal } from './components/modals/CommandPaletteModal';
import { createSnapshot, areParamsEqual } from './utils/historyUtils';
import { ScenarioHistorySnapshot } from './types';
import { CheckCircle2, ChevronRight, Calculator, Sliders, Download, History, RotateCcw, Columns, Globe, Dices, Target, FolderKanban, FileText, Zap, X } from 'lucide-react';

const DEFAULT_RUNNING: RunningParams = {
  currentPaceMinutes: 10,
  currentPaceSeconds: 45,
  targetTimeHours: 1,
  targetTimeMinutes: 59,
  targetDistanceMiles: 13.1,
  weeksUntilRace: 10,
  runsPerWeek: 3,
  hasSpeedWork: true,
  restDaysBetweenRuns: 2,
};

const DEFAULT_HOUSING: HousingParams = {
  monthlyNetIncome: 4200,
  hourlyTimeValuation: 25,
  discretionaryBuffer: 950,
  options: [
    {
      id: 'opt-stay',
      name: 'Staying Put (Current Apt)',
      rent: 1450,
      utilities: 140,
      commuteDaysPerWeek: 5,
      commuteOneWayMinutes: 15,
      commuteTransitCostPerMonth: 65,
      roommateSplit: 1,
      description: 'Zero moving friction, high familiarity, stable rent.',
    },
    {
      id: 'opt-roommate',
      name: 'Shared 2-Bed with Roommate',
      rent: 2200,
      utilities: 180,
      commuteDaysPerWeek: 5,
      commuteOneWayMinutes: 25,
      commuteTransitCostPerMonth: 90,
      roommateSplit: 2,
      description: 'Rent and utilities divided equally, moderate commute.',
    },
    {
      id: 'opt-studio',
      name: 'Studio Further Out',
      rent: 980,
      utilities: 110,
      commuteDaysPerWeek: 5,
      commuteOneWayMinutes: 45,
      commuteTransitCostPerMonth: 195,
      roommateSplit: 1,
      description: 'Lowest monthly rent, long transit commute, independent space.',
    },
  ],
};

const DEFAULT_GPA: GpaParams = {
  currentCumulativeGpa: 3.42,
  completedCreditHours: 45,
  currentCourseCredits: 4,
  midtermWeight: 25,
  midtermScore: 78,
  assignmentWeight: 35,
  assignmentScore: 88,
  finalExamWeight: 40,
  targetLetterGrade: 'A',
};

const DEFAULT_BUDGET: BudgetParams = {
  expectedAttendees: 120,
  ticketPrice: 15,
  foodCostPerPerson: 10,
  venueRentalCost: 650,
  equipmentAVCost: 200,
  sponsorSubsidy: 500,
  marketingBudget: 150,
};

const DEFAULT_CUSTOM: CustomParams = {
  title: 'Personal Study & Productivity Index',
  goalMetricName: 'Weekly Focus Score',
  goalMetricUnit: 'pts',
  targetValue: 85,
  formulaType: 'efficiency-ratio',
  levers: [
    {
      id: 'l1',
      label: 'Deep Work Hours',
      value: 24,
      min: 5,
      max: 50,
      step: 1,
      unit: 'hrs/wk',
      description: 'Undistracted focused work',
    },
    {
      id: 'l2',
      label: 'Total Available Screen Time',
      value: 35,
      min: 15,
      max: 70,
      step: 1,
      unit: 'hrs/wk',
      description: 'Total active work allocation',
    },
    {
      id: 'l3',
      label: 'Sleep Quality Modifier',
      value: 20,
      min: 0,
      max: 50,
      step: 5,
      unit: '% bonus',
      description: 'Rest & cognitive recovery boost',
    },
  ],
};

const DEFAULT_TRADING: TradingParams = {
  selectedIpoId: 'swiggy',
  ticker: 'SWIGGY',
  companyName: 'Swiggy Limited',
  offerPrice: 390,
  requestedShares: 380,
  expectedDay1Pop: 15.4,
  oversubscriptionRatio: 3.59,
  lockupPeriodDays: 0,
  postLockupDiscount: -4.5,
  stopLossPercent: 7.5,
  capitalCommitted: 148200,
};

export default function App() {
  const [activeScenario, setActiveScenario] = useState<ScenarioId>('trading');
  const [currentTheme, setCurrentTheme] = useState<ThemeId>('slate');

  // Scenario state
  const [runningParams, setRunningParams] = useState<RunningParams>(DEFAULT_RUNNING);
  const [housingParams, setHousingParams] = useState<HousingParams>(DEFAULT_HOUSING);
  const [gpaParams, setGpaParams] = useState<GpaParams>(DEFAULT_GPA);
  const [budgetParams, setBudgetParams] = useState<BudgetParams>(DEFAULT_BUDGET);
  const [customParams, setCustomParams] = useState<CustomParams>(DEFAULT_CUSTOM);
  const [tradingParams, setTradingParams] = useState<TradingParams>(DEFAULT_TRADING);

  // Modals & Drawers
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isSanityCheckOpen, setIsSanityCheckOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isSplitViewOpen, setIsSplitViewOpen] = useState(false);
  const [isGoogleSearchOpen, setIsGoogleSearchOpen] = useState(false);
  const [googleSearchQuery, setGoogleSearchQuery] = useState<string | undefined>(undefined);
  const [isMonteCarloOpen, setIsMonteCarloOpen] = useState(false);
  const [isGoalSeekOpen, setIsGoalSeekOpen] = useState(false);
  const [isPresetsOpen, setIsPresetsOpen] = useState(false);
  const [isDecisionReportOpen, setIsDecisionReportOpen] = useState(false);
  const [isPortfolioOpen, setIsPortfolioOpen] = useState(false);
  const [isTornadoOpen, setIsTornadoOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [revertToast, setRevertToast] = useState<string | null>(null);
  const [exportToast, setExportToast] = useState<string | null>(null);
  const [tradingToast, setTradingToast] = useState<{
    message: string;
    severity: 'success' | 'info' | 'warning' | 'danger';
  } | null>(null);
  const exportToastTimerRef = useRef<number | null>(null);
  const tradingToastTimerRef = useRef<number | null>(null);

  const triggerExportToast = (message: string) => {
    setExportToast(message);
    if (exportToastTimerRef.current) window.clearTimeout(exportToastTimerRef.current);
    exportToastTimerRef.current = window.setTimeout(() => setExportToast(null), 4000);
  };

  const triggerTradingToast = (
    message: string,
    severity: 'success' | 'info' | 'warning' | 'danger' = 'info'
  ) => {
    setTradingToast({ message, severity });
    if (tradingToastTimerRef.current) window.clearTimeout(tradingToastTimerRef.current);
    tradingToastTimerRef.current = window.setTimeout(() => setTradingToast(null), 4500);
  };

  useEffect(() => {
    return () => {
      if (exportToastTimerRef.current) window.clearTimeout(exportToastTimerRef.current);
      if (tradingToastTimerRef.current) window.clearTimeout(tradingToastTimerRef.current);
    };
  }, []);

  const handleOpenGoogleSearch = (query?: string) => {
    setGoogleSearchQuery(query);
    setIsGoogleSearchOpen(true);
  };

  const handleApplyGoalSeekLever = (leverKey: string, newValue: number) => {
    switch (activeScenario) {
      case 'running':
        if (leverKey === 'weeksUntilRace') {
          setRunningParams((p) => ({ ...p, weeksUntilRace: Math.round(newValue) }));
        } else if (leverKey === 'runsPerWeek') {
          setRunningParams((p) => ({ ...p, runsPerWeek: Math.round(newValue) }));
        }
        break;
      case 'housing':
        if (leverKey === 'opt0_rent') {
          setHousingParams((p) => ({
            ...p,
            options: p.options.map((o, idx) => (idx === 0 ? { ...o, rent: newValue } : o)),
          }));
        } else if (leverKey === 'monthlyNetIncome') {
          setHousingParams((p) => ({ ...p, monthlyNetIncome: newValue }));
        }
        break;
      case 'gpa':
        if (leverKey === 'midtermScore') {
          setGpaParams((p) => ({ ...p, midtermScore: newValue }));
        } else if (leverKey === 'finalExamWeight') {
          setGpaParams((p) => ({ ...p, finalExamWeight: newValue }));
        }
        break;
      case 'budget':
        if (leverKey === 'ticketPrice') {
          setBudgetParams((p) => ({ ...p, ticketPrice: newValue }));
        } else if (leverKey === 'expectedAttendees') {
          setBudgetParams((p) => ({ ...p, expectedAttendees: Math.round(newValue) }));
        } else if (leverKey === 'foodCostPerPerson') {
          setBudgetParams((p) => ({ ...p, foodCostPerPerson: newValue }));
        }
        break;
      case 'custom': {
        const idx = parseInt(leverKey.replace('lever_', ''), 10) || 0;
        setCustomParams((p) => {
          const next = [...p.levers] as [any, any, any];
          next[idx] = { ...next[idx], value: newValue };
          return { ...p, levers: next };
        });
        break;
      }
      case 'trading':
        if (leverKey === 'requestedShares') {
          setTradingParams((p) => ({ ...p, requestedShares: Math.round(newValue) }));
        } else if (leverKey === 'offerPrice') {
          setTradingParams((p) => ({ ...p, offerPrice: newValue }));
        } else if (leverKey === 'expectedDay1Pop') {
          setTradingParams((p) => ({ ...p, expectedDay1Pop: newValue }));
        } else if (leverKey === 'capitalCommitted') {
          setTradingParams((p) => ({ ...p, capitalCommitted: newValue }));
        }
        break;
    }
    setRevertToast(`Goal Seek applied: ${newValue}`);
    setTimeout(() => setRevertToast(null), 3000);
  };

  const handleLoadPreset = (presetParams: any) => {
    switch (activeScenario) {
      case 'running':
        setRunningParams(presetParams);
        break;
      case 'housing':
        setHousingParams(presetParams);
        break;
      case 'gpa':
        setGpaParams(presetParams);
        break;
      case 'budget':
        setBudgetParams(presetParams);
        break;
      case 'custom':
        setCustomParams(presetParams);
        break;
      case 'trading':
        setTradingParams(presetParams);
        break;
    }
    setRevertToast('Loaded archetype profile successfully');
    setTimeout(() => setRevertToast(null), 3000);
  };

  // Configuration history state (last 5 tracked per scenario)
  const [history, setHistory] = useState<ScenarioHistorySnapshot[]>(() => [
    createSnapshot('running', DEFAULT_RUNNING),
    createSnapshot('housing', DEFAULT_HOUSING),
    createSnapshot('gpa', DEFAULT_GPA),
    createSnapshot('budget', DEFAULT_BUDGET),
    createSnapshot('trading', DEFAULT_TRADING),
  ]);

  // Step checklist state
  const [completedSteps, setCompletedSteps] = useState<Record<string, boolean>>({
    s1_scenario_defined: true,
    s1_key_variables: true,
    s2_sliders_wired: true,
    s2_side_by_side: true,
  });

  // Apply theme to document element
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', currentTheme);
  }, [currentTheme]);

  // Sync theme subtly with scenario presets if user hasn't explicitly locked
  const handleSelectScenario = (scenario: ScenarioId) => {
    setActiveScenario(scenario);
    if (scenario === 'running') setCurrentTheme('marathon');
    else if (scenario === 'housing') setCurrentTheme('emerald');
    else if (scenario === 'gpa') setCurrentTheme('collegiate');
    else if (scenario === 'budget') setCurrentTheme('collegiate');
    else if (scenario === 'trading') setCurrentTheme('slate');
    else setCurrentTheme('slate');
  };

  const handleToggleStep = (stepId: string) => {
    setCompletedSteps((prev) => ({
      ...prev,
      [stepId]: !prev[stepId],
    }));
  };

  const handleResetActiveScenario = () => {
    if (activeScenario === 'running') setRunningParams(DEFAULT_RUNNING);
    else if (activeScenario === 'housing') setHousingParams(DEFAULT_HOUSING);
    else if (activeScenario === 'gpa') setGpaParams(DEFAULT_GPA);
    else if (activeScenario === 'budget') setBudgetParams(DEFAULT_BUDGET);
    else if (activeScenario === 'trading') setTradingParams(DEFAULT_TRADING);
    else setCustomParams(DEFAULT_CUSTOM);
  };

  const completedTasksCount = Object.values(completedSteps).filter(Boolean).length;

  const getActiveParams = () => {
    switch (activeScenario) {
      case 'running':
        return runningParams;
      case 'housing':
        return housingParams;
      case 'gpa':
        return gpaParams;
      case 'budget':
        return budgetParams;
      case 'trading':
        return tradingParams;
      case 'custom':
        return customParams;
      default:
        return runningParams;
    }
  };

  // Debounced auto-tracking for last 5 configurations per scenario
  useEffect(() => {
    const activeParams = getActiveParams();
    const timer = setTimeout(() => {
      setHistory((prevHistory) => {
        const scenarioHistory = prevHistory.filter((h) => h.scenarioId === activeScenario);
        const latest = scenarioHistory[0];

        // Only save if different from latest snapshot of this scenario
        if (!latest || !areParamsEqual(latest.params, activeParams)) {
          const newSnapshot = createSnapshot(activeScenario, activeParams);
          const otherScenarios = prevHistory.filter((h) => h.scenarioId !== activeScenario);
          const updatedScenario = [newSnapshot, ...scenarioHistory].slice(0, 5);
          return [...updatedScenario, ...otherScenarios];
        }
        return prevHistory;
      });
    }, 1200);

    return () => clearTimeout(timer);
  }, [runningParams, housingParams, gpaParams, budgetParams, customParams, tradingParams, activeScenario]);

  const handleRestoreSnapshot = (snapshot: ScenarioHistorySnapshot) => {
    if (snapshot.scenarioId !== activeScenario) {
      setActiveScenario(snapshot.scenarioId);
    }

    switch (snapshot.scenarioId) {
      case 'running':
        setRunningParams(snapshot.params as RunningParams);
        break;
      case 'housing':
        setHousingParams(snapshot.params as HousingParams);
        break;
      case 'gpa':
        setGpaParams(snapshot.params as GpaParams);
        break;
      case 'budget':
        setBudgetParams(snapshot.params as BudgetParams);
        break;
      case 'trading':
        setTradingParams(snapshot.params as TradingParams);
        break;
      case 'custom':
        setCustomParams(snapshot.params as CustomParams);
        break;
    }

    setIsHistoryOpen(false);
    setRevertToast(`Reverted to configuration from ${snapshot.timeFormatted}`);
    setTimeout(() => setRevertToast(null), 3000);
  };

  const handleManualSnapshot = () => {
    const activeParams = getActiveParams();
    const newSnapshot = createSnapshot(activeScenario, activeParams);
    setHistory((prev) => {
      const scenarioHistory = prev.filter((h) => h.scenarioId === activeScenario);
      const otherScenarios = prev.filter((h) => h.scenarioId !== activeScenario);
      return [newSnapshot, ...scenarioHistory.slice(0, 4), ...otherScenarios];
    });
    setRevertToast('Saved current state as a checkpoint');
    setTimeout(() => setRevertToast(null), 2500);
  };

  const handleClearHistory = () => {
    setHistory((prev) => prev.filter((h) => h.scenarioId !== activeScenario));
  };

  // Global keyboard shortcuts: 'H' for History, 'S' for Split View, 'C' for Sanity Check, 'Escape' to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Do not trigger shortcuts when user is typing inside form inputs, textareas, selects, or editable fields
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable)
      ) {
        return;
      }

      // Command Palette (Cmd+K or Ctrl+K)
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
        return;
      }

      // Preserve native browser shortcuts (e.g., Ctrl+C for copy, Ctrl+S for save, Ctrl+H for browser history)
      if (e.metaKey || e.ctrlKey || e.altKey) {
        return;
      }

      const key = e.key.toLowerCase();

      if (e.key === 'Escape') {
        setIsHistoryOpen(false);
        setIsSplitViewOpen(false);
        setIsSanityCheckOpen(false);
        setIsGoogleSearchOpen(false);
        setIsMonteCarloOpen(false);
        setIsGoalSeekOpen(false);
        setIsPresetsOpen(false);
        setIsDecisionReportOpen(false);
        setIsPortfolioOpen(false);
        setIsTornadoOpen(false);
        setIsCommandPaletteOpen(false);
        setIsGuideOpen(false);
        setIsExportOpen(false);
        return;
      }

      // Prevent single-letter global shortcuts from stacking a second modal when any modal/drawer is already open
      if (document.querySelector('.fixed.inset-0')) {
        return;
      }

      if (key === 'k' || key === '/') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      } else if (key === 'y') {
        e.preventDefault();
        setIsTornadoOpen((prev) => !prev);
      } else if (key === 'h') {
        e.preventDefault();
        setIsHistoryOpen((prev) => !prev);
      } else if (key === 's') {
        e.preventDefault();
        setIsSplitViewOpen((prev) => !prev);
      } else if (key === 'c') {
        e.preventDefault();
        setIsSanityCheckOpen((prev) => !prev);
      } else if (key === 'g') {
        e.preventDefault();
        setIsGoogleSearchOpen((prev) => !prev);
      } else if (key === 'm') {
        e.preventDefault();
        setIsMonteCarloOpen((prev) => !prev);
      } else if (key === 'o') {
        e.preventDefault();
        setIsGoalSeekOpen((prev) => !prev);
      } else if (key === 'p') {
        e.preventDefault();
        setIsPresetsOpen((prev) => !prev);
      } else if (key === 'r') {
        e.preventDefault();
        setIsDecisionReportOpen((prev) => !prev);
      } else if (key === 't') {
        e.preventDefault();
        setIsPortfolioOpen((prev) => !prev);
      } else if (key === 'e') {
        e.preventDefault();
        setIsExportOpen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const activeHistoryCount = history.filter((h) => h.scenarioId === activeScenario).length;

  const getThemeBgClass = (theme: ThemeId) => {
    switch (theme) {
      case 'emerald':
        return 'bg-emerald-50/25';
      case 'marathon':
        return 'bg-orange-50/25';
      case 'collegiate':
        return 'bg-blue-50/25';
      case 'crimson':
        return 'bg-rose-50/25';
      case 'slate':
      default:
        return 'bg-slate-50/70';
    }
  };

  return (
    <div className={`min-h-screen flex flex-col text-slate-900 transition-colors duration-300 ${getThemeBgClass(currentTheme)}`}>
      {/* Top Bar Contract (3 zones) */}
      <Navbar
        activeScenario={activeScenario}
        onSelectScenario={handleSelectScenario}
        currentTheme={currentTheme}
        onSelectTheme={setCurrentTheme}
        onOpenGuide={() => setIsGuideOpen(true)}
        onOpenSanityCheck={() => setIsSanityCheckOpen(true)}
        onOpenExport={() => setIsExportOpen(true)}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onOpenSplitView={() => setIsSplitViewOpen(true)}
        onOpenGoogleSearch={handleOpenGoogleSearch}
        onOpenMonteCarlo={() => setIsMonteCarloOpen(true)}
        onOpenGoalSeek={() => setIsGoalSeekOpen(true)}
        onOpenTornado={() => setIsTornadoOpen(true)}
        onOpenPresets={() => setIsPresetsOpen(true)}
        onOpenDecisionReport={() => setIsDecisionReportOpen(true)}
        onOpenPortfolio={() => setIsPortfolioOpen(true)}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        onResetActiveScenario={handleResetActiveScenario}
        completedTasksCount={completedTasksCount}
        historyCount={activeHistoryCount}
      />

      {/* Unified Stacked Floating Toast Container (Prevents overlapping notifications) */}
      {(revertToast || exportToast || tradingToast) && (
        <div className="fixed bottom-6 right-6 z-[70] flex flex-col items-end gap-2 max-w-md pointer-events-none">
          {revertToast && (
            <div className="pointer-events-auto bg-slate-900 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-xl border border-slate-700 flex items-center gap-2">
              <RotateCcw className="w-3.5 h-3.5 text-orange-400 shrink-0" />
              <span>{revertToast}</span>
            </div>
          )}

          {tradingToast && (
            <div
              role="status"
              aria-live="polite"
              className={`pointer-events-auto px-4 py-3 rounded-xl shadow-2xl border text-xs font-semibold flex items-center justify-between gap-3 ${
                tradingToast.severity === 'danger'
                  ? 'bg-rose-950 text-rose-50 border-rose-700'
                  : tradingToast.severity === 'success'
                  ? 'bg-emerald-950 text-emerald-50 border-emerald-700'
                  : 'bg-slate-900 text-white border-slate-700'
              }`}
            >
              <div className="flex items-center gap-2">
                {tradingToast.severity === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
                <span>{tradingToast.message}</span>
              </div>
              <button
                type="button"
                onClick={() => setTradingToast(null)}
                aria-label="Dismiss notification"
                className="text-slate-300 hover:text-white shrink-0"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {exportToast && (
            <div
              role="status"
              aria-live="polite"
              className="pointer-events-auto bg-emerald-950 text-emerald-50 text-xs font-semibold px-4 py-3 rounded-xl shadow-2xl border border-emerald-700 flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{exportToast}</span>
              </div>
              <button
                type="button"
                onClick={() => setExportToast(null)}
                aria-label="Dismiss notification"
                className="text-emerald-300 hover:text-white shrink-0"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Executive Decision Workflow & Status Bar */}
        <div className="bg-white rounded-xl p-3 px-4 border border-slate-200/90 shadow-2xs flex flex-col xl:flex-row xl:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="w-2 h-2 rounded-full bg-emerald-500 ring-4 ring-emerald-100" />
              <span className="font-bold text-slate-900 tracking-tight text-xs whitespace-nowrap">Sim Engine Live</span>
            </div>
            <span className="text-slate-300 shrink-0">·</span>
            <span className="text-slate-600 truncate font-medium">
              {activeScenario === 'running' && 'Scenario 1: Half-Marathon Sub-2:00 Pacing Optimization'}
              {activeScenario === 'housing' && 'Scenario 2: Metro Living vs. Roommate Budget Allocation'}
              {activeScenario === 'gpa' && 'Scenario 3: Course Exam Stakes & Grade Target Calculator'}
              {activeScenario === 'budget' && 'Scenario 4: Campus Event Break-Even & Cost Elasticity'}
              {activeScenario === 'trading' && 'Scenario 5: IPO Tracker, Broker Connect & Live Algorithmic Trading Desk'}
              {activeScenario === 'custom' && 'Scenario 6: Multi-Lever Mathematical Sandbox'}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2 min-w-0">
            {/* 3-Step Methodology Pipeline */}
            <div className="hidden sm:flex items-center gap-2 text-[11px] font-medium text-slate-600 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200 whitespace-nowrap shrink-0">
              <span className="text-emerald-700 flex items-center gap-1 font-semibold whitespace-nowrap">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                1. Calibrate
              </span>
              <span className="text-slate-300">→</span>
              <span className="text-emerald-700 flex items-center gap-1 font-semibold whitespace-nowrap">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                2. Limits & Glow
              </span>
              <span className="text-slate-300">→</span>
              <button
                type="button"
                onClick={() => setIsSanityCheckOpen(true)}
                className="text-slate-900 hover:text-orange-600 font-bold flex items-center gap-1 transition-colors whitespace-nowrap"
                title="Sanity-Check Math & Sensitivity (Press 'C')"
              >
                <Calculator className="w-3.5 h-3.5 text-orange-600 shrink-0" />
                <span>3. Sensitivity</span>
              </button>
            </div>

            {/* Quick Intelligence Tool Trigger Buttons */}
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => setIsGoalSeekOpen(true)}
                className="hidden md:inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-indigo-700 hover:text-indigo-900 bg-indigo-50/80 hover:bg-indigo-100 border border-indigo-200/80 rounded-lg transition-colors shadow-2xs whitespace-nowrap shrink-0"
                title="Goal Seek: Auto-solve levers for target outcome (Press 'O')"
              >
                <Target className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                <span>Goal Seek</span>
              </button>

              <button
                type="button"
                onClick={() => setIsTornadoOpen(true)}
                className="hidden md:inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-amber-900 hover:text-amber-950 bg-amber-50/80 hover:bg-amber-100 border border-amber-200/80 rounded-lg transition-colors shadow-2xs whitespace-nowrap shrink-0"
                title="Tornado Sensitivity Diagram: Outcome swing ranking (Press 'Y')"
              >
                <Zap className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>Tornado</span>
              </button>

              <button
                type="button"
                onClick={() => setIsMonteCarloOpen(true)}
                className="hidden md:inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-orange-800 hover:text-orange-950 bg-orange-50/80 hover:bg-orange-100 border border-orange-200/80 rounded-lg transition-colors shadow-2xs whitespace-nowrap shrink-0"
                title="Monte Carlo Stochastic Risk Simulation (Press 'M')"
              >
                <Dices className="w-3.5 h-3.5 text-orange-600 shrink-0" />
                <span>Monte Carlo</span>
              </button>

              <button
                type="button"
                onClick={() => setIsExportOpen(true)}
                className="hidden lg:inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-emerald-800 hover:text-emerald-950 bg-emerald-50/80 hover:bg-emerald-100 border border-emerald-200/80 rounded-lg transition-colors shadow-2xs whitespace-nowrap shrink-0"
                title="Export Scenario Data as PDF or CSV (Press 'E')"
              >
                <Download className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Export</span>
              </button>

              {/* Checklist Drawer Trigger */}
              <button
                type="button"
                onClick={() => setIsGuideOpen(true)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors shadow-2xs whitespace-nowrap shrink-0"
                title="Open full interactive decision checklist"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span>Checklist</span>
                <span className="font-mono text-[10px] text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                  {completedTasksCount}/10
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Active Scenario Component */}
        {activeScenario === 'running' && (
          <RunningScenario
            params={runningParams}
            setParams={setRunningParams}
            onOpenSanityCheck={() => setIsSanityCheckOpen(true)}
            onOpenExport={() => setIsExportOpen(true)}
            onOpenHistory={() => setIsHistoryOpen(true)}
            onOpenSplitView={() => setIsSplitViewOpen(true)}
            onOpenGoogleSearch={handleOpenGoogleSearch}
          />
        )}

        {activeScenario === 'housing' && (
          <HousingScenario
            params={housingParams}
            setParams={setHousingParams}
            onOpenSanityCheck={() => setIsSanityCheckOpen(true)}
            onOpenExport={() => setIsExportOpen(true)}
            onOpenHistory={() => setIsHistoryOpen(true)}
            onOpenSplitView={() => setIsSplitViewOpen(true)}
            onOpenGoogleSearch={handleOpenGoogleSearch}
          />
        )}

        {activeScenario === 'gpa' && (
          <GpaScenario
            params={gpaParams}
            setParams={setGpaParams}
            onOpenSanityCheck={() => setIsSanityCheckOpen(true)}
            onOpenExport={() => setIsExportOpen(true)}
            onOpenHistory={() => setIsHistoryOpen(true)}
            onOpenSplitView={() => setIsSplitViewOpen(true)}
            onOpenGoogleSearch={handleOpenGoogleSearch}
          />
        )}

        {activeScenario === 'budget' && (
          <BudgetScenario
            params={budgetParams}
            setParams={setBudgetParams}
            onOpenSanityCheck={() => setIsSanityCheckOpen(true)}
            onOpenExport={() => setIsExportOpen(true)}
            onOpenHistory={() => setIsHistoryOpen(true)}
            onOpenSplitView={() => setIsSplitViewOpen(true)}
            onOpenGoogleSearch={handleOpenGoogleSearch}
          />
        )}

        {activeScenario === 'trading' && (
          <TradingScenario
            onOpenSanityCheck={() => setIsSanityCheckOpen(true)}
            onOpenExport={() => setIsExportOpen(true)}
            onOpenHistory={() => setIsHistoryOpen(true)}
            onOpenSplitView={() => setIsSplitViewOpen(true)}
            onNotify={triggerTradingToast}
          />
        )}

        {activeScenario === 'custom' && (
          <CustomScenario
            params={customParams}
            setParams={setCustomParams}
            onOpenSanityCheck={() => setIsSanityCheckOpen(true)}
            onOpenExport={() => setIsExportOpen(true)}
            onOpenHistory={() => setIsHistoryOpen(true)}
            onOpenSplitView={() => setIsSplitViewOpen(true)}
            onOpenGoogleSearch={handleOpenGoogleSearch}
          />
        )}
      </main>

      {/* Clean Editorial Footer with Global Keyboard Shortcuts Guide */}
      <footer className="border-t border-slate-200 bg-white py-5 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center flex-wrap gap-2 shrink-0">
            <span className="font-semibold text-slate-800 whitespace-nowrap">TradeOff Lab</span>
            <span aria-hidden="true">·</span>
            <span>Interactive Data Visualization for Real-World Decisions</span>
          </div>

          {/* Keyboard Shortcuts Navigation Bar */}
          <div className="flex items-center flex-wrap gap-x-2 gap-y-1.5 text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200/80">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mr-1 whitespace-nowrap">Shortcuts:</span>
            <span className="inline-flex items-center gap-1 whitespace-nowrap">
              <kbd className="px-1.5 py-0.5 text-[10px] font-mono font-bold bg-white text-blue-700 border border-blue-200 rounded shadow-2xs">G</kbd>
              <span className="text-slate-600 font-medium">Real-Time Data</span>
            </span>
            <span className="text-slate-300">·</span>
            <span className="inline-flex items-center gap-1 whitespace-nowrap">
              <kbd className="px-1.5 py-0.5 text-[10px] font-mono font-bold bg-white text-orange-800 border border-orange-300 rounded shadow-2xs">P</kbd>
              <span className="text-slate-600 font-medium">Archetypes</span>
            </span>
            <span className="text-slate-300">·</span>
            <span className="inline-flex items-center gap-1 whitespace-nowrap">
              <kbd className="px-1.5 py-0.5 text-[10px] font-mono font-bold bg-white text-indigo-700 border border-indigo-200 rounded shadow-2xs">O</kbd>
              <span className="text-slate-600 font-medium">Goal Seek</span>
            </span>
            <span className="text-slate-300">·</span>
            <span className="inline-flex items-center gap-1 whitespace-nowrap">
              <kbd className="px-1.5 py-0.5 text-[10px] font-mono font-bold bg-white text-orange-800 border border-orange-300 rounded shadow-2xs">M</kbd>
              <span className="text-slate-600 font-medium">Monte Carlo</span>
            </span>
            <span className="text-slate-300">·</span>
            <span className="inline-flex items-center gap-1 whitespace-nowrap">
              <kbd className="px-1.5 py-0.5 text-[10px] font-mono font-bold bg-white text-slate-700 border border-slate-300 rounded shadow-2xs">R</kbd>
              <span className="text-slate-600 font-medium">Decision Brief</span>
            </span>
            <span className="text-slate-300">·</span>
            <span className="inline-flex items-center gap-1 whitespace-nowrap">
              <kbd className="px-1.5 py-0.5 text-[10px] font-mono font-bold bg-white text-orange-700 border border-orange-300 rounded shadow-2xs">T</kbd>
              <span className="text-slate-600 font-medium">Radar Matrix</span>
            </span>
            <span className="text-slate-300">·</span>
            <span className="inline-flex items-center gap-1 whitespace-nowrap">
              <kbd className="px-1.5 py-0.5 text-[10px] font-mono font-bold bg-white text-slate-700 border border-slate-300 rounded shadow-2xs">H</kbd>
              <span className="text-slate-600 font-medium">History</span>
            </span>
            <span className="text-slate-300">·</span>
            <span className="inline-flex items-center gap-1 whitespace-nowrap">
              <kbd className="px-1.5 py-0.5 text-[10px] font-mono font-bold bg-white text-indigo-700 border border-indigo-200 rounded shadow-2xs">S</kbd>
              <span className="text-slate-600 font-medium">Split View</span>
            </span>
            <span className="text-slate-300">·</span>
            <span className="inline-flex items-center gap-1 whitespace-nowrap">
              <kbd className="px-1.5 py-0.5 text-[10px] font-mono font-bold bg-white text-amber-800 border border-amber-300 rounded shadow-2xs">C</kbd>
              <span className="text-slate-600 font-medium">Sanity Check</span>
            </span>
            <span className="text-slate-300">·</span>
            <span className="inline-flex items-center gap-1 whitespace-nowrap">
              <kbd className="px-1.5 py-0.5 text-[10px] font-mono font-bold bg-white text-slate-600 border border-slate-300 rounded shadow-2xs">Esc</kbd>
              <span className="text-slate-500">Close</span>
            </span>
          </div>
        </div>
      </footer>

      {/* Interactive Process Guide Drawer */}
      <ProcessGuideDrawer
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
        activeScenario={activeScenario}
        onSelectScenario={handleSelectScenario}
        completedSteps={completedSteps}
        onToggleStep={handleToggleStep}
        onOpenSanityCheck={() => setIsSanityCheckOpen(true)}
      />

      {/* Sanity Check & Stress-Testing Modal */}
      <SanityCheckModal
        isOpen={isSanityCheckOpen}
        onClose={() => setIsSanityCheckOpen(false)}
        activeScenario={activeScenario}
        runningParams={runningParams}
        setRunningParams={setRunningParams}
        housingParams={housingParams}
        setHousingParams={setHousingParams}
        gpaParams={gpaParams}
        setGpaParams={setGpaParams}
        budgetParams={budgetParams}
        setBudgetParams={setBudgetParams}
      />

      {/* Export / Download / Copy Modal */}
      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        scenarioId={activeScenario}
        params={getActiveParams()}
        onExportSuccess={triggerExportToast}
      />

      {/* Configuration History Drawer (Last 5 Tracked States) */}
      <HistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        activeScenario={activeScenario}
        currentParams={getActiveParams()}
        onRestore={handleRestoreSnapshot}
        onClearHistory={handleClearHistory}
        onSaveManualSnapshot={handleManualSnapshot}
        onOpenSplitView={() => {
          setIsHistoryOpen(false);
          setIsSplitViewOpen(true);
        }}
      />

      {/* Split-View Snapshot Comparator Modal with Delta-Highlighting UI */}
      <SplitViewModal
        isOpen={isSplitViewOpen}
        onClose={() => setIsSplitViewOpen(false)}
        history={history}
        activeScenario={activeScenario}
        currentParams={getActiveParams()}
        onRestore={handleRestoreSnapshot}
      />

      {/* Real-Time Google Search Grounding Modal */}
      <GoogleSearchModal
        isOpen={isGoogleSearchOpen}
        onClose={() => setIsGoogleSearchOpen(false)}
        activeScenario={activeScenario}
        runningParams={runningParams}
        setRunningParams={setRunningParams}
        housingParams={housingParams}
        setHousingParams={setHousingParams}
        gpaParams={gpaParams}
        setGpaParams={setGpaParams}
        budgetParams={budgetParams}
        setBudgetParams={setBudgetParams}
        customParams={customParams}
        setCustomParams={setCustomParams}
        initialQuery={googleSearchQuery}
      />

      {/* Monte Carlo Stochastic Risk Simulator Modal */}
      <MonteCarloModal
        isOpen={isMonteCarloOpen}
        onClose={() => setIsMonteCarloOpen(false)}
        activeScenario={activeScenario}
        params={getActiveParams()}
      />

      {/* Reverse Goal Seek Optimizer Modal */}
      <GoalSeekModal
        isOpen={isGoalSeekOpen}
        onClose={() => setIsGoalSeekOpen(false)}
        activeScenario={activeScenario}
        params={getActiveParams()}
        onApplyLeverValue={handleApplyGoalSeekLever}
      />

      {/* Archetype Presets & Custom Configuration Bookmarks Modal */}
      <PresetsModal
        isOpen={isPresetsOpen}
        onClose={() => setIsPresetsOpen(false)}
        activeScenario={activeScenario}
        currentParams={getActiveParams()}
        onLoadPreset={handleLoadPreset}
      />

      {/* Executive Decision Brief Memo & CSV Exporter Modal */}
      <DecisionReportModal
        isOpen={isDecisionReportOpen}
        onClose={() => setIsDecisionReportOpen(false)}
        activeScenario={activeScenario}
        params={getActiveParams()}
        onExportSuccess={triggerExportToast}
      />

      {/* Portfolio TradeOff Radar Matrix Modal */}
      <PortfolioMatrixModal
        isOpen={isPortfolioOpen}
        onClose={() => setIsPortfolioOpen(false)}
        runningParams={runningParams}
        housingParams={housingParams}
        gpaParams={gpaParams}
        budgetParams={budgetParams}
        customParams={customParams}
      />

      {/* Tornado Sensitivity & Elasticity Diagram Modal */}
      <TornadoSensitivityModal
        isOpen={isTornadoOpen}
        onClose={() => setIsTornadoOpen(false)}
        activeScenario={activeScenario}
        params={getActiveParams()}
        onOpenGoalSeek={() => setIsGoalSeekOpen(true)}
      />

      {/* Global Command Palette Modal (Cmd+K / /) */}
      <CommandPaletteModal
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onSelectScenario={handleSelectScenario}
        onOpenMonteCarlo={() => setIsMonteCarloOpen(true)}
        onOpenGoalSeek={() => setIsGoalSeekOpen(true)}
        onOpenTornado={() => setIsTornadoOpen(true)}
        onOpenPresets={() => setIsPresetsOpen(true)}
        onOpenDecisionReport={() => setIsDecisionReportOpen(true)}
        onOpenPortfolio={() => setIsPortfolioOpen(true)}
        onOpenExport={() => setIsExportOpen(true)}
        onOpenSplitView={() => setIsSplitViewOpen(true)}
        onOpenSanityCheck={() => setIsSanityCheckOpen(true)}
        onOpenGuide={() => setIsGuideOpen(true)}
        onResetScenario={handleResetActiveScenario}
        onSelectTheme={setCurrentTheme}
      />
    </div>
  );
}
