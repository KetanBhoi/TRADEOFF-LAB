import React, { useMemo, useState } from 'react';
import { TradingHolding } from '../../types/trading';
import {
  BULK_INSIDER_DEALS,
  SHAREHOLDING_SNAPSHOTS,
} from '../../utils/ultimateModulesData';
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
import { AlertTriangle, ArrowRight, Eye, ShieldCheck } from 'lucide-react';

interface InsiderShareholdingTabProps {
  holdings: TradingHolding[];
  onTradeSymbol: (symbol: string) => void;
}

export const InsiderShareholdingTab: React.FC<InsiderShareholdingTabProps> = ({
  holdings,
  onTradeSymbol,
}) => {
  const [filterMode, setFilterMode] = useState<'ALL' | 'HELD_ONLY' | 'PLEDGE_WATCH'>('ALL');
  const [dealFilter, setDealFilter] = useState<'ALL' | 'ACQUISITION' | 'DISPOSAL'>('ALL');

  const heldSymbols = useMemo(
    () => new Set(holdings.map((h) => h.symbol)),
    [holdings]
  );

  const filteredShareholdings = useMemo(
    () =>
      SHAREHOLDING_SNAPSHOTS.filter((s) => {
        if (filterMode === 'HELD_ONLY') return heldSymbols.has(s.symbol);
        if (filterMode === 'PLEDGE_WATCH') return s.pledgedPercent > 0;
        return true;
      }),
    [filterMode, heldSymbols]
  );

  const filteredDeals = useMemo(
    () =>
      BULK_INSIDER_DEALS.filter((d) =>
        dealFilter === 'ALL' ? true : d.action === dealFilter
      ),
    [dealFilter]
  );

  const pledgeFlaggedHeld = SHAREHOLDING_SNAPSHOTS.filter(
    (s) => heldSymbols.has(s.symbol) && s.pledgedPercent >= 5
  );

  const chartData = filteredShareholdings.slice(0, 8).map((s) => ({
    symbol: s.symbol,
    Promoter: s.promoterPercent,
    FII: s.fiiPercent,
    DII: s.diiPercent,
    Public: s.publicPercent,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h3 className="text-lg font-bold text-slate-950 flex items-center gap-2">
            <Eye className="w-5 h-5 text-indigo-600" />
            <span>Promoter Shareholding, Pledge Risk &amp; SAST Insider Radar</span>
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Audit quarterly Promoter/FII/DII ownership shifts, flag promoter share pledging against your Demat holdings, and scan SEBI SAST &amp; exchange Bulk/Block deals.
          </p>
        </div>

        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg border border-slate-200 shrink-0">
          {[
            { id: 'ALL', label: 'All Tracked' },
            { id: 'HELD_ONLY', label: `Your Holdings (${heldSymbols.size})` },
            { id: 'PLEDGE_WATCH', label: 'Pledge Watch' },
          ].map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilterMode(f.id as any)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 ${
                filterMode === f.id
                  ? 'bg-white text-slate-950 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Cross-Check Alert if a Demat Holding has Elevated Promoter Pledge */}
      {pledgeFlaggedHeld.length > 0 && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-950">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong className="font-bold block">
                Holdings Governance Alert: Elevated Promoter Pledge Detected
              </strong>
              <span className="text-amber-800">
                {pledgeFlaggedHeld
                  .map(
                    (s) =>
                      `${s.symbol} (${s.pledgedPercent}% of promoter stake pledged vs ${s.prevPledgedPercent}% prior qtr)`
                  )
                  .join(' · ')}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onTradeSymbol(pledgeFlaggedHeld[0].symbol)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0"
          >
            <span>Review / Trim {pledgeFlaggedHeld[0].symbol}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Ownership Chart */}
      <div className="p-5 rounded-xl bg-white border border-slate-200">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-bold text-slate-900">
            Institutional vs. Promoter Ownership Split (%)
          </h4>
          <span className="text-xs text-slate-500">Latest Quarter Disclosures</span>
        </div>
        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="symbol" tick={{ fontSize: 11, fill: '#475569' }} />
              <YAxis tick={{ fontSize: 11, fill: '#475569' }} domain={[0, 100]} />
              <Tooltip
                formatter={(val) =>
                  `${(typeof val === 'number' ? val : Number(val ?? 0)).toFixed(1)}%`
                }
              />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="Promoter" stackId="a" fill="#0f172a" />
              <Bar dataKey="FII" stackId="a" fill="#4f46e5" />
              <Bar dataKey="DII" stackId="a" fill="#16a34a" />
              <Bar dataKey="Public" stackId="a" fill="#cbd5e1" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Shareholding Matrix Table */}
      <div className="rounded-xl bg-white border border-slate-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
          <h4 className="text-sm font-bold text-slate-900">Shareholding &amp; Promoter Pledge Matrix</h4>
          <span className="text-xs text-slate-500">{filteredShareholdings.length} companies</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
              <tr>
                <th className="px-4 py-2.5 font-semibold">Symbol</th>
                <th className="px-4 py-2.5 font-semibold text-right">Promoter %</th>
                <th className="px-4 py-2.5 font-semibold text-right">QoQ Chg</th>
                <th className="px-4 py-2.5 font-semibold text-right">Pledged %</th>
                <th className="px-4 py-2.5 font-semibold text-right">FII %</th>
                <th className="px-4 py-2.5 font-semibold text-right">DII %</th>
                <th className="px-4 py-2.5 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredShareholdings.map((s) => {
                const qoqDiff = Math.round((s.promoterPercent - s.prevPromoterPercent) * 100) / 100;
                const isHeld = heldSymbols.has(s.symbol);
                return (
                  <tr key={s.symbol} className="hover:bg-slate-50/80">
                    <td className="px-4 py-2.5">
                      <span className="font-bold text-slate-900">{s.symbol}</span>
                      <span className="text-[11px] text-slate-500 ml-2">
                        {s.companyName}
                        {isHeld ? ' · In Demat' : ''}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono tabular-nums font-semibold">
                      {s.promoterPercent.toFixed(1)}%
                    </td>
                    <td
                      className={`px-4 py-2.5 text-right font-mono tabular-nums ${
                        qoqDiff > 0 ? 'text-emerald-700' : qoqDiff < 0 ? 'text-amber-700' : 'text-slate-500'
                      }`}
                    >
                      {qoqDiff > 0 ? '+' : ''}
                      {qoqDiff.toFixed(1)}%
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono tabular-nums">
                      {s.pledgedPercent >= 5 ? (
                        <span className="text-rose-700 font-bold">{s.pledgedPercent.toFixed(1)}% Risk</span>
                      ) : s.pledgedPercent > 0 ? (
                        <span className="text-amber-700">{s.pledgedPercent.toFixed(1)}%</span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-emerald-700">
                          <ShieldCheck className="w-3.5 h-3.5" /> 0.0%
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono tabular-nums text-slate-700">
                      {s.fiiPercent.toFixed(1)}%
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono tabular-nums text-slate-700">
                      {s.diiPercent.toFixed(1)}%
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <button
                        type="button"
                        onClick={() => onTradeSymbol(s.symbol)}
                        className="px-2.5 py-1 text-[11px] font-semibold bg-slate-100 hover:bg-indigo-600 hover:text-white text-slate-800 rounded transition-colors whitespace-nowrap shrink-0"
                      >
                        Trade
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bulk / Block & SAST Feed */}
      <div className="rounded-xl bg-white border border-slate-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h4 className="text-sm font-bold text-slate-900">
              NSE Bulk / Block Deals &amp; SEBI SAST Disclosures
            </h4>
            <p className="text-[11px] text-slate-500">
              Track institutional block absorption versus promoter disposals or new collateral encumbrances.
            </p>
          </div>
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
            {(['ALL', 'ACQUISITION', 'DISPOSAL'] as const).map((act) => (
              <button
                key={act}
                type="button"
                onClick={() => setDealFilter(act)}
                className={`px-2.5 py-1 text-[11px] font-semibold rounded transition-colors ${
                  dealFilter === act ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
                }`}
              >
                {act === 'ALL' ? 'All Deals' : act === 'ACQUISITION' ? 'Acquisitions' : 'Disposals / Pledge'}
              </button>
            ))}
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {filteredDeals.map((d) => (
            <div
              key={d.id}
              className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/60"
            >
              <div className="space-y-1">
                <div className="flex items-center flex-wrap gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => onTradeSymbol(d.symbol)}
                    className="font-bold text-indigo-700 hover:underline"
                  >
                    {d.symbol}
                  </button>
                  <span className="text-slate-300">·</span>
                  <span className="font-semibold text-slate-900">{d.clientName}</span>
                  <span className="text-slate-300">·</span>
                  <span className="text-slate-500">{d.date}</span>
                  <span className="text-slate-300">·</span>
                  <span
                    className={`font-semibold ${
                      d.action === 'ACQUISITION' ? 'text-emerald-700' : 'text-rose-700'
                    }`}
                  >
                    {d.action === 'ACQUISITION' ? 'Buy' : 'Sell / Encumbrance'} ({d.category.replace('_', ' ')})
                  </span>
                </div>
                <p className="text-xs text-slate-600">{d.rationaleNote}</p>
              </div>

              <div className="text-left sm:text-right font-mono tabular-nums shrink-0">
                <div className="text-xs font-bold text-slate-950">₹{d.valueCr.toFixed(1)} Cr</div>
                <div className="text-[11px] text-slate-500">
                  {d.quantity.toLocaleString('en-IN')} sh @ ₹{d.avgPrice.toLocaleString('en-IN')}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
