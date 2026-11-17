import React, { useState, useEffect, useRef } from 'react';
import {
  IpoItem,
  LiveMarketQuote,
  BrokerAccount,
  TradingOrder,
  TradingPosition,
  TradingHolding,
  StrategyConfig,
  BacktestResult,
  RiskManagementSettings,
  TradingAuditLog,
  OrderSide,
  OrderType,
  OrderProduct,
  TaxLot,
  TaxHarvestSimulationResult,
  LivePriceAlertRule,
  OptionChainInjectedLeg,
  GttOcoRule,
} from '../../types/trading';
import {
  INITIAL_IPOS,
  INITIAL_MARKET_QUOTES,
  runStrategyBacktest,
} from '../../utils/tradingMockData';
import { INITIAL_MULTI_BROKER_HOLDINGS } from '../../utils/portfolioHealthData';
import { INITIAL_PRICE_ALERTS } from '../../utils/moreModulesData';
import { StatCard } from '../common/StatCard';
import { BrokerConnectModal } from '../modals/BrokerConnectModal';
import { IpoAllotmentModal } from '../modals/IpoAllotmentModal';
import { OrderConfirmationModal } from '../modals/OrderConfirmationModal';
import { TradingGuideModal } from '../modals/TradingGuideModal';
import { PortfolioHealthTab } from '../trading/PortfolioHealthTab';
import { MarketNewsTab } from '../trading/MarketNewsTab';
import { ScreenerTab } from '../trading/ScreenerTab';
import { TradeJournalTab } from '../trading/TradeJournalTab';
import { BehavioralGuardrailsTab } from '../trading/BehavioralGuardrailsTab';
import { BenchmarkComparisonTab } from '../trading/BenchmarkComparisonTab';
import { EducationQuizModal } from '../trading/EducationQuizModal';
import { TaxLossHarvestingTab } from '../trading/TaxLossHarvestingTab';
import { CorporateActionsTab } from '../trading/CorporateActionsTab';
import { PositionSizingTab } from '../trading/PositionSizingTab';
import { StrategyVersioningTab } from '../trading/StrategyVersioningTab';
import { SectorRotationTab } from '../trading/SectorRotationTab';
import { DrawdownReportTab } from '../trading/DrawdownReportTab';
import { CommunityDiscussionTab } from '../trading/CommunityDiscussionTab';
import { PaperLeaderboardTab } from '../trading/PaperLeaderboardTab';
import { OptionsPayoffTab } from '../trading/OptionsPayoffTab';
import { PortfolioRebalanceTab } from '../trading/PortfolioRebalanceTab';
import { FireGoalSimulatorTab } from '../trading/FireGoalSimulatorTab';
import { MfOverlapTab } from '../trading/MfOverlapTab';
import { FiiDiiFlowsTab } from '../trading/FiiDiiFlowsTab';
import { LiveAlertsChecklistTab } from '../trading/LiveAlertsChecklistTab';
import { DividendCalendarTab } from '../trading/DividendCalendarTab';
import { CollateralPledgeTab } from '../trading/CollateralPledgeTab';
import { ContractNoteAuditTab } from '../trading/ContractNoteAuditTab';
import { CapitalGainsTaxTab } from '../trading/CapitalGainsTaxTab';
import { OptionChainOiTab } from '../trading/OptionChainOiTab';
import { InsiderShareholdingTab } from '../trading/InsiderShareholdingTab';
import { TechnicalChartDeskTab } from '../trading/TechnicalChartDeskTab';
import { StockBasketGttTab } from '../trading/StockBasketGttTab';
import { DebtSgbLadderTab } from '../trading/DebtSgbLadderTab';
import { KeyboardShortcutsModal } from '../modals/KeyboardShortcutsModal';
import { ExecutiveBriefModal } from '../modals/ExecutiveBriefModal';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  AreaChart,
  Area,
  BarChart,
  Bar,
  ReferenceLine,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  ShieldAlert,
  ShieldCheck,
  Zap,
  BookOpen,
  Search,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Sliders,
  DollarSign,
  ArrowRight,
  Clock,
  Building,
  Lock,
  Layers,
  FileText,
  Activity,
  X,
  Play,
  RotateCcw,
  Sparkles,
  GraduationCap,
  PieChart as PieChartIcon,
  Pause,
  Star,
  ChevronLeft,
  ChevronRight,
  ArrowUp,
  Keyboard,
} from 'lucide-react';
import { TradingSpotlightModal, SpotlightModuleItem } from '../trading/TradingSpotlightModal';

interface TradingScenarioProps {
  onOpenSanityCheck?: () => void;
  onOpenExport?: () => void;
  onOpenHistory?: () => void;
  onOpenSplitView?: () => void;
  onNotify?: (message: string, severity?: 'success' | 'info' | 'warning' | 'danger') => void;
}

