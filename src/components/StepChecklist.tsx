"use client";

import React, { useState, useEffect } from "react";
import { useMutation } from "@apollo/client";
import {
  TOGGLE_STEP,
  RESET_RELEASE_STEPS,
  START_AUTO_PROGRESS,
  STOP_AUTO_PROGRESS,
  GET_RELEASES,
} from "@/lib/graphql/queries";
import { Check, Loader2, Play, Pause, RefreshCw, Zap } from "lucide-react";

interface Step {
  id: string;
  name: string;
  description: string;
  completed: boolean;
}

interface StepChecklistProps {
  releaseId: string;
  steps: Step[];
  isAutoProgressing?: boolean;
  autoStart?: boolean;
}

export function StepChecklist({
  releaseId,
  steps,
  isAutoProgressing = false,
  autoStart,
}: StepChecklistProps) {
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const [toggleStep] = useMutation(TOGGLE_STEP, {
    refetchQueries: [{ query: GET_RELEASES }],
  });

  const [resetReleaseSteps] = useMutation(RESET_RELEASE_STEPS, {
    refetchQueries: [{ query: GET_RELEASES }],
  });

  const [startAutoProgress, { loading: startingAuto }] = useMutation(START_AUTO_PROGRESS, {
    refetchQueries: [{ query: GET_RELEASES }],
  });

  const [stopAutoProgress, { loading: stoppingAuto }] = useMutation(STOP_AUTO_PROGRESS, {
    refetchQueries: [{ query: GET_RELEASES }],
  });

  const handleToggle = async (stepId: string, currentCompleted: boolean) => {
    setTogglingId(stepId);
    try {
      await toggleStep({
        variables: {
          releaseId,
          stepId,
          completed: !currentCompleted,
        },
      });
    } catch (err) {
      console.error("Failed to toggle step:", err);
    } finally {
      setTogglingId(null);
    }
  };

  const handleReset = async () => {
    try {
      await resetReleaseSteps({
        variables: { releaseId },
      });
    } catch (err) {
      console.error("Failed to reset release steps:", err);
    }
  };

  const handleStartAutoRun = async () => {
    try {
      // If all steps are already completed, reset first
      const allCompleted = steps.length > 0 && steps.every((s) => s.completed);
      if (allCompleted) {
        await resetReleaseSteps({ variables: { releaseId } });
      }
      await startAutoProgress({ variables: { releaseId } });
    } catch (err) {
      console.error("Failed to start backend auto progress:", err);
    }
  };

  const handleStopAutoRun = async () => {
    try {
      await stopAutoProgress({ variables: { releaseId } });
    } catch (err) {
      console.error("Failed to stop backend auto progress:", err);
    }
  };

  useEffect(() => {
    if (autoStart && !isAutoProgressing) {
      handleStartAutoRun();
    }
  }, [autoStart]);

  const isBusy = startingAuto || stoppingAuto;

  return (
    <div className="space-y-3 mt-4">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Release Steps Checklist
          </h4>
          {isAutoProgressing && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/30 rounded-full animate-pulse">
              <Zap className="w-3 h-3 fill-amber-400" />
              Backend Auto-Progressing (3s)
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold text-slate-400 hover:text-slate-200 bg-slate-800/60 hover:bg-slate-800 rounded-lg border border-slate-700/50 transition"
            title="Reset all steps to unchecked"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Reset Unchecked</span>
          </button>

          {isAutoProgressing ? (
            <button
              type="button"
              onClick={handleStopAutoRun}
              disabled={isBusy}
              className="inline-flex items-center gap-1.5 px-3 py-1 text-[11px] font-bold text-white bg-rose-600 hover:bg-rose-500 rounded-lg transition shadow-sm shadow-rose-600/20 disabled:opacity-50"
            >
              {stoppingAuto ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <Pause className="w-3 h-3 fill-current" />
              )}
              <span>Pause Auto-Run</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleStartAutoRun}
              disabled={isBusy}
              className="inline-flex items-center gap-1.5 px-3 py-1 text-[11px] font-bold text-white bg-gradient-to-r from-amber-600 to-indigo-600 hover:from-amber-500 hover:to-indigo-500 rounded-lg transition shadow-sm shadow-amber-500/20 disabled:opacity-50"
            >
              {startingAuto ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <Play className="w-3 h-3 fill-current" />
              )}
              <span>Auto-Run Steps (3s)</span>
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-2.5">
        {steps.map((step, index) => {
          const isLoading = togglingId === step.id;
          const isDone = Boolean(step.completed);

          return (
            <div
              key={step.id}
              onClick={() => !isLoading && handleToggle(step.id, isDone)}
              className={`group flex items-start gap-3.5 p-3 rounded-xl border transition-all duration-200 cursor-pointer select-none ${
                isDone
                  ? "bg-slate-900/60 border-emerald-500/30 text-slate-300 hover:border-emerald-500/50"
                  : "bg-slate-900/30 border-slate-800 text-slate-400 hover:bg-slate-800/40 hover:border-slate-700"
              }`}
            >
              {/* Checkbox Icon */}
              <div
                className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-all duration-200 ${
                  isLoading
                    ? "border-indigo-400 bg-indigo-500/10 text-indigo-400"
                    : isDone
                    ? "border-emerald-500 bg-emerald-500 text-slate-950 font-bold shadow-sm shadow-emerald-500/30"
                    : "border-slate-600 bg-slate-800/80 group-hover:border-slate-500 text-transparent"
                }`}
              >
                {isLoading ? (
                  <Loader2 className="h-3 w-3 animate-spin text-indigo-400" />
                ) : isDone ? (
                  <Check className="h-3.5 w-3.5 stroke-[3]" />
                ) : null}
              </div>

              {/* Step Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span
                    className={`text-sm font-medium transition-all duration-200 ${
                      isDone ? "line-through text-slate-400" : "text-slate-100 no-underline font-semibold"
                    }`}
                  >
                    <span className="text-slate-500 mr-2 font-mono text-xs no-underline">
                      #{index + 1}
                    </span>
                    {step.name}
                  </span>
                </div>
                <p
                  className={`text-xs mt-0.5 leading-relaxed transition-colors ${
                    isDone ? "text-slate-500 line-through" : "text-slate-400 no-underline"
                  }`}
                >
                  {step.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

