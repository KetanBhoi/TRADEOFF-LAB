import React, { useMemo, useState } from 'react';
import { TradingHolding } from '../../types/trading';
import { buildPledgeableAssets } from '../../utils/evenMoreModulesData';
import { StatCard } from '../common/StatCard';
import { Lock, ShieldCheck, AlertTriangle, ArrowRight, Sparkles } from 'lucide-react';

interface CollateralPledgeTabProps {
  holdings: TradingHolding[];
  onJumpToOptions?: () => void;
  onNotify?: (msg: string) => void;
}

export const CollateralPledgeTab: React.FC<CollateralPledgeTabProps> = ({
  holdings,
  onJumpToOptions,
  onNotify,
}) => {
  const [liquidEtfValue, setLiquidEtfValue] = useState(250000);
  const [cashMargin, setCashMargin] = useState(100000);
  const [pledgedState, setPledgedState] = useState<Record<string, boolean>>({});
  const [liquidEtfYieldPercent, setLiquidEtfYieldPercent] = useState(6.75);

  const assets = useMemo(
    () => buildPledgeableAssets(holdings, liquidEtfValue, pledgedState),
    [holdings, liquidEtfValue, pledgedState]
  );

  const pledgedCashEq = assets
    .filter((a) => a.isPledged && a.assetClass === 'CASH_EQUIVALENT')
    .reduce((s, a) => s + a.collateralValue, 0);

  const pledgedNonCash = assets
    .filter((a) => a.isPledged && a.assetClass === 'EQUITY_NON_CASH')
    .reduce((s, a) => s + a.collateralValue, 0);

  const totalCashSide = cashMargin + pledgedCashEq;
  const totalCollateralMargin = totalCashSide + pledgedNonCash;

  // SEBI 50:50 rule: overnight / option selling margins require at least 50% cash-equivalent side
  const usableNonCashCapped = Math.min(pledgedNonCash, totalCashSide);
  const effectiveUsableMargin = totalCashSide + usableNonCashCapped;
  const cashShortfallForFullUse = Math.max(0, Math.round((pledgedNonCash - totalCashSide)));
  const extraAnnualYieldEarned = Math.round(liquidEtfValue * (liquidEtfYieldPercent / 100));

  const toggleAssetPledge = (symbol: string) => {
    setPledgedState((prev) => {
      const current = assets.find((a) => a.symbol === symbol)?.isPledged ?? false;
      return { ...prev, [symbol]: !current };
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 ring-4 ring-indigo-100" />
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                Demat Collateral Pledge, Haircuts &amp; SEBI 50:50 Cash-Margin Optimizer
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Calculate NSE clearing-corporation collateral after VAR+ELM haircuts, check 50:50 Cash-vs-Equity compliance, and quantify passive T-Bill yield via Liquid ETFs.
            </p>
          </div>
          {onJumpToOptions && (
            <button
              type="button"
              onClick={onJumpToOptions}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition-colors shrink-0"
            >
              <span>Simulate Spreads in Options Lab</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard
            label="Effective Usable Margin"
            value={`₹${effectiveUsableMargin.toLocaleString('en-IN')}`}
            subtext={`Raw Pledged: ₹${totalCollateralMargin.toLocaleString('en-IN')}`}
            statusType="nominal"
          />
          <StatCard
            label="Cash-Eqv. Side (≥50% Req)"
            value={`₹${totalCashSide.toLocaleString('en-IN')}`}
            subtext={`Non-Cash Equity: ₹${pledgedNonCash.toLocaleString('en-IN')}`}
            statusType={cashShortfallForFullUse === 0 ? 'nominal' : 'elevated'}
          />
          <StatCard
            label="50:50 Cash Gap"
            value={cashShortfallForFullUse === 0 ? 'Compliant' : `₹${cashShortfallForFullUse.toLocaleString('en-IN')}`}
            subtext={
              cashShortfallForFullUse === 0
                ? 'Zero broker interest penalty'
                : 'Extra cash/LiquidBees needed'
            }
            statusType={cashShortfallForFullUse === 0 ? 'nominal' : 'demanding'}
          />
          <StatCard
            label="LiquidBees Passive Yield"
            value={`+₹${extraAnnualYieldEarned.toLocaleString('en-IN')}/yr`}
            subtext={`@${liquidEtfYieldPercent}% vs 0% idle cash`}
            statusType="nominal"
          />
        </div>
      </div>

      {/* Controls & Compliance Visual Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-5 p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 font-mono flex items-center gap-1.5 border-b border-slate-100 pb-3">
            <Lock className="w-4 h-4 text-indigo-600" />
            Cash &amp; Liquid ETF Margin Mix
          </h4>

          <div className="space-y-3 text-xs font-mono">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-slate-600">LiquidBees / Gilt ETF Collateral (₹)</span>
                <span className="font-bold text-slate-900">₹{liquidEtfValue.toLocaleString('en-IN')}</span>
              </div>
              <input
                type="range"
                min="0"
                max="1500000"
                step="25000"
                value={liquidEtfValue}
                onChange={(e) => setLiquidEtfValue(parseInt(e.target.value, 10))}
                className="w-full accent-indigo-600 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-slate-600">Uninvested Broker Cash Balance (₹)</span>
                <span className="font-bold text-slate-900">₹{cashMargin.toLocaleString('en-IN')}</span>
              </div>
              <input
                type="range"
                min="0"
                max="1000000"
                step="25000"
                value={cashMargin}
                onChange={(e) => setCashMargin(parseInt(e.target.value, 10))}
                className="w-full accent-emerald-600 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-slate-600">Assumed T-Bill / Liquid ETF Yield</span>
                <span className="font-bold text-emerald-700">{liquidEtfYieldPercent}% p.a.</span>
              </div>
              <input
                type="range"
                min="4.5"
                max="8.0"
                step="0.25"
                value={liquidEtfYieldPercent}
                onChange={(e) => setLiquidEtfYieldPercent(parseFloat(e.target.value))}
                className="w-full accent-emerald-600 cursor-pointer"
              />
            </div>
          </div>

          {/* 50:50 Balance Gauge */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs font-mono">
            <div className="flex justify-between font-bold text-slate-800">
              <span>50:50 Margin Split Ratio</span>
              <span>
                {totalCollateralMargin > 0
                  ? `${Math.round((totalCashSide / totalCollateralMargin) * 100)}% Cash : ${Math.round((pledgedNonCash / totalCollateralMargin) * 100)}% Equity`
                  : '0% : 0%'}
              </span>
            </div>
            <div className="w-full h-3 rounded-full bg-slate-200 overflow-hidden flex">
              <div
                className="bg-emerald-600 h-full transition-all"
                style={{
                  width: `${totalCollateralMargin > 0 ? Math.round((totalCashSide / totalCollateralMargin) * 100) : 50}%`,
                }}
              />
              <div
                className="bg-indigo-500 h-full transition-all"
                style={{
                  width: `${totalCollateralMargin > 0 ? Math.round((pledgedNonCash / totalCollateralMargin) * 100) : 50}%`,
                }}
              />
            </div>
            <p className="text-[11px] font-sans text-slate-600 leading-relaxed">
              {cashShortfallForFullUse > 0
                ? `Notice: Under SEBI 50:50 rules, ₹${cashShortfallForFullUse.toLocaleString('en-IN')} of equity collateral cannot offset overnight F&O cash margin without adding cash or LiquidBees (brokers typically charge ~0.05%/day interest on cash shortfall).`
                : 'Healthy 50:50 split! Your Cash + LiquidBees collateral fully covers non-cash equity margin with zero shortfall penalty.'}
            </p>
          </div>

          {cashShortfallForFullUse > 0 && (
            <button
              type="button"
              onClick={() => {
                setLiquidEtfValue((v) => v + cashShortfallForFullUse);
                onNotify?.(`Simulated adding ₹${cashShortfallForFullUse.toLocaleString('en-IN')} to LiquidBees to satisfy SEBI 50:50 cash requirement.`);
              }}
              className="w-full py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Auto-Fix Cash Gap via LiquidBees (+₹{cashShortfallForFullUse.toLocaleString('en-IN')})</span>
            </button>
          )}
        </div>

        {/* Right: Pledgeable Demat Basket Table */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 font-mono flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Select Demat Securities to Pledge (CDSL/NSDL E-Pledge)
            </h4>
            <span className="text-[10px] font-mono text-slate-500">DP Pledge Fee ~₹35/ISIN</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-600 font-mono text-[10px] uppercase border-b border-slate-200">
                  <th className="py-2.5 px-4 text-center">Pledge</th>
                  <th className="py-2.5 px-3">Security</th>
                  <th className="py-2.5 px-3">Bucket</th>
                  <th className="py-2.5 px-3 text-right">Market Value</th>
                  <th className="py-2.5 px-3 text-right">Haircut</th>
                  <th className="py-2.5 px-4 text-right">Collateral Margin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {assets.map((item) => (
                  <tr
                    key={item.symbol}
                    onClick={() => toggleAssetPledge(item.symbol)}
                    className={`cursor-pointer transition-colors ${
                      item.isPledged ? 'bg-indigo-50/40 hover:bg-indigo-50/80' : 'hover:bg-slate-50 opacity-70'
                    }`}
                  >
                    <td className="py-2.5 px-4 text-center">
                      <input
                        type="checkbox"
                        checked={item.isPledged}
                        onChange={() => {}}
                        className="w-4 h-4 accent-indigo-600 cursor-pointer"
                      />
                    </td>
                    <td className="py-2.5 px-3 font-sans">
                      <strong className="font-mono text-slate-900 block">{item.symbol}</strong>
                      <span className="text-[10px] text-slate-500 truncate max-w-[180px] block">
                        {item.companyName}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`px-1.5 py-0.5 text-[10px] font-bold rounded ${
                          item.assetClass === 'CASH_EQUIVALENT'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-indigo-100 text-indigo-800'
                        }`}
                      >
                        {item.assetClass === 'CASH_EQUIVALENT' ? 'Cash Eqv.' : 'Equity'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-700">
                      ₹{item.currentValue.toLocaleString('en-IN')}
                    </td>
                    <td className="py-2.5 px-3 text-right text-rose-700 font-semibold">
                      -{item.haircutPercent}%
                    </td>
                    <td className="py-2.5 px-4 text-right font-bold text-slate-900">
                      {item.isPledged ? `₹${item.collateralValue.toLocaleString('en-IN')}` : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-3.5 bg-amber-50/70 border-t border-amber-200 flex items-start gap-2 text-[11px] text-amber-900">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span>
              Leveraging pledged holdings amplifies both gains and drawdowns. Brokers mark-to-market daily and can auto-liquidate pledged shares if MTM losses breach collateral value.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
