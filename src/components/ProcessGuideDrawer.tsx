import React from 'react';
import { ChecklistStep, ScenarioId } from '../types';
import { CheckCircle2, Circle, X, ArrowRight, Lightbulb, ExternalLink } from 'lucide-react';

interface ProcessGuideDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeScenario: ScenarioId;
  onSelectScenario: (scenario: ScenarioId) => void;
  completedSteps: Record<string, boolean>;
  onToggleStep: (stepId: string) => void;
  onOpenSanityCheck: () => void;
}

export const INITIAL_CHECKLIST_STEPS: ChecklistStep[] = [
  {
    id: 'step-1',
    stepNumber: '01',
    title: 'Pick Your Scenario & Critical Levers',
    description: 'Select a decision dilemma you face, clarify the baseline, target metric, and the 2–3 levers that move the needle most.',
    items: [
      {
        id: 's1_scenario_defined',
        text: 'State baseline state, numerical target, and timeframe clearly',
        hint: 'e.g. Current 10:45 pace → Target sub-2:00 half marathon (9:09 pace) in 10 weeks.',
        completed: true,
      },
      {
        id: 's1_key_variables',
        text: 'Decide which 2–3 variables you can actually control (e.g. training frequency, timeline, pace)',
        hint: 'Discard constants you cannot control, such as official race distance.',
        completed: true,
      },
      {
        id: 's1_gemini_challenge',
        text: 'Challenge your assumptions & verify no missing blind spots',
        hint: 'Ask: "Push back where you disagree with my picks, and tell me if I\'m missing something obvious."',
        completed: false,
      },
    ],
  },
  {
    id: 'step-2',
    stepNumber: '02',
    title: 'Build & Calibrate Interactive Visualization',
    description: 'Give every lever a continuous slider, verify instantaneous chart recalculations, and test extreme bounds.',
    items: [
      {
        id: 's2_sliders_wired',
        text: 'Provide high-precision continuous sliders with real-time numeric readouts',
        hint: 'Ensure zero-latency reactive feedback when dragging any control.',
        completed: true,
      },
      {
        id: 's2_side_by_side',
        text: 'Show side-by-side comparative views or multi-curve visual trajectories',
        hint: 'Compare options or projected trajectories side by side to see which one wins.',
        completed: true,
      },
      {
        id: 's2_bounds_tested',
        text: 'Stress-test sliders from minimum to maximum bounds to confirm directional logic',
        hint: 'Increasing training rate should decrease final finish time; higher rent should reduce annual savings.',
        completed: false,
      },
      {
        id: 's2_restyle_theme',
        text: 'Restyle visualization colors to match domain or organizational brand identity',
        hint: 'Use Marathon Orange for athletics, Collegiate Navy for campus clubs, or Emerald for finances.',
        completed: false,
      },
    ],
  },
  {
    id: 'step-3',
    stepNumber: '03',
    title: 'Sanity-Check Math & Stress Test Scenarios',
    description: 'Verify mathematical integrity and simulate real-life shocks (e.g., postponing race by 3 weeks, adding a roommate).',
    items: [
      {
        id: 's3_real_shock_tested',
        text: 'Simulate a real what-if deviation (e.g., postponing race by 3 weeks or rent hike)',
        hint: 'Use the sanity-check math inspector to view the sensitivity derivative and trade-off rate.',
        completed: false,
      },
      {
        id: 's3_math_verified',
        text: 'Confirm formulas match empirical physical or financial reality',
        hint: 'Pace shave: (Current - Target) / Weeks. Savings: (Income - Direct Expenses - Buffer) * 12.',
        completed: false,
      },
      {
        id: 's3_decision_committed',
        text: 'Select the optimal path forward with quantitative confidence',
        hint: 'Export or screenshot the decision breakdown to discuss with peers or advisors.',
        completed: false,
      },
    ],
  },
];

