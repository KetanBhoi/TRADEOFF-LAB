import React, { useState } from 'react';
import {
  INITIAL_DRAWDOWN_METRICS,
  INITIAL_STRESS_SCENARIOS,
} from '../../utils/advancedTradingData';
import { DrawdownMetrics, StressScenarioItem } from '../../types/trading';
import {
  ShieldAlert,
  AlertTriangle,
  TrendingDown,
  Activity,
  Zap,
  Info,
  Calendar,
  Layers,
  ArrowRight,
  Sliders,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';

const HISTORICAL_DRAWDOWN_TIMELINE = [
  { month: 'Jan 24', drawdown: 0.0, portfolioEquity: 270000 },
  { month: 'Feb 24', drawdown: -1.2, portfolioEquity: 266760 },
  { month: 'Mar 24', drawdown: -3.8, portfolioEquity: 259740 },
  { month: 'Apr 24', drawdown: -0.5, portfolioEquity: 268650 },
  { month: 'May 24', drawdown: -2.1, portfolioEquity: 264330 },
  { month: 'Jun 24', drawdown: -7.2, portfolioEquity: 250560 }, // Election Flash Dip
  { month: 'Jul 24', drawdown: 0.0, portfolioEquity: 275000 },  // Full Recovery in 14 days
  { month: 'Aug 24', drawdown: -1.4, portfolioEquity: 271150 },
  { month: 'Sep 24', drawdown: 0.0, portfolioEquity: 284000 },
  { month: 'Oct 24', drawdown: -3.5, portfolioEquity: 274060 },
  { month: 'Nov 24', drawdown: -2.8, portfolioEquity: 276048 },
];

export const DrawdownReportTab: React.FC = () => {
  const [metrics, setMetrics] = useState<DrawdownMetrics>(INITIAL_DRAWDOWN_METRICS);
  const [stressScenarios, setStressScenarios] = useState<StressScenarioItem[]>(INITIAL_STRESS_SCENARIOS);
  const [customStressPercent, setCustomStressPercent] = useState<number>(15);

  const customSimulatedDrop = customStressPercent * metrics.portfolioBeta;
  const currentTotalEquity = 289395;
  const customEstimatedLoss = Math.round(currentTotalEquity * (customSimulatedDrop / 100));

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-rose-950 to-slate-900 text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-rose-500/20 text-rose-300 border border-rose-500/30">
              Downside & Tail-Risk Engineering
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              VaR Historical Simulation
            </span>
          </div>
          <h2 className="text-xl font-bold tracking-tight">Portfolio Drawdown & Stress Test Report</h2>
          <p className="text-xs text-slate-300 max-w-2xl mt-1">
            Analyze maximum peak-to-trough capital impairment, underwater recovery velocity, and parametric Value-at-Risk. Model portfolio survival against simulated Nifty crashes before live execution.
          </p>
        </div>

        {/* VaR Highlight Card */}
        <div className="bg-slate-800/80 border border-slate-700/60 p-4 rounded-xl shrink-0 flex items-center gap-4">
          <div>
            <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">1-Day VaR (95%)</div>
            <div className="text-xl font-black text-rose-400 font-mono">
              -₹{metrics.var95Historical1D.toLocaleString('en-IN')}
            </div>
            <div className="text-[9px] text-slate-400">1-day 99% VaR: -₹{metrics.var99Historical1D.toLocaleString('en-IN')}</div>
          </div>
          <div className="h-8 w-px bg-slate-700" />
          <div>
            <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Max Drawdown</div>
            <div className="text-xl font-black text-white font-mono">{metrics.maxDrawdown}%</div>
            <div className="text-[9px] text-slate-400">Recovery: {metrics.recoveryDays} days</div>
          </div>
        </div>
      </div>

      {/* Mandatory Statutory Risk Notice */}
      <div className="p-4 rounded-xl bg-slate-100 border border-slate-300 text-slate-800 text-xs flex items-start gap-3">
        <Info className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <strong className="block font-bold text-slate-900">Statistical Boundary Caution:</strong>
          <p className="text-slate-600 leading-relaxed text-[11px]">
            Value-at-Risk (VaR) and drawdown metrics are calculated using historical daily returns over 252 sessions. <strong>Past volatility does not limit future downside losses.</strong> Black-swan events, liquidity freezes, and unexpected overnight gap-downs can exceed standard 99% confidence boundaries.
          </p>
        </div>
      </div>

      {/* Underwater Drawdown Chart */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-rose-600" />
              <span>Underwater Drawdown Profile (% Below Peak)</span>
            </h3>
            <span className="text-[11px] text-slate-500">Historical peak-to-trough curve across 2024</span>
          </div>

          <div className="flex items-center gap-3 text-xs font-mono">
            <span className="text-slate-500">
              Longest Trough: <strong className="text-slate-800 font-bold">{metrics.recoveryDays} days</strong>
            </span>
            <span className="text-slate-500">
              Calmar Ratio: <strong className="text-indigo-600 font-bold">{metrics.calmarRatio}</strong>
            </span>
          </div>
        </div>

        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={HISTORICAL_DRAWDOWN_TIMELINE} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis
                domain={[-10, 0]}
                unit="%"
                tick={{ fontSize: 11, fill: '#64748b' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  borderRadius: '0.75rem',
                  color: '#fff',
                  fontSize: '11px',
                }}
                formatter={(val: any) => [`${val}%`, 'Drawdown from Peak']}
              />
              <Area
                type="monotone"
                dataKey="drawdown"
                stroke="#e11d48"
                strokeWidth={2}
                fill="#ffe4e6"
                name="Drawdown %"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Stress Testing Engine: "What If Nifty Crashes 10%, 20%, 30%?" */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" />
              <span>Stress Testing Simulator: Macro Shock Impact</span>
            </h3>
            <span className="text-[11px] text-slate-500">
              Computed using your portfolio's weighted Beta of{' '}
              <strong className="text-slate-800 font-mono font-bold">{metrics.portfolioBeta}</strong> relative to Nifty 50
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {stressScenarios.map((scen) => (
            <div
              key={scen.id}
              className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col justify-between space-y-3"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">{scen.eventTitle.split(':')[0]}</span>
                  <span className="font-mono text-xs font-bold text-rose-600">{scen.benchmarkDropPercent}%</span>
                </div>

                <div className="mt-3 p-3 bg-white rounded-lg border border-slate-200 text-xs space-y-1.5">
                  <div className="flex justify-between text-slate-600">
                    <span>Portfolio Drop:</span>
                    <span className="font-mono font-bold text-rose-600">{scen.portfolioSimulatedDropPercent}%</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Estimated Capital Loss:</span>
                    <span className="font-mono font-bold text-rose-700">-₹{scen.estimatedLossAmount.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-slate-900 font-bold pt-1 border-t border-slate-100">
                    <span>Remaining Equity:</span>
                    <span className="font-mono text-slate-900">₹{scen.survivalCapitalRemaining.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                <p className="mt-3 text-[11px] text-slate-600 leading-relaxed">
                  {scen.keyVulnerability}
                </p>
              </div>

              <div className="text-[10px] text-emerald-700 bg-emerald-50 p-2 rounded border border-emerald-200 flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Kill Switch triggers at ₹15,000 threshold to prevent full drawdown.</span>
              </div>
            </div>
          ))}
        </div>

        {/* Custom Crash Percentage Slider */}
        <div className="p-4 bg-indigo-50/50 rounded-xl border border-indigo-100 space-y-3">
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-indigo-950 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-indigo-600" />
              Custom Stress Slider: What if Nifty falls {customStressPercent}%?
            </span>
            <span className="font-mono font-bold text-rose-600">
              Estimated Portfolio Loss: -₹{customEstimatedLoss.toLocaleString('en-IN')} (-{customSimulatedDrop.toFixed(1)}%)
            </span>
          </div>
          <input
            type="range"
            min="5"
            max="40"
            step="1"
            value={customStressPercent}
            onChange={(e) => setCustomStressPercent(Number(e.target.value))}
            className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
          />
          <div className="flex justify-between text-[10px] text-slate-500 font-mono">
            <span>-5% Flash Dip</span>
            <span>-15% Correction</span>
            <span>-25% Bear Market</span>
            <span>-40% Structural Crash</span>
          </div>
        </div>
      </div>
    </div>
  );
};
