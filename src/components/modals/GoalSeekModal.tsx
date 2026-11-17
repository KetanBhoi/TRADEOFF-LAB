import React, { useState, useMemo } from 'react';
import {
  ScenarioId,
  AnyScenarioParams,
  CustomParams,
} from '../../types';
import {
  getAvailableGoalSeekOptions,
  solveGoalSeek,
  GoalSeekOption,
  GoalSeekResult,
} from '../../utils/goalSeek';
import { Target, ArrowRight, Check, X, Sparkles, AlertCircle, RotateCcw } from 'lucide-react';

interface GoalSeekModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeScenario: ScenarioId;
  params: AnyScenarioParams;
  onApplyLeverValue: (leverKey: string, newValue: number) => void;
}

export const GoalSeekModal: React.FC<GoalSeekModalProps> = ({
  isOpen,
  onClose,
  activeScenario,
  params,
  onApplyLeverValue,
}) => {
  const options = useMemo(() => {
    return getAvailableGoalSeekOptions(activeScenario, params);
  }, [activeScenario, params]);

  const [selectedLeverKey, setSelectedLeverKey] = useState<string>(
    options[0]?.leverKey || ''
  );

  // Default target based on scenario
  const defaultTarget = useMemo(() => {
    switch (activeScenario) {
      case 'running':
        return 6.0; // Target 6.0 sec/wk pace shave
      case 'housing':
        return 750; // Target $750/mo savings
      case 'gpa':
        return 82; // Target 82% required final exam score
      case 'budget':
        return 2000; // Target $2,000 net profit
      case 'trading':
        return 25000; // Target ₹25,000 listing gain
      case 'custom':
        return (params as CustomParams).targetValue || 100;
      default:
        return 100;
    }
  }, [activeScenario, params]);

  const [targetGoalValue, setTargetGoalValue] = useState<number>(defaultTarget);

  // Compute solver result
  const result: GoalSeekResult = useMemo(() => {
    const key = selectedLeverKey || options[0]?.leverKey;
    return solveGoalSeek(activeScenario, params, key, targetGoalValue);
  }, [activeScenario, params, selectedLeverKey, targetGoalValue, options]);

  if (!isOpen) return null;

  const currentOption = options.find((o) => o.leverKey === selectedLeverKey) || options[0];

  const handleApply = () => {
    onApplyLeverValue(result.leverKey, result.solvedValue);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between gap-4 bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">
                  Reverse Goal Seek Optimizer
                </h3>
                <span className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider bg-indigo-100 text-indigo-800 rounded border border-indigo-200">
                  ROOT-FINDING ENGINE
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Automatically calculate the exact input lever required to reach your target outcome
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {/* Step 1: Pick Lever to Solve For */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-900 uppercase tracking-wider block">
              1. Choose Parameter Lever to Solve For
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {options.map((opt) => (
                <button
                  key={opt.leverKey}
                  type="button"
                  onClick={() => setSelectedLeverKey(opt.leverKey)}
                  className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                    selectedLeverKey === opt.leverKey
                      ? 'bg-indigo-50/80 border-indigo-400 ring-2 ring-indigo-200 shadow-2xs'
                      : 'bg-white border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900">{opt.leverLabel}</span>
                    <span className="text-[10px] font-mono text-slate-500">
                      Now: {opt.currentVal} {opt.unit}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                    {opt.description}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Step 2: Target Goal Metric Input */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <label className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center justify-between">
              <span>2. Desired Target Outcome Metric</span>
              <span className="font-mono text-[11px] text-slate-500">
                Current goal: {targetGoalValue}
              </span>
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={targetGoalValue}
                onChange={(e) => setTargetGoalValue(parseFloat(e.target.value) || 0)}
                className="w-full text-base font-bold font-mono p-2.5 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-2xs"
              />
              <button
                type="button"
                onClick={() => setTargetGoalValue(defaultTarget)}
                className="px-3 py-2.5 text-xs font-semibold text-slate-600 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg whitespace-nowrap shadow-2xs"
              >
                Reset Default
              </button>
            </div>
          </div>

          {/* Solver Result Comparison Card */}
          <div className="p-4 rounded-xl border border-indigo-200 bg-indigo-50/50 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-950 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <span>Computed Optimization Solution</span>
              </span>
              <span
                className={`px-2 py-0.5 text-[10px] font-mono font-bold rounded ${
                  result.isFeasible
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : 'bg-amber-100 text-amber-800 border border-amber-300'
                }`}
              >
                {result.isFeasible ? 'Feasible Solution' : 'Bounded Constraint'}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 bg-white rounded-lg border border-indigo-100 shadow-2xs">
                <span className="text-[10px] font-semibold text-slate-500 uppercase block">
                  Current Setting
                </span>
                <span className="text-lg font-bold font-mono text-slate-800 tabular-nums mt-0.5 block">
                  {result.initialValue} {result.unit}
                </span>
              </div>

              <div className="p-3 bg-white rounded-lg border border-indigo-100 shadow-2xs">
                <span className="text-[10px] font-semibold text-slate-500 uppercase block">
                  Required Value
                </span>
                <span className="text-lg font-bold font-mono text-indigo-600 tabular-nums mt-0.5 block">
                  {result.solvedValue} {result.unit}
                </span>
              </div>

              <div className="p-3 bg-white rounded-lg border border-indigo-100 shadow-2xs">
                <span className="text-[10px] font-semibold text-slate-500 uppercase block">
                  Delta Shift
                </span>
                <span
                  className={`text-lg font-bold font-mono tabular-nums mt-0.5 block ${
                    result.difference > 0
                      ? 'text-emerald-600'
                      : result.difference < 0
                      ? 'text-rose-600'
                      : 'text-slate-600'
                  }`}
                >
                  {result.difference > 0 ? `+${result.difference}` : result.difference} {result.unit}
                </span>
              </div>
            </div>

            <p className="text-xs text-indigo-900 leading-relaxed bg-white/70 p-2.5 rounded-lg border border-indigo-100">
              {result.notes}
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={handleApply}
            className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Apply Solved Lever to Scenario</span>
          </button>
        </div>
      </div>
    </div>
  );
};
