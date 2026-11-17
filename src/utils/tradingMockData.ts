import {
  IpoItem,
  LiveMarketQuote,
  IpoAllotmentCheckResult,
  StrategyConfig,
  BacktestResult,
  BacktestTrade,
  OrderSide,
} from '../types/trading';

export const INITIAL_IPOS: IpoItem[] = [
  {
    id: 'ipo-swiggy',
    symbol: 'SWIGGY',
    companyName: 'Swiggy Limited',
    sector: 'Consumer Tech & Food Delivery',
    priceBandMin: 371,
    priceBandMax: 390,
    issueSizeCr: 11327,
    lotSize: 38,
    retailQuotaPercent: 10,
    openDate: '2024-11-06',
    closeDate: '2024-11-08',
    listingDate: '2024-11-13',
    status: 'open',
    subscriptionQib: 6.02,
    subscriptionNii: 0.41,
    subscriptionRetail: 1.14,
    totalSubscription: 3.59,
    gmpPrice: 12,
    gmpPercent: 3.1,
    issuePrice: 390,
    registrar: 'Link Intime India Pvt Ltd',
    exchange: 'NSE / BSE',
    description: 'Pioneering consumer convenience platform operating food delivery, Instamart quick commerce, and dining solutions across India.',
    leadManagers: ['Kotak Mahindra Capital', 'Citigroup Global Markets', 'J.P. Morgan India'],
  },
  {
    id: 'ipo-hyundai',
    symbol: 'HYUNDAI',
    companyName: 'Hyundai Motor India Ltd',
    sector: 'Automobile & Clean Mobility',
    priceBandMin: 1865,
    priceBandMax: 1960,
    issueSizeCr: 27870,
    lotSize: 7,
    retailQuotaPercent: 35,
    openDate: '2024-10-15',
    closeDate: '2024-10-17',
    listingDate: '2024-10-22',
    status: 'listed',
    subscriptionQib: 6.97,
    subscriptionNii: 0.60,
    subscriptionRetail: 0.50,
    totalSubscription: 2.37,
    gmpPrice: -25,
    gmpPercent: -1.3,
    issuePrice: 1960,
    listingPrice: 1934,
    currentPrice: 1845,
    listingGainPercent: -1.3,
    registrar: 'KFin Technologies Ltd',
    exchange: 'NSE / BSE',
    description: 'The largest IPO in Indian market history. India’s second-largest passenger vehicle maker with 15% domestic market share and massive export footprint.',
    leadManagers: ['Kotak Mahindra Capital', 'Citigroup', 'Morgan Stanley', 'J.P. Morgan'],
  },
  {
    id: 'ipo-waaree',
    symbol: 'WAAREE',
    companyName: 'Waaree Energies Limited',
    sector: 'Renewable Energy & Solar PV',
    priceBandMin: 1427,
    priceBandMax: 1503,
    issueSizeCr: 4321,
    lotSize: 9,
    retailQuotaPercent: 35,
    openDate: '2024-10-21',
    closeDate: '2024-10-23',
    listingDate: '2024-10-28',
    status: 'listed',
    subscriptionQib: 208.63,
    subscriptionNii: 62.49,
    subscriptionRetail: 10.79,
    totalSubscription: 76.34,
    gmpPrice: 1560,
    gmpPercent: 103.8,
    issuePrice: 1503,
    listingPrice: 2550,
    currentPrice: 2980,
    listingGainPercent: 69.7,
    registrar: 'Link Intime India Pvt Ltd',
    exchange: 'NSE / BSE',
    description: 'Largest manufacturer of solar PV modules in India with 12 GW capacity. Massive oversubscription led to historic listing-day alpha.',
    leadManagers: ['Axis Capital', 'Jefferies India', 'Nomura Financial Advisory'],
  },
  {
    id: 'ipo-afcons',
    symbol: 'AFCONS',
    companyName: 'Afcons Infrastructure Limited',
    sector: 'Engineering & Construction',
    priceBandMin: 440,
    priceBandMax: 463,
    issueSizeCr: 5430,
    lotSize: 32,
    retailQuotaPercent: 35,
    openDate: '2024-10-25',
    closeDate: '2024-10-29',
    listingDate: '2024-11-04',
    status: 'closed',
    subscriptionQib: 3.79,
    subscriptionNii: 5.05,
    subscriptionRetail: 0.94,
    totalSubscription: 2.63,
    gmpPrice: 15,
    gmpPercent: 3.2,
    issuePrice: 463,
    registrar: 'Link Intime India Pvt Ltd',
    exchange: 'NSE / BSE',
    description: 'Shapoorji Pallonji group flagship engineering infrastructure firm building bridges, marine highways, and metro tunnels worldwide.',
    leadManagers: ['ICICI Securities', 'DAM Capital Advisors', 'Jefferies India'],
  },
  {
    id: 'ipo-bajaj',
    symbol: 'BAJAJHFL',
    companyName: 'Bajaj Housing Finance Ltd',
    sector: 'Non-Banking Financials (NBFC)',
    priceBandMin: 66,
    priceBandMax: 70,
    issueSizeCr: 6560,
    lotSize: 214,
    retailQuotaPercent: 35,
    openDate: '2024-09-09',
    closeDate: '2024-09-11',
    listingDate: '2024-09-16',
    status: 'listed',
    subscriptionQib: 111.44,
    subscriptionNii: 41.51,
    subscriptionRetail: 7.41,
    totalSubscription: 67.43,
    gmpPrice: 80,
    gmpPercent: 114.3,
    issuePrice: 70,
    listingPrice: 150,
    currentPrice: 138,
    listingGainPercent: 114.3,
    registrar: 'KFin Technologies Ltd',
    exchange: 'NSE / BSE',
    description: 'Premier housing finance company from Bajaj Group. Created immense wealth on listing day with 114% opening gains.',
    leadManagers: ['Kotak Mahindra Capital', 'BofA Securities', 'Axis Capital'],
  },
  {
    id: 'ipo-premier',
    symbol: 'PREMIERENE',
    companyName: 'Premier Energies Limited',
    sector: 'Clean Tech & Solar Cells',
    priceBandMin: 427,
    priceBandMax: 450,
    issueSizeCr: 2830,
    lotSize: 33,
    retailQuotaPercent: 35,
    openDate: '2024-08-27',
    closeDate: '2024-08-29',
    listingDate: '2024-09-03',
    status: 'listed',
    subscriptionQib: 216.67,
    subscriptionNii: 50.04,
    subscriptionRetail: 7.68,
    totalSubscription: 75.0,
    gmpPrice: 425,
    gmpPercent: 94.4,
    issuePrice: 450,
    listingPrice: 991,
    currentPrice: 1120,
    listingGainPercent: 120.2,
    registrar: 'KFin Technologies Ltd',
    exchange: 'NSE / BSE',
    description: 'Second-largest integrated solar cell and module manufacturer in India, leading the domestic green energy transition.',
    leadManagers: ['Kotak Mahindra Capital', 'J.P. Morgan', 'ICICI Securities'],
  },
  {
    id: 'ipo-ntpc',
    symbol: 'NTPCGREEN',
    companyName: 'NTPC Green Energy Ltd',
    sector: 'Renewable Utilities (PSU)',
    priceBandMin: 102,
    priceBandMax: 108,
    issueSizeCr: 10000,
    lotSize: 138,
    retailQuotaPercent: 35,
    openDate: '2024-11-19',
    closeDate: '2024-11-22',
    listingDate: '2024-11-27',
    status: 'upcoming',
    subscriptionQib: 0,
    subscriptionNii: 0,
    subscriptionRetail: 0,
    totalSubscription: 0,
    gmpPrice: 9,
    gmpPercent: 8.3,
    issuePrice: 108,
    registrar: 'KFin Technologies Ltd',
    exchange: 'NSE / BSE',
    description: 'Renewable energy arm of India’s largest state power producer NTPC, targeting 60 GW green capacity by 2032.',
    leadManagers: ['IDBI Capital', 'HDFC Bank', 'IIFL Securities', 'Nuvama Wealth'],
  },
];

export const INITIAL_MARKET_QUOTES: LiveMarketQuote[] = [
  {
    symbol: 'NIFTY 50',
    name: 'NIFTY 50 Index',
    lastPrice: 24148.20,
    change: 122.50,
    changePercent: 0.51,
    open: 24080.00,
    high: 24210.40,
    low: 24040.10,
    previousClose: 24025.70,
    volume: 184500000,
    bidPrice: 24147.50,
    askPrice: 24148.90,
    vwap: 24132.80,
    historicalCandles: generateCandleSeries(24148.20, 60),
  },
  {
    symbol: 'RELIANCE',
    name: 'Reliance Industries Ltd',
    lastPrice: 1324.60,
    change: 14.20,
    changePercent: 1.08,
    open: 1312.00,
    high: 1331.00,
    low: 1308.50,
    previousClose: 1310.40,
    volume: 8450000,
    bidPrice: 1324.40,
    askPrice: 1324.80,
    vwap: 1321.10,
    historicalCandles: generateCandleSeries(1324.60, 60),
  },
  {
    symbol: 'WAAREE',
    name: 'Waaree Energies Limited',
    lastPrice: 2980.00,
    change: 142.00,
    changePercent: 5.00,
    open: 2850.00,
    high: 3040.00,
    low: 2840.00,
    previousClose: 2838.00,
    volume: 4520000,
    bidPrice: 2978.50,
    askPrice: 2981.50,
    vwap: 2945.60,
    historicalCandles: generateCandleSeries(2980.00, 60),
  },
  {
    symbol: 'BAJAJHFL',
    name: 'Bajaj Housing Finance Ltd',
    lastPrice: 138.45,
    change: -1.85,
    changePercent: -1.32,
    open: 140.50,
    high: 142.20,
    low: 137.80,
    previousClose: 140.30,
    volume: 12400000,
    bidPrice: 138.40,
    askPrice: 138.50,
    vwap: 139.10,
    historicalCandles: generateCandleSeries(138.45, 60),
  },
  {
    symbol: 'HDFCBANK',
    name: 'HDFC Bank Ltd',
    lastPrice: 1745.80,
    change: 8.30,
    changePercent: 0.48,
    open: 1738.00,
    high: 1752.00,
    low: 1734.20,
    previousClose: 1737.50,
    volume: 9120000,
    bidPrice: 1745.50,
    askPrice: 1746.00,
    vwap: 1743.40,
    historicalCandles: generateCandleSeries(1745.80, 60),
  },
  {
    symbol: 'TATASTEEL',
    name: 'Tata Steel Limited',
    lastPrice: 151.20,
    change: -1.10,
    changePercent: -0.72,
    open: 152.80,
    high: 153.40,
    low: 150.50,
    previousClose: 152.30,
    volume: 24500000,
    bidPrice: 151.15,
    askPrice: 151.25,
    vwap: 151.80,
    historicalCandles: generateCandleSeries(151.20, 60),
  },
];

function generateCandleSeries(currentPrice: number, count: number) {
  const candles = [];
  let price = currentPrice * 0.92;
  const now = new Date();

  for (let i = count; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const dateStr = d.toISOString().split('T')[0];
    const change = (Math.random() - 0.48) * (price * 0.022);
    const open = price;
    const close = Math.max(1, price + change);
    const high = Math.max(open, close) + Math.random() * (price * 0.01);
    const low = Math.min(open, close) - Math.random() * (price * 0.01);
    const volume = Math.round(500000 + Math.random() * 2000000);

    candles.push({
      time: dateStr,
      open: Math.round(open * 100) / 100,
      high: Math.round(high * 100) / 100,
      low: Math.round(low * 100) / 100,
      close: Math.round(close * 100) / 100,
      volume,
    });
    price = close;
  }
  return candles;
}

export function simulateAllotmentCheck(panOrAppNumber: string, ipo: IpoItem): IpoAllotmentCheckResult {
  const clean = panOrAppNumber.trim().toUpperCase();
  // Deterministic hash based on input characters
  let hash = 0;
  for (let i = 0; i < clean.length; i++) {
    hash = (hash << 5) - hash + clean.charCodeAt(i);
    hash |= 0;
  }
  const positiveHash = Math.abs(hash);

  // Success probability scaled by subscription ratio (higher oversubscription = lower retail chance)
  const successChance = Math.max(0.12, Math.min(0.85, 1 / Math.max(1, ipo.subscriptionRetail)));
  const isAllotted = (positiveHash % 100) / 100 < successChance;

  const appliedLots = 1;
  const appliedShares = appliedLots * ipo.lotSize;
  const allottedShares = isAllotted ? appliedShares : 0;
  const issuePrice = ipo.issuePrice || ipo.priceBandMax;
  const refundAmount = isAllotted ? 0 : appliedShares * issuePrice;

  return {
    applicationNumber: clean.length > 8 ? clean : `APP${positiveHash.toString().slice(0, 8)}`,
    panNumber: clean.length === 10 ? clean : `ABCDE${(positiveHash % 9000 + 1000)}F`,
    companyName: ipo.companyName,
    appliedLots,
    appliedShares,
    allottedShares,
    status: isAllotted ? 'ALLOTTED' : 'NOT_ALLOTTED',
    refundAmount,
    bankRefNumber: `HDFC${positiveHash.toString().slice(0, 9)}`,
  };
}

/**
 * Strategy Backtesting Engine
 * Simulates historical execution factoring in realistic Indian transaction costs:
 * Brokerage (₹20 or 0.03%), STT (0.1%), GST (18%), stamp duty, and slippage (0.05%)
 */
export function runStrategyBacktest(
  strategy: StrategyConfig,
  candles: { time: string; open: number; high: number; low: number; close: number }[]
): BacktestResult {
  const trades: BacktestTrade[] = [];
  let inPosition = false;
  let entryPrice = 0;
  let entryTime = '';
  let positionQuantity = 0;
  let equity = 100000;
  const equityCurve: { date: string; equity: number; drawdown: number }[] = [];
  let peakEquity = equity;

  // Slippage & transaction cost parameters (SEBI / Indian Brokerage standards)
  const slippagePercent = 0.0005; // 0.05%
  const sttPercent = 0.001; // 0.1% on equity delivery / 0.025% on intraday
  const flatBrokerage = 20; // ₹20 flat per order
  const gstPercent = 0.18; // 18% on brokerage

  // Calculate EMA series for Strategy 1
  const closes = candles.map((c) => c.close);
  const fastEma = calculateEma(closes, strategy.fastPeriod || 9);
  const slowEma = calculateEma(closes, strategy.slowPeriod || 21);
  const rsiSeries = calculateRsi(closes, 14);

  for (let i = 25; i < candles.length; i++) {
    const candle = candles[i];
    const prevCandle = candles[i - 1];
    let buySignal = false;
    let sellSignal = false;

    if (strategy.type === 'ema_crossover') {
      buySignal = fastEma[i] > slowEma[i] && fastEma[i - 1] <= slowEma[i - 1];
      sellSignal = fastEma[i] < slowEma[i] && fastEma[i - 1] >= slowEma[i - 1];
    } else if (strategy.type === 'rsi_reversal') {
      buySignal = rsiSeries[i] > 30 && rsiSeries[i - 1] <= 30;
      sellSignal = rsiSeries[i] < 70 && rsiSeries[i - 1] >= 70;
    } else {
      // VWAP or Momentum: breakout above previous high
      buySignal = candle.close > prevCandle.high * 1.005;
      sellSignal = candle.close < prevCandle.low * 0.995;
    }

    // Check stop-loss / target if currently in position
    if (inPosition) {
      const targetPrice = entryPrice * (1 + strategy.targetPercent / 100);
      const stopPrice = entryPrice * (1 - strategy.stopLossPercent / 100);

      let exitReason: BacktestTrade['exitReason'] | null = null;
      let exitPrice = candle.close;

      if (candle.high >= targetPrice) {
        exitPrice = targetPrice;
        exitReason = 'TARGET';
      } else if (candle.low <= stopPrice) {
        exitPrice = stopPrice;
        exitReason = 'STOP_LOSS';
      } else if (sellSignal) {
        exitPrice = candle.close;
        exitReason = 'SIGNAL_REVERSAL';
      }

      if (exitReason) {
        // Apply slippage
        const finalExitPrice = exitPrice * (1 - slippagePercent);
        const grossPnl = (finalExitPrice - entryPrice) * positionQuantity;
        const turnover = (entryPrice + finalExitPrice) * positionQuantity;
        const totalCharges = flatBrokerage * 2 * (1 + gstPercent) + turnover * sttPercent;
        const netPnl = Math.round((grossPnl - totalCharges) * 100) / 100;
        const returnPercent = Math.round(((finalExitPrice - entryPrice) / entryPrice) * 1000) / 10;

        trades.push({
          entryTime,
          exitTime: candle.time,
          side: 'BUY',
          entryPrice: Math.round(entryPrice * 100) / 100,
          exitPrice: Math.round(finalExitPrice * 100) / 100,
          quantity: positionQuantity,
          grossPnl: Math.round(grossPnl * 100) / 100,
          charges: Math.round(totalCharges * 100) / 100,
          netPnl,
          returnPercent,
          exitReason,
        });

        equity += netPnl;
        inPosition = false;
      }
    } else if (buySignal) {
      // Enter position with fixed fractional sizing
      entryPrice = candle.close * (1 + slippagePercent);
      entryTime = candle.time;
      const tradeCapital = Math.min(strategy.capitalPerTrade || 25000, equity * 0.35);
      positionQuantity = Math.max(1, Math.floor(tradeCapital / entryPrice));
      inPosition = true;
    }

    peakEquity = Math.max(peakEquity, equity);
    const drawdown = peakEquity > 0 ? Math.round(((peakEquity - equity) / peakEquity) * 1000) / 10 : 0;
    equityCurve.push({
      date: candle.time,
      equity: Math.round(equity),
      drawdown,
    });
  }

  const totalTrades = trades.length;
  const winningTrades = trades.filter((t) => t.netPnl > 0).length;
  const losingTrades = trades.filter((t) => t.netPnl <= 0).length;
  const winRate = totalTrades > 0 ? Math.round((winningTrades / totalTrades) * 1000) / 10 : 0;

  const totalGains = trades.filter((t) => t.netPnl > 0).reduce((a, b) => a + b.netPnl, 0);
  const totalLosses = Math.abs(trades.filter((t) => t.netPnl < 0).reduce((a, b) => a + b.netPnl, 0));
  const profitFactor = totalLosses > 0 ? Math.round((totalGains / totalLosses) * 100) / 100 : totalGains > 0 ? 99 : 0;

  const totalNetPnl = Math.round(trades.reduce((a, b) => a + b.netPnl, 0));
  const totalCharges = Math.round(trades.reduce((a, b) => a + b.charges, 0));

  const maxDrawdown = Math.max(0, ...equityCurve.map((e) => e.drawdown));
  const maxDrawdownAmount = Math.round(equity * (maxDrawdown / 100));

  // Sharpe ratio approximation (annualized)
  const returns = trades.map((t) => t.returnPercent);
  const avgRet = returns.length > 0 ? returns.reduce((a, b) => a + b, 0) / returns.length : 0;
  const variance =
    returns.length > 1
      ? returns.reduce((a, b) => a + Math.pow(b - avgRet, 2), 0) / (returns.length - 1)
      : 1;
  const stdev = Math.sqrt(variance) || 1;
  const sharpeRatio = Math.round(((avgRet - 0.05) / stdev) * Math.sqrt(252) * 10) / 100;

  const avgWin = winningTrades > 0 ? totalGains / winningTrades : 0;
  const avgLoss = losingTrades > 0 ? totalLosses / losingTrades : 1;
  const expectancyRatio = Math.round(((winRate / 100) * (avgWin / avgLoss) - (1 - winRate / 100)) * 100) / 100;

  return {
    strategyName: strategy.name,
    symbol: strategy.symbol,
    totalTrades,
    winningTrades,
    losingTrades,
    winRate,
    profitFactor,
    totalNetPnl,
    totalCharges,
    maxDrawdown,
    maxDrawdownAmount,
    sharpeRatio,
    expectancyRatio,
    trades: trades.reverse(), // most recent first
    equityCurve,
  };
}

function calculateEma(values: number[], period: number): number[] {
  const k = 2 / (period + 1);
  const emaArray: number[] = [];
  let ema = values[0];
  for (let i = 0; i < values.length; i++) {
    if (i < period) {
      ema = values.slice(0, i + 1).reduce((a, b) => a + b, 0) / (i + 1);
    } else {
      ema = values[i] * k + ema * (1 - k);
    }
    emaArray.push(ema);
  }
  return emaArray;
}

function calculateRsi(values: number[], period = 14): number[] {
  const rsiArray: number[] = new Array(values.length).fill(50);
  if (values.length <= period) return rsiArray;

  let gains = 0;
  let losses = 0;

  for (let i = 1; i <= period; i++) {
    const diff = values[i] - values[i - 1];
    if (diff >= 0) gains += diff;
    else losses += Math.abs(diff);
  }

  let avgGain = gains / period;
  let avgLoss = losses / period;

  for (let i = period + 1; i < values.length; i++) {
    const diff = values[i] - values[i - 1];
    if (diff >= 0) {
      avgGain = (avgGain * (period - 1) + diff) / period;
      avgLoss = (avgLoss * (period - 1)) / period;
    } else {
      avgGain = (avgGain * (period - 1)) / period;
      avgLoss = (avgLoss * (period - 1) + Math.abs(diff)) / period;
    }

    if (avgLoss === 0) {
      rsiArray[i] = 100;
    } else {
      const rs = avgGain / avgLoss;
      rsiArray[i] = Math.round((100 - 100 / (1 + rs)) * 10) / 10;
    }
  }
  return rsiArray;
}
