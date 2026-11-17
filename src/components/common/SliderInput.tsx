import React, { useState } from 'react';
import { RechartsSparkline, SparklineDataPoint } from './RechartsSparkline';
import { LeverLimitThreshold } from '../../types';
import { ShieldAlert, ShieldCheck, Settings2, RotateCcw, AlertTriangle, Check, X, Minus, Plus } from 'lucide-react';

interface SliderInputProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  displayValue?: string;
  hint?: string;
  onChange: (value: number) => void;
  sparklineData?: SparklineDataPoint[];
  sparklineLabel?: string;
  sparklineHeight?: number;
  sparklineFormatter?: (value: number) => string;
  sparklineColor?: string;
  threshold?: LeverLimitThreshold;
  onThresholdChange?: (threshold: LeverLimitThreshold) => void;
}

export const SliderInput: React.FC<SliderInputProps> = ({
  label,
  value,
  min,
  max,
  step = 1,
  unit = '',
  displayValue,
  hint,
  onChange,
  sparklineData,
  sparklineLabel,
  sparklineHeight = 24,
  sparklineFormatter,
  sparklineColor,
  threshold,
  onThresholdChange,
}) => {
  const [showThresholdConfig, setShowThresholdConfig] = useState(false);
  const [tempLimitValue, setTempLimitValue] = useState<number>(threshold?.limitValue ?? value);
  const [tempType, setTempType] = useState<'max' | 'min'>(threshold?.type ?? 'max');
  const [tempEnabled, setTempEnabled] = useState<boolean>(threshold?.enabled ?? true);
  const [tempLabel, setTempLabel] = useState<string>(threshold?.label ?? `${label} Limit`);

  // Detect if current value violates active threshold
  const isExceeded =
    Boolean(threshold?.enabled) &&
    threshold !== undefined &&
    (threshold.type === 'max' ? value > threshold.limitValue : value < threshold.limitValue);

  const isDanger = threshold?.severity === 'danger';

  const handleDecrement = () => {
    const next = Math.max(min, Math.round((value - step) * 100) / 100);
    onChange(next);
  };

  const handleIncrement = () => {
    const next = Math.min(max, Math.round((value + step) * 100) / 100);
    onChange(next);
  };

  const percentage = Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));

  // Threshold marker percentage on slider track
  const thresholdPercentage =
    threshold?.enabled && threshold.limitValue >= min && threshold.limitValue <= max
      ? Math.min(100, Math.max(0, ((threshold.limitValue - min) / (max - min)) * 100))
      : null;

  const handleSaveThreshold = () => {
    if (onThresholdChange) {
      onThresholdChange({
        id: threshold?.id || `threshold-${label.toLowerCase().replace(/\s+/g, '-')}`,
        leverKey: threshold?.leverKey || label,
        scenarioId: threshold?.scenarioId || 'running',
        enabled: tempEnabled,
        type: tempType,
        limitValue: tempLimitValue,
        label: tempLabel || `${label} Limit`,
        description: threshold?.description,
        severity: threshold?.severity || 'warning',
      });
    }
    setShowThresholdConfig(false);
  };

  return (
    <div
      className={`relative space-y-2.5 p-3.5 rounded-xl transition-all duration-200 border ${
        isExceeded
          ? isDanger
            ? 'bg-rose-50/50 border-rose-300 ring-1 ring-rose-200/80 shadow-2xs'
            : 'bg-amber-50/50 border-amber-300 ring-1 ring-amber-200/80 shadow-2xs'
          : threshold?.enabled
          ? 'bg-slate-50/60 border-slate-200 hover:border-slate-300'
          : 'bg-slate-50/40 border-slate-200/80 hover:border-slate-300'
      }`}
    >
      {/* Top Header Row: Aligned Label & Limit Pill on Left, Stepper Controls on Right */}
      <div className="flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 min-w-0">
          <label className="font-semibold text-slate-800 truncate text-[13px] tracking-tight">
            {label}
          </label>

          {/* Threshold Boundary Button */}
          {onThresholdChange && (
            <button
              type="button"
              onClick={() => {
                setTempLimitValue(threshold?.limitValue ?? value);
                setTempType(threshold?.type ?? 'max');
                setTempEnabled(threshold?.enabled ?? true);
                setTempLabel(threshold?.label ?? `${label} Limit`);
                setShowThresholdConfig(!showThresholdConfig);
              }}
              className={`inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] rounded-md font-medium transition-colors shrink-0 ${
                isExceeded
                  ? isDanger
                    ? 'bg-rose-100 text-rose-800 border border-rose-300 font-bold'
                    : 'bg-amber-100 text-amber-900 border border-amber-300 font-bold'
                  : threshold?.enabled
                  ? 'bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100'
                  : 'bg-white text-slate-600 hover:text-slate-800 hover:bg-slate-100 border border-slate-200'
              }`}
              title={
                threshold?.enabled
                  ? `Limit active: ${threshold.type === 'max' ? '≤' : '≥'} ${threshold.limitValue}${unit}. Click to edit.`
                  : 'Click to configure a safety or budgetary boundary'
              }
            >
              {isExceeded ? (
                <ShieldAlert className="w-3 h-3 text-rose-600 shrink-0" />
              ) : threshold?.enabled ? (
                <ShieldCheck className="w-3 h-3 text-blue-600 shrink-0" />
              ) : (
                <Settings2 className="w-3 h-3 text-slate-400 shrink-0" />
              )}
              <span>
                {threshold?.enabled
                  ? `Limit: ${threshold.type === 'max' ? '≤' : '≥'}${threshold.limitValue}${unit}`
                  : 'Set Limit'}
              </span>
            </button>
          )}
        </div>

        {/* Stepper Controls: Uniform width and alignment */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={handleDecrement}
            disabled={value <= min}
            className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-700 font-semibold text-xs disabled:opacity-30 disabled:pointer-events-none transition-all shadow-2xs"
            title="Decrease by step"
          >
            <Minus className="w-3 h-3" />
          </button>
          <div
            className={`font-mono text-xs font-bold tabular-nums px-2.5 h-7 flex items-center justify-center rounded-lg min-w-[4.5rem] text-center border transition-colors shadow-2xs ${
              isExceeded
                ? isDanger
                  ? 'bg-rose-100 border-rose-300 text-rose-950'
                  : 'bg-amber-100 border-amber-300 text-amber-950'
                : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            {displayValue !== undefined ? displayValue : `${value}${unit ? ` ${unit}` : ''}`}
          </div>
          <button
            type="button"
            onClick={handleIncrement}
            disabled={value >= max}
            className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-700 font-semibold text-xs disabled:opacity-30 disabled:pointer-events-none transition-all shadow-2xs"
            title="Increase by step"
          >
            <Plus className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Inline Threshold Config Popover */}
      {showThresholdConfig && onThresholdChange && (
        <div className="p-3 rounded-xl bg-white border border-slate-300 shadow-md space-y-2.5 text-xs animate-in fade-in duration-150">
          <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
            <span className="font-bold text-slate-900 flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-blue-600" />
              Configure Custom Limit for {label}
            </span>
            <button
              type="button"
              onClick={() => setShowThresholdConfig(false)}
              className="text-slate-400 hover:text-slate-600 p-0.5 rounded"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] font-semibold text-slate-600 block mb-0.5">
                Limit Rule Type
              </label>
              <select
                value={tempType}
                onChange={(e) => setTempType(e.target.value as 'max' | 'min')}
                className="w-full text-xs p-1.5 rounded-lg border border-slate-300 bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-400"
              >
                <option value="max">Upper Cap (Warn if &gt; limit)</option>
                <option value="min">Lower Floor (Warn if &lt; limit)</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-semibold text-slate-600 block mb-0.5">
                Boundary Limit ({unit || 'value'})
              </label>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min={min}
                  max={max}
                  step={step}
                  value={tempLimitValue}
                  onChange={(e) => setTempLimitValue(parseFloat(e.target.value) || min)}
                  className="w-full text-xs p-1.5 font-mono rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-1 focus:ring-slate-400"
                />
                <button
                  type="button"
                  onClick={() => setTempLimitValue(value)}
                  className="px-2 py-1 text-[10px] font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded border border-slate-200 whitespace-nowrap"
                  title="Set limit to current slider value"
                >
                  Current
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <label className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={tempEnabled}
                onChange={(e) => setTempEnabled(e.target.checked)}
                className="rounded border-slate-300 text-orange-600 focus:ring-orange-500"
              />
              <span>Enable limit monitoring</span>
            </label>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setShowThresholdConfig(false)}
                className="px-2 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveThreshold}
                className="px-3 py-1 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg flex items-center gap-1 shadow-2xs"
              >
                <Check className="w-3 h-3" />
                <span>Save Limit</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Slider Track with Boundary Indicator Pin */}
      <div className="relative flex items-center pt-1 pb-1">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className={`w-full h-2 rounded-lg appearance-none cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-slate-400 ${
            isExceeded
              ? isDanger
                ? 'accent-rose-600'
                : 'accent-amber-600'
              : 'accent-slate-900'
          }`}
          style={{
            background: `linear-gradient(to right, ${
              isExceeded
                ? isDanger
                  ? '#e11d48'
                  : '#d97706'
                : '#0f172a'
            } 0%, ${
              isExceeded
                ? isDanger
                  ? '#e11d48'
                  : '#d97706'
                : '#0f172a'
            } ${percentage}%, #e2e8f0 ${percentage}%, #e2e8f0 100%)`,
          }}
        />

        {/* Visual Threshold Boundary Marker Pin */}
        {threshold && thresholdPercentage !== null && (
          <div
            className="absolute top-0 bottom-0 pointer-events-none flex flex-col items-center"
            style={{ left: `${thresholdPercentage}%` }}
            title={`Threshold boundary: ${threshold.limitValue}${unit}`}
          >
            <div
              className={`w-1.5 h-3 -mt-0.5 rounded-full shadow-xs ${
                isExceeded
                  ? isDanger
                    ? 'bg-rose-600 ring-2 ring-rose-200'
                    : 'bg-amber-600 ring-2 ring-amber-200'
                  : 'bg-slate-700'
              }`}
            />
            <div
              className={`w-0.5 h-3 ${
                isExceeded
                  ? isDanger
                    ? 'bg-rose-600'
                    : 'bg-amber-600'
                  : 'bg-slate-400'
              }`}
            />
          </div>
        )}
      </div>

      {/* Range Min/Max Footers */}
      <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5 font-mono">
        <span className="tabular-nums">{min}{unit}</span>
        {hint && <span className="font-sans text-slate-500 text-center truncate max-w-[220px] text-[11px]">{hint}</span>}
        <span className="tabular-nums">{max}{unit}</span>
      </div>

      {/* Active Threshold Violation Banner & Snap Action */}
      {isExceeded && threshold && (
        <div
          className={`p-2 rounded-lg flex items-center justify-between gap-2 text-xs transition-all ${
            isDanger
              ? 'bg-rose-100/90 text-rose-900 border border-rose-300'
              : 'bg-amber-100/90 text-amber-900 border border-amber-300'
          }`}
        >
          <div className="flex items-center gap-1.5 min-w-0">
            <AlertTriangle className={`w-3.5 h-3.5 shrink-0 ${isDanger ? 'text-rose-600' : 'text-amber-600'}`} />
            <span className="text-[11px] font-semibold leading-tight truncate">
              {threshold.type === 'max'
                ? `Exceeds upper limit (${threshold.limitValue}${unit}) by +${Math.round((value - threshold.limitValue) * 100) / 100}${unit}`
                : `Below minimum floor (${threshold.limitValue}${unit}) by -${Math.round((threshold.limitValue - value) * 100) / 100}${unit}`}
            </span>
          </div>
          <button
            type="button"
            onClick={() => onChange(threshold.limitValue)}
            className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded shadow-2xs whitespace-nowrap transition-colors ${
              isDanger
                ? 'bg-rose-600 hover:bg-rose-700 text-white'
                : 'bg-amber-600 hover:bg-amber-700 text-white'
            }`}
            title="Snap to boundary limit"
          >
            <RotateCcw className="w-2.5 h-2.5" />
            <span>Snap to {threshold.limitValue}{unit}</span>
          </button>
        </div>
      )}

      {/* Sparkline Visualization */}
      {sparklineData && sparklineData.length > 0 && (
        <div className="pt-2 border-t border-slate-200/60">
          <RechartsSparkline
            data={sparklineData}
            currentX={value}
            color={
              isExceeded
                ? isDanger
                  ? '#e11d48'
                  : '#d97706'
                : sparklineColor || '#0f172a'
            }
            label={sparklineLabel}
            height={sparklineHeight}
            valueFormatter={sparklineFormatter}
            unit={unit}
          />
        </div>
      )}
    </div>
  );
};
