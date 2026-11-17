import React, { useState } from 'react';
import {
  TradeJournalEntry,
  BehavioralEmotionTag,
  OrderSide,
} from '../../types/trading';
import {
  INITIAL_TRADE_JOURNAL,
  computeJournalAnalytics,
  formatEmotionTag,
  exportJournalToTaxCsv,
} from '../../utils/portfolioHealthData';
import { StatCard } from '../common/StatCard';
import {
  BookOpen,
  Plus,
  Download,
  Brain,
  TrendingUp,
  TrendingDown,
  Tag,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  X,
  FileSpreadsheet,
} from 'lucide-react';

interface TradeJournalTabProps {
  onExportSuccess?: (message: string) => void;
}

export const TradeJournalTab: React.FC<TradeJournalTabProps> = ({
  onExportSuccess,
}) => {
  const [entries, setEntries] = useState<TradeJournalEntry[]>(INITIAL_TRADE_JOURNAL);
  const [isNewEntryOpen, setIsNewEntryOpen] = useState(false);
  const [filterTag, setFilterTag] = useState<string>('ALL');

  // Form state
  const [symbol, setSymbol] = useState('SWIGGY');
  const [side, setSide] = useState<OrderSide>('BUY');
  const [quantity, setQuantity] = useState(50);
  const [entryPrice, setEntryPrice] = useState(410);
  const [exitPrice, setExitPrice] = useState(455);
  const [holdingDays, setHoldingDays] = useState(3);
  const [setupReason, setSetupReason] = useState('Breakout above volume POC');
  const [expectedTarget, setExpectedTarget] = useState(460);
  const [stopLossUsed, setStopLossUsed] = useState(395);
  const [selectedTags, setSelectedTags] = useState<BehavioralEmotionTag[]>(['DISCIPLINED_SETUP']);
  const [lessonsLearned, setLessonsLearned] = useState('Execution aligned with risk rules.');

  const analytics = computeJournalAnalytics(entries);

  const handleExportCsv = () => {
    const filename = `Trade_Journal_Tax_Schedule_${new Date().toISOString().split('T')[0]}.csv`;
    const csvContent = exportJournalToTaxCsv(entries);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    onExportSuccess?.(`Exported CA Tax Journal CSV (${entries.length} records) successfully.`);
  };

  const handleCreateEntry = (e: React.FormEvent) => {
    e.preventDefault();
    const grossPnl = Math.round((exitPrice - entryPrice) * quantity);
    const charges = Math.round(20 + grossPnl * 0.0015 + (grossPnl > 0 ? grossPnl * 0.001 : 0));
    const netPnl = grossPnl - charges;
    const returnPercent = Math.round(((exitPrice - entryPrice) / entryPrice) * 1000) / 10;

    const newEntry: TradeJournalEntry = {
      id: `tj-${Date.now().toString().slice(-4)}`,
      tradeDate: new Date().toISOString().split('T')[0],
      symbol: symbol.toUpperCase(),
      side,
      quantity,
      entryPrice,
      exitPrice,
      holdingPeriodDays: holdingDays,
      grossPnl,
      charges,
      netPnl,
      returnPercent,
      setupReason,
      expectedTarget,
      stopLossUsed,
      emotionalTags: selectedTags,
      outcomeVerdict: selectedTags.includes('DISCIPLINED_SETUP') ? 'EXECUTED_AS_PLANNED' : 'DISCIPLINE_LAPSE',
      lessonsLearned,
    };

    setEntries((prev) => [newEntry, ...prev]);
    setIsNewEntryOpen(false);
  };

  const toggleTag = (tag: BehavioralEmotionTag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const allEmotionTags: BehavioralEmotionTag[] = [
    'DISCIPLINED_SETUP',
    'CHASED_PRICE_FOMO',
    'PANIC_EXIT',
    'REVENGE_TRADE',
    'OVER_LEVERAGED',
    'EARLY_PROFIT_TAKE',
    'IGNORED_STOP_LOSS',
  ];

  const filteredEntries = filterTag === 'ALL'
    ? entries
    : entries.filter((e) => e.emotionalTags.includes(filterTag as any));

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-500 ring-4 ring-purple-100" />
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                Psychological Trade Journal & Behavioral Analytics
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Log trade thesis, emotions, and lessons. Quantify the exact financial impact of FOMO and revenge trading.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCsv}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors shadow-2xs"
              title="Download formatted CSV for Indian Chartered Accountant / Tax Return"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span>Export for CA / Tax Filing</span>
            </button>

            <button
              onClick={() => setIsNewEntryOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5 text-white" />
              <span>Log New Trade</span>
            </button>
          </div>
        </div>

        {/* Analytics Highlights */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard
            label="Total Logged Trades"
            value={`${analytics.totalTrades}`}
            subtext={`${analytics.winningCount} Wins / ${analytics.losingCount} Losses`}
            statusType="neutral"
          />
          <StatCard
            label="Overall Win Rate"
            value={`${analytics.winRate}%`}
            subtext="Trade execution consistency"
            statusType={analytics.winRate >= 50 ? 'nominal' : 'demanding'}
          />
          <StatCard
            label="Net Journaled P&L"
            value={`${analytics.totalNetPnl >= 0 ? '+' : ''}₹${analytics.totalNetPnl.toLocaleString()}`}
            subtext="Post brokerage & Indian taxes"
            statusType={analytics.totalNetPnl >= 0 ? 'nominal' : 'demanding'}
          />
          <StatCard
            label="Primary Emotional Drag"
            value="FOMO / Chase"
            subtext="Costliest behavioral error"
            statusType="demanding"
          />
        </div>
      </div>

      {/* Behavioral Psychology Breakdown Card */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="w-4 h-4 text-purple-600" />
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Behavioral Tag P&L Impact Matrix
            </h4>
          </div>
          <span className="text-[11px] text-slate-500 font-mono">Disciplined vs Emotional Returns</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {analytics.emotionStats.map((stat, idx) => (
            <div
              key={idx}
              className={`p-3 rounded-xl border text-xs space-y-1.5 transition-all ${
                stat.isFavorable
                  ? 'bg-emerald-50/50 border-emerald-200'
                  : 'bg-rose-50/50 border-rose-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900">{stat.label}</span>
                <span className="font-mono text-[10px] text-slate-500">{stat.count} Trades</span>
              </div>
              <div className="flex items-center justify-between font-mono">
                <span className="text-[11px] text-slate-600">Win Rate: {stat.winRate}%</span>
                <span className={`font-bold ${stat.isFavorable ? 'text-emerald-700' : 'text-rose-700'}`}>
                  {stat.netPnl >= 0 ? '+' : ''}₹{stat.netPnl.toLocaleString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Trade Entries List with Emotional Tag Filter */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-slate-700" />
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Trade Log History ({filteredEntries.length})
            </h4>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500 font-medium">Filter by Tag:</span>
            <select
              value={filterTag}
              onChange={(e) => setFilterTag(e.target.value)}
              className="p-1.5 rounded-lg border border-slate-200 bg-white font-medium text-slate-800 text-xs"
            >
              <option value="ALL">All Behavioral Tags</option>
              {allEmotionTags.map((t) => (
                <option key={t} value={t}>{formatEmotionTag(t)}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-3">
          {filteredEntries.map((entry) => {
            const isProfitable = entry.netPnl >= 0;
            return (
              <div
                key={entry.id}
                className="p-4 rounded-xl border border-slate-200 hover:border-slate-300 transition-all bg-white space-y-2.5 shadow-2xs"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-base text-slate-900">{entry.symbol}</span>
                      <span className={`px-2 py-0.5 text-[10px] font-mono font-bold rounded ${
                        entry.side === 'BUY'
                          ? 'bg-blue-50 text-blue-800 border border-blue-200'
                          : 'bg-orange-50 text-orange-800 border border-orange-200'
                      }`}>
                        {entry.side} {entry.quantity} Shs
                      </span>
                      <span className="text-slate-400 font-mono text-[11px]">{entry.tradeDate}</span>
                      <span className="text-slate-400 font-mono text-[11px]">({entry.holdingPeriodDays}d hold)</span>
                    </div>
                    <p className="text-xs text-slate-600 font-medium">
                      Setup Thesis: {entry.setupReason}
                    </p>
                  </div>

                  <div className="text-right font-mono shrink-0">
                    <span className={`text-sm font-bold block ${isProfitable ? 'text-emerald-700' : 'text-rose-700'}`}>
                      {isProfitable ? '+' : ''}₹{entry.netPnl.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-slate-400 block">
                      ({isProfitable ? '+' : ''}{entry.returnPercent}% net)
                    </span>
                  </div>
                </div>

                {/* Numbers Row */}
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-[11px]">
                  <div>
                    <span className="text-slate-500 block">Entry Price:</span>
                    <span className="font-bold text-slate-900">₹{entry.entryPrice}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Exit Price:</span>
                    <span className="font-bold text-slate-900">₹{entry.exitPrice}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Planned Target:</span>
                    <span className="font-bold text-slate-700">₹{entry.expectedTarget}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Stop-Loss Used:</span>
                    <span className="font-bold text-slate-700">₹{entry.stopLossUsed}</span>
                  </div>
                </div>

                {/* Behavioral Tags and Lessons Learned */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 text-xs">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {entry.emotionalTags.map((tag) => (
                      <span
                        key={tag}
                        className={`px-2 py-0.5 text-[10px] font-semibold rounded-full border ${
                          tag === 'DISCIPLINED_SETUP'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : 'bg-rose-50 text-rose-800 border-rose-200'
                        }`}
                      >
                        {formatEmotionTag(tag)}
                      </span>
                    ))}
                  </div>

                  <div className="text-[11px] text-slate-600 italic bg-amber-50/60 px-2 py-1 rounded border border-amber-100">
                    <strong>Lesson:</strong> {entry.lessonsLearned}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal: Log New Trade Journal Entry */}
      {isNewEntryOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateEntry}
            className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden space-y-4 p-5 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h4 className="text-sm font-bold text-slate-900">Log Trade in Psychology Journal</h4>
              <button
                type="button"
                onClick={() => setIsNewEntryOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Symbol</label>
                  <input
                    type="text"
                    value={symbol}
                    onChange={(e) => setSymbol(e.target.value)}
                    className="w-full p-2 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white font-mono uppercase"
                    required
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Side</label>
                  <select
                    value={side}
                    onChange={(e) => setSide(e.target.value as OrderSide)}
                    className="w-full p-2 rounded-lg border border-slate-200 bg-white"
                  >
                    <option value="BUY">BUY</option>
                    <option value="SELL">SELL</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Quantity</label>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="w-full p-2 rounded-lg border border-slate-200 font-mono"
                    min="1"
                    required
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Entry Price (₹)</label>
                  <input
                    type="number"
                    value={entryPrice}
                    onChange={(e) => setEntryPrice(Number(e.target.value))}
                    className="w-full p-2 rounded-lg border border-slate-200 font-mono"
                    step="0.05"
                    required
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Exit Price (₹)</label>
                  <input
                    type="number"
                    value={exitPrice}
                    onChange={(e) => setExitPrice(Number(e.target.value))}
                    className="w-full p-2 rounded-lg border border-slate-200 font-mono"
                    step="0.05"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Holding Days</label>
                  <input
                    type="number"
                    value={holdingDays}
                    onChange={(e) => setHoldingDays(Number(e.target.value))}
                    className="w-full p-2 rounded-lg border border-slate-200 font-mono"
                    min="0"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Target Price (₹)</label>
                  <input
                    type="number"
                    value={expectedTarget}
                    onChange={(e) => setExpectedTarget(Number(e.target.value))}
                    className="w-full p-2 rounded-lg border border-slate-200 font-mono"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Stop-Loss (₹)</label>
                  <input
                    type="number"
                    value={stopLossUsed}
                    onChange={(e) => setStopLossUsed(Number(e.target.value))}
                    className="w-full p-2 rounded-lg border border-slate-200 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Setup Reason / Thesis</label>
                <input
                  type="text"
                  placeholder="e.g. 50 EMA breakout with 2x volume expansion"
                  value={setupReason}
                  onChange={(e) => setSetupReason(e.target.value)}
                  className="w-full p-2 rounded-lg border border-slate-200"
                  required
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Behavioral & Psychological Tags (Select all that applied):
                </label>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {allEmotionTags.map((tag) => {
                    const isSelected = selectedTags.includes(tag);
                    return (
                      <button
                        type="button"
                        key={tag}
                        onClick={() => toggleTag(tag)}
                        className={`px-2.5 py-1 text-[11px] rounded-lg border font-semibold transition-all ${
                          isSelected
                            ? tag === 'DISCIPLINED_SETUP'
                              ? 'bg-emerald-600 text-white border-emerald-600'
                              : 'bg-rose-600 text-white border-rose-600'
                            : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                        }`}
                      >
                        {formatEmotionTag(tag)}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Lessons Learned / Action Item</label>
                <textarea
                  rows={2}
                  placeholder="What worked? What rule did you enforce or violate?"
                  value={lessonsLearned}
                  onChange={(e) => setLessonsLearned(e.target.value)}
                  className="w-full p-2 rounded-lg border border-slate-200"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsNewEntryOpen(false)}
                className="py-1.5 px-3 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="py-1.5 px-4 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg"
              >
                Save to Journal
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
