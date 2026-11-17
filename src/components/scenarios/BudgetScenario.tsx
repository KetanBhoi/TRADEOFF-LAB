import React, { useState } from 'react';
import { BudgetParams, LeverLimitThreshold } from '../../types';
import { calculateBudgetModel } from '../../utils/mathUtils';
import { SliderInput } from '../common/SliderInput';
import { StatCard } from '../common/StatCard';
import { BudgetRechartsChart } from '../charts/BudgetRechartsChart';
import { RechartsSparkline, SparklineDataPoint } from '../common/RechartsSparkline';
import { ThresholdAlertBanner, ActiveThresholdViolation } from '../common/ThresholdAlertBanner';
import { DEFAULT_THRESHOLDS } from '../../utils/thresholdDefaults';
import { DollarSign, Users, PieChart, TrendingUp, Info, Download, History, Columns, Globe, Sparkles } from 'lucide-react';

interface BudgetScenarioProps {
  params: BudgetParams;
  setParams: React.Dispatch<React.SetStateAction<BudgetParams>>;
  onOpenSanityCheck: () => void;
  onOpenExport: () => void;
  onOpenHistory: () => void;
  onOpenSplitView?: () => void;
  onOpenGoogleSearch?: (query?: string) => void;
}

export const BudgetScenario: React.FC<BudgetScenarioProps> = ({
  params,
  setParams,
  onOpenSanityCheck,
  onOpenExport,
  onOpenHistory,
  onOpenSplitView,
  onOpenGoogleSearch,
}) => {
  const [showAssumptions, setShowAssumptions] = useState(false);

  // Custom limit thresholds for Budget levers
  const [thresholds, setThresholds] = useState<Record<string, LeverLimitThreshold>>(() => {
    const map: Record<string, LeverLimitThreshold> = {};
    DEFAULT_THRESHOLDS.budget.forEach((t) => {
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

  const model = calculateBudgetModel(params);

  // Active threshold boundary violations
  const activeViolations: ActiveThresholdViolation[] = [];
  if (thresholds['foodCostPerPerson']?.enabled) {
    const t = thresholds['foodCostPerPerson'];
    const isViolated = t.type === 'max' ? params.foodCostPerPerson > t.limitValue : params.foodCostPerPerson < t.limitValue;
    if (isViolated) {
      activeViolations.push({
        threshold: t,
        currentValue: params.foodCostPerPerson,
        unit: '$',
        leverLabel: 'Food & Catering Cost / Person',
        onSnapToLimit: () => setParams((p) => ({ ...p, foodCostPerPerson: t.limitValue })),
      });
    }
  }

  if (thresholds['venueRentalCost']?.enabled) {
    const t = thresholds['venueRentalCost'];
    const isViolated = t.type === 'max' ? params.venueRentalCost > t.limitValue : params.venueRentalCost < t.limitValue;
    if (isViolated) {
      activeViolations.push({
        threshold: t,
        currentValue: params.venueRentalCost,
        unit: '$',
        leverLabel: 'Venue & Facility Rental',
        onSnapToLimit: () => setParams((p) => ({ ...p, venueRentalCost: t.limitValue })),
      });
    }
  }

  // Sparkline datasets for real-time budget sensitivity
  const netSurplusSparkline: SparklineDataPoint[] = Array.from({ length: 11 }, (_, i) => {
    const att = 20 + i * 38;
    const rev = att * params.ticketPrice + params.sponsorSubsidy;
    const exp = params.venueRentalCost + att * params.foodCostPerPerson + params.equipmentAVCost + params.marketingBudget;
    const net = Math.round(rev - exp);
    return {
      x: att,
      y: net,
      formattedX: `${att} guests`,
      formattedY: net >= 0 ? `+$${net.toLocaleString()}` : `-$${Math.abs(net).toLocaleString()}`,
      isCurrent: Math.abs(att - params.expectedAttendees) <= 19,
    };
  });

  const ticketPriceSweep: SparklineDataPoint[] = Array.from({ length: 11 }, (_, i) => {
    const p = i * 5;
    const rev = p * params.expectedAttendees + params.sponsorSubsidy;
    const exp = params.venueRentalCost + params.expectedAttendees * params.foodCostPerPerson + params.equipmentAVCost + params.marketingBudget;
    const net = Math.round(rev - exp);
    return {
      x: p,
      y: net,
      formattedX: `$${p}/tkt`,
      formattedY: net >= 0 ? `+$${net.toLocaleString()}` : `-$${Math.abs(net).toLocaleString()}`,
      isCurrent: p === params.ticketPrice,
    };
  });

  const foodCostSweep: SparklineDataPoint[] = Array.from({ length: 10 }, (_, i) => {
    const f = 3 + i * 3;
    const totalFood = Math.round(f * params.expectedAttendees);
    return {
      x: f,
      y: totalFood,
      formattedX: `$${f}/person`,
      formattedY: `$${totalFood.toLocaleString()} total`,
      isCurrent: f === params.foodCostPerPerson,
    };
  });

  return (
    <div className="space-y-6">
      {/* Scenario Brief Header Callout */}
      <div className="p-4 sm:p-5 rounded-xl bg-white border border-slate-200/90 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider bg-slate-100 text-slate-700 rounded border border-slate-200">
              Budget Modeler
            </span>
            <span className="text-xs font-semibold text-slate-500">
              Campus Event & Club Financial Operations
            </span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 mt-1.5">
            Break-Even Crossover & Expenditure Dynamics
          </h2>
          <p className="text-xs text-slate-600 mt-1 max-w-3xl leading-relaxed">
            Model cash flows, per-head food costs, venue flat fees, and ticket prices to find the break-even attendance headcount and ensure event profitability.
          </p>
        </div>

        {/* Scenario-Specific Quick Presets */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider hidden sm:inline">Simulation:</span>
          <button
            onClick={() => setParams((p) => ({ ...p, ticketPrice: p.ticketPrice === 15 ? 20 : 15 }))}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
              params.ticketPrice === 20
                ? 'bg-orange-50 border-orange-300 text-orange-800'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            {params.ticketPrice === 20 ? 'Active: $20 Ticket Tier' : 'Test: +$5 Ticket Price'}
          </button>
        </div>
      </div>

      {/* Main Two-Zone Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Budget Levers Deck (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Safety & Budgetary Threshold Alert Banner */}
          <ThresholdAlertBanner violations={activeViolations} />

          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Event Parameters
              </span>
              <span className="text-[11px] text-slate-500 font-mono">Financial Levers</span>
            </div>

            {/* Real-time Budget Break-Even Sparkline */}
            <div className="p-2.5 rounded-lg bg-amber-50/70 border border-amber-200/90 space-y-1">
              <div className="flex items-center justify-between text-[11px] font-semibold text-amber-950">
                <span className="flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-600" />
                  Live Net Margin / Break-Even Trajectory
                </span>
                <span className={`font-mono text-[10px] px-1.5 py-0.2 rounded border ${
                  model.netMargin >= 0
                    ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                    : 'text-rose-700 bg-rose-50 border-rose-200'
                }`}>
                  {model.netMargin >= 0 ? `+$${model.netMargin.toLocaleString()}` : `-$${Math.abs(model.netMargin).toLocaleString()}`}
                </span>
              </div>
              <RechartsSparkline
                data={netSurplusSparkline}
                currentX={params.expectedAttendees}
                color="#d97706"
                height={32}
                valueFormatter={(val) => (val >= 0 ? `+$${val.toLocaleString()}` : `-$${Math.abs(val).toLocaleString()}`)}
                minLabel="20 guests"
                maxLabel="400 guests"
              />
            </div>

            <SliderInput
              label="Expected Attendees"
              value={params.expectedAttendees}
              min={20}
              max={400}
              step={10}
              unit="guests"
              hint="Projected head count"
              onChange={(val) => setParams((p) => ({ ...p, expectedAttendees: val }))}
              sparklineData={netSurplusSparkline}
              sparklineLabel="Net Event Balance vs Attendance"
              sparklineFormatter={(val) => (val >= 0 ? `+$${val.toLocaleString()}` : `-$${Math.abs(val).toLocaleString()}`)}
              sparklineColor="#d97706"
            />

            <SliderInput
              label="Ticket Admission Price"
              value={params.ticketPrice}
              min={0}
              max={50}
              step={1}
              unit="$"
              hint="Per attendee admission"
              onChange={(val) => setParams((p) => ({ ...p, ticketPrice: val }))}
              sparklineData={ticketPriceSweep}
              sparklineLabel="Net Balance vs Ticket Price"
              sparklineFormatter={(val) => (val >= 0 ? `+$${val.toLocaleString()}` : `-$${Math.abs(val).toLocaleString()}`)}
              sparklineColor="#d97706"
            />

            <div className="pt-2 border-t border-slate-100">
              <SliderInput
                label="Food & Catering Cost / Person"
                value={params.foodCostPerPerson}
                min={3}
                max={30}
                step={1}
                unit="$"
                hint="Variable catering cost"
                onChange={(val) => setParams((p) => ({ ...p, foodCostPerPerson: val }))}
                sparklineData={foodCostSweep}
                sparklineLabel="Total Catering Outlay vs Cost/Plate"
                sparklineFormatter={(val) => `$${val.toLocaleString()}`}
                sparklineColor="#d97706"
                threshold={thresholds['foodCostPerPerson']}
                onThresholdChange={handleUpdateThreshold}
              />
            </div>

            <div className="pt-2 border-t border-slate-100">
              <SliderInput
                label="Venue & Facility Rental"
                value={params.venueRentalCost}
                min={100}
                max={2000}
                step={50}
                unit="$"
                hint="Fixed facility booking fee"
                onChange={(val) => setParams((p) => ({ ...p, venueRentalCost: val }))}
                threshold={thresholds['venueRentalCost']}
                onThresholdChange={handleUpdateThreshold}
              />
            </div>

            <div className="pt-2 border-t border-slate-100">
              <SliderInput
                label="Sponsor / Department Subsidy"
                value={params.sponsorSubsidy}
                min={0}
                max={2000}
                step={50}
                unit="$"
                hint="Guaranteed funding grant"
                onChange={(val) => setParams((p) => ({ ...p, sponsorSubsidy: val }))}
              />
            </div>
          </div>
        </div>

        {/* Right Column: Visual Stage & Chart (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Top Live Metric Cards with Assumptions Toggle */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Event Economics & Margin
              </span>
              <button
                type="button"
                onClick={() => setShowAssumptions(!showAssumptions)}
                className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg border transition-all ${
                  showAssumptions
                    ? 'bg-orange-50 border-orange-300 text-orange-900 shadow-2xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
                title="Toggle underlying formulas and mathematical assumptions across event budget metrics"
              >
                <Info className="w-3.5 h-3.5 text-orange-600" />
                <span>{showAssumptions ? 'Hide Assumptions' : 'Assumptions & Formulas'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <StatCard
                label="Net Surplus / Deficit"
                value={`${model.netMargin >= 0 ? '+$' : '-$'}${Math.abs(model.netMargin).toLocaleString()}`}
                deltaText={`Rev: $${model.totalRevenue.toLocaleString()}`}
                subtext={`Cost: $${model.totalExpenses.toLocaleString()}`}
                statusBadge={model.isProfitable ? 'Surplus' : 'Deficit'}
                statusType={model.isProfitable ? 'nominal' : 'demanding'}
                showAssumptionsInline={showAssumptions}
                assumptionInfo={{
                  formula: 'NetMargin = (Attendees × TicketPrice + Subsidy) − (FixedCosts + Attendees × FoodCost)',
                  substitution: `(${params.expectedAttendees} × $${params.ticketPrice} + $${params.sponsorSubsidy}) − ($${model.fixedCosts} + ${params.expectedAttendees} × $${params.foodCostPerPerson}) = ${model.netMargin >= 0 ? '+$' : '-$'}${Math.abs(model.netMargin).toLocaleString()}`,
                  explanation: 'Total bottom-line cash remaining after deducting fixed operating overhead and per-attendee food expenses from aggregate gross receipts.',
                  keyFactors: [
                    'Food & beverage expenses scale linearly at $${params.foodCostPerPerson}/guest without bulk volume discounts',
                    'Venue and AV equipment rentals are sunk fixed costs regardless of turnout'
                  ]
                }}
              />

              <StatCard
                label="Break-Even Attendance"
                value={model.breakEvenAttendees === Infinity ? 'N/A' : model.breakEvenAttendees}
                unit="tickets"
                deltaText={`Target: ${params.expectedAttendees} guests`}
                subtext={
                  model.breakEvenAttendees <= params.expectedAttendees
                    ? `Buffer: +${params.expectedAttendees - model.breakEvenAttendees} tickets`
                    : `Shortfall: ${model.breakEvenAttendees - params.expectedAttendees} tickets`
                }
                statusBadge={model.breakEvenAttendees <= params.expectedAttendees ? 'Feasible' : 'Short'}
                statusType={model.breakEvenAttendees <= params.expectedAttendees ? 'nominal' : 'elevated'}
                showAssumptionsInline={showAssumptions}
                assumptionInfo={{
                  formula: 'BreakEven = (FixedCosts − SponsorSubsidy) ÷ (TicketPrice − FoodCostPerPerson)',
                  substitution: `($${model.fixedCosts} − $${params.sponsorSubsidy}) ÷ ($${params.ticketPrice} − $${params.foodCostPerPerson}) = ${model.breakEvenAttendees} tickets`,
                  explanation: 'The critical turnout threshold where ticket margins exactly absorb unpaid fixed facility and AV overhead.',
                  keyFactors: [
                    'Only valid when ticket price exceeds catering cost (positive unit contribution)',
                    'If department sponsor grant covers all fixed costs, break-even is 0 tickets'
                  ]
                }}
              />

              <StatCard
                label="Ticket Profit Margin"
                value={`+$${model.contributionMarginPerTicket}`}
                unit="/ guest"
                deltaText={`$${params.ticketPrice} fee − $${params.foodCostPerPerson} food`}
                subtext="Unit contribution"
                statusBadge={model.contributionMarginPerTicket > 0 ? 'Positive' : 'Loss'}
                statusType={model.contributionMarginPerTicket > 0 ? 'nominal' : 'demanding'}
                showAssumptionsInline={showAssumptions}
                assumptionInfo={{
                  formula: 'UnitMargin = TicketPrice − VariableCostPerGuest',
                  substitution: `$${params.ticketPrice} − $${params.foodCostPerPerson} = +$${model.contributionMarginPerTicket} profit margin/ticket`,
                  explanation: 'Net contribution generated by each ticket sale toward paying off site fees or building a club financial surplus.',
                  keyFactors: [
                    'If margin is negative, each additional attendee increases total event loss'
                  ]
                }}
              />
            </div>
          </div>

          {/* Recharts Break-Even Crossover & Margin Dynamics */}
          <BudgetRechartsChart
            revenueVsCostCurve={model.revenueVsCostCurve}
            breakEvenAttendees={model.breakEvenAttendees}
            expectedAttendees={params.expectedAttendees}
            ticketPrice={params.ticketPrice}
            foodCostPerPerson={params.foodCostPerPerson}
            fixedCosts={model.fixedCosts}
            sponsorSubsidy={params.sponsorSubsidy}
          />

          {/* Verdict Callout Banner */}
          <div
            className={`p-3.5 rounded-lg border flex items-start gap-3 ${
              model.isProfitable
                ? 'text-emerald-800 bg-emerald-50 border-emerald-200'
                : 'text-rose-800 bg-rose-50 border-rose-200'
            }`}
          >
              <Info className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="text-xs leading-relaxed">
              <strong>Budget Assessment:</strong> {model.marginSummary}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
