import React, { useState } from 'react';
import {
  BookOpen,
  X,
  ShieldAlert,
  TrendingUp,
  Percent,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Lock,
  Layers,
  ArrowRight,
} from 'lucide-react';

interface TradingGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TradingGuideModal: React.FC<TradingGuideModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'ipo' | 'risk' | 'strategies' | 'broker'>('ipo');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-xs">
              <BookOpen className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 tracking-tight">
                  IPO & Live Trading Strategy Guide
                </h3>
                <span className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider bg-orange-100 text-orange-800 rounded-md border border-orange-200">
                  Investor Guide
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Institutional methodology for IPO book building, algorithmic risk budgeting, and broker safety
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-5 pt-3 border-b border-slate-200 bg-white flex items-center gap-2 overflow-x-auto no-scrollbar">
          {[
            { id: 'ipo', label: '1. IPO Mechanics & GMP', icon: TrendingUp },
            { id: 'risk', label: '2. Risk & Position Sizing', icon: ShieldAlert },
            { id: 'strategies', label: '3. Algorithmic Strategies', icon: Layers },
            { id: 'broker', label: '4. Broker API & Kill Switch', icon: Lock },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-3 py-2 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${
                  isActive
                    ? 'border-orange-600 text-orange-700 font-bold'
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-700 text-xs leading-relaxed">
          {activeTab === 'ipo' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200/80 flex items-start gap-3 text-amber-900">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-xs font-bold">Important Caveat on Historical Gains & GMP</strong>
                  <p className="text-[11px] text-amber-800 mt-0.5">
                    Past listing pops (such as Waaree Energies +70% or Bajaj Housing +114%) do not guarantee future performance.
                    Grey Market Premiums (GMP) are unofficial, unregulated dealer quotes susceptible to artificial manipulation.
                    Always analyze company valuation multiples (P/E, EV/EBITDA) and debt obligations in the Red Herring Prospectus (RHP).
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-sm font-bold text-slate-900">How IPO Quotas & Allotment Lotteries Function</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <strong className="block text-slate-900 font-mono">Retail Individual (RII)</strong>
                    <span className="text-[11px] text-slate-500 block">Bid up to ₹2,00,000 (usually 35% quota)</span>
                    <p className="text-[11px] text-slate-600 mt-1">
                      Allotted via a randomized computerized lottery if oversubscribed. Applying for multiple lots does not increase your odds if 1 lot is oversubscribed.
                    </p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <strong className="block text-slate-900 font-mono">Non-Institutional (NII/HNI)</strong>
                    <span className="text-[11px] text-slate-500 block">Bid ₹2 Lakh to ₹10 Lakh+ (15% quota)</span>
                    <p className="text-[11px] text-slate-600 mt-1">
                      Allotted on proportionate or lottery basis. Many HNI bidders borrow via IPO financing where interest cost must be offset by listing gains.
                    </p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <strong className="block text-slate-900 font-mono">Qualified Institutions (QIB)</strong>
                    <span className="text-[11px] text-slate-500 block">Mutual funds, FPIs, banks (50% quota)</span>
                    <p className="text-[11px] text-slate-600 mt-1">
                      The most critical anchor signal. High QIB oversubscription (e.g. 50x+) indicates institutional conviction and underwriting strength.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-bold text-slate-900">ASBA Payment System</h4>
                <p className="text-slate-600">
                  Applications Supported by Blocked Amount (ASBA) means money never leaves your bank account until allotment is finalized.
                  If not allotted, the lien/block is released within 2-3 business days following the basis of allotment.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'risk' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-900 text-white space-y-2">
                <div className="flex items-center gap-2 font-bold text-orange-400">
                  <ShieldAlert className="w-4 h-4" />
                  <span>The Golden 1% Risk Rule</span>
                </div>
                <p className="text-slate-300 text-xs">
                  Professional quantitative traders never risk more than <strong>1% to 1.5%</strong> of total account equity on any single position.
                  Capital preservation takes priority over return maximization.
                </p>
                <div className="p-2.5 bg-slate-800 rounded-lg font-mono text-[11px] text-slate-200 border border-slate-700">
                  Position Size (Shares) = (Total Capital × Max Risk %) / (Entry Price - Stop Loss Price)
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                  <strong className="text-slate-900 font-bold block">Daily Loss Circuit Breaker</strong>
                  <p className="text-slate-600 text-[11px]">
                    Set an inviolable daily loss cap (e.g. ₹5,000 or 2% of portfolio). When hit, all trading is halted for the remainder of the session to prevent emotional "revenge trading".
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                  <strong className="text-slate-900 font-bold block">Max Symbol Exposure Cap</strong>
                  <p className="text-slate-600 text-[11px]">
                    Never allow a single stock or IPO allocation to exceed <strong>25%</strong> of your total investable capital, preventing catastrophic concentration risk.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'strategies' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <h4 className="text-sm font-bold text-slate-900">Rule-Based Strategy Engine</h4>
                <p className="text-slate-600">
                  Our built-in backtester evaluates strategies on actual historical candle data, including real-world Indian transaction taxes (STT 0.1%, Brokerage ₹20, GST 18%, and 0.05% slippage).
                </p>
              </div>

              <div className="space-y-3">
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                  <strong className="text-slate-900 font-mono block">1. Exponential Moving Average (EMA 9/21) Crossover</strong>
                  <p className="text-[11px] text-slate-600 mt-1">
                    Trend-following momentum system. Generates a BUY signal when the fast 9 EMA crosses above the slow 21 EMA with confirming volume.
                  </p>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                  <strong className="text-slate-900 font-mono block">2. Relative Strength Index (RSI 30/70) Mean Reversion</strong>
                  <p className="text-[11px] text-slate-600 mt-1">
                    Buys oversold bounces when RSI crosses above 30, and trims positions when RSI crosses below 70 overbought territory.
                  </p>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                  <strong className="text-slate-900 font-mono block">3. IPO Listing-Day Momentum Breakout</strong>
                  <p className="text-[11px] text-slate-600 mt-1">
                    Captures high-volume opening range breakouts in the first 15-30 minutes of a newly listed stock with a tight 3% trailing stop-loss.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'broker' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <h4 className="text-sm font-bold text-slate-900">Broker API & Kill Switch Protocol</h4>
                <p className="text-slate-600">
                  Our system integrates with leading Indian discount broker APIs (Zerodha Kite Connect, Upstox Developer API, Angel One SmartAPI).
                </p>
              </div>

              <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-950 space-y-2">
                <div className="flex items-center gap-2 font-bold">
                  <Zap className="w-4 h-4 text-rose-600" />
                  <span>The Emergency Kill Switch</span>
                </div>
                <p className="text-xs text-rose-800 leading-relaxed">
                  In extreme market volatility, flash crashes, or connectivity drops, triggering the <strong>Kill Switch</strong> sends immediate market orders to square off all open positions and cancels all pending limit/stop orders.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <strong className="text-slate-900 font-bold block">Paper Trading First</strong>
                <p className="text-slate-600 text-xs">
                  Always run strategies in <strong>Paper Trading Mode</strong> for at least 10-15 trading sessions on live market ticks before committing real capital through your broker account.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            SEBI Regulatory Reference & Educational Material
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-2xs"
          >
            Understood & Close
          </button>
        </div>
      </div>
    </div>
  );
};
