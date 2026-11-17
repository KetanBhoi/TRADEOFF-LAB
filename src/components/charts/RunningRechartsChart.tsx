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
  ReferenceLine,
  Area,
  ComposedChart,
} from 'recharts';
import { formatPace } from '../../utils/mathUtils';
import { TrendingUp, Activity, ShieldAlert, Zap } from 'lucide-react';

interface RunningRechartsChartProps {
  milestones: { week: number; projectedPaceSec: number; targetPaceSec: number; weeklyMiles: number }[];
  targetPaceSec: number;
  currentPaceSec: number;
  weeksUntilRace: number;
  totalPaceDiffSec: number;
  runsPerWeek?: number;
  hasSpeedWork?: boolean;
}

type RunningChartMode = 'timeline' | 'weeksSweep' | 'frequencySweep';

export const RunningRechartsChart: React.FC<RunningRechartsChartProps> = ({
  milestones,
  targetPaceSec,
  currentPaceSec,
  weeksUntilRace,
  totalPaceDiffSec,
  runsPerWeek = 3,
  hasSpeedWork = true,
}) => {
  const [viewMode, setViewMode] = useState<RunningChartMode>('weeksSweep');

  // 1. Prepare data for the timeline projection
  const timelineData = milestones.map((m) => {
    const linearPaceSec = Math.round(currentPaceSec - (totalPaceDiffSec * (m.week / weeksUntilRace)));
    return {
      week: `Wk ${m.week}`,
      weekNum: m.week,
      projectedPace: m.projectedPaceSec,
      linearPace: linearPaceSec,
      targetPace: Math.round(targetPaceSec),
      weeklyMiles: m.weeklyMiles,
      paceFormatted: formatPace(m.projectedPaceSec),
      linearFormatted: formatPace(linearPaceSec),
      targetFormatted: formatPace(targetPaceSec),
    };
  });

  // 2. Sensitivity Sweep: Weeks Until Race (4 to 24 weeks)
  const weeksSweepData = [];
  for (let w = 4; w <= 24; w++) {
    const requiredShave = totalPaceDiffSec / w;
    weeksSweepData.push({
      weeks: `${w} wks`,
      weeksNum: w,
      requiredShave: Math.round(requiredShave * 10) / 10,
      isCurrent: w === weeksUntilRace,
    });
  }

  // 3. Sensitivity Sweep: Weekly Frequency (2 to 6 runs/week)
  const frequencySweepData = [];
  for (let r = 2; r <= 6; r++) {
    const estMiles = Math.round(r * 5.8 + (hasSpeedWork ? 3 : 0));
    // Injury risk simulation: base + frequency load
    const risk = Math.min(98, Math.max(15, Math.round(25 + (r - 2) * 14 + (hasSpeedWork ? 8 : 0))));
    frequencySweepData.push({
      runs: `${r} runs`,
      runsNum: r,
      weeklyMiles: estMiles,
      injuryRisk: risk,
      isCurrent: r === runsPerWeek,
    });
  }

  // Calculate Y domain for timeline
  const paces = [
    currentPaceSec + 10,
    targetPaceSec - 10,
    ...milestones.map((m) => m.projectedPaceSec),
  ];
  const minPace = Math.floor(Math.min(...paces));
  const maxPace = Math.ceil(Math.max(...paces));

  const CustomTimelineTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900/95 text-white p-3 rounded-lg shadow-xl border border-slate-700 text-xs font-mono space-y-1.5 z-50">
          <div className="font-bold text-orange-400 border-b border-slate-700 pb-1">
            {label} ({data.weeklyMiles} mi/wk)
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-slate-300">Projected Pace:</span>
            <span className="font-bold text-white">{data.paceFormatted} /mi</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-slate-400">Linear Benchmark:</span>
            <span className="text-slate-300">{data.linearFormatted} /mi</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-slate-400">Target Pace:</span>
            <span className="text-emerald-400">{data.targetFormatted} /mi</span>
          </div>
        </div>
      );
    }
    return null;
  };

  const CustomWeeksSweepTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900/95 text-white p-3 rounded-lg shadow-xl border border-slate-700 text-xs font-mono space-y-1 z-50">
          <div className="font-bold text-orange-400 border-b border-slate-700 pb-1">
            Timeline: {label} {data.isCurrent ? '(Active Setting)' : ''}
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-slate-300">Weekly Shave Needed:</span>
            <span className="font-bold text-white">{data.requiredShave} sec/wk</span>
          </div>
          <div className="text-[10px] text-slate-400 pt-0.5">
            {data.requiredShave <= 6
              ? '● Safe Cardiovascular Adaptation'
              : data.requiredShave <= 10
              ? '▲ Moderate Strain'
              : '■ High Injury & Overuse Risk'}
          </div>
        </div>
      );
    }
    return null;
  };

  const CustomFrequencyTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900/95 text-white p-3 rounded-lg shadow-xl border border-slate-700 text-xs font-mono space-y-1.5 z-50">
          <div className="font-bold text-orange-400 border-b border-slate-700 pb-1">
            Frequency: {label}/wk {data.isCurrent ? '(Active)' : ''}
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-slate-300">Weekly Mileage:</span>
            <span className="font-bold text-white">{data.weeklyMiles} miles</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-slate-300">Injury Risk Index:</span>
            <span className={`font-bold ${data.injuryRisk < 50 ? 'text-emerald-400' : data.injuryRisk < 75 ? 'text-amber-400' : 'text-rose-400'}`}>
              {data.injuryRisk}%
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

  // Sensitivity elasticity calculation
  const currentShave = (totalPaceDiffSec / weeksUntilRace).toFixed(1);
  const plus2WeeksShave = (totalPaceDiffSec / (weeksUntilRace + 2)).toFixed(1);
  const deltaSavings = (parseFloat(currentShave) - parseFloat(plus2WeeksShave)).toFixed(1);

  return (
    <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs space-y-3">
      {/* Chart Header & View Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-orange-600" />
              <span>
                {viewMode === 'timeline'
                  ? 'Week-by-Week Pace Adaptation Trajectory'
                  : viewMode === 'weeksSweep'
                  ? 'Sensitivity Analysis: Weeks to Race vs. Pace Shave Demand'
                  : 'Sensitivity Analysis: Weekly Runs Frequency vs. Injury Risk'}
              </span>
            </h3>
            {viewMode !== 'timeline' && (
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-orange-100 text-orange-800 border border-orange-200">
                Sensitivity
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            {viewMode === 'timeline'
              ? 'Multi-curve projection comparing adaptive progress vs linear benchmark trend line.'
              : viewMode === 'weeksSweep'
              ? 'Sensitivity curve visualizing how expanding race timeline softens required weekly pace cuts.'
              : 'Evaluates musculoskeletal load and aerobic mileage volume as weekly running frequency scales.'}
          </p>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg self-start sm:self-auto shrink-0">
          <button
            type="button"
            onClick={() => setViewMode('weeksSweep')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all whitespace-nowrap ${
              viewMode === 'weeksSweep'
                ? 'bg-white text-slate-900 shadow-2xs font-bold ring-1 ring-slate-200/50'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Weeks Sensitivity
          </button>
          <button
            type="button"
            onClick={() => setViewMode('frequencySweep')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all whitespace-nowrap ${
              viewMode === 'frequencySweep'
                ? 'bg-white text-slate-900 shadow-2xs font-bold ring-1 ring-slate-200/50'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Runs/Wk Sensitivity
          </button>
          <button
            type="button"
            onClick={() => setViewMode('timeline')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all whitespace-nowrap ${
              viewMode === 'timeline'
                ? 'bg-white text-slate-900 shadow-2xs font-bold ring-1 ring-slate-200/50'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Pace Trajectory
          </button>
        </div>
      </div>

      {/* Main Recharts Area */}
      <div className="w-full h-64 select-none pt-2">
        <ResponsiveContainer width="100%" height="100%">
          {viewMode === 'timeline' ? (
            <ComposedChart
              data={timelineData}
              margin={{ top: 10, right: 20, left: 10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis
                dataKey="week"
                stroke="#64748b"
                fontSize={11}
                tickLine={false}
                fontFamily="JetBrains Mono, monospace"
              />
              <YAxis
                reversed={true} // Lower pace (faster) is higher visually
                domain={[minPace, maxPace]}
                tickFormatter={(val) => formatPace(val)}
                stroke="#64748b"
                fontSize={11}
                tickLine={false}
                fontFamily="JetBrains Mono, monospace"
                width={55}
              />
              <Tooltip content={<CustomTimelineTooltip />} />
              <Legend
                wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                iconType="plainline"
              />

              {/* Sub-2h Goal Pace Reference Line */}
              <ReferenceLine
                y={targetPaceSec}
                stroke="#059669"
                strokeDasharray="4 4"
                strokeWidth={1.5}
                label={{
                  value: `Target Goal (${formatPace(targetPaceSec)})`,
                  position: 'insideBottomRight',
                  fill: '#059669',
                  fontSize: 10,
                  fontFamily: 'JetBrains Mono',
                }}
              />

              {/* Linear Benchmark Trend Line */}
              <Line
                type="linear"
                dataKey="linearPace"
                name="Linear Benchmark"
                stroke="#94a3b8"
                strokeDasharray="4 4"
                strokeWidth={2}
                dot={false}
              />

              {/* Main Adaptive Trajectory Line */}
              <Line
                type="monotone"
                dataKey="projectedPace"
                name="Adaptive Pace Curve"
                stroke="var(--theme-primary, #ea580c)"
                strokeWidth={3}
                dot={{ r: 3.5, fill: '#ffffff', stroke: 'var(--theme-primary, #ea580c)', strokeWidth: 2 }}
                activeDot={{ r: 6, fill: 'var(--theme-primary, #ea580c)', stroke: '#ffffff', strokeWidth: 2 }}
              />
            </ComposedChart>
          ) : viewMode === 'weeksSweep' ? (
            <ComposedChart
              data={weeksSweepData}
              margin={{ top: 10, right: 20, left: 10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis
                dataKey="weeks"
                stroke="#64748b"
                fontSize={11}
                tickLine={false}
                fontFamily="JetBrains Mono, monospace"
              />
              <YAxis
                stroke="#64748b"
                fontSize={11}
                tickLine={false}
                fontFamily="JetBrains Mono, monospace"
                width={45}
                unit="s"
              />
              <Tooltip content={<CustomWeeksSweepTooltip />} />
              <Legend
                wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                iconType="plainline"
              />

              {/* Threshold Guidelines */}
              <ReferenceLine
                y={6}
                stroke="#059669"
                strokeDasharray="3 3"
                label={{ value: 'Safe Adaptation (≤6s/wk)', fill: '#059669', fontSize: 10, position: 'insideTopLeft' }}
              />

              <ReferenceLine
                y={10}
                stroke="#d97706"
                strokeDasharray="3 3"
                label={{ value: 'Challenging Threshold (10s/wk)', fill: '#d97706', fontSize: 10, position: 'insideTopRight' }}
              />

              {/* Active Setting Reference Line */}
              <ReferenceLine
                x={`${weeksUntilRace} wks`}
                stroke="var(--theme-primary, #ea580c)"
                strokeWidth={2}
                strokeDasharray="3 3"
                label={{ value: `Active (${weeksUntilRace}w)`, fill: 'var(--theme-primary, #ea580c)', fontSize: 10, position: 'top' }}
              />

              {/* Sweep Line */}
              <Line
                type="monotone"
                dataKey="requiredShave"
                name="Required Pace Drop (sec/wk)"
                stroke="var(--theme-primary, #ea580c)"
                strokeWidth={3}
                dot={(props: any) => {
                  const { cx, cy, payload } = props;
                  if (payload.isCurrent) {
                    return (
                      <circle
                        key={payload.weeksNum}
                        cx={cx}
                        cy={cy}
                        r={6}
                        fill="var(--theme-primary, #ea580c)"
                        stroke="#ffffff"
                        strokeWidth={2}
                      />
                    );
                  }
                  return (
                    <circle
                      key={payload.weeksNum}
                      cx={cx}
                      cy={cy}
                      r={2.5}
                      fill="#94a3b8"
                    />
                  );
                }}
              />
            </ComposedChart>
          ) : (
            <ComposedChart
              data={frequencySweepData}
              margin={{ top: 10, right: 20, left: 10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis
                dataKey="runs"
                stroke="#64748b"
                fontSize={11}
                tickLine={false}
                fontFamily="JetBrains Mono, monospace"
              />
              <YAxis
                yAxisId="left"
                stroke="#0284c7"
                fontSize={11}
                tickLine={false}
                fontFamily="JetBrains Mono, monospace"
                width={45}
                unit="mi"
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                stroke="#e11d48"
                fontSize={11}
                tickLine={false}
                fontFamily="JetBrains Mono, monospace"
                width={45}
                unit="%"
              />
              <Tooltip content={<CustomFrequencyTooltip />} />
              <Legend
                wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                iconType="plainline"
              />

              <ReferenceLine
                yAxisId="right"
                y={70}
                stroke="#ef4444"
                strokeDasharray="3 3"
                label={{ value: 'High Strain Risk (70%)', fill: '#ef4444', fontSize: 10, position: 'insideTopRight' }}
              />

              <ReferenceLine
                x={`${runsPerWeek} runs`}
                stroke="var(--theme-primary, #ea580c)"
                strokeWidth={2}
                strokeDasharray="3 3"
                label={{ value: `Active (${runsPerWeek}/wk)`, fill: 'var(--theme-primary, #ea580c)', fontSize: 10, position: 'top' }}
              />

              <Line
                yAxisId="left"
                type="monotone"
                dataKey="weeklyMiles"
                name="Est. Weekly Volume (miles)"
                stroke="#0284c7"
                strokeWidth={2.5}
                dot={{ r: 3.5, fill: '#0284c7' }}
              />

              <Line
                yAxisId="right"
                type="monotone"
                dataKey="injuryRisk"
                name="Injury Risk Index (%)"
                stroke="#e11d48"
                strokeWidth={2.5}
                dot={{ r: 3.5, fill: '#e11d48' }}
              />
            </ComposedChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Sensitivity Insight Callout */}
      {viewMode === 'weeksSweep' && (
        <div className="p-2.5 rounded-lg bg-orange-50/70 border border-orange-200 flex items-start gap-2 text-xs">
          <Activity className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
          <div className="text-orange-950 leading-relaxed">
            <strong>Timeline Sensitivity Elasticity:</strong> Expanding preparation from {weeksUntilRace} to {weeksUntilRace + 2} weeks eases required weekly shave from <strong>{currentShave}s</strong> down to <strong>{plus2WeeksShave}s/mile/week</strong> (a <strong>-{deltaSavings}s/wk relief</strong>), significantly reducing peak training risk.
          </div>
        </div>
      )}

      {viewMode === 'frequencySweep' && (
        <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-start gap-2 text-xs">
          <ShieldAlert className="w-4 h-4 text-slate-600 shrink-0 mt-0.5" />
          <div className="text-slate-700 leading-relaxed">
            <strong>Frequency Trade-off:</strong> Adding an extra run day adds ~5.8 miles of weekly aerobic stimulus, but steepens tendon & soft-tissue strain index by <strong>+14%</strong>. At 5+ runs/week, recovery intervals become paramount.
          </div>
        </div>
      )}
    </div>
  );
};
