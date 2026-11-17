import {
  MutualFundHolding,
  FundOverlapPair,
  XirrCashflow,
  FiiDiiDailyFlow,
  DerivativesSentimentSnapshot,
  LivePriceAlertRule,
  MorningChecklistItem,
  TradingHolding,
} from '../types/trading';

export const INITIAL_MUTUAL_FUNDS: MutualFundHolding[] = [
  {
    id: 'mf-ppfcf',
    fundName: 'Parag Parikh Flexi Cap Fund',
    amc: 'PPFAS Mutual Fund',
    category: 'Flexi Cap',
    planType: 'DIRECT',
    expenseRatioPercent: 0.63,
    directEquivalentTerPercent: 0.63,
    investedAmount: 240000,
    currentValue: 318500,
    xirrPercent: 21.4,
    monthlySip: 10000,
    topHoldings: [
      { symbol: 'HDFCBANK', weightPercent: 8.4 },
      { symbol: 'TCS', weightPercent: 6.1 },
      { symbol: 'INFY', weightPercent: 4.8 },
      { symbol: 'ICICIBANK', weightPercent: 5.3 },
      { symbol: 'COALINDIA', weightPercent: 5.9 },
      { symbol: 'TATAMOTORS', weightPercent: 4.2 },
      { symbol: 'ITC', weightPercent: 4.9 },
      { symbol: 'POWERGRID', weightPercent: 6.2 },
    ],
  },
  {
    id: 'mf-nifty50',
    fundName: 'UTI Nifty 50 Index Fund',
    amc: 'UTI Mutual Fund',
    category: 'Large Cap Index',
    planType: 'DIRECT',
    expenseRatioPercent: 0.18,
    directEquivalentTerPercent: 0.18,
    investedAmount: 180000,
    currentValue: 224800,
    xirrPercent: 16.8,
    monthlySip: 8000,
    topHoldings: [
      { symbol: 'HDFCBANK', weightPercent: 11.4 },
      { symbol: 'ICICIBANK', weightPercent: 8.1 },
      { symbol: 'RELIANCE', weightPercent: 9.2 },
      { symbol: 'INFY', weightPercent: 5.9 },
      { symbol: 'TCS', weightPercent: 4.1 },
      { symbol: 'ITC', weightPercent: 4.2 },
      { symbol: 'TATAMOTORS', weightPercent: 2.3 },
      { symbol: 'LT', weightPercent: 4.3 },
    ],
  },
  {
    id: 'mf-hdfcmid',
    fundName: 'HDFC Mid-Cap Opportunities (Regular)',
    amc: 'HDFC Mutual Fund',
    category: 'Mid Cap',
    planType: 'REGULAR',
    expenseRatioPercent: 1.56,
    directEquivalentTerPercent: 0.78,
    investedAmount: 150000,
    currentValue: 196200,
    xirrPercent: 19.6,
    monthlySip: 6000,
    topHoldings: [
      { symbol: 'DIXON', weightPercent: 4.1 },
      { symbol: 'TRENT', weightPercent: 3.6 },
      { symbol: 'FEDERALBNK', weightPercent: 3.4 },
      { symbol: 'COFORGE', weightPercent: 3.2 },
      { symbol: 'WAAREE', weightPercent: 2.6 },
      { symbol: 'INDIANHOTELS', weightPercent: 3.1 },
    ],
  },
  {
    id: 'mf-quantsmall',
    fundName: 'Quant Small Cap Fund',
    amc: 'Quant Mutual Fund',
    category: 'Small Cap',
    planType: 'DIRECT',
    expenseRatioPercent: 0.64,
    directEquivalentTerPercent: 0.64,
    investedAmount: 120000,
    currentValue: 168900,
    xirrPercent: 26.2,
    monthlySip: 5000,
    topHoldings: [
      { symbol: 'RELIANCE', weightPercent: 8.6 },
      { symbol: 'JIOFIN', weightPercent: 6.1 },
      { symbol: 'WAAREE', weightPercent: 3.2 },
      { symbol: 'SWIGGY', weightPercent: 2.4 },
      { symbol: 'BAJAJHFL', weightPercent: 2.1 },
    ],
  },
];

