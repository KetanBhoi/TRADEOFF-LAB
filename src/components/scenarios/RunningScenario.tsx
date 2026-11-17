import React, { useState } from 'react';
import { RunningParams, LeverLimitThreshold } from '../../types';
import { calculateRunningModel, formatPace, formatTimeHoursMins } from '../../utils/mathUtils';
import { SliderInput } from '../common/SliderInput';
import { StatCard } from '../common/StatCard';
import { RunningRechartsChart } from '../charts/RunningRechartsChart';
import { RechartsSparkline, SparklineDataPoint } from '../common/RechartsSparkline';
import { ThresholdAlertBanner, ActiveThresholdViolation } from '../common/ThresholdAlertBanner';
import { DEFAULT_THRESHOLDS } from '../../utils/thresholdDefaults';
import { Flame, Clock, Calendar, Activity, Zap, Info, ShieldAlert, Award, ArrowUpRight, Download, History, Columns, Globe, Sparkles, FolderKanban, Target, Dices, FileText } from 'lucide-react';

interface RunningScenarioProps {
  params: RunningParams;
  setParams: React.Dispatch<React.SetStateAction<RunningParams>>;
  onOpenSanityCheck: () => void;
  onOpenExport: () => void;
  onOpenHistory: () => void;
  onOpenSplitView?: () => void;
  onOpenGoogleSearch?: (query?: string) => void;
  onOpenMonteCarlo?: () => void;
  onOpenGoalSeek?: () => void;
  onOpenPresets?: () => void;
  onOpenDecisionReport?: () => void;
}

