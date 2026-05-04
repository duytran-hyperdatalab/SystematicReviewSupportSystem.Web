import { useMemo, useRef } from "react";
import { useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import ChecklistEditor from "../../components/checklist/ChecklistEditor";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import { checklistApi, downloadChecklistReport } from "../../services/checklistService";
import {
  SECTION_ORDER,
  type ChecklistItemResponse,
  type ChecklistSection,
  type ReviewChecklist,
} from "../../types/checklist";
import type {
  ChecklistItemTemplateDto,
  ChecklistTemplateDetailDto,
  ChecklistItemResponseDto,
  ReviewChecklistDto,
  UpdateChecklistItemDto,
} from "../../types/checklistApi";
import { toastError, toastSuccess } from "../../utils/toast";

const toChecklistSection = (value?: string | null): ChecklistSection => {
  const raw = (value ?? "").trim();
  if (!raw) {
    return "OTHER_INFORMATION";
  }

  const normalized = raw.toUpperCase().replace(/\s+/g, "_");
  if (SECTION_ORDER.includes(normalized as ChecklistSection)) {
    return normalized as ChecklistSection;
  }

  // Preserve non-PRISMA section names from API (e.g., BACKGROUND) so UI can render them distinctly.
  return normalized as ChecklistSection;
};

const isResponseEligibleLeaf = ({
  canRespond,
  hasChildren,
}: {
  canRespond: boolean;
  hasChildren: boolean;
}) => {
  return canRespond && !hasChildren;
};

const mapTemplateSampleAnswers = (template?: ChecklistTemplateDetailDto | null) => {
  const sampleAnswerById = new Map<string, string | null>();

  template?.items.forEach((item: ChecklistItemTemplateDto) => {
    sampleAnswerById.set(item.id, item.defaultSampleAnswer ?? null);
  });

  return sampleAnswerById;
};

const mapChecklistResponseItem = (
  item: ChecklistItemResponseDto,
  reviewChecklistId: string,
  sampleAnswers: Map<string, string | null>,
  completionPercentage: number,
): ChecklistItemResponse => ({
  id: item.responseId ?? item.itemTemplateId,
  checklistId: reviewChecklistId,
  itemTemplateId: item.itemTemplateId,
  itemNumber: item.itemNumber,
  topic: item.topic,
  section: toChecklistSection(item.section),
  parentId: item.parentId,
  description: item.description,
  hasLocationField: item.hasLocationField,
  isSectionHeaderOnly: item.isSectionHeaderOnly,
  hasChildren: item.hasChildren,
  canRespond: item.canRespond,
  defaultSampleAnswer: sampleAnswers.get(item.itemTemplateId) ?? null,
  reportLocation: item.location ?? "",
  isReported: item.isReported,
  isCompleted: item.isCompleted,
  lastUpdated: item.lastUpdatedAt ?? new Date().toISOString(),
  lastUpdatedAt: item.lastUpdatedAt ?? undefined,
  completionPercentage,
  children: item.children.map((child) =>
    mapChecklistResponseItem(child, reviewChecklistId, sampleAnswers, completionPercentage),
  ),
});

const flattenChecklistTree = (items: ChecklistItemResponse[]): ChecklistItemResponse[] => {
  return items.flatMap((item) => [item, ...flattenChecklistTree(item.children ?? [])]);
};

const mapChecklist = (
  checklist: ReviewChecklistDto,
  template?: ChecklistTemplateDetailDto | null,
): ReviewChecklist => {
  const sampleAnswers = mapTemplateSampleAnswers(template);
  const checklistCompletionPercentage = checklist.completionPercentage;

  const mappedSections = checklist.sections
    .slice()
    .sort((a, b) => a.order - b.order)
    .map((section) => ({
      sectionId: section.sectionId ?? null,
      sectionNumber: section.sectionNumber,
      section: toChecklistSection(section.section),
      displayName: section.sectionNumber
        ? `${section.sectionNumber}. ${section.section}`
        : section.section,
      description: section.description ?? null,
      order: section.order,
      items: section.items.map((item) =>
        mapChecklistResponseItem(
          item,
          checklist.reviewChecklistId,
          sampleAnswers,
          checklistCompletionPercentage,
        ),
      ),
    }));

  const flatResponses = flattenChecklistTree(mappedSections.flatMap((section) => section.items));
  const eligibleItems = flatResponses.filter((item) =>
    isResponseEligibleLeaf({
      canRespond: Boolean(item.canRespond),
      hasChildren: Boolean(item.hasChildren),
    }),
  );
  const completedEligibleItems = eligibleItems.filter((item) => item.isCompleted);

  return {
    id: checklist.reviewChecklistId,
    projectId: checklist.reviewId,
    reviewId: checklist.reviewId,
    templateId: checklist.templateId,
    templateName: checklist.templateName,
    templateType: checklist.templateType,
    typeName: checklist.typeName,
    title: checklist.reviewTitle,
    createdAt: checklist.lastUpdatedAt,
    updatedAt: checklist.lastUpdatedAt,
    responses: flatResponses,
    sections: mappedSections,
    completionPercentage: checklist.completionPercentage,
    totalItems: eligibleItems.length,
    completedItems: completedEligibleItems.length,
  };
};

export default function ChecklistEditorPage() {
  const { checklistId } = useParams<{ checklistId: string }>();
  const queryClient = useQueryClient();
  const lastSaveToastAtRef = useRef<number>(0);
  const activeChecklistId = checklistId || "";

  const checklistQuery = useQuery<ReviewChecklistDto | null>({
    queryKey: ["review-checklist", activeChecklistId],
    queryFn: async () => {
      if (!activeChecklistId) return null;
      try {
        return await checklistApi.getChecklistById(activeChecklistId);
      } catch (error) {
        const status = (error as { response?: { status?: number } }).response?.status;
        if (status === 404) return null;
        throw error;
      }
    },
    enabled: Boolean(activeChecklistId),
    retry: false,
  });

  const templateQuery = useQuery<ChecklistTemplateDetailDto | null>({
    queryKey: ["checklist-template", checklistQuery.data?.templateId],
    queryFn: async () => {
      if (!checklistQuery.data?.templateId) return null;
      return checklistApi.getTemplateById(checklistQuery.data.templateId);
    },
    enabled: Boolean(checklistQuery.data?.templateId),
  });

  const checklist = useMemo(() => {
    if (!checklistQuery.data) return null;
    return mapChecklist(checklistQuery.data, templateQuery.data);
  }, [checklistQuery.data, templateQuery.data]);

  const saveItemMutation = useMutation({
    mutationFn: async (payload: { itemId: string; update: UpdateChecklistItemDto }) => {
      if (!activeChecklistId) {
        throw new Error("Missing checklist id");
      }

      return checklistApi.updateChecklistItem(activeChecklistId, payload.itemId, payload.update);
    },
    onError: (error) => {
      toastError(
        "Save failed",
        error instanceof Error ? error.message : "Unable to save checklist item",
      );
    },
  });

  const handleSave = async (
    changes: Array<{
      itemTemplateId: string;
      content?: string;
      reportLocation?: string;
      isReported?: boolean;
      isNotApplicable?: boolean;
      isNotReported?: boolean;
    }>,
  ) => {
    if (!checklistQuery.data) return;

    const itemByTemplateId = new Map(
      checklistQuery.data.items.map((item) => [item.itemTemplateId, item]),
    );

    const eligibleChanges = changes.filter((change) => {
      const item = itemByTemplateId.get(change.itemTemplateId);
      if (!item) {
        return false;
      }

      return isResponseEligibleLeaf({ canRespond: item.canRespond, hasChildren: item.hasChildren });
    });

    if (eligibleChanges.length === 0) {
      return;
    }

    await Promise.all(
      eligibleChanges.map((change) => {
        const item = itemByTemplateId.get(change.itemTemplateId);
        const isReportToggleOnly =
          item?.hasLocationField === false && item?.isSectionHeaderOnly === false;

        const update: UpdateChecklistItemDto = isReportToggleOnly
          ? {
              isReported: change.isReported ?? item?.isReported ?? false,
            }
          : {
              location: change.reportLocation ?? null,
            };

        return saveItemMutation.mutateAsync({
          itemId: change.itemTemplateId,
          update,
        });
      }),
    );

    await queryClient.invalidateQueries({ queryKey: ["review-checklist", activeChecklistId] });

    const now = Date.now();
    if (now - lastSaveToastAtRef.current > 15000) {
      toastSuccess("Checklist saved", "Your checklist responses have been synchronized.");
      lastSaveToastAtRef.current = now;
    }
  };

  const reportMutation = useMutation({
    mutationFn: async (format: "word" | "pdf") => {
      if (!activeChecklistId) {
        throw new Error("Missing checklist id");
      }

      const blob = await checklistApi.generateReport(activeChecklistId, {
        includeOnlyCompletedItems: format === "pdf",
      });
      downloadChecklistReport(blob, activeChecklistId);
    },
    onSuccess: () => {
      toastSuccess("Report generated", "The checklist report download has started.");
    },
    onError: (error) => {
      toastError(
        "Report generation failed",
        error instanceof Error ? error.message : "Unable to generate report",
      );
    },
  });

  if (checklistQuery.isLoading || (checklistQuery.data && templateQuery.isLoading)) {
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
      </div>
    );
  }

  return (
    <ChecklistEditor
      checklist={checklist}
      isLoading={checklistQuery.isLoading}
      onSave={handleSave}
      onGenerateReport={(format) => reportMutation.mutateAsync(format)}
    />
  );
}
