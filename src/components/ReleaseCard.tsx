"use client";

import React, { useState } from "react";
import { useMutation } from "@apollo/client";
import { DELETE_RELEASE, GET_RELEASES } from "@/lib/graphql/queries";
import { StatusBadge } from "./StatusBadge";
import { ProgressBar } from "./ProgressBar";
import { StepChecklist } from "./StepChecklist";
import {
  Calendar,
  ChevronDown,
  ChevronUp,
  Edit3,
  Trash2,
  FileText,
  AlertTriangle,
  Loader2,
} from "lucide-react";

interface ReleaseCardProps {
  release: {
    id: string;
    name: string;
    date: string;
    additionalInfo?: string | null;
    completedSteps: string[];
    status: string;
    totalSteps: number;
    completedCount: number;
    isAutoProgressing?: boolean;
    steps: {
      id: string;
      name: string;
      description: string;
      completed: boolean;
    }[];
  };
  onEdit: (release: any) => void;
  autoStartId?: string | null;
}

export function ReleaseCard({ release, onEdit, autoStartId }: ReleaseCardProps) {
  const [isExpanded, setIsExpanded] = useState(autoStartId === release.id);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  const [deleteRelease, { loading: isDeleting }] = useMutation(DELETE_RELEASE, {
    refetchQueries: [{ query: GET_RELEASES }],
  });

  const handleDelete = async () => {
    try {
      await deleteRelease({ variables: { id: release.id } });
      setShowConfirmDelete(false);
    } catch (err) {
      console.error("Failed to delete release:", err);
    }
  };

  const formattedDate = new Date(release.date).toLocaleDateString("en-US", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className={`group rounded-2xl bg-slate-900/80 border transition-all duration-300 overflow-hidden backdrop-blur-md ${
      release.isAutoProgressing ? "border-amber-500/50 shadow-amber-500/10 shadow-xl" : "border-slate-800/80 shadow-lg hover:border-slate-700/80"
    }`}>
      <div className="p-5 md:p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h3 className="text-lg font-bold text-slate-100 group-hover:text-blue-400 transition-colors">
                {release.name}
              </h3>
              <StatusBadge status={release.status} />
              {release.isAutoProgressing && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-bold text-amber-300 bg-amber-500/20 border border-amber-500/40 rounded-full animate-pulse">
                  ⚡ Auto-Running (3s)
                </span>
              )}
            </div>
            <div className="flex items-center text-xs text-slate-400 gap-1.5 mt-1">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <span>Target Date: <strong className="text-slate-300 font-medium">{formattedDate}</strong></span>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end md:self-auto">
            <button
              onClick={() => onEdit(release)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800/60 hover:bg-slate-800 rounded-lg border border-slate-700/50 transition"
              title="Edit release details & steps"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit</span>
            </button>
            <button
              onClick={() => setShowConfirmDelete(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 rounded-lg border border-rose-500/20 transition"
              title="Delete release"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete</span>
            </button>
          </div>
        </div>

        {release.additionalInfo && (
          <div className="mb-4 p-3 rounded-xl bg-slate-950/60 border border-slate-800/60 text-xs text-slate-300 flex items-start gap-2">
            <FileText className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
            <p className="leading-relaxed whitespace-pre-wrap">{release.additionalInfo}</p>
          </div>
        )}

        <div className="my-3">
          <ProgressBar completed={release.completedCount} total={release.totalSteps} />
        </div>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full mt-4 py-2 px-3 rounded-xl bg-slate-950/40 hover:bg-slate-800/40 border border-slate-800/80 text-xs font-semibold text-slate-300 flex items-center justify-between transition"
        >
          <span className="flex items-center gap-2">
            <span>{isExpanded ? "Hide Steps Checklist" : "View & Manage Steps Checklist"}</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
              {release.completedCount}/{release.totalSteps} Done
            </span>
          </span>
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {isExpanded && (
          <div className="animate-in fade-in slide-in-from-top-2 duration-200">
            <StepChecklist
              releaseId={release.id}
              steps={release.steps}
              isAutoProgressing={release.isAutoProgressing}
              autoStart={autoStartId === release.id}
            />
          </div>
        )}
      </div>

      {showConfirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-6 text-slate-100 shadow-2xl">
            <div className="flex items-center gap-3 text-rose-400 mb-3">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h4 className="text-lg font-bold">Confirm Release Deletion</h4>
            </div>
            <p className="text-xs text-slate-300 mb-6 leading-relaxed">
              Are you sure you want to delete <strong className="text-white">"{release.name}"</strong>? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowConfirmDelete(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 rounded-xl shadow-lg shadow-rose-600/30 disabled:opacity-50"
              >
                {isDeleting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Delete Release
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
