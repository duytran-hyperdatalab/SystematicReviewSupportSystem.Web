import React, { useState, useMemo } from "react";
import {
  Search,
  ChevronDown,
  CheckCircle2,
  Clock,
  Timer,
  RefreshCw
} from "lucide-react";
import { cn } from "../../../utils/cn";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "../../../components/ui/Table";
import Input from "../../../components/ui/Input";
import Button from "../../../components/ui/Button";
import { Card } from "../../../components/ui/Card";
import { motion } from "framer-motion";
import { useParams } from "react-router-dom";
import ReviewerAssignmentModal from "./ReviewerAssignmentModal";
import { useUserProgressOverview } from "../../../hooks/useUsers";
import Pagination from "../../../components/ui/Pagination";
import type { UserProgress } from "../../../types/user";

// --- Sub-components ---

const ProgressBar: React.FC<{ progress: number }> = ({ progress }) => {
  const getBarColor = (val: number) => {
    if (val === 100) return "bg-emerald-500";
    if (val >= 30) return "bg-amber-500";
    return "bg-rose-500";
  };

  return (
    <div className="flex items-center gap-3 w-42">
      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className={cn("h-full rounded-full transition-all", getBarColor(progress))}
        />
      </div>
      <span className="text-xs font-semibold text-slate-600 min-w-[32px]">{progress}%</span>
    </div>
  );
};



const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const getVariant = (s: string) => {
    if (s === "Done" || s === "Completed") return "bg-emerald-50 text-emerald-700 border-emerald-100";
    if (s === "In Progress" || s === "InProgress") return "bg-orange-50 text-orange-700 border-orange-100";
    return "bg-slate-50 text-slate-700 border-slate-100";
  };

  const getIcon = (s: string) => {
    if (s === "Done" || s === "Completed") return <CheckCircle2 size={14} />;
    if (s === "In Progress" || s === "InProgress") return <Timer size={14} />;
    return <Clock size={14} />;
  };

  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border whitespace-nowrap",
      getVariant(status)
    )}>
      {getIcon(status)}
      {status}
    </span>
  );
};

// --- Main Component ---

