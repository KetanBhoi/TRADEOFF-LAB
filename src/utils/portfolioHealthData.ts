import {
  TradingHolding,
  PortfolioHealthMetrics,
  ConcentrationAlert,
  TaxSummary,
  ScreenerStock,
  SavedScreen,
  MarketNewsItem,
  CorporateResultItem,
  RbiEventItem,
  TradeJournalEntry,
  BenchmarkMetrics,
  WhatIfScenario,
  RiskQuizQuestion,
  BrokerType,
} from '../types/trading';

// Pre-loaded realistic holdings distributed across brokers
export const INITIAL_MULTI_BROKER_HOLDINGS: TradingHolding[] = [
  {
    symbol: 'SWIGGY',
    companyName: 'Swiggy Limited',
    quantity: 150,
    buyAvgPrice: 390.0,
    currentPrice: 462.5,
    investedValue: 58500,
    currentValue: 69375,
    totalPnl: 10875,
    totalPnlPercent: 18.59,
    dayChangePercent: 2.45,
    broker: 'zerodha',
    sector: 'Consumer Tech & Quick Commerce',
    marketCapCategory: 'Large Cap',
    purchaseDate: '2024-11-13',
    holdingDays: 14,
    isLongTerm: false,
  },
  {
    symbol: 'WAAREE',
    companyName: 'Waaree Energies Limited',
    quantity: 40,
    buyAvgPrice: 1503.0,
    currentPrice: 2840.0,
    investedValue: 60120,
    currentValue: 113600,
    totalPnl: 53480,
    totalPnlPercent: 88.96,
    dayChangePercent: 3.12,
    broker: 'zerodha',
    sector: 'Solar & Renewable Energy',
    marketCapCategory: 'Mid Cap',
    purchaseDate: '2024-10-28',
    holdingDays: 30,
    isLongTerm: false,
  },
  {
    symbol: 'TATAMOTORS',
    companyName: 'Tata Motors Limited',
    quantity: 90,
    buyAvgPrice: 620.0,
    currentPrice: 785.4,
    investedValue: 55800,
    currentValue: 70686,
    totalPnl: 14886,
    totalPnlPercent: 26.68,
    dayChangePercent: -0.75,
    broker: 'upstox',
    sector: 'Automobile & EV',
    marketCapCategory: 'Large Cap',
    purchaseDate: '2023-08-15',
    holdingDays: 445,
    isLongTerm: true,
  },
  {
    symbol: 'HDFCBANK',
    companyName: 'HDFC Bank Limited',
    quantity: 50,
    buyAvgPrice: 1520.0,
    currentPrice: 1745.0,
    investedValue: 76000,
    currentValue: 87250,
    totalPnl: 11250,
    totalPnlPercent: 14.8,
    dayChangePercent: 0.85,
    broker: 'upstox',
    sector: 'Banking & Financials',
    marketCapCategory: 'Large Cap',
    purchaseDate: '2023-05-10',
    holdingDays: 542,
    isLongTerm: true,
  },
  {
    symbol: 'INFY',
    companyName: 'Infosys Limited',
    quantity: 35,
    buyAvgPrice: 1410.0,
    currentPrice: 1860.0,
    investedValue: 49350,
    currentValue: 65100,
    totalPnl: 15750,
    totalPnlPercent: 31.91,
    dayChangePercent: 1.15,
    broker: 'angelone',
    sector: 'Information Technology',
    marketCapCategory: 'Large Cap',
    purchaseDate: '2023-02-18',
    holdingDays: 624,
    isLongTerm: true,
  },
  {
    symbol: 'PREMIERENE',
    companyName: 'Premier Energies Limited',
    quantity: 60,
    buyAvgPrice: 450.0,
    currentPrice: 1085.0,
    investedValue: 27000,
    currentValue: 65100,
    totalPnl: 38100,
    totalPnlPercent: 141.11,
    dayChangePercent: -1.2,
    broker: 'angelone',
    sector: 'Solar & Renewable Energy',
    marketCapCategory: 'Mid Cap',
    purchaseDate: '2024-09-03',
    holdingDays: 85,
    isLongTerm: false,
  },
  {
    symbol: 'BAJAJHFL',
    companyName: 'Bajaj Housing Finance Ltd',
    quantity: 214,
    buyAvgPrice: 70.0,
    currentPrice: 132.5,
    investedValue: 14980,
    currentValue: 28355,
    totalPnl: 13375,
    totalPnlPercent: 89.29,
    dayChangePercent: 0.45,
    broker: 'paper',
    sector: 'Banking & Financials',
    marketCapCategory: 'Mid Cap',
    purchaseDate: '2024-09-16',
    holdingDays: 72,
    isLongTerm: false,
  },
];

const SECTOR_COLORS: Record<string, string> = {
  'Consumer Tech & Quick Commerce': '#6366f1',
  'Solar & Renewable Energy': '#10b981',
  'Automobile & EV': '#f59e0b',
  'Banking & Financials': '#3b82f6',
  'Information Technology': '#8b5cf6',
  'Infrastructure & Engineering': '#ec4899',
  'Pharmaceuticals & Healthcare': '#14b8a6',
  'Other': '#94a3b8',
};

