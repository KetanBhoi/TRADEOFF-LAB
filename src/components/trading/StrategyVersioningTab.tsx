import React, { useState } from 'react';
import { INITIAL_STRATEGY_VERSIONS } from '../../utils/advancedTradingData';
import { StrategyVersion } from '../../types/trading';
import {
  GitCommit,
  GitBranch,
  History,
  Lock,
  Unlock,
  Plus,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  ShieldAlert,
  Download,
  CheckCircle2,
  AlertCircle,
  FileText,
} from 'lucide-react';

interface StrategyVersioningTabProps {
  onNotify?: (message: string) => void;
}

export const StrategyVersioningTab: React.FC<StrategyVersioningTabProps> = ({ onNotify }) => {
  const [versions, setVersions] = useState<StrategyVersion[]>(INITIAL_STRATEGY_VERSIONS);
  const [selectedVerAId, setSelectedVerAId] = useState<string>('VER-EMA-1.0');
  const [selectedVerBId, setSelectedVerBId] = useState<string>('VER-EMA-1.1');

  // New version creation modal state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newVersionReason, setNewVersionReason] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [newFastPeriod, setNewFastPeriod] = useState(13);
  const [newSlowPeriod, setNewSlowPeriod] = useState(34);
  const [newStopLoss, setNewStopLoss] = useState(1.2);
  const [newTarget, setNewTarget] = useState(3.6);

  const verA = versions.find((v) => v.id === selectedVerAId) || versions[0];
  const verB = versions.find((v) => v.id === selectedVerBId) || versions[1] || versions[0];

  const handleCommitNewVersion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVersionReason.trim()) {
      setValidationError(
        'A verified reason for modifying strategy parameters is mandatory to prevent curve-fitting and silent edits.'
      );
      return;
    }
    setValidationError(null);

    const nextVerNumber = `v1.${versions.length}`;
    const newVersion: StrategyVersion = {
      id: `VER-EMA-${Date.now()}`,
      strategyId: 'strat-ema',
      versionNumber: nextVerNumber,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      author: 'Audit Desk (Trader Verified)',
      reasonForChange: newVersionReason,
      changeSummary: [
        `Fast EMA adjusted to ${newFastPeriod}`,
        `Slow EMA adjusted to ${newSlowPeriod}`,
        `Stop Loss revised to ${newStopLoss}%`,
        `Target set to ${newTarget}%`,
      ],
      fastPeriod: newFastPeriod,
      slowPeriod: newSlowPeriod,
      rsiThreshold: 30,
      stopLossPercent: newStopLoss,
      targetPercent: newTarget,
      capitalPerTrade: 25000,
      metrics: {
        totalTrades: 12,
        winRate: 66.7,
        profitFactor: 2.15,
        sharpeRatio: 1.95,
        maxDrawdownPercent: 3.2,
        totalNetPnl: 11200,
      },
      isCurrent: true,
      isLocked: false,
    };

    setVersions((prev) => [
      ...prev.map((v) => ({ ...v, isCurrent: false, isLocked: true })),
      newVersion,
    ]);
    setSelectedVerBId(newVersion.id);
    setIsCreateModalOpen(false);
    setNewVersionReason('');
    if (onNotify) {
      onNotify(`Committed ${nextVerNumber} to immutable strategy audit ledger.`);
    }
  };

  const handleExportAuditReport = () => {
    const csvContent = [
      'Strategy Version Audit Report - TradeOff Lab',
      `Exported: ${new Date().toISOString()}`,
      '',
      'Version,Timestamp,Author,FastPeriod,SlowPeriod,StopLoss%,Target%,WinRate%,ProfitFactor,SharpeRatio,MaxDrawdown%,NetPnl,Reason',
      ...versions.map(
        (v) =>
          `"${v.versionNumber}","${v.timestamp}","${v.author}",${v.fastPeriod},${v.slowPeriod},${v.stopLossPercent},${v.targetPercent},${v.metrics.winRate},${v.metrics.profitFactor},${v.metrics.sharpeRatio},${v.metrics.maxDrawdownPercent},${v.metrics.totalNetPnl},"${v.reasonForChange.replace(/"/g, '""')}"`
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Strategy_Audit_Report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Immutable Version Control Active
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              SEBI Audit-Compliant Log
            </span>
          </div>
          <h2 className="text-xl font-bold tracking-tight">Strategy Versioning & Audit Ledger</h2>
          <p className="text-xs text-slate-300 max-w-2xl mt-1">
            Every parameter change is locked with a timestamp and mandatory thesis reason to eliminate silent hindsight edits after losing sessions. Compare version performance over identical market conditions.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={handleExportAuditReport}
            className="px-3.5 py-2 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition-colors flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Advisor Report</span>
          </button>
          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="px-3.5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-2xs transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Commit New Version</span>
          </button>
        </div>
      </div>

      {/* Side-by-Side Version Comparison Matrix */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <GitBranch className="w-4 h-4 text-indigo-600" />
            <span>Live Version Comparative Diagnostic</span>
          </h3>

          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500 font-semibold">Baseline:</span>
              <select
                value={selectedVerAId}
                onChange={(e) => setSelectedVerAId(e.target.value)}
                className="px-2.5 py-1 text-xs font-bold rounded-lg border border-slate-300 bg-slate-50"
              >
                {versions.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.versionNumber} ({v.timestamp.split(' ')[0]})
                  </option>
                ))}
              </select>
            </div>

            <span className="text-slate-400 font-bold">vs</span>

            <div className="flex items-center gap-1.5">
              <span className="text-slate-500 font-semibold">Revised:</span>
              <select
                value={selectedVerBId}
                onChange={(e) => setSelectedVerBId(e.target.value)}
                className="px-2.5 py-1 text-xs font-bold rounded-lg border border-slate-300 bg-slate-50"
              >
                {versions.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.versionNumber} {v.isCurrent ? '(Current)' : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Comparison Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Version A Card */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-base text-slate-900">{verA.versionNumber}</span>
                <span className="text-xs text-slate-500">{verA.timestamp}</span>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-200 text-slate-700 flex items-center gap-1">
                <Lock className="w-3 h-3" /> Locked
              </span>
            </div>

            <div className="p-2.5 bg-white rounded-lg border border-slate-200 text-xs space-y-1">
              <div className="text-[10px] font-semibold text-slate-500 uppercase">Reason for Version:</div>
              <div className="italic text-slate-700">{verA.reasonForChange}</div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="p-2 bg-white rounded-lg border border-slate-200">
                <div className="text-[10px] text-slate-400">Fast / Slow</div>
                <div className="font-mono font-bold text-slate-800">{verA.fastPeriod} / {verA.slowPeriod}</div>
              </div>
              <div className="p-2 bg-white rounded-lg border border-slate-200">
                <div className="text-[10px] text-slate-400">Stop Loss</div>
                <div className="font-mono font-bold text-rose-600">{verA.stopLossPercent}%</div>
              </div>
              <div className="p-2 bg-white rounded-lg border border-slate-200">
                <div className="text-[10px] text-slate-400">Target</div>
                <div className="font-mono font-bold text-emerald-600">{verA.targetPercent}%</div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-xs pt-1">
              <div className="p-2 bg-white rounded-lg border border-slate-200">
                <div className="text-[10px] text-slate-400">Win Rate</div>
                <div className="font-mono font-bold text-slate-900">{verA.metrics.winRate}%</div>
              </div>
              <div className="p-2 bg-white rounded-lg border border-slate-200">
                <div className="text-[10px] text-slate-400">Sharpe Ratio</div>
                <div className="font-mono font-bold text-indigo-600">{verA.metrics.sharpeRatio}</div>
              </div>
              <div className="p-2 bg-white rounded-lg border border-slate-200">
                <div className="text-[10px] text-slate-400">Max Drawdown</div>
                <div className="font-mono font-bold text-rose-600">-{verA.metrics.maxDrawdownPercent}%</div>
              </div>
            </div>
          </div>

          {/* Version B Card */}
          <div className="p-4 rounded-xl border-2 border-indigo-200 bg-indigo-50/20 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-base text-indigo-950">{verB.versionNumber}</span>
                <span className="text-xs text-slate-500">{verB.timestamp}</span>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-800 flex items-center gap-1">
                {verB.isCurrent ? <Unlock className="w-3 h-3 text-indigo-600" /> : <Lock className="w-3 h-3" />}
                {verB.isCurrent ? 'Current Active' : 'Locked'}
              </span>
            </div>

            <div className="p-2.5 bg-white rounded-lg border border-indigo-100 text-xs space-y-1">
              <div className="text-[10px] font-semibold text-indigo-900 uppercase">Reason for Version:</div>
              <div className="italic text-slate-700">{verB.reasonForChange}</div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="p-2 bg-white rounded-lg border border-slate-200">
                <div className="text-[10px] text-slate-400">Fast / Slow</div>
                <div className="font-mono font-bold text-slate-800">{verB.fastPeriod} / {verB.slowPeriod}</div>
              </div>
              <div className="p-2 bg-white rounded-lg border border-slate-200">
                <div className="text-[10px] text-slate-400">Stop Loss</div>
                <div className="font-mono font-bold text-rose-600">{verB.stopLossPercent}%</div>
              </div>
              <div className="p-2 bg-white rounded-lg border border-slate-200">
                <div className="text-[10px] text-slate-400">Target</div>
                <div className="font-mono font-bold text-emerald-600">{verB.targetPercent}%</div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-xs pt-1">
              <div className="p-2 bg-white rounded-lg border border-slate-200">
                <div className="text-[10px] text-slate-400">Win Rate</div>
                <div className="font-mono font-bold text-slate-900">
                  {verB.metrics.winRate}%{' '}
                  <span className="text-[9px] text-emerald-600">
                    ({verB.metrics.winRate >= verA.metrics.winRate ? '+' : ''}
                    {(verB.metrics.winRate - verA.metrics.winRate).toFixed(1)}%)
                  </span>
                </div>
              </div>
              <div className="p-2 bg-white rounded-lg border border-slate-200">
                <div className="text-[10px] text-slate-400">Sharpe Ratio</div>
                <div className="font-mono font-bold text-indigo-600">
                  {verB.metrics.sharpeRatio}{' '}
                  <span className="text-[9px] text-emerald-600">
                    ({verB.metrics.sharpeRatio >= verA.metrics.sharpeRatio ? '+' : ''}
                    {(verB.metrics.sharpeRatio - verA.metrics.sharpeRatio).toFixed(2)})
                  </span>
                </div>
              </div>
              <div className="p-2 bg-white rounded-lg border border-slate-200">
                <div className="text-[10px] text-slate-400">Max Drawdown</div>
                <div className="font-mono font-bold text-rose-600">
                  -{verB.metrics.maxDrawdownPercent}%{' '}
                  <span className="text-[9px] text-emerald-600">
                    ({(verA.metrics.maxDrawdownPercent - verB.metrics.maxDrawdownPercent).toFixed(1)}% safer)
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Full Audit Timeline Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 font-bold text-xs text-slate-800 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <History className="w-4 h-4 text-slate-500" />
            Immutable Audit History Log
          </span>
          <span className="text-[11px] font-normal text-slate-500">
            {versions.length} total releases recorded
          </span>
        </div>
        <div className="divide-y divide-slate-100">
          {versions.map((ver) => (
            <div key={ver.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
              <div className="space-y-1 max-w-xl">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-slate-900">{ver.versionNumber}</span>
                  <span className="text-[10px] text-slate-400">{ver.timestamp}</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-semibold">
                    {ver.author}
                  </span>
                </div>
                <div className="text-slate-700 italic">"{ver.reasonForChange}"</div>
                <div className="flex flex-wrap gap-1 pt-1">
                  {ver.changeSummary.map((chg, i) => (
                    <span key={i} className="text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-600">
                      {chg}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-4 shrink-0 font-mono text-slate-700">
                <div>
                  <div className="text-[9px] text-slate-400 uppercase">Win Rate</div>
                  <div className="font-bold">{ver.metrics.winRate}%</div>
                </div>
                <div>
                  <div className="text-[9px] text-slate-400 uppercase">Sharpe</div>
                  <div className="font-bold text-indigo-600">{ver.metrics.sharpeRatio}</div>
                </div>
                <div>
                  <div className="text-[9px] text-slate-400 uppercase">Net P&L</div>
                  <div className="font-bold text-emerald-600">+₹{ver.metrics.totalNetPnl.toLocaleString('en-IN')}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Commit Version Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <GitCommit className="w-4 h-4 text-indigo-600" />
                Commit New Strategy Release
              </h3>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCommitNewVersion} className="space-y-4 text-xs">
              {validationError && (
                <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-[11px] font-semibold">
                  {validationError}
                </div>
              )}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Mandatory Audit Reason for Parameter Adjustment *
                </label>
                <textarea
                  rows={3}
                  value={newVersionReason}
                  onChange={(e) => {
                    setNewVersionReason(e.target.value);
                    if (validationError) setValidationError(null);
                  }}
                  placeholder="e.g. Tightened stop-loss to 1.2% following higher gap volatility post-earnings; shifted EMA periods from 9/21 to 13/34 to minimize false whipsaws..."
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-indigo-600"
                />
                <span className="text-[10px] text-slate-500">
                  Silent edits without reason are prohibited by behavioral governance rules.
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Fast EMA Period</label>
                  <input
                    type="number"
                    value={newFastPeriod}
                    onChange={(e) => setNewFastPeriod(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Slow EMA Period</label>
                  <input
                    type="number"
                    value={newSlowPeriod}
                    onChange={(e) => setNewSlowPeriod(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-slate-300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Stop-Loss (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newStopLoss}
                    onChange={(e) => setNewStopLoss(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Target (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newTarget}
                    onChange={(e) => setNewTarget(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-slate-300"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-2xs"
                >
                  Lock & Commit Release
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
