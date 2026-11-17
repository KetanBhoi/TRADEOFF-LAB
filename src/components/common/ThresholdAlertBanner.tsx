import React, { useState } from 'react';
import { LeverLimitThreshold } from '../../types';
import { ShieldAlert, AlertTriangle, ChevronDown, ChevronUp, CheckCircle2, RotateCcw } from 'lucide-react';

export interface ActiveThresholdViolation {
  threshold: LeverLimitThreshold;
  currentValue: number;
  unit?: string;
  leverLabel: string;
  onSnapToLimit?: () => void;
}

interface ThresholdAlertBannerProps {
  violations: ActiveThresholdViolation[];
  onManageLimits?: () => void;
}

export const ThresholdAlertBanner: React.FC<ThresholdAlertBannerProps> = ({
  violations,
  onManageLimits,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  if (violations.length === 0) return null;

  const hasDanger = violations.some((v) => v.threshold.severity === 'danger');

  return (
    <div
      role="alert"
      className={`rounded-xl border transition-all duration-200 shadow-2xs overflow-hidden ${
        hasDanger
          ? 'bg-rose-50/70 border-rose-200 border-l-4 border-l-rose-500'
          : 'bg-amber-50/70 border-amber-200 border-l-4 border-l-amber-500'
      }`}
    >
      <div className="p-3.5 flex items-start justify-between gap-3">
        <div className="flex items-start gap-2.5 min-w-0">
          <div
            className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${
              hasDanger ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
            }`}
          >
            {hasDanger ? (
              <ShieldAlert className="w-4 h-4" />
            ) : (
              <AlertTriangle className="w-4 h-4" />
            )}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h4
                className={`text-xs font-bold uppercase tracking-wider ${
                  hasDanger ? 'text-rose-950' : 'text-amber-950'
                }`}
              >
                {violations.length === 1
                  ? 'Boundary Limit Alert'
                  : `${violations.length} Boundary Limits Exceeded`}
              </h4>
              <span
                className={`px-1.5 py-0.2 text-[10px] font-mono font-bold rounded ${
                  hasDanger
                    ? 'bg-rose-200/90 text-rose-900 border border-rose-300'
                    : 'bg-amber-200/90 text-amber-900 border border-amber-300'
                }`}
              >
                Active Warning
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
              Current scenario configuration exceeds your specified safety or budgetary limits.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {violations.length > 1 && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 text-slate-500 hover:text-slate-800 rounded hover:bg-black/5 transition-colors"
              title={isExpanded ? 'Collapse list' : 'Expand list'}
              aria-expanded={isExpanded}
            >
              {isExpanded ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* Expanded Violations List */}
      {isExpanded && (
        <div className="px-3.5 pb-3 pt-0 space-y-2 border-t border-black/5 mt-1 pt-2">
          {violations.map((violation) => {
            const t = violation.threshold;
            const diff = Math.abs(violation.currentValue - t.limitValue);
            const isOverMax = t.type === 'max';

            return (
              <div
                key={t.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 rounded-lg bg-white/90 border border-slate-200/80 text-xs shadow-2xs"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div
                    className={`w-2 h-2 rounded-full shrink-0 ${
                      t.severity === 'danger' ? 'bg-rose-500' : 'bg-amber-500'
                    }`}
                  />
                  <div className="min-w-0">
                    <span className="font-semibold text-slate-900">
                      {violation.leverLabel}:
                    </span>{' '}
                    <span className="font-mono font-bold text-slate-900">
                      {violation.currentValue}{violation.unit}
                    </span>{' '}
                    <span className="text-slate-500 font-mono text-[11px]">
                      (Limit: {t.type === 'max' ? '≤' : '≥'}{t.limitValue}{violation.unit}, delta: {isOverMax ? `+${diff}` : `-${diff}`})
                    </span>
                  </div>
                </div>

                {violation.onSnapToLimit && (
                  <button
                    type="button"
                    onClick={violation.onSnapToLimit}
                    className="inline-flex items-center justify-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-md bg-slate-900 hover:bg-slate-800 text-white transition-colors shrink-0 shadow-2xs self-start sm:self-auto"
                    title={`Snap ${violation.leverLabel} to limit threshold`}
                  >
                    <RotateCcw className="w-3 h-3 text-slate-300" />
                    <span>Snap to Safe Limit ({t.limitValue}{violation.unit})</span>
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
