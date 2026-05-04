import { useState, useCallback, useMemo } from "react";
import {
  type ChecklistItemResponse,
  type ChecklistSection,
  type ChecklistSectionGroup,
  type ReviewChecklist,
} from "../types/checklist";

const toDisplaySectionName = (value?: string | ChecklistSection | null): string => {
  const raw = (value ?? "").trim();
  if (!raw) {
    return "Other Information";
  }

  const normalized = raw.replace(/_/g, " ").toLowerCase();
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
};

const toChecklistSection = (value?: string | ChecklistSection | null): ChecklistSection => {
  const raw = (value ?? "").trim();
  return (raw || "OTHER_INFORMATION") as ChecklistSection;
};

/**
 * Hook for managing checklist state, grouping, and calculations
 */
export function useChecklistData(checklist: ReviewChecklist | null) {
  const [draftChanges, setDraftChanges] = useState<Map<string, Partial<ChecklistItemResponse>>>(
    new Map(),
  );

  const getSectionKey = (section?: string | ChecklistSection | null): ChecklistSection => {
    return toChecklistSection(section);
  };

  const orderedSections = useMemo(() => {
    return (checklist?.sections ?? [])
      .slice()
      .sort((a, b) => a.order - b.order)
      .map((section) => getSectionKey(section.section));
  }, [checklist?.sections]);

  const sectionDisplayNameByKey = useMemo(() => {
    const fromChecklist = new Map<ChecklistSection, string>();

    (checklist?.sections ?? []).forEach((section) => {
      const key = getSectionKey(section.section);
      fromChecklist.set(key, section.displayName || toDisplaySectionName(section.section));
    });

    return fromChecklist;
  }, [checklist?.sections]);

  /**
   * Get all responses organized by section
   */
  const sectionGroups = useMemo(() => {
    if (!checklist) return [];

    const groups: Map<ChecklistSection, ChecklistSectionGroup> = new Map();

    orderedSections.forEach((section) => {
      groups.set(section, {
        section,
        displayName: sectionDisplayNameByKey.get(section) ?? toDisplaySectionName(section),
        items: [],
        completedCount: 0,
        totalCount: 0,
      });
    });

    checklist.responses.forEach((response) => {
      const section = getSectionKey(response.section);
      const group = groups.get(section);

      if (!group) {
        groups.set(section, {
          section,
          displayName: sectionDisplayNameByKey.get(section) ?? toDisplaySectionName(section),
          items: [],
          completedCount: 0,
          totalCount: 0,
        });
      }

      const resolvedGroup = groups.get(section);
      if (!resolvedGroup) {
        return;
      }

      resolvedGroup.items.push({
        id: response.itemTemplateId,
        itemNumber: response.itemNumber,
        topic: response.topic,
        description: response.description ?? "",
        section,
        isRequired: response.isRequired ?? true,
        isSubItem: Boolean(response.parentId),
        parentId: response.parentId ?? undefined,
        defaultSampleAnswer: response.defaultSampleAnswer ?? undefined,
        order: response.order ?? 0,
        hasLocationField: response.hasLocationField,
        isSectionHeaderOnly: response.isSectionHeaderOnly,
        hasChildren: response.hasChildren,
        canRespond: response.canRespond,
        response,
      });

      const isEligibleLeaf = response.canRespond === true && response.hasChildren !== true;
      if (isEligibleLeaf) {
        resolvedGroup.totalCount += 1;
      }

      if (isEligibleLeaf && response.isCompleted) {
        resolvedGroup.completedCount += 1;
      }
    });

    return Array.from(groups.values()).filter((group) => group.totalCount > 0);
  }, [checklist, orderedSections, sectionDisplayNameByKey]);

  /**
   * Calculate progress for all sections
   */
  const sectionProgress = useMemo(() => {
    if (!checklist) return [];

    return orderedSections.map((section) => {
      const sectionResponses = checklist.responses.filter(
        (response) => getSectionKey(response.section) === section,
      );

      const eligibleResponses = sectionResponses.filter(
        (response) => response.canRespond === true && response.hasChildren !== true,
      );

      const completedCount = eligibleResponses.filter((r) => r.isCompleted).length;
      const totalCount = eligibleResponses.length;
      const completionPercentage =
        totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

      return {
        section,
        displayName: sectionDisplayNameByKey.get(section) ?? toDisplaySectionName(section),
        totalItems: totalCount,
        completedItems: completedCount,
        requiredItems: 0,
        completedRequired: 0,
        completionPercentage,
      };
    });
  }, [checklist, orderedSections, sectionDisplayNameByKey]);

  /**
   * Update a single item response and track changes
   */
  const updateItemResponse = useCallback(
    (itemTemplateId: string, updates: Partial<ChecklistItemResponse>) => {
      setDraftChanges((prev) => {
        const newChanges = new Map(prev);
        const existing = newChanges.get(itemTemplateId) || {};
        newChanges.set(itemTemplateId, { ...existing, ...updates });
        return newChanges;
      });
    },
    [],
  );

  /**
   * Get combined response (backend data + draft changes)
   */
  const getItemResponse = useCallback(
    (itemTemplateId: string): ChecklistItemResponse | undefined => {
      const originalResponse = checklist?.responses.find(
        (r) => r.itemTemplateId === itemTemplateId,
      );
      const draftChange = draftChanges.get(itemTemplateId);

      if (!originalResponse && !draftChange) return undefined;

      return {
        ...originalResponse,
        ...draftChange,
      } as ChecklistItemResponse;
    },
    [checklist?.responses, draftChanges],
  );

  /**
   * Clear all draft changes (after successful save)
   */
  const clearDraftChanges = useCallback(() => {
    setDraftChanges(new Map());
  }, []);

  /**
   * Clear draft changes for one item (after successful item save)
   */
  const clearDraftChange = useCallback((itemTemplateId: string) => {
    setDraftChanges((prev) => {
      if (!prev.has(itemTemplateId)) return prev;
      const next = new Map(prev);
      next.delete(itemTemplateId);
      return next;
    });
  }, []);

  /**
   * Check if there are unsaved changes
   */
  const hasDraftChanges = useMemo(() => {
    return draftChanges.size > 0;
  }, [draftChanges]);

  /**
   * Check if an item has unsaved draft updates
   */
  const hasDraftChange = useCallback(
    (itemTemplateId: string) => draftChanges.has(itemTemplateId),
    [draftChanges],
  );

  /**
   * Get all changes ready to submit
   */
  const getDraftChangesToSubmit = useCallback(() => {
    return Array.from(draftChanges.entries()).map(([itemTemplateId, changes]) => ({
      itemTemplateId,
      ...changes,
    }));
  }, [draftChanges]);

  return {
    sectionGroups,
    sectionProgress,
    draftChanges,
    updateItemResponse,
    getItemResponse,
    clearDraftChanges,
    clearDraftChange,
    hasDraftChanges,
    hasDraftChange,
    getDraftChangesToSubmit,
  };
}

