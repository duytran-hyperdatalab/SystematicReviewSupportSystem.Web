import { generateId } from "../utils/uuid";
import type {
  DataItemDefinitionExtended,
  FieldOption,
} from "../types/dataExtraction";
import type { ResearchQuestion, PICOCElement } from "../types/coreAndGovernance";

/**
 * Generates a suggested template structure based on RQs and PICOC elements
 * This creates a guided template with:
 * 1. Metadata section
 * 2. Study Context & Interventions section (for PICOC)
 * 3. One section per Research Question
 */
export interface SuggestedTemplateStructure {
  sections: Array<{
    sectionId: string;
    name: string;
    type: "flat" | "matrix";
    fields: DataItemDefinitionExtended[];
    linkedResearchQuestionId?: string;
  }>;
}

/**
 * Create metadata section with standard fields
 */
function createMetadataSection(): DataItemDefinitionExtended[] {
  const metadataFields = [
    {
      name: "Study Title",
      type: "Text" as const,
      required: true,
      order: 1,
    },
    {
      name: "Authors",
      type: "Text" as const,
      required: false,
      order: 2,
    },
    {
      name: "Publication Year",
      type: "Number" as const,
      required: false,
      order: 3,
    },
    {
      name: "Publication Type",
      type: "SingleSelect" as const,
      required: false,
      order: 4,
      options: ["Journal Article", "Conference Paper", "Book Chapter", "Report", "Thesis"],
    },
    {
      name: "DOI/URL",
      type: "Text" as const,
      required: false,
      order: 5,
    },
  ];

  return metadataFields.map((field) => {
    const fieldId = `temp_${generateId()}`;
    const options: FieldOption[] =
      field.type === "SingleSelect" && field.options
        ? field.options.map((opt, idx) => ({
            option_id: `opt_${generateId()}`,
            field_id: fieldId,
            option_value: opt,
            display_order: idx + 1,
          }))
        : [];

    return {
      data_item_id: fieldId,
      form_id: "metadata",
      name: field.name,
      data_type: field.type,
      description: "",
      is_required: field.required,
      display_order: field.order,
      options,
      subItems: [],
    };
  });
}

/**
 * Create PICOC/study context section with fields for each PICOC element type
 */
function createPicocSection(picocElements: PICOCElement[]): DataItemDefinitionExtended[] {
  const fields: DataItemDefinitionExtended[] = [];
  const elementTypes: Array<"population" | "intervention" | "comparison" | "outcome" | "context"> = [
    "population",
    "intervention",
    "comparison",
    "outcome",
    "context",
  ];

  let orderIdx = 1;

  elementTypes.forEach((elementType) => {
    const hasElements = picocElements.some((el) => el.element_type === elementType);
    if (hasElements) {
      const fieldId = `temp_${generateId()}`;
      const label = elementType.charAt(0).toUpperCase() + elementType.slice(1);
      const description = picocElements
        .filter((el) => el.element_type === elementType)
        .map((el) => el.description)
        .join("; ");

      fields.push({
        data_item_id: fieldId,
        form_id: "study_context",
        name: `${label} Details`,
        data_type: "Text",
        description: description ? `Defined as: ${description}` : "",
        is_required: true,
        display_order: orderIdx++,
        options: [],
        subItems: [],
      });
    }
  });

  // If no specific PICOC elements, add generic PICOC fields
  if (fields.length === 0) {
    const genericPicoc = [
      { label: "Population", desc: "Describe the participant characteristics" },
      {
        label: "Intervention",
        desc: "Describe the intervention or exposure",
      },
      {
        label: "Comparison",
        desc: "Describe the comparison group/condition",
      },
      { label: "Outcome", desc: "Describe the measured outcomes" },
      { label: "Context", desc: "Describe the study context/setting" },
    ];

    return genericPicoc.map((item, idx) => {
      const fieldId = `temp_${generateId()}`;
      return {
        data_item_id: fieldId,
        form_id: "study_context",
        name: `${item.label} - ${item.desc}`,
        data_type: "Text",
        description: item.desc,
        is_required: true,
        display_order: idx + 1,
        options: [],
        subItems: [],
      };
    });
  }

  return fields;
}

