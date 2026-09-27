import React from "react";
import { ReleaseStatus } from "@/lib/steps";
import { Clock, PlayCircle, CheckCircle2 } from "lucide-react";

interface StatusBadgeProps {
  status: ReleaseStatus | string;
  size?: "sm" | "md" | "lg";
}

export function StatusBadge({ status, size = "md" }: StatusBadgeProps) {
  const normalizedStatus = status.toLowerCase() as ReleaseStatus;

  let badgeStyle = "badge-planned";
  let icon = <Clock className="w-3.5 h-3.5 mr-1.5 text-blue-400" />;
  let label = "Planned";

  if (normalizedStatus === "ongoing") {
    badgeStyle = "badge-ongoing";
    icon = <PlayCircle className="w-3.5 h-3.5 mr-1.5 text-amber-400 animate-pulse" />;
    label = "Ongoing";
  } else if (normalizedStatus === "done") {
    badgeStyle = "badge-done";
    icon = <CheckCircle2 className="w-3.5 h-3.5 mr-1.5 text-emerald-400" />;
    label = "Done";
  }

  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs font-semibold",
    md: "px-3 py-1 text-xs font-semibold",
    lg: "px-3.5 py-1.5 text-sm font-bold",
  };

  return (
    <span className={`inline-flex items-center rounded-full border transition-all duration-300 ${badgeStyle} ${sizeClasses[size]}`}>
      {icon}
      <span>{label}</span>
    </span>
  );
}
