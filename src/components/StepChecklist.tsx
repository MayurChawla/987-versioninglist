"use client";

import React, { useState, useEffect, useRef } from "react";
import { useMutation } from "@apollo/client";
import { TOGGLE_STEP, RESET_RELEASE_STEPS, GET_RELEASES } from "@/lib/graphql/queries";
import { Check, Loader2, Play, RefreshCw } from "lucide-react";

interface Step {
  id: string;
  name: string;
  description: string;
  completed: boolean;
}

interface StepChecklistProps {
  releaseId: string;
  steps: Step[];
  autoStart?: boolean;
}

export function StepChecklist({ releaseId, steps, autoStart }: StepChecklistProps) {
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [isAutoRunning, setIsAutoRunning] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const [toggleStep] = useMutation(TOGGLE_STEP, {
    refetchQueries: [{ query: GET_RELEASES }],
  });

  const [resetReleaseSteps] = useMutation(RESET_RELEASE_STEPS, {
    refetchQueries: [{ query: GET_RELEASES }],
  });

  const stopAutoRun = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsAutoRunning(false);
  };

  useEffect(() => {
    return () => {
      stopAutoRun();
    };
  }, []);

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
    stopAutoRun();
    try {
      await resetReleaseSteps({
        variables: { releaseId },
      });
    } catch (err) {
      console.error("Failed to reset release steps:", err);
    }
  };

  const handleStartAutoRun = async () => {
    stopAutoRun();
    setIsAutoRunning(true);

    // Step 1: First reset whole list to unchecked (not started / 0 completed)
    try {
      await resetReleaseSteps({
        variables: { releaseId },
      });
    } catch (err) {
      console.error("Failed to reset steps before auto run:", err);
    }

    let currentIndex = 0;

    // Step 2: Every 3 seconds, complete the next uncompleted step in order
    timerRef.current = setInterval(async () => {
      if (currentIndex < steps.length) {
        const targetStep = steps[currentIndex];
        if (targetStep) {
          try {
            await toggleStep({
              variables: {
                releaseId,
                stepId: targetStep.id,
                completed: true,
              },
            });
          } catch (e) {
            console.error("Auto step toggle failed:", e);
          }
        }
        currentIndex++;
      } else {
        stopAutoRun();
      }
    }, 3000);
  };

  useEffect(() => {
    if (autoStart) {
      handleStartAutoRun();
    }
  }, [autoStart]);

  return (
    <div className="space-y-3 mt-4">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Release Steps Checklist
        </h4>

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

          <button
            type="button"
            onClick={handleStartAutoRun}
            disabled={isAutoRunning}
            className={`inline-flex items-center gap-1.5 px-3 py-1 text-[11px] font-bold text-white rounded-lg transition shadow-sm ${
              isAutoRunning
                ? "bg-amber-600 animate-pulse cursor-wait"
                : "bg-gradient-to-r from-amber-600 to-indigo-600 hover:from-amber-500 hover:to-indigo-500 shadow-amber-500/20"
            }`}
          >
            {isAutoRunning ? (
              <>
                <Loader2 className="w-3 h-3 animate-spin" />
                <span>Auto-Running (3s Cadence)...</span>
              </>
            ) : (
              <>
                <Play className="w-3 h-3 fill-current" />
                <span>Auto-Run Steps (3s)</span>
              </>
            )}
          </button>
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
