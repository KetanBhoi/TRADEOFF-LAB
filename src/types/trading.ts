/**
 * Comprehensive Data Types for IPO Tracker & Live Trading Engine
 */

export type IpoStatus = 'upcoming' | 'open' | 'closed' | 'listed';
export type BrokerType = 'paper' | 'zerodha' | 'upstox' | 'angelone';
export type OrderSide = 'BUY' | 'SELL';
export type OrderType = 'MARKET' | 'LIMIT' | 'SL_M';
export type OrderProduct = 'MIS' | 'CNC';
export type OrderStatus = 'PENDING' | 'EXECUTED' | 'REJECTED' | 'CANCELLED';

export interface IpoItem {
  id: string;
  symbol: string;
  companyName: string;
  sector: string;
  priceBandMin: number;
  priceBandMax: number;
  issueSizeCr: number; // In Crores INR
  lotSize: number;     // e.g. 35 shares
  retailQuotaPercent: number; // e.g. 35%
  openDate: string;
  closeDate: string;
  listingDate: string;
  status: IpoStatus;
  subscriptionQib: number;
  subscriptionNii: number;
  subscriptionRetail: number;
  totalSubscription: number;
  gmpPrice: number;       // Grey market premium in ₹
  gmpPercent: number;     // GMP %
  issuePrice: number;     // Final issue price (if determined)
  listingPrice?: number;  // Actual listing day open
  currentPrice?: number;  // Current market price
  listingGainPercent?: number;
  registrar: string;
  exchange: 'NSE / BSE' | 'BSE' | 'NSE';
  description: string;
  leadManagers: string[];
}

export interface IpoAllotmentCheckResult {
  applicationNumber: string;
  panNumber: string;
  companyName: string;
  appliedLots: number;
  appliedShares: number;
  allottedShares: number;
  status: 'ALLOTTED' | 'NOT_ALLOTTED' | 'UNDER_PROCESS';
  refundAmount: number;
  bankRefNumber: string;
}

export interface LiveMarketQuote {
  symbol: string;
  name: string;
  lastPrice: number;
  change: number;
  changePercent: number;
  open: number;
  high: number;
  low: number;
  previousClose: number;
  volume: number;
  bidPrice: number;
  askPrice: number;
  vwap: number;
  historicalCandles: { time: string; open: number; high: number; low: number; close: number; volume: number }[];
}

export interface BrokerAccount {
  broker: BrokerType;
  isConnected: boolean;
  apiKey: string;
  clientCode: string;
  lastSyncTime?: string;
  isPaperTrading: boolean;
}

export interface TradingOrder {
  id: string;
  symbol: string;
  side: OrderSide;
  type: OrderType;
  product: OrderProduct;
  quantity: number;
  price: number;
  triggerPrice?: number;
  status: OrderStatus;
  timestamp: string;
  executionPrice?: number;
  brokerage: number;
  stt: number;
  gst: number;
  totalCharges: number;
  rejectionReason?: string;
}

export interface TradingPosition {
  symbol: string;
  side: OrderSide;
  quantity: number;
  buyAvgPrice: number;
  currentPrice: number;
  pnl: number;
  pnlPercent: number;
  product: OrderProduct;
  stopLossPrice: number;
  targetPrice: number;
  unrealizedPnl: number;
}

export interface TradingHolding {
  symbol: string;
  companyName: string;
  quantity: number;
  buyAvgPrice: number;
  currentPrice: number;
  investedValue: number;
  currentValue: number;
  totalPnl: number;
  totalPnlPercent: number;
  dayChangePercent: number;
  broker: BrokerType;
  sector: string;
  marketCapCategory: 'Large Cap' | 'Mid Cap' | 'Small Cap';
  purchaseDate: string;
  holdingDays: number;
  isLongTerm: boolean; // holdingDays > 365
}

export interface ConcentrationAlert {
  type: 'STOCK_OVERWEIGHT' | 'SECTOR_OVERWEIGHT';
  title: string;
  entityName: string;
  currentWeightPercent: number;
  thresholdPercent: number;
  severity: 'warning' | 'danger';
}

