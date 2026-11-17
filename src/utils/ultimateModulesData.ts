import {
  AdvanceTaxInstallment,
  BulkInsiderDeal,
  EnrichedTechnicalPoint,
  EquityBasketTemplate,
  FixedIncomeInstrument,
  LiveMarketQuote,
  OptionChainIndexId,
  OptionChainStrikeRow,
  ShareholdingSnapshot,
  TechnicalSetupSummary,
  TradingHolding,
} from '../types/trading';

// ============================================================================
// 1. ITR-2 / ITR-3 CAPITAL GAINS & ADVANCE TAX ENGINE
// ============================================================================
export interface CapitalGainsSummary {
  stcgTaxable: number;
  stcgTax: number; // Sec 111A @ 20% (Post-July 2024 Indian budget)
  ltcgGross: number;
  ltcgExemptionUsed: number;
  ltcgTaxable: number;
  ltcgTax: number; // Sec 112A @ 12.5% above ₹1,25,000
  fnoNetProfit: number;
  fnoSlabTax: number;
  dividendTaxable: number;
  dividendSlabTax: number;
  baseTaxLiability: number;
  cessAmount: number; // 4% Health & Education Cess
  totalTaxLiability: number;
  advanceTaxRequired: boolean; // True when net tax liability >= ₹10,000
  sec44abAuditRisk: 'NOT_APPLICABLE' | 'EXEMPT_UNDER_10CR' | 'AUDIT_REQUIRED';
  installments: AdvanceTaxInstallment[];
}

export function computeCapitalGainsAndAdvanceTax(params: {
  realizedStcg: number;
  realizedLtcg: number;
  fnoNetProfit: number;
  fnoTurnover: number;
  dividendIncome: number;
  marginalSlabPercent: number;
  advanceTaxPaidQ1: number;
  advanceTaxPaidQ2: number;
  advanceTaxPaidQ3: number;
  advanceTaxPaidQ4: number;
}): CapitalGainsSummary {
  const {
    realizedStcg,
    realizedLtcg,
    fnoNetProfit,
    fnoTurnover,
    dividendIncome,
    marginalSlabPercent,
    advanceTaxPaidQ1,
    advanceTaxPaidQ2,
    advanceTaxPaidQ3,
    advanceTaxPaidQ4,
  } = params;

  // Allow negative STCG/LTCG to offset only where permitted under IT Act:
  // STCL can offset both STCG and LTCG; LTCL only LTCG.
  let effectiveStcg = realizedStcg;
  let effectiveLtcg = realizedLtcg;
  if (effectiveStcg < 0 && effectiveLtcg > 0) {
    const absorbed = Math.min(effectiveLtcg, Math.abs(effectiveStcg));
    effectiveLtcg -= absorbed;
    effectiveStcg += absorbed;
  }

  const stcgTaxable = Math.max(0, effectiveStcg);
  const stcgTax = Math.round(stcgTaxable * 0.20); // 20% Sec 111A

  const ltcgGross = Math.max(0, effectiveLtcg);
  const ltcgExemptionUsed = Math.min(125000, ltcgGross);
  const ltcgTaxable = Math.max(0, ltcgGross - 125000);
  const ltcgTax = Math.round(ltcgTaxable * 0.125); // 12.5% Sec 112A

  const slabRate = marginalSlabPercent / 100;
  const fnoTaxable = Math.max(0, fnoNetProfit);
  const fnoSlabTax = Math.round(fnoTaxable * slabRate);

  const dividendTaxable = Math.max(0, dividendIncome);
  const dividendSlabTax = Math.round(dividendTaxable * slabRate);

  const baseTaxLiability = stcgTax + ltcgTax + fnoSlabTax + dividendSlabTax;
  const cessAmount = Math.round(baseTaxLiability * 0.04);
  const totalTaxLiability = baseTaxLiability + cessAmount;
  const advanceTaxRequired = totalTaxLiability >= 10000;

  // Sec 44AB (proviso raises limit to ₹10 Cr if >=95% digital transactions)
  let sec44abAuditRisk: CapitalGainsSummary['sec44abAuditRisk'] = 'NOT_APPLICABLE';
  if (fnoTurnover > 0) {
    sec44abAuditRisk = fnoTurnover > 100000000 ? 'AUDIT_REQUIRED' : 'EXEMPT_UNDER_10CR';
  }

  const qDefs: Array<{
    quarter: AdvanceTaxInstallment['quarter'];
    dueDate: string;
    pct: number;
    cumPaid: number;
  }> = [
    { quarter: 'Q1 (Jun 15)', dueDate: '15 Jun', pct: 15, cumPaid: advanceTaxPaidQ1 },
    {
      quarter: 'Q2 (Sep 15)',
      dueDate: '15 Sep',
      pct: 45,
      cumPaid: advanceTaxPaidQ1 + advanceTaxPaidQ2,
    },
    {
      quarter: 'Q3 (Dec 15)',
      dueDate: '15 Dec',
      pct: 75,
      cumPaid: advanceTaxPaidQ1 + advanceTaxPaidQ2 + advanceTaxPaidQ3,
    },
    {
      quarter: 'Q4 (Mar 15)',
      dueDate: '15 Mar',
      pct: 100,
      cumPaid: advanceTaxPaidQ1 + advanceTaxPaidQ2 + advanceTaxPaidQ3 + advanceTaxPaidQ4,
    },
  ];

  const installments: AdvanceTaxInstallment[] = qDefs.map((q, idx) => {
    const required = Math.round((totalTaxLiability * q.pct) / 100);
    const shortfall = Math.max(0, required - q.cumPaid);
    // Sec 234C applies 1% per month for 3 months on Q1-Q3, 1 month on Q4 (tolerance threshold 12% for Q1, 36% for Q2)
    const minTolerancePct = idx === 0 ? 12 : idx === 1 ? 36 : q.pct;
    const minRequiredNoInterest = Math.round((totalTaxLiability * minTolerancePct) / 100);
    const triggerPenalty = advanceTaxRequired && q.cumPaid < minRequiredNoInterest;
    const months = idx < 3 ? 3 : 1;
    const sec234cPenaltyEstimate = triggerPenalty ? Math.round(shortfall * 0.01 * months) : 0;

    let status: AdvanceTaxInstallment['status'] = 'PAID_OK';
    if (shortfall > 0) {
      status = triggerPenalty ? 'SHORTFALL' : 'DUE_SOON';
    }

    return {
      quarter: q.quarter,
      dueDate: q.dueDate,
      cumulativePercentRequired: q.pct,
      cumulativeTaxDue: required,
      estimatedShortfall: shortfall,
      sec234cPenaltyEstimate,
      status,
    };
  });

  return {
    stcgTaxable,
    stcgTax,
    ltcgGross,
    ltcgExemptionUsed,
    ltcgTaxable,
    ltcgTax,
    fnoNetProfit,
    fnoSlabTax,
    dividendTaxable,
    dividendSlabTax,
    baseTaxLiability,
    cessAmount,
    totalTaxLiability,
    advanceTaxRequired,
    sec44abAuditRisk,
    installments,
  };
}

