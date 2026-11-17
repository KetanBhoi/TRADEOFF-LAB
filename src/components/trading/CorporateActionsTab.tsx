import React, { useState } from 'react';
import { INITIAL_CORPORATE_ACTIONS } from '../../utils/advancedTradingData';
import { CorporateActionItem, CorporateActionType } from '../../types/trading';
import {
  Calendar,
  Layers,
  ArrowRight,
  TrendingUp,
  Percent,
  CheckCircle2,
  Clock,
  AlertCircle,
  HelpCircle,
  Filter,
} from 'lucide-react';

interface CorporateActionsTabProps {
  onNotify?: (message: string) => void;
}

export const CorporateActionsTab: React.FC<CorporateActionsTabProps> = ({ onNotify }) => {
  const [actions] = useState<CorporateActionItem[]>(INITIAL_CORPORATE_ACTIONS);
  const [filterType, setFilterType] = useState<string>('ALL');
  const [remindedIds, setRemindedIds] = useState<string[]>([]);

  const handleToggleReminder = (action: CorporateActionItem) => {
    const alreadySet = remindedIds.includes(action.id);
    setRemindedIds((prev) =>
      alreadySet ? prev.filter((id) => id !== action.id) : [...prev, action.id]
    );
    if (onNotify) {
      onNotify(
        alreadySet
          ? `Removed Ex-Date reminder for ${action.symbol}.`
          : `Ex-Date alert armed for ${action.symbol} (${action.exDate}).`
      );
    }
  };

  const filteredActions = actions.filter((act) =>
    filterType === 'ALL' ? true : act.actionType === filterType
  );

  const getActionBadgeColor = (type: CorporateActionType) => {
    switch (type) {
      case 'DIVIDEND':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'BONUS':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'SPLIT':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'BUYBACK':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'RIGHTS':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              Corporate Ledger & Cost Basis Adjustments
            </span>
          </div>
          <h2 className="text-xl font-bold tracking-tight">Corporate Action Tracker</h2>
          <p className="text-xs text-slate-300 max-w-2xl mt-1">
            Track dividends, bonus shares, stock splits, and buybacks across your holdings. Cost bases and share counts are automatically adjusted to keep your portfolio P&L and tax records accurate.
          </p>
        </div>

        {/* Quick Summary Pill */}
        <div className="flex items-center gap-4 bg-slate-800/80 border border-slate-700/60 p-3.5 rounded-xl shrink-0">
          <div>
            <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Upcoming Events</div>
            <div className="text-xl font-black text-amber-400 font-mono">
              {actions.filter((a) => a.status === 'UPCOMING').length}
            </div>
          </div>
          <div className="h-8 w-px bg-slate-700" />
          <div>
            <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Dividend Received</div>
            <div className="text-xl font-black text-emerald-400 font-mono">₹630.00</div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto no-scrollbar">
        {['ALL', 'DIVIDEND', 'BONUS', 'SPLIT', 'BUYBACK'].map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => setFilterType(type)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              filterType === type
                ? 'bg-slate-900 text-white shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            {type === 'ALL' ? 'All Corporate Actions' : `${type}s`}
          </button>
        ))}
      </div>

      {/* Corporate Action Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredActions.map((action) => {
          const isUpcoming = action.status === 'UPCOMING';

          return (
            <div
              key={action.id}
              className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs flex flex-col justify-between space-y-4 hover:border-slate-300 transition-colors"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900">{action.symbol}</span>
                      <span className="text-xs text-slate-500 font-normal">({action.companyName})</span>
                    </div>
                    <div className="text-xs font-semibold text-indigo-700 mt-0.5">
                      {action.ratioOrAmount}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getActionBadgeColor(
                        action.actionType
                      )}`}
                    >
                      {action.actionType}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isUpcoming
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {action.status}
                    </span>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                  <div>
                    <div className="text-[10px] text-slate-500 font-semibold uppercase flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      <span>Ex-Date</span>
                    </div>
                    <div className="font-mono font-bold text-slate-900 mt-0.5">{action.exDate}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500 font-semibold uppercase flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>Record Date</span>
                    </div>
                    <div className="font-mono font-bold text-slate-900 mt-0.5">{action.recordDate}</div>
                  </div>
                </div>

                {/* Cost Basis and Share Count Adjustment Matrix */}
                <div className="mt-3 p-3 bg-indigo-50/60 rounded-xl border border-indigo-100/80 text-xs space-y-2">
                  <div className="text-[10px] font-bold text-indigo-900 uppercase tracking-wider">
                    Adjusted Holdings & Average Cost Impact
                  </div>

                  <div className="flex items-center justify-between text-indigo-950">
                    <span className="text-slate-600">Share Quantity:</span>
                    <div className="flex items-center gap-1.5 font-mono font-semibold">
                      <span className="text-slate-500">{action.originalShares} shs</span>
                      <ArrowRight className="w-3 h-3 text-indigo-600" />
                      <span className="text-indigo-900 font-bold">{action.adjustedShares} shs</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-indigo-950">
                    <span className="text-slate-600">Average Cost Basis:</span>
                    <div className="flex items-center gap-1.5 font-mono font-semibold">
                      <span className="text-slate-500">₹{action.originalAvgCost}</span>
                      <ArrowRight className="w-3 h-3 text-indigo-600" />
                      <span className="text-indigo-900 font-bold">₹{action.adjustedAvgCost}</span>
                    </div>
                  </div>

                  {action.payoutOrBenefitAmount > 0 && (
                    <div className="flex items-center justify-between pt-1 border-t border-indigo-200/60 text-emerald-800 font-bold">
                      <span>Cash Payout / Value:</span>
                      <span className="font-mono">+₹{action.payoutOrBenefitAmount.toLocaleString('en-IN')}</span>
                    </div>
                  )}
                </div>

                <p className="mt-3 text-[11px] text-slate-600 leading-relaxed">
                  {action.explanation}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                <span className="text-slate-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  Auto-synced with broker ledger
                </span>
                <button
                  type="button"
                  onClick={() => handleToggleReminder(action)}
                  className={`text-xs font-semibold transition-colors ${
                    remindedIds.includes(action.id)
                      ? 'text-emerald-700 font-bold'
                      : 'text-indigo-600 hover:text-indigo-800'
                  }`}
                >
                  {remindedIds.includes(action.id) ? '✓ Reminder Set' : 'Set Ex-Date Reminder'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
