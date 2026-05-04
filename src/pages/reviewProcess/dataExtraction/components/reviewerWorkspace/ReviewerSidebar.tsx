import { ArrowLeft } from "lucide-react";
import Button from "../../../../../components/ui/Button";
import {
  SectionTypeEnum,
  type ExtractionSectionDto,
} from "../../../../../types/dataExtraction";
import { getSectionId } from "./reviewerFormUtils.tsx";

interface ReviewerSidebarProps {
  sections: ExtractionSectionDto[];
  activeSectionId: string;
  selectedTemplateName: string;
  isAutoExtracting: boolean;
  isSubmittingExtraction: boolean;
  canAutoExtract: boolean;
  canSubmit: boolean;
  isReadOnly?: boolean;
  submitButtonLabel?: string;
  onAutoExtract: () => void;
  onSectionChange: (sectionId: string) => void;
  onBack: () => void;
  onSubmitExtraction: () => void;
}

export default function ReviewerSidebar({
  sections,
  activeSectionId,
  selectedTemplateName,
  isAutoExtracting,
  isSubmittingExtraction,
  canAutoExtract,
  canSubmit,
  isReadOnly = false,
  submitButtonLabel,
  onAutoExtract,
  onSectionChange,
  onBack,
  onSubmitExtraction,
}: ReviewerSidebarProps) {
  return (
    <aside className="h-full w-[20%] overflow-y-auto border-x border-slate-200 bg-white p-4 pb-24">
      <Button
        type="button"
        onClick={onAutoExtract}
        isLoading={isAutoExtracting}
        disabled={!canAutoExtract}
        className="mb-4 w-full border-0 bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 text-white shadow-lg shadow-violet-500/30 hover:from-indigo-500 hover:via-violet-500 hover:to-fuchsia-500"
      >
        ✨ Auto-Extract with AI
      </Button>

      <div className="mb-4 border-b border-slate-100 pb-4">
        <h2 className="text-2xl font-semibold text-slate-800">Sections</h2>
        <p className="mt-1 text-sm text-slate-500">
          {selectedTemplateName || "Extraction Template"}
        </p>
      </div>

      <div className="space-y-2">
        {sections.map((section) => {
          const sectionId = getSectionId(section);
          const isActive = sectionId === activeSectionId;

          return (
            <button
              key={sectionId}
              type="button"
              onClick={() => onSectionChange(sectionId)}
              className={
                isActive
                  ? "w-full rounded-xl border border-blue-500 bg-blue-50 px-4 py-3 text-left text-xl font-semibold text-blue-700"
                  : "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-left text-xl font-semibold text-slate-600"
              }
            >
              <div className="flex items-center justify-between gap-3">
                <span>{section.name}</span>
                <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  {section.sectionType === SectionTypeEnum.MatrixGrid
                    ? "Matrix"
                    : "Flat"}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-5 space-y-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="w-full justify-start"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>

        <Button
          type="button"
          variant="success"
          className="w-full"
          isLoading={isSubmittingExtraction}
          disabled={!canSubmit}
          onClick={onSubmitExtraction}
        >
          {isReadOnly ? "Submitted (Locked)" : submitButtonLabel ?? "Submit Extraction"}
        </Button>
      </div>
    </aside>
  );
}
