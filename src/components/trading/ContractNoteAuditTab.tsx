import React, { useMemo, useState } from 'react';
import { BrokerageSegment, TradingOrder } from '../../types/trading';
import { computeContractNoteCharges } from '../../utils/evenMoreModulesData';
import { StatCard } from '../common/StatCard';
import { Receipt, AlertTriangle, Calculator } from 'lucide-react';

interface ContractNoteAuditTabProps {
  orders: TradingOrder[];
}

export const ContractNoteAuditTab: React.FC<ContractNoteAuditTabProps> = ({ orders }) => {
  const [segment, setSegment] = useState<BrokerageSegment>('EQUITY_INTRADAY');
  const [buyPrice, setBuyPrice] = useState(2950);
  const [sellPrice, setSellPrice] = useState(2975);
  const [quantity, setQuantity] = useState(40);
  const [brokeragePerOrder, setBrokeragePerOrder] = useState(20);
  const [tradesPerDay, setTradesPerDay] = useState(4);

  const breakdown = useMemo(
    () => computeContractNoteCharges(segment, buyPrice, sellPrice, quantity, brokeragePerOrder),
    [segment, buyPrice, sellPrice, quantity, brokeragePerOrder]
  );

  // Overtrading annual drag over 245 NSE sessions/year
  const annualOvertradeFriction = Math.round(breakdown.totalCharges * tradesPerDay * 245);

  // Live executed orders sum from Live Terminal
  const liveOrdersTotalCharges = Math.round(orders.reduce((s, o) => s + o.totalCharges, 0) * 100) / 100;
  const liveOrdersTurnover = Math.round(orders.reduce((s, o) => s + o.price * o.quantity, 0));

  const chargeRows = [
    { label: 'Brokerage (Buy + Sell)', value: breakdown.brokerage, note: segment === 'EQUITY_DELIVERY' ? '₹0 Zero-Delivery Model' : `Max ₹${brokeragePerOrder}/executed order` },
    { label: 'Securities Transaction Tax (STT)', value: breakdown.stt, note: segment === 'EQUITY_OPTIONS' ? '0.1% Sell Premium (Oct 2024)' : segment === 'EQUITY_FUTURES' ? '0.02% Sell Futures' : segment === 'EQUITY_INTRADAY' ? '0.025% Sell Side' : '0.1% Buy & Sell' },
    { label: 'NSE Exchange Tx Charge', value: breakdown.exchangeTxCharge, note: 'True-to-label flat NSE slab' },
    { label: 'SEBI Turnover Fee', value: breakdown.sebiTurnoverFee, note: '₹10 per Crore (0.0001%)' },
    { label: 'Stamp Duty (Buy Only)', value: breakdown.stampDuty, note: segment === 'EQUITY_DELIVERY' ? '0.015%' : '0.003% / 0.002%' },
    { label: 'CDSL DP Depository Charge', value: breakdown.dpCharge, note: segment === 'EQUITY_DELIVERY' ? '₹13.50 + 18% GST per scrip sell' : 'N/A for intraday/F&O' },
    { label: 'GST (18%)', value: breakdown.gst, note: '18% on (Brokerage + Exchange + SEBI)' },
  ];

  return (
    <div className="space-y-6">
      {/* Header Summary */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-500 ring-4 ring-orange-100" />
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                Broker Contract Note, STT &amp; Turnover Charge Breakeven Auditor
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Audits every rupee of Indian statutory friction (STT, NSE Tx, SEBI Fee, Stamp Duty, DP, 18% GST), calculates exact breakeven points, and monitors your executed terminal fills.
            </p>
          </div>
          <span className="px-2.5 py-1 text-[11px] font-mono font-semibold bg-slate-100 text-slate-700 border border-slate-200 rounded-lg shrink-0">
            Updated NSE / STT Slabs
          </span>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard
            label="Total Round-Trip Charges"
            value={`₹${breakdown.totalCharges.toFixed(2)}`}
            subtext={`On ₹${breakdown.totalTurnover.toLocaleString('en-IN')} turnover`}
            statusType="elevated"
          />
          <StatCard
            label="Net P&L After Friction"
            value={`${breakdown.netPnl >= 0 ? '+' : ''}₹${breakdown.netPnl.toFixed(2)}`}
            subtext={`Gross P&L: ${breakdown.grossPnl >= 0 ? '+' : ''}₹${breakdown.grossPnl.toFixed(2)}`}
            statusType={breakdown.netPnl >= 0 ? 'nominal' : 'demanding'}
          />
          <StatCard
            label="Points to Breakeven"
            value={`₹${breakdown.breakevenPointsPerUnit.toFixed(2)}/unit`}
            subtext={`${breakdown.breakevenMovePercent}% price move required`}
            statusType="neutral"
          />
          <StatCard
            label="Today's Live Terminal Fees"
            value={`₹${liveOrdersTotalCharges.toFixed(2)}`}
            subtext={`${orders.length} order(s) · ₹${liveOrdersTurnover.toLocaleString('en-IN')} vol`}
            statusType="neutral"
          />
        </div>
      </div>

      {/* Interactive Calculator + Contract Note Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-5 p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 font-mono flex items-center gap-1.5 border-b border-slate-100 pb-3">
            <Calculator className="w-4 h-4 text-orange-600" />
            Trade Friction Simulator
          </h4>

          <div className="space-y-3 text-xs font-mono">
            <div>
              <label className="text-[11px] text-slate-600 font-semibold block mb-1">Exchange Segment</label>
              <select
                value={segment}
                onChange={(e) => setSegment(e.target.value as BrokerageSegment)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-bold text-slate-900"
              >
                <option value="EQUITY_DELIVERY">Equity Delivery (CNC)</option>
                <option value="EQUITY_INTRADAY">Equity Intraday (MIS)</option>
                <option value="EQUITY_FUTURES">Equity / Index Futures</option>
                <option value="EQUITY_OPTIONS">Equity / Index Options (Premium)</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-slate-600 font-semibold block mb-1">Buy Price (₹)</label>
                <input
                  type="number"
                  step="0.5"
                  value={buyPrice}
                  onChange={(e) => setBuyPrice(Math.max(0.05, parseFloat(e.target.value) || 0))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-bold"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-600 font-semibold block mb-1">Sell Price (₹)</label>
                <input
                  type="number"
                  step="0.5"
                  value={sellPrice}
                  onChange={(e) => setSellPrice(Math.max(0.05, parseFloat(e.target.value) || 0))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-bold"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-slate-600 font-semibold block mb-1">Quantity</label>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-bold"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-600 font-semibold block mb-1">Brokerage / Order (₹)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={brokeragePerOrder}
                  onChange={(e) => setBrokeragePerOrder(Math.max(0, parseFloat(e.target.value) || 0))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-bold"
                />
              </div>
            </div>

            {/* Overtrading Cost Compounding Check */}
            <div className="p-3.5 rounded-xl bg-rose-50/70 border border-rose-200 space-y-2">
              <div className="flex justify-between font-bold text-rose-950">
                <span>Overtrading Drag Check ({tradesPerDay} round-trips/day)</span>
                <span>₹{annualOvertradeFriction.toLocaleString('en-IN')}/yr</span>
              </div>
              <input
                type="range"
                min="1"
                max="15"
                value={tradesPerDay}
                onChange={(e) => setTradesPerDay(parseInt(e.target.value, 10))}
                className="w-full accent-rose-600 cursor-pointer"
              />
              <p className="text-[11px] font-sans text-rose-900">
                At {tradesPerDay} similar trades/day over 245 trading sessions, you surrender ₹{annualOvertradeFriction.toLocaleString('en-IN')}/yr purely in statutory &amp; brokerage friction before making a single rupee of profit.
              </p>
            </div>
          </div>
        </div>

        {/* Right: Line-by-Line Contract Note + Live Session Orders */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 font-mono flex items-center gap-1.5">
                <Receipt className="w-4 h-4 text-slate-700" />
                Line-by-Line Statutory Contract Note Breakdown
              </h4>
              <span className="text-[11px] font-mono font-bold text-orange-700">
                Total Drag: ₹{breakdown.totalCharges.toFixed(2)}
              </span>
            </div>

            <div className="divide-y divide-slate-100 text-xs font-mono">
              {chargeRows.map((row) => (
                <div key={row.label} className="px-5 py-2.5 flex items-center justify-between gap-2 hover:bg-slate-50">
                  <div>
                    <div className="font-semibold text-slate-800 font-sans">{row.label}</div>
                    <div className="text-[10px] text-slate-500">{row.note}</div>
                  </div>
                  <span className="font-bold text-slate-900">₹{row.value.toFixed(2)}</span>
                </div>
              ))}
              <div className="px-5 py-3 bg-slate-900 text-white flex items-center justify-between">
                <span className="font-bold uppercase tracking-wider text-[11px]">Net Realized Settlement</span>
                <span className={`font-bold text-sm ${breakdown.netPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {breakdown.netPnl >= 0 ? '+' : ''}₹{breakdown.netPnl.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Live Session Orders Charge Audit */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="px-5 py-3 border-b border-slate-200 flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 font-mono">
                Live Desk Contract Note Fills ({orders.length})
              </h4>
              <span className="text-[11px] font-mono text-slate-500">
                Session Total Chgs: ₹{liveOrdersTotalCharges.toFixed(2)}
              </span>
            </div>
            <div className="overflow-x-auto max-h-52">
              <table className="w-full text-left text-xs font-mono border-collapse">
                <thead className="bg-slate-50 text-slate-600 text-[10px] uppercase border-b border-slate-200 sticky top-0">
                  <tr>
                    <th className="py-2 px-4">Order</th>
                    <th className="py-2 px-3 text-right">Qty × Price</th>
                    <th className="py-2 px-3 text-right">Brok.</th>
                    <th className="py-2 px-3 text-right">STT</th>
                    <th className="py-2 px-3 text-right">GST</th>
                    <th className="py-2 px-4 text-right">Total Chg</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {orders.map((o) => (
                    <tr key={o.id} className="hover:bg-slate-50">
                      <td className="py-2 px-4">
                        <span className={`font-bold ${o.side === 'BUY' ? 'text-emerald-700' : 'text-rose-700'}`}>
                          {o.side}
                        </span>{' '}
                        <strong className="text-slate-900">{o.symbol}</strong>{' '}
                        <span className="text-[10px] text-slate-400">({o.product})</span>
                      </td>
                      <td className="py-2 px-3 text-right text-slate-700">
                        {o.quantity} × ₹{o.price.toFixed(2)}
                      </td>
                      <td className="py-2 px-3 text-right text-slate-600">₹{o.brokerage.toFixed(2)}</td>
                      <td className="py-2 px-3 text-right text-slate-600">₹{o.stt.toFixed(2)}</td>
                      <td className="py-2 px-3 text-right text-slate-600">₹{o.gst.toFixed(2)}</td>
                      <td className="py-2 px-4 text-right font-bold text-orange-700">₹{o.totalCharges.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center gap-2 text-[11px] text-slate-500">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span>Always reconcile broker EOD contract notes against your Income Tax turnover &amp; Schedule CG filings.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