// ============================================================================
// 2. NSE OPTIONS CHAIN & OPEN INTEREST (OI) WALL
// ============================================================================
export interface OptionChainSnapshot {
  indexId: OptionChainIndexId;
  spotPrice: number;
  lotSize: number;
  strikeStep: number;
  pcr: number;
  maxPainStrike: number;
  callWallStrike: number;
  putWallStrike: number;
  totalCallOI: number;
  totalPutOI: number;
  rows: OptionChainStrikeRow[];
}

const INDEX_CHAIN_SPECS: Record<
  OptionChainIndexId,
  { spot: number; step: number; lot: number; baseIv: number }
> = {
  NIFTY: { spot: 24360, step: 50, lot: 25, baseIv: 13.8 },
  BANKNIFTY: { spot: 51820, step: 100, lot: 15, baseIv: 15.9 },
  FINNIFTY: { spot: 23940, step: 50, lot: 25, baseIv: 14.4 },
};

export function buildOptionChainSnapshot(
  indexId: OptionChainIndexId,
  expiryType: 'WEEKLY' | 'MONTHLY'
): OptionChainSnapshot {
  const spec = INDEX_CHAIN_SPECS[indexId];
  const atmStrike = Math.round(spec.spot / spec.step) * spec.step;
  const expiryScale = expiryType === 'MONTHLY' ? 1.55 : 1.0;

  const rows: OptionChainStrikeRow[] = [];
  for (let offset = -6; offset <= 6; offset++) {
    const strike = atmStrike + offset * spec.step;
    const dist = Math.abs(offset);
    const isRoundMajor = strike % (spec.step * 2) === 0;
    const roundBoost = isRoundMajor ? 1.45 : 0.85;

    // Realistic OI walls: heavier Call OI above spot, heavier Put OI below spot
    const callBias = offset >= 0 ? 1.38 - dist * 0.08 : 0.52;
    const putBias = offset <= 0 ? 1.48 - dist * 0.07 : 0.48;

    const baseScale = indexId === 'NIFTY' ? 4200000 : 2100000;
    const callOI = Math.round(
      baseScale * Math.max(0.2, callBias) * roundBoost * expiryScale * (1 - dist * 0.05)
    );
    const putOI = Math.round(
      baseScale * Math.max(0.2, putBias) * roundBoost * expiryScale * (1 - dist * 0.05)
    );

    const callChgOI = Math.round(callOI * (offset >= 1 ? 0.14 : -0.05));
    const putChgOI = Math.round(putOI * (offset <= -1 ? 0.17 : -0.04));

    const intrinsicCall = Math.max(0, spec.spot - strike);
    const intrinsicPut = Math.max(0, strike - spec.spot);
    const timeValue = Math.max(
      14,
      spec.spot * 0.0085 * expiryScale * Math.exp(-0.22 * dist)
    );

    const callLtp = Math.round((intrinsicCall + timeValue) * 20) / 20;
    const putLtp = Math.round((intrinsicPut + timeValue * 0.96) * 20) / 20;
    const skewAdjust = offset < 0 ? Math.abs(offset) * 0.45 : offset * 0.3;
    const callIv = Math.round((spec.baseIv + skewAdjust * 0.8) * 10) / 10;
    const putIv = Math.round((spec.baseIv + skewAdjust * 1.1) * 10) / 10;

    rows.push({
      strike,
      callOI,
      callChgOI,
      callLtp,
      callIv,
      putOI,
      putChgOI,
      putLtp,
      putIv,
      isAtm: offset === 0,
    });
  }

  let totalCallOI = 0;
  let totalPutOI = 0;
  let callWallStrike = rows[0].strike;
  let maxCallOI = -1;
  let putWallStrike = rows[0].strike;
  let maxPutOI = -1;

  for (const r of rows) {
    totalCallOI += r.callOI;
    totalPutOI += r.putOI;
    if (r.callOI > maxCallOI) {
      maxCallOI = r.callOI;
      callWallStrike = r.strike;
    }
    if (r.putOI > maxPutOI) {
      maxPutOI = r.putOI;
      putWallStrike = r.strike;
    }
  }

  // Exact Max Pain strike minimizing total buyer intrinsic payout at expiry
  let maxPainStrike = atmStrike;
  let minPayout = Number.POSITIVE_INFINITY;
  for (const candidate of rows) {
    let totalPayout = 0;
    for (const r of rows) {
      totalPayout += Math.max(0, candidate.strike - r.strike) * r.callOI;
      totalPayout += Math.max(0, r.strike - candidate.strike) * r.putOI;
    }
    if (totalPayout < minPayout) {
      minPayout = totalPayout;
      maxPainStrike = candidate.strike;
    }
  }

  const pcr = Math.round((totalPutOI / Math.max(1, totalCallOI)) * 100) / 100;

  return {
    indexId,
    spotPrice: spec.spot,
    lotSize: spec.lot,
    strikeStep: spec.step,
    pcr,
    maxPainStrike,
    callWallStrike,
    putWallStrike,
    totalCallOI,
    totalPutOI,
    rows,
  };
}