/**
 * Create a section for a specific research question
 */
function createResearchQuestionSection(
  rq: ResearchQuestion,
  orderStartIndex: number
): DataItemDefinitionExtended[] {
  const fields: DataItemDefinitionExtended[] = [];

  // Main question field
  const questionFieldId = `temp_${generateId()}`;
  fields.push({
    data_item_id: questionFieldId,
    form_id: `rq_${rq.research_question_id}`,
    name: `Response to: ${rq.question_text.substring(0, 50)}...`,
    data_type: "Text",
    description: `Research Question: ${rq.question_text}`,
    is_required: true,
    display_order: orderStartIndex,
    options: [],
    subItems: [],
  });

  // Evidence/supporting data field
  const evidenceFieldId = `temp_${generateId()}`;
  fields.push({
    data_item_id: evidenceFieldId,
    form_id: `rq_${rq.research_question_id}`,
    name: `Supporting Evidence`,
    data_type: "Text",
    description: `Evidence or data supporting the answer to this research question`,
    is_required: false,
    display_order: orderStartIndex + 1,
    options: [],
    subItems: [],
  });

  // Quality/confidence assessment
  const qualityFieldId = `temp_${generateId()}`;
  fields.push({
    data_item_id: qualityFieldId,
    form_id: `rq_${rq.research_question_id}`,
    name: `Answer Confidence`,
    data_type: "SingleSelect",
    description: `Assess confidence in the answer`,
    is_required: false,
    display_order: orderStartIndex + 2,
    options: [
      {
        option_id: `opt_${generateId()}`,
        field_id: qualityFieldId,
        option_value: "High",
        display_order: 1,
      },
      {
        option_id: `opt_${generateId()}`,
        field_id: qualityFieldId,
        option_value: "Medium",
        display_order: 2,
      },
      {
        option_id: `opt_${generateId()}`,
        field_id: qualityFieldId,
        option_value: "Low",
        display_order: 3,
      },
    ],
    subItems: [],
  });

  return fields;
}

/**
 * Generate the complete suggested template structure
 */
export function generateSuggestedTemplateStructure(
  researchQuestions: ResearchQuestion[],
  picocElementsByQuestion: Record<string, PICOCElement[]>
): SuggestedTemplateStructure {
  const sections: SuggestedTemplateStructure["sections"] = [];

  // 1. Metadata section (always first)
  sections.push({
    sectionId: "metadata",
    name: "Study Metadata",
    type: "flat",
    fields: createMetadataSection(),
  });

  // 2. PICOC/Study Context section (if we have PICOC elements)
  const allPicoc = Object.values(picocElementsByQuestion).flat();
  if (allPicoc.length > 0 || researchQuestions.length > 0) {
    sections.push({
      sectionId: "study_context",
      name: "Study Context & Interventions (PICOC)",
      type: "flat",
      fields: createPicocSection(allPicoc),
    });
  }

  // 3. One section per Research Question
  researchQuestions.forEach((rq, idx) => {
    const rqSectionId = `rq_${rq.research_question_id}`;
    const rqLabel = `RQ${idx + 1}`;
    const rqTitle =
      rq.question_text.length > 40
        ? `${rqLabel}: ${rq.question_text.substring(0, 40)}...`
        : `${rqLabel}: ${rq.question_text}`;

    sections.push({
      sectionId: rqSectionId,
      name: rqTitle,
      type: "flat",
      fields: createResearchQuestionSection(rq, 1),
      linkedResearchQuestionId: rq.research_question_id,
    });
  });

  return { sections };
}

/**
 * Convert suggested structure into template wizard state
 * This populates the wizard's sectionData map with the generated sections
 */
export function convertSuggestedStructureToWizardState(
  structure: SuggestedTemplateStructure
): Map<string, DataItemDefinitionExtended[]> {
  const sectionData = new Map<string, DataItemDefinitionExtended[]>();

  structure.sections.forEach((section) => {
    sectionData.set(section.sectionId, section.fields);
  });

  return sectionData;
}
