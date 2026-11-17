import React, { useState } from 'react';
import { INITIAL_LEADERBOARD } from '../../utils/advancedTradingData';
import { LeaderboardCompetitor } from '../../types/trading';
import {
  Trophy,
  Award,
  Medal,
  ShieldCheck,
  TrendingUp,
  AlertTriangle,
  RotateCcw,
  Sliders,
  CheckCircle2,
  Calendar,
  Lock,
  Eye,
  EyeOff,
} from 'lucide-react';

export const PaperLeaderboardTab: React.FC = () => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardCompetitor[]>(INITIAL_LEADERBOARD);
  const [isOptedIn, setIsOptedIn] = useState<boolean>(true);
  const [activeSeason, setActiveSeason] = useState<string>('Q4 2024 (Ends 31 Dec)');

  const getRankBadge = (rank: number) => {
    switch (rank) {
      case 1:
        return (
          <span className="w-6 h-6 rounded-full bg-amber-400 text-amber-950 font-black text-xs flex items-center justify-center shadow-2xs">
            1
          </span>
        );
      case 2:
        return (
          <span className="w-6 h-6 rounded-full bg-slate-300 text-slate-900 font-black text-xs flex items-center justify-center shadow-2xs">
            2
          </span>
        );
      case 3:
        return (
          <span className="w-6 h-6 rounded-full bg-amber-700 text-white font-black text-xs flex items-center justify-center shadow-2xs">
            3
          </span>
        );
      default:
        return (
          <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-600 font-bold text-xs flex items-center justify-center">
            {rank}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-amber-950/70 to-slate-900 text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30">
              Season: {activeSeason}
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Sharpe-Weighted Ranking
            </span>
          </div>
          <h2 className="text-xl font-bold tracking-tight">Paper Trading Risk-Adjusted Leaderboard</h2>
          <p className="text-xs text-slate-300 max-w-2xl mt-1">
            Simulated portfolio competition with equal ₹5,00,000 initial capital. Rankings prioritize risk-adjusted return (Sharpe Ratio) and penalize drawdowns, rewarding mathematical discipline over reckless lottery leverage.
          </p>
        </div>

        {/* Opt-In Control */}
        <div className="bg-slate-800/80 border border-slate-700/60 p-3.5 rounded-xl shrink-0 flex items-center gap-3">
          <div className="space-y-0.5">
            <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Competition Status</div>
            <div className="text-xs font-bold text-white flex items-center gap-1.5">
              {isOptedIn ? (
                <>
                  <Eye className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Opted In (Rank #2)</span>
                </>
              ) : (
                <>
                  <EyeOff className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-slate-400">Private / Hidden</span>
                </>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsOptedIn(!isOptedIn)}
            className="px-2.5 py-1 text-[11px] font-bold rounded-lg border border-slate-600 bg-slate-700 hover:bg-slate-600 text-slate-200 transition-colors"
          >
            {isOptedIn ? 'Make Private' : 'Join League'}
          </button>
        </div>
      </div>

      {/* Fair Competition Guardrails Notice */}
      <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-slate-700">
          <Trophy className="w-4 h-4 text-amber-500 shrink-0" />
          <span>
            <strong>Anti-Luck Resets:</strong> Leaderboards reset quarterly so temporary bull-market luck does not lock in perpetual standings. Only verified paper trades are tallied.
          </span>
        </div>
        <div className="text-[11px] font-mono text-slate-500 shrink-0 flex items-center gap-1">
          <Calendar className="w-3.5 h-3.5" />
          <span>Next Reset: 31 Dec 2024</span>
        </div>
      </div>

      {/* Leaderboard Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase text-[10px] font-semibold tracking-wider">
                <th className="py-2.5 px-3">Rank</th>
                <th className="py-2.5 px-3">Trader</th>
                <th className="py-2.5 px-3">Sharpe Ratio (Primary)</th>
                <th className="py-2.5 px-3">Current Equity</th>
                <th className="py-2.5 px-3">Raw Return</th>
                <th className="py-2.5 px-3">Max Drawdown</th>
                <th className="py-2.5 px-3">Win Rate</th>
                <th className="py-2.5 px-3">Trades</th>
                <th className="py-2.5 px-3">Discipline Badges</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {leaderboard.map((item) => {
                if (item.isCurrentUser && !isOptedIn) return null;

                return (
                  <tr
                    key={item.rank}
                    className={`transition-colors ${
                      item.isCurrentUser
                        ? 'bg-indigo-50/70 font-semibold'
                        : 'hover:bg-slate-50'
                    }`}
                  >
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        {getRankBadge(item.rank)}
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center font-mono ${
                            item.isCurrentUser
                              ? 'bg-indigo-600 text-white'
                              : 'bg-slate-800 text-slate-200'
                          }`}
                        >
                          {item.avatar}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900">{item.traderName}</div>
                          {item.isCurrentUser && (
                            <span className="text-[9px] text-indigo-700 font-bold uppercase">
                              (Your Paper Account)
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-indigo-700 text-sm">
                      {item.sharpeRatio.toFixed(2)}
                    </td>
                    <td className="py-3 px-3 font-mono font-semibold text-slate-900">
                      ₹{item.currentEquity.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-3 font-mono">
                      <span className="text-emerald-600 font-bold">
                        +{item.returnPercent.toFixed(2)}%
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono text-rose-600 font-semibold">
                      -{item.maxDrawdownPercent.toFixed(1)}%
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-800">
                      {item.winRate.toFixed(1)}%
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-600">
                      {item.tradeCount}
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex flex-wrap gap-1">
                        {item.badges.map((b, i) => (
                          <span
                            key={i}
                            className="text-[9px] px-2 py-0.5 rounded-full font-bold bg-slate-100 text-slate-700 border border-slate-200"
                          >
                            {b}
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