export const SAMPLE_SIP_CASHFLOWS: XirrCashflow[] = [
  { id: 'cf-1', date: '2023-06-05', amount: -25000, label: 'Initial Lumpsum Allocation' },
  { id: 'cf-2', date: '2023-09-05', amount: -20000, label: 'Q3 Systematic Step-Up SIP' },
  { id: 'cf-3', date: '2023-12-05', amount: -25000, label: 'Year-End Top-Up SIP' },
  { id: 'cf-4', date: '2024-03-05', amount: -30000, label: 'FY-End ELSS + Flexi SIP' },
  { id: 'cf-5', date: '2024-06-05', amount: -25000, label: 'Post-Election Dip Tranche' },
  { id: 'cf-6', date: '2024-09-05', amount: -29000, label: 'Monthly Core SIP Batch' },
  { id: 'cf-7', date: '2024-12-05', amount: -29000, label: 'Q4 Accumulation SIP' },
  { id: 'cf-8', date: '2025-03-05', amount: 234500, label: 'Current Portfolio Valuation (Holdings Value)' },
];

/**
 * Newton-Raphson + safe bisection XIRR solver on actual dated cashflows.
 * Returns annualized percentage (e.g. 21.4 for 21.4% p.a.)
 */
export function computeXirr(cashflows: XirrCashflow[]): number | null {
  if (cashflows.length < 2) return null;
  const sorted = [...cashflows].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const hasNeg = sorted.some((c) => c.amount < 0);
  const hasPos = sorted.some((c) => c.amount > 0);
  if (!hasNeg || !hasPos) return null;

  const t0 = new Date(sorted[0].date).getTime();
  const msPerYear = 365.25 * 24 * 60 * 60 * 1000;
  const years = sorted.map((c) => (new Date(c.date).getTime() - t0) / msPerYear);

  const npv = (rate: number) =>
    sorted.reduce((sum, c, idx) => sum + c.amount / Math.pow(1 + rate, years[idx]), 0);

  let rate = 0.15;
  for (let iter = 0; iter < 50; iter++) {
    let f = 0;
    let df = 0;
    for (let i = 0; i < sorted.length; i++) {
      const denom = Math.pow(1 + rate, years[i]);
      if (!isFinite(denom) || denom === 0) continue;
      f += sorted[i].amount / denom;
      df -= (years[i] * sorted[i].amount) / (denom * (1 + rate));
    }
    if (Math.abs(f) < 1e-4) {
      return Math.round(rate * 10000) / 100;
    }
    if (Math.abs(df) < 1e-8) break;
    const next = rate - f / df;
    if (!isFinite(next) || next <= -0.99 || next > 10) break;
    rate = next;
  }

  // Fallback bisection between -90% and +300%
  let low = -0.9;
  let high = 3.0;
  let fLow = npv(low);
  for (let iter = 0; iter < 60; iter++) {
    const mid = (low + high) / 2;
    const fMid = npv(mid);
    if (Math.abs(fMid) < 1e-3) return Math.round(mid * 10000) / 100;
    if ((fLow < 0 && fMid < 0) || (fLow > 0 && fMid > 0)) {
      low = mid;
      fLow = fMid;
    } else {
      high = mid;
    }
  }
  return Math.round(((low + high) / 2) * 10000) / 100;
}

/**
 * Computes pairwise portfolio overlap across mutual funds and compares overlap against direct stock demat holdings.
 */
export function computeFundOverlaps(
  funds: MutualFundHolding[],
  directHoldings: TradingHolding[]
): {
  pairs: FundOverlapPair[];
  directStockConflicts: {
    symbol: string;
    directWeightPercent: number;
    fundExposureCount: number;
    fundsHolding: string[];
  }[];
} {
  const pairs: FundOverlapPair[] = [];
  for (let i = 0; i < funds.length; i++) {
    for (let j = i + 1; j < funds.length; j++) {
      const a = funds[i];
      const b = funds[j];
      const commonStocks: { symbol: string; minWeight: number }[] = [];
      let overlapSum = 0;

      a.topHoldings.forEach((ha) => {
        const match = b.topHoldings.find((hb) => hb.symbol === ha.symbol);
        if (match) {
          const minW = Math.min(ha.weightPercent, match.weightPercent);
          overlapSum += minW;
          commonStocks.push({ symbol: ha.symbol, minWeight: Math.round(minW * 10) / 10 });
        }
      });

      // Normalize slightly against modeled core basket coverage (~50% top equity weight)
      const normalizedOverlap = Math.min(95, Math.round(overlapSum * 1.45 * 10) / 10);
      pairs.push({
        fundA: a.fundName,
        fundB: b.fundName,
        overlapPercent: normalizedOverlap,
        commonStocks: commonStocks.sort((x, y) => y.minWeight - x.minWeight),
      });
    }
  }

  const totalDirectValue = Math.max(
    1,
    directHoldings.reduce((sum, h) => sum + h.currentValue, 0)
  );
  const directStockConflicts = directHoldings
    .map((h) => {
      const fundsHolding = funds
        .filter((f) => f.topHoldings.some((th) => th.symbol === h.symbol))
        .map((f) => f.fundName);
      return {
        symbol: h.symbol,
        directWeightPercent: Math.round((h.currentValue / totalDirectValue) * 1000) / 10,
        fundExposureCount: fundsHolding.length,
        fundsHolding,
      };
    })
    .filter((x) => x.fundExposureCount > 0)
    .sort((a, b) => b.fundExposureCount - a.fundExposureCount);

  return { pairs, directStockConflicts };
}

