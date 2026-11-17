import React, { useState } from 'react';
import {
  INITIAL_TAX_LOTS,
  simulateTaxHarvest,
} from '../../utils/advancedTradingData';
import { TaxHarvestSimulationResult, TaxLot } from '../../types/trading';
import {
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  ShieldCheck,
  Calculator,
  Calendar,
  CheckCircle2,
  FileText,
  DollarSign,
  ArrowRight,
  Info,
} from 'lucide-react';

interface TaxLossHarvestingTabProps {
  onStageHarvestOrders?: (lots: TaxLot[], simulation: TaxHarvestSimulationResult) => void;
}

export const TaxLossHarvestingTab: React.FC<TaxLossHarvestingTabProps> = ({
  onStageHarvestOrders,
}) => {
  const [lots] = useState(INITIAL_TAX_LOTS);
  const [selectedLotIds, setSelectedLotIds] = useState<string[]>(['LOT-TM-01', 'LOT-BAJAJHFL-02']);
  const [stcgGainsInput, setStcgGainsInput] = useState<number>(52030);
  const [ltcgGainsInput, setLtcgGainsInput] = useState<number>(14550);
  const [stagedFeedback, setStagedFeedback] = useState<string | null>(null);

  const simulation: TaxHarvestSimulationResult = simulateTaxHarvest(
    selectedLotIds,
    stcgGainsInput,
    ltcgGainsInput
  );

  const toggleSelectLot = (lotId: string) => {
    setSelectedLotIds((prev) =>
      prev.includes(lotId) ? prev.filter((id) => id !== lotId) : [...prev, lotId]
    );
  };

  const lossLots = lots.filter((l) => l.unrealizedPnl < 0);
  const gainLots = lots.filter((l) => l.unrealizedPnl >= 0);

  const totalUnrealizedLoss = lossLots.reduce((acc, l) => acc + l.unrealizedPnl, 0);

  return (
    <div className="space-y-6">
      {/* Header and FY Countdown Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30">
              Indian FY 2024–25 (Ends 31 March 2025)
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Section 70 Set-off Active
            </span>
          </div>
          <h2 className="text-xl font-bold tracking-tight">Tax-Loss Harvesting Planner</h2>
          <p className="text-xs text-slate-300 max-w-2xl mt-1">
            Identify underwater equity lots to realize capital losses before March 31, offsetting taxable Short-Term Capital Gains (taxed at 20%) and Long-Term Capital Gains (taxed at 12.5%).
          </p>
        </div>

        <div className="flex items-center gap-4 bg-slate-800/80 border border-slate-700/60 p-3.5 rounded-xl shrink-0">
          <div>
            <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Simulated Tax Savings</div>
            <div className="text-xl font-black text-emerald-400 font-mono">₹{simulation.estimatedTaxSaved.toLocaleString('en-IN')}</div>
          </div>
          <div className="h-8 w-px bg-slate-700" />
          <div>
            <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Harvestable Losses</div>
            <div className="text-xl font-black text-rose-400 font-mono">₹{Math.abs(simulation.totalHarvestableLoss).toLocaleString('en-IN')}</div>
          </div>
        </div>
      </div>

      {/* Statutory & Anti-Stripping Risk Disclosure */}
      <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-950 text-xs flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <strong className="block font-bold">Important Tax Caution & Anti-Stripping Disclosures (Sec 94(7) & 94(8)):</strong>
          <p className="text-amber-800 leading-relaxed text-[11px]">
            Unlike the US IRS 30-day Wash Sale Rule, India does not have a formal blanket "wash sale" code for normal equities, but Section 94(7) and Section 94(8) strictly disallow loss claims if shares are acquired within 3 months prior to a record date and sold within 3 or 9 months thereafter (dividend/bonus stripping). Immediate buyback or artificial loss creation without bona fide commercial rationale may be scrutinized under Indian General Anti-Avoidance Rules (GAAR). Always verify with a qualified Chartered Accountant (CA) before executing transactions.
          </p>
        </div>
      </div>

      {/* Simulation Control Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Lot Matrix */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-600" />
              <span>Unrealized Holdings by Tax Lot</span>
              <span className="text-xs font-normal text-slate-500">
                ({selectedLotIds.length} of {lossLots.length} loss-making lots selected)
              </span>
            </h3>
            <button
              type="button"
              onClick={() => setSelectedLotIds(lossLots.map((l) => l.lotId))}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
            >
              Select All Loss Lots
            </button>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase text-[10px] font-semibold tracking-wider">
                    <th className="py-2.5 px-3">Select</th>
                    <th className="py-2.5 px-3">Lot Symbol</th>
                    <th className="py-2.5 px-3">Broker & Date</th>
                    <th className="py-2.5 px-3">Qty & Cost</th>
                    <th className="py-2.5 px-3">Current CMP</th>
                    <th className="py-2.5 px-3">Unrealized P&L</th>
                    <th className="py-2.5 px-3">Term</th>
                    <th className="py-2.5 px-3">Potential Offset</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {lots.map((lot) => {
                    const isSelected = selectedLotIds.includes(lot.lotId);
                    const isLoss = lot.unrealizedPnl < 0;

                    return (
                      <tr
                        key={lot.lotId}
                        onClick={() => isLoss && toggleSelectLot(lot.lotId)}
                        className={`transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-rose-50/70 hover:bg-rose-50'
                            : isLoss
                            ? 'hover:bg-slate-50'
                            : 'bg-emerald-50/30 hover:bg-emerald-50/50'
                        }`}
                      >
                        <td className="py-3 px-3">
                          {isLoss ? (
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleSelectLot(lot.lotId)}
                              className="rounded border-slate-300 text-rose-600 focus:ring-rose-500 w-4 h-4 cursor-pointer"
                            />
                          ) : (
                            <span className="text-[10px] text-slate-400 font-medium">—</span>
                          )}
                        </td>
                        <td className="py-3 px-3 font-semibold text-slate-900">
                          <div>{lot.symbol}</div>
                          <div className="text-[10px] text-slate-500 font-normal">{lot.companyName}</div>
                        </td>
                        <td className="py-3 px-3 text-slate-600">
                          <span className="uppercase text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-100 mr-1.5 text-slate-700">
                            {lot.broker}
                          </span>
                          <span className="text-[11px] font-mono">{lot.buyDate}</span>
                        </td>
                        <td className="py-3 px-3">
                          <div className="font-mono font-medium">{lot.quantity} shares</div>
                          <div className="text-[10px] text-slate-500 font-mono">₹{lot.buyPrice} avg</div>
                        </td>
                        <td className="py-3 px-3 font-mono font-semibold text-slate-900">
                          ₹{lot.currentPrice}
                        </td>
                        <td className="py-3 px-3 font-mono">
                          <div
                            className={`font-bold flex items-center gap-1 ${
                              isLoss ? 'text-rose-600' : 'text-emerald-600'
                            }`}
                          >
                            {isLoss ? <TrendingDown className="w-3.5 h-3.5" /> : <TrendingUp className="w-3.5 h-3.5" />}
                            <span>₹{Math.abs(lot.unrealizedPnl).toLocaleString('en-IN')}</span>
                          </div>
                          <div className={`text-[10px] ${isLoss ? 'text-rose-500' : 'text-emerald-500'}`}>
                            {lot.unrealizedPnlPercent > 0 ? '+' : ''}
                            {lot.unrealizedPnlPercent.toFixed(1)}%
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              lot.isLongTerm
                                ? 'bg-indigo-100 text-indigo-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {lot.isLongTerm ? 'LTCG (>365d)' : `STCG (${lot.holdingDays}d)`}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-mono font-semibold">
                          {lot.potentialTaxOffset > 0 ? (
                            <span className="text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded text-[11px]">
                              +₹{lot.potentialTaxOffset.toLocaleString('en-IN')}
                            </span>
                          ) : (
                            <span className="text-slate-400 text-[10px]">In Gain</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Col: Interactive Tax Impact Simulator */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-5">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Calculator className="w-4 h-4 text-indigo-600" />
              <h3 className="text-sm font-bold text-slate-900">Tax Impact Simulator</h3>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Current Realized STCG (₹)
                </label>
                <input
                  type="number"
                  value={stcgGainsInput}
                  onChange={(e) => setStcgGainsInput(Math.max(0, Number(e.target.value)))}
                  className="w-full px-3 py-2 text-xs font-mono font-semibold rounded-lg border border-slate-300 focus:outline-indigo-600"
                />
                <span className="text-[10px] text-slate-500">Taxed at 20% flat under Finance Act 2024</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Current Realized LTCG (₹)
                </label>
                <input
                  type="number"
                  value={ltcgGainsInput}
                  onChange={(e) => setLtcgGainsInput(Math.max(0, Number(e.target.value)))}
                  className="w-full px-3 py-2 text-xs font-mono font-semibold rounded-lg border border-slate-300 focus:outline-indigo-600"
                />
                <span className="text-[10px] text-slate-500">Exempt up to ₹1,25,000; excess at 12.5%</span>
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl space-y-2 border border-slate-200/80 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Selected Harvest Loss:</span>
                <span className="font-mono font-bold text-rose-600">-₹{simulation.totalHarvestableLoss.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>STCG Offset Applied:</span>
                <span className="font-mono font-bold text-slate-900">₹{simulation.offsetStcg.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Original Estimated Tax:</span>
                <span className="font-mono font-medium text-slate-500 line-through">
                  ₹{Math.round(stcgGainsInput * 0.20 + Math.max(0, ltcgGainsInput - 125000) * 0.125).toLocaleString('en-IN')}
                </span>
              </div>
              <div className="h-px bg-slate-200 my-1" />
              <div className="flex justify-between text-slate-900 font-bold">
                <span>Revised Tax Payable:</span>
                <span className="font-mono text-indigo-600 text-sm">₹{simulation.revisedNetTaxPayable.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-emerald-800 bg-emerald-50 p-2 rounded-lg font-bold border border-emerald-200">
                <span>Net Direct Tax Saved:</span>
                <span className="font-mono text-emerald-700">+₹{simulation.estimatedTaxSaved.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {stagedFeedback && (
              <div className="p-2.5 rounded-lg bg-indigo-50 border border-indigo-200 text-[11px] text-indigo-900 font-medium">
                {stagedFeedback}
              </div>
            )}

            <button
              type="button"
              disabled={selectedLotIds.length === 0}
              onClick={() => {
                const selectedLots = lots.filter((l) => selectedLotIds.includes(l.lotId));
                if (onStageHarvestOrders) {
                  onStageHarvestOrders(selectedLots, simulation);
                } else {
                  setStagedFeedback(
                    `Simulated offsetting ₹${simulation.totalHarvestableLoss.toLocaleString(
                      'en-IN'
                    )} in losses to save ₹${simulation.estimatedTaxSaved.toLocaleString('en-IN')} tax.`
                  );
                }
              }}
              className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-2xs transition-colors flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Send Harvest Sell to Order Desk</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