export interface TaxSummary {
  stcgTotalGains: number;
  stcgTaxPayable: number; // 20% flat under current Finance Act equity provisions
  ltcgTotalGains: number;
  ltcgExemptionLimit: number; // ₹1,25,000 threshold
  ltcgTaxableAmount: number;
  ltcgTaxPayable: number; // 12.5% on gains exceeding ₹1.25L
  totalEstimatedTax: number;
  effectiveTaxRatePercent: number;
  disclaimer: string;
}

export interface PortfolioHealthMetrics {
  totalInvested: number;
  totalCurrentValue: number;
  totalUnrealizedPnl: number;
  totalPnlPercent: number;
  diversificationScore: number; // 0 - 100
  diversificationRating: 'EXCELLENT' | 'GOOD' | 'CONCENTRATED' | 'HIGH_RISK';
  sectorAllocations: { sector: string; value: number; percent: number; color: string }[];
  marketCapAllocations: { category: 'Large Cap' | 'Mid Cap' | 'Small Cap'; value: number; percent: number; color: string }[];
  brokerAllocations: { broker: BrokerType; value: number; percent: number }[];
  concentrationAlerts: ConcentrationAlert[];
  taxSummary: TaxSummary;
}

export interface MarketNewsItem {
  id: string;
  headline: string;
  source: 'NSE Corporate Filing' | 'BSE Announcement' | 'Exchange Circular' | 'RBI MPC Statement' | 'Earnings Release';
  timestamp: string;
  date: string;
  category: 'FILING' | 'EARNINGS' | 'RBI_POLICY' | 'DIVIDEND' | 'CORP_ACTION';
  affectedSymbols: string[];
  sentiment: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  filingSummary: string;
  filingDocId: string;
  filingType: string;
}

export interface CorporateResultItem {
  id: string;
  symbol: string;
  companyName: string;
  quarter: string;
  reportDate: string;
  isReported: boolean;
  consensusRevenueCr: number;
  actualRevenueCr?: number;
  consensusEps: number;
  actualEps?: number;
  revenueSurprisePercent?: number;
  epsSurprisePercent?: number;
  guidanceVerdict?: 'STRONG_BEAT' | 'IN_LINE' | 'MISS' | 'PENDING';
}

export interface RbiEventItem {
  id: string;
  title: string;
  date: string;
  time: string;
  currentRepoRatePercent: number;
  expectedConsensus: string;
  impactAssessment: string;
}

export interface ScreenerStock {
  symbol: string;
  companyName: string;
  sector: string;
  marketCapCategory: 'Large Cap' | 'Mid Cap' | 'Small Cap';
  marketCapCr: number;
  currentPrice: number;
  peRatio: number;
  pbRatio: number;
  debtToEquity: number;
  revenueGrowthYoYPercent: number;
  profitGrowthYoYPercent: number;
  promoterHoldingPercent: number;
  promoterHoldingChangePercent: number;
  roePercent: number;
  operatingMarginPercent: number;
  dividendYieldPercent: number;
  dataDate: string; // e.g. "Q2 FY25 (Sep 2024)"
}

export interface ScreenerFilterCriteria {
  minPe: number;
  maxPe: number;
  maxDebtToEquity: number;
  minRevenueGrowth: number;
  minPromoterChange: number;
  sectorFilter: string;
  marketCapFilter: string;
}

export interface SavedScreen {
  id: string;
  name: string;
  description: string;
  criteria: ScreenerFilterCriteria;
  matchCount?: number;
}

export type BehavioralEmotionTag =
  | 'DISCIPLINED_SETUP'
  | 'CHASED_PRICE_FOMO'
  | 'PANIC_EXIT'
  | 'REVENGE_TRADE'
  | 'OVER_LEVERAGED'
  | 'EARLY_PROFIT_TAKE'
  | 'IGNORED_STOP_LOSS';

export interface TradeJournalEntry {
  id: string;
  tradeDate: string;
  symbol: string;
  side: OrderSide;
  quantity: number;
  entryPrice: number;
  exitPrice: number;
  holdingPeriodDays: number;
  grossPnl: number;
  charges: number;
  netPnl: number;
  returnPercent: number;
  setupReason: string;
  expectedTarget: number;
  stopLossUsed: number;
  emotionalTags: BehavioralEmotionTag[];
  outcomeVerdict: 'EXECUTED_AS_PLANNED' | 'DISCIPLINE_LAPSE' | 'CUT_EARLY' | 'GREED_HOLD';
  lessonsLearned: string;
}