export function simulateDirectVsRegularCost(
  monthlySip: number,
  years: number,
  grossCagrPercent: number,
  directTer: number,
  regularTer: number
) {
  const directNetRate = Math.max(0.01, (grossCagrPercent - directTer) / 100) / 12;
  const regularNetRate = Math.max(0.01, (grossCagrPercent - regularTer) / 100) / 12;

  const series: { year: number; directCorpus: number; regularCorpus: number; commissionLost: number }[] = [];
  let directBal = 0;
  let regularBal = 0;

  for (let y = 1; y <= years; y++) {
    for (let m = 0; m < 12; m++) {
      directBal = (directBal + monthlySip) * (1 + directNetRate);
      regularBal = (regularBal + monthlySip) * (1 + regularNetRate);
    }
    series.push({
      year: y,
      directCorpus: Math.round(directBal),
      regularCorpus: Math.round(regularBal),
      commissionLost: Math.round(directBal - regularBal),
    });
  }

  return series;
}

export const INITIAL_FII_DII_FLOWS: FiiDiiDailyFlow[] = [
  { date: '18 Oct', fiiNetCr: -5485, diiNetCr: 5214, combinedNetCr: -271, niftyClose: 24854, niftyChangePercent: 0.42 },
  { date: '21 Oct', fiiNetCr: -2261, diiNetCr: 3225, combinedNetCr: 964, niftyClose: 24781, niftyChangePercent: -0.29 },
  { date: '22 Oct', fiiNetCr: -3978, diiNetCr: 5869, combinedNetCr: 1891, niftyClose: 24472, niftyChangePercent: -1.25 },
  { date: '23 Oct', fiiNetCr: -5684, diiNetCr: 6039, combinedNetCr: 355, niftyClose: 24435, niftyChangePercent: -0.15 },
  { date: '24 Oct', fiiNetCr: -5062, diiNetCr: 3620, combinedNetCr: -1442, niftyClose: 24399, niftyChangePercent: -0.15 },
  { date: '25 Oct', fiiNetCr: -3036, diiNetCr: 4159, combinedNetCr: 1123, niftyClose: 24180, niftyChangePercent: -0.90 },
  { date: '28 Oct', fiiNetCr: -3228, diiNetCr: 1400, combinedNetCr: -1828, niftyClose: 24339, niftyChangePercent: 0.66 },
  { date: '29 Oct', fiiNetCr: -548, diiNetCr: 730, combinedNetCr: 182, niftyClose: 24466, niftyChangePercent: 0.52 },
  { date: '30 Oct', fiiNetCr: -4613, diiNetCr: 4518, combinedNetCr: -95, niftyClose: 24340, niftyChangePercent: -0.51 },
  { date: '31 Oct', fiiNetCr: -5813, diiNetCr: 3514, combinedNetCr: -2299, niftyClose: 24205, niftyChangePercent: -0.55 },
  { date: '04 Nov', fiiNetCr: -4329, diiNetCr: 2936, combinedNetCr: -1393, niftyClose: 23995, niftyChangePercent: -0.87 },
  { date: '05 Nov', fiiNetCr: -2569, diiNetCr: 3030, combinedNetCr: 461, niftyClose: 24213, niftyChangePercent: 0.91 },
  { date: '06 Nov', fiiNetCr: -4445, diiNetCr: 4889, combinedNetCr: 444, niftyClose: 24484, niftyChangePercent: 1.12 },
  { date: '07 Nov', fiiNetCr: -4888, diiNetCr: 1786, combinedNetCr: -3102, niftyClose: 24199, niftyChangePercent: -1.16 },
  { date: '08 Nov', fiiNetCr: -3404, diiNetCr: 1748, combinedNetCr: -1656, niftyClose: 24148, niftyChangePercent: -0.21 },
  { date: '11 Nov', fiiNetCr: -2306, diiNetCr: 2026, combinedNetCr: -280, niftyClose: 24141, niftyChangePercent: -0.03 },
  { date: '12 Nov', fiiNetCr: -3024, diiNetCr: 1854, combinedNetCr: -1170, niftyClose: 23883, niftyChangePercent: -1.07 },
  { date: '13 Nov', fiiNetCr: -2502, diiNetCr: 6145, combinedNetCr: 3643, niftyClose: 23559, niftyChangePercent: -1.36 },
  { date: '14 Nov', fiiNetCr: -1849, diiNetCr: 2481, combinedNetCr: 632, niftyClose: 23532, niftyChangePercent: -0.11 },
  { date: '15 Nov', fiiNetCr: 1480, diiNetCr: 1920, combinedNetCr: 3400, niftyClose: 23815, niftyChangePercent: 1.20 },
];

