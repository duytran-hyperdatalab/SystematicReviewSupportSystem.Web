import { useState } from "react";
import { FiArrowLeft, FiCheck, FiLock, FiPlus, FiTrash2 } from "react-icons/fi";
import { Loader2, Sparkles } from "lucide-react";
import api from "../../../../../config/axios";
import type { ResearchQuestion } from "../../../../../types/coreAndGovernance";
import type { DataItemDefinitionExtended, DataItemType, ExtractionFieldDto, FieldOption } from "../../../../../types/dataExtraction";
import type { WizardSection } from "../../../../../types/templateWizard";
import { getErrorMessage } from "../../../../../utils/errorUtils";
import { toastWarning } from "../../../../../utils/toast";
import { toastError, toastSuccess } from "../../../../../utils/toast";
import { generateId } from "../../../../../utils/uuid";
import Input from "../../../../ui/Input";
import Label from "../../../../ui/Label";
import Textarea from "../../../../ui/Textarea";

interface Step2_FlatSetupProps {
  section: WizardSection | undefined;
  initialItems?: DataItemDefinitionExtended[];
  onComplete: (items: DataItemDefinitionExtended[]) => void;
  onBack: () => void;
  researchQuestions?: ResearchQuestion[];
}

interface FieldEditorState {
  id: string;
  name: string;
  fieldType: 0 | 1 | 2 | 3 | 4 | 5;
  required: boolean;
  description: string;
  options: Array<{ id: string; value: string }>;
}

interface ApiResponse<T> {
  isSuccess: boolean;
  message: string;
  data?: T;
  errors?: Array<{ code: string; message: string }>;
}

const FIELD_TYPES: Array<{ value: 0 | 1 | 2 | 3 | 4 | 5; label: string }> = [
  { value: 0, label: "Text" },
  { value: 1, label: "Number (Integer)" },
  { value: 2, label: "Number (Decimal)" },
  { value: 3, label: "Yes/No" },
  { value: 4, label: "Single Select" },
  { value: 5, label: "Multi Select" },
];

function mapFieldTypeToDataType(fieldType: 0 | 1 | 2 | 3 | 4 | 5): DataItemType {
  switch (fieldType) {
    case 1:
    case 2:
      return "Number";
    case 3:
      return "Boolean";
    case 4:
      return "SingleSelect";
    case 5:
      return "MultiSelect";
    default:
      return "Text";
  }
}

function mapDataTypeToFieldType(dataType: DataItemType): 0 | 1 | 2 | 3 | 4 | 5 {
  switch (dataType) {
    case "Number":
      return 1;
    case "Boolean":
      return 3;
    case "SingleSelect":
      return 4;
    case "MultiSelect":
      return 5;
    default:
      return 0;
  }
}

function mapInitialItemsToEditableFields(initialItems: DataItemDefinitionExtended[]): FieldEditorState[] {
  return initialItems
    .slice()
    .sort((a, b) => a.display_order - b.display_order)
    .map((item) => ({
      id: item.data_item_id,
      name: item.name,
      fieldType: mapDataTypeToFieldType(item.data_type),
      required: item.is_required,
      description: item.description || "",
      options: (item.options || []).map((opt) => ({
        id: opt.option_id,
        value: opt.option_value,
      })),
    }));
}

function mapSuggestedFieldToEditorState(field: ExtractionFieldDto): FieldEditorState {
  return {
    id: `temp_${generateId()}`,
    name: field.name,
    fieldType: field.fieldType >= 0 && field.fieldType <= 5 ? field.fieldType : 0,
    required: field.isRequired,
    description: field.instruction || "",
    options: (field.options || []).map((opt) => ({
      id: `opt_${generateId()}`,
      value: opt.value,
    })),
  };
}

