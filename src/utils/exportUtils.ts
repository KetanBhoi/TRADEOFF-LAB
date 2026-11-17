/**
 * Export and serialization utilities for scenario configurations and computed results
 */

import {
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
  formatPace,
  formatTimeHoursMins,
} from './mathUtils';

export interface ScenarioExportPayload {
  app: string;
  version: string;
  scenarioId: string;
  scenarioTitle: string;
  exportedAt: string;
  inputs: Record<string, unknown>;
  computedResults: Record<string, unknown>;
  decisionSummary: string;
}

export function generateScenarioExport(
  scenarioId: string,
  params: unknown
): ScenarioExportPayload {
  const timestamp = new Date().toISOString();

  switch (scenarioId) {
    case 'running': {
      const p = params as RunningParams;
      const model = calculateRunningModel(p);
      return {
        app: 'TradeOff Lab Decision Visualizer',
        version: '1.0.0',
        scenarioId: 'running',
        scenarioTitle: 'Running Pace Training & Half-Marathon Adaptation',
        exportedAt: timestamp,
        inputs: {
          currentPace: `${p.currentPaceMinutes}:${p.currentPaceSeconds.toString().padStart(2, '0')} min/mile`,
          currentPaceSeconds: p.currentPaceMinutes * 60 + p.currentPaceSeconds,
          targetFinishTime: formatTimeHoursMins(p.targetTimeHours * 60 + p.targetTimeMinutes),
          targetPace: `${formatPace(model.targetPaceSeconds)} min/mile`,
          targetDistanceMiles: p.targetDistanceMiles,
          weeksUntilRace: p.weeksUntilRace,
          runsPerWeek: p.runsPerWeek,
          hasSpeedWork: p.hasSpeedWork,
          restDaysBetweenRuns: p.restDaysBetweenRuns,
        },
        computedResults: {
          weeklyPaceReductionRequiredSeconds: Math.round(model.shavePerWeekSeconds * 10) / 10,
          totalPaceDifferenceSeconds: Math.round(model.totalPaceDiffSeconds),
          feasibilityRating: model.feasibilityLabel,
          injuryRiskScorePercent: model.injuryRiskScore,
          milestones: model.weeklyMilestones.map((m) => ({
            week: m.week,
            pace: formatPace(m.projectedPaceSec),
            weeklyMiles: m.weeklyMiles,
          })),
          riegelEquivalents: model.riegelEquivalents,
        },
        decisionSummary: model.verdictTip,
      };
    }

    case 'housing': {
      const p = params as HousingParams;
      const model = calculateHousingModel(p);
      return {
        app: 'TradeOff Lab Decision Visualizer',
        version: '1.0.0',
        scenarioId: 'housing',
        scenarioTitle: 'Living Choices & 1-Year Financial Trajectory',
        exportedAt: timestamp,
        inputs: {
          monthlyNetIncome: p.monthlyNetIncome,
          hourlyTimeValuation: p.hourlyTimeValuation,
          discretionaryBuffer: p.discretionaryBuffer,
          options: p.options,
        },
        computedResults: {
          winner: model.bestOption.name,
          maxAnnualCashSavings: model.maxAnnualSavings,
          optionsBreakdown: model.options.map((o) => ({
            name: o.name,
            monthlySavings: o.monthlySavings,
            annualCashSavings: o.annualCashSavings,
            annualTimeAdjustedSavings: o.annualTimeAdjustedSavings,
            savingsRatePercent: o.savingsRatePercent,
            isWinner: o.isWinner,
          })),
        },
        decisionSummary: model.summaryVerdict,
      };
    }

    case 'gpa': {
      const p = params as GpaParams;
      const model = calculateGpaModel(p);
      return {
        app: 'TradeOff Lab Decision Visualizer',
        version: '1.0.0',
        scenarioId: 'gpa',
        scenarioTitle: 'Coursework & Cumulative GPA Optimizer',
        exportedAt: timestamp,
        inputs: {
          currentCumulativeGpa: p.currentCumulativeGpa,
          completedCreditHours: p.completedCreditHours,
          currentCourseCredits: p.currentCourseCredits,
          midtermScore: p.midtermScore,
          midtermWeight: p.midtermWeight,
          assignmentScore: p.assignmentScore,
          assignmentWeight: p.assignmentWeight,
          finalExamWeight: p.finalExamWeight,
          targetLetterGrade: p.targetLetterGrade,
        },
        computedResults: {
          requiredFinalExamScore: model.requiredFinalScore,
          feasibilityLabel: model.feasibilityLabel,
          projectedNewCumulativeGpa: model.projectedNewCumulativeGpa,
          cumulativeGpaDelta: model.gpaDelta,
          pointsAlreadySecured: model.currentSecuredPoints,
        },
        decisionSummary: model.breakdownSummary,
      };
    }

    case 'budget': {
      const p = params as BudgetParams;
      const model = calculateBudgetModel(p);
      return {
        app: 'TradeOff Lab Decision Visualizer',
        version: '1.0.0',
        scenarioId: 'budget',
        scenarioTitle: 'Campus Event & Club Budget Modeler',
        exportedAt: timestamp,
        inputs: {
          expectedAttendees: p.expectedAttendees,
          ticketPrice: p.ticketPrice,
          foodCostPerPerson: p.foodCostPerPerson,
          venueRentalCost: p.venueRentalCost,
          equipmentAVCost: p.equipmentAVCost,
          sponsorSubsidy: p.sponsorSubsidy,
          marketingBudget: p.marketingBudget,
        },
        computedResults: {
          totalRevenue: model.totalRevenue,
          totalExpenses: model.totalExpenses,
          netMargin: model.netMargin,
          isProfitable: model.isProfitable,
          breakEvenAttendees: model.breakEvenAttendees,
          unitContributionMargin: model.contributionMarginPerTicket,
        },
        decisionSummary: model.marginSummary,
      };
    }

    case 'custom': {
      const p = params as CustomParams;
      const model = calculateCustomModel(p);
      return {
        app: 'TradeOff Lab Decision Visualizer',
        version: '1.0.0',
        scenarioId: 'custom',
        scenarioTitle: p.title,
        exportedAt: timestamp,
        inputs: {
          goalMetricName: p.goalMetricName,
          goalMetricUnit: p.goalMetricUnit,
          targetValue: p.targetValue,
          formulaType: p.formulaType,
          levers: p.levers.map((l) => ({
            label: l.label,
            value: l.value,
            unit: l.unit,
          })),
        },
        computedResults: {
          computedValue: model.computedValue,
          deltaToTarget: model.deltaToTarget,
          percentageOfTarget: model.percentageOfTarget,
        },
        decisionSummary: `Operating at ${model.computedValue} ${p.goalMetricUnit} against target of ${p.targetValue} ${p.goalMetricUnit}.`,
      };
    }

    case 'trading': {
      const p = params as TradingParams;
      const model = calculateTradingModel(p);
      return {
        app: 'TradeOff Lab Decision Visualizer',
        version: '1.0.0',
        scenarioId: 'trading',
        scenarioTitle: `IPO Trading & Allocation Desk: ${p.companyName} ($${p.ticker})`,
        exportedAt: timestamp,
        inputs: {
          ticker: p.ticker,
          companyName: p.companyName,
          offerPrice: `$${p.offerPrice.toFixed(2)}`,
          requestedShares: p.requestedShares,
          expectedDay1Pop: `${p.expectedDay1Pop}%`,
          oversubscriptionRatio: `${p.oversubscriptionRatio}x`,
          lockupPeriodDays: `${p.lockupPeriodDays} days`,
          postLockupDiscount: `${p.postLockupDiscount}%`,
          capitalCommitted: `$${p.capitalCommitted.toLocaleString()}`,
          stopLossPercent: `${p.stopLossPercent}%`,
        },
        computedResults: {
          actualAllocatedShares: model.actualAllocatedShares,
          fillRatePercent: `${model.fillRatePercent}%`,
          capitalEmployed: `$${model.capitalEmployed.toLocaleString()}`,
          unfilledCapitalReturned: `$${model.unfilledCapitalReturned.toLocaleString()}`,
          day1ListingPrice: `$${model.day1ListingPrice.toFixed(2)}`,
          day1ProfitDollar: `$${model.day1ProfitDollar.toLocaleString()}`,
          day1ReturnPercent: `+${model.day1ReturnPercent}%`,
          postLockupEstimatedPrice: `$${model.postLockupEstimatedPrice.toFixed(2)}`,
          postLockupProfitDollar: `$${model.postLockupProfitDollar.toLocaleString()}`,
          postLockupReturnPercent: `${model.postLockupReturnPercent}%`,
          riskRewardRatio: `${model.riskRewardRatio}:1`,
          maxRiskDollar: `$${model.maxRiskDollar.toLocaleString()}`,
          verdictRating: model.verdictLabel,
        },
        decisionSummary: model.verdictSummary,
      };
    }

    default:
      throw new Error(`Unknown scenario: ${scenarioId}`);
  }
}

