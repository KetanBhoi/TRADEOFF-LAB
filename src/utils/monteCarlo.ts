/**
 * Monte Carlo Stochastic Simulation Engine for TradeOff Lab
 * Generates Gaussian/Normal distributions and runs multi-trial simulations
 * across the decision models to produce probability curves and quantiles.
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

// Box-Muller transform for generating standard normally-distributed random numbers
function randomGaussian(mean = 0, stdev = 1): number {
  let u = 1 - Math.random(); // Converting [0,1) to (0,1]
  let v = Math.random();
  let z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  return z * stdev + mean;
}

export interface MonteCarloHistogramBin {
  binLabel: string;
  binStart: number;
  binEnd: number;
  frequency: number;
  percentage: number;
  cumulativePercentage: number;
}

export interface MonteCarloSimulationResult {
  scenarioId: ScenarioId;
  metricName: string;
  metricUnit: string;
  trialsCount: number;
  volatilityPercent: number;
  mean: number;
  median: number; // P50
  p10: number;    // 10th percentile (conservative/worst)
  p25: number;
  p75: number;
  p90: number;    // 90th percentile (optimistic/best)
  stdDev: number;
  min: number;
  max: number;
  targetThreshold: number;
  targetType: 'greater' | 'less'; // greater: higher is better; less: lower is better
  successRatePercent: number; // probability of meeting or exceeding target
  histogramBins: MonteCarloHistogramBin[];
  rawSamples: number[];
}

export function runMonteCarloSimulation(
  scenarioId: ScenarioId,
  params: RunningParams | HousingParams | GpaParams | BudgetParams | CustomParams | TradingParams,
  trials = 1000,
  volatilityPercent = 10
): MonteCarloSimulationResult {
  const samples: number[] = [];
  const varianceFactor = volatilityPercent / 100;

  let metricName = 'Outcome Value';
  let metricUnit = '';
  let targetThreshold = 0;
  let targetType: 'greater' | 'less' = 'greater';

  for (let i = 0; i < trials; i++) {
    switch (scenarioId) {
      case 'running': {
        const rp = params as RunningParams;
        metricName = 'Weekly Pace Shave Demand';
        metricUnit = 'sec/wk';
        targetThreshold = 7.5; // ≤ 7.5 sec/wk is sustainable
        targetType = 'less';

        // Add stochastic variation to current pace (fitness jitter ±30s) and race target
        const currentPaceSec =
          rp.currentPaceMinutes * 60 +
          rp.currentPaceSeconds +
          randomGaussian(0, 15 * varianceFactor);
        const targetPaceSec =
          (rp.targetTimeHours * 3600 + rp.targetTimeMinutes * 60) / rp.targetDistanceMiles +
          randomGaussian(0, 5 * varianceFactor);

        const diffSec = Math.max(0, currentPaceSec - targetPaceSec);
        const shave = diffSec / Math.max(1, rp.weeksUntilRace);
        samples.push(shave);
        break;
      }

      case 'housing': {
        const hp = params as HousingParams;
        metricName = '1-Year Net Cash Savings (Winner Option)';
        metricUnit = '$';
        targetThreshold = 6000; // Aiming for $6,000/yr savings
        targetType = 'greater';

        // Stochastic variation to utility volatility, transit prices, and take-home income
        const simulatedIncome = Math.max(
          1000,
          hp.monthlyNetIncome * (1 + randomGaussian(0, varianceFactor * 0.5))
        );
        const simulatedBuffer = Math.max(
          50,
          hp.discretionaryBuffer * (1 + randomGaussian(0, varianceFactor))
        );

        // Perturb the first winning option
        const baseOpt = hp.options[1] || hp.options[0];
        const rent = Math.max(200, baseOpt.rent * (1 + randomGaussian(0, varianceFactor * 0.3)));
        const utils = Math.max(20, baseOpt.utilities * (1 + randomGaussian(0, varianceFactor * 0.8)));
        const split = Math.max(1, baseOpt.roommateSplit);
        const transit = Math.max(
          0,
          baseOpt.commuteTransitCostPerMonth * (1 + randomGaussian(0, varianceFactor * 0.5))
        );

        const monthlyCost = rent / split + utils / split + transit + simulatedBuffer;
        const monthlySavings = simulatedIncome - monthlyCost;
        const annualSavings = monthlySavings * 12;
        samples.push(annualSavings);
        break;
      }

      case 'gpa': {
        const gp = params as GpaParams;
        metricName = 'Required Final Exam Score';
        metricUnit = '%';
        targetThreshold = 85; // Target scoring 85% or lower on final
        targetType = 'less';

        // Stochastic variation on midterm score and assignment scores (test anxiety / rubric shifts)
        const simMidterm = Math.min(
          100,
          Math.max(30, gp.midtermScore + randomGaussian(0, 6 * varianceFactor))
        );
        const simAssign = Math.min(
          100,
          Math.max(30, gp.assignmentScore + randomGaussian(0, 4 * varianceFactor))
        );

        const cutoff = 83; // Grade B+ cutoff standard
        const earnedSoFar =
          simMidterm * (gp.midtermWeight / 100) + simAssign * (gp.assignmentWeight / 100);
        const needed = ((cutoff - earnedSoFar) / (gp.finalExamWeight / 100));
        samples.push(Math.max(0, Math.min(130, needed)));
        break;
      }

      case 'budget': {
        const bp = params as BudgetParams;
        metricName = 'Net Event Surplus / Profit';
        metricUnit = '$';
        targetThreshold = 500; // Target positive margin ≥ $500
        targetType = 'greater';

        // Stochastic variation on attendee turnout (-20% to +10%) and variable catering costs (+-15%)
        const turnoutRatio = Math.max(0.3, 1 + randomGaussian(-0.05, varianceFactor));
        const simAttendees = Math.round(bp.expectedAttendees * turnoutRatio);
        const simFood = Math.max(
          2,
          bp.foodCostPerPerson * (1 + randomGaussian(0.02, varianceFactor * 0.7))
        );

        const revenue = simAttendees * bp.ticketPrice + bp.sponsorSubsidy;
        const costs =
          bp.venueRentalCost +
          bp.equipmentAVCost +
          bp.marketingBudget +
          simAttendees * simFood;
        const profit = revenue - costs;
        samples.push(profit);
        break;
      }

      case 'custom': {
        const cp = params as CustomParams;
        metricName = cp.goalMetricName || 'Simulated Goal Metric';
        metricUnit = cp.goalMetricUnit || 'pts';
        targetThreshold = cp.targetValue;
        targetType = 'greater';

        // Stochastic noise on all 3 levers
        const l1 = cp.levers[0].value * (1 + randomGaussian(0, varianceFactor));
        const l2 = cp.levers[1].value * (1 + randomGaussian(0, varianceFactor));
        const l3 = cp.levers[2].value * (1 + randomGaussian(0, varianceFactor));

        let res = 0;
        if (cp.formulaType === 'linear-sum') {
          res = l1 * 1.5 + l2 * 2.0 - l3 * 0.8;
        } else if (cp.formulaType === 'multiplicative') {
          res = (l1 * l2) / Math.max(1, l3);
        } else {
          res = (l1 / Math.max(1, l2 + l3)) * 100;
        }
        samples.push(res);
        break;
      }

      case 'trading': {
        const tp = params as TradingParams;
        metricName = 'IPO Day 1 Flipping Profit';
        metricUnit = '$';
        targetThreshold = 1000; // Target minimum $1,000 profit
        targetType = 'greater';

        // Stochastic variation on opening pop and oversubscription book demand
        const simPop = Math.max(-20, tp.expectedDay1Pop + randomGaussian(0, tp.expectedDay1Pop * 0.35 * varianceFactor));
        const simOversub = Math.max(1, tp.oversubscriptionRatio * (1 + randomGaussian(0, varianceFactor * 0.4)));
        const simFillRate = Math.min(1, Math.max(0.04, 1 / Math.pow(simOversub, 0.76)));
        const maxShares = Math.floor(tp.capitalCommitted / Math.max(1, tp.offerPrice));
        const baseShares = Math.min(tp.requestedShares, maxShares);
        const actualShares = Math.max(1, Math.floor(baseShares * simFillRate));
        const listingPrice = tp.offerPrice * (1 + simPop / 100);
        const profit = (listingPrice - tp.offerPrice) * actualShares;
        samples.push(Math.round(profit));
        break;
      }
    }
  }

  // Calculate Statistical Quantiles & Metrics
  samples.sort((a, b) => a - b);
  const n = samples.length;

  const min = samples[0];
  const max = samples[n - 1];
  const sum = samples.reduce((acc, s) => acc + s, 0);
  const mean = sum / n;

  const getPercentile = (p: number) => {
    const idx = (p / 100) * (n - 1);
    const low = Math.floor(idx);
    const high = Math.ceil(idx);
    if (low === high) return samples[low];
    return samples[low] + (idx - low) * (samples[high] - samples[low]);
  };

  const p10 = getPercentile(10);
  const p25 = getPercentile(25);
  const median = getPercentile(50);
  const p75 = getPercentile(75);
  const p90 = getPercentile(90);

  const variance = samples.reduce((acc, s) => acc + Math.pow(s - mean, 2), 0) / n;
  const stdDev = Math.sqrt(variance);

  // Success rate
  const successCount = samples.filter((s) =>
    targetType === 'greater' ? s >= targetThreshold : s <= targetThreshold
  ).length;
  const successRatePercent = Math.round((successCount / n) * 1000) / 10;

  // Generate 12 Histogram Bins for Recharts
  const binCount = 12;
  const binStep = (max - min) / binCount || 1;
  const histogramBins: MonteCarloHistogramBin[] = [];

  let runningCumulative = 0;

  for (let b = 0; b < binCount; b++) {
    const binStart = min + b * binStep;
    const binEnd = min + (b + 1) * binStep;
    const count = samples.filter(
      (s) => (b === binCount - 1 ? s >= binStart && s <= binEnd : s >= binStart && s < binEnd)
    ).length;

    const percentage = Math.round((count / n) * 1000) / 10;
    runningCumulative += percentage;

    const formatVal = (v: number) =>
      metricUnit === '$'
        ? `$${Math.round(v).toLocaleString()}`
        : `${Math.round(v * 10) / 10}${metricUnit ? ` ${metricUnit}` : ''}`;

    histogramBins.push({
      binLabel: `${formatVal(binStart)}`,
      binStart,
      binEnd,
      frequency: count,
      percentage,
      cumulativePercentage: Math.min(100, Math.round(runningCumulative * 10) / 10),
    });
  }

  return {
    scenarioId,
    metricName,
    metricUnit,
    trialsCount: trials,
    volatilityPercent,
    mean,
    median,
    p10,
    p25,
    p75,
    p90,
    stdDev,
    min,
    max,
    targetThreshold,
    targetType,
    successRatePercent,
    histogramBins,
    rawSamples: samples,
  };
}
