"use client";

import React, { useState, useEffect } from "react";
import { useMutation } from "@apollo/client";
import { CREATE_RELEASE, UPDATE_RELEASE, GET_RELEASES } from "@/lib/graphql/queries";
import { RELEASE_STEPS } from "@/lib/steps";
import { X, Calendar, FileText, Tag, Loader2, Plus, Trash2, Sliders, PlayCircle } from "lucide-react";

interface StepConfig {
  id?: string;
  name: string;
  description: string;
}

interface ReleaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingRelease?: {
    id: string;
    name: string;
    date: string;
    additionalInfo?: string | null;
    steps?: StepConfig[];
  } | null;
  onAutoStartProgress?: (releaseId: string) => void;
}

const PRESET_TEMPLATES = {
  standard: RELEASE_STEPS,
  hotfix: [
    { id: "step-1", name: "Hotfix Code Review", description: "Peer review patch code and pull request." },
    { id: "step-2", name: "Unit & Regression Tests", description: "Run regression test suite against patch build." },
    { id: "step-3", name: "Production Deployment", description: "Deploy emergency fix to production." },
    { id: "step-4", name: "Smoke Test & Verification", description: "Verify issue resolution in production environment." },
  ],
};

export function ReleaseModal({ isOpen, onClose, editingRelease, onAutoStartProgress }: ReleaseModalProps) {
  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [additionalInfo, setAdditionalInfo] = useState("");
  const [stepsConfig, setStepsConfig] = useState<StepConfig[]>(RELEASE_STEPS);
  const [autoStart, setAutoStart] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const isEditMode = Boolean(editingRelease);

  useEffect(() => {
    if (editingRelease) {
      setName(editingRelease.name || "");
      if (editingRelease.date) {
        const d = new Date(editingRelease.date);
        setDate(d.toISOString().slice(0, 16));
      } else {
        setDate("");
      }
      setAdditionalInfo(editingRelease.additionalInfo || "");
      setStepsConfig(editingRelease.steps && editingRelease.steps.length > 0 ? editingRelease.steps : RELEASE_STEPS);
    } else {
      setName("");
      const defaultDate = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16);
      setDate(defaultDate);
      setAdditionalInfo("");
      setStepsConfig(RELEASE_STEPS);
      setAutoStart(true);
    }
    setErrorMsg("");
  }, [editingRelease, isOpen]);

  const [createRelease, { loading: creating }] = useMutation(CREATE_RELEASE, {
    refetchQueries: [{ query: GET_RELEASES }],
  });

  const [updateRelease, { loading: updating }] = useMutation(UPDATE_RELEASE, {
    refetchQueries: [{ query: GET_RELEASES }],
  });

  if (!isOpen) return null;

  const handleAddStep = () => {
    setStepsConfig([
      ...stepsConfig,
      {
        id: `step-${stepsConfig.length + 1}`,
        name: `Custom Step ${stepsConfig.length + 1}`,
        description: "New custom step description",
      },
    ]);
  };

  const handleRemoveStep = (index: number) => {
    if (stepsConfig.length <= 1) {
      setErrorMsg("A release must have at least 1 step.");
      return;
    }
    setStepsConfig(stepsConfig.filter((_, i) => i !== index));
  };

  const handleStepChange = (index: number, field: "name" | "description", value: string) => {
    const updated = [...stepsConfig];
    updated[index] = { ...updated[index], [field]: value };
    setStepsConfig(updated);
  };

  const handleLoadPreset = (preset: "standard" | "hotfix") => {
    setStepsConfig(PRESET_TEMPLATES[preset]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!name.trim()) {
      setErrorMsg("Release name is mandatory.");
      return;
    }
    if (!date) {
      setErrorMsg("Release date is mandatory.");
      return;
    }
    if (stepsConfig.length === 0) {
      setErrorMsg("Please configure at least 1 step for this release.");
      return;
    }

    try {
      const formattedDate = new Date(date).toISOString();
      const formattedStepsConfig = stepsConfig.map((s, i) => ({
        id: s.id || `step-${i + 1}`,
        name: s.name.trim(),
        description: s.description ? s.description.trim() : "",
      }));

      if (isEditMode && editingRelease) {
        await updateRelease({
          variables: {
            id: editingRelease.id,
            input: {
              name: name.trim(),
              date: formattedDate,
              additionalInfo: additionalInfo.trim() || null,
              stepsConfig: formattedStepsConfig,
            },
          },
        });
      } else {
        const res = await createRelease({
          variables: {
            input: {
              name: name.trim(),
              date: formattedDate,
              additionalInfo: additionalInfo.trim() || null,
              stepsConfig: formattedStepsConfig,
              autoProgress: autoStart,
            },
          },
        });

        const newId = res.data?.createRelease?.id;
        if (newId && autoStart && onAutoStartProgress) {
          setTimeout(() => {
            onAutoStartProgress(newId);
          }, 300);
        }
      }
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || "An unexpected error occurred.");
    }
  };

  const isLoading = creating || updating;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-3 sm:p-6 animate-in fade-in duration-200 overflow-hidden">
      <div className="w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-5 sm:p-6 relative text-slate-100 overflow-hidden">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-800 transition z-10"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="shrink-0 pr-8">
          <h3 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-blue-400 via-indigo-300 to-teal-300 bg-clip-text text-transparent mb-1">
            {isEditMode ? "Update Release & Configurable Steps" : "Create New Configurable Release"}
          </h3>
          <p className="text-xs text-slate-400 mb-4">
            Define release details, customize step checklist items, and trigger automated 3-second completion progression.
          </p>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-medium shrink-0">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0 space-y-4 overflow-y-auto pr-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-blue-400" />
                Release Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. v2.6.0 Feature Release"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                Scheduled Date <span className="text-red-400">*</span>
              </label>
              <input
                type="datetime-local"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500 transition"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-emerald-400" />
              Additional Notes <span className="text-slate-500 font-normal">(Optional)</span>
            </label>
            <input
              type="text"
              placeholder="Deploy instructions or release notes..."
              value={additionalInfo}
              onChange={(e) => setAdditionalInfo(e.target.value)}
              className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
            />
          </div>

          <div className="pt-2 border-t border-slate-800/80">
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5 uppercase tracking-wider">
                <Sliders className="w-3.5 h-3.5 text-amber-400" />
                Configurable Release Steps ({stepsConfig.length} Steps)
              </label>

              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-500 font-medium">Preset:</span>
                <button
                  type="button"
                  onClick={() => handleLoadPreset("standard")}
                  className="px-2.5 py-1 text-[11px] font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition"
                >
                  Standard (8)
                </button>
                <button
                  type="button"
                  onClick={() => handleLoadPreset("hotfix")}
                  className="px-2.5 py-1 text-[11px] font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition"
                >
                  Hotfix (4)
                </button>
              </div>
            </div>

            <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
              {stepsConfig.map((step, idx) => (
                <div key={idx} className="flex items-start gap-2 p-2.5 bg-slate-950/70 border border-slate-800/70 rounded-xl">
                  <span className="text-xs font-mono font-bold text-slate-500 mt-2">#{idx + 1}</span>
                  <div className="flex-1 space-y-1.5">
                    <input
                      type="text"
                      placeholder="Step Title"
                      value={step.name}
                      onChange={(e) => handleStepChange(idx, "name", e.target.value)}
                      className="w-full rounded-lg bg-slate-900 border border-slate-800 px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500 font-medium"
                      required
                    />
                    <input
                      type="text"
                      placeholder="Step Description"
                      value={step.description}
                      onChange={(e) => handleStepChange(idx, "description", e.target.value)}
                      className="w-full rounded-lg bg-slate-900 border border-slate-800 px-2.5 py-1 text-[11px] text-slate-400 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveStep(idx)}
                    className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition mt-1"
                    title="Remove step"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={handleAddStep}
              className="mt-2.5 inline-flex items-center gap-1.5 text-xs font-semibold text-blue-400 hover:text-blue-300 px-3 py-1.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Custom Step
            </button>
          </div>

          {!isEditMode && (
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <PlayCircle className="w-4 h-4 text-amber-400 shrink-0 animate-pulse" />
                <div>
                  <div className="text-xs font-bold text-amber-300">Auto-Run Step Progression (3s Cadence)</div>
                  <div className="text-[11px] text-amber-200/70">
                    Starts unchecked (0 completed), then completes each step every 3 seconds automatically.
                  </div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={autoStart}
                onChange={(e) => setAutoStart(e.target.checked)}
                className="w-4 h-4 rounded border-amber-500 text-amber-500 focus:ring-amber-500 bg-slate-900 cursor-pointer"
              />
            </div>
          )}

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-slate-100 hover:bg-slate-800 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 rounded-xl shadow-lg shadow-blue-500/20 transition duration-200 disabled:opacity-50"
            >
              {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              {isEditMode ? "Save Changes" : "Create Release"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