export const INITIAL_DERIVATIVES_SNAPSHOT: DerivativesSentimentSnapshot = {
  date: 'Latest EOD Session',
  fiiIndexFutureLongPercent: 34.5,
  fiiIndexFutureShortPercent: 65.5,
  niftyPcr: 1.08,
  indiaVix: 14.8,
  retailLongSharePercent: 61.2,
  regimeLabel: 'DII Absorption vs. FII Hedged Bias',
  regimeSummary:
    'Domestic Mutual Fund SIP inflows absorbed ~92% of FII cash selling over the 20-day window. FII index futures remain net short (34.5% long), typically indicating institutional portfolio hedging or short-covering potential near support.',
};

export const INITIAL_PRICE_ALERTS: LivePriceAlertRule[] = [
  {
    id: 'alert-waaree-breakout',
    symbol: 'WAAREE',
    condition: 'ABOVE',
    targetPrice: 3005,
    note: 'Solar breakout confirmation above ₹3,005 VWAP cluster',
    isActive: true,
    isTriggered: false,
    createdAt: '09:20 AM',
  },
  {
    id: 'alert-swiggy-dip',
    symbol: 'SWIGGY',
    condition: 'BELOW',
    targetPrice: 440,
    note: 'Pullback accumulation watch near IPO institutional support',
    isActive: true,
    isTriggered: false,
    createdAt: '09:35 AM',
  },
  {
    id: 'alert-tatamotors-stop',
    symbol: 'TATAMOTORS',
    condition: 'BELOW',
    targetPrice: 802,
    note: 'Auto support breakdown alert — check stop-loss protection',
    isActive: true,
    isTriggered: false,
    createdAt: '10:05 AM',
  },
];

export const INITIAL_MORNING_CHECKLIST: MorningChecklistItem[] = [
  {
    id: 'chk-vix',
    category: 'MACRO_CUES',
    title: 'Check India VIX & GIFT Nifty Gap',
    detail: 'Verify overnight US/Asian cues and whether India VIX is above 18 (tighten position sizes if elevated).',
    checked: true,
  },
  {
    id: 'chk-rbi',
    category: 'MACRO_CUES',
    title: 'Scan Earnings & RBI / Exchange Filings Tab',
    detail: 'Confirm none of your planned tickers have results or material board meetings today (avoid binary event gamble).',
    checked: true,
  },
  {
    id: 'chk-riskcap',
    category: 'RISK_PREP',
    title: 'Verify Daily Loss Limit & 1.5% Per-Trade Cap',
    detail: 'Confirm Kill Switch is off and your stop-loss distance fits inside your Position Sizing budget.',
    checked: true,
  },
  {
    id: 'chk-slorder',
    category: 'EXECUTION_RULES',
    title: 'Mandatory Stop-Loss Rule Pre-Committed',
    detail: 'Never enter a MIS/swing trade without a predetermined invalidation level entered in the ticket.',
    checked: false,
  },
  {
    id: 'chk-fomo',
    category: 'EXECUTION_RULES',
    title: 'No Chasing First 15-Minute Opening Spike',
    detail: 'Wait for 9:30 AM opening range stability and Bid/Ask spread normalization before market execution.',
    checked: false,
  },
];
