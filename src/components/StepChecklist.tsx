"use client";

import React, { useState } from "react";
import { useMutation } from "@apollo/client";
import { TOGGLE_STEP, GET_RELEASES } from "@/lib/graphql/queries";
import { Check, Loader2, Circle } from "lucide-react";

interface Step {
  id: string;
  name: string;
  description: string;
  completed: boolean;
}

interface StepChecklistProps {
  releaseId: string;
  steps: Step[];
}

export function StepChecklist({ releaseId, steps }: StepChecklistProps) {
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const [toggleStep] = useMutation(TOGGLE_STEP, {
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

  return (
    <div className="space-y-3 mt-4">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Release Steps Checklist
        </h4>
        <span className="text-[11px] text-slate-500 font-medium">
          Click any step to toggle completion state
        </span>
      </div>

      <div className="grid grid-cols-1 gap-2.5">
        {steps.map((step, index) => {
          const isLoading = togglingId === step.id;
          const isDone = Boolean(step.completed);

          return (
            <div
              key={step.id}
              onClick={() => !isLoading && handleToggle(step.id, isDone)}
              className={`group flex items-start gap-3.5 p-3.5 rounded-xl border transition-all duration-200 cursor-pointer select-none ${
                isDone
                  ? "bg-emerald-950/20 border-emerald-500/40 text-slate-200 hover:border-emerald-500/70 hover:bg-emerald-950/30"
                  : "bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-800/60 hover:border-slate-700"
              }`}
            >
              {/* Checkbox Icon Indicator */}
              <div
                className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-all duration-200 ${
                  isLoading
                    ? "border-indigo-400 bg-indigo-500/10 text-indigo-400"
                    : isDone
                    ? "border-emerald-500 bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/30"
                    : "border-slate-600 bg-slate-950/80 group-hover:border-blue-400 text-transparent"
                }`}
              >
                {isLoading ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : isDone ? (
                  <Check className="h-3.5 w-3.5 stroke-[3]" />
                ) : (
                  <Circle className="h-2.5 w-2.5 fill-current opacity-0 group-hover:opacity-40 text-blue-400" />
                )}
              </div>

              {/* Step Title & Description */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`text-sm font-semibold transition-colors duration-200 ${
                      isDone ? "text-emerald-300" : "text-slate-100 group-hover:text-blue-300"
                    }`}
                  >
                    <span className="text-slate-500 mr-2 font-mono text-xs font-normal">
                      #{index + 1}
                    </span>
                    {step.name}
                  </span>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0 ${
                      isDone
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                        : "bg-slate-800 text-slate-400 border border-slate-700/50"
                    }`}
                  >
                    {isDone ? "Completed" : "Pending"}
                  </span>
                </div>

                <p className="text-xs text-slate-400 mt-1 leading-relaxed">{step.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
