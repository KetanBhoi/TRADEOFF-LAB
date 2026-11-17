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
} from 'recharts';
import { HousingOptionOutcome } from '../../utils/mathUtils';
import { HousingOption } from '../../types';
import { TrendingUp, Sliders, DollarSign, Activity, Percent } from 'lucide-react';

interface HousingRechartsChartProps {
  monthlyTrajectory: { month: number; [key: string]: number }[];
  options: HousingOptionOutcome[];
  monthlyNetIncome: number;
  discretionaryBuffer?: number;
  rawOptions?: HousingOption[];
}

type HousingChartMode = 'timeline' | 'rentSensitivity' | 'incomeSensitivity' | 'bufferSensitivity';

export const HousingRechartsChart: React.FC<HousingRechartsChartProps> = ({
  monthlyTrajectory,
  options,
  monthlyNetIncome,
  discretionaryBuffer = 950,
  rawOptions = [],
}) => {
  const [viewMode, setViewMode] = useState<HousingChartMode>('rentSensitivity');
  const [selectedOptionId, setSelectedOptionId] = useState<string>('all');

  const optionColors: Record<string, string> = {
    'opt-stay': '#64748b',
    'opt-roommate': 'var(--theme-primary, #ea580c)',
    'opt-studio': '#0d9488',
  };

  // 1. Timeline Data (12 Months Cumulative)
  const chartTimelineData = monthlyTrajectory.map((row) => ({
    name: `M${row.month}`,
    month: row.month,
    'opt-stay': row['opt-stay'] || 0,
    'opt-roommate': row['opt-roommate'] || 0,
    'opt-studio': row['opt-studio'] || 0,
  }));

  // 2. Sensitivity Analysis: Rent Changes vs Monthly Savings ($800 to $3,200)
  const rentSensitivityData = [];
  for (let rent = 800; rent <= 3200; rent += 100) {
    const row: any = {
      rent,
      rentLabel: `$${rent}`,
    };

    options.forEach((opt) => {
      const rawOpt = rawOptions.find((ro) => ro.id === opt.id);
      const split = Math.max(1, rawOpt?.roommateSplit || (opt.id === 'opt-roommate' ? 2 : 1));
      const effRent = rent / split;
      const directCost = effRent + opt.effectiveUtilities + opt.monthlyTransitCost;
      const monthlySavings = Math.round(monthlyNetIncome - directCost - discretionaryBuffer);
      row[opt.id] = monthlySavings;
      row[`${opt.id}_annual`] = monthlySavings * 12;
    });

    rentSensitivityData.push(row);
  }

  // 3. Sensitivity Analysis: Income Sweep ($2,500 to $8,000)
  const incomeSensitivityData = [];
  for (let inc = 2500; inc <= 8000; inc += 500) {
    const row: any = {
      incomeLabel: `$${Math.round(inc / 1000)}k`,
      incomeVal: inc,
      isCurrent: Math.abs(inc - monthlyNetIncome) < 250,
    };
    options.forEach((opt) => {
      const monthlySav = inc - opt.totalMonthlyDirectCost - discretionaryBuffer;
      row[opt.id] = Math.round(monthlySav * 12);
    });
    incomeSensitivityData.push(row);
  }

  // 4. Sensitivity Analysis: Buffer Sweep ($200 to $2,000)
  const bufferSensitivityData = [];
  for (let buf = 200; buf <= 2000; buf += 100) {
    const row: any = {
      bufLabel: `$${buf}`,
      bufVal: buf,
      isCurrent: Math.abs(buf - discretionaryBuffer) < 50,
    };
    options.forEach((opt) => {
      const monthlySav = Math.round(monthlyNetIncome - opt.totalMonthlyDirectCost - buf);
      row[opt.id] = monthlySav;
    });
    bufferSensitivityData.push(row);
  }

  // Custom Tooltips
  const CustomTimelineTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900/95 text-white p-3 rounded-lg shadow-xl border border-slate-700 text-xs font-mono space-y-1.5 z-50">
          <div className="font-bold text-orange-400 border-b border-slate-700 pb-1">
            Month {label?.replace('M', '')} Cumulative Balance
          </div>
          {payload.map((entry: any) => {
            const opt = options.find((o) => o.id === entry.dataKey);
            return (
              <div key={entry.dataKey} className="flex justify-between gap-4">
                <span style={{ color: entry.color }}>{opt?.name || entry.dataKey}:</span>
                <span className="font-bold text-white">${entry.value.toLocaleString()}</span>
              </div>
            );
          })}
        </div>
      );
    }
    return null;
  };

  const CustomRentTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900/95 text-white p-3 rounded-lg shadow-xl border border-slate-700 text-xs font-mono space-y-1.5 z-50">
          <div className="font-bold text-orange-400 border-b border-slate-700 pb-1">
            Base Rent: {label}/mo
          </div>
          {payload.map((entry: any) => {
            const opt = options.find((o) => o.id === entry.dataKey);
            const val = entry.value;
            return (
              <div key={entry.dataKey} className="flex justify-between gap-4">
                <span style={{ color: entry.color }}>{opt?.name || entry.dataKey}:</span>
                <div className="text-right">
                  <span className={`font-bold ${val >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {val >= 0 ? '+$' : '-$'}{Math.abs(val).toLocaleString()}/mo
                  </span>
                  <span className="text-[10px] text-slate-400 ml-1.5">
                    ({(val * 12 >= 0 ? '+$' : '-$')}{Math.abs(val * 12).toLocaleString()}/yr)
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      );
    }
    return null;
  };

  const CustomIncomeTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900/95 text-white p-3 rounded-lg shadow-xl border border-slate-700 text-xs font-mono space-y-1.5 z-50">
          <div className="font-bold text-orange-400 border-b border-slate-700 pb-1">
            Income Level: {label}/mo
          </div>
          {payload.map((entry: any) => {
            const opt = options.find((o) => o.id === entry.dataKey);
            return (
              <div key={entry.dataKey} className="flex justify-between gap-4">
                <span style={{ color: entry.color }}>{opt?.name || entry.dataKey}:</span>
                <span className="font-bold text-white">${entry.value.toLocaleString()}/yr</span>
              </div>
            );
          })}
        </div>
      );
    }
    return null;
  };

  const CustomBufferTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900/95 text-white p-3 rounded-lg shadow-xl border border-slate-700 text-xs font-mono space-y-1.5 z-50">
          <div className="font-bold text-orange-400 border-b border-slate-700 pb-1">
            Discretionary Buffer: {label}/mo
          </div>
          {payload.map((entry: any) => {
            const opt = options.find((o) => o.id === entry.dataKey);
            const val = entry.value;
            return (
              <div key={entry.dataKey} className="flex justify-between gap-4">
                <span style={{ color: entry.color }}>{opt?.name || entry.dataKey}:</span>
                <span className={`font-bold ${val >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {val >= 0 ? '+$' : '-$'}{Math.abs(val).toLocaleString()}/mo
                </span>
              </div>
            );
          })}
        </div>
      );
    }
    return null;
  };

  // Sensitivity Insight Callout values
  const winnerOpt = options.find((o) => o.isWinner) || options[0];
  const winnerRaw = rawOptions.find((ro) => ro.id === winnerOpt?.id);
  const winnerSplit = winnerRaw?.roommateSplit || (winnerOpt?.id === 'opt-roommate' ? 2 : 1);
  const rentSensitivityPer100 = 100 / winnerSplit;

  return (
    <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs space-y-3">
      {/* Chart Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-orange-600" />
              <span>
                {viewMode === 'timeline'
                  ? '12-Month Cumulative Cash Growth Comparison'
                  : viewMode === 'rentSensitivity'
                  ? 'Sensitivity Analysis: Rent Changes vs. Monthly Savings'
                  : viewMode === 'incomeSensitivity'
                  ? 'Sensitivity Analysis: Income vs. Annual Savings'
                  : 'Sensitivity Analysis: Discretionary Buffer vs. Savings'}
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
              ? 'Multi-trendline projection tracking cumulative bank balance across all 3 options.'
              : viewMode === 'rentSensitivity'
              ? 'Visualizes how variation in base lease rent directly drives net monthly savings across options.'
              : viewMode === 'incomeSensitivity'
              ? 'Simulates how changes in monthly take-home income shift 1-year wealth accumulation.'
              : 'Evaluates how spending buffer tolerance impacts discretionary savings margins.'}
          </p>
        </div>

        {/* View Mode Toggle */}
        <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-100 rounded-lg self-start sm:self-auto shrink-0">
          <button
            type="button"
            onClick={() => setViewMode('rentSensitivity')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all whitespace-nowrap ${
              viewMode === 'rentSensitivity'
                ? 'bg-white text-slate-900 shadow-2xs font-bold ring-1 ring-slate-200/50'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Rent Sensitivity
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
            12-Mo Timeline
          </button>
          <button
            type="button"
            onClick={() => setViewMode('incomeSensitivity')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all whitespace-nowrap ${
              viewMode === 'incomeSensitivity'
                ? 'bg-white text-slate-900 shadow-2xs font-bold ring-1 ring-slate-200/50'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Income
          </button>
          <button
            type="button"
            onClick={() => setViewMode('bufferSensitivity')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all whitespace-nowrap ${
              viewMode === 'bufferSensitivity'
                ? 'bg-white text-slate-900 shadow-2xs font-bold ring-1 ring-slate-200/50'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Buffer
          </button>
        </div>
      </div>

      {/* Main Recharts Area */}
      <div className="w-full h-64 select-none pt-2">
        <ResponsiveContainer width="100%" height="100%">
          {viewMode === 'timeline' ? (
            <LineChart
              data={chartTimelineData}
              margin={{ top: 10, right: 20, left: 10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis
                dataKey="name"
                stroke="#64748b"
                fontSize={11}
                tickLine={false}
                fontFamily="JetBrains Mono, monospace"
              />
              <YAxis
                tickFormatter={(val) => `$${Math.round(val / 1000)}k`}
                stroke="#64748b"
                fontSize={11}
                tickLine={false}
                fontFamily="JetBrains Mono, monospace"
                width={50}
              />
              <Tooltip content={<CustomTimelineTooltip />} />
              <Legend
                wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                formatter={(value) => {
                  const opt = options.find((o) => o.id === value);
                  return opt ? opt.name : value;
                }}
              />

              <ReferenceLine y={0} stroke="#cbd5e1" strokeDasharray="2 2" />

              {options.map((opt) => {
                const color = optionColors[opt.id] || '#64748b';
                return (
                  <Line
                    key={opt.id}
                    type="monotone"
                    dataKey={opt.id}
                    name={opt.name}
                    stroke={color}
                    strokeWidth={opt.isWinner ? 3.5 : 2}
                    dot={opt.isWinner ? { r: 3, fill: '#ffffff', stroke: color, strokeWidth: 2 } : false}
                    activeDot={{ r: 5 }}
                  />
                );
              })}
            </LineChart>
          ) : viewMode === 'rentSensitivity' ? (
            <LineChart
              data={rentSensitivityData}
              margin={{ top: 10, right: 20, left: 10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis
                dataKey="rentLabel"
                stroke="#64748b"
                fontSize={11}
                tickLine={false}
                fontFamily="JetBrains Mono, monospace"
              />
              <YAxis
                tickFormatter={(val) => (val >= 0 ? `+$${val}` : `-$${Math.abs(val)}`)}
                stroke="#64748b"
                fontSize={11}
                tickLine={false}
                fontFamily="JetBrains Mono, monospace"
                width={65}
              />
              <Tooltip content={<CustomRentTooltip />} />
              <Legend
                wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                formatter={(value) => {
                  const opt = options.find((o) => o.id === value);
                  return opt ? `${opt.name} (Savings)` : value;
                }}
              />

              {/* Zero-Savings Break Even Threshold Line */}
              <ReferenceLine
                y={0}
                stroke="#ef4444"
                strokeDasharray="3 3"
                label={{
                  value: 'Break-Even ($0 Savings)',
                  fill: '#ef4444',
                  fontSize: 10,
                  position: 'insideTopLeft',
                  fontFamily: 'JetBrains Mono',
                }}
              />

              {/* Current Rent Markers for options */}
              {rawOptions.map((ro) => (
                <ReferenceLine
                  key={ro.id}
                  x={`$${ro.rent}`}
                  stroke={optionColors[ro.id] || '#94a3b8'}
                  strokeDasharray="2 2"
                  label={{
                    value: `${ro.name.split(' ')[0]} ($${ro.rent})`,
                    fill: optionColors[ro.id] || '#64748b',
                    fontSize: 9,
                    position: 'top',
                    fontFamily: 'JetBrains Mono',
                  }}
                />
              ))}

              {options.map((opt) => {
                const color = optionColors[opt.id] || '#64748b';
                return (
                  <Line
                    key={opt.id}
                    type="monotone"
                    dataKey={opt.id}
                    name={opt.name}
                    stroke={color}
                    strokeWidth={opt.isWinner ? 3.5 : 2}
                    dot={false}
                    activeDot={{ r: 5 }}
                  />
                );
              })}
            </LineChart>
          ) : viewMode === 'incomeSensitivity' ? (
            <LineChart
              data={incomeSensitivityData}
              margin={{ top: 10, right: 20, left: 10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis
                dataKey="incomeLabel"
                stroke="#64748b"
                fontSize={11}
                tickLine={false}
                fontFamily="JetBrains Mono, monospace"
              />
              <YAxis
                tickFormatter={(val) => `$${Math.round(val / 1000)}k`}
                stroke="#64748b"
                fontSize={11}
                tickLine={false}
                fontFamily="JetBrains Mono, monospace"
                width={50}
              />
              <Tooltip content={<CustomIncomeTooltip />} />
              <Legend
                wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                formatter={(value) => {
                  const opt = options.find((o) => o.id === value);
                  return opt ? `${opt.name} (Annual)` : value;
                }}
              />

              <ReferenceLine
                x={`$${Math.round(monthlyNetIncome / 1000)}k`}
                stroke="var(--theme-primary, #ea580c)"
                strokeDasharray="3 3"
                label={{
                  value: `Current ($${Math.round(monthlyNetIncome / 1000)}k)`,
                  fill: 'var(--theme-primary, #ea580c)',
                  fontSize: 10,
                  position: 'top',
                  fontFamily: 'JetBrains Mono',
                }}
              />

              {options.map((opt) => {
                const color = optionColors[opt.id] || '#64748b';
                return (
                  <Line
                    key={opt.id}
                    type="monotone"
                    dataKey={opt.id}
                    name={opt.name}
                    stroke={color}
                    strokeWidth={opt.isWinner ? 3 : 2}
                    dot={false}
                  />
                );
              })}
            </LineChart>
          ) : (
            <LineChart
              data={bufferSensitivityData}
              margin={{ top: 10, right: 20, left: 10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis
                dataKey="bufLabel"
                stroke="#64748b"
                fontSize={11}
                tickLine={false}
                fontFamily="JetBrains Mono, monospace"
              />
              <YAxis
                tickFormatter={(val) => (val >= 0 ? `+$${val}` : `-$${Math.abs(val)}`)}
                stroke="#64748b"
                fontSize={11}
                tickLine={false}
                fontFamily="JetBrains Mono, monospace"
                width={60}
              />
              <Tooltip content={<CustomBufferTooltip />} />
              <Legend
                wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                formatter={(value) => {
                  const opt = options.find((o) => o.id === value);
                  return opt ? opt.name : value;
                }}
              />

              <ReferenceLine y={0} stroke="#ef4444" strokeDasharray="3 3" />
              <ReferenceLine
                x={`$${discretionaryBuffer}`}
                stroke="var(--theme-primary, #ea580c)"
                strokeDasharray="3 3"
                label={{
                  value: `Current ($${discretionaryBuffer})`,
                  fill: 'var(--theme-primary, #ea580c)',
                  fontSize: 10,
                  position: 'top',
                  fontFamily: 'JetBrains Mono',
                }}
              />

              {options.map((opt) => {
                const color = optionColors[opt.id] || '#64748b';
                return (
                  <Line
                    key={opt.id}
                    type="monotone"
                    dataKey={opt.id}
                    name={opt.name}
                    stroke={color}
                    strokeWidth={opt.isWinner ? 3 : 2}
                    dot={false}
                  />
                );
              })}
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Sensitivity Elasticity Callout */}
      {viewMode === 'rentSensitivity' && (
        <div className="p-2.5 rounded-lg bg-orange-50/70 border border-orange-200 flex items-start gap-2 text-xs">
          <Activity className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
          <div className="text-orange-950 leading-relaxed">
            <strong>Lever Sensitivity Insight:</strong> For single leases (Downtown Studio & Stay Put), each <strong>+$100/mo</strong> increase in rent reduces monthly savings by exactly <strong>-$100</strong> (<strong>-$1,200/year</strong>). For the 2-bedroom split with {winnerSplit} roommates, each <strong>+$100/mo</strong> base rent shift is buffered to <strong>-${Math.round(rentSensitivityPer100)}/mo</strong> per person.
          </div>
        </div>
      )}

      {viewMode === 'incomeSensitivity' && (
        <div className="p-2.5 rounded-lg bg-emerald-50/70 border border-emerald-200 flex items-start gap-2 text-xs">
          <DollarSign className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <div className="text-emerald-950 leading-relaxed">
            <strong>Income Leverage Elasticity:</strong> 100% of incremental monthly net earnings flow directly to discretionary capital growth, expanding cumulative annual savings by <strong>+$6,000</strong> per +$500/month take-home bump.
          </div>
        </div>
      )}

      {viewMode === 'bufferSensitivity' && (
        <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-start gap-2 text-xs">
          <Percent className="w-4 h-4 text-slate-600 shrink-0 mt-0.5" />
          <div className="text-slate-700 leading-relaxed">
            <strong>Buffer Trade-off:</strong> Tightening your monthly living buffer frees immediate dollar-for-dollar surplus for investment, but increases vulnerability to unexpected grocery, medical, or emergency expenses.
          </div>
        </div>
      )}
    </div>
  );
};