export function computePortfolioHealth(
  holdings: TradingHolding[],
  stockThresholdPercent: number = 20,
  sectorThresholdPercent: number = 35
): PortfolioHealthMetrics {
  const totalInvested = holdings.reduce((sum, h) => sum + h.investedValue, 0);
  const totalCurrentValue = holdings.reduce((sum, h) => sum + h.currentValue, 0);
  const totalUnrealizedPnl = totalCurrentValue - totalInvested;
  const totalPnlPercent = totalInvested > 0 ? (totalUnrealizedPnl / totalInvested) * 100 : 0;

  // Sector breakdown
  const sectorMap = new Map<string, number>();
  holdings.forEach((h) => {
    sectorMap.set(h.sector, (sectorMap.get(h.sector) || 0) + h.currentValue);
  });
  const sectorAllocations = Array.from(sectorMap.entries())
    .map(([sector, value]) => ({
      sector,
      value,
      percent: totalCurrentValue > 0 ? Math.round((value / totalCurrentValue) * 1000) / 10 : 0,
      color: SECTOR_COLORS[sector] || '#64748b',
    }))
    .sort((a, b) => b.value - a.value);

  // Market Cap breakdown
  const capMap = new Map<'Large Cap' | 'Mid Cap' | 'Small Cap', number>();
  capMap.set('Large Cap', 0);
  capMap.set('Mid Cap', 0);
  capMap.set('Small Cap', 0);
  holdings.forEach((h) => {
    capMap.set(h.marketCapCategory, (capMap.get(h.marketCapCategory) || 0) + h.currentValue);
  });
  const marketCapAllocations = [
    { category: 'Large Cap' as const, value: capMap.get('Large Cap') || 0, percent: totalCurrentValue > 0 ? Math.round(((capMap.get('Large Cap') || 0) / totalCurrentValue) * 1000) / 10 : 0, color: '#2563eb' },
    { category: 'Mid Cap' as const, value: capMap.get('Mid Cap') || 0, percent: totalCurrentValue > 0 ? Math.round(((capMap.get('Mid Cap') || 0) / totalCurrentValue) * 1000) / 10 : 0, color: '#059669' },
    { category: 'Small Cap' as const, value: capMap.get('Small Cap') || 0, percent: totalCurrentValue > 0 ? Math.round(((capMap.get('Small Cap') || 0) / totalCurrentValue) * 1000) / 10 : 0, color: '#d97706' },
  ];

  // Broker breakdown
  const brokerMap = new Map<BrokerType, number>();
  holdings.forEach((h) => {
    brokerMap.set(h.broker, (brokerMap.get(h.broker) || 0) + h.currentValue);
  });
  const brokerAllocations = Array.from(brokerMap.entries()).map(([broker, value]) => ({
    broker,
    value,
    percent: totalCurrentValue > 0 ? Math.round((value / totalCurrentValue) * 1000) / 10 : 0,
  }));

  // Concentration alerts
  const concentrationAlerts: ConcentrationAlert[] = [];
  holdings.forEach((h) => {
    const weight = totalCurrentValue > 0 ? (h.currentValue / totalCurrentValue) * 100 : 0;
    if (weight > stockThresholdPercent) {
      concentrationAlerts.push({
        type: 'STOCK_OVERWEIGHT',
        title: `Single-Stock Exposure Overlimit: ${h.symbol}`,
        entityName: `${h.companyName} (${h.symbol})`,
        currentWeightPercent: Math.round(weight * 10) / 10,
        thresholdPercent: stockThresholdPercent,
        severity: weight > stockThresholdPercent * 1.5 ? 'danger' : 'warning',
      });
    }
  });

  sectorAllocations.forEach((s) => {
    if (s.percent > sectorThresholdPercent) {
      concentrationAlerts.push({
        type: 'SECTOR_OVERWEIGHT',
        title: `Sector Concentration Alert: ${s.sector}`,
        entityName: s.sector,
        currentWeightPercent: s.percent,
        thresholdPercent: sectorThresholdPercent,
        severity: s.percent > sectorThresholdPercent * 1.3 ? 'danger' : 'warning',
      });
    }
  });

  // Diversification Score (Herfindahl-Hirschman Index based)
  // Sum of squared weights across stocks
  let hhi = 0;
  holdings.forEach((h) => {
    const weight = totalCurrentValue > 0 ? (h.currentValue / totalCurrentValue) * 100 : 0;
    hhi += weight * weight;
  });
  // Best possible HHI for N equal holdings is 10,000/N. For 7 holdings ~ 1,428.
  // We scale score 0 - 100 where HHI < 1500 is ~90+, HHI > 3500 is < 50.
  const rawScore = Math.max(10, Math.min(100, Math.round(100 - (hhi / 10000) * 130 + sectorAllocations.length * 3)));
  let diversificationRating: PortfolioHealthMetrics['diversificationRating'] = 'GOOD';
  if (rawScore >= 80) diversificationRating = 'EXCELLENT';
  else if (rawScore >= 65) diversificationRating = 'GOOD';
  else if (rawScore >= 45) diversificationRating = 'CONCENTRATED';
  else diversificationRating = 'HIGH_RISK';

  // Tax calculation under current Indian Finance Act (Union Budget 2024 revisions)
  // STCG: 20% on equity gains held <= 365 days
  // LTCG: 12.5% on equity gains held > 365 days, with ₹1,25,000 annual exemption
  let stcgTotalGains = 0;
  let ltcgTotalGains = 0;

  holdings.forEach((h) => {
    const gain = Math.max(0, h.totalPnl);
    if (h.isLongTerm) {
      ltcgTotalGains += gain;
    } else {
      stcgTotalGains += gain;
    }
  });

  const stcgTaxPayable = Math.round(stcgTotalGains * 0.20);
  const ltcgExemptionLimit = 125000;
  const ltcgTaxableAmount = Math.max(0, ltcgTotalGains - ltcgExemptionLimit);
  const ltcgTaxPayable = Math.round(ltcgTaxableAmount * 0.125);
  const totalEstimatedTax = stcgTaxPayable + ltcgTaxPayable;
  const totalGains = stcgTotalGains + ltcgTotalGains;
  const effectiveTaxRatePercent = totalGains > 0 ? Math.round((totalEstimatedTax / totalGains) * 1000) / 10 : 0;

  const taxSummary: TaxSummary = {
    stcgTotalGains,
    stcgTaxPayable,
    ltcgTotalGains,
    ltcgExemptionLimit,
    ltcgTaxableAmount,
    ltcgTaxPayable,
    totalEstimatedTax,
    effectiveTaxRatePercent,
    disclaimer: 'Calculated under Indian Finance Act 2024 equity capital gains rates (STCG @ 20%, LTCG @ 12.5% exceeding ₹1.25L exemption). Surcharge and 4% Health & Education cess not included. Consult a qualified Chartered Accountant before filing returns.',
  };

  return {
    totalInvested,
    totalCurrentValue,
    totalUnrealizedPnl,
    totalPnlPercent: Math.round(totalPnlPercent * 10) / 10,
    diversificationScore: rawScore,
    diversificationRating,
    sectorAllocations,
    marketCapAllocations,
    brokerAllocations,
    concentrationAlerts,
    taxSummary,
  };
}

