import React, { useState, useMemo } from 'react';
import { Search, Calendar, Database, AlertCircle, CheckCircle2, XCircle, HelpCircle, Users, Eye } from 'lucide-react';
import { cn } from '../../../utils/cn';
import Input from '../../../components/ui/Input';
import { useInfiniteTitleAbstractAssignmentPapers, useInfiniteFullTextAssignmentPapers, useConflictStatus } from '../../../hooks/useStudySelection';
import type { SelectionPhase } from '../components/StuSePhaseHeaderController';
import { PaperPhase } from '../../../types/studySelection';
import type { GetAssignmentPapersParams, AssignedReviewer } from '../../../types/studySelection';
import AssignedReviewersModal from './AssignedReviewersModal';
import { useParams } from 'react-router-dom';
import { useProjectMember } from '../../../hooks/useProjectMember';
import { useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '../../../constants/queryKeys';

interface PaperListProps {
  studySelectionProcessId: string;
  currentPhase: SelectionPhase;
  selectedPaperId: string | null;
  onSelectPaper: (id: string) => void;
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
  isAssignmentMode: boolean;
}

const statusConfig: Record<string, { icon: any, color: string, bgColor: string, borderColor: string }> = {
  'Pending': { icon: HelpCircle, color: 'text-slate-400', bgColor: 'bg-slate-50', borderColor: 'border-slate-200' },
  'Included': { icon: CheckCircle2, color: 'text-emerald-500', bgColor: 'bg-emerald-50', borderColor: 'border-emerald-200' },
  'Excluded': { icon: XCircle, color: 'text-rose-500', bgColor: 'bg-rose-50', borderColor: 'border-rose-200' },
  'Conflict': { icon: AlertCircle, color: 'text-amber-500', bgColor: 'bg-amber-50', borderColor: 'border-amber-200' },
  'Resolved': { icon: CheckCircle2, color: 'text-indigo-500', bgColor: 'bg-indigo-50', borderColor: 'border-indigo-200' },
};

export const PaperList: React.FC<PaperListProps> = ({
  studySelectionProcessId,
  currentPhase,
  selectedPaperId,
  onSelectPaper,
  selectedIds,
  onSelectionChange,
  isAssignmentMode
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [yearFilter, setYearFilter] = useState<string>('all');
  const [decisionFilter, setDecisionFilter] = useState<string>('0');
  const [assignmentFilter, setAssignmentFilter] = useState<string>('all');
  const [reviewersModal, setReviewersModal] = useState<{ isOpen: boolean; paperTitle: string; reviewers: AssignedReviewer[] }>({
    isOpen: false,
    paperTitle: '',
    reviewers: []
  });
  const pageSize = 20;
  const { projectId } = useParams<{ projectId: string }>();
  const { member } = useProjectMember(projectId);
  const isLeader = member?.role === 1;
  const queryClient = useQueryClient();

  const phaseNum = currentPhase === 'TITLE_ABSTRACT' ? PaperPhase.TitleAbstract : PaperPhase.FullText;

  // Map filters to API params
  const params: GetAssignmentPapersParams = useMemo(() => ({
    search: searchQuery || undefined,
    year: yearFilter !== 'all' ? parseInt(yearFilter) : undefined,
    assignmentStatus: assignmentFilter === 'assigned' ? 1 : assignmentFilter === 'not_assigned' ? 2 : 0,
    decisionStatus: parseInt(decisionFilter),
    pageSize,
  }), [searchQuery, yearFilter, decisionFilter, assignmentFilter]);

  // Use appropriate hook based on phase
  const titleAbstractQuery = useInfiniteTitleAbstractAssignmentPapers(
    studySelectionProcessId,
    params
  );

  const fullTextQuery = useInfiniteFullTextAssignmentPapers(
    studySelectionProcessId,
    params
  );

  const query = currentPhase === 'TITLE_ABSTRACT' ? titleAbstractQuery : fullTextQuery;
  const { data, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage } = query;

  // Conflict Status Polling
  const { data: conflictStatusList } = useConflictStatus(
    studySelectionProcessId,
    phaseNum,
    {
      enabled: !!studySelectionProcessId && isLeader,
      refetchInterval: 10000, // 10 seconds
    }
  );

  const conflictMap = useMemo(() => {
    const map = new Map<string, boolean>();
    conflictStatusList?.forEach(c => map.set(c.paperId, c.hasConflict));
    return map;
  }, [conflictStatusList]);

  const papers = useMemo(() => {
    const basePapers = data?.pages.flatMap(page => page.items) || [];
    return basePapers.map(p => ({
      ...p,
      hasConflict: conflictMap.get(p.id) || false
    }));
  }, [data, conflictMap]);

  const isAllSelected = papers.length > 0 && papers.every(p => selectedIds.includes(p.id));
  const isSomeSelected = papers.some(p => selectedIds.includes(p.id)) && !isAllSelected;

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      const allIds = papers
        .filter(p => !['Included', 'Excluded', 'Resolved'].includes(p.status) && !p.isAssigned)
        .map(p => p.id);
      const newSelectedIds = Array.from(new Set([...selectedIds, ...allIds]));
      onSelectionChange(newSelectedIds);
    } else {
      const currentIds = papers.map(p => p.id);
      const newSelectedIds = selectedIds.filter(id => !currentIds.includes(id));
      onSelectionChange(newSelectedIds);
    }
  };

  const handleSelectPaper = (e: React.ChangeEvent<HTMLInputElement>, id: string) => {
    e.stopPropagation();
    if (e.target.checked) {
      onSelectionChange([...selectedIds, id]);
    } else {
      onSelectionChange(selectedIds.filter(i => i !== id));
    }
  };

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
  };

  const handleFilterChange = (setter: (val: any) => void, val: any) => {
    setter(val);
  };

  const handleViewReviewers = (e: React.MouseEvent, title: string, reviewers: AssignedReviewer[]) => {
    e.stopPropagation();
    setReviewersModal({
      isOpen: true,
      paperTitle: title,
      reviewers: reviewers || []
    });
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    // Fetch more when we are within 200px of the bottom
    if (scrollHeight - scrollTop <= clientHeight + 200 && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
      // Invalidate conflict status on page change to keep it somewhat in sync
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.studySelection.conflictStatus(studySelectionProcessId, phaseNum)
      });
    }
  };

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4 text-center">
        <AlertCircle className="w-8 h-8 text-rose-500 mb-2" />
        <p className="text-sm font-medium text-slate-600">Failed to load papers</p>
        <button
          onClick={() => query.refetch()}
          className="mt-2 text-xs font-bold text-blue-600 hover:underline"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white overflow-hidden">
      {/* Header & Search */}
      <div className="p-4 space-y-4 bg-slate-50/50 border-b border-slate-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {isAssignmentMode && (
              <div className="flex items-center justify-center w-5 h-5">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 accent-blue-600 cursor-pointer"
                  checked={isAllSelected}
                  ref={el => { if (el) el.indeterminate = isSomeSelected; }}
                  onChange={handleSelectAll}
                />
              </div>
            )}
            <h2 className="text-lg font-bold text-slate-800">Papers</h2>
          </div>
          {isAssignmentMode && selectedIds.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full uppercase tracking-widest animate-in fade-in slide-in-from-right-4">
                {selectedIds.length} Selected
              </span>
            </div>
          )}
        </div>

        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
          <Input
            placeholder="Search title or authors..."
            className="pl-10 bg-white border-slate-200 focus:ring-blue-500 focus:border-blue-500 rounded-xl transition-all"
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <select
            className="text-[11px] font-bold p-2 bg-white border border-slate-200 rounded-lg outline-none focus:ring-1 focus:ring-blue-500"
            value={yearFilter}
            onChange={(e) => handleFilterChange(setYearFilter, e.target.value)}
          >
            <option value="all">Years</option>
            {Array.from({ length: new Date().getFullYear() - 1900 + 1 }, (_, i) => new Date().getFullYear() - i).map(y => (
              <option key={y} value={y.toString()}>{y}</option>
            ))}
          </select>

          <select
            className="text-[11px] font-bold p-2 bg-white border border-slate-200 rounded-lg outline-none focus:ring-1 focus:ring-blue-500"
            value={decisionFilter}
            onChange={(e) => handleFilterChange(setDecisionFilter, e.target.value)}
          >
            <option value="0">All Decisions</option>
            <option value="1">Not Decided</option>
            <option value="2">Included</option>
            <option value="3">Excluded</option>
          </select>

          <select
            className="text-[11px] font-bold p-2 bg-white border border-slate-200 rounded-lg outline-none focus:ring-1 focus:ring-blue-500"
            value={assignmentFilter}
            onChange={(e) => handleFilterChange(setAssignmentFilter, e.target.value)}
          >
            <option value="all">All Assignment</option>
            <option value="assigned">Assigned</option>
            <option value="not_assigned">Not Assigned</option>
          </select>
        </div>
      </div>

      {/* List */}
      <div
        className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-2 bg-slate-50/30"
        onScroll={handleScroll}
      >
        {isLoading ? (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-32 bg-slate-100 animate-pulse rounded-2xl" />
            ))}
          </div>
        ) : papers.length > 0 ? (
          papers.map(paper => {
            const status = statusConfig[paper.status] || statusConfig['Pending'];
            const StatusIcon = status.icon;
            const isPaperActive = selectedPaperId === paper.id;
            const isPaperSelected = selectedIds.includes(paper.id);

            return (
              <div
                key={paper.id}
                onClick={() => onSelectPaper(paper.id)}
                className={cn(
                  "group relative p-4 rounded-2xl border transition-all cursor-pointer flex gap-4",
                  isPaperActive
                    ? "bg-white border-blue-200 shadow-md ring-1 ring-blue-500/10"
                    : "bg-white border-slate-200 hover:border-blue-100 hover:shadow-sm"
                )}
              >
                {isPaperActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-500 rounded-r-full" />
                )}

                {isAssignmentMode && (
                  <div className="flex-shrink-0 pt-1">
                    <input
                      type="checkbox"
                      className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 accent-blue-600 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                      checked={isPaperSelected}
                      disabled={['Included', 'Excluded', 'Resolved'].includes(paper.status) || paper.isAssigned}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => handleSelectPaper(e, paper.id)}
                    />
                  </div>
                )}

                <div className="flex-1 space-y-3 min-w-0">
                  <h3 className={cn(
                    "text-sm font-bold leading-snug line-clamp-2 transition-colors",
                    isPaperActive ? "text-blue-700" : "text-slate-800 group-hover:text-blue-600"
                  )}>
                    {paper.title}
                  </h3>

                  <p className="text-xs font-medium text-slate-500 line-clamp-1">
                    {paper.author}
                  </p>

                  <div className="flex flex-col gap-2 pt-1">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-400 shrink-0">
                        <Calendar className="w-3 h-3" />
                        {paper.year}
                      </span>
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-400 truncate">
                        <Database className="w-3 h-3 shrink-0" />
                        {paper.source}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className={cn(
                        "flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[9px] font-black uppercase tracking-wider",
                        status.bgColor,
                        status.color,
                        status.borderColor
                      )}>
                        <StatusIcon className="w-3 h-3" />
                        {paper.status}
                      </div>

                      <div className={cn(
                        "flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[9px] font-black uppercase tracking-wider",
                        paper.isAssigned
                          ? "bg-indigo-50 text-indigo-600 border-indigo-100"
                          : "bg-slate-50 text-slate-400 border-slate-200"
                      )}>
                        <Users className="w-3 h-3" />
                        {paper.isAssigned ? "Assigned" : "Unassigned"}
                        {paper.isAssigned && (
                          <button
                            onClick={(e) => handleViewReviewers(e, paper.title, paper.assignedReviewers || [])}
                            className="ml-1 p-0.5 hover:bg-indigo-200 rounded-md transition-colors"
                            title="View Reviewers"
                          >
                            <Eye className="w-3 h-3" />
                          </button>
                        )}
                      </div>

                    </div>

                    {paper.hasConflict && (
                      <div className="flex items-center gap-1.5 w-fit px-2.5 py-1 rounded-full border border-amber-200 bg-amber-50 text-amber-600 text-[9px] font-black uppercase tracking-wider animate-blink shadow-sm">
                        <AlertCircle className="w-3 h-3" />
                        ! Conflict
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-4">
              <Search className="w-6 h-6 text-slate-300" />
            </div>
            <p className="text-sm font-medium text-slate-500">No papers found matching your filters</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setYearFilter('all');
                setDecisionFilter('0');
                setAssignmentFilter('all');
              }}
              className="mt-2 text-xs font-bold text-blue-600 hover:underline"
            >
              Clear all filters
            </button>
          </div>
        )}

        {isFetchingNextPage && (
          <div className="py-4 flex justify-center">
            <div className="flex items-center gap-2 text-blue-500 font-bold text-[10px] uppercase tracking-widest">
              <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              Loading more...
            </div>
          </div>
        )}
      </div>

      <AssignedReviewersModal
        isOpen={reviewersModal.isOpen}
        onClose={() => setReviewersModal(prev => ({ ...prev, isOpen: false }))}
        paperTitle={reviewersModal.paperTitle}
        reviewers={reviewersModal.reviewers}
      />
    </div>
  );
};

