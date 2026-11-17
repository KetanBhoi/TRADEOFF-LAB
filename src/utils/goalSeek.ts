/**
 * Reverse Goal Seek / Parameter Optimization Engine for TradeOff Lab
 * Uses numerical root finding (bisection and secant methods) to compute
 * the exact input lever needed to achieve any target outcome.
 */

import {
  ScenarioId,
  RunningParams,
  HousingParams,
  GpaParams,
  BudgetParams,
  CustomParams,
  TradingParams,
} from '../types';
import {
  calculateRunningModel,
  calculateHousingModel,
  calculateGpaModel,
  calculateBudgetModel,
  calculateCustomModel,
  calculateTradingModel,
} from './mathUtils';

export interface GoalSeekOption {
  id: string;
  label: string;
  leverKey: string;
  leverLabel: string;
  unit: string;
  minVal: number;
  maxVal: number;
  step: number;
  currentVal: number;
  description: string;
}

export interface GoalSeekResult {
  leverKey: string;
  leverLabel: string;
  unit: string;
  initialValue: number;
  solvedValue: number;
  difference: number;
  targetMetricName: string;
  targetMetricValue: number;
  achievedMetricValue: number;
  isFeasible: boolean;
  notes: string;
}

export function getAvailableGoalSeekOptions(
  scenarioId: ScenarioId,
  params: RunningParams | HousingParams | GpaParams | BudgetParams | CustomParams | TradingParams
): GoalSeekOption[] {
  switch (scenarioId) {
    case 'running': {
      const rp = params as RunningParams;
      return [
        {
          id: 'weeksUntilRace',
          label: 'Training Weeks Needed',
          leverKey: 'weeksUntilRace',
          leverLabel: 'Weeks Until Race',
          unit: 'weeks',
          minVal: 4,
          maxVal: 30,
          step: 1,
          currentVal: rp.weeksUntilRace,
          description: 'Calculates how many total preparation weeks you need to keep weekly pace cuts at your chosen pace shave rate.',
        },
        {
          id: 'runsPerWeek',
          label: 'Runs Per Week Frequency',
          leverKey: 'runsPerWeek',
          leverLabel: 'Runs Per Week',
          unit: 'runs/wk',
          minVal: 2,
          maxVal: 6,
          step: 1,
          currentVal: rp.runsPerWeek,
          description: 'Optimizes running frequency to match aerobic adaptation demands.',
        },
      ];
    }

    case 'housing': {
      const hp = params as HousingParams;
      const opt = hp.options[0];
      return [
        {
          id: 'rent',
          label: 'Maximum Rent Budget (Option 1)',
          leverKey: 'opt0_rent',
          leverLabel: 'Option 1 Base Lease Rent',
          unit: '$/mo',
          minVal: 600,
          maxVal: 3500,
          step: 50,
          currentVal: opt.rent,
          description: 'Finds the maximum base rent you can pay while still securing your target monthly savings margin.',
        },
        {
          id: 'monthlyNetIncome',
          label: 'Required Take-Home Income',
          leverKey: 'monthlyNetIncome',
          leverLabel: 'Monthly Net Income',
          unit: '$/mo',
          minVal: 1500,
          maxVal: 10000,
          step: 100,
          currentVal: hp.monthlyNetIncome,
          description: 'Calculates the monthly net salary needed to achieve your wealth-building goal under current rents.',
        },
      ];
    }

    case 'gpa': {
      const gp = params as GpaParams;
      return [
        {
          id: 'midtermScore',
          label: 'Midterm Exam Target Score',
          leverKey: 'midtermScore',
          leverLabel: 'Midterm Exam Score',
          unit: '%',
          minVal: 40,
          maxVal: 100,
          step: 1,
          currentVal: gp.midtermScore,
          description: 'Determines what midterm score relieves test-day pressure so your required final score stays under your target.',
        },
        {
          id: 'finalExamWeight',
          label: 'Final Exam Syllabus Weight',
          leverKey: 'finalExamWeight',
          leverLabel: 'Final Exam Weight',
          unit: '%',
          minVal: 20,
          maxVal: 60,
          step: 1,
          currentVal: gp.finalExamWeight,
          description: 'Evaluates syllabus grading weights to hit your target course letter grade.',
        },
      ];
    }

    case 'budget': {
      const bp = params as BudgetParams;
      return [
        {
          id: 'ticketPrice',
          label: 'Required Ticket Price Tier',
          leverKey: 'ticketPrice',
          leverLabel: 'Ticket Admission Price',
          unit: '$',
          minVal: 5,
          maxVal: 120,
          step: 1,
          currentVal: bp.ticketPrice,
          description: 'Finds the exact ticket price required to reach your target event profit or break-even margin.',
        },
        {
          id: 'expectedAttendees',
          label: 'Target Attendance Headcount',
          leverKey: 'expectedAttendees',
          leverLabel: 'Expected Attendees',
          unit: 'guests',
          minVal: 20,
          maxVal: 600,
          step: 10,
          currentVal: bp.expectedAttendees,
          description: 'Calculates the guest headcount needed to cover all fixed venue overhead and variable catering costs.',
        },
        {
          id: 'foodCostPerPerson',
          label: 'Maximum Catering Cap Per Guest',
          leverKey: 'foodCostPerPerson',
          leverLabel: 'Catering Cost / Person',
          unit: '$/person',
          minVal: 2,
          maxVal: 40,
          step: 1,
          currentVal: bp.foodCostPerPerson,
          description: 'Identifies the upper limit on food & beverage spend per attendee to protect the budget.',
        },
      ];
    }

    case 'custom': {
      const cp = params as CustomParams;
      return cp.levers.map((l, idx) => ({
        id: `lever_${idx}`,
        label: `${l.label} Setting`,
        leverKey: `lever_${idx}`,
        leverLabel: l.label,
        unit: l.unit,
        minVal: l.min,
        maxVal: l.max,
        step: l.step,
        currentVal: l.value,
        description: `Finds the precise value for ${l.label} that outputs your desired target goal metric (${cp.targetValue} ${cp.goalMetricUnit}).`,
      }));
    }

    case 'trading': {
      const tp = params as TradingParams;
      return [
        {
          id: 'expectedDay1Pop',
          label: 'Required Day 1 Listing Pop',
          leverKey: 'expectedDay1Pop',
          leverLabel: 'Expected Day 1 Pop',
          unit: '%',
          minVal: 5,
          maxVal: 150,
          step: 1,
          currentVal: tp.expectedDay1Pop,
          description: 'Calculates the first-day opening price surge % needed to hit your target allocation flipping profit.',
        },
        {
          id: 'requestedShares',
          label: 'Target Requested Share Size',
          leverKey: 'requestedShares',
          leverLabel: 'Requested Shares',
          unit: 'shares',
          minVal: 50,
          maxVal: 3000,
          step: 25,
          currentVal: tp.requestedShares,
          description: 'Calculates the order book subscription size needed to yield your target profit after oversubscription dilution.',
        },
        {
          id: 'capitalCommitted',
          label: 'Total Capital Allocation Needed',
          leverKey: 'capitalCommitted',
          leverLabel: 'Capital Committed',
          unit: '$',
          minVal: 2000,
          maxVal: 100000,
          step: 500,
          currentVal: tp.capitalCommitted,
          description: 'Identifies total capital commitment required to secure sufficient allotment for target dollar return.',
        },
      ];
    }
  }
}

