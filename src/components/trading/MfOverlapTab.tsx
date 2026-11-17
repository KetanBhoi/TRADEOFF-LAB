import React, { useMemo, useState } from 'react';
import {
  MutualFundHolding,
  TradingHolding,
  XirrCashflow,
} from '../../types/trading';
import {
  INITIAL_MUTUAL_FUNDS,
  SAMPLE_SIP_CASHFLOWS,
  computeXirr,
  computeFundOverlaps,
  simulateDirectVsRegularCost,
} from '../../utils/moreModulesData';
import { StatCard } from '../common/StatCard';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import {
  PieChart,
  Layers,
  AlertTriangle,
  Plus,
  Trash2,
  Calculator,
  CheckCircle2,
  ArrowRightLeft,
} from 'lucide-react';

interface MfOverlapTabProps {
  holdings: TradingHolding[];
  onNotify?: (msg: string) => void;
}

export const MfOverlapTab: React.FC<MfOverlapTabProps> = ({ holdings, onNotify }) => {
  const [funds, setFunds] = useState<MutualFundHolding[]>(INITIAL_MUTUAL_FUNDS);
  const [cashflows, setCashflows] = useState<XirrCashflow[]>(SAMPLE_SIP_CASHFLOWS);
  const [newCfDate, setNewCfDate] = useState('2025-01-15');
  const [newCfAmount, setNewCfAmount] = useState(-15000);
  const [newCfLabel, setNewCfLabel] = useState('Extra Dip Tranche');

  // Direct vs Regular TER simulator controls
  const [simMonthlySip, setSimMonthlySip] = useState(25000);
  const [simYears, setSimYears] = useState(15);
  const [simGrossCagr, setSimGrossCagr] = useState(13.5);

  const xirrPercent = useMemo(() => computeXirr(cashflows), [cashflows]);
  const overlapAnalysis = useMemo(() => computeFundOverlaps(funds, holdings), [funds, holdings]);
  const terSeries = useMemo(
    () => simulateDirectVsRegularCost(simMonthlySip, simYears, simGrossCagr, 0.55, 1.55),
    [simMonthlySip, simYears, simGrossCagr]
  );

  const totalInvestedMf = funds.reduce((s, f) => s + f.investedAmount, 0);
  const totalCurrentMf = funds.reduce((s, f) => s + f.currentValue, 0);
  const regularFunds = funds.filter((f) => f.planType === 'REGULAR');
  const annualTerLeakRs = Math.round(
    regularFunds.reduce(
      (sum, f) => sum + f.currentValue * ((f.expenseRatioPercent - f.directEquivalentTerPercent) / 100),
      0
    )
  );
  const finalTerPoint = terSeries[terSeries.length - 1];

  const handleConvertRegularToDirect = (fundId: string) => {
    setFunds((prev) =>
      prev.map((f) =>
        f.id === fundId
          ? {
              ...f,
              planType: 'DIRECT',
              fundName: f.fundName.replace(' (Regular)', ' (Direct)'),
              expenseRatioPercent: f.directEquivalentTerPercent,
            }
          : f
      )
    );
    onNotify?.('Simulated switch to Direct Plan (note: check exit load & STCG/LTCG tax before redeeming).');
  };

  const handleAddCashflow = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCfDate || newCfAmount === 0) return;
    setCashflows((prev) => [
      ...prev,
      {
        id: `cf-${Date.now()}`,
        date: newCfDate,
        amount: newCfAmount,
        label: newCfLabel.trim() || 'Custom Cashflow',
      },
    ]);
  };

  return (
    <div className="space-y-6">
      {/* Header Overview */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 ring-4 ring-indigo-100" />
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                Mutual Fund XIRR, Expense Leak &amp; Portfolio Overlap Analyzer
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Spot duplicate stock exposure across Mutual Funds &amp; Direct Equity Demat holdings, compute true dated XIRR, and audit Regular-plan TER drag.
            </p>
          </div>
          <span className="px-2.5 py-1 text-[11px] font-mono font-semibold bg-slate-100 text-slate-700 border border-slate-200 rounded-lg shrink-0">
            Holdings Overlap Engine
          </span>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard
            label="MF Current Valuation"
            value={`₹${totalCurrentMf.toLocaleString('en-IN')}`}
            subtext={`Invested: ₹${totalInvestedMf.toLocaleString('en-IN')}`}
            statusType="neutral"
          />
          <StatCard
            label="Solved Ledger XIRR"
            value={xirrPercent !== null ? `${xirrPercent}% p.a.` : 'Invalid'}
            subtext="Newton-Raphson dated IRR"
            statusType={xirrPercent !== null && xirrPercent >= 12 ? 'nominal' : 'elevated'}
          />
          <StatCard
            label="Annual Regular Plan Leak"
            value={`₹${annualTerLeakRs.toLocaleString('en-IN')}/yr`}
            subtext={regularFunds.length > 0 ? `${regularFunds.length} Regular fund detected` : '100% Direct plans'}
            statusType={annualTerLeakRs > 0 ? 'demanding' : 'nominal'}
          />
          <StatCard
            label="Max Fund Overlap"
            value={`${Math.max(0, ...overlapAnalysis.pairs.map((p) => p.overlapPercent))}%`}
            subtext={`${overlapAnalysis.directStockConflicts.length} Stock conflicts w/ Demat`}
            statusType={
              Math.max(0, ...overlapAnalysis.pairs.map((p) => p.overlapPercent)) > 45
                ? 'elevated'
                : 'nominal'
            }
          />
        </div>
      </div>

      {/* Mutual Funds Table with Regular vs Direct Audit */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 font-mono flex items-center gap-1.5">
              <PieChart className="w-4 h-4 text-indigo-600" />
              Active Mutual Fund Basket ({funds.length} Schemes)
            </h4>
          </div>
          <span className="text-[11px] text-slate-500 font-mono">
            Monthly SIP Total: ₹{funds.reduce((s, f) => s + f.monthlySip, 0).toLocaleString('en-IN')}
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-600 font-mono text-[10px] uppercase border-b border-slate-200">
                <th className="py-3 px-4">Scheme Name / AMC</th>
                <th className="py-3 px-3">Plan</th>
                <th className="py-3 px-3 text-right">TER (%)</th>
                <th className="py-3 px-3 text-right">Invested</th>
                <th className="py-3 px-3 text-right">Current Value</th>
                <th className="py-3 px-3 text-right">Scheme XIRR</th>
                <th className="py-3 px-4 text-center">Audit Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {funds.map((f) => {
                const isRegular = f.planType === 'REGULAR';
                return (
                  <tr key={f.id} className="hover:bg-slate-50/70">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{f.fundName}</div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        {f.amc} · {f.category} · SIP ₹{f.monthlySip.toLocaleString('en-IN')}/mo
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                          isRegular
                            ? 'bg-rose-100 text-rose-800 border border-rose-200'
                            : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        }`}
                      >
                        {f.planType}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold">
                      <span className={isRegular ? 'text-rose-700' : 'text-slate-900'}>
                        {f.expenseRatioPercent.toFixed(2)}%
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-slate-600">
                      ₹{f.investedAmount.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">
                      ₹{f.currentValue.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-emerald-700">
                      {f.xirrPercent}%
                    </td>
                    <td className="py-3 px-4 text-center">
                      {isRegular ? (
                        <button
                          type="button"
                          onClick={() => handleConvertRegularToDirect(f.id)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-bold rounded-lg transition-colors"
                        >
                          <ArrowRightLeft className="w-3 h-3" />
                          <span>Simulate Direct Switch</span>
                        </button>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Optimized
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Overlap Matrix + Direct Equity Conflict + Direct vs Regular Simulator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Pairwise Overlap & Direct Equity Redundancy */}
        <div className="lg:col-span-6 p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 font-mono flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-amber-600" />
              Fund-to-Fund &amp; Direct Stock Overlap
            </h4>
            <span className="text-[10px] font-mono text-slate-500">Top Equity Basket Match</span>
          </div>

          <div className="space-y-2.5">
            {overlapAnalysis.pairs.map((pair, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5 text-xs">
                <div className="flex items-center justify-between gap-2">
                  <div className="font-semibold text-slate-800 truncate">
                    {pair.fundA.split(' Fund')[0]} <span className="text-slate-400">×</span> {pair.fundB.split(' Fund')[0]}
                  </div>
                  <span
                    className={`px-2 py-0.5 font-mono font-bold text-[11px] rounded shrink-0 ${
                      pair.overlapPercent >= 45
                        ? 'bg-rose-100 text-rose-800'
                        : pair.overlapPercent >= 25
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {pair.overlapPercent}% Overlap
                  </span>
                </div>
                {pair.commonStocks.length > 0 ? (
                  <div className="flex items-center flex-wrap gap-1 text-[10px] font-mono text-slate-600">
                    <span>Shared:</span>
                    {pair.commonStocks.slice(0, 5).map((st) => (
                      <span key={st.symbol} className="px-1.5 py-0.2 bg-white border border-slate-200 rounded">
                        {st.symbol} ({st.minWeight}%)
                      </span>
                    ))}
                  </div>
                ) : (
                  <div className="text-[10px] text-emerald-700 font-mono">
                    Zero top-holding overlap — strong complementary diversification.
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Direct Equity vs MF Overlap */}
          {overlapAnalysis.directStockConflicts.length > 0 && (
            <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 space-y-2 text-xs">
              <div className="flex items-center gap-1.5 font-bold text-amber-950">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>Direct Demat Stocks Also Held Inside Your Mutual Funds</span>
              </div>
              <div className="space-y-1.5">
                {overlapAnalysis.directStockConflicts.map((c) => (
                  <div key={c.symbol} className="flex items-center justify-between text-[11px] font-mono text-amber-900">
                    <span>
                      <strong>{c.symbol}</strong> ({c.directWeightPercent}% in Direct Demat)
                    </span>
                    <span>Also in {c.fundExposureCount} fund(s)</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Direct vs Regular Compounding Fee Drag Chart */}
        <div className="lg:col-span-6 p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 font-mono">
              Direct (0.55%) vs. Regular (1.55%) TER Compounding Leak
            </h4>
            <span className="text-[11px] font-mono font-bold text-rose-700">
              -₹{finalTerPoint?.commissionLost.toLocaleString('en-IN')} Lost
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2.5 text-xs font-mono">
            <div>
              <label className="text-[10px] text-slate-500 block mb-1">Monthly SIP (₹)</label>
              <input
                type="number"
                step="1000"
                min="1000"
                value={simMonthlySip}
                onChange={(e) => setSimMonthlySip(Math.max(1000, parseInt(e.target.value) || 1000))}
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-bold"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-500 block mb-1">Horizon (Yrs)</label>
              <input
                type="number"
                min="3"
                max="30"
                value={simYears}
                onChange={(e) => setSimYears(Math.min(30, Math.max(3, parseInt(e.target.value) || 10)))}
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-bold"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-500 block mb-1">Gross CAGR (%)</label>
              <input
                type="number"
                step="0.5"
                min="6"
                max="22"
                value={simGrossCagr}
                onChange={(e) => setSimGrossCagr(Math.max(6, parseFloat(e.target.value) || 12))}
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-bold"
              />
            </div>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={terSeries}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="year" tickFormatter={(v) => `Yr ${v}`} tick={{ fontSize: 10 }} />
                <YAxis
                  tickFormatter={(v) => `₹${(v / 100000).toFixed(0)}L`}
                  tick={{ fontSize: 10 }}
                  width={48}
                />
                <Tooltip
                  formatter={(value) => {
                    const num = typeof value === 'number' ? value : Number(value ?? 0);
                    return `₹${num.toLocaleString('en-IN')}`;
                  }}
                  labelFormatter={(yr) => `Year ${yr}`}
                />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Area
                  type="monotone"
                  dataKey="directCorpus"
                  name="Direct Plan Wealth"
                  stroke="#059669"
                  fill="#d1fae5"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="regularCorpus"
                  name="Regular Plan Wealth"
                  stroke="#e11d48"
                  fill="#ffe4e6"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Interactive XIRR Cashflow Ledger */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 font-mono flex items-center gap-1.5">
              <Calculator className="w-4 h-4 text-emerald-600" />
              Interactive SIP / Lumpsum XIRR Cashflow Solver
            </h4>
            <p className="text-[11px] text-slate-500">
              Negative entries represent investments/outflows; final positive entry represents current valuation or redemption.
            </p>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 font-mono text-xs font-bold text-emerald-800">
            Computed XIRR: {xirrPercent !== null ? `${xirrPercent}% p.a.` : 'Need ≥1 Outflow & ≥1 Inflow'}
          </div>
        </div>

        <form onSubmit={handleAddCashflow} className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 text-xs font-mono">
          <input
            type="date"
            value={newCfDate}
            onChange={(e) => setNewCfDate(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-semibold"
          />
          <input
            type="number"
            value={newCfAmount}
            onChange={(e) => setNewCfAmount(parseFloat(e.target.value) || 0)}
            placeholder="Amount (-ve buy / +ve value)"
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-bold"
          />
          <input
            type="text"
            value={newCfLabel}
            onChange={(e) => setNewCfLabel(e.target.value)}
            placeholder="Cashflow note..."
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
          />
          <button
            type="submit"
            className="inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Cashflow</span>
          </button>
        </form>

        <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-xl">
          <table className="w-full text-left text-xs font-mono border-collapse">
            <thead className="bg-slate-50 text-slate-600 text-[10px] uppercase border-b border-slate-200 sticky top-0">
              <tr>
                <th className="py-2 px-3">Date</th>
                <th className="py-2 px-3">Description</th>
                <th className="py-2 px-3 text-right">Cashflow (₹)</th>
                <th className="py-2 px-3 text-center">Remove</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {cashflows.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50">
                  <td className="py-2 px-3 text-slate-600">{c.date}</td>
                  <td className="py-2 px-3 font-sans text-slate-800">{c.label}</td>
                  <td
                    className={`py-2 px-3 text-right font-bold ${
                      c.amount < 0 ? 'text-rose-700' : 'text-emerald-700'
                    }`}
                  >
                    {c.amount < 0 ? '-' : '+'}₹{Math.abs(c.amount).toLocaleString('en-IN')}
                  </td>
                  <td className="py-2 px-3 text-center">
                    <button
                      type="button"
                      onClick={() => setCashflows((prev) => prev.filter((item) => item.id !== c.id))}
                      className="text-slate-400 hover:text-rose-600"
                      title="Delete cashflow"
                    >
                      <Trash2 className="w-3.5 h-3.5 mx-auto" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
