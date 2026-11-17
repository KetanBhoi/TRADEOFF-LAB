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
import { TrendingUp, DollarSign, Users, Activity, Tag, Utensils } from 'lucide-react';

interface BudgetRechartsChartProps {
  revenueVsCostCurve: { attendees: number; revenue: number; totalCost: number; netProfit: number }[];
  breakEvenAttendees: number;
  expectedAttendees: number;
  ticketPrice: number;
  foodCostPerPerson?: number;
  fixedCosts?: number;
  sponsorSubsidy?: number;
}

type BudgetChartMode = 'crossover' | 'ticketPriceSweep' | 'foodCostSweep' | 'attendanceSweep';

export const BudgetRechartsChart: React.FC<BudgetRechartsChartProps> = ({
  revenueVsCostCurve,
  breakEvenAttendees,
  expectedAttendees,
  ticketPrice,
  foodCostPerPerson = 28,
  fixedCosts = 2850,
  sponsorSubsidy = 600,
}) => {
  const [viewMode, setViewMode] = useState<BudgetChartMode>('ticketPriceSweep');

  // 1. Break-Even Crossover Curve
  const chartData = revenueVsCostCurve.map((pt) => ({
    attendees: pt.attendees,
    attendeesLabel: `${pt.attendees}`,
    revenue: pt.revenue,
    totalCost: pt.totalCost,
    netProfit: pt.netProfit,
  }));

  const maxAttendees = revenueVsCostCurve[revenueVsCostCurve.length - 1]?.attendees || 300;

  // 2. Sensitivity Sweep: Ticket Price ($15 to $110 in steps of $5)
  const ticketSensitivityData = [];
  for (let price = 15; price <= 110; price += 5) {
    const rev = price * expectedAttendees + sponsorSubsidy;
    const exp = fixedCosts + foodCostPerPerson * expectedAttendees;
    const net = rev - exp;
    const unitMargin = price - foodCostPerPerson;
    const beReq = unitMargin > 0 ? Math.ceil(Math.max(0, fixedCosts - sponsorSubsidy) / unitMargin) : 999;

    ticketSensitivityData.push({
      price,
      priceLabel: `$${price}`,
      netProfit: net,
      revenue: rev,
      breakEvenTickets: beReq > 500 ? 500 : beReq,
      isCurrent: price === ticketPrice,
    });
  }

  // 3. Sensitivity Sweep: Food / Catering Cost ($10 to $70 in steps of $5)
  const foodSensitivityData = [];
  for (let food = 10; food <= 70; food += 5) {
    const rev = ticketPrice * expectedAttendees + sponsorSubsidy;
    const exp = fixedCosts + food * expectedAttendees;
    const net = rev - exp;
    foodSensitivityData.push({
      food,
      foodLabel: `$${food}`,
      netProfit: net,
      expenses: exp,
      isCurrent: food === foodCostPerPerson,
    });
  }

  // 4. Sensitivity Sweep: Attendance Turnout vs Net Profit
  const attendanceSensitivityData = chartData.map((pt) => ({
    attendees: pt.attendees,
    attendeesLabel: `${pt.attendees} guests`,
    netProfit: pt.netProfit,
    isCurrent: Math.abs(pt.attendees - expectedAttendees) < 10,
  }));

  // Tooltips
  const CustomCrossoverTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900/95 text-white p-3 rounded-lg shadow-xl border border-slate-700 text-xs font-mono space-y-1.5 z-50">
          <div className="font-bold text-orange-400 border-b border-slate-700 pb-1">
            Turnout: {label} Attendees
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-emerald-400">Total Revenue:</span>
            <span className="font-bold text-white">${data.revenue.toLocaleString()}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-slate-400">Total Expenses:</span>
            <span className="font-bold text-white">${data.totalCost.toLocaleString()}</span>
          </div>
          <div className="flex justify-between gap-4 border-t border-slate-700 pt-1">
            <span className="text-slate-300">Net Profit / Loss:</span>
            <span className={`font-bold ${data.netProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {data.netProfit >= 0 ? '+$' : '-$'}{Math.abs(data.netProfit).toLocaleString()}
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

  const CustomTicketTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900/95 text-white p-3 rounded-lg shadow-xl border border-slate-700 text-xs font-mono space-y-1.5 z-50">
          <div className="font-bold text-orange-400 border-b border-slate-700 pb-1">
            Ticket Price: {label} {data.isCurrent ? '(Active Setting)' : ''}
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-slate-300">Net Margin:</span>
            <span className={`font-bold ${data.netProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {data.netProfit >= 0 ? '+$' : '-$'}{Math.abs(data.netProfit).toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-slate-400">Gross Revenue:</span>
            <span className="font-bold text-white">${data.revenue.toLocaleString()}</span>
          </div>
          <div className="flex justify-between gap-4 border-t border-slate-700 pt-1">
            <span className="text-amber-300">Break-Even Required:</span>
            <span className="font-bold text-white">{data.breakEvenTickets} tickets</span>
          </div>
        </div>
      );
    }
    return null;
  };

  const CustomFoodTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900/95 text-white p-3 rounded-lg shadow-xl border border-slate-700 text-xs font-mono space-y-1.5 z-50">
          <div className="font-bold text-orange-400 border-b border-slate-700 pb-1">
            Food Cost: {label}/guest {data.isCurrent ? '(Active)' : ''}
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-slate-300">Net Profit / Loss:</span>
            <span className={`font-bold ${data.netProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {data.netProfit >= 0 ? '+$' : '-$'}{Math.abs(data.netProfit).toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-slate-400">Aggregate Expenses:</span>
            <span className="font-bold text-white">${data.expenses.toLocaleString()}</span>
          </div>
        </div>
      );
    }
    return null;
  };

  const currentSurplusPer5Dollars = expectedAttendees * 5;

  return (
    <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs space-y-3">
      {/* Chart Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-orange-600" />
              <span>
                {viewMode === 'crossover'
                  ? 'Break-Even Crossover & Margin Dynamics'
                  : viewMode === 'ticketPriceSweep'
                  ? 'Sensitivity Analysis: Ticket Price vs. Net Profit'
                  : viewMode === 'foodCostSweep'
                  ? 'Sensitivity Analysis: Catering Cost vs. Net Margin'
                  : 'Sensitivity Analysis: Attendance Turnout vs. Net Profit'}
              </span>
            </h3>
            {viewMode !== 'crossover' && (
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-orange-100 text-orange-800 border border-orange-200">
                Sensitivity
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            {viewMode === 'crossover'
              ? 'Recharts dual-trendline model tracking revenue growth vs fixed & variable expenditure curves.'
              : viewMode === 'ticketPriceSweep'
              ? 'Sensitivity curve visualizing how ticket admission fee scaling drives bottom-line profitability.'
              : viewMode === 'foodCostSweep'
              ? 'Evaluates how catering/per-guest variable supplier expenses compress event net margin.'
              : 'Models net surplus trajectory as attendance turnout scales from minimum to full capacity.'}
          </p>
        </div>

        {/* View Mode Toggle */}
        <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-100 rounded-lg self-start sm:self-auto shrink-0">
          <button
            type="button"
            onClick={() => setViewMode('ticketPriceSweep')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all whitespace-nowrap ${
              viewMode === 'ticketPriceSweep'
                ? 'bg-white text-slate-900 shadow-2xs font-bold ring-1 ring-slate-200/50'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Ticket Price Sensitivity
          </button>
          <button
            type="button"
            onClick={() => setViewMode('foodCostSweep')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all whitespace-nowrap ${
              viewMode === 'foodCostSweep'
                ? 'bg-white text-slate-900 shadow-2xs font-bold ring-1 ring-slate-200/50'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Catering Cost
          </button>
          <button
            type="button"
            onClick={() => setViewMode('crossover')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all whitespace-nowrap ${
              viewMode === 'crossover'
                ? 'bg-white text-slate-900 shadow-2xs font-bold ring-1 ring-slate-200/50'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Break-Even Curve
          </button>
        </div>
      </div>

      {/* Main Recharts Area */}
      <div className="w-full h-64 select-none pt-2">
        <ResponsiveContainer width="100%" height="100%">
          {viewMode === 'crossover' ? (
            <ComposedChart
              data={chartData}
              margin={{ top: 10, right: 20, left: 10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis
                dataKey="attendees"
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
              <Tooltip content={<CustomCrossoverTooltip />} />
              <Legend
                wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                iconType="plainline"
              />

              {/* Break Even Vertical Reference Line */}
              {breakEvenAttendees > 0 && breakEvenAttendees <= maxAttendees && (
                <ReferenceLine
                  x={breakEvenAttendees}
                  stroke="var(--theme-primary, #ea580c)"
                  strokeDasharray="4 4"
                  strokeWidth={1.5}
                  label={{
                    value: `Break-Even (${breakEvenAttendees})`,
                    position: 'top',
                    fill: 'var(--theme-primary, #ea580c)',
                    fontSize: 10,
                    fontFamily: 'JetBrains Mono',
                  }}
                />
              )}

              {/* Expected Turnout Vertical Reference Line */}
              <ReferenceLine
                x={expectedAttendees}
                stroke="#059669"
                strokeDasharray="2 2"
                label={{
                  value: `Expected (${expectedAttendees})`,
                  position: 'insideTopLeft',
                  fill: '#059669',
                  fontSize: 10,
                  fontFamily: 'JetBrains Mono',
                }}
              />

              {/* Total Expenses Trend Line */}
              <Line
                type="monotone"
                dataKey="totalCost"
                name="Total Expenses ($)"
                stroke="#475569"
                strokeWidth={2.5}
                dot={false}
              />

              {/* Revenue Growth Trend Line */}
              <Line
                type="monotone"
                dataKey="revenue"
                name="Total Revenue ($)"
                stroke="#059669"
                strokeWidth={3}
                dot={{ r: 3, fill: '#059669' }}
                activeDot={{ r: 5 }}
              />

              {/* Net Profit Trend Line */}
              <Line
                type="monotone"
                dataKey="netProfit"
                name="Net Margin ($)"
                stroke="var(--theme-primary, #ea580c)"
                strokeWidth={1.5}
                strokeDasharray="3 3"
                dot={false}
              />
            </ComposedChart>
          ) : viewMode === 'ticketPriceSweep' ? (
            <ComposedChart
              data={ticketSensitivityData}
              margin={{ top: 10, right: 20, left: 10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis
                dataKey="priceLabel"
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
              <Tooltip content={<CustomTicketTooltip />} />
              <Legend
                wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                iconType="plainline"
              />

              {/* Break Even Zero Margin Reference Line */}
              <ReferenceLine
                y={0}
                stroke="#ef4444"
                strokeDasharray="3 3"
                label={{
                  value: 'Break-Even ($0)',
                  fill: '#ef4444',
                  fontSize: 10,
                  position: 'insideTopLeft',
                  fontFamily: 'JetBrains Mono',
                }}
              />

              {/* Current Ticket Price Reference Line */}
              <ReferenceLine
                x={`$${ticketPrice}`}
                stroke="var(--theme-primary, #ea580c)"
                strokeWidth={2}
                strokeDasharray="3 3"
                label={{
                  value: `Current ($${ticketPrice})`,
                  fill: 'var(--theme-primary, #ea580c)',
                  fontSize: 10,
                  position: 'top',
                  fontFamily: 'JetBrains Mono',
                }}
              />

              <Line
                type="monotone"
                dataKey="netProfit"
                name="Net Profit / Loss ($)"
                stroke="#059669"
                strokeWidth={3}
                dot={(props: any) => {
                  const { cx, cy, payload } = props;
                  if (payload.isCurrent) {
                    return (
                      <circle
                        key={payload.price}
                        cx={cx}
                        cy={cy}
                        r={6}
                        fill="#059669"
                        stroke="#ffffff"
                        strokeWidth={2}
                      />
                    );
                  }
                  return (
                    <circle
                      key={payload.price}
                      cx={cx}
                      cy={cy}
                      r={2.5}
                      fill="#94a3b8"
                    />
                  );
                }}
                activeDot={{ r: 6 }}
              />
            </ComposedChart>
          ) : (
            <ComposedChart
              data={foodSensitivityData}
              margin={{ top: 10, right: 20, left: 10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis
                dataKey="foodLabel"
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
              <Tooltip content={<CustomFoodTooltip />} />
              <Legend
                wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                iconType="plainline"
              />

              <ReferenceLine y={0} stroke="#ef4444" strokeDasharray="3 3" />
              <ReferenceLine
                x={`$${foodCostPerPerson}`}
                stroke="var(--theme-primary, #ea580c)"
                strokeWidth={2}
                strokeDasharray="3 3"
                label={{
                  value: `Current ($${foodCostPerPerson})`,
                  fill: 'var(--theme-primary, #ea580c)',
                  fontSize: 10,
                  position: 'top',
                  fontFamily: 'JetBrains Mono',
                }}
              />

              <Line
                type="monotone"
                dataKey="netProfit"
                name="Net Margin vs Food Cost ($)"
                stroke="#e11d48"
                strokeWidth={3}
                dot={false}
                activeDot={{ r: 5 }}
              />
            </ComposedChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Sensitivity Elasticity Callout */}
      {viewMode === 'ticketPriceSweep' && (
        <div className="p-2.5 rounded-lg bg-emerald-50/70 border border-emerald-200 flex items-start gap-2 text-xs">
          <DollarSign className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <div className="text-emerald-950 leading-relaxed">
            <strong>Ticket Price Leverage Elasticity:</strong> At {expectedAttendees} expected attendees, each <strong>+$5 increase</strong> in ticket price yields exactly <strong>+${currentSurplusPer5Dollars.toLocaleString()}</strong> in incremental net profit. Current configuration break-even requires <strong>{breakEvenAttendees} ticket sales</strong>.
          </div>
        </div>
      )}

      {viewMode === 'foodCostSweep' && (
        <div className="p-2.5 rounded-lg bg-rose-50/70 border border-rose-200 flex items-start gap-2 text-xs">
          <Utensils className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <div className="text-rose-950 leading-relaxed">
            <strong>Variable Cost Elasticity:</strong> Negotiating down per-person catering by -$5 expands event bottom-line surplus by <strong>+${currentSurplusPer5Dollars.toLocaleString()}</strong>, lowering financial vulnerability if guest turnout falls below projections.
          </div>
        </div>
      )}
    </div>
  );
};
