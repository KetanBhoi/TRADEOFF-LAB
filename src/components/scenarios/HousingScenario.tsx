import React, { useState } from 'react';
import { HousingParams, HousingOption, LeverLimitThreshold } from '../../types';
import { calculateHousingModel } from '../../utils/mathUtils';
import { SliderInput } from '../common/SliderInput';
import { StatCard } from '../common/StatCard';
import { HousingRechartsChart } from '../charts/HousingRechartsChart';
import { RechartsSparkline, SparklineDataPoint } from '../common/RechartsSparkline';
import { ThresholdAlertBanner, ActiveThresholdViolation } from '../common/ThresholdAlertBanner';
import { DEFAULT_THRESHOLDS } from '../../utils/thresholdDefaults';
import { Home, Users, MapPin, DollarSign, Award, ArrowRight, TrendingUp, Download, History, Info, Columns, Globe, Sparkles } from 'lucide-react';

interface HousingScenarioProps {
  params: HousingParams;
  setParams: React.Dispatch<React.SetStateAction<HousingParams>>;
  onOpenSanityCheck: () => void;
  onOpenExport: () => void;
  onOpenHistory: () => void;
  onOpenSplitView?: () => void;
  onOpenGoogleSearch?: (query?: string) => void;
}

export const HousingScenario: React.FC<HousingScenarioProps> = ({
  params,
  setParams,
  onOpenSanityCheck,
  onOpenExport,
  onOpenHistory,
  onOpenSplitView,
  onOpenGoogleSearch,
}) => {
  const [showAssumptions, setShowAssumptions] = useState(false);

  // Custom limit thresholds for housing levers
  const [thresholds, setThresholds] = useState<Record<string, LeverLimitThreshold>>(() => {
    const map: Record<string, LeverLimitThreshold> = {};
    DEFAULT_THRESHOLDS.housing.forEach((t) => {
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

  const model = calculateHousingModel(params);

  // Active threshold boundary violations
  const activeViolations: ActiveThresholdViolation[] = [];
  if (thresholds['discretionaryBuffer']?.enabled) {
    const t = thresholds['discretionaryBuffer'];
    const isViolated = t.type === 'min' ? params.discretionaryBuffer < t.limitValue : params.discretionaryBuffer > t.limitValue;
    if (isViolated) {
      activeViolations.push({
        threshold: t,
        currentValue: params.discretionaryBuffer,
        unit: '$',
        leverLabel: 'Discretionary & Food Buffer',
        onSnapToLimit: () => setParams((p) => ({ ...p, discretionaryBuffer: t.limitValue })),
      });
    }
  }

  if (thresholds['monthlyNetIncome']?.enabled) {
    const t = thresholds['monthlyNetIncome'];
    const isViolated = t.type === 'min' ? params.monthlyNetIncome < t.limitValue : params.monthlyNetIncome > t.limitValue;
    if (isViolated) {
      activeViolations.push({
        threshold: t,
        currentValue: params.monthlyNetIncome,
        unit: '$',
        leverLabel: 'Monthly Take-Home Income',
        onSnapToLimit: () => setParams((p) => ({ ...p, monthlyNetIncome: t.limitValue })),
      });
    }
  }

  // Sparklines for real-time housing impact visualization
  const primaryOpt = params.options[0];
  const monthlySavingsTrajectory: SparklineDataPoint[] = Array.from({ length: 12 }, (_, i) => {
    const month = i + 1;
    const monthlyNet = params.monthlyNetIncome - params.discretionaryBuffer - (primaryOpt.rent + primaryOpt.utilities + primaryOpt.commuteTransitCostPerMonth);
    const cum = Math.round(monthlyNet * month);
    return {
      x: month,
      y: cum,
      formattedX: `Month ${month}`,
      formattedY: `$${cum.toLocaleString()}`,
      isCurrent: month === 12,
    };
  });

  const incomeSparklineData: SparklineDataPoint[] = Array.from({ length: 17 }, (_, i) => {
    const inc = 2000 + i * 500;
    const annualSave = (inc - params.discretionaryBuffer - primaryOpt.rent) * 12;
    return {
      x: inc,
      y: annualSave,
      formattedX: `$${inc.toLocaleString()}/mo`,
      formattedY: `$${annualSave.toLocaleString()}/yr`,
      isCurrent: inc === params.monthlyNetIncome,
    };
  });

  const timeValuationSparklineData: SparklineDataPoint[] = Array.from({ length: 17 }, (_, i) => {
    const rate = i * 5;
    const annualHours = (primaryOpt.commuteOneWayMinutes * 2 / 60) * primaryOpt.commuteDaysPerWeek * 50;
    const annualTimeCost = Math.round(rate * annualHours);
    return {
      x: rate,
      y: annualTimeCost,
      formattedX: `$${rate}/hr`,
      formattedY: `$${annualTimeCost.toLocaleString()}/yr penalty`,
      isCurrent: rate === params.hourlyTimeValuation,
    };
  });

  const colors = ['#64748b', 'var(--theme-primary, #ea580c)', '#0d9488'];

  const updateOption = (id: string, updates: Partial<HousingOption>) => {
    setParams((p) => ({
      ...p,
      options: p.options.map((opt) => (opt.id === id ? { ...opt, ...updates } : opt)),
    }));
  };

  return (
    <div className="space-y-6">
      {/* Scenario Brief Header Callout */}
      <div className="p-4 sm:p-5 rounded-xl bg-white border border-slate-200/90 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider bg-slate-100 text-slate-700 rounded border border-slate-200">
              Housing Model
            </span>
            <span className="text-xs font-semibold text-slate-500">
              Living Choices & 1-Year Financial Trajectory
            </span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 mt-1.5">
            Apartment Lease vs. Roommate Allocation
          </h2>
          <p className="text-xs text-slate-600 mt-1 max-w-3xl leading-relaxed">
            Evaluate 3 living arrangements: <strong>Staying Put</strong>, <strong>Roommate Split</strong>, and <strong>Suburban Studio</strong>. Accounts for direct monthly outflows, rent splits, transit passes, and commute opportunity cost.
          </p>
        </div>

        {/* Scenario-Specific Quick Presets */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider hidden sm:inline">Simulation:</span>
          <button
            onClick={() =>
              setParams((p) => ({
                ...p,
                options: p.options.map((o) =>
                  o.id === 'opt-roommate' ? { ...o, roommateSplit: o.roommateSplit === 2 ? 3 : 2 } : o
                ),
              }))
            }
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
              params.options.find((o) => o.id === 'opt-roommate')?.roommateSplit === 3
                ? 'bg-orange-50 border-orange-300 text-orange-800'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            {params.options.find((o) => o.id === 'opt-roommate')?.roommateSplit === 3
              ? 'Active: 3-Way Roommate Split'
              : 'Test: Add 3rd Roommate'}
          </button>
        </div>
      </div>

      {/* Main Two-Zone Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Macro Budget Levers (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Safety & Boundary Thresholds Alert Banner */}
          <ThresholdAlertBanner violations={activeViolations} />

          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Financial Baseline
              </span>
              <span className="text-[11px] text-slate-500 font-mono">Monthly Budget</span>
            </div>

            {/* Real-time 12-Month Net Savings Sparkline */}
            <div className="p-2.5 rounded-lg bg-emerald-50/70 border border-emerald-200/90 space-y-1">
              <div className="flex items-center justify-between text-[11px] font-semibold text-emerald-950">
                <span className="flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-emerald-600" />
                  12-Month Net Savings Trajectory
                </span>
                <span className="font-mono text-[10px] text-emerald-800 bg-white px-1.5 py-0.2 rounded border border-emerald-200">
                  {monthlySavingsTrajectory[11]?.formattedY || '$0'}
                </span>
              </div>
              <RechartsSparkline
                data={monthlySavingsTrajectory}
                currentX={12}
                color="#059669"
                height={32}
                valueFormatter={(val) => `$${val.toLocaleString()}`}
                minLabel="Month 1"
                maxLabel="Month 12 (Year-End)"
              />
            </div>

            <SliderInput
              label="Monthly Take-Home Income"
              value={params.monthlyNetIncome}
              min={2000}
              max={10000}
              step={100}
              unit="$"
              hint="Net post-tax cash"
              onChange={(val) => setParams((p) => ({ ...p, monthlyNetIncome: val }))}
              sparklineData={incomeSparklineData}
              sparklineLabel="Annual Net Savings vs Income Range"
              sparklineFormatter={(val) => `$${val.toLocaleString()}`}
              sparklineColor="#059669"
              threshold={thresholds['monthlyNetIncome']}
              onThresholdChange={handleUpdateThreshold}
            />

            <SliderInput
              label="Discretionary & Food Buffer"
              value={params.discretionaryBuffer}
              min={400}
              max={2500}
              step={50}
              unit="$"
              hint="Groceries, dining, personal"
              onChange={(val) => setParams((p) => ({ ...p, discretionaryBuffer: val }))}
              threshold={thresholds['discretionaryBuffer']}
              onThresholdChange={handleUpdateThreshold}
            />

            <SliderInput
              label="Personal Time Valuation"
              value={params.hourlyTimeValuation}
              min={0}
              max={80}
              step={5}
              unit="$/hr"
              hint="Commute opportunity cost"
              onChange={(val) => setParams((p) => ({ ...p, hourlyTimeValuation: val }))}
              sparklineData={timeValuationSparklineData}
              sparklineLabel="Annual Commute Opportunity Cost Penalty"
              sparklineFormatter={(val) => `$${val.toLocaleString()}`}
              sparklineColor="#059669"
            />
          </div>

          {/* Option Parameter Tuners */}
          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Option Nuances (Per Option Levers)
              </span>
            </div>

            {onOpenGoogleSearch && (
              <div className="p-2.5 rounded-lg bg-blue-50/70 border border-blue-200 flex items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-1.5 min-w-0">
                  <Globe className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span className="text-[11px] text-blue-800 font-medium truncate">
                    Calibrate rent for a specific zip code
                  </span>
                </div>
                <button
                  onClick={() => onOpenGoogleSearch('current average 1 bedroom rent in Austin 78701 and suburban commuter rates')}
                  className="px-2 py-0.5 text-[10px] font-semibold text-blue-700 bg-white hover:bg-blue-100 rounded border border-blue-300 transition-colors shrink-0 shadow-2xs"
                >
                  Search Rent
                </button>
              </div>
            )}

            {params.options.map((opt) => (
              <div key={opt.id} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-800">
                  <span>{opt.name}</span>
                  <span className="text-[11px] text-slate-500 font-mono">
                    Rent: ${opt.rent}/mo
                  </span>
                </div>

                {opt.id === 'opt-roommate' && (
                  <SliderInput
                    label="Number of Roommates"
                    value={opt.roommateSplit}
                    min={1}
                    max={4}
                    step={1}
                    unit="ppl"
                    hint="Splits rent and utilities"
                    onChange={(val) => updateOption(opt.id, { roommateSplit: val })}
                  />
                )}

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="text-[11px] text-slate-500">Rent ($/mo)</label>
                    <input
                      type="number"
                      value={opt.rent}
                      onChange={(e) => updateOption(opt.id, { rent: parseFloat(e.target.value) || 0 })}
                      className="w-full mt-0.5 px-2 py-1 bg-white border border-slate-200 rounded font-mono text-xs text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-500">Transit ($/mo)</label>
                    <input
                      type="number"
                      value={opt.commuteTransitCostPerMonth}
                      onChange={(e) => updateOption(opt.id, { commuteTransitCostPerMonth: parseFloat(e.target.value) || 0 })}
                      className="w-full mt-0.5 px-2 py-1 bg-white border border-slate-200 rounded font-mono text-xs text-slate-900"
                    />
                  </div>
                </div>

                {/* Real-time cumulative 12-month cost sparkline for this option */}
                <RechartsSparkline
                  data={Array.from({ length: 12 }, (_, i) => {
                    const m = i + 1;
                    const c = Math.round((opt.rent + opt.utilities + opt.commuteTransitCostPerMonth) * m);
                    return {
                      x: m,
                      y: c,
                      formattedX: `Month ${m}`,
                      formattedY: `$${c.toLocaleString()}`,
                      isCurrent: m === 12,
                    };
                  })}
                  currentX={12}
                  color="#0284c7"
                  height={24}
                  label="12-Mo Outflow Trajectory"
                  valueFormatter={(val) => `$${val.toLocaleString()}`}
                  minLabel="M1"
                  maxLabel="M12 Total"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Side-by-Side Comparison & 1-Year Cumulative Chart (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Section Header with Assumptions Toggle */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Side-by-Side Financial Evaluation
            </span>
            <button
              type="button"
              onClick={() => setShowAssumptions(!showAssumptions)}
              className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg border transition-all ${
                showAssumptions
                  ? 'bg-orange-50 border-orange-300 text-orange-900 shadow-2xs'
                  : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
              title="Toggle underlying formulas and mathematical assumptions across housing options"
            >
              <Info className="w-3.5 h-3.5 text-orange-600" />
              <span>{showAssumptions ? 'Hide Assumptions' : 'Assumptions & Formulas'}</span>
            </button>
          </div>

          {/* Expanded Assumptions Panel when toggled on */}
          {showAssumptions && (
            <div className="p-3.5 rounded-xl bg-white border border-orange-300 ring-1 ring-orange-200 space-y-2 text-xs animate-in fade-in duration-150">
              <div className="font-semibold text-slate-900 flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-orange-950 font-bold">
                  <Info className="w-3.5 h-3.5 text-orange-600 inline" />
                  <span>Housing Net Savings & Opportunity Cost Formulas</span>
                </span>
                <span className="text-[10px] text-slate-500 font-mono">12-Month Projection Model</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px] font-mono">
                <div className="p-2 bg-slate-900 text-slate-100 rounded-lg">
                  <span className="text-slate-400 block text-[10px]">Direct Cash Savings:</span>
                  Savings_1Yr = 12 × [ Income − (Rent÷N + Util÷N + Transit + Buffer) ]
                </div>
                <div className="p-2 bg-slate-900 text-slate-100 rounded-lg">
                  <span className="text-slate-400 block text-[10px]">Opportunity Cost Adjusted:</span>
                  TimeAdjusted = Savings_1Yr − 12 × (CommuteHrs/Mo × HourlyValue)
                </div>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed bg-amber-50/60 p-2 rounded border border-amber-200/60">
                <strong>Underlying Assumptions:</strong> Assumes net income stays steady over 12 months; utilities and rent are split evenly across {params.options.find(o=>o.id==='opt-roommate')?.roommateSplit || 2} occupants without turnover; commute hours calculated at 4.33 weeks per month with 2 one-way trips per commute day.
              </p>
            </div>
          )}

          {/* Side-by-Side 3-Option Comparison Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {model.options.map((opt, idx) => {
              const color = colors[idx];
              return (
                <div
                  key={opt.id}
                  className={`p-4 rounded-xl border transition-all flex flex-col justify-between ${
                    opt.isWinner
                      ? 'bg-white border-orange-400 ring-2 ring-orange-200 shadow-md'
                      : 'bg-white border-slate-200 shadow-xs'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900">{opt.name}</span>
                      {opt.isWinner ? (
                        <span className="text-[10px] font-bold text-orange-800 bg-orange-100 px-2 py-0.5 rounded flex items-center gap-1">
                          <Award className="w-3 h-3 text-orange-700" />
                          <span>Winner</span>
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono text-slate-400">Option {idx + 1}</span>
                      )}
                    </div>

                    <div className="mt-3">
                      <div className="text-[11px] text-slate-500 uppercase tracking-wider">
                        1-Year Net Cash Saved
                      </div>
                      <div className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
                        ${opt.annualCashSavings.toLocaleString()}
                      </div>
                      <div className="text-xs text-slate-500 font-mono mt-0.5">
                        +${opt.monthlySavings.toLocaleString()}/mo ({opt.savingsRatePercent}% of income)
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-xs">
                      <div className="flex justify-between text-slate-600">
                        <span>Effective Rent:</span>
                        <span className="font-mono font-semibold text-slate-900">
                          ${Math.round(opt.effectiveRent)}/mo
                        </span>
                      </div>
                      <div className="flex justify-between text-slate-600">
                        <span>Utilities Share:</span>
                        <span className="font-mono text-slate-800">
                          ${Math.round(opt.effectiveUtilities)}/mo
                        </span>
                      </div>
                      <div className="flex justify-between text-slate-600">
                        <span>Transit & Commute:</span>
                        <span className="font-mono text-slate-800">
                          ${opt.monthlyTransitCost}/mo
                        </span>
                      </div>
                      <div className="flex justify-between text-slate-600">
                        <span>Commute Time:</span>
                        <span className="font-mono text-slate-800">
                          {opt.monthlyCommuteHours} hrs/mo
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-2 border-t border-slate-100 text-[11px] text-slate-500">
                    Time-adjusted value: <strong className="text-slate-800 font-mono">${opt.annualTimeAdjustedSavings.toLocaleString()}</strong>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Recharts 12-Month Multi-Trendline & Rent Sensitivity Sweep */}
          <HousingRechartsChart
            monthlyTrajectory={model.monthlyTrajectory}
            options={model.options}
            rawOptions={params.options}
            monthlyNetIncome={params.monthlyNetIncome}
            discretionaryBuffer={params.discretionaryBuffer}
          />

          {/* Winner Verdict Summary */}
          <div className="p-3.5 rounded-lg bg-orange-50 border border-orange-200/80 flex items-start gap-3">
            <TrendingUp className="w-4 h-4 text-orange-700 shrink-0 mt-0.5" />
            <div className="text-xs text-orange-950 leading-relaxed">
              <strong>Financial Decision Recommendation:</strong> {model.summaryVerdict}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
