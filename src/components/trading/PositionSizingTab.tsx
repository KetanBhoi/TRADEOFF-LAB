import React, { useState } from 'react';
import { calculatePositionSizing } from '../../utils/advancedTradingData';
import { PositionSizingInput, PositionSizingBreakdown } from '../../types/trading';
import {
  Calculator,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Percent,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Info,
  Scale,
  ArrowRight,
} from 'lucide-react';

interface PositionSizingTabProps {
  onApplyToTerminal?: (payload: {
    quantity: number;
    entryPrice: number;
    stopLossPrice: number;
    targetPrice: number;
    product: 'CNC' | 'MIS';
  }) => void;
}

export const PositionSizingTab: React.FC<PositionSizingTabProps> = ({
  onApplyToTerminal,
}) => {
  const [params, setParams] = useState<PositionSizingInput>({
    totalCapital: 500000,
    riskPerTradePercent: 1.0, // 1% risk of ₹5,00,000 = ₹5,000
    entryPrice: 405.0,
    stopLossPrice: 395.0, // ₹10 stop-loss distance
    targetPrice: 430.0,   // ₹25 target distance
    accountType: 'EQUITY_DELIVERY',
    maxExposureLimitPercent: 20.0, // max ₹1,00,000 capital in a single stock
  });

  const breakdown: PositionSizingBreakdown = calculatePositionSizing(params);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              Standalone Risk Engineering Tool
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              No Broker Required
            </span>
          </div>
          <h2 className="text-xl font-bold tracking-tight">Institutional Position Sizing Calculator</h2>
          <p className="text-xs text-slate-300 max-w-2xl mt-1">
            Determine the exact share quantity to buy based on mathematical risk limits rather than arbitrary gut feel. Automatically accounts for Indian statutory friction (STT, NSE charges, SEBI fee, GST, and brokerage).
          </p>
        </div>

        {/* Live Recommendation Badge */}
        <div className="bg-slate-800/80 border border-slate-700/60 p-4 rounded-xl shrink-0 flex items-center gap-4">
          <div>
            <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Recommended Order Size</div>
            <div className="text-2xl font-black text-indigo-400 font-mono">
              {breakdown.recommendedShares} <span className="text-xs text-slate-400 font-normal">shares</span>
            </div>
          </div>
          <div className="h-8 w-px bg-slate-700" />
          <div>
            <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Gross Order Value</div>
            <div className="text-lg font-bold text-white font-mono">
              ₹{breakdown.totalOrderValue.toLocaleString('en-IN')}
            </div>
          </div>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive Inputs (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Scale className="w-4 h-4 text-indigo-600" />
              <span>Risk & Capital Inputs</span>
            </h3>
            <span className="text-[11px] text-slate-500 font-mono">₹ INR</span>
          </div>

          {/* Account Equity */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Total Trading Account Equity (₹)
            </label>
            <input
              type="number"
              value={params.totalCapital}
              onChange={(e) => setParams({ ...params, totalCapital: Math.max(1000, Number(e.target.value)) })}
              className="w-full px-3 py-2 text-xs font-mono font-semibold rounded-lg border border-slate-300 focus:outline-indigo-600"
            />
          </div>

          {/* Risk Per Trade Slider */}
          <div>
            <div className="flex justify-between items-center text-xs font-semibold text-slate-700 mb-1">
              <span>Risk Per Trade (%)</span>
              <span className="font-mono text-indigo-600 font-bold">{params.riskPerTradePercent}% (₹{breakdown.capitalAtRisk.toLocaleString('en-IN')})</span>
            </div>
            <input
              type="range"
              min="0.25"
              max="5.0"
              step="0.25"
              value={params.riskPerTradePercent}
              onChange={(e) => setParams({ ...params, riskPerTradePercent: Number(e.target.value) })}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1">
              <span>0.25% (Conservative)</span>
              <span>1% (Standard)</span>
              <span>2% (Aggressive)</span>
              <span>5% (Max)</span>
            </div>
          </div>

          {/* Max Single Stock Capital Exposure */}
          <div>
            <div className="flex justify-between items-center text-xs font-semibold text-slate-700 mb-1">
              <span>Single-Stock Exposure Ceiling (%)</span>
              <span className="font-mono text-slate-900 font-bold">{params.maxExposureLimitPercent}%</span>
            </div>
            <input
              type="range"
              min="5"
              max="50"
              step="5"
              value={params.maxExposureLimitPercent}
              onChange={(e) => setParams({ ...params, maxExposureLimitPercent: Number(e.target.value) })}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
            <div className="text-[10px] text-slate-500 mt-1">
              Hard cap: max ₹{((params.totalCapital * params.maxExposureLimitPercent) / 100).toLocaleString('en-IN')} allocated to one ticker
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Planned Entry Price (₹)
              </label>
              <input
                type="number"
                step="0.05"
                value={params.entryPrice}
                onChange={(e) => setParams({ ...params, entryPrice: Math.max(0.1, Number(e.target.value)) })}
                className="w-full px-3 py-2 text-xs font-mono font-semibold rounded-lg border border-slate-300 focus:outline-indigo-600"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Stop-Loss Price (₹)
              </label>
              <input
                type="number"
                step="0.05"
                value={params.stopLossPrice}
                onChange={(e) => setParams({ ...params, stopLossPrice: Math.max(0.05, Number(e.target.value)) })}
                className="w-full px-3 py-2 text-xs font-mono font-semibold rounded-lg border border-rose-300 bg-rose-50/30 text-rose-900 focus:outline-rose-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Target Price (₹)
            </label>
            <input
              type="number"
              step="0.05"
              value={params.targetPrice}
              onChange={(e) => setParams({ ...params, targetPrice: Math.max(params.entryPrice, Number(e.target.value)) })}
              className="w-full px-3 py-2 text-xs font-mono font-semibold rounded-lg border border-emerald-300 bg-emerald-50/30 text-emerald-900 focus:outline-emerald-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Product Segment
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setParams({ ...params, accountType: 'EQUITY_DELIVERY' })}
                className={`py-2 px-3 text-xs font-bold rounded-lg border transition-all ${
                  params.accountType === 'EQUITY_DELIVERY'
                    ? 'bg-indigo-900 text-white border-indigo-900 shadow-2xs'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                }`}
              >
                Delivery (CNC 0.1% STT)
              </button>
              <button
                type="button"
                onClick={() => setParams({ ...params, accountType: 'EQUITY_INTRADAY' })}
                className={`py-2 px-3 text-xs font-bold rounded-lg border transition-all ${
                  params.accountType === 'EQUITY_INTRADAY'
                    ? 'bg-indigo-900 text-white border-indigo-900 shadow-2xs'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                }`}
              >
                Intraday (MIS 0.025% STT)
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Mathematical Breakdown & Warnings (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Active Warnings if Exceeded */}
          {breakdown.warnings.length > 0 && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs space-y-2">
              <div className="flex items-center gap-2 font-bold text-rose-950">
                <ShieldAlert className="w-4 h-4 text-rose-600" />
                <span>Safeguard Threshold Triggered ({breakdown.warnings.length})</span>
              </div>
              <ul className="list-disc pl-5 space-y-1 text-[11px] text-rose-800">
                {breakdown.warnings.map((warn, i) => (
                  <li key={i}>{warn}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Sizing Breakdown Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider text-slate-500">
              Institutional Mathematical Output
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div className="text-[10px] text-slate-500 uppercase font-semibold">Recommended Qty</div>
                <div className="text-xl font-black text-slate-900 font-mono mt-0.5">{breakdown.recommendedShares}</div>
                <div className="text-[9px] text-slate-400">units to purchase</div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div className="text-[10px] text-slate-500 uppercase font-semibold">Stop Distance</div>
                <div className="text-xl font-black text-rose-600 font-mono mt-0.5">
                  ₹{breakdown.stopLossDistance}
                </div>
                <div className="text-[9px] text-rose-500">({breakdown.stopLossPercent}% drop)</div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div className="text-[10px] text-slate-500 uppercase font-semibold">Exposure Ratio</div>
                <div className="text-xl font-black text-indigo-600 font-mono mt-0.5">
                  {breakdown.capitalExposurePercent}%
                </div>
                <div className="text-[9px] text-slate-400">of ₹{params.totalCapital.toLocaleString('en-IN')}</div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div className="text-[10px] text-slate-500 uppercase font-semibold">Risk : Reward</div>
                <div className="text-xl font-black text-emerald-600 font-mono mt-0.5">
                  1 : {breakdown.riskRewardRatio}
                </div>
                <div className="text-[9px] text-emerald-500">Target ₹{breakdown.potentialProfitAtTarget.toLocaleString('en-IN')}</div>
              </div>
            </div>

            {/* Indian Regulatory Friction Table */}
            <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
              <div className="bg-slate-50 px-3.5 py-2 font-bold text-slate-700 flex justify-between">
                <span>Indian Exchange Transaction Breakdown</span>
                <span className="font-mono text-slate-500 text-[11px]">Round-Trip Charges</span>
              </div>
              <div className="divide-y divide-slate-100 p-3 space-y-2 bg-white">
                <div className="flex justify-between text-slate-600">
                  <span>Brokerage (Discount Cap ₹20/order):</span>
                  <span className="font-mono text-slate-900 font-semibold">₹{breakdown.brokerage.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-600 pt-1.5">
                  <span>Securities Transaction Tax (STT):</span>
                  <span className="font-mono text-slate-900 font-semibold">₹{breakdown.stt.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-600 pt-1.5">
                  <span>Exchange Turnover (NSE 0.00297%):</span>
                  <span className="font-mono text-slate-900 font-semibold">₹{breakdown.exchangeCharges.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-600 pt-1.5">
                  <span>SEBI Turnover Fee + Stamp Duty:</span>
                  <span className="font-mono text-slate-900 font-semibold">
                    ₹{(breakdown.sebiTurnoverFee + breakdown.stampDuty).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-slate-600 pt-1.5">
                  <span>GST (18% on Brokerage & Exchange Fee):</span>
                  <span className="font-mono text-slate-900 font-semibold">₹{breakdown.gst.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-900 font-bold pt-2 border-t border-slate-200">
                  <span>Total Transaction Slippage & Taxes:</span>
                  <span className="font-mono text-indigo-700">₹{breakdown.totalCharges.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-rose-950 font-black bg-rose-50 p-2 rounded-lg border border-rose-200">
                  <span>Net Capital at Risk (Loss + All Charges):</span>
                  <span className="font-mono text-rose-700">₹{breakdown.netRiskIncludingCharges.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            {onApplyToTerminal && breakdown.recommendedShares > 0 && (
              <button
                type="button"
                onClick={() =>
                  onApplyToTerminal({
                    quantity: breakdown.recommendedShares,
                    entryPrice: params.entryPrice,
                    stopLossPrice: params.stopLossPrice,
                    targetPrice: params.targetPrice,
                    product: params.accountType === 'EQUITY_DELIVERY' ? 'CNC' : 'MIS',
                  })
                }
                className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-2xs transition-colors flex items-center justify-center gap-2"
              >
                <span>Pre-Fill {breakdown.recommendedShares} Shares in Live Order Desk</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
