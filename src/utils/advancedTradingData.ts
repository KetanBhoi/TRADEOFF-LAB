import {
  TaxLot,
  TaxHarvestSimulationResult,
  CorporateActionItem,
  PositionSizingInput,
  PositionSizingBreakdown,
  StrategyVersion,
  SectorPerformanceItem,
  MarketBreadthData,
  DrawdownMetrics,
  StressScenarioItem,
  CommunityPost,
  LeaderboardCompetitor,
} from '../types/trading';

// ==========================================
// 1. TAX-LOSS HARVESTING DATA & ENGINE
// ==========================================
export const INITIAL_TAX_LOTS: TaxLot[] = [
  {
    lotId: 'LOT-TM-01',
    symbol: 'TATAMOTORS',
    companyName: 'Tata Motors Limited',
    broker: 'zerodha',
    buyDate: '2024-07-15',
    buyPrice: 1040,
    currentPrice: 818,
    quantity: 40,
    investedAmount: 41600,
    currentValue: 32720,
    unrealizedPnl: -8880,
    unrealizedPnlPercent: -21.35,
    holdingDays: 111,
    isLongTerm: false,
    potentialTaxOffset: 1776, // 20% of 8880 (STCG rate under Finance Act 2024)
    harvestFeasible: true,
    antiStrippingWarning: 'Ensure no re-entry within 30 days if claiming bona fide STCL under Indian tax authority scrutiny.',
  },
  {
    lotId: 'LOT-SWIGGY-02',
    symbol: 'SWIGGY',
    companyName: 'Swiggy Limited',
    broker: 'upstox',
    buyDate: '2024-11-13',
    buyPrice: 422,
    currentPrice: 405,
    quantity: 80,
    investedAmount: 33760,
    currentValue: 32400,
    unrealizedPnl: -1360,
    unrealizedPnlPercent: -4.03,
    holdingDays: 20,
    isLongTerm: false,
    potentialTaxOffset: 272, // 20% of 1360
    harvestFeasible: true,
  },
  {
    lotId: 'LOT-WAAREE-01',
    symbol: 'WAAREE',
    companyName: 'Waaree Energies',
    broker: 'zerodha',
    buyDate: '2024-10-28',
    buyPrice: 1503,
    currentPrice: 2840,
    quantity: 35,
    investedAmount: 52605,
    currentValue: 99400,
    unrealizedPnl: 46795,
    unrealizedPnlPercent: 88.95,
    holdingDays: 36,
    isLongTerm: false,
    potentialTaxOffset: 0,
    harvestFeasible: false,
  },
  {
    lotId: 'LOT-INFY-01',
    symbol: 'INFY',
    companyName: 'Infosys Limited',
    broker: 'angelone',
    buyDate: '2023-08-10',
    buyPrice: 1390,
    currentPrice: 1875,
    quantity: 30,
    investedAmount: 41700,
    currentValue: 56250,
    unrealizedPnl: 14550,
    unrealizedPnlPercent: 34.89,
    holdingDays: 450,
    isLongTerm: true,
    potentialTaxOffset: 0,
    harvestFeasible: false,
  },
  {
    lotId: 'LOT-PREMIER-01',
    symbol: 'PREMIERENE',
    companyName: 'Premier Energies',
    broker: 'paper',
    buyDate: '2024-09-03',
    buyPrice: 990,
    currentPrice: 1145,
    quantity: 25,
    investedAmount: 24750,
    currentValue: 28625,
    unrealizedPnl: 3875,
    unrealizedPnlPercent: 15.66,
    holdingDays: 61,
    isLongTerm: false,
    potentialTaxOffset: 0,
    harvestFeasible: false,
  },
  {
    lotId: 'LOT-BAJAJHFL-02',
    symbol: 'BAJAJHFL',
    companyName: 'Bajaj Housing Finance',
    broker: 'zerodha',
    buyDate: '2024-09-20',
    buyPrice: 165,
    currentPrice: 148,
    quantity: 250,
    investedAmount: 41250,
    currentValue: 37000,
    unrealizedPnl: -4250,
    unrealizedPnlPercent: -10.3,
    holdingDays: 44,
    isLongTerm: false,
    potentialTaxOffset: 850, // 20% of 4250
    harvestFeasible: true,
    antiStrippingWarning: 'Watch out for Section 94(7) dividend stripping or bonus stripping regulations if corporate actions occur.',
  },
];