export interface BlackoutSchedule {
  id: string;
  title: string;
  type: 'RBI_MPC' | 'BUDGET_DAY' | 'EARNINGS_ANNOUNCEMENT' | 'CUSTOM';
  startTime: string;
  endTime: string;
  isActive: boolean;
  notes: string;
}

export interface CoolingOffSettings {
  isCoolingOffActive: boolean;
  orderThresholdAmount: number; // e.g. ₹50,000
  coolingOffMinutes: number; // e.g. 30 mins
  dailyMaxTrades: number; // e.g. 5 trades/day
  todayTradesCount: number;
  consecutiveLossCount: number;
  consecutiveLossThreshold: number; // e.g. 3 losses
  isStreakCoolingOffTriggered: boolean;
  blackoutSchedules: BlackoutSchedule[];
}

export interface BenchmarkMetrics {
  portfolioReturnPercent: number;
  nifty50ReturnPercent: number;
  nifty500ReturnPercent: number;
  sharpeRatio: number;
  sortinoRatio: number;
  portfolioBeta: number;
  portfolioAlpha: number;
  maxDrawdown: number;
  nifty50Drawdown: number;
  comparisonTimeline: { date: string; portfolio: number; nifty50: number; nifty500: number }[];
}

export interface WhatIfScenario {
  id: string;
  title: string;
  eventDescription: string;
  historicalDate: string;
  asset: string;
  initialPrice: number;
  troughPrice: number;
  recoveryPrice: number;
  strategyOptions: {
    name: string;
    action: string;
    outcomePnlPercent: number;
    drawdownMaxPercent: number;
    takeaway: string;
  }[];
}

export interface RiskQuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
}

export interface StrategyConfig {
  id: string;
  name: string;
  type: 'ema_crossover' | 'rsi_reversal' | 'vwap_breakout' | 'ipo_momentum';
  description: string;
  symbol: string;
  fastPeriod: number;
  slowPeriod: number;
  rsiThreshold: number;
  stopLossPercent: number;
  targetPercent: number;
  capitalPerTrade: number;
  status: 'ACTIVE' | 'PAUSED' | 'BACKTEST_ONLY';
}

export interface BacktestTrade {
  entryTime: string;
  exitTime: string;
  side: OrderSide;
  entryPrice: number;
  exitPrice: number;
  quantity: number;
  grossPnl: number;
  charges: number;
  netPnl: number;
  returnPercent: number;
  exitReason: 'TARGET' | 'STOP_LOSS' | 'SIGNAL_REVERSAL' | 'EOD_SQUAREOFF';
}

export interface BacktestResult {
  strategyName: string;
  symbol: string;
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  winRate: number; // percentage
  profitFactor: number;
  totalNetPnl: number;
  totalCharges: number;
  maxDrawdown: number; // percentage
  maxDrawdownAmount: number;
  sharpeRatio: number;
  expectancyRatio: number;
  trades: BacktestTrade[];
  equityCurve: { date: string; equity: number; drawdown: number }[];
}

export interface RiskManagementSettings {
  maxRiskPerTradePercent: number; // e.g. 1.5%
  dailyLossLimit: number;         // e.g. ₹5,000
  maxCapitalExposurePercent: number; // e.g. 25% on single symbol
  isKillSwitchEngaged: boolean;
  dailyRealizedPnl: number;
  isTradingHaltedForDay: boolean;
}

export interface TradingAuditLog {
  id: string;
  timestamp: string;
  eventType: 'ORDER_SUBMITTED' | 'ORDER_EXECUTED' | 'ORDER_REJECTED' | 'RISK_TRIGGERED' | 'KILL_SWITCH' | 'BROKER_CONNECT';
  symbol?: string;
  description: string;
  severity: 'info' | 'warning' | 'danger' | 'success';
}