export const ProcessGuideDrawer: React.FC<ProcessGuideDrawerProps> = ({
  isOpen,
  onClose,
  activeScenario,
  completedSteps,
  onToggleStep,
  onOpenSanityCheck,
}) => {
  if (!isOpen) return null;

  const totalChecklistCount = INITIAL_CHECKLIST_STEPS.flatMap((s) => s.items).length;
  const completedCount = Object.values(completedSteps).filter(Boolean).length;
  const progressPercent = Math.round((completedCount / totalChecklistCount) * 100);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end bg-slate-900/40 backdrop-blur-xs">
      <div className="w-full max-w-xl bg-white h-full shadow-2xl flex flex-col border-l border-slate-200">
        {/* Drawer Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <span>Decision Framework Guide</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono tabular-nums">{completedCount}/{totalChecklistCount} Tasks Complete</span>
            </div>
            <h2 className="text-lg font-bold text-slate-900 mt-0.5">
              Interactive Decision Blueprint
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
            title="Close guide"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-slate-200 h-1.5">
          <div
            className="h-1.5 bg-orange-600 transition-all duration-300"
            style={{
              width: `${progressPercent}%`,
              backgroundColor: 'var(--theme-primary, #ea580c)'
            }}
          />
        </div>

        {/* Drawer Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          <div className="p-3.5 bg-amber-50/70 border border-amber-200/80 rounded-xl flex items-start gap-3">
            <Lightbulb className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-900 leading-relaxed">
              <strong>How data visualization supports decision-making:</strong> When you adjust sliders for variables you understand, you avoid guessing how a decision plays out. You can test your assumptions in real time, stress-test trade-offs, and choose the best path forward with clarity.
            </div>
          </div>

          {INITIAL_CHECKLIST_STEPS.map((step) => {
            const stepDone = step.items.every((it) => !!completedSteps[it.id]);

            return (
              <div
                key={step.id}
                className="p-4 rounded-xl border border-slate-200 bg-white shadow-xs space-y-3"
              >
                <div className="flex items-baseline justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-slate-400">
                      {step.stepNumber}
                    </span>
                    <h3 className="text-sm font-bold text-slate-900">
                      {step.title}
                    </h3>
                  </div>
                  {stepDone && (
                    <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      Completed
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {step.description}
                </p>

                <div className="space-y-2 pt-1 border-t border-slate-100">
                  {step.items.map((item) => {
                    const isChecked = !!completedSteps[item.id];
                    return (
                      <div
                        key={item.id}
                        onClick={() => onToggleStep(item.id)}
                        className={`flex items-start gap-2.5 p-2 rounded-lg cursor-pointer transition-colors ${
                          isChecked ? 'bg-slate-50/80 text-slate-500' : 'hover:bg-slate-50 text-slate-800'
                        }`}
                      >
                        <button
                          type="button"
                          className="mt-0.5 shrink-0 text-slate-400 hover:text-slate-700 focus:outline-none"
                        >
                          {isChecked ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <Circle className="w-4 h-4 text-slate-300" />
                          )}
                        </button>
                        <div className="text-xs">
                          <div className={`font-medium ${isChecked ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                            {item.text}
                          </div>
                          {item.hint && (
                            <div className="text-[11px] text-slate-500 mt-0.5">
                              {item.hint}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {/* Quick Action: Open Math Sanity Check */}
          <div className="p-4 rounded-xl bg-slate-900 text-white space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold tracking-wide uppercase text-slate-300">
                Step III in Action
              </span>
              <span className="text-[11px] font-mono text-emerald-400">Live Sensitivity Engine</span>
            </div>
            <h4 className="text-sm font-bold">
              Run Sanity-Check Math & Stress Test
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Verify the exact mathematical derivatives behind your active model ({activeScenario}) and simulate shock variables (e.g. race date changes, rent spikes, exam weighting shifts).
            </p>
            <button
              onClick={() => {
                onClose();
                onOpenSanityCheck();
              }}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-white text-slate-900 rounded-lg text-xs font-semibold hover:bg-slate-100 transition-colors"
            >
              <span>Inspect Math Formulas & Stress Cases</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Drawer Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <span>Active scenario: <strong className="text-slate-800 capitalize">{activeScenario}</strong></span>
          <button
            onClick={onClose}
            className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 rounded font-medium text-slate-700 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
