import React, { useState } from 'react';
import {
  ScenarioId,
  AnyScenarioParams,
} from '../../types';
import {
  PRESET_ARCHETYPES,
  ArchetypePreset,
  getSavedCustomPresets,
  saveUserCustomPreset,
  deleteUserCustomPreset,
} from '../../utils/archetypePresets';
import { Bookmark, Sparkles, Plus, Trash2, Check, X, ArrowRight, FolderKanban } from 'lucide-react';

interface PresetsModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeScenario: ScenarioId;
  currentParams: AnyScenarioParams;
  onLoadPreset: (params: any) => void;
}

export const PresetsModal: React.FC<PresetsModalProps> = ({
  isOpen,
  onClose,
  activeScenario,
  currentParams,
  onLoadPreset,
}) => {
  const [newPresetName, setNewPresetName] = useState('');
  const [newPresetDesc, setNewPresetDesc] = useState('');
  const [showSaveForm, setShowSaveForm] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  if (!isOpen) return null;

  // Filter built-in presets by active scenario
  const scenarioPresets = PRESET_ARCHETYPES.filter((p) => p.scenarioId === activeScenario);

  // Get user-saved presets for this scenario
  const userSavedPresets = getSavedCustomPresets().filter((p) => p.scenarioId === activeScenario);

  const handleSaveCurrent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPresetName.trim()) return;

    saveUserCustomPreset(activeScenario, newPresetName.trim(), currentParams, newPresetDesc.trim());
    setNewPresetName('');
    setNewPresetDesc('');
    setShowSaveForm(false);
    setRefreshTrigger((k) => k + 1);
  };

  const handleDelete = (id: string) => {
    deleteUserCustomPreset(id);
    setRefreshTrigger((k) => k + 1);
  };

  const handleSelect = (params: any) => {
    onLoadPreset(params);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between gap-4 bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-xs">
              <FolderKanban className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">
                  Scenario Archetype Profiles & Presets
                </h3>
                <span className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider bg-slate-100 text-slate-700 rounded border border-slate-200">
                  {scenarioPresets.length + userSavedPresets.length} AVAILABLE
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Load battle-tested real-world profiles or bookmark your custom configurations
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSaveForm(!showSaveForm)}
              className="px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg flex items-center gap-1.5 transition-colors shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5 text-orange-600" />
              <span>Save Current</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {/* Inline Save Form */}
          {showSaveForm && (
            <form
              onSubmit={handleSaveCurrent}
              className="p-4 rounded-xl bg-orange-50/60 border border-orange-200 space-y-3 animate-in fade-in duration-150"
            >
              <span className="text-xs font-bold text-orange-950 flex items-center gap-1.5">
                <Bookmark className="w-3.5 h-3.5 text-orange-600" />
                <span>Save Current Lever Configuration as a Custom Preset</span>
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Preset Name (e.g. My Conservative Plan)"
                  value={newPresetName}
                  onChange={(e) => setNewPresetName(e.target.value)}
                  className="text-xs p-2 rounded-lg border border-orange-300 bg-white focus:outline-none focus:ring-1 focus:ring-orange-500"
                  required
                />
                <input
                  type="text"
                  placeholder="Brief note or description"
                  value={newPresetDesc}
                  onChange={(e) => setNewPresetDesc(e.target.value)}
                  className="text-xs p-2 rounded-lg border border-orange-300 bg-white focus:outline-none focus:ring-1 focus:ring-orange-500"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowSaveForm(false)}
                  className="px-3 py-1 text-xs text-slate-600 hover:bg-slate-200 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-orange-600 hover:bg-orange-700 rounded-lg flex items-center gap-1 shadow-2xs"
                >
                  <Check className="w-3 h-3" />
                  <span>Save Profile</span>
                </button>
              </div>
            </form>
          )}

          {/* User-Saved Custom Presets Section (if any) */}
          {userSavedPresets.length > 0 && (
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Bookmark className="w-3.5 h-3.5 text-slate-600" />
                <span>Your Custom Saved Presets ({userSavedPresets.length})</span>
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {userSavedPresets.map((preset) => (
                  <div
                    key={preset.id}
                    className="p-4 rounded-xl border border-slate-300 bg-white hover:border-slate-400 transition-all flex flex-col justify-between shadow-2xs"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-slate-900">{preset.name}</span>
                        <button
                          type="button"
                          onClick={() => handleDelete(preset.id)}
                          className="text-slate-400 hover:text-rose-600 p-0.5 rounded"
                          title="Delete saved preset"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1">{preset.description}</p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleSelect(preset.params)}
                      className="mt-3 w-full py-1.5 text-xs font-semibold text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center justify-center gap-1 transition-colors"
                    >
                      <span>Load This Profile</span>
                      <ArrowRight className="w-3 h-3 text-slate-600" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Built-in Realistic Archetypes */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-orange-600" />
              <span>Realistic Life & Industry Archetypes</span>
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {scenarioPresets.map((preset) => (
                <div
                  key={preset.id}
                  className="p-4 rounded-xl border border-slate-200 bg-white hover:border-orange-300 hover:ring-1 hover:ring-orange-200 transition-all flex flex-col justify-between shadow-2xs"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-xs text-slate-900">{preset.name}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border shrink-0 ${preset.badgeColor}`}>
                        {preset.badge}
                      </span>
                    </div>
                    <span className="text-[11px] font-mono text-orange-700 block mt-0.5">
                      {preset.tagline}
                    </span>
                    <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                      {preset.description}
                    </p>
                    <div className="mt-2 text-[10px] text-slate-500 bg-slate-50 p-2 rounded-md border border-slate-100">
                      <strong>Key Tradeoff:</strong> {preset.keyDifferentiator}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleSelect(preset.params)}
                    className="mt-4 w-full py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
                  >
                    <span>Load Archetype Profile</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