// 1. Tax-Loss Harvesting Planner
export interface TaxLot {
  lotId: string;
  symbol: string;
  companyName: string;
  broker: BrokerType;
  buyDate: string;
  buyPrice: number;
  currentPrice: number;
  quantity: number;
  investedAmount: number;
  currentValue: number;
  unrealizedPnl: number;
  unrealizedPnlPercent: number;
  holdingDays: number;
  isLongTerm: boolean; // > 365 days for Indian equities
  potentialTaxOffset: number; // Potential tax saved if harvested against STCG (20%) or LTCG (12.5%)
  harvestFeasible: boolean; // true if in loss
  antiStrippingWarning?: string;
}

export interface TaxHarvestSimulationResult {
  selectedLotIds: string[];
  totalHarvestableLoss: number;
  currentStcgGains: number;
  currentLtcgGains: number;
  offsetStcg: number;
  offsetLtcg: number;
  estimatedTaxSaved: number;
  revisedNetTaxPayable: number;
}

// 2. Corporate Action Tracker
export type CorporateActionType = 'DIVIDEND' | 'BONUS' | 'SPLIT' | 'RIGHTS' | 'BUYBACK';

export interface CorporateActionItem {
  id: string;
  symbol: string;
  companyName: string;
  actionType: CorporateActionType;
  ratioOrAmount: string;
  exDate: string;
  recordDate: string;
  status: 'UPCOMING' | 'EX_DATE_PASSED' | 'COMPLETED';
  originalShares: number;
  adjustedShares: number;
  originalAvgCost: number;
  adjustedAvgCost: number;
  payoutOrBenefitAmount: number;
  explanation: string;
}

// 3. Position Sizing Calculator
export interface PositionSizingInput {
  totalCapital: number;
  riskPerTradePercent: number; // e.g. 1.0%
  entryPrice: number;
  stopLossPrice: number;
  targetPrice: number;
  accountType: 'EQUITY_DELIVERY' | 'EQUITY_INTRADAY';
  maxExposureLimitPercent: number; // e.g. 20%
}

export interface PositionSizingBreakdown {
  capitalAtRisk: number;
  stopLossDistance: number;
  stopLossPercent: number;
  recommendedShares: number;
  totalOrderValue: number;
  capitalExposurePercent: number;
  brokerage: number;
  stt: number;
  exchangeCharges: number;
  sebiTurnoverFee: number;
  stampDuty: number;
  gst: number;
  totalCharges: number;
  netRiskIncludingCharges: number;
  potentialProfitAtTarget: number;
  riskRewardRatio: number;
  isExposureExceeded: boolean;
  isCapitalExceeded: boolean;
  warnings: string[];
}

// 4. Strategy Versioning and Audit
export interface StrategyVersion {
  id: string;
  strategyId: string;
  versionNumber: string; // e.g. 'v1.0', 'v1.1'
  timestamp: string;
  author: string;
  reasonForChange: string;
  changeSummary: string[];
  fastPeriod: number;
  slowPeriod: number;
  rsiThreshold: number;
  stopLossPercent: number;
  targetPercent: number;
  capitalPerTrade: number;
  metrics: {
    totalTrades: number;
    winRate: number;
    profitFactor: number;
    sharpeRatio: number;
    maxDrawdownPercent: number;
    totalNetPnl: number;
  };
  isCurrent: boolean;
  isLocked: boolean; // Immutable once executed on live/paper
}

// 5. Sector Rotation and Market Breadth
export interface SectorPerformanceItem {
  sector: string;
  indexSymbol: string;
  change1W: number;
  change1M: number;
  change3M: number;
  ytdReturn: number;
  rsi14: number;
  relativeStrengthRank: number; // 1 to 8
  topGainer: string;
  rotationStage: 'LEADING' | 'WEAKENING' | 'LAGGING' | 'IMPROVING';
}

export interface MarketBreadthData {
  advances: number;
  declines: number;
  unchanged: number;
  advanceDeclineRatio: number;
  percentAbove50Dma: number;
  percentAbove200Dma: number;
  indiaVix: number;
  indiaVixChange: number;
  indiaVixChangePercent: number;
  vixRegime: 'LOW_COMPLACENCY' | 'NORMAL_VOLATILITY' | 'HIGH_ALERT' | 'EXTREME_PANIC';
  vixExplanation: string;
  lastUpdated: string;
}

