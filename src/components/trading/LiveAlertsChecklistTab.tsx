import React, { useState } from 'react';
import {
  LiveMarketQuote,
  LivePriceAlertRule,
  MorningChecklistItem,
  AlertConditionType,
} from '../../types/trading';
import { INITIAL_MORNING_CHECKLIST } from '../../utils/moreModulesData';
import { StatCard } from '../common/StatCard';
import {
  BellRing,
  CheckCircle2,
  Circle,
  Plus,
  RotateCcw,
  Trash2,
  ExternalLink,
  ClipboardCheck,
  Sparkles,
} from 'lucide-react';

interface LiveAlertsChecklistTabProps {
  quotes: LiveMarketQuote[];
  alertRules: LivePriceAlertRule[];
  onAddAlert: (rule: LivePriceAlertRule) => void;
  onToggleAlert: (id: string) => void;
  onDeleteAlert: (id: string) => void;
  onResetAlertTrigger: (id: string) => void;
  onTradeSymbol?: (symbol: string) => void;
}

export const LiveAlertsChecklistTab: React.FC<LiveAlertsChecklistTabProps> = ({
  quotes,
  alertRules,
  onAddAlert,
  onToggleAlert,
  onDeleteAlert,
  onResetAlertTrigger,
  onTradeSymbol,
}) => {
  const [symbol, setSymbol] = useState(quotes[0]?.symbol || 'WAAREE');
  const [condition, setCondition] = useState<AlertConditionType>('ABOVE');
  const [targetPrice, setTargetPrice] = useState<number>(() => {
    const q = quotes[0];
    return q ? Math.round(q.lastPrice * 1.015 * 100) / 100 : 3020;
  });
  const [note, setNote] = useState('Key breakout / support level watch');

  const [checklist, setChecklist] = useState<MorningChecklistItem[]>(INITIAL_MORNING_CHECKLIST);
  const [newTaskTitle, setNewTaskTitle] = useState('');

  const activeAlertsCount = alertRules.filter((r) => r.isActive && !r.isTriggered).length;
  const triggeredCount = alertRules.filter((r) => r.isTriggered).length;
  const completedChecks = checklist.filter((c) => c.checked).length;
  const readinessScore = checklist.length > 0 ? Math.round((completedChecks / checklist.length) * 100) : 100;

  const handleSymbolSelect = (sym: string) => {
    setSymbol(sym);
    const match = quotes.find((q) => q.symbol === sym);
    if (match) {
      const mult = condition === 'ABOVE' ? 1.015 : 0.985;
      setTargetPrice(Math.round(match.lastPrice * mult * 100) / 100);
    }
  };

  const handleCreateRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!symbol || targetPrice <= 0) return;
    onAddAlert({
      id: `alert-${Date.now()}`,
      symbol,
      condition,
      targetPrice,
      note: note.trim() || `${symbol} ${condition} ₹${targetPrice}`,
      isActive: true,
      isTriggered: false,
      createdAt: new Date().toLocaleTimeString(),
    });
    setNote('');
  };

  const handleAddChecklistTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    setChecklist((prev) => [
      ...prev,
      {
        id: `chk-${Date.now()}`,
        category: 'EXECUTION_RULES',
        title: newTaskTitle.trim(),
        detail: 'Custom personal trading discipline rule.',
        checked: false,
      },
    ]);
    setNewTaskTitle('');
  };

  return (
    <div className="space-y-6">
      {/* Summary Header */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-emerald-100" />
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                Real-Time NSE Price Alerts &amp; Pre-Market Readiness Routine
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Alert conditions actively monitor the live 2-second NSE quote feed and trigger instant desk notifications.
            </p>
          </div>
          <span className="px-2.5 py-1 text-[11px] font-mono font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg shrink-0">
            Engine Watching {activeAlertsCount} Rules
          </span>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard
            label="Armed Alert Rules"
            value={`${activeAlertsCount}`}
            subtext="Scanning 2s live quote stream"
            statusType="neutral"
          />
          <StatCard
            label="Triggered Today"
            value={`${triggeredCount}`}
            subtext={triggeredCount > 0 ? 'Price targets crossed' : 'Waiting for triggers'}
            statusType={triggeredCount > 0 ? 'nominal' : 'neutral'}
          />
          <StatCard
            label="Execution Readiness"
            value={`${readinessScore}%`}
            subtext={`${completedChecks}/${checklist.length} morning checks passed`}
            statusType={readinessScore >= 80 ? 'nominal' : readinessScore >= 50 ? 'elevated' : 'demanding'}
          />
          <StatCard
            label="Tracked NSE Symbols"
            value={`${quotes.length}`}
            subtext="Click any triggered rule to trade"
            statusType="neutral"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Live Price Alert Engine */}
        <div className="lg:col-span-7 p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 font-mono flex items-center gap-1.5">
              <BellRing className="w-4 h-4 text-indigo-600" />
              Create Real-Time Price Trigger
            </h4>
            <span className="text-[11px] font-mono text-slate-500">
              Live LTP: ₹{(quotes.find((q) => q.symbol === symbol)?.lastPrice ?? 0).toFixed(2)}
            </span>
          </div>

          <form onSubmit={handleCreateRule} className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 text-xs font-mono">
            <select
              value={symbol}
              onChange={(e) => handleSymbolSelect(e.target.value)}
              className="sm:col-span-3 px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-lg font-bold text-slate-900"
            >
              {quotes.map((q) => (
                <option key={q.symbol} value={q.symbol}>
                  {q.symbol} (₹{q.lastPrice.toFixed(0)})
                </option>
              ))}
            </select>

            <select
              value={condition}
              onChange={(e) => setCondition(e.target.value as AlertConditionType)}
              className="sm:col-span-2 px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-lg font-bold text-slate-900"
            >
              <option value="ABOVE">Crosses ≥</option>
              <option value="BELOW">Drops ≤</option>
            </select>

            <input
              type="number"
              step="0.05"
              value={targetPrice}
              onChange={(e) => setTargetPrice(parseFloat(e.target.value) || 0)}
              className="sm:col-span-2 px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-lg font-bold text-slate-900"
            />

            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Alert memo..."
              className="sm:col-span-3 px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-lg font-sans"
            />

            <button
              type="submit"
              className="sm:col-span-2 inline-flex items-center justify-center gap-1 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Arm</span>
            </button>
          </form>

          {/* Active & Triggered Alerts List */}
          <div className="space-y-2.5">
            {alertRules.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-xl">
                No alert rules configured. Arm a price threshold above.
              </div>
            ) : (
              alertRules.map((rule) => {
                const liveQuote = quotes.find((q) => q.symbol === rule.symbol);
                const livePx = liveQuote?.lastPrice ?? rule.targetPrice;
                const distPct = Math.round(((rule.targetPrice - livePx) / livePx) * 1000) / 10;

                return (
                  <div
                    key={rule.id}
                    className={`p-3.5 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs ${
                      rule.isTriggered
                        ? 'bg-emerald-50/90 border-emerald-300'
                        : rule.isActive
                        ? 'bg-slate-50 border-slate-200'
                        : 'bg-slate-50/40 border-slate-200 opacity-65'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap font-mono">
                        <span className="font-bold text-slate-900">{rule.symbol}</span>
                        <span
                          className={`px-1.5 py-0.5 text-[10px] font-bold rounded ${
                            rule.condition === 'ABOVE'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {rule.condition === 'ABOVE' ? '≥' : '≤'} ₹{rule.targetPrice.toLocaleString('en-IN')}
                        </span>
                        <span className="text-[11px] text-slate-500">
                          LTP ₹{livePx.toFixed(2)} ({distPct >= 0 ? `+${distPct}%` : `${distPct}%`})
                        </span>
                        {rule.isTriggered && (
                          <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-600 text-white rounded">
                            TRIGGERED @ {rule.triggeredAt}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-600">{rule.note}</p>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {onTradeSymbol && (
                        <button
                          type="button"
                          onClick={() => onTradeSymbol(rule.symbol)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold bg-white hover:bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-lg"
                        >
                          <span>Trade</span>
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      )}
                      {rule.isTriggered ? (
                        <button
                          type="button"
                          onClick={() => onResetAlertTrigger(rule.id)}
                          className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-semibold bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg"
                          title="Re-arm alert"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>Re-Arm</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => onToggleAlert(rule.id)}
                          className={`px-2 py-1 text-[11px] font-semibold rounded-lg border ${
                            rule.isActive
                              ? 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                              : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                          }`}
                        >
                          {rule.isActive ? 'Pause' : 'Resume'}
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => onDeleteAlert(rule.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg"
                        title="Remove alert"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right: Morning Pre-Market Discipline Checklist */}
        <div className="lg:col-span-5 p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 font-mono flex items-center gap-1.5">
              <ClipboardCheck className="w-4 h-4 text-emerald-600" />
              Pre-Market Readiness Routine
            </h4>
            <button
              type="button"
              onClick={() => setChecklist((prev) => prev.map((c) => ({ ...c, checked: false })))}
              className="text-[11px] font-semibold text-slate-500 hover:text-slate-900"
            >
              Reset Day
            </button>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs font-mono font-bold text-slate-700">
              <span>Session Discipline Score</span>
              <span>{readinessScore}% Ready</span>
            </div>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  readinessScore >= 80 ? 'bg-emerald-600' : readinessScore >= 50 ? 'bg-amber-500' : 'bg-rose-500'
                }`}
                style={{ width: `${readinessScore}%` }}
              />
            </div>
          </div>

          <div className="space-y-2">
            {checklist.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() =>
                  setChecklist((prev) =>
                    prev.map((c) => (c.id === item.id ? { ...c, checked: !c.checked } : c))
                  )
                }
                className={`w-full text-left p-3 rounded-xl border transition-colors flex items-start gap-2.5 text-xs ${
                  item.checked
                    ? 'bg-emerald-50/60 border-emerald-200 text-slate-700'
                    : 'bg-slate-50 border-slate-200 hover:bg-slate-100/70'
                }`}
              >
                {item.checked ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <Circle className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                )}
                <div>
                  <div className={`font-bold ${item.checked ? 'line-through text-slate-500' : 'text-slate-900'}`}>
                    {item.title}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{item.detail}</p>
                </div>
              </button>
            ))}
          </div>

          <form onSubmit={handleAddChecklistTask} className="flex gap-2 text-xs">
            <input
              type="text"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              placeholder="Add personal pre-trade rule..."
              className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
            />
            <button
              type="submit"
              className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg transition-colors inline-flex items-center gap-1"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
