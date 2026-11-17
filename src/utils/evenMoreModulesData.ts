import {
  TradingHolding,
  DividendPayoutSchedule,
  PledgeableAssetItem,
  BrokerageSegment,
  ContractNoteChargeBreakdown,
} from '../types/trading';

export const DIVIDEND_SCHEDULES: DividendPayoutSchedule[] = [
  {
    symbol: 'TCS',
    companyName: 'Tata Consultancy Services Ltd.',
    annualDps: 124,
    dividendYieldPercent: 2.98,
    payoutMonths: [2, 5, 8, 11],
    nextExDate: '17 Jan',
    payoutType: 'Interim',
    fiveYearDpsCagrPercent: 9.4,
  },
  {
    symbol: 'INFY',
    companyName: 'Infosys Limited',
    annualDps: 46,
    dividendYieldPercent: 2.45,
    payoutMonths: [6, 11],
    nextExDate: '29 May',
    payoutType: 'Final',
    fiveYearDpsCagrPercent: 11.2,
  },
  {
    symbol: 'HDFCBANK',
    companyName: 'HDFC Bank Limited',
    annualDps: 19.5,
    dividendYieldPercent: 1.12,
    payoutMonths: [5],
    nextExDate: '10 May',
    payoutType: 'Final',
    fiveYearDpsCagrPercent: 14.5,
  },
  {
    symbol: 'TATAMOTORS',
    companyName: 'Tata Motors Limited',
    annualDps: 6.0,
    dividendYieldPercent: 0.74,
    payoutMonths: [6],
    nextExDate: '11 Jun',
    payoutType: 'Final',
    fiveYearDpsCagrPercent: 18.0,
  },
  {
    symbol: 'WAAREE',
    companyName: 'Waaree Energies Ltd.',
    annualDps: 4.5,
    dividendYieldPercent: 0.15,
    payoutMonths: [9],
    nextExDate: '12 Sep',
    payoutType: 'Final',
    fiveYearDpsCagrPercent: 6.0,
  },
  {
    symbol: 'BAJAJHFL',
    companyName: 'Bajaj Housing Finance Ltd.',
    annualDps: 1.2,
    dividendYieldPercent: 0.87,
    payoutMonths: [7],
    nextExDate: '24 Jul',
    payoutType: 'Final',
    fiveYearDpsCagrPercent: 8.5,
  },
];

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function computeDividendCalendar(holdings: TradingHolding[]) {
  const monthlyCashflow = MONTH_LABELS.map((month, idx) => ({
    month,
    monthNum: idx + 1,
    payoutAmount: 0,
    payers: [] as string[],
  }));

  const rows = holdings.map((h) => {
    const sched = DIVIDEND_SCHEDULES.find((s) => s.symbol === h.symbol);
    const annualDps = sched?.annualDps ?? Math.round(h.currentPrice * 0.005 * 100) / 100;
    const annualIncome = Math.round(annualDps * h.quantity);
    const yieldOnCost =
      h.investedValue > 0 ? Math.round((annualIncome / h.investedValue) * 1000) / 10 : 0;
    const currentYield =
      h.currentValue > 0 ? Math.round((annualIncome / h.currentValue) * 1000) / 10 : 0;
    const months = sched?.payoutMonths ?? [8];
    const perPayout = Math.round(annualIncome / months.length);

    months.forEach((m) => {
      const slot = monthlyCashflow[m - 1];
      if (slot) {
        slot.payoutAmount += perPayout;
        slot.payers.push(`${h.symbol} (₹${perPayout.toLocaleString('en-IN')})`);
      }
    });

    return {
      symbol: h.symbol,
      companyName: h.companyName,
      quantity: h.quantity,
      annualDps,
      annualIncome,
      yieldOnCost,
      currentYield,
      nextExDate: sched?.nextExDate ?? 'Aug',
      payoutType: sched?.payoutType ?? 'Final',
      dpsGrowth5Y: sched?.fiveYearDpsCagrPercent ?? 7.0,
      tdsApplicable: annualIncome > 5000, // Section 194 Indian Income Tax Act threshold
    };
  });

  const totalAnnualDividend = rows.reduce((s, r) => s + r.annualIncome, 0);
  const totalInvested = holdings.reduce((s, h) => s + h.investedValue, 0);
  const totalCurrent = holdings.reduce((s, h) => s + h.currentValue, 0);

  return {
    rows: rows.sort((a, b) => b.annualIncome - a.annualIncome),
    monthlyCashflow,
    totalAnnualDividend,
    monthlyAverage: Math.round(totalAnnualDividend / 12),
    portfolioYieldOnCost: totalInvested > 0 ? Math.round((totalAnnualDividend / totalInvested) * 1000) / 10 : 0,
    portfolioCurrentYield: totalCurrent > 0 ? Math.round((totalAnnualDividend / totalCurrent) * 1000) / 10 : 0,
    tdsFlaggedCount: rows.filter((r) => r.tdsApplicable).length,
  };
}

const HAIRCUT_BY_SYMBOL: Record<string, number> = {
  TCS: 10,
  INFY: 10,
  HDFCBANK: 10,
  TATAMOTORS: 15,
  WAAREE: 22,
  SWIGGY: 25,
  BAJAJHFL: 20,
  HYUNDAI: 18,
};

