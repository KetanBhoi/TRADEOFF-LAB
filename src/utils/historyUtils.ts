import {
  ScenarioId,
  ScenarioHistorySnapshot,
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

export function createSnapshot(
  scenarioId: ScenarioId,
  params: RunningParams | HousingParams | GpaParams | BudgetParams | CustomParams | TradingParams
): ScenarioHistorySnapshot {
  const timestamp = Date.now();
  const date = new Date(timestamp);
  const timeFormatted = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const id = `snap-${scenarioId}-${timestamp}`;

  let scenarioTitle = '';
  let keyHighlights = '';
  let primaryMetric = '';

  switch (scenarioId) {
    case 'running': {
      const p = params as RunningParams;
      const model = calculateRunningModel(p);
      scenarioTitle = 'Running Pace Training';
      keyHighlights = `${p.currentPaceMinutes}:${p.currentPaceSeconds.toString().padStart(2, '0')} pace · ${formatTimeHoursMins(p.targetTimeHours * 60 + p.targetTimeMinutes)} target · ${p.weeksUntilRace}wks · ${p.runsPerWeek} runs/wk`;
      primaryMetric = `-${model.shavePerWeekSeconds.toFixed(1)}s/wk`;
      break;
    }

    case 'housing': {
      const p = params as HousingParams;
      const model = calculateHousingModel(p);
      scenarioTitle = 'Living Choices';
      const roommate = p.options.find((o) => o.id === 'opt-roommate');
      keyHighlights = `Income $${p.monthlyNetIncome.toLocaleString()} · ${roommate?.roommateSplit || 2} Roommates · Time $${p.hourlyTimeValuation}/hr`;
      primaryMetric = `$${model.bestOption.annualCashSavings.toLocaleString()}/yr`;
      break;
    }

    case 'gpa': {
      const p = params as GpaParams;
      const model = calculateGpaModel(p);
      scenarioTitle = 'Course GPA Optimizer';
      keyHighlights = `Midterm ${p.midtermScore}% · Final Wt ${p.finalExamWeight}% · Target ${p.targetLetterGrade} (${p.currentCourseCredits} cr)`;
      primaryMetric = model.requiredFinalScore <= 0 ? 'Locked in' : `Need ${model.requiredFinalScore.toFixed(1)}%`;
      break;
    }

    case 'budget': {
      const p = params as BudgetParams;
      const model = calculateBudgetModel(p);
      scenarioTitle = 'Campus Event Budget';
      keyHighlights = `${p.expectedAttendees} guests · $${p.ticketPrice} ticket · $${p.foodCostPerPerson} food · $${p.sponsorSubsidy} sponsor`;
      primaryMetric = `${model.netMargin >= 0 ? '+$' : '-$'}${Math.abs(model.netMargin).toLocaleString()}`;
      break;
    }

    case 'custom': {
      const p = params as CustomParams;
      const model = calculateCustomModel(p);
      scenarioTitle = p.title || 'Custom Sandbox';
      keyHighlights = p.levers.map((l) => `${l.label}: ${l.value}${l.unit}`).join(' · ');
      primaryMetric = `${model.computedValue} ${p.goalMetricUnit}`;
      break;
    }

    case 'trading': {
      const p = params as TradingParams;
      const model = calculateTradingModel(p);
      scenarioTitle = `IPO & Live Trading (${p.ticker || 'IPO'})`;
      keyHighlights = `${p.ticker || 'IPO'} · $${p.offerPrice}/sh · Exp Pop ${p.expectedDay1Pop}% · ${p.oversubscriptionRatio}x sub`;
      primaryMetric = `${model.day1ProfitDollar >= 0 ? '+$' : '-$'}${Math.abs(model.day1ProfitDollar).toLocaleString()}`;
      break;
    }
  }

  return {
    id,
    scenarioId,
    scenarioTitle,
    timestamp,
    timeFormatted,
    keyHighlights,
    primaryMetric,
    // Deep clone parameters
    params: JSON.parse(JSON.stringify(params)),
  };
}

export function areParamsEqual(a: unknown, b: unknown): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}
