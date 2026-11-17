import React, { useState } from 'react';
import {
  MarketNewsItem,
  CorporateResultItem,
  RbiEventItem,
  TradingHolding,
} from '../../types/trading';
import {
  INITIAL_MARKET_NEWS,
  INITIAL_EARNINGS_CALENDAR,
  INITIAL_RBI_EVENTS,
} from '../../utils/portfolioHealthData';
import {
  Newspaper,
  Calendar,
  Building,
  FileText,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  ExternalLink,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Landmark,
  X,
  FileCheck,
} from 'lucide-react';

interface MarketNewsTabProps {
  holdings: TradingHolding[];
  onTradeSymbol?: (symbol: string) => void;
}

export const MarketNewsTab: React.FC<MarketNewsTabProps> = ({ holdings, onTradeSymbol }) => {
  const [activeCategory, setActiveCategory] = useState<'ALL' | 'FILING' | 'EARNINGS' | 'RBI_POLICY' | 'DIVIDEND'>('ALL');
  const [selectedNewsDoc, setSelectedNewsDoc] = useState<MarketNewsItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const holdingSymbols = new Set(holdings.map((h) => h.symbol));

  const filteredNews = INITIAL_MARKET_NEWS.filter((item) => {
    const matchesCategory = activeCategory === 'ALL' || item.category === activeCategory;
    const matchesSearch =
      searchQuery === '' ||
      item.headline.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.affectedSymbols.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase())) ||
      item.filingSummary.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 ring-4 ring-blue-100" />
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                Exchange Filings, Earnings Calendar & RBI Digest
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Live corporate disclosures filed under SEBI (LODR) regulations tagged directly to your holdings.
            </p>
          </div>

          {/* Search bar */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search filings or symbols..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {[
            { id: 'ALL', label: 'All Announcements' },
            { id: 'FILING', label: 'NSE/BSE Material Filings' },
            { id: 'EARNINGS', label: 'Quarterly Results' },
            { id: 'RBI_POLICY', label: 'RBI Monetary Policy' },
            { id: 'DIVIDEND', label: 'Dividends & Actions' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id as any)}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all font-semibold ${
                activeCategory === cat.id
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid: News Digest + Earnings Calendar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 spans): Feed of Exchange Filings & News */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between px-1">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Newspaper className="w-3.5 h-3.5 text-blue-600" />
              <span>Verified Disclosures Feed ({filteredNews.length})</span>
            </h4>
            <span className="text-[11px] text-slate-500 font-mono">SEBI LODR Reg 30 Compliant</span>
          </div>

          <div className="space-y-3">
            {filteredNews.map((news) => {
              const affectsPortfolio = news.affectedSymbols.some((s) => holdingSymbols.has(s));
              return (
                <div
                  key={news.id}
                  className={`p-4 rounded-xl bg-white border transition-all space-y-2.5 shadow-2xs ${
                    affectsPortfolio
                      ? 'border-blue-300 ring-1 ring-blue-100'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-slate-100 text-slate-700 rounded border border-slate-200">
                          {news.source}
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {news.timestamp}
                        </span>
                        {affectsPortfolio && (
                          <span className="px-2 py-0.5 text-[10px] font-bold bg-blue-50 text-blue-700 rounded-full border border-blue-200 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
                            In Your Portfolio
                          </span>
                        )}
                      </div>
                      <h5 className="text-sm font-bold text-slate-900 leading-snug">
                        {news.headline}
                      </h5>
                    </div>

                    <span className={`px-2 py-0.5 text-[10px] font-mono font-bold rounded uppercase shrink-0 ${
                      news.sentiment === 'BULLISH'
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : news.sentiment === 'BEARISH'
                        ? 'bg-rose-50 text-rose-800 border border-rose-200'
                        : 'bg-slate-100 text-slate-700 border border-slate-200'
                    }`}>
                      {news.sentiment}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed bg-slate-50/80 p-2.5 rounded-lg border border-slate-100">
                    {news.filingSummary}
                  </p>

                  <div className="flex items-center justify-between pt-1 text-xs">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[11px] text-slate-500">Impacted Symbols:</span>
                      {news.affectedSymbols.map((sym) =>
                        onTradeSymbol ? (
                          <button
                            key={sym}
                            type="button"
                            onClick={() => onTradeSymbol(sym)}
                            title={`Open ${sym} in Live Order Desk`}
                            className="px-1.5 py-0.5 font-mono font-bold text-[10px] bg-slate-100 hover:bg-indigo-600 text-slate-800 hover:text-white rounded border border-slate-200 hover:border-indigo-600 transition-colors inline-flex items-center gap-1"
                          >
                            <span>{sym}</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </button>
                        ) : (
                          <span
                            key={sym}
                            className="px-1.5 py-0.5 font-mono font-bold text-[10px] bg-slate-100 text-slate-800 rounded border border-slate-200"
                          >
                            {sym}
                          </span>
                        )
                      )}
                    </div>

                    <button
                      onClick={() => setSelectedNewsDoc(news)}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 hover:text-blue-900 transition-colors"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Inspect Filing Summary</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column (1 span): Earnings Calendar & RBI MPC Schedule */}
        <div className="space-y-6">
          {/* Earnings Calendar Card */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-purple-600" />
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Earnings Calendar (Q2/Q3 FY25)
                </h4>
              </div>
              <span className="text-[10px] font-mono text-slate-500">Consensus vs Actual</span>
            </div>

            <div className="space-y-2.5">
              {INITIAL_EARNINGS_CALENDAR.map((earn) => (
                <div
                  key={earn.id}
                  className="p-3 rounded-xl border border-slate-200 bg-slate-50/60 space-y-1.5 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-900">{earn.symbol}</span>
                      <span className="text-[10px] text-slate-500 ml-1.5">({earn.quarter})</span>
                    </div>
                    <span className="font-mono text-[11px] text-slate-600">{earn.reportDate}</span>
                  </div>

                  {earn.isReported ? (
                    <div className="pt-1.5 border-t border-slate-200/80 font-mono text-[11px] space-y-1">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Revenue:</span>
                        <span className="font-bold text-slate-900">
                          ₹{earn.actualRevenueCr?.toLocaleString()} Cr{' '}
                          <span className={earn.revenueSurprisePercent && earn.revenueSurprisePercent >= 0 ? 'text-emerald-700' : 'text-rose-700'}>
                            ({earn.revenueSurprisePercent && earn.revenueSurprisePercent >= 0 ? '+' : ''}{earn.revenueSurprisePercent}%)
                          </span>
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">EPS:</span>
                        <span className="font-bold text-slate-900">
                          ₹{earn.actualEps}{' '}
                          <span className={earn.epsSurprisePercent && earn.epsSurprisePercent >= 0 ? 'text-emerald-700' : 'text-rose-700'}>
                            ({earn.epsSurprisePercent && earn.epsSurprisePercent >= 0 ? '+' : ''}{earn.epsSurprisePercent}%)
                          </span>
                        </span>
                      </div>
                      <div className="flex justify-between items-center pt-1">
                        <span className="text-slate-500">Guidance Verdict:</span>
                        <span className="px-1.5 py-0.2 text-[9px] font-bold bg-emerald-100 text-emerald-800 rounded">
                          {earn.guidanceVerdict}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="pt-1 border-t border-slate-200 font-mono text-[11px] flex items-center justify-between text-slate-500">
                      <span>Consensus Est: ₹{earn.consensusRevenueCr.toLocaleString()} Cr</span>
                      <span className="text-amber-700 font-bold">Upcoming</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* RBI MPC Policy Tracker Card */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">
            <div className="flex items-center gap-2">
              <Landmark className="w-4 h-4 text-emerald-600" />
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                RBI Monetary Policy Schedule
              </h4>
            </div>

            <div className="space-y-2.5">
              {INITIAL_RBI_EVENTS.map((event) => (
                <div key={event.id} className="p-3 rounded-xl border border-slate-200 bg-emerald-50/30 space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 leading-tight">{event.title}</span>
                    <span className="font-mono text-[10px] text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded shrink-0">
                      {event.date}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    <strong>Consensus:</strong> {event.expectedConsensus}
                  </p>
                  <p className="text-[10px] text-slate-500 italic">
                    {event.impactAssessment}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Modal: Detailed Filing Document Inspection */}
      {selectedNewsDoc && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden space-y-0 animate-in fade-in zoom-in-95">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-blue-600" />
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Exchange Filing Document Record
                </h4>
              </div>
              <button
                onClick={() => setSelectedNewsDoc(null)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="space-y-1">
                <span className="text-[10px] font-mono font-bold uppercase text-slate-400 block">
                  Document ID: {selectedNewsDoc.filingDocId}
                </span>
                <h3 className="text-sm font-bold text-slate-900 leading-snug">
                  {selectedNewsDoc.headline}
                </h3>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1 font-mono text-[11px]">
                <div className="flex justify-between">
                  <span className="text-slate-500">Filing Category:</span>
                  <span className="font-bold text-slate-900">{selectedNewsDoc.filingType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Source:</span>
                  <span className="font-bold text-slate-900">{selectedNewsDoc.source}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Date Filed:</span>
                  <span className="font-bold text-slate-900">{selectedNewsDoc.date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Sentiment:</span>
                  <span className="font-bold text-emerald-700">{selectedNewsDoc.sentiment}</span>
                </div>
              </div>

              <div>
                <h5 className="font-bold text-slate-900 mb-1">Material Executive Summary:</h5>
                <p className="text-slate-600 leading-relaxed bg-blue-50/50 p-3 rounded-lg border border-blue-100">
                  {selectedNewsDoc.filingSummary}
                </p>
              </div>

              <div className="p-3 rounded-lg bg-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
                <span>Verified with Exchange Regulatory Archive</span>
                <span className="font-mono text-slate-700 font-bold">NSE / BSE Integrated</span>
              </div>
            </div>

            <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-end">
              <button
                onClick={() => setSelectedNewsDoc(null)}
                className="py-1.5 px-4 rounded-lg bg-slate-900 text-white font-semibold text-xs hover:bg-slate-800 transition-colors"
              >
                Close Document
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
