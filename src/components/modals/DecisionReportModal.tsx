import React, { useState } from 'react';
import {
  ScenarioId,
  AnyScenarioParams,
  RunningParams,
  HousingParams,
  GpaParams,
  BudgetParams,
  CustomParams,
  TradingParams,
} from '../../types';
import {
  calculateRunningModel,
  calculateHousingModel,
  calculateGpaModel,
  calculateBudgetModel,
  calculateCustomModel,
  calculateTradingModel,
} from '../../utils/mathUtils';
import { FileText, Copy, Download, Check, X, Share2, Table } from 'lucide-react';

interface DecisionReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeScenario: ScenarioId;
  params: AnyScenarioParams;
  onExportSuccess?: (message: string) => void;
}

export const DecisionReportModal: React.FC<DecisionReportModalProps> = ({
  isOpen,
  onClose,
  activeScenario,
  params,
  onExportSuccess,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  // Generate Report Title & Model Output
  let title = 'Decision Engineering Intelligence Report';
  let modelSummary = '';
  let recommendations: string[] = [];
  let csvData = '';

  const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);

  if (activeScenario === 'running') {
    const rp = params as RunningParams;
    const m = calculateRunningModel(rp);
    title = 'Half-Marathon Sub-2:00 Pacing Decision Brief';
    modelSummary = `
## Executive Summary
- Current Long Run Pace: ${rp.currentPaceMinutes}:${rp.currentPaceSeconds.toString().padStart(2, '0')} /mile
- Target Race Finish Time: ${rp.targetTimeHours}h ${rp.targetTimeMinutes}m (${m.targetPaceSeconds.toFixed(1)}s /mile)
- Preparation Timeline: ${rp.weeksUntilRace} weeks
- Required Pace Cut Per Week: -${m.shavePerWeekSeconds.toFixed(1)} sec/mile/week
- Feasibility Assessment: ${m.feasibilityLabel} (${m.feasibilityLevel.toUpperCase()})
- Injury Strain Index: ${m.injuryRiskScore}%
- Weekly Mileage Progression: ${(rp.runsPerWeek * 5.8).toFixed(1)} mi/week across ${rp.runsPerWeek} runs
    `.trim();

    recommendations = [
      m.shavePerWeekSeconds <= 7.5
        ? 'Target pace shave is within normal aerobic conditioning boundaries; proceed with scheduled plan.'
        : 'Pace shave demand is aggressive; consider delaying target race date by 3–4 weeks to prevent strain.',
      rp.hasSpeedWork
        ? 'Weekly threshold intervals are active. Ensure minimum 48 hours recovery between speed workouts.'
        : 'Incorporate tempo / threshold intervals to accelerate cardiovascular adaptation.',
      `Maintain strict injury index monitoring below 65% (current: ${m.injuryRiskScore}%).`,
    ];

    // CSV format
    csvData = `Week,Projected_Pace_Sec,Target_Pace_Sec,Estimated_Weekly_Miles\n` +
      m.weeklyMilestones.map((w) => `${w.week},${w.projectedPaceSec.toFixed(1)},${w.targetPaceSec.toFixed(1)},${w.weeklyMiles}`).join('\n');

  } else if (activeScenario === 'housing') {
    const hp = params as HousingParams;
    const m = calculateHousingModel(hp);
    title = 'Living Choices & 1-Year Financial Trajectory Memo';
    const win = m.options.find((o) => o.isWinner) || m.options[0];

    modelSummary = `
## Executive Summary
- Monthly Net Salary: $${hp.monthlyNetIncome.toLocaleString()}
- Hourly Opportunity Value: $${hp.hourlyTimeValuation}/hr
- Discretionary Buffer: $${hp.discretionaryBuffer}/mo
- Winning Housing Recommendation: ${win.name}
- 1-Year Net Cash Saved: $${win.annualCashSavings.toLocaleString()}
- Opportunity-Cost Adjusted Savings: $${Math.round(win.annualTimeAdjustedSavings).toLocaleString()}
- Effective Monthly Rent Outflow: $${Math.round(win.effectiveRent).toLocaleString()}/mo
    `.trim();

    recommendations = [
      `Selected optimal arrangement (${win.name}) captures highest annual wealth accumulation.`,
      `Commute opportunity cost evaluates to $${Math.round(win.monthlyTimeCost).toLocaleString()}/mo; factor travel fatigue into lease choice.`,
      'Maintain emergency fund liquidity exceeding 3 months of baseline fixed outflows.',
    ];

    csvData = `Option_Name,Effective_Rent,Total_Direct_Cost,Monthly_Savings,Annual_Savings,Savings_Rate\n` +
      m.options.map((o) => `"${o.name}",${o.effectiveRent},${o.totalMonthlyDirectCost},${o.monthlySavings},${o.annualCashSavings},${o.savingsRatePercent}%`).join('\n');

  } else if (activeScenario === 'gpa') {
    const gp = params as GpaParams;
    const m = calculateGpaModel(gp);
    title = 'Course Stakes & Academic GPA Trajectory Memo';

    modelSummary = `
## Executive Summary
- Current Cumulative GPA: ${gp.currentCumulativeGpa.toFixed(2)} (${gp.completedCreditHours} credit hours)
- Target Letter Grade: ${gp.targetLetterGrade}
- Midterm Score: ${gp.midtermScore}% (Weight: ${gp.midtermWeight}%)
- Assignments Score: ${gp.assignmentScore}% (Weight: ${gp.assignmentWeight}%)
- Required Final Exam Score: ${Math.round(m.requiredFinalScore)}% (Weight: ${m.finalWeight}%)
- Projected Cumulative GPA if Target Achieved: ${m.projectedNewCumulativeGpa.toFixed(2)}
    `.trim();

    recommendations = [
      m.requiredFinalScore <= 90
        ? `Target ${gp.targetLetterGrade} is mathematically feasible (requires ${Math.round(m.requiredFinalScore)}% on final).`
        : `Target ${gp.targetLetterGrade} requires exceptional test execution (>${Math.round(m.requiredFinalScore)}%). Formulate backup cutoff plan.`,
      `Course carries ${gp.currentCourseCredits} credits, shifting cumulative GPA by ${m.gpaDelta >= 0 ? '+' : ''}${m.gpaDelta.toFixed(3)} pts.`,
    ];

    csvData = `Final_Exam_Score,Projected_Course_Grade,New_Cumulative_GPA\n` +
      m.sensitivityCurve.map((c) => `${c.finalScore},${c.overallCourseGrade.toFixed(1)},${c.resultingGpaPoints.toFixed(2)}`).join('\n');

  } else if (activeScenario === 'budget') {
    const bp = params as BudgetParams;
    const m = calculateBudgetModel(bp);
    title = 'Event Budget Break-Even & Financial Feasibility Brief';

    modelSummary = `
## Executive Summary
- Expected Attendance: ${bp.expectedAttendees} attendees
- Ticket Admission Price: $${bp.ticketPrice}
- Break-Even Guest Threshold: ${m.breakEvenAttendees} attendees (${m.isProfitable ? 'ACHIEVED' : 'DEFICIT'})
- Net Projected Profit / Margin: $${m.netMargin.toLocaleString()}
- Total Revenue: $${m.totalRevenue.toLocaleString()}
- Total Expenditures: $${m.totalExpenses.toLocaleString()}
    `.trim();

    recommendations = [
      m.isProfitable
        ? `Budget is solvent with a projected surplus of $${m.netMargin.toLocaleString()}.`
        : `Event incurs a deficit. Need ${m.breakEvenAttendees} attendees to break even, or increase ticket price.`,
      `Variable catering costs scale at $${bp.foodCostPerPerson}/person. Fixed overhead: $${m.fixedCosts.toLocaleString()}.`,
    ];

    csvData = `Attendees,Total_Revenue,Total_Cost,Net_Profit\n` +
      m.revenueVsCostCurve.map((r) => `${r.attendees},${r.revenue},${r.totalCost},${r.netProfit}`).join('\n');

  } else if (activeScenario === 'trading') {
    const tp = params as TradingParams;
    const m = calculateTradingModel(tp);
    title = `IPO Allocation & Execution Strategy Brief (${tp.ticker || 'MARKET'})`;

    modelSummary = `
## Executive Summary
- Ticker: ${tp.ticker || 'IPO'} (${tp.companyName || 'Mainboard IPO'})
- Offer Issue Price: ₹${tp.offerPrice} / share
- Capital Committed: ₹${tp.capitalCommitted.toLocaleString()}
- Expected Day 1 Listing Pop: +${tp.expectedDay1Pop}% (Listing Price: ₹${m.day1ListingPrice})
- Institutional Oversubscription: ${tp.oversubscriptionRatio}x book
- Allotment Fill Rate: ${m.fillRatePercent}% (${m.actualAllocatedShares} shares allotted)
- Capital Employed: ₹${m.capitalEmployed.toLocaleString()} (Refund unblocked: ₹${m.unfilledCapitalReturned.toLocaleString()})
- Day 1 Projected Listing Gain: ₹${m.day1ProfitDollar.toLocaleString()}
- Stop-Loss Floor: ₹${m.stopLossPrice} (${tp.stopLossPercent}% max downside buffer)
- Strategy Verdict: ${m.verdictLabel}
    `.trim();

    recommendations = [
      m.verdictSummary,
      `Risk/Reward Ratio is ${m.riskRewardRatio}:1 based on ₹${m.maxRiskDollar.toLocaleString()} capital at risk.`,
      `Important Disclaimer: Past IPO listing-day gains do not guarantee future returns. Indian market transactions incur STT (0.1%), GST (18%), exchange turnover fees, and SEBI regulatory charges.`,
    ];

    csvData = `Timeline_Day,Stage,Expected_Price,Bull_Case,Bear_Case\n` +
      m.priceTrajectoryCurve.map((p) => `${p.day},"${p.timeline}",${p.expectedPrice},${p.bullPrice},${p.bearPrice}`).join('\n');

  } else {
    const cp = params as CustomParams;
    const m = calculateCustomModel(cp);
    const isGoalAchieved = m.computedValue >= cp.targetValue;
    title = `${cp.title} Quantitative Decision Brief`;

    modelSummary = `
## Executive Summary
- Target Goal Metric: ${cp.targetValue} ${cp.goalMetricUnit}
- Current Computed Value: ${m.computedValue.toFixed(2)} ${cp.goalMetricUnit}
- Target Status: ${isGoalAchieved ? 'TARGET ACHIEVED' : 'GAP TO TARGET'}
- Mathematical Formulation: ${cp.formulaType.toUpperCase()}
    `.trim();

    recommendations = [
      isGoalAchieved
        ? 'Current lever settings successfully reach your numerical objective.'
        : 'Adjust high-leverage parameters to bridge the gap to your target threshold.',
    ];

    csvData = `Lever_1_Val,Computed_Outcome\n` +
      m.sensitivityPoints.map((p) => `${p.value1},${p.result.toFixed(2)}`).join('\n');
  }

  // Full Markdown Memo
  const fullMarkdown = `
# ${title}
**Date Generated:** ${timestamp}  
**Platform:** TradeOff Lab Decision Intelligence Suite

${modelSummary}

## Strategic Action Items & Recommendations
${recommendations.map((r, i) => `${i + 1}. ${r}`).join('\n')}

---
*Generated via TradeOff Lab Decision Simulator.*
  `.trim();

  const handleCopyMarkdown = () => {
    navigator.clipboard.writeText(fullMarkdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadMarkdown = () => {
    const filename = `tradeoff-lab-${activeScenario}-brief.md`;
    const blob = new Blob([fullMarkdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    onExportSuccess?.(`Exported Markdown brief (${filename}) successfully.`);
  };

  const handleDownloadCsv = () => {
    const filename = `tradeoff-lab-${activeScenario}-sensitivity.csv`;
    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    onExportSuccess?.(`Exported CSV sensitivity dataset (${filename}) successfully.`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between gap-4 bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-xs">
              <FileText className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">
                  Executive Decision Brief & Memo
                </h3>
                <span className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider bg-slate-100 text-slate-700 rounded border border-slate-200">
                  MARKDOWN & CSV
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Formatted executive summary with sensitivity dataset export
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
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1">
          {/* Action Export Bar */}
          <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-slate-100">
            <span className="text-xs font-semibold text-slate-600">
              Export Formats:
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyMarkdown}
                className="px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg flex items-center gap-1.5 transition-colors shadow-2xs"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                <span>{copied ? 'Copied Brief!' : 'Copy Markdown'}</span>
              </button>

              <button
                onClick={handleDownloadMarkdown}
                className="px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg flex items-center gap-1.5 transition-colors shadow-2xs"
              >
                <Download className="w-3.5 h-3.5 text-slate-500" />
                <span>Download .MD</span>
              </button>

              <button
                onClick={handleDownloadCsv}
                className="px-3 py-1.5 text-xs font-semibold text-blue-700 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg flex items-center gap-1.5 transition-colors shadow-2xs"
              >
                <Table className="w-3.5 h-3.5 text-blue-600" />
                <span>Export Dataset (.CSV)</span>
              </button>
            </div>
          </div>

          {/* Formatted Markdown Preview */}
          <div className="p-4 rounded-xl bg-slate-900 text-slate-100 font-mono text-xs overflow-x-auto leading-relaxed border border-slate-800 space-y-3">
            <pre className="whitespace-pre-wrap">{fullMarkdown}</pre>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
          >
            Close Brief
          </button>
        </div>
      </div>
    </div>
  );
};
