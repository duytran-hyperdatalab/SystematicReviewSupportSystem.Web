import React, { useState } from "react";
import { Modal } from "../../ui/Modal";
import Button from "../../ui/Button";
import { useParams } from "react-router";
import { useProjectPicocs, useProjectResearchQuestions } from "../../../hooks/useProjects";
import { useGenerateAiCriteria, useSaveAiCriteria } from "../../../hooks/useSelectionCriteria";
import LoadingSpinner from "../../ui/LoadingSpinner";
import { ClipboardList, ChevronDown, ChevronUp } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import toast from "react-hot-toast";
import type {
  CriteriaGroup,
  CriterionItem,
  SaveAiResultRequest,
} from "../../../types/selectionCriteria";
import ProjectPICOCElement from "./ProjectPICOCElement";
import ProjectResearchQuestions from "./ProjectResearchQuestions";
import ManageStuSeCriteria from "./ManageStuSeCriteria";

interface StudySelectionCriteriaModalProps {
  isOpen: boolean;
  onClose: () => void;
  studySelectionProcessId: string; // Required for AI generation
}

const StudySelectionCriteriaModal: React.FC<StudySelectionCriteriaModalProps> = ({
  isOpen,
  onClose,
  studySelectionProcessId,
}) => {
  const { projectId } = useParams<{ projectId: string }>();
  const { picocs, isLoading: picocLoading } = useProjectPicocs(projectId);
  const { researchQuestions, isLoading: rqLoading } = useProjectResearchQuestions(projectId);

  const { mutate: generateAi, isPending: isGenerating } = useGenerateAiCriteria();
  const { mutate: saveCriteria, isPending: isSaving } = useSaveAiCriteria();

  const [criteriaGroups, setCriteriaGroups] = useState<CriteriaGroup[]>([]);
  const [rawJson, setRawJson] = useState<string>("");
  const [_showRawJson, setShowRawJson] = useState(false);
  const [showRefData, setShowRefData] = useState(true);

  const isLoading = picocLoading || rqLoading;

  const handleAiSuggest = () => {
    generateAi(studySelectionProcessId, {
      onSuccess: (data) => {
        // Capture rawJson - fallback to stringified criteria if rawJson field is missing
        const jsonContent =
          data.rawJson || JSON.stringify({ criteriaGroups: data.criteriaGroups }, null, 2);
        setRawJson(jsonContent);

        const newGroups: CriteriaGroup[] = data.criteriaGroups.map((group) => ({
          ...group,
          localId: uuidv4(),
          isAiGenerated: true,
          isExpanded: true,
          inclusionCriteria: group.inclusionCriteria.map((c) => ({ ...c, localId: uuidv4() })),
          exclusionCriteria: group.exclusionCriteria.map((c) => ({ ...c, localId: uuidv4() })),
        }));

        setCriteriaGroups((prev) => [...prev, ...newGroups]);
        toast.success("AI Criteria suggested successfully!");
        setShowRawJson(true); // Automatically show JSON when generated
      },
      onError: (error) => {
        toast.error(error.message || "Failed to generate AI criteria. Please try again.");
      },
    });
  };

  // Add Custom Group
  const addCustomGroup = () => {
    const newGroup: CriteriaGroup = {
      localId: uuidv4(),
      description: "",
      inclusionCriteria: [],
      exclusionCriteria: [],
      isAiGenerated: false,
      isExpanded: true,
    };
    setCriteriaGroups((prev) => [...prev, newGroup]);
  };

  // Delete Group
  const deleteGroup = (localId: string) => {
    setCriteriaGroups((prev) => prev.filter((g) => g.localId !== localId));
  };

  // Update Group Description
  const updateGroupDescription = (localId: string, description: string) => {
    setCriteriaGroups((prev) =>
      prev.map((g) => (g.localId === localId ? { ...g, description } : g)),
    );
  };

  // Add Criterion
  const addCriterion = (groupLocalId: string, type: "inclusion" | "exclusion") => {
    setCriteriaGroups((prev) =>
      prev.map((g) => {
        if (g.localId === groupLocalId) {
          const newItem: CriterionItem = { localId: uuidv4(), text: "", sources: [] };
          return {
            ...g,
            [type === "inclusion" ? "inclusionCriteria" : "exclusionCriteria"]: [
              ...(type === "inclusion" ? g.inclusionCriteria : g.exclusionCriteria),
              newItem,
            ],
          };
        }
        return g;
      }),
    );
  };

  // Delete Criterion
  const deleteCriterion = (
    groupLocalId: string,
    criterionLocalId: string,
    type: "inclusion" | "exclusion",
  ) => {
    setCriteriaGroups((prev) =>
      prev.map((g) => {
        if (g.localId === groupLocalId) {
          const listName = type === "inclusion" ? "inclusionCriteria" : "exclusionCriteria";
          return {
            ...g,
            [listName]: g[listName].filter((c) => c.localId !== criterionLocalId),
          };
        }
        return g;
      }),
    );
  };

  // Update Criterion Text
  const updateCriterionText = (
    groupLocalId: string,
    criterionLocalId: string,
    type: "inclusion" | "exclusion",
    text: string,
  ) => {
    setCriteriaGroups((prev) =>
      prev.map((g) => {
        if (g.localId === groupLocalId) {
          const listName = type === "inclusion" ? "inclusionCriteria" : "exclusionCriteria";
          return {
            ...g,
            [listName]: g[listName].map((c) =>
              c.localId === criterionLocalId ? { ...c, text } : c,
            ),
          };
        }
        return g;
      }),
    );
  };

  // Save Criteria
  const handleApplyAndContinue = () => {
    if (criteriaGroups.length === 0) {
      toast.error("Please add at least one criteria group.");
      return;
    }

    const requestData: SaveAiResultRequest = {
      studySelectionProcessId,
      rawJson: rawJson || "{}", // Default if no AI result used
      criteriaGroups: criteriaGroups.map((group) => ({
        description: group.description,
        inclusionCriteria: group.inclusionCriteria
          .map((c) => c.text)
          .filter((t) => t.trim() !== ""),
        exclusionCriteria: group.exclusionCriteria
          .map((c) => c.text)
          .filter((t) => t.trim() !== ""),
      })),
    };

    saveCriteria(requestData, {
      onSuccess: () => {
        toast.success("Study selection criteria saved successfully!");
        onClose();
      },
      onError: (error) => {
        toast.error(error.message || "Failed to save criteria. Please try again.");
      },
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Study Selection Criteria" size="xl">
      <div className="flex flex-col gap-6 py-2 h-[80vh]">
        {/* Header Section */}
        <div className="flex items-start justify-between gap-4 p-5 bg-gradient-to-br from-indigo-50 to-white rounded-2xl border border-indigo-100 shadow-sm shrink-0">
          <div className="flex gap-4">
            <div className="p-3 bg-white rounded-xl shadow-sm border border-indigo-50 shrink-0">
              <ClipboardList className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900">
                Define Your Study Selection Criteria
              </h3>
              <p className="text-sm text-slate-600 mt-1 max-w-2xl">
                Translate your project's PICOC and Research Questions into clear Inclusion and
                Exclusion criteria. Use AI to jumpstart the process or build your own custom groups.
              </p>
            </div>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowRefData(!showRefData)}
            className="shrink-0"
          >
            {showRefData ? (
              <ChevronUp className="w-4 h-4 mr-2" />
            ) : (
              <ChevronDown className="w-4 h-4 mr-2" />
            )}
            {showRefData ? "Hide Reference Data" : "Show Reference Data"}
          </Button>
        </div>

        {/* Scrollable Area */}
        <div className="flex-1 overflow-y-auto pr-2 space-y-8 custom-scrollbar">
          {/* Reference Data Section */}
          {showRefData && (
            <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-300">
              {isLoading ? (
                <div className="flex justify-center py-10">
                  <LoadingSpinner />
                </div>
              ) : (
                <>
                  <ProjectPICOCElement picocs={picocs} />
                  <ProjectResearchQuestions researchQuestions={researchQuestions} />
                </>
              )}
            </div>
          )}

          {/* Criteria Management Section */}
          <ManageStuSeCriteria
            criteriaGroups={criteriaGroups}
            isGenerating={isGenerating}
            onAiSuggest={handleAiSuggest}
            onAddCustomGroup={addCustomGroup}
            onDeleteGroup={deleteGroup}
            onUpdateGroupDescription={updateGroupDescription}
            onAddCriterion={addCriterion}
            onDeleteCriterion={deleteCriterion}
            onUpdateCriterion={updateCriterionText}
          />

          {/* AI Response Preview */}
        </div>

        {/* Footer Actions */}
        <div className="flex justify-end gap-3 pt-6 border-t border-slate-100 shrink-0">
          <Button variant="secondary" onClick={onClose} className="px-6">
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleApplyAndContinue}
            className="px-8 shadow-lg shadow-indigo-100"
            disabled={criteriaGroups.length === 0 || isSaving}
          >
            {isSaving ? <LoadingSpinner size="sm" className="mr-2" /> : null}
            {isSaving ? "Saving..." : "Apply & Continue"}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default StudySelectionCriteriaModal;
