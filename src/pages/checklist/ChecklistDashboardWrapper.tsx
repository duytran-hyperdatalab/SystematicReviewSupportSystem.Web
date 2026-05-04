import { useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import ChecklistDashboardPage from "../../pages/checklist/ChecklistDashboard";
import { checklistApi } from "../../services/checklistService";
import { type ReviewChecklist } from "../../types/checklist";
import type {
  ChecklistTemplateSummaryDto,
  ReviewChecklistSummaryDto,
} from "../../types/checklistApi";
import { toastError, toastSuccess } from "../../utils/toast";

const mapReviewChecklistSummary = (checklist: ReviewChecklistSummaryDto): ReviewChecklist => ({
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
  responses: [],
  completionPercentage: checklist.completionPercentage,
  totalItems: checklist.itemCount,
  completedItems: Math.round((checklist.itemCount * checklist.completionPercentage) / 100),
});

export default function ChecklistDashboardPageWrapper() {
  const { projectId } = useParams<{ projectId: string }>();
  const queryClient = useQueryClient();
  const reviewId = projectId || "";

  const templatesQuery = useQuery<ChecklistTemplateSummaryDto[]>({
    queryKey: ["checklist-templates"],
    queryFn: () => checklistApi.getTemplates(),
  });

  const checklistQuery = useQuery<ReviewChecklistSummaryDto[]>({
    queryKey: ["review-checklists", reviewId],
    queryFn: async () => {
      if (!reviewId) return [];
      return checklistApi.getReviewChecklists(reviewId);
    },
    enabled: Boolean(reviewId),
  });

  const createChecklistMutation = useMutation({
    mutationFn: async (templateId: string) => {
      if (!reviewId) {
        throw new Error("Missing review id");
      }
      return checklistApi.cloneTemplateToReview(reviewId, { templateId });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["review-checklists", reviewId] });
      toastSuccess("Checklist created", "The PRISMA checklist is ready for editing.");
    },
    onError: (error) => {
      toastError(
        "Checklist creation failed",
        error instanceof Error ? error.message : "Unable to create checklist from template",
      );
    },
  });

  const checklistCards = (checklistQuery.data ?? []).map(mapReviewChecklistSummary);

  return (
    <ChecklistDashboardPage
      projectId={reviewId}
      checklists={checklistCards}
      templates={templatesQuery.data ?? []}
      isLoading={checklistQuery.isLoading || templatesQuery.isLoading}
      onCreateChecklist={async (templateId) => {
        await createChecklistMutation.mutateAsync(templateId);
      }}
    />
  );
}
