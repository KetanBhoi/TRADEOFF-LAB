import React, { useState } from 'react';
import { Info, X, Calculator } from 'lucide-react';

export interface MetricAssumption {
  formula: string;
  explanation: string;
  substitution?: string;
  keyFactors?: string[];
}

interface StatCardProps {
  label: string;
  value: string | number;
  unit?: string;
  deltaText?: string;
  subtext?: string;
  statusBadge?: string;
  statusType?: 'nominal' | 'elevated' | 'demanding' | 'neutral';
  assumptionInfo?: MetricAssumption;
  showAssumptionsInline?: boolean;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  unit,
  deltaText,
  subtext,
  statusBadge,
  statusType = 'neutral',
  assumptionInfo,
  showAssumptionsInline = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getStatusStyles = () => {
    switch (statusType) {
      case 'nominal':
        return 'text-emerald-700 bg-emerald-50 border-emerald-200';
      case 'elevated':
        return 'text-amber-800 bg-amber-50 border-amber-200';
      case 'demanding':
        return 'text-rose-700 bg-rose-50 border-rose-200';
      case 'neutral':
      default:
        return 'text-slate-700 bg-slate-100 border-slate-200';
    }
  };

  const isDetailsOpen = showAssumptionsInline || isExpanded;

  return (
    <div
      className={`p-4 rounded-xl bg-white border transition-all flex flex-col justify-between shadow-2xs h-full ${
        isDetailsOpen ? 'border-slate-400 ring-1 ring-slate-300' : 'border-slate-200/90 hover:border-slate-300'
      }`}
    >
      <div>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="text-[11px] font-bold tracking-wider text-slate-500 uppercase truncate">
              {label}
            </span>
            {assumptionInfo && (
              <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                className={`p-0.5 rounded transition-colors shrink-0 ${
                  isDetailsOpen
                    ? 'text-slate-900 bg-slate-200 hover:bg-slate-300'
                    : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
                }`}
                title={isDetailsOpen ? 'Hide underlying formula' : 'View formula & mathematical assumptions'}
                aria-label={`Formula and assumptions for ${label}`}
              >
                <Info className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {statusBadge && (
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border shrink-0 ${getStatusStyles()}`}>
              {statusBadge}
            </span>
          )}
        </div>

        <div className="mt-2.5 flex items-baseline gap-1.5">
          <span className="text-2xl font-bold tracking-tight text-slate-900 font-mono tabular-nums">
            {value}
          </span>
          {unit && <span className="text-xs font-semibold text-slate-500">{unit}</span>}
        </div>

        {(deltaText || subtext) && (
          <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-500 truncate">
            {deltaText && <span className="font-semibold text-slate-700 truncate">{deltaText}</span>}
            {deltaText && subtext && <span aria-hidden="true" className="text-slate-300">·</span>}
            {subtext && <span className="truncate text-slate-500">{subtext}</span>}
          </div>
        )}
      </div>

      {/* Assumptions & Formula Details Dropdown/Drawer */}
      {assumptionInfo && isDetailsOpen && (
        <div className="mt-3 pt-3 border-t border-slate-100 space-y-2 text-xs animate-in fade-in duration-150">
          <div className="flex items-center justify-between text-[11px] text-slate-600 font-semibold uppercase tracking-wider">
            <span className="flex items-center gap-1 text-slate-800">
              <Calculator className="w-3 h-3 text-slate-600 inline" />
              <span>Governing Formula</span>
            </span>
            {!showAssumptionsInline && (
              <button
                onClick={() => setIsExpanded(false)}
                className="text-slate-400 hover:text-slate-700 p-0.5 rounded"
                title="Dismiss"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          <div className="font-mono text-[11px] bg-slate-900 text-slate-100 p-2 rounded-lg overflow-x-auto leading-relaxed border border-slate-800">
            {assumptionInfo.formula}
          </div>

          {assumptionInfo.substitution && (
            <div className="text-[11px] text-slate-600 font-mono bg-slate-50 p-1.5 rounded-md border border-slate-200">
              <span className="text-slate-400">Values: </span>
              <span className="text-slate-800">{assumptionInfo.substitution}</span>
            </div>
          )}

          <p className="text-[11px] text-slate-600 leading-relaxed bg-slate-50 p-2 rounded-md border border-slate-200">
            <strong className="text-slate-900">Logic: </strong>
            {assumptionInfo.explanation}
          </p>

          {assumptionInfo.keyFactors && assumptionInfo.keyFactors.length > 0 && (
            <div className="text-[10px] text-slate-500 pt-0.5 space-y-0.5">
              <span className="font-semibold text-slate-600">Assumptions:</span>
              <ul className="list-disc pl-3.5 space-y-0.5">
                {assumptionInfo.keyFactors.map((kf, idx) => (
                  <li key={idx}>{kf}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
