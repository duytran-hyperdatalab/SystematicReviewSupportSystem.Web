import { useMemo, useState } from "react";
import { FiArrowLeft, FiCheck, FiFileText, FiLoader, FiTarget } from "react-icons/fi";
import type { ResearchQuestion } from "../../../../../types/coreAndGovernance";
import type { ExtractionTemplateDto, ExtractionTemplateResponseDto } from "../../../../../types/dataExtraction";
import type { WizardState } from "../../../../../types/templateWizard";
import {
  dataExtractionTemplateService,
  sanitizeTemplatePayloadForUpsert,
} from "../../../../../services/dataExtractionService";
import {
  dismissToast,
  toastError,
  toastLoading,
  toastSuccess,
  toastWarning,
} from "../../../../../utils/toast";
import Input from "../../../../ui/Input";
import Label from "../../../../ui/Label";
import Textarea from "../../../../ui/Textarea";

interface Step4_PreviewProps {
  state: WizardState;
  onPublish: (savedTemplate: ExtractionTemplateResponseDto) => void;
  onBack: () => void;
  getCompletedTemplate: (name?: string, description?: string) => ExtractionTemplateDto | null;
  isViewOnly?: boolean;
  researchQuestions?: ResearchQuestion[];
}

export default function Step4_Preview({
  state,
  onPublish,
  onBack,
  getCompletedTemplate,
  isViewOnly = false,
}: Step4_PreviewProps) {
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishError, setPublishError] = useState<string | null>(null);
  const [templateName, setTemplateName] = useState(state.templateMeta.name);
  const [templateDescription, setTemplateDescription] = useState(state.templateMeta.description);

  const totalFields = useMemo(
    () => Array.from(state.sectionData.values()).reduce((sum, items) => sum + items.length, 0),
    [state.sectionData]
  );

  const completedSections = useMemo(() => {
    const configured = state.sections.filter((section) => {
      const flatItems = state.sectionData.get(section.id) || [];
      const matrix = state.matrixData.get(section.id);
      return flatItems.length > 0 || Boolean(matrix?.rows.length);
    });
    return configured.length;
  }, [state.matrixData, state.sectionData, state.sections]);

  const handlePublish = async () => {
    if (isViewOnly) {
      toastWarning(
        "Read-only Mode",
        "Only project leaders can create, update, or delete extraction templates."
      );
      return;
    }

    if (!templateName.trim()) {
      setPublishError("Template name is required");
      return;
    }

    setIsPublishing(true);
    setPublishError(null);
    const loadingToastId = toastLoading("Publishing template", "Saving extraction template...");

    try {
      const template = getCompletedTemplate(templateName, templateDescription);
      const isUpdateAction = Boolean(template?.templateId);

      if (!template) {
        throw new Error("Please add at least one field before publishing the template.");
      }

      const sanitizedPayload = sanitizeTemplatePayloadForUpsert(template);
      const savedTemplate = await dataExtractionTemplateService.upsert(sanitizedPayload);

      toastSuccess(
        isUpdateAction ? "Template Updated" : "Template Created",
        "Data extraction template has been published successfully."
      );

      onPublish(savedTemplate);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to publish template";
      setPublishError(message);
      toastError("Publish Failed", message);
    } finally {
      dismissToast(loadingToastId);
      setIsPublishing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Template Preview</h2>
        <p className="text-gray-600">Review your RQ-driven sections and fields before publishing.</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Template Information</h3>
        <div className="space-y-4">
          <div>
            <Label htmlFor="template_name">
              Template Name <span className="text-red-600">*</span>
            </Label>
            <Input
              id="template_name"
              value={templateName}
              onChange={(e) => {
                setTemplateName(e.target.value);
                setPublishError(null);
              }}
              placeholder="e.g., RQ-Driven Software Testing Extraction Template"
              className={publishError && !templateName.trim() ? "border-red-500 focus:ring-red-500" : ""}
            />
          </div>

          <div>
            <Label htmlFor="template_description">Description (Optional)</Label>
            <Textarea
              id="template_description"
              value={templateDescription}
              onChange={(e) => setTemplateDescription(e.target.value)}
              placeholder="Briefly describe scope and intent of this extraction template"
              rows={3}
            />
          </div>
        </div>
      </div>

      {publishError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-700 whitespace-pre-wrap">{publishError}</p>
        </div>
      )}

      <div className="space-y-6">
        {state.sections.map((section) => {
          const flatItems = state.sectionData.get(section.id) || [];
          const matrixData = state.matrixData.get(section.id);
          const isConfigured = flatItems.length > 0 || Boolean(matrixData?.rows.length);

          if (!isConfigured) {
            return null;
          }

          return (
            <div key={section.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-lg font-semibold text-gray-900">{section.name}</h3>
                  {section.isPicoc ? (
                    <span className="px-2 py-0.5 text-xs rounded-full bg-sky-100 text-sky-700 font-medium inline-flex items-center gap-1">
                      <FiFileText className="w-3 h-3" />
                      Context
                    </span>
                  ) : section.linkedResearchQuestionId ? (
                    <span className="px-2 py-0.5 text-xs rounded-full bg-indigo-100 text-indigo-700 font-medium inline-flex items-center gap-1">
                      <FiTarget className="w-3 h-3" />
                      RQ Linked
                    </span>
                  ) : section.isLegacy ? (
                    <span className="px-2 py-0.5 text-xs rounded-full bg-amber-100 text-amber-700 font-medium">
                      Legacy
                    </span>
                  ) : null}
                </div>
              </div>

              <div className="p-6">
                {flatItems.length > 0 && (
                  <div className="space-y-4">
                    {flatItems.map((item, idx) => (
                      <div
                        key={item.data_item_id}
                        className="pb-4 border-b border-gray-200 last:border-b-0"
                      >
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <label className="font-medium text-gray-900">{`${idx + 1}. ${item.name}`}</label>
                          {item.is_required && <span className="text-red-600 font-bold">*</span>}
                          <span className="inline-block px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                            {item.data_type}
                          </span>
                        </div>

                        {item.description && <p className="text-sm text-gray-600 mb-2">{item.description}</p>}

                        <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                          {item.data_type === "Text" && (
                            <input
                              type="text"
                              disabled
                              placeholder="Text input..."
                              className="w-full px-3 py-2 border border-gray-300 rounded bg-white text-gray-400"
                            />
                          )}
                          {item.data_type === "Number" && (
                            <input
                              type="number"
                              disabled
                              placeholder="0"
                              className="w-full px-3 py-2 border border-gray-300 rounded bg-white text-gray-400"
                            />
                          )}
                          {item.data_type === "Boolean" && (
                            <div className="flex gap-4">
                              <label className="flex items-center gap-2">
                                <input type="radio" disabled className="w-4 h-4" />
                                <span>Yes</span>
                              </label>
                              <label className="flex items-center gap-2">
                                <input type="radio" disabled className="w-4 h-4" />
                                <span>No</span>
                              </label>
                            </div>
                          )}
                          {(item.data_type === "SingleSelect" || item.data_type === "MultiSelect") && (
                            <div className="space-y-2">
                              {item.options?.map((opt) => (
                                <label key={opt.option_id} className="flex items-center gap-2">
                                  <input
                                    type={item.data_type === "SingleSelect" ? "radio" : "checkbox"}
                                    disabled
                                    className="w-4 h-4"
                                  />
                                  <span>{opt.option_value}</span>
                                </label>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {matrixData && matrixData.rows.length > 0 && matrixData.columns.length > 0 && (
                  <div className="overflow-x-auto mt-4">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-indigo-50">
                          <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900">
                            Row
                          </th>
                          {matrixData.columns.map((column, index) => (
                            <th
                              key={`${section.id}_col_${index}`}
                              className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900"
                            >
                              {column}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {matrixData.rows.map((row, rowIndex) => (
                          <tr key={`${section.id}_row_${rowIndex}`}>
                            <td className="border border-gray-300 px-4 py-3 font-medium text-gray-900">
                              {row}
                            </td>
                            {matrixData.columns.map((_, colIndex) => (
                              <td
                                key={`${section.id}_cell_${rowIndex}_${colIndex}`}
                                className="border border-gray-300 px-4 py-3"
                              />
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
        <h4 className="font-semibold text-gray-900 mb-2">Summary</h4>
        <ul className="space-y-1 text-sm text-gray-700">
          <li>
            • Sections configured: <strong>{completedSections}/{state.sections.length}</strong>
          </li>
          <li>
            • Total fields: <strong>{totalFields}</strong>
          </li>
          <li>
            • Template name: <strong>{templateName.trim() || "Not set"}</strong>
          </li>
        </ul>
      </div>

      <div className="flex gap-3 justify-between">
        <button
          onClick={onBack}
          disabled={isPublishing}
          className="flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium transition disabled:opacity-50"
        >
          <FiArrowLeft className="w-4 h-4" />
          Back to Overview
        </button>
        <button
          onClick={handlePublish}
          disabled={isPublishing || !templateName.trim()}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition ${
            isPublishing || !templateName.trim()
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-green-600 text-white hover:bg-green-700"
          }`}
        >
          {isPublishing ? (
            <>
              <FiLoader className="w-4 h-4 animate-spin" />
              Publishing...
            </>
          ) : (
            <>
              <FiCheck className="w-4 h-4" />
              Publish Template
            </>
          )}
        </button>
      </div>
    </div>
  );
}
