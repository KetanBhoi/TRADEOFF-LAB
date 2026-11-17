import React, { useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { BENCHMARK_COMPARISON_DATA } from '../../utils/portfolioHealthData';
import { StatCard } from '../common/StatCard';
import {
  TrendingUp,
  BarChart3,
  ShieldCheck,
  Info,
  Calendar,
  Layers,
  Award,
} from 'lucide-react';

export const BenchmarkComparisonTab: React.FC = () => {
  const [selectedHorizon, setSelectedHorizon] = useState<'1M' | '3M' | '6M' | '1Y' | 'ALL'>('6M');
  const bench = BENCHMARK_COMPARISON_DATA;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 ring-4 ring-indigo-100" />
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                Model Portfolio vs. Nifty Benchmark Intelligence
              </h3>
              <span className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider bg-slate-100 text-slate-700 rounded border border-slate-200">
                Read-Only Audit
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Evaluate risk-adjusted performance against the Nifty 50 and Nifty 500 broad market indices over identical time horizons.
            </p>
          </div>

          {/* Timeframe Selector */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-lg border border-slate-200 text-xs font-semibold">
            {(['1M', '3M', '6M', '1Y', 'ALL'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setSelectedHorizon(t)}
                className={`px-3 py-1 rounded-md transition-all font-mono text-[11px] ${
                  selectedHorizon === t
                    ? 'bg-white text-slate-900 shadow-2xs font-bold'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Executive Benchmark Stat Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard
            label="Your Portfolio Return"
            value={`+${bench.portfolioReturnPercent}%`}
            subtext={`Alpha: +${bench.portfolioAlpha}% vs Nifty 50`}
            statusType="nominal"
          />
          <StatCard
            label="Nifty 50 Benchmark"
            value={`+${bench.nifty50ReturnPercent}%`}
            subtext="India Large-Cap 50 Index"
            statusType="neutral"
          />
          <StatCard
            label="Nifty 500 Broad Market"
            value={`+${bench.nifty500ReturnPercent}%`}
            subtext="Comprehensive 500 Equities"
            statusType="neutral"
          />
          <StatCard
            label="Sharpe Ratio (Risk-Adj)"
            value={bench.sharpeRatio.toFixed(2)}
            subtext="Benchmark Sharpe: 1.12"
            statusType="nominal"
          />
        </div>
      </div>

      {/* Trajectory Growth Chart: Portfolio vs Nifty 50 vs Nifty 500 */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h4 className="text-sm font-bold text-slate-900">
              Normalized Comparative Performance Trajectory (Base = 100)
            </h4>
            <p className="text-xs text-slate-500">
              Shows capital growth trajectory of ₹100 invested on Day 1 across all three portfolios.
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono">
            <span className="flex items-center gap-1.5 font-bold text-indigo-600">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
              Your Portfolio (124.8)
            </span>
            <span className="flex items-center gap-1.5 font-medium text-slate-500">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
              Nifty 50 (114.2)
            </span>
            <span className="flex items-center gap-1.5 font-medium text-emerald-600">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              Nifty 500 (116.9)
            </span>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={bench.comparisonTimeline} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis domain={['auto', 'auto']} tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', color: '#fff', fontSize: '11px' }}
                formatter={(val: any) => [`₹${Number(val ?? 0).toFixed(1)}`, '']}
              />
              <Line
                type="monotone"
                dataKey="portfolio"
                name="Your Portfolio"
                stroke="#6366f1"
                strokeWidth={2.5}
                dot={{ r: 3, fill: '#6366f1' }}
              />
              <Line
                type="monotone"
                dataKey="nifty500"
                name="Nifty 500"
                stroke="#10b981"
                strokeWidth={2}
                dot={{ r: 2 }}
                strokeDasharray="4 4"
              />
              <Line
                type="monotone"
                dataKey="nifty50"
                name="Nifty 50"
                stroke="#94a3b8"
                strokeWidth={2}
                dot={{ r: 2 }}
                strokeDasharray="2 2"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Risk-Adjusted Return Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Sharpe & Sortino */}
        <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-2 shadow-2xs">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-600" />
            <h5 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Volatility-Adjusted Ratios
            </h5>
          </div>
          <div className="font-mono text-xs space-y-2 pt-2 border-t border-slate-100">
            <div className="flex justify-between">
              <span className="text-slate-600 font-sans">Sharpe Ratio:</span>
              <span className="font-bold text-slate-900">{bench.sharpeRatio.toFixed(2)} (Nifty: 1.12)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600 font-sans">Sortino Ratio:</span>
              <span className="font-bold text-emerald-700">{bench.sortinoRatio.toFixed(2)} (Downside only)</span>
            </div>
            <p className="text-[10px] text-slate-500 font-sans pt-1">
              Sortino ratio measures returns penalized exclusively against downside volatility, confirming clean risk management.
            </p>
          </div>
        </div>

        {/* Beta & Alpha */}
        <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-2 shadow-2xs">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-blue-600" />
            <h5 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Sensitivity & Alpha
            </h5>
          </div>
          <div className="font-mono text-xs space-y-2 pt-2 border-t border-slate-100">
            <div className="flex justify-between">
              <span className="text-slate-600 font-sans">Portfolio Beta:</span>
              <span className="font-bold text-slate-900">{bench.portfolioBeta} (Market = 1.0)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600 font-sans">Excess Alpha:</span>
              <span className="font-bold text-emerald-700">+{bench.portfolioAlpha}%</span>
            </div>
            <p className="text-[10px] text-slate-500 font-sans pt-1">
              Beta of 1.08 indicates moderate correlation to Nifty fluctuations, generating +7.6% true managerial excess alpha.
            </p>
          </div>
        </div>

        {/* Max Drawdown Comparison */}
        <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-2 shadow-2xs">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <h5 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Drawdown Containment
            </h5>
          </div>
          <div className="font-mono text-xs space-y-2 pt-2 border-t border-slate-100">
            <div className="flex justify-between">
              <span className="text-slate-600 font-sans">Portfolio Max Drawdown:</span>
              <span className="font-bold text-slate-900">-{bench.maxDrawdown}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600 font-sans">Nifty 50 Max Drawdown:</span>
              <span className="font-bold text-slate-600">-{bench.nifty50Drawdown}%</span>
            </div>
            <p className="text-[10px] text-slate-500 font-sans pt-1">
              Drawdowns were held to -7.2% due to strict stop-loss rules even during volatile October index corrections.
            </p>
          </div>
        </div>
      </div>

      {/* Prominent Legal & Educational Caveat */}
      <div className="p-4 rounded-xl bg-slate-100 border border-slate-200 text-slate-600 text-xs flex items-start gap-3 leading-relaxed">
        <Info className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
        <div>
          <strong>Read-Only Historical Benchmark Disclaimer:</strong> This comparison is calculated strictly for historical diagnostic and educational tracking purposes. It does not constitute investment advice, a portfolio recommendation, or an endorsement to copy or replicate any underlying security or index allocation.
        </div>
      </div>
    </div>
  );
};
