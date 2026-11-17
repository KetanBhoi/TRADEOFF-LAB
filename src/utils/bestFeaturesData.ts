import {
  OptionLeg,
  OptionStrategyPreset,
  OptionsPayoffAnalysis,
  TradingHolding,
  RebalanceMode,
  RebalancePlanResult,
  AllocationTarget,
  FireGoalMilestone,
  FireSimulationInput,
  FireSimulationOutput,
  FireProjectionPoint,
} from '../types/trading';

// ==========================================
// 9. OPTIONS STRATEGY PAYOFF & BLACK-SCHOLES GREEKS ENGINE
// ==========================================
export const INITIAL_OPTION_PRESETS: OptionStrategyPreset[] = [
  {
    id: 'iron_condor',
    name: 'Nifty Iron Condor (Range-Bound)',
    outlook: 'NEUTRAL',
    description: 'Sell OTM Call & Put spreads to collect theta decay when Nifty stays within a defined range.',
    underlying: 'NIFTY 50',
    spotPrice: 24300,
    lotSize: 75,
    ivPercent: 14.8,
    daysToExpiry: 12,
    legs: [
      { id: 'leg-1', side: 'SELL', type: 'PE', strike: 24000, lots: 1, premium: 118 },
      { id: 'leg-2', side: 'BUY', type: 'PE', strike: 23700, lots: 1, premium: 48 },
      { id: 'leg-3', side: 'SELL', type: 'CE', strike: 24600, lots: 1, premium: 112 },
      { id: 'leg-4', side: 'BUY', type: 'CE', strike: 24900, lots: 1, premium: 44 },
    ],
  },
  {
    id: 'bull_call_spread',
    name: 'Nifty Bull Call Spread',
    outlook: 'BULLISH',
    description: 'Defined-risk bullish debit spread buying ATM Call and selling higher OTM Call to reduce cost.',
    underlying: 'NIFTY 50',
    spotPrice: 24300,
    lotSize: 75,
    ivPercent: 14.8,
    daysToExpiry: 14,
    legs: [
      { id: 'leg-1', side: 'BUY', type: 'CE', strike: 24300, lots: 1, premium: 215 },
      { id: 'leg-2', side: 'SELL', type: 'CE', strike: 24600, lots: 1, premium: 98 },
    ],
  },
  {
    id: 'bear_put_spread',
    name: 'Nifty Bear Put Spread',
    outlook: 'BEARISH',
    description: 'Defined-risk hedge against market pullbacks by buying ATM Put and selling lower OTM Put.',
    underlying: 'NIFTY 50',
    spotPrice: 24300,
    lotSize: 75,
    ivPercent: 15.2,
    daysToExpiry: 14,
    legs: [
      { id: 'leg-1', side: 'BUY', type: 'PE', strike: 24300, lots: 1, premium: 196 },
      { id: 'leg-2', side: 'SELL', type: 'PE', strike: 24000, lots: 1, premium: 94 },
    ],
  },
  {
    id: 'long_straddle',
    name: 'Event Long Straddle (RBI / Earnings)',
    outlook: 'VOLATILE',
    description: 'Buy ATM Call and ATM Put expecting an outsized breakout move beyond combined premium paid.',
    underlying: 'NIFTY 50',
    spotPrice: 24300,
    lotSize: 75,
    ivPercent: 16.5,
    daysToExpiry: 7,
    legs: [
      { id: 'leg-1', side: 'BUY', type: 'CE', strike: 24300, lots: 1, premium: 172 },
      { id: 'leg-2', side: 'BUY', type: 'PE', strike: 24300, lots: 1, premium: 164 },
    ],
  },
];

// Standard normal CDF approximation (Abramowitz and Stegun)
function normCdf(x: number): number {
  const t = 1 / (1 + 0.2316419 * Math.abs(x));
  const d = 0.3989423 * Math.exp((-x * x) / 2);
  const p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
  return x > 0 ? 1 - p : p;
}

function normPdf(x: number): number {
  return Math.exp(-0.5 * x * x) / Math.sqrt(2 * Math.PI);
}