// ============================================================================
// 3. PROMOTER SHAREHOLDING, PLEDGE & SAST INSIDER RADAR
// ============================================================================
export const SHAREHOLDING_SNAPSHOTS: ShareholdingSnapshot[] = [
  {
    symbol: 'WAAREE',
    companyName: 'Waaree Energies Ltd',
    quarter: 'Sep 2024',
    promoterPercent: 64.3,
    prevPromoterPercent: 71.8,
    pledgedPercent: 0.0,
    prevPledgedPercent: 0.0,
    fiiPercent: 4.8,
    diiPercent: 11.2,
    publicPercent: 19.7,
  },
  {
    symbol: 'HDFCBANK',
    companyName: 'HDFC Bank Limited',
    quarter: 'Sep 2024',
    promoterPercent: 0.0, // Professionally managed institution
    prevPromoterPercent: 0.0,
    pledgedPercent: 0.0,
    prevPledgedPercent: 0.0,
    fiiPercent: 47.6,
    diiPercent: 34.4,
    publicPercent: 18.0,
  },
  {
    symbol: 'RELIANCE',
    companyName: 'Reliance Industries Ltd',
    quarter: 'Sep 2024',
    promoterPercent: 50.24,
    prevPromoterPercent: 50.31,
    pledgedPercent: 0.0,
    prevPledgedPercent: 0.0,
    fiiPercent: 21.8,
    diiPercent: 16.9,
    publicPercent: 11.06,
  },
  {
    symbol: 'TATAMOTORS',
    companyName: 'Tata Motors Limited',
    quarter: 'Sep 2024',
    promoterPercent: 42.58,
    prevPromoterPercent: 46.36,
    pledgedPercent: 1.8,
    prevPledgedPercent: 2.1,
    fiiPercent: 20.5,
    diiPercent: 16.2,
    publicPercent: 20.72,
  },
  {
    symbol: 'BAJAJHFL',
    companyName: 'Bajaj Housing Finance Ltd',
    quarter: 'Sep 2024',
    promoterPercent: 88.75,
    prevPromoterPercent: 100.0,
    pledgedPercent: 0.0,
    prevPledgedPercent: 0.0,
    fiiPercent: 2.6,
    diiPercent: 3.1,
    publicPercent: 5.55,
  },
  {
    symbol: 'INFY',
    companyName: 'Infosys Limited',
    quarter: 'Sep 2024',
    promoterPercent: 14.43,
    prevPromoterPercent: 14.61,
    pledgedPercent: 0.0,
    prevPledgedPercent: 0.0,
    fiiPercent: 33.9,
    diiPercent: 36.8,
    publicPercent: 14.87,
  },
  {
    symbol: 'SWIGGY',
    companyName: 'Swiggy Limited',
    quarter: 'Sep 2024',
    promoterPercent: 0.0,
    prevPromoterPercent: 0.0,
    pledgedPercent: 0.0,
    prevPledgedPercent: 0.0,
    fiiPercent: 51.2,
    diiPercent: 15.8,
    publicPercent: 33.0,
  },
  {
    symbol: 'TATASTEEL',
    companyName: 'Tata Steel Limited',
    quarter: 'Sep 2024',
    promoterPercent: 33.19,
    prevPromoterPercent: 33.9,
    pledgedPercent: 2.9,
    prevPledgedPercent: 1.7,
    fiiPercent: 19.6,
    diiPercent: 23.4,
    publicPercent: 23.81,
  },
  {
    symbol: 'PREMIERENE',
    companyName: 'Premier Energies Ltd',
    quarter: 'Sep 2024',
    promoterPercent: 64.2,
    prevPromoterPercent: 72.1,
    pledgedPercent: 12.4, // Governance watchlist alert example
    prevPledgedPercent: 8.5,
    fiiPercent: 5.4,
    diiPercent: 14.9,
    publicPercent: 15.5,
  },
];