export default function Step2_FlatSetup({
  section,
  initialItems = [],
  onComplete,
  onBack,
  researchQuestions = [],
}: Step2_FlatSetupProps) {
  const [customFields, setCustomFields] = useState<FieldEditorState[]>(
    mapInitialItemsToEditableFields(initialItems)
  );
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [isSuggestingFields, setIsSuggestingFields] = useState(false);
  const [formState, setFormState] = useState<FieldEditorState>({
    id: "",
    name: "",
    fieldType: 0,
    required: false,
    description: "",
    options: [],
  });

  const sectionResearchQuestion = section?.linkedResearchQuestionId
    ? researchQuestions.find(
        (rq) => rq.research_question_id === section.linkedResearchQuestionId
      ) || null
    : null;

  if (!section) {
    return <div className="p-4 text-red-600">Invalid section</div>;
  }

  const handleAddCustomField = () => {
    if (!formState.name.trim()) {
      toastWarning("Validation", "Field name is required.");
      return;
    }

    const isSelectField = formState.fieldType === 4 || formState.fieldType === 5;
    if (isSelectField && formState.options.length < 2) {
      toastWarning("Validation", "Select fields must have at least 2 options.");
      return;
    }

    if (formState.options.some((opt) => !opt.value.trim())) {
      toastWarning("Validation", "Option values cannot be empty.");
      return;
    }

    setCustomFields((prev) => [
      ...prev,
      {
        ...formState,
        id: `temp_${generateId()}`,
      },
    ]);

    setFormState({
      id: "",
      name: "",
      fieldType: 0,
      required: false,
      description: "",
      options: [],
    });
    setShowCustomForm(false);
  };

  const handleRemoveCustomField = (fieldId: string) => {
    setCustomFields((prev) => prev.filter((field) => field.id !== fieldId));
  };

  const handleSuggestFields = async () => {
    if (!section.name.trim()) {
      toastWarning("Validation", "Section name is required for AI suggestions.");
      return;
    }

    if (isSuggestingFields) {
      return;
    }

    setIsSuggestingFields(true);

    try {
      const response = await api.post<ApiResponse<ExtractionFieldDto[]>>("/data-extraction/suggest-fields", {
        sectionName: section.name,
      });

      if (!response.data.isSuccess) {
        const errorMessage =
          response.data.errors?.map((error) => error.message).join(", ") ||
          response.data.message ||
          "Failed to suggest fields.";
        throw new Error(errorMessage);
      }

      const suggestedFields = (response.data.data || []).map(mapSuggestedFieldToEditorState);

      if (suggestedFields.length > 0) {
        setCustomFields((prev) => [...prev, ...suggestedFields]);
      }

      toastSuccess(
        "AI suggestions added",
        `AI suggested ${suggestedFields.length} new fields.`
      );
    } catch (error) {
      toastError("AI Suggest Failed", getErrorMessage(error, "Failed to suggest fields."));
    } finally {
      setIsSuggestingFields(false);
    }
  };

  const handleSave = () => {
    const items: DataItemDefinitionExtended[] = customFields.map((field, idx) => {
      const options: FieldOption[] = (field.options || []).map((opt, optionIdx) => ({
        option_id: opt.id,
        field_id: field.id,
        option_value: opt.value,
        display_order: optionIdx + 1,
      }));

      return {
        data_item_id: field.id,
        form_id: section.id,
        name: field.name,
        data_type: mapFieldTypeToDataType(field.fieldType),
        description: field.description,
        is_required: field.required,
        display_order: idx + 1,
        options,
        subItems: [],
      };
    });

    onComplete(items);
  };

  const hasOptionType = formState.fieldType === 4 || formState.fieldType === 5;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-lg transition">
          <FiArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-2xl font-bold text-gray-900">{section.name}</h2>
            {section.isPicoc ? (
              <span className="px-2 py-0.5 text-xs rounded-full bg-sky-100 text-sky-700 font-medium">
                Context
              </span>
            ) : section.linkedResearchQuestionId ? (
              <span className="px-2 py-0.5 text-xs rounded-full bg-indigo-100 text-indigo-700 font-medium">
                RQ Linked
              </span>
            ) : section.isLegacy ? (
              <span className="px-2 py-0.5 text-xs rounded-full bg-amber-100 text-amber-700 font-medium">
                Legacy Section
              </span>
            ) : null}
            {section.isLockedName && <FiLock className="w-4 h-4 text-gray-500" />}
          </div>
          <p className="text-sm text-gray-600 mt-1">
            {sectionResearchQuestion
              ? `This section is linked to: ${sectionResearchQuestion.question_text}`
              : section.isPicoc
              ? "Capture study metadata and PICOC context."
              : "Add extraction fields for this section."}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Fields</h3>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleSuggestFields}
              disabled={isSuggestingFields}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 hover:from-indigo-500 hover:via-violet-500 hover:to-fuchsia-500 transition shadow-sm disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSuggestingFields ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
              {isSuggestingFields ? "Suggesting..." : "Suggest Fields with AI"}
            </button>

            {!showCustomForm && (
              <button
                onClick={() => setShowCustomForm(true)}
                className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium"
              >
                <FiPlus className="w-4 h-4" />
                Add Field
              </button>
            )}
          </div>
        </div>

        {showCustomForm && (
          <div className="border-t border-gray-200 pt-4 mb-4 space-y-4">
            <div>
              <Label htmlFor="custom_name">Field Name *</Label>
              <Input
                id="custom_name"
                value={formState.name}
                onChange={(e) => setFormState((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Primary Outcome"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="custom_type">Field Type</Label>
                <select
                  id="custom_type"
                  value={formState.fieldType}
                  onChange={(e) =>
                    setFormState((prev) => ({
                      ...prev,
                      fieldType: Number(e.target.value) as 0 | 1 | 2 | 3 | 4 | 5,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  {FIELD_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-end">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formState.required}
                    onChange={(e) => setFormState((prev) => ({ ...prev, required: e.target.checked }))}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <span className="text-sm text-gray-700">Required</span>
                </label>
              </div>
            </div>

            <div>
              <Label htmlFor="custom_desc">Instruction / Description</Label>
              <Textarea
                id="custom_desc"
                value={formState.description}
                onChange={(e) =>
                  setFormState((prev) => ({ ...prev, description: e.target.value }))
                }
                placeholder="Guidance for reviewers extracting this field..."
                rows={2}
              />
            </div>

            {hasOptionType && (
              <div className="border-t border-gray-200 pt-4">
                <div className="flex items-center justify-between mb-3">
                  <Label className="mb-0">Options</Label>
                  <button
                    onClick={() => {
                      const newOption = { id: `opt_${generateId()}`, value: "" };
                      setFormState((prev) => ({ ...prev, options: [...prev.options, newOption] }));
                    }}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    + Add Option
                  </button>
                </div>

                <div className="space-y-2">
                  {formState.options.map((opt, idx) => (
                    <div key={opt.id} className="flex gap-2 items-center">
                      <span className="text-sm text-gray-500 w-6">{idx + 1}.</span>
                      <Input
                        value={opt.value}
                        onChange={(e) => {
                          const next = [...formState.options];
                          next[idx] = { ...next[idx], value: e.target.value };
                          setFormState((prev) => ({ ...prev, options: next }));
                        }}
                        placeholder="Option value"
                      />
                      <button
                        onClick={() => {
                          setFormState((prev) => ({
                            ...prev,
                            options: prev.options.filter((_, i) => i !== idx),
                          }));
                        }}
                        className="p-2 text-red-600 hover:bg-red-50 rounded"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-2 border-t border-gray-200 pt-4">
              <button
                onClick={handleAddCustomField}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition"
              >
                Add Field
              </button>
              <button
                onClick={() => setShowCustomForm(false)}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium transition"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {customFields.length > 0 && (
          <div className="space-y-3">
            {customFields.map((field) => (
              <div
                key={field.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
              >
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{field.name}</p>
                  <div className="flex gap-2 mt-1 flex-wrap">
                    <span className="inline-block px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded">
                      {mapFieldTypeToDataType(field.fieldType)}
                    </span>
                    {field.required && (
                      <span className="inline-block px-2 py-1 bg-red-100 text-red-700 text-xs rounded">
                        Required
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => handleRemoveCustomField(field.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                >
                  <FiTrash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex gap-3 justify-between">
        <button
          onClick={onBack}
          className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium transition"
        >
          Back
        </button>
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition"
        >
          <FiCheck className="w-4 h-4" />
          Save & Continue
        </button>
      </div>
    </div>
  );
}
