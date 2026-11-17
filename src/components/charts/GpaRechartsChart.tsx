import React, { useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  ComposedChart,
} from 'recharts';
import { TrendingUp, GraduationCap, Activity, Award, BookOpen } from 'lucide-react';

interface GpaRechartsChartProps {
  sensitivityCurve: {
    finalScore: number;
    overallCourseGrade: number;
    resultingGpaPoints: number;
    resultingLetter: string;
    simNewGpa?: number;
  }[];
  targetCutoff: number;
  targetLetterGrade: string;
  requiredFinalScore: number;
  priorGpa: number;
  midtermScore?: number;
  midtermWeight?: number;
  assignmentScore?: number;
  assignmentWeight?: number;
  finalExamWeight?: number;
}

type GpaChartMode = 'midtermSweep' | 'finalCurve' | 'weightSweep';

export const GpaRechartsChart: React.FC<GpaRechartsChartProps> = ({
  sensitivityCurve,
  targetCutoff,
  targetLetterGrade,
  requiredFinalScore,
  priorGpa,
  midtermScore = 78,
  midtermWeight = 25,
  assignmentScore = 88,
  assignmentWeight = 35,
  finalExamWeight = 40,
}) => {
  const [viewMode, setViewMode] = useState<GpaChartMode>('midtermSweep');

  // 1. Final Exam Performance Curve (40% to 100%)
  const chartData = sensitivityCurve.map((pt) => ({
    finalScore: pt.finalScore,
    finalLabel: `${pt.finalScore}%`,
    courseGrade: pt.overallCourseGrade,
    simNewGpa: pt.simNewGpa || 0,
    letter: pt.resultingLetter,
  }));

  // 2. Sensitivity Sweep: Midterm Score (50% to 100% in 5% increments)
  const midtermSensitivityData = [];
  for (let mid = 50; mid <= 100; mid += 5) {
    const lockedPoints = (mid * midtermWeight + assignmentScore * assignmentWeight) / 100;
    const reqFinal = Math.round(((targetCutoff - lockedPoints) / (finalExamWeight / 100)) * 10) / 10;
    midtermSensitivityData.push({
      midterm: mid,
      midtermLabel: `${mid}%`,
      reqFinal: Math.max(0, reqFinal),
      isFeasible: reqFinal <= 100,
      isCurrent: mid === midtermScore,
    });
  }

  // 3. Sensitivity Sweep: Final Exam Weight (20% to 60% in 5% increments)
  const weightSensitivityData = [];
  for (let w = 20; w <= 60; w += 5) {
    // Redistribute remaining (100 - w) proportionally between midterm and assignments
    const curNonFinal = midtermWeight + assignmentWeight;
    const scale = (100 - w) / (curNonFinal || 60);
    const scaledMidWeight = midtermWeight * scale;
    const scaledAsgWeight = assignmentWeight * scale;
    const secured = (midtermScore * scaledMidWeight + assignmentScore * scaledAsgWeight) / 100;
    const reqFinal = Math.round(((targetCutoff - secured) / (w / 100)) * 10) / 10;

    weightSensitivityData.push({
      weight: w,
      weightLabel: `${w}%`,
      reqFinal: Math.max(0, reqFinal),
      isCurrent: w === finalExamWeight,
    });
  }

  // Tooltips
  const CustomFinalTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900/95 text-white p-3 rounded-lg shadow-xl border border-slate-700 text-xs font-mono space-y-1.5 z-50">
          <div className="font-bold text-orange-400 border-b border-slate-700 pb-1">
            Final Exam Score: {label}
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-slate-300">Course Grade:</span>
            <span className="font-bold text-white">{data.courseGrade}% ({data.letter})</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-slate-300">New Cum. GPA:</span>
            <span className="font-bold text-emerald-400">{data.simNewGpa.toFixed(2)}</span>
          </div>
        </div>
      );
    }
    return null;
  };

  const CustomMidtermTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900/95 text-white p-3 rounded-lg shadow-xl border border-slate-700 text-xs font-mono space-y-1.5 z-50">
          <div className="font-bold text-orange-400 border-b border-slate-700 pb-1">
            Midterm Score: {label} {data.isCurrent ? '(Active Setting)' : ''}
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-slate-300">Req. Final Exam Score:</span>
            <span className={`font-bold ${data.reqFinal <= 100 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {data.reqFinal}% {data.reqFinal > 100 ? '(Exceeds 100%)' : ''}
            </span>
          </div>
          <div className="text-[10px] text-slate-400 pt-0.5">
            {data.reqFinal <= 75
              ? '● Low Stakes / Comfortable cushion'
              : data.reqFinal <= 92
              ? '▲ Achievable with rigorous prep'
              : data.reqFinal <= 100
              ? '■ High-stakes pressure threshold'
              : '✕ Mathematically out of reach'}
          </div>
        </div>
      );
    }
    return null;
  };

  const CustomWeightTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900/95 text-white p-3 rounded-lg shadow-xl border border-slate-700 text-xs font-mono space-y-1.5 z-50">
          <div className="font-bold text-orange-400 border-b border-slate-700 pb-1">
            Final Exam Weight: {label} {data.isCurrent ? '(Active)' : ''}
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-slate-300">Required Score on Final:</span>
            <span className={`font-bold ${data.reqFinal <= 100 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {data.reqFinal}%
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

  const leveragePer5Percent = ((5 * midtermWeight) / finalExamWeight).toFixed(1);

  return (
    <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs space-y-3">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-orange-600" />
              <span>
                {viewMode === 'finalCurve'
                  ? 'Course Grade & Cumulative GPA Sensitivity Curve'
                  : viewMode === 'midtermSweep'
                  ? 'Sensitivity Analysis: Midterm Score vs. Required Final Exam'
                  : 'Sensitivity Analysis: Final Exam Weight vs. Exam Stakes'}
              </span>
            </h3>
            {viewMode !== 'finalCurve' && (
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-orange-100 text-orange-800 border border-orange-200">
                Sensitivity
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            {viewMode === 'finalCurve'
              ? 'Recharts dual-metric sweep mapping final exam performance (40%–100%) against resulting class standing.'
              : viewMode === 'midtermSweep'
              ? 'Sensitivity curve visualizing how midterm points gained or lost shift the required score on your final exam.'
              : 'Models how varying course syllabus weighting shifts test pressure and grade sensitivity.'}
          </p>
        </div>

        {/* View Mode Toggle */}
        <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-100 rounded-lg self-start sm:self-auto shrink-0">
          <button
            type="button"
            onClick={() => setViewMode('midtermSweep')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all whitespace-nowrap ${
              viewMode === 'midtermSweep'
                ? 'bg-white text-slate-900 shadow-2xs font-bold ring-1 ring-slate-200/50'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Midterm Sensitivity
          </button>
          <button
            type="button"
            onClick={() => setViewMode('finalCurve')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all whitespace-nowrap ${
              viewMode === 'finalCurve'
                ? 'bg-white text-slate-900 shadow-2xs font-bold ring-1 ring-slate-200/50'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Final vs Grade Curve
          </button>
          <button
            type="button"
            onClick={() => setViewMode('weightSweep')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all whitespace-nowrap ${
              viewMode === 'weightSweep'
                ? 'bg-white text-slate-900 shadow-2xs font-bold ring-1 ring-slate-200/50'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Syllabus Weight
          </button>
        </div>
      </div>

      {/* Main Recharts Area */}
      <div className="w-full h-64 select-none pt-2">
        <ResponsiveContainer width="100%" height="100%">
          {viewMode === 'finalCurve' ? (
            <LineChart
              data={chartData}
              margin={{ top: 10, right: 30, left: 10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis
                dataKey="finalLabel"
                stroke="#64748b"
                fontSize={11}
                tickLine={false}
                fontFamily="JetBrains Mono, monospace"
              />
              <YAxis
                yAxisId="left"
                domain={[50, 100]}
                stroke="#64748b"
                fontSize={11}
                tickLine={false}
                fontFamily="JetBrains Mono, monospace"
                width={45}
                unit="%"
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                domain={[2.5, 4.0]}
                stroke="#059669"
                fontSize={11}
                tickLine={false}
                fontFamily="JetBrains Mono, monospace"
                width={40}
                tickFormatter={(v) => v.toFixed(1)}
              />
              <Tooltip content={<CustomFinalTooltip />} />
              <Legend
                wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                iconType="plainline"
              />

              {/* Target Cutoff Reference Line */}
              <ReferenceLine
                yAxisId="left"
                y={targetCutoff}
                stroke="var(--theme-primary, #ea580c)"
                strokeDasharray="4 4"
                strokeWidth={1.5}
                label={{
                  value: `Goal ${targetLetterGrade} (${targetCutoff}%)`,
                  position: 'insideTopLeft',
                  fill: 'var(--theme-primary, #ea580c)',
                  fontSize: 10,
                  fontFamily: 'JetBrains Mono',
                }}
              />

              {/* Required Final Score Vertical Marker */}
              {requiredFinalScore >= 40 && requiredFinalScore <= 100 && (
                <ReferenceLine
                  yAxisId="left"
                  x={`${Math.round(requiredFinalScore / 5) * 5}%`}
                  stroke="#64748b"
                  strokeDasharray="3 3"
                  label={{
                    value: `Req: ${requiredFinalScore}%`,
                    position: 'top',
                    fill: '#475569',
                    fontSize: 10,
                    fontFamily: 'JetBrains Mono',
                  }}
                />
              )}

              {/* Course Grade Line */}
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="courseGrade"
                name="Course Grade (%)"
                stroke="#0f172a"
                strokeWidth={3}
                dot={{ r: 3, fill: '#0f172a' }}
                activeDot={{ r: 5 }}
              />

              {/* Cumulative GPA Secondary Trendline */}
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="simNewGpa"
                name="New Cumulative GPA"
                stroke="#059669"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
              />
            </LineChart>
          ) : viewMode === 'midtermSweep' ? (
            <LineChart
              data={midtermSensitivityData}
              margin={{ top: 10, right: 20, left: 10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis
                dataKey="midtermLabel"
                stroke="#64748b"
                fontSize={11}
                tickLine={false}
                fontFamily="JetBrains Mono, monospace"
              />
              <YAxis
                domain={[0, 120]}
                stroke="#64748b"
                fontSize={11}
                tickLine={false}
                fontFamily="JetBrains Mono, monospace"
                width={45}
                unit="%"
              />
              <Tooltip content={<CustomMidtermTooltip />} />
              <Legend
                wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                iconType="plainline"
              />

              {/* 100% Maximum Achievable Exam Score Line */}
              <ReferenceLine
                y={100}
                stroke="#ef4444"
                strokeDasharray="3 3"
                label={{
                  value: 'Max Possible Exam Score (100%)',
                  fill: '#ef4444',
                  fontSize: 10,
                  position: 'insideTopRight',
                  fontFamily: 'JetBrains Mono',
                }}
              />

              {/* Active Midterm Setting Reference Line */}
              <ReferenceLine
                x={`${midtermScore}%`}
                stroke="var(--theme-primary, #ea580c)"
                strokeWidth={2}
                strokeDasharray="3 3"
                label={{
                  value: `Current (${midtermScore}%)`,
                  fill: 'var(--theme-primary, #ea580c)',
                  fontSize: 10,
                  position: 'top',
                  fontFamily: 'JetBrains Mono',
                }}
              />

              <Line
                type="monotone"
                dataKey="reqFinal"
                name={`Req. Final Score for ${targetLetterGrade} (%)`}
                stroke="#0284c7"
                strokeWidth={3}
                dot={(props: any) => {
                  const { cx, cy, payload } = props;
                  if (payload.isCurrent) {
                    return (
                      <circle
                        key={payload.midterm}
                        cx={cx}
                        cy={cy}
                        r={6}
                        fill="#0284c7"
                        stroke="#ffffff"
                        strokeWidth={2}
                      />
                    );
                  }
                  return (
                    <circle
                      key={payload.midterm}
                      cx={cx}
                      cy={cy}
                      r={2.5}
                      fill="#94a3b8"
                    />
                  );
                }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          ) : (
            <LineChart
              data={weightSensitivityData}
              margin={{ top: 10, right: 20, left: 10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis
                dataKey="weightLabel"
                stroke="#64748b"
                fontSize={11}
                tickLine={false}
                fontFamily="JetBrains Mono, monospace"
              />
              <YAxis
                domain={[0, 120]}
                stroke="#64748b"
                fontSize={11}
                tickLine={false}
                fontFamily="JetBrains Mono, monospace"
                width={45}
                unit="%"
              />
              <Tooltip content={<CustomWeightTooltip />} />
              <Legend
                wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                iconType="plainline"
              />

              <ReferenceLine y={100} stroke="#ef4444" strokeDasharray="3 3" />
              <ReferenceLine
                x={`${finalExamWeight}%`}
                stroke="var(--theme-primary, #ea580c)"
                strokeWidth={2}
                strokeDasharray="3 3"
                label={{
                  value: `Current (${finalExamWeight}%)`,
                  fill: 'var(--theme-primary, #ea580c)',
                  fontSize: 10,
                  position: 'top',
                  fontFamily: 'JetBrains Mono',
                }}
              />

              <Line
                type="monotone"
                dataKey="reqFinal"
                name="Req. Final Score vs Exam Weight"
                stroke="#8b5cf6"
                strokeWidth={3}
                dot={false}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Sensitivity Elasticity Callout */}
      {viewMode === 'midtermSweep' && (
        <div className="p-2.5 rounded-lg bg-sky-50/70 border border-sky-200 flex items-start gap-2 text-xs">
          <GraduationCap className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
          <div className="text-sky-950 leading-relaxed">
            <strong>Midterm Leverage Elasticity:</strong> Because the midterm is weighted at {midtermWeight}% and the final at {finalExamWeight}%, each <strong>+5% improvement on your midterm</strong> lowers your required final exam score by <strong>-{leveragePer5Percent}%</strong>. At your current {midtermScore}% midterm, you need <strong>{requiredFinalScore}%</strong> on the final for {targetLetterGrade}.
          </div>
        </div>
      )}

      {viewMode === 'weightSweep' && (
        <div className="p-2.5 rounded-lg bg-purple-50/70 border border-purple-200 flex items-start gap-2 text-xs">
          <BookOpen className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
          <div className="text-purple-950 leading-relaxed">
            <strong>Syllabus Weighting Dynamic:</strong> Higher final exam weighting dilutes the locked protection of past coursework and concentrates overall grading risk into the 2-hour testing window.
          </div>
        </div>
      )}
    </div>
  );
};