export const BULK_INSIDER_DEALS: BulkInsiderDeal[] = [
  {
    id: 'deal-1',
    date: '14 Nov',
    symbol: 'WAAREE',
    clientName: 'SBI Mutual Fund — Focused Desk',
    category: 'BLOCK_DEAL',
    action: 'ACQUISITION',
    quantity: 420000,
    avgPrice: 2945,
    valueCr: 123.7,
    rationaleNote: 'Post-IPO institutional accumulation above VWAP support.',
  },
  {
    id: 'deal-2',
    date: '13 Nov',
    symbol: 'HDFCBANK',
    clientName: 'GQG Partners Emerging Markets',
    category: 'FII_DESK',
    action: 'ACQUISITION',
    quantity: 1850000,
    avgPrice: 1718,
    valueCr: 317.8,
    rationaleNote: 'MSCI weight expansion flow ahead of rebalancing cutoff.',
  },
  {
    id: 'deal-3',
    date: '12 Nov',
    symbol: 'PREMIERENE',
    clientName: 'Promoter Group Working Capital Pledge',
    category: 'PROMOTER_SAST',
    action: 'DISPOSAL',
    quantity: 650000,
    avgPrice: 1035,
    valueCr: 67.3,
    rationaleNote: 'Additional collateral pledge disclosed under SEBI SAST Reg 31(1). Review debt covenant margin.',
  },
  {
    id: 'deal-4',
    date: '11 Nov',
    symbol: 'TATASTEEL',
    clientName: 'Tata Sons Private Limited',
    category: 'PROMOTER_SAST',
    action: 'ACQUISITION',
    quantity: 1120000,
    avgPrice: 150.4,
    valueCr: 16.8,
    rationaleNote: 'Creeping acquisition disclosure under Reg 29(2) on cyclical dip.',
  },
  {
    id: 'deal-5',
    date: '10 Nov',
    symbol: 'BAJAJHFL',
    clientName: 'Early Angel Co-Investor Fund',
    category: 'BULK_DEAL',
    action: 'DISPOSAL',
    quantity: 4200000,
    avgPrice: 137.8,
    valueCr: 57.9,
    rationaleNote: 'Pre-IPO anchor lock-in partial profit booking absorbed by domestic MFs.',
  },
  {
    id: 'deal-6',
    date: '08 Nov',
    symbol: 'RELIANCE',
    clientName: 'Kotak Mahindra AMC',
    category: 'BLOCK_DEAL',
    action: 'ACQUISITION',
    quantity: 590000,
    avgPrice: 1295,
    valueCr: 76.4,
    rationaleNote: 'Large-cap core basket allocation rebalance.',
  },
];

