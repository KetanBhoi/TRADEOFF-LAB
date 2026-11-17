import React, { useMemo, useState } from 'react';
import {
  GttOcoRule,
  LiveMarketQuote,
  TradingHolding,
} from '../../types/trading';
import { EQUITY_BASKET_TEMPLATES } from '../../utils/ultimateModulesData';
import {
  CheckCircle2,
  Layers,
  Pause,
  Play,
  Plus,
  ShieldCheck,
  Trash2,
} from 'lucide-react';

interface StockBasketGttTabProps {
  quotes: LiveMarketQuote[];
  holdings: TradingHolding[];
  gttRules: GttOcoRule[];
  onDeployBasketOrders: (
    legs: { symbol: string; quantity: number; price: number }[],
    basketName: string
  ) => void;
  onAddGttRule: (rule: GttOcoRule) => void;
  onToggleGttRule: (id: string) => void;
  onDeleteGttRule: (id: string) => void;
}

export const StockBasketGttTab: React.FC<StockBasketGttTabProps> = ({
  quotes,
  holdings,
  gttRules,
  onDeployBasketOrders,
  onAddGttRule,
  onToggleGttRule,
  onDeleteGttRule,
}) => {
  const [selectedBasketId, setSelectedBasketId] = useState<string>(
    EQUITY_BASKET_TEMPLATES[0].id
  );
  const [deployCapital, setDeployCapital] = useState<number>(50000);

  // GTT OCO Builder form state
  const defaultGttQuote = quotes[1] || quotes[0];
  const [gttSymbol, setGttSymbol] = useState<string>(defaultGttQuote?.symbol || 'WAAREE');
  const [gttQty, setGttQty] = useState<number>(15);
  const [gttTargetPct, setGttTargetPct] = useState<number>(8);
  const [gttStopPct, setGttStopPct] = useState<number>(4);

  const selectedBasket = useMemo(
    () =>
      EQUITY_BASKET_TEMPLATES.find((b) => b.id === selectedBasketId) ||
      EQUITY_BASKET_TEMPLATES[0],
    [selectedBasketId]
  );

  const basketLegs = useMemo(() => {
    return selectedBasket.constituents.map((c) => {
      const q = quotes.find((item) => item.symbol === c.symbol) || quotes[0];
      const allocBudget = (deployCapital * c.weightPercent) / 100;
      const qty = Math.max(1, Math.floor(allocBudget / Math.max(1, q.lastPrice)));
      const actualValue = Math.round(qty * q.lastPrice * 100) / 100;
      return {
        symbol: c.symbol,
        weightPercent: c.weightPercent,
        price: q.lastPrice,
        quantity: qty,
        actualValue,
      };
    });
  }, [selectedBasket, quotes, deployCapital]);

  const totalDeployedValue = basketLegs.reduce((s, l) => s + l.actualValue, 0);

  const gttQuote = useMemo(
    () => quotes.find((q) => q.symbol === gttSymbol) || quotes[0],
    [quotes, gttSymbol]
  );

  const handleCreateGtt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!gttQuote) return;
    const newRule: GttOcoRule = {
      id: `GTT_${Date.now()}`,
      symbol: gttQuote.symbol,
      quantity: Math.max(1, gttQty),
      referencePrice: gttQuote.lastPrice,
      triggerTargetPrice: Math.round(gttQuote.lastPrice * (1 + gttTargetPct / 100) * 100) / 100,
      triggerStopPrice: Math.round(gttQuote.lastPrice * (1 - gttStopPct / 100) * 100) / 100,
      isActive: true,
      createdAt: new Date().toLocaleTimeString(),
    };
    onAddGttRule(newRule);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-4 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold text-slate-950 flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-600" />
            <span>Thematic Stock Basket &amp; GTT OCO Automation Desk</span>
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Deploy custom-weighted equity baskets in one simulated batch order into your Terminal fill ledger, and arm Good-Till-Triggered (GTT) One-Cancels-Other target + stop-loss rules.
          </p>
        </div>
        <span className="text-xs font-mono text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 shrink-0">
          {holdings.length} Demat Holdings · {gttRules.filter((r) => r.isActive).length} Active GTT OCO
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Stock Basket Builder */}
        <div className="lg:col-span-7 p-5 rounded-xl bg-white border border-slate-200 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h4 className="text-sm font-bold text-slate-900">1. Multi-Stock Thematic Basket</h4>
            <div className="flex items-center flex-wrap gap-1 p-1 bg-slate-100 rounded-lg max-w-full">
              {EQUITY_BASKET_TEMPLATES.map((b) => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => setSelectedBasketId(b.id)}
                  className={`px-2.5 py-1 text-[11px] font-semibold rounded transition-colors whitespace-nowrap shrink-0 ${
                    selectedBasketId === b.id
                      ? 'bg-white text-slate-950 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {b.name}
                </button>
              ))}
            </div>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-1">
            <div className="flex items-center justify-between font-bold text-slate-900">
              <span>{selectedBasket.name}</span>
              <span className="font-mono text-emerald-700">
                Est. 3Y CAGR: {selectedBasket.cagr3YPercent}% · {selectedBasket.riskTag}
              </span>
            </div>
            <p className="text-slate-600">{selectedBasket.description}</p>
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1.5">
              <span>Target Basket Deployment Capital</span>
              <span className="font-mono tabular-nums text-indigo-700">
                ₹{deployCapital.toLocaleString('en-IN')}
              </span>
            </div>
            <input
              type="range"
              min={10000}
              max={500000}
              step={5000}
              value={deployCapital}
              onChange={(e) => setDeployCapital(Number(e.target.value))}
              className="w-full accent-indigo-600"
            />
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-lg">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                <tr>
                  <th className="px-3 py-2 font-semibold">Constituent</th>
                  <th className="px-3 py-2 font-semibold text-right">Weight</th>
                  <th className="px-3 py-2 font-semibold text-right">Live LTP</th>
                  <th className="px-3 py-2 font-semibold text-right">Calc Qty</th>
                  <th className="px-3 py-2 font-semibold text-right">Order Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {basketLegs.map((leg) => (
                  <tr key={leg.symbol}>
                    <td className="px-3 py-2 font-bold text-slate-900">{leg.symbol}</td>
                    <td className="px-3 py-2 text-right font-mono tabular-nums text-slate-600">
                      {leg.weightPercent}%
                    </td>
                    <td className="px-3 py-2 text-right font-mono tabular-nums text-slate-700">
                      ₹{leg.price.toLocaleString('en-IN')}
                    </td>
                    <td className="px-3 py-2 text-right font-mono tabular-nums font-bold text-indigo-700">
                      {leg.quantity}
                    </td>
                    <td className="px-3 py-2 text-right font-mono tabular-nums text-slate-950 font-semibold">
                      ₹{leg.actualValue.toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <div className="text-xs text-slate-600">
              Effective Capital Used:{' '}
              <strong className="font-mono text-slate-950">
                ₹{totalDeployedValue.toLocaleString('en-IN')}
              </strong>{' '}
              ({basketLegs.length} atomic CNC legs)
            </div>
            <button
              type="button"
              onClick={() =>
                onDeployBasketOrders(
                  basketLegs.map((l) => ({
                    symbol: l.symbol,
                    quantity: l.quantity,
                    price: l.price,
                  })),
                  selectedBasket.name
                )
              }
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors whitespace-nowrap shrink-0"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Execute Entire Basket ({basketLegs.length} Orders)</span>
            </button>
          </div>
        </div>

        {/* Right: GTT OCO Rule Builder */}
        <div className="lg:col-span-5 space-y-5">
          <form
            onSubmit={handleCreateGtt}
            className="p-5 rounded-xl bg-white border border-slate-200 space-y-4"
          >
            <h4 className="text-sm font-bold text-slate-900">
              2. Arm GTT (One-Cancels-Other) Trigger
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs items-end">
              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1 whitespace-nowrap">
                  Symbol
                </label>
                <select
                  value={gttSymbol}
                  onChange={(e) => setGttSymbol(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg font-bold bg-white"
                >
                  {quotes.map((q) => (
                    <option key={q.symbol} value={q.symbol}>
                      {q.symbol} (₹{q.lastPrice})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1 whitespace-nowrap">
                  Shares Qty
                </label>
                <input
                  type="number"
                  min={1}
                  max={5000}
                  value={gttQty}
                  onChange={(e) => setGttQty(Math.max(1, Number(e.target.value)))}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg font-mono tabular-nums"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-emerald-700 block mb-1 whitespace-nowrap">
                  Target Gain (+%)
                </label>
                <input
                  type="number"
                  min={1}
                  max={100}
                  step={0.5}
                  value={gttTargetPct}
                  onChange={(e) => setGttTargetPct(Math.max(0.5, Number(e.target.value)))}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg font-mono tabular-nums"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-rose-700 block mb-1 whitespace-nowrap">
                  Stop-Loss (-%)
                </label>
                <input
                  type="number"
                  min={0.5}
                  max={50}
                  step={0.5}
                  value={gttStopPct}
                  onChange={(e) => setGttStopPct(Math.max(0.5, Number(e.target.value)))}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg font-mono tabular-nums"
                />
              </div>
            </div>

            {gttQuote && (
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between text-[11px] font-mono tabular-nums">
                <span className="text-emerald-700 font-semibold">
                  Target ≥ ₹
                  {(gttQuote.lastPrice * (1 + gttTargetPct / 100)).toFixed(2)}
                </span>
                <span className="text-slate-400">·</span>
                <span className="text-rose-700 font-semibold">
                  SL ≤ ₹{(gttQuote.lastPrice * (1 - gttStopPct / 100)).toFixed(2)}
                </span>
              </div>
            )}

            <button
              type="submit"
              className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white rounded-lg transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Arm GTT OCO Rule</span>
            </button>
          </form>

          <div className="rounded-xl bg-white border border-slate-200 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-900">Active GTT OCO Watchers</h4>
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
            </div>

            {gttRules.length === 0 ? (
              <div className="p-5 text-center text-xs text-slate-500">
                No GTT OCO triggers armed yet. Add a target/SL pair above.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {gttRules.map((rule) => (
                  <div
                    key={rule.id}
                    className="p-3.5 flex items-center justify-between gap-2 text-xs"
                  >
                    <div>
                      <div className="font-bold text-slate-900">
                        {rule.symbol} · {rule.quantity} sh
                      </div>
                      <div className="text-[11px] font-mono tabular-nums text-slate-600 mt-0.5">
                        <span className="text-emerald-700">Tgt ₹{rule.triggerTargetPrice}</span>
                        {' / '}
                        <span className="text-rose-700">SL ₹{rule.triggerStopPrice}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => onToggleGttRule(rule.id)}
                        className={`p-1.5 rounded border text-xs ${
                          rule.isActive
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                            : 'bg-slate-100 border-slate-200 text-slate-500'
                        }`}
                        title={rule.isActive ? 'Pause GTT trigger' : 'Resume GTT trigger'}
                      >
                        {rule.isActive ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteGttRule(rule.id)}
                        className="p-1.5 rounded border border-slate-200 text-slate-500 hover:text-rose-700 hover:border-rose-200"
                        title="Delete GTT trigger"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
