import React, { useMemo, useState } from 'react';
import {
  computeHouseholdAllocation,
  computePostTaxDebtLadder,
} from '../../utils/ultimateModulesData';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { ArrowRight, Coins, ShieldCheck } from 'lucide-react';

interface DebtSgbLadderTabProps {
  currentEquityValue: number;
  onJumpToRebalance: () => void;
}

export const DebtSgbLadderTab: React.FC<DebtSgbLadderTabProps> = ({
  currentEquityValue,
  onJumpToRebalance,
}) => {
  const [marginalSlab, setMarginalSlab] = useState<number>(30);
  const [debtLadderCapital, setDebtLadderCapital] = useState<number>(450000);
  const [goldSgbCapital, setGoldSgbCapital] = useState<number>(180000);

  const instruments = useMemo(
    () => computePostTaxDebtLadder(marginalSlab),
    [marginalSlab]
  );

  const allocation = useMemo(
    () =>
      computeHouseholdAllocation({
        equityValue: currentEquityValue,
        debtLadderValue: debtLadderCapital,
        goldSgbValue: goldSgbCapital,
      }),
    [currentEquityValue, debtLadderCapital, goldSgbCapital]
  );

  const chartData = instruments.map((inst) => ({
    name: inst.category.replace('_', ' '),
    PreTax: inst.preTaxYieldPercent,
    PostTax: inst.postTaxYieldPercent,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h3 className="text-lg font-bold text-slate-950 flex items-center gap-2">
            <Coins className="w-5 h-5 text-amber-600" />
            <span>Gold, SGB &amp; Fixed-Income Post-Tax Yield Ladder</span>
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Compare Sovereign Gold Bonds, RBI T-Bills, Arbitrage Mutual Funds, AAA Corporate Bonds, and Bank FDs after real marginal-slab tax drag, and audit total Equity : Debt : Gold balance.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg border border-slate-200">
            {[10, 20, 30].map((slab) => (
              <button
                key={slab}
                type="button"
                onClick={() => setMarginalSlab(slab)}
                className={`px-2.5 py-1.5 text-xs font-bold rounded-md transition-colors whitespace-nowrap shrink-0 ${
                  marginalSlab === slab
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {slab}% Slab
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={onJumpToRebalance}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition-colors whitespace-nowrap shrink-0"
          >
            <span>Rebalance Portfolio</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Household Asset Allocation Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white border border-slate-200">
          <span className="text-xs text-slate-500 block">Combined Household Net Worth</span>
          <span className="text-xl font-bold font-mono tabular-nums text-slate-950 mt-1 block">
            ₹{allocation.totalWealth.toLocaleString('en-IN')}
          </span>
          <span className="text-[11px] text-slate-500 block mt-1">
            Live Equity + Debt + SGB
          </span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200">
          <span className="text-xs text-slate-500 block">Equity Share (Demat)</span>
          <span className="text-xl font-bold font-mono tabular-nums text-indigo-700 mt-1 block">
            {allocation.equityPct}%
          </span>
          <span className="text-[11px] text-slate-500 font-mono tabular-nums block mt-1">
            ₹{currentEquityValue.toLocaleString('en-IN')}
          </span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200">
          <span className="text-xs text-slate-500 block">Fixed Income / Debt Share</span>
          <span className="text-xl font-bold font-mono tabular-nums text-emerald-700 mt-1 block">
            {allocation.debtPct}%
          </span>
          <span className="text-[11px] text-slate-500 font-mono tabular-nums block mt-1">
            ₹{debtLadderCapital.toLocaleString('en-IN')}
          </span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200">
          <span className="text-xs text-slate-500 block">Gold / SGB Hedge Share</span>
          <span className="text-xl font-bold font-mono tabular-nums text-amber-700 mt-1 block">
            {allocation.goldPct}%
          </span>
          <span className="text-[11px] text-slate-500 font-mono tabular-nums block mt-1">
            ₹{goldSgbCapital.toLocaleString('en-IN')}
          </span>
        </div>
      </div>

      {/* Allocation Sliders + Chart Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-5 p-5 rounded-xl bg-white border border-slate-200 space-y-4">
          <h4 className="text-sm font-bold text-slate-900">Adjust Off-Equity Allocation</h4>

          <div className="space-y-4 text-xs">
            <div>
              <div className="flex justify-between font-medium text-slate-700 mb-1">
                <span>Debt Ladder (T-Bills, Arbitrage MF, FD)</span>
                <span className="font-mono font-bold tabular-nums">
                  ₹{debtLadderCapital.toLocaleString('en-IN')}
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={2000000}
                step={25000}
                value={debtLadderCapital}
                onChange={(e) => setDebtLadderCapital(Number(e.target.value))}
                className="w-full accent-emerald-600"
              />
            </div>

            <div>
              <div className="flex justify-between font-medium text-slate-700 mb-1">
                <span>Gold / Sovereign Gold Bonds (SGB)</span>
                <span className="font-mono font-bold tabular-nums">
                  ₹{goldSgbCapital.toLocaleString('en-IN')}
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={1000000}
                step={10000}
                value={goldSgbCapital}
                onChange={(e) => setGoldSgbCapital(Number(e.target.value))}
                className="w-full accent-amber-600"
              />
            </div>
          </div>

          {/* Allocation Horizontal Meter */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <div className="flex justify-between text-xs text-slate-600 font-medium">
              <span>Target Mix Check (Suggested 65 / 25 / 10)</span>
              <span className="font-mono">
                {allocation.equityPct}/{allocation.debtPct}/{allocation.goldPct}
              </span>
            </div>
            <div className="h-3 w-full rounded-full overflow-hidden flex bg-slate-100">
              <div style={{ width: `${allocation.equityPct}%` }} className="bg-indigo-600 h-full" />
              <div style={{ width: `${allocation.debtPct}%` }} className="bg-emerald-600 h-full" />
              <div style={{ width: `${allocation.goldPct}%` }} className="bg-amber-500 h-full" />
            </div>
            <p className="text-[11px] text-slate-500">
              {allocation.goldPct < 8
                ? 'Gold/SGB sits below 8%. Consider locking SGB tax-free maturity tranche for equity drawdown hedging.'
                : allocation.debtPct < 15
                ? 'Debt buffer is under 15%. Arbitrage Funds retain higher post-tax compounding than Bank FDs in the 30% bracket.'
                : 'Balanced multi-asset resilience across equities, sovereign fixed income, and gold.'}
            </p>
          </div>
        </div>

        <div className="lg:col-span-7 p-5 rounded-xl bg-white border border-slate-200">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h4 className="text-sm font-bold text-slate-900">
                Pre-Tax vs. Post-Tax Realized Yield ({marginalSlab}% Slab + 4% Cess)
              </h4>
              <p className="text-[11px] text-slate-500">
                Notice how Arbitrage MF outperforms higher-headline FDs/Bonds once 30% slab tax applies.
              </p>
            </div>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#475569' }} />
                <YAxis tick={{ fontSize: 11, fill: '#475569' }} unit="%" />
                <Tooltip
                  formatter={(val) =>
                    `${(typeof val === 'number' ? val : Number(val ?? 0)).toFixed(2)}% p.a.`
                  }
                />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="PreTax" name="Headline Pre-Tax %" fill="#94a3b8" radius={[3, 3, 0, 0]} />
                <Bar dataKey="PostTax" name="Net Post-Tax %" fill="#16a34a" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Detailed Instrument Table */}
      <div className="rounded-xl bg-white border border-slate-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
          <h4 className="text-sm font-bold text-slate-900">Fixed-Income &amp; Sovereign Gold Instrument Ladder</h4>
          <span className="text-xs text-slate-500">Sorted by category characteristics</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
              <tr>
                <th className="px-4 py-2.5 font-semibold">Instrument</th>
                <th className="px-4 py-2.5 font-semibold">Tenor &amp; Backing</th>
                <th className="px-4 py-2.5 font-semibold text-right">Headline</th>
                <th className="px-4 py-2.5 font-semibold text-right">Tax Drag</th>
                <th className="px-4 py-2.5 font-semibold text-right">Post-Tax Yield</th>
                <th className="px-4 py-2.5 font-semibold">Tax Rule</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {instruments.map((inst) => (
                <tr key={inst.id} className="hover:bg-slate-50/70">
                  <td className="px-4 py-3">
                    <div className="font-bold text-slate-900">{inst.name}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">{inst.liquidityNote}</div>
                  </td>
                  <td className="px-4 py-3 text-slate-700">
                    <div>{inst.tenorLabel}</div>
                    <div className="text-[11px] text-slate-500">{inst.ratingOrSovereign}</div>
                  </td>
                  <td className="px-4 py-3 text-right font-mono tabular-nums text-slate-700">
                    {inst.preTaxYieldPercent.toFixed(2)}%
                  </td>
                  <td className="px-4 py-3 text-right font-mono tabular-nums text-rose-700">
                    -{inst.taxDragPercent.toFixed(2)}%
                  </td>
                  <td className="px-4 py-3 text-right font-mono tabular-nums font-bold text-emerald-700">
                    {inst.postTaxYieldPercent.toFixed(2)}%
                  </td>
                  <td className="px-4 py-3 text-slate-600 max-w-xs">{inst.taxTreatment}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
