import React, { useState } from "react";
import SnowballingPaperList from "./SnowballingPaperList";
import SnowballingPaperWorkspace from "./SnowballingPaperWorkspace";
import { type MockCandidate } from "../../../mocks/snowballingMockData";
import {
  useSelectCandidates,
  useRejectCandidates,
  usePapersWithCandidates,
} from "../../../hooks/useSnowballCandidates";
import type { PaperWithCandidateDto } from "../../../types/paper";
import { FileText, Sparkles, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

interface SnowballingCandidatesPageProps {
  projectId: string;
}

const SnowballingCandidatesPage: React.FC<SnowballingCandidatesPageProps> = ({
  projectId,
}) => {
  const [view, setView] = useState<"list" | "workspace">("list");
  const [selectedPaperId, setSelectedPaperId] = useState<string | null>(null);
  const [selectedCandidate, setSelectedCandidate] = useState<MockCandidate | null>(null);

  // Mutations
  const selectMutation = useSelectCandidates(projectId);
  const rejectMutation = useRejectCandidates();

  // Fetch papers if needed for Workspace metadata fallback
  const { data: response } = usePapersWithCandidates(projectId, { pageNumber: 1, pageSize: 100 });
  const activePaper = response?.items?.find((p: PaperWithCandidateDto) => p.id === selectedPaperId);

  const handlePaperClick = (id: string) => {
    setSelectedPaperId(id);
    setView("workspace");
  };

  const handleBack = () => {
    setView("list");
    setSelectedPaperId(null);
    setSelectedCandidate(null);
  };

  const handleDetailAction = async (id: string, action: "select" | "reject") => {
    try {
      if (action === "select") {
        await selectMutation.mutateAsync({ candidateIds: [id] });
      } else {
        await rejectMutation.mutateAsync({ candidateIds: [id] });
      }
      setSelectedCandidate(null);
      toast.success(`Candidate successfully ${action === "select" ? "promoted" : "rejected"}.`);
    } catch (err: any) {
      toast.error(err.message || "Failed to update candidate.");
    }
  };

  const isProcessing = selectMutation.isPending || rejectMutation.isPending;

  return (
    <div className="flex flex-col h-full overflow-hidden bg-white rounded-3xl shadow-sm border border-slate-100 relative">
      {/* Dynamic Header based on view */}
      <div className="bg-white border-b border-slate-50 p-8 shadow-sm relative z-20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 max-w-7xl mx-auto w-full">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center border border-indigo-700 shadow-xl shadow-indigo-100">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">
                Snowballing Candidates
              </h2>
            </div>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-[0.2em] pl-14">
              {view === "list"
                ? "Select a source paper to review references"
                : "Focused Paper Workspace"}
            </p>
          </div>

          {view === "list" && (
            <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-100 rounded-xl text-[11px] font-bold text-emerald-700">
              <Sparkles className="w-3.5 h-3.5" />
              Auto-extracted via GROBID
            </div>
          )}
        </div>
      </div>

      {/* Main Transitions */}
      <div className="flex-1 overflow-hidden relative">
        {view === "list" ? (
          <SnowballingPaperList projectId={projectId} onPaperClick={handlePaperClick} />
        ) : activePaper ? (
          <SnowballingPaperWorkspace
            projectId={projectId}
            paper={activePaper}
            onBack={handleBack}
            onSelectCandidate={setSelectedCandidate}
            selectedCandidateId={selectedCandidate?.candidateId}
            selectedCandidate={selectedCandidate}
            onCloseDetail={() => setSelectedCandidate(null)}
            onAction={handleDetailAction}
            isProcessing={isProcessing}
          />
        ) : (
          <div className="h-full flex flex-col items-center justify-center p-20 bg-white">
            <Loader2 className="w-10 h-10 animate-spin text-primary/40 mb-4" />
            <p className="text-sm font-black uppercase tracking-widest text-slate-400">
              Loading Workspace...
            </p>
          </div>
        )}

        {/* Detail Overlay - Moved to workspace level or handled here */}
        {view === "workspace" && activePaper && (
          <div className="h-full w-full">
            {/* The workspace itself will now handle the detail panel if we want it localized */}
          </div>
        )}
      </div>
    </div>
  );
};

export default SnowballingCandidatesPage;