// 6. Drawdown and Risk Report
export interface DrawdownMetrics {
  currentDrawdown: number;
  maxDrawdown: number;
  maxDrawdownDate: string;
  recoveryDays: number;
  annualizedVolatility: number;
  downsideDeviation: number;
  calmarRatio: number;
  var95Historical1D: number; // 1-day 95% Value at Risk (₹)
  var99Historical1D: number; // 1-day 99% Value at Risk (₹)
  varConfidenceLevel: string;
  portfolioBeta: number;
}

export interface StressScenarioItem {
  id: string;
  eventTitle: string;
  benchmarkDropPercent: number;
  portfolioSimulatedDropPercent: number;
  estimatedLossAmount: number;
  survivalCapitalRemaining: number;
  keyVulnerability: string;
}

// 7. Community Discussion with Moderation
export interface CommunityPost {
  id: string;
  symbol: string;
  companyName: string;
  authorName: string;
  authorHandle: string;
  reputationScore: number; // 0 to 100 based on verified holding days & trade accuracy
  isTradeVerified: boolean;
  verifiedHoldingInfo?: string;
  timestamp: string;
  content: string;
  upvotes: number;
  hasUserUpvoted?: boolean;
  moderationFlags: ('NONE' | 'PUMP_AND_DUMP_WARNING' | 'GUARANTEED_RETURN_CLAIM' | 'UNSOLICITED_TIPSTER')[];
  moderationActionNotice?: string;
}

// 8. Paper Trading Leaderboard
export interface LeaderboardCompetitor {
  rank: number;
  traderName: string;
  avatar: string;
  startingCapital: number;
  currentEquity: number;
  returnPercent: number;
  sharpeRatio: number;
  maxDrawdownPercent: number;
  winRate: number;
  tradeCount: number;
  badges: string[];
  isCurrentUser: boolean;
}

// 9. Options Strategy Payoff & Greeks Visualizer
export type OptionType = 'CE' | 'PE';
export type OptionSide = 'BUY' | 'SELL';

export interface OptionLeg {
  id: string;
  side: OptionSide;
  type: OptionType;
  strike: number;
  lots: number;
  premium: number;
}

export interface OptionStrategyPreset {
  id: string;
  name: string;
  outlook: 'BULLISH' | 'BEARISH' | 'NEUTRAL' | 'VOLATILE';
  description: string;
  underlying: string;
  spotPrice: number;
  lotSize: number;
  ivPercent: number;
  daysToExpiry: number;
  legs: OptionLeg[];
}

export interface OptionsPayoffAnalysis {
  payoffCurve: {
    spot: number;
    expiryPnl: number;
    t0Pnl: number;
    ivCrushPnl: number;
  }[];
  maxProfit: number | 'UNLIMITED';
  maxLoss: number | 'UNLIMITED';
  breakevens: number[];
  netPremiumFlow: number; // positive = net credit, negative = net debit
  estimatedMargin: number;
  greeks: {
    delta: number;
    gamma: number;
    thetaPerDay: number; // in ₹ per day
    vegaPer1Pct: number; // in ₹ per 1% IV change
  };
}

// 10. Smart Portfolio Rebalancing & Cash Inflow Engine
export type RebalanceMode = 'CASH_INFLOW_ONLY' | 'TAX_OPTIMIZED_FULL';

export interface AllocationTarget {
  bucket: string;
  currentValue: number;
  currentPercent: number;
  targetPercent: number;
  driftPercent: number;
  action: 'BUY' | 'SELL' | 'HOLD';
  recommendedAmount: number;
  taxImpactEstimate: number;
  rationale: string;
}

export interface RebalancePlanResult {
  totalCurrentValue: number;
  freshCashDeployed: number;
  postRebalanceTotal: number;
  allocations: AllocationTarget[];
  totalTaxEstimated: number;
  driftAlertsCount: number;
  maxDriftPercent: number;
}

// 11. FIRE & Wealth Goal Projection Simulator
export interface FireGoalMilestone {
  id: string;
  name: string;
  targetAmountToday: number;
  yearsAway: number;
  priority: 'ESSENTIAL' | 'ASPIRATIONAL';
}

