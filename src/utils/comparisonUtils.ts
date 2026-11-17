import {
  ScenarioId,
  AnyScenarioParams,
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

export interface DeltaItem {
  id: string;
  label: string;
  unit?: string;
  valA: number | string | boolean;
  valB: number | string | boolean;
  valADisplay: string;
  valBDisplay: string;
  isDifferent: boolean;
  numericDelta?: number;
  pctDelta?: number;
  direction?: 'higher' | 'lower' | 'equal' | 'changed';
  sentiment?: 'positive' | 'negative' | 'neutral'; // Whether higher/lower is generally favorable or cautionary
}

export interface MetricOutcomeComparison {
  id: string;
  label: string;
  valADisplay: string;
  valBDisplay: string;
  numericDelta?: number;
  pctDelta?: number;
  unit?: string;
  direction?: 'higher' | 'lower' | 'equal';
  sentiment?: 'positive' | 'negative' | 'neutral';
  note?: string;
}

export interface ScenarioComparisonResult {
  scenarioId: ScenarioId;
  scenarioTitle: string;
  parameterDeltas: DeltaItem[];
  outcomeDeltas: MetricOutcomeComparison[];
  summaryNote: string;
}

export function compareSnapshots(
  scenarioId: ScenarioId,
  paramsA: AnyScenarioParams,
  paramsB: AnyScenarioParams
): ScenarioComparisonResult {
  switch (scenarioId) {
    case 'running':
      return compareRunning(paramsA as RunningParams, paramsB as RunningParams);
    case 'housing':
      return compareHousing(paramsA as HousingParams, paramsB as HousingParams);
    case 'gpa':
      return compareGpa(paramsA as GpaParams, paramsB as GpaParams);
    case 'budget':
      return compareBudget(paramsA as BudgetParams, paramsB as BudgetParams);
    case 'custom':
      return compareCustom(paramsA as CustomParams, paramsB as CustomParams);
    case 'trading':
      return compareTrading(paramsA as TradingParams, paramsB as TradingParams);
    default:
      return {
        scenarioId,
        scenarioTitle: 'Scenario Comparison',
        parameterDeltas: [],
        outcomeDeltas: [],
        summaryNote: 'Snapshots loaded for comparison.',
      };
  }
}

function compareRunning(a: RunningParams, b: RunningParams): ScenarioComparisonResult {
  const modelA = calculateRunningModel(a);
  const modelB = calculateRunningModel(b);

  const curSecA = a.currentPaceMinutes * 60 + a.currentPaceSeconds;
  const curSecB = b.currentPaceMinutes * 60 + b.currentPaceSeconds;

  const targetMinA = a.targetTimeHours * 60 + a.targetTimeMinutes;
  const targetMinB = b.targetTimeHours * 60 + b.targetTimeMinutes;

  const parameterDeltas: DeltaItem[] = [
    {
      id: 'current_pace',
      label: 'Current Pace',
      valA: curSecA,
      valB: curSecB,
      valADisplay: `${a.currentPaceMinutes}:${a.currentPaceSeconds.toString().padStart(2, '0')}/mi`,
      valBDisplay: `${b.currentPaceMinutes}:${b.currentPaceSeconds.toString().padStart(2, '0')}/mi`,
      isDifferent: curSecA !== curSecB,
      numericDelta: curSecB - curSecA,
      direction: curSecB > curSecA ? 'higher' : curSecB < curSecA ? 'lower' : 'equal',
      sentiment: curSecB < curSecA ? 'positive' : curSecB > curSecA ? 'neutral' : 'neutral',
    },
    {
      id: 'target_time',
      label: 'Target Race Time',
      valA: targetMinA,
      valB: targetMinB,
      valADisplay: formatTimeHoursMins(targetMinA),
      valBDisplay: formatTimeHoursMins(targetMinB),
      isDifferent: targetMinA !== targetMinB,
      numericDelta: targetMinB - targetMinA,
      direction: targetMinB > targetMinA ? 'higher' : targetMinB < targetMinA ? 'lower' : 'equal',
      sentiment: targetMinB < targetMinA ? 'positive' : 'neutral',
    },
    {
      id: 'weeks',
      label: 'Weeks Until Race',
      unit: 'wks',
      valA: a.weeksUntilRace,
      valB: b.weeksUntilRace,
      valADisplay: `${a.weeksUntilRace} wks`,
      valBDisplay: `${b.weeksUntilRace} wks`,
      isDifferent: a.weeksUntilRace !== b.weeksUntilRace,
      numericDelta: b.weeksUntilRace - a.weeksUntilRace,
      direction: b.weeksUntilRace > a.weeksUntilRace ? 'higher' : b.weeksUntilRace < a.weeksUntilRace ? 'lower' : 'equal',
      sentiment: b.weeksUntilRace > a.weeksUntilRace ? 'positive' : 'neutral',
    },
    {
      id: 'frequency',
      label: 'Runs Per Week',
      unit: 'runs/wk',
      valA: a.runsPerWeek,
      valB: b.runsPerWeek,
      valADisplay: `${a.runsPerWeek} runs/wk`,
      valBDisplay: `${b.runsPerWeek} runs/wk`,
      isDifferent: a.runsPerWeek !== b.runsPerWeek,
      numericDelta: b.runsPerWeek - a.runsPerWeek,
      direction: b.runsPerWeek > a.runsPerWeek ? 'higher' : b.runsPerWeek < a.runsPerWeek ? 'lower' : 'equal',
      sentiment: 'neutral',
    },
    {
      id: 'rest_days',
      label: 'Rest Days Gap',
      unit: 'days',
      valA: a.restDaysBetweenRuns,
      valB: b.restDaysBetweenRuns,
      valADisplay: `${a.restDaysBetweenRuns} days`,
      valBDisplay: `${b.restDaysBetweenRuns} days`,
      isDifferent: a.restDaysBetweenRuns !== b.restDaysBetweenRuns,
      numericDelta: b.restDaysBetweenRuns - a.restDaysBetweenRuns,
      direction: b.restDaysBetweenRuns > a.restDaysBetweenRuns ? 'higher' : b.restDaysBetweenRuns < a.restDaysBetweenRuns ? 'lower' : 'equal',
      sentiment: b.restDaysBetweenRuns >= a.restDaysBetweenRuns ? 'positive' : 'negative',
    },
    {
      id: 'speed_work',
      label: 'Structured Speedwork',
      valA: a.hasSpeedWork,
      valB: b.hasSpeedWork,
      valADisplay: a.hasSpeedWork ? 'Included' : 'None',
      valBDisplay: b.hasSpeedWork ? 'Included' : 'None',
      isDifferent: a.hasSpeedWork !== b.hasSpeedWork,
      direction: a.hasSpeedWork !== b.hasSpeedWork ? 'changed' : 'equal',
      sentiment: 'neutral',
    },
  ];

  const shaveDelta = modelB.shavePerWeekSeconds - modelA.shavePerWeekSeconds;
  const targetPaceDelta = modelB.targetPaceSeconds - modelA.targetPaceSeconds;
  const riskDelta = modelB.injuryRiskScore - modelA.injuryRiskScore;

  const outcomeDeltas: MetricOutcomeComparison[] = [
    {
      id: 'shave_per_week',
      label: 'Required Weekly Shave',
      valADisplay: `${modelA.shavePerWeekSeconds.toFixed(1)} s/wk`,
      valBDisplay: `${modelB.shavePerWeekSeconds.toFixed(1)} s/wk`,
      numericDelta: shaveDelta,
      unit: 's/wk',
      direction: shaveDelta > 0 ? 'higher' : shaveDelta < 0 ? 'lower' : 'equal',
      sentiment: shaveDelta < 0 ? 'positive' : shaveDelta > 0 ? 'negative' : 'neutral',
      note: shaveDelta < 0 ? 'Snapshot B requires less aggressive pace cuts per week' : shaveDelta > 0 ? 'Snapshot B demands steeper weekly training gains' : 'Pace demands match',
    },
    {
      id: 'target_pace',
      label: 'Calculated Race Pace Goal',
      valADisplay: `${formatPace(modelA.targetPaceSeconds)}/mi`,
      valBDisplay: `${formatPace(modelB.targetPaceSeconds)}/mi`,
      numericDelta: targetPaceDelta,
      unit: 'sec',
      direction: targetPaceDelta > 0 ? 'higher' : targetPaceDelta < 0 ? 'lower' : 'equal',
      sentiment: 'neutral',
      note: `Delta: ${(Math.abs(targetPaceDelta)).toFixed(1)}s difference`,
    },
    {
      id: 'injury_risk',
      label: 'Physiological Injury Risk Index',
      valADisplay: `${modelA.injuryRiskScore}/100`,
      valBDisplay: `${modelB.injuryRiskScore}/100`,
      numericDelta: riskDelta,
      unit: 'pts',
      direction: riskDelta > 0 ? 'higher' : riskDelta < 0 ? 'lower' : 'equal',
      sentiment: riskDelta < 0 ? 'positive' : riskDelta > 0 ? 'negative' : 'neutral',
      note: `${modelB.feasibilityLabel}`,
    },
    {
      id: 'feasibility',
      label: 'Feasibility Tier',
      valADisplay: modelA.feasibilityLabel,
      valBDisplay: modelB.feasibilityLabel,
      direction: modelA.feasibilityLevel !== modelB.feasibilityLevel ? 'higher' : 'equal',
      sentiment: modelB.feasibilityLevel === 'optimal' ? 'positive' : modelB.feasibilityLevel === 'unrealistic' ? 'negative' : 'neutral',
      note: modelA.feasibilityLevel !== modelB.feasibilityLevel ? `Shifted from ${modelA.feasibilityLevel} to ${modelB.feasibilityLevel}` : 'Identical safety classification',
    },
  ];

  let summaryNote = '';
  if (shaveDelta < 0) {
    summaryNote = `Snapshot B eases weekly pace reduction by ${Math.abs(shaveDelta).toFixed(1)}s/wk, lowering injury risk by ${Math.abs(riskDelta)} pts.`;
  } else if (shaveDelta > 0) {
    summaryNote = `Snapshot B tightens training demands by +${shaveDelta.toFixed(1)}s/wk, increasing risk rating by +${riskDelta} pts.`;
  } else {
    summaryNote = 'Both snapshots yield identical weekly pace progression curves.';
  }

  return {
    scenarioId: 'running',
    scenarioTitle: 'Running Pace Training',
    parameterDeltas,
    outcomeDeltas,
    summaryNote,
  };
}

function compareHousing(a: HousingParams, b: HousingParams): ScenarioComparisonResult {
  const modelA = calculateHousingModel(a);
  const modelB = calculateHousingModel(b);

  const incomeDelta = b.monthlyNetIncome - a.monthlyNetIncome;
  const valuationDelta = b.hourlyTimeValuation - a.hourlyTimeValuation;
  const bufferDelta = b.discretionaryBuffer - a.discretionaryBuffer;

  const parameterDeltas: DeltaItem[] = [
    {
      id: 'income',
      label: 'Monthly Net Take-Home',
      valA: a.monthlyNetIncome,
      valB: b.monthlyNetIncome,
      valADisplay: `$${a.monthlyNetIncome.toLocaleString()}/mo`,
      valBDisplay: `$${b.monthlyNetIncome.toLocaleString()}/mo`,
      isDifferent: incomeDelta !== 0,
      numericDelta: incomeDelta,
      direction: incomeDelta > 0 ? 'higher' : incomeDelta < 0 ? 'lower' : 'equal',
      sentiment: incomeDelta > 0 ? 'positive' : incomeDelta < 0 ? 'negative' : 'neutral',
    },
    {
      id: 'time_val',
      label: 'Hourly Commute Valuation',
      valA: a.hourlyTimeValuation,
      valB: b.hourlyTimeValuation,
      valADisplay: `$${a.hourlyTimeValuation}/hr`,
      valBDisplay: `$${b.hourlyTimeValuation}/hr`,
      isDifferent: valuationDelta !== 0,
      numericDelta: valuationDelta,
      direction: valuationDelta > 0 ? 'higher' : valuationDelta < 0 ? 'lower' : 'equal',
      sentiment: 'neutral',
    },
    {
      id: 'buffer',
      label: 'Monthly Discretionary Buffer',
      valA: a.discretionaryBuffer,
      valB: b.discretionaryBuffer,
      valADisplay: `$${a.discretionaryBuffer.toLocaleString()}/mo`,
      valBDisplay: `$${b.discretionaryBuffer.toLocaleString()}/mo`,
      isDifferent: bufferDelta !== 0,
      numericDelta: bufferDelta,
      direction: bufferDelta > 0 ? 'higher' : bufferDelta < 0 ? 'lower' : 'equal',
      sentiment: 'neutral',
    },
  ];

  // Compare each option across the two snapshots
  a.options.forEach((optA) => {
    const optB = b.options.find((o) => o.id === optA.id);
    if (optB) {
      const rentDiff = optB.rent - optA.rent;
      const daysDiff = optB.commuteDaysPerWeek - optA.commuteDaysPerWeek;
      const splitDiff = optB.roommateSplit - optA.roommateSplit;

      if (rentDiff !== 0 || daysDiff !== 0 || splitDiff !== 0) {
        parameterDeltas.push({
          id: `opt_${optA.id}`,
          label: `${optA.name} Specs`,
          valA: optA.rent,
          valB: optB.rent,
          valADisplay: `$${optA.rent}/mo, ${optA.roommateSplit} ppl, ${optA.commuteDaysPerWeek}d commute`,
          valBDisplay: `$${optB.rent}/mo, ${optB.roommateSplit} ppl, ${optB.commuteDaysPerWeek}d commute`,
          isDifferent: true,
          direction: 'changed',
          sentiment: 'neutral',
        });
      }
    }
  });

  const bestSavingsDelta = modelB.bestOption.annualCashSavings - modelA.bestOption.annualCashSavings;
  const bestMonthlyDelta = modelB.bestOption.monthlySavings - modelA.bestOption.monthlySavings;
  const timeAdjDelta = modelB.bestOption.annualTimeAdjustedSavings - modelA.bestOption.annualTimeAdjustedSavings;

  const outcomeDeltas: MetricOutcomeComparison[] = [
    {
      id: 'best_annual_savings',
      label: 'Optimal Option Annual Cash Savings',
      valADisplay: `$${modelA.bestOption.annualCashSavings.toLocaleString()}/yr`,
      valBDisplay: `$${modelB.bestOption.annualCashSavings.toLocaleString()}/yr`,
      numericDelta: bestSavingsDelta,
      unit: '$/yr',
      direction: bestSavingsDelta > 0 ? 'higher' : bestSavingsDelta < 0 ? 'lower' : 'equal',
      sentiment: bestSavingsDelta > 0 ? 'positive' : bestSavingsDelta < 0 ? 'negative' : 'neutral',
      note: `Leader in B: ${modelB.bestOption.name} (vs ${modelA.bestOption.name} in A)`,
    },
    {
      id: 'best_monthly_surplus',
      label: 'Monthly Net Retained Cash',
      valADisplay: `$${modelA.bestOption.monthlySavings.toLocaleString()}/mo`,
      valBDisplay: `$${modelB.bestOption.monthlySavings.toLocaleString()}/mo`,
      numericDelta: bestMonthlyDelta,
      unit: '$/mo',
      direction: bestMonthlyDelta > 0 ? 'higher' : bestMonthlyDelta < 0 ? 'lower' : 'equal',
      sentiment: bestMonthlyDelta > 0 ? 'positive' : bestMonthlyDelta < 0 ? 'negative' : 'neutral',
    },
    {
      id: 'time_adjusted_savings',
      label: 'Time-Adjusted Economic Savings',
      valADisplay: `$${modelA.bestOption.annualTimeAdjustedSavings.toLocaleString()}/yr`,
      valBDisplay: `$${modelB.bestOption.annualTimeAdjustedSavings.toLocaleString()}/yr`,
      numericDelta: timeAdjDelta,
      unit: '$/yr',
      direction: timeAdjDelta > 0 ? 'higher' : timeAdjDelta < 0 ? 'lower' : 'equal',
      sentiment: timeAdjDelta > 0 ? 'positive' : timeAdjDelta < 0 ? 'negative' : 'neutral',
      note: 'Accounts for commute opportunity cost',
    },
    {
      id: 'savings_rate',
      label: 'Net Savings Rate %',
      valADisplay: `${modelA.bestOption.savingsRatePercent.toFixed(1)}%`,
      valBDisplay: `${modelB.bestOption.savingsRatePercent.toFixed(1)}%`,
      numericDelta: modelB.bestOption.savingsRatePercent - modelA.bestOption.savingsRatePercent,
      unit: '%',
      direction: modelB.bestOption.savingsRatePercent > modelA.bestOption.savingsRatePercent ? 'higher' : modelB.bestOption.savingsRatePercent < modelA.bestOption.savingsRatePercent ? 'lower' : 'equal',
      sentiment: modelB.bestOption.savingsRatePercent > modelA.bestOption.savingsRatePercent ? 'positive' : 'neutral',
    },
  ];

  const summaryNote = bestSavingsDelta > 0
    ? `Snapshot B boosts annual retained savings by +$${bestSavingsDelta.toLocaleString()}/yr under ${modelB.bestOption.name}.`
    : bestSavingsDelta < 0
    ? `Snapshot B yields -$${Math.abs(bestSavingsDelta).toLocaleString()}/yr less cash savings compared to Snapshot A.`
    : `Both snapshots yield identical annual savings ($${modelA.bestOption.annualCashSavings.toLocaleString()}/yr).`;

  return {
    scenarioId: 'housing',
    scenarioTitle: 'Living Choices & Commute',
    parameterDeltas,
    outcomeDeltas,
    summaryNote,
  };
}

function compareGpa(a: GpaParams, b: GpaParams): ScenarioComparisonResult {
  const modelA = calculateGpaModel(a);
  const modelB = calculateGpaModel(b);

  const parameterDeltas: DeltaItem[] = [
    {
      id: 'midterm_score',
      label: 'Midterm Exam Score',
      unit: '%',
      valA: a.midtermScore,
      valB: b.midtermScore,
      valADisplay: `${a.midtermScore}% (Wt: ${a.midtermWeight}%)`,
      valBDisplay: `${b.midtermScore}% (Wt: ${b.midtermWeight}%)`,
      isDifferent: a.midtermScore !== b.midtermScore || a.midtermWeight !== b.midtermWeight,
      numericDelta: b.midtermScore - a.midtermScore,
      direction: b.midtermScore > a.midtermScore ? 'higher' : b.midtermScore < a.midtermScore ? 'lower' : 'equal',
      sentiment: b.midtermScore > a.midtermScore ? 'positive' : 'negative',
    },
    {
      id: 'assignment_score',
      label: 'Assignment Score',
      unit: '%',
      valA: a.assignmentScore,
      valB: b.assignmentScore,
      valADisplay: `${a.assignmentScore}% (Wt: ${a.assignmentWeight}%)`,
      valBDisplay: `${b.assignmentScore}% (Wt: ${b.assignmentWeight}%)`,
      isDifferent: a.assignmentScore !== b.assignmentScore || a.assignmentWeight !== b.assignmentWeight,
      numericDelta: b.assignmentScore - a.assignmentScore,
      direction: b.assignmentScore > a.assignmentScore ? 'higher' : b.assignmentScore < a.assignmentScore ? 'lower' : 'equal',
      sentiment: b.assignmentScore > a.assignmentScore ? 'positive' : 'negative',
    },
    {
      id: 'final_weight',
      label: 'Final Exam Weight',
      unit: '%',
      valA: a.finalExamWeight,
      valB: b.finalExamWeight,
      valADisplay: `${a.finalExamWeight}%`,
      valBDisplay: `${b.finalExamWeight}%`,
      isDifferent: a.finalExamWeight !== b.finalExamWeight,
      numericDelta: b.finalExamWeight - a.finalExamWeight,
      direction: b.finalExamWeight > a.finalExamWeight ? 'higher' : b.finalExamWeight < a.finalExamWeight ? 'lower' : 'equal',
      sentiment: 'neutral',
    },
    {
      id: 'target_grade',
      label: 'Target Course Grade',
      valA: a.targetLetterGrade,
      valB: b.targetLetterGrade,
      valADisplay: `${a.targetLetterGrade}`,
      valBDisplay: `${b.targetLetterGrade}`,
      isDifferent: a.targetLetterGrade !== b.targetLetterGrade,
      direction: a.targetLetterGrade !== b.targetLetterGrade ? 'changed' : 'equal',
      sentiment: 'neutral',
    },
    {
      id: 'cumulative_gpa',
      label: 'Prior Cumulative GPA',
      valA: a.currentCumulativeGpa,
      valB: b.currentCumulativeGpa,
      valADisplay: `${a.currentCumulativeGpa.toFixed(2)} (${a.completedCreditHours} hrs)`,
      valBDisplay: `${b.currentCumulativeGpa.toFixed(2)} (${b.completedCreditHours} hrs)`,
      isDifferent: a.currentCumulativeGpa !== b.currentCumulativeGpa,
      numericDelta: b.currentCumulativeGpa - a.currentCumulativeGpa,
      direction: b.currentCumulativeGpa > a.currentCumulativeGpa ? 'higher' : b.currentCumulativeGpa < a.currentCumulativeGpa ? 'lower' : 'equal',
      sentiment: 'neutral',
    },
  ];

  const reqFinalDelta = modelB.requiredFinalScore - modelA.requiredFinalScore;
  const securedDelta = modelB.currentSecuredPoints - modelA.currentSecuredPoints;
  const newGpaDelta = modelB.projectedNewCumulativeGpa - modelA.projectedNewCumulativeGpa;

  const outcomeDeltas: MetricOutcomeComparison[] = [
    {
      id: 'required_final',
      label: 'Required Final Exam Score',
      valADisplay: modelA.requiredFinalScore <= 0 ? '0% (Locked in)' : `${modelA.requiredFinalScore.toFixed(1)}%`,
      valBDisplay: modelB.requiredFinalScore <= 0 ? '0% (Locked in)' : `${modelB.requiredFinalScore.toFixed(1)}%`,
      numericDelta: reqFinalDelta,
      unit: '%',
      direction: reqFinalDelta > 0 ? 'higher' : reqFinalDelta < 0 ? 'lower' : 'equal',
      sentiment: reqFinalDelta < 0 ? 'positive' : reqFinalDelta > 0 ? 'negative' : 'neutral',
      note: reqFinalDelta < 0 ? `Relieves final exam burden by ${(Math.abs(reqFinalDelta)).toFixed(1)}%` : reqFinalDelta > 0 ? `Requires +${reqFinalDelta.toFixed(1)}% higher final score` : 'Exam target identical',
    },
    {
      id: 'secured_points',
      label: 'Points Secured Pre-Final',
      valADisplay: `${modelA.currentSecuredPoints.toFixed(1)} pts`,
      valBDisplay: `${modelB.currentSecuredPoints.toFixed(1)} pts`,
      numericDelta: securedDelta,
      unit: 'pts',
      direction: securedDelta > 0 ? 'higher' : securedDelta < 0 ? 'lower' : 'equal',
      sentiment: securedDelta > 0 ? 'positive' : 'negative',
    },
    {
      id: 'projected_gpa',
      label: 'Projected Cumulative GPA',
      valADisplay: `${modelA.projectedNewCumulativeGpa.toFixed(2)}`,
      valBDisplay: `${modelB.projectedNewCumulativeGpa.toFixed(2)}`,
      numericDelta: newGpaDelta,
      direction: newGpaDelta > 0 ? 'higher' : newGpaDelta < 0 ? 'lower' : 'equal',
      sentiment: newGpaDelta > 0 ? 'positive' : newGpaDelta < 0 ? 'negative' : 'neutral',
    },
    {
      id: 'feasibility',
      label: 'Target Feasibility Verdict',
      valADisplay: modelA.feasibilityLabel,
      valBDisplay: modelB.feasibilityLabel,
      direction: modelA.feasibilityRating !== modelB.feasibilityRating ? 'higher' : 'equal',
      sentiment: modelB.feasibilityRating === 'guaranteed' || modelB.feasibilityRating === 'achievable' ? 'positive' : 'negative',
      note: modelA.feasibilityRating !== modelB.feasibilityRating ? `Shifted from ${modelA.feasibilityRating} to ${modelB.feasibilityRating}` : 'Consistent feasibility',
    },
  ];

  const summaryNote = reqFinalDelta < 0
    ? `Snapshot B reduces the needed score on the final exam by ${Math.abs(reqFinalDelta).toFixed(1)}% to reach target.`
    : reqFinalDelta > 0
    ? `Snapshot B requires +${reqFinalDelta.toFixed(1)}% more points on the final exam.`
    : 'Identical exam threshold requirements across both configurations.';

  return {
    scenarioId: 'gpa',
    scenarioTitle: 'Coursework & GPA Optimizer',
    parameterDeltas,
    outcomeDeltas,
    summaryNote,
  };
}

function compareBudget(a: BudgetParams, b: BudgetParams): ScenarioComparisonResult {
  const modelA = calculateBudgetModel(a);
  const modelB = calculateBudgetModel(b);

  const parameterDeltas: DeltaItem[] = [
    {
      id: 'attendees',
      label: 'Expected Attendees',
      unit: 'guests',
      valA: a.expectedAttendees,
      valB: b.expectedAttendees,
      valADisplay: `${a.expectedAttendees} guests`,
      valBDisplay: `${b.expectedAttendees} guests`,
      isDifferent: a.expectedAttendees !== b.expectedAttendees,
      numericDelta: b.expectedAttendees - a.expectedAttendees,
      direction: b.expectedAttendees > a.expectedAttendees ? 'higher' : b.expectedAttendees < a.expectedAttendees ? 'lower' : 'equal',
      sentiment: b.expectedAttendees > a.expectedAttendees ? 'positive' : 'neutral',
    },
    {
      id: 'ticket_price',
      label: 'Ticket Price',
      unit: '$',
      valA: a.ticketPrice,
      valB: b.ticketPrice,
      valADisplay: `$${a.ticketPrice}`,
      valBDisplay: `$${b.ticketPrice}`,
      isDifferent: a.ticketPrice !== b.ticketPrice,
      numericDelta: b.ticketPrice - a.ticketPrice,
      direction: b.ticketPrice > a.ticketPrice ? 'higher' : b.ticketPrice < a.ticketPrice ? 'lower' : 'equal',
      sentiment: b.ticketPrice > a.ticketPrice ? 'positive' : 'neutral',
    },
    {
      id: 'food_cost',
      label: 'Food Cost Per Attendee',
      unit: '$/person',
      valA: a.foodCostPerPerson,
      valB: b.foodCostPerPerson,
      valADisplay: `$${a.foodCostPerPerson}`,
      valBDisplay: `$${b.foodCostPerPerson}`,
      isDifferent: a.foodCostPerPerson !== b.foodCostPerPerson,
      numericDelta: b.foodCostPerPerson - a.foodCostPerPerson,
      direction: b.foodCostPerPerson > a.foodCostPerPerson ? 'higher' : b.foodCostPerPerson < a.foodCostPerPerson ? 'lower' : 'equal',
      sentiment: b.foodCostPerPerson < a.foodCostPerPerson ? 'positive' : 'negative',
    },
    {
      id: 'venue_rental',
      label: 'Venue Rental',
      unit: '$',
      valA: a.venueRentalCost,
      valB: b.venueRentalCost,
      valADisplay: `$${a.venueRentalCost}`,
      valBDisplay: `$${b.venueRentalCost}`,
      isDifferent: a.venueRentalCost !== b.venueRentalCost,
      numericDelta: b.venueRentalCost - a.venueRentalCost,
      direction: b.venueRentalCost > a.venueRentalCost ? 'higher' : b.venueRentalCost < a.venueRentalCost ? 'lower' : 'equal',
      sentiment: b.venueRentalCost < a.venueRentalCost ? 'positive' : 'negative',
    },
    {
      id: 'sponsor_subsidy',
      label: 'Sponsorship Grant',
      unit: '$',
      valA: a.sponsorSubsidy,
      valB: b.sponsorSubsidy,
      valADisplay: `$${a.sponsorSubsidy}`,
      valBDisplay: `$${b.sponsorSubsidy}`,
      isDifferent: a.sponsorSubsidy !== b.sponsorSubsidy,
      numericDelta: b.sponsorSubsidy - a.sponsorSubsidy,
      direction: b.sponsorSubsidy > a.sponsorSubsidy ? 'higher' : b.sponsorSubsidy < a.sponsorSubsidy ? 'lower' : 'equal',
      sentiment: b.sponsorSubsidy > a.sponsorSubsidy ? 'positive' : 'neutral',
    },
    {
      id: 'equipment_av',
      label: 'Equipment & AV',
      unit: '$',
      valA: a.equipmentAVCost,
      valB: b.equipmentAVCost,
      valADisplay: `$${a.equipmentAVCost}`,
      valBDisplay: `$${b.equipmentAVCost}`,
      isDifferent: a.equipmentAVCost !== b.equipmentAVCost,
      numericDelta: b.equipmentAVCost - a.equipmentAVCost,
      direction: b.equipmentAVCost > a.equipmentAVCost ? 'higher' : b.equipmentAVCost < a.equipmentAVCost ? 'lower' : 'equal',
      sentiment: b.equipmentAVCost < a.equipmentAVCost ? 'positive' : 'negative',
    },
  ];

  const marginDelta = modelB.netMargin - modelA.netMargin;
  const breakEvenDelta = (isFinite(modelB.breakEvenAttendees) && isFinite(modelA.breakEvenAttendees))
    ? modelB.breakEvenAttendees - modelA.breakEvenAttendees
    : 0;
  const revDelta = modelB.totalRevenue - modelA.totalRevenue;
  const costDelta = modelB.totalExpenses - modelA.totalExpenses;

  const outcomeDeltas: MetricOutcomeComparison[] = [
    {
      id: 'net_margin',
      label: 'Net Financial Outcome (Surplus / Deficit)',
      valADisplay: `${modelA.netMargin >= 0 ? '+$' : '-$'}${Math.abs(modelA.netMargin).toLocaleString()}`,
      valBDisplay: `${modelB.netMargin >= 0 ? '+$' : '-$'}${Math.abs(modelB.netMargin).toLocaleString()}`,
      numericDelta: marginDelta,
      unit: '$',
      direction: marginDelta > 0 ? 'higher' : marginDelta < 0 ? 'lower' : 'equal',
      sentiment: marginDelta > 0 ? 'positive' : marginDelta < 0 ? 'negative' : 'neutral',
      note: marginDelta > 0 ? `+$${marginDelta.toLocaleString()} improvement` : marginDelta < 0 ? `-$${Math.abs(marginDelta).toLocaleString()} deficit shift` : 'Balanced outcome',
    },
    {
      id: 'break_even',
      label: 'Break-Even Attendee Threshold',
      valADisplay: `${modelA.breakEvenAttendees} tickets`,
      valBDisplay: `${modelB.breakEvenAttendees} tickets`,
      numericDelta: breakEvenDelta,
      unit: 'tickets',
      direction: breakEvenDelta > 0 ? 'higher' : breakEvenDelta < 0 ? 'lower' : 'equal',
      sentiment: breakEvenDelta < 0 ? 'positive' : breakEvenDelta > 0 ? 'negative' : 'neutral',
      note: breakEvenDelta < 0 ? `Reaches break-even ${Math.abs(breakEvenDelta)} tickets sooner` : breakEvenDelta > 0 ? `Needs +${breakEvenDelta} more tickets to break even` : 'Break-even volume identical',
    },
    {
      id: 'total_revenue',
      label: 'Total Generated Revenue',
      valADisplay: `$${modelA.totalRevenue.toLocaleString()}`,
      valBDisplay: `$${modelB.totalRevenue.toLocaleString()}`,
      numericDelta: revDelta,
      unit: '$',
      direction: revDelta > 0 ? 'higher' : revDelta < 0 ? 'lower' : 'equal',
      sentiment: revDelta > 0 ? 'positive' : 'neutral',
    },
    {
      id: 'total_expenses',
      label: 'Total Expenses',
      valADisplay: `$${modelA.totalExpenses.toLocaleString()}`,
      valBDisplay: `$${modelB.totalExpenses.toLocaleString()}`,
      numericDelta: costDelta,
      unit: '$',
      direction: costDelta > 0 ? 'higher' : costDelta < 0 ? 'lower' : 'equal',
      sentiment: costDelta < 0 ? 'positive' : 'negative',
    },
  ];

  const summaryNote = marginDelta > 0
    ? `Snapshot B improves the net margin by +$${marginDelta.toLocaleString()} (Surplus of $${modelB.netMargin.toLocaleString()}).`
    : marginDelta < 0
    ? `Snapshot B causes a -$${Math.abs(marginDelta).toLocaleString()} margin reduction compared to Snapshot A.`
    : `Both configurations result in identical bottom-line profit ($${modelA.netMargin.toLocaleString()}).`;

  return {
    scenarioId: 'budget',
    scenarioTitle: 'Campus Event Budget',
    parameterDeltas,
    outcomeDeltas,
    summaryNote,
  };
}

function compareCustom(a: CustomParams, b: CustomParams): ScenarioComparisonResult {
  const modelA = calculateCustomModel(a);
  const modelB = calculateCustomModel(b);

  const parameterDeltas: DeltaItem[] = a.levers.map((leverA, idx) => {
    const leverB = b.levers[idx] || leverA;
    const diff = leverB.value - leverA.value;
    return {
      id: leverA.id,
      label: leverA.label,
      unit: leverA.unit,
      valA: leverA.value,
      valB: leverB.value,
      valADisplay: `${leverA.value} ${leverA.unit}`,
      valBDisplay: `${leverB.value} ${leverB.unit}`,
      isDifferent: diff !== 0,
      numericDelta: diff,
      direction: diff > 0 ? 'higher' : diff < 0 ? 'lower' : 'equal',
      sentiment: 'neutral',
    };
  });

  const valDelta = modelB.computedValue - modelA.computedValue;
  const pctDelta = modelB.percentageOfTarget - modelA.percentageOfTarget;

  const outcomeDeltas: MetricOutcomeComparison[] = [
    {
      id: 'computed_value',
      label: a.goalMetricName || 'Calculated Metric',
      valADisplay: `${modelA.computedValue} ${a.goalMetricUnit}`,
      valBDisplay: `${modelB.computedValue} ${b.goalMetricUnit}`,
      numericDelta: valDelta,
      unit: a.goalMetricUnit,
      direction: valDelta > 0 ? 'higher' : valDelta < 0 ? 'lower' : 'equal',
      sentiment: valDelta > 0 ? 'positive' : valDelta < 0 ? 'negative' : 'neutral',
    },
    {
      id: 'percentage_target',
      label: 'Attainment of Target Goal',
      valADisplay: `${modelA.percentageOfTarget.toFixed(1)}%`,
      valBDisplay: `${modelB.percentageOfTarget.toFixed(1)}%`,
      numericDelta: pctDelta,
      unit: '%',
      direction: pctDelta > 0 ? 'higher' : pctDelta < 0 ? 'lower' : 'equal',
      sentiment: pctDelta > 0 ? 'positive' : 'negative',
    },
  ];

  const summaryNote = valDelta !== 0
    ? `Snapshot B shifts the outcome metric by ${valDelta > 0 ? '+' : ''}${valDelta.toFixed(1)} ${a.goalMetricUnit} (${pctDelta > 0 ? '+' : ''}${pctDelta.toFixed(1)}% towards target).`
    : `Both snapshots yield an identical output of ${modelA.computedValue} ${a.goalMetricUnit}.`;

  return {
    scenarioId: 'custom',
    scenarioTitle: a.title || 'Custom Sandbox',
    parameterDeltas,
    outcomeDeltas,
    summaryNote,
  };
}

function compareTrading(a: TradingParams, b: TradingParams): ScenarioComparisonResult {
  const modelA = calculateTradingModel(a);
  const modelB = calculateTradingModel(b);

  const parameterDeltas: DeltaItem[] = [
    {
      id: 'offer_price',
      label: 'Offer Issue Price',
      unit: '₹',
      valA: a.offerPrice,
      valB: b.offerPrice,
      valADisplay: `₹${a.offerPrice}`,
      valBDisplay: `₹${b.offerPrice}`,
      isDifferent: a.offerPrice !== b.offerPrice,
      numericDelta: b.offerPrice - a.offerPrice,
      direction: b.offerPrice > a.offerPrice ? 'higher' : b.offerPrice < a.offerPrice ? 'lower' : 'equal',
    },
    {
      id: 'requested_shares',
      label: 'Requested Shares',
      valA: a.requestedShares,
      valB: b.requestedShares,
      valADisplay: `${a.requestedShares} shs`,
      valBDisplay: `${b.requestedShares} shs`,
      isDifferent: a.requestedShares !== b.requestedShares,
      numericDelta: b.requestedShares - a.requestedShares,
      direction: b.requestedShares > a.requestedShares ? 'higher' : b.requestedShares < a.requestedShares ? 'lower' : 'equal',
    },
    {
      id: 'expected_day1_pop',
      label: 'Expected Listing Pop',
      unit: '%',
      valA: a.expectedDay1Pop,
      valB: b.expectedDay1Pop,
      valADisplay: `+${a.expectedDay1Pop}%`,
      valBDisplay: `+${b.expectedDay1Pop}%`,
      isDifferent: a.expectedDay1Pop !== b.expectedDay1Pop,
      numericDelta: b.expectedDay1Pop - a.expectedDay1Pop,
      direction: b.expectedDay1Pop > a.expectedDay1Pop ? 'higher' : b.expectedDay1Pop < a.expectedDay1Pop ? 'lower' : 'equal',
      sentiment: b.expectedDay1Pop > a.expectedDay1Pop ? 'positive' : 'negative',
    },
    {
      id: 'oversubscription',
      label: 'Book Oversubscription',
      unit: 'x',
      valA: a.oversubscriptionRatio,
      valB: b.oversubscriptionRatio,
      valADisplay: `${a.oversubscriptionRatio}x`,
      valBDisplay: `${b.oversubscriptionRatio}x`,
      isDifferent: a.oversubscriptionRatio !== b.oversubscriptionRatio,
      numericDelta: b.oversubscriptionRatio - a.oversubscriptionRatio,
      direction: b.oversubscriptionRatio > a.oversubscriptionRatio ? 'higher' : b.oversubscriptionRatio < a.oversubscriptionRatio ? 'lower' : 'equal',
    },
    {
      id: 'stop_loss',
      label: 'Stop-Loss Barrier',
      unit: '%',
      valA: a.stopLossPercent,
      valB: b.stopLossPercent,
      valADisplay: `${a.stopLossPercent}%`,
      valBDisplay: `${b.stopLossPercent}%`,
      isDifferent: a.stopLossPercent !== b.stopLossPercent,
      numericDelta: b.stopLossPercent - a.stopLossPercent,
      direction: b.stopLossPercent > a.stopLossPercent ? 'higher' : b.stopLossPercent < a.stopLossPercent ? 'lower' : 'equal',
    },
  ];

  const pnlDelta = modelB.day1ProfitDollar - modelA.day1ProfitDollar;
  const outcomeDeltas: MetricOutcomeComparison[] = [
    {
      id: 'allocated_shares',
      label: 'Estimated Allotted Shares',
      valADisplay: `${modelA.actualAllocatedShares} shs (${modelA.fillRatePercent}%)`,
      valBDisplay: `${modelB.actualAllocatedShares} shs (${modelB.fillRatePercent}%)`,
      numericDelta: modelB.actualAllocatedShares - modelA.actualAllocatedShares,
      direction: modelB.actualAllocatedShares > modelA.actualAllocatedShares ? 'higher' : modelB.actualAllocatedShares < modelA.actualAllocatedShares ? 'lower' : 'equal',
    },
    {
      id: 'day1_pnl',
      label: 'Projected Day 1 P&L',
      valADisplay: `₹${modelA.day1ProfitDollar.toLocaleString()}`,
      valBDisplay: `₹${modelB.day1ProfitDollar.toLocaleString()}`,
      numericDelta: pnlDelta,
      unit: '₹',
      direction: pnlDelta > 0 ? 'higher' : pnlDelta < 0 ? 'lower' : 'equal',
      sentiment: pnlDelta > 0 ? 'positive' : 'negative',
    },
    {
      id: 'risk_reward',
      label: 'Risk / Reward Ratio',
      valADisplay: `${modelA.riskRewardRatio}:1`,
      valBDisplay: `${modelB.riskRewardRatio}:1`,
      numericDelta: modelB.riskRewardRatio - modelA.riskRewardRatio,
      direction: modelB.riskRewardRatio > modelA.riskRewardRatio ? 'higher' : modelB.riskRewardRatio < modelA.riskRewardRatio ? 'lower' : 'equal',
      sentiment: modelB.riskRewardRatio > modelA.riskRewardRatio ? 'positive' : 'negative',
    },
  ];

  const summaryNote = pnlDelta !== 0
    ? `Snapshot B shifts expected listing day profit by ${pnlDelta > 0 ? '+₹' : '-₹'}${Math.abs(pnlDelta).toLocaleString()} (Allotment: ${modelB.actualAllocatedShares} shs).`
    : `Both snapshots project equivalent listing-day outcomes of ₹${modelA.day1ProfitDollar.toLocaleString()}.`;

  return {
    scenarioId: 'trading',
    scenarioTitle: `IPO & Trading (${b.ticker || 'IPO'})`,
    parameterDeltas,
    outcomeDeltas,
    summaryNote,
  };
}