const ReviewerProgressPage: React.FC = () => {
  const { projectId, screeningProcessId } = useParams<{ projectId: string, screeningProcessId: string }>();
  const [searchTerm, setSearchTerm] = useState("");
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize] = useState(10);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReviewer, setSelectedReviewer] = useState<UserProgress | null>(null);
  const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' } | null>(null);

  const { items: reviewers, data: paginatedData, isLoading, refetch, isFetching } = useUserProgressOverview({
    projectId: projectId || "",
    search: searchTerm,
    pageNumber,
    pageSize
  });

  // Sorting logic (Note: This is now local for the current page, but could be server-side if needed)
  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedData = useMemo(() => {
    if (!reviewers) return [];
    let result = [...reviewers];

    if (sortConfig) {
      result.sort((a, b) => {
        const aValue = a[sortConfig.key as keyof UserProgress] as any;
        const bValue = b[sortConfig.key as keyof UserProgress] as any;
        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [reviewers, sortConfig]);

  const openAssignmentModal = (reviewer: UserProgress) => {
    setSelectedReviewer(reviewer);
    setIsModalOpen(true);
  };

  return (
    <div className="p-8 space-y-8 bg-slate-50/50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight leading-tight">Reviewer Progress</h1>
          <p className="text-slate-500 mt-1 font-medium">Monitor active screening workloads and decision statistics.</p>
        </div>


        <div className="relative group w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
          <Input
            placeholder="Search reviewer..."
            className="pl-10 w-full bg-white border-slate-200 focus:ring-4 focus:ring-indigo-100 transition-all rounded-2xl"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

      </div>

      {/* Synchronized Info & Reload */}
      <div className="flex justify-end items-center gap-3 px-8 translate-y-2 relative z-10">
        <div className="flex items-center gap-2 px-4 py-2 text-slate-400 text-[10px] font-black uppercase tracking-widest">
          <Clock size={12} className="text-slate-400" />
          <span>Last Synchronized: {paginatedData?.items[0]?.lastSynchronizedAt ? new Date(paginatedData.items[0].lastSynchronizedAt).toLocaleString() : new Date().toLocaleTimeString()}</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-9 w-9 p-0 rounded-2xl hover:bg-white hover:text-indigo-600 transition-all shadow-sm border border-slate-200/60 bg-white/50 backdrop-blur-sm flex items-center justify-center group"
          onClick={() => refetch()}
          disabled={isLoading || isFetching}
        >
          <RefreshCw className={cn("size-4 text-slate-500 group-hover:text-indigo-600 transition-colors", isFetching && "animate-spin")} />
        </Button>
      </div>

      {/* Main Table */}
      <Card className="border-none shadow-2xl bg-white/80 backdrop-blur-md rounded-[2.5rem] overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50/30">
            <TableRow className="hover:bg-transparent cursor-default">
              <TableHead className="cursor-pointer px-8" onClick={() => handleSort('reviewerName')}>
                <div className="flex items-center gap-2">
                  Reviewer
                  {sortConfig?.key === 'reviewerName' && (
                    <ChevronDown className={cn("inline-block transform transition-transform", sortConfig.direction === 'desc' ? "rotate-180" : "")} size={14} />
                  )}
                </div>
              </TableHead>

              <TableHead className="text-center">Workload</TableHead>
              <TableHead className="text-center cursor-pointer" onClick={() => handleSort('completed')}>
                <div className="flex items-center justify-center gap-2">
                  Completed
                  {sortConfig?.key === 'completed' && (
                    <ChevronDown className={cn("inline-block transform transition-transform", sortConfig.direction === 'desc' ? "rotate-180" : "")} size={14} />
                  )}
                </div>
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort('progress')}>
                <div className="flex items-center gap-2">
                  Progress
                  {sortConfig?.key === 'progress' && (
                    <ChevronDown className={cn("inline-block transform transition-transform", sortConfig.direction === 'desc' ? "rotate-180" : "")} size={14} />
                  )}
                </div>
              </TableHead>

              <TableHead>Status</TableHead>
              <TableHead className="text-center px-8">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-32">
                  <div className="flex flex-col items-center justify-center">
                    <div className="h-12 w-12 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent mb-4"></div>
                    <p className="text-slate-400 font-medium">Loading reviewer data...</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : sortedData.length > 0 ? (
              sortedData.map((reviewer) => (
                <TableRow
                  key={reviewer.userId}
                  className="group border-b border-slate-50 hover:bg-slate-50/50 transition-all cursor-default"
                >
                  <TableCell className="px-8">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-white font-black text-sm shadow-lg shadow-indigo-200 group-hover:scale-110 transition-transform">
                        {reviewer.fullName.charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold text-slate-700">{reviewer.fullName}</div>
                        <div className="text-[10px] text-slate-400 font-medium">{reviewer.email}</div>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell className="text-center font-bold text-slate-500">
                    {reviewer.workload} papers
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="inline-flex items-center justify-center min-w-[2.5rem] h-10 px-3 rounded-2xl bg-emerald-50 text-emerald-600 font-black text-sm border border-emerald-100 italic shadow-sm">
                      {reviewer.completed}
                    </span>
                  </TableCell>
                  <TableCell>
                    <ProgressBar progress={reviewer.progress} />
                  </TableCell>

                  <TableCell>
                    <StatusBadge status={reviewer.statusText} />
                  </TableCell>
                  <TableCell className="text-center px-8">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-10 px-4 rounded-2xl text-xs font-black uppercase tracking-widest border-2 border-slate-100 hover:border-indigo-600 hover:text-indigo-600 active:scale-95 transition-all"
                      onClick={() => openAssignmentModal(reviewer)}
                    >
                      View Assignment
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-32">
                  <div className="flex flex-col items-center justify-center text-slate-300">
                    <Search size={64} strokeWidth={1} className="mb-6 opacity-40 animate-pulse" />
                    <p className="text-xl font-black tracking-tight text-slate-400">No Reviewers Found</p>
                    <p className="text-sm font-medium mt-2">Try adjusting your filters or search terms.</p>
                    <button
                      onClick={() => { setSearchTerm(""); setPageNumber(1); }}
                      className="mt-6 text-indigo-600 hover:text-indigo-700 text-sm font-black uppercase tracking-widest"
                    >
                      Reset Dashboard
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        {paginatedData && paginatedData.totalPages > 1 && (
          <div className="p-6 border-t border-slate-50 flex justify-center bg-slate-50/30">
            <Pagination
              currentPage={paginatedData.pageNumber}
              totalPages={paginatedData.totalPages}
              onPageChange={setPageNumber}
            />
          </div>
        )}
      </Card>

      {/* Reviewer Detail Modal */}
      <ReviewerAssignmentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        processId={screeningProcessId || ""}
        reviewer={selectedReviewer ? {
          id: selectedReviewer.userId,
          reviewerName: selectedReviewer.fullName,
          assigned: selectedReviewer.workload,
          completed: selectedReviewer.completed,
          inProgress: 0,
          notStarted: 0,
          progress: selectedReviewer.progress,
          status: selectedReviewer.statusText as any,
          phase: "Title/Abstract" as any,
          papers: [] // Now fetched from API
        } : null}
      />

    </div>
  );
};

export default ReviewerProgressPage;

