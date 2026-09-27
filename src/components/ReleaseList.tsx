"use client";

import React, { useState } from "react";
import { useQuery } from "@apollo/client";
import { GET_RELEASES } from "@/lib/graphql/queries";
import { ReleaseCard } from "./ReleaseCard";
import { ReleaseModal } from "./ReleaseModal";
import {
  Plus,
  Search,
  Layers,
  Clock,
  PlayCircle,
  CheckCircle2,
  RefreshCw,
  Loader2,
  SlidersHorizontal,
} from "lucide-react";

export function ReleaseList() {
  const { data, loading, error, refetch } = useQuery(GET_RELEASES, {
    fetchPolicy: "cache-and-network",
    pollInterval: 2000,
  });

  const [filter, setFilter] = useState<"all" | "planned" | "ongoing" | "done">("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRelease, setEditingRelease] = useState<any | null>(null);
  const [autoStartId, setAutoStartId] = useState<string | null>(null);

  const releases = data?.releases || [];

  const filteredReleases = releases.filter((rel: any) => {
    const matchesFilter = filter === "all" || rel.status.toLowerCase() === filter;
    const matchesSearch =
      rel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (rel.additionalInfo && rel.additionalInfo.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  const plannedCount = releases.filter((r: any) => r.status === "planned").length;
  const ongoingCount = releases.filter((r: any) => r.status === "ongoing").length;
  const doneCount = releases.filter((r: any) => r.status === "done").length;

  const handleOpenCreateModal = () => {
    setEditingRelease(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (rel: any) => {
    setEditingRelease(rel);
    setIsModalOpen(true);
  };

  const handleAutoStartProgress = (id: string) => {
    setAutoStartId(id);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white flex items-center gap-3">
            <span className="p-2 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 shadow-lg shadow-blue-500/30">
              <Layers className="w-6 h-6 text-white" />
            </span>
            Release Checklist Tool
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-xl leading-relaxed">
            Manage software release cycles, configure step checklists, and automate 3-second step completion workflows.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => refetch()}
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition"
            title="Refresh Releases"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-blue-400" : ""}`} />
          </button>

          <button
            onClick={handleOpenCreateModal}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 rounded-xl shadow-lg shadow-blue-600/30 hover:shadow-blue-600/50 transition-all duration-300 transform active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Create New Release</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div
          onClick={() => setFilter("all")}
          className={`p-4 rounded-2xl border cursor-pointer transition-all duration-200 ${
            filter === "all"
              ? "bg-slate-900 border-blue-500/50 shadow-lg shadow-blue-500/10 ring-1 ring-blue-500/40"
              : "bg-slate-900/40 border-slate-800/80 hover:bg-slate-900/70"
          }`}
        >
          <div className="text-xs font-medium text-slate-400 mb-1 flex items-center justify-between">
            <span>Total Releases</span>
            <Layers className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-extrabold text-white">{releases.length}</div>
        </div>

        <div
          onClick={() => setFilter("planned")}
          className={`p-4 rounded-2xl border cursor-pointer transition-all duration-200 ${
            filter === "planned"
              ? "bg-slate-900 border-blue-500/50 shadow-lg shadow-blue-500/10 ring-1 ring-blue-500/40"
              : "bg-slate-900/40 border-slate-800/80 hover:bg-slate-900/70"
          }`}
        >
          <div className="text-xs font-medium text-slate-400 mb-1 flex items-center justify-between">
            <span>Planned</span>
            <Clock className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl font-extrabold text-sky-400">{plannedCount}</div>
        </div>

        <div
          onClick={() => setFilter("ongoing")}
          className={`p-4 rounded-2xl border cursor-pointer transition-all duration-200 ${
            filter === "ongoing"
              ? "bg-slate-900 border-amber-500/50 shadow-lg shadow-amber-500/10 ring-1 ring-amber-500/40"
              : "bg-slate-900/40 border-slate-800/80 hover:bg-slate-900/70"
          }`}
        >
          <div className="text-xs font-medium text-slate-400 mb-1 flex items-center justify-between">
            <span>Ongoing</span>
            <PlayCircle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-extrabold text-amber-400">{ongoingCount}</div>
        </div>

        <div
          onClick={() => setFilter("done")}
          className={`p-4 rounded-2xl border cursor-pointer transition-all duration-200 ${
            filter === "done"
              ? "bg-slate-900 border-emerald-500/50 shadow-lg shadow-emerald-500/10 ring-1 ring-emerald-500/40"
              : "bg-slate-900/40 border-slate-800/80 hover:bg-slate-900/70"
          }`}
        >
          <div className="text-xs font-medium text-slate-400 mb-1 flex items-center justify-between">
            <span>Done</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-400">{doneCount}</div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-6">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search releases by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl bg-slate-900/80 border border-slate-800/80 pl-10 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
          />
        </div>

        <div className="flex items-center gap-1.5 self-start sm:self-auto bg-slate-900/80 border border-slate-800/80 p-1 rounded-xl text-xs">
          <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500 ml-2 mr-1" />
          {(["all", "planned", "ongoing", "done"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3 py-1 rounded-lg font-semibold capitalize transition ${
                filter === tab
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {loading && releases.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-3" />
          <p className="text-sm font-medium">Fetching releases from GraphQL API...</p>
        </div>
      ) : error ? (
        <div className="p-6 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-center">
          <p className="text-sm font-bold text-rose-400 mb-2">Failed to load releases</p>
          <p className="text-xs text-rose-300/80 mb-4">{error.message}</p>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 text-xs font-semibold bg-rose-600 text-white rounded-xl hover:bg-rose-500 transition"
          >
            Retry GraphQL Connection
          </button>
        </div>
      ) : filteredReleases.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 rounded-2xl bg-slate-900/40 border border-slate-800/60 border-dashed text-slate-400 text-center px-4">
          <Layers className="w-12 h-12 text-slate-600 mb-3" />
          <h3 className="text-base font-bold text-slate-300 mb-1">No releases found</h3>
          <p className="text-xs text-slate-500 max-w-sm mb-4">
            {searchTerm
              ? `No release matching "${searchTerm}" found in ${filter} view.`
              : `You don't have any releases in "${filter}" status right now.`}
          </p>
          <button
            onClick={handleOpenCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-xl transition shadow-lg shadow-blue-500/20"
          >
            <Plus className="w-3.5 h-3.5" />
            Create First Release
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredReleases.map((release: any) => (
            <ReleaseCard
              key={release.id}
              release={release}
              onEdit={handleOpenEditModal}
              autoStartId={autoStartId}
            />
          ))}
        </div>
      )}

      <ReleaseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        editingRelease={editingRelease}
        onAutoStartProgress={handleAutoStartProgress}
      />
    </div>
  );
}
