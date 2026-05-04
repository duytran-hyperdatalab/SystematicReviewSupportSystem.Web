import React from "react";
import type { StudySelectionChecklistTemplate } from "../../../../../types/studySelectionChecklistTemplate";
import { PreviewDocument } from "../../../../../components/ui/document-editor/PreviewDocument";

interface ChecklistTemplatePreviewProps {
  template: StudySelectionChecklistTemplate;
}

export const ChecklistTemplatePreview: React.FC<ChecklistTemplatePreviewProps> = ({
  template
}) => {
  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-black text-slate-800 tracking-tight">
            Document Preview
          </h3>
          <p className="text-slate-500 font-medium text-sm">
            Review the layout and content of your master eligibility checklist
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        <PreviewDocument template={template} />
      </div>
    </div>
  );
};
