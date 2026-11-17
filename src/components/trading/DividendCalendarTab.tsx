import React, { useMemo, useState } from 'react';
import { TradingHolding } from '../../types/trading';
import { computeDividendCalendar } from '../../utils/evenMoreModulesData';
import { StatCard } from '../common/StatCard';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { Calendar, Coins, AlertTriangle, ExternalLink, TrendingUp } from 'lucide-react';

interface DividendCalendarTabProps {
  holdings: TradingHolding[];
  onTradeSymbol?: (symbol: string) => void;
}

export const DividendCalendarTab: React.FC<DividendCalendarTabProps> = ({
  holdings,
  onTradeSymbol,
}) => {
  const [dripYears, setDripYears] = useState(10);
  const [assumedPriceGrowth, setAssumedPriceGrowth] = useState(10);

  const cal = useMemo(() => computeDividendCalendar(holdings), [holdings]);

  // Projected DRIP passive annual dividend after N years
  const projectedFutureDividend = useMemo(() => {
    const weightedGrowth =
      cal.rows.length > 0
        ? cal.rows.reduce((s, r) => s + r.dpsGrowth5Y, 0) / cal.rows.length
        : 8;
    const effectiveGrowth = (weightedGrowth + (assumedPriceGrowth > 0 ? 1.5 : 0)) / 100;
    return Math.round(cal.totalAnnualDividend * Math.pow(1 + effectiveGrowth, dripYears));
  }, [cal, dripYears, assumedPriceGrowth]);

  return (
    <div className="space-y-6">
      {/* Summary Header */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-emerald-100" />
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                Passive Dividend Calendar, Yield-on-Cost &amp; TDS Tracker
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Forecasts annual passive income across your Demat holdings, compares Yield-on-Cost vs. current yield, and flags Section 194 TDS (&gt;₹5,000/company).
            </p>
          </div>
          <span className="px-2.5 py-1 text-[11px] font-mono font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg shrink-0">
            Sec 194 TDS Audit Active
          </span>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard
            label="Projected Annual Dividend"
            value={`₹${cal.totalAnnualDividend.toLocaleString('en-IN')}`}
            subtext={`~₹${cal.monthlyAverage.toLocaleString('en-IN')}/mo passive avg`}
            statusType="nominal"
          />
          <StatCard
            label="Yield-on-Cost (YoC)"
            value={`${cal.portfolioYieldOnCost}%`}
            subtext={`Current Market Yield: ${cal.portfolioCurrentYield}%`}
            statusType={cal.portfolioYieldOnCost >= cal.portfolioCurrentYield ? 'nominal' : 'neutral'}
          />
          <StatCard
            label={`DRIP Income (${dripYears}Y)`}
            value={`₹${projectedFutureDividend.toLocaleString('en-IN')}/yr`}
            subtext="Estimated w/ dividend growth"
            statusType="nominal"
          />
          <StatCard
            label="Section 194 TDS Flags"
            value={`${cal.tdsFlaggedCount} Holdings`}
            subtext="Companies paying > ₹5,000/FY"
            statusType={cal.tdsFlaggedCount > 0 ? 'elevated' : 'nominal'}
          />
        </div>
      </div>

      {/* 12-Month Dividend Cashflow Bar Chart + DRIP Simulator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-8 p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 font-mono flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-emerald-600" />
              12-Month Expected Dividend Cashflow Distribution (₹)
            </h4>
            <span className="text-[11px] font-mono text-slate-500">Based on Trailing Ex-Date Cadence</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cal.monthlyCashflow}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tickFormatter={(v) => `₹${v}`} tick={{ fontSize: 10 }} width={52} />
                <Tooltip
                  formatter={(value) => {
                    const num = typeof value === 'number' ? value : Number(value ?? 0);
                    return [`₹${num.toLocaleString('en-IN')}`, 'Estimated Payout'];
                  }}
                />
                <Bar dataKey="payoutAmount" fill="#059669" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* DRIP Horizon Controls + Tax Reminder */}
        <div className="lg:col-span-4 p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 font-mono flex items-center gap-1.5 border-b border-slate-100 pb-3">
            <TrendingUp className="w-4 h-4 text-indigo-600" />
            DRIP Compounding Horizon
          </h4>

          <div className="space-y-3 text-xs font-mono">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-slate-600">Reinvestment Years</span>
                <span className="font-bold text-slate-900">{dripYears} Years</span>
              </div>
              <input
                type="range"
                min="3"
                max="20"
                value={dripYears}
                onChange={(e) => setDripYears(parseInt(e.target.value, 10))}
                className="w-full accent-emerald-600 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-slate-600">Equity Reinvest Boost</span>
                <span className="font-bold text-slate-900">{assumedPriceGrowth}% CAGR</span>
              </div>
              <input
                type="range"
                min="0"
                max="15"
                value={assumedPriceGrowth}
                onChange={(e) => setAssumedPriceGrowth(parseInt(e.target.value, 10))}
                className="w-full accent-indigo-600 cursor-pointer"
              />
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200 flex items-start gap-2 text-[11px] text-amber-950">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <strong>Indian Dividend Tax Rule:</strong> Dividends are taxed at your marginal Income Tax slab rate. Companies deduct 10% TDS under Section 194 if total annual payout from a single company exceeds ₹5,000 (Form 26AS / AIS credit applies).
            </div>
          </div>
        </div>
      </div>

      {/* Per-Holding Yield-on-Cost Breakdown */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 font-mono flex items-center gap-1.5">
            <Coins className="w-4 h-4 text-amber-600" />
            Holding-Level Yield-on-Cost &amp; Next Ex-Dates
          </h4>
          <span className="text-[11px] font-mono text-slate-500">Click ticker to load in Terminal</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-600 font-mono text-[10px] uppercase border-b border-slate-200">
                <th className="py-3 px-4">Stock</th>
                <th className="py-3 px-3 text-right">Shares</th>
                <th className="py-3 px-3 text-right">Annual DPS</th>
                <th className="py-3 px-3 text-right">Est. Annual Cash</th>
                <th className="py-3 px-3 text-right">Yield on Cost</th>
                <th className="py-3 px-3 text-right">5Y DPS Growth</th>
                <th className="py-3 px-3 text-center">Next Ex-Date</th>
                <th className="py-3 px-4 text-center">TDS Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {cal.rows.map((r) => (
                <tr key={r.symbol} className="hover:bg-slate-50/70">
                  <td className="py-2.5 px-4 font-sans">
                    <div className="flex items-center gap-1.5">
                      {onTradeSymbol ? (
                        <button
                          type="button"
                          onClick={() => onTradeSymbol(r.symbol)}
                          className="font-mono font-bold text-indigo-700 hover:underline inline-flex items-center gap-1"
                        >
                          <span>{r.symbol}</span>
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      ) : (
                        <strong className="font-mono text-slate-900">{r.symbol}</strong>
                      )}
                    </div>
                    <div className="text-[10px] text-slate-500 truncate max-w-[180px]">{r.companyName}</div>
                  </td>
                  <td className="py-2.5 px-3 text-right text-slate-700">{r.quantity}</td>
                  <td className="py-2.5 px-3 text-right text-slate-900 font-semibold">₹{r.annualDps}</td>
                  <td className="py-2.5 px-3 text-right font-bold text-emerald-700">
                    ₹{r.annualIncome.toLocaleString('en-IN')}
                  </td>
                  <td className="py-2.5 px-3 text-right font-bold text-indigo-700">{r.yieldOnCost}%</td>
                  <td className="py-2.5 px-3 text-right text-slate-600">+{r.dpsGrowth5Y}%</td>
                  <td className="py-2.5 px-3 text-center text-slate-700">
                    {r.nextExDate} <span className="text-[10px] text-slate-400">({r.payoutType})</span>
                  </td>
                  <td className="py-2.5 px-4 text-center">
                    {r.tdsApplicable ? (
                      <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-100 text-amber-800 rounded border border-amber-200">
                        10% TDS (&gt;₹5k)
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-100 text-emerald-800 rounded">
                        Exempt (&le;₹5k)
                      </span>
                    )}
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
