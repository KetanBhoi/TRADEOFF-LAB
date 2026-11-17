/**
 * Mathematical modeling and simulation utilities for TradeOff Lab
 */

import {
  RunningParams,
  HousingParams,
  HousingOption,
  GpaParams,
  BudgetParams,
  CustomParams,
  TradingParams,
  TradingIpoPreset,
} from '../types';

// ==========================================
// 1. RUNNING & PACE OPTIMIZER
// ==========================================

export function formatPace(totalSeconds: number): string {
  const rounded = Math.round(totalSeconds);
  const mins = Math.floor(rounded / 60);
  const secs = rounded % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function formatTimeHoursMins(totalMinutes: number): string {
  const rounded = Math.round(totalMinutes);
  const hours = Math.floor(rounded / 60);
  const mins = rounded % 60;
  return `${hours}h ${mins.toString().padStart(2, '0')}m`;
}

export interface RunningModelResult {
  currentPaceSeconds: number;
  targetPaceSeconds: number;
  totalPaceDiffSeconds: number;
  shavePerWeekSeconds: number;
  feasibilityLevel: 'optimal' | 'moderate' | 'aggressive' | 'unrealistic';
  feasibilityLabel: string;
  feasibilityColor: string;
  injuryRiskScore: number; // 0 - 100
  weeklyMilestones: { week: number; projectedPaceSec: number; targetPaceSec: number; weeklyMiles: number }[];
  riegelEquivalents: { race: string; distance: string; projectedTime: string; targetTime: string }[];
  verdictTip: string;
}

export function calculateRunningModel(params: RunningParams): RunningModelResult {
  const currentPaceSec = params.currentPaceMinutes * 60 + params.currentPaceSeconds;
  const targetTotalSec = (params.targetTimeHours * 3600 + params.targetTimeMinutes * 60);
  const targetPaceSec = targetTotalSec / params.targetDistanceMiles;
  const totalDiffSec = Math.max(0, currentPaceSec - targetPaceSec);
  const weeks = Math.max(1, params.weeksUntilRace);
  const shavePerWeek = totalDiffSec / weeks;

  // Feasibility & Injury Risk logic based on training physiology
  let feasibilityLevel: 'optimal' | 'moderate' | 'aggressive' | 'unrealistic' = 'optimal';
  let feasibilityLabel = 'Sustainable Progression';
  let feasibilityColor = 'text-emerald-700 bg-emerald-50 border-emerald-200';
  let injuryRiskScore = 20;

  // Factors: shave per week, frequency, speedwork, rest days
  if (shavePerWeek <= 5) {
    feasibilityLevel = 'optimal';
    feasibilityLabel = 'Comfortable Adaptation (≤ 5 sec/wk)';
    feasibilityColor = 'text-emerald-700 bg-emerald-50 border-emerald-200';
    injuryRiskScore = Math.min(35, 15 + (6 - params.restDaysBetweenRuns) * 3);
  } else if (shavePerWeek <= 9.5) {
    feasibilityLevel = 'moderate';
    feasibilityLabel = 'Balanced & On Track (5–9.5 sec/wk)';
    feasibilityColor = 'text-blue-700 bg-blue-50 border-blue-200';
    injuryRiskScore = 38 + (params.hasSpeedWork ? -5 : 10);
  } else if (shavePerWeek <= 14) {
    feasibilityLevel = 'aggressive';
    feasibilityLabel = 'Demanding Stretch Goal (9.5–14 sec/wk)';
    feasibilityColor = 'text-amber-700 bg-amber-50 border-amber-200';
    injuryRiskScore = 65 + (params.runsPerWeek < 3 ? 15 : 0) + (params.restDaysBetweenRuns < 2 ? 10 : 0);
  } else {
    feasibilityLevel = 'unrealistic';
    feasibilityLabel = 'High Injury Risk / Aggressive (> 14 sec/wk)';
    feasibilityColor = 'text-rose-700 bg-rose-50 border-rose-200';
    injuryRiskScore = Math.min(95, 80 + Math.round(shavePerWeek));
  }

  // Week-by-week projection
  const weeklyMilestones = [];
  const baseMilesPerWeek = params.runsPerWeek * 5.5;

  for (let w = 0; w <= weeks; w++) {
    // Non-linear adaptation curve: early neuromuscular gains slightly faster
    const progressFactor = w === 0 ? 0 : Math.pow(w / weeks, 0.92);
    const projectedPace = currentPaceSec - (totalDiffSec * progressFactor);
    weeklyMilestones.push({
      week: w,
      projectedPaceSec: Math.round(projectedPace),
      targetPaceSec: Math.round(targetPaceSec),
      weeklyMiles: Math.round(baseMilesPerWeek + (w * 0.8))
    });
  }

  // Riegel race time comparisons: T2 = T1 * (D2 / D1)^1.06
  // Distance in miles: 5K = 3.10686, 10K = 6.21371, Half = 13.1094, Full = 26.2188
  const halfDist = 13.1094;
  const currentTotalHalfMinutes = (currentPaceSec * halfDist) / 60;
  const targetTotalHalfMinutes = (params.targetTimeHours * 60 + params.targetTimeMinutes);

  const calculateRiegelTime = (halfMinutes: number, raceDist: number) => {
    const raceMins = halfMinutes * Math.pow(raceDist / halfDist, 1.06);
    return formatTimeHoursMins(raceMins);
  };

  const riegelEquivalents = [
    {
      race: '5K',
      distance: '3.1 mi',
      projectedTime: calculateRiegelTime(currentTotalHalfMinutes, 3.10686),
      targetTime: calculateRiegelTime(targetTotalHalfMinutes, 3.10686)
    },
    {
      race: '10K',
      distance: '6.2 mi',
      projectedTime: calculateRiegelTime(currentTotalHalfMinutes, 6.21371),
      targetTime: calculateRiegelTime(targetTotalHalfMinutes, 6.21371)
    },
    {
      race: 'Half Marathon',
      distance: '13.1 mi',
      projectedTime: formatTimeHoursMins(currentTotalHalfMinutes),
      targetTime: formatTimeHoursMins(targetTotalHalfMinutes)
    },
    {
      race: 'Full Marathon',
      distance: '26.2 mi',
      projectedTime: calculateRiegelTime(currentTotalHalfMinutes, 26.2188),
      targetTime: calculateRiegelTime(targetTotalHalfMinutes, 26.2188)
    }
  ];

  let verdictTip = '';
  if (feasibilityLevel === 'optimal') {
    verdictTip = `Shaving ${shavePerWeek.toFixed(1)}s/mile each week is well within physiological bounds. Focus on aerobic base building and consistent weekly mileage.`;
  } else if (feasibilityLevel === 'moderate') {
    verdictTip = `Targeting ${shavePerWeek.toFixed(1)}s/mile per week is realistic with structured interval workouts and at least 2 full rest/recovery days.`;
  } else if (feasibilityLevel === 'aggressive') {
    verdictTip = `At ${shavePerWeek.toFixed(1)}s/mile per week, this is a demanding climb. Adding 2-3 weeks to your race timeline reduces required weekly drop to ${(totalDiffSec / (weeks + 3)).toFixed(1)}s.`;
  } else {
    verdictTip = `Shaving ${shavePerWeek.toFixed(1)}s/mile each week carries high risk of shin splints or burnout. We recommend shifting target finish to ${formatTimeHoursMins(targetTotalHalfMinutes + 12)} or extending preparation by 4+ weeks.`;
  }

  return {
    currentPaceSeconds: currentPaceSec,
    targetPaceSeconds: targetPaceSec,
    totalPaceDiffSeconds: totalDiffSec,
    shavePerWeekSeconds: shavePerWeek,
    feasibilityLevel,
    feasibilityLabel,
    feasibilityColor,
    injuryRiskScore,
    weeklyMilestones,
    riegelEquivalents,
    verdictTip
  };
}

// ==========================================
// 2. HOUSING & LIVING CHOICES MODEL
// ==========================================

export interface HousingOptionOutcome {
  id: string;
  name: string;
  effectiveRent: number;
  effectiveUtilities: number;
  monthlyTransitCost: number;
  monthlyCommuteHours: number;
  monthlyTimeCost: number;
  totalMonthlyDirectCost: number;
  monthlySavings: number;
  annualCashSavings: number;
  annualTimeAdjustedSavings: number;
  savingsRatePercent: number;
  isWinner: boolean;
}

export interface HousingModelResult {
  options: HousingOptionOutcome[];
  bestOption: HousingOptionOutcome;
  maxAnnualSavings: number;
  monthlyTrajectory: { month: number; [key: string]: number }[];
  summaryVerdict: string;
}

export function calculateHousingModel(params: HousingParams): HousingModelResult {
  const outcomes: HousingOptionOutcome[] = params.options.map(opt => {
    const split = Math.max(1, opt.roommateSplit);
    const effectiveRent = opt.rent / split;
    const effectiveUtilities = opt.utilities / split;
    const monthlyTransit = opt.commuteTransitCostPerMonth;
    
    // 4.33 weeks per month, round-trip minutes
    const monthlyCommuteHours = (opt.commuteDaysPerWeek * 4.33 * (opt.commuteOneWayMinutes * 2)) / 60;
    const monthlyTimeCost = monthlyCommuteHours * params.hourlyTimeValuation;
    
    const totalMonthlyDirectCost = effectiveRent + effectiveUtilities + monthlyTransit;
    const monthlySavings = params.monthlyNetIncome - totalMonthlyDirectCost - params.discretionaryBuffer;
    const annualCashSavings = monthlySavings * 12;
    const annualTimeAdjustedSavings = (monthlySavings - monthlyTimeCost) * 12;
    const savingsRatePercent = (monthlySavings / params.monthlyNetIncome) * 100;

    return {
      id: opt.id,
      name: opt.name,
      effectiveRent,
      effectiveUtilities,
      monthlyTransitCost: monthlyTransit,
      monthlyCommuteHours: Math.round(monthlyCommuteHours * 10) / 10,
      monthlyTimeCost: Math.round(monthlyTimeCost),
      totalMonthlyDirectCost: Math.round(totalMonthlyDirectCost),
      monthlySavings: Math.round(monthlySavings),
      annualCashSavings: Math.round(annualCashSavings),
      annualTimeAdjustedSavings: Math.round(annualTimeAdjustedSavings),
      savingsRatePercent: Math.round(savingsRatePercent * 10) / 10,
      isWinner: false
    };
  });

  // Determine winner based on annual time-adjusted net savings (or raw cash)
  let best = outcomes[0];
  outcomes.forEach(opt => {
    if (opt.annualCashSavings > best.annualCashSavings) {
      best = opt;
    }
  });
  outcomes.forEach(opt => {
    if (opt.id === best.id) {
      opt.isWinner = true;
    }
  });

  // 12-Month savings trajectory
  const monthlyTrajectory = [];
  for (let m = 1; m <= 12; m++) {
    const row: { month: number; [key: string]: number } = { month: m };
    outcomes.forEach(opt => {
      row[opt.id] = opt.monthlySavings * m;
    });
    monthlyTrajectory.push(row);
  }

  const runnerUp = outcomes.filter(o => o.id !== best.id).sort((a, b) => b.annualCashSavings - a.annualCashSavings)[0];
  const delta = best.annualCashSavings - (runnerUp ? runnerUp.annualCashSavings : 0);

  const summaryVerdict = `${best.name} yields the highest net savings of $${best.annualCashSavings.toLocaleString()}/yr ($${best.monthlySavings.toLocaleString()}/mo), delivering a $${delta.toLocaleString()} annual financial edge over ${runnerUp?.name || 'alternatives'}.`;

  return {
    options: outcomes,
    bestOption: best,
    maxAnnualSavings: best.annualCashSavings,
    monthlyTrajectory,
    summaryVerdict
  };
}

// ==========================================
// 3. COURSEWORK & GPA OPTIMIZER
// ==========================================

export const GRADE_SCALE: { grade: string; minScore: number; gpaPoints: number }[] = [
  { grade: 'A', minScore: 93, gpaPoints: 4.0 },
  { grade: 'A-', minScore: 90, gpaPoints: 3.7 },
  { grade: 'B+', minScore: 87, gpaPoints: 3.3 },
  { grade: 'B', minScore: 83, gpaPoints: 3.0 },
  { grade: 'B-', minScore: 80, gpaPoints: 2.7 },
  { grade: 'C+', minScore: 77, gpaPoints: 2.3 },
  { grade: 'C', minScore: 73, gpaPoints: 2.0 },
  { grade: 'D', minScore: 60, gpaPoints: 1.0 },
  { grade: 'F', minScore: 0, gpaPoints: 0.0 }
];

export interface GpaModelResult {
  currentSecuredPoints: number;
  finalWeight: number;
  requiredFinalScore: number;
  feasibilityRating: 'guaranteed' | 'achievable' | 'high-stakes' | 'unrealistic' | 'impossible';
  feasibilityLabel: string;
  feasibilityColor: string;
  projectedNewCumulativeGpa: number;
  gpaDelta: number;
  sensitivityCurve: { finalScore: number; overallCourseGrade: number; resultingGpaPoints: number; resultingLetter: string }[];
  breakdownSummary: string;
}

export function calculateGpaModel(params: GpaParams): GpaModelResult {
  const midtermContribution = (params.midtermScore * params.midtermWeight) / 100;
  const assignmentContribution = (params.assignmentScore * params.assignmentWeight) / 100;
  const securedPoints = midtermContribution + assignmentContribution;
  const finalWeight = params.finalExamWeight;

  const targetGradeObj = GRADE_SCALE.find(g => g.grade === params.targetLetterGrade) || GRADE_SCALE[0];
  const targetThreshold = targetGradeObj.minScore;

  // Final score needed = (Target Threshold - Secured) / (Final Weight / 100)
  const requiredFinal = (targetThreshold - securedPoints) / (finalWeight / 100);

  let feasibilityRating: 'guaranteed' | 'achievable' | 'high-stakes' | 'unrealistic' | 'impossible' = 'achievable';
  let feasibilityLabel = 'Realistic & Within Reach';
  let feasibilityColor = 'text-emerald-700 bg-emerald-50 border-emerald-200';

  if (requiredFinal <= 0) {
    feasibilityRating = 'guaranteed';
    feasibilityLabel = 'Already Secured (even with 0% on Final)';
    feasibilityColor = 'text-emerald-700 bg-emerald-50 border-emerald-200';
  } else if (requiredFinal <= 85) {
    feasibilityRating = 'achievable';
    feasibilityLabel = 'Comfortable Pace (≤ 85% on Final)';
    feasibilityColor = 'text-blue-700 bg-blue-50 border-blue-200';
  } else if (requiredFinal <= 94) {
    feasibilityRating = 'high-stakes';
    feasibilityLabel = 'Challenging Study Rigor (85–94% on Final)';
    feasibilityColor = 'text-amber-700 bg-amber-50 border-amber-200';
  } else if (requiredFinal <= 100) {
    feasibilityRating = 'unrealistic';
    feasibilityLabel = 'Near-Flawless Execution Needed (95–100%)';
    feasibilityColor = 'text-orange-700 bg-orange-50 border-orange-200';
  } else {
    feasibilityRating = 'impossible';
    feasibilityLabel = `Requires ${(requiredFinal).toFixed(1)}% (Impossible without extra credit)`;
    feasibilityColor = 'text-rose-700 bg-rose-50 border-rose-200';
  }

  // Calculate new cumulative GPA
  const totalPriorCredits = params.completedCreditHours;
  const courseCredits = params.currentCourseCredits;
  const totalCreditsNew = totalPriorCredits + courseCredits;
  const targetGpaPoints = targetGradeObj.gpaPoints;

  const newGpa = (params.currentCumulativeGpa * totalPriorCredits + targetGpaPoints * courseCredits) / totalCreditsNew;
  const gpaDelta = newGpa - params.currentCumulativeGpa;

  // Generate sensitivity curve for final exam scores from 40% to 100% in 5% steps
  const sensitivityCurve = [];
  for (let s = 40; s <= 100; s += 5) {
    const overall = securedPoints + (s * finalWeight) / 100;
    const gradeMatch = GRADE_SCALE.find(g => overall >= g.minScore) || GRADE_SCALE[GRADE_SCALE.length - 1];
    const simNewGpa = (params.currentCumulativeGpa * totalPriorCredits + gradeMatch.gpaPoints * courseCredits) / totalCreditsNew;
    sensitivityCurve.push({
      finalScore: s,
      overallCourseGrade: Math.round(overall * 10) / 10,
      resultingGpaPoints: gradeMatch.gpaPoints,
      resultingLetter: gradeMatch.grade,
      simNewGpa: Math.round(simNewGpa * 100) / 100
    });
  }

  const breakdownSummary = requiredFinal <= 100 && requiredFinal > 0
    ? `You need at least ${requiredFinal.toFixed(1)}% on the final to secure an ${params.targetLetterGrade}. Doing so moves your cumulative GPA from ${params.currentCumulativeGpa.toFixed(2)} to ${newGpa.toFixed(2)} (+${gpaDelta >= 0 ? '+' : ''}${gpaDelta.toFixed(3)}).`
    : requiredFinal <= 0
    ? `You have already locked in an ${params.targetLetterGrade} for the class based on your current coursework points!`
    : `An ${params.targetLetterGrade} requires ${requiredFinal.toFixed(1)}%, which exceeds 100%. Adjusting target to next grade tier is mathematically sound.`;

  return {
    currentSecuredPoints: Math.round(securedPoints * 10) / 10,
    finalWeight,
    requiredFinalScore: Math.round(requiredFinal * 10) / 10,
    feasibilityRating,
    feasibilityLabel,
    feasibilityColor,
    projectedNewCumulativeGpa: Math.round(newGpa * 100) / 100,
    gpaDelta: Math.round(gpaDelta * 1000) / 1000,
    sensitivityCurve,
    breakdownSummary
  };
}

// ==========================================
// 4. CAMPUS EVENT & CLUB BUDGETING
// ==========================================

export interface BudgetModelResult {
  totalRevenue: number;
  totalExpenses: number;
  netMargin: number;
  breakEvenAttendees: number;
  contributionMarginPerTicket: number;
  fixedCosts: number;
  variableCosts: number;
  isProfitable: boolean;
  revenueVsCostCurve: { attendees: number; revenue: number; totalCost: number; netProfit: number }[];
  marginSummary: string;
}

export function calculateBudgetModel(params: BudgetParams): BudgetModelResult {
  const fixedCosts = params.venueRentalCost + params.equipmentAVCost + params.marketingBudget;
  const variableCosts = params.expectedAttendees * params.foodCostPerPerson;
  const ticketRevenue = params.expectedAttendees * params.ticketPrice;
  const totalRevenue = ticketRevenue + params.sponsorSubsidy;
  const totalExpenses = fixedCosts + variableCosts;
  const netMargin = totalRevenue - totalExpenses;

  const contributionMarginPerTicket = params.ticketPrice - params.foodCostPerPerson;
  const netFixedCostAfterSponsor = fixedCosts - params.sponsorSubsidy;

  let breakEvenAttendees = 0;
  if (contributionMarginPerTicket > 0) {
    breakEvenAttendees = Math.max(0, Math.ceil(netFixedCostAfterSponsor / contributionMarginPerTicket));
  } else if (netFixedCostAfterSponsor <= 0) {
    breakEvenAttendees = 0;
  } else {
    breakEvenAttendees = Infinity; // Will lose money on every extra attendee
  }

  // Curve points up to 1.5x expected attendees
  const maxRange = Math.max(200, Math.ceil(params.expectedAttendees * 1.5));
  const step = Math.max(10, Math.floor(maxRange / 10));
  const revenueVsCostCurve = [];

  for (let att = 0; att <= maxRange; att += step) {
    const rev = (att * params.ticketPrice) + params.sponsorSubsidy;
    const exp = fixedCosts + (att * params.foodCostPerPerson);
    revenueVsCostCurve.push({
      attendees: att,
      revenue: Math.round(rev),
      totalCost: Math.round(exp),
      netProfit: Math.round(rev - exp)
    });
  }

  const isProfitable = netMargin >= 0;
  const marginSummary = isProfitable
    ? `At ${params.expectedAttendees} attendees, the event yields a net surplus of +$${netMargin.toLocaleString()} (Break-even reaches at ${breakEvenAttendees} tickets).`
    : `Current projections show a -$${Math.abs(netMargin).toLocaleString()} deficit. Need ${breakEvenAttendees} attendees to break even, or increase ticket price by $${Math.ceil(Math.abs(netMargin) / Math.max(1, params.expectedAttendees))}.`;

  return {
    totalRevenue,
    totalExpenses,
    netMargin,
    breakEvenAttendees,
    contributionMarginPerTicket,
    fixedCosts,
    variableCosts,
    isProfitable,
    revenueVsCostCurve,
    marginSummary
  };
}

// ==========================================
// 5. CUSTOM SANDBOX MODEL
// ==========================================

export interface CustomModelResult {
  computedValue: number;
  deltaToTarget: number;
  percentageOfTarget: number;
  sensitivityPoints: { value1: number; result: number }[];
}

export function calculateCustomModel(params: CustomParams): CustomModelResult {
  const [l1, l2, l3] = params.levers;
  let computed = 0;

  if (params.formulaType === 'linear-sum') {
    computed = l1.value + l2.value + l3.value;
  } else if (params.formulaType === 'multiplicative') {
    computed = (l1.value * l2.value) / Math.max(1, l3.value);
  } else {
    // efficiency ratio
    computed = ((l1.value * 100) / Math.max(1, l2.value)) * (1 + l3.value / 100);
  }

  const delta = computed - params.targetValue;
  const percentage = params.targetValue > 0 ? (computed / params.targetValue) * 100 : 100;

  // Sensitivity on lever 1
  const step = (l1.max - l1.min) / 10;
  const sensitivityPoints = [];
  for (let v = l1.min; v <= l1.max; v += step) {
    let res = 0;
    if (params.formulaType === 'linear-sum') {
      res = v + l2.value + l3.value;
    } else if (params.formulaType === 'multiplicative') {
      res = (v * l2.value) / Math.max(1, l3.value);
    } else {
      res = ((v * 100) / Math.max(1, l2.value)) * (1 + l3.value / 100);
    }
    sensitivityPoints.push({
      value1: Math.round(v * 10) / 10,
      result: Math.round(res * 10) / 10
    });
  }

  return {
    computedValue: Math.round(computed * 10) / 10,
    deltaToTarget: Math.round(delta * 10) / 10,
    percentageOfTarget: Math.round(percentage * 10) / 10,
    sensitivityPoints
  };
}

// ==========================================
// 6. LIVE TRADING CENTRE & FAMOUS IPO MODEL
// ==========================================

export const FAMOUS_IPOS: TradingIpoPreset[] = [
  {
    id: 'ipo-rddt',
    ticker: 'RDDT',
    companyName: 'Reddit, Inc.',
    year: 2024,
    sector: 'Social Media & AI Data Licensing',
    offerPrice: 34.0,
    firstDayClose: 50.44,
    firstDayPopPercent: 48.4,
    oversubscriptionRatio: 5.2,
    lockupPeriodDays: 180,
    postLockupReturnPercent: 88.5,
    description: 'Priced top of range ($34) with unique retail Directed Share Program, leading to an explosive first-day pop fueled by AI content licensing deals.',
    leadUnderwriter: 'Morgan Stanley & Goldman Sachs',
    sharesOfferedMillions: 22.0,
  },
  {
    id: 'ipo-arm',
    ticker: 'ARM',
    companyName: 'Arm Holdings plc',
    year: 2023,
    sector: 'Semiconductors & AI Architecture',
    offerPrice: 51.0,
    firstDayClose: 63.59,
    firstDayPopPercent: 24.7,
    oversubscriptionRatio: 11.5,
    lockupPeriodDays: 180,
    postLockupReturnPercent: 125.0,
    description: 'The largest tech IPO of 2023. SoftBank retained 90% ownership creating massive supply scarcity and an outsized post-lockup institutional surge.',
    leadUnderwriter: 'Barclays, Goldman Sachs, J.P. Morgan',
    sharesOfferedMillions: 95.5,
  },
  {
    id: 'ipo-snow',
    ticker: 'SNOW',
    companyName: 'Snowflake Inc.',
    year: 2020,
    sector: 'Enterprise Cloud Data Warehousing',
    offerPrice: 120.0,
    firstDayClose: 253.93,
    firstDayPopPercent: 111.6,
    oversubscriptionRatio: 22.0,
    lockupPeriodDays: 180,
    postLockupReturnPercent: -22.0,
    description: 'Legendary cloud software debut backed by Berkshire Hathaway & Salesforce. Doubled on day 1 before facing severe multiple compression at lockup expiry.',
    leadUnderwriter: 'Goldman Sachs & Morgan Stanley',
    sharesOfferedMillions: 28.0,
  },
  {
    id: 'ipo-abnb',
    ticker: 'ABNB',
    companyName: 'Airbnb, Inc.',
    year: 2020,
    sector: 'Travel & Alternative Accommodations',
    offerPrice: 68.0,
    firstDayClose: 144.71,
    firstDayPopPercent: 112.8,
    oversubscriptionRatio: 16.5,
    lockupPeriodDays: 180,
    postLockupReturnPercent: 18.0,
    description: 'Staged a dramatic pandemic comeback. Upwardly revised pricing twice from $44-$50 to $68 before exploding +113% on first trades.',
    leadUnderwriter: 'Morgan Stanley & Goldman Sachs',
    sharesOfferedMillions: 51.3,
  },
  {
    id: 'ipo-coin',
    ticker: 'COIN',
    companyName: 'Coinbase Global, Inc.',
    year: 2021,
    sector: 'Crypto Exchange & Web3 Infrastructure',
    offerPrice: 250.0, // Reference price
    firstDayClose: 328.28,
    firstDayPopPercent: 31.3,
    oversubscriptionRatio: 1.0, // Direct listing
    lockupPeriodDays: 0,
    postLockupReturnPercent: -45.0,
    description: 'High-profile direct listing with zero lockup restriction. Insiders liquidated into immediate euphoria, marking a textbook distribution top.',
    leadUnderwriter: 'Goldman Sachs (Financial Advisor)',
    sharesOfferedMillions: 114.9,
  },
  {
    id: 'ipo-rivn',
    ticker: 'RIVN',
    companyName: 'Rivian Automotive, Inc.',
    year: 2021,
    sector: 'Electric Vehicles & Clean Mobility',
    offerPrice: 78.0,
    firstDayClose: 100.73,
    firstDayPopPercent: 29.1,
    oversubscriptionRatio: 14.0,
    lockupPeriodDays: 180,
    postLockupReturnPercent: -68.0,
    description: 'Valued at over $100B with virtually zero production revenue. Soared to $179 before lockup expiration and Ford stake sales caused a sharp correction.',
    leadUnderwriter: 'Morgan Stanley, Goldman Sachs, J.P. Morgan',
    sharesOfferedMillions: 153.0,
  },
];

export interface TradingModelResult {
  actualAllocatedShares: number;
  fillRatePercent: number;
  capitalEmployed: number;
  unfilledCapitalReturned: number;
  day1ListingPrice: number;
  day1ProfitDollar: number;
  day1ReturnPercent: number;
  postLockupEstimatedPrice: number;
  postLockupProfitDollar: number;
  postLockupReturnPercent: number;
  stopLossPrice: number;
  maxRiskDollar: number;
  riskRewardRatio: number;
  breakEvenPrice: number;
  verdictRating: 'STRONG_UPSIDE' | 'MODERATE_OPPORTUNITY' | 'HIGH_VOLATILITY' | 'DILUTION_RISK';
  verdictLabel: string;
  verdictColor: string;
  verdictSummary: string;
  orderBookBids: { price: number; volume: number; total: number }[];
  orderBookAsks: { price: number; volume: number; total: number }[];
  priceTrajectoryCurve: {
    day: number;
    timeline: string;
    expectedPrice: number;
    bullPrice: number;
    bearPrice: number;
  }[];
  allotmentCurve: { oversubscription: number; estimatedShares: number; fillRate: number }[];
}

export function calculateTradingModel(params: TradingParams): TradingModelResult {
  // Institutional book-building allotment scaling:
  // Retail fill rate drops with oversubscription power decay
  const oversub = Math.max(1, params.oversubscriptionRatio);
  const fillRate = Math.min(1, Math.max(0.04, 1 / Math.pow(oversub, 0.76)));
  const fillRatePercent = Math.round(fillRate * 1000) / 10;

  // Max shares user could buy with capital committed vs requested
  const maxPossibleSharesByCapital = Math.floor(params.capitalCommitted / Math.max(1, params.offerPrice));
  const baseRequestedShares = Math.min(params.requestedShares, maxPossibleSharesByCapital);

  const actualAllocatedShares = Math.max(1, Math.floor(baseRequestedShares * fillRate));
  const capitalEmployed = Math.round(actualAllocatedShares * params.offerPrice * 100) / 100;
  const unfilledCapitalReturned = Math.max(0, Math.round((params.capitalCommitted - capitalEmployed) * 100) / 100);

  // Day 1 Dynamics
  const day1ListingPrice = Math.round(params.offerPrice * (1 + params.expectedDay1Pop / 100) * 100) / 100;
  const day1ProfitDollar = Math.round((day1ListingPrice - params.offerPrice) * actualAllocatedShares * 100) / 100;
  const day1ReturnPercent = Math.round(params.expectedDay1Pop * 10) / 10;

  // Post-Lockup Dynamics
  const postLockupEstimatedPrice = Math.max(
    1,
    Math.round(day1ListingPrice * (1 + params.postLockupDiscount / 100) * 100) / 100
  );
  const postLockupProfitDollar = Math.round((postLockupEstimatedPrice - params.offerPrice) * actualAllocatedShares * 100) / 100;
  const postLockupReturnPercent = Math.round(((postLockupEstimatedPrice - params.offerPrice) / params.offerPrice) * 1000) / 10;

  // Downside stop-loss execution
  const stopLossPrice = Math.round(params.offerPrice * (1 - params.stopLossPercent / 100) * 100) / 100;
  const maxRiskDollar = Math.round((params.offerPrice - stopLossPrice) * actualAllocatedShares * 100) / 100;
  const riskRewardRatio = maxRiskDollar > 0 ? Math.round((day1ProfitDollar / maxRiskDollar) * 100) / 100 : 0;
  const breakEvenPrice = params.offerPrice;

  // Verdict analysis
  let verdictRating: TradingModelResult['verdictRating'] = 'MODERATE_OPPORTUNITY';
  let verdictLabel = 'Favorable Risk/Reward';
  let verdictColor = 'text-emerald-700 bg-emerald-50 border-emerald-200';

  if (params.expectedDay1Pop > 30 && params.postLockupDiscount < -20) {
    verdictRating = 'DILUTION_RISK';
    verdictLabel = 'Day 1 Flip Recommended (Post-Lockup Dilution)';
    verdictColor = 'text-amber-700 bg-amber-50 border-amber-200';
  } else if (params.expectedDay1Pop > 35 && riskRewardRatio >= 3.0) {
    verdictRating = 'STRONG_UPSIDE';
    verdictLabel = 'High-Alpha Allocation Setup';
    verdictColor = 'text-emerald-700 bg-emerald-50 border-emerald-200';
  } else if (params.oversubscriptionRatio > 18) {
    verdictRating = 'HIGH_VOLATILITY';
    verdictLabel = 'Severe Book Rationing & Volatility Alert';
    verdictColor = 'text-indigo-700 bg-indigo-50 border-indigo-200';
  }

  const verdictSummary =
    params.lockupPeriodDays === 0
      ? `Day 1 Flipping: With a projected +${day1ReturnPercent}% listing pop, exiting at the open yields +$${day1ProfitDollar.toLocaleString()} on $${capitalEmployed.toLocaleString()} deployed (Fill rate: ${fillRatePercent}%).`
      : `Holding through ${params.lockupPeriodDays}-Day Lockup: Projected return is ${postLockupReturnPercent >= 0 ? '+' : ''}${postLockupReturnPercent}% ($${postLockupProfitDollar >= 0 ? '+' : ''}$${postLockupProfitDollar.toLocaleString()}). Post-lockup dilution discount is estimated at ${params.postLockupDiscount}%.`;

  // Generate realistic Level-2 Order Book Depth
  const orderBookBids = [
    { price: Math.round(params.offerPrice * 1.01 * 100) / 100, volume: Math.round(actualAllocatedShares * 3.2), total: 0 },
    { price: params.offerPrice, volume: Math.round(actualAllocatedShares * 5.4), total: 0 },
    { price: Math.round(params.offerPrice * 0.98 * 100) / 100, volume: Math.round(actualAllocatedShares * 8.1), total: 0 },
    { price: Math.round(params.offerPrice * 0.95 * 100) / 100, volume: Math.round(actualAllocatedShares * 12.0), total: 0 },
  ];
  let bidAccum = 0;
  for (const b of orderBookBids) {
    bidAccum += b.volume;
    b.total = bidAccum;
  }

  const orderBookAsks = [
    { price: Math.round(day1ListingPrice * 0.98 * 100) / 100, volume: Math.round(actualAllocatedShares * 2.1), total: 0 },
    { price: day1ListingPrice, volume: Math.round(actualAllocatedShares * 4.6), total: 0 },
    { price: Math.round(day1ListingPrice * 1.03 * 100) / 100, volume: Math.round(actualAllocatedShares * 7.5), total: 0 },
    { price: Math.round(day1ListingPrice * 1.07 * 100) / 100, volume: Math.round(actualAllocatedShares * 11.2), total: 0 },
  ];
  let askAccum = 0;
  for (const a of orderBookAsks) {
    askAccum += a.volume;
    a.total = askAccum;
  }

  // Price Trajectory Curve from Offer to Post-Lockup Expiry
  const lockDays = Math.max(30, params.lockupPeriodDays || 180);
  const curvePoints = [
    { day: 0, timeline: 'Offer Price' },
    { day: 1, timeline: 'Day 1 Open' },
    { day: Math.round(lockDays * 0.2), timeline: 'Month 1' },
    { day: Math.round(lockDays * 0.5), timeline: 'Mid-Lockup' },
    { day: lockDays, timeline: `${lockDays}D Lockup Expiry` },
    { day: Math.round(lockDays * 1.3), timeline: 'Post-Lockup Trade' },
  ];

  const priceTrajectoryCurve = curvePoints.map((pt) => {
    if (pt.day === 0) {
      return {
        day: pt.day,
        timeline: pt.timeline,
        expectedPrice: params.offerPrice,
        bullPrice: params.offerPrice,
        bearPrice: params.offerPrice,
      };
    }
    if (pt.day === 1) {
      return {
        day: pt.day,
        timeline: pt.timeline,
        expectedPrice: day1ListingPrice,
        bullPrice: Math.round(day1ListingPrice * 1.15 * 100) / 100,
        bearPrice: Math.round(day1ListingPrice * 0.88 * 100) / 100,
      };
    }
    const progress = Math.min(1, pt.day / lockDays);
    const midExpected = day1ListingPrice + (postLockupEstimatedPrice - day1ListingPrice) * progress;
    const volatilityFactor = Math.sqrt(pt.day / 30) * 0.08;

    return {
      day: pt.day,
      timeline: pt.timeline,
      expectedPrice: Math.round(midExpected * 100) / 100,
      bullPrice: Math.round(midExpected * (1 + volatilityFactor + 0.12) * 100) / 100,
      bearPrice: Math.max(1, Math.round(midExpected * (1 - volatilityFactor - 0.15) * 100) / 100),
    };
  });

  // Allotment Scale Matrix
  const allotmentCurve = [1, 2, 5, 10, 15, 20, 30].map((os) => {
    const r = Math.min(1, Math.max(0.04, 1 / Math.pow(os, 0.76)));
    const sh = Math.max(1, Math.floor(baseRequestedShares * r));
    return {
      oversubscription: os,
      estimatedShares: sh,
      fillRate: Math.round(r * 1000) / 10,
    };
  });

  return {
    actualAllocatedShares,
    fillRatePercent,
    capitalEmployed,
    unfilledCapitalReturned,
    day1ListingPrice,
    day1ProfitDollar,
    day1ReturnPercent,
    postLockupEstimatedPrice,
    postLockupProfitDollar,
    postLockupReturnPercent,
    stopLossPrice,
    maxRiskDollar,
    riskRewardRatio,
    breakEvenPrice,
    verdictRating,
    verdictLabel,
    verdictColor,
    verdictSummary,
    orderBookBids,
    orderBookAsks,
    priceTrajectoryCurve,
    allotmentCurve,
  };
}
