import React from 'react';
import {
  BrokerAccount,
  RiskManagementSettings,
  TradingHolding,
  TradingOrder,
  TradingPosition,
} from '../../types/trading';
import { computeDividendCalendar } from '../../utils/evenMoreModulesData';
import { Download, FileText, Printer, ShieldCheck, X } from 'lucide-react';

interface ExecutiveBriefModalProps {
  isOpen: boolean;
  onClose: () => void;
  holdings: TradingHolding[];
  positions: TradingPosition[];
  orders: TradingOrder[];
  brokerAccount: BrokerAccount;
  riskSettings: RiskManagementSettings;
  onExportSuccess?: (msg: string) => void;
}

export const ExecutiveBriefModal: React.FC<ExecutiveBriefModalProps> = ({
  isOpen,
  onClose,
  holdings,
  positions,
  orders,
  brokerAccount,
  riskSettings,
  onExportSuccess,
}) => {
  if (!isOpen) return null;

  const totalInvested = holdings.reduce((s, h) => s + h.investedValue, 0);
  const totalCurrent = holdings.reduce((s, h) => s + h.currentValue, 0);
  const totalPnl = totalCurrent - totalInvested;
  const totalPnlPct = totalInvested > 0 ? Math.round((totalPnl / totalInvested) * 1000) / 10 : 0;
  const openMtm = positions.reduce((s, p) => s + p.pnl, 0);
  const divSummary = computeDividendCalendar(holdings);

  const sectorTotals = holdings.reduce<Record<string, number>>((acc, h) => {
    acc[h.sector] = (acc[h.sector] || 0) + h.currentValue;
    return acc;
  }, {});
  const sortedSectors = Object.entries(sectorTotals).sort((a, b) => b[1] - a[1]);

  const handleDownloadCsvBrief = () => {
    const lines = [
      'Section,Metric,Value',
      `Portfolio,Total Invested INR,${totalInvested.toFixed(2)}`,
      `Portfolio,Current Value INR,${totalCurrent.toFixed(2)}`,
      `Portfolio,Net Unrealized PnL INR,${totalPnl.toFixed(2)} (${totalPnlPct}%)`,
      `Trading Desk,Open Positions MTM INR,${openMtm.toFixed(2)}`,
      `Trading Desk,Session Executed Orders,${orders.length}`,
      `Dividends,Projected Annual Dividend INR,${divSummary.totalAnnualDividend.toFixed(2)}`,
      `Dividends,Portfolio Dividend Yield,${divSummary.portfolioCurrentYield}%`,
      `Risk Guardrails,Daily Loss Cap INR,${riskSettings.dailyLossLimit}`,
      `Risk Guardrails,Kill Switch Engaged,${riskSettings.isKillSwitchEngaged ? 'YES' : 'NO'}`,
      '',
      'Symbol,Qty,Avg Cost,Current Price,Current Value INR,PnL INR,Sector',
      ...holdings.map(
        (h) =>
          `${h.symbol},${h.quantity},${h.buyAvgPrice},${h.currentPrice},${h.currentValue},${h.totalPnl},${h.sector}`
      ),
    ];

    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Wealth_Executive_Brief_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    onExportSuccess?.('Downloaded Executive Portfolio & Risk CSV Brief.');
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl max-w-3xl w-full max-h-[88vh] flex flex-col border border-slate-200 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Bar */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <FileText className="w-5 h-5 text-indigo-600" />
            <div>
              <h3 className="text-sm font-bold text-slate-950">
                Portfolio, Risk &amp; Tax Executive Brief
              </h3>
              <p className="text-[11px] text-slate-500">
                Generated {new Date().toLocaleDateString('en-IN')} · Broker: {brokerAccount.broker.toUpperCase()} ({brokerAccount.clientCode})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownloadCsvBrief}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
            <button
              type="button"
              onClick={() => {
                let fired = false;
                const notifyDone = () => {
                  if (fired) return;
                  fired = true;
                  window.removeEventListener('afterprint', notifyDone);
                  onExportSuccess?.('Portfolio Executive Brief PDF / Print export completed.');
                };
                window.addEventListener('afterprint', notifyDone);
                window.print();
                window.setTimeout(notifyDone, 150);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 rounded-lg transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/70"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs">
          {/* 4 Summary Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-slate-500 block">Holdings Value</span>
              <span className="text-base font-bold font-mono tabular-nums text-slate-950 mt-1 block">
                ₹{totalCurrent.toLocaleString('en-IN')}
              </span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-slate-500 block">Unrealized P&amp;L</span>
              <span
                className={`text-base font-bold font-mono tabular-nums mt-1 block ${
                  totalPnl >= 0 ? 'text-emerald-700' : 'text-rose-700'
                }`}
              >
                {totalPnl >= 0 ? '+' : ''}₹{totalPnl.toLocaleString('en-IN')} ({totalPnlPct}%)
              </span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-slate-500 block">Proj. Annual Dividends</span>
              <span className="text-base font-bold font-mono tabular-nums text-slate-950 mt-1 block">
                ₹{divSummary.totalAnnualDividend.toLocaleString('en-IN')}
              </span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-slate-500 block">Active Fills / MTM</span>
              <span className="text-base font-bold font-mono tabular-nums text-slate-950 mt-1 block">
                {orders.length} orders · {openMtm >= 0 ? '+' : ''}₹{openMtm.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          {/* Sector Concentration + Risk Guardrails */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="p-4 rounded-xl border border-slate-200 space-y-2.5">
              <h4 className="font-bold text-slate-900 text-xs">Sector Allocation Breakdown</h4>
              <div className="space-y-2">
                {sortedSectors.map(([sec, val]) => {
                  const pct = Math.round((val / Math.max(1, totalCurrent)) * 1000) / 10;
                  return (
                    <div key={sec}>
                      <div className="flex justify-between mb-0.5">
                        <span className="font-medium text-slate-700">{sec}</span>
                        <span className="font-mono tabular-nums text-slate-900">
                          {pct}% (₹{val.toLocaleString('en-IN')})
                        </span>
                      </div>
                      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 space-y-2.5">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-slate-900 text-xs">Active Risk Circuit Breakers</h4>
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="divide-y divide-slate-100">
                <div className="py-2 flex justify-between">
                  <span className="text-slate-600">Max Risk Per Trade</span>
                  <span className="font-mono font-bold text-slate-900">
                    {riskSettings.maxRiskPerTradePercent}%
                  </span>
                </div>
                <div className="py-2 flex justify-between">
                  <span className="text-slate-600">Daily Loss Guard Cap</span>
                  <span className="font-mono font-bold text-slate-900">
                    ₹{riskSettings.dailyLossLimit.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="py-2 flex justify-between">
                  <span className="text-slate-600">Max Single-Stock Exposure</span>
                  <span className="font-mono font-bold text-slate-900">
                    {riskSettings.maxCapitalExposurePercent}%
                  </span>
                </div>
                <div className="py-2 flex justify-between">
                  <span className="text-slate-600">Emergency Kill Switch</span>
                  <span
                    className={`font-mono font-bold ${
                      riskSettings.isKillSwitchEngaged ? 'text-rose-700' : 'text-emerald-700'
                    }`}
                  >
                    {riskSettings.isKillSwitchEngaged ? 'ENGAGED' : 'ARMED & NOMINAL'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Holdings Snapshot */}
          <div className="rounded-xl border border-slate-200 overflow-hidden">
            <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 font-bold text-slate-900">
              Demat Holdings Register ({holdings.length} positions)
            </div>
            <table className="w-full text-left">
              <thead className="bg-slate-50/70 text-slate-600 border-b border-slate-200">
                <tr>
                  <th className="px-3 py-2">Symbol</th>
                  <th className="px-3 py-2 text-right">Qty</th>
                  <th className="px-3 py-2 text-right">Avg Price</th>
                  <th className="px-3 py-2 text-right">Cur Value</th>
                  <th className="px-3 py-2 text-right">P&amp;L</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono tabular-nums">
                {holdings.map((h) => (
                  <tr key={h.symbol}>
                    <td className="px-3 py-2 font-sans font-bold text-slate-900">{h.symbol}</td>
                    <td className="px-3 py-2 text-right">{h.quantity}</td>
                    <td className="px-3 py-2 text-right">₹{h.buyAvgPrice.toLocaleString('en-IN')}</td>
                    <td className="px-3 py-2 text-right">₹{h.currentValue.toLocaleString('en-IN')}</td>
                    <td
                      className={`px-3 py-2 text-right font-semibold ${
                        h.totalPnl >= 0 ? 'text-emerald-700' : 'text-rose-700'
                      }`}
                    >
                      {h.totalPnl >= 0 ? '+' : ''}₹{h.totalPnl.toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
