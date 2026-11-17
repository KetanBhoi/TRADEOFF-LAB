import React, { useState } from 'react';
import { GpaParams, LeverLimitThreshold } from '../../types';
import { calculateGpaModel, GRADE_SCALE } from '../../utils/mathUtils';
import { SliderInput } from '../common/SliderInput';
import { StatCard } from '../common/StatCard';
import { GpaRechartsChart } from '../charts/GpaRechartsChart';
import { RechartsSparkline, SparklineDataPoint } from '../common/RechartsSparkline';
import { ThresholdAlertBanner, ActiveThresholdViolation } from '../common/ThresholdAlertBanner';
import { DEFAULT_THRESHOLDS } from '../../utils/thresholdDefaults';
import { GraduationCap, Award, BookOpen, AlertCircle, CheckCircle, Info, Download, History, Columns, Globe, Sparkles } from 'lucide-react';

interface GpaScenarioProps {
  params: GpaParams;
  setParams: React.Dispatch<React.SetStateAction<GpaParams>>;
  onOpenSanityCheck: () => void;
  onOpenExport: () => void;
  onOpenHistory: () => void;
  onOpenSplitView?: () => void;
  onOpenGoogleSearch?: (query?: string) => void;
}

export const GpaScenario: React.FC<GpaScenarioProps> = ({
  params,
  setParams,
  onOpenSanityCheck,
  onOpenExport,
  onOpenHistory,
  onOpenSplitView,
  onOpenGoogleSearch,
}) => {
  const [showAssumptions, setShowAssumptions] = useState(false);

  // Custom limit thresholds for GPA levers
  const [thresholds, setThresholds] = useState<Record<string, LeverLimitThreshold>>(() => {
    const map: Record<string, LeverLimitThreshold> = {};
    DEFAULT_THRESHOLDS.gpa.forEach((t) => {
      map[t.leverKey] = t;
    });
    return map;
  });

  const handleUpdateThreshold = (updated: LeverLimitThreshold) => {
    setThresholds((prev) => ({
      ...prev,
      [updated.leverKey]: updated,
    }));
  };

  const model = calculateGpaModel(params);

  // Active threshold boundary violations
  const activeViolations: ActiveThresholdViolation[] = [];
  if (thresholds['midtermScore']?.enabled) {
    const t = thresholds['midtermScore'];
    const isViolated = t.type === 'min' ? params.midtermScore < t.limitValue : params.midtermScore > t.limitValue;
    if (isViolated) {
      activeViolations.push({
        threshold: t,
        currentValue: params.midtermScore,
        unit: '%',
        leverLabel: 'Midterm Exam Score',
        onSnapToLimit: () => setParams((p) => ({ ...p, midtermScore: t.limitValue })),
      });
    }
  }

  if (thresholds['finalExamWeight']?.enabled) {
    const t = thresholds['finalExamWeight'];
    const isViolated = t.type === 'max' ? params.finalExamWeight > t.limitValue : params.finalExamWeight < t.limitValue;
    if (isViolated) {
      activeViolations.push({
        threshold: t,
        currentValue: params.finalExamWeight,
        unit: '%',
        leverLabel: 'Final Exam Weight',
        onSnapToLimit: () => setParams((p) => ({ ...p, finalExamWeight: t.limitValue })),
      });
    }
  }

  const targetGradeObj = GRADE_SCALE.find((g) => g.grade === params.targetLetterGrade) || GRADE_SCALE[0];

  // Real-time sparkline calculations for GPA levers
  const midtermSweepSparkline: SparklineDataPoint[] = Array.from({ length: 13 }, (_, i) => {
    const m = 40 + i * 5;
    const earned = (m * params.midtermWeight + params.assignmentScore * params.assignmentWeight) / 100;
    const needed = Math.max(0, Math.min(100, Math.round(((targetGradeObj.minScore - earned) / (params.finalExamWeight / 100)) * 10) / 10));
    return {
      x: m,
      y: needed,
      formattedX: `Midterm ${m}%`,
      formattedY: `Final req ${needed}%`,
      isCurrent: m === params.midtermScore,
    };
  });

  const weightSweepSparkline: SparklineDataPoint[] = Array.from({ length: 9 }, (_, i) => {
    const w = 20 + i * 5;
    const remainingW = 100 - w;
    const ratio = params.midtermWeight / (params.midtermWeight + params.assignmentWeight || 1);
    const mW = remainingW * ratio;
    const aW = remainingW * (1 - ratio);
    const earned = (params.midtermScore * mW + params.assignmentScore * aW) / 100;
    const needed = Math.max(0, Math.min(100, Math.round(((targetGradeObj.minScore - earned) / (w / 100)) * 10) / 10));
    return {
      x: w,
      y: needed,
      formattedX: `Weight ${w}%`,
      formattedY: `Final req ${needed}%`,
      isCurrent: w === params.finalExamWeight,
    };
  });

  const cumulativeGpaSweep: SparklineDataPoint[] = Array.from({ length: 11 }, (_, i) => {
    const finalScore = 50 + i * 5;
    const coursePercent = (params.midtermScore * params.midtermWeight + params.assignmentScore * params.assignmentWeight + finalScore * params.finalExamWeight) / 100;
    const letter = GRADE_SCALE.find((g) => coursePercent >= g.minScore) || GRADE_SCALE[GRADE_SCALE.length - 1];
    const newGpa = Math.round(((params.currentCumulativeGpa * params.completedCreditHours + letter.gpaPoints * params.currentCourseCredits) / (params.completedCreditHours + params.currentCourseCredits)) * 100) / 100;
    return {
      x: finalScore,
      y: newGpa,
      formattedX: `Final ${finalScore}%`,
      formattedY: `New GPA ${newGpa.toFixed(2)}`,
      isCurrent: Math.abs(finalScore - Math.round(model.requiredFinalScore)) <= 3,
    };
  });

  return (
    <div className="space-y-6">
      {/* Scenario Brief Header Callout */}
      <div className="p-4 sm:p-5 rounded-xl bg-white border border-slate-200/90 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider bg-slate-100 text-slate-700 rounded border border-slate-200">
              Academic Model
            </span>
            <span className="text-xs font-semibold text-slate-500">
              Coursework & Cumulative GPA Optimizer
            </span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 mt-1.5">
            Exam Sensitivity & Degree GPA Impact
          </h2>
          <p className="text-xs text-slate-600 mt-1 max-w-3xl leading-relaxed">
            Determine the exact final exam score needed to lock in your desired letter grade, and visualize how this single course alters your cumulative college GPA.
          </p>
        </div>

        {/* Scenario-Specific Quick Presets */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider hidden sm:inline">Simulation:</span>
          <button
            onClick={() => setParams((p) => ({ ...p, currentCourseCredits: p.currentCourseCredits === 2 ? 4 : 2 }))}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
              params.currentCourseCredits === 2
                ? 'bg-orange-50 border-orange-300 text-orange-800'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            {params.currentCourseCredits === 2 ? 'Active: 2 Credits Weight' : 'Test: 2-Credit Course'}
          </button>
        </div>
      </div>

      {/* Main Two-Zone Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Grade & Exam Controls (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Safety & Academic Boundary Alert Banner */}
          <ThresholdAlertBanner violations={activeViolations} />

          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Coursework Variables
              </span>
              <span className="text-[11px] text-slate-500 font-mono">Exam Levers</span>
            </div>

            {/* Real-time Exam Sensitivity Sparkline */}
            <div className="p-2.5 rounded-lg bg-blue-50/70 border border-blue-200/90 space-y-1">
              <div className="flex items-center justify-between text-[11px] font-semibold text-blue-950">
                <span className="flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-blue-600" />
                  Final Exam Score Needed Sensitivity
                </span>
                <span className="font-mono text-[10px] text-blue-800 bg-white px-1.5 py-0.2 rounded border border-blue-200">
                  Target {params.targetLetterGrade}: <strong>{Math.round(model.requiredFinalScore)}%</strong>
                </span>
              </div>
              <RechartsSparkline
                data={midtermSweepSparkline}
                currentX={params.midtermScore}
                color="#2563eb"
                height={32}
                valueFormatter={(val) => `${val}%`}
                minLabel="Midterm 40%"
                maxLabel="Midterm 100%"
              />
            </div>

            {/* Target Letter Grade Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-800">
                Target Letter Grade
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {GRADE_SCALE.slice(0, 4).map((g) => (
                  <button
                    key={g.grade}
                    onClick={() => setParams((p) => ({ ...p, targetLetterGrade: g.grade }))}
                    className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all border ${
                      params.targetLetterGrade === g.grade
                        ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <span>{g.grade}</span>
                    <span className="block text-[10px] font-normal text-slate-400">{g.minScore}%</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Midterm Score */}
            <div className="pt-2 border-t border-slate-100">
              <SliderInput
                label="Midterm Exam Score"
                value={params.midtermScore}
                min={40}
                max={100}
                step={1}
                unit="%"
                hint={`Worth ${params.midtermWeight}% of grade`}
                onChange={(val) => setParams((p) => ({ ...p, midtermScore: val }))}
                sparklineData={midtermSweepSparkline}
                sparklineLabel="Required Final Score vs Midterm"
                sparklineFormatter={(val) => `${val}%`}
                sparklineColor="#2563eb"
                threshold={thresholds['midtermScore']}
                onThresholdChange={handleUpdateThreshold}
              />
            </div>

            {/* Assignments Score */}
            <div className="pt-2 border-t border-slate-100">
              <SliderInput
                label="Homework / Project Score"
                value={params.assignmentScore}
                min={40}
                max={100}
                step={1}
                unit="%"
                hint={`Worth ${params.assignmentWeight}% of grade`}
                onChange={(val) => setParams((p) => ({ ...p, assignmentScore: val }))}
              />
            </div>

            {/* Final Exam Weight */}
            <div className="pt-2 border-t border-slate-100">
              <SliderInput
                label="Final Exam Weight"
                value={params.finalExamWeight}
                min={20}
                max={50}
                step={5}
                unit="%"
                hint="Syllabus final exam weighting"
                onChange={(val) => setParams((p) => ({ ...p, finalExamWeight: val }))}
                sparklineData={weightSweepSparkline}
                sparklineLabel="Score Volatility vs Final Weight"
                sparklineFormatter={(val) => `${val}%`}
                sparklineColor="#2563eb"
                threshold={thresholds['finalExamWeight']}
                onThresholdChange={handleUpdateThreshold}
              />
            </div>

            {/* Course Credit Hours & Cumulative Baseline */}
            <div className="pt-2 border-t border-slate-100 space-y-3">
              <SliderInput
                label="Course Credit Hours"
                value={params.currentCourseCredits}
                min={1}
                max={5}
                step={1}
                unit="credits"
                hint="Supports 1 to 5 credit classes"
                onChange={(val) => setParams((p) => ({ ...p, currentCourseCredits: val }))}
                sparklineData={cumulativeGpaSweep}
                sparklineLabel="Degree GPA vs Final Exam Outcome"
                sparklineFormatter={(val) => val.toFixed(2)}
                sparklineColor="#2563eb"
              />

              <div className="grid grid-cols-2 gap-2">
                <SliderInput
                  label="Prior GPA"
                  value={params.currentCumulativeGpa}
                  min={2.0}
                  max={4.0}
                  step={0.05}
                  unit=""
                  displayValue={params.currentCumulativeGpa.toFixed(2)}
                  onChange={(val) => setParams((p) => ({ ...p, currentCumulativeGpa: val }))}
                />
                <SliderInput
                  label="Credits Done"
                  value={params.completedCreditHours}
                  min={12}
                  max={120}
                  step={3}
                  unit="cr"
                  onChange={(val) => setParams((p) => ({ ...p, completedCreditHours: val }))}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Visual Stage & Outcomes (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Top Live Metric Cards with Assumptions Toggle */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Academic Impact Metrics
              </span>
              <button
                type="button"
                onClick={() => setShowAssumptions(!showAssumptions)}
                className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg border transition-all ${
                  showAssumptions
                    ? 'bg-orange-50 border-orange-300 text-orange-900 shadow-2xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
                title="Toggle underlying formulas and mathematical assumptions across academic metrics"
              >
                <Info className="w-3.5 h-3.5 text-orange-600" />
                <span>{showAssumptions ? 'Hide Assumptions' : 'Assumptions & Formulas'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <StatCard
                label="Final Exam Score Required"
                value={model.requiredFinalScore <= 0 ? '0%' : `${model.requiredFinalScore}%`}
                unit={model.requiredFinalScore > 100 ? '(!)' : ''}
                deltaText={`Target: ${params.targetLetterGrade} (≥${targetGradeObj.minScore}%)`}
                subtext={model.feasibilityLabel}
                statusBadge={model.feasibilityRating.toUpperCase()}
                statusType={
                  model.feasibilityRating === 'guaranteed' || model.feasibilityRating === 'achievable'
                    ? 'nominal'
                    : model.feasibilityRating === 'high-stakes'
                    ? 'elevated'
                    : 'demanding'
                }
                showAssumptionsInline={showAssumptions}
                assumptionInfo={{
                  formula: 'ReqFinal = [ TargetMin − (Midterm×w_mid + Asg×w_asg) ] ÷ w_final',
                  substitution: `[${targetGradeObj.minScore}% − (${params.midtermScore}%×${params.midtermWeight}% + ${params.assignmentScore}%×${params.assignmentWeight}%)] ÷ ${params.finalExamWeight}% = ${model.requiredFinalScore}%`,
                  explanation: 'Determines the minimum final exam score percentage to push total course percentage at or above the target grade threshold.',
                  keyFactors: [
                    `Target minimum score for ${params.targetLetterGrade} is ${targetGradeObj.minScore}%`,
                    'Assumes no syllabus curve or extra credit compensation',
                    'Course components sum strictly to 100% of final grade'
                  ]
                }}
              />

              <StatCard
                label="Projected Cumulative GPA"
                value={model.projectedNewCumulativeGpa.toFixed(2)}
                unit="/ 4.00"
                deltaText={`${model.gpaDelta >= 0 ? '+' : ''}${model.gpaDelta.toFixed(3)} shift`}
                subtext={`From ${params.currentCumulativeGpa.toFixed(2)} baseline`}
                statusBadge={model.gpaDelta >= 0 ? 'Gaining' : 'Slipping'}
                statusType={model.gpaDelta >= 0 ? 'nominal' : 'elevated'}
                showAssumptionsInline={showAssumptions}
                assumptionInfo={{
                  formula: 'NewGPA = (PriorGPA × PriorCredits + CourseGPA × CourseCredits) ÷ TotalCredits',
                  substitution: `(${params.currentCumulativeGpa.toFixed(2)} × ${params.completedCreditHours}cr + ${targetGradeObj.gpaPoints} × ${params.currentCourseCredits}cr) ÷ ${params.completedCreditHours + params.currentCourseCredits}cr = ${model.projectedNewCumulativeGpa.toFixed(2)}`,
                  explanation: 'Credit-weighted institutional cumulative GPA computation incorporating quality points earned in this class.',
                  keyFactors: [
                    `Standard 4.0 scale: A=4.0, A-=3.7, B+=3.3, B=3.0, C=2.0`,
                    'Completed credit hours act as GPA inertia: higher credits dampen single-course volatility'
                  ]
                }}
              />

              <StatCard
                label="Course Points Locked"
                value={`${model.currentSecuredPoints}%`}
                unit={`/ ${100 - params.finalExamWeight}%`}
                deltaText={`${params.midtermWeight}% Mid + ${params.assignmentWeight}% Asg`}
                subtext={`Remaining: ${params.finalExamWeight}%`}
                statusBadge="Secured"
                statusType="neutral"
                showAssumptionsInline={showAssumptions}
                assumptionInfo={{
                  formula: 'SecuredPoints = MidtermScore × w_mid + AssignmentScore × w_asg',
                  substitution: `${params.midtermScore}% × ${params.midtermWeight}% + ${params.assignmentScore}% × ${params.assignmentWeight}% = ${model.currentSecuredPoints}%`,
                  explanation: 'Total non-negotiable points earned and banked prior to entering the final exam testing window.',
                  keyFactors: [
                    'Past coursework marks are assumed finalized without retroactive penalties'
                  ]
                }}
              />
            </div>
          </div>

          {/* Recharts Dual-Metric Sensitivity Curve */}
          <GpaRechartsChart
            sensitivityCurve={model.sensitivityCurve}
            targetCutoff={targetGradeObj.minScore}
            targetLetterGrade={params.targetLetterGrade}
            requiredFinalScore={model.requiredFinalScore}
            priorGpa={params.currentCumulativeGpa}
            midtermScore={params.midtermScore}
            midtermWeight={params.midtermWeight}
            assignmentScore={params.assignmentScore}
            assignmentWeight={params.assignmentWeight}
            finalExamWeight={params.finalExamWeight}
          />

          {/* Verdict Callout Banner */}
          <div className={`p-3.5 rounded-lg border flex items-start gap-3 ${model.feasibilityColor}`}>
            <Info className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="text-xs leading-relaxed">
              <strong>Academic Assessment:</strong> {model.breakdownSummary}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
