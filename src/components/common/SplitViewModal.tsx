import React, { useState } from 'react';
import {
  ScenarioHistorySnapshot,
  ScenarioId,
  AnyScenarioParams,
} from '../../types';
import { compareSnapshots } from '../../utils/comparisonUtils';
import {
  X,
  Columns,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Equal,
  Sparkles,
  RotateCcw,
  Clock,
  Layers,
  Info,
  Maximize2,
  ChevronDown,
  Check,
} from 'lucide-react';

interface SplitViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: ScenarioHistorySnapshot[];
  activeScenario: ScenarioId;
  currentParams: AnyScenarioParams;
  onRestore: (snapshot: ScenarioHistorySnapshot) => void;
}

export const SplitViewModal: React.FC<SplitViewModalProps> = ({
  isOpen,
  onClose,
  history,
  activeScenario,
  currentParams,
  onRestore,
}) => {
  if (!isOpen) return null;

  // History filtered by active scenario
  const scenarioHistory = history.filter((h) => h.scenarioId === activeScenario);

  // We want to default Snapshot A to previous history snapshot or current, and Snapshot B to the latest
  const [snapshotAId, setSnapshotAId] = useState<string>(() => {
    if (scenarioHistory.length > 1) {
      return scenarioHistory[1].id;
    }
    return scenarioHistory[0]?.id || 'current';
  });

  const [snapshotBId, setSnapshotBId] = useState<string>(() => {
    return scenarioHistory[0]?.id || 'current';
  });

  const [diffFilter, setDiffFilter] = useState<'all' | 'changed-only'>('changed-only');

  // Helper to resolve snapshot or current state
  const getSnapshot = (id: string): { label: string; time: string; metric: string; params: AnyScenarioParams } => {
    if (id === 'current') {
      return {
        label: 'Active Workspace (Current)',
        time: 'Now',
        metric: 'Current Levers',
        params: currentParams,
      };
    }
    const found = scenarioHistory.find((s) => s.id === id);
    if (found) {
      return {
        label: `${found.timeFormatted} (${found.primaryMetric})`,
        time: found.timeFormatted,
        metric: found.primaryMetric,
        params: found.params,
      };
    }
    return {
      label: 'Active Workspace (Current)',
      time: 'Now',
      metric: 'Current Levers',
      params: currentParams,
    };
  };

  const snapA = getSnapshot(snapshotAId);
  const snapB = getSnapshot(snapshotBId);

  // Compute full side-by-side delta model
  const comparison = compareSnapshots(
    activeScenario,
    snapA.params,
    snapB.params
  );

  const parameterList = diffFilter === 'changed-only'
    ? comparison.parameterDeltas.filter((p) => p.isDifferent)
    : comparison.parameterDeltas;

  const totalParamsChanged = comparison.parameterDeltas.filter((p) => p.isDifferent).length;
  const isIdentical = totalParamsChanged === 0;

  const handleSwapSnapshots = () => {
    const temp = snapshotAId;
    setSnapshotAId(snapshotBId);
    setSnapshotBId(temp);
  };

  const handleRestoreSelected = (targetId: string) => {
    if (targetId === 'current') return;
    const item = scenarioHistory.find((s) => s.id === targetId);
    if (item) {
      onRestore(item);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
      <div className="bg-white w-full max-w-5xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center shadow-2xs">
              <Columns className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900">
                  Split-View Snapshot Comparator
                </h2>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200 capitalize">
                  {comparison.scenarioTitle}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Compare two configurations side-by-side to visually inspect lever changes and their direct mathematical impacts.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSwapSnapshots}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg shadow-2xs transition-colors"
              title="Swap Snapshot A and B"
            >
              <span>Swap Sides</span>
            </button>
            <button
              onClick={onClose}
              className="flex items-center gap-1.5 p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
              title="Close modal (Press 'Esc' or 'S')"
            >
              <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono font-bold bg-white text-slate-600 border border-slate-300 rounded shadow-2xs">
                Esc
              </kbd>
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Snapshot Selectors Bar */}
        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-200 bg-slate-100/60 border-b border-slate-200 text-xs">
          {/* Column A Picker */}
          <div className="p-4 space-y-2 bg-slate-50/70">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-700 flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-md bg-slate-800 text-white font-mono text-[11px] flex items-center justify-center">
                  A
                </span>
                <span>Baseline Snapshot</span>
              </span>
              {snapshotAId !== 'current' && (
                <button
                  onClick={() => handleRestoreSelected(snapshotAId)}
                  className="flex items-center gap-1 text-[11px] font-semibold text-indigo-700 hover:text-indigo-900"
                  title="Revert workspace to Baseline"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Restore A</span>
                </button>
              )}
            </div>

            <div className="relative">
              <select
                value={snapshotAId}
                onChange={(e) => setSnapshotAId(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 pr-8 text-xs font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 shadow-2xs appearance-none"
              >
                <option value="current">● Current Active Workspace (Now)</option>
                {scenarioHistory.map((s, idx) => (
                  <option key={s.id} value={s.id}>
                    #{idx + 1} — {s.timeFormatted} ({s.primaryMetric})
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
            </div>

            <div className="text-[11px] text-slate-500 flex items-center justify-between">
              <span>Timestamp: <strong className="text-slate-700">{snapA.time}</strong></span>
              <span>Outcome: <strong className="text-slate-800 font-mono">{snapA.metric}</strong></span>
            </div>
          </div>

          {/* Column B Picker */}
          <div className="p-4 space-y-2 bg-slate-50/70">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-700 flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-md bg-indigo-600 text-white font-mono text-[11px] flex items-center justify-center">
                  B
                </span>
                <span>Comparison Snapshot</span>
              </span>
              {snapshotBId !== 'current' && (
                <button
                  onClick={() => handleRestoreSelected(snapshotBId)}
                  className="flex items-center gap-1 text-[11px] font-semibold text-indigo-700 hover:text-indigo-900"
                  title="Revert workspace to Comparison"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Restore B</span>
                </button>
              )}
            </div>

            <div className="relative">
              <select
                value={snapshotBId}
                onChange={(e) => setSnapshotBId(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 pr-8 text-xs font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 shadow-2xs appearance-none"
              >
                <option value="current">● Current Active Workspace (Now)</option>
                {scenarioHistory.map((s, idx) => (
                  <option key={s.id} value={s.id}>
                    #{idx + 1} — {s.timeFormatted} ({s.primaryMetric})
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
            </div>

            <div className="text-[11px] text-slate-500 flex items-center justify-between">
              <span>Timestamp: <strong className="text-slate-700">{snapB.time}</strong></span>
              <span>Outcome: <strong className="text-slate-800 font-mono">{snapB.metric}</strong></span>
            </div>
          </div>
        </div>

        {/* Executive Comparative Takeaway Banner */}
        <div className="px-5 py-3 bg-indigo-50/70 border-b border-indigo-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 text-indigo-950 font-medium">
            <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
            <span>
              <strong>Delta Summary:</strong> {comparison.summaryNote}
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[11px] text-indigo-700 font-semibold">Filter:</span>
            <div className="inline-flex rounded-md shadow-2xs bg-white p-0.5 border border-indigo-200">
              <button
                onClick={() => setDiffFilter('changed-only')}
                className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors ${
                  diffFilter === 'changed-only'
                    ? 'bg-indigo-600 text-white'
                    : 'text-indigo-800 hover:bg-indigo-50'
                }`}
              >
                Deltas Only ({totalParamsChanged})
              </button>
              <button
                onClick={() => setDiffFilter('all')}
                className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors ${
                  diffFilter === 'all'
                    ? 'bg-indigo-600 text-white'
                    : 'text-indigo-800 hover:bg-indigo-50'
                }`}
              >
                All Inputs ({comparison.parameterDeltas.length})
              </button>
            </div>
          </div>
        </div>

        {/* Comparative Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* SECTION 1: OUTCOME DELTAS HIGHLIGHTING */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
                <span>Outcome Impacts (B vs A)</span>
              </h3>
              <span className="text-xs text-slate-500 font-medium">
                Calculated by exact underlying mathematical models
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {comparison.outcomeDeltas.map((out) => {
                const isPositive = out.sentiment === 'positive';
                const isNegative = out.sentiment === 'negative';
                const isNeutral = !isPositive && !isNegative;

                return (
                  <div
                    key={out.id}
                    className={`p-3.5 rounded-xl border transition-all space-y-2 ${
                      isPositive
                        ? 'bg-emerald-50/50 border-emerald-200'
                        : isNegative
                        ? 'bg-rose-50/50 border-rose-200'
                        : 'bg-slate-50/80 border-slate-200'
                    }`}
                  >
                    <div className="text-xs font-semibold text-slate-700 truncate" title={out.label}>
                      {out.label}
                    </div>

                    {/* Side-by-side values */}
                    <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-slate-200/60">
                      <div>
                        <div className="text-[10px] uppercase font-bold text-slate-400">A (Base)</div>
                        <div className="font-mono font-semibold text-slate-700 truncate">{out.valADisplay}</div>
                      </div>
                      <div>
                        <div className="text-[10px] uppercase font-bold text-indigo-500">B (Comp)</div>
                        <div className="font-mono font-bold text-slate-900 truncate">{out.valBDisplay}</div>
                      </div>
                    </div>

                    {/* Delta badge */}
                    <div className="pt-1 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1 font-mono font-bold">
                        {out.direction === 'higher' ? (
                          <TrendingUp className={`w-3.5 h-3.5 ${isPositive ? 'text-emerald-600' : isNegative ? 'text-rose-600' : 'text-slate-600'}`} />
                        ) : out.direction === 'lower' ? (
                          <TrendingDown className={`w-3.5 h-3.5 ${isPositive ? 'text-emerald-600' : isNegative ? 'text-rose-600' : 'text-slate-600'}`} />
                        ) : (
                          <Equal className="w-3.5 h-3.5 text-slate-400" />
                        )}

                        <span
                          className={`${
                            isPositive
                              ? 'text-emerald-700'
                              : isNegative
                              ? 'text-rose-700'
                              : 'text-slate-600'
                          }`}
                        >
                          {out.numericDelta !== undefined
                            ? `${out.numericDelta > 0 ? '+' : ''}${out.numericDelta.toLocaleString(undefined, { maximumFractionDigits: 1 })}${out.unit ? ` ${out.unit}` : ''}`
                            : out.direction === 'equal'
                            ? 'No shift'
                            : 'Status shifted'}
                        </span>
                      </div>

                      {out.note && (
                        <span className="text-[10px] text-slate-500 max-w-[50%] truncate text-right" title={out.note}>
                          {out.note}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* SECTION 2: PARAMETER DELTAS WITH HIGHLIGHTING UI */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-slate-700"></span>
                <span>Configured Parameter Differences</span>
              </h3>
              <span className="text-xs text-slate-500 font-medium">
                {totalParamsChanged === 0 ? 'Exact match' : `${totalParamsChanged} levers modified between snapshots`}
              </span>
            </div>

            {isIdentical ? (
              <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <Equal className="w-8 h-8 text-slate-400 mx-auto" />
                <h4 className="text-sm font-bold text-slate-800">Configurations Are Identical</h4>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Snapshot A and Snapshot B have identical lever settings. Select a different history snapshot above to inspect parameter variations.
                </p>
              </div>
            ) : parameterList.length === 0 ? (
              <div className="p-6 text-center bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-500">
                No altered parameters under the selected filter. Click "All Inputs" above to review entire configuration set.
              </div>
            ) : (
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <div className="min-w-[560px]">
                    {/* Table Header */}
                    <div className="grid grid-cols-12 gap-2 bg-slate-100 text-[11px] font-bold text-slate-600 p-3 border-b border-slate-200 items-center">
                      <div className="col-span-4">Parameter / Lever</div>
                      <div className="col-span-3 text-slate-500">Snapshot A (Baseline)</div>
                      <div className="col-span-3 text-indigo-700">Snapshot B (Comparison)</div>
                      <div className="col-span-2 text-right">Delta Shift</div>
                    </div>

                    {/* Table Rows */}
                    <div className="divide-y divide-slate-200">
                      {parameterList.map((param) => {
                        const diff = param.isDifferent;

                        return (
                          <div
                            key={param.id}
                            className={`grid grid-cols-12 gap-2 p-3 text-xs items-center transition-colors ${
                              diff
                                ? 'bg-amber-50/40 hover:bg-amber-50/70'
                                : 'bg-white hover:bg-slate-50'
                            }`}
                          >
                            {/* Parameter Label */}
                            <div className="col-span-4 flex items-center gap-2 min-w-0">
                              {diff ? (
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                              ) : (
                                <span className="w-1.5 h-1.5 rounded-full bg-slate-300 shrink-0" />
                              )}
                              <span className={`font-semibold truncate ${diff ? 'text-slate-900' : 'text-slate-600'}`}>
                                {param.label}
                              </span>
                            </div>

                            {/* Snapshot A Value */}
                            <div className="col-span-3 font-mono text-slate-700 tabular-nums whitespace-nowrap">
                              <span className="px-2 py-0.5 bg-slate-100 rounded border border-slate-200/80">
                                {param.valADisplay}
                              </span>
                            </div>

                            {/* Snapshot B Value */}
                            <div className="col-span-3 font-mono font-semibold text-slate-900 tabular-nums whitespace-nowrap">
                              <span
                                className={`px-2 py-0.5 rounded border ${
                                  diff
                                    ? 'bg-amber-100/70 border-amber-300 text-amber-950 font-bold'
                                    : 'bg-slate-100 border-slate-200/80 text-slate-700'
                                }`}
                              >
                                {param.valBDisplay}
                              </span>
                            </div>

                            {/* Delta Highlight */}
                            <div className="col-span-2 text-right font-mono font-bold tabular-nums whitespace-nowrap">
                              {diff ? (
                                <span
                                  className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded text-[11px] ${
                                    param.numericDelta !== undefined && param.numericDelta > 0
                                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                      : param.numericDelta !== undefined && param.numericDelta < 0
                                      ? 'bg-orange-50 text-orange-700 border border-orange-200'
                                      : 'bg-slate-100 text-slate-700 border border-slate-200'
                                  }`}
                                >
                                  {param.numericDelta !== undefined ? (
                                    <>
                                      {param.numericDelta > 0 ? '+' : ''}
                                      {param.numericDelta}
                                      {param.unit ? ` ${param.unit}` : ''}
                                    </>
                                  ) : (
                                    'Modified'
                                  )}
                                </span>
                              ) : (
                                <span className="text-slate-400 font-normal text-[11px]">—</span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-slate-400 shrink-0" />
            <span>
              Tip: Click <strong>Restore</strong> on either snapshot to apply its exact parameters to your active scenario workspace.
            </span>
          </div>

          <div className="flex items-center gap-2">
            {snapshotAId !== 'current' && (
              <button
                onClick={() => handleRestoreSelected(snapshotAId)}
                className="px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg font-semibold text-slate-800 transition-colors shadow-2xs"
              >
                Revert to Snapshot A
              </button>
            )}

            {snapshotBId !== 'current' && (
              <button
                onClick={() => handleRestoreSelected(snapshotBId)}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold transition-colors shadow-2xs"
              >
                Revert to Snapshot B
              </button>
            )}

            <button
              onClick={onClose}
              className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-semibold transition-colors shadow-2xs"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
