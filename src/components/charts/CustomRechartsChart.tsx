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
  BarChart,
  Bar,
  Cell,
} from 'recharts';
import { TrendingUp, Sliders, Activity, Target } from 'lucide-react';
import { CustomLever } from '../../types';

interface CustomRechartsChartProps {
  sensitivityPoints?: { value1: number; result: number }[];
  targetValue: number;
  goalMetricName: string;
  goalMetricUnit: string;
  activeLever1Value?: number;
  lever1Label?: string;
  lever1Unit?: string;
  levers?: [CustomLever, CustomLever, CustomLever];
  formulaType?: 'linear-sum' | 'multiplicative' | 'efficiency-ratio';
}

export const CustomRechartsChart: React.FC<CustomRechartsChartProps> = ({
  sensitivityPoints = [],
  targetValue,
  goalMetricName,
  goalMetricUnit,
  activeLever1Value = 0,
  lever1Label = 'Lever 1',
  lever1Unit = '',
  levers,
  formulaType = 'linear-sum',
}) => {
  const [selectedLeverIndex, setSelectedLeverIndex] = useState<number>(0);
  const [showComparative, setShowComparative] = useState<boolean>(false);

  const l1 = levers ? levers[0] : { label: lever1Label, value: activeLever1Value, min: 0, max: 100, step: 1, unit: lever1Unit };
  const l2 = levers ? levers[1] : { label: 'Lever 2', value: 50, min: 0, max: 100, step: 1, unit: '' };
  const l3 = levers ? levers[2] : { label: 'Lever 3', value: 25, min: 0, max: 100, step: 1, unit: '' };
  const currentLevers = [l1, l2, l3];

  const activeLever = currentLevers[selectedLeverIndex] || l1;

  // Compute sensitivity points dynamically for the selected lever
  const dynamicSweepData = [];
  const minVal = activeLever.min;
  const maxVal = activeLever.max;
  const stepVal = Math.max(1, (maxVal - minVal) / 10);

  const calculateResult = (v1: number, v2: number, v3: number) => {
    if (formulaType === 'linear-sum') {
      return v1 + v2 + v3;
    } else if (formulaType === 'multiplicative') {
      return (v1 * v2) / Math.max(1, v3);
    } else {
      return ((v1 * 100) / Math.max(1, v2)) * (1 + v3 / 100);
    }
  };

  for (let v = minVal; v <= maxVal; v += stepVal) {
    const roundedV = Math.round(v * 10) / 10;
    let res = 0;
    if (selectedLeverIndex === 0) {
      res = calculateResult(roundedV, l2.value, l3.value);
    } else if (selectedLeverIndex === 1) {
      res = calculateResult(l1.value, roundedV, l3.value);
    } else {
      res = calculateResult(l1.value, l2.value, roundedV);
    }

    dynamicSweepData.push({
      leverVal: roundedV,
      leverLabel: `${roundedV}${activeLever.unit ? ` ${activeLever.unit}` : ''}`,
      simResult: Math.round(res * 10) / 10,
      isCurrent: Math.abs(roundedV - activeLever.value) <= stepVal / 2,
    });
  }

  // Comparative Tornado / Elasticity Data: +10% shift impact for each lever
  const comparativeData = currentLevers.map((lever, idx) => {
    const baseVal = lever.value;
    const deltaShift = Math.max(1, Math.round(baseVal * 0.1 * 10) / 10);
    
    let resUp = 0;
    let resBase = 0;
    if (idx === 0) {
      resBase = calculateResult(baseVal, l2.value, l3.value);
      resUp = calculateResult(baseVal + deltaShift, l2.value, l3.value);
    } else if (idx === 1) {
      resBase = calculateResult(l1.value, baseVal, l3.value);
      resUp = calculateResult(l1.value, baseVal + deltaShift, l3.value);
    } else {
      resBase = calculateResult(l1.value, l2.value, baseVal);
      resUp = calculateResult(l1.value, l2.value, baseVal + deltaShift);
    }

    const impact = Math.round((resUp - resBase) * 10) / 10;
    return {
      leverName: lever.label,
      impact,
      deltaShift: `+${deltaShift} ${lever.unit}`,
      absImpact: Math.abs(impact),
    };
  });

  const CustomSweepTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900/95 text-white p-3 rounded-lg shadow-xl border border-slate-700 text-xs font-mono space-y-1.5 z-50">
          <div className="font-bold text-orange-400 border-b border-slate-700 pb-1">
            {activeLever.label}: {label} {data.isCurrent ? '(Active Setting)' : ''}
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-slate-300">{goalMetricName}:</span>
            <span className="font-bold text-white">{data.simResult} {goalMetricUnit}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-slate-400">Target Threshold:</span>
            <span className="text-emerald-400">{targetValue} {goalMetricUnit}</span>
          </div>
          <div className="flex justify-between gap-4 border-t border-slate-700 pt-1 text-[10px]">
            <span className="text-slate-400">Delta to Target:</span>
            <span className={data.simResult >= targetValue ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
              {data.simResult >= targetValue ? '+' : ''}{(data.simResult - targetValue).toFixed(1)} {goalMetricUnit}
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

  const CustomComparativeTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900/95 text-white p-3 rounded-lg shadow-xl border border-slate-700 text-xs font-mono space-y-1.5 z-50">
          <div className="font-bold text-orange-400 border-b border-slate-700 pb-1">
            {data.leverName}
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-slate-300">10% Lever Shift:</span>
            <span className="font-bold text-white">{data.deltaShift}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-slate-300">Resulting Outcome Impact:</span>
            <span className={`font-bold ${data.impact >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {data.impact >= 0 ? '+' : ''}{data.impact} {goalMetricUnit}
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs space-y-3">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-orange-600" />
              <span>
                {showComparative
                  ? 'Comparative Lever Sensitivity Impact (10% Perturbation)'
                  : `Sensitivity Analysis: ${activeLever.label} vs. ${goalMetricName}`}
              </span>
            </h3>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-orange-100 text-orange-800 border border-orange-200">
              Sensitivity
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            {showComparative
              ? 'Tornado comparison ranking the relative impact of each lever on the outcome when adjusted by 10%.'
              : `Visualizes how variation in ${activeLever.label} scales ${goalMetricName} toward the target threshold.`}
          </p>
        </div>

        {/* Lever Switcher Pills */}
        <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-100 rounded-lg self-start sm:self-auto shrink-0">
          {currentLevers.map((lever, idx) => (
            <button
              key={lever.label}
              type="button"
              onClick={() => {
                setSelectedLeverIndex(idx);
                setShowComparative(false);
              }}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all whitespace-nowrap ${
                !showComparative && selectedLeverIndex === idx
                  ? 'bg-white text-slate-900 shadow-2xs font-bold ring-1 ring-slate-200/50'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {lever.label}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setShowComparative(true)}
            className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all whitespace-nowrap ${
              showComparative
                ? 'bg-white text-slate-900 shadow-2xs font-bold ring-1 ring-slate-200/50'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Leverage Rank
          </button>
        </div>
      </div>

      {/* Main Recharts Area */}
      <div className="w-full h-64 select-none pt-2">
        <ResponsiveContainer width="100%" height="100%">
          {showComparative ? (
            <BarChart
              data={comparativeData}
              layout="vertical"
              margin={{ top: 10, right: 30, left: 30, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
              <XAxis
                type="number"
                stroke="#64748b"
                fontSize={11}
                tickLine={false}
                fontFamily="JetBrains Mono, monospace"
              />
              <YAxis
                type="category"
                dataKey="leverName"
                stroke="#64748b"
                fontSize={11}
                tickLine={false}
                width={90}
              />
              <Tooltip content={<CustomComparativeTooltip />} />
              <ReferenceLine x={0} stroke="#cbd5e1" />
              <Bar dataKey="impact" name={`Outcome Shift (${goalMetricUnit})`} radius={[0, 4, 4, 0]}>
                {comparativeData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.impact >= 0 ? 'var(--theme-primary, #ea580c)' : '#e11d48'}
                  />
                ))}
              </Bar>
            </BarChart>
          ) : (
            <LineChart
              data={dynamicSweepData}
              margin={{ top: 10, right: 20, left: 10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis
                dataKey="leverLabel"
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
              />
              <Tooltip content={<CustomSweepTooltip />} />
              <Legend
                wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                iconType="plainline"
              />

              {/* Target Value Reference Line */}
              <ReferenceLine
                y={targetValue}
                stroke="var(--theme-primary, #ea580c)"
                strokeDasharray="4 4"
                strokeWidth={1.5}
                label={{
                  value: `Target Goal (${targetValue})`,
                  position: 'insideTopLeft',
                  fill: 'var(--theme-primary, #ea580c)',
                  fontSize: 10,
                  fontFamily: 'JetBrains Mono',
                }}
              />

              {/* Active Setting Reference Line */}
              <ReferenceLine
                x={`${activeLever.value}${activeLever.unit ? ` ${activeLever.unit}` : ''}`}
                stroke="#64748b"
                strokeDasharray="3 3"
                label={{
                  value: `Active (${activeLever.value})`,
                  position: 'top',
                  fill: '#475569',
                  fontSize: 10,
                  fontFamily: 'JetBrains Mono',
                }}
              />

              {/* Simulated Outcome Trend Line */}
              <Line
                type="monotone"
                dataKey="simResult"
                name={`${goalMetricName} (${goalMetricUnit})`}
                stroke="#0f172a"
                strokeWidth={3}
                dot={{ r: 3, fill: '#0f172a' }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Sensitivity Insight Callout */}
      {!showComparative && (
        <div className="p-2.5 rounded-lg bg-orange-50/70 border border-orange-200 flex items-start gap-2 text-xs">
          <Activity className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
          <div className="text-orange-950 leading-relaxed">
            <strong>Lever Sensitivity Insight:</strong> Currently operating at <strong>{activeLever.value} {activeLever.unit}</strong>. Target threshold is <strong>{targetValue} {goalMetricUnit}</strong>. Use the lever selector above to examine individual sensitivity curves across all 3 decision variables.
          </div>
        </div>
      )}

      {showComparative && (
        <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-start gap-2 text-xs">
          <Sliders className="w-4 h-4 text-slate-600 shrink-0 mt-0.5" />
          <div className="text-slate-700 leading-relaxed">
            <strong>Leverage Hierarchy:</strong> Levers with the longest bars exert the greatest marginal influence on <strong>{goalMetricName}</strong> per percentage adjustment. Focus your strategic effort on the dominant lever for maximum efficiency.
          </div>
        </div>
      )}
    </div>
  );
};
