import React from "react";

interface ProgressBarProps {
  completed: number;
  total: number;
}

export function ProgressBar({ completed, total }: ProgressBarProps) {
  const percentage = Math.round((completed / Math.max(total, 1)) * 100);

  let barColorClass = "bg-gradient-to-r from-blue-500 to-cyan-400";
  if (percentage > 0 && percentage < 100) {
    barColorClass = "bg-gradient-to-r from-amber-500 to-indigo-500";
  } else if (percentage === 100) {
    barColorClass = "bg-gradient-to-r from-emerald-500 to-teal-400";
  }

  return (
    <div className="w-full">
      <div className="flex justify-between items-center text-xs text-slate-400 mb-1.5 font-medium">
        <span>Completion Progress</span>
        <span className="font-semibold text-slate-200">
          {completed} of {total} steps ({percentage}%)
        </span>
      </div>
      <div className="w-full h-2.5 bg-slate-800/80 rounded-full overflow-hidden p-0.5 border border-slate-700/50 shadow-inner">
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${barColorClass}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
