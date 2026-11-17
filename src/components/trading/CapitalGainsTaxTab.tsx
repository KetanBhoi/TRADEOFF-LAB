import React, { useMemo, useState } from 'react';
import { TradingHolding } from '../../types/trading';
import { computeDividendCalendar } from '../../utils/evenMoreModulesData';
import { computeCapitalGainsAndAdvanceTax } from '../../utils/ultimateModulesData';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import {
  Calculator,
  AlertTriangle,
  ArrowRight,
  Calendar,
  CheckCircle2,
  ShieldCheck,
} from 'lucide-react';

interface CapitalGainsTaxTabProps {
  holdings: TradingHolding[];
  onJumpToTaxHarvest: () => void;
  onJumpToDividends: () => void;
}

export const CapitalGainsTaxTab: React.FC<CapitalGainsTaxTabProps> = ({
  holdings,
  onJumpToTaxHarvest,
  onJumpToDividends,
}) => {
  const dividendMetrics = useMemo(() => computeDividendCalendar(holdings), [holdings]);

  const [realizedStcg, setRealizedStcg] = useState<number>(145000);
  const [realizedLtcg, setRealizedLtcg] = useState<number>(210000);
  const [fnoNetProfit, setFnoNetProfit] = useState<number>(84000);
  const [fnoTurnoverCr, setFnoTurnoverCr] = useState<number>(1.8);
  const [marginalSlab, setMarginalSlab] = useState<number>(30);

  const [q1Paid, setQ1Paid] = useState<number>(8000);
  const [q2Paid, setQ2Paid] = useState<number>(20000);
  const [q3Paid, setQ3Paid] = useState<number>(15000);
  const [q4Paid, setQ4Paid] = useState<number>(0);

  const taxSummary = useMemo(
    () =>
      computeCapitalGainsAndAdvanceTax({
        realizedStcg,
        realizedLtcg,
        fnoNetProfit,
        fnoTurnover: Math.round(fnoTurnoverCr * 10000000),
        dividendIncome: dividendMetrics.totalAnnualDividend,
        marginalSlabPercent: marginalSlab,
        advanceTaxPaidQ1: q1Paid,
        advanceTaxPaidQ2: q2Paid,
        advanceTaxPaidQ3: q3Paid,
        advanceTaxPaidQ4: q4Paid,
      }),
    [
      realizedStcg,
      realizedLtcg,
      fnoNetProfit,
      fnoTurnoverCr,
      dividendMetrics.totalAnnualDividend,
      marginalSlab,
      q1Paid,
      q2Paid,
      q3Paid,
      q4Paid,
    ]
  );

  const chartData = [
    {
      quarter: 'Q1 (Jun 15)',
      Required: taxSummary.installments[0].cumulativeTaxDue,
      Paid: q1Paid,
    },
    {
      quarter: 'Q2 (Sep 15)',
      Required: taxSummary.installments[1].cumulativeTaxDue,
      Paid: q1Paid + q2Paid,
    },
    {
      quarter: 'Q3 (Dec 15)',
      Required: taxSummary.installments[2].cumulativeTaxDue,
      Paid: q1Paid + q2Paid + q3Paid,
    },
    {
      quarter: 'Q4 (Mar 15)',
      Required: taxSummary.installments[3].cumulativeTaxDue,
      Paid: q1Paid + q2Paid + q3Paid + q4Paid,
    },
  ];

  const totalPaid = q1Paid + q2Paid + q3Paid + q4Paid;
  const remainingPayable = Math.max(0, taxSummary.totalTaxLiability - totalPaid);
  const total234cInterest = taxSummary.installments.reduce(
    (s, i) => s + i.sec234cPenaltyEstimate,
    0
  );

  return (
    <div className="space-y-6">
      {/* Header Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h3 className="text-lg font-bold text-slate-950 flex items-center gap-2">
            <Calculator className="w-5 h-5 text-indigo-600" />
            <span>ITR-2 / ITR-3 Capital Gains &amp; Advance Tax Estimator</span>
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Computes Section 111A (20% STCG), Section 112A (12.5% LTCG above ₹1.25L exemption), F&amp;O business income, dividend slab tax, and Sec 234C quarterly advance tax installments.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap shrink-0">
          <button
            type="button"
            onClick={onJumpToTaxHarvest}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition-colors whitespace-nowrap shrink-0"
          >
            <span>Offset via Tax Harvesting</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={onJumpToDividends}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors whitespace-nowrap shrink-0"
          >
            <span>Dividend Schedule</span>
          </button>
        </div>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white border border-slate-200">
          <span className="text-xs text-slate-500 block">Total Estimated FY Tax (+4% Cess)</span>
          <span className="text-xl font-bold font-mono tabular-nums text-slate-950 mt-1 block">
            ₹{taxSummary.totalTaxLiability.toLocaleString('en-IN')}
          </span>
          <span className="text-[11px] text-slate-500 mt-1 block font-mono tabular-nums">
            Base: ₹{taxSummary.baseTaxLiability.toLocaleString('en-IN')} · Cess: ₹{taxSummary.cessAmount.toLocaleString('en-IN')}
          </span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200">
          <span className="text-xs text-slate-500 block">Remaining Advance / Self-Assessment</span>
          <span
            className={`text-xl font-bold font-mono tabular-nums mt-1 block ${
              remainingPayable > 0 ? 'text-amber-700' : 'text-emerald-700'
            }`}
          >
            ₹{remainingPayable.toLocaleString('en-IN')}
          </span>
          <span className="text-[11px] text-slate-500 mt-1 block font-mono tabular-nums">
            Paid YTD: ₹{totalPaid.toLocaleString('en-IN')}
          </span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200">
          <span className="text-xs text-slate-500 block">Sec 112A ₹1.25L Exemption Used</span>
          <span className="text-xl font-bold font-mono tabular-nums text-emerald-700 mt-1 block">
            ₹{taxSummary.ltcgExemptionUsed.toLocaleString('en-IN')}
          </span>
          <span className="text-[11px] text-slate-500 mt-1 block font-mono tabular-nums">
            Taxable LTCG: ₹{taxSummary.ltcgTaxable.toLocaleString('en-IN')}
          </span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200">
          <span className="text-xs text-slate-500 block">Sec 234C Interest &amp; Sec 44AB Audit</span>
          <span
            className={`text-xl font-bold font-mono tabular-nums mt-1 block ${
              total234cInterest > 0 ? 'text-rose-700' : 'text-slate-950'
            }`}
          >
            ₹{total234cInterest.toLocaleString('en-IN')}
          </span>
          <span className="text-[11px] text-slate-500 mt-1 block">
            {taxSummary.sec44abAuditRisk === 'AUDIT_REQUIRED'
              ? 'Audit Required (>₹10Cr Turnover)'
              : taxSummary.sec44abAuditRisk === 'EXEMPT_UNDER_10CR'
              ? 'Digital F&O Exempt (<₹10Cr)'
              : 'ITR-2 Eligible (No F&O)'}
          </span>
        </div>
      </div>

      {/* Main Split: Inputs + Chart/Table */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Inputs */}
        <div className="lg:col-span-5 p-5 rounded-xl bg-white border border-slate-200 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-slate-900">Realized Gains &amp; Slab Inputs</h4>
            <span className="text-xs font-mono text-slate-500">FY 2025–26 Slabs</span>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <div className="flex justify-between font-medium text-slate-700 mb-1">
                <span>Short-Term Capital Gains (Sec 111A @ 20%)</span>
                <span className="font-mono font-bold tabular-nums">₹{realizedStcg.toLocaleString('en-IN')}</span>
              </div>
              <input
                type="range"
                min={-100000}
                max={1000000}
                step={5000}
                value={realizedStcg}
                onChange={(e) => setRealizedStcg(Number(e.target.value))}
                className="w-full accent-indigo-600"
              />
            </div>

            <div>
              <div className="flex justify-between font-medium text-slate-700 mb-1">
                <span>Long-Term Capital Gains (Sec 112A @ 12.5%)</span>
                <span className="font-mono font-bold tabular-nums">₹{realizedLtcg.toLocaleString('en-IN')}</span>
              </div>
              <input
                type="range"
                min={0}
                max={1500000}
                step={5000}
                value={realizedLtcg}
                onChange={(e) => setRealizedLtcg(Number(e.target.value))}
                className="w-full accent-indigo-600"
              />
            </div>

            <div>
              <div className="flex justify-between font-medium text-slate-700 mb-1">
                <span>F&amp;O Non-Speculative Net Profit (ITR-3)</span>
                <span className="font-mono font-bold tabular-nums">₹{fnoNetProfit.toLocaleString('en-IN')}</span>
              </div>
              <input
                type="range"
                min={-150000}
                max={1000000}
                step={5000}
                value={fnoNetProfit}
                onChange={(e) => setFnoNetProfit(Number(e.target.value))}
                className="w-full accent-indigo-600"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                  F&amp;O Turnover (₹ Cr)
                </label>
                <input
                  type="number"
                  min={0}
                  max={50}
                  step={0.5}
                  value={fnoTurnoverCr}
                  onChange={(e) => setFnoTurnoverCr(Math.max(0, Number(e.target.value)))}
                  className="w-full px-3 py-1.5 text-xs font-mono border border-slate-300 rounded-lg bg-slate-50"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                  Marginal Slab Rate
                </label>
                <select
                  value={marginalSlab}
                  onChange={(e) => setMarginalSlab(Number(e.target.value))}
                  className="w-full px-3 py-1.5 text-xs font-mono border border-slate-300 rounded-lg bg-slate-50"
                >
                  <option value={5}>5% Slab</option>
                  <option value={10}>10% Slab</option>
                  <option value={15}>15% Slab</option>
                  <option value={20}>20% Slab</option>
                  <option value={30}>30% Peak Slab</option>
                </select>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 space-y-2">
              <span className="text-xs font-bold text-slate-800 block">
                Advance Tax Paid Per Installment (₹)
              </span>
              <div className="grid grid-cols-2 gap-2.5">
                {[
                  { label: 'Q1 (Jun 15)', val: q1Paid, set: setQ1Paid },
                  { label: 'Q2 (Sep 15)', val: q2Paid, set: setQ2Paid },
                  { label: 'Q3 (Dec 15)', val: q3Paid, set: setQ3Paid },
                  { label: 'Q4 (Mar 15)', val: q4Paid, set: setQ4Paid },
                ].map((q) => (
                  <div key={q.label}>
                    <label className="text-[11px] text-slate-500 block mb-0.5">{q.label}</label>
                    <input
                      type="number"
                      min={0}
                      step={1000}
                      value={q.val}
                      onChange={(e) => q.set(Math.max(0, Number(e.target.value)))}
                      className="w-full px-2.5 py-1.5 text-xs font-mono tabular-nums border border-slate-300 rounded-lg"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 space-y-1.5 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>STCG Tax (20%)</span>
              <span className="font-mono font-semibold tabular-nums">₹{taxSummary.stcgTax.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>LTCG Tax (12.5% above ₹1.25L)</span>
              <span className="font-mono font-semibold tabular-nums">₹{taxSummary.ltcgTax.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>F&amp;O Slab Tax ({marginalSlab}%)</span>
              <span className="font-mono font-semibold tabular-nums">₹{taxSummary.fnoSlabTax.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Holdings Dividend Slab Tax (₹{dividendMetrics.totalAnnualDividend.toLocaleString('en-IN')})</span>
              <span className="font-mono font-semibold tabular-nums">₹{taxSummary.dividendSlabTax.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

        {/* Right Advance Tax Chart & Quarterly Compliance Table */}
        <div className="lg:col-span-7 space-y-5">
          <div className="p-5 rounded-xl bg-white border border-slate-200">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="text-sm font-bold text-slate-900">
                  Cumulative Advance Tax Schedule vs. Paid
                </h4>
                <p className="text-[11px] text-slate-500">
                  Statutory checkpoints: 15% (Jun) · 45% (Sep) · 75% (Dec) · 100% (Mar)
                </p>
              </div>
              <Calendar className="w-4 h-4 text-slate-400" />
            </div>

            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="quarter" tick={{ fontSize: 11, fill: '#475569' }} />
                  <YAxis
                    tick={{ fontSize: 11, fill: '#475569' }}
                    tickFormatter={(v) => `₹${Math.round(v / 1000)}k`}
                  />
                  <Tooltip
                    formatter={(val) =>
                      `₹${(typeof val === 'number' ? val : Number(val ?? 0)).toLocaleString('en-IN')}`
                    }
                  />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="Required" fill="#0f172a" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Paid" fill="#16a34a" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-xl bg-white border border-slate-200 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-900">Section 234C Quarterly Audit Ledger</h4>
              <span className="text-xs text-slate-500">
                {taxSummary.advanceTaxRequired ? 'Required (Liability ≥ ₹10,000)' : 'Exempt (< ₹10,000)'}
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-2.5 font-semibold">Quarter</th>
                    <th className="px-4 py-2.5 font-semibold text-right">Cum. %</th>
                    <th className="px-4 py-2.5 font-semibold text-right">Cum. Required</th>
                    <th className="px-4 py-2.5 font-semibold text-right">Shortfall</th>
                    <th className="px-4 py-2.5 font-semibold text-right">234C Penalty</th>
                    <th className="px-4 py-2.5 font-semibold text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {taxSummary.installments.map((row) => (
                    <tr key={row.quarter} className="hover:bg-slate-50/70">
                      <td className="px-4 py-2.5 font-semibold text-slate-900">{row.quarter}</td>
                      <td className="px-4 py-2.5 text-right font-mono tabular-nums text-slate-600">
                        {row.cumulativePercentRequired}%
                      </td>
                      <td className="px-4 py-2.5 text-right font-mono tabular-nums text-slate-900">
                        ₹{row.cumulativeTaxDue.toLocaleString('en-IN')}
                      </td>
                      <td className="px-4 py-2.5 text-right font-mono tabular-nums text-amber-700 font-semibold">
                        ₹{row.estimatedShortfall.toLocaleString('en-IN')}
                      </td>
                      <td className="px-4 py-2.5 text-right font-mono tabular-nums text-rose-700 font-semibold">
                        ₹{row.sec234cPenaltyEstimate.toLocaleString('en-IN')}
                      </td>
                      <td className="px-4 py-2.5 text-right">
                        {row.status === 'PAID_OK' ? (
                          <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Compliant
                          </span>
                        ) : row.status === 'DUE_SOON' ? (
                          <span className="inline-flex items-center gap-1 text-amber-700 font-semibold">
                            <ShieldCheck className="w-3.5 h-3.5" /> Balance Due
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-rose-700 font-semibold">
                            <AlertTriangle className="w-3.5 h-3.5" /> Shortfall Risk
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