function blackScholesPriceAndGreeks(
  spot: number,
  strike: number,
  timeYears: number,
  rate: number,
  vol: number,
  type: 'CE' | 'PE'
) {
  const T = Math.max(timeYears, 1 / 365);
  const sigma = Math.max(vol, 0.01);
  const sqrtT = Math.sqrt(T);
  const d1 = (Math.log(spot / strike) + (rate + 0.5 * sigma * sigma) * T) / (sigma * sqrtT);
  const d2 = d1 - sigma * sqrtT;

  const nd1 = normCdf(d1);
  const nd2 = normCdf(d2);
  const pdfD1 = normPdf(d1);

  const discount = Math.exp(-rate * T);

  const price =
    type === 'CE'
      ? spot * nd1 - strike * discount * nd2
      : strike * discount * normCdf(-d2) - spot * normCdf(-d1);

  const delta = type === 'CE' ? nd1 : nd1 - 1;
  const gamma = pdfD1 / (spot * sigma * sqrtT);
  const thetaAnnual =
    type === 'CE'
      ? -(spot * pdfD1 * sigma) / (2 * sqrtT) - rate * strike * discount * nd2
      : -(spot * pdfD1 * sigma) / (2 * sqrtT) + rate * strike * discount * normCdf(-d2);
  const thetaPerDay = thetaAnnual / 365;
  const vegaPer1Pct = (spot * pdfD1 * sqrtT) / 100;

  return { price, delta, gamma, thetaPerDay, vegaPer1Pct };
}

export function analyzeOptionsStrategy(
  spotPrice: number,
  lotSize: number,
  ivPercent: number,
  daysToExpiry: number,
  ivCrushDeltaPercent: number,
  legs: OptionLeg[]
): OptionsPayoffAnalysis {
  const r = 0.065; // RBI benchmark risk-free rate ~6.5%
  const T = Math.max(daysToExpiry, 1) / 365;
  const vol = Math.max(ivPercent, 2) / 100;
  const crushedVol = Math.max(2, ivPercent + ivCrushDeltaPercent) / 100;

  // Sweep range: ±6% around spot price in 25 steps
  const minSpot = Math.round((spotPrice * 0.94) / 50) * 50;
  const maxSpot = Math.round((spotPrice * 1.06) / 50) * 50;
  const step = Math.max(50, Math.round((maxSpot - minSpot) / 28 / 50) * 50);

  const payoffCurve: { spot: number; expiryPnl: number; t0Pnl: number; ivCrushPnl: number }[] = [];

  for (let s = minSpot; s <= maxSpot; s += step) {
    let expiryPnl = 0;
    let t0Pnl = 0;
    let ivCrushPnl = 0;

    for (const leg of legs) {
      const qty = leg.lots * lotSize;
      const sign = leg.side === 'BUY' ? 1 : -1;

      // Expiry intrinsic payoff
      const intrinsic =
        leg.type === 'CE' ? Math.max(0, s - leg.strike) : Math.max(0, leg.strike - s);
      expiryPnl += sign * (intrinsic - leg.premium) * qty;

      // T+0 theoretical price
      const bsNow = blackScholesPriceAndGreeks(s, leg.strike, T, r, vol, leg.type);
      t0Pnl += sign * (bsNow.price - leg.premium) * qty;

      // Post-IV Crush theoretical price
      const bsCrush = blackScholesPriceAndGreeks(s, leg.strike, T, r, crushedVol, leg.type);
      ivCrushPnl += sign * (bsCrush.price - leg.premium) * qty;
    }

    payoffCurve.push({
      spot: s,
      expiryPnl: Math.round(expiryPnl),
      t0Pnl: Math.round(t0Pnl),
      ivCrushPnl: Math.round(ivCrushPnl),
    });
  }

  // Net Greeks at current spotPrice
  let netDelta = 0;
  let netGamma = 0;
  let netTheta = 0;
  let netVega = 0;
  let netPremiumFlow = 0;

  let shortCalls = 0;
  let longCalls = 0;
  let shortPuts = 0;
  let longPuts = 0;

  for (const leg of legs) {
    const qty = leg.lots * lotSize;
    const sign = leg.side === 'BUY' ? 1 : -1;
    const g = blackScholesPriceAndGreeks(spotPrice, leg.strike, T, r, vol, leg.type);

    netDelta += sign * g.delta * leg.lots;
    netGamma += sign * g.gamma * leg.lots;
    netTheta += sign * g.thetaPerDay * qty;
    netVega += sign * g.vegaPer1Pct * qty;

    // BUY = cash outflow (-), SELL = credit (+)
    netPremiumFlow += (leg.side === 'SELL' ? 1 : -1) * leg.premium * qty;

    if (leg.type === 'CE') {
      if (leg.side === 'SELL') shortCalls += leg.lots;
      else longCalls += leg.lots;
    } else {
      if (leg.side === 'SELL') shortPuts += leg.lots;
      else longPuts += leg.lots;
    }
  }

  const expiryValues = payoffCurve.map((p) => p.expiryPnl);
  const rawMaxProfit = Math.max(...expiryValues);
  const rawMaxLoss = Math.min(...expiryValues);

  const hasUncappedUpside = longCalls > shortCalls;
  const hasUncappedLossUpside = shortCalls > longCalls;
  const hasUncappedLossDownside = shortPuts > longPuts;

  const maxProfit: number | 'UNLIMITED' = hasUncappedUpside ? 'UNLIMITED' : Math.round(rawMaxProfit);
  const maxLoss: number | 'UNLIMITED' =
    hasUncappedLossUpside || hasUncappedLossDownside ? 'UNLIMITED' : Math.round(rawMaxLoss);

  // Approximate breakevens by finding sign changes in expiryCurve
  const breakevens: number[] = [];
  for (let i = 1; i < payoffCurve.length; i++) {
    const prev = payoffCurve[i - 1];
    const curr = payoffCurve[i];
    if ((prev.expiryPnl <= 0 && curr.expiryPnl > 0) || (prev.expiryPnl >= 0 && curr.expiryPnl < 0)) {
      const ratio = Math.abs(prev.expiryPnl) / (Math.abs(prev.expiryPnl) + Math.abs(curr.expiryPnl));
      breakevens.push(Math.round(prev.spot + ratio * (curr.spot - prev.spot)));
    }
  }

  // Margin approximation (NSE SPAN + Exposure style estimate)
  const netShortLots = Math.max(0, shortCalls - longCalls) + Math.max(0, shortPuts - longPuts);
  const spreadLots = Math.min(shortCalls, longCalls) + Math.min(shortPuts, longPuts);
  const estimatedMargin = Math.round(
    Math.max(
      netPremiumFlow < 0 ? Math.abs(netPremiumFlow) : 0,
      netShortLots * spotPrice * lotSize * 0.14 + spreadLots * 28000
    )
  );

  return {
    payoffCurve,
    maxProfit,
    maxLoss,
    breakevens,
    netPremiumFlow: Math.round(netPremiumFlow),
    estimatedMargin,
    greeks: {
      delta: Math.round(netDelta * 100) / 100,
      gamma: Math.round(netGamma * 10000) / 10000,
      thetaPerDay: Math.round(netTheta),
      vegaPer1Pct: Math.round(netVega),
    },
  };
}

