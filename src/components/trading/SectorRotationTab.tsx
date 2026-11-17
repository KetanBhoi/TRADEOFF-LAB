import React, { useState } from 'react';
import {
  INITIAL_SECTOR_PERFORMANCE,
  INITIAL_MARKET_BREADTH,
} from '../../utils/advancedTradingData';
import { SectorPerformanceItem, MarketBreadthData } from '../../types/trading';
import {
  Compass,
  TrendingUp,
  TrendingDown,
  Activity,
  Layers,
  BarChart3,
  AlertTriangle,
  Info,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';

export const SectorRotationTab: React.FC = () => {
  const [sectors, setSectors] = useState<SectorPerformanceItem[]>(INITIAL_SECTOR_PERFORMANCE);
  const [breadth, setBreadth] = useState<MarketBreadthData>(INITIAL_MARKET_BREADTH);
  const [selectedHorizon, setSelectedHorizon] = useState<'1W' | '1M' | '3M' | 'YTD'>('1M');

  const getStageBadge = (stage: string) => {
    switch (stage) {
      case 'LEADING':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'IMPROVING':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'WEAKENING':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'LAGGING':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              Descriptive Market Diagnostics
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30">
              Not a Buy / Sell Recommendation
            </span>
          </div>
          <h2 className="text-xl font-bold tracking-tight">Sector Rotation & Market Breadth</h2>
          <p className="text-xs text-slate-300 max-w-2xl mt-1">
            Observe money flow shifts across primary Indian sectoral indices and examine broad market participation via Advance-Decline metrics, moving average participation, and India VIX volatility regime.
          </p>
        </div>

        {/* India VIX Pill */}
        <div className="bg-slate-800/80 border border-slate-700/60 p-4 rounded-xl shrink-0 flex items-center gap-4">
          <div>
            <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">India VIX</div>
            <div className="text-2xl font-black text-white font-mono flex items-center gap-1.5">
              <span>{breadth.indiaVix}</span>
              <span className="text-xs font-semibold text-emerald-400">
                {breadth.indiaVixChange} ({breadth.indiaVixChangePercent}%)
              </span>
            </div>
          </div>
          <div className="h-8 w-px bg-slate-700" />
          <div>
            <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Regime</div>
            <div className="text-xs font-bold text-indigo-300 uppercase">
              {breadth.vixRegime.replace('_', ' ')}
            </div>
          </div>
        </div>
      </div>

      {/* Market Breadth Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-2">
          <div className="text-[11px] text-slate-500 font-semibold uppercase flex items-center justify-between">
            <span>Advance / Decline Ratio</span>
            <span className="font-mono text-indigo-600 font-bold">{breadth.advanceDeclineRatio}:1</span>
          </div>
          <div className="flex items-center justify-between font-mono text-xs">
            <span className="text-emerald-600 font-bold">{breadth.advances} Adv</span>
            <span className="text-slate-400">/</span>
            <span className="text-rose-600 font-bold">{breadth.declines} Dec</span>
            <span className="text-slate-400">({breadth.unchanged} Unch)</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden flex">
            <div
              className="bg-emerald-500 h-2"
              style={{ width: `${(breadth.advances / (breadth.advances + breadth.declines)) * 100}%` }}
            />
            <div
              className="bg-rose-500 h-2"
              style={{ width: `${(breadth.declines / (breadth.advances + breadth.declines)) * 100}%` }}
            />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-2">
          <div className="text-[11px] text-slate-500 font-semibold uppercase flex items-center justify-between">
            <span>Stocks &gt; 50-Day MA</span>
            <span className="font-mono text-slate-900 font-bold">{breadth.percentAbove50Dma}%</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div
              className="bg-indigo-600 h-2 rounded-full"
              style={{ width: `${breadth.percentAbove50Dma}%` }}
            />
          </div>
          <div className="text-[10px] text-slate-500">Short-to-intermediate trend participation</div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-2">
          <div className="text-[11px] text-slate-500 font-semibold uppercase flex items-center justify-between">
            <span>Stocks &gt; 200-Day MA</span>
            <span className="font-mono text-slate-900 font-bold">{breadth.percentAbove200Dma}%</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div
              className="bg-emerald-600 h-2 rounded-full"
              style={{ width: `${breadth.percentAbove200Dma}%` }}
            />
          </div>
          <div className="text-[10px] text-slate-500">Long-term structural bull health metric</div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-1">
          <div className="text-[11px] text-slate-500 font-semibold uppercase">India VIX Diagnostics</div>
          <p className="text-[11px] text-slate-700 leading-tight">
            {breadth.vixExplanation}
          </p>
        </div>
      </div>

      {/* Sector Rotation Matrix */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900">Sectoral Momentum & Rotation Matrix</h3>
          </div>

          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
            {(['1W', '1M', '3M', 'YTD'] as const).map((h) => (
              <button
                key={h}
                type="button"
                onClick={() => setSelectedHorizon(h)}
                className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
                  selectedHorizon === h
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {h}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase text-[10px] font-semibold tracking-wider">
                <th className="py-2.5 px-3">Sector Index</th>
                <th className="py-2.5 px-3">Relative Strength Rank</th>
                <th className="py-2.5 px-3">1-Week</th>
                <th className="py-2.5 px-3">1-Month</th>
                <th className="py-2.5 px-3">3-Month</th>
                <th className="py-2.5 px-3">YTD</th>
                <th className="py-2.5 px-3">RSI (14)</th>
                <th className="py-2.5 px-3">Rotation Stage</th>
                <th className="py-2.5 px-3">Top Constituent</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sectors.map((sec) => {
                const isSelectedHorizonPositive =
                  selectedHorizon === '1W'
                    ? sec.change1W >= 0
                    : selectedHorizon === '1M'
                    ? sec.change1M >= 0
                    : selectedHorizon === '3M'
                    ? sec.change3M >= 0
                    : sec.ytdReturn >= 0;

                return (
                  <tr key={sec.indexSymbol} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-3 font-semibold text-slate-900">
                      <div>{sec.sector}</div>
                      <div className="text-[10px] text-slate-500 font-mono font-normal">{sec.indexSymbol}</div>
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-indigo-700">
                      #{sec.relativeStrengthRank}
                    </td>
                    <td className="py-3 px-3 font-mono">
                      <span className={sec.change1W >= 0 ? 'text-emerald-600 font-bold' : 'text-rose-600 font-bold'}>
                        {sec.change1W > 0 ? '+' : ''}{sec.change1W}%
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono">
                      <span className={sec.change1M >= 0 ? 'text-emerald-600 font-bold' : 'text-rose-600 font-bold'}>
                        {sec.change1M > 0 ? '+' : ''}{sec.change1M}%
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono">
                      <span className={sec.change3M >= 0 ? 'text-emerald-600 font-bold' : 'text-rose-600 font-bold'}>
                        {sec.change3M > 0 ? '+' : ''}{sec.change3M}%
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono">
                      <span className={sec.ytdReturn >= 0 ? 'text-emerald-600 font-bold' : 'text-rose-600 font-bold'}>
                        {sec.ytdReturn > 0 ? '+' : ''}{sec.ytdReturn}%
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-800">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[11px] font-semibold ${
                          sec.rsi14 >= 60
                            ? 'bg-emerald-100 text-emerald-800'
                            : sec.rsi14 <= 40
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {sec.rsi14.toFixed(1)}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getStageBadge(
                          sec.rotationStage
                        )}`}
                      >
                        {sec.rotationStage}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-600 font-medium">
                      {sec.topGainer}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