export const RunningScenario: React.FC<RunningScenarioProps> = ({
  params,
  setParams,
  onOpenSanityCheck,
  onOpenExport,
  onOpenHistory,
  onOpenSplitView,
  onOpenGoogleSearch,
  onOpenMonteCarlo,
  onOpenGoalSeek,
  onOpenPresets,
  onOpenDecisionReport,
}) => {
  const [hoveredWeek, setHoveredWeek] = useState<number | null>(null);
  const [showAssumptions, setShowAssumptions] = useState(false);

  // Custom limit thresholds for running levers
  const [thresholds, setThresholds] = useState<Record<string, LeverLimitThreshold>>(() => {
    const map: Record<string, LeverLimitThreshold> = {};
    DEFAULT_THRESHOLDS.running.forEach((t) => {
      map[t.leverKey] = t;
    });
    return map;
  });

  const handleUpdateThreshold = (updated: LeverLimitThreshold) => {
    setThresholds((prev) => ({
      ...prev,
      [updated.leverKey]: updated,
    }));
  };

  const model = calculateRunningModel(params);

  // Active threshold boundary violations
  const activeViolations: ActiveThresholdViolation[] = [];
  if (thresholds['weeksUntilRace']?.enabled) {
    const t = thresholds['weeksUntilRace'];
    const isViolated = t.type === 'min' ? params.weeksUntilRace < t.limitValue : params.weeksUntilRace > t.limitValue;
    if (isViolated) {
      activeViolations.push({
        threshold: t,
        currentValue: params.weeksUntilRace,
        unit: ' weeks',
        leverLabel: 'Weeks Until Race Day',
        onSnapToLimit: () => setParams((p) => ({ ...p, weeksUntilRace: t.limitValue })),
      });
    }
  }

  if (thresholds['runsPerWeek']?.enabled) {
    const t = thresholds['runsPerWeek'];
    const isViolated = t.type === 'max' ? params.runsPerWeek > t.limitValue : params.runsPerWeek < t.limitValue;
    if (isViolated) {
      activeViolations.push({
        threshold: t,
        currentValue: params.runsPerWeek,
        unit: ' runs/wk',
        leverLabel: 'Weekly Training Runs',
        onSnapToLimit: () => setParams((p) => ({ ...p, runsPerWeek: t.limitValue })),
      });
    }
  }

  // Sparklines for real-time lever impact visualization
  const trajectorySparklineData: SparklineDataPoint[] = model.weeklyMilestones.map((m) => ({
    x: m.week,
    y: Math.round(m.projectedPaceSec),
    formattedX: `Wk ${m.week}`,
    formattedY: formatPace(m.projectedPaceSec),
    isCurrent: m.week === params.weeksUntilRace,
  }));

  const weeksSparklineData: SparklineDataPoint[] = Array.from({ length: 21 }, (_, i) => {
    const w = 4 + i;
    const shave = Math.round((model.totalPaceDiffSeconds / w) * 10) / 10;
    return {
      x: w,
      y: shave,
      formattedX: `${w} wks`,
      formattedY: `${shave}s/wk`,
      isCurrent: w === params.weeksUntilRace,
    };
  });

  const runsSparklineData: SparklineDataPoint[] = [2, 3, 4, 5, 6].map((r) => {
    const estMiles = Math.round(r * 5.8 + (params.hasSpeedWork ? 2.5 : 0));
    return {
      x: r,
      y: estMiles,
      formattedX: `${r} runs/wk`,
      formattedY: `${estMiles} mi/wk`,
      isCurrent: r === params.runsPerWeek,
    };
  });

  // SVG Chart Dimensions
  const chartWidth = 640;
  const chartHeight = 260;
  const padding = { top: 25, right: 30, bottom: 40, left: 60 };

  // Calculate Y-scale bounds based on paces
  const maxPace = Math.max(model.currentPaceSeconds + 15, ...model.weeklyMilestones.map((m) => m.projectedPaceSec));
  const minPace = Math.min(model.targetPaceSeconds - 15, ...model.weeklyMilestones.map((m) => m.projectedPaceSec));
  const paceRange = Math.max(30, maxPace - minPace);

  const getY = (paceSec: number) => {
    return padding.top + ((maxPace - paceSec) / paceRange) * (chartHeight - padding.top - padding.bottom);
  };

  const getX = (week: number) => {
    const totalWeeks = params.weeksUntilRace;
    return padding.left + (week / totalWeeks) * (chartWidth - padding.left - padding.right);
  };

  // Generate SVG path for projected curve
  const points = model.weeklyMilestones.map((m) => `${getX(m.week)},${getY(m.projectedPaceSec)}`).join(' ');
  const areaPath = `M ${getX(0)},${chartHeight - padding.bottom} L ${points.split(' ').map(p => `L ${p}`).join(' ').slice(2)} L ${getX(params.weeksUntilRace)},${chartHeight - padding.bottom} Z`;

  // Grid tick marks for Y (paces)
  const yTicks = [
    maxPace,
    maxPace - paceRange * 0.33,
    maxPace - paceRange * 0.66,
    minPace,
  ];

  return (
    <div className="space-y-6">
      {/* Scenario Brief Header Callout */}
      <div className="p-4 sm:p-5 rounded-xl bg-white border border-slate-200/90 shadow-2xs flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider bg-slate-100 text-slate-700 rounded border border-slate-200 whitespace-nowrap">
              Pacing Model
            </span>
            <span className="text-xs font-semibold text-slate-500">
              Half Marathon Sub-2:00 Pacing Optimization
            </span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 mt-1.5">
            Running Pace Training &amp; Adaptation Model
          </h2>
          <p className="text-xs text-slate-600 mt-1 max-w-3xl leading-relaxed">
            Calibrate baseline long-run pace (10:45/mi) against your sub-2:00 goal (9:09/mi). Tweak timeline, runs per week, and speedwork to evaluate required weekly shave demand and biomechanical strain.
          </p>
        </div>

        {/* Scenario-Specific Quick Presets & Tools */}
        <div className="flex items-center gap-1.5 shrink-0 flex-wrap">
          {onOpenPresets && (
            <button
              type="button"
              onClick={onOpenPresets}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-2xs transition-colors whitespace-nowrap shrink-0"
              title="Archetype Profiles & Saved Presets (P)"
            >
              <FolderKanban className="w-3.5 h-3.5 text-orange-600 shrink-0" />
              <span>Archetypes</span>
            </button>
          )}

          {onOpenGoalSeek && (
            <button
              type="button"
              onClick={onOpenGoalSeek}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50/70 hover:bg-indigo-100 border border-indigo-200/80 rounded-lg shadow-2xs transition-colors whitespace-nowrap shrink-0"
              title="Reverse Goal Seek Optimizer (O)"
            >
              <Target className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
              <span>Goal Seek</span>
            </button>
          )}

          {onOpenMonteCarlo && (
            <button
              type="button"
              onClick={onOpenMonteCarlo}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-orange-800 bg-orange-50/70 hover:bg-orange-100 border border-orange-200/80 rounded-lg shadow-2xs transition-colors whitespace-nowrap shrink-0"
              title="Monte Carlo Risk Simulation (M)"
            >
              <Dices className="w-3.5 h-3.5 text-orange-600 shrink-0" />
              <span>Monte Carlo</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setParams((p) => ({ ...p, weeksUntilRace: p.weeksUntilRace === 10 ? 13 : 10 }))}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all whitespace-nowrap shrink-0 ${
              params.weeksUntilRace === 13
                ? 'bg-orange-50 border-orange-300 text-orange-800'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            {params.weeksUntilRace === 13 ? 'Active: +3 Wks Delay (13w)' : 'Test: +3 Wks Delay'}
          </button>
        </div>
      </div>

      {/* Main Two-Zone Layout: Controls Deck on Left/Top, Interactive Visual Canvas on Right/Bottom */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive Levers Deck (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Safety & Boundary Thresholds Alert Banner */}
          <ThresholdAlertBanner violations={activeViolations} />

          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Key Decision Variables
              </span>
              <span className="text-[11px] text-slate-500 font-mono">Live Inputs</span>
            </div>

            {/* Real-time Lever Impact Sparkline */}
            <div className="p-2.5 rounded-lg bg-orange-50/70 border border-orange-200/90 space-y-1">
              <div className="flex items-center justify-between text-[11px] font-semibold text-orange-950">
                <span className="flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-orange-600" />
                  Weekly Pace Adaptation Trajectory Sparkline
                </span>
                <span className="font-mono text-[10px] text-orange-800 bg-white px-1.5 py-0.2 rounded border border-orange-200">
                  {formatPace(model.weeklyMilestones[0]?.projectedPaceSec || 0)} → {formatPace(model.targetPaceSeconds)}
                </span>
              </div>
              <RechartsSparkline
                data={trajectorySparklineData}
                currentX={params.weeksUntilRace}
                color="#ea580c"
                height={32}
                valueFormatter={(val) => formatPace(val)}
                minLabel={`Wk 0: ${formatPace(model.currentPaceSeconds)}`}
                maxLabel={`Wk ${params.weeksUntilRace}: ${formatPace(model.targetPaceSeconds)}`}
              />
            </div>

            {/* Current Long Run Pace */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-800 flex items-center justify-between">
                <span>Current Long Run Pace</span>
                <span className="font-mono text-xs font-bold text-slate-900">
                  {params.currentPaceMinutes}:{params.currentPaceSeconds.toString().padStart(2, '0')} /mi
                </span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                <SliderInput
                  label="Pace Minutes"
                  value={params.currentPaceMinutes}
                  min={7}
                  max={13}
                  unit="m"
                  hint="Base aerobic"
                  onChange={(val) => setParams((p) => ({ ...p, currentPaceMinutes: val }))}
                />
                <SliderInput
                  label="Pace Seconds"
                  value={params.currentPaceSeconds}
                  min={0}
                  max={55}
                  step={5}
                  unit="s"
                  hint="Refined split"
                  onChange={(val) => setParams((p) => ({ ...p, currentPaceSeconds: val }))}
                />
              </div>
            </div>

            {/* Target Half Marathon Finish Time */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <label className="text-xs font-semibold text-slate-800 flex items-center justify-between">
                <span>Target Race Finish Time (13.1 mi)</span>
                <span className="font-mono text-xs font-bold text-slate-900">
                  {formatTimeHoursMins(params.targetTimeHours * 60 + params.targetTimeMinutes)} (
                  {formatPace(model.targetPaceSeconds)} /mi)
                </span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                <SliderInput
                  label="Target Hours"
                  value={params.targetTimeHours}
                  min={1}
                  max={2}
                  unit="hr"
                  onChange={(val) => setParams((p) => ({ ...p, targetTimeHours: val }))}
                />
                <SliderInput
                  label="Target Minutes"
                  value={params.targetTimeMinutes}
                  min={15}
                  max={59}
                  step={1}
                  unit="min"
                  hint="Sub-2h is 1h 59m"
                  onChange={(val) => setParams((p) => ({ ...p, targetTimeMinutes: val }))}
                />
              </div>
            </div>

            {/* Weeks until Race Day */}
            <div className="pt-2 border-t border-slate-100">
              <SliderInput
                label="Weeks Until Race Day"
                value={params.weeksUntilRace}
                min={4}
                max={24}
                step={1}
                unit="weeks"
                hint="Training cycle window"
                onChange={(val) => setParams((p) => ({ ...p, weeksUntilRace: val }))}
                sparklineData={weeksSparklineData}
                sparklineLabel="Required Pace Shave vs Horizon"
                sparklineFormatter={(val) => `${val}s/wk`}
                sparklineColor="#ea580c"
                threshold={thresholds['weeksUntilRace']}
                onThresholdChange={handleUpdateThreshold}
              />
            </div>

            {/* Workouts per Week */}
            <div className="pt-2 border-t border-slate-100">
              <SliderInput
                label="Weekly Training Runs"
                value={params.runsPerWeek}
                min={2}
                max={6}
                step={1}
                unit="runs/wk"
                hint="3 runs/wk is default"
                onChange={(val) => setParams((p) => ({ ...p, runsPerWeek: val }))}
                sparklineData={runsSparklineData}
                sparklineLabel="Weekly Volume Progression"
                sparklineFormatter={(val) => `${val} mi`}
                sparklineColor="#ea580c"
                threshold={thresholds['runsPerWeek']}
                onThresholdChange={handleUpdateThreshold}
              />
            </div>

            {/* Speed Workout & Rest Days Toggles */}
            <div className="pt-2 border-t border-slate-100 space-y-3">
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <div>
                  <div className="text-xs font-semibold text-slate-900">Quality Speed Workout</div>
                  <div className="text-[11px] text-slate-500">1 of weekly runs is intervals/tempo</div>
                </div>
                <button
                  type="button"
                  onClick={() => setParams((p) => ({ ...p, hasSpeedWork: !p.hasSpeedWork }))}
                  className={`px-3 py-1 text-xs font-semibold rounded-md border transition-colors ${
                    params.hasSpeedWork
                      ? 'bg-orange-600 text-white border-orange-700'
                      : 'bg-white text-slate-700 border-slate-300'
                  }`}
                >
                  {params.hasSpeedWork ? 'Included' : 'Off'}
                </button>
              </div>

              <SliderInput
                label="Rest Days Between Hard Runs"
                value={params.restDaysBetweenRuns}
                min={1}
                max={4}
                step={1}
                unit="days"
                hint="Prevents overuse fatigue"
                onChange={(val) => setParams((p) => ({ ...p, restDaysBetweenRuns: val }))}
              />
            </div>
          </div>
        </div>

        {/* Right Column: Visual Stage, Real-Time Chart & Key Metrics (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Top Live Metric Cards with Assumptions Toggle */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Live Outcome Metrics
              </span>
              <button
                type="button"
                onClick={() => setShowAssumptions(!showAssumptions)}
                className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg border transition-all ${
                  showAssumptions
                    ? 'bg-orange-50 border-orange-300 text-orange-900 shadow-2xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
                title="Toggle underlying formulas and mathematical assumptions across metrics"
              >
                <Info className="w-3.5 h-3.5 text-orange-600" />
                <span>{showAssumptions ? 'Hide Assumptions' : 'Assumptions & Formulas'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <StatCard
                label="Pace Drop Per Week"
                value={`-${model.shavePerWeekSeconds.toFixed(1)}`}
                unit="sec/mi/wk"
                deltaText={`${Math.round(model.totalPaceDiffSeconds)}s total cut`}
                subtext={`over ${params.weeksUntilRace} weeks`}
                statusBadge={model.feasibilityLabel.split(' ')[0]}
                statusType={
                  model.feasibilityLevel === 'optimal'
                    ? 'nominal'
                    : model.feasibilityLevel === 'moderate'
                    ? 'neutral'
                    : model.feasibilityLevel === 'aggressive'
                    ? 'elevated'
                    : 'demanding'
                }
                showAssumptionsInline={showAssumptions}
                assumptionInfo={{
                  formula: 'ΔPace/Wk = (Pace_curr - Pace_target) ÷ Weeks',
                  substitution: `(${model.currentPaceSeconds}s - ${Math.round(model.targetPaceSeconds)}s) ÷ ${params.weeksUntilRace} wks = ${model.shavePerWeekSeconds.toFixed(1)} sec/mi/wk`,
                  explanation: 'Models linear weekly aerobic conditioning needed to bridge the fitness gap between current long-run pace and race goal pace.',
                  keyFactors: [
                    '≤ 5 sec/wk: standard cardiovascular base adaptation',
                    '5–9.5 sec/wk: requires weekly threshold intervals and structured recovery',
                    '> 14 sec/wk: sharp elevation in musculoskeletal stress and overuse risk'
                  ]
                }}
              />

              <StatCard
                label="Target Goal Pace"
                value={formatPace(model.targetPaceSeconds)}
                unit="/mile"
                deltaText={`Current: ${formatPace(model.currentPaceSeconds)}`}
                subtext={`Gap: ${formatPace(model.totalPaceDiffSeconds)}`}
                statusBadge="Goal Pace"
                statusType="nominal"
                showAssumptionsInline={showAssumptions}
                assumptionInfo={{
                  formula: 'Pace_goal = TotalTargetSeconds ÷ 13.1094 mi',
                  substitution: `${params.targetTimeHours * 3600 + params.targetTimeMinutes * 60} sec ÷ 13.1094 mi = ${formatPace(model.targetPaceSeconds)} /mi`,
                  explanation: 'Strict average per-mile split pace required to break the targeted race finish time on a USATF-certified 13.1094 mile course.',
                  keyFactors: [
                    'Even pacing profile across full 13.1 miles without positive splits',
                    'Course assumptions: flat elevation profile and temperate race weather'
                  ]
                }}
              />

              <StatCard
                label="Injury Risk Index"
                value={`${model.injuryRiskScore}%`}
                deltaText={model.feasibilityLevel.toUpperCase()}
                subtext={params.hasSpeedWork ? 'Speed session active' : 'Aerobic only'}
                statusBadge={model.injuryRiskScore < 50 ? 'Safe' : model.injuryRiskScore < 75 ? 'Caution' : 'High'}
                statusType={model.injuryRiskScore < 50 ? 'nominal' : model.injuryRiskScore < 75 ? 'elevated' : 'demanding'}
                showAssumptionsInline={showAssumptions}
                assumptionInfo={{
                  formula: 'Risk = BaseRisk(ΔPace) + FreqPenalty + SpeedMod + RestPenalty',
                  substitution: `Pace Shave: ${model.shavePerWeekSeconds.toFixed(1)}s/wk · Rest: ${params.restDaysBetweenRuns} days · Speed: ${params.hasSpeedWork ? 'Active (-5%)' : 'None (+10%)'}`,
                  explanation: 'Empirical sports medicine risk score evaluating tissue strain, recovery deficit, and training density.',
                  keyFactors: [
                    'At least 2 recovery days recommended between high-intensity workouts',
                    'Sudden volume or intensity jumps > 10%/week multiply injury likelihood'
                  ]
                }}
              />
            </div>
          </div>

          {/* Recharts Trend Line & Sensitivity Sweep Chart */}
          <RunningRechartsChart
            milestones={model.weeklyMilestones}
            targetPaceSec={model.targetPaceSeconds}
            currentPaceSec={model.currentPaceSeconds}
            weeksUntilRace={params.weeksUntilRace}
            totalPaceDiffSec={model.totalPaceDiffSeconds}
            runsPerWeek={params.runsPerWeek}
            hasSpeedWork={params.hasSpeedWork}
          />

          {/* Verdict Callout Banner */}
          <div className={`p-3 rounded-lg border flex items-start gap-3 ${model.feasibilityColor}`}>
            <Info className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="text-xs leading-relaxed">
              <strong>Training Assessment:</strong> {model.verdictTip}
            </div>
          </div>

          {/* Riegel Race Pace Equivalents (Sanity Check Matrix) */}
          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Equivalent Race Times (Riegel Formula Validation)
              </h4>
              <span className="text-[11px] text-slate-500">T2 = T1 × (D2 / D1)^1.06</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {model.riegelEquivalents.map((race) => (
                <div key={race.race} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="text-xs font-semibold text-slate-900">{race.race}</div>
                  <div className="text-[11px] text-slate-500 font-mono">{race.distance}</div>
                  <div className="mt-1 pt-1 border-t border-slate-200/60 flex items-baseline justify-between text-xs">
                    <span className="text-slate-500 text-[10px]">Target:</span>
                    <span className="font-mono font-bold text-slate-900">{race.targetTime}</span>
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
