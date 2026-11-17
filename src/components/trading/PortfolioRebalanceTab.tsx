import React, { useState, useMemo } from 'react';
import { TradingHolding, RebalanceMode } from '../../types/trading';
import {
  DEFAULT_MARKET_CAP_TARGETS,
  computeRebalancePlan,
} from '../../utils/bestFeaturesData';
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
import {
  Sliders,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  Info,
  RefreshCw,
} from 'lucide-react';

interface PortfolioRebalanceTabProps {
  holdings: TradingHolding[];
}

export const PortfolioRebalanceTab: React.FC<PortfolioRebalanceTabProps> = ({
  holdings,
}) => {
  const [targetWeights, setTargetWeights] = useState<Record<string, number>>(
    DEFAULT_MARKET_CAP_TARGETS
  );
  const [freshCashInflow, setFreshCashInflow] = useState<number>(50000);
  const [mode, setMode] = useState<RebalanceMode>('CASH_INFLOW_ONLY');
  const [appliedToast, setAppliedToast] = useState<string | null>(null);

  const plan = useMemo(
    () => computeRebalancePlan(holdings, targetWeights, freshCashInflow, mode),
    [holdings, targetWeights, freshCashInflow, mode]
  );

  const totalRawTarget = Object.values(targetWeights).reduce((a, b) => a + b, 0);

  const chartData = plan.allocations.map((a) => ({
    bucket: a.bucket,
    Current: a.currentPercent,
    Target: a.targetPercent,
  }));

  const handleWeightChange = (bucket: string, val: number) => {
    setTargetWeights((prev) => ({ ...prev, [bucket]: val }));
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-emerald-300 font-medium mb-1">
            <span>Zero-Tax Cash Routing</span>
            <span aria-hidden="true">·</span>
            <span>Drift Guardrail (±5%)</span>
            <span aria-hidden="true">·</span>
            <span>Market-Cap Normalization</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight">
            Smart Portfolio Rebalancing & Cash Inflow Engine
          </h2>
          <p className="text-xs text-slate-300 max-w-2xl mt-1">
            Eliminate portfolio drift across Large, Mid, and Small Cap tiers. Route fresh monthly SIP deposits exclusively into underweight buckets to restore balance without selling winners or incurring unnecessary STCG/LTCG taxes.
          </p>
        </div>

        <div className="bg-slate-800/80 border border-slate-700/60 p-3.5 rounded-xl shrink-0 flex items-center gap-4">
          <div>
            <div className="text-[11px] font-medium text-slate-400">Max Drift Alert</div>
            <div
              className={`text-xl font-bold font-mono tabular-nums ${
                plan.maxDriftPercent >= 5 ? 'text-amber-400' : 'text-emerald-400'
              }`}
            >
              ±{plan.maxDriftPercent}%
            </div>
          </div>
          <div className="h-8 w-px bg-slate-700" />
          <div>
            <div className="text-[11px] font-medium text-slate-400">Est. Tax Triggered</div>
            <div className="text-xl font-bold text-white font-mono tabular-nums">
              ₹{plan.totalTaxEstimated.toLocaleString('en-IN')}
            </div>
          </div>
        </div>
      </div>

      {/* Mode Switch & Drift Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200">
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg border border-slate-200">
          <button
            type="button"
            onClick={() => setMode('CASH_INFLOW_ONLY')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
              mode === 'CASH_INFLOW_ONLY'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Cash-Inflow Only (Zero Tax Trigger)
          </button>
          <button
            type="button"
            onClick={() => setMode('TAX_OPTIMIZED_FULL')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
              mode === 'TAX_OPTIMIZED_FULL'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Full Sell + Buy Rebalance
          </button>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-600">
          {plan.driftAlertsCount > 0 ? (
            <span className="flex items-center gap-1.5 text-amber-800 font-semibold">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              {plan.driftAlertsCount} tier(s) drifted beyond ±5% threshold
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-emerald-700 font-semibold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              All tiers within ±5% target corridor
            </span>
          )}
        </div>
      </div>

      {appliedToast && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center justify-between">
          <span className="font-semibold">{appliedToast}</span>
          <button
            type="button"
            onClick={() => setAppliedToast(null)}
            className="text-emerald-700 font-bold hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Controls (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 p-5 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-emerald-600" />
              <span>Target Weights & Monthly SIP Cash</span>
            </h3>
            <button
              type="button"
              onClick={() => setTargetWeights(DEFAULT_MARKET_CAP_TARGETS)}
              className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" /> Reset 50/30/20
            </button>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Fresh Cash / SIP Capital to Deploy (₹)
            </label>
            <input
              type="number"
              min={0}
              step={5000}
              value={freshCashInflow}
              onChange={(e) => setFreshCashInflow(Math.max(0, Number(e.target.value)))}
              className="w-full px-3 py-2 text-xs font-mono tabular-nums font-bold rounded-lg border border-slate-300 focus:outline-emerald-600"
            />
            <span className="text-[11px] text-slate-500">
              Current Holdings Value: ₹{plan.totalCurrentValue.toLocaleString('en-IN')} · Post-Deploy: ₹
              {plan.postRebalanceTotal.toLocaleString('en-IN')}
            </span>
          </div>

          <div className="space-y-4 pt-2">
            {(['Large Cap', 'Mid Cap', 'Small Cap'] as const).map((bucket) => (
              <div key={bucket}>
                <div className="flex justify-between items-center text-xs font-semibold text-slate-700 mb-1">
                  <span>{bucket} Target Weight</span>
                  <span className="font-mono tabular-nums text-slate-900">
                    {targetWeights[bucket]}%{' '}
                    {totalRawTarget !== 100 && (
                      <span className="text-[10px] text-slate-400">
                        (Normalized: {Math.round((targetWeights[bucket] / totalRawTarget) * 100)}%)
                      </span>
                    )}
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={5}
                  value={targetWeights[bucket]}
                  onChange={(e) => handleWeightChange(bucket, Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                />
              </div>
            ))}
          </div>

          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-[11px] text-slate-600 flex items-start gap-2">
            <Info className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
            <span>
              <strong>Tax Tip:</strong> Using Cash-Inflow Only mode avoids triggering 20% Short-Term Capital Gains or eating into your ₹1.25L annual LTCG exemption.
            </span>
          </div>
        </div>

        {/* Right Comparison Chart + Action Schedule (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Bar Chart */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-3">
            <h3 className="text-sm font-bold text-slate-900">
              Current Portfolio Weight vs. Target Weight (%)
            </h3>
            <div className="h-52 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="bucket" tick={{ fontSize: 11, fill: '#475569' }} />
                  <YAxis unit="%" tick={{ fontSize: 11, fill: '#64748b' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '0.75rem',
                      color: '#fff',
                      fontSize: '11px',
                    }}
                    formatter={(val: any) => [`${val}%`, '']}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                  <Bar dataKey="Current" fill="#64748b" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Target" fill="#059669" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Action Plan Table */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-900">
                Recommended Execution Schedule
              </h4>
              <button
                type="button"
                onClick={() =>
                  setAppliedToast(
                    `Rebalance Allocation Staged: Routing ₹${freshCashInflow.toLocaleString(
                      'en-IN'
                    )} across underweight buckets (${mode === 'CASH_INFLOW_ONLY' ? 'Zero Tax Trigger' : `Est. Tax ₹${plan.totalTaxEstimated}`}).`
                  )
                }
                className="px-3 py-1 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors flex items-center gap-1"
              >
                <span>Stage Orders</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="divide-y divide-slate-100">
              {plan.allocations.map((row) => (
                <div
                  key={row.bucket}
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-1 max-w-md">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">{row.bucket}</span>
                      <span className="text-[11px] font-mono tabular-nums text-slate-500">
                        Current {row.currentPercent}% vs Target {row.targetPercent}%
                      </span>
                      <span
                        className={`text-[11px] font-mono tabular-nums font-bold ${
                          Math.abs(row.driftPercent) >= 5 ? 'text-amber-700' : 'text-slate-500'
                        }`}
                      >
                        ({row.driftPercent > 0 ? '+' : ''}
                        {row.driftPercent}% drift)
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600">{row.rationale}</p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 font-mono tabular-nums">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        row.action === 'BUY'
                          ? 'bg-emerald-100 text-emerald-800'
                          : row.action === 'SELL'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {row.action}
                    </span>
                    <span className="text-sm font-bold text-slate-900 w-24 text-right">
                      {row.recommendedAmount > 0
                        ? `₹${row.recommendedAmount.toLocaleString('en-IN')}`
                        : '—'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