export function buildPledgeableAssets(
  holdings: TradingHolding[],
  liquidEtfValue: number,
  pledgedState: Record<string, boolean>
): PledgeableAssetItem[] {
  const equityItems: PledgeableAssetItem[] = holdings.map((h) => {
    const haircut = HAIRCUT_BY_SYMBOL[h.symbol] ?? (h.marketCapCategory === 'Large Cap' ? 12 : 22);
    const isPledged = pledgedState[h.symbol] ?? h.marketCapCategory === 'Large Cap';
    return {
      symbol: h.symbol,
      companyName: h.companyName,
      quantity: h.quantity,
      currentValue: h.currentValue,
      haircutPercent: haircut,
      collateralValue: Math.round(h.currentValue * (1 - haircut / 100)),
      assetClass: 'EQUITY_NON_CASH',
      isPledged,
    };
  });

  const liquidItem: PledgeableAssetItem = {
    symbol: 'LIQUIDBEES',
    companyName: 'Nippon India ETF Liquid BeES (Cash Eqv.)',
    quantity: Math.round(liquidEtfValue / 1000),
    currentValue: liquidEtfValue,
    haircutPercent: 10,
    collateralValue: Math.round(liquidEtfValue * 0.9),
    assetClass: 'CASH_EQUIVALENT',
    isPledged: pledgedState['LIQUIDBEES'] ?? true,
  };

  return [liquidItem, ...equityItems];
}

/**
 * Computes exact statutory Indian brokerage & transaction friction for round-trip trades.
 */
export function computeContractNoteCharges(
  segment: BrokerageSegment,
  buyPrice: number,
  sellPrice: number,
  quantity: number,
  brokeragePerOrder: number
): ContractNoteChargeBreakdown {
  const buyTurnover = Math.round(buyPrice * quantity * 100) / 100;
  const sellTurnover = Math.round(sellPrice * quantity * 100) / 100;
  const totalTurnover = Math.round((buyTurnover + sellTurnover) * 100) / 100;
  const grossPnl = Math.round((sellTurnover - buyTurnover) * 100) / 100;

  let brokerage = brokeragePerOrder * 2;
  let stt = 0;
  let exchangeTxCharge = 0;
  let stampDuty = 0;
  let dpCharge = 0;

  if (segment === 'EQUITY_DELIVERY') {
    brokerage = 0; // Zero-brokerage delivery norm across discount brokers (e.g. Zerodha)
    stt = Math.round(totalTurnover * 0.001); // 0.1% buy + 0.1% sell
    exchangeTxCharge = Math.round(totalTurnover * 0.0000297 * 100) / 100;
    stampDuty = Math.round(buyTurnover * 0.00015);
    dpCharge = 15.93; // CDSL ₹13.50 + GST on delivery sell
  } else if (segment === 'EQUITY_INTRADAY') {
    brokerage = Math.min(brokeragePerOrder, buyTurnover * 0.0003) + Math.min(brokeragePerOrder, sellTurnover * 0.0003);
    brokerage = Math.round(brokerage * 100) / 100;
    stt = Math.round(sellTurnover * 0.00025); // 0.025% sell side
    exchangeTxCharge = Math.round(totalTurnover * 0.0000297 * 100) / 100;
    stampDuty = Math.round(buyTurnover * 0.00003);
  } else if (segment === 'EQUITY_FUTURES') {
    brokerage = Math.min(brokeragePerOrder, buyTurnover * 0.0003) + Math.min(brokeragePerOrder, sellTurnover * 0.0003);
    brokerage = Math.round(brokerage * 100) / 100;
    stt = Math.round(sellTurnover * 0.0002); // Updated Oct 2024 0.02% futures STT
    exchangeTxCharge = Math.round(totalTurnover * 0.0000173 * 100) / 100;
    stampDuty = Math.round(buyTurnover * 0.00002);
  } else {
    // EQUITY_OPTIONS (premium-based turnover)
    brokerage = brokeragePerOrder * 2;
    stt = Math.round(sellTurnover * 0.001); // Updated Oct 2024 0.1% options sell STT
    exchangeTxCharge = Math.round(totalTurnover * 0.0003503 * 100) / 100;
    stampDuty = Math.round(buyTurnover * 0.00003);
  }

  const sebiTurnoverFee = Math.round(totalTurnover * 0.000001 * 100) / 100; // ₹10 per Crore
  const gst = Math.round((brokerage + exchangeTxCharge + sebiTurnoverFee) * 0.18 * 100) / 100;
  const totalCharges = Math.round((brokerage + stt + exchangeTxCharge + sebiTurnoverFee + stampDuty + dpCharge + gst) * 100) / 100;
  const netPnl = Math.round((grossPnl - totalCharges) * 100) / 100;
  const breakevenPointsPerUnit = quantity > 0 ? Math.round((totalCharges / quantity) * 100) / 100 : 0;
  const breakevenMovePercent = buyPrice > 0 ? Math.round((breakevenPointsPerUnit / buyPrice) * 10000) / 100 : 0;

  return {
    buyTurnover,
    sellTurnover,
    totalTurnover,
    grossPnl,
    brokerage,
    stt,
    exchangeTxCharge,
    sebiTurnoverFee,
    stampDuty,
    dpCharge,
    gst,
    totalCharges,
    netPnl,
    breakevenPointsPerUnit,
    breakevenMovePercent,
  };
}