// ============================================================================
// 4. TECHNICAL CHART & PATTERN DESK
// ============================================================================
export function computeTechnicalSeries(quote: LiveMarketQuote): {
  points: EnrichedTechnicalPoint[];
  summary: TechnicalSetupSummary;
} {
  const rawCandles = quote.historicalCandles.slice(-40);
  const closes = rawCandles.map((c) => c.close);

  // Sync latest bar close with live quote price
  if (closes.length > 0) {
    closes[closes.length - 1] = quote.lastPrice;
  }

  const k9 = 2 / (9 + 1);
  const k21 = 2 / (21 + 1);

  let ema9Prev = closes[0] ?? quote.lastPrice;
  let ema21Prev = closes[0] ?? quote.lastPrice;
  let cumPV = 0;
  let cumV = 0;

  const points: EnrichedTechnicalPoint[] = [];

  for (let i = 0; i < rawCandles.length; i++) {
    const c = rawCandles[i];
    const close = i === rawCandles.length - 1 ? quote.lastPrice : c.close;
    const typical = (c.high + c.low + close) / 3;
    cumPV += typical * c.volume;
    cumV += c.volume;

    ema9Prev = i === 0 ? close : close * k9 + ema9Prev * (1 - k9);
    ema21Prev = i === 0 ? close : close * k21 + ema21Prev * (1 - k21);
    const vwap = cumV > 0 ? cumPV / cumV : close;

    // 20-period Bollinger Bands (fallback to available window)
    const winStart = Math.max(0, i - 19);
    const winSlice = closes.slice(winStart, i + 1);
    const mean20 = winSlice.reduce((a, b) => a + b, 0) / winSlice.length;
    const variance =
      winSlice.reduce((acc, v) => acc + Math.pow(v - mean20, 2), 0) / winSlice.length;
    const std = Math.sqrt(variance);

    // 14-period RSI approximation
    const rsiStart = Math.max(1, i - 13);
    let gains = 0;
    let losses = 0;
    for (let j = rsiStart; j <= i; j++) {
      const diff = closes[j] - closes[j - 1];
      if (diff >= 0) gains += diff;
      else losses += Math.abs(diff);
    }
    const rs = losses === 0 ? 10 : gains / losses;
    const rsi14 = i === 0 ? 50 : Math.round((100 - 100 / (1 + rs)) * 10) / 10;

    points.push({
      date: c.time.slice(5), // MM-DD
      open: c.open,
      high: Math.max(c.high, close),
      low: Math.min(c.low, close),
      close: Math.round(close * 100) / 100,
      volume: c.volume,
      ema9: Math.round(ema9Prev * 100) / 100,
      ema21: Math.round(ema21Prev * 100) / 100,
      vwap: Math.round(vwap * 100) / 100,
      bbUpper: Math.round((mean20 + 2 * std) * 100) / 100,
      bbLower: Math.round((mean20 - 2 * std) * 100) / 100,
      rsi14,
    });
  }

  if (points.length === 0) {
    points.push({
      date: 'Live',
      open: quote.open || quote.lastPrice,
      high: quote.high || quote.lastPrice,
      low: quote.low || quote.lastPrice,
      close: quote.lastPrice,
      volume: quote.volume || 100000,
      ema9: quote.lastPrice,
      ema21: quote.lastPrice,
      vwap: quote.vwap || quote.lastPrice,
      bbUpper: Math.round(quote.lastPrice * 1.02 * 100) / 100,
      bbLower: Math.round(quote.lastPrice * 0.98 * 100) / 100,
      rsi14: 50,
    });
  }

  const latest = points[points.length - 1];
  const recentWindow = points.slice(-15);
  const supportLevel = Math.round(Math.min(...recentWindow.map((p) => p.low)) * 100) / 100;
  const resistanceLevel = Math.round(Math.max(...recentWindow.map((p) => p.high)) * 100) / 100;

  let bias: TechnicalSetupSummary['bias'] = 'NEUTRAL';
  let patternLabel = 'Range Consolidation Inside Bollinger Bands';

  if (latest.ema9 > latest.ema21 && latest.close >= latest.vwap) {
    bias = 'BULLISH';
    patternLabel =
      latest.rsi14 > 68
        ? 'Bullish Momentum Breakout (RSI Extended > 68)'
        : 'EMA 9/21 Golden Alignment Above VWAP';
  } else if (latest.ema9 < latest.ema21 && latest.close < latest.vwap) {
    bias = 'BEARISH';
    patternLabel =
      latest.rsi14 < 34
        ? 'Oversold Pullback Near Lower Bollinger Band'
        : 'Bearish EMA Crossover Below VWAP';
  }

  return {
    points,
    summary: {
      symbol: quote.symbol,
      patternLabel,
      bias,
      supportLevel,
      resistanceLevel,
      suggestedStopLoss: Math.round(Math.min(supportLevel, quote.lastPrice * 0.975) * 100) / 100,
      suggestedTarget: Math.round(Math.max(resistanceLevel, quote.lastPrice * 1.045) * 100) / 100,
      rsi14: latest.rsi14,
      ema9: latest.ema9,
      ema21: latest.ema21,
      vwap: latest.vwap,
    },
  };
}