// ==========================================
// 10. SMART PORTFOLIO REBALANCING & CASH INFLOW ENGINE
// ==========================================
export const DEFAULT_MARKET_CAP_TARGETS: Record<string, number> = {
  'Large Cap': 50,
  'Mid Cap': 30,
  'Small Cap': 20,
};

export function computeRebalancePlan(
  holdings: TradingHolding[],
  targetWeights: Record<string, number>,
  freshCashInflow: number,
  mode: RebalanceMode
): RebalancePlanResult {
  const totalCurrentValue = holdings.reduce((sum, h) => sum + h.currentValue, 0);

  // Aggregate current values by bucket (Market Cap tier)
  const buckets = ['Large Cap', 'Mid Cap', 'Small Cap'];
  const currentByBucket: Record<string, number> = {
    'Large Cap': 0,
    'Mid Cap': 0,
    'Small Cap': 0,
  };

  for (const h of holdings) {
    if (currentByBucket[h.marketCapCategory] !== undefined) {
      currentByBucket[h.marketCapCategory] += h.currentValue;
    } else {
      currentByBucket[h.marketCapCategory] = h.currentValue;
    }
  }

  // Normalize target weights so they always sum to 100%
  const rawTargetSum = buckets.reduce((sum, b) => sum + (targetWeights[b] || 0), 0) || 100;

  const allocations: AllocationTarget[] = [];
  let totalTaxEstimated = 0;
  let driftAlertsCount = 0;
  let maxDriftPercent = 0;

  const postRebalanceTotal =
    mode === 'CASH_INFLOW_ONLY' ? totalCurrentValue + freshCashInflow : totalCurrentValue + freshCashInflow;

  if (mode === 'CASH_INFLOW_ONLY') {
    // Compute ideal target amounts at postRebalanceTotal
    const shortfalls = buckets.map((b) => {
      const targetPct = ((targetWeights[b] || 0) / rawTargetSum) * 100;
      const desiredAmt = (targetPct / 100) * postRebalanceTotal;
      const currAmt = currentByBucket[b] || 0;
      return {
        bucket: b,
        currAmt,
        targetPct,
        shortfall: Math.max(0, desiredAmt - currAmt),
      };
    });

    const totalShortfall = shortfalls.reduce((sum, s) => sum + s.shortfall, 0);

    for (const s of shortfalls) {
      const currentPct = totalCurrentValue > 0 ? (s.currAmt / totalCurrentValue) * 100 : 0;
      const drift = currentPct - s.targetPct;
      if (Math.abs(drift) >= 5) driftAlertsCount++;
      maxDriftPercent = Math.max(maxDriftPercent, Math.abs(drift));

      const allocatedCash =
        totalShortfall > 0
          ? Math.round((s.shortfall / totalShortfall) * freshCashInflow)
          : Math.round((s.targetPct / 100) * freshCashInflow);

      allocations.push({
        bucket: s.bucket,
        currentValue: Math.round(s.currAmt),
        currentPercent: Math.round(currentPct * 10) / 10,
        targetPercent: Math.round(s.targetPct * 10) / 10,
        driftPercent: Math.round(drift * 10) / 10,
        action: allocatedCash > 500 ? 'BUY' : 'HOLD',
        recommendedAmount: allocatedCash,
        taxImpactEstimate: 0,
        rationale:
          allocatedCash > 500
            ? `Route ₹${allocatedCash.toLocaleString('en-IN')} of new SIP cash here without selling existing winners.`
            : 'Overweight vs target; pause new inflows here until drift normalizes.',
      });
    }
  } else {
    // Full Tax-Aware Sell + Buy Rebalance
    for (const b of buckets) {
      const currAmt = currentByBucket[b] || 0;
      const currentPct = totalCurrentValue > 0 ? (currAmt / totalCurrentValue) * 100 : 0;
      const targetPct = ((targetWeights[b] || 0) / rawTargetSum) * 100;
      const drift = currentPct - targetPct;
      if (Math.abs(drift) >= 5) driftAlertsCount++;
      maxDriftPercent = Math.max(maxDriftPercent, Math.abs(drift));

      const desiredAmt = (targetPct / 100) * postRebalanceTotal;
      const diff = Math.round(desiredAmt - currAmt);

      let taxEst = 0;
      if (diff < 0) {
        // Estimate average embedded gain ratio in this bucket to project STCG/LTCG tax
        const bucketHoldings = holdings.filter((h) => h.marketCapCategory === b);
        const bucketGain = bucketHoldings.reduce((sum, h) => sum + Math.max(0, h.totalPnl), 0);
        const gainRatio = currAmt > 0 ? bucketGain / currAmt : 0;
        const realizedGainEstimate = Math.abs(diff) * gainRatio;
        const hasLongTerm = bucketHoldings.some((h) => h.isLongTerm);
        taxEst = Math.round(realizedGainEstimate * (hasLongTerm ? 0.125 : 0.2));
        totalTaxEstimated += taxEst;
      }

      allocations.push({
        bucket: b,
        currentValue: Math.round(currAmt),
        currentPercent: Math.round(currentPct * 10) / 10,
        targetPercent: Math.round(targetPct * 10) / 10,
        driftPercent: Math.round(drift * 10) / 10,
        action: diff > 1000 ? 'BUY' : diff < -1000 ? 'SELL' : 'HOLD',
        recommendedAmount: Math.abs(diff),
        taxImpactEstimate: taxEst,
        rationale:
          diff > 1000
            ? `Deploy ₹${diff.toLocaleString('en-IN')} to eliminate -${Math.abs(drift).toFixed(1)}% underweight gap.`
            : diff < -1000
            ? `Trim ₹${Math.abs(diff).toLocaleString('en-IN')} (prioritizing LTCG / tax-loss lots). Est. tax: ₹${taxEst.toLocaleString('en-IN')}.`
            : 'Within tolerance band.',
      });
    }
  }

  return {
    totalCurrentValue: Math.round(totalCurrentValue),
    freshCashDeployed: freshCashInflow,
    postRebalanceTotal: Math.round(postRebalanceTotal),
    allocations,
    totalTaxEstimated,
    driftAlertsCount,
    maxDriftPercent: Math.round(maxDriftPercent * 10) / 10,
  };
}

