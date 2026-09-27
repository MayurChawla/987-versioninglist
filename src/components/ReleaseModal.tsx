"use client";

import React, { useState, useEffect } from "react";
import { useMutation } from "@apollo/client";
import { CREATE_RELEASE, UPDATE_RELEASE, GET_RELEASES } from "@/lib/graphql/queries";
import { X, Calendar, FileText, Tag, Loader2 } from "lucide-react";

interface ReleaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingRelease?: {
    id: string;
    name: string;
    date: string;
    additionalInfo?: string | null;
  } | null;
}

export function ReleaseModal({ isOpen, onClose, editingRelease }: ReleaseModalProps) {
  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [additionalInfo, setAdditionalInfo] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const isEditMode = Boolean(editingRelease);

  useEffect(() => {
    if (editingRelease) {
      setName(editingRelease.name || "");
      if (editingRelease.date) {
        const d = new Date(editingRelease.date);
        const isoLocal = d.toISOString().slice(0, 16);
        setDate(isoLocal);
      } else {
        setDate("");
      }
      setAdditionalInfo(editingRelease.additionalInfo || "");
    } else {
      setName("");
      const defaultDate = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16);
      setDate(defaultDate);
      setAdditionalInfo("");
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

    try {
      const formattedDate = new Date(date).toISOString();
      if (isEditMode && editingRelease) {
        await updateRelease({
          variables: {
            id: editingRelease.id,
            input: {
              name: name.trim(),
              date: formattedDate,
              additionalInfo: additionalInfo.trim() || null,
            },
          },
        });
      } else {
        await createRelease({
          variables: {
            input: {
              name: name.trim(),
              date: formattedDate,
              additionalInfo: additionalInfo.trim() || null,
            },
          },
        });
      }
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || "An unexpected error occurred.");
    }
  };

  const isLoading = creating || updating;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-6 relative text-slate-100">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-indigo-300 bg-clip-text text-transparent mb-1">
          {isEditMode ? "Update Release Info" : "Create New Release"}
        </h3>
        <p className="text-xs text-slate-400 mb-5">
          {isEditMode
            ? "Update the release details and additional description notes."
            : "Define target release name, scheduled date, and operational details."}
        </p>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-medium">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-blue-400" />
              Release Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. v2.4.0 Production Deploy"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-indigo-400" />
              Scheduled Release Date <span className="text-red-400">*</span>
            </label>
            <input
              type="datetime-local"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-emerald-400" />
              Additional Information <span className="text-slate-500 font-normal">(Optional)</span>
            </label>
            <textarea
              rows={3}
              placeholder="Notes, deployment instructions, or rollback steps..."
              value={additionalInfo}
              onChange={(e) => setAdditionalInfo(e.target.value)}
              className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition resize-none"
            />
          </div>

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
