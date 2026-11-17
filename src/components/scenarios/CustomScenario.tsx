import React, { useState } from 'react';
import { CustomParams, LeverLimitThreshold } from '../../types';
import { calculateCustomModel } from '../../utils/mathUtils';
import { SliderInput } from '../common/SliderInput';
import { StatCard } from '../common/StatCard';
import { CustomRechartsChart } from '../charts/CustomRechartsChart';
import { RechartsSparkline, SparklineDataPoint } from '../common/RechartsSparkline';
import { ThresholdAlertBanner, ActiveThresholdViolation } from '../common/ThresholdAlertBanner';
import { DEFAULT_THRESHOLDS } from '../../utils/thresholdDefaults';
import { Sliders, Settings2, Target, BarChart2, Info, Download, History, Columns, Globe, Sparkles } from 'lucide-react';

interface CustomScenarioProps {
  params: CustomParams;
  setParams: React.Dispatch<React.SetStateAction<CustomParams>>;
  onOpenSanityCheck: () => void;
  onOpenExport: () => void;
  onOpenHistory: () => void;
  onOpenSplitView?: () => void;
  onOpenGoogleSearch?: (query?: string) => void;
}

export const CustomScenario: React.FC<CustomScenarioProps> = ({
  params,
  setParams,
  onOpenSanityCheck,
  onOpenExport,
  onOpenHistory,
  onOpenSplitView,
  onOpenGoogleSearch,
}) => {
  const [showAssumptions, setShowAssumptions] = useState(false);

  // Custom limit thresholds for custom levers
  const [thresholds, setThresholds] = useState<Record<string, LeverLimitThreshold>>(() => {
    const map: Record<string, LeverLimitThreshold> = {};
    DEFAULT_THRESHOLDS.custom.forEach((t) => {
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

  const model = calculateCustomModel(params);

  // Active threshold violations across custom levers
  const activeViolations: ActiveThresholdViolation[] = [];
  params.levers.forEach((lever, idx) => {
    const leverKey = lever.id || `lever-${idx}`;
    const t = thresholds[leverKey];
    if (t?.enabled) {
      const isViolated = t.type === 'max' ? lever.value > t.limitValue : lever.value < t.limitValue;
      if (isViolated) {
        activeViolations.push({
          threshold: t,
          currentValue: lever.value,
          unit: ` ${lever.unit}`,
          leverLabel: lever.label,
          onSnapToLimit: () => {
            const next = [...params.levers] as [typeof params.levers[0], typeof params.levers[1], typeof params.levers[2]];
            next[idx] = { ...next[idx], value: t.limitValue };
            setParams((p) => ({ ...p, levers: next }));
          },
        });
      }
    }
  });

  function computeResultWithLever(leverIndex: number, testValue: number): number {
    const v = [params.levers[0].value, params.levers[1].value, params.levers[2].value];
    v[leverIndex] = testValue;
    if (params.formulaType === 'linear-sum') {
      return v[0] + v[1] + v[2];
    } else if (params.formulaType === 'multiplicative') {
      return (v[0] * v[1]) / Math.max(1, v[2]);
    } else {
      return ((v[0] * 100) / Math.max(1, v[1])) * (1 + v[2] / 100);
    }
  }

  const leverSparklines: SparklineDataPoint[][] = params.levers.map((lever, idx) => {
    const step = (lever.max - lever.min) / 10 || 1;
    return Array.from({ length: 11 }, (_, s) => {
      const val = Math.round((lever.min + s * step) * 10) / 10;
      const res = Math.round(computeResultWithLever(idx, val) * 10) / 10;
      return {
        x: val,
        y: res,
        formattedX: `${val} ${lever.unit}`,
        formattedY: `${res} ${params.goalMetricUnit}`,
        isCurrent: Math.abs(val - lever.value) <= step * 0.5,
      };
    });
  });

  const overallSensitivitySparkline: SparklineDataPoint[] = model.sensitivityPoints.map((pt) => ({
    x: pt.value1,
    y: pt.result,
    formattedX: `${pt.value1} ${params.levers[0].unit}`,
    formattedY: `${pt.result} ${params.goalMetricUnit}`,
    isCurrent: Math.abs(pt.value1 - params.levers[0].value) <= ((params.levers[0].max - params.levers[0].min) / 10) * 0.5,
  }));

  const l1 = params.levers[0];

  const updateLever = (index: number, val: number) => {
    const updated = [...params.levers] as [typeof params.levers[0], typeof params.levers[1], typeof params.levers[2]];
    updated[index] = { ...updated[index], value: val };
    setParams((p) => ({ ...p, levers: updated }));
  };

  return (
    <div className="space-y-6">
      {/* Scenario Header */}
      <div className="p-4 sm:p-5 rounded-xl bg-white border border-slate-200/90 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider bg-slate-100 text-slate-700 rounded border border-slate-200">
              Parametric Sandbox
            </span>
            <span className="text-xs font-semibold text-slate-500">
              User-Defined Levers & Formula Engineering
            </span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 mt-1.5">
            {params.title}
          </h2>
          <p className="text-xs text-slate-600 mt-1 max-w-3xl leading-relaxed">
            Quantitatively model your personal dilemma by testing 3 customizable levers against your target threshold ({params.targetValue} {params.goalMetricUnit}).
          </p>
        </div>

        {/* Scenario Presets / Model Info */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider hidden sm:inline">Engine:</span>
          <span className="px-3 py-1.5 text-xs font-mono font-bold rounded-lg border bg-white border-slate-200 text-slate-800 shadow-2xs">
            {params.formulaType.toUpperCase()} Formulation
          </span>
        </div>
      </div>

      {/* Main Two-Zone Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: 3 Custom Levers (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Custom Safety / Boundary Threshold Alerts */}
          <ThresholdAlertBanner violations={activeViolations} />

          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Configurable Decision Levers
              </span>
              <span className="text-[11px] text-slate-500 font-mono">3 Levers Active</span>
            </div>

            {/* Real-time Custom Model Output Sparkline */}
            <div className="p-2.5 rounded-lg bg-indigo-50/70 border border-indigo-200/90 space-y-1">
              <div className="flex items-center justify-between text-[11px] font-semibold text-indigo-950">
                <span className="flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-indigo-600" />
                  Real-Time Primary Lever Sensitivity Sparkline
                </span>
                <span className="font-mono text-[10px] text-indigo-800 bg-white px-1.5 py-0.5 rounded border border-indigo-200">
                  Current: {model.computedValue.toFixed(1)} {params.goalMetricUnit}
                </span>
              </div>
              <RechartsSparkline
                data={overallSensitivitySparkline}
                currentX={params.levers[0].value}
                color="#6366f1"
                height={32}
                valueFormatter={(val) => `${val} ${params.goalMetricUnit}`}
                minLabel={`${params.levers[0].min} ${params.levers[0].unit}`}
                maxLabel={`${params.levers[0].max} ${params.levers[0].unit}`}
              />
            </div>

            {params.levers.map((lever, idx) => {
              const leverKey = lever.id || `lever-${idx}`;
              return (
                <div key={lever.id} className="pt-2 first:pt-0 border-t first:border-0 border-slate-100">
                  <SliderInput
                    label={`Lever ${idx + 1}: ${lever.label}`}
                    value={lever.value}
                    min={lever.min}
                    max={lever.max}
                    step={lever.step}
                    unit={lever.unit}
                    hint={lever.description}
                    onChange={(val) => updateLever(idx, val)}
                    sparklineData={leverSparklines[idx]}
                    sparklineLabel={`${lever.label} Impact Curve`}
                    sparklineFormatter={(val) => `${val} ${params.goalMetricUnit}`}
                    sparklineColor="#6366f1"
                    threshold={thresholds[leverKey]}
                    onThresholdChange={(t) => handleUpdateThreshold({ ...t, leverKey })}
                  />
                </div>
              );
            })}

            {/* Target Value Slider */}
            <div className="pt-3 border-t border-slate-100">
              <SliderInput
                label={`Target ${params.goalMetricName}`}
                value={params.targetValue}
                min={20}
                max={300}
                step={5}
                unit={params.goalMetricUnit}
                hint="Your objective goal"
                onChange={(val) => setParams((p) => ({ ...p, targetValue: val }))}
              />
            </div>
          </div>
        </div>

        {/* Right Column: Visual Stage (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Top Live Metric Cards with Assumptions Toggle */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Simulated Outcomes
              </span>
              <button
                type="button"
                onClick={() => setShowAssumptions(!showAssumptions)}
                className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg border transition-all ${
                  showAssumptions
                    ? 'bg-orange-50 border-orange-300 text-orange-900 shadow-2xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
                title="Toggle underlying formulas and mathematical assumptions across custom levers"
              >
                <Info className="w-3.5 h-3.5 text-orange-600" />
                <span>{showAssumptions ? 'Hide Assumptions' : 'Assumptions & Formulas'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <StatCard
                label={params.goalMetricName}
                value={model.computedValue}
                unit={params.goalMetricUnit}
                deltaText={`Target: ${params.targetValue} ${params.goalMetricUnit}`}
                subtext={`${model.percentageOfTarget.toFixed(0)}% of goal`}
                statusBadge={model.computedValue >= params.targetValue ? 'Goal Met' : 'Short'}
                statusType={model.computedValue >= params.targetValue ? 'nominal' : 'elevated'}
                showAssumptionsInline={showAssumptions}
                assumptionInfo={{
                  formula:
                    params.formulaType === 'linear-sum'
                      ? 'Output = Lever1 + Lever2 + Lever3'
                      : params.formulaType === 'multiplicative'
                      ? 'Output = (Lever1 × Lever2) ÷ Lever3'
                      : 'Output = ((Lever1 × 100) ÷ Lever2) × (1 + Lever3 ÷ 100)',
                  substitution:
                    params.formulaType === 'linear-sum'
                      ? `${params.levers[0].value} + ${params.levers[1].value} + ${params.levers[2].value} = ${model.computedValue} ${params.goalMetricUnit}`
                      : params.formulaType === 'multiplicative'
                      ? `(${params.levers[0].value} × ${params.levers[1].value}) ÷ ${params.levers[2].value} = ${model.computedValue} ${params.goalMetricUnit}`
                      : `((${params.levers[0].value} × 100) ÷ ${params.levers[1].value}) × (1 + ${params.levers[2].value}÷100) = ${model.computedValue} ${params.goalMetricUnit}`,
                  explanation: `Calculates ${params.goalMetricName} based on the chosen archetype (${params.formulaType}).`,
                  keyFactors: [
                    'Assumes continuous responsiveness between slider min and max limits',
                    'Denominator inputs are clamped at minimum 1 to prevent division by zero'
                  ]
                }}
              />

              <StatCard
                label="Delta to Target"
                value={`${model.deltaToTarget >= 0 ? '+' : ''}${model.deltaToTarget}`}
                unit={params.goalMetricUnit}
                deltaText={model.deltaToTarget >= 0 ? 'Surplus' : 'Deficit'}
                subtext="Gap required"
                statusBadge={model.deltaToTarget >= 0 ? 'Surplus' : 'Deficit'}
                statusType={model.deltaToTarget >= 0 ? 'nominal' : 'demanding'}
                showAssumptionsInline={showAssumptions}
                assumptionInfo={{
                  formula: 'Delta = ComputedValue − TargetThreshold',
                  substitution: `${model.computedValue} − ${params.targetValue} = ${model.deltaToTarget >= 0 ? '+' : ''}${model.deltaToTarget} ${params.goalMetricUnit}`,
                  explanation: 'Measures proximity to the goal threshold. Positive values indicate target satisfied or exceeded.',
                  keyFactors: [
                    `Objective target is set to ${params.targetValue} ${params.goalMetricUnit}`
                  ]
                }}
              />

              <StatCard
                label="Formula Model"
                value={params.formulaType.split('-')[0].toUpperCase()}
                deltaText="Continuous Response"
                subtext="Real-time sensitivity"
                statusBadge="Active"
                statusType="neutral"
                showAssumptionsInline={showAssumptions}
                assumptionInfo={{
                  formula: `Type: ${params.formulaType}`,
                  explanation: 'Selected mathematical transfer function converting the 3 independent decision variables into a single objective performance index.',
                  keyFactors: [
                    'Linear-sum: additive inputs',
                    'Multiplicative: scaling amplification',
                    'Efficiency-ratio: productivity percentage modified by bonus quality factor'
                  ]
                }}
              />
            </div>
          </div>

          {/* Recharts Sensitivity Sweep Trend Line */}
          <CustomRechartsChart
            sensitivityPoints={model.sensitivityPoints}
            targetValue={params.targetValue}
            goalMetricName={params.goalMetricName}
            goalMetricUnit={params.goalMetricUnit}
            activeLever1Value={l1.value}
            lever1Label={l1.label}
            lever1Unit={l1.unit}
            levers={params.levers}
            formulaType={params.formulaType}
          />

          <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 flex items-start gap-3">
            <Info className="w-4 h-4 text-slate-600 shrink-0 mt-0.5" />
            <div className="text-xs text-slate-700 leading-relaxed">
              Currently operating at <strong>{model.computedValue} {params.goalMetricUnit}</strong>.
              {model.computedValue >= params.targetValue
                ? ` Exceeds your target of ${params.targetValue} ${params.goalMetricUnit} by +${model.deltaToTarget.toFixed(1)}.`
                : ` Still short of target by ${Math.abs(model.deltaToTarget).toFixed(1)} ${params.goalMetricUnit}. Increase Lever 1 or adjust other inputs.`}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
