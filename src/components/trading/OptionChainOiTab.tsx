import React, { useMemo, useState } from 'react';
import {
  OptionChainIndexId,
  OptionChainInjectedLeg,
  OptionSide,
  OptionType,
} from '../../types/trading';
import { buildOptionChainSnapshot } from '../../utils/ultimateModulesData';
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
import { Activity, ArrowUpRight, Layers, ShieldAlert } from 'lucide-react';

interface OptionChainOiTabProps {
  onSendLegToPayoffLab: (leg: OptionChainInjectedLeg) => void;
}

export const OptionChainOiTab: React.FC<OptionChainOiTabProps> = ({
  onSendLegToPayoffLab,
}) => {
  const [indexId, setIndexId] = useState<OptionChainIndexId>('NIFTY');
  const [expiryType, setExpiryType] = useState<'WEEKLY' | 'MONTHLY'>('WEEKLY');
  const [actionSide, setActionSide] = useState<OptionSide>('BUY');

  const snapshot = useMemo(
    () => buildOptionChainSnapshot(indexId, expiryType),
    [indexId, expiryType]
  );

  const oiChartData = useMemo(
    () =>
      snapshot.rows.map((r) => ({
        strike: String(r.strike),
        CallOI_Lakhs: Math.round((r.callOI / 100000) * 10) / 10,
        PutOI_Lakhs: Math.round((r.putOI / 100000) * 10) / 10,
      })),
    [snapshot]
  );

  const triggerLegLoad = (type: OptionType, strike: number, premium: number) => {
    onSendLegToPayoffLab({
      indexId,
      spotPrice: snapshot.spotPrice,
      lotSize: snapshot.lotSize,
      side: actionSide,
      type,
      strike,
      premium,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h3 className="text-lg font-bold text-slate-950 flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-600" />
            <span>NSE Options Chain &amp; Open Interest (OI) Support/Resistance Desk</span>
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Inspect strike-level Call Writing walls, Put Writing support, Put-Call Ratio (PCR), and exact Max Pain settlement strike. Click any CE or PE premium to send the leg directly into the Options Payoff Lab.
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-2 shrink-0">
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg border border-slate-200">
            {(['NIFTY', 'BANKNIFTY', 'FINNIFTY'] as OptionChainIndexId[]).map((idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setIndexId(idx)}
                className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors whitespace-nowrap shrink-0 ${
                  indexId === idx
                    ? 'bg-white text-slate-950 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {idx}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg border border-slate-200">
            {(['WEEKLY', 'MONTHLY'] as const).map((exp) => (
              <button
                key={exp}
                type="button"
                onClick={() => setExpiryType(exp)}
                className={`px-2.5 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 ${
                  expiryType === exp
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {exp === 'WEEKLY' ? 'Weekly' : 'Monthly'}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg border border-slate-200">
            {(['BUY', 'SELL'] as OptionSide[]).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setActionSide(s)}
                className={`px-2.5 py-1.5 text-xs font-bold rounded-md transition-colors whitespace-nowrap shrink-0 ${
                  actionSide === s
                    ? s === 'BUY'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-rose-600 text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Side used when clicking a strike to add to Options Lab"
              >
                Click Action: {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* KPI Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white border border-slate-200">
          <span className="text-xs text-slate-500 block">Spot Index ({snapshot.indexId})</span>
          <span className="text-xl font-bold font-mono tabular-nums text-slate-950 mt-1 block">
            {snapshot.spotPrice.toLocaleString('en-IN')}
          </span>
          <span className="text-[11px] text-slate-500 font-mono mt-1 block">
            Lot Size: {snapshot.lotSize} · Step: {snapshot.strikeStep}
          </span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200">
          <span className="text-xs text-slate-500 block">Put-Call Ratio (PCR)</span>
          <span
            className={`text-xl font-bold font-mono tabular-nums mt-1 block ${
              snapshot.pcr >= 1.1
                ? 'text-emerald-700'
                : snapshot.pcr <= 0.85
                ? 'text-rose-700'
                : 'text-slate-950'
            }`}
          >
            {snapshot.pcr.toFixed(2)}
          </span>
          <span className="text-[11px] text-slate-500 mt-1 block">
            {snapshot.pcr >= 1.15
              ? 'Put Writing Bullish Support'
              : snapshot.pcr <= 0.85
              ? 'Heavy Call Overhead Supply'
              : 'Balanced / Range-Bound'}
          </span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200">
          <span className="text-xs text-slate-500 block">Calculated Max Pain</span>
          <span className="text-xl font-bold font-mono tabular-nums text-indigo-700 mt-1 block">
            {snapshot.maxPainStrike.toLocaleString('en-IN')}
          </span>
          <span className="text-[11px] text-slate-500 mt-1 block">
            Minimum Option Buyer Payout Point
          </span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200">
          <span className="text-xs text-slate-500 block">Primary OI Walls (Sup / Res)</span>
          <span className="text-base font-bold font-mono tabular-nums text-slate-950 mt-1 block">
            <span className="text-emerald-700">{snapshot.putWallStrike}</span>
            <span className="text-slate-400 mx-1.5">/</span>
            <span className="text-rose-700">{snapshot.callWallStrike}</span>
          </span>
          <span className="text-[11px] text-slate-500 mt-1 block">
            Put Support Wall vs Call Ceiling Wall
          </span>
        </div>
      </div>

      {/* OI Distribution BarChart */}
      <div className="p-5 rounded-xl bg-white border border-slate-200">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h4 className="text-sm font-bold text-slate-900">
              Open Interest Wall Across Strikes (Lakhs)
            </h4>
            <p className="text-[11px] text-slate-500">
              Tall red bars mark Call writers defending resistance; tall green bars mark Put writers defending support.
            </p>
          </div>
          <Activity className="w-4 h-4 text-slate-400" />
        </div>
        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={oiChartData} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="strike" tick={{ fontSize: 11, fill: '#475569' }} />
              <YAxis tick={{ fontSize: 11, fill: '#475569' }} />
              <Tooltip
                formatter={(val) =>
                  `${(typeof val === 'number' ? val : Number(val ?? 0)).toFixed(1)}L OI`
                }
              />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="CallOI_Lakhs" name="Call OI (Res)" fill="#e11d48" radius={[3, 3, 0, 0]} />
              <Bar dataKey="PutOI_Lakhs" name="Put OI (Sup)" fill="#16a34a" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Strike Ladder */}
      <div className="rounded-xl bg-white border border-slate-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
          <span className="font-bold text-slate-900">
            Interactive Strike Chain (Click LTP Button to Load into Payoff Lab)
          </span>
          <span className="text-slate-500 font-mono">
            Active Mode: {actionSide} · Highlighted row = ATM Strike
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
              <tr>
                <th className="px-3 py-2.5 text-right font-semibold">Call OI (L)</th>
                <th className="px-3 py-2.5 text-right font-semibold">Chg OI</th>
                <th className="px-3 py-2.5 text-right font-semibold">CE IV</th>
                <th className="px-3 py-2.5 text-right font-semibold">Call LTP</th>
                <th className="px-4 py-2.5 text-center font-bold bg-slate-100 text-slate-900">
                  STRIKE
                </th>
                <th className="px-3 py-2.5 text-left font-semibold">Put LTP</th>
                <th className="px-3 py-2.5 text-left font-semibold">PE IV</th>
                <th className="px-3 py-2.5 text-left font-semibold">Chg OI</th>
                <th className="px-3 py-2.5 text-left font-semibold">Put OI (L)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {snapshot.rows.map((r) => (
                <tr
                  key={r.strike}
                  className={
                    r.isAtm
                      ? 'bg-indigo-50/60 font-semibold'
                      : 'hover:bg-slate-50/80'
                  }
                >
                  <td className="px-3 py-2 text-right font-mono tabular-nums text-slate-700">
                    {(r.callOI / 100000).toFixed(1)}L
                    {r.strike === snapshot.callWallStrike ? ' · Wall' : ''}
                  </td>
                  <td
                    className={`px-3 py-2 text-right font-mono tabular-nums ${
                      r.callChgOI >= 0 ? 'text-rose-600' : 'text-emerald-600'
                    }`}
                  >
                    {r.callChgOI >= 0 ? '+' : ''}
                    {(r.callChgOI / 100000).toFixed(1)}L
                  </td>
                  <td className="px-3 py-2 text-right font-mono tabular-nums text-slate-500">
                    {r.callIv}%
                  </td>
                  <td className="px-3 py-2 text-right">
                    <button
                      type="button"
                      onClick={() => triggerLegLoad('CE', r.strike, r.callLtp)}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded bg-slate-900 hover:bg-indigo-600 text-white font-mono tabular-nums text-[11px] transition-colors"
                      title={`${actionSide} ${r.strike} CE @ ₹${r.callLtp} in Options Lab`}
                    >
                      <span>₹{r.callLtp.toFixed(1)}</span>
                      <ArrowUpRight className="w-3 h-3" />
                    </button>
                  </td>
                  <td className="px-4 py-2 text-center font-mono tabular-nums font-bold bg-slate-100/80 text-slate-950">
                    {r.strike}
                    {r.isAtm ? ' ATM' : ''}
                  </td>
                  <td className="px-3 py-2 text-left">
                    <button
                      type="button"
                      onClick={() => triggerLegLoad('PE', r.strike, r.putLtp)}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded bg-slate-900 hover:bg-indigo-600 text-white font-mono tabular-nums text-[11px] transition-colors"
                      title={`${actionSide} ${r.strike} PE @ ₹${r.putLtp} in Options Lab`}
                    >
                      <span>₹{r.putLtp.toFixed(1)}</span>
                      <ArrowUpRight className="w-3 h-3" />
                    </button>
                  </td>
                  <td className="px-3 py-2 text-left font-mono tabular-nums text-slate-500">
                    {r.putIv}%
                  </td>
                  <td
                    className={`px-3 py-2 text-left font-mono tabular-nums ${
                      r.putChgOI >= 0 ? 'text-emerald-600' : 'text-rose-600'
                    }`}
                  >
                    {r.putChgOI >= 0 ? '+' : ''}
                    {(r.putChgOI / 100000).toFixed(1)}L
                  </td>
                  <td className="px-3 py-2 text-left font-mono tabular-nums text-slate-700">
                    {(r.putOI / 100000).toFixed(1)}L
                    {r.strike === snapshot.putWallStrike ? ' · Wall' : ''}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 text-xs text-amber-950 flex items-start gap-2.5">
        <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <span>
          Simulated NSE option chain snapshot for structural OI and payoff learning. Verify real-time exchange bid/ask depth and weekly margin requirements before submitting live derivatives orders.
        </span>
      </div>
    </div>
  );
};
