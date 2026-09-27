"use client";

import React, { useState } from "react";
import { useMutation } from "@apollo/client";
import { TOGGLE_STEP, GET_RELEASES } from "@/lib/graphql/queries";
import { Check, Loader2 } from "lucide-react";

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
    <div className="space-y-2 mt-4">
      <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
        Release Steps Checklist
      </h4>
      <div className="grid grid-cols-1 gap-2">
        {steps.map((step, index) => {
          const isLoading = togglingId === step.id;
          const isDone = Boolean(step.completed);

          return (
            <div
              key={step.id}
              onClick={() => !isLoading && handleToggle(step.id, isDone)}
              className={`group flex items-start gap-3 p-3 rounded-xl border transition-all duration-200 cursor-pointer select-none ${
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