export function simulateTaxHarvest(
  selectedLotIds: string[],
  currentStcgGains: number = 52030,
  currentLtcgGains: number = 14550
): TaxHarvestSimulationResult {
  const selected = INITIAL_TAX_LOTS.filter((l) => selectedLotIds.includes(l.lotId));
  const harvestableLoss = selected.reduce((sum, l) => sum + Math.abs(Math.min(0, l.unrealizedPnl)), 0);

  // In India (Income Tax Act Section 70):
  // Short-Term Capital Loss (STCL) can be set off against BOTH STCG (20%) and LTCG (12.5%).
  // Long-Term Capital Loss (LTCL) can ONLY be set off against LTCG.
  const offsetStcg = Math.min(currentStcgGains, harvestableLoss);
  const remainingLoss = harvestableLoss - offsetStcg;
  const offsetLtcg = Math.min(currentLtcgGains, remainingLoss);

  // Original Tax (STCG @ 20% + LTCG @ 12.5% exceeding 1.25L exemption):
  const originalStcgTax = currentStcgGains * 0.20;
  const originalLtcgTax = Math.max(0, currentLtcgGains - 125000) * 0.125;
  const originalTotalTax = originalStcgTax + originalLtcgTax;

  const revisedStcgGains = Math.max(0, currentStcgGains - offsetStcg);
  const revisedLtcgGains = Math.max(0, currentLtcgGains - offsetLtcg);

  const revisedStcgTax = revisedStcgGains * 0.20;
  const revisedLtcgTax = Math.max(0, revisedLtcgGains - 125000) * 0.125;
  const revisedTotalTax = revisedStcgTax + revisedLtcgTax;

  const estimatedTaxSaved = Math.round(originalTotalTax - revisedTotalTax);

  return {
    selectedLotIds,
    totalHarvestableLoss: Math.round(harvestableLoss),
    currentStcgGains,
    currentLtcgGains,
    offsetStcg: Math.round(offsetStcg),
    offsetLtcg: Math.round(offsetLtcg),
    estimatedTaxSaved,
    revisedNetTaxPayable: Math.round(revisedTotalTax),
  };
}

// ==========================================
// 2. CORPORATE ACTION TRACKER DATA
// ==========================================
export const INITIAL_CORPORATE_ACTIONS: CorporateActionItem[] = [
  {
    id: 'CA-INFY-DIV-2024',
    symbol: 'INFY',
    companyName: 'Infosys Limited',
    actionType: 'DIVIDEND',
    ratioOrAmount: '₹21.00 per share',
    exDate: '2024-10-29',
    recordDate: '2024-10-29',
    status: 'COMPLETED',
    originalShares: 30,
    adjustedShares: 30,
    originalAvgCost: 1390,
    adjustedAvgCost: 1390,
    payoutOrBenefitAmount: 630, // 30 shares * 21
    explanation: 'Interim Dividend credited directly to linked bank account (subject to TDS @ 10% under Section 194).',
  },
  {
    id: 'CA-TATAMOTORS-DEMERGER',
    symbol: 'TATAMOTORS',
    companyName: 'Tata Motors Limited',
    actionType: 'SPLIT',
    ratioOrAmount: '1:1 Demerger',
    exDate: '2025-02-14',
    recordDate: '2025-02-17',
    status: 'UPCOMING',
    originalShares: 40,
    adjustedShares: 80,
    originalAvgCost: 1040,
    adjustedAvgCost: 520,
    payoutOrBenefitAmount: 0,
    explanation: 'Approved demerger of Commercial Vehicles (CV) and Passenger Vehicles (PV + EV) businesses into two listed entities.',
  },
  {
    id: 'CA-BAJAJHFL-BONUS',
    symbol: 'BAJAJHFL',
    companyName: 'Bajaj Housing Finance',
    actionType: 'BONUS',
    ratioOrAmount: '1:2 Bonus Issue',
    exDate: '2025-01-10',
    recordDate: '2025-01-12',
    status: 'UPCOMING',
    originalShares: 250,
    adjustedShares: 375,
    originalAvgCost: 165,
    adjustedAvgCost: 110,
    payoutOrBenefitAmount: 0,
    explanation: '1 bonus share for every 2 held. Cost basis of original shares is proportionately diluted; bonus shares assigned zero cost basis.',
  },
  {
    id: 'CA-WAAREE-BUYBACK',
    symbol: 'WAAREE',
    companyName: 'Waaree Energies',
    actionType: 'BUYBACK',
    ratioOrAmount: 'Tender Offer ₹3,200',
    exDate: '2025-03-05',
    recordDate: '2025-03-07',
    status: 'UPCOMING',
    originalShares: 35,
    adjustedShares: 30,
    originalAvgCost: 1503,
    adjustedAvgCost: 1503,
    payoutOrBenefitAmount: 16000,
    explanation: 'Proposed share buyback via tender route. Post-Finance Act 2024, buyback proceeds are taxable as dividend income in shareholder hands.',
  },
];

