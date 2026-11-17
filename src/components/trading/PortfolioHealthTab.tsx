import React, { useState } from 'react';
import {
  TradingHolding,
  PortfolioHealthMetrics,
  BrokerType,
} from '../../types/trading';
import { computePortfolioHealth } from '../../utils/portfolioHealthData';
import { StatCard } from '../common/StatCard';
import {
  ShieldAlert,
  ShieldCheck,
  PieChart,
  Layers,
  AlertTriangle,
  Receipt,
  Building,
  CheckCircle2,
  Sliders,
  Info,
  ExternalLink,
} from 'lucide-react';

interface PortfolioHealthTabProps {
  holdings: TradingHolding[];
  onTradeSymbol?: (symbol: string) => void;
}

export const PortfolioHealthTab: React.FC<PortfolioHealthTabProps> = ({
  holdings,
  onTradeSymbol,
}) => {
  const [stockThreshold, setStockThreshold] = useState<number>(20);
  const [sectorThreshold, setSectorThreshold] = useState<number>(35);
  const [brokerFilter, setBrokerFilter] = useState<string>('ALL');

  const filteredHoldings = brokerFilter === 'ALL'
    ? holdings
    : holdings.filter((h) => h.broker === brokerFilter);

  const health = computePortfolioHealth(filteredHoldings, stockThreshold, sectorThreshold);

  const getBrokerBadge = (broker: BrokerType) => {
    switch (broker) {
      case 'zerodha':
        return <span className="px-1.5 py-0.5 text-[10px] font-mono font-bold bg-orange-100 text-orange-800 rounded border border-orange-200">Kite Connect</span>;
      case 'upstox':
        return <span className="px-1.5 py-0.5 text-[10px] font-mono font-bold bg-purple-100 text-purple-800 rounded border border-purple-200">Upstox</span>;
      case 'angelone':
        return <span className="px-1.5 py-0.5 text-[10px] font-mono font-bold bg-red-100 text-red-800 rounded border border-red-200">Angel One</span>;
      case 'paper':
        return <span className="px-1.5 py-0.5 text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 rounded border border-emerald-200">Paper Sim</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Combined Multi-Broker Overview */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-emerald-100" />
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                Consolidated Multi-Broker Portfolio Health
              </h3>
              <span className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider bg-slate-100 text-slate-700 rounded border border-slate-200">
                Live Aggregator
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Holistic exposure across Zerodha, Upstox, Angel One & simulated paper accounts.
            </p>
          </div>

          {/* Broker Filter Segment */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-lg border border-slate-200 text-xs font-semibold">
            {['ALL', 'zerodha', 'upstox', 'angelone', 'paper'].map((b) => (
              <button
                key={b}
                type="button"
                onClick={() => setBrokerFilter(b)}
                className={`px-2.5 py-1 rounded-md transition-all uppercase text-[11px] whitespace-nowrap shrink-0 ${
                  brokerFilter === b
                    ? 'bg-white text-slate-900 shadow-2xs font-bold'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {b === 'ALL' ? 'All Brokers' : b}
              </button>
            ))}
          </div>
        </div>

        {/* Executive Stat Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard
            label="Total Current Value"
            value={`₹${health.totalCurrentValue.toLocaleString()}`}
            subtext={`Invested: ₹${health.totalInvested.toLocaleString()}`}
            statusType="neutral"
          />
          <StatCard
            label="Unrealized P&L"
            value={`${health.totalUnrealizedPnl >= 0 ? '+' : ''}₹${health.totalUnrealizedPnl.toLocaleString()}`}
            subtext={`${health.totalPnlPercent >= 0 ? '+' : ''}${health.totalPnlPercent}% overall return`}
            statusType={health.totalUnrealizedPnl >= 0 ? 'nominal' : 'demanding'}
          />
          <StatCard
            label="Diversification Score"
            value={`${health.diversificationScore} / 100`}
            subtext={`Grade: ${health.diversificationRating}`}
            statusType={health.diversificationScore >= 70 ? 'nominal' : health.diversificationScore >= 50 ? 'elevated' : 'demanding'}
          />
          <StatCard
            label="Active Holdings"
            value={`${filteredHoldings.length} Assets`}
            subtext={`${health.sectorAllocations.length} Sectors · 3 Cap Tiers`}
            statusType="neutral"
          />
        </div>
      </div>

      {/* Concentration Alerts Card */}
      {health.concentrationAlerts.length > 0 && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 space-y-2">
          <div className="flex items-center gap-2 text-amber-900 font-bold text-xs uppercase tracking-wider">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Concentration & Exposure Warnings ({health.concentrationAlerts.length})</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {health.concentrationAlerts.map((alert, idx) => (
              <div
                key={idx}
                className="p-3 rounded-lg bg-white border border-amber-200/90 text-xs shadow-2xs flex items-start justify-between gap-3"
              >
                <div>
                  <span className="font-bold text-slate-900 block">{alert.title}</span>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Constitutes <strong className="text-amber-800">{alert.currentWeightPercent}%</strong> of portfolio against your safety cap of {alert.thresholdPercent}%.
                  </p>
                </div>
                <span className={`px-1.5 py-0.5 text-[9px] font-mono font-bold uppercase rounded border shrink-0 ${
                  alert.severity === 'danger'
                    ? 'bg-rose-100 text-rose-800 border-rose-200'
                    : 'bg-amber-100 text-amber-800 border-amber-200'
                }`}>
                  {alert.severity}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Interactive Sliders to Configure Threshold Warnings */}
      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-2 font-bold text-slate-800">
          <Sliders className="w-4 h-4 text-slate-600" />
          <span>Configurable Risk Alert Levers:</span>
        </div>
        <div className="flex flex-wrap items-center gap-6 w-full sm:w-auto">
          <div className="flex items-center gap-2">
            <span className="text-slate-600 font-medium">Single-Stock Cap:</span>
            <input
              type="range"
              min="10"
              max="40"
              step="5"
              value={stockThreshold}
              onChange={(e) => setStockThreshold(Number(e.target.value))}
              className="w-24 accent-slate-900 cursor-pointer"
            />
            <span className="font-mono font-bold text-slate-900 bg-white px-1.5 py-0.5 rounded border border-slate-200">
              {stockThreshold}%
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-600 font-medium">Sector Cap:</span>
            <input
              type="range"
              min="20"
              max="60"
              step="5"
              value={sectorThreshold}
              onChange={(e) => setSectorThreshold(Number(e.target.value))}
              className="w-24 accent-slate-900 cursor-pointer"
            />
            <span className="font-mono font-bold text-slate-900 bg-white px-1.5 py-0.5 rounded border border-slate-200">
              {sectorThreshold}%
            </span>
          </div>
        </div>
      </div>

      {/* Grid: Sector Allocation & Market Cap Tier Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Sector Allocation Breakdown */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <PieChart className="w-4 h-4 text-indigo-600" />
              <h4 className="text-sm font-bold text-slate-900">Sector Exposure</h4>
            </div>
            <span className="text-xs text-slate-500 font-mono">
              {health.sectorAllocations.length} Active Sectors
            </span>
          </div>

          {/* Allocation stacked progress bar */}
          <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden flex shadow-inner">
            {health.sectorAllocations.map((sec, i) => (
              <div
                key={i}
                style={{ width: `${sec.percent}%`, backgroundColor: sec.color }}
                title={`${sec.sector}: ${sec.percent}%`}
                className="h-full transition-all"
              />
            ))}
          </div>

          {/* Detailed Sector List */}
          <div className="space-y-2 pt-1">
            {health.sectorAllocations.map((sec, i) => (
              <div key={i} className="flex items-center justify-between text-xs py-1 border-b border-slate-100 last:border-0">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: sec.color }} />
                  <span className="font-semibold text-slate-800 truncate">{sec.sector}</span>
                </div>
                <div className="flex items-center gap-3 font-mono shrink-0">
                  <span className="text-slate-500">₹{sec.value.toLocaleString()}</span>
                  <span className="font-bold text-slate-900 w-12 text-right">{sec.percent}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Market Cap & Diversification Diagnostics */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-600" />
              <h4 className="text-sm font-bold text-slate-900">Market Cap Distribution</h4>
            </div>
            <span className="text-xs font-mono text-slate-500">SEBI Tiers</span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center">
            {health.marketCapAllocations.map((cap, i) => (
              <div key={i} className="p-3 rounded-xl bg-slate-50 border border-slate-200/90 space-y-1">
                <span className="text-[11px] font-semibold text-slate-600 block">{cap.category}</span>
                <span className="text-base font-bold font-mono text-slate-900 block">{cap.percent}%</span>
                <span className="text-[10px] text-slate-500 font-mono block">₹{cap.value.toLocaleString()}</span>
              </div>
            ))}
          </div>

          {/* Diversification Engine Explanation */}
          <div className="p-3.5 rounded-xl bg-indigo-50/70 border border-indigo-200/80 space-y-1.5 text-xs text-indigo-950">
            <div className="font-bold flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-indigo-700" />
              <span>HHI Concentration Index Analysis</span>
            </div>
            <p className="text-[11px] text-indigo-900 leading-relaxed">
              Herfindahl-Hirschman index balances capital spread across uncorrelated industries. Your portfolio achieves a score of <strong>{health.diversificationScore}/100 ({health.diversificationRating})</strong>, maintaining safe buffer against isolated single-asset shocks.
            </p>
          </div>
        </div>
      </div>

      {/* Tax View: STCG vs LTCG Calculator (Indian Finance Act Provisions) */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Receipt className="w-4 h-4 text-emerald-600" />
            <div>
              <h4 className="text-sm font-bold text-slate-900">
                Estimated Capital Gains Tax Liability View (FY 2024–25)
              </h4>
              <p className="text-xs text-slate-500">
                Short-Term vs. Long-Term Capital Gains under revised Indian Union Budget rates.
              </p>
            </div>
          </div>
          <span className="px-2.5 py-1 text-[11px] font-mono font-bold bg-emerald-50 text-emerald-800 rounded-lg border border-emerald-200 self-start sm:self-auto">
            Est. Total Tax: ₹{health.taxSummary.totalEstimatedTax.toLocaleString()}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* STCG Card */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900">Short-Term Capital Gains (STCG)</span>
              <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-blue-100 text-blue-800 rounded border border-blue-200">
                Flat 20%
              </span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Applicable on equity assets held for 365 days or less. Zero exemption threshold.
            </p>
            <div className="pt-2 border-t border-slate-200 space-y-1 font-mono text-xs">
              <div className="flex justify-between">
                <span className="text-slate-600">Unrealized STCG Gains:</span>
                <span className="font-bold text-slate-900">₹{health.taxSummary.stcgTotalGains.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-blue-900">
                <span className="font-semibold">STCG Tax Payable (20%):</span>
                <span className="font-bold">₹{health.taxSummary.stcgTaxPayable.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* LTCG Card */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900">Long-Term Capital Gains (LTCG)</span>
              <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 rounded border border-emerald-200">
                12.5% &gt; ₹1.25L Exemption
              </span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Applicable on equity held &gt; 365 days. First ₹1.25 Lakh aggregate gain is 100% tax-exempt.
            </p>
            <div className="pt-2 border-t border-slate-200 space-y-1 font-mono text-xs">
              <div className="flex justify-between">
                <span className="text-slate-600">Unrealized LTCG Gains:</span>
                <span className="font-bold text-slate-900">₹{health.taxSummary.ltcgTotalGains.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Exemption Threshold:</span>
                <span className="text-emerald-700 font-bold">-₹{health.taxSummary.ltcgExemptionLimit.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-emerald-900">
                <span className="font-semibold">LTCG Tax Payable (12.5%):</span>
                <span className="font-bold">₹{health.taxSummary.ltcgTaxPayable.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Regulatory Disclaimer Notice */}
        <div className="p-3 rounded-xl bg-slate-100 border border-slate-200 flex items-start gap-2.5 text-[11px] text-slate-600 leading-relaxed">
          <Info className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
          <span>
            <strong>Disclaimer:</strong> {health.taxSummary.disclaimer} Effective capital gains liabilities are subject to grandfathering provisions, surcharge brackets, and applicable 4% health & education cess.
          </span>
        </div>
      </div>

      {/* Combined Cross-Broker Holdings Table */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building className="w-4 h-4 text-slate-700" />
            <h4 className="text-sm font-bold text-slate-900">
              Aggregated Holdings Across Connected Accounts ({filteredHoldings.length})
            </h4>
          </div>
          <span className="text-xs text-slate-500 font-mono">Real-Time Sync</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Asset & Symbol</th>
                <th className="py-2.5 px-3">Broker Account</th>
                <th className="py-2.5 px-3">Sector & Cap</th>
                <th className="py-2.5 px-3 text-right">Qty</th>
                <th className="py-2.5 px-3 text-right">Avg Price</th>
                <th className="py-2.5 px-3 text-right">Current Price</th>
                <th className="py-2.5 px-3 text-right">Current Value</th>
                <th className="py-2.5 px-3 text-right">Total P&L</th>
                <th className="py-2.5 px-3 text-center">Tax Horizon</th>
                <th className="py-2.5 px-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredHoldings.map((h) => {
                const isProfitable = h.totalPnl >= 0;
                return (
                  <tr key={`${h.broker}-${h.symbol}`} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-900">{h.symbol}</div>
                      <div className="text-[11px] text-slate-500 truncate max-w-[150px]">{h.companyName}</div>
                    </td>
                    <td className="py-3 px-3">
                      {getBrokerBadge(h.broker)}
                    </td>
                    <td className="py-3 px-3">
                      <div className="text-slate-800 font-medium">{h.sector}</div>
                      <div className="text-[10px] text-slate-500">{h.marketCapCategory}</div>
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-slate-800">{h.quantity}</td>
                    <td className="py-3 px-3 text-right font-mono text-slate-600">₹{h.buyAvgPrice.toFixed(1)}</td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">₹{h.currentPrice.toFixed(1)}</td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">₹{h.currentValue.toLocaleString()}</td>
                    <td className={`py-3 px-3 text-right font-mono font-bold ${isProfitable ? 'text-emerald-700' : 'text-rose-700'}`}>
                      {isProfitable ? '+' : ''}₹{h.totalPnl.toLocaleString()}
                      <span className="block text-[10px] font-normal">
                        ({isProfitable ? '+' : ''}{h.totalPnlPercent}%)
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className={`px-2 py-0.5 text-[10px] font-mono font-bold rounded ${
                        h.isLongTerm
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : 'bg-blue-50 text-blue-800 border border-blue-200'
                      }`}>
                        {h.isLongTerm ? 'LTCG (>1yr)' : `STCG (${h.holdingDays}d)`}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      {onTradeSymbol && (
                        <button
                          onClick={() => onTradeSymbol(h.symbol)}
                          className="px-2 py-1 text-[11px] font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded transition-colors"
                        >
                          Trade
                        </button>
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
  );
};
