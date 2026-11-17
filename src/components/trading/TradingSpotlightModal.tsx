import React, { useState, useEffect, useRef, useMemo } from 'react';
import { LiveMarketQuote } from '../../types/trading';
import { Search, Star, ArrowRight, TrendingUp, TrendingDown, X, Layers, CornerDownLeft } from 'lucide-react';

export interface SpotlightModuleItem {
  id: string;
  label: string;
  shortLabel: string;
  badge: string;
  categoryLabel: string;
  keywords: string;
}

interface TradingSpotlightModalProps {
  isOpen: boolean;
  onClose: () => void;
  modules: SpotlightModuleItem[];
  quotes: LiveMarketQuote[];
  pinnedIds: string[];
  activeTabId: string;
  onSelectModule: (id: string) => void;
  onSelectStock: (symbol: string) => void;
  onTogglePin: (id: string) => void;
}

type SpotlightEntry =
  | { kind: 'module'; module: SpotlightModuleItem }
  | { kind: 'stock'; quote: LiveMarketQuote };

export const TradingSpotlightModal: React.FC<TradingSpotlightModalProps> = ({
  isOpen,
  onClose,
  modules,
  quotes,
  pinnedIds,
  activeTabId,
  onSelectModule,
  onSelectStock,
  onTogglePin,
}) => {
  const [query, setQuery] = useState('');
  const [cursor, setCursor] = useState(0);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setCursor(0);
      window.setTimeout(() => inputRef.current?.focus(), 30);
    }
  }, [isOpen]);

  const entries = useMemo<SpotlightEntry[]>(() => {
    const q = query.trim().toLowerCase();
    const matchedModules = modules
      .filter((m) => {
        if (!q) return true;
        return (
          m.label.toLowerCase().includes(q) ||
          m.badge.toLowerCase().includes(q) ||
          m.categoryLabel.toLowerCase().includes(q) ||
          m.keywords.toLowerCase().includes(q)
        );
      })
      .map((module): SpotlightEntry => ({ kind: 'module', module }));

    const matchedStocks = quotes
      .filter((stock) => {
        if (!q) return true;
        return (
          stock.symbol.toLowerCase().includes(q) ||
          stock.name.toLowerCase().includes(q)
        );
      })
      .slice(0, q ? 8 : 4)
      .map((quote): SpotlightEntry => ({ kind: 'stock', quote }));

    // When query strongly matches a stock symbol, surface stocks first
    const exactStock = q.length >= 2 && matchedStocks.some((s) => s.kind === 'stock' && s.quote.symbol.toLowerCase().startsWith(q));
    return exactStock ? [...matchedStocks, ...matchedModules] : [...matchedModules, ...matchedStocks];
  }, [query, modules, quotes]);

  useEffect(() => {
    if (cursor >= entries.length) {
      setCursor(Math.max(0, entries.length - 1));
    }
  }, [entries.length, cursor]);

  if (!isOpen) return null;

  const activateEntry = (entry: SpotlightEntry | undefined) => {
    if (!entry) return;
    if (entry.kind === 'module') {
      onSelectModule(entry.module.id);
    } else {
      onSelectStock(entry.quote.symbol);
    }
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setCursor((c) => (entries.length === 0 ? 0 : (c + 1) % entries.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setCursor((c) => (entries.length === 0 ? 0 : (c - 1 + entries.length) % entries.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      activateEntry(entries[cursor]);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/55 backdrop-blur-xs flex items-start justify-center pt-[10vh] p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-module-enter"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Search Input Header */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-200 bg-slate-50/70">
          <Search className="w-4 h-4 text-indigo-600 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setCursor(0);
            }}
            placeholder={`Jump to any of ${modules.length} modules or live NSE stock (e.g., tax, greeks, dividend, pledge)...`}
            className="flex-1 bg-transparent text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none"
          />
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/70 transition-colors"
            title="Close (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-[55vh] overflow-y-auto divide-y divide-slate-100">
          {entries.length === 0 ? (
            <div className="py-10 text-center text-xs text-slate-500">
              No trading modules or NSE symbols matched "{query}".
            </div>
          ) : (
            entries.map((entry, idx) => {
              const isSelected = idx === cursor;
              if (entry.kind === 'module') {
                const { module } = entry;
                const isPinned = pinnedIds.includes(module.id);
                const isCurrent = activeTabId === module.id;
                return (
                  <div
                    key={`mod-${module.id}`}
                    onMouseEnter={() => setCursor(idx)}
                    onClick={() => activateEntry(entry)}
                    className={`px-4 py-2.5 flex items-center justify-between gap-3 cursor-pointer transition-colors ${
                      isSelected ? 'bg-indigo-50/90' : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`p-1.5 rounded-lg border shrink-0 ${
                          isCurrent
                            ? 'bg-slate-900 text-white border-slate-900'
                            : 'bg-slate-100 text-slate-600 border-slate-200'
                        }`}
                      >
                        <Layers className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900 truncate">
                            {module.label}
                          </span>
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200 shrink-0">
                            {module.badge}
                          </span>
                          {isCurrent && (
                            <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded">
                              Active
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500 truncate">
                          {module.categoryLabel} · {module.keywords}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onTogglePin(module.id);
                        }}
                        className={`p-1.5 rounded-lg border transition-colors ${
                          isPinned
                            ? 'bg-amber-50 text-amber-600 border-amber-200'
                            : 'bg-white text-slate-400 border-slate-200 hover:text-amber-600'
                        }`}
                        title={isPinned ? 'Unpin from quick bar' : 'Pin to quick bar'}
                      >
                        <Star className={`w-3.5 h-3.5 ${isPinned ? 'fill-amber-400' : ''}`} />
                      </button>
                      <ArrowRight className={`w-3.5 h-3.5 ${isSelected ? 'text-indigo-600' : 'text-slate-300'}`} />
                    </div>
                  </div>
                );
              }

              const { quote } = entry;
              const isPos = quote.changePercent >= 0;
              return (
                <div
                  key={`stk-${quote.symbol}`}
                  onMouseEnter={() => setCursor(idx)}
                  onClick={() => activateEntry(entry)}
                  className={`px-4 py-2.5 flex items-center justify-between gap-3 cursor-pointer transition-colors ${
                    isSelected ? 'bg-emerald-50/80' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`p-1.5 rounded-lg border shrink-0 ${
                        isPos
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border-rose-200'
                      }`}
                    >
                      {isPos ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-slate-900">
                          {quote.symbol}
                        </span>
                        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                          Open in Live Terminal
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500">{quote.name}</div>
                    </div>
                  </div>

                  <div className="text-right font-mono shrink-0">
                    <div className="text-xs font-bold text-slate-900">
                      ₹{quote.lastPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </div>
                    <div className={`text-[10px] font-bold ${isPos ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {isPos ? '+' : ''}
                      {quote.changePercent}%
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Keyboard Footer Legend */}
        <div className="px-4 py-2 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-white border border-slate-300 rounded font-mono text-[10px]">↑↓</kbd>
              Navigate
            </span>
            <span className="inline-flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-white border border-slate-300 rounded font-mono text-[10px] inline-flex items-center gap-0.5">
                <CornerDownLeft className="w-2.5 h-2.5" /> Enter
              </kbd>
              Jump
            </span>
            <span className="inline-flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-white border border-slate-300 rounded font-mono text-[10px]">★</kbd>
              Pin Favorite
            </span>
          </div>
          <span className="font-mono text-[10px] text-slate-400">
            {modules.length} Modules · {quotes.length} NSE Quotes
          </span>
        </div>
      </div>
    </div>
  );
};
