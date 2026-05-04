import React, { useState, useCallback, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiChevronLeft, FiSave, FiEye, FiDownload, FiMenu } from "react-icons/fi";
import Button from "../ui/Button";
import LoadingSpinner from "../ui/LoadingSpinner";
import Drawer from "../ui/Drawer";
import CompletionProgress from "./CompletionProgress";
import SectionSidebar from "./SectionSidebar";
import ChecklistItem from "./ChecklistItem";
import SampleAnswerModal from "./SampleAnswerModal";
import { useChecklistData, useChecklistEditorState } from "../../hooks/useChecklistData";
import { cn } from "../../utils/cn";
import type {
  ChecklistItemResponse,
  ReviewChecklist,
  SampleAnswerData,
} from "../../types/checklist";

interface ChecklistDraftChange {
  itemTemplateId: string;
  reportLocation?: string;
  isReported?: boolean;
}

interface ChecklistEditorProps {
  checklist: ReviewChecklist | null;
  isLoading?: boolean;
  onSave?: (changes: ChecklistDraftChange[]) => Promise<void>;
  onGenerateReport?: (format: "word" | "pdf") => Promise<void>;
}

/**
 * Main Checklist Editor Component
 * Professional form builder-style interface for PRISMA checklist completion
 */
const ChecklistEditor: React.FC<ChecklistEditorProps> = ({
  checklist,
  isLoading = false,
  onSave,
  onGenerateReport,
}) => {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [sampleAnswerData, setSampleAnswerData] = useState<SampleAnswerData | null>(null);
  const [savingItemId, setSavingItemId] = useState<string | null>(null);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);

  const {
    sectionProgress,
    updateItemResponse,
    getItemResponse,
    hasDraftChanges,
    hasDraftChange,
    getDraftChangesToSubmit,
    clearDraftChanges,
    clearDraftChange,
  } = useChecklistData(checklist);

  const {
    activeSection,
    isSidebarCollapsed,
    isSaving,
    saveError,
    showSampleModal,
    setActiveSection,
    toggleSidebar,
    setSaving,
    setError,
    showSample,
    closeSample,
  } = useChecklistEditorState();

  const handleSave = useCallback(async () => {
    if (!onSave || !hasDraftChanges) return;

    try {
      setSavingItemId(null);
      setSaving(true);
      setError(null);
      const changes = getDraftChangesToSubmit();
      await onSave(changes);
      clearDraftChanges();
      setLastSavedAt(new Date().toISOString());
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to save changes");
    } finally {
      setSaving(false);
    }
  }, [clearDraftChanges, getDraftChangesToSubmit, hasDraftChanges, onSave, setError, setSaving]);

  const handleSaveItem = useCallback(
    async (itemTemplateId: string) => {
      if (!onSave || !hasDraftChange(itemTemplateId)) return;

      const response = getItemResponse(itemTemplateId);
      if (!response) return;

      try {
        setSavingItemId(itemTemplateId);
        setSaving(true);
        setError(null);
        await onSave([
          {
            itemTemplateId,
            reportLocation: response.reportLocation,
            isReported: response.isReported,
          },
        ]);
        clearDraftChange(itemTemplateId);
      } catch (error) {
        setError(error instanceof Error ? error.message : "Failed to save item");
      } finally {
        setSaving(false);
        setSavingItemId(null);
      }
    },
    [clearDraftChange, getItemResponse, hasDraftChange, onSave, setError, setSaving],
  );

  const handleGenerateReport = useCallback(
    async (format: "word" | "pdf") => {
      if (!onGenerateReport) return;

      try {
        setSaving(true);
        await onGenerateReport(format);
      } catch (error) {
        setError(error instanceof Error ? error.message : "Failed to generate report");
      } finally {
        setSaving(false);
      }
    },
    [onGenerateReport, setError, setSaving],
  );

  const handleShowSampleAnswer = useCallback(
    (item: { itemNumber: string; topic: string; defaultSampleAnswer?: string | null }) => {
      setSampleAnswerData({
        itemNumber: item.itemNumber,
        topic: item.topic,
        sampleAnswer:
          item.defaultSampleAnswer?.trim() ||
          "No sample answer is available for this checklist item yet.",
        explanation: item.defaultSampleAnswer
          ? "This sample answer is pulled from the checklist template and can be used as a guide."
          : undefined,
      });
      showSample(item.itemNumber);
    },
    [showSample],
  );

  const currentSectionProgress = sectionProgress.find((s) => s.section === activeSection);
  const currentSectionMeta = useMemo(
    () => checklist?.sections?.find((section) => section.section === activeSection),
    [activeSection, checklist?.sections],
  );
  const currentSectionItems = useMemo(() => currentSectionMeta?.items ?? [], [currentSectionMeta]);
  const sectionsWithItems = useMemo(
    () => sectionProgress.filter((section) => section.totalItems > 0),
    [sectionProgress],
  );

  useEffect(() => {
    if (sectionsWithItems.length === 0) {
      return;
    }

    const hasActiveSectionItems = sectionsWithItems.some(
      (section) => section.section === activeSection,
    );

    if (!hasActiveSectionItems) {
      setActiveSection(sectionsWithItems[0].section);
    }
  }, [activeSection, sectionsWithItems, setActiveSection]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!checklist) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white gap-4">
        <p className="text-gray-600">Checklist not found</p>
        <Button onClick={() => navigate(-1)} variant="secondary">
          Go Back
        </Button>
      </div>
    );
  }

  const renderChecklistTree = (nodes: ChecklistItemResponse[], depth = 0): React.ReactNode => {
    return nodes.map((itemNode) => {
      const isSubItem = depth > 0;
      const itemId = itemNode.itemTemplateId;
      const children = itemNode.children ?? [];

      return (
        <div key={itemId} className="space-y-3">
          <div className={cn(isSubItem && "ml-8 pl-4 border-l-2 border-slate-200")}>
            <ChecklistItem
              template={{
                id: itemId,
                itemNumber: itemNode.itemNumber,
                topic: itemNode.topic,
                description: itemNode.description ?? "",
                section: itemNode.section ?? "OTHER_INFORMATION",
                isRequired: Boolean(itemNode.isRequired),
                isSubItem,
                parentId: itemNode.parentId ?? undefined,
                defaultSampleAnswer: itemNode.defaultSampleAnswer ?? undefined,
                order: itemNode.order ?? 0,
                hasLocationField: Boolean(itemNode.hasLocationField),
                isSectionHeaderOnly: Boolean(itemNode.isSectionHeaderOnly),
                hasChildren: Boolean(itemNode.hasChildren),
                canRespond: Boolean(itemNode.canRespond),
              }}
              response={getItemResponse(itemId)}
              onUpdate={updateItemResponse}
              onShowSample={handleShowSampleAnswer}
              onSaveItem={handleSaveItem}
              isSubItem={isSubItem}
              hasUnsavedChanges={hasDraftChange(itemId)}
              isLoading={isSaving && savingItemId === itemId}
            />
          </div>

          {children.length > 0 && renderChecklistTree(children, depth + 1)}
        </div>
      );
    });
  };

  return (
    <div className="flex h-screen flex-col bg-white">
      {/* Header */}
      <div className="fixed z-40 w-full bg-white border-b border-gray-200 h-16 flex items-center px-4 sm:px-6 gap-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          title="Go back"
        >
          <FiChevronLeft className="w-6 h-6 text-gray-600" />
        </button>

        <div className="flex-1">
          <h1 className="text-lg font-bold text-gray-900 truncate">{checklist.title}</h1>
          <p className="text-xs text-gray-500">
            {checklist.templateName} • {checklist.completionPercentage}% Complete
          </p>
        </div>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => handleGenerateReport("pdf")}
            disabled={isSaving}
            className="inline-flex items-center gap-2"
          >
            <FiEye className="w-4 h-4" />
            Preview
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => handleGenerateReport("word")}
            disabled={isSaving}
            className="inline-flex items-center gap-2"
          >
            <FiDownload className="w-4 h-4" />
            Word
          </Button>
          <Button
            size="sm"
            onClick={handleSave}
            disabled={isSaving || !hasDraftChanges}
            className="inline-flex items-center gap-2"
          >
            <FiSave className="w-4 h-4" />
            {isSaving ? "Saving..." : "Save"}
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className="md:hidden p-2 hover:bg-gray-100 rounded-lg"
        >
          <FiMenu className="w-6 h-6 text-gray-600" />
        </button>
      </div>

      {/* Mobile Menu Drawer */}
      <Drawer
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        side="right"
        title="Actions"
      >
        <div className="space-y-2 p-4">
          <Button
            variant="secondary"
            onClick={() => {
              handleGenerateReport("pdf");
              setIsMobileMenuOpen(false);
            }}
            disabled={isSaving}
            className="w-full justify-center"
          >
            <FiEye className="w-4 h-4 mr-2" />
            Preview
          </Button>
          <Button
            variant="secondary"
            onClick={() => {
              handleGenerateReport("word");
              setIsMobileMenuOpen(false);
            }}
            disabled={isSaving}
            className="w-full justify-center"
          >
            <FiDownload className="w-4 h-4 mr-2" />
            Download Word
          </Button>
          <Button
            onClick={() => {
              handleSave();
              setIsMobileMenuOpen(false);
            }}
            disabled={isSaving || !hasDraftChanges}
            className="w-full justify-center"
          >
            <FiSave className="w-4 h-4 mr-2" />
            {isSaving ? "Saving..." : "Save"}
          </Button>
        </div>
      </Drawer>

      {/* Content Layout (Sidebar + Main) */}
      <div className="flex flex-1 overflow-hidden pt-16">
        {/* Sidebar - Hidden on mobile, collapsible on desktop */}
        <div className="hidden lg:block shrink-0">
          <SectionSidebar
            sections={sectionProgress}
            activeSection={activeSection}
            onSectionClick={setActiveSection}
            isCollapsed={isSidebarCollapsed}
            onToggleCollapse={toggleSidebar}
          />
        </div>

        {/* Main Content */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Progress Bar */}
          <div className="shrink-0 bg-linear-to-r from-indigo-50 to-white border-b border-gray-200 p-4 sm:p-6">
            <CompletionProgress
              completed={checklist.completedItems}
              total={checklist.totalItems}
              size="lg"
              showLabel={true}
            />
          </div>

          {/* Error Message */}
          {saveError && (
            <div className="shrink-0 mx-4 mt-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              {saveError}
            </div>
          )}

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-10 space-y-8">
              {/* Section Header */}
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  {currentSectionProgress?.displayName ?? activeSection}
                </h2>
                {currentSectionMeta?.description && (
                  <p className="text-sm text-gray-500 mb-2">{currentSectionMeta.description}</p>
                )}
                {currentSectionProgress && (
                  <p className="text-gray-600">
                    {currentSectionProgress.completedItems} of {currentSectionProgress.totalItems}{" "}
                    items completed in this section
                  </p>
                )}
                <p className="text-xs text-gray-500 mt-2">
                  {isSaving
                    ? "Saving changes..."
                    : hasDraftChanges
                      ? "You have unsaved changes"
                      : lastSavedAt
                        ? `Last saved at ${new Date(lastSavedAt).toLocaleTimeString()}`
                        : "All changes saved"}
                </p>
              </div>

              {/* Items Grid */}
              <div className="space-y-6">
                {currentSectionItems.length > 0 ? (
                  renderChecklistTree(currentSectionItems)
                ) : (
                  <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-gray-600">No items in this section yet</p>
                  </div>
                )}
              </div>

              {/* Navigation Buttons */}
              <div className="flex justify-between pt-8 border-t border-gray-200">
                <Button
                  variant="secondary"
                  onClick={() => {
                    const sectionIndex = sectionProgress.findIndex(
                      (s) => s.section === activeSection,
                    );
                    if (sectionIndex > 0) {
                      setActiveSection(sectionProgress[sectionIndex - 1].section);
                    }
                  }}
                >
                  Previous Section
                </Button>

                <Button
                  onClick={() => {
                    const sectionIndex = sectionProgress.findIndex(
                      (s) => s.section === activeSection,
                    );
                    if (sectionIndex < sectionProgress.length - 1) {
                      setActiveSection(sectionProgress[sectionIndex + 1].section);
                    }
                  }}
                >
                  Next Section
                </Button>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Sample Answer Modal */}
      <SampleAnswerModal isOpen={showSampleModal} onClose={closeSample} data={sampleAnswerData} />
    </div>
  );
};

export default ChecklistEditor;