export function downloadJsonFile(data: ScenarioExportPayload, filename: string): void {
  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function generateScenarioCsv(payload: ScenarioExportPayload): string {
  const rows: string[][] = [
    ['TradeOff Lab - Scenario Export Data'],
    ['Scenario Title', `"${payload.scenarioTitle.replace(/"/g, '""')}"`],
    ['Scenario ID', payload.scenarioId],
    ['Export Timestamp', payload.exportedAt],
    [''],
    ['DECISION VERDICT & SUMMARY'],
    ['Verdict', `"${payload.decisionSummary.replace(/"/g, '""')}"`],
    [''],
    ['SECTION', 'PARAMETER', 'VALUE'],
  ];

  // Inputs
  for (const [key, val] of Object.entries(payload.inputs)) {
    const formatted = typeof val === 'object' ? JSON.stringify(val) : String(val);
    rows.push(['INPUT_LEVER', key, `"${formatted.replace(/"/g, '""')}"`]);
  }

  // Computed results
  for (const [key, val] of Object.entries(payload.computedResults)) {
    if (key === 'milestones' || key === 'riegelEquivalents' || key === 'optionsBreakdown') {
      continue;
    }
    const formatted = typeof val === 'object' ? JSON.stringify(val) : String(val);
    rows.push(['COMPUTED_METRIC', key, `"${formatted.replace(/"/g, '""')}"`]);
  }

  // Milestones (Running scenario)
  if (Array.isArray((payload.computedResults as any).milestones)) {
    rows.push(['']);
    rows.push(['MILESTONE_WEEK', 'PACE_MIN_PER_MILE', 'WEEKLY_MILEAGE']);
    for (const m of (payload.computedResults as any).milestones) {
      rows.push([`Week ${m.week}`, `"${m.pace}"`, String(m.weeklyMiles)]);
    }
  }

  // Options breakdown (Housing scenario)
  if (Array.isArray((payload.computedResults as any).optionsBreakdown)) {
    rows.push(['']);
    rows.push(['OPTION_NAME', 'MONTHLY_SAVINGS', 'ANNUAL_CASH_SAVINGS', 'SAVINGS_RATE', 'WINNER']);
    for (const opt of (payload.computedResults as any).optionsBreakdown) {
      rows.push([
        `"${opt.name.replace(/"/g, '""')}"`,
        `$${opt.monthlySavings}`,
        `$${opt.annualCashSavings}`,
        `${opt.savingsRatePercent}%`,
        opt.isWinner ? 'BEST_OPTION' : 'ALTERNATIVE',
      ]);
    }
  }

  return rows.map((r) => r.join(',')).join('\n');
}

export function downloadCsvFile(csvContent: string, filename: string): void {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
