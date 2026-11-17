/**
 * Archetype Presets & Custom Saved Configurations Store
 * Provides realistic pre-built life/industry archetypes for each scenario,
 * plus persistence in LocalStorage for user-saved scenarios.
 */

import {
  ScenarioId,
  RunningParams,
  HousingParams,
  GpaParams,
  BudgetParams,
  CustomParams,
} from '../types';

export interface ArchetypePreset {
  id: string;
  scenarioId: ScenarioId;
  name: string;
  badge: string;
  badgeColor: string;
  tagline: string;
  description: string;
  params: RunningParams | HousingParams | GpaParams | BudgetParams | CustomParams;
  keyDifferentiator: string;
}

export const PRESET_ARCHETYPES: ArchetypePreset[] = [
  // --- RUNNING SCENARIO ARCHETYPES ---
  {
    id: 'run_baseline_10wk',
    scenarioId: 'running',
    name: '10-Week Sub-2:00 Standard',
    badge: 'Baseline',
    badgeColor: 'bg-orange-100 text-orange-800 border-orange-200',
    tagline: 'Standard 10:45 long run to 9:09 race pace',
    description: '10-week balanced cardiovascular progression with 3 weekly runs, speed sessions, and conservative recovery intervals.',
    keyDifferentiator: 'Balanced 9.6 sec/wk pace shave demand with 48% moderate injury strain.',
    params: {
      currentPaceMinutes: 10,
      currentPaceSeconds: 45,
      targetTimeHours: 1,
      targetTimeMinutes: 59,
      targetDistanceMiles: 13.1,
      weeksUntilRace: 10,
      runsPerWeek: 3,
      hasSpeedWork: true,
      restDaysBetweenRuns: 2,
    } as RunningParams,
  },
  {
    id: 'run_aggressive_8wk',
    scenarioId: 'running',
    name: '8-Week Fast-Track Crunch',
    badge: 'High Stakes',
    badgeColor: 'bg-rose-100 text-rose-800 border-rose-200',
    tagline: 'Rapid 12.0s/wk pace shave with high volume',
    description: 'Compresses timeline to 8 weeks with 4 runs per week and intense threshold intervals. Demands rigorous recovery adherence.',
    keyDifferentiator: 'Requires aggressive 12.0 sec/wk pace cuts; elevated musculoskeletal load.',
    params: {
      currentPaceMinutes: 10,
      currentPaceSeconds: 45,
      targetTimeHours: 1,
      targetTimeMinutes: 59,
      targetDistanceMiles: 13.1,
      weeksUntilRace: 8,
      runsPerWeek: 4,
      hasSpeedWork: true,
      restDaysBetweenRuns: 1,
    } as RunningParams,
  },
  {
    id: 'run_conservative_16wk',
    scenarioId: 'running',
    name: '16-Week Aerobic Base Builder',
    badge: 'Conservative',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    tagline: 'Gentle 6.0s/wk pace shave with low injury risk',
    description: 'Extended 16-week runway that spreads aerobic adaptation gently across months, keeping risk below 25%.',
    keyDifferentiator: 'Gentle 6.0 sec/wk pace cut with minimum injury risk score.',
    params: {
      currentPaceMinutes: 10,
      currentPaceSeconds: 45,
      targetTimeHours: 1,
      targetTimeMinutes: 59,
      targetDistanceMiles: 13.1,
      weeksUntilRace: 16,
      runsPerWeek: 3,
      hasSpeedWork: false,
      restDaysBetweenRuns: 2,
    } as RunningParams,
  },

  // --- HOUSING SCENARIO ARCHETYPES ---
  {
    id: 'house_frugal_coop',
    scenarioId: 'housing',
    name: 'Maximum Savings Co-op (3 Roommates)',
    badge: 'Frugal',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    tagline: '3-way lease split with public transit focus',
    description: 'Prioritizes maximum monthly liquidity and emergency buffer growth by splitting rent and utilities across 3 occupants.',
    keyDifferentiator: 'Yields over $12,500/year in net liquid cash savings.',
    params: {
      monthlyNetIncome: 4200,
      hourlyTimeValuation: 32,
      discretionaryBuffer: 300,
      options: [
        {
          id: 'opt-stay',
          name: 'Current 1BR Lease',
          rent: 1850,
          utilities: 160,
          commuteDaysPerWeek: 5,
          commuteOneWayMinutes: 20,
          commuteTransitCostPerMonth: 85,
          roommateSplit: 1,
          description: 'Keep current single occupancy apartment close to work.',
        },
        {
          id: 'opt-roommate',
          name: '3-Person Shared Flat',
          rent: 2800,
          utilities: 240,
          commuteDaysPerWeek: 5,
          commuteOneWayMinutes: 25,
          commuteTransitCostPerMonth: 85,
          roommateSplit: 3,
          description: 'Share a spacious 3BR apartment split evenly among 3 occupants.',
        },
        {
          id: 'opt-studio',
          name: 'Outer Ring Transit Studio',
          rent: 1250,
          utilities: 130,
          commuteDaysPerWeek: 3,
          commuteOneWayMinutes: 45,
          commuteTransitCostPerMonth: 140,
          roommateSplit: 1,
          description: 'Frugal solo studio 45 minutes out by commuter rail.',
        },
      ],
    } as HousingParams,
  },
  {
    id: 'house_time_optimizer',
    scenarioId: 'housing',
    name: 'Time-Optimized Tech Professional',
    badge: 'Time-First',
    badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    tagline: 'Downtown walk-to-work, high opportunity valuation',
    description: 'Values commute time at $65/hr. Shows how short commutes make downtown living cheaper on an opportunity-cost basis.',
    keyDifferentiator: 'Downtown option wins on time-adjusted opportunity value.',
    params: {
      monthlyNetIncome: 6500,
      hourlyTimeValuation: 65,
      discretionaryBuffer: 600,
      options: [
        {
          id: 'opt-stay',
          name: 'Downtown Walk-to-Work (10 min)',
          rent: 2300,
          utilities: 180,
          commuteDaysPerWeek: 5,
          commuteOneWayMinutes: 10,
          commuteTransitCostPerMonth: 0,
          roommateSplit: 1,
          description: 'Walking distance to office, zero transit passes required.',
        },
        {
          id: 'opt-roommate',
          name: '2BR Luxury High-Rise Split',
          rent: 3400,
          utilities: 220,
          commuteDaysPerWeek: 5,
          commuteOneWayMinutes: 15,
          commuteTransitCostPerMonth: 40,
          roommateSplit: 2,
          description: 'Shared luxury high-rise with roommate 15 mins away.',
        },
        {
          id: 'opt-studio',
          name: 'Suburban Studio (50 min commute)',
          rent: 1400,
          utilities: 140,
          commuteDaysPerWeek: 5,
          commuteOneWayMinutes: 50,
          commuteTransitCostPerMonth: 160,
          roommateSplit: 1,
          description: 'Cheaper rent offset by 100 minutes of daily commuting.',
        },
      ],
    } as HousingParams,
  },

  // --- BUDGET SCENARIO ARCHETYPES ---
  {
    id: 'budget_campus_gala',
    scenarioId: 'budget',
    name: 'University Formal Banquet & Gala',
    badge: 'Premium Event',
    badgeColor: 'bg-purple-100 text-purple-800 border-purple-200',
    tagline: '$35 Ticket Tier, 250 attendees, formal catering',
    description: 'High fixed-cost ballroom venue with catered dinners ($16/person). Requires 140 guests to cross break-even.',
    keyDifferentiator: 'Break-even reached at 142 attendees; scales to $3,200 surplus.',
    params: {
      expectedAttendees: 250,
      ticketPrice: 35,
      foodCostPerPerson: 16,
      venueRentalCost: 1500,
      equipmentAVCost: 650,
      sponsorSubsidy: 800,
      marketingBudget: 350,
    } as BudgetParams,
  },
  {
    id: 'budget_free_hackathon',
    scenarioId: 'budget',
    name: 'Grassroots Hackathon (Sponsor Subsidized)',
    badge: 'Subsidized',
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
    tagline: '$5 admission, high sponsorship, 150 hackers',
    description: 'Low-cost student entry powered by $3,500 in corporate tech sponsorships and pizza catering.',
    keyDifferentiator: 'Fully profitable from guest #1 due to upfront sponsorship subsidy.',
    params: {
      expectedAttendees: 150,
      ticketPrice: 5,
      foodCostPerPerson: 12,
      venueRentalCost: 400,
      equipmentAVCost: 300,
      sponsorSubsidy: 3500,
      marketingBudget: 250,
    } as BudgetParams,
  },

  // --- GPA SCENARIO ARCHETYPES ---
  {
    id: 'gpa_premed_excellence',
    scenarioId: 'gpa',
    name: 'Pre-Med 4.0 Grade Cutoff Defense',
    badge: 'Pre-Med 4.0',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
    tagline: 'Defend 3.92 cumulative GPA with 93% A target',
    description: 'Strict 4-credit STEM course where maintaining graduate admission GPA requires an A (93% cutoff).',
    keyDifferentiator: 'Final exam score must reach 89.5% to preserve 3.90+ GPA tier.',
    params: {
      currentCumulativeGpa: 3.92,
      completedCreditHours: 64,
      currentCourseCredits: 4,
      midtermWeight: 25,
      midtermScore: 91,
      assignmentWeight: 35,
      assignmentScore: 95,
      finalExamWeight: 40,
      targetLetterGrade: 'A',
    } as GpaParams,
  },
  {
    id: 'gpa_midterm_recovery',
    scenarioId: 'gpa',
    name: 'Midterm Setback Comeback Strategy',
    badge: 'Comeback',
    badgeColor: 'bg-rose-100 text-rose-800 border-rose-200',
    tagline: 'Recover from a 68% midterm to secure a B+',
    description: 'Shows the exact mathematical final exam grade required to recover after a challenging midterm exam.',
    keyDifferentiator: 'Demands an 88.0% final exam performance to lock in a B+ (83%).',
    params: {
      currentCumulativeGpa: 3.25,
      completedCreditHours: 45,
      currentCourseCredits: 3,
      midtermWeight: 30,
      midtermScore: 68,
      assignmentWeight: 30,
      assignmentScore: 89,
      finalExamWeight: 40,
      targetLetterGrade: 'B+',
    } as GpaParams,
  },
];