// Indian Screener Database
export const INITIAL_SCREENER_STOCKS: ScreenerStock[] = [
  {
    symbol: 'SWIGGY',
    companyName: 'Swiggy Limited',
    sector: 'Consumer Tech',
    marketCapCategory: 'Large Cap',
    marketCapCr: 104250,
    currentPrice: 462.5,
    peRatio: -42.5,
    pbRatio: 8.4,
    debtToEquity: 0.12,
    revenueGrowthYoYPercent: 34.8,
    profitGrowthYoYPercent: 28.5,
    promoterHoldingPercent: 0.0,
    promoterHoldingChangePercent: 0.0,
    roePercent: -12.4,
    operatingMarginPercent: -4.2,
    dividendYieldPercent: 0.0,
    dataDate: 'Q2 FY25 (Sep 2024)',
  },
  {
    symbol: 'WAAREE',
    companyName: 'Waaree Energies Limited',
    sector: 'Solar & Renewable',
    marketCapCategory: 'Mid Cap',
    marketCapCr: 81400,
    currentPrice: 2840.0,
    peRatio: 38.6,
    pbRatio: 9.8,
    debtToEquity: 0.28,
    revenueGrowthYoYPercent: 68.4,
    profitGrowthYoYPercent: 114.2,
    promoterHoldingPercent: 64.3,
    promoterHoldingChangePercent: 0.0,
    roePercent: 32.8,
    operatingMarginPercent: 18.6,
    dividendYieldPercent: 0.45,
    dataDate: 'Q2 FY25 (Sep 2024)',
  },
  {
    symbol: 'TATAMOTORS',
    companyName: 'Tata Motors Limited',
    sector: 'Automobile',
    marketCapCategory: 'Large Cap',
    marketCapCr: 288400,
    currentPrice: 785.4,
    peRatio: 9.8,
    pbRatio: 3.2,
    debtToEquity: 0.72,
    revenueGrowthYoYPercent: 18.5,
    profitGrowthYoYPercent: 74.3,
    promoterHoldingPercent: 46.4,
    promoterHoldingChangePercent: 0.12,
    roePercent: 28.4,
    operatingMarginPercent: 14.1,
    dividendYieldPercent: 0.76,
    dataDate: 'Q2 FY25 (Sep 2024)',
  },
  {
    symbol: 'HDFCBANK',
    companyName: 'HDFC Bank Limited',
    sector: 'Banking & Financials',
    marketCapCategory: 'Large Cap',
    marketCapCr: 1324500,
    currentPrice: 1745.0,
    peRatio: 18.4,
    pbRatio: 2.8,
    debtToEquity: 1.15,
    revenueGrowthYoYPercent: 14.2,
    profitGrowthYoYPercent: 16.8,
    promoterHoldingPercent: 0.0,
    promoterHoldingChangePercent: 0.0,
    roePercent: 16.8,
    operatingMarginPercent: 36.4,
    dividendYieldPercent: 1.12,
    dataDate: 'Q2 FY25 (Sep 2024)',
  },
  {
    symbol: 'INFY',
    companyName: 'Infosys Limited',
    sector: 'Information Technology',
    marketCapCategory: 'Large Cap',
    marketCapCr: 772400,
    currentPrice: 1860.0,
    peRatio: 27.8,
    pbRatio: 7.9,
    debtToEquity: 0.08,
    revenueGrowthYoYPercent: 5.1,
    profitGrowthYoYPercent: 4.8,
    promoterHoldingPercent: 14.7,
    promoterHoldingChangePercent: 0.0,
    roePercent: 31.4,
    operatingMarginPercent: 21.1,
    dividendYieldPercent: 2.45,
    dataDate: 'Q2 FY25 (Sep 2024)',
  },
  {
    symbol: 'RELIANCE',
    companyName: 'Reliance Industries Limited',
    sector: 'Conglomerate & Energy',
    marketCapCategory: 'Large Cap',
    marketCapCr: 1720000,
    currentPrice: 1265.0,
    peRatio: 24.2,
    pbRatio: 2.1,
    debtToEquity: 0.42,
    revenueGrowthYoYPercent: 11.2,
    profitGrowthYoYPercent: 8.6,
    promoterHoldingPercent: 50.3,
    promoterHoldingChangePercent: 0.05,
    roePercent: 9.8,
    operatingMarginPercent: 17.5,
    dividendYieldPercent: 0.85,
    dataDate: 'Q2 FY25 (Sep 2024)',
  },
  {
    symbol: 'PREMIERENE',
    companyName: 'Premier Energies Limited',
    sector: 'Solar & Renewable',
    marketCapCategory: 'Mid Cap',
    marketCapCr: 48900,
    currentPrice: 1085.0,
    peRatio: 52.4,
    pbRatio: 12.1,
    debtToEquity: 0.35,
    revenueGrowthYoYPercent: 120.5,
    profitGrowthYoYPercent: 198.4,
    promoterHoldingPercent: 68.2,
    promoterHoldingChangePercent: 0.0,
    roePercent: 38.6,
    operatingMarginPercent: 22.4,
    dividendYieldPercent: 0.0,
    dataDate: 'Q2 FY25 (Sep 2024)',
  },
  {
    symbol: 'BAJAJHFL',
    companyName: 'Bajaj Housing Finance Ltd',
    sector: 'Banking & Financials',
    marketCapCategory: 'Mid Cap',
    marketCapCr: 110400,
    currentPrice: 132.5,
    peRatio: 64.2,
    pbRatio: 7.8,
    debtToEquity: 4.12,
    revenueGrowthYoYPercent: 26.4,
    profitGrowthYoYPercent: 21.2,
    promoterHoldingPercent: 88.7,
    promoterHoldingChangePercent: 0.0,
    roePercent: 15.2,
    operatingMarginPercent: 28.5,
    dividendYieldPercent: 0.0,
    dataDate: 'Q2 FY25 (Sep 2024)',
  },
  {
    symbol: 'HYUNDAI',
    companyName: 'Hyundai Motor India Limited',
    sector: 'Automobile',
    marketCapCategory: 'Large Cap',
    marketCapCr: 152000,
    currentPrice: 1824.0,
    peRatio: 26.4,
    pbRatio: 14.2,
    debtToEquity: 0.02,
    revenueGrowthYoYPercent: 8.4,
    profitGrowthYoYPercent: 11.2,
    promoterHoldingPercent: 82.5,
    promoterHoldingChangePercent: 0.0,
    roePercent: 44.8,
    operatingMarginPercent: 13.8,
    dividendYieldPercent: 1.85,
    dataDate: 'Q2 FY25 (Sep 2024)',
  },
  {
    symbol: 'DIXON',
    companyName: 'Dixon Technologies (India) Ltd',
    sector: 'Consumer Electronics & EMS',
    marketCapCategory: 'Mid Cap',
    marketCapCr: 88400,
    currentPrice: 14750.0,
    peRatio: 112.4,
    pbRatio: 28.5,
    debtToEquity: 0.18,
    revenueGrowthYoYPercent: 120.2,
    profitGrowthYoYPercent: 134.5,
    promoterHoldingPercent: 33.8,
    promoterHoldingChangePercent: 0.0,
    roePercent: 29.4,
    operatingMarginPercent: 4.1,
    dividendYieldPercent: 0.05,
    dataDate: 'Q2 FY25 (Sep 2024)',
  },
  {
    symbol: 'KAYNES',
    companyName: 'Kaynes Technology India Ltd',
    sector: 'Electronics Manufacturing',
    marketCapCategory: 'Mid Cap',
    marketCapCr: 34500,
    currentPrice: 5410.0,
    peRatio: 88.5,
    pbRatio: 14.1,
    debtToEquity: 0.14,
    revenueGrowthYoYPercent: 58.4,
    profitGrowthYoYPercent: 72.1,
    promoterHoldingPercent: 57.8,
    promoterHoldingChangePercent: 0.0,
    roePercent: 18.2,
    operatingMarginPercent: 14.5,
    dividendYieldPercent: 0.0,
    dataDate: 'Q2 FY25 (Sep 2024)',
  },
  {
    symbol: 'TRENT',
    companyName: 'Trent Limited',
    sector: 'Retail & Apparel',
    marketCapCategory: 'Large Cap',
    marketCapCr: 242000,
    currentPrice: 6810.0,
    peRatio: 138.0,
    pbRatio: 36.4,
    debtToEquity: 0.32,
    revenueGrowthYoYPercent: 39.4,
    profitGrowthYoYPercent: 46.2,
    promoterHoldingPercent: 37.0,
    promoterHoldingChangePercent: 0.0,
    roePercent: 26.8,
    operatingMarginPercent: 15.8,
    dividendYieldPercent: 0.06,
    dataDate: 'Q2 FY25 (Sep 2024)',
  },
];