/**
 * Hook for managing checklist editor UI state
 */
export function useChecklistEditorState() {
  const [activeSection, setActiveSection] = useState<ChecklistSection>("TITLE");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setError] = useState<string | null>(null);
  const [showSampleModal, setShowSampleModal] = useState(false);
  const [selectedSampleItem, setSelectedSampleItem] = useState<string | null>(null);

  const handleSetActiveSection = useCallback((section: ChecklistSection) => {
    setActiveSection(section);
    setError(null);
  }, []);

  const handleSetSaving = useCallback((saving: boolean) => {
    setIsSaving(saving);
    setError(null);
  }, []);

  const handleSetError = useCallback((error: string | null) => {
    setError(error);
  }, []);

  const handleShowSample = useCallback((itemId: string) => {
    setSelectedSampleItem(itemId);
    setShowSampleModal(true);
  }, []);

  const handleCloseSample = useCallback(() => {
    setShowSampleModal(false);
    setSelectedSampleItem(null);
  }, []);

  return {
    activeSection,
    isSidebarCollapsed,
    isSaving,
    saveError,
    showSampleModal,
    selectedSampleItem,
    setActiveSection: handleSetActiveSection,
    toggleSidebar: () => setIsSidebarCollapsed((prev) => !prev),
    setSaving: handleSetSaving,
    setError: handleSetError,
    showSample: handleShowSample,
    closeSample: handleCloseSample,
  };
}