export const TradingScenario: React.FC<TradingScenarioProps> = ({
  onOpenSanityCheck,
  onOpenExport,
  onOpenHistory,
  onOpenSplitView,
  onNotify,
}) => {
  // Navigation Tabs with localStorage persistence
  type TradingTabId =
    | 'ipos'
    | 'terminal'
    | 'portfolio_health'
    | 'screener'
    | 'news'
    | 'journal'
    | 'guardrails'
    | 'benchmarks'
    | 'strategies'
    | 'risk'
    | 'audit'
    | 'tax_harvest'
    | 'corporate_actions'
    | 'position_sizing'
    | 'strategy_versions'
    | 'sector_rotation'
    | 'drawdown_report'
    | 'community'
    | 'leaderboard'
    | 'options_lab'
    | 'rebalance'
    | 'fire_planner'
    | 'mf_overlap'
    | 'fii_dii'
    | 'live_alerts'
    | 'dividend_calendar'
    | 'pledge_margin'
    | 'contract_note_audit'
    | 'capital_gains_tax'
    | 'oi_option_chain'
    | 'insider_radar'
    | 'chart_desk'
    | 'basket_gtt'
    | 'debt_sgb_ladder';

  const validTabIds: TradingTabId[] = [
    'ipos', 'terminal', 'portfolio_health', 'screener', 'news', 'journal', 'guardrails',
    'benchmarks', 'strategies', 'risk', 'audit', 'tax_harvest', 'corporate_actions',
    'position_sizing', 'strategy_versions', 'sector_rotation', 'drawdown_report',
    'community', 'leaderboard', 'options_lab', 'rebalance', 'fire_planner',
    'mf_overlap', 'fii_dii', 'live_alerts', 'dividend_calendar', 'pledge_margin',
    'contract_note_audit', 'capital_gains_tax', 'oi_option_chain', 'insider_radar',
    'chart_desk', 'basket_gtt', 'debt_sgb_ladder',
  ];

  const [activeTab, setActiveTab] = useState<TradingTabId>(() => {
    try {
      const saved = localStorage.getItem('tradeoff_trading_v1_tab') as TradingTabId | null;
      if (saved && validTabIds.includes(saved)) return saved;
    } catch {
      // ignore storage failure
    }
    return 'portfolio_health';
  });

  const [activeTabCategory, setActiveTabCategory] = useState<
    'ALL' | 'PORTFOLIO_TAX' | 'TRADING_ORDERS' | 'RISK_SIZING' | 'STRATEGY_QUANT' | 'COMMUNITY_LEAGUE'
  >('ALL');

  // Non-blocking Toast & Feed Controls
  const [isFeedPaused, setIsFeedPaused] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    severity: 'success' | 'info' | 'warning' | 'danger';
  } | null>(null);
  const toastTimerRef = useRef<number | null>(null);

  const showToast = (
    message: string,
    severity: 'success' | 'info' | 'warning' | 'danger' = 'info'
  ) => {
    if (onNotify) {
      onNotify(message, severity);
      return;
    }
    setToast({ message, severity });
    if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    toastTimerRef.current = window.setTimeout(() => setToast(null), 4500);
  };

  // Modals
  const [isBrokerModalOpen, setIsBrokerModalOpen] = useState(false);
  const [isAllotmentModalOpen, setIsAllotmentModalOpen] = useState(false);
  const [isConfirmOrderModalOpen, setIsConfirmOrderModalOpen] = useState(false);
  const [isKillSwitchConfirmOpen, setIsKillSwitchConfirmOpen] = useState(false);
  const [isGuideModalOpen, setIsGuideModalOpen] = useState(false);
  const [isEducationModalOpen, setIsEducationModalOpen] = useState(false);
  const [isSpotlightOpen, setIsSpotlightOpen] = useState(false);
  const [isShortcutsModalOpen, setIsShortcutsModalOpen] = useState(false);
  const [isExecutiveBriefOpen, setIsExecutiveBriefOpen] = useState(false);
  const [traderMode, setTraderMode] = useState<'ALL' | 'INVESTOR' | 'FNO_SCALPER' | 'TAX_AUDIT'>('ALL');
  const [navigationReturnSource, setNavigationReturnSource] = useState<{
    tabId: TradingTabId;
    label: string;
    contextNote: string;
  } | null>(null);
  const [injectedOptionLeg, setInjectedOptionLeg] = useState<OptionChainInjectedLeg | null>(null);
  const [chartDeskSymbol, setChartDeskSymbol] = useState<string>('WAAREE');
  const [gttRules, setGttRules] = useState<GttOcoRule[]>(() => {
    try {
      const saved = localStorage.getItem('tradeoff_trading_v1_gtt');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // fallback
    }
    return [
      {
        id: 'GTT_INIT_1',
        symbol: 'WAAREE',
        quantity: 20,
        referencePrice: 2980,
        triggerTargetPrice: 3250,
        triggerStopPrice: 2820,
        isActive: true,
        createdAt: '09:30:00 AM',
      },
    ];
  });
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [pinnedTabIds, setPinnedTabIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('tradeoff_trading_v1_pinned');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // fallback
    }
    return ['portfolio_health', 'rebalance', 'tax_harvest', 'mf_overlap', 'position_sizing', 'terminal', 'options_lab', 'live_alerts'];
  });
  const [alertRules, setAlertRules] = useState<LivePriceAlertRule[]>(() => {
    try {
      const saved = localStorage.getItem('tradeoff_trading_v1_alerts');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // fallback
    }
    return INITIAL_PRICE_ALERTS;
  });
  const [isRiskCertified, setIsRiskCertified] = useState<boolean>(() => {
    try {
      return localStorage.getItem('tradeoff_trading_v1_certified') === 'true';
    } catch {
      return false;
    }
  });
  const [selectedIpoForCheck, setSelectedIpoForCheck] = useState<string>('ipo-swiggy');

  // Broker State
  const [brokerAccount, setBrokerAccount] = useState<BrokerAccount>({
    broker: 'paper',
    isConnected: true,
    apiKey: 'SIM_LIVE_KEY_84920',
    clientCode: 'DEMO_TRADER',
    lastSyncTime: 'Just now',
    isPaperTrading: true,
  });

  // Risk Management Settings with localStorage persistence
  const [riskSettings, setRiskSettings] = useState<RiskManagementSettings>(() => {
    try {
      const saved = localStorage.getItem('tradeoff_trading_v1_risk');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback to default
    }
    return {
      maxRiskPerTradePercent: 1.5,
      dailyLossLimit: 5000,
      maxCapitalExposurePercent: 25,
      isKillSwitchEngaged: false,
      dailyRealizedPnl: 1420,
      isTradingHaltedForDay: false,
    };
  });

  useEffect(() => {
    try {
      localStorage.setItem('tradeoff_trading_v1_tab', activeTab);
      localStorage.setItem('tradeoff_trading_v1_certified', String(isRiskCertified));
      localStorage.setItem('tradeoff_trading_v1_risk', JSON.stringify(riskSettings));
      localStorage.setItem('tradeoff_trading_v1_pinned', JSON.stringify(pinnedTabIds));
      localStorage.setItem('tradeoff_trading_v1_alerts', JSON.stringify(alertRules));
      localStorage.setItem('tradeoff_trading_v1_gtt', JSON.stringify(gttRules));
    } catch {
      // ignore quota errors
    }
  }, [activeTab, isRiskCertified, riskSettings, pinnedTabIds, alertRules, gttRules]);

  const pinnedTabIdsRef = useRef<string[]>(pinnedTabIds);
  const activeTabRef = useRef<TradingTabId>(activeTab);
  const prevModuleIdRef = useRef<TradingTabId>('audit');
  const nextModuleIdRef = useRef<TradingTabId>('rebalance');

  useEffect(() => {
    pinnedTabIdsRef.current = pinnedTabIds;
    activeTabRef.current = activeTab;
  }, [pinnedTabIds, activeTab]);

  // Keyboard shortcuts for Trading Desk: J Spotlight, ? Shortcuts, F Pause Feed, Alt+Left/Right Step, Alt+1..6 Pinned
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
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

      if (e.key === 'Escape') {
        setIsSpotlightOpen(false);
        setIsShortcutsModalOpen(false);
        setIsKillSwitchConfirmOpen(false);
        setIsBrokerModalOpen(false);
        setIsAllotmentModalOpen(false);
        setIsConfirmOrderModalOpen(false);
        setIsGuideModalOpen(false);
        setIsEducationModalOpen(false);
        setIsExecutiveBriefOpen(false);
        return;
      }

      if (!e.metaKey && !e.ctrlKey && !e.altKey) {
        if (document.querySelector('.fixed.inset-0')) {
          return;
        }
        if (e.key.toLowerCase() === 'j') {
          e.preventDefault();
          setIsSpotlightOpen((prev) => !prev);
        } else if (e.key === '?') {
          e.preventDefault();
          setIsShortcutsModalOpen((prev) => !prev);
        } else if (e.key.toLowerCase() === 'f') {
          e.preventDefault();
          setIsFeedPaused((prev) => !prev);
        }
      } else if (e.altKey && !e.metaKey && !e.ctrlKey) {
        if (e.key === 'ArrowLeft') {
          e.preventDefault();
          setActiveTab(prevModuleIdRef.current);
        } else if (e.key === 'ArrowRight') {
          e.preventDefault();
          setActiveTab(nextModuleIdRef.current);
        } else if (/^[1-6]$/.test(e.key)) {
          const idx = Number(e.key) - 1;
          const pinTarget = pinnedTabIdsRef.current[idx];
          if (pinTarget) {
            e.preventDefault();
            setActiveTab(pinTarget as TradingTabId);
          }
        }
      }
    };
    const onScroll = () => {
      setShowBackToTop(window.scrollY > 360);
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  const togglePinTab = (id: string) => {
    setPinnedTabIds((prev) => {
      const exists = prev.includes(id);
      const next = exists ? prev.filter((item) => item !== id) : [...prev, id];
      showToast(exists ? 'Removed from pinned favorites.' : 'Pinned to Quick Access bar.', 'info');
      return next;
    });
  };

  // IPO State & Filter
  const [ipos, setIpos] = useState<IpoItem[]>(INITIAL_IPOS);
  const [ipoFilter, setIpoFilter] = useState<'all' | 'open' | 'listed' | 'upcoming'>('all');

  // Market Quotes & Real-Time Ticker
  const [quotes, setQuotes] = useState<LiveMarketQuote[]>(INITIAL_MARKET_QUOTES);
  const [selectedQuoteSymbol, setSelectedQuoteSymbol] = useState<string>('WAAREE');

  // Order Placement Form State
  const [orderSide, setOrderSide] = useState<OrderSide>('BUY');
  const [orderType, setOrderType] = useState<OrderType>('MARKET');
  const [orderProduct, setOrderProduct] = useState<OrderProduct>('MIS');
  const [orderQuantity, setOrderQuantity] = useState<number>(25);
  const [orderPrice, setOrderPrice] = useState<number>(2980);
  const [orderStopLoss, setOrderStopLoss] = useState<number>(2890);
  const [orderTarget, setOrderTarget] = useState<number>(3150);
  const [orderToConfirm, setOrderToConfirm] = useState<any>(null);

  // Positions & Holdings
  const [positions, setPositions] = useState<TradingPosition[]>([
    {
      symbol: 'WAAREE',
      side: 'BUY',
      quantity: 35,
      buyAvgPrice: 2890.0,
      currentPrice: 2980.0,
      pnl: 3150.0,
      pnlPercent: 3.11,
      product: 'MIS',
      stopLossPrice: 2840.0,
      targetPrice: 3150.0,
      unrealizedPnl: 3150.0,
    },
    {
      symbol: 'BAJAJHFL',
      side: 'BUY',
      quantity: 200,
      buyAvgPrice: 139.5,
      currentPrice: 138.45,
      pnl: -210.0,
      pnlPercent: -0.75,
      product: 'CNC',
      stopLossPrice: 132.0,
      targetPrice: 155.0,
      unrealizedPnl: -210.0,
    },
  ]);

  const [holdings, setHoldings] = useState<TradingHolding[]>(INITIAL_MULTI_BROKER_HOLDINGS);

  const jumpWithContext = (
    targetTab: TradingTabId,
    contextNote: string,
    originTab?: TradingTabId,
    originLabel?: string
  ) => {
    if (originTab && originLabel) {
      setNavigationReturnSource({ tabId: originTab, label: originLabel, contextNote });
    }
    setActiveTab(targetTab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const applyTraderModePreset = (
    mode: 'ALL' | 'INVESTOR' | 'FNO_SCALPER' | 'TAX_AUDIT'
  ) => {
    setTraderMode(mode);
    if (mode === 'INVESTOR') {
      setActiveTabCategory('PORTFOLIO_TAX');
      setPinnedTabIds([
        'portfolio_health',
        'rebalance',
        'dividend_calendar',
        'mf_overlap',
        'insider_radar',
        'debt_sgb_ladder',
      ]);
      setActiveTab('portfolio_health');
      showToast('Workspace preset: Long-Term Investor (Holdings, Dividends, Insider & Debt Ladder)', 'info');
    } else if (mode === 'FNO_SCALPER') {
      setActiveTabCategory('TRADING_ORDERS');
      setPinnedTabIds([
        'terminal',
        'oi_option_chain',
        'options_lab',
        'chart_desk',
        'pledge_margin',
        'live_alerts',
      ]);
      setActiveTab('terminal');
      showToast('Workspace preset: F&O Scalper (Terminal, OI Chain, Payoff Lab & Charts)', 'info');
    } else if (mode === 'TAX_AUDIT') {
      setActiveTabCategory('PORTFOLIO_TAX');
      setPinnedTabIds([
        'capital_gains_tax',
        'tax_harvest',
        'contract_note_audit',
        'dividend_calendar',
        'audit',
        'journal',
      ]);
      setActiveTab('capital_gains_tax');
      showToast('Workspace preset: Tax & Audit (ITR Estimator, Harvesting & Contract Notes)', 'info');
    } else {
      setActiveTabCategory('ALL');
      showToast('Workspace preset: Full 34-Module Suite unlocked.', 'info');
    }
  };

  const handleTradeSymbolFromOtherTab = (
    sym: string,
    originTab?: TradingTabId,
    originLabel?: string
  ) => {
    setSelectedQuoteSymbol(sym);
    setChartDeskSymbol(sym);
    setOrderSide('BUY');
    const match = quotes.find((q) => q.symbol === sym);
    if (match) {
      setOrderPrice(match.lastPrice);
      setOrderStopLoss(Math.round(match.lastPrice * 0.98 * 100) / 100);
      setOrderTarget(Math.round(match.lastPrice * 1.05 * 100) / 100);
    }
    jumpWithContext(
      'terminal',
      `${sym} loaded into Live Order Desk`,
      originTab,
      originLabel
    );
    showToast(`Loaded ${sym} in Live Order Desk.`, 'info');
  };

  const handleApplyPositionSizeToTerminal = (payload: {
    quantity: number;
    entryPrice: number;
    stopLossPrice: number;
    targetPrice: number;
    product: 'CNC' | 'MIS';
  }) => {
    setOrderSide('BUY');
    setOrderType('LIMIT');
    setOrderProduct(payload.product);
    setOrderQuantity(payload.quantity);
    setOrderPrice(payload.entryPrice);
    setOrderStopLoss(payload.stopLossPrice);
    setOrderTarget(payload.targetPrice);
    jumpWithContext(
      'terminal',
      `${payload.quantity} sh @ ₹${payload.entryPrice} (SL ₹${payload.stopLossPrice})`,
      'position_sizing',
      'Position Sizing'
    );
    showToast(
      `Applied ${payload.quantity} shares @ ₹${payload.entryPrice} (SL ₹${payload.stopLossPrice}) to Order Desk.`,
      'success'
    );
  };

  const handleStageHarvestOrders = (
    lots: TaxLot[],
    simulation: TaxHarvestSimulationResult
  ) => {
    if (lots.length === 0) return;
    const primaryLot = lots[0];
    setSelectedQuoteSymbol(primaryLot.symbol);
    setOrderSide('SELL');
    setOrderProduct('CNC');
    setOrderType('LIMIT');
    setOrderQuantity(primaryLot.quantity);
    setOrderPrice(primaryLot.currentPrice);
    jumpWithContext(
      'terminal',
      `Harvest SELL ${primaryLot.quantity} ${primaryLot.symbol} (Est. tax saved ₹${simulation.estimatedTaxSaved.toLocaleString('en-IN')})`,
      'tax_harvest',
      'Tax-Loss Harvesting'
    );
    setAuditLogs((prev) => [
      {
        id: `LOG_${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        eventType: 'ORDER_SUBMITTED',
        symbol: primaryLot.symbol,
        description: `Staged Tax-Loss Harvest SELL (${lots.length} lot(s), est. tax saved ₹${simulation.estimatedTaxSaved.toLocaleString('en-IN')}).`,
        severity: 'info',
      },
      ...prev,
    ]);
    showToast(
      `Staged SELL ${primaryLot.quantity} ${primaryLot.symbol} in Order Desk (Est. Tax Saved: ₹${simulation.estimatedTaxSaved.toLocaleString('en-IN')}).`,
      'success'
    );
  };

  const handleDeployBasketOrders = (
    legs: { symbol: string; quantity: number; price: number }[],
    basketName: string
  ) => {
    if (riskSettings.isKillSwitchEngaged || riskSettings.isTradingHaltedForDay) {
      showToast('Basket blocked: Emergency Kill Switch / Circuit Breaker is engaged.', 'danger');
      return;
    }
    const nowTime = new Date().toLocaleTimeString();
    const newOrders: TradingOrder[] = legs.map((leg, i) => {
      const turnover = leg.quantity * leg.price;
      const stt = Math.round(turnover * 0.001 * 100) / 100;
      const gst = 0;
      return {
        id: `BSK_${Date.now()}_${i}`,
        symbol: leg.symbol,
        side: 'BUY',
        type: 'MARKET',
        product: 'CNC',
        quantity: leg.quantity,
        price: leg.price,
        status: 'EXECUTED',
        timestamp: nowTime,
        executionPrice: leg.price,
        brokerage: 0,
        stt,
        gst,
        totalCharges: stt,
      };
    });

    setOrders((prev) => [...newOrders, ...prev]);
    setAuditLogs((prev) => [
      {
        id: `LOG_BSK_${Date.now()}`,
        timestamp: nowTime,
        eventType: 'ORDER_EXECUTED',
        description: `Basket Executed: "${basketName}" (${legs.length} CNC constituents deployed cleanly).`,
        severity: 'success',
      },
      ...prev,
    ]);
    showToast(`Executed "${basketName}" basket (${legs.length} CNC orders logged in Terminal).`, 'success');
  };

  const [orders, setOrders] = useState<TradingOrder[]>([
    {
      id: 'ORD_INIT_1',
      symbol: 'WAAREE',
      side: 'BUY',
      type: 'MARKET',
      product: 'MIS',
      quantity: 35,
      price: 2890.0,
      status: 'EXECUTED',
      timestamp: '09:24:12 AM',
      executionPrice: 2890.0,
      brokerage: 20.0,
      stt: 25.2,
      gst: 3.6,
      totalCharges: 48.8,
    },
  ]);

  // Audit Logs
  const [auditLogs, setAuditLogs] = useState<TradingAuditLog[]>([
    {
      id: 'LOG_1',
      timestamp: '09:15:00 AM',
      eventType: 'BROKER_CONNECT',
      description: 'Broker gateway session initiated with Zerodha Kite Connect API.',
      severity: 'success',
    },
    {
      id: 'LOG_2',
      timestamp: '09:24:12 AM',
      eventType: 'ORDER_EXECUTED',
      symbol: 'WAAREE',
      description: 'BUY 35 WAAREE @ ₹2,890.00 executed on NSE exchange.',
      severity: 'info',
    },
    {
      id: 'LOG_3',
      timestamp: '10:02:44 AM',
      eventType: 'RISK_TRIGGERED',
      symbol: 'HYUNDAI',
      description: 'Position size check passed: Requested allocation (18%) within 25% max exposure limit.',
      severity: 'info',
    },
  ]);

  // Strategy Engine State
  const [strategyConfig, setStrategyConfig] = useState<StrategyConfig>({
    id: 'strat-ema',
    name: 'EMA 9/21 Momentum Crossover',
    type: 'ema_crossover',
    description: 'Fast trend breakout system with trailing 1.5% stop-loss and 4% profit target.',
    symbol: 'WAAREE',
    fastPeriod: 9,
    slowPeriod: 21,
    rsiThreshold: 30,
    stopLossPercent: 1.5,
    targetPercent: 4.0,
    capitalPerTrade: 25000,
    status: 'ACTIVE',
  });

  const [backtestResult, setBacktestResult] = useState<BacktestResult>(() => {
    const activeQuote = INITIAL_MARKET_QUOTES.find((q) => q.symbol === 'WAAREE') || INITIAL_MARKET_QUOTES[2];
    return runStrategyBacktest(
      {
        id: 'strat-ema',
        name: 'EMA 9/21 Momentum Crossover',
        type: 'ema_crossover',
        description: 'Fast trend breakout system with trailing stop-loss',
        symbol: 'WAAREE',
        fastPeriod: 9,
        slowPeriod: 21,
        rsiThreshold: 30,
        stopLossPercent: 1.5,
        targetPercent: 4.0,
        capitalPerTrade: 25000,
        status: 'ACTIVE',
      },
      activeQuote.historicalCandles
    );
  });

  const quotesRef = useRef<LiveMarketQuote[]>(quotes);
  useEffect(() => {
    quotesRef.current = quotes;
  }, [quotes]);

  const alertRulesRef = useRef<LivePriceAlertRule[]>(alertRules);
  useEffect(() => {
    alertRulesRef.current = alertRules;
  }, [alertRules]);

  const gttRulesRef = useRef<GttOcoRule[]>(gttRules);
  useEffect(() => {
    gttRulesRef.current = gttRules;
  }, [gttRules]);

  // Smooth Single-Timer Simulated Ticker Loop (respects Pause toggle & evaluates Price Alerts)
  useEffect(() => {
    if (isFeedPaused) return;

    const interval = setInterval(() => {
      const updatedQuotes = quotesRef.current.map((q) => {
        const delta = (Math.random() - 0.49) * (q.lastPrice * 0.0035);
        const newPrice = Math.max(1, Math.round((q.lastPrice + delta) * 100) / 100);
        const change = Math.round((newPrice - q.previousClose) * 100) / 100;
        const changePercent = Math.round((change / q.previousClose) * 1000) / 10;
        return {
          ...q,
          lastPrice: newPrice,
          change,
          changePercent,
          high: Math.max(q.high, newPrice),
          low: Math.min(q.low, newPrice),
          bidPrice: Math.round((newPrice - 0.25) * 100) / 100,
          askPrice: Math.round((newPrice + 0.25) * 100) / 100,
        };
      });

      setQuotes(updatedQuotes);

      // Check armed live price alert rules against updated quotes
      const activeRules = alertRulesRef.current;
      const newlyTriggered: { rule: LivePriceAlertRule; livePx: number }[] = [];
      activeRules.forEach((rule) => {
        if (!rule.isActive || rule.isTriggered) return;
        const match = updatedQuotes.find((q) => q.symbol === rule.symbol);
        if (!match) return;
        const hit =
          (rule.condition === 'ABOVE' && match.lastPrice >= rule.targetPrice) ||
          (rule.condition === 'BELOW' && match.lastPrice <= rule.targetPrice);
        if (hit) newlyTriggered.push({ rule, livePx: match.lastPrice });
      });

      if (newlyTriggered.length > 0) {
        const nowStr = new Date().toLocaleTimeString();
        const hitIds = new Set(newlyTriggered.map((x) => x.rule.id));
        setAlertRules((prev) =>
          prev.map((r) =>
            hitIds.has(r.id) ? { ...r, isTriggered: true, triggeredAt: nowStr } : r
          )
        );
        const first = newlyTriggered[0];
        showToast(
          `Alert Triggered: ${first.rule.symbol} crossed ${first.rule.condition === 'ABOVE' ? '≥' : '≤'} ₹${first.rule.targetPrice} (LTP ₹${first.livePx.toFixed(2)})`,
          'warning'
        );
        setAuditLogs((prev) => [
          ...newlyTriggered.map((x) => ({
            id: `LOG_ALERT_${Date.now()}_${x.rule.id}`,
            timestamp: nowStr,
            eventType: 'RISK_TRIGGERED' as const,
            symbol: x.rule.symbol,
            description: `Price alert triggered: ${x.rule.symbol} ${x.rule.condition} ₹${x.rule.targetPrice} @ LTP ₹${x.livePx.toFixed(2)} — ${x.rule.note}`,
            severity: 'warning' as const,
          })),
          ...prev,
        ]);
      }

      // Evaluate armed GTT OCO rules (Target or Stop-Loss leg trigger)
      const gttTriggered: { rule: GttOcoRule; legHit: 'TARGET' | 'STOP_LOSS'; livePx: number }[] = [];
      gttRulesRef.current.forEach((rule) => {
        if (!rule.isActive) return;
        const match = updatedQuotes.find((q) => q.symbol === rule.symbol);
        if (!match) return;
        if (match.lastPrice >= rule.triggerTargetPrice) {
          gttTriggered.push({ rule, legHit: 'TARGET', livePx: match.lastPrice });
        } else if (match.lastPrice <= rule.triggerStopPrice) {
          gttTriggered.push({ rule, legHit: 'STOP_LOSS', livePx: match.lastPrice });
        }
      });

      if (gttTriggered.length > 0) {
        const nowStr = new Date().toLocaleTimeString();
        const hitGttIds = new Set(gttTriggered.map((x) => x.rule.id));
        setGttRules((prev) =>
          prev.map((r) => (hitGttIds.has(r.id) ? { ...r, isActive: false } : r))
        );
        setOrders((prev) => [
          ...gttTriggered.map((x, idx) => ({
            id: `GTT_EXE_${Date.now()}_${idx}`,
            symbol: x.rule.symbol,
            side: 'SELL' as const,
            type: 'LIMIT' as const,
            product: 'CNC' as const,
            quantity: x.rule.quantity,
            price: x.livePx,
            status: 'EXECUTED' as const,
            timestamp: nowStr,
            executionPrice: x.livePx,
            brokerage: 0,
            stt: Math.round(x.rule.quantity * x.livePx * 0.001 * 100) / 100,
            gst: 0,
            totalCharges: Math.round(x.rule.quantity * x.livePx * 0.001 * 100) / 100,
          })),
          ...prev,
        ]);
        const firstGtt = gttTriggered[0];
        showToast(
          `GTT OCO Triggered (${firstGtt.legHit}): ${firstGtt.rule.symbol} ${firstGtt.rule.quantity} sh @ ₹${firstGtt.livePx.toFixed(2)}.`,
          firstGtt.legHit === 'TARGET' ? 'success' : 'warning'
        );
        setAuditLogs((prev) => [
          ...gttTriggered.map((x) => ({
            id: `LOG_GTT_${Date.now()}_${x.rule.id}`,
            timestamp: nowStr,
            eventType: 'ORDER_EXECUTED' as const,
            symbol: x.rule.symbol,
            description: `GTT OCO ${x.legHit} leg triggered for ${x.rule.symbol} (${x.rule.quantity} sh @ ₹${x.livePx.toFixed(2)}). Other OCO leg cancelled.`,
            severity: (x.legHit === 'TARGET' ? 'success' : 'warning') as 'success' | 'warning',
          })),
          ...prev,
        ]);
      }

      // Update positions mark-to-market synchronously with fresh quotes
      setPositions((prevPos) =>
        prevPos.map((pos) => {
          const match = updatedQuotes.find((q) => q.symbol === pos.symbol);
          if (!match) return pos;
          const currentPrice = match.lastPrice;
          const pnl = Math.round((currentPrice - pos.buyAvgPrice) * pos.quantity * 100) / 100;
          const pnlPercent =
            Math.round(((currentPrice - pos.buyAvgPrice) / pos.buyAvgPrice) * 1000) / 10;
          return {
            ...pos,
            currentPrice,
            pnl,
            pnlPercent,
            unrealizedPnl: pnl,
          };
        })
      );
    }, 2000);

    return () => clearInterval(interval);
  }, [isFeedPaused]);

  const selectedQuote = quotes.find((q) => q.symbol === selectedQuoteSymbol) || quotes[0];

  // Sync default order prices ONLY when the selected symbol changes (never overwrite mid-edit ticks)
  useEffect(() => {
    const match = quotesRef.current.find((q) => q.symbol === selectedQuoteSymbol);
    if (match) {
      setOrderPrice(match.lastPrice);
      setOrderStopLoss(Math.round(match.lastPrice * 0.98 * 100) / 100);
      setOrderTarget(Math.round(match.lastPrice * 1.05 * 100) / 100);
    }
  }, [selectedQuoteSymbol]);

  // Order Placement Confirmation Trigger
  const handleInitiateOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (riskSettings.isKillSwitchEngaged || riskSettings.isTradingHaltedForDay) {
      showToast('Trading is currently halted by the Risk Circuit Breaker / Kill Switch.', 'danger');
      return;
    }

    setOrderToConfirm({
      symbol: selectedQuoteSymbol,
      side: orderSide,
      type: orderType,
      product: orderProduct,
      quantity: orderQuantity,
      price: orderType === 'MARKET' ? selectedQuote.lastPrice : orderPrice,
      stopLossPrice: orderStopLoss,
      targetPrice: orderTarget,
      currentPrice: selectedQuote.lastPrice,
    });
    setIsConfirmOrderModalOpen(true);
  };

  const handleOrderConfirmed = (executedOrder: TradingOrder) => {
    setOrders((prev) => [executedOrder, ...prev]);

    // Update positions
    setPositions((prev) => {
      const existing = prev.find((p) => p.symbol === executedOrder.symbol);
      if (existing) {
        return prev.map((p) =>
          p.symbol === executedOrder.symbol
            ? {
                ...p,
                quantity: p.quantity + executedOrder.quantity,
                buyAvgPrice: Math.round(((p.buyAvgPrice * p.quantity + executedOrder.price * executedOrder.quantity) / (p.quantity + executedOrder.quantity)) * 100) / 100,
              }
            : p
        );
      } else {
        return [
          {
            symbol: executedOrder.symbol,
            side: executedOrder.side,
            quantity: executedOrder.quantity,
            buyAvgPrice: executedOrder.price,
            currentPrice: executedOrder.price,
            pnl: 0,
            pnlPercent: 0,
            product: executedOrder.product,
            stopLossPrice: orderStopLoss,
            targetPrice: orderTarget,
            unrealizedPnl: 0,
          },
          ...prev,
        ];
      }
    });

    // Add to Audit Log
    setAuditLogs((prev) => [
      {
        id: `LOG_${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        eventType: 'ORDER_EXECUTED',
        symbol: executedOrder.symbol,
        description: `${executedOrder.side} ${executedOrder.quantity} ${executedOrder.symbol} @ ₹${executedOrder.price.toFixed(2)} executed. Total charges: ₹${executedOrder.totalCharges.toFixed(2)}.`,
        severity: 'success',
      },
      ...prev,
    ]);
    showToast(
      `Executed ${executedOrder.side} ${executedOrder.quantity} ${executedOrder.symbol} @ ₹${executedOrder.price.toFixed(2)}.`,
      'success'
    );
  };

  // Emergency Kill Switch (non-blocking modal trigger + execution)
  const handleTriggerKillSwitch = () => {
    setIsKillSwitchConfirmOpen(true);
  };

  const executeKillSwitchSquareOff = () => {
    setIsKillSwitchConfirmOpen(false);
    setPositions([]);
    setRiskSettings((prev) => ({
      ...prev,
      isKillSwitchEngaged: true,
      isTradingHaltedForDay: true,
    }));

    setAuditLogs((prev) => [
      {
        id: `LOG_${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        eventType: 'KILL_SWITCH',
        description: 'EMERGENCY KILL SWITCH ENGAGED: All open positions squared off at market price. Trading halted.',
        severity: 'danger',
      },
      ...prev,
    ]);
    showToast('Kill Switch Engaged: All open positions squared off and trading locked.', 'danger');
  };

  const handleResetKillSwitch = () => {
    setRiskSettings((prev) => ({
      ...prev,
      isKillSwitchEngaged: false,
      isTradingHaltedForDay: false,
    }));
    showToast('Trading Circuit Breaker reset. Orders unlocked.', 'success');
  };

  // Re-run backtest when strategy settings change
  const handleRunBacktest = () => {
    const quote = quotes.find((q) => q.symbol === strategyConfig.symbol) || quotes[0];
    const res = runStrategyBacktest(strategyConfig, quote.historicalCandles);
    setBacktestResult(res);
  };

  // Calculations for summary metrics
  const totalUnrealizedPnl = positions.reduce((acc, p) => acc + p.pnl, 0);
  const totalInvestedHoldings = holdings.reduce((acc, h) => acc + h.investedValue, 0);
  const totalCurrentHoldings = holdings.reduce((acc, h) => acc + h.currentValue, 0);
  const totalHoldingsPnl = totalCurrentHoldings - totalInvestedHoldings;
  const totalHoldingsPnlPercent = Math.round((totalHoldingsPnl / totalInvestedHoldings) * 1000) / 10;

  const filteredIpos = ipos.filter((i) => {
    if (ipoFilter === 'all') return true;
    return i.status === ipoFilter;
  });

  const tradingModules: (SpotlightModuleItem & {
    category: 'PORTFOLIO_TAX' | 'TRADING_ORDERS' | 'RISK_SIZING' | 'STRATEGY_QUANT' | 'COMMUNITY_LEAGUE';
    nextTargets?: { id: TradingTabId; label: string }[];
  })[] = [
    { id: 'portfolio_health', label: '1. Portfolio Health', shortLabel: 'Portfolio Health', badge: 'Taxes & HHI', category: 'PORTFOLIO_TAX', categoryLabel: 'Portfolio & Taxes', keywords: 'allocation sector cap concentration stcg ltcg diversification', nextTargets: [{ id: 'rebalance', label: 'Fix Drift in Rebalance Engine' }, { id: 'capital_gains_tax', label: 'Estimate ITR Advance Tax' }, { id: 'debt_sgb_ladder', label: 'Check Equity : Debt : Gold Mix' }] },
    { id: 'rebalance', label: '2. Rebalance Engine', shortLabel: 'Rebalance', badge: 'Zero-Tax SIP', category: 'PORTFOLIO_TAX', categoryLabel: 'Portfolio & Taxes', keywords: 'drift target weight sip cash inflow tax-smart', nextTargets: [{ id: 'debt_sgb_ladder', label: 'Compare Debt / SGB Yields' }, { id: 'tax_harvest', label: 'Check Tax Harvesting Lots' }] },
    { id: 'tax_harvest', label: '3. Tax-Loss Harvesting', shortLabel: 'Tax Harvest', badge: 'FY Offset', category: 'PORTFOLIO_TAX', categoryLabel: 'Portfolio & Taxes', keywords: 'stcg ltcg march 31 unrealized loss offset ca', nextTargets: [{ id: 'capital_gains_tax', label: 'Update ITR & 234C Liability' }, { id: 'terminal', label: 'Execute Harvest in Terminal' }] },
    { id: 'capital_gains_tax', label: '4. ITR & Advance Tax', shortLabel: 'ITR & 234C Tax', badge: 'ITR-2 / 3', category: 'PORTFOLIO_TAX', categoryLabel: 'Portfolio & Taxes', keywords: 'itr capital gains stcg 20 ltcg 12.5 112a 234c advance tax 44ab audit', nextTargets: [{ id: 'tax_harvest', label: 'Reduce Tax via Harvesting' }, { id: 'contract_note_audit', label: 'Audit Broker F&O Turnover' }] },
    { id: 'corporate_actions', label: '5. Corporate Actions', shortLabel: 'Corp Actions', badge: 'Cost Basis', category: 'PORTFOLIO_TAX', categoryLabel: 'Portfolio & Taxes', keywords: 'dividend split bonus rights buyback ex-date record-date', nextTargets: [{ id: 'dividend_calendar', label: 'View Dividend Calendar' }, { id: 'portfolio_health', label: 'Inspect Updated Holdings' }] },
    { id: 'dividend_calendar', label: '6. Dividend Calendar', shortLabel: 'Dividends', badge: 'Yield & TDS', category: 'PORTFOLIO_TAX', categoryLabel: 'Portfolio & Taxes', keywords: 'dividend passive income yield on cost drip section 194 tds ex-date', nextTargets: [{ id: 'capital_gains_tax', label: 'Factor Into Slab Tax Liability' }, { id: 'fire_planner', label: 'Factor Into FIRE Goals' }] },
    { id: 'mf_overlap', label: '7. MF Overlap & XIRR', shortLabel: 'MF Overlap', badge: 'TER & XIRR', category: 'PORTFOLIO_TAX', categoryLabel: 'Portfolio & Taxes', keywords: 'mutual fund direct regular ter expense ratio xirr sip overlap', nextTargets: [{ id: 'rebalance', label: 'Rebalance Asset Mix' }, { id: 'debt_sgb_ladder', label: 'Optimize Arbitrage Debt Parking' }] },
    { id: 'debt_sgb_ladder', label: '8. Gold, SGB & Debt Ladder', shortLabel: 'SGB & Debt', badge: 'Post-Tax Yield', category: 'PORTFOLIO_TAX', categoryLabel: 'Portfolio & Taxes', keywords: 'sgb gold sovereign bond tbill fd arbitrage post tax yield allocation', nextTargets: [{ id: 'rebalance', label: 'Rebalance Equity & Debt Mix' }, { id: 'fire_planner', label: 'Simulate Long-Term Corpus' }] },
    { id: 'fire_planner', label: '9. FIRE & Goals', shortLabel: 'FIRE & Goals', badge: 'Monte Carlo', category: 'PORTFOLIO_TAX', categoryLabel: 'Portfolio & Taxes', keywords: 'retirement swp inflation goal milestone corpus sip', nextTargets: [{ id: 'rebalance', label: 'Align Asset Allocation' }, { id: 'benchmarks', label: 'Compare Nifty 50/500 Alpha' }] },
    { id: 'ipos', label: '10. IPO Tracker & GMP', shortLabel: 'IPO & GMP', badge: `${ipos.length} Issues`, category: 'TRADING_ORDERS', categoryLabel: 'Trading & Desk', keywords: 'ipo subscription qib nii retail grey market allotment', nextTargets: [{ id: 'terminal', label: 'Trade Listed Issues' }, { id: 'screener', label: 'Screen Fundamentals' }] },
    { id: 'terminal', label: '11. Live Terminal', shortLabel: 'Live Terminal', badge: 'Order Desk', category: 'TRADING_ORDERS', categoryLabel: 'Trading & Desk', keywords: 'buy sell market limit mis cnc order book ltp stoploss', nextTargets: [{ id: 'chart_desk', label: 'Inspect Chart & EMA/RSI' }, { id: 'position_sizing', label: 'Calculate Safe Qty First' }, { id: 'contract_note_audit', label: 'Audit Contract Note Fees' }] },
    { id: 'chart_desk', label: '12. Technical Chart Desk', shortLabel: 'Chart Desk', badge: 'EMA & RSI', category: 'TRADING_ORDERS', categoryLabel: 'Trading & Desk', keywords: 'technical chart ema 9 21 vwap bollinger rsi support resistance pattern', nextTargets: [{ id: 'terminal', label: 'Place Order from Chart' }, { id: 'live_alerts', label: 'Set Breakout Alert' }] },
    { id: 'basket_gtt', label: '13. Stock Baskets & GTT', shortLabel: 'Baskets & GTT', badge: 'Smallcase / OCO', category: 'TRADING_ORDERS', categoryLabel: 'Trading & Desk', keywords: 'basket smallcase portfolio sip batch order gtt oco target stoploss', nextTargets: [{ id: 'terminal', label: 'Inspect Executed Basket Orders' }, { id: 'rebalance', label: 'Review Portfolio Weights' }] },
    { id: 'oi_option_chain', label: '14. NSE Option Chain & OI', shortLabel: 'Option Chain OI', badge: 'PCR & Max Pain', category: 'TRADING_ORDERS', categoryLabel: 'Trading & Desk', keywords: 'option chain open interest oi pcr max pain call put nifty banknifty', nextTargets: [{ id: 'options_lab', label: 'Analyze Strategy in Payoff Lab' }, { id: 'fii_dii', label: 'Check FII Index Positioning' }] },
    { id: 'options_lab', label: '15. Options & Greeks', shortLabel: 'Options & Greeks', badge: 'Payoff Lab', category: 'TRADING_ORDERS', categoryLabel: 'Trading & Desk', keywords: 'black scholes delta gamma theta vega straddle iron condor call put nifty', nextTargets: [{ id: 'oi_option_chain', label: 'Pick Strikes from Option Chain' }, { id: 'pledge_margin', label: 'Check Pledged F&O Margin' }] },
    { id: 'contract_note_audit', label: '16. Fee & STT Auditor', shortLabel: 'Fee Auditor', badge: 'Breakeven', category: 'TRADING_ORDERS', categoryLabel: 'Trading & Desk', keywords: 'brokerage stt sebi gst dp charge contract note breakeven overtrading', nextTargets: [{ id: 'terminal', label: 'Return to Live Terminal' }, { id: 'capital_gains_tax', label: 'Review Annual Tax Burden' }] },
    { id: 'screener', label: '17. Screener', shortLabel: 'Screener', badge: 'Fundamentals', category: 'TRADING_ORDERS', categoryLabel: 'Trading & Desk', keywords: 'pe ratio debt equity revenue growth promoter holding compare', nextTargets: [{ id: 'insider_radar', label: 'Verify Promoter & Bulk Deals' }, { id: 'chart_desk', label: 'Check Technical Entry Chart' }] },
    { id: 'news', label: '18. News & Filings', shortLabel: 'News & Filings', badge: 'LODR & RBI', category: 'TRADING_ORDERS', categoryLabel: 'Trading & Desk', keywords: 'nse bse exchange announcement earnings calendar rbi mpc', nextTargets: [{ id: 'insider_radar', label: 'Inspect Bulk/SAST Deals' }, { id: 'terminal', label: 'Open Live Terminal' }] },
    { id: 'insider_radar', label: '19. Insider & Pledge Radar', shortLabel: 'Insider & Pledge', badge: 'Governance', category: 'RISK_SIZING', categoryLabel: 'Risk & Sizing', keywords: 'promoter pledge shareholding sast bulk deal block deal fii dii', nextTargets: [{ id: 'terminal', label: 'Trim Risky Pledge Stock' }, { id: 'screener', label: 'Check Valuation Ratios' }] },
    { id: 'live_alerts', label: '20. Live Alerts & Prep', shortLabel: 'Live Alerts', badge: `${alertRules.filter((r) => r.isActive && !r.isTriggered).length} Armed`, category: 'RISK_SIZING', categoryLabel: 'Risk & Sizing', keywords: 'price alert trigger morning checklist readiness discipline vix', nextTargets: [{ id: 'terminal', label: 'Execute Triggered Trade' }, { id: 'chart_desk', label: 'Inspect Price Chart' }] },
    { id: 'pledge_margin', label: '21. Collateral Pledge', shortLabel: 'Pledge & Margin', badge: '50:50 Rule', category: 'RISK_SIZING', categoryLabel: 'Risk & Sizing', keywords: 'demat pledge haircut liquidbees cash collateral 50 50 f&o margin t-bill', nextTargets: [{ id: 'options_lab', label: 'Deploy Margin in Options Lab' }, { id: 'drawdown_report', label: 'Check Leverage Drawdown Risk' }] },
    { id: 'position_sizing', label: '22. Position Sizing', shortLabel: 'Position Sizing', badge: 'Calculator', category: 'RISK_SIZING', categoryLabel: 'Risk & Sizing', keywords: 'risk percent stoploss brokerage stt quantity capital', nextTargets: [{ id: 'terminal', label: 'Send to Order Desk' }, { id: 'drawdown_report', label: 'Review Portfolio VaR' }] },
    { id: 'drawdown_report', label: '23. Drawdown & VaR', shortLabel: 'Drawdown & VaR', badge: 'Stress Test', category: 'RISK_SIZING', categoryLabel: 'Risk & Sizing', keywords: 'max drawdown recovery var beta nifty crash 10 20 30', nextTargets: [{ id: 'risk', label: 'Tighten Circuit Breakers' }, { id: 'rebalance', label: 'De-risk Concentrated Names' }] },
    { id: 'guardrails', label: '24. Guardrails', shortLabel: 'Guardrails', badge: 'Cooldown', category: 'RISK_SIZING', categoryLabel: 'Risk & Sizing', keywords: 'cooling off waiting period max trades streak do not trade', nextTargets: [{ id: 'journal', label: 'Log Behavioral Patterns' }, { id: 'risk', label: 'Adjust Daily Loss Limit' }] },
    { id: 'risk', label: '25. Risk Controls', shortLabel: 'Risk Controls', badge: 'Safeguards', category: 'RISK_SIZING', categoryLabel: 'Risk & Sizing', keywords: 'circuit breaker kill switch exposure cap daily loss limit', nextTargets: [{ id: 'audit', label: 'Verify Risk Audit Log' }, { id: 'terminal', label: 'Return to Order Desk' }] },
    { id: 'strategy_versions', label: '26. Strategy Audit', shortLabel: 'Strategy Audit', badge: 'Versioned', category: 'STRATEGY_QUANT', categoryLabel: 'Strategy & Quant', keywords: 'v1 v2 changelog immutable audit lock advisor', nextTargets: [{ id: 'strategies', label: 'Run Historical Backtest' }, { id: 'benchmarks', label: 'Compare vs Nifty 50' }] },
    { id: 'strategies', label: '27. Strategy Backtest', shortLabel: 'Backtest', badge: 'Backtest', category: 'STRATEGY_QUANT', categoryLabel: 'Strategy & Quant', keywords: 'ema rsi vwap equity curve slippage charges signals', nextTargets: [{ id: 'strategy_versions', label: 'Commit New Version' }, { id: 'position_sizing', label: 'Size Live Capital' }] },
    { id: 'fii_dii', label: '28. FII / DII Flows', shortLabel: 'FII / DII Flows', badge: 'Institutional', category: 'STRATEGY_QUANT', categoryLabel: 'Strategy & Quant', keywords: 'fii dii institutional cash flow nifty pcr index futures long short', nextTargets: [{ id: 'oi_option_chain', label: 'Inspect Option Chain OI' }, { id: 'sector_rotation', label: 'Inspect Sector Rotation' }] },
    { id: 'sector_rotation', label: '29. Sector Rotation', shortLabel: 'Sector Rotation', badge: 'Breadth & VIX', category: 'STRATEGY_QUANT', categoryLabel: 'Strategy & Quant', keywords: 'advance decline 50 dma 200 dma india vix sector index', nextTargets: [{ id: 'fii_dii', label: 'Check Institutional Flows' }, { id: 'screener', label: 'Screen Leading Sectors' }] },
    { id: 'benchmarks', label: '30. Benchmark Audit', shortLabel: 'Benchmarks', badge: 'Nifty 50/500', category: 'STRATEGY_QUANT', categoryLabel: 'Strategy & Quant', keywords: 'sharpe sortino alpha beta nifty 50 nifty 500 risk adjusted', nextTargets: [{ id: 'portfolio_health', label: 'Inspect Portfolio Drivers' }, { id: 'fire_planner', label: 'Project Long-Term Corpus' }] },
    { id: 'journal', label: '31. Trade Journal', shortLabel: 'Trade Journal', badge: 'Behavioral', category: 'COMMUNITY_LEAGUE', categoryLabel: 'Community & League', keywords: 'emotional fomo panic exit csv ca monthly review', nextTargets: [{ id: 'guardrails', label: 'Set Rules From Lessons' }, { id: 'audit', label: 'View Execution Ledger' }] },
    { id: 'community', label: '32. Community Desk', shortLabel: 'Community', badge: 'Verified', category: 'COMMUNITY_LEAGUE', categoryLabel: 'Community & League', keywords: 'discussion verified trade moderation anti pump dump', nextTargets: [{ id: 'screener', label: 'Verify Fundamentals Yourself' }, { id: 'leaderboard', label: 'Inspect Paper Rankings' }] },
    { id: 'leaderboard', label: '33. Paper League', shortLabel: 'Paper League', badge: 'Sharpe Rank', category: 'COMMUNITY_LEAGUE', categoryLabel: 'Community & League', keywords: 'simulated opt-in sharpe drawdown reset', nextTargets: [{ id: 'strategies', label: 'Tune Strategy Rules' }, { id: 'terminal', label: 'Place Paper Trade' }] },
    { id: 'audit', label: '34. Audit Ledger', shortLabel: 'Audit Ledger', badge: 'SEBI Log', category: 'COMMUNITY_LEAGUE', categoryLabel: 'Community & League', keywords: 'sebi log immutable timestamp risk event', nextTargets: [{ id: 'risk', label: 'Review Circuit Breakers' }, { id: 'portfolio_health', label: 'Back to Overview' }] },
  ];

  const activeModuleIndex = Math.max(0, tradingModules.findIndex((m) => m.id === activeTab));
  const activeModuleMeta = tradingModules[activeModuleIndex] || tradingModules[0];
  const prevModuleMeta = tradingModules[(activeModuleIndex - 1 + tradingModules.length) % tradingModules.length];
  const nextModuleMeta = tradingModules[(activeModuleIndex + 1) % tradingModules.length];
  prevModuleIdRef.current = prevModuleMeta.id as TradingTabId;
  nextModuleIdRef.current = nextModuleMeta.id as TradingTabId;
  const dailyLossUsedPercent = Math.min(
    100,
    Math.max(0, riskSettings.dailyRealizedPnl < 0 ? Math.round((Math.abs(riskSettings.dailyRealizedPnl) / riskSettings.dailyLossLimit) * 100) : 0)
  );

  return (
    <div className="space-y-6">
      {/* Scenario Brief Header Callout */}
      <div className="p-4 sm:p-5 rounded-xl bg-white border border-slate-200/90 shadow-2xs flex flex-col 2xl:flex-row items-start 2xl:items-center justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider bg-slate-900 text-white rounded whitespace-nowrap">
              DECISION LAB #5
            </span>
            <span className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200 rounded whitespace-nowrap">
              LIVE TRADING &amp; IPO ALLOCATION DESK
            </span>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-mono ml-1 whitespace-nowrap">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              <span>Broker: {brokerAccount.broker.toUpperCase()} ({brokerAccount.isPaperTrading ? 'Paper Sim' : 'Live'})</span>
            </div>
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-950 tracking-tight">
            IPO Allocation &amp; Algorithmic Trading Centre
          </h2>
          <p className="text-xs text-slate-500 max-w-2xl mt-0.5 leading-relaxed">
            Real-time Indian market IPO book-building tracking, Grey Market Premiums (GMP), broker OAuth integration,
            rule-based backtesting, and automated risk circuit breakers.
          </p>
        </div>

        {/* Global Trading Header Actions */}
        <div className="flex items-center gap-2 flex-wrap 2xl:justify-end">
          <button
            type="button"
            onClick={() => setIsEducationModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg transition-colors shadow-2xs whitespace-nowrap shrink-0"
            title="Open Crisis Simulator, Glossary & SEBI Risk Certification Exam"
          >
            <GraduationCap className="w-3.5 h-3.5 text-purple-600 shrink-0" />
            <span>{isRiskCertified ? '✓ Risk Certified' : 'Education & Quiz'}</span>
          </button>

          <button
            type="button"
            onClick={() => setIsGuideModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors shadow-2xs whitespace-nowrap shrink-0"
            title="Open comprehensive IPO & Live Trading Guide"
          >
            <BookOpen className="w-3.5 h-3.5 text-orange-600 shrink-0" />
            <span>Trading Guide</span>
          </button>

          <button
            type="button"
            onClick={() => setIsAllotmentModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50/80 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition-colors shadow-2xs whitespace-nowrap shrink-0"
            title="Check IPO allotment status by PAN or Application number"
          >
            <Search className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
            <span>Check Allotment</span>
          </button>

          <button
            type="button"
            onClick={() => setIsExecutiveBriefOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg transition-colors shadow-2xs whitespace-nowrap shrink-0"
            title="View & export downloadable Portfolio, Risk & Tax Executive Brief"
          >
            <FileText className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
            <span>Executive Brief</span>
          </button>

          <button
            type="button"
            onClick={() => setIsBrokerModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg transition-colors shadow-2xs whitespace-nowrap shrink-0"
            title="Connect Zerodha Kite, Upstox, or Paper Trading API"
          >
            <Lock className="w-3.5 h-3.5 text-slate-600 shrink-0" />
            <span>Connect Broker API</span>
          </button>

          {/* Emergency Kill Switch */}
          {riskSettings.isKillSwitchEngaged ? (
            <button
              type="button"
              onClick={handleResetKillSwitch}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 rounded-lg shadow-2xs whitespace-nowrap shrink-0"
            >
              <RotateCcw className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
              <span>Resume Trading</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleTriggerKillSwitch}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-2xs transition-colors whitespace-nowrap shrink-0"
              title="Immediately square off all positions and cancel orders"
            >
              <Zap className="w-3.5 h-3.5 shrink-0" />
              <span>KILL SWITCH</span>
            </button>
          )}
        </div>
      </div>

      {/* Kill Switch Alert Banner if Active */}
      {riskSettings.isKillSwitchEngaged && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-rose-950 animate-in fade-in">
          <div className="flex items-center gap-2.5 min-w-0">
            <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0" />
            <div>
              <strong className="block font-bold">EMERGENCY KILL SWITCH ENGAGED: ALL POSITIONS SQUARED OFF</strong>
              <span className="text-[11px] text-rose-800">
                Trading is locked to protect capital. Click "Resume Trading" above to reset safeguards.
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={handleResetKillSwitch}
            className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-lg transition-colors whitespace-nowrap shrink-0"
          >
            Reset Circuit Breaker
          </button>
        </div>
      )}

      {/* Live Portfolio Pulse HUD + Interactive NSE Ticker Strip */}
      <div className="rounded-xl bg-slate-950 text-slate-100 border border-slate-800 shadow-sm overflow-hidden">
        {/* Top Pulse Row */}
        <div className="px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/90 text-xs">
          <div className="flex items-center flex-wrap gap-4 sm:gap-6">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">Holdings Value</span>
              <span className="font-mono font-bold text-white tabular-nums">
                ₹{totalCurrentHoldings.toLocaleString('en-IN')}
              </span>
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">Holdings P&amp;L</span>
              <span className={`font-mono font-bold tabular-nums ${totalHoldingsPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {totalHoldingsPnl >= 0 ? '+' : ''}₹{totalHoldingsPnl.toLocaleString('en-IN')} ({totalHoldingsPnlPercent >= 0 ? '+' : ''}{totalHoldingsPnlPercent}%)
              </span>
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">Open MTM ({positions.length})</span>
              <span className={`font-mono font-bold tabular-nums ${totalUnrealizedPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {totalUnrealizedPnl >= 0 ? '+' : ''}₹{totalUnrealizedPnl.toLocaleString('en-IN')}
              </span>
            </div>
            <div className="hidden md:block">
              <div className="flex items-center justify-between gap-2 text-[10px] font-mono text-slate-400 mb-0.5">
                <span>Daily Loss Guard</span>
                <span className="text-slate-200">{dailyLossUsedPercent}% of ₹{riskSettings.dailyLossLimit.toLocaleString('en-IN')}</span>
              </div>
              <div className="w-32 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    dailyLossUsedPercent > 75 ? 'bg-rose-500' : dailyLossUsedPercent > 40 ? 'bg-amber-400' : 'bg-emerald-400'
                  }`}
                  style={{ width: `${Math.max(4, dailyLossUsedPercent)}%` }}
                />
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setIsSpotlightOpen(true)}
              className="inline-flex items-center gap-2 px-3 py-1.5 text-[11px] font-semibold bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 rounded-lg transition-colors"
              title={`Instant search across all ${tradingModules.length} modules and live NSE stocks (Press 'J')`}
            >
              <Search className="w-3.5 h-3.5 text-indigo-400" />
              <span>Spotlight Jump</span>
              <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-slate-900 text-slate-300 border border-slate-700 rounded">J</kbd>
            </button>

            <button
              type="button"
              onClick={() => setIsShortcutsModalOpen(true)}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg transition-colors"
              title="Keyboard shortcuts cheatsheet (Press '?')"
            >
              <Keyboard className="w-3.5 h-3.5 text-slate-300" />
              <kbd className="text-[10px] font-mono text-slate-300">?</kbd>
            </button>

            <button
              type="button"
              onClick={() => setIsFeedPaused((p) => !p)}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-mono font-semibold rounded-lg border transition-colors ${
                isFeedPaused
                  ? 'bg-amber-950/60 text-amber-300 border-amber-700/70 hover:bg-amber-900/60'
                  : 'bg-emerald-950/60 text-emerald-300 border-emerald-700/70 hover:bg-emerald-900/60'
              }`}
              title="Pause or resume simulated 2-second price ticks (Press 'F')"
            >
              {isFeedPaused ? (
                <>
                  <Play className="w-3 h-3" />
                  <span>Paused</span>
                </>
              ) : (
                <>
                  <Pause className="w-3 h-3" />
                  <span>Live 2s</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Interactive Click-to-Trade NSE Quote Ticker Ribbon */}
        <div className="px-3 py-1.5 bg-slate-900/80 flex items-center gap-2 overflow-x-auto no-scrollbar">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 shrink-0 px-1">
            NSE Desk:
          </span>
          {quotes.map((q) => {
            const isUp = q.changePercent >= 0;
            const isActiveStock = activeTab === 'terminal' && selectedQuoteSymbol === q.symbol;
            return (
              <button
                key={q.symbol}
                type="button"
                onClick={() => handleTradeSymbolFromOtherTab(q.symbol)}
                className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-md font-mono text-[11px] transition-colors shrink-0 border ${
                  isActiveStock
                    ? 'bg-indigo-600/30 border-indigo-400 text-white'
                    : 'bg-slate-800/70 hover:bg-slate-800 border-slate-700/70 text-slate-200'
                }`}
                title={`Click to load ${q.symbol} in Live Terminal`}
              >
                <span className="font-bold">{q.symbol}</span>
                <span className="tabular-nums text-slate-300">₹{q.lastPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                <span className={`font-bold tabular-nums ${isUp ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {isUp ? '+' : ''}{q.changePercent}%
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Trader Workspace Mode Presets */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs">
        <div className="flex items-center flex-wrap gap-1.5">
          <span className="text-[11px] font-semibold text-slate-500 mr-1 whitespace-nowrap shrink-0">Workspace Focus:</span>
          {[
            { id: 'ALL', label: 'All 34 Tools' },
            { id: 'INVESTOR', label: 'Long-Term Investor' },
            { id: 'FNO_SCALPER', label: 'F&O Scalper' },
            { id: 'TAX_AUDIT', label: 'Tax & Audit' },
          ].map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => applyTraderModePreset(preset.id as any)}
              className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 ${
                traderMode === preset.id
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>
        <span className="text-[11px] text-slate-500 font-mono leading-relaxed sm:whitespace-nowrap">
          Tip: Press J (Search), ? (Shortcuts), F (Pause Feed), Alt+1..6 (Pins)
        </span>
      </div>

      {/* Category Filter, Pinned Quick Access & Module Bar */}
      <div className="space-y-2 border-b border-slate-200 pb-2.5">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-2.5">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar min-w-0">
            {[
              { id: 'ALL', label: 'All Modules (34)' },
              { id: 'PORTFOLIO_TAX', label: 'Portfolio & Taxes (9)' },
              { id: 'TRADING_ORDERS', label: 'Trading & Desk (9)' },
              { id: 'RISK_SIZING', label: 'Risk & Margin (7)' },
              { id: 'STRATEGY_QUANT', label: 'Strategy & Quant (5)' },
              { id: 'COMMUNITY_LEAGUE', label: 'Community & League (4)' },
            ].map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveTabCategory(cat.id as any)}
                className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                  activeTabCategory === cat.id
                    ? 'bg-indigo-600 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-1.5 w-full xl:w-auto shrink-0">
            {/* Quick Prev / Next Module Stepper */}
            <button
              type="button"
              onClick={() => setActiveTab(prevModuleMeta.id as TradingTabId)}
              className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 transition-colors shrink-0"
              title={`Previous: ${prevModuleMeta.label}`}
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>

            <select
              aria-label="Quick jump to module"
              value={activeTab}
              onChange={(e) => {
                setActiveTab(e.target.value as TradingTabId);
                setActiveTabCategory('ALL');
              }}
              className="flex-1 sm:flex-initial min-w-0 px-2.5 py-1 text-[11px] font-semibold bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-indigo-600 max-w-full sm:max-w-[230px]"
            >
              <optgroup label="Portfolio & Taxes (9)">
                <option value="portfolio_health">1. Portfolio Health</option>
                <option value="rebalance">2. Rebalance Engine</option>
                <option value="tax_harvest">3. Tax-Loss Harvesting</option>
                <option value="capital_gains_tax">4. ITR &amp; Advance Tax</option>
                <option value="corporate_actions">5. Corporate Actions</option>
                <option value="dividend_calendar">6. Dividend Calendar</option>
                <option value="mf_overlap">7. MF Overlap &amp; XIRR</option>
                <option value="debt_sgb_ladder">8. Gold, SGB &amp; Debt Ladder</option>
                <option value="fire_planner">9. FIRE &amp; Goals</option>
              </optgroup>
              <optgroup label="Trading & Desk (9)">
                <option value="ipos">10. IPO Tracker &amp; GMP</option>
                <option value="terminal">11. Live Terminal</option>
                <option value="chart_desk">12. Technical Chart Desk</option>
                <option value="basket_gtt">13. Stock Baskets &amp; GTT</option>
                <option value="oi_option_chain">14. NSE Option Chain &amp; OI</option>
                <option value="options_lab">15. Options &amp; Greeks</option>
                <option value="contract_note_audit">16. Fee &amp; STT Auditor</option>
                <option value="screener">17. Fundamental Screener</option>
                <option value="news">18. News &amp; Filings</option>
              </optgroup>
              <optgroup label="Risk & Margin (7)">
                <option value="insider_radar">19. Insider &amp; Pledge Radar</option>
                <option value="live_alerts">20. Live Alerts &amp; Prep</option>
                <option value="pledge_margin">21. Collateral Pledge</option>
                <option value="position_sizing">22. Position Sizing</option>
                <option value="drawdown_report">23. Drawdown &amp; VaR</option>
                <option value="guardrails">24. Behavioral Guardrails</option>
                <option value="risk">25. Risk Controls</option>
              </optgroup>
              <optgroup label="Strategy & Quant (5)">
                <option value="strategy_versions">26. Strategy Audit</option>
                <option value="strategies">27. Strategy Backtest</option>
                <option value="fii_dii">28. FII / DII Flows</option>
                <option value="sector_rotation">29. Sector Rotation</option>
                <option value="benchmarks">30. Benchmark Audit</option>
              </optgroup>
              <optgroup label="Community & League (4)">
                <option value="journal">31. Trade Journal</option>
                <option value="community">32. Community Desk</option>
                <option value="leaderboard">33. Paper League</option>
                <option value="audit">34. Audit Ledger</option>
              </optgroup>
            </select>

            <button
              type="button"
              onClick={() => setActiveTab(nextModuleMeta.id as TradingTabId)}
              className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 transition-colors shrink-0"
              title={`Next: ${nextModuleMeta.label}`}
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={() => togglePinTab(activeTab)}
              className={`inline-flex items-center gap-1 px-2 py-1 text-[11px] font-semibold rounded-lg border transition-colors whitespace-nowrap shrink-0 ${
                pinnedTabIds.includes(activeTab)
                  ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                  : 'bg-white text-slate-500 border-slate-200 hover:text-amber-700 hover:border-amber-200'
              }`}
              title={pinnedTabIds.includes(activeTab) ? 'Unpin active module' : 'Pin active module to favorites'}
            >
              <Star className={`w-3.5 h-3.5 shrink-0 ${pinnedTabIds.includes(activeTab) ? 'fill-amber-400 text-amber-500' : ''}`} />
              <span className="hidden sm:inline">{pinnedTabIds.includes(activeTab) ? 'Pinned' : 'Pin'}</span>
            </button>
          </div>
        </div>

        {/* Pinned Favorites Strip */}
        {pinnedTabIds.length > 0 && (
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-700 flex items-center gap-1 shrink-0 pr-1">
              <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
              Pinned:
            </span>
            {tradingModules
              .filter((m) => pinnedTabIds.includes(m.id))
              .map((m) => {
                const isActive = activeTab === m.id;
                return (
                  <button
                    key={`pin-${m.id}`}
                    type="button"
                    onClick={() => setActiveTab(m.id as TradingTabId)}
                    className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 border ${
                      isActive
                        ? 'bg-amber-600 text-white border-amber-600 shadow-2xs font-bold'
                        : 'bg-amber-50/70 text-amber-900 border-amber-200/80 hover:bg-amber-100'
                    }`}
                  >
                    {m.shortLabel}
                  </button>
                );
              })}
          </div>
        )}

        {/* Primary Module Navigation Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
          {tradingModules
            .filter((tab) => activeTabCategory === 'ALL' || tab.category === activeTabCategory)
            .map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-2xs font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${
                      isActive ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {tab.badge}
                  </span>
                </button>
              );
            })}
        </div>
      </div>

      {/* Cross-Module Deep Link Return Breadcrumb */}
      {navigationReturnSource && navigationReturnSource.tabId !== activeTab && (
        <div className="px-4 py-2 rounded-xl bg-indigo-50 border border-indigo-200 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 text-indigo-950">
            <button
              type="button"
              onClick={() => {
                const backId = navigationReturnSource.tabId;
                setNavigationReturnSource(null);
                setActiveTab(backId);
              }}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Return to {navigationReturnSource.label}</span>
            </button>
            <span className="text-indigo-800 font-medium">
              Context: {navigationReturnSource.contextNote}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setNavigationReturnSource(null)}
            className="text-indigo-600 hover:text-indigo-900 p-1"
            title="Dismiss return breadcrumb"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      <div key={activeTab} className="animate-module-enter space-y-6">

      {/* =========================================================================
          TAB 1: IPO TRACKER & GREY MARKET (GMP) DESK
      ========================================================================== */}
      {activeTab === 'ipos' && (
        <div className="space-y-5">
          {/* Historical Gain Caveat Banner (Requested by user prompt) */}
          <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200/90 text-xs text-amber-950 flex items-start gap-3">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-0.5 leading-relaxed">
              <strong>Mandatory Regulatory Caveat on IPOs & Grey Market Premiums:</strong>
              <p className="text-[11px] text-amber-800">
                Past listing pops and historical gains (e.g. Waaree Energies +70%, Bajaj Housing +114%) are not indicative of future returns.
                Grey Market Premiums (GMP) represent unofficial bilateral sentiment and can collapse prior to listing day.
                Always review company financial health, red-herring prospectus (RHP) risks, and anchor valuations before placing bids.
              </p>
            </div>
          </div>

          {/* IPO Filter Tabs */}
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-lg border border-slate-200/80 text-xs font-semibold">
              {(['all', 'open', 'listed', 'upcoming'] as const).map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setIpoFilter(f)}
                  className={`px-3 py-1.5 rounded-md capitalize transition-colors ${
                    ipoFilter === f
                      ? 'bg-white text-slate-900 shadow-2xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {f} Issues
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 text-xs">
              <button
                type="button"
                onClick={() => setIsAllotmentModalOpen(true)}
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg font-bold transition-colors"
              >
                <Search className="w-3.5 h-3.5" />
                <span>Registrar Allotment Lookup</span>
              </button>
            </div>
          </div>

          {/* IPO Data Table */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100/80 text-slate-600 font-mono text-[10px] uppercase tracking-wider border-b border-slate-200">
                    <th className="py-3 px-4 font-semibold">Company / Sector</th>
                    <th className="py-3 px-3 font-semibold">Timeline</th>
                    <th className="py-3 px-3 font-semibold text-right">Price Band</th>
                    <th className="py-3 px-3 font-semibold text-right">Lot Size</th>
                    <th className="py-3 px-3 font-semibold text-right">Issue Size</th>
                    <th className="py-3 px-3 font-semibold text-center">Subscription (QIB / NII / Retail)</th>
                    <th className="py-3 px-3 font-semibold text-right">Grey Market (GMP)</th>
                    <th className="py-3 px-3 font-semibold text-center">Status / Allotment</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredIpos.map((ipo) => (
                    <tr key={ipo.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{ipo.companyName}</div>
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-mono mt-0.5">
                          <span className="font-bold text-slate-700">{ipo.symbol}</span>
                          <span>·</span>
                          <span className="truncate max-w-[140px]">{ipo.sector}</span>
                        </div>
                      </td>

                      <td className="py-3 px-3 font-mono text-[11px] text-slate-600 whitespace-nowrap">
                        <div>Open: {ipo.openDate}</div>
                        <div className="text-slate-400">Close: {ipo.closeDate}</div>
                      </td>

                      <td className="py-3 px-3 text-right font-mono font-semibold text-slate-900 whitespace-nowrap">
                        ₹{ipo.priceBandMin} – ₹{ipo.priceBandMax}
                      </td>

                      <td className="py-3 px-3 text-right font-mono text-slate-600">
                        {ipo.lotSize} sh
                      </td>

                      <td className="py-3 px-3 text-right font-mono font-semibold text-slate-900">
                        ₹{ipo.issueSizeCr.toLocaleString()} Cr
                      </td>

                      <td className="py-3 px-3 text-center">
                        <div className="inline-flex items-center gap-1.5 font-mono text-[11px]">
                          <span className="text-slate-500" title="QIB Subscription">{ipo.subscriptionQib}x</span>
                          <span className="text-slate-300">/</span>
                          <span className="text-slate-500" title="NII Subscription">{ipo.subscriptionNii}x</span>
                          <span className="text-slate-300">/</span>
                          <span className="text-slate-700 font-bold" title="Retail Subscription">{ipo.subscriptionRetail}x</span>
                        </div>
                        <div className="text-[10px] font-mono text-emerald-700 font-bold">
                          Total: {ipo.totalSubscription}x
                        </div>
                      </td>

                      <td className="py-3 px-3 text-right font-mono whitespace-nowrap">
                        <div
                          className={`font-bold ${
                            ipo.gmpPrice > 0 ? 'text-emerald-700' : ipo.gmpPrice < 0 ? 'text-rose-700' : 'text-slate-500'
                          }`}
                        >
                          {ipo.gmpPrice > 0 ? `+₹${ipo.gmpPrice}` : ipo.gmpPrice < 0 ? `-₹${Math.abs(ipo.gmpPrice)}` : '₹0'}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          ({ipo.gmpPercent > 0 ? `+${ipo.gmpPercent}%` : `${ipo.gmpPercent}%`})
                        </div>
                      </td>

                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider ${
                              ipo.status === 'open'
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                : ipo.status === 'listed'
                                ? 'bg-indigo-100 text-indigo-800 border border-indigo-300'
                                : ipo.status === 'closed'
                                ? 'bg-slate-100 text-slate-700 border border-slate-300'
                                : 'bg-amber-100 text-amber-800 border border-amber-300'
                            }`}
                          >
                            {ipo.status}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedIpoForCheck(ipo.id);
                              setIsAllotmentModalOpen(true);
                            }}
                            className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 hover:underline"
                          >
                            Check
                          </button>
                        </div>
                        {ipo.listingGainPercent !== undefined && (
                          <div className="text-[10px] font-mono text-slate-500 mt-0.5">
                            Listed: <strong className={ipo.listingGainPercent >= 0 ? 'text-emerald-700' : 'text-rose-700'}>
                              {ipo.listingGainPercent >= 0 ? `+${ipo.listingGainPercent}%` : `${ipo.listingGainPercent}%`}
                            </strong>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 2: LIVE TRADING TERMINAL (Quotes, Order Ticket, Positions & Holdings)
      ========================================================================== */}
      {activeTab === 'terminal' && (
        <div className="space-y-6">
          {/* Top Ticker Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
            {quotes.map((q) => {
              const isSelected = selectedQuoteSymbol === q.symbol;
              const isPositive = q.change >= 0;
              return (
                <button
                  key={q.symbol}
                  type="button"
                  onClick={() => setSelectedQuoteSymbol(q.symbol)}
                  className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'border-orange-500 bg-orange-50/40 ring-2 ring-orange-200'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900">{q.symbol}</span>
                    <span
                      className={`text-[10px] font-mono font-bold ${
                        isPositive ? 'text-emerald-600' : 'text-rose-600'
                      }`}
                    >
                      {isPositive ? '+' : ''}{q.changePercent}%
                    </span>
                  </div>
                  <div className="mt-1 font-mono text-sm font-bold text-slate-950 tabular-nums">
                    ₹{q.lastPrice.toLocaleString()}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Main 2-Column Trading Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Live Chart & Order Ticket (7 cols) */}
            <div className="lg:col-span-7 space-y-6">
              {/* Active Symbol Banner & Quick Stats */}
              <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-bold text-slate-900">{selectedQuote.name}</h3>
                      <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-slate-100 text-slate-700 rounded border border-slate-200">
                        {selectedQuote.symbol}
                      </span>
                    </div>
                    <span className="text-xs text-slate-500 font-mono">
                      NSE Real-Time Stream · VWAP: ₹{selectedQuote.vwap.toFixed(2)}
                    </span>
                  </div>

                  <div className="text-right">
                    <div className="text-xl font-bold font-mono text-slate-950 tabular-nums">
                      ₹{selectedQuote.lastPrice.toFixed(2)}
                    </div>
                    <div
                      className={`text-xs font-mono font-bold flex items-center justify-end gap-1 ${
                        selectedQuote.change >= 0 ? 'text-emerald-600' : 'text-rose-600'
                      }`}
                    >
                      {selectedQuote.change >= 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                      <span>{selectedQuote.change >= 0 ? '+' : ''}{selectedQuote.change.toFixed(2)} ({selectedQuote.changePercent}%)</span>
                    </div>
                  </div>
                </div>

                {/* Sparkline Price Chart */}
                <div className="h-48 w-full pt-2 border-t border-slate-100">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={selectedQuote.historicalCandles}>
                      <defs>
                        <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#ea580c" stopOpacity={0.25} />
                          <stop offset="95%" stopColor="#ea580c" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="time" hide />
                      <YAxis domain={['auto', 'auto']} orientation="right" tick={{ fontSize: 10, fill: '#64748b' }} />
                      <Tooltip
                        content={({ active, payload }) => {
                          if (!active || !payload?.length) return null;
                          const d = payload[0].payload;
                          return (
                            <div className="p-2.5 bg-slate-900 text-white rounded-lg shadow-xl text-xs font-mono space-y-1">
                              <p className="font-bold text-slate-300">{d.time}</p>
                              <p>Close: <span className="font-bold text-orange-400">₹{d.close}</span></p>
                              <p>High: ₹{d.high} · Low: ₹{d.low}</p>
                            </div>
                          );
                        }}
                      />
                      <Area type="monotone" dataKey="close" stroke="#ea580c" strokeWidth={2} fillOpacity={1} fill="url(#colorPrice)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Order Placement Ticket with Confirmation Step */}
              <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 font-mono">
                      Order Execution Ticket
                    </h4>
                  </div>
                  <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-lg text-xs font-bold">
                    <button
                      type="button"
                      onClick={() => setOrderSide('BUY')}
                      className={`px-3 py-1 rounded-md transition-colors ${
                        orderSide === 'BUY' ? 'bg-emerald-600 text-white shadow-2xs' : 'text-slate-600'
                      }`}
                    >
                      BUY
                    </button>
                    <button
                      type="button"
                      onClick={() => setOrderSide('SELL')}
                      className={`px-3 py-1 rounded-md transition-colors ${
                        orderSide === 'SELL' ? 'bg-rose-600 text-white shadow-2xs' : 'text-slate-600'
                      }`}
                    >
                      SELL
                    </button>
                  </div>
                </div>

                <form onSubmit={handleInitiateOrder} className="space-y-4">
                  {/* Product & Order Type */}
                  <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-600">Product</label>
                      <select
                        value={orderProduct}
                        onChange={(e) => setOrderProduct(e.target.value as OrderProduct)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-bold text-slate-900"
                      >
                        <option value="MIS">MIS (Intraday Margin)</option>
                        <option value="CNC">CNC (Long-Term Delivery)</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-600">Order Type</label>
                      <select
                        value={orderType}
                        onChange={(e) => setOrderType(e.target.value as OrderType)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-bold text-slate-900"
                      >
                        <option value="MARKET">MARKET</option>
                        <option value="LIMIT">LIMIT</option>
                        <option value="SL_M">SL-M (Stop-Loss)</option>
                      </select>
                    </div>
                  </div>

                  {/* Quantity & Price */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono items-start">
                    <div className="space-y-1.5">
                      <div className="min-h-[22px] flex items-center justify-between gap-2">
                        <label className="text-[11px] font-semibold text-slate-600 whitespace-nowrap">Quantity (Shares)</label>
                        {(() => {
                          const effEntry = orderType === 'MARKET' ? selectedQuote.lastPrice : orderPrice;
                          const riskPerUnit = Math.max(0.5, Math.abs(effEntry - orderStopLoss));
                          const maxRiskBudget = 100000 * (riskSettings.maxRiskPerTradePercent / 100);
                          const safeQty = Math.max(1, Math.floor(maxRiskBudget / riskPerUnit));
                          return (
                            <button
                              type="button"
                              onClick={() => {
                                setOrderQuantity(safeQty);
                                showToast(`Auto-sized to ${safeQty} shares within ${riskSettings.maxRiskPerTradePercent}% risk cap.`, 'info');
                              }}
                              className="text-[10px] font-bold text-indigo-700 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 px-1.5 py-0.5 rounded border border-indigo-200 transition-colors whitespace-nowrap shrink-0"
                              title={`Compute qty keeping max loss <= ₹${Math.round(maxRiskBudget).toLocaleString('en-IN')}`}
                            >
                              Auto Safe ({safeQty})
                            </button>
                          );
                        })()}
                      </div>
                      <input
                        type="number"
                        min="1"
                        max="10000"
                        value={orderQuantity}
                        onChange={(e) => setOrderQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-bold text-slate-900 tabular-nums"
                      />
                      <div className="flex items-center gap-1">
                        {[10, 25, 50, 100].map((qtyPreset) => (
                          <button
                            key={qtyPreset}
                            type="button"
                            onClick={() => setOrderQuantity(qtyPreset)}
                            className={`flex-1 py-0.5 text-[10px] font-bold rounded border transition-colors ${
                              orderQuantity === qtyPreset
                                ? 'bg-slate-900 text-white border-slate-900'
                                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            {qtyPreset}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <div className="min-h-[22px] flex items-center justify-between gap-2">
                        <label className="text-[11px] font-semibold text-slate-600 whitespace-nowrap">Price (₹)</label>
                        <span className="text-[10px] font-mono text-slate-400 uppercase">{orderType}</span>
                      </div>
                      <input
                        type="number"
                        step="0.05"
                        disabled={orderType === 'MARKET'}
                        value={orderType === 'MARKET' ? selectedQuote.lastPrice : orderPrice}
                        onChange={(e) => setOrderPrice(parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-bold text-slate-900 disabled:opacity-60 tabular-nums"
                      />
                      <div className="text-[10px] text-slate-500 leading-tight">
                        {orderType === 'MARKET'
                          ? 'Executes at best live quote'
                          : 'Click any L2 depth price on right to fill'}
                      </div>
                    </div>
                  </div>

                  {/* Stop Loss & Target Safeguards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono items-start">
                    <div className="space-y-1.5">
                      <label className="min-h-[20px] text-[11px] font-semibold text-slate-600 flex items-center gap-1">
                        <ShieldAlert className="w-3 h-3 text-amber-500 shrink-0" />
                        <span>Stop-Loss (₹)</span>
                      </label>
                      <input
                        type="number"
                        step="0.05"
                        value={orderStopLoss}
                        onChange={(e) => setOrderStopLoss(parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-bold text-slate-900 tabular-nums"
                      />
                      <div className="flex items-center gap-1">
                        {[1, 2, 5].map((pct) => {
                          const basePx = orderType === 'MARKET' ? selectedQuote.lastPrice : orderPrice;
                          const slTarget = Math.round(basePx * (orderSide === 'BUY' ? 1 - pct / 100 : 1 + pct / 100) * 100) / 100;
                          return (
                            <button
                              key={pct}
                              type="button"
                              onClick={() => setOrderStopLoss(slTarget)}
                              className="flex-1 py-0.5 text-[10px] font-bold rounded border bg-amber-50/70 text-amber-900 border-amber-200 hover:bg-amber-100 transition-colors"
                            >
                              {orderSide === 'BUY' ? `-${pct}%` : `+${pct}%`}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="min-h-[20px] text-[11px] font-semibold text-slate-600 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
                        <span>Target Profit (₹)</span>
                      </label>
                      <input
                        type="number"
                        step="0.05"
                        value={orderTarget}
                        onChange={(e) => setOrderTarget(parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-bold text-slate-900 tabular-nums"
                      />
                      <div className="flex items-center gap-1">
                        {[3, 5, 10].map((pct) => {
                          const basePx = orderType === 'MARKET' ? selectedQuote.lastPrice : orderPrice;
                          const tgt = Math.round(basePx * (orderSide === 'BUY' ? 1 + pct / 100 : 1 - pct / 100) * 100) / 100;
                          return (
                            <button
                              key={pct}
                              type="button"
                              onClick={() => setOrderTarget(tgt)}
                              className="flex-1 py-0.5 text-[10px] font-bold rounded border bg-emerald-50/70 text-emerald-900 border-emerald-200 hover:bg-emerald-100 transition-colors"
                            >
                              {orderSide === 'BUY' ? `+${pct}%` : `-${pct}%`}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Live Pre-Trade Risk, Statutory Charges & R:R Summary */}
                  {(() => {
                    const effPrice = orderType === 'MARKET' ? selectedQuote.lastPrice : orderPrice;
                    const turnover = Math.round(orderQuantity * effPrice * 100) / 100;
                    const stt = orderProduct === 'CNC' ? turnover * 0.001 : turnover * 0.00025;
                    const exch = turnover * 0.0000345;
                    const gst = (20 + exch) * 0.18;
                    const stamp = orderSide === 'BUY' ? turnover * 0.00015 : 0;
                    const estCharges = Math.round((20 + stt + exch + gst + stamp) * 100) / 100;
                    const riskDist = Math.abs(effPrice - orderStopLoss);
                    const rewardDist = Math.abs(orderTarget - effPrice);
                    const estRiskAmt = Math.round(riskDist * orderQuantity);
                    const rrRatio = riskDist > 0 ? (rewardDist / riskDist).toFixed(2) : '—';
                    const riskPctOfEq = (estRiskAmt / 100000) * 100;
                    const exceedsRiskCap = riskPctOfEq > riskSettings.maxRiskPerTradePercent;
                    return (
                      <div className={`p-3 rounded-xl border text-xs font-mono space-y-1.5 ${
                        exceedsRiskCap ? 'bg-amber-50/80 border-amber-300' : 'bg-slate-50 border-slate-200'
                      }`}>
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <span className="text-slate-600">
                            Turnover: <strong className="text-slate-900">₹{turnover.toLocaleString('en-IN')}</strong>
                          </span>
                          <span className="text-slate-600">
                            Est. Charges: <strong className="text-slate-900">₹{estCharges.toFixed(2)}</strong>
                          </span>
                          <span className="text-slate-600">
                            R:R Ratio: <strong className="text-indigo-700">1 : {rrRatio}</strong>
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[11px]">
                          <span className={exceedsRiskCap ? 'text-amber-900 font-bold' : 'text-slate-500'}>
                            SL Risk on ₹1L Eq: ₹{estRiskAmt.toLocaleString('en-IN')} ({riskPctOfEq.toFixed(2)}%)
                          </span>
                          {exceedsRiskCap && (
                            <span className="text-rose-700 font-bold">
                              Exceeds {riskSettings.maxRiskPerTradePercent}% limit
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })()}

                  <button
                    type="submit"
                    className={`w-full py-3 px-4 font-bold text-xs rounded-xl shadow-2xs transition-colors flex items-center justify-center gap-2 ${
                      orderSide === 'BUY'
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                        : 'bg-rose-600 hover:bg-rose-700 text-white'
                    }`}
                  >
                    <span>Place {orderSide} Order for {orderQuantity} {selectedQuote.symbol}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              </div>

              {/* Today's Executed Orders Book */}
              <div className="p-4 sm:p-5 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 font-mono">
                    Executed Orders Today ({orders.length})
                  </h4>
                  <span className="text-[11px] font-mono text-slate-500">Live Fill Book</span>
                </div>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {orders.slice(0, 8).map((ord) => (
                    <div
                      key={ord.id}
                      className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between gap-2 text-xs font-mono"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className={`px-1.5 py-0.5 text-[10px] font-bold rounded shrink-0 ${
                            ord.side === 'BUY'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {ord.side}
                        </span>
                        <div className="min-w-0 truncate">
                          <strong className="text-slate-900">{ord.symbol}</strong>
                          <span className="text-[10px] text-slate-500 ml-1.5">
                            {ord.quantity} Qty · {ord.product} ({ord.type})
                          </span>
                        </div>
                      </div>
                      <div className="text-right shrink-0 tabular-nums">
                        <div className="font-bold text-slate-900">₹{ord.price.toFixed(2)}</div>
                        <div className="text-[10px] text-slate-500">
                          {ord.timestamp} · Chg ₹{ord.totalCharges.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: Positions, Holdings & Level-2 Depth (5 cols) */}
            <div className="lg:col-span-5 space-y-6">
              {/* Positions Table */}
              <div className="p-4 sm:p-5 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 font-mono">
                      Open Positions ({positions.length})
                    </h4>
                    <span className="text-[11px] text-slate-500 font-mono">Live Mark-to-Market P&L</span>
                  </div>
                  <div
                    className={`font-mono text-xs font-bold px-2 py-0.5 rounded border ${
                      totalUnrealizedPnl >= 0
                        ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                        : 'text-rose-700 bg-rose-50 border-rose-200'
                    }`}
                  >
                    {totalUnrealizedPnl >= 0 ? `+₹${totalUnrealizedPnl.toFixed(2)}` : `-₹${Math.abs(totalUnrealizedPnl).toFixed(2)}`}
                  </div>
                </div>

                {positions.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-xl">
                    No active open positions. Place an order via the ticket.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {positions.map((pos) => (
                      <div
                        key={pos.symbol}
                        className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between gap-2 text-xs"
                      >
                        <div className="min-w-0">
                          <div className="font-bold text-slate-900 flex items-center gap-1.5">
                            <span>{pos.symbol}</span>
                            <span className="text-[10px] font-mono px-1 bg-slate-200 text-slate-700 rounded shrink-0">
                              {pos.product}
                            </span>
                          </div>
                          <span className="text-[11px] text-slate-500 font-mono tabular-nums">
                            {pos.quantity} Qty · Avg: ₹{pos.buyAvgPrice}
                          </span>
                        </div>

                        <div className="text-right shrink-0 tabular-nums">
                          <div
                            className={`font-mono font-bold ${
                              pos.pnl >= 0 ? 'text-emerald-600' : 'text-rose-600'
                            }`}
                          >
                            {pos.pnl >= 0 ? '+' : ''}₹{pos.pnl.toFixed(2)} ({pos.pnlPercent}%)
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setPositions((prev) => prev.filter((p) => p.symbol !== pos.symbol));
                              setRiskSettings((prev) => ({
                                ...prev,
                                dailyRealizedPnl: Math.round((prev.dailyRealizedPnl + pos.pnl) * 100) / 100,
                              }));
                              setAuditLogs((prev) => [
                                {
                                  id: `LOG_${Date.now()}`,
                                  timestamp: new Date().toLocaleTimeString(),
                                  eventType: 'ORDER_EXECUTED',
                                  symbol: pos.symbol,
                                  description: `Position squared off: ${pos.quantity} ${pos.symbol} @ ₹${pos.currentPrice.toFixed(2)}. Realized P&L: ₹${pos.pnl.toFixed(2)}.`,
                                  severity: pos.pnl >= 0 ? 'success' : 'warning',
                                },
                                ...prev,
                              ]);
                              showToast(
                                `Squared off ${pos.quantity} ${pos.symbol} @ ₹${pos.currentPrice.toFixed(2)} (${pos.pnl >= 0 ? '+' : ''}₹${pos.pnl.toFixed(2)}).`,
                                pos.pnl >= 0 ? 'success' : 'warning'
                              );
                            }}
                            className="text-[10px] font-bold text-rose-600 hover:text-rose-800 hover:underline"
                          >
                            Square Off
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Demat Holdings Table */}
              <div className="p-4 sm:p-5 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 font-mono">
                      Demat Holdings &amp; IPO Portfolios
                    </h4>
                    <span className="text-[11px] text-slate-500 font-mono tabular-nums">
                      Current Value: ₹{totalCurrentHoldings.toLocaleString()}
                    </span>
                  </div>
                  <span className="font-mono text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 shrink-0 tabular-nums">
                    +{totalHoldingsPnlPercent}%
                  </span>
                </div>

                <div className="space-y-2">
                  {holdings.map((h) => (
                    <button
                      key={h.symbol}
                      type="button"
                      onClick={() => handleTradeSymbolFromOtherTab(h.symbol)}
                      className="w-full text-left p-3 bg-slate-50 hover:bg-indigo-50/60 rounded-xl border border-slate-200 hover:border-indigo-300 flex items-center justify-between gap-2 text-xs transition-colors"
                      title={`Load ${h.symbol} into Order Execution Ticket`}
                    >
                      <div className="min-w-0">
                        <strong className="text-slate-900 block">{h.symbol}</strong>
                        <span className="text-[10px] text-slate-500 block truncate max-w-[160px]">{h.companyName}</span>
                        <span className="text-[10px] font-mono text-slate-600 tabular-nums">{h.quantity} Shares</span>
                      </div>

                      <div className="text-right font-mono shrink-0 tabular-nums">
                        <strong className="text-slate-900 block">₹{h.currentValue.toLocaleString()}</strong>
                        <span className={`text-[11px] font-bold block ${h.totalPnl >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {h.totalPnl >= 0 ? '+' : ''}₹{h.totalPnl.toLocaleString()} ({h.totalPnlPercent >= 0 ? '+' : ''}{h.totalPnlPercent}%)
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Order Book / Market Depth (Level-2) */}
              <div className="p-4 rounded-xl bg-slate-900 text-white shadow-2xs space-y-2.5 font-mono text-xs">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-[11px] text-slate-400 uppercase tracking-wider font-bold">
                    Order Book Depth (L2) · {selectedQuote.symbol}
                  </span>
                  <span className="text-[10px] text-emerald-400">Click Price → Limit</span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-[11px]">
                  {/* Bids */}
                  <div>
                    <div className="text-slate-400 text-[10px] border-b border-slate-800 pb-1 mb-1 flex justify-between">
                      <span>Bids (Qty)</span>
                      <span>Price</span>
                    </div>
                    {[
                      { price: selectedQuote.bidPrice, qty: 1420 },
                      { price: selectedQuote.bidPrice - 0.5, qty: 2840 },
                      { price: selectedQuote.bidPrice - 1.0, qty: 5120 },
                      { price: selectedQuote.bidPrice - 1.5, qty: 9800 },
                    ].map((b, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          const px = Math.round(b.price * 100) / 100;
                          setOrderType('LIMIT');
                          setOrderPrice(px);
                          showToast(`Set LIMIT price to Bid ₹${px.toFixed(2)}.`, 'info');
                        }}
                        className="w-full flex justify-between text-emerald-400 hover:bg-slate-800 px-1 py-0.5 rounded transition-colors"
                      >
                        <span className="text-slate-300">{b.qty}</span>
                        <span className="font-bold">₹{b.price.toFixed(2)}</span>
                      </button>
                    ))}
                  </div>

                  {/* Asks */}
                  <div>
                    <div className="text-slate-400 text-[10px] border-b border-slate-800 pb-1 mb-1 flex justify-between">
                      <span>Price</span>
                      <span>Asks (Qty)</span>
                    </div>
                    {[
                      { price: selectedQuote.askPrice, qty: 890 },
                      { price: selectedQuote.askPrice + 0.5, qty: 2150 },
                      { price: selectedQuote.askPrice + 1.0, qty: 4620 },
                      { price: selectedQuote.askPrice + 1.5, qty: 8200 },
                    ].map((a, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          const px = Math.round(a.price * 100) / 100;
                          setOrderType('LIMIT');
                          setOrderPrice(px);
                          showToast(`Set LIMIT price to Ask ₹${px.toFixed(2)}.`, 'info');
                        }}
                        className="w-full flex justify-between text-rose-400 hover:bg-slate-800 px-1 py-0.5 rounded transition-colors"
                      >
                        <span className="font-bold">₹{a.price.toFixed(2)}</span>
                        <span className="text-slate-300">{a.qty}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 3: PORTFOLIO HEALTH & TAXES
      ========================================================================== */}
      {activeTab === 'portfolio_health' && (
        <PortfolioHealthTab
          holdings={holdings}
          onTradeSymbol={handleTradeSymbolFromOtherTab}
        />
      )}

      {/* =========================================================================
          TAB 4: SCREENER & FUNDAMENTALS
      ========================================================================== */}
      {activeTab === 'screener' && (
        <ScreenerTab
          onTradeSymbol={handleTradeSymbolFromOtherTab}
        />
      )}

      {/* =========================================================================
          TAB 5: NEWS, EVENT DIGEST & RBI CALENDAR
      ========================================================================== */}
      {activeTab === 'news' && (
        <MarketNewsTab
          holdings={holdings}
          onTradeSymbol={handleTradeSymbolFromOtherTab}
        />
      )}

      {/* =========================================================================
          TAB 6: PSYCHOLOGICAL TRADE JOURNAL & CA TAX EXPORT
      ========================================================================== */}
      {activeTab === 'journal' && (
        <TradeJournalTab onExportSuccess={(msg) => showToast(msg, 'success')} />
      )}

      {/* =========================================================================
          TAB 7: BEHAVIORAL GUARDRAILS & COOLING-OFF ENGINE
      ========================================================================== */}
      {activeTab === 'guardrails' && (
        <BehavioralGuardrailsTab />
      )}

      {/* =========================================================================
          TAB 8: MODEL PORTFOLIO & BENCHMARK AUDIT (NIFTY 50 / 500)
      ========================================================================== */}
      {activeTab === 'benchmarks' && (
        <BenchmarkComparisonTab />
      )}

      {/* =========================================================================
          TAB 9: STRATEGY ENGINE & REALISTIC BACKTESTING
      ========================================================================== */}
      {activeTab === 'strategies' && (
        <div className="space-y-6">
          {/* Strategy Setup Header */}
          <div className="p-4 sm:p-5 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 font-mono">
                  Strategy Configuration & Parameter Tuning
                </h3>
                <p className="text-xs text-slate-500">
                  Configure rule-based alpha models and backtest against historical candles with realistic transaction friction.
                </p>
              </div>

              <button
                type="button"
                onClick={handleRunBacktest}
                className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-colors shadow-2xs"
              >
                <Play className="w-3.5 h-3.5 text-orange-400" />
                <span>Run Historical Backtest</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs font-mono items-end">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-600">Model Type</label>
                <select
                  value={strategyConfig.type}
                  onChange={(e) => setStrategyConfig({ ...strategyConfig, type: e.target.value as any })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-bold text-slate-900"
                >
                  <option value="ema_crossover">EMA 9/21 Trend Crossover</option>
                  <option value="rsi_reversal">RSI 30/70 Mean Reversion</option>
                  <option value="vwap_breakout">VWAP Intraday Breakout</option>
                  <option value="ipo_momentum">IPO Listing-Day Momentum</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-600">Symbol</label>
                <select
                  value={strategyConfig.symbol}
                  onChange={(e) => setStrategyConfig({ ...strategyConfig, symbol: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-bold text-slate-900"
                >
                  {quotes.map((q) => (
                    <option key={q.symbol} value={q.symbol}>
                      {q.symbol} ({q.name})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-600">Stop-Loss (%)</label>
                <input
                  type="number"
                  step="0.5"
                  value={strategyConfig.stopLossPercent}
                  onChange={(e) => setStrategyConfig({ ...strategyConfig, stopLossPercent: parseFloat(e.target.value) || 1 })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-bold text-slate-900"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-600">Target Profit (%)</label>
                <input
                  type="number"
                  step="0.5"
                  value={strategyConfig.targetPercent}
                  onChange={(e) => setStrategyConfig({ ...strategyConfig, targetPercent: parseFloat(e.target.value) || 3 })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-bold text-slate-900"
                />
              </div>
            </div>
          </div>

          {/* Performance Metrics Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <StatCard
              label="Win Rate"
              value={`${backtestResult.winRate}%`}
              subtext={`${backtestResult.winningTrades}W / ${backtestResult.losingTrades}L`}
              statusType={backtestResult.winRate >= 50 ? 'nominal' : 'neutral'}
            />
            <StatCard
              label="Profit Factor"
              value={backtestResult.profitFactor.toFixed(2)}
              subtext="Gross Wins / Gross Losses"
              statusType={backtestResult.profitFactor >= 1.5 ? 'nominal' : 'neutral'}
            />
            <StatCard
              label="Net Backtest P&L"
              value={`₹${backtestResult.totalNetPnl.toLocaleString()}`}
              subtext={`After ₹${backtestResult.totalCharges} taxes`}
              statusType={backtestResult.totalNetPnl >= 0 ? 'nominal' : 'demanding'}
            />
            <StatCard
              label="Max Drawdown"
              value={`-${backtestResult.maxDrawdown}%`}
              subtext={`Max dip: -₹${backtestResult.maxDrawdownAmount.toLocaleString()}`}
              statusType={backtestResult.maxDrawdown <= 8 ? 'nominal' : 'demanding'}
            />
            <StatCard
              label="Sharpe Ratio"
              value={backtestResult.sharpeRatio.toFixed(2)}
              subtext="Risk-Adjusted Return"
              statusType="neutral"
            />
            <StatCard
              label="Trade Count"
              value={backtestResult.totalTrades.toString()}
              subtext={`Expectancy: ${backtestResult.expectancyRatio}`}
              statusType="neutral"
            />
          </div>

          {/* Honest Equity & Drawdown Chart */}
          <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 font-mono">
                  Cumulative Equity Curve & Underwater Drawdown
                </h4>
                <p className="text-[11px] text-slate-500">
                  Simulated capital trajectory accounting for slippage, STT, and flat brokerage deductions.
                </p>
              </div>
              <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Starting: ₹1,00,000
              </span>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={backtestResult.equityCurve}>
                  <defs>
                    <linearGradient id="colorEquity" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#64748b' }} />
                  <YAxis domain={['auto', 'auto']} orientation="right" tick={{ fontSize: 10, fill: '#64748b' }} />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null;
                      const d = payload[0].payload;
                      return (
                        <div className="p-2.5 bg-slate-900 text-white rounded-lg shadow-xl text-xs font-mono space-y-1">
                          <p className="font-bold">{d.date}</p>
                          <p>Equity: <span className="text-emerald-400 font-bold">₹{d.equity.toLocaleString()}</span></p>
                          <p>Drawdown: <span className="text-rose-400">-{d.drawdown}%</span></p>
                        </div>
                      );
                    }}
                  />
                  <ReferenceLine y={100000} stroke="#94a3b8" strokeDasharray="3 3" />
                  <Area type="monotone" dataKey="equity" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorEquity)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Detailed Trade Log Table */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs space-y-2 p-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 font-mono">
              Backtest Trade Execution Ledger ({backtestResult.trades.length} Executed Signals)
            </h4>
            <div className="overflow-x-auto max-h-72">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="sticky top-0 bg-slate-100">
                  <tr className="text-slate-600 font-mono text-[10px] uppercase border-b border-slate-200">
                    <th className="py-2 px-3">Entry Date</th>
                    <th className="py-2 px-3">Exit Date</th>
                    <th className="py-2 px-3 text-right">Entry (₹)</th>
                    <th className="py-2 px-3 text-right">Exit (₹)</th>
                    <th className="py-2 px-3 text-right">Qty</th>
                    <th className="py-2 px-3 text-right">Taxes/Chgs</th>
                    <th className="py-2 px-3 text-right">Net P&L</th>
                    <th className="py-2 px-3 text-center">Exit Reason</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {backtestResult.trades.slice(0, 20).map((t, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="py-2 px-3 text-slate-600">{t.entryTime}</td>
                      <td className="py-2 px-3 text-slate-600">{t.exitTime}</td>
                      <td className="py-2 px-3 text-right">₹{t.entryPrice}</td>
                      <td className="py-2 px-3 text-right">₹{t.exitPrice}</td>
                      <td className="py-2 px-3 text-right">{t.quantity}</td>
                      <td className="py-2 px-3 text-right text-slate-500">₹{t.charges}</td>
                      <td className={`py-2 px-3 text-right font-bold ${t.netPnl >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {t.netPnl >= 0 ? '+' : ''}₹{t.netPnl} ({t.returnPercent}%)
                      </td>
                      <td className="py-2 px-3 text-center">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] uppercase font-bold ${
                            t.exitReason === 'TARGET'
                              ? 'bg-emerald-100 text-emerald-800'
                              : t.exitReason === 'STOP_LOSS'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {t.exitReason}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 4: RISK MANAGEMENT & CIRCUIT BREAKERS
      ========================================================================== */}
      {activeTab === 'risk' && (
        <div className="space-y-6">
          {/* Risk Control Safeguards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {/* Safeguard 1: Per-Trade Stop-Loss & Position Sizing */}
            <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 font-mono">
                  1. Per-Trade Stop-Loss & Capital Risk Cap
                </h4>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                Enforces maximum risk budget per position. If an order exceeds your configured risk percentage of account equity,
                the order ticket will adjust quantity downward or reject the order.
              </p>

              <div className="space-y-2">
                <div className="flex justify-between text-xs font-mono font-bold">
                  <span>Max Risk Per Trade:</span>
                  <span className="text-orange-600">{riskSettings.maxRiskPerTradePercent}% of Equity</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="3.0"
                  step="0.1"
                  value={riskSettings.maxRiskPerTradePercent}
                  onChange={(e) =>
                    setRiskSettings({ ...riskSettings, maxRiskPerTradePercent: parseFloat(e.target.value) })
                  }
                  className="w-full accent-orange-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>Conservative (0.5%)</span>
                  <span>Institutional Standard (1.5%)</span>
                  <span>Aggressive (3.0%)</span>
                </div>
              </div>
            </div>

            {/* Safeguard 2: Daily Loss Circuit Breaker */}
            <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 font-mono">
                  2. Daily Loss Limit Circuit Breaker
                </h4>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                If cumulative realized daily losses reach this hard threshold, the trading engine instantly locks and halts
                all order routing until the next market session.
              </p>

              <div className="space-y-2">
                <div className="flex justify-between text-xs font-mono font-bold">
                  <span>Daily Loss Hard Limit:</span>
                  <span className="text-rose-600">₹{riskSettings.dailyLossLimit.toLocaleString()}</span>
                </div>
                <input
                  type="range"
                  min="2000"
                  max="20000"
                  step="500"
                  value={riskSettings.dailyLossLimit}
                  onChange={(e) =>
                    setRiskSettings({ ...riskSettings, dailyLossLimit: parseInt(e.target.value) })
                  }
                  className="w-full accent-rose-600 cursor-pointer"
                />
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs font-mono flex items-center justify-between">
                  <span className="text-slate-500">Today's Realized Net P&L:</span>
                  <span className={`font-bold ${riskSettings.dailyRealizedPnl >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {riskSettings.dailyRealizedPnl >= 0 ? '+' : ''}₹{riskSettings.dailyRealizedPnl.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Safeguard 3: Symbol Concentration Cap */}
            <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <Layers className="w-5 h-5 text-indigo-600" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 font-mono">
                  3. Max Single Symbol Exposure Cap
                </h4>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                Prevents over-allocation into a single stock or IPO allocation, keeping single-name risk below 25%.
              </p>

              <div className="space-y-2">
                <div className="flex justify-between text-xs font-mono font-bold">
                  <span>Max Symbol Capital Exposure:</span>
                  <span className="text-indigo-700">{riskSettings.maxCapitalExposurePercent}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="40"
                  step="5"
                  value={riskSettings.maxCapitalExposurePercent}
                  onChange={(e) =>
                    setRiskSettings({ ...riskSettings, maxCapitalExposurePercent: parseInt(e.target.value) })
                  }
                  className="w-full accent-indigo-600 cursor-pointer"
                />
              </div>
            </div>

            {/* Safeguard 4: Emergency Kill Switch */}
            <div className="p-5 rounded-xl bg-rose-50 border border-rose-200 shadow-2xs space-y-4">
              <div className="flex items-center gap-2 border-b border-rose-200 pb-3 text-rose-950 font-bold">
                <Zap className="w-5 h-5 text-rose-600" />
                <h4 className="text-xs font-bold uppercase tracking-wider font-mono">
                  4. Emergency Kill Switch Terminal
                </h4>
              </div>

              <p className="text-xs text-rose-800 leading-relaxed">
                Emergency failsafe. Immediately fires market orders to square off all open positions and cancels all active limit/stop orders.
              </p>

              <button
                type="button"
                onClick={handleTriggerKillSwitch}
                className="w-full py-3 px-4 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-2xs transition-colors flex items-center justify-center gap-2"
              >
                <Zap className="w-4 h-4" />
                <span>ENGAGE EMERGENCY KILL SWITCH</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 5: COMPLIANCE, SEBI DISCLAIMERS & AUDIT LOG
      ========================================================================== */}
      {activeTab === 'audit' && (
        <div className="space-y-6">
          {/* SEBI Compliance Banner */}
          <div className="p-4 rounded-xl bg-slate-900 text-white space-y-2 text-xs">
            <div className="flex items-center gap-2 font-bold text-orange-400">
              <ShieldCheck className="w-4 h-4" />
              <span>Regulatory Compliance & Transparency Notice</span>
            </div>
            <p className="text-slate-300 leading-relaxed text-[11px]">
              This application is designed for analytical modeling, decision visual experimentation, and educational simulation.
              It does not constitute investment advice, research analyst recommendations, or portfolio management services.
              All orders placed through integrated broker APIs are executed directly by the user under self-directed confirmation safeguards.
            </p>
          </div>

          {/* Audit Log Table */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 font-mono">
                  System Audit Ledger ({auditLogs.length} Events)
                </h4>
                <p className="text-[11px] text-slate-500">
                  Immutable record of every order signal, execution, risk circuit check, and broker communication.
                </p>
              </div>
              <button
                type="button"
                onClick={() =>
                  setAuditLogs((prev) => [
                    {
                      id: `LOG_${Date.now()}`,
                      timestamp: new Date().toLocaleTimeString(),
                      eventType: 'ORDER_SUBMITTED',
                      description: 'Audit log integrity verified and synchronized with local demat cache.',
                      severity: 'info',
                    },
                    ...prev,
                  ])
                }
                className="text-xs font-semibold text-slate-600 hover:text-slate-900 p-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-600 font-mono text-[10px] uppercase border-b border-slate-200">
                    <th className="py-2.5 px-3">Timestamp</th>
                    <th className="py-2.5 px-3">Event Type</th>
                    <th className="py-2.5 px-3">Symbol</th>
                    <th className="py-2.5 px-4">Audit Description</th>
                    <th className="py-2.5 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                  {auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 text-slate-500 whitespace-nowrap">{log.timestamp}</td>
                      <td className="py-2.5 px-3 font-bold text-slate-800 whitespace-nowrap">{log.eventType}</td>
                      <td className="py-2.5 px-3 text-slate-600 font-semibold">{log.symbol || 'SYSTEM'}</td>
                      <td className="py-2.5 px-4 font-sans text-slate-700">{log.description}</td>
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                            log.severity === 'success'
                              ? 'bg-emerald-100 text-emerald-800'
                              : log.severity === 'danger'
                              ? 'bg-rose-100 text-rose-800'
                              : log.severity === 'warning'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {log.severity}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          ADVANCED EXPANSION MODULES
      ========================================================================== */}
      {activeTab === 'tax_harvest' && (
        <TaxLossHarvestingTab onStageHarvestOrders={handleStageHarvestOrders} />
      )}
      {activeTab === 'corporate_actions' && (
        <CorporateActionsTab onNotify={(msg) => showToast(msg, 'success')} />
      )}
      {activeTab === 'position_sizing' && (
        <PositionSizingTab onApplyToTerminal={handleApplyPositionSizeToTerminal} />
      )}
      {activeTab === 'strategy_versions' && (
        <StrategyVersioningTab onNotify={(msg) => showToast(msg, 'success')} />
      )}
      {activeTab === 'sector_rotation' && <SectorRotationTab />}
      {activeTab === 'drawdown_report' && <DrawdownReportTab />}
      {activeTab === 'community' && <CommunityDiscussionTab />}
      {activeTab === 'leaderboard' && <PaperLeaderboardTab />}
      {activeTab === 'options_lab' && (
        <OptionsPayoffTab
          injectedLeg={injectedOptionLeg}
          onClearInjectedLeg={() => setInjectedOptionLeg(null)}
        />
      )}
      {activeTab === 'rebalance' && <PortfolioRebalanceTab holdings={holdings} />}
      {activeTab === 'fire_planner' && (
        <FireGoalSimulatorTab
          currentPortfolioValue={holdings.reduce((sum, h) => sum + h.currentValue, 0)}
        />
      )}
      {activeTab === 'mf_overlap' && (
        <MfOverlapTab
          holdings={holdings}
          onNotify={(msg) => showToast(msg, 'info')}
        />
      )}
      {activeTab === 'fii_dii' && <FiiDiiFlowsTab />}
      {activeTab === 'live_alerts' && (
        <LiveAlertsChecklistTab
          quotes={quotes}
          alertRules={alertRules}
          onAddAlert={(rule) => {
            setAlertRules((prev) => [rule, ...prev]);
            showToast(`Armed price alert: ${rule.symbol} ${rule.condition === 'ABOVE' ? '≥' : '≤'} ₹${rule.targetPrice}.`, 'success');
          }}
          onToggleAlert={(id) =>
            setAlertRules((prev) =>
              prev.map((r) => (r.id === id ? { ...r, isActive: !r.isActive } : r))
            )
          }
          onDeleteAlert={(id) =>
            setAlertRules((prev) => prev.filter((r) => r.id !== id))
          }
          onResetAlertTrigger={(id) =>
            setAlertRules((prev) =>
              prev.map((r) =>
                r.id === id ? { ...r, isTriggered: false, isActive: true, triggeredAt: undefined } : r
              )
            )
          }
          onTradeSymbol={handleTradeSymbolFromOtherTab}
        />
      )}
      {activeTab === 'dividend_calendar' && (
        <DividendCalendarTab
          holdings={holdings}
          onTradeSymbol={handleTradeSymbolFromOtherTab}
        />
      )}
      {activeTab === 'pledge_margin' && (
        <CollateralPledgeTab
          holdings={holdings}
          onJumpToOptions={() =>
            jumpWithContext(
              'options_lab',
              'Collateral F&O margin ready for strategy deployment',
              'pledge_margin',
              'Collateral Pledge'
            )
          }
          onNotify={(msg) => showToast(msg, 'success')}
        />
      )}
      {activeTab === 'contract_note_audit' && <ContractNoteAuditTab orders={orders} />}
      {activeTab === 'capital_gains_tax' && (
        <CapitalGainsTaxTab
          holdings={holdings}
          onJumpToTaxHarvest={() =>
            jumpWithContext(
              'tax_harvest',
              'Review harvesting lots to lower Sec 111A / 112A liability',
              'capital_gains_tax',
              'ITR & Advance Tax'
            )
          }
          onJumpToDividends={() =>
            jumpWithContext(
              'dividend_calendar',
              'Inspect Demat dividend income included in slab calc',
              'capital_gains_tax',
              'ITR & Advance Tax'
            )
          }
        />
      )}
      {activeTab === 'oi_option_chain' && (
        <OptionChainOiTab
          onSendLegToPayoffLab={(leg) => {
            setInjectedOptionLeg(leg);
            jumpWithContext(
              'options_lab',
              `Loaded ${leg.side} ${leg.indexId} ${leg.strike} ${leg.type} @ ₹${leg.premium}`,
              'oi_option_chain',
              'Option Chain OI'
            );
            showToast(
              `Added ${leg.side} ${leg.strike} ${leg.type} (${leg.indexId}) leg to Options Payoff Lab.`,
              'success'
            );
          }}
        />
      )}
      {activeTab === 'insider_radar' && (
        <InsiderShareholdingTab
          holdings={holdings}
          onTradeSymbol={(sym) =>
            handleTradeSymbolFromOtherTab(sym, 'insider_radar', 'Insider & Pledge Radar')
          }
        />
      )}
      {activeTab === 'chart_desk' && (
        <TechnicalChartDeskTab
          quotes={quotes}
          initialSymbol={chartDeskSymbol}
          onSendSetupToTerminal={(setup) => {
            setSelectedQuoteSymbol(setup.symbol);
            setOrderSide('BUY');
            setOrderType('LIMIT');
            setOrderPrice(setup.entryPrice);
            setOrderStopLoss(setup.stopLossPrice);
            setOrderTarget(setup.targetPrice);
            jumpWithContext(
              'terminal',
              `${setup.symbol} setup: Entry ₹${setup.entryPrice}, SL ₹${setup.stopLossPrice}, Target ₹${setup.targetPrice}`,
              'chart_desk',
              'Technical Chart Desk'
            );
            showToast(`Pre-filled ${setup.symbol} chart setup in Live Terminal.`, 'success');
          }}
          onArmBreakoutAlert={(alertCfg) => {
            setAlertRules((prev) => [
              {
                id: `ALT_TECH_${Date.now()}`,
                symbol: alertCfg.symbol,
                condition: alertCfg.condition,
                targetPrice: alertCfg.targetPrice,
                note: alertCfg.note,
                isActive: true,
                isTriggered: false,
                createdAt: new Date().toLocaleTimeString(),
              },
              ...prev,
            ]);
            showToast(
              `Armed breakout alert: ${alertCfg.symbol} ${alertCfg.condition} ₹${alertCfg.targetPrice}.`,
              'success'
            );
          }}
        />
      )}
      {activeTab === 'basket_gtt' && (
        <StockBasketGttTab
          quotes={quotes}
          holdings={holdings}
          gttRules={gttRules}
          onDeployBasketOrders={handleDeployBasketOrders}
          onAddGttRule={(rule) => {
            setGttRules((prev) => [rule, ...prev]);
            showToast(
              `Armed GTT OCO for ${rule.symbol} (Target ₹${rule.triggerTargetPrice} / SL ₹${rule.triggerStopPrice}).`,
              'success'
            );
          }}
          onToggleGttRule={(id) =>
            setGttRules((prev) =>
              prev.map((r) => (r.id === id ? { ...r, isActive: !r.isActive } : r))
            )
          }
          onDeleteGttRule={(id) =>
            setGttRules((prev) => prev.filter((r) => r.id !== id))
          }
        />
      )}
      {activeTab === 'debt_sgb_ladder' && (
        <DebtSgbLadderTab
          currentEquityValue={totalCurrentHoldings}
          onJumpToRebalance={() =>
            jumpWithContext(
              'rebalance',
              'Deploy debt/equity drift rebalancing steps',
              'debt_sgb_ladder',
              'Gold, SGB & Debt Ladder'
            )
          }
        />
      )}

      {/* Contextual Workflow Footer Strip */}
      <div className="p-3.5 rounded-xl bg-white border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-slate-600">
          <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
          <span>
            <strong className="text-slate-900">Next Suggested Workflow:</strong> Continue seamlessly from{' '}
            <span className="font-semibold text-slate-800">{activeModuleMeta.shortLabel}</span>
          </span>
        </div>
        <div className="flex items-center flex-wrap gap-2">
          {(activeModuleMeta.nextTargets || []).map((target) => (
            <button
              key={target.id}
              type="button"
              onClick={() => {
                setActiveTab(target.id);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold rounded-lg border border-indigo-200/80 transition-colors whitespace-nowrap shrink-0"
            >
              <span>{target.label}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ))}
        </div>
      </div>
      </div>

      {/* Floating Back to Top Button */}
      {showBackToTop && (
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-6 left-6 z-40 inline-flex items-center gap-1.5 px-3 py-2 rounded-full bg-slate-900/90 hover:bg-slate-900 text-white text-xs font-semibold shadow-lg border border-slate-700 backdrop-blur-xs transition-all"
          title="Scroll to top of Trading Desk"
        >
          <ArrowUp className="w-3.5 h-3.5" />
          <span>Top</span>
        </button>
      )}

      {/* Trading Desk Spotlight Search Modal (Shortcut: J) */}
      <TradingSpotlightModal
        isOpen={isSpotlightOpen}
        onClose={() => setIsSpotlightOpen(false)}
        modules={tradingModules}
        quotes={quotes}
        pinnedIds={pinnedTabIds}
        activeTabId={activeTab}
        onSelectModule={(id) => {
          setActiveTab(id as TradingTabId);
          setActiveTabCategory('ALL');
        }}
        onSelectStock={handleTradeSymbolFromOtherTab}
        onTogglePin={togglePinTab}
      />

      {/* Non-Blocking Toast Notification */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className={`fixed bottom-6 right-6 z-[60] max-w-md px-4 py-3 rounded-xl shadow-2xl border text-xs font-semibold flex items-center justify-between gap-3 ${
            toast.severity === 'danger'
              ? 'bg-rose-950 text-rose-50 border-rose-700'
              : toast.severity === 'success'
              ? 'bg-emerald-950 text-emerald-50 border-emerald-700'
              : 'bg-slate-900 text-white border-slate-700'
          }`}
        >
          <div className="flex items-center gap-2">
            {toast.severity === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
            <span>{toast.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setToast(null)}
            aria-label="Dismiss notification"
            className="text-slate-300 hover:text-white shrink-0"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Kill Switch In-App Confirmation Modal (Replaces window.confirm) */}
      {isKillSwitchConfirmOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-rose-200 space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-rose-100 text-rose-600 shrink-0">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Engage Emergency Kill Switch?
                </h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  This will immediately square off all open intraday/positional holdings at market price, cancel pending orders, and lock trading until manually reset.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsKillSwitchConfirmOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={executeKillSwitchSquareOff}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-2xs"
              >
                Square Off All & Lock
              </button>
            </div>
          </div>
        </div>
      )}
      <BrokerConnectModal
        isOpen={isBrokerModalOpen}
        onClose={() => setIsBrokerModalOpen(false)}
        brokerAccount={brokerAccount}
        onSaveBroker={(acc) => {
          setBrokerAccount(acc);
          setAuditLogs((prev) => [
            {
              id: `LOG_${Date.now()}`,
              timestamp: new Date().toLocaleTimeString(),
              eventType: 'BROKER_CONNECT',
              description: `Broker connection updated: ${acc.broker.toUpperCase()} (${acc.isPaperTrading ? 'Paper Sim' : 'Live'}).`,
              severity: 'success',
            },
            ...prev,
          ]);
        }}
      />

      <IpoAllotmentModal
        isOpen={isAllotmentModalOpen}
        onClose={() => setIsAllotmentModalOpen(false)}
        ipos={ipos}
        selectedIpoId={selectedIpoForCheck}
      />

      <OrderConfirmationModal
        isOpen={isConfirmOrderModalOpen}
        onClose={() => setIsConfirmOrderModalOpen(false)}
        orderData={orderToConfirm}
        onConfirmOrder={handleOrderConfirmed}
      />

      <TradingGuideModal
        isOpen={isGuideModalOpen}
        onClose={() => setIsGuideModalOpen(false)}
      />

      <EducationQuizModal
        isOpen={isEducationModalOpen}
        onClose={() => setIsEducationModalOpen(false)}
        onQuizCompleted={(score) => {
          if (score >= 4) {
            setIsRiskCertified(true);
            setAuditLogs((prev) => [
              {
                id: `LOG_${Date.now()}`,
                timestamp: new Date().toLocaleTimeString(),
                eventType: 'RISK_TRIGGERED',
                description: `Trader successfully cleared SEBI Risk Awareness Certification (${score}/5). Verified Risk-Aware status unlocked.`,
                severity: 'success',
              },
              ...prev,
            ]);
          }
        }}
      />
      <KeyboardShortcutsModal
        isOpen={isShortcutsModalOpen}
        onClose={() => setIsShortcutsModalOpen(false)}
        pinnedLabels={tradingModules
          .filter((m) => pinnedTabIds.includes(m.id))
          .map((m) => m.shortLabel)}
      />

      <ExecutiveBriefModal
        isOpen={isExecutiveBriefOpen}
        onClose={() => setIsExecutiveBriefOpen(false)}
        holdings={holdings}
        positions={positions}
        orders={orders}
        brokerAccount={brokerAccount}
        riskSettings={riskSettings}
        onExportSuccess={(msg) => showToast(msg, 'success')}
      />
    </div>
  );
};