// ============================================================================
// 5. EQUITY BASKETS & GTT OCO BUILDER
// ============================================================================
export const EQUITY_BASKET_TEMPLATES: EquityBasketTemplate[] = [
  {
    id: 'basket-core-nifty',
    name: 'India Core Compounders',
    theme: 'Large-Cap Anchors & Financials',
    description:
      'High-liquidity bluechip core mixing private banking, refining/telecom, and steady cashflow leaders.',
    minInvestment: 25000,
    cagr3YPercent: 18.4,
    riskTag: 'Core Compounder',
    constituents: [
      { symbol: 'HDFCBANK', weightPercent: 35 },
      { symbol: 'RELIANCE', weightPercent: 35 },
      { symbol: 'TATASTEEL', weightPercent: 15 },
      { symbol: 'BAJAJHFL', weightPercent: 15 },
    ],
  },
  {
    id: 'basket-clean-energy',
    name: 'Clean Energy & Transition Alpha',
    theme: 'Solar Manufacturing + Industrial Metals',
    description:
      'Concentrated thematic exposure to India domestic solar module capacity and EV/grid metals demand.',
    minInvestment: 30000,
    cagr3YPercent: 27.6,
    riskTag: 'High Beta',
    constituents: [
      { symbol: 'WAAREE', weightPercent: 45 },
      { symbol: 'RELIANCE', weightPercent: 30 },
      { symbol: 'TATASTEEL', weightPercent: 25 },
    ],
  },
  {
    id: 'basket-defensive-yield',
    name: 'Balanced Financial & Index Hedge',
    theme: 'Low-Turnover Allocation',
    description:
      'Pairs housing finance compounding with Nifty 50 index beta and bluechip banking stability.',
    minInvestment: 20000,
    cagr3YPercent: 15.8,
    riskTag: 'Moderate',
    constituents: [
      { symbol: 'NIFTY 50', weightPercent: 40 },
      { symbol: 'HDFCBANK', weightPercent: 35 },
      { symbol: 'BAJAJHFL', weightPercent: 25 },
    ],
  },
];

