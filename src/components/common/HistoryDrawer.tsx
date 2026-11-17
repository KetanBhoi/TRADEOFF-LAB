import React from 'react';
import { ScenarioHistorySnapshot, ScenarioId } from '../../types';
import { areParamsEqual } from '../../utils/historyUtils';
import { X, History, RotateCcw, Clock, Trash2, BookmarkPlus, Check, ChevronRight, Columns } from 'lucide-react';

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  history: ScenarioHistorySnapshot[];
  activeScenario: ScenarioId;
  currentParams: unknown;
  onRestore: (snapshot: ScenarioHistorySnapshot) => void;
  onClearHistory: () => void;
  onSaveManualSnapshot: () => void;
  onOpenSplitView?: () => void;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  onClose,
  history,
  activeScenario,
  currentParams,
  onRestore,
  onClearHistory,
  onSaveManualSnapshot,
  onOpenSplitView,
}) => {
  if (!isOpen) return null;

  // Filter history for current scenario, or show all with current scenario prioritized
  const currentScenarioHistory = history.filter((h) => h.scenarioId === activeScenario).slice(0, 5);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end bg-slate-900/40 backdrop-blur-xs">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col border-l border-slate-200">
        {/* Drawer Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center text-orange-700">
              <History className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Configuration History
              </h3>
              <p className="text-xs text-slate-500">
                Tracked last 5 states for <span className="font-semibold capitalize text-slate-700">{activeScenario}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
            title="Close history panel (Press 'Esc' or 'H')"
          >
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono font-bold bg-white text-slate-600 border border-slate-300 rounded shadow-2xs">
              Esc
            </kbd>
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action bar: Bookmark current state, Split-View comparison, & Clear */}
        <div className="px-5 py-3 border-b border-slate-200 bg-white flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <button
              onClick={onSaveManualSnapshot}
              className="flex items-center gap-1.5 py-1.5 px-3 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition-colors shadow-2xs"
              title="Save current slider values as an explicit checkpoint"
            >
              <BookmarkPlus className="w-3.5 h-3.5" />
              <span>Bookmark</span>
            </button>

            {onOpenSplitView && (
              <button
                onClick={onOpenSplitView}
                className="flex items-center gap-1.5 py-1.5 px-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg text-xs font-semibold transition-colors shadow-2xs"
                title="Open side-by-side snapshot comparison with delta highlighting"
              >
                <Columns className="w-3.5 h-3.5 text-indigo-600" />
                <span>Split Compare</span>
              </button>
            )}
          </div>

          {currentScenarioHistory.length > 0 && (
            <button
              onClick={onClearHistory}
              className="flex items-center gap-1 py-1.5 px-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg text-xs font-medium transition-colors"
              title="Clear tracked history entries"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          )}
        </div>

        {/* History List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {currentScenarioHistory.length === 0 ? (
            <div className="p-8 text-center space-y-3 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
              <Clock className="w-8 h-8 text-slate-400 mx-auto stroke-[1.5]" />
              <div className="text-sm font-semibold text-slate-800">
                No Tracked States Yet
              </div>
              <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
                As you adjust sliders in the active scenario, your previous configurations will be recorded here automatically (up to the last 5 states) so you can revert anytime.
              </p>
              <button
                onClick={onSaveManualSnapshot}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-orange-700 hover:underline pt-1"
              >
                <span>Save current state now</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            currentScenarioHistory.map((item, idx) => {
              const isCurrent = areParamsEqual(currentParams, item.params);

              return (
                <div
                  key={item.id}
                  className={`p-4 rounded-xl border transition-all space-y-2.5 ${
                    isCurrent
                      ? 'border-orange-400 bg-orange-50/30 ring-1 ring-orange-200 shadow-2xs'
                      : 'border-slate-200 bg-white hover:border-slate-300 shadow-xs'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-400">
                        #{idx + 1}
                      </span>
                      <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>{item.timeFormatted}</span>
                      </span>
                    </div>

                    {isCurrent ? (
                      <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
                        <Check className="w-3 h-3 text-emerald-600" />
                        <span>Current</span>
                      </span>
                    ) : (
                      <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                        {item.primaryMetric}
                      </span>
                    )}
                  </div>

                  {/* Key highlights text without pills */}
                  <div className="text-xs text-slate-700 leading-relaxed font-mono text-[11px] bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    {item.keyHighlights}
                  </div>

                  {/* Revert Action */}
                  <div className="pt-1 flex items-center justify-between">
                    <span className="text-[11px] text-slate-500">
                      Outcome: <strong className="text-slate-800 font-mono">{item.primaryMetric}</strong>
                    </span>

                    <button
                      onClick={() => onRestore(item)}
                      disabled={isCurrent}
                      className={`flex items-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-semibold transition-colors ${
                        isCurrent
                          ? 'opacity-40 pointer-events-none text-slate-400 bg-slate-100'
                          : 'bg-slate-900 hover:bg-slate-800 text-white shadow-2xs'
                      }`}
                      title="Revert back to this configuration"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>{isCurrent ? 'Active State' : 'Revert to This'}</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Drawer Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <span>Max 5 configurations preserved</span>
          <button
            onClick={onClose}
            className="py-1.5 px-3 bg-slate-200 hover:bg-slate-300 rounded font-medium text-slate-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