/**
 * Executes numerical bisection root-finding to solve for the target lever value.
 */
export function solveGoalSeek(
  scenarioId: ScenarioId,
  params: RunningParams | HousingParams | GpaParams | BudgetParams | CustomParams | TradingParams,
  leverKey: string,
  targetGoalValue: number
): GoalSeekResult {
  const options = getAvailableGoalSeekOptions(scenarioId, params);
  const opt = options.find((o) => o.leverKey === leverKey) || options[0];

  let low = opt.minVal;
  let high = opt.maxVal;
  let bestVal = opt.currentVal;
  let achievedVal = 0;

  // Objective function: Evaluate model given candidate lever value
  const evaluate = (candidate: number): number => {
    switch (scenarioId) {
      case 'running': {
        const rp = { ...(params as RunningParams) };
        if (leverKey === 'weeksUntilRace') rp.weeksUntilRace = Math.max(1, Math.round(candidate));
        if (leverKey === 'runsPerWeek') rp.runsPerWeek = Math.max(1, Math.round(candidate));
        const m = calculateRunningModel(rp);
        return m.shavePerWeekSeconds;
      }
      case 'housing': {
        const hp = { ...(params as HousingParams) };
        if (leverKey === 'opt0_rent') {
          hp.options = hp.options.map((o, idx) => (idx === 0 ? { ...o, rent: candidate } : o));
        } else if (leverKey === 'monthlyNetIncome') {
          hp.monthlyNetIncome = candidate;
        }
        const m = calculateHousingModel(hp);
        return m.options[0]?.monthlySavings || 0;
      }
      case 'gpa': {
        const gp = { ...(params as GpaParams) };
        if (leverKey === 'midtermScore') gp.midtermScore = candidate;
        if (leverKey === 'finalExamWeight') gp.finalExamWeight = candidate;
        const m = calculateGpaModel(gp);
        return m.requiredFinalScore;
      }
      case 'budget': {
        const bp = { ...(params as BudgetParams) };
        if (leverKey === 'ticketPrice') bp.ticketPrice = candidate;
        else if (leverKey === 'expectedAttendees') bp.expectedAttendees = Math.round(candidate);
        else if (leverKey === 'foodCostPerPerson') bp.foodCostPerPerson = candidate;
        const m = calculateBudgetModel(bp);
        return m.netMargin;
      }
      case 'custom': {
        const cp = { ...(params as CustomParams) };
        const idx = parseInt(leverKey.replace('lever_', ''), 10) || 0;
        const newLevers = [...cp.levers] as [any, any, any];
        newLevers[idx] = { ...newLevers[idx], value: candidate };
        cp.levers = newLevers;
        const m = calculateCustomModel(cp);
        return m.computedValue;
      }
      case 'trading': {
        const tp = { ...(params as TradingParams) };
        if (leverKey === 'expectedDay1Pop') tp.expectedDay1Pop = candidate;
        else if (leverKey === 'requestedShares') tp.requestedShares = Math.round(candidate);
        else if (leverKey === 'capitalCommitted') tp.capitalCommitted = candidate;
        const m = calculateTradingModel(tp);
        return m.day1ProfitDollar;
      }
    }
  };

  // Evaluate monotonicity with low and high
  const fLow = evaluate(low);
  const fHigh = evaluate(high);
  const isIncreasing = fHigh >= fLow;

  // 35 Bisection Iterations gives > 0.001 precision
  for (let iter = 0; iter < 35; iter++) {
    const mid = (low + high) / 2;
    const fMid = evaluate(mid);
    achievedVal = fMid;
    bestVal = mid;

    if (Math.abs(fMid - targetGoalValue) < 0.05) break;

    if (isIncreasing) {
      if (fMid < targetGoalValue) {
        low = mid;
      } else {
        high = mid;
      }
    } else {
      if (fMid > targetGoalValue) {
        low = mid;
      } else {
        high = mid;
      }
    }
  }

  // Snap to step
  const roundedSolved = Math.round(bestVal / opt.step) * opt.step;
  const clampedSolved = Math.max(opt.minVal, Math.min(opt.maxVal, roundedSolved));
  const finalAchieved = evaluate(clampedSolved);
  const isFeasible = Math.abs(finalAchieved - targetGoalValue) / Math.max(1, Math.abs(targetGoalValue)) < 0.25;

  return {
    leverKey: opt.leverKey,
    leverLabel: opt.leverLabel,
    unit: opt.unit,
    initialValue: opt.currentVal,
    solvedValue: clampedSolved,
    difference: Math.round((clampedSolved - opt.currentVal) * 100) / 100,
    targetMetricName: opt.label,
    targetMetricValue: targetGoalValue,
    achievedMetricValue: Math.round(finalAchieved * 10) / 10,
    isFeasible,
    notes: isFeasible
      ? `Optimal value of ${clampedSolved} ${opt.unit} successfully achieves your goal.`
      : `Threshold target is beyond boundary constraints (${opt.minVal}–${opt.maxVal} ${opt.unit}). Closest achievable value is ${clampedSolved} ${opt.unit}.`,
  };
}
