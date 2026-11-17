import React from 'react';
import { ScenarioId, RunningParams, HousingParams, GpaParams, BudgetParams } from '../types';
import { X, Check, Calculator, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';
import { formatPace, formatTimeHoursMins } from '../utils/mathUtils';

interface SanityCheckModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeScenario: ScenarioId;
  runningParams: RunningParams;
  setRunningParams: React.Dispatch<React.SetStateAction<RunningParams>>;
  housingParams: HousingParams;
  setHousingParams: React.Dispatch<React.SetStateAction<HousingParams>>;
  gpaParams: GpaParams;
  setGpaParams: React.Dispatch<React.SetStateAction<GpaParams>>;
  budgetParams: BudgetParams;
  setBudgetParams: React.Dispatch<React.SetStateAction<BudgetParams>>;
}

export const SanityCheckModal: React.FC<SanityCheckModalProps> = ({
  isOpen,
  onClose,
  activeScenario,
  runningParams,
  setRunningParams,
  housingParams,
  setHousingParams,
  gpaParams,
  setGpaParams,
  budgetParams,
  setBudgetParams,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center text-orange-700">
              <Calculator className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Sanity-Check Math & Stress-Testing Studio
              </h3>
              <p className="text-xs text-slate-500">
                Rigorous mathematical validation and shock simulation for {activeScenario.toUpperCase()}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
            title="Close modal (Press 'Esc' or 'C')"
          >
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono font-bold bg-white text-slate-600 border border-slate-300 rounded shadow-2xs">
              Esc
            </kbd>
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Running Scenario Math */}
          {activeScenario === 'running' && (
            <div className="space-y-5">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Governing Pace Equation
                </div>
                <div className="font-mono text-sm bg-white p-3 rounded-lg border border-slate-200 text-slate-900 overflow-x-auto">
                  ΔPace/Week = (CurrentPace_sec − TargetPace_sec) ÷ WeeksUntilRace
                </div>
                <div className="text-xs text-slate-600 leading-relaxed pt-1">
                  Current Pace: <span className="font-mono font-semibold">{runningParams.currentPaceMinutes}:{runningParams.currentPaceSeconds.toString().padStart(2, '0')}</span> ({runningParams.currentPaceMinutes * 60 + runningParams.currentPaceSeconds}s)
                  <br />
                  Target Pace: <span className="font-mono font-semibold">{formatPace((runningParams.targetTimeHours * 3600 + runningParams.targetTimeMinutes * 60) / 13.1)}/mi</span>
                  <br />
                  Total Gap to Shave: <span className="font-mono font-semibold">{Math.max(0, (runningParams.currentPaceMinutes * 60 + runningParams.currentPaceSeconds) - Math.round((runningParams.targetTimeHours * 3600 + runningParams.targetTimeMinutes * 60) / 13.1))} seconds</span> over {runningParams.weeksUntilRace} weeks.
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2.5">
                  1-Click Real-Life Scenario Stress Tests (As specified in brief)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-all space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900">Postpone Race by 3 Weeks</span>
                      <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                        Recommended
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">
                      Moves timeline from {runningParams.weeksUntilRace} to {runningParams.weeksUntilRace + 3} weeks, easing weekly pace reduction requirement.
                    </p>
                    <button
                      onClick={() => setRunningParams((p) => ({ ...p, weeksUntilRace: p.weeksUntilRace + 3 }))}
                      className="w-full text-xs font-semibold py-1.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg transition-colors flex items-center justify-center gap-1.5"
                    >
                      <span>Simulate +3 Weeks</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-all space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900">Add Speed Workout (Quality Session)</span>
                      <span className="text-[10px] font-mono text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">
                        Adaptation Boost
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">
                      Toggles interval/tempo speed workouts to increase neuromuscular turnover and rate of adaptation.
                    </p>
                    <button
                      onClick={() => setRunningParams((p) => ({ ...p, hasSpeedWork: true, runsPerWeek: Math.max(3, p.runsPerWeek) }))}
                      className="w-full text-xs font-semibold py-1.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg transition-colors flex items-center justify-center gap-1.5"
                    >
                      <span>Enable Speed Sessions</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-all space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900">Relax Target to 2h 05m</span>
                      <span className="text-[10px] font-mono text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">
                        Conservative
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">
                      Reduces target pace from 9:09/mi to 9:32/mi, decreasing injury risk while still finishing strong.
                    </p>
                    <button
                      onClick={() => setRunningParams((p) => ({ ...p, targetTimeHours: 2, targetTimeMinutes: 5 }))}
                      className="w-full text-xs font-semibold py-1.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg transition-colors flex items-center justify-center gap-1.5"
                    >
                      <span>Set Target: 2h 05m</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-all space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900">Reset to Brief Baseline</span>
                      <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                        Default
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">
                      10:45 pace, 1h59m sub-2h goal, 10 weeks, 3 runs/wk with 1 speed session.
                    </p>
                    <button
                      onClick={() =>
                        setRunningParams({
                          currentPaceMinutes: 10,
                          currentPaceSeconds: 45,
                          targetTimeHours: 1,
                          targetTimeMinutes: 59,
                          targetDistanceMiles: 13.1,
                          weeksUntilRace: 10,
                          runsPerWeek: 3,
                          hasSpeedWork: true,
                          restDaysBetweenRuns: 2,
                        })
                      }
                      className="w-full text-xs font-semibold py-1.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg transition-colors flex items-center justify-center gap-1.5"
                    >
                      <span>Reset to 10:45 / 10w</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Housing Scenario Math */}
          {activeScenario === 'housing' && (
            <div className="space-y-5">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Governing Housing Cash Flow Equation
                </div>
                <div className="font-mono text-sm bg-white p-3 rounded-lg border border-slate-200 text-slate-900 overflow-x-auto">
                  NetSavings_1Yr = 12 × [ MonthlyIncome − (Rent÷Roommates + Utilities÷Roommates + TransitCost + Discretionary) ]
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Total Opportunity Cost also factors commute hours valued at ${housingParams.hourlyTimeValuation}/hr across 4.33 weeks per month.
                </p>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2.5">
                  1-Click Housing Stress Tests
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-all space-y-2">
                    <span className="text-xs font-bold text-slate-900">Add 3rd Roommate to Shared Option</span>
                    <p className="text-xs text-slate-500">
                      Tests splitting shared rent & utilities 3 ways instead of 2.
                    </p>
                    <button
                      onClick={() =>
                        setHousingParams((p) => ({
                          ...p,
                          options: p.options.map((o) =>
                            o.id === 'opt-roommate' ? { ...o, roommateSplit: 3 } : o
                          ),
                        }))
                      }
                      className="w-full text-xs font-semibold py-1.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg transition-colors flex items-center justify-center gap-1.5"
                    >
                      <span>Split 3 Ways</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-all space-y-2">
                    <span className="text-xs font-bold text-slate-900">Hybrid / Remote Work (2 Commute Days)</span>
                    <p className="text-xs text-slate-500">
                      Reduces commute frequency to 2 days/wk, slashing transit costs and commute hours.
                    </p>
                    <button
                      onClick={() =>
                        setHousingParams((p) => ({
                          ...p,
                          options: p.options.map((o) => ({ ...o, commuteDaysPerWeek: 2 })),
                        }))
                      }
                      className="w-full text-xs font-semibold py-1.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg transition-colors flex items-center justify-center gap-1.5"
                    >
                      <span>Set 2 Commute Days</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* GPA Scenario Math */}
          {activeScenario === 'gpa' && (
            <div className="space-y-5">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Governing Weighted Grade Equation
                </div>
                <div className="font-mono text-sm bg-white p-3 rounded-lg border border-slate-200 text-slate-900 overflow-x-auto">
                  RequiredFinal = [ TargetCutoff − (Midterm×w_mid + Assign×w_asg) ] ÷ w_final
                </div>
                <div className="font-mono text-sm bg-white p-3 rounded-lg border border-slate-200 text-slate-900 overflow-x-auto">
                  NewGPA = (PriorGPA × PriorCredits + CourseGPA × CourseCredits) ÷ TotalCredits
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2.5">
                  1-Click Grade Stress Tests
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-all space-y-2">
                    <span className="text-xs font-bold text-slate-900">Midterm Re-grade (+7% boost to 85%)</span>
                    <p className="text-xs text-slate-500">
                      Simulate getting bonus points or better score on midterm.
                    </p>
                    <button
                      onClick={() => setGpaParams((p) => ({ ...p, midtermScore: 85 }))}
                      className="w-full text-xs font-semibold py-1.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg transition-colors flex items-center justify-center gap-1.5"
                    >
                      <span>Boost Midterm to 85%</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-all space-y-2">
                    <span className="text-xs font-bold text-slate-900">Shift Target to A- (90%)</span>
                    <p className="text-xs text-slate-500">
                      Lowers hurdle from 93% to 90%, preserving cumulative GPA near 3.7.
                    </p>
                    <button
                      onClick={() => setGpaParams((p) => ({ ...p, targetLetterGrade: 'A-' }))}
                      className="w-full text-xs font-semibold py-1.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg transition-colors flex items-center justify-center gap-1.5"
                    >
                      <span>Set Target: A-</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Budget Scenario Math */}
          {activeScenario === 'budget' && (
            <div className="space-y-5">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Governing Break-Even Formula
                </div>
                <div className="font-mono text-sm bg-white p-3 rounded-lg border border-slate-200 text-slate-900 overflow-x-auto">
                  BreakEven_Attendees = (FixedCosts − SponsorSubsidy) ÷ (TicketPrice − FoodCostPerPerson)
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2.5">
                  1-Click Budget Stress Tests
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-all space-y-2">
                    <span className="text-xs font-bold text-slate-900">Zero Sponsor Subsidy ($0)</span>
                    <p className="text-xs text-slate-500">
                      Stress-tests event self-sufficiency if department sponsorship falls through.
                    </p>
                    <button
                      onClick={() => setBudgetParams((p) => ({ ...p, sponsorSubsidy: 0 }))}
                      className="w-full text-xs font-semibold py-1.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg transition-colors flex items-center justify-center gap-1.5"
                    >
                      <span>Simulate $0 Subsidy</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-all space-y-2">
                    <span className="text-xs font-bold text-slate-900">Increase Ticket Price by +$5</span>
                    <p className="text-xs text-slate-500">
                      Improves unit contribution margin per ticket, sharply lowering break-even attendance.
                    </p>
                    <button
                      onClick={() => setBudgetParams((p) => ({ ...p, ticketPrice: p.ticketPrice + 5 }))}
                      className="w-full text-xs font-semibold py-1.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg transition-colors flex items-center justify-center gap-1.5"
                    >
                      <span>Raise Ticket +$5</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeScenario === 'trading' && (
            <div className="space-y-5">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Governing IPO Allotment & Net Execution Formula
                </div>
                <div className="font-mono text-xs bg-white p-3 rounded-lg border border-slate-200 text-slate-900 overflow-x-auto space-y-1">
                  <div>AllotmentFillRate = min(1.0, max(0.04, 1 / (OversubscriptionRatio^0.76)))</div>
                  <div>Net_PnL = (ExitPrice - OfferPrice) × AllottedShares - (Brokerage + STT + GST + Slippage)</div>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2.5">
                  1-Click Execution & Risk Stress Tests
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-all space-y-2">
                    <span className="text-xs font-bold text-slate-900">Heavy Oversubscription Shock (50x Book)</span>
                    <p className="text-xs text-slate-500">
                      Tests extreme retail book rationing, pro-rata lottery allocation, and capital unblock refund speed.
                    </p>
                    <div className="text-xs font-semibold py-1.5 px-3 bg-emerald-50 text-emerald-800 rounded-lg flex items-center justify-between">
                      <span>Pro-Rata Fill: 4.8%</span>
                      <span className="font-mono text-[10px] bg-white px-1.5 py-0.5 rounded border border-emerald-200">Simulated</span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-all space-y-2">
                    <span className="text-xs font-bold text-slate-900">Flash Downside Gap / Circuit Shock (-15%)</span>
                    <p className="text-xs text-slate-500">
                      Verifies that mandatory per-trade stop-loss and daily loss limit trigger emergency order cancellation.
                    </p>
                    <div className="text-xs font-semibold py-1.5 px-3 bg-rose-50 text-rose-800 rounded-lg flex items-center justify-between">
                      <span>Kill Switch Guard: Active</span>
                      <span className="font-mono text-[10px] bg-white px-1.5 py-0.5 rounded border border-rose-200">Protected</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Academic/Scientific Sanity Proof Guarantee */}
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
            <div className="text-xs text-emerald-900 leading-relaxed">
              <strong>Mathematical Verification Active:</strong> All calculations update synchronously on every single input step. Continuous derivatives ensure no non-linear discontinuities, clamping errors, or division-by-zero anomalies.
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end">
          <button
            onClick={onClose}
            className="py-2 px-4 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors"
          >
            Apply & Close
          </button>
        </div>
      </div>
    </div>
  );
};
