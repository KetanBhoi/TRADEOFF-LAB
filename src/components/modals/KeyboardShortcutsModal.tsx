import React, { useEffect } from 'react';
import { Keyboard, X } from 'lucide-react';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
  pinnedLabels: string[];
}

export const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({
  isOpen,
  onClose,
  pinnedLabels,
}) => {
  useEffect(() => {
    if (!isOpen) return;
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onEsc);
    return () => window.removeEventListener('keydown', onEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const shortcuts = [
    { keys: 'J', desc: 'Open / close Spotlight module & live NSE stock jump modal' },
    { keys: '?', desc: 'Show / hide this Keyboard Shortcuts cheatsheet' },
    { keys: 'Alt + ← / →', desc: 'Step backward or forward through all 34 modules' },
    { keys: 'Alt + 1 .. 6', desc: 'Jump directly to Pinned Favorite modules 1 through 6' },
    { keys: 'F', desc: 'Pause or resume live 2-second NSE price simulation ticks' },
    { keys: 'Esc', desc: 'Close active overlay or modal' },
  ];

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <Keyboard className="w-4 h-4 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-950">Desk Keyboard Shortcuts</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/70"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="divide-y divide-slate-100 text-xs">
            {shortcuts.map((s) => (
              <div key={s.keys} className="py-2.5 flex items-center justify-between gap-4">
                <span className="text-slate-700">{s.desc}</span>
                <kbd className="px-2 py-1 text-[11px] font-mono font-bold bg-slate-100 text-slate-900 border border-slate-300 rounded-md whitespace-nowrap shrink-0">
                  {s.keys}
                </kbd>
              </div>
            ))}
          </div>

          {pinnedLabels.length > 0 && (
            <div className="pt-3 border-t border-slate-200">
              <span className="text-[11px] font-semibold text-slate-500 block mb-2">
                Your Active Alt + Number Pinned Bindings
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {pinnedLabels.slice(0, 6).map((label, idx) => (
                  <div
                    key={`${idx}-${label}`}
                    className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200"
                  >
                    <span className="truncate font-medium text-slate-800">{label}</span>
                    <kbd className="text-[10px] font-mono font-bold text-indigo-700 ml-2 shrink-0">
                      Alt+{idx + 1}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
