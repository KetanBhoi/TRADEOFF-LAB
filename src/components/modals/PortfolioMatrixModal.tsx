import React from 'react';
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Tooltip,
  Legend,
} from 'recharts';
import {
  RunningParams,
  HousingParams,
  GpaParams,
  BudgetParams,
  CustomParams,
} from '../../types';
import {
  calculateRunningModel,
  calculateHousingModel,
  calculateGpaModel,
  calculateBudgetModel,
  calculateCustomModel,
} from '../../utils/mathUtils';
import { PieChart, X, ShieldAlert, Award, ArrowUpRight, Sparkles } from 'lucide-react';

interface PortfolioMatrixModalProps {
  isOpen: boolean;
  onClose: () => void;
  runningParams: RunningParams;
  housingParams: HousingParams;
  gpaParams: GpaParams;
  budgetParams: BudgetParams;
  customParams: CustomParams;
}

export const PortfolioMatrixModal: React.FC<PortfolioMatrixModalProps> = ({
  isOpen,
  onClose,
  runningParams,
  housingParams,
  gpaParams,
  budgetParams,
  customParams,
}) => {
  if (!isOpen) return null;

  const runningModel = calculateRunningModel(runningParams);
  const housingModel = calculateHousingModel(housingParams);
  const gpaModel = calculateGpaModel(gpaParams);
  const budgetModel = calculateBudgetModel(budgetParams);
  const customModel = calculateCustomModel(customParams);

  // Compute normalized 0-100 scores across 5 dimensions:
  // 1. Financial Impact
  // 2. Time Demand
  // 3. Risk / Strain
  // 4. Goal Attainment
  // 5. Lever Controllability

  const runningScores = {
    financial: 20, // Equipment & race entry
    time: Math.min(100, Math.round(runningParams.runsPerWeek * 16)),
    risk: runningModel.injuryRiskScore,
    attainment: Math.min(100, Math.max(10, Math.round(100 - runningModel.shavePerWeekSeconds * 6))),
    controllability: 75,
  };

  const housingScores = {
    financial: 90, // Rent is massive monthly expenditure
    time: Math.min(100, Math.round(housingParams.options[0].commuteOneWayMinutes * 1.5)),
    risk: Math.round((housingParams.discretionaryBuffer < 300 ? 70 : 35)),
    attainment: Math.min(100, Math.round((housingModel.options[0].monthlySavings / 1200) * 100)),
    controllability: 60,
  };

  const gpaScores = {
    financial: 15,
    time: Math.min(100, Math.round(gpaParams.currentCourseCredits * 22)),
    risk: Math.min(100, Math.max(15, Math.round(gpaModel.requiredFinalScore * 0.9))),
    attainment: Math.min(100, Math.max(10, Math.round(100 - Math.max(0, gpaModel.requiredFinalScore - 80) * 2))),
    controllability: 85,
  };

  const budgetScores = {
    financial: 75,
    time: 50,
    risk: budgetModel.isProfitable ? 30 : 80,
    attainment: Math.min(100, Math.max(10, Math.round(budgetModel.isProfitable ? 85 : 40))),
    controllability: 80,
  };

  const radarData = [
    {
      dimension: 'Capital Outflow',
      Running: runningScores.financial,
      Housing: housingScores.financial,
      GPA: gpaScores.financial,
      Budget: budgetScores.financial,
      fullMark: 100,
    },
    {
      dimension: 'Time Commitment',
      Running: runningScores.time,
      Housing: housingScores.time,
      GPA: gpaScores.time,
      Budget: budgetScores.time,
      fullMark: 100,
    },
    {
      dimension: 'Risk / Strain',
      Running: runningScores.risk,
      Housing: housingScores.risk,
      GPA: gpaScores.risk,
      Budget: budgetScores.risk,
      fullMark: 100,
    },
    {
      dimension: 'Goal Attainment',
      Running: runningScores.attainment,
      Housing: housingScores.attainment,
      GPA: gpaScores.attainment,
      Budget: budgetScores.attainment,
      fullMark: 100,
    },
    {
      dimension: 'Lever Flexibility',
      Running: runningScores.controllability,
      Housing: housingScores.controllability,
      GPA: gpaScores.controllability,
      Budget: budgetScores.controllability,
      fullMark: 100,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between gap-4 bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-xs">
              <PieChart className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">
                  Portfolio TradeOff Radar & Strategic Matrix
                </h3>
                <span className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider bg-orange-100 text-orange-800 rounded border border-orange-200">
                  MULTI-SCENARIO RADAR
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Simultaneous 5-dimensional tradeoff visualization comparing risk, capital, and time demands
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {/* Radar Chart Area */}
          <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Cross-Scenario Multi-Dimensional Profile
              </h4>
              <span className="text-[11px] text-slate-500 font-mono">
                Normalized 0–100 Scale
              </span>
            </div>

            <div className="w-full h-80 select-none">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis dataKey="dimension" tick={{ fill: '#475569', fontSize: 11 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#cbd5e1" />
                  <Radar
                    name="Running Pace"
                    dataKey="Running"
                    stroke="#ea580c"
                    fill="#ea580c"
                    fillOpacity={0.25}
                  />
                  <Radar
                    name="Living Choices"
                    dataKey="Housing"
                    stroke="#0284c7"
                    fill="#0284c7"
                    fillOpacity={0.25}
                  />
                  <Radar
                    name="Course GPA"
                    dataKey="GPA"
                    stroke="#8b5cf6"
                    fill="#8b5cf6"
                    fillOpacity={0.2}
                  />
                  <Radar
                    name="Event Budget"
                    dataKey="Budget"
                    stroke="#10b981"
                    fill="#10b981"
                    fillOpacity={0.2}
                  />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Cross-Scenario Comparison Summary Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Running Pace Summary */}
            <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-1.5 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-orange-900">Running Pace</span>
                <span className="text-[10px] font-mono text-orange-700 bg-orange-50 px-1.5 py-0.2 rounded border border-orange-200">
                  {runningModel.shavePerWeekSeconds.toFixed(1)}s/wk
                </span>
              </div>
              <p className="text-[11px] text-slate-600 leading-tight">
                Primary constraint is physiological time and injury risk ({runningModel.injuryRiskScore}%).
              </p>
            </div>

            {/* Housing Tradeoff Summary */}
            <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-1.5 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-sky-900">Living Choices</span>
                <span className="text-[10px] font-mono text-sky-700 bg-sky-50 px-1.5 py-0.2 rounded border border-sky-200">
                  ${housingModel.options.find(o=>o.isWinner)?.monthlySavings || 0}/mo
                </span>
              </div>
              <p className="text-[11px] text-slate-600 leading-tight">
                Primary constraint is capital outflows vs commute travel fatigue.
              </p>
            </div>

            {/* Course GPA Summary */}
            <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-1.5 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-purple-900">Course GPA</span>
                <span className="text-[10px] font-mono text-purple-700 bg-purple-50 px-1.5 py-0.2 rounded border border-purple-200">
                  {Math.round(gpaModel.requiredFinalScore)}% on Final
                </span>
              </div>
              <p className="text-[11px] text-slate-600 leading-tight">
                High academic leverage; final exam score dictates cumulative degree GPA delta.
              </p>
            </div>

            {/* Event Budget Summary */}
            <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-1.5 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-900">Event Budget</span>
                <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                  ${budgetModel.netMargin.toLocaleString()}
                </span>
              </div>
              <p className="text-[11px] text-slate-600 leading-tight">
                Break-even reaches at {budgetModel.breakEvenAttendees} attendees ({budgetModel.isProfitable ? 'Solvent' : 'Deficit'}).
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
          >
            Close Matrix
          </button>
        </div>
      </div>
    </div>
  );
};