const LOCAL_STORAGE_SAVED_PRESETS_KEY = 'tradeoff_lab_user_saved_presets_v1';

export function getSavedCustomPresets(): ArchetypePreset[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_SAVED_PRESETS_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveUserCustomPreset(
  scenarioId: ScenarioId,
  name: string,
  params: any,
  description?: string
): ArchetypePreset {
  const newPreset: ArchetypePreset = {
    id: `custom_${Date.now()}`,
    scenarioId,
    name,
    badge: 'Custom Saved',
    badgeColor: 'bg-slate-100 text-slate-800 border-slate-300',
    tagline: 'User-configured custom profile',
    description: description || 'User saved decision configuration checkpoint.',
    params,
    keyDifferentiator: 'Saved user scenario parameters snapshot.',
  };

  const existing = getSavedCustomPresets();
  const updated = [newPreset, ...existing];
  try {
    localStorage.setItem(LOCAL_STORAGE_SAVED_PRESETS_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to save preset to LocalStorage', err);
  }
  return newPreset;
}

export function deleteUserCustomPreset(presetId: string): void {
  const existing = getSavedCustomPresets();
  const updated = existing.filter((p) => p.id !== presetId);
  try {
    localStorage.setItem(LOCAL_STORAGE_SAVED_PRESETS_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to delete preset from LocalStorage', err);
  }
}