export interface FireSimulationInput {
  currentCorpus: number;
  monthlySip: number;
  annualStepUpPercent: number;
  expectedCagrPercent: number;
  annualVolatilityPercent: number;
  inflationPercent: number;
  annualExpenseToday: number;
  safeWithdrawalRate: number;
  yearsToSimulate: number;
}

export interface FireProjectionPoint {
  year: number;
  ageOffset: number;
  p10RealCorpus: number;
  p50RealCorpus: number;
  p90RealCorpus: number;
  p50NominalCorpus: number;
  fireTargetReal: number;
  investedPrincipal: number;
}

export interface FireSimulationOutput {
  fireNumberToday: number;
  fireNumberAtHorizon: number;
  medianProjectedRealCorpus: number;
  probabilityOfSuccess: number;
  yearsToFireMedian: number | null;
  sustainableMonthlyWithdrawalToday: number;
  trajectory: FireProjectionPoint[];
}

// 12. Mutual Fund XIRR, TER Drag & Portfolio Overlap Analyzer
export interface FundConstituentWeight {
  symbol: string;
  weightPercent: number;
}

export interface MutualFundHolding {
  id: string;
  fundName: string;
  amc: string;
  category: 'Flexi Cap' | 'Large Cap Index' | 'Mid Cap' | 'Small Cap' | 'ELSS Tax Saver';
  planType: 'DIRECT' | 'REGULAR';
  expenseRatioPercent: number;
  directEquivalentTerPercent: number;
  investedAmount: number;
  currentValue: number;
  xirrPercent: number;
  monthlySip: number;
  topHoldings: FundConstituentWeight[];
}

export interface XirrCashflow {
  id: string;
  date: string; // YYYY-MM-DD
  amount: number; // negative = outflow (investment), positive = inflow (redemption/valuation)
  label: string;
}

export interface FundOverlapPair {
  fundA: string;
  fundB: string;
  overlapPercent: number;
  commonStocks: { symbol: string; minWeight: number }[];
}

// 13. FII / DII Institutional Flows & Derivatives Positioning
export interface FiiDiiDailyFlow {
  date: string;
  fiiNetCr: number;
  diiNetCr: number;
  combinedNetCr: number;
  niftyClose: number;
  niftyChangePercent: number;
}

export interface DerivativesSentimentSnapshot {
  date: string;
  fiiIndexFutureLongPercent: number;
  fiiIndexFutureShortPercent: number;
  niftyPcr: number;
  indiaVix: number;
  retailLongSharePercent: number;
  regimeLabel: string;
  regimeSummary: string;
}

// 14. Live Price Alert Rules & Pre-Market Checklist
export type AlertConditionType = 'ABOVE' | 'BELOW';

export interface LivePriceAlertRule {
  id: string;
  symbol: string;
  condition: AlertConditionType;
  targetPrice: number;
  note: string;
  isActive: boolean;
  isTriggered: boolean;
  triggeredAt?: string;
  createdAt: string;
}

export interface MorningChecklistItem {
  id: string;
  category: 'MACRO_CUES' | 'RISK_PREP' | 'EXECUTION_RULES';
  title: string;
  detail: string;
  checked: boolean;
}

// 15. Passive Dividend Calendar & Yield-on-Cost Tracker
export interface DividendPayoutSchedule {
  symbol: string;
  companyName: string;
  annualDps: number; // ₹ per share total annual dividend
  dividendYieldPercent: number;
  payoutMonths: number[]; // 1..12
  nextExDate: string;
  payoutType: 'Interim' | 'Final' | 'Special';
  fiveYearDpsCagrPercent: number;
}

// 16. Demat Collateral Pledge, Haircut & 50:50 Cash Rule Optimizer
export interface PledgeableAssetItem {
  symbol: string;
  companyName: string;
  quantity: number;
  currentValue: number;
  haircutPercent: number;
  collateralValue: number;
  assetClass: 'EQUITY_NON_CASH' | 'CASH_EQUIVALENT';
  isPledged: boolean;
}

// 17. Broker Contract Note & Statutory Charge Breakeven Auditor
export type BrokerageSegment = 'EQUITY_DELIVERY' | 'EQUITY_INTRADAY' | 'EQUITY_FUTURES' | 'EQUITY_OPTIONS';