// ==========================================
// 3. POSITION SIZING CALCULATOR ENGINE
// ==========================================
export function calculatePositionSizing(input: PositionSizingInput): PositionSizingBreakdown {
  const { totalCapital, riskPerTradePercent, entryPrice, stopLossPrice, targetPrice, accountType, maxExposureLimitPercent } = input;

  const capitalAtRisk = Math.round((totalCapital * (riskPerTradePercent / 100)) * 100) / 100;
  const stopLossDistance = Math.abs(entryPrice - stopLossPrice);
  const stopLossPercent = entryPrice > 0 ? (stopLossDistance / entryPrice) * 100 : 0;

  let recommendedShares = 0;
  if (stopLossDistance > 0) {
    recommendedShares = Math.floor(capitalAtRisk / stopLossDistance);
  }

  // Position value
  const totalOrderValue = recommendedShares * entryPrice;
  const capitalExposurePercent = totalCapital > 0 ? (totalOrderValue / totalCapital) * 100 : 0;

  // Indian Transaction Friction Estimator (SEBI / NSE / BSE standard rates)
  // Brokerage: ₹20 flat or 0.03% (whichever is lower) for discount brokers
  const rawBrokerage = Math.min(20, totalOrderValue * 0.0003);
  const brokerage = Math.round(rawBrokerage * 2 * 100) / 100; // Round trip

  // STT: 0.1% on both Buy and Sell for Delivery (CNC), 0.025% on Sell for Intraday (MIS)
  const stt = accountType === 'EQUITY_DELIVERY'
    ? Math.round(totalOrderValue * 2 * 0.001 * 100) / 100
    : Math.round(totalOrderValue * 0.00025 * 100) / 100;

  // Exchange turnover charges: NSE 0.00297%
  const exchangeCharges = Math.round(totalOrderValue * 2 * 0.0000297 * 100) / 100;

  // SEBI Turnover fee: ₹10 per Crore (0.0001%)
  const sebiTurnoverFee = Math.round(totalOrderValue * 2 * 0.000001 * 100) / 100;

  // Stamp duty: 0.015% on Buy for Delivery
  const stampDuty = Math.round(totalOrderValue * 0.00015 * 100) / 100;

  // GST: 18% on (Brokerage + Exchange Charges + SEBI fee)
  const gst = Math.round((brokerage + exchangeCharges + sebiTurnoverFee) * 0.18 * 100) / 100;

  const totalCharges = Math.round((brokerage + stt + exchangeCharges + sebiTurnoverFee + stampDuty + gst) * 100) / 100;
  const netRiskIncludingCharges = Math.round((capitalAtRisk + totalCharges) * 100) / 100;

  const potentialProfitDistance = Math.abs(targetPrice - entryPrice);
  const potentialProfitAtTarget = Math.max(0, Math.round((recommendedShares * potentialProfitDistance - totalCharges) * 100) / 100);

  const riskRewardRatio = netRiskIncludingCharges > 0
    ? Math.round((potentialProfitAtTarget / netRiskIncludingCharges) * 10) / 10
    : 0;

  const isExposureExceeded = capitalExposurePercent > maxExposureLimitPercent;
  const isCapitalExceeded = totalOrderValue > totalCapital;

  const warnings: string[] = [];
  if (isExposureExceeded) {
    warnings.push(`Order value (₹${totalOrderValue.toLocaleString('en-IN')}) requires ${capitalExposurePercent.toFixed(1)}% of total capital, exceeding your ${maxExposureLimitPercent}% maximum exposure ceiling.`);
  }
  if (isCapitalExceeded) {
    warnings.push(`Order value exceeds 100% of available account equity (Overleveraged). Reduce risk % or widen stop-loss.`);
  }
  if (stopLossPercent > 10) {
    warnings.push(`Stop-loss distance is ${stopLossPercent.toFixed(1)}% away from entry. Wide stops can result in deep capital impairment if price gaps down.`);
  }
  if (riskRewardRatio < 1.5 && potentialProfitAtTarget > 0) {
    warnings.push(`Risk-to-Reward ratio is ${riskRewardRatio}:1 (below recommended 1.5:1 institutional threshold). The setup may have negative long-term mathematical expectancy after transaction costs.`);
  }

  return {
    capitalAtRisk,
    stopLossDistance: Math.round(stopLossDistance * 100) / 100,
    stopLossPercent: Math.round(stopLossPercent * 10) / 10,
    recommendedShares,
    totalOrderValue,
    capitalExposurePercent: Math.round(capitalExposurePercent * 10) / 10,
    brokerage,
    stt,
    exchangeCharges,
    sebiTurnoverFee,
    stampDuty,
    gst,
    totalCharges,
    netRiskIncludingCharges,
    potentialProfitAtTarget,
    riskRewardRatio,
    isExposureExceeded,
    isCapitalExceeded,
    warnings,
  };
}