export const DEFAULT_SAVED_SCREENS: SavedScreen[] = [
  {
    id: 'screen-clean-growth',
    name: 'Debt-Free High Growth Innovators',
    description: 'Companies delivering >25% YoY revenue growth with negligible debt (D/E < 0.30).',
    criteria: {
      minPe: 0,
      maxPe: 120,
      maxDebtToEquity: 0.3,
      minRevenueGrowth: 25,
      minPromoterChange: 0,
      sectorFilter: 'ALL',
      marketCapFilter: 'ALL',
    },
    matchCount: 4,
  },
  {
    id: 'screen-value-largecap',
    name: 'Value Large-Caps with High ROE',
    description: 'Established blue-chips trading at reasonable P/E (< 30) with ROE > 15%.',
    criteria: {
      minPe: 5,
      maxPe: 30,
      maxDebtToEquity: 1.0,
      minRevenueGrowth: 5,
      minPromoterChange: 0,
      sectorFilter: 'ALL',
      marketCapFilter: 'Large Cap',
    },
    matchCount: 4,
  },
  {
    id: 'screen-promoter-conviction',
    name: 'Promoter Net Accumulation',
    description: 'Firms where founders and promoters expanded their equity stake over the last 2 quarters.',
    criteria: {
      minPe: 0,
      maxPe: 150,
      maxDebtToEquity: 2.0,
      minRevenueGrowth: 0,
      minPromoterChange: 0.01,
      sectorFilter: 'ALL',
      marketCapFilter: 'ALL',
    },
    matchCount: 2,
  },
];

