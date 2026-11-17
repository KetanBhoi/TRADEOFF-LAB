import React, { useMemo, useState } from 'react';
import {
  INITIAL_FII_DII_FLOWS,
  INITIAL_DERIVATIVES_SNAPSHOT,
} from '../../utils/moreModulesData';
import { StatCard } from '../common/StatCard';
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from 'recharts';
import { Activity, Info, TrendingUp, ShieldAlert } from 'lucide-react';

export const FiiDiiFlowsTab: React.FC = () => {
  const [windowSessions, setWindowSessions] = useState<10 | 20>(20);

  const visibleFlows = useMemo(
    () => INITIAL_FII_DII_FLOWS.slice(-windowSessions),
    [windowSessions]
  );

  const fiiSum = Math.round(visibleFlows.reduce((s, d) => s + d.fiiNetCr, 0));
  const diiSum = Math.round(visibleFlows.reduce((s, d) => s + d.diiNetCr, 0));
  const netInstitutional = fiiSum + diiSum;
  const absorptionRatio = fiiSum < 0 ? Math.round((diiSum / Math.abs(fiiSum)) * 100) : 100;

  const snap = INITIAL_DERIVATIVES_SNAPSHOT;

  return (
    <div className="space-y-6">
      {/* Header & Regulatory Framing */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 ring-4 ring-indigo-100" />
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                FII / DII Institutional Cash &amp; Derivatives Positioning
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Track Foreign (FPI/FII) vs. Domestic Institutional (MF/DII) cash flows alongside Nifty 50 absorption and F&amp;O positioning.
            </p>
          </div>

          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-lg border border-slate-200 text-xs font-semibold shrink-0">
            {([10, 20] as const).map((w) => (
              <button
                key={w}
                type="button"
                onClick={() => setWindowSessions(w)}
                className={`px-3 py-1 rounded-md transition-colors ${
                  windowSessions === w
                    ? 'bg-white text-slate-900 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Last {w} Sessions
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard
            label={`FII Cash Net (${windowSessions}D)`}
            value={`${fiiSum >= 0 ? '+' : '-'}₹${Math.abs(fiiSum).toLocaleString('en-IN')} Cr`}
            subtext="Foreign Institutional Investors"
            statusType={fiiSum >= 0 ? 'nominal' : 'demanding'}
          />
          <StatCard
            label={`DII Cash Net (${windowSessions}D)`}
            value={`${diiSum >= 0 ? '+' : '-'}₹${Math.abs(diiSum).toLocaleString('en-IN')} Cr`}
            subtext="Domestic Mutual Funds & Insurance"
            statusType={diiSum >= 0 ? 'nominal' : 'demanding'}
          />
          <StatCard
            label="DII Absorption Ratio"
            value={`${absorptionRatio}%`}
            subtext={`Net Combined: ${netInstitutional >= 0 ? '+' : ''}₹${netInstitutional.toLocaleString('en-IN')} Cr`}
            statusType={absorptionRatio >= 85 ? 'nominal' : 'elevated'}
          />
          <StatCard
            label="Nifty PCR / FII Futures Long"
            value={`${snap.niftyPcr} · ${snap.fiiIndexFutureLongPercent}%`}
            subtext={`India VIX: ${snap.indiaVix} (Normal)`}
            statusType="neutral"
          />
        </div>
      </div>

      {/* Divergent Daily Bar Chart + Nifty Overlay */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 font-mono flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-indigo-600" />
              Daily Institutional Net Cash Flows (₹ Crore) vs. Nifty 50 Close
            </h4>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
            Descriptive Flow Data — Not a Trade Signal
          </span>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={visibleFlows}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} />
              <YAxis
                yAxisId="left"
                tickFormatter={(v) => `${v >= 0 ? '+' : ''}${(v / 1000).toFixed(1)}k`}
                tick={{ fontSize: 10 }}
                width={48}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                domain={['auto', 'auto']}
                tick={{ fontSize: 10 }}
                width={52}
              />
              <Tooltip
                formatter={(val, name) => {
                  const num = typeof val === 'number' ? val : Number(val ?? 0);
                  return name === 'Nifty 50'
                    ? num.toLocaleString('en-IN')
                    : `₹${num.toLocaleString('en-IN')} Cr`;
                }}
              />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <ReferenceLine yAxisId="left" y={0} stroke="#94a3b8" />
              <Bar yAxisId="left" dataKey="fiiNetCr" name="FII Net Cash" fill="#e11d48" radius={[3, 3, 0, 0]} />
              <Bar yAxisId="left" dataKey="diiNetCr" name="DII Net Cash" fill="#059669" radius={[3, 3, 0, 0]} />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="niftyClose"
                name="Nifty 50"
                stroke="#0f172a"
                strokeWidth={2}
                dot={{ r: 2.5 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Derivatives Positioning + Session Log */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-5 p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 font-mono flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-emerald-600" />
            F&amp;O Participant Positioning Snapshot
          </h4>

          <div className="space-y-3 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex justify-between font-mono font-bold">
                <span className="text-slate-700">FII Index Futures Long / Short Ratio</span>
                <span className="text-slate-900">
                  {snap.fiiIndexFutureLongPercent}% / {snap.fiiIndexFutureShortPercent}%
                </span>
              </div>
              <div className="w-full h-2.5 rounded-full overflow-hidden bg-rose-200 flex">
                <div
                  className="bg-emerald-600 h-full"
                  style={{ width: `${snap.fiiIndexFutureLongPercent}%` }}
                />
                <div
                  className="bg-rose-600 h-full"
                  style={{ width: `${snap.fiiIndexFutureShortPercent}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] font-mono text-slate-500">
                <span>Long: {snap.fiiIndexFutureLongPercent}%</span>
                <span>Short: {snap.fiiIndexFutureShortPercent}%</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-indigo-50/70 border border-indigo-200 space-y-1.5">
              <div className="font-bold text-indigo-950 flex items-center gap-1.5">
                <Info className="w-4 h-4 text-indigo-600" />
                <span>Regime Context: {snap.regimeLabel}</span>
              </div>
              <p className="text-[11px] text-indigo-900 leading-relaxed">{snap.regimeSummary}</p>
            </div>

            <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200 flex items-start gap-2 text-[11px] text-amber-900">
              <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>
                Historical flow series is purely descriptive context. Institutional hedging in F&amp;O does not guarantee directional spot moves.
              </span>
            </div>
          </div>
        </div>

        {/* Daily Ledger Table */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 font-mono">
              Session-by-Session Institutional Flow Ledger
            </h4>
            <span className="text-[10px] font-mono text-slate-500">NSE / NSDL Cash Provisional</span>
          </div>
          <div className="max-h-72 overflow-y-auto">
            <table className="w-full text-left text-xs font-mono border-collapse">
              <thead className="bg-slate-50 text-slate-600 text-[10px] uppercase border-b border-slate-200 sticky top-0">
                <tr>
                  <th className="py-2.5 px-4">Date</th>
                  <th className="py-2.5 px-3 text-right">FII Net (Cr)</th>
                  <th className="py-2.5 px-3 text-right">DII Net (Cr)</th>
                  <th className="py-2.5 px-3 text-right">Combined</th>
                  <th className="py-2.5 px-4 text-right">Nifty 50</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {[...visibleFlows].reverse().map((row) => (
                  <tr key={row.date} className="hover:bg-slate-50">
                    <td className="py-2 px-4 text-slate-700 font-semibold">{row.date}</td>
                    <td className={`py-2 px-3 text-right font-bold ${row.fiiNetCr >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                      {row.fiiNetCr >= 0 ? '+' : ''}₹{row.fiiNetCr.toLocaleString('en-IN')}
                    </td>
                    <td className={`py-2 px-3 text-right font-bold ${row.diiNetCr >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                      {row.diiNetCr >= 0 ? '+' : ''}₹{row.diiNetCr.toLocaleString('en-IN')}
                    </td>
                    <td className={`py-2 px-3 text-right font-bold ${row.combinedNetCr >= 0 ? 'text-emerald-700' : 'text-amber-700'}`}>
                      {row.combinedNetCr >= 0 ? '+' : ''}₹{row.combinedNetCr.toLocaleString('en-IN')}
                    </td>
                    <td className="py-2 px-4 text-right text-slate-900">
                      {row.niftyClose.toLocaleString('en-IN')}{' '}
                      <span className={`text-[10px] ${row.niftyChangePercent >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                        ({row.niftyChangePercent >= 0 ? '+' : ''}{row.niftyChangePercent}%)
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
