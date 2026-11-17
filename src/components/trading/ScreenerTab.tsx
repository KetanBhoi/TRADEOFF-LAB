import React, { useState } from 'react';
import {
  ScreenerStock,
  ScreenerFilterCriteria,
  SavedScreen,
} from '../../types/trading';
import {
  INITIAL_SCREENER_STOCKS,
  DEFAULT_SAVED_SCREENS,
} from '../../utils/portfolioHealthData';
import {
  Filter,
  Bookmark,
  Plus,
  Sliders,
  Check,
  RotateCcw,
  Search,
  Sparkles,
  Columns,
  X,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Info,
} from 'lucide-react';

interface ScreenerTabProps {
  onTradeSymbol?: (symbol: string) => void;
}

export const ScreenerTab: React.FC<ScreenerTabProps> = ({ onTradeSymbol }) => {
  const [stocks] = useState<ScreenerStock[]>(INITIAL_SCREENER_STOCKS);
  const [savedScreens, setSavedScreens] = useState<SavedScreen[]>(DEFAULT_SAVED_SCREENS);
  const [activeScreenId, setActiveScreenId] = useState<string>('custom');

  // Filter Criteria State
  const [criteria, setCriteria] = useState<ScreenerFilterCriteria>({
    minPe: 0,
    maxPe: 100,
    maxDebtToEquity: 1.5,
    minRevenueGrowth: 10,
    minPromoterChange: 0,
    sectorFilter: 'ALL',
    marketCapFilter: 'ALL',
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedForComparison, setSelectedForComparison] = useState<string[]>(['SWIGGY', 'WAAREE']);
  const [isCompareDrawerOpen, setIsCompareDrawerOpen] = useState(false);

  // New screen save state
  const [showSaveScreenModal, setShowSaveScreenModal] = useState(false);
  const [newScreenName, setNewScreenName] = useState('');
  const [newScreenDesc, setNewScreenDesc] = useState('');

  // Apply saved screen
  const handleApplySavedScreen = (screen: SavedScreen) => {
    setActiveScreenId(screen.id);
    setCriteria({ ...screen.criteria });
  };

  const handleResetFilters = () => {
    setActiveScreenId('custom');
    setCriteria({
      minPe: 0,
      maxPe: 100,
      maxDebtToEquity: 1.5,
      minRevenueGrowth: 10,
      minPromoterChange: 0,
      sectorFilter: 'ALL',
      marketCapFilter: 'ALL',
    });
    setSearchQuery('');
  };

  const handleSaveScreen = () => {
    if (!newScreenName.trim()) return;
    const newScreen: SavedScreen = {
      id: `screen-${Date.now()}`,
      name: newScreenName.trim(),
      description: newScreenDesc.trim() || 'Custom user saved criteria screen',
      criteria: { ...criteria },
      matchCount: filteredStocks.length,
    };
    setSavedScreens((prev) => [...prev, newScreen]);
    setActiveScreenId(newScreen.id);
    setShowSaveScreenModal(false);
    setNewScreenName('');
    setNewScreenDesc('');
  };

  const toggleStockComparison = (symbol: string) => {
    setSelectedForComparison((prev) => {
      if (prev.includes(symbol)) {
        return prev.filter((s) => s !== symbol);
      } else {
        if (prev.length >= 4) {
          return [...prev.slice(1), symbol];
        }
        return [...prev, symbol];
      }
    });
  };

  // Filter application
  const filteredStocks = stocks.filter((stock) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (!stock.symbol.toLowerCase().includes(q) && !stock.companyName.toLowerCase().includes(q)) {
        return false;
      }
    }
    if (criteria.sectorFilter !== 'ALL' && stock.sector !== criteria.sectorFilter) {
      return false;
    }
    if (criteria.marketCapFilter !== 'ALL' && stock.marketCapCategory !== criteria.marketCapFilter) {
      return false;
    }
    if (stock.peRatio > 0 && (stock.peRatio < criteria.minPe || stock.peRatio > criteria.maxPe)) {
      return false;
    }
    if (stock.debtToEquity > criteria.maxDebtToEquity) {
      return false;
    }
    if (stock.revenueGrowthYoYPercent < criteria.minRevenueGrowth) {
      return false;
    }
    if (stock.promoterHoldingChangePercent < criteria.minPromoterChange) {
      return false;
    }
    return true;
  });

  const comparisonStocks = stocks.filter((s) => selectedForComparison.includes(s.symbol));

  const sectors = ['ALL', 'Consumer Tech', 'Solar & Renewable', 'Automobile', 'Banking & Financials', 'Information Technology', 'Electronics Manufacturing', 'Retail & Apparel'];

  return (
    <div className="space-y-6">
      {/* Top Banner: Screener & Saved Screens */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-emerald-100" />
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                Quantitative Fundamental Stock Screener
              </h3>
              <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-slate-100 text-slate-700 rounded border border-slate-200">
                NSE / BSE Live
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Filter by valuation multiples, balance sheet leverage, YoY growth velocity & promoter buying. Every metric displays source reporting dates.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSaveScreenModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors shadow-2xs"
            >
              <Bookmark className="w-3.5 h-3.5 text-slate-500" />
              <span>Save Current Screen</span>
            </button>

            {selectedForComparison.length > 0 && (
              <button
                onClick={() => setIsCompareDrawerOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-2xs"
              >
                <Columns className="w-3.5 h-3.5 text-white" />
                <span>Compare {selectedForComparison.length} Stocks</span>
              </button>
            )}
          </div>
        </div>

        {/* Saved Screen Presets */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mr-1 shrink-0">
            Saved Screens:
          </span>
          {savedScreens.map((screen) => (
            <button
              key={screen.id}
              onClick={() => handleApplySavedScreen(screen)}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all font-semibold flex items-center gap-1.5 ${
                activeScreenId === screen.id
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
              }`}
            >
              <span>{screen.name}</span>
              {screen.matchCount !== undefined && (
                <span className="font-mono text-[10px] px-1 py-0.2 rounded bg-white/20 text-current">
                  {screen.matchCount}
                </span>
              )}
            </button>
          ))}
          <button
            onClick={handleResetFilters}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            title="Reset to default filters"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Filter Control Dashboard */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4 text-xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
          <div className="flex items-center gap-2 font-bold text-slate-800">
            <Filter className="w-4 h-4 text-slate-500" />
            <span>Active Screener Parameters</span>
          </div>
          <span className="text-slate-500 font-mono text-[11px]">
            Found {filteredStocks.length} matching securities
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Max P/E Slider */}
          <div className="space-y-1.5 bg-slate-50 p-3 rounded-xl border border-slate-200/80">
            <div className="flex justify-between font-semibold text-slate-700">
              <span>Max P/E Multiple:</span>
              <span className="font-mono font-bold text-slate-900">&le; {criteria.maxPe}x</span>
            </div>
            <input
              type="range"
              min="10"
              max="150"
              step="5"
              value={criteria.maxPe}
              onChange={(e) => setCriteria((c) => ({ ...c, maxPe: Number(e.target.value) }))}
              className="w-full accent-slate-900 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>10x (Value)</span>
              <span>150x (Growth)</span>
            </div>
          </div>

          {/* Max Debt to Equity */}
          <div className="space-y-1.5 bg-slate-50 p-3 rounded-xl border border-slate-200/80">
            <div className="flex justify-between font-semibold text-slate-700">
              <span>Max Debt-to-Equity:</span>
              <span className="font-mono font-bold text-slate-900">&le; {criteria.maxDebtToEquity}</span>
            </div>
            <input
              type="range"
              min="0.1"
              max="3.0"
              step="0.1"
              value={criteria.maxDebtToEquity}
              onChange={(e) => setCriteria((c) => ({ ...c, maxDebtToEquity: Number(e.target.value) }))}
              className="w-full accent-slate-900 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>0.1 (Debt-free)</span>
              <span>3.0 (Leveraged)</span>
            </div>
          </div>

          {/* Min YoY Revenue Growth */}
          <div className="space-y-1.5 bg-slate-50 p-3 rounded-xl border border-slate-200/80">
            <div className="flex justify-between font-semibold text-slate-700">
              <span>Min YoY Revenue Growth:</span>
              <span className="font-mono font-bold text-emerald-700">&ge; {criteria.minRevenueGrowth}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="80"
              step="5"
              value={criteria.minRevenueGrowth}
              onChange={(e) => setCriteria((c) => ({ ...c, minRevenueGrowth: Number(e.target.value) }))}
              className="w-full accent-emerald-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>0% (Stable)</span>
              <span>80% (Hyper)</span>
            </div>
          </div>

          {/* Promoter Holding Change */}
          <div className="space-y-1.5 bg-slate-50 p-3 rounded-xl border border-slate-200/80">
            <div className="flex justify-between font-semibold text-slate-700">
              <span>Promoter Stake Change:</span>
              <span className="font-mono font-bold text-slate-900">
                {criteria.minPromoterChange > 0 ? `+${criteria.minPromoterChange}%` : 'Any'}
              </span>
            </div>
            <select
              value={criteria.minPromoterChange}
              onChange={(e) => setCriteria((c) => ({ ...c, minPromoterChange: Number(e.target.value) }))}
              className="w-full p-1.5 rounded-lg border border-slate-200 bg-white font-medium text-slate-800"
            >
              <option value="0">Any (Zero or Positive)</option>
              <option value="0.01">Net Promoter Accumulation (&gt; 0%)</option>
              <option value="0.5">Significant Expansion (&gt; +0.5%)</option>
            </select>
          </div>
        </div>

        {/* Sector and Search Row */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-1">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-slate-500 font-medium">Sector:</span>
            <select
              value={criteria.sectorFilter}
              onChange={(e) => setCriteria((c) => ({ ...c, sectorFilter: e.target.value }))}
              className="p-1.5 text-xs rounded-lg border border-slate-200 bg-white font-medium text-slate-800"
            >
              {sectors.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-slate-500 font-medium">Cap Tier:</span>
            <select
              value={criteria.marketCapFilter}
              onChange={(e) => setCriteria((c) => ({ ...c, marketCapFilter: e.target.value }))}
              className="p-1.5 text-xs rounded-lg border border-slate-200 bg-white font-medium text-slate-800"
            >
              <option value="ALL">All Market Caps</option>
              <option value="Large Cap">Large Cap (&gt; ₹50,000 Cr)</option>
              <option value="Mid Cap">Mid Cap (₹15,000 - ₹50,000 Cr)</option>
              <option value="Small Cap">Small Cap (&lt; ₹15,000 Cr)</option>
            </select>
          </div>

          <div className="relative w-full sm:w-64 sm:ml-auto">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search ticker or name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Filtered Securities Results Table */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Matching Equities ({filteredStocks.length})
          </h4>
          <span className="text-[11px] text-slate-500 font-mono">
            Click checkbox to compare side-by-side (max 4)
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3 text-center w-10">Compare</th>
                <th className="py-2.5 px-3">Symbol & Company</th>
                <th className="py-2.5 px-3">Sector</th>
                <th className="py-2.5 px-3 text-right">Price</th>
                <th className="py-2.5 px-3 text-right">P/E Ratio</th>
                <th className="py-2.5 px-3 text-right">Debt/Eq</th>
                <th className="py-2.5 px-3 text-right">YoY Rev Growth</th>
                <th className="py-2.5 px-3 text-right">Promoter Holding</th>
                <th className="py-2.5 px-3 text-right">ROE</th>
                <th className="py-2.5 px-3 text-center">Data As Of</th>
                <th className="py-2.5 px-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStocks.map((stock) => {
                const isSelected = selectedForComparison.includes(stock.symbol);
                return (
                  <tr key={stock.symbol} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-3 text-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleStockComparison(stock.symbol)}
                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                      />
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-900">{stock.symbol}</div>
                      <div className="text-[11px] text-slate-500 truncate max-w-[140px]">
                        {stock.companyName}
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="text-slate-800 font-medium">{stock.sector}</div>
                      <div className="text-[10px] text-slate-500">{stock.marketCapCategory}</div>
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">
                      ₹{stock.currentPrice.toLocaleString()}
                    </td>
                    <td className="py-3 px-3 text-right font-mono">
                      <span className={stock.peRatio < 25 ? 'text-emerald-700 font-bold' : 'text-slate-700'}>
                        {stock.peRatio > 0 ? `${stock.peRatio}x` : 'Loss (N/A)'}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right font-mono">
                      <span className={stock.debtToEquity < 0.3 ? 'text-emerald-700 font-bold' : 'text-slate-700'}>
                        {stock.debtToEquity.toFixed(2)}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-emerald-700">
                      +{stock.revenueGrowthYoYPercent}%
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-slate-800">
                      {stock.promoterHoldingPercent}%
                      {stock.promoterHoldingChangePercent > 0 && (
                        <span className="block text-[10px] text-emerald-600 font-semibold">
                          (+{stock.promoterHoldingChangePercent}%)
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">
                      {stock.roePercent}%
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className="font-mono text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                        {stock.dataDate}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      {onTradeSymbol && (
                        <button
                          onClick={() => onTradeSymbol(stock.symbol)}
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

      {/* Side-by-Side 4-Stock Comparison Drawer */}
      {isCompareDrawerOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden space-y-0 animate-in fade-in zoom-in-95">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Columns className="w-4 h-4 text-indigo-600" />
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Side-by-Side Fundamentals Comparison ({comparisonStocks.length} Selected)
                </h4>
              </div>
              <button
                onClick={() => setIsCompareDrawerOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="py-3 px-3 text-slate-500 font-semibold w-40">Metric / Attribute</th>
                    {comparisonStocks.map((s) => (
                      <th key={s.symbol} className="py-3 px-3 text-slate-900 font-bold min-w-[150px]">
                        <div className="text-sm">{s.symbol}</div>
                        <div className="text-[11px] text-slate-500 font-normal truncate">{s.companyName}</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  <tr>
                    <td className="py-2.5 px-3 font-sans font-semibold text-slate-600">Current Market Price</td>
                    {comparisonStocks.map((s) => (
                      <td key={s.symbol} className="py-2.5 px-3 font-bold text-slate-900">
                        ₹{s.currentPrice.toLocaleString()}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-sans font-semibold text-slate-600">P/E Valuation</td>
                    {comparisonStocks.map((s) => (
                      <td key={s.symbol} className="py-2.5 px-3">
                        {s.peRatio > 0 ? `${s.peRatio}x` : 'N/A'}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-sans font-semibold text-slate-600">Price to Book (P/B)</td>
                    {comparisonStocks.map((s) => (
                      <td key={s.symbol} className="py-2.5 px-3">{s.pbRatio}x</td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-sans font-semibold text-slate-600">Debt to Equity</td>
                    {comparisonStocks.map((s) => (
                      <td key={s.symbol} className="py-2.5 px-3">
                        <span className={s.debtToEquity < 0.3 ? 'text-emerald-700 font-bold' : ''}>
                          {s.debtToEquity.toFixed(2)}
                        </span>
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-sans font-semibold text-slate-600">YoY Revenue Growth</td>
                    {comparisonStocks.map((s) => (
                      <td key={s.symbol} className="py-2.5 px-3 text-emerald-700 font-bold">
                        +{s.revenueGrowthYoYPercent}%
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-sans font-semibold text-slate-600">YoY Profit Growth</td>
                    {comparisonStocks.map((s) => (
                      <td key={s.symbol} className="py-2.5 px-3 font-bold">
                        {s.profitGrowthYoYPercent >= 0 ? `+${s.profitGrowthYoYPercent}%` : `${s.profitGrowthYoYPercent}%`}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-sans font-semibold text-slate-600">Return on Equity (ROE)</td>
                    {comparisonStocks.map((s) => (
                      <td key={s.symbol} className="py-2.5 px-3 font-bold text-slate-900">
                        {s.roePercent}%
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-sans font-semibold text-slate-600">Operating Margin</td>
                    {comparisonStocks.map((s) => (
                      <td key={s.symbol} className="py-2.5 px-3">{s.operatingMarginPercent}%</td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-sans font-semibold text-slate-600">Promoter Holding</td>
                    {comparisonStocks.map((s) => (
                      <td key={s.symbol} className="py-2.5 px-3">
                        {s.promoterHoldingPercent}%
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-sans font-semibold text-slate-600">Fundamental Data As Of</td>
                    {comparisonStocks.map((s) => (
                      <td key={s.symbol} className="py-2.5 px-3 text-[10px] text-slate-500">
                        {s.dataDate}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-end">
              <button
                onClick={() => setIsCompareDrawerOpen(false)}
                className="py-1.5 px-4 rounded-lg bg-slate-900 text-white font-semibold text-xs hover:bg-slate-800 transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Save Screen */}
      {showSaveScreenModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden space-y-4 p-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h4 className="text-sm font-bold text-slate-900">Save Custom Screen</h4>
              <button onClick={() => setShowSaveScreenModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Screen Name</label>
                <input
                  type="text"
                  placeholder="e.g. My Fast Growth Filter"
                  value={newScreenName}
                  onChange={(e) => setNewScreenName(e.target.value)}
                  className="w-full p-2 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white text-xs"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Description (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Low debt with high revenue acceleration"
                  value={newScreenDesc}
                  onChange={(e) => setNewScreenDesc(e.target.value)}
                  className="w-full p-2 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white text-xs"
                />
              </div>
              <div className="p-3 bg-slate-50 rounded-lg text-slate-500 font-mono text-[11px] space-y-0.5">
                <div>Max P/E: &le; {criteria.maxPe}x</div>
                <div>Max Debt/Eq: &le; {criteria.maxDebtToEquity}</div>
                <div>Min YoY Growth: &ge; {criteria.minRevenueGrowth}%</div>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowSaveScreenModal(false)}
                className="py-1.5 px-3 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveScreen}
                className="py-1.5 px-4 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg"
              >
                Save Screen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
