import api from "../config/axios";
import type { AxiosResponse } from "axios";
import type {
  ExtractionTemplateDto,
  ExtractionTemplateResponseDto,
  ExtractionSectionDto,
  ExtractionFieldDto,
  ExtractionMatrixColumnDto,
  FieldOptionDto,
  SectionTypeEnum,
  DataItemDefinitionExtended,
  FieldOption,
} from "../types/dataExtraction";
import type { MatrixSectionData } from "../types/templateWizard";
import type { WizardSection } from "../types/templateWizard";
import { SectionTypeEnum as TemplateSectionTypeEnum } from "../types/dataExtraction";
import {
  FRONTEND_TO_BACKEND_TYPE,
  BACKEND_TO_FRONTEND_TYPE,
} from "../constants/dataExtraction";
import { TEMPLATE_SECTIONS } from "../constants/templateSections";

interface ApiResponse<T> {
  isSuccess: boolean;
  message: string;
  data?: T;
  errors?: Array<{ code: string; message: string }>;
}

const GUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function normalizeNullableGuid(value: string | null | undefined): string | null {
  if (value === null || value === undefined) {
    return null;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  // Frontend temporary ids must never be sent to Guid? fields.
  if (trimmed.startsWith("temp_") || trimmed.startsWith("opt_")) {
    return null;
  }

  // Backend expects Guid? for id fields. Non-GUID strings should be null.
  if (!GUID_REGEX.test(trimmed)) {
    return null;
  }

  return trimmed;
}

function handleResponse<T>(response: AxiosResponse<ApiResponse<T>>): T {
  const { data } = response;

  if (!data.isSuccess) {
    const errorMessage = data.errors?.map((e) => e.message).join(", ") || data.message;
    throw new Error(errorMessage);
  }

  if (data.data === undefined) {
    throw new Error("Response data is missing");
  }

  return data.data;
}

// ==================== MAPPING FUNCTIONS ====================

function mapFieldOptionToBackend(option: FieldOption): FieldOptionDto {
  return {
    optionId: normalizeNullableGuid(option.option_id),
    fieldId: normalizeNullableGuid(option.field_id),
    value: option.option_value,
    displayOrder: option.display_order,
  };
}

function mapFieldOptionFromBackend(dto: FieldOptionDto): FieldOption {
  return {
    option_id: dto.optionId || "",
    field_id: dto.fieldId || "",
    option_value: dto.value,
    display_order: dto.displayOrder,
  };
}

function mapExtractionFieldToBackend(
  field: DataItemDefinitionExtended
): ExtractionFieldDto {
  return {
    fieldId: normalizeNullableGuid(field.data_item_id),
    sectionId: normalizeNullableGuid(field.form_id),
    parentFieldId: normalizeNullableGuid(field.parent_field_id),
    name: field.name,
    instruction: field.description || undefined,
    fieldType: FRONTEND_TO_BACKEND_TYPE[field.data_type],
    isRequired: field.is_required,
    orderIndex: field.display_order,
    options: (field.options || []).map(mapFieldOptionToBackend),
    subFields: (field.subItems || []).map(mapExtractionFieldToBackend),
  };
}

function mapExtractionFieldFromBackend(
  dto: ExtractionFieldDto,
  formId: string
): DataItemDefinitionExtended {
  return {
    data_item_id: dto.fieldId || "",
    form_id: formId,
    parent_field_id: dto.parentFieldId ?? undefined,
    name: dto.name,
    data_type: BACKEND_TO_FRONTEND_TYPE[dto.fieldType] || "Text",
    description: dto.instruction || "",
    is_required: dto.isRequired,
    display_order: dto.orderIndex,
    options: dto.options.map(mapFieldOptionFromBackend),
    subItems: dto.subFields.map((sub) => mapExtractionFieldFromBackend(sub, formId)),
  };
}

function sanitizeFieldForBackend(field: ExtractionFieldDto): ExtractionFieldDto {
  return {
    ...field,
    fieldId: normalizeNullableGuid(field.fieldId),
    templateId: normalizeNullableGuid(field.templateId),
    sectionId: normalizeNullableGuid(field.sectionId),
    parentFieldId: normalizeNullableGuid(field.parentFieldId),
    options: (field.options || []).map((opt) => ({
      ...opt,
      optionId: normalizeNullableGuid(opt.optionId),
      fieldId: normalizeNullableGuid(opt.fieldId),
    })),
    subFields: (field.subFields || []).map(sanitizeFieldForBackend),
  };
}

function mapTemplateSectionType(type: "flat" | "matrix"): SectionTypeEnum {
  return type === "matrix"
    ? TemplateSectionTypeEnum.MatrixGrid
    : TemplateSectionTypeEnum.FlatForm;
}

function sanitizeSectionForBackend(section: ExtractionSectionDto): ExtractionSectionDto {
  const matrixColumns =
    section.sectionType === TemplateSectionTypeEnum.MatrixGrid
      ? (section.matrixColumns || []).map((column) => ({
          ...column,
          columnId: normalizeNullableGuid(column.columnId),
        }))
      : undefined;

  return {
    ...section,
    sectionId: normalizeNullableGuid(section.sectionId),
    templateId: normalizeNullableGuid(section.templateId),
    linkedResearchQuestionId: normalizeNullableGuid(section.linkedResearchQuestionId),
    isPicoc: section.isPicoc ?? false,
    fields: (section.fields || []).map(sanitizeFieldForBackend),
    matrixColumns,
  };
}

function buildSectionsFromLegacyFields(
  fields: ExtractionFieldDto[]
): ExtractionSectionDto[] {
  const grouped = new Map<string, ExtractionFieldDto[]>();

  for (const field of fields || []) {
    const sectionId = field.sectionId || "identification";
    const list = grouped.get(sectionId) || [];
    list.push(field);
    grouped.set(sectionId, list);
  }

  const sections = [...TEMPLATE_SECTIONS]
    .sort((a, b) => a.orderIndex - b.orderIndex)
    .map((section) => ({
      name: section.name,
      orderIndex: section.orderIndex,
      sectionType: mapTemplateSectionType(section.type),
      fields: grouped.get(section.id) || [],
    }))
    .filter((section) => section.fields.length > 0);

  return sections.length > 0
    ? sections
    : [
        {
          name: "Identification",
          orderIndex: 1,
          sectionType: TemplateSectionTypeEnum.FlatForm,
          fields,
        },
      ];
}

function mapExtractionTemplateToBackend(
  template: ExtractionTemplateDto
): ExtractionTemplateDto {
  const resolvedProcessId =
    template.dataExtractionProcessId ||
    (template as unknown as { protocolId?: string }).protocolId ||
    "";

  const sections = template.sections && template.sections.length > 0
    ? template.sections
    : buildSectionsFromLegacyFields(template.fields || []);

  return {
    templateId: normalizeNullableGuid(template.templateId),
    dataExtractionProcessId: resolvedProcessId,
    name: template.name,
    description: template.description,
    sections: sections.map(sanitizeSectionForBackend),
  };
}

function normalizeTemplateFromBackend(template: ExtractionTemplateDto): ExtractionTemplateDto {
  return {
    ...template,
    dataExtractionProcessId:
      template.dataExtractionProcessId ||
      (template as unknown as { protocolId?: string }).protocolId ||
      "",
  };
}

function normalizeTemplateResponseFromBackend(
  template: ExtractionTemplateResponseDto
): ExtractionTemplateResponseDto {
  return {
    ...template,
    dataExtractionProcessId:
      template.dataExtractionProcessId ||
      (template as unknown as { protocolId?: string }).protocolId ||
      "",
  };
}

/**
 * Deep sanitizer for upsert payloads.
 * Converts empty/whitespace/undefined/non-guid id values to null for Guid? fields.
 */
export function sanitizeTemplatePayloadForUpsert(
  template: ExtractionTemplateDto
): ExtractionTemplateDto {
  return mapExtractionTemplateToBackend(template);
}

// ==================== API SERVICE ====================

export const dataExtractionTemplateService = {
  /**
   * Create or Update extraction template
   * @param template - Template data (with or without templateId for update/create)
   * @returns Created/Updated template with server-generated IDs
   */
  async upsert(template: ExtractionTemplateDto): Promise<ExtractionTemplateResponseDto> {
    const payload = sanitizeTemplatePayloadForUpsert(template);

    const response = await api.post<ApiResponse<ExtractionTemplateResponseDto>>(
      "/data-extraction/templates/upsert",
      payload
    );

    return normalizeTemplateResponseFromBackend(handleResponse(response));
  },

  /**
   * Get all templates for a data extraction process
   * @param processId - Data Extraction Process ID
   * @returns Array of templates
   */
  async getByProcessId(processId: string): Promise<ExtractionTemplateDto[]> {
    const response = await api.get<ApiResponse<ExtractionTemplateDto[]>>(
      `/data-extraction/process/${processId}/templates`
    );

    return handleResponse(response).map(normalizeTemplateFromBackend);
  },

  /**
   * Get template detail by ID
   * @param templateId - Template ID
   * @returns Template with full field tree structure
   */
  async getById(templateId: string): Promise<ExtractionTemplateDto> {
    const response = await api.get<ApiResponse<ExtractionTemplateDto>>(
      `/data-extraction/templates/${templateId}`
    );

    return normalizeTemplateFromBackend(handleResponse(response));
  },

  /**
   * Delete template
   * @param templateId - Template ID to delete
   */
  async delete(templateId: string): Promise<void> {
    const response = await api.delete<ApiResponse<void>>(
      `/data-extraction/templates/${templateId}`
    );

    handleResponse(response);
  },

};

// ==================== HELPER FUNCTIONS FOR FRONTEND ====================

/**
 * Convert DataItemDefinitionExtended array to ExtractionTemplateDto
 * Used when saving form data to backend
 */
export function dataItemsToTemplate(
  dataItems: DataItemDefinitionExtended[],
  dataExtractionProcessId: string,
  templateName: string,
  templateDescription?: string,
  templateId?: string,
  matrixDataMap?: Map<string, MatrixSectionData>
  ,
  wizardSections?: WizardSection[]
): ExtractionTemplateDto {
  // ✅ Debug logging
  console.log("🔍 dataItemsToTemplate called with:", {
    dataItemsCount: dataItems.length,
    dataExtractionProcessId,
    templateName,
    templateId,
  });

  // ✅ Filter root-level items only (no parent_field_id)
  const rootItems = (dataItems || []).filter((item) => !item.parent_field_id);

  console.log("🔍 Root items count:", rootItems.length);

  // Group by wizard section id (form_id)
  const groupedItems = new Map<string, DataItemDefinitionExtended[]>();
  for (const item of rootItems) {
    const sectionId = item.form_id || "identification";
    const items = groupedItems.get(sectionId) || [];
    items.push(item);
    groupedItems.set(sectionId, items);
  }

  const mapMatrixColumns = (sectionId: string): ExtractionMatrixColumnDto[] => {
    const columns = matrixDataMap?.get(sectionId)?.columns || [];
    return columns.map((columnName, index) => ({
      name: columnName,
      orderIndex: index + 1,
    }));
  };

  const sectionsFromWizard: ExtractionSectionDto[] = (wizardSections || [])
    .slice()
    .sort((a, b) => a.orderIndex - b.orderIndex)
    .map((section) => {
      const sectionItems = [...(groupedItems.get(section.id) || [])].sort(
        (a, b) => a.display_order - b.display_order
      );

      return {
        sectionId: section.id,
        name: section.name,
        orderIndex: section.orderIndex,
        sectionType: section.sectionType,
        isPicoc: section.isPicoc ?? false,
        linkedResearchQuestionId: section.linkedResearchQuestionId ?? null,
        fields: sectionItems.map((item, index) =>
          mapExtractionFieldToBackend({
            ...item,
            display_order: index + 1,
          })
        ),
        matrixColumns:
          section.sectionType === TemplateSectionTypeEnum.MatrixGrid
            ? mapMatrixColumns(section.id)
            : undefined,
      };
    });

  const sectionsFallback: ExtractionSectionDto[] = [...TEMPLATE_SECTIONS]
    .sort((a, b) => a.orderIndex - b.orderIndex)
    .map((section) => {
      const sectionType = mapTemplateSectionType(section.type);
      const sectionItems = [...(groupedItems.get(section.id) || [])].sort(
        (a, b) => a.display_order - b.display_order
      );

      return {
        name: section.name,
        orderIndex: section.orderIndex,
        sectionType,
        fields: sectionItems.map((item, index) =>
          mapExtractionFieldToBackend({
            ...item,
            display_order: index + 1,
          })
        ),
        matrixColumns:
          sectionType === TemplateSectionTypeEnum.MatrixGrid
            ? mapMatrixColumns(section.id)
            : undefined,
      };
    });

  const sections = sectionsFromWizard.length > 0 ? sectionsFromWizard : sectionsFallback;

  const fieldCount = sections.reduce(
    (sum, section) => sum + section.fields.length,
    0
  );
  const matrixColumnCount = sections.reduce(
    (sum, section) => sum + (section.matrixColumns?.length || 0),
    0
  );

  console.log("🔍 Mapped sections:", {
    sectionCount: sections.length,
    fieldCount,
    matrixColumnCount,
  });

  return {
    templateId,
    dataExtractionProcessId,
    name: templateName || "Untitled Template",
    description: templateDescription,
    sections,
    // Legacy fallback for old consumers that still read template.fields.
    fields: sections.flatMap((section) => section.fields),
  };
}

/**
 * Convert ExtractionTemplateDto to DataItemDefinitionExtended array
 * Used when loading template data from backend
 */
export function templateToDataItems(
  template: ExtractionTemplateDto,
  formId: string
): DataItemDefinitionExtended[] {
  const normalizedTemplate = {
    ...template,
    dataExtractionProcessId:
      template.dataExtractionProcessId ||
      (template as unknown as { protocolId?: string }).protocolId ||
      "",
  };

  // New API shape: template.sections[].fields[]
  if (normalizedTemplate.sections && normalizedTemplate.sections.length > 0) {
    const sectionNameToId = new Map(
      TEMPLATE_SECTIONS.map((section) => [section.name, section.id])
    );

    return normalizedTemplate.sections.flatMap((section) => {
      const targetFormId =
        section.sectionId ||
        sectionNameToId.get(section.name) ||
        formId;

      return (section.fields || []).map((field) =>
        mapExtractionFieldFromBackend(field, targetFormId)
      );
    });
  }

  // Legacy fallback: template.fields[]
  return (normalizedTemplate.fields || []).map((field) =>
    mapExtractionFieldFromBackend(field, formId)
  );
}