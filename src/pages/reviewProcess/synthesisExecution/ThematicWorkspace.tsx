import { useEffect, useMemo, useState } from "react";
import { BookOpen, NotebookPen, Plus } from "lucide-react";
import Button from "../../../components/ui/Button";
import type {
  AddEvidenceRequest,
  CreateThemeRequest,
  SourceDataGroupDto,
  SourceDataValueDto,
  SynthesisThemeDto,
  SynthesisWorkspaceDto,
  ThemeEvidenceDto,
  UpdateThemeRequest,
} from "../../../types/synthesisExecution";
import SourceDataAccordion from "./components/SourceDataAccordion";
import ConfirmationModal from "./components/ConfirmationModal";
import SynthesisThemeCard from "./components/SynthesisThemeCard";
import SynthesisThemeModal from "./components/SynthesisThemeModal";

type ThematicConfirmationAction =
  | {
    type: "delete-theme";
    themeId: string;
    themeName: string;
  }
  | {
    type: "unlink-evidence";
    evidenceId: string;
  };

interface ThematicWorkspaceProps {
  workspace: SynthesisWorkspaceDto;
  sourceDataGroups: SourceDataGroupDto[];
  isReadOnly?: boolean;
  isCreatingTheme?: boolean;
  isUpdatingTheme?: boolean;
  isDeletingTheme?: boolean;
  isLinkingEvidence?: boolean;
  isUnlinkingEvidence?: boolean;
  onCreateTheme: (request: CreateThemeRequest) => Promise<void>;
  onUpdateTheme: (themeId: string, request: UpdateThemeRequest) => Promise<void>;
  onDeleteTheme: (themeId: string) => Promise<void>;
  onLinkEvidence: (themeId: string, request: AddEvidenceRequest) => Promise<void>;
  onUnlinkEvidence: (evidenceId: string) => Promise<void>;
  onViewStrategyGuidelines: () => void;
}