// ==========================================
// 4. STRATEGY VERSIONING & AUDIT DATA
// ==========================================
export const INITIAL_STRATEGY_VERSIONS: StrategyVersion[] = [
  {
    id: 'VER-EMA-1.0',
    strategyId: 'strat-ema',
    versionNumber: 'v1.0',
    timestamp: '2024-09-01 09:15:00',
    author: 'Quantitative Desk',
    reasonForChange: 'Baseline production release of dual EMA momentum model on high-volume IPO listings.',
    changeSummary: ['Initialized 9 EMA and 21 EMA crossover parameters', 'Hard stop-loss set to 2.5%', 'Target set to 5.0%'],
    fastPeriod: 9,
    slowPeriod: 21,
    rsiThreshold: 30,
    stopLossPercent: 2.5,
    targetPercent: 5.0,
    capitalPerTrade: 25000,
    metrics: {
      totalTrades: 32,
      winRate: 53.1,
      profitFactor: 1.42,
      sharpeRatio: 1.28,
      maxDrawdownPercent: 6.8,
      totalNetPnl: 14850,
    },
    isCurrent: false,
    isLocked: true,
  },
  {
    id: 'VER-EMA-1.1',
    strategyId: 'strat-ema',
    versionNumber: 'v1.1',
    timestamp: '2024-10-15 14:30:00',
    author: 'Quantitative Desk',
    reasonForChange: 'Post-loss audit: tightened stop-loss to 1.5% after observing prolonged consolidation slip in small-cap entries.',
    changeSummary: ['Reduced stop-loss from 2.5% to 1.5%', 'Maintained 9/21 periods', 'Target revised to 4.0% to lock gains faster'],
    fastPeriod: 9,
    slowPeriod: 21,
    rsiThreshold: 30,
    stopLossPercent: 1.5,
    targetPercent: 4.0,
    capitalPerTrade: 25000,
    metrics: {
      totalTrades: 46,
      winRate: 60.8,
      profitFactor: 1.84,
      sharpeRatio: 1.76,
      maxDrawdownPercent: 4.1,
      totalNetPnl: 28400,
    },
    isCurrent: true,
    isLocked: false,
  },
];

// ==========================================
// 5. SECTOR ROTATION & MARKET BREADTH
// ==========================================
export const INITIAL_SECTOR_PERFORMANCE: SectorPerformanceItem[] = [
  {
    sector: 'Nifty IT',
    indexSymbol: 'NIFTY_IT',
    change1W: 2.4,
    change1M: 5.8,
    change3M: 14.2,
    ytdReturn: 21.6,
    rsi14: 64.2,
    relativeStrengthRank: 1,
    topGainer: 'Infosys (+4.8%)',
    rotationStage: 'LEADING',
  },
  {
    sector: 'Nifty Energy & Solar',
    indexSymbol: 'NIFTY_ENERGY',
    change1W: 1.8,
    change1M: 4.1,
    change3M: 11.5,
    ytdReturn: 28.4,
    rsi14: 61.0,
    relativeStrengthRank: 2,
    topGainer: 'Waaree (+18.2%)',
    rotationStage: 'LEADING',
  },
  {
    sector: 'Nifty Pharma & Healthcare',
    indexSymbol: 'NIFTY_PHARMA',
    change1W: 0.6,
    change1M: 2.2,
    change3M: 8.7,
    ytdReturn: 24.1,
    rsi14: 56.4,
    relativeStrengthRank: 3,
    topGainer: 'Sun Pharma (+3.1%)',
    rotationStage: 'IMPROVING',
  },
  {
    sector: 'Nifty Bank & Financials',
    indexSymbol: 'BANKNIFTY',
    change1W: -0.4,
    change1M: 0.8,
    change3M: 4.2,
    ytdReturn: 12.5,
    rsi14: 51.2,
    relativeStrengthRank: 4,
    topGainer: 'HDFC Bank (+1.4%)',
    rotationStage: 'WEAKENING',
  },
  {
    sector: 'Nifty FMCG',
    indexSymbol: 'NIFTY_FMCG',
    change1W: -1.1,
    change1M: -2.4,
    change3M: 1.1,
    ytdReturn: 8.6,
    rsi14: 43.8,
    relativeStrengthRank: 5,
    topGainer: 'ITC (+0.7%)',
    rotationStage: 'LAGGING',
  },
  {
    sector: 'Nifty Auto',
    indexSymbol: 'NIFTY_AUTO',
    change1W: -2.6,
    change1M: -5.2,
    change3M: -3.8,
    ytdReturn: 18.2,
    rsi14: 39.5,
    relativeStrengthRank: 6,
    topGainer: 'M&M (+0.9%)',
    rotationStage: 'LAGGING',
  },
  {
    sector: 'Nifty Realty',
    indexSymbol: 'NIFTY_REALTY',
    change1W: -1.9,
    change1M: -4.0,
    change3M: -1.5,
    ytdReturn: 26.8,
    rsi14: 44.1,
    relativeStrengthRank: 7,
    topGainer: 'DLF (+1.1%)',
    rotationStage: 'WEAKENING',
  },
  {
    sector: 'Nifty Metal',
    indexSymbol: 'NIFTY_METAL',
    change1W: -0.8,
    change1M: -3.1,
    change3M: -4.6,
    ytdReturn: 9.4,
    rsi14: 42.0,
    relativeStrengthRank: 8,
    topGainer: 'Tata Steel (+0.4%)',
    rotationStage: 'LAGGING',
  },
];

export const INITIAL_MARKET_BREADTH: MarketBreadthData = {
  advances: 298,
  declines: 188,
  unchanged: 14,
  advanceDeclineRatio: 1.59,
  percentAbove50Dma: 61.4,
  percentAbove200Dma: 72.8,
  indiaVix: 14.85,
  indiaVixChange: -0.62,
  indiaVixChangePercent: -4.01,
  vixRegime: 'NORMAL_VOLATILITY',
  vixExplanation: 'India VIX at 14.85 indicates controlled market volatility and calm derivative option pricing. Swings are orderly; mean-reversion strategies exhibit higher stability than during high VIX (>20) regimes.',
  lastUpdated: '03 Nov 2026, 15:30 IST',
};

