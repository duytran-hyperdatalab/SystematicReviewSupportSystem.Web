import React, { useState, useMemo } from "react";
import { UserPlus, Search, X, Loader2, ChevronDown, Info } from "lucide-react";
import { useParams } from "react-router-dom";
import Button from "../../ui/Button";
import { Dropdown } from "../../ui/Dropdown";
import { useProjectMembers } from "../../../hooks/useProjects";
import { ProjectRole } from "../../../types/project";
import { toastSuccess, toastError } from "../../../utils/toast";
import { useAssignPapers } from "../../../hooks/useProjectPapers";

interface ThirdReviewerAssignmentProps {
  paperId: string;
  studySelectionProcessId: string;
  phase: number;
  existingReviewersId: string[];
  onCancel: () => void;
  onAssignmentComplete: () => void;
}

const ThirdReviewerAssignment: React.FC<ThirdReviewerAssignmentProps> = ({
  paperId,
  studySelectionProcessId,
  phase,
  existingReviewersId,
  onCancel,
  onAssignmentComplete,
}) => {
  const { projectId } = useParams<{ projectId: string }>();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedReviewers, setSelectedReviewers] = useState<{ id: string; name: string }[]>([]);
  const { mutate: assignPapers, isPending: isAssigning } = useAssignPapers();

  // Fetch project members
  const { members, isLoading } = useProjectMembers(projectId || "", {
    search: searchQuery,
    pageSize: 100,
  });
  // Filter out leaders and existing reviewers
  const availableReviewers = useMemo(() => {
    return members.filter((m) => {
      const isLeader = m.role === ProjectRole.Leader;
      const alreadyReviewed = existingReviewersId.some((id) => {
        if (!id) return false;
        const normalizedId = String(id).trim().toLowerCase();
        return (
          normalizedId === m.userId?.toLowerCase() ||
          normalizedId === m.userName?.toLowerCase() ||
          normalizedId === m.fullName?.toLowerCase()
        );
      });
      return !isLeader && !alreadyReviewed;
    });
  }, [members, existingReviewersId]);

  const toggleReviewer = (member: { userId: string; fullName: string }) => {
    setSelectedReviewers((prev) => {
      const exists = prev.find((r) => r.id === member.userId);
      if (exists) {
        return prev.filter((r) => r.id !== member.userId);
      } else {
        return [...prev, { id: member.userId, name: member.fullName }];
      }
    });
  };

  const handleAssign = () => {
    if (selectedReviewers.length === 0) return;

    assignPapers(
      {
        paperIds: [paperId],
        memberIds: selectedReviewers.map((r) => r.id),
        studySelectionProcessId,
        phase: phase,
      },
      {
        onSuccess: (response) => {
          if (response.isSuccess) {
            toastSuccess(
              "Reviewers Assigned",
              `${selectedReviewers.length} reviewer(s) have been assigned to this paper.`
            );
            onAssignmentComplete();
          } else {
            toastError("Assignment Failed", response.message || "Could not assign reviewers.");
          }
        },
        onError: (err: any) => {
          toastError(
            "Error",
            err?.response?.data?.message || "An unexpected error occurred during assignment."
          );
        },
      }
    );
  };

  return (
    <div className="absolute inset-0 bg-white z-30 p-6 flex flex-col animate-in slide-in-from-right-full duration-500 ease-out-expo">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-sm font-black uppercase tracking-tight text-slate-900 flex items-center gap-2">
            <UserPlus className="w-4 h-4 text-blue-600" />
            Assign Reviewers
          </h3>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
            To resolve consensus conflict
          </p>
        </div>
        <button
          onClick={onCancel}
          className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-400 hover:text-slate-600"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-6 flex-1 overflow-y-auto no-scrollbar pb-6">
        {/* Warning/Info Box */}
        <div className="bg-blue-50/50 border border-blue-100/50 rounded-2xl p-4 flex gap-3">
          <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
          <p className="text-[11px] font-medium leading-relaxed text-blue-700/80">
            Selected reviewers will provide independent decisions to break the deadlock for this paper.
          </p>
        </div>

        {/* Reviewer Selection */}
        <div className="space-y-3">
          <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.15em] block ml-1">
            Select Reviewers ({selectedReviewers.length})
          </label>
          <Dropdown
            trigger={
              <button className="w-full flex items-center justify-between gap-3 px-4 py-4 rounded-2xl bg-slate-50 border border-transparent hover:border-slate-200 transition-all group active:scale-[0.98]">
                <div className="flex items-center gap-3 overflow-hidden">
                  {selectedReviewers.length > 0 ? (
                    <div className="flex -space-x-2">
                      {selectedReviewers.slice(0, 3).map((r) => (
                        <div key={r.id} className="w-8 h-8 rounded-full bg-blue-600 border-2 border-white flex items-center justify-center text-[11px] font-bold text-white shadow-sm ring-0">
                          {r.name.charAt(0)}
                        </div>
                      ))}
                      {selectedReviewers.length > 3 && (
                        <div className="w-8 h-8 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center text-[9px] font-bold text-slate-600">
                          +{selectedReviewers.length - 3}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-400 group-hover:bg-slate-300 transition-colors">
                      <Search className="w-4 h-4" />
                    </div>
                  )}
                  <div className="text-left truncate">
                    <div className={`text-xs font-bold ${selectedReviewers.length > 0 ? "text-slate-900" : "text-slate-500"}`}>
                      {selectedReviewers.length > 0
                        ? selectedReviewers.map(r => r.name).join(", ")
                        : "Choose reviewers..."}
                    </div>
                    {selectedReviewers.length > 0 && (
                      <div className="text-[9px] text-blue-600 font-bold uppercase tracking-widest">
                        {selectedReviewers.length} reviewer(s) selected
                      </div>
                    )}
                  </div>
                </div>
                <ChevronDown className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors shrink-0" />
              </button>
            }
            className="w-full"
            contentClassName="bg-white shadow-2xl ring-0 w-full mt-2 rounded-2xl border border-slate-100 overflow-hidden"
          >
            <div className="w-full">
              <div className="p-3 border-b border-slate-50 bg-slate-50/50">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                  <input
                    autoFocus
                    type="text"
                    placeholder="Search by name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-white border border-slate-100 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-900 transition-all placeholder:text-slate-300"
                  />
                </div>
              </div>

              <div className="max-h-52 overflow-y-auto p-1 custom-scrollbar">
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
                  </div>
                ) : availableReviewers.length > 0 ? (
                  availableReviewers.map((member) => {
                    const isSelected = selectedReviewers.some((r) => r.id === member.userId);
                    return (
                      <button
                        key={member.userId}
                        onClick={() => toggleReviewer(member)}
                        className={`w-full flex items-center gap-3 p-2.5 rounded-xl transition-all group text-left ${isSelected ? "bg-blue-50" : "hover:bg-slate-50"
                          }`}
                      >
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold transition-all ${isSelected ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-500 group-hover:bg-blue-600 group-hover:text-white"
                          }`}>
                          {member.fullName.charAt(0)}
                        </div>
                        <div className="flex-1">
                          <div className={`text-xs font-bold ${isSelected ? "text-blue-700" : "text-slate-700 group-hover:text-slate-900"}`}>
                            {member.fullName}
                          </div>
                          <div className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">
                            {member.email?.split("@")[0]}
                          </div>
                        </div>
                        {isSelected && (
                          <div className="bg-blue-600 rounded-full p-0.5">
                            <X className="w-2.5 h-2.5 text-white" />
                          </div>
                        )}
                      </button>
                    );
                  })
                ) : (
                  <div className="p-6 text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-loose">
                    No eligible reviewers found
                  </div>
                )}
              </div>
            </div>
          </Dropdown>
        </div>
      </div>

      <div className="mt-auto pt-6 space-y-3 border-t border-slate-50 bg-white">
        <Button
          onClick={handleAssign}
          disabled={selectedReviewers.length === 0 || isAssigning}
          className="w-full py-4 bg-slate-900 text-white font-black text-xs uppercase tracking-[0.25em] rounded-2xl hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 active:scale-[0.98] disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-2 group"
        >
          {isAssigning ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <UserPlus className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          )}
          {isAssigning ? "Processing..." : `Assign ${selectedReviewers.length} Reviewer${selectedReviewers.length !== 1 ? 's' : ''}`}
        </Button>
        <p className="text-[9px] text-center font-bold text-slate-400 uppercase tracking-[0.15em]">
          Automated notifications will be sent
        </p>
      </div>

      <style>{`
        .ease-out-expo { transition-timing-function: cubic-bezier(0.19, 1, 0.22, 1); }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
      `}</style>
    </div>
  );
};

export default ThirdReviewerAssignment;