// Market News, Filing Disclosures, Results & RBI Events
export const INITIAL_MARKET_NEWS: MarketNewsItem[] = [
  {
    id: 'news-swiggy-q2',
    headline: 'Swiggy Limited Files Q2 Financial Disclosures with NSE: Instamart GOV Surges 58% YoY',
    source: 'NSE Corporate Filing',
    timestamp: '2 hours ago',
    date: '2024-11-20',
    category: 'EARNINGS',
    affectedSymbols: ['SWIGGY'],
    sentiment: 'BULLISH',
    filingSummary: 'Gross Order Value across quick commerce climbed 58% YoY with contribution margin turning positive at +0.3% per order. Dark store expansion continues with 120 new pods added in Tier 1 metros.',
    filingDocId: 'NSE_SWIGGY_FILING_Q2_2024.pdf',
    filingType: 'Regulation 30 LODR Disclosure',
  },
  {
    id: 'news-waaree-export',
    headline: 'Waaree Energies Bags 1.2 GW Solar Module Supply Contract from US Utility',
    source: 'BSE Announcement',
    timestamp: '4 hours ago',
    date: '2024-11-20',
    category: 'FILING',
    affectedSymbols: ['WAAREE', 'PREMIERENE'],
    sentiment: 'BULLISH',
    filingSummary: 'Contract value approximately ₹3,850 Crores for delivery between Q4 FY25 and Q2 FY26. Enhances existing order backlog to over ₹23,000 Crores.',
    filingDocId: 'BSE_WAAREE_CONTRACT_LODR.pdf',
    filingType: 'Material Contract Announcement',
  },
  {
    id: 'news-rbi-mpc',
    headline: 'RBI Monetary Policy Committee Maintains Repo Rate at 6.50%; Stance Retained as Neutral',
    source: 'RBI MPC Statement',
    timestamp: '1 day ago',
    date: '2024-11-19',
    category: 'RBI_POLICY',
    affectedSymbols: ['HDFCBANK', 'BAJAJHFL', 'TATAMOTORS'],
    sentiment: 'NEUTRAL',
    filingSummary: 'Governor highlights resilient GDP growth at 7.2% for FY25 while monitoring food inflation volatility. Systemic banking liquidity remains in modest surplus with credit growth expanding at 13.8%.',
    filingDocId: 'RBI_MPC_RESOLUTION_STATEMENT.pdf',
    filingType: 'Central Bank Policy Resolution',
  },
  {
    id: 'news-tatamotors-demerger',
    headline: 'Tata Motors Commercial & Passenger Vehicle Demerger Receives NCLT Green Light',
    source: 'NSE Corporate Filing',
    timestamp: '2 days ago',
    date: '2024-11-18',
    category: 'CORP_ACTION',
    affectedSymbols: ['TATAMOTORS'],
    sentiment: 'BULLISH',
    filingSummary: 'Demerger into two distinct listed entities (Commercial Vehicles vs Passenger/EVs + JLR) approved with targeted completion by mid-2025. Shareholders to receive 1:1 proportional shares.',
    filingDocId: 'NCLT_TATAMOTORS_DEMERGER_ORDER.pdf',
    filingType: 'Corporate Restructuring LODR',
  },
  {
    id: 'news-infy-dividend',
    headline: 'Infosys Declares Interim Dividend of ₹21 per share; Records ₹16,800 Cr Large Deal TCV',
    source: 'Exchange Circular',
    timestamp: '3 days ago',
    date: '2024-11-17',
    category: 'DIVIDEND',
    affectedSymbols: ['INFY'],
    sentiment: 'NEUTRAL',
    filingSummary: 'Board approves interim cash dividend with record date set for Nov 29. Management narrows constant-currency revenue growth guidance band to 3.75% - 4.50% for FY25.',
    filingDocId: 'INFY_Q2_DIVIDEND_CIRCULAR.pdf',
    filingType: 'Board Meeting Dividend Outcome',
  },
];

export const INITIAL_EARNINGS_CALENDAR: CorporateResultItem[] = [
  {
    id: 'earn-swiggy',
    symbol: 'SWIGGY',
    companyName: 'Swiggy Limited',
    quarter: 'Q2 FY25',
    reportDate: 'Nov 20, 2024',
    isReported: true,
    consensusRevenueCr: 3620,
    actualRevenueCr: 3740,
    consensusEps: -3.8,
    actualEps: -3.1,
    revenueSurprisePercent: 3.31,
    epsSurprisePercent: 18.4,
    guidanceVerdict: 'STRONG_BEAT',
  },
  {
    id: 'earn-waaree',
    symbol: 'WAAREE',
    companyName: 'Waaree Energies Limited',
    quarter: 'Q2 FY25',
    reportDate: 'Nov 18, 2024',
    isReported: true,
    consensusRevenueCr: 3200,
    actualRevenueCr: 3450,
    consensusEps: 18.5,
    actualEps: 22.1,
    revenueSurprisePercent: 7.81,
    epsSurprisePercent: 19.46,
    guidanceVerdict: 'STRONG_BEAT',
  },
  {
    id: 'earn-hdfc',
    symbol: 'HDFCBANK',
    companyName: 'HDFC Bank Limited',
    quarter: 'Q2 FY25',
    reportDate: 'Oct 19, 2024',
    isReported: true,
    consensusRevenueCr: 41200,
    actualRevenueCr: 40980,
    consensusEps: 22.4,
    actualEps: 22.1,
    revenueSurprisePercent: -0.53,
    epsSurprisePercent: -1.34,
    guidanceVerdict: 'IN_LINE',
  },
  {
    id: 'earn-tatamotors',
    symbol: 'TATAMOTORS',
    companyName: 'Tata Motors Limited',
    quarter: 'Q3 FY25',
    reportDate: 'Jan 28, 2025',
    isReported: false,
    consensusRevenueCr: 114500,
    consensusEps: 14.8,
    guidanceVerdict: 'PENDING',
  },
  {
    id: 'earn-infy',
    symbol: 'INFY',
    companyName: 'Infosys Limited',
    quarter: 'Q3 FY25',
    reportDate: 'Jan 16, 2025',
    isReported: false,
    consensusRevenueCr: 42100,
    consensusEps: 16.2,
    guidanceVerdict: 'PENDING',
  },
];