// ==========================================
// 6. DRAWDOWN & STRESS RISK REPORT
// ==========================================
export const INITIAL_DRAWDOWN_METRICS: DrawdownMetrics = {
  currentDrawdown: -2.8,
  maxDrawdown: -7.2,
  maxDrawdownDate: 'June 04, 2024 (Election Counting Session)',
  recoveryDays: 14,
  annualizedVolatility: 13.8,
  downsideDeviation: 7.4,
  calmarRatio: 3.44,
  var95Historical1D: 7420, // ₹ 7,420 at 95% confidence
  var99Historical1D: 12150, // ₹ 12,150 at 99% confidence
  varConfidenceLevel: 'Historical simulation over 252 trading sessions',
  portfolioBeta: 1.08,
};

export const INITIAL_STRESS_SCENARIOS: StressScenarioItem[] = [
  {
    id: 'STRESS-10',
    eventTitle: 'Moderate Correction: Nifty 50 Dips -10%',
    benchmarkDropPercent: -10.0,
    portfolioSimulatedDropPercent: -10.8, // Beta 1.08
    estimatedLossAmount: 31250,
    survivalCapitalRemaining: 258145,
    keyVulnerability: 'Waaree and Swiggy beta exposure creates slightly steeper swings than broad index.',
  },
  {
    id: 'STRESS-20',
    eventTitle: 'Bear Market Drawdown: Nifty 50 Dips -20%',
    benchmarkDropPercent: -20.0,
    portfolioSimulatedDropPercent: -21.6,
    estimatedLossAmount: 62500,
    survivalCapitalRemaining: 226895,
    keyVulnerability: 'Mid-cap auto and renewables experience liquidity contraction; stops must be actively enforced.',
  },
  {
    id: 'STRESS-30',
    eventTitle: 'Macro Shock / Black Swan: Nifty 50 Dips -30%',
    benchmarkDropPercent: -30.0,
    portfolioSimulatedDropPercent: -32.4,
    estimatedLossAmount: 93750,
    survivalCapitalRemaining: 195645,
    keyVulnerability: 'Systemic liquidity freeze. Kill switch protocol prevents portfolio wipeout beyond ₹15,000 daily boundary.',
  },
];

