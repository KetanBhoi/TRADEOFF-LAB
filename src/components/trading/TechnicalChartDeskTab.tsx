import React, { useMemo, useState } from 'react';
import { LiveMarketQuote } from '../../types/trading';
import { computeTechnicalSeries } from '../../utils/ultimateModulesData';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from 'recharts';
import { Activity, Bell, Crosshair, TrendingUp } from 'lucide-react';

interface TechnicalChartDeskTabProps {
  quotes: LiveMarketQuote[];
  initialSymbol?: string;
  onSendSetupToTerminal: (payload: {
    symbol: string;
    entryPrice: number;
    stopLossPrice: number;
    targetPrice: number;
  }) => void;
  onArmBreakoutAlert: (payload: {
    symbol: string;
    targetPrice: number;
    condition: 'ABOVE' | 'BELOW';
    note: string;
  }) => void;
}

export const TechnicalChartDeskTab: React.FC<TechnicalChartDeskTabProps> = ({
  quotes,
  initialSymbol,
  onSendSetupToTerminal,
  onArmBreakoutAlert,
}) => {
  const [selectedSymbol, setSelectedSymbol] = useState<string>(
    initialSymbol || quotes[1]?.symbol || quotes[0]?.symbol || 'WAAREE'
  );
  const [showEma9, setShowEma9] = useState<boolean>(true);
  const [showEma21, setShowEma21] = useState<boolean>(true);
  const [showVwap, setShowVwap] = useState<boolean>(true);
  const [showBollinger, setShowBollinger] = useState<boolean>(false);

  const activeQuote = useMemo(
    () => quotes.find((q) => q.symbol === selectedSymbol) || quotes[0],
    [quotes, selectedSymbol]
  );

  const { points, summary } = useMemo(
    () => computeTechnicalSeries(activeQuote),
    [activeQuote]
  );

  return (
    <div className="space-y-6">
      {/* Header & Symbol Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h3 className="text-lg font-bold text-slate-950 flex items-center gap-2">
            <Activity className="w-5 h-5 text-indigo-600" />
            <span>Technical Chart, Multi-Indicator &amp; Pattern Desk</span>
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Syncs live 2-second price bars with EMA 9/21, anchored VWAP, Bollinger Bands, Volume, and RSI (14) — push setups straight into the Order Desk or Alert Watcher.
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-2 shrink-0">
          <select
            value={activeQuote.symbol}
            onChange={(e) => setSelectedSymbol(e.target.value)}
            className="px-3 py-1.5 text-xs font-bold bg-white border border-slate-300 rounded-lg text-slate-900"
          >
            {quotes.map((q) => (
              <option key={q.symbol} value={q.symbol}>
                {q.symbol} (₹{q.lastPrice.toLocaleString('en-IN')})
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() =>
              onSendSetupToTerminal({
                symbol: activeQuote.symbol,
                entryPrice: activeQuote.lastPrice,
                stopLossPrice: summary.suggestedStopLoss,
                targetPrice: summary.suggestedTarget,
              })
            }
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors whitespace-nowrap shrink-0"
          >
            <Crosshair className="w-3.5 h-3.5" />
            <span>Send Entry / SL / Target to Terminal</span>
          </button>

          <button
            type="button"
            onClick={() =>
              onArmBreakoutAlert({
                symbol: activeQuote.symbol,
                targetPrice: summary.resistanceLevel,
                condition: 'ABOVE',
                note: `Resistance Breakout above ₹${summary.resistanceLevel}`,
              })
            }
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 rounded-lg transition-colors whitespace-nowrap shrink-0"
          >
            <Bell className="w-3.5 h-3.5 text-amber-600" />
            <span>Arm Breakout Alert</span>
          </button>
        </div>
      </div>

      {/* Live Pattern & Key Level KPI Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="p-4 rounded-xl bg-white border border-slate-200 col-span-2 lg:col-span-2">
          <span className="text-xs text-slate-500 block">Detected Technical Bias</span>
          <span
            className={`text-sm font-bold mt-1 block ${
              summary.bias === 'BULLISH'
                ? 'text-emerald-700'
                : summary.bias === 'BEARISH'
                ? 'text-rose-700'
                : 'text-slate-900'
            }`}
          >
            {summary.bias} · {summary.patternLabel}
          </span>
          <span className="text-[11px] text-slate-500 mt-1 block font-mono tabular-nums">
            LTP ₹{activeQuote.lastPrice.toLocaleString('en-IN')} ({activeQuote.changePercent >= 0 ? '+' : ''}
            {activeQuote.changePercent}%)
          </span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200">
          <span className="text-xs text-slate-500 block">15-Bar Support / SL</span>
          <span className="text-lg font-bold font-mono tabular-nums text-emerald-700 mt-1 block">
            ₹{summary.supportLevel.toLocaleString('en-IN')}
          </span>
          <span className="text-[11px] text-slate-500 font-mono tabular-nums block">
            Rec. SL: ₹{summary.suggestedStopLoss.toLocaleString('en-IN')}
          </span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200">
          <span className="text-xs text-slate-500 block">15-Bar Resistance / Tgt</span>
          <span className="text-lg font-bold font-mono tabular-nums text-rose-700 mt-1 block">
            ₹{summary.resistanceLevel.toLocaleString('en-IN')}
          </span>
          <span className="text-[11px] text-slate-500 font-mono tabular-nums block">
            Rec. Target: ₹{summary.suggestedTarget.toLocaleString('en-IN')}
          </span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200">
          <span className="text-xs text-slate-500 block">RSI (14) Momentum</span>
          <span
            className={`text-lg font-bold font-mono tabular-nums mt-1 block ${
              summary.rsi14 >= 70
                ? 'text-rose-700'
                : summary.rsi14 <= 30
                ? 'text-emerald-700'
                : 'text-slate-950'
            }`}
          >
            {summary.rsi14.toFixed(1)}
          </span>
          <span className="text-[11px] text-slate-500 font-mono tabular-nums block">
            EMA9: {summary.ema9} · VWAP: {summary.vwap}
          </span>
        </div>
      </div>

      {/* Indicator Overlay Controls + Price Chart */}
      <div className="p-5 rounded-xl bg-white border border-slate-200 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
            <TrendingUp className="w-4 h-4 text-indigo-600" />
            <span>Price Action &amp; Overlay Controls (40 Sessions)</span>
          </div>

          <div className="flex items-center flex-wrap gap-2 text-xs">
            {[
              { label: 'EMA 9', active: showEma9, toggle: () => setShowEma9((v) => !v) },
              { label: 'EMA 21', active: showEma21, toggle: () => setShowEma21((v) => !v) },
              { label: 'VWAP', active: showVwap, toggle: () => setShowVwap((v) => !v) },
              { label: 'Bollinger (20,2)', active: showBollinger, toggle: () => setShowBollinger((v) => !v) },
            ].map((ind) => (
              <button
                key={ind.label}
                type="button"
                onClick={ind.toggle}
                className={`px-2.5 py-1 rounded-md font-semibold border transition-colors whitespace-nowrap shrink-0 ${
                  ind.active
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {ind.label}
              </button>
            ))}
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={points} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#64748b' }} />
              <YAxis
                domain={['auto', 'auto']}
                tick={{ fontSize: 11, fill: '#475569' }}
                tickFormatter={(v) => `₹${v}`}
              />
              <Tooltip
                formatter={(val) =>
                  `₹${(typeof val === 'number' ? val : Number(val ?? 0)).toLocaleString('en-IN')}`
                }
              />
              <ReferenceLine
                y={summary.supportLevel}
                stroke="#16a34a"
                strokeDasharray="4 4"
                label={{ value: 'Support', position: 'insideBottomLeft', fill: '#16a34a', fontSize: 10 }}
              />
              <ReferenceLine
                y={summary.resistanceLevel}
                stroke="#e11d48"
                strokeDasharray="4 4"
                label={{ value: 'Resistance', position: 'insideTopLeft', fill: '#e11d48', fontSize: 10 }}
              />
              <Line
                type="monotone"
                dataKey="close"
                name="Close LTP"
                stroke="#0f172a"
                strokeWidth={2.2}
                dot={false}
              />
              {showEma9 && (
                <Line
                  type="monotone"
                  dataKey="ema9"
                  name="EMA 9"
                  stroke="#4f46e5"
                  strokeWidth={1.6}
                  dot={false}
                />
              )}
              {showEma21 && (
                <Line
                  type="monotone"
                  dataKey="ema21"
                  name="EMA 21"
                  stroke="#d97706"
                  strokeWidth={1.6}
                  dot={false}
                />
              )}
              {showVwap && (
                <Line
                  type="monotone"
                  dataKey="vwap"
                  name="VWAP"
                  stroke="#0284c7"
                  strokeDasharray="3 3"
                  strokeWidth={1.6}
                  dot={false}
                />
              )}
              {showBollinger && (
                <>
                  <Line
                    type="monotone"
                    dataKey="bbUpper"
                    name="BB Upper"
                    stroke="#94a3b8"
                    strokeDasharray="2 2"
                    strokeWidth={1.2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="bbLower"
                    name="BB Lower"
                    stroke="#94a3b8"
                    strokeDasharray="2 2"
                    strokeWidth={1.2}
                    dot={false}
                  />
                </>
              )}
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Synced Volume & RSI Sub-Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="p-4 rounded-xl bg-white border border-slate-200">
          <h4 className="text-xs font-bold text-slate-900 mb-2">Session Volume Profile</h4>
          <div className="h-40 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={points} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#64748b' }} />
                <YAxis
                  tick={{ fontSize: 10, fill: '#64748b' }}
                  tickFormatter={(v) => `${(v / 100000).toFixed(0)}L`}
                />
                <Tooltip
                  formatter={(val) =>
                    `${((typeof val === 'number' ? val : Number(val ?? 0)) / 100000).toFixed(2)}L shares`
                  }
                />
                <Bar dataKey="volume" name="Volume" fill="#6366f1" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200">
          <h4 className="text-xs font-bold text-slate-900 mb-2">
            RSI (14) Oscillator · Overbought 70 / Oversold 30
          </h4>
          <div className="h-40 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={points} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#64748b' }} />
                <YAxis domain={[15, 85]} tick={{ fontSize: 10, fill: '#64748b' }} />
                <Tooltip
                  formatter={(val) =>
                    `RSI ${(typeof val === 'number' ? val : Number(val ?? 0)).toFixed(1)}`
                  }
                />
                <ReferenceLine y={70} stroke="#e11d48" strokeDasharray="3 3" />
                <ReferenceLine y={30} stroke="#16a34a" strokeDasharray="3 3" />
                <Line
                  type="monotone"
                  dataKey="rsi14"
                  name="RSI (14)"
                  stroke="#7c3aed"
                  strokeWidth={2}
                  dot={false}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