export const INITIAL_RBI_EVENTS: RbiEventItem[] = [
  {
    id: 'rbi-1',
    title: 'Bi-Monthly Monetary Policy Committee (MPC) Rate Decision',
    date: 'Dec 06, 2024',
    time: '10:00 AM IST',
    currentRepoRatePercent: 6.50,
    expectedConsensus: 'Status Quo (6.50% pause expected, liquidity fine-tuning via VRRR)',
    impactAssessment: 'High market impact on Rate Sensitives (Nifty Bank, Housing Finance, Auto OEM financing costs).',
  },
  {
    id: 'rbi-2',
    title: 'RBI Financial Stability Report (FSR) Release',
    date: 'Dec 27, 2024',
    time: '05:00 PM IST',
    currentRepoRatePercent: 6.50,
    expectedConsensus: 'Assessment of unsecured retail lending stress and banking Gross NPA ratios',
    impactAssessment: 'Crucial for NBFC risk-weight adjustments and credit cost trajectory.',
  },
  {
    id: 'rbi-3',
    title: 'First 2025 MPC Monetary Policy Resolution',
    date: 'Feb 07, 2025',
    time: '10:00 AM IST',
    currentRepoRatePercent: 6.50,
    expectedConsensus: 'Potential 25 bps rate cut window if headline CPI drops below 4.5%',
    impactAssessment: 'Bond yield easing, real estate and infrastructure capex tailwind.',
  },
];

// Trade Journal with Behavioral Tags & Analytics
export const INITIAL_TRADE_JOURNAL: TradeJournalEntry[] = [
  {
    id: 'tj-01',
    tradeDate: '2024-11-14',
    symbol: 'SWIGGY',
    side: 'BUY',
    quantity: 150,
    entryPrice: 412.0,
    exitPrice: 462.5,
    holdingPeriodDays: 6,
    grossPnl: 7575,
    charges: 184,
    netPnl: 7391,
    returnPercent: 12.26,
    setupReason: 'Day 2 IPO listing anchor breakout after initial stabilization at ₹395',
    expectedTarget: 460.0,
    stopLossUsed: 395.0,
    emotionalTags: ['DISCIPLINED_SETUP'],
    outcomeVerdict: 'EXECUTED_AS_PLANNED',
    lessonsLearned: 'Waiting for 10:30 AM price discovery eliminated pre-market churn risk.',
  },
  {
    id: 'tj-02',
    tradeDate: '2024-11-04',
    symbol: 'WAAREE',
    side: 'BUY',
    quantity: 50,
    entryPrice: 2650.0,
    exitPrice: 2880.0,
    holdingPeriodDays: 4,
    grossPnl: 11500,
    charges: 290,
    netPnl: 11210,
    returnPercent: 8.68,
    setupReason: 'Clean upper circuit momentum follow-through on massive institutional volume',
    expectedTarget: 2900.0,
    stopLossUsed: 2580.0,
    emotionalTags: ['DISCIPLINED_SETUP'],
    outcomeVerdict: 'EXECUTED_AS_PLANNED',
    lessonsLearned: 'Strict trailing stop-loss protected gains during the intraday dip.',
  },
  {
    id: 'tj-03',
    tradeDate: '2024-10-24',
    symbol: 'TATAMOTORS',
    side: 'BUY',
    quantity: 100,
    entryPrice: 840.0,
    exitPrice: 805.0,
    holdingPeriodDays: 2,
    grossPnl: -3500,
    charges: 195,
    netPnl: -3695,
    returnPercent: -4.17,
    setupReason: 'Saw stock jump +3% at open and jumped in without waiting for EMA confirmation',
    expectedTarget: 875.0,
    stopLossUsed: 810.0,
    emotionalTags: ['CHASED_PRICE_FOMO', 'PANIC_EXIT'],
    outcomeVerdict: 'DISCIPLINE_LAPSE',
    lessonsLearned: 'Chasing gap-ups in a consolidating market leads to getting trapped at resistance.',
  },
  {
    id: 'tj-04',
    tradeDate: '2024-10-18',
    symbol: 'BAJAJHFL',
    side: 'BUY',
    quantity: 200,
    entryPrice: 154.0,
    exitPrice: 138.0,
    holdingPeriodDays: 5,
    grossPnl: -3200,
    charges: 140,
    netPnl: -3340,
    returnPercent: -10.39,
    setupReason: 'Tried to catch falling knife after initial IPO hype cooled down',
    expectedTarget: 170.0,
    stopLossUsed: 142.0,
    emotionalTags: ['IGNORED_STOP_LOSS', 'REVENGE_TRADE'],
    outcomeVerdict: 'DISCIPLINE_LAPSE',
    lessonsLearned: 'Moved stop-loss lower from 142 to 138 out of hope. Never violate predefined stops.',
  },
  {
    id: 'tj-05',
    tradeDate: '2024-09-28',
    symbol: 'INFY',
    side: 'BUY',
    quantity: 40,
    entryPrice: 1890.0,
    exitPrice: 1910.0,
    holdingPeriodDays: 1,
    grossPnl: 800,
    charges: 110,
    netPnl: 690,
    returnPercent: 1.06,
    setupReason: 'Bullish hammer candle at 50 EMA on daily timeframe',
    expectedTarget: 1970.0,
    stopLossUsed: 1860.0,
    emotionalTags: ['EARLY_PROFIT_TAKE'],
    outcomeVerdict: 'CUT_EARLY',
    lessonsLearned: 'Closed position prematurely for +₹690 profit due to anxiety, leaving ₹3,200 on the table.',
  },
];

export function computeJournalAnalytics(entries: TradeJournalEntry[]) {
  const totalTrades = entries.length;
  const winningTrades = entries.filter((e) => e.netPnl > 0);
  const losingTrades = entries.filter((e) => e.netPnl <= 0);
  const totalNetPnl = entries.reduce((sum, e) => sum + e.netPnl, 0);
  const winRate = totalTrades > 0 ? Math.round((winningTrades.length / totalTrades) * 100) : 0;

  // Breakdown by emotional tag
  const emotionMap = new Map<string, { count: number; netPnl: number; winCount: number }>();
  entries.forEach((e) => {
    e.emotionalTags.forEach((tag) => {
      const prev = emotionMap.get(tag) || { count: 0, netPnl: 0, winCount: 0 };
      emotionMap.set(tag, {
        count: prev.count + 1,
        netPnl: prev.netPnl + e.netPnl,
        winCount: prev.winCount + (e.netPnl > 0 ? 1 : 0),
      });
    });
  });

  const emotionStats = Array.from(emotionMap.entries()).map(([tag, data]) => ({
    tag,
    label: formatEmotionTag(tag),
    count: data.count,
    netPnl: data.netPnl,
    winRate: Math.round((data.winCount / data.count) * 100),
    isFavorable: data.netPnl >= 0,
  }));

  return {
    totalTrades,
    winRate,
    totalNetPnl,
    winningCount: winningTrades.length,
    losingCount: losingTrades.length,
    emotionStats,
  };
}

export function formatEmotionTag(tag: string): string {
  switch (tag) {
    case 'DISCIPLINED_SETUP':
      return 'Disciplined Setup (Followed Plan)';
    case 'CHASED_PRICE_FOMO':
      return 'FOMO (Chased Price)';
    case 'PANIC_EXIT':
      return 'Panic Exit';
    case 'REVENGE_TRADE':
      return 'Revenge Trade';
    case 'OVER_LEVERAGED':
      return 'Over-Leveraged';
    case 'EARLY_PROFIT_TAKE':
      return 'Premature Exit (Fear of Losing Profit)';
    case 'IGNORED_STOP_LOSS':
      return 'Ignored Predefined Stop-Loss';
    default:
      return tag;
  }
}

export function exportJournalToTaxCsv(entries: TradeJournalEntry[]): string {
  const headers = [
    'Trade_ID',
    'Date_of_Sale',
    'Asset_Symbol',
    'Buy_Sell',
    'Quantity',
    'Buy_Price_INR',
    'Sale_Price_INR',
    'Holding_Days',
    'Gross_Consideration_INR',
    'STT_Brokerage_Taxes_INR',
    'Net_Capital_Gain_INR',
    'Tax_Classification',
    'Setup_Reason',
    'Behavioral_Tag',
  ];

  const rows = entries.map((e) => {
    const isSTCG = e.holdingPeriodDays <= 365;
    const grossSale = Math.round(e.exitPrice * e.quantity);
    return [
      e.id,
      e.tradeDate,
      `"${e.symbol}"`,
      e.side,
      e.quantity,
      e.entryPrice.toFixed(2),
      e.exitPrice.toFixed(2),
      e.holdingPeriodDays,
      grossSale,
      e.charges.toFixed(2),
      e.netPnl.toFixed(2),
      isSTCG ? 'STCG (20%)' : 'LTCG (12.5% > 1.25L)',
      `"${e.setupReason.replace(/"/g, '""')}"`,
      `"${e.emotionalTags.map(formatEmotionTag).join('; ')}"`,
    ].join(',');
  });

  return [headers.join(','), ...rows].join('\n');
}

// Model Portfolio Benchmark Comparison Data (Nifty 50 vs Nifty 500)
export const BENCHMARK_COMPARISON_DATA: BenchmarkMetrics = {
  portfolioReturnPercent: 24.8,
  nifty50ReturnPercent: 14.2,
  nifty500ReturnPercent: 16.9,
  sharpeRatio: 1.84,
  sortinoRatio: 2.38,
  portfolioBeta: 1.08,
  portfolioAlpha: 7.6, // % excess alpha over Nifty
  maxDrawdown: 7.2,
  nifty50Drawdown: 6.4,
  comparisonTimeline: [
    { date: 'Jun 2024', portfolio: 100, nifty50: 100, nifty500: 100 },
    { date: 'Jul 2024', portfolio: 106.2, nifty50: 103.8, nifty500: 104.5 },
    { date: 'Aug 2024', portfolio: 111.4, nifty50: 105.1, nifty500: 106.8 },
    { date: 'Sep 2024', portfolio: 118.5, nifty50: 109.4, nifty500: 111.2 },
    { date: 'Oct 2024', portfolio: 114.2, nifty50: 103.6, nifty500: 105.4 },
    { date: 'Nov 2024', portfolio: 124.8, nifty50: 114.2, nifty500: 116.9 },
  ],
};

// "What Would Have Happened" Historical Simulator
export const WHAT_IF_SCENARIOS: WhatIfScenario[] = [
  {
    id: 'sim-covid',
    title: 'The March 2020 Liquidity Flash Shock (Nifty -38%)',
    eventDescription: 'Global markets faced unprecedented pandemic panic with back-to-back lower circuits.',
    historicalDate: 'Feb 20 – Mar 23, 2020',
    asset: 'Nifty 50 Index / Bluechips',
    initialPrice: 12100,
    troughPrice: 7511,
    recoveryPrice: 15300,
    strategyOptions: [
      {
        name: 'Strategy A: Disciplined 7% Stop-Loss',
        action: 'Exited on initial breakdown at 11,250. Preserved dry powder and re-entered after 50 EMA reclaim at 9,800.',
        outcomePnlPercent: 32.5,
        drawdownMaxPercent: 7.0,
        takeaway: 'Protected capital during the 38% abyss and preserved mental composure to buy at generational valuations.',
      },
      {
        name: 'Strategy B: "Diamond Hands" (Held through the panic)',
        action: 'Did not sell anything. Watched portfolio plunge -38% over 4 weeks before fully recovering 10 months later.',
        outcomePnlPercent: 26.4,
        drawdownMaxPercent: 38.0,
        takeaway: 'Recovered eventually, but suffered massive psychological stress and 10 months of zero portfolio utility.',
      },
      {
        name: 'Strategy C: Aggressive Unhedged Averaging Down',
        action: 'Used margin to double down at 10,500 and 9,200. Forced broker liquidation at 7,600 due to margin call.',
        outcomePnlPercent: -58.0,
        drawdownMaxPercent: 62.0,
        takeaway: 'Leveraged averaging down into an unconfirmed falling market is the #1 cause of retail trading wipeout.',
      },
    ],
  },
  {
    id: 'sim-election',
    title: 'June 4, 2024 General Election Day Flash Volatility',
    eventDescription: 'Exit poll consensus was sharply contradicted by early seat leads, triggering a 1,400-point Nifty intraday crash.',
    historicalDate: 'June 04, 2024',
    asset: 'Nifty PSU Banks & Defense Basket',
    initialPrice: 100,
    troughPrice: 82,
    recoveryPrice: 104,
    strategyOptions: [
      {
        name: 'Strategy A: Blackout Rule (No Trading on Binary Event)',
        action: 'Honored pre-set event blackout. Zero intraday orders placed during the 9:15 AM - 1:30 PM counting window.',
        outcomePnlPercent: 4.0,
        drawdownMaxPercent: 0.0,
        takeaway: 'Avoided catastrophic slippage and 500% implied volatility spikes in options.',
      },
      {
        name: 'Strategy B: Panic Squared Off at Days Low',
        action: 'Sold all holdings at 11:30 AM when PSU stocks hit -18% circuit limits in panic.',
        outcomePnlPercent: -17.8,
        drawdownMaxPercent: 18.0,
        takeaway: 'Selling into illiquid intraday gap bottoms locked in permanent capital loss right before a V-shaped recovery.',
      },
    ],
  },
];

// SEBI Risk Awareness & Investor Certification Quiz
export const SEBI_RISK_QUIZ_QUESTIONS: RiskQuizQuestion[] = [
  {
    id: 'q1',
    question: 'Under SEBI regulatory guidelines and exchange margin rules, what is the primary risk of holding intraday leveraged positions (MIS)?',
    options: [
      'Your broker will guarantee you do not lose more than ₹500.',
      'Positions are automatically squared off near market close (3:20 PM) regardless of whether you are in profit or loss.',
      'You are exempt from paying STT and GST taxes.',
      'The exchange provides downside insurance on leveraged intraday orders.',
    ],
    correctAnswerIndex: 1,
    explanation: 'Intraday MIS (Margin Intraday Square-off) orders carry broker auto-square-off mandates at 3:15-3:20 PM IST. If you hold losing positions, they are liquidated at market price with auto-square-off penalty charges.',
  },
  {
    id: 'q2',
    question: 'Why does "slippage" occur when placing Market Orders during volatile IPO listing days or major news events?',
    options: [
      'The broker algorithm deliberately steals fractions of a rupee.',
      'High-speed changes in the order book mean the executed price differs from the last traded price visible on your screen.',
      'Taxes like STT and Stamp Duty are deducted before execution.',
      'Market orders are guaranteed to execute at the exact bid displayed.',
    ],
    correctAnswerIndex: 1,
    explanation: 'Market orders prioritize immediate execution over price. During fast-moving listing pops, orders execute against whatever asks are currently available, causing adverse slippage.',
  },
  {
    id: 'q3',
    question: 'What is the mathematical purpose of a strict Daily Loss Limit circuit breaker?',
    options: [
      'To prevent revenge-trading and protect psychological capital from emotional spiraling after consecutive losses.',
      'To reduce the amount of brokerage paid to the exchange.',
      'To ensure you only trade in the afternoon session.',
      'To automatically convert all intraday trades into long-term equity deliveries.',
    ],
    correctAnswerIndex: 0,
    explanation: 'A daily loss limit stops retail traders from emotional revenge trading—where losses compound rapidly as frustrated traders increase position size to "make back" money.',
  },
  {
    id: 'q4',
    question: 'Under the Indian Finance Act (revised 2024 capital gains tax provisions for equity), what is the tax rate on Short-Term Capital Gains (STCG)?',
    options: [
      '10% flat',
      '15% flat',
      '20% flat',
      'Exempt up to ₹5 Lakhs',
    ],
    correctAnswerIndex: 2,
    explanation: 'Under the Union Budget 2024 amendments, Section 111A Short-Term Capital Gains (STCG) on listed equity held for 365 days or less is taxed at a revised flat rate of 20%.',
  },
  {
    id: 'q5',
    question: 'If a trader has an account equity of ₹1,00,000 and risks 1.5% per trade with a 5% stop-loss, what is the maximum permissible position size?',
    options: [
      '₹1,00,000 (all-in)',
      '₹30,000 (₹30,000 × 5% = ₹1,500 max risk)',
      '₹50,000',
      '₹15,000',
    ],
    correctAnswerIndex: 1,
    explanation: 'Position Size = Max Dollar Risk ÷ Stop Loss % = (₹1,00,000 × 1.5%) ÷ 0.05 = ₹1,500 ÷ 0.05 = ₹30,000. This ensures that even if stopped out, you only lose 1.5% of total capital.',
  },
];
