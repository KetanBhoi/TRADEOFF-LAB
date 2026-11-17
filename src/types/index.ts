/**
 * Types and interfaces for the TradeOff Lab Decision Visualizer
 */

export type ScenarioId = 'running' | 'housing' | 'gpa' | 'budget' | 'custom' | 'trading';

export type ThemeId = 'marathon' | 'collegiate' | 'slate' | 'emerald' | 'crimson';

export interface ThemeOption {
  id: ThemeId;
  name: string;
  badge: string;
  primaryColor: string;
  accentColor: string;
  description: string;
}

export interface RunningParams {
  currentPaceMinutes: number; // e.g. 10
  currentPaceSeconds: number; // e.g. 45 -> 10:45
  targetTimeHours: number;    // e.g. 1
  targetTimeMinutes: number;  // e.g. 59 -> 1h59m
  targetDistanceMiles: number; // 13.1 for half marathon
  weeksUntilRace: number;     // e.g. 10
  runsPerWeek: number;        // e.g. 3
  hasSpeedWork: boolean;      // e.g. true
  restDaysBetweenRuns: number; // e.g. 2
}

export interface HousingOption {
  id: string;
  name: string;
  rent: number;
  utilities: number;
  commuteDaysPerWeek: number;
  commuteOneWayMinutes: number;
  commuteTransitCostPerMonth: number;
  roommateSplit: number; // 1 = solo, 2 = 1 roommate, etc.
  description: string;
}

export interface HousingParams {
  monthlyNetIncome: number;
  hourlyTimeValuation: number; // opportunity cost of commute time
  discretionaryBuffer: number;
  options: HousingOption[];
}

export interface GpaParams {
  currentCumulativeGpa: number;
  completedCreditHours: number;
  currentCourseCredits: number;
  midtermWeight: number; // e.g. 25%
  midtermScore: number;  // e.g. 78%
  assignmentWeight: number; // e.g. 35%
  assignmentScore: number;  // e.g. 88%
  finalExamWeight: number; // e.g. 40%
  targetLetterGrade: string; // 'A', 'A-', 'B+', 'B', etc.
}

export interface BudgetParams {
  expectedAttendees: number;
  ticketPrice: number;
  foodCostPerPerson: number;
  venueRentalCost: number;
  equipmentAVCost: number;
  sponsorSubsidy: number;
  marketingBudget: number;
}

export interface CustomLever {
  id: string;
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  description: string;
}

export interface CustomParams {
  title: string;
  goalMetricName: string;
  goalMetricUnit: string;
  targetValue: number;
  formulaType: 'linear-sum' | 'multiplicative' | 'efficiency-ratio';
  levers: [CustomLever, CustomLever, CustomLever];
}

export interface TradingIpoPreset {
  id: string;
  ticker: string;
  companyName: string;
  year: number;
  sector: string;
  offerPrice: number;
  firstDayClose: number;
  firstDayPopPercent: number;
  oversubscriptionRatio: number;
  lockupPeriodDays: number;
  postLockupReturnPercent: number;
  description: string;
  leadUnderwriter: string;
  sharesOfferedMillions: number;
}

export interface TradingParams {
  selectedIpoId: string;
  ticker: string;
  companyName: string;
  offerPrice: number;            // $ per share (e.g. $34)
  requestedShares: number;       // targeted shares requested (e.g. 500)
  expectedDay1Pop: number;       // % expected first day gain (e.g. 38%)
  oversubscriptionRatio: number; // book demand multiplier (e.g. 5x)
  lockupPeriodDays: number;      // 0 (day 1 flip), 90, 180 days
  postLockupDiscount: number;    // % dilution / post-lockup price delta (e.g. -12%)
  stopLossPercent: number;       // % downside protection barrier (e.g. 8%)
  capitalCommitted: number;      // total dollar capital committed (e.g. $17,000)
}

export interface ChecklistStep {
  id: string;
  stepNumber: string;
  title: string;
  description: string;
  items: {
    id: string;
    text: string;
    completed: boolean;
    hint?: string;
  }[];
}

export type AnyScenarioParams =
  | RunningParams
  | HousingParams
  | GpaParams
  | BudgetParams
  | CustomParams
  | TradingParams;

export interface ScenarioHistorySnapshot {
  id: string;
  scenarioId: ScenarioId;
  scenarioTitle: string;
  timestamp: number;
  timeFormatted: string;
  keyHighlights: string;
  primaryMetric: string;
  params: AnyScenarioParams;
}

export interface LeverLimitThreshold {
  id: string;
  leverKey: string;
  enabled: boolean;
  type: 'max' | 'min'; // 'max' warns when current > limit; 'min' warns when current < limit
  limitValue: number;
  label: string;
  scenarioId: ScenarioId;
  description?: string;
  severity?: 'warning' | 'danger';
}