// ============================================================================
// 6. GOLD, SGB & FIXED-INCOME DEBT LADDER
// ============================================================================
export const FIXED_INCOME_INSTRUMENTS: FixedIncomeInstrument[] = [
  {
    id: 'sgb-8yr',
    name: 'Sovereign Gold Bond (SGB) — Secondary + Coupon',
    category: 'SGB',
    preTaxYieldPercent: 10.7, // ~8.2% historical CAGR + 2.5% fixed coupon
    tenorLabel: '8 Years (5-Yr Exit)',
    taxTreatment: '2.5% interest taxed at slab; Gold capital gains 100% TAX-FREE on maturity',
    effectiveTaxMultiplier: (slab) => (2.5 * (slab / 100)) / 10.7,
    liquidityNote: 'Listed on NSE; hold to 8-yr RBI maturity for 0% LTCG exemption.',
    ratingOrSovereign: 'Govt of India Sovereign',
  },
  {
    id: 'arbitrage-mf',
    name: 'Equity Arbitrage Mutual Fund (Direct)',
    category: 'ARBITRAGE_MF',
    preTaxYieldPercent: 7.45,
    tenorLabel: 'Open-Ended (T+2)',
    taxTreatment: 'Taxed like Equity: 20% STCG (<1 yr) / 12.5% LTCG (>1 yr + ₹1.25L exempt)',
    effectiveTaxMultiplier: () => 0.125,
    liquidityNote: 'Superior post-tax parking for investors in the 30% income slab.',
    ratingOrSovereign: 'SEBI Equity Hybrid',
  },
  {
    id: 'tbill-364',
    name: '364-Day RBI Treasury Bill (Retail Direct)',
    category: 'T_BILL_GSEC',
    preTaxYieldPercent: 6.72,
    tenorLabel: '364 Days',
    taxTreatment: 'Taxed as Short-Term Capital Gain at marginal income slab',
    effectiveTaxMultiplier: (slab) => slab / 100,
    liquidityNote: 'Zero credit risk; can also be pledged as Cash-Component F&O collateral.',
    ratingOrSovereign: 'RBI Sovereign Zero-Default',
  },
  {
    id: 'aaa-corp-bond',
    name: 'AAA PSU / Corporate Bond (2–3 Yr Bucket)',
    category: 'CORP_BOND',
    preTaxYieldPercent: 7.85,
    tenorLabel: '24–36 Months',
    taxTreatment: 'Interest coupon taxed at marginal income slab + 4% cess',
    effectiveTaxMultiplier: (slab) => slab / 100,
    liquidityNote: 'Monthly/annual coupon ladder; inspect call options & rating watch.',
    ratingOrSovereign: 'CRISIL AAA / ICRA AAA',
  },
  {
    id: 'bank-fd',
    name: 'Scheduled Large Bank Fixed Deposit',
    category: 'FD',
    preTaxYieldPercent: 7.15,
    tenorLabel: '1–3 Years',
    taxTreatment: 'Interest accrued taxed annually at marginal slab (TDS above ₹40,000)',
    effectiveTaxMultiplier: (slab) => slab / 100,
    liquidityNote: 'DICGC insured up to ₹5,00,000 per depositor per bank.',
    ratingOrSovereign: 'Bank Deposit',
  },
];

export function computePostTaxDebtLadder(marginalSlabPercent: number) {
  return FIXED_INCOME_INSTRUMENTS.map((inst) => {
    const effTaxRate = inst.effectiveTaxMultiplier(marginalSlabPercent) * 1.04; // include 4% cess
    const postTaxYield = Math.round(inst.preTaxYieldPercent * (1 - effTaxRate) * 100) / 100;
    const taxDragPercent = Math.round((inst.preTaxYieldPercent - postTaxYield) * 100) / 100;
    return {
      ...inst,
      postTaxYieldPercent: postTaxYield,
      taxDragPercent,
    };
  });
}

export function computeHouseholdAllocation(params: {
  equityValue: number;
  debtLadderValue: number;
  goldSgbValue: number;
}) {
  const total = Math.max(1, params.equityValue + params.debtLadderValue + params.goldSgbValue);
  return {
    totalWealth: total,
    equityPct: Math.round((params.equityValue / total) * 1000) / 10,
    debtPct: Math.round((params.debtLadderValue / total) * 1000) / 10,
    goldPct: Math.round((params.goldSgbValue / total) * 1000) / 10,
  };
}