// ==========================================
// 11. FIRE & WEALTH GOAL PROJECTION MONTE CARLO ENGINE
// ==========================================
export const INITIAL_FIRE_MILESTONES: FireGoalMilestone[] = [
  {
    id: 'goal-emergency',
    name: '12-Month Liquid Runway',
    targetAmountToday: 900000,
    yearsAway: 1,
    priority: 'ESSENTIAL',
  },
  {
    id: 'goal-home',
    name: 'Metro Home Down Payment',
    targetAmountToday: 3500000,
    yearsAway: 5,
    priority: 'ESSENTIAL',
  },
  {
    id: 'goal-fire',
    name: 'Financial Independence (FIRE)',
    targetAmountToday: 30000000,
    yearsAway: 16,
    priority: 'ESSENTIAL',
  },
  {
    id: 'goal-sabbatical',
    name: '2-Year Family World Sabbatical',
    targetAmountToday: 2400000,
    yearsAway: 8,
    priority: 'ASPIRATIONAL',
  },
];

// Deterministic-friendly pseudo-random normal generator (Mulberry32 + Box-Muller)
function createSeededRng(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function sampleStandardNormal(rng: () => number): number {
  const u1 = Math.max(1e-7, rng());
  const u2 = rng();
  return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
}

export function runFireMonteCarloSimulation(input: FireSimulationInput): FireSimulationOutput {
  const {
    currentCorpus,
    monthlySip,
    annualStepUpPercent,
    expectedCagrPercent,
    annualVolatilityPercent,
    inflationPercent,
    annualExpenseToday,
    safeWithdrawalRate,
    yearsToSimulate,
  } = input;

  const fireNumberToday = Math.round(annualExpenseToday / Math.max(0.01, safeWithdrawalRate / 100));
  const inflationRate = inflationPercent / 100;
  const mu = expectedCagrPercent / 100;
  const sigma = annualVolatilityPercent / 100;
  const trials = 400; // Fast, accurate real-time Monte Carlo

  const rng = createSeededRng(20261115);

  // Store nominal values for each trial at each year
  const yearResults: number[][] = Array.from({ length: yearsToSimulate + 1 }, () => []);
  const principalByYear: number[] = [];

  let cumulativePrincipal = currentCorpus;
  principalByYear.push(cumulativePrincipal);
  for (let y = 1; y <= yearsToSimulate; y++) {
    const annualContribution = monthlySip * 12 * Math.pow(1 + annualStepUpPercent / 100, y - 1);
    cumulativePrincipal += annualContribution;
    principalByYear.push(Math.round(cumulativePrincipal));
  }

  let successCount = 0;

  for (let t = 0; t < trials; t++) {
    let corpus = currentCorpus;
    yearResults[0].push(corpus);

    for (let y = 1; y <= yearsToSimulate; y++) {
      const z = sampleStandardNormal(rng);
      // Geometric Brownian Motion annual step
      const annualReturn = Math.exp((mu - 0.5 * sigma * sigma) + sigma * z) - 1;
      const annualContribution = monthlySip * 12 * Math.pow(1 + annualStepUpPercent / 100, y - 1);
      corpus = Math.max(0, corpus * (1 + annualReturn) + annualContribution);
      yearResults[y].push(corpus);
    }

    const finalRealCorpus = corpus / Math.pow(1 + inflationRate, yearsToSimulate);
    if (finalRealCorpus >= fireNumberToday) {
      successCount++;
    }
  }

  const trajectory: FireProjectionPoint[] = [];
  let yearsToFireMedian: number | null = null;

  for (let y = 0; y <= yearsToSimulate; y++) {
    const sorted = [...yearResults[y]].sort((a, b) => a - b);
    const p10Nominal = sorted[Math.floor(trials * 0.1)];
    const p50Nominal = sorted[Math.floor(trials * 0.5)];
    const p90Nominal = sorted[Math.floor(trials * 0.9)];

    const deflator = Math.pow(1 + inflationRate, y);
    const p10Real = Math.round(p10Nominal / deflator);
    const p50Real = Math.round(p50Nominal / deflator);
    const p90Real = Math.round(p90Nominal / deflator);

    if (yearsToFireMedian === null && p50Real >= fireNumberToday) {
      yearsToFireMedian = y;
    }

    trajectory.push({
      year: new Date().getFullYear() + y,
      ageOffset: y,
      p10RealCorpus: p10Real,
      p50RealCorpus: p50Real,
      p90RealCorpus: p90Real,
      p50NominalCorpus: Math.round(p50Nominal),
      fireTargetReal: fireNumberToday,
      investedPrincipal: Math.round(principalByYear[y] / deflator),
    });
  }

  const finalPoint = trajectory[trajectory.length - 1];
  const fireNumberAtHorizon = Math.round(fireNumberToday * Math.pow(1 + inflationRate, yearsToSimulate));
  const sustainableMonthlyWithdrawalToday = Math.round(
    (finalPoint.p50RealCorpus * (safeWithdrawalRate / 100)) / 12
  );

  return {
    fireNumberToday,
    fireNumberAtHorizon,
    medianProjectedRealCorpus: finalPoint.p50RealCorpus,
    probabilityOfSuccess: Math.round((successCount / trials) * 100),
    yearsToFireMedian,
    sustainableMonthlyWithdrawalToday,
    trajectory,
  };
}
