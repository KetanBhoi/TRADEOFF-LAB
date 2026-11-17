import React, { useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  Cell,
} from 'recharts';
import {
  ScenarioId,
  AnyScenarioParams,
} from '../../types';
import { computeTornadoAnalysis } from '../../utils/sensitivityAnalysis';
import {
  TrendingUp,
  X,
  Target,
  Sparkles,
  Zap,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  Info,
} from 'lucide-react';

interface TornadoSensitivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeScenario: ScenarioId;
  params: AnyScenarioParams;
  onOpenGoalSeek?: () => void;
}

export const TornadoSensitivityModal: React.FC<TornadoSensitivityModalProps> = ({
  isOpen,
  onClose,
  activeScenario,
  params,
  onOpenGoalSeek,
}) => {
  if (!isOpen) return null;

  const analysis = useMemo(() => {
    return computeTornadoAnalysis(activeScenario, params);
  }, [activeScenario, params]);

  // Format data for Tornado Chart (relative difference from baseline)
  const chartData = useMemo(() => {
    return analysis.levers.map((item) => {
      const lowDiff = item.lowOutcome - analysis.baselineValue;
      const highDiff = item.highOutcome - analysis.baselineValue;

      return {
        name: item.label,
        lowVal: Math.min(lowDiff, highDiff),
        highVal: Math.max(lowDiff, highDiff),
        swing: item.outcomeSwing,
        rating: item.sensitivityRating,
        lowOutcome: item.lowOutcome,
        highOutcome: item.highOutcome,
        baseOutcome: analysis.baselineValue,
        elasticity: item.elasticity,
      };
    });
  }, [analysis]);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4.5 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <Zap className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 tracking-tight">
                  Tornado Sensitivity & Elasticity Diagram
                </h3>
                <span className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-md">
                  Lever Ranking
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Identifies which levers generate the largest swing on target outcome (±20% perturbation analysis)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Executive Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/90 flex flex-col justify-between">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 font-mono">
                Dominant Control Lever
              </div>
              <div className="text-lg font-bold text-slate-900 mt-1 truncate">
                {analysis.dominantLever}
              </div>
              <div className="text-xs text-indigo-600 font-medium mt-1 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> Highest outcome swing
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/90 flex flex-col justify-between">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 font-mono">
                Target Outcome Baseline
              </div>
              <div className="text-lg font-bold font-mono text-slate-900 mt-1 tabular-nums">
                {analysis.baselineValue} <span className="text-xs font-normal text-slate-500">{analysis.metricUnit}</span>
              </div>
              <div className="text-xs text-slate-500 truncate mt-1">
                Metric: {analysis.metricName}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-indigo-50/60 border border-indigo-200/80 flex flex-col justify-between">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-indigo-700 font-mono">
                Maximum Lever Swing
              </div>
              <div className="text-lg font-bold font-mono text-indigo-950 mt-1 tabular-nums">
                ±{analysis.levers[0]?.outcomeSwing ?? 0}{' '}
                <span className="text-xs font-normal text-indigo-700">{analysis.metricUnit}</span>
              </div>
              <div className="text-xs text-indigo-700 font-medium mt-1">
                Elasticity Index: {analysis.levers[0]?.elasticity ?? 0}
              </div>
            </div>
          </div>

          {/* Tornado Bar Chart */}
          <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 font-mono">
                  Tornado Impact Chart (Outcome Delta vs. Baseline)
                </h4>
                <p className="text-[11px] text-slate-500">
                  Wider bars indicate higher sensitivity. Ranked from highest leverage to lowest.
                </p>
              </div>
              <div className="flex items-center gap-3 text-xs font-mono">
                <div className="flex items-center gap-1.5 text-slate-600">
                  <span className="w-3 h-3 rounded bg-amber-500" />
                  <span>Adverse Impact</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-600">
                  <span className="w-3 h-3 rounded bg-indigo-600" />
                  <span>Favorable Impact</span>
                </div>
              </div>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  layout="vertical"
                  data={chartData}
                  margin={{ top: 10, right: 30, left: 120, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis
                    type="number"
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    tickFormatter={(val) => `${val > 0 ? '+' : ''}${val}`}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    tick={{ fontSize: 11, fill: '#334155', fontWeight: 600 }}
                    width={110}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null;
                      const d = payload[0].payload;
                      return (
                        <div className="p-3 bg-slate-900 text-white rounded-lg shadow-xl text-xs space-y-1">
                          <p className="font-bold border-b border-slate-700 pb-1">{d.name}</p>
                          <p>Baseline: <span className="font-mono text-slate-300">{d.baseOutcome}</span></p>
                          <p>Low Case: <span className="font-mono text-amber-300">{d.lowOutcome}</span></p>
                          <p>High Case: <span className="font-mono text-indigo-300">{d.highOutcome}</span></p>
                          <p>Total Swing: <span className="font-mono text-emerald-300">±{d.swing}</span></p>
                          <p>Elasticity: <span className="font-mono text-orange-300">{d.elasticity}</span> ({d.rating})</p>
                        </div>
                      );
                    }}
                  />
                  <ReferenceLine x={0} stroke="#94a3b8" strokeWidth={1.5} />
                  <Bar dataKey="lowVal" fill="#f59e0b" radius={[4, 0, 0, 4]} />
                  <Bar dataKey="highVal" fill="#6366f1" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Lever Sensitivity Table */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 font-mono">
              Detailed Elasticity & Leverage Breakdown
            </h4>

            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100/80 text-slate-600 font-mono uppercase text-[10px] tracking-wider border-b border-slate-200">
                    <th className="py-2.5 px-4 font-semibold">Lever</th>
                    <th className="py-2.5 px-3 font-semibold text-right">Base</th>
                    <th className="py-2.5 px-3 font-semibold text-right">Low Case</th>
                    <th className="py-2.5 px-3 font-semibold text-right">High Case</th>
                    <th className="py-2.5 px-3 font-semibold text-right">Total Swing</th>
                    <th className="py-2.5 px-3 font-semibold text-right">Elasticity</th>
                    <th className="py-2.5 px-3 font-semibold">Impact Rating</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {analysis.levers.map((item, idx) => (
                    <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 font-semibold text-slate-900">
                        <div className="flex items-center gap-1.5">
                          {idx === 0 && <span className="w-2 h-2 rounded-full bg-indigo-600 shrink-0" />}
                          <span>{item.label}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-600">
                        {item.baseInput} {item.unit}
                      </td>
                      <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-500">
                        {item.lowInput} {item.unit}
                      </td>
                      <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-500">
                        {item.highInput} {item.unit}
                      </td>
                      <td className="py-3 px-3 text-right font-mono tabular-nums font-bold text-slate-900">
                        ±{item.outcomeSwing}
                      </td>
                      <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-700">
                        {item.elasticity}
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider ${
                            item.sensitivityRating === 'CRITICAL'
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : item.sensitivityRating === 'HIGH'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : item.sensitivityRating === 'MODERATE'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : 'bg-slate-100 text-slate-600 border border-slate-200'
                          }`}
                        >
                          {item.sensitivityRating}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Strategic Decision Engineering Insights */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-2">
            <div className="flex items-center gap-2 font-bold text-slate-900">
              <Info className="w-4 h-4 text-indigo-600 shrink-0" />
              <span>Executive Optimization Directive</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              Prioritize adjusting <strong className="text-slate-900">{analysis.dominantLever}</strong>. In
              this scenario, small percentage changes to this input trigger the steepest outcomes swings on{' '}
              <em>{analysis.metricName}</em>. Adjusting inelastic secondary levers yields diminishing returns.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors"
          >
            Close
          </button>

          {onOpenGoalSeek && (
            <button
              onClick={() => {
                onClose();
                onOpenGoalSeek();
              }}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-2xs"
            >
              <Target className="w-4 h-4" />
              <span>Optimize with Goal Seek</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
