import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  Line,
  ComposedChart,
} from 'recharts';
import {
  ScenarioId,
  AnyScenarioParams,
} from '../../types';
import { runMonteCarloSimulation, MonteCarloSimulationResult } from '../../utils/monteCarlo';
import { Dices, RefreshCw, X, AlertTriangle, ShieldCheck, TrendingUp, Sparkles, CheckCircle2 } from 'lucide-react';

interface MonteCarloModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeScenario: ScenarioId;
  params: AnyScenarioParams;
}

export const MonteCarloModal: React.FC<MonteCarloModalProps> = ({
  isOpen,
  onClose,
  activeScenario,
  params,
}) => {
  const [trials, setTrials] = useState<number>(1000);
  const [volatility, setVolatility] = useState<number>(12);
  const [iterationKey, setIterationKey] = useState<number>(0);

  // Run simulation
  const result: MonteCarloSimulationResult = useMemo(() => {
    return runMonteCarloSimulation(activeScenario, params, trials, volatility);
  }, [activeScenario, params, trials, volatility, iterationKey]);

  if (!isOpen) return null;

  const handleRerun = () => {
    setIterationKey((k) => k + 1);
  };

  const formatMetric = (val: number) => {
    if (result.metricUnit === '$') return `$${Math.round(val).toLocaleString()}`;
    return `${Math.round(val * 10) / 10}${result.metricUnit ? ` ${result.metricUnit}` : ''}`;
  };

  const CustomBarTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900/95 text-white p-3 rounded-lg shadow-xl border border-slate-700 text-xs font-mono space-y-1.5 z-50">
          <div className="font-bold text-orange-400 border-b border-slate-700 pb-1">
            Range: {formatMetric(data.binStart)} – {formatMetric(data.binEnd)}
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-slate-300">Simulated Trials:</span>
            <span className="font-bold text-white">{data.frequency} ({data.percentage}%)</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-slate-400">Cumulative Density:</span>
            <span className="font-bold text-emerald-400">{data.cumulativePercentage}%</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between gap-4 bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-orange-600 text-white flex items-center justify-center shadow-xs">
              <Dices className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">
                  Monte Carlo Stochastic Simulation
                </h3>
                <span className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider bg-orange-100 text-orange-800 rounded border border-orange-200">
                  {trials.toLocaleString()} TRIALS
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Stochastic risk modeling & confidence intervals across parameter volatility
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleRerun}
              className="px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg flex items-center gap-1.5 transition-colors shadow-2xs"
              title="Resimulate trials with new random seeds"
            >
              <RefreshCw className="w-3.5 h-3.5 text-slate-600" />
              <span>Rerun</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {/* Controls Bar: Trials & Volatility */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <span className="font-semibold text-slate-700 shrink-0">Sample Trials:</span>
              <div className="flex items-center gap-1 p-0.5 bg-white border border-slate-200 rounded-lg shadow-2xs">
                {[500, 1000, 2500].map((t) => (
                  <button
                    key={t}
                    onClick={() => setTrials(t)}
                    className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                      trials === t
                        ? 'bg-slate-900 text-white font-bold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {t.toLocaleString()}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              <label className="font-semibold text-slate-700 shrink-0">
                Environmental Volatility:
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min={5}
                  max={30}
                  step={1}
                  value={volatility}
                  onChange={(e) => setVolatility(parseInt(e.target.value, 10))}
                  className="w-28 accent-orange-600 h-1.5 bg-slate-200 rounded-lg"
                />
                <span className="font-mono font-bold text-slate-900 w-10 text-right">
                  ±{volatility}%
                </span>
              </div>
            </div>
          </div>

          {/* Probability of Success Gauge & Risk Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            {/* Success Probability Card */}
            <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs flex flex-col justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Goal Probability
              </span>
              <div className="mt-2 flex items-baseline gap-1.5">
                <span
                  className={`text-3xl font-bold font-mono tracking-tight tabular-nums ${
                    result.successRatePercent >= 70
                      ? 'text-emerald-600'
                      : result.successRatePercent >= 45
                      ? 'text-amber-600'
                      : 'text-rose-600'
                  }`}
                >
                  {result.successRatePercent}%
                </span>
                <span className="text-xs font-medium text-slate-500">Likelihood</span>
              </div>
              <div className="mt-2 text-[11px] text-slate-500 flex items-center gap-1">
                {result.successRatePercent >= 70 ? (
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                ) : (
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                )}
                <span className="truncate">
                  {result.targetType === 'greater' ? '≥' : '≤'} {formatMetric(result.targetThreshold)} Goal
                </span>
              </div>
            </div>

            {/* P10 (Conservative / Worst-case) */}
            <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs flex flex-col justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                P10 (Conservative)
              </span>
              <div className="mt-2 text-2xl font-bold font-mono text-slate-900 tabular-nums">
                {formatMetric(result.p10)}
              </div>
              <div className="mt-2 text-[11px] text-slate-500">
                90% of trials outperform this
              </div>
            </div>

            {/* P50 (Expected Median) */}
            <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs flex flex-col justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                P50 (Median Expected)
              </span>
              <div className="mt-2 text-2xl font-bold font-mono text-orange-600 tabular-nums">
                {formatMetric(result.median)}
              </div>
              <div className="mt-2 text-[11px] text-slate-500">
                Mean: {formatMetric(result.mean)}
              </div>
            </div>

            {/* P90 (Optimistic Best Case) */}
            <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs flex flex-col justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                P90 (Optimistic)
              </span>
              <div className="mt-2 text-2xl font-bold font-mono text-slate-900 tabular-nums">
                {formatMetric(result.p90)}
              </div>
              <div className="mt-2 text-[11px] text-slate-500">
                Top 10% best-case outcome
              </div>
            </div>
          </div>

          {/* Recharts Probability Distribution Histogram & CDF */}
          <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-orange-600" />
                  <span>Probability Distribution Histogram (Monte Carlo)</span>
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Bars indicate trial frequency; orange line marks expected median P50.
                </p>
              </div>
              <div className="flex items-center gap-3 text-xs font-mono">
                <span className="flex items-center gap-1 text-slate-600">
                  <span className="w-2.5 h-2.5 bg-orange-500 rounded-xs inline-block" />
                  Frequency %
                </span>
                <span className="flex items-center gap-1 text-emerald-600">
                  <span className="w-2.5 h-0.5 bg-emerald-500 inline-block" />
                  Target Threshold
                </span>
              </div>
            </div>

            <div className="w-full h-64 select-none pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  data={result.histogramBins}
                  margin={{ top: 10, right: 20, left: 10, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis
                    dataKey="binLabel"
                    tick={{ fontSize: 10, fill: '#64748b' }}
                    interval={1}
                    angle={-20}
                    textAnchor="end"
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: '#64748b' }}
                    unit="%"
                    domain={[0, 'auto']}
                  />
                  <Tooltip content={<CustomBarTooltip />} />
                  <Bar
                    dataKey="percentage"
                    name="Trial Frequency"
                    fill="#ea580c"
                    radius={[4, 4, 0, 0]}
                  />
                  <ReferenceLine
                    y={50}
                    stroke="#94a3b8"
                    strokeDasharray="3 3"
                    label={{ value: '50% mark', fill: '#94a3b8', fontSize: 10 }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Decision Takeaway Callout */}
          <div className="p-3.5 rounded-xl bg-orange-50/70 border border-orange-200/90 flex items-start gap-3 text-xs">
            <Sparkles className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold text-orange-950 block">
                Stochastic Decision Engineering Takeaway:
              </span>
              <p className="text-orange-900 leading-relaxed">
                Under ±{volatility}% environmental volatility, your strategy achieves a{' '}
                <strong>{result.successRatePercent}% confidence rate</strong> of meeting or exceeding your target threshold. The interquartile range (IQR) spans from{' '}
                <strong>{formatMetric(result.p25)}</strong> to <strong>{formatMetric(result.p75)}</strong> with a standard deviation of <strong>{formatMetric(result.stdDev)}</strong>.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <span className="text-[11px] text-slate-500 font-mono">
            Algorithm: Box-Muller Normal Variance Engine · 35 Iterations
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-2xs"
          >
            Close Simulation
          </button>
        </div>
      </div>
    </div>
  );
};
