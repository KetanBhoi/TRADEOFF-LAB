import React, { useState, useMemo } from 'react';
import {
  INITIAL_FIRE_MILESTONES,
  runFireMonteCarloSimulation,
} from '../../utils/bestFeaturesData';
import { FireSimulationInput, FireGoalMilestone } from '../../types/trading';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from 'recharts';
import {
  Target,
  Flame,
  Info,
  Plus,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

interface FireGoalSimulatorTabProps {
  currentPortfolioValue?: number;
}

export const FireGoalSimulatorTab: React.FC<FireGoalSimulatorTabProps> = ({
  currentPortfolioValue = 289395,
}) => {
  const [simInput, setSimInput] = useState<FireSimulationInput>({
    currentCorpus: Math.max(currentPortfolioValue, 500000),
    monthlySip: 45000,
    annualStepUpPercent: 10,
    expectedCagrPercent: 12.0,
    annualVolatilityPercent: 16.0,
    inflationPercent: 6.0,
    annualExpenseToday: 900000, // ₹75,000/month today
    safeWithdrawalRate: 3.5,    // Indian conservative SWR
    yearsToSimulate: 20,
  });

  const [milestones, setMilestones] = useState<FireGoalMilestone[]>(INITIAL_FIRE_MILESTONES);
  const [newGoalName, setNewGoalName] = useState('');
  const [newGoalAmt, setNewGoalAmt] = useState(1500000);
  const [newGoalYears, setNewGoalYears] = useState(6);

  const output = useMemo(() => runFireMonteCarloSimulation(simInput), [simInput]);

  const formatCroresOrLakhs = (val: number) => {
    if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
    if (val >= 100000) return `₹${(val / 100000).toFixed(1)} L`;
    return `₹${val.toLocaleString('en-IN')}`;
  };

  const handleAddMilestone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoalName.trim()) return;
    setMilestones((prev) => [
      ...prev,
      {
        id: `goal-${Date.now()}`,
        name: newGoalName.trim(),
        targetAmountToday: Math.max(50000, newGoalAmt),
        yearsAway: Math.max(1, Math.min(35, newGoalYears)),
        priority: 'ASPIRATIONAL',
      },
    ]);
    setNewGoalName('');
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-orange-950/80 to-slate-900 text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-orange-300 font-medium mb-1">
            <span>400-Trial Stochastic Simulation</span>
            <span aria-hidden="true">·</span>
            <span>Indian CPI Inflation Adjusted</span>
            <span aria-hidden="true">·</span>
            <span>Step-Up SIP Engine</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
            <Flame className="w-5 h-5 text-orange-400" />
            <span>FIRE & Multi-Goal Wealth Projection Simulator</span>
          </h2>
          <p className="text-xs text-slate-300 max-w-2xl mt-1">
            Bridge active trading capital with long-term financial independence. Models market sequence risk, annual SIP step-ups, and Indian CPI inflation to project your real purchasing power corpus.
          </p>
        </div>

        <div className="bg-slate-800/80 border border-slate-700/60 p-3.5 rounded-xl shrink-0 flex items-center gap-4">
          <div>
            <div className="text-[11px] font-medium text-slate-400">FIRE Target (Today&apos;s ₹)</div>
            <div className="text-xl font-bold text-white font-mono tabular-nums">
              {formatCroresOrLakhs(output.fireNumberToday)}
            </div>
          </div>
          <div className="h-8 w-px bg-slate-700" />
          <div>
            <div className="text-[11px] font-medium text-slate-400">Success Probability</div>
            <div
              className={`text-xl font-bold font-mono tabular-nums ${
                output.probabilityOfSuccess >= 75
                  ? 'text-emerald-400'
                  : output.probabilityOfSuccess >= 50
                  ? 'text-amber-300'
                  : 'text-rose-400'
              }`}
            >
              {output.probabilityOfSuccess}%
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Parameters (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200 p-5 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2.5">
            Wealth & Inflation Assumptions
          </h3>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Starting Corpus (₹)
              </label>
              <input
                type="number"
                step={50000}
                value={simInput.currentCorpus}
                onChange={(e) =>
                  setSimInput({ ...simInput, currentCorpus: Math.max(0, Number(e.target.value)) })
                }
                className="w-full px-2.5 py-1.5 text-xs font-mono tabular-nums font-bold rounded-lg border border-slate-300"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Monthly SIP (₹)
              </label>
              <input
                type="number"
                step={2500}
                value={simInput.monthlySip}
                onChange={(e) =>
                  setSimInput({ ...simInput, monthlySip: Math.max(0, Number(e.target.value)) })
                }
                className="w-full px-2.5 py-1.5 text-xs font-mono tabular-nums font-bold rounded-lg border border-slate-300"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
              <span>Annual SIP Step-Up (%)</span>
              <span className="font-mono tabular-nums text-indigo-600">{simInput.annualStepUpPercent}% / yr</span>
            </div>
            <input
              type="range"
              min={0}
              max={25}
              step={1}
              value={simInput.annualStepUpPercent}
              onChange={(e) =>
                setSimInput({ ...simInput, annualStepUpPercent: Number(e.target.value) })
              }
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
              <span>Expected Nominal CAGR (%)</span>
              <span className="font-mono tabular-nums text-slate-900">{simInput.expectedCagrPercent}%</span>
            </div>
            <input
              type="range"
              min={7}
              max={18}
              step={0.5}
              value={simInput.expectedCagrPercent}
              onChange={(e) =>
                setSimInput({ ...simInput, expectedCagrPercent: Number(e.target.value) })
              }
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
              <span>Indian CPI Inflation (%)</span>
              <span className="font-mono tabular-nums text-rose-600">{simInput.inflationPercent}%</span>
            </div>
            <input
              type="range"
              min={4}
              max={9}
              step={0.5}
              value={simInput.inflationPercent}
              onChange={(e) =>
                setSimInput({ ...simInput, inflationPercent: Number(e.target.value) })
              }
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-rose-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Annual Expense (Today ₹)
              </label>
              <input
                type="number"
                step={50000}
                value={simInput.annualExpenseToday}
                onChange={(e) =>
                  setSimInput({
                    ...simInput,
                    annualExpenseToday: Math.max(120000, Number(e.target.value)),
                  })
                }
                className="w-full px-2.5 py-1.5 text-xs font-mono tabular-nums font-bold rounded-lg border border-slate-300"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Safe Withdrawal Rate %
              </label>
              <input
                type="number"
                step={0.25}
                min={2.5}
                max={5.0}
                value={simInput.safeWithdrawalRate}
                onChange={(e) =>
                  setSimInput({
                    ...simInput,
                    safeWithdrawalRate: Math.max(2, Number(e.target.value)),
                  })
                }
                className="w-full px-2.5 py-1.5 text-xs font-mono tabular-nums font-bold rounded-lg border border-slate-300"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
              <span>Investment Horizon (Years)</span>
              <span className="font-mono tabular-nums text-slate-900">{simInput.yearsToSimulate} Years</span>
            </div>
            <input
              type="range"
              min={5}
              max={35}
              step={1}
              value={simInput.yearsToSimulate}
              onChange={(e) =>
                setSimInput({ ...simInput, yearsToSimulate: Number(e.target.value) })
              }
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
          </div>
        </div>

        {/* Right Trajectory Chart & Milestones (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          {/* Outcome KPI Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white rounded-xl border border-slate-200 p-3.5">
              <div className="text-[11px] font-medium text-slate-500">Median Real Corpus</div>
              <div className="text-base font-bold text-slate-900 font-mono tabular-nums mt-0.5">
                {formatCroresOrLakhs(output.medianProjectedRealCorpus)}
              </div>
              <div className="text-[10px] text-slate-500">In today&apos;s purchasing power</div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-3.5">
              <div className="text-[11px] font-medium text-slate-500">Years to FIRE (P50)</div>
              <div className="text-base font-bold text-indigo-600 font-mono tabular-nums mt-0.5">
                {output.yearsToFireMedian !== null ? `${output.yearsToFireMedian} Years` : `>${simInput.yearsToSimulate} Yrs`}
              </div>
              <div className="text-[10px] text-slate-500">Based on median return path</div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-3.5">
              <div className="text-[11px] font-medium text-slate-500">Safe Monthly Income</div>
              <div className="text-base font-bold text-emerald-600 font-mono tabular-nums mt-0.5">
                ₹{output.sustainableMonthlyWithdrawalToday.toLocaleString('en-IN')}/mo
              </div>
              <div className="text-[10px] text-slate-500">At {simInput.safeWithdrawalRate}% SWR (Real ₹)</div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-3.5">
              <div className="text-[11px] font-medium text-slate-500">Nominal Target</div>
              <div className="text-base font-bold text-slate-700 font-mono tabular-nums mt-0.5">
                {formatCroresOrLakhs(output.fireNumberAtHorizon)}
              </div>
              <div className="text-[10px] text-slate-500">Year {new Date().getFullYear() + simInput.yearsToSimulate} value</div>
            </div>
          </div>

          {/* Monte Carlo Cone Chart */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Inflation-Adjusted Monte Carlo Wealth Cone (P10 / P50 / P90)
                </h3>
                <p className="text-[11px] text-slate-500">
                  Shows real purchasing power accounting for {simInput.annualVolatilityPercent}% annual equity volatility and {simInput.inflationPercent}% inflation.
                </p>
              </div>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={output.trajectory}
                  margin={{ top: 10, right: 15, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="year" tick={{ fontSize: 11, fill: '#64748b' }} />
                  <YAxis
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    tickFormatter={(v) => formatCroresOrLakhs(v)}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '0.75rem',
                      color: '#fff',
                      fontSize: '11px',
                    }}
                    formatter={(val: any, name: any) => [
                      formatCroresOrLakhs(Number(val ?? 0)),
                      name,
                    ]}
                  />
                  <ReferenceLine
                    y={output.fireNumberToday}
                    stroke="#ea580c"
                    strokeDasharray="4 4"
                    label={{
                      value: `FIRE Target (${formatCroresOrLakhs(output.fireNumberToday)})`,
                      position: 'insideTopLeft',
                      fill: '#ea580c',
                      fontSize: 10,
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="p90RealCorpus"
                    name="P90 Optimistic (Real)"
                    stroke="#10b981"
                    fill="#d1fae5"
                    fillOpacity={0.3}
                    strokeWidth={1.5}
                  />
                  <Area
                    type="monotone"
                    dataKey="p50RealCorpus"
                    name="P50 Median (Real)"
                    stroke="#4f46e5"
                    fill="#e0e7ff"
                    fillOpacity={0.45}
                    strokeWidth={2.5}
                  />
                  <Line
                    type="monotone"
                    dataKey="p10RealCorpus"
                    name="P10 Conservative (Real)"
                    stroke="#e11d48"
                    strokeWidth={1.75}
                    strokeDasharray="3 3"
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="investedPrincipal"
                    name="Principal Contributed (Real)"
                    stroke="#64748b"
                    strokeWidth={1.5}
                    dot={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Life Milestones Tracker */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Target className="w-4 h-4 text-orange-600" />
                <span>Real-Life Financial Milestones Feasibility Check</span>
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {milestones.map((m) => {
                const pointAtYear =
                  output.trajectory[Math.min(m.yearsAway, output.trajectory.length - 1)];
                const projectedAtGoal = pointAtYear ? pointAtYear.p50RealCorpus : 0;
                const progress = Math.min(
                  100,
                  Math.round((projectedAtGoal / m.targetAmountToday) * 100)
                );
                const isFunded = projectedAtGoal >= m.targetAmountToday;

                return (
                  <div
                    key={m.id}
                    className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-slate-900">{m.name}</span>
                      <span className="font-mono text-[11px] text-slate-500">
                        Year +{m.yearsAway}
                      </span>
                    </div>

                    <div className="flex justify-between font-mono tabular-nums text-[11px]">
                      <span className="text-slate-600">
                        Target: {formatCroresOrLakhs(m.targetAmountToday)}
                      </span>
                      <span className={isFunded ? 'text-emerald-700 font-bold' : 'text-amber-700 font-bold'}>
                        P50 Est: {formatCroresOrLakhs(projectedAtGoal)} ({progress}%)
                      </span>
                    </div>

                    <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-1.5 rounded-full ${
                          isFunded ? 'bg-emerald-600' : 'bg-amber-500'
                        }`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Add Custom Goal Inline Form */}
            <form onSubmit={handleAddMilestone} className="pt-2 border-t border-slate-100 flex flex-wrap items-end gap-2 text-xs">
              <div className="flex-1 min-w-[160px]">
                <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">
                  New Milestone Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Child Higher Education"
                  value={newGoalName}
                  onChange={(e) => setNewGoalName(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300"
                />
              </div>
              <div className="w-32">
                <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">
                  Amount (Today ₹)
                </label>
                <input
                  type="number"
                  step={100000}
                  value={newGoalAmt}
                  onChange={(e) => setNewGoalAmt(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 text-xs font-mono rounded-lg border border-slate-300"
                />
              </div>
              <div className="w-20">
                <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">
                  Years
                </label>
                <input
                  type="number"
                  min={1}
                  max={35}
                  value={newGoalYears}
                  onChange={(e) => setNewGoalYears(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 text-xs font-mono rounded-lg border border-slate-300"
                />
              </div>
              <button
                type="submit"
                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg transition-colors flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Goal</span>
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Statistical Caveat */}
      <div className="p-3.5 rounded-xl bg-slate-100 border border-slate-200 text-[11px] text-slate-600 flex items-start gap-2.5">
        <Info className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
        <span>
          Monte Carlo projections assume log-normal return distributions and constant inflation; real market regimes exhibit fat tails and varying tax laws. Use this planner for long-term savings calibration rather than guaranteed retirement forecasts.
        </span>
      </div>
    </div>
  );
};
