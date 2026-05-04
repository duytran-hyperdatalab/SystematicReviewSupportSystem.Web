import React, { useState, useMemo } from "react";
import { createPortal } from "react-dom";
import { FiX, FiMaximize2, FiInfo, FiRefreshCw } from "react-icons/fi";
import { useQuery } from "@tanstack/react-query";
import type { 
  CitationGraphDto, 
} from "../../../../../../types/studySelection";
import { studySelectionService } from "../../../../../../services/studySelectionService";
import { QUERY_KEYS } from "../../../../../../constants/queryKeys";
import { adaptPaperWithDecisions } from "../../types";
import CitationGraphCanvas from "./CitationGraphCanvas";
import PaperDetailsPanel from "./PaperDetailsPanel";

interface CitationGraphModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: CitationGraphDto;
  paperTitle: string;
  rootPaperId?: string;
  screeningProcessId: string;
}

const CitationGraphModal: React.FC<CitationGraphModalProps> = ({
  isOpen,
  onClose,
  data,
  paperTitle,
  rootPaperId,
  screeningProcessId,
}) => {
  const [selectedPaperId, setSelectedPaperId] = useState<string | null>(null);

  const paperDetailsQuery = useQuery({
    queryKey: QUERY_KEYS.studySelection.paperDetails(
      screeningProcessId ?? "",
      selectedPaperId ?? "",
    ),
    queryFn: () =>
      studySelectionService.getPaperDetails(
        screeningProcessId!,
        selectedPaperId!
      ),
    enabled: !!screeningProcessId && !!selectedPaperId,
    staleTime: 30000,
  });

  const paperDetails = useMemo(() => {
    if (!paperDetailsQuery.data?.data) return null;
    const adapted = adaptPaperWithDecisions(paperDetailsQuery.data.data);
    return {
      id: adapted.id,
      title: adapted.title,
      authors: adapted.authors ?? undefined,
      year: adapted.publicationYear ?? undefined,
      doi: adapted.doi ?? undefined,
      abstract: adapted.abstract ?? undefined,
      citationCount: adapted.citationCount,
      referenceCount: adapted.referenceCount,
    };
  }, [paperDetailsQuery.data]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-(--z-index-popover) flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 md:p-8">
      <div className="bg-white w-full h-full rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in duration-300">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white z-10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
              <FiMaximize2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 leading-tight line-clamp-1">
                Interactive Citation Network
              </h2>
              <p className="text-xs text-gray-500 font-medium truncate max-w-md">
                Analyzing: {paperTitle}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center gap-4 mr-4 text-[10px] font-bold uppercase tracking-wider text-gray-400">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-red-500" />
                Root Paper
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                Citations
              </div>
            </div>
            
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
              aria-label="Close modal"
            >
              <FiX className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Split Content Area */}
        <div className="flex-1 flex overflow-hidden bg-slate-50 relative">
          {/* LEFT PANEL: Compact Paper Details Sidebar */}
          <div className="w-[380px] border-r border-gray-200 bg-white flex flex-col shadow-sm z-10 transition-all duration-300">
            {selectedPaperId ? (
              paperDetailsQuery.isLoading ? (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-gray-400">
                  <FiRefreshCw className="w-8 h-8 animate-spin mb-4 text-blue-500" />
                  <p className="text-sm font-medium">Fetching details...</p>
                </div>
              ) : paperDetails ? (
                <PaperDetailsPanel paper={paperDetails} />
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-gray-400">
                  <FiInfo className="w-12 h-12 mb-4 opacity-20" />
                  <p className="text-sm font-medium text-gray-500">Details not available</p>
                </div>
              )
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-gray-50/50">
                <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-6 text-gray-300 border border-gray-100">
                  <FiInfo className="w-8 h-8" />
                </div>
                <h3 className="text-sm font-bold text-gray-900 mb-2">Select a Paper</h3>
                <p className="text-xs text-gray-500 max-w-[220px] leading-relaxed">
                  Click on any node in the interactive network to view its compact overview and connections.
                </p>
              </div>
            )}
          </div>

          {/* RIGHT PANEL: Graph Canvas */}
          <div className="flex-1 relative">
            <CitationGraphCanvas 
              data={data} 
              rootPaperId={rootPaperId} 
              selectedPaperId={selectedPaperId}
              onNodeClick={(id) => setSelectedPaperId(id)}
            />
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default CitationGraphModal;