// ==========================================
// 7. COMMUNITY DISCUSSION WITH MODERATION
// ==========================================
export const INITIAL_COMMUNITY_POSTS: CommunityPost[] = [
  {
    id: 'POST-01',
    symbol: 'TATAMOTORS',
    companyName: 'Tata Motors Limited',
    authorName: 'Rohan Mehta, CMT',
    authorHandle: '@rohan_quant',
    reputationScore: 94,
    isTradeVerified: true,
    verifiedHoldingInfo: 'Verified Holder: 40 shares @ ₹1,040 (Held 111 days)',
    timestamp: '2 hours ago',
    content: 'Demerger record date likely in Q4. Commercial vehicles segment cash flow remains robust despite short-term margin compression from EV discounting. Looking at tax-loss harvesting now and re-accumulating post ex-date.',
    upvotes: 38,
    moderationFlags: ['NONE'],
  },
  {
    id: 'POST-02',
    symbol: 'WAAREE',
    companyName: 'Waaree Energies',
    authorName: 'Priya Sundaram',
    authorHandle: '@priya_invests',
    reputationScore: 88,
    isTradeVerified: true,
    verifiedHoldingInfo: 'Verified Holder: 35 shares @ ₹1,503 (Allotted IPO)',
    timestamp: '4 hours ago',
    content: 'US tariff developments need close tracking for Waaree exports, but domestic solar capacity utilization is running at 92%. Healthy order book visibility for next 18 months.',
    upvotes: 52,
    moderationFlags: ['NONE'],
  },
  {
    id: 'POST-03',
    symbol: 'SWIGGY',
    companyName: 'Swiggy Limited',
    authorName: 'MarketGuru99',
    authorHandle: '@rocket_calls_india',
    reputationScore: 18,
    isTradeVerified: false,
    timestamp: '5 hours ago',
    content: 'BUY IMMEDIATELY! 100% GUARANTEED 5X MULTIBAGGER RETURN BY NEXT MONTH! JOIN PRIVATE TELEGRAM FOR SURE-SHOT INTRADAY JACKPOT CALLS!',
    upvotes: 2,
    moderationFlags: ['PUMP_AND_DUMP_WARNING', 'GUARANTEED_RETURN_CLAIM', 'UNSOLICITED_TIPSTER'],
    moderationActionNotice: 'AUTOMATICALLY FLAGGED: Post triggered SEBI anti-tipster filter (guaranteed returns, external messaging soliciting unauthorized investment advisory). Hidden from general feed.',
  },
  {
    id: 'POST-04',
    symbol: 'INFY',
    companyName: 'Infosys Limited',
    authorName: 'Kavita Chawla',
    authorHandle: '@kavita_tech',
    reputationScore: 91,
    isTradeVerified: true,
    verifiedHoldingInfo: 'Verified Holder: 30 shares @ ₹1,390 (Held 450 days)',
    timestamp: 'Yesterday',
    content: 'Decent BFSI turnaround in North America bookings. Operating margins expanded by 40 bps. Holding for steady dividend compounding and long-term capital preservation.',
    upvotes: 27,
    moderationFlags: ['NONE'],
  },
];

// ==========================================
// 8. PAPER TRADING LEADERBOARD DATA
// ==========================================
export const INITIAL_LEADERBOARD: LeaderboardCompetitor[] = [
  {
    rank: 1,
    traderName: 'Aarav Sharma',
    avatar: 'AS',
    startingCapital: 500000,
    currentEquity: 584200,
    returnPercent: 16.84,
    sharpeRatio: 2.45,
    maxDrawdownPercent: 3.2,
    winRate: 68.2,
    tradeCount: 44,
    badges: ['Sharpe Master', 'Zero Margin Call', 'Disciplined Sizing'],
    isCurrentUser: false,
  },
  {
    rank: 2,
    traderName: 'You (Your Account)',
    avatar: 'YOU',
    startingCapital: 500000,
    currentEquity: 562450,
    returnPercent: 12.49,
    sharpeRatio: 1.84,
    maxDrawdownPercent: 4.1,
    winRate: 60.8,
    tradeCount: 38,
    badges: ['Risk Certified', 'SEBI Aware', 'Low Drawdown'],
    isCurrentUser: true,
  },
  {
    rank: 3,
    traderName: 'Neha Verma',
    avatar: 'NV',
    startingCapital: 500000,
    currentEquity: 558900,
    returnPercent: 11.78,
    sharpeRatio: 1.72,
    maxDrawdownPercent: 5.4,
    winRate: 58.3,
    tradeCount: 52,
    badges: ['Consistent Scalper', 'Stop-Loss Enforcer'],
    isCurrentUser: false,
  },
  {
    rank: 4,
    traderName: 'Vikram Joshi',
    avatar: 'VJ',
    startingCapital: 500000,
    currentEquity: 574300,
    returnPercent: 14.86,
    sharpeRatio: 1.48, // Lower Sharpe due to higher drawdown
    maxDrawdownPercent: 9.8,
    winRate: 51.0,
    tradeCount: 88,
    badges: ['High Volume', 'Trend Follower'],
    isCurrentUser: false,
  },
  {
    rank: 5,
    traderName: 'Sunil Deshmukh',
    avatar: 'SD',
    startingCapital: 500000,
    currentEquity: 531200,
    returnPercent: 6.24,
    sharpeRatio: 1.15,
    maxDrawdownPercent: 6.2,
    winRate: 54.5,
    tradeCount: 22,
    badges: ['Patient Accumulator'],
    isCurrentUser: false,
  },
];