export interface ContractNoteChargeBreakdown {
  buyTurnover: number;
  sellTurnover: number;
  totalTurnover: number;
  grossPnl: number;
  brokerage: number;
  stt: number;
  exchangeTxCharge: number;
  sebiTurnoverFee: number;
  stampDuty: number;
  dpCharge: number;
  gst: number;
  totalCharges: number;
  netPnl: number;
  breakevenPointsPerUnit: number;
  breakevenMovePercent: number;
}

// 18. ITR-2 / ITR-3 Capital Gains & Advance Tax Quarter Estimator
export interface AdvanceTaxInstallment {
  quarter: 'Q1 (Jun 15)' | 'Q2 (Sep 15)' | 'Q3 (Dec 15)' | 'Q4 (Mar 15)';
  dueDate: string;
  cumulativePercentRequired: number;
  cumulativeTaxDue: number;
  estimatedShortfall: number;
  sec234cPenaltyEstimate: number;
  status: 'PAID_OK' | 'DUE_SOON' | 'SHORTFALL';
}

// 19. NSE Options Chain & Open Interest (OI) Wall
export type OptionChainIndexId = 'NIFTY' | 'BANKNIFTY' | 'FINNIFTY';

export interface OptionChainStrikeRow {
  strike: number;
  callOI: number;
  callChgOI: number;
  callLtp: number;
  callIv: number;
  putOI: number;
  putChgOI: number;
  putLtp: number;
  putIv: number;
  isAtm: boolean;
}

export interface OptionChainInjectedLeg {
  indexId: OptionChainIndexId;
  spotPrice: number;
  lotSize: number;
  side: OptionSide;
  type: OptionType;
  strike: number;
  premium: number;
}

// 20. Promoter Shareholding, Pledge & SAST Insider Radar
export interface ShareholdingSnapshot {
  symbol: string;
  companyName: string;
  quarter: string;
  promoterPercent: number;
  prevPromoterPercent: number;
  pledgedPercent: number;
  prevPledgedPercent: number;
  fiiPercent: number;
  diiPercent: number;
  publicPercent: number;
}

export interface BulkInsiderDeal {
  id: string;
  date: string;
  symbol: string;
  clientName: string;
  category: 'PROMOTER_SAST' | 'BULK_DEAL' | 'BLOCK_DEAL' | 'FII_DESK';
  action: 'ACQUISITION' | 'DISPOSAL';
  quantity: number;
  avgPrice: number;
  valueCr: number;
  rationaleNote: string;
}

// 21. Technical Chart & Pattern Desk
export interface EnrichedTechnicalPoint {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  ema9: number;
  ema21: number;
  vwap: number;
  bbUpper: number;
  bbLower: number;
  rsi14: number;
}

export interface TechnicalSetupSummary {
  symbol: string;
  patternLabel: string;
  bias: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  supportLevel: number;
  resistanceLevel: number;
  suggestedStopLoss: number;
  suggestedTarget: number;
  rsi14: number;
  ema9: number;
  ema21: number;
  vwap: number;
}

// 22. Stock Basket & GTT OCO Builder
export interface EquityBasketConstituent {
  symbol: string;
  weightPercent: number;
}

export interface EquityBasketTemplate {
  id: string;
  name: string;
  theme: string;
  description: string;
  minInvestment: number;
  cagr3YPercent: number;
  riskTag: 'Moderate' | 'High Beta' | 'Core Compounder';
  constituents: EquityBasketConstituent[];
}

export interface GttOcoRule {
  id: string;
  symbol: string;
  quantity: number;
  referencePrice: number;
  triggerTargetPrice: number;
  triggerStopPrice: number;
  isActive: boolean;
  createdAt: string;
}

// 23. Gold, SGB & Fixed-Income Debt Ladder
export interface FixedIncomeInstrument {
  id: string;
  name: string;
  category: 'SGB' | 'T_BILL_GSEC' | 'FD' | 'ARBITRAGE_MF' | 'CORP_BOND';
  preTaxYieldPercent: number;
  tenorLabel: string;
  taxTreatment: string;
  effectiveTaxMultiplier: (marginalSlabPercent: number) => number;
  liquidityNote: string;
  ratingOrSovereign: string;
}


