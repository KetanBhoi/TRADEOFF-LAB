/**
 * Sensitivity Analysis & Tornado Diagram Engine for TradeOff Lab
 * Computes single-variable perturbations (+/- 15% and +/- 30%) to calculate
 * outcome elasticity, lever swing magnitude, and rank dominant control levers.
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

export interface TornadoLeverImpact {
  id: string;
  label: string;
  unit: string;
  baseInput: number;
  lowInput: number;
  highInput: number;
  baseOutcome: number;
  lowOutcome: number;
  highOutcome: number;
  outcomeSwing: number; // |highOutcome - lowOutcome|
  elasticity: number; // percentage change in outcome / percentage change in input
  sensitivityRating: 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW';
  recommendation: string;
}

export interface TornadoAnalysisResult {
  scenarioId: ScenarioId;
  metricName: string;
  metricUnit: string;
  baselineValue: number;
  dominantLever: string;
  levers: TornadoLeverImpact[];
}

export function computeTornadoAnalysis(
  scenarioId: ScenarioId,
  params: RunningParams | HousingParams | GpaParams | BudgetParams | CustomParams | TradingParams
): TornadoAnalysisResult {
  switch (scenarioId) {
    case 'running': {
      const p = params as RunningParams;
      const baseModel = calculateRunningModel(p);
      const metricName = 'Required Pace Shave';
      const metricUnit = 'sec/wk';
      const baselineValue = baseModel.shavePerWeekSeconds;

      const testLevers = [
        {
          id: 'weeksUntilRace',
          label: 'Weeks Until Race',
          unit: 'wks',
          base: p.weeksUntilRace,
          low: Math.max(2, Math.round(p.weeksUntilRace * 0.7)),
          high: Math.min(24, Math.round(p.weeksUntilRace * 1.3)),
          evaluator: (v: number) => calculateRunningModel({ ...p, weeksUntilRace: v }).shavePerWeekSeconds,
        },
        {
          id: 'runsPerWeek',
          label: 'Runs Per Week',
          unit: 'runs/wk',
          base: p.runsPerWeek,
          low: Math.max(1, Math.round(p.runsPerWeek * 0.7)),
          high: Math.min(7, Math.round(p.runsPerWeek * 1.3)),
          evaluator: (v: number) => calculateRunningModel({ ...p, runsPerWeek: v }).shavePerWeekSeconds,
        },
        {
          id: 'restDaysBetweenRuns',
          label: 'Rest Days Between Runs',
          unit: 'days',
          base: p.restDaysBetweenRuns,
          low: Math.max(0, p.restDaysBetweenRuns - 1),
          high: Math.min(4, p.restDaysBetweenRuns + 1),
          evaluator: (v: number) => calculateRunningModel({ ...p, restDaysBetweenRuns: v }).shavePerWeekSeconds,
        },
        {
          id: 'targetTimeHours',
          label: 'Target Race Time',
          unit: 'hrs',
          base: p.targetTimeHours * 60 + p.targetTimeMinutes,
          low: Math.max(60, (p.targetTimeHours * 60 + p.targetTimeMinutes) * 0.9),
          high: (p.targetTimeHours * 60 + p.targetTimeMinutes) * 1.1,
          evaluator: (totalMins: number) => {
            const h = Math.floor(totalMins / 60);
            const m = Math.round(totalMins % 60);
            return calculateRunningModel({ ...p, targetTimeHours: h, targetTimeMinutes: m }).shavePerWeekSeconds;
          },
        },
      ];

      return processLevers(scenarioId, metricName, metricUnit, baselineValue, testLevers);
    }

    case 'housing': {
      const p = params as HousingParams;
      const baseModel = calculateHousingModel(p);
      const metricName = 'Primary Option Net Monthly Savings';
      const metricUnit = '$/mo';
      const baselineValue = baseModel.options[0]?.monthlySavings ?? 0;

      const opt = p.options[0];
      const testLevers = [
        {
          id: 'rent',
          label: 'Monthly Rent',
          unit: '$/mo',
          base: opt.rent,
          low: Math.round(opt.rent * 0.8),
          high: Math.round(opt.rent * 1.2),
          evaluator: (v: number) => {
            const newOpts = [...p.options];
            newOpts[0] = { ...opt, rent: v };
            return calculateHousingModel({ ...p, options: newOpts }).options[0].monthlySavings;
          },
        },
        {
          id: 'commuteOneWayMinutes',
          label: 'Commute Time',
          unit: 'mins',
          base: opt.commuteOneWayMinutes,
          low: Math.round(opt.commuteOneWayMinutes * 0.7),
          high: Math.round(opt.commuteOneWayMinutes * 1.3),
          evaluator: (v: number) => {
            const newOpts = [...p.options];
            newOpts[0] = { ...opt, commuteOneWayMinutes: v };
            return calculateHousingModel({ ...p, options: newOpts }).options[0].monthlySavings;
          },
        },
        {
          id: 'monthlyNetIncome',
          label: 'Monthly Net Income',
          unit: '$/mo',
          base: p.monthlyNetIncome,
          low: Math.round(p.monthlyNetIncome * 0.85),
          high: Math.round(p.monthlyNetIncome * 1.15),
          evaluator: (v: number) => calculateHousingModel({ ...p, monthlyNetIncome: v }).options[0].monthlySavings,
        },
        {
          id: 'roommateSplit',
          label: 'Roommate Cost Split',
          unit: 'ppl',
          base: opt.roommateSplit,
          low: Math.max(1, opt.roommateSplit - 1),
          high: opt.roommateSplit + 1,
          evaluator: (v: number) => {
            const newOpts = [...p.options];
            newOpts[0] = { ...opt, roommateSplit: v };
            return calculateHousingModel({ ...p, options: newOpts }).options[0].monthlySavings;
          },
        },
      ];

      return processLevers(scenarioId, metricName, metricUnit, baselineValue, testLevers);
    }

    case 'gpa': {
      const p = params as GpaParams;
      const baseModel = calculateGpaModel(p);
      const metricName = 'Required Final Exam Score';
      const metricUnit = '%';
      const baselineValue = baseModel.requiredFinalScore;

      const testLevers = [
        {
          id: 'midtermScore',
          label: 'Midterm Score',
          unit: '%',
          base: p.midtermScore,
          low: Math.max(40, Math.round(p.midtermScore * 0.8)),
          high: Math.min(100, Math.round(p.midtermScore * 1.15)),
          evaluator: (v: number) => calculateGpaModel({ ...p, midtermScore: v }).requiredFinalScore,
        },
        {
          id: 'assignmentScore',
          label: 'Assignment Score',
          unit: '%',
          base: p.assignmentScore,
          low: Math.max(40, Math.round(p.assignmentScore * 0.8)),
          high: Math.min(100, Math.round(p.assignmentScore * 1.1)),
          evaluator: (v: number) => calculateGpaModel({ ...p, assignmentScore: v }).requiredFinalScore,
        },
        {
          id: 'midtermWeight',
          label: 'Midterm Weight',
          unit: '%',
          base: p.midtermWeight,
          low: Math.max(10, p.midtermWeight - 10),
          high: Math.min(45, p.midtermWeight + 10),
          evaluator: (v: number) => calculateGpaModel({ ...p, midtermWeight: v }).requiredFinalScore,
        },
        {
          id: 'finalExamWeight',
          label: 'Final Exam Weight',
          unit: '%',
          base: p.finalExamWeight,
          low: Math.max(20, p.finalExamWeight - 10),
          high: Math.min(60, p.finalExamWeight + 10),
          evaluator: (v: number) => calculateGpaModel({ ...p, finalExamWeight: v }).requiredFinalScore,
        },
      ];

      return processLevers(scenarioId, metricName, metricUnit, baselineValue, testLevers);
    }

    case 'budget': {
      const p = params as BudgetParams;
      const baseModel = calculateBudgetModel(p);
      const metricName = 'Net Event Profit / Margin';
      const metricUnit = '$';
      const baselineValue = baseModel.netMargin;

      const testLevers = [
        {
          id: 'ticketPrice',
          label: 'Ticket Price',
          unit: '$/ticket',
          base: p.ticketPrice,
          low: Math.max(5, Math.round(p.ticketPrice * 0.7)),
          high: Math.round(p.ticketPrice * 1.3),
          evaluator: (v: number) => calculateBudgetModel({ ...p, ticketPrice: v }).netMargin,
        },
        {
          id: 'expectedAttendees',
          label: 'Expected Attendees',
          unit: 'guests',
          base: p.expectedAttendees,
          low: Math.round(p.expectedAttendees * 0.7),
          high: Math.round(p.expectedAttendees * 1.3),
          evaluator: (v: number) => calculateBudgetModel({ ...p, expectedAttendees: v }).netMargin,
        },
        {
          id: 'foodCostPerPerson',
          label: 'Catering Cost / Person',
          unit: '$/person',
          base: p.foodCostPerPerson,
          low: Math.max(2, Math.round(p.foodCostPerPerson * 0.7)),
          high: Math.round(p.foodCostPerPerson * 1.3),
          evaluator: (v: number) => calculateBudgetModel({ ...p, foodCostPerPerson: v }).netMargin,
        },
        {
          id: 'venueRentalCost',
          label: 'Venue Rental Fee',
          unit: '$',
          base: p.venueRentalCost,
          low: Math.round(p.venueRentalCost * 0.7),
          high: Math.round(p.venueRentalCost * 1.3),
          evaluator: (v: number) => calculateBudgetModel({ ...p, venueRentalCost: v }).netMargin,
        },
        {
          id: 'sponsorSubsidy',
          label: 'Sponsorship Grant',
          unit: '$',
          base: p.sponsorSubsidy,
          low: Math.round(p.sponsorSubsidy * 0.5),
          high: Math.round(p.sponsorSubsidy * 1.5),
          evaluator: (v: number) => calculateBudgetModel({ ...p, sponsorSubsidy: v }).netMargin,
        },
      ];

      return processLevers(scenarioId, metricName, metricUnit, baselineValue, testLevers);
    }

    case 'custom': {
      const p = params as CustomParams;
      const baseModel = calculateCustomModel(p);
      const metricName = p.goalMetricName;
      const metricUnit = p.goalMetricUnit;
      const baselineValue = baseModel.computedValue;

      const testLevers = p.levers.map((lever, idx) => ({
        id: `lever_${idx}`,
        label: lever.label,
        unit: lever.unit,
        base: lever.value,
        low: Math.max(lever.min, lever.value - (lever.max - lever.min) * 0.25),
        high: Math.min(lever.max, lever.value + (lever.max - lever.min) * 0.25),
        evaluator: (v: number) => {
          const nextLevers = [...p.levers] as [any, any, any];
          nextLevers[idx] = { ...lever, value: v };
          return calculateCustomModel({ ...p, levers: nextLevers }).computedValue;
        },
      }));

      return processLevers(scenarioId, metricName, metricUnit, baselineValue, testLevers);
    }

    case 'trading': {
      const p = params as TradingParams;
      const baseModel = calculateTradingModel(p);
      const metricName = 'Day 1 Allocation Flipping Profit';
      const metricUnit = '$';
      const baselineValue = baseModel.day1ProfitDollar;

      const testLevers = [
        {
          id: 'expectedDay1Pop',
          label: 'Expected Day 1 Pop',
          unit: '%',
          base: p.expectedDay1Pop,
          low: Math.max(5, Math.round(p.expectedDay1Pop * 0.6)),
          high: Math.round(p.expectedDay1Pop * 1.4),
          evaluator: (v: number) => calculateTradingModel({ ...p, expectedDay1Pop: v }).day1ProfitDollar,
        },
        {
          id: 'oversubscriptionRatio',
          label: 'Book Oversubscription',
          unit: 'x',
          base: p.oversubscriptionRatio,
          low: Math.max(1, Math.round(p.oversubscriptionRatio * 0.5)),
          high: Math.round(p.oversubscriptionRatio * 1.5),
          evaluator: (v: number) => calculateTradingModel({ ...p, oversubscriptionRatio: v }).day1ProfitDollar,
        },
        {
          id: 'offerPrice',
          label: 'IPO Offer Price',
          unit: '$/sh',
          base: p.offerPrice,
          low: Math.max(5, Math.round(p.offerPrice * 0.8)),
          high: Math.round(p.offerPrice * 1.2),
          evaluator: (v: number) => calculateTradingModel({ ...p, offerPrice: v }).day1ProfitDollar,
        },
        {
          id: 'requestedShares',
          label: 'Requested Shares',
          unit: 'shares',
          base: p.requestedShares,
          low: Math.max(50, Math.round(p.requestedShares * 0.6)),
          high: Math.round(p.requestedShares * 1.4),
          evaluator: (v: number) => calculateTradingModel({ ...p, requestedShares: v }).day1ProfitDollar,
        },
        {
          id: 'capitalCommitted',
          label: 'Capital Committed',
          unit: '$',
          base: p.capitalCommitted,
          low: Math.max(2000, Math.round(p.capitalCommitted * 0.7)),
          high: Math.round(p.capitalCommitted * 1.3),
          evaluator: (v: number) => calculateTradingModel({ ...p, capitalCommitted: v }).day1ProfitDollar,
        },
      ];

      return processLevers(scenarioId, metricName, metricUnit, baselineValue, testLevers);
    }
  }
}

function processLevers(
  scenarioId: ScenarioId,
  metricName: string,
  metricUnit: string,
  baselineValue: number,
  testLevers: Array<{
    id: string;
    label: string;
    unit: string;
    base: number;
    low: number;
    high: number;
    evaluator: (v: number) => number;
  }>
): TornadoAnalysisResult {
  const impacts: TornadoLeverImpact[] = testLevers.map((item) => {
    const lowOutcome = item.evaluator(item.low);
    const highOutcome = item.evaluator(item.high);
    const outcomeSwing = Math.abs(highOutcome - lowOutcome);

    const inputDeltaPct = Math.abs((item.high - item.low) / (item.base || 1));
    const outcomeDeltaPct = Math.abs(outcomeSwing / (baselineValue || 1));
    const elasticity = inputDeltaPct > 0 ? outcomeDeltaPct / inputDeltaPct : 0;

    let sensitivityRating: TornadoLeverImpact['sensitivityRating'] = 'LOW';
    if (elasticity > 1.2) sensitivityRating = 'CRITICAL';
    else if (elasticity > 0.7) sensitivityRating = 'HIGH';
    else if (elasticity > 0.3) sensitivityRating = 'MODERATE';

    let recommendation = '';
    if (sensitivityRating === 'CRITICAL' || sensitivityRating === 'HIGH') {
      recommendation = `High leverage lever: small changes in ${item.label} create outsized impact on ${metricName}. Focus optimization here.`;
    } else if (sensitivityRating === 'MODERATE') {
      recommendation = `Moderate sensitivity: useful secondary adjustment lever.`;
    } else {
      recommendation = `Low elasticity: changes in ${item.label} have relatively muted effect on ${metricName}.`;
    }

    return {
      id: item.id,
      label: item.label,
      unit: item.unit,
      baseInput: Math.round(item.base * 100) / 100,
      lowInput: Math.round(item.low * 100) / 100,
      highInput: Math.round(item.high * 100) / 100,
      baseOutcome: Math.round(baselineValue * 100) / 100,
      lowOutcome: Math.round(lowOutcome * 100) / 100,
      highOutcome: Math.round(highOutcome * 100) / 100,
      outcomeSwing: Math.round(outcomeSwing * 100) / 100,
      elasticity: Math.round(elasticity * 100) / 100,
      sensitivityRating,
      recommendation,
    };
  });

  // Sort descending by outcome swing (Tornado layout)
  impacts.sort((a, b) => b.outcomeSwing - a.outcomeSwing);

  const dominantLever = impacts[0]?.label ?? 'None';

  return {
    scenarioId,
    metricName,
    metricUnit,
    baselineValue: Math.round(baselineValue * 100) / 100,
    dominantLever,
    levers: impacts,
  };
}