export default function ThematicWorkspace({
  workspace,
  sourceDataGroups,
  isReadOnly = false,
  isCreatingTheme = false,
  isUpdatingTheme = false,
  isDeletingTheme = false,
  isLinkingEvidence = false,
  isUnlinkingEvidence = false,
  onCreateTheme,
  onUpdateTheme,
  onDeleteTheme,
  onLinkEvidence,
  onUnlinkEvidence,
  onViewStrategyGuidelines,
}: ThematicWorkspaceProps) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [themeBeingEdited, setThemeBeingEdited] = useState<SynthesisThemeDto | null>(null);
  const [expandedGroupId, setExpandedGroupId] = useState<string | null>(null);
  const [selectedThemeByValueId, setSelectedThemeByValueId] = useState<Record<string, string>>({});
  const [linkingValueId, setLinkingValueId] = useState<string | null>(null);
  const [unlinkingEvidenceId, setUnlinkingEvidenceId] = useState<string | null>(null);
  const [pendingConfirmation, setPendingConfirmation] = useState<ThematicConfirmationAction | null>(null);
  const [isConfirmingAction, setIsConfirmingAction] = useState(false);
  const isBusy = isCreatingTheme || isUpdatingTheme || isDeletingTheme || isLinkingEvidence || isUnlinkingEvidence || isConfirmingAction;

  useEffect(() => {
    if (!expandedGroupId && sourceDataGroups.length > 0) {
      setExpandedGroupId(sourceDataGroups[0].fieldId);
    }
  }, [expandedGroupId, sourceDataGroups]);

  const evidenceCount = useMemo(
    () => workspace.themes.reduce((total, theme) => total + theme.evidences.length, 0),
    [workspace.themes],
  );

  const handleCreateTheme = async (request: CreateThemeRequest) => {
    await onCreateTheme(request);
    setIsCreateModalOpen(false);
  };

  const handleOpenEditThemeModal = (theme: SynthesisThemeDto) => {
    setThemeBeingEdited(theme);
    setIsEditModalOpen(true);
  };

  const handleUpdateTheme = async (request: UpdateThemeRequest) => {
    if (!themeBeingEdited) {
      return;
    }

    await onUpdateTheme(themeBeingEdited.id, request);
    setIsEditModalOpen(false);
    setThemeBeingEdited(null);
  };

  const handleLinkEvidence = async (themeId: string, value: SourceDataValueDto) => {
    setLinkingValueId(value.extractedDataValueId);

    try {
      await onLinkEvidence(themeId, {
        extractedDataValueId: value.extractedDataValueId,
      });

      setSelectedThemeByValueId((current) => {
        const nextState = { ...current };
        delete nextState[value.extractedDataValueId];
        return nextState;
      });
    } finally {
      setLinkingValueId(null);
    }
  };

  const handleDeleteTheme = (theme: SynthesisThemeDto) => {
    setPendingConfirmation({
      type: "delete-theme",
      themeId: theme.id,
      themeName: theme.name,
    });
  };

  const handleUnlinkEvidence = (evidence: ThemeEvidenceDto) => {
    setPendingConfirmation({
      type: "unlink-evidence",
      evidenceId: evidence.id,
    });
  };

  const handleCloseConfirmation = () => {
    if (isConfirmingAction) {
      return;
    }

    setPendingConfirmation(null);
  };

  const handleConfirmAction = async () => {
    if (!pendingConfirmation) {
      return;
    }

    setIsConfirmingAction(true);

    try {
      if (pendingConfirmation.type === "delete-theme") {
        await onDeleteTheme(pendingConfirmation.themeId);
      } else {
        setUnlinkingEvidenceId(pendingConfirmation.evidenceId);
        try {
          await onUnlinkEvidence(pendingConfirmation.evidenceId);
        } finally {
          setUnlinkingEvidenceId(null);
        }
      }

      setPendingConfirmation(null);
    } finally {
      setIsConfirmingAction(false);
    }
  };

  const confirmationTitle = pendingConfirmation?.type === "delete-theme"
    ? `Delete theme "${pendingConfirmation.themeName}"?`
    : "Unlink evidence from theme?";
  const confirmationDescription = pendingConfirmation?.type === "delete-theme"
    ? "This will permanently remove the selected theme and its linked evidence connections from the synthesis workspace."
    : "This evidence will be detached from the current theme and can be linked again later.";
  const confirmationLabel = pendingConfirmation?.type === "delete-theme"
    ? "Delete Theme"
    : "Unlink Evidence";

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gray-400">Thematic Analysis Workspace</p>
            <h2 className="mt-2 text-2xl font-semibold text-gray-900">Link raw evidence to conceptual themes</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-600">
              Review extracted study data on the left, create themes on the right, and attach evidence to the best-fitting concept as you code the synthesis.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={onViewStrategyGuidelines} className="text-gray-600 hover:text-gray-900">
              <BookOpen className="mr-2 h-4 w-4" />
              View Strategy Guidelines
            </Button>
            <span className="rounded-full border border-gray-200 bg-gray-50 px-4 py-2 text-sm font-semibold text-gray-700">
              {workspace.themes.length} themes
            </span>
            <span className="rounded-full border border-gray-200 bg-gray-50 px-4 py-2 text-sm font-semibold text-gray-700">
              {evidenceCount} evidences
            </span>
            <Button onClick={() => setIsCreateModalOpen(true)} disabled={isReadOnly}>
              <Plus className="mr-2 h-4 w-4" />
              Create New Theme
            </Button>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Raw Extracted Data</h3>
              <p className="mt-1 text-sm text-gray-500">Expand a field to inspect evidence from each study.</p>
            </div>
          </div>

          <SourceDataAccordion
            groups={sourceDataGroups}
            themes={workspace.themes}
            expandedGroupId={expandedGroupId}
            selectedThemeByValueId={selectedThemeByValueId}
            disabled={isReadOnly || isBusy}
            linkingValueId={linkingValueId}
            onToggleGroup={setExpandedGroupId}
            onSelectThemeForValue={(valueId, themeId) =>
              setSelectedThemeByValueId((current) => ({ ...current, [valueId]: themeId }))
            }
            onLinkValueToTheme={(themeId, value) => handleLinkEvidence(themeId, value)}
          />
        </section>

        <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Themes</h3>
              <p className="mt-1 text-sm text-gray-500">Track the emerging narrative structure of the synthesis.</p>
            </div>
            {isReadOnly ? (
              <span className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-semibold text-gray-500">
                Read only
              </span>
            ) : null}
          </div>

          <div className="space-y-4">
            {workspace.themes.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-6 py-10 text-center">
                <NotebookPen className="mx-auto h-8 w-8 text-gray-400" />
                <p className="text-sm font-medium text-gray-600">No themes created yet.</p>
                <p className="mt-1 text-sm text-gray-500">Create the first theme to begin qualitative coding.</p>
              </div>
            ) : (
              workspace.themes.map((theme: SynthesisThemeDto) => (
                <SynthesisThemeCard
                  key={theme.id}
                  theme={theme}
                  disabled={isReadOnly || isBusy}
                  onEditTheme={isReadOnly ? undefined : handleOpenEditThemeModal}
                  onDeleteTheme={isReadOnly ? undefined : handleDeleteTheme}
                  onUnlinkEvidence={isReadOnly ? undefined : handleUnlinkEvidence}
                  unlinkingEvidenceId={unlinkingEvidenceId}
                />
              ))
            )}
          </div>
        </section>
      </div>

      <SynthesisThemeModal
        isOpen={isCreateModalOpen}
        isSubmitting={isCreatingTheme}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateTheme}
      />

      <SynthesisThemeModal
        key={themeBeingEdited?.id ?? "edit-theme"}
        isOpen={isEditModalOpen}
        mode="edit"
        initialValues={themeBeingEdited}
        isSubmitting={isUpdatingTheme}
        onClose={() => {
          setIsEditModalOpen(false);
          setThemeBeingEdited(null);
        }}
        onSubmit={handleUpdateTheme}
      />

      <ConfirmationModal
        isOpen={Boolean(pendingConfirmation)}
        title={confirmationTitle}
        description={confirmationDescription}
        confirmLabel={confirmationLabel}
        isConfirming={isConfirmingAction}
        variant="danger"
        onClose={handleCloseConfirmation}
        onConfirm={handleConfirmAction}
      />
    </div>
  );
}