import React, { useEffect, useRef, useState, useMemo } from 'react';
import { useParams } from 'react-router';
import gsap from 'gsap';
import { Users, UserPlus, CheckCircle2, Search, X, ChevronDown, Loader2 } from 'lucide-react';
import Button from '../../ui/Button';
import { Dropdown } from '../../ui/Dropdown';
import { useProjectMembers } from '../../../hooks/useProjects';
import { useAssignPapers } from '../../../hooks/useProjectPapers';
import { useDebounce } from '../../../hooks/useDebounce';
import { ProjectRole, type ProjectMember } from '../../../types/project';
import { toastSuccess, toastError } from '../../../utils/toast';

interface BulkAssignmentPanelProps {
  selectedPaperIds: string[];
  onAssignmentComplete: () => void;
  /** The current phase of the process, used for the assign call */
  currentPhase?: number;
}

const BulkAssignmentPanel: React.FC<BulkAssignmentPanelProps> = ({
  selectedPaperIds,
  onAssignmentComplete,
  currentPhase,
}) => {
  const selectedCount = selectedPaperIds.length;
  const panelRef = useRef<HTMLDivElement>(null);
  const { projectId, screeningProcessId } = useParams<{ 
    projectId: string; 
    screeningProcessId: string 
  }>();
  
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 300);
  
  // 1. Fetch project members from API
  const { members, isLoading } = useProjectMembers(projectId, {
    search: debouncedSearch,
    pageSize: 100 // Large enough for member selection
  });

  // 2. Filter out leaders (they shouldn't be assigned to papers as reviewers in this list)
  const reviewers = useMemo(() => {
    return members.filter(m => m.role !== ProjectRole.Leader);
  }, [members]);

  // 3. Selection State (Map ID to Name for chip display)
  const [selectedReviewers, setSelectedReviewers] = useState<Map<string, string>>(new Map());

  // 4. Mutation for assigning papers
  const { mutate: assignPapers, isPending } = useAssignPapers();

  const handleAssign = () => {
    const reviewerIds = Array.from(selectedReviewers.keys());

    if (reviewerIds.length !== 2) {
      toastError('Selection Error', 'Please select exactly 2 reviewers for each paper.');
      return;
    }

    if (selectedPaperIds.length === 0) return;

    // Use currentPhase from props. If not provided, fallback to 1 (TitleAbstract)
    const phase = currentPhase ?? 1;

    assignPapers(
      {
        paperIds: selectedPaperIds,
        memberIds: reviewerIds,
        studySelectionProcessId: screeningProcessId ?? '',
        phase,
      },
      {
        onSuccess: (response) => {
          if (response.isSuccess) {
            toastSuccess(
              'Papers Assigned',
              response.message ||
                `${selectedPaperIds.length} papers assigned to ${reviewerIds.length} reviewers.`,
            );
            setSelectedReviewers(new Map());
            onAssignmentComplete();
          } else {
            toastError(
              'Assignment Failed',
              response.errors?.[0]?.message || 'Could not assign papers.',
            );
          }
        },
        onError: (err: any) => {
          toastError(
            'Error',
            err?.response?.data?.message || 'An unexpected error occurred during assignment.',
          );
        },
      },
    );
  };

  useEffect(() => {
    if (selectedCount > 0) {
      gsap.to(panelRef.current, {
        y: 0,
        opacity: 1,
        duration: 0.5,
        ease: 'power3.out'
      });
    } else {
      gsap.to(panelRef.current, {
        y: 100,
        opacity: 0,
        duration: 0.3,
        ease: 'power3.in'
      });
      setSearchQuery('');
    }
  }, [selectedCount]);

  const toggleReviewer = (member: ProjectMember) => {
    const newSelected = new Map(selectedReviewers);
    if (newSelected.has(member.userId)) {
      newSelected.delete(member.userId);
    } else {
      if (newSelected.size >= 2) {
        toastError('Selection Limit', 'You can only assign exactly 2 reviewers.');
        return;
      }
      newSelected.set(member.userId, member.fullName);
    }
    setSelectedReviewers(newSelected);
  };

  const removeReviewer = (id: string) => {
    const newSelected = new Map(selectedReviewers);
    newSelected.delete(id);
    setSelectedReviewers(newSelected);
  };

  const selectedEntries = Array.from(selectedReviewers.entries());
  const visibleChips = selectedEntries.slice(0, 2);
  const remainingCount = selectedEntries.length - visibleChips.length;

  if (selectedCount === 0) return null;

  return (
    <div
      ref={panelRef}
      className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-5xl px-4 z-50 opacity-0 translate-y-[100px]"
    >
      <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-6 text-white overflow-visible relative">
        {/* Background Accent */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

        <div className="flex flex-col lg:flex-row items-center justify-between gap-6 relative">
          {/* Section 1: Bulk Action Stats */}
          <div className="flex items-center gap-4 flex-shrink-0">
            <div className="bg-blue-600 p-3 rounded-xl shadow-inner ring-4 ring-blue-600/20">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <div className="text-[10px] text-blue-400 font-bold uppercase tracking-widest mb-0.5">Bulk Action</div>
              <div className="text-xl font-black flex items-center gap-2 tabular-nums">
                <span>{selectedCount}</span>
                <span className="text-slate-400 text-xs font-medium uppercase">Papers</span>
              </div>
            </div>
          </div>

          <div className="h-12 w-px bg-slate-700 hidden lg:block"></div>

          {/* Section 2: Reviewer Selection */}
          <div className="flex-1 w-full min-w-0">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block flex items-center justify-between">
              <span>Assign to Reviewers</span>
              <span className={`text-[9px] px-1.5 py-0.5 rounded ${selectedReviewers.size === 2 ? 'text-blue-400 bg-blue-500/10' : 'text-amber-500 bg-amber-500/10'}`}>
                Require 2 Reviewers
              </span>
            </label>
            
            <div className="flex items-center gap-3">
              {/* Selector Button with Dropdown */}
              <Dropdown
                trigger={
                  <button
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl border bg-slate-800 border-slate-700 text-slate-200 hover:border-slate-500 hover:bg-slate-750 transition-all text-sm font-semibold whitespace-nowrap active:scale-95"
                  >
                    <UserPlus className="w-4 h-4" />
                    Select Reviewers
                    <ChevronDown className="w-3.5 h-3.5 ml-1 text-slate-500" />
                  </button>
                }
                className="w-auto"
                position="top"
                contentClassName="bg-transparent shadow-none ring-0 w-auto p-0"
              >
                <div className="w-72 bg-slate-800 rounded-xl overflow-hidden shadow-2xl">
                  <div className="p-3 border-b border-slate-700 bg-slate-850">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input
                        autoFocus
                        type="text"
                        placeholder="Search reviewers..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 text-white transition-all"
                      />
                    </div>
                  </div>
                  
                  <div className="max-h-60 overflow-y-auto p-2 custom-scrollbar min-h-[100px] relative">
                    {isLoading ? (
                      <div className="flex items-center justify-center py-10 text-slate-500">
                        <Loader2 className="w-5 h-5 animate-spin mr-2" />
                        <span className="text-xs font-medium">Fetching Team...</span>
                      </div>
                    ) : reviewers.length > 0 ? (
                      reviewers.map((member) => (
                        <label
                          key={member.userId}
                          className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-slate-700/50 cursor-pointer transition-colors group"
                        >
                          <input
                            type="checkbox"
                            checked={selectedReviewers.has(member.userId)}
                            onChange={(e) => {
                              e.stopPropagation();
                              toggleReviewer(member);
                            }}
                            className="w-4 h-4 rounded border-slate-600 text-blue-600 focus:ring-blue-500 bg-slate-900"
                          />
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-300 group-hover:bg-blue-600 transition-colors">
                              {member.fullName.charAt(0)}
                            </div>
                            <span className="text-xs font-medium text-slate-300 group-hover:text-white transition-colors">
                              {member.fullName}
                            </span>
                          </div>
                        </label>
                      ))
                    ) : (
                      <div className="p-4 text-center text-xs text-slate-500 italic">
                        No team members found
                      </div>
                    )}
                  </div>

                  <div className="p-3 border-t border-slate-700 bg-slate-850 flex items-center justify-between">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tabular-nums">
                      {selectedReviewers.size} Selected
                    </span>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedReviewers(new Map());
                      }}
                      className="text-[10px] text-blue-400 font-bold hover:text-blue-300 transition-colors uppercase"
                    >
                      Clear All
                    </button>
                  </div>
                </div>
              </Dropdown>

              {/* Selected Chips Container */}
              <div className="flex items-center gap-2 flex-1 min-w-0 overflow-hidden">
                <div className="flex items-center gap-1.5 flex-nowrap overflow-x-auto no-scrollbar py-1">
                  {visibleChips.map(([id, name]) => (
                    <div 
                      key={id}
                      className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-300 whitespace-nowrap animate-in zoom-in-95 duration-200"
                    >
                      <Users className="w-3 h-3 text-blue-400" />
                      {name}
                      <button 
                         onClick={() => removeReviewer(id)}
                        className="p-0.5 hover:bg-slate-700 rounded transition-colors"
                      >
                        <X className="w-3 h-3 text-slate-500 hover:text-red-400" />
                      </button>
                    </div>
                  ))}
                  
                  {remainingCount > 0 && (
                    <div 
                      className="px-2 py-1 rounded-lg bg-slate-800 border border-slate-700 border-dashed text-[10px] font-bold text-blue-400 whitespace-nowrap cursor-help relative group"
                    >
                      +{remainingCount} more
                      
                      {/* Tooltip on hover */}
                      <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 hidden group-hover:block w-48 bg-slate-950 border border-slate-800 rounded-xl shadow-2xl p-3 z-[70] animate-in fade-in zoom-in-95">
                        <div className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-2 border-b border-slate-800 pb-1">
                          Also Assigned To
                        </div>
                        <div className="flex flex-col gap-1.5">
                          {selectedEntries.slice(2).map(([id, name]) => (
                            <div key={id} className="flex items-center gap-2 text-xs text-slate-300">
                              <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                              {name}
                            </div>
                          ))}
                        </div>
                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-[6px] border-transparent border-t-slate-950"></div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Action Button */}
          <div className="flex flex-col items-center lg:items-end flex-shrink-0">
            <Button
              onClick={handleAssign}
              disabled={selectedReviewers.size !== 2 || isPending}
              className="bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-500 disabled:border-slate-700 text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-blue-900/40 border-none transition-all active:scale-95 flex items-center gap-2 group whitespace-nowrap"
            >
              {isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <CheckCircle2 className={`w-4 h-4 transition-transform ${selectedReviewers.size > 0 ? 'scale-100' : 'scale-0'}`} />
              )}
              {isPending ? 'Assigning...' : 'Assign Selected'}
            </Button>
          </div>
        </div>
      </div>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #475569; }
      `}</style>
    </div>
  );
};

export default BulkAssignmentPanel;
