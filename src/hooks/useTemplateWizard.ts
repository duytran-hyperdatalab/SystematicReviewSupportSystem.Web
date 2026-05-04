import { useCallback, useState } from "react";
import type { ResearchQuestion } from "../types/coreAndGovernance";
import type {
  DataItemDefinitionExtended,
  ExtractionTemplateDto,
  ExtractionTemplateResponseDto,
  SectionTypeEnum,
} from "../types/dataExtraction";
import { SectionTypeEnum as SectionType } from "../types/dataExtraction";
import type {
  MatrixSectionData,
  WizardSection,
  WizardState,
  WizardStep,
} from "../types/templateWizard";
import { dataItemsToTemplate } from "../services/dataExtractionService";
import { generateId } from "../utils/uuid";

interface UseTemplateWizardProps {
  dataExtractionProcessId: string;
  existingTemplate?: ExtractionTemplateDto | ExtractionTemplateResponseDto | null;
}

function getSectionStep(sectionType: SectionTypeEnum): WizardStep {
  return sectionType === SectionType.MatrixGrid ? 3 : 2;
}

function mapTemplateSectionsToWizardSections(
  template: ExtractionTemplateDto | ExtractionTemplateResponseDto
): WizardSection[] {
  const sections = (template.sections || []).slice().sort((a, b) => a.orderIndex - b.orderIndex);

  return sections.map((section, index) => ({
    id: section.sectionId || `legacy_${index + 1}_${generateId()}`,
    name: section.name,
    orderIndex: section.orderIndex || index + 1,
    sectionType: section.sectionType,
    isPicoc: section.isPicoc ?? false,
    linkedResearchQuestionId: section.linkedResearchQuestionId ?? null,
    isLockedName: Boolean(section.isPicoc || section.linkedResearchQuestionId),
    isLegacy: !section.isPicoc && !section.linkedResearchQuestionId,
  }));
}

function mapTemplateFieldsToSectionData(
  template: ExtractionTemplateDto | ExtractionTemplateResponseDto,
  sections: WizardSection[]
): Map<string, DataItemDefinitionExtended[]> {
  const sectionData = new Map<string, DataItemDefinitionExtended[]>();

  for (const section of template.sections || []) {
    const wizardSection = sections.find((s) => s.name === section.name && s.orderIndex === section.orderIndex);
    if (!wizardSection) {
      continue;
    }

    const items: DataItemDefinitionExtended[] = (section.fields || []).map((field, index) => ({
      data_item_id: field.fieldId || `temp_${generateId()}`,
      form_id: wizardSection.id,
      parent_field_id: field.parentFieldId ?? undefined,
      name: field.name,
      data_type: field.fieldType === 1 || field.fieldType === 2
        ? "Number"
        : field.fieldType === 3
        ? "Boolean"
        : field.fieldType === 4
        ? "SingleSelect"
        : field.fieldType === 5
        ? "MultiSelect"
        : "Text",
      description: field.instruction || "",
      is_required: field.isRequired,
      display_order: field.orderIndex || index + 1,
      options: (field.options || []).map((opt, optIdx) => ({
        option_id: opt.optionId || `opt_${generateId()}`,
        field_id: field.fieldId || `temp_${generateId()}`,
        option_value: opt.value,
        display_order: opt.displayOrder || optIdx + 1,
      })),
      subItems: [],
    }));

    sectionData.set(wizardSection.id, items);
  }

  return sectionData;
}

function createSuggestedPicocFields(sectionId: string): DataItemDefinitionExtended[] {
  return [
    {
      data_item_id: `temp_${generateId()}`,
      form_id: sectionId,
      name: "Study Title",
      data_type: "Text",
      description: "Title of the study.",
      is_required: false,
      display_order: 1,
      options: [],
      subItems: [],
    },
    {
      data_item_id: `temp_${generateId()}`,
      form_id: sectionId,
      name: "Author",
      data_type: "Text",
      description: "Author of the study.",
      is_required: false,
      display_order: 2,
      options: [],
      subItems: [],
    },
    {
      data_item_id: `temp_${generateId()}`,
      form_id: sectionId,
      name: "Publication Venue (e.g., icse, tse, fse)",
      data_type: "Text",
      description: "Journal in which the study was published.",
      is_required: false,
      display_order: 3,
      options: [],
      subItems: [],
    },
    {
      data_item_id: `temp_${generateId()}`,
      form_id: sectionId,
      name: "Year",
      data_type: "Number",
      description: "Year of publication.",
      is_required: false,
      display_order: 4,
      options: [],
      subItems: [],
    },

    {
      data_item_id: `temp_${generateId()}`,
      form_id: sectionId,
      name: "Population",
      data_type: "Text",
      description: "Study population or participant group.",
      is_required: false,
      display_order: 5,
      options: [],
      subItems: [],
    },
    {
      data_item_id: `temp_${generateId()}`,
      form_id: sectionId,
      name: "Context",
      data_type: "Text",
      description: "Setting, environment, or problem context.",
      is_required: false,
      display_order: 6,
      options: [],
      subItems: [],
    },
    {
      data_item_id: `temp_${generateId()}`,
      form_id: sectionId,
      name: "Intervention",
      data_type: "Text",
      description: "Intervention, treatment, or approach under study.",
      is_required: false,
      display_order: 7,
      options: [],
      subItems: [],
    },
    {
      data_item_id: `temp_${generateId()}`,
      form_id: sectionId,
      name: "Comparison",
      data_type: "Text",
      description: "Comparator, baseline, or alternative approach.",
      is_required: false,
      display_order: 8,
      options: [],
      subItems: [],
    },
    {
      data_item_id: `temp_${generateId()}`,
      form_id: sectionId,
      name: "Outcome",
      data_type: "Text",
      description: "Outcome, effect, or result to extract.",
      is_required: false,
      display_order: 9,
      options: [],
      subItems: [],
    },
  ];
}

export function useTemplateWizard({ dataExtractionProcessId, existingTemplate }: UseTemplateWizardProps) {
  const [state, setState] = useState<WizardState>(() => {
    if (existingTemplate && existingTemplate.sections && existingTemplate.sections.length > 0) {
      const sections = mapTemplateSectionsToWizardSections(existingTemplate);
      const sectionData = mapTemplateFieldsToSectionData(existingTemplate, sections);

      return {
        currentStep: 1,
        sectionInProgress: null,
        sections,
        sectionData,
        templateMeta: {
          name: existingTemplate.name || "",
          description: existingTemplate.description || "",
        },
        matrixData: new Map(),
      };
    }

    return {
      currentStep: 1,
      sectionInProgress: null,
      sections: [],
      sectionData: new Map(),
      templateMeta: {
        name: "",
        description: "",
      },
      matrixData: new Map(),
    };
  });

  const goToStep = useCallback((step: WizardStep) => {
    setState((prev) => ({ ...prev, currentStep: step }));
  }, []);

  const initializeSectionsForNewTemplate = useCallback((researchQuestions: ResearchQuestion[]) => {
    setState((prev) => {
      if (prev.sections.length > 0) {
        return prev;
      }

      const picocSection: WizardSection = {
        id: `temp_section_${generateId()}`,
        name: "PICOC & Study Metadata",
        orderIndex: 1,
        sectionType: SectionType.FlatForm,
        isPicoc: true,
        linkedResearchQuestionId: null,
        isLockedName: true,
      };

      const picocFields = createSuggestedPicocFields(picocSection.id);

      const rqSections: WizardSection[] = researchQuestions.map((rq, index) => ({
        id: `temp_section_${generateId()}`,
        name: `RQ${index + 1}: ${rq.question_text}`,
        orderIndex: index + 2,
        sectionType: SectionType.FlatForm,
        isPicoc: false,
        linkedResearchQuestionId: rq.research_question_id,
        isLockedName: true,
      }));

      return {
        ...prev,
        sections: [picocSection, ...rqSections],
        sectionData: new Map([[picocSection.id, picocFields]]),
        templateMeta: {
          name: prev.templateMeta.name || "RQ-Driven Extraction Template",
          description:
            prev.templateMeta.description ||
            "Template initialized from PICOC context and project Research Questions.",
        },
      };
    });
  }, []);

  const startSectionSetup = useCallback((sectionId: string) => {
    setState((prev) => {
      const section = prev.sections.find((s) => s.id === sectionId);
      if (!section) {
        return prev;
      }

      return {
        ...prev,
        sectionInProgress: sectionId,
        currentStep: getSectionStep(section.sectionType),
      };
    });
  }, []);

  const updateSectionData = useCallback((sectionId: string, items: DataItemDefinitionExtended[]) => {
    setState((prev) => {
      const next = new Map(prev.sectionData);
      next.set(sectionId, items);
      return { ...prev, sectionData: next };
    });
  }, []);

  const updateMatrixData = useCallback((sectionId: string, data: MatrixSectionData) => {
    setState((prev) => {
      const next = new Map(prev.matrixData);
      next.set(sectionId, data);
      return { ...prev, matrixData: next };
    });
  }, []);

  const updateTemplateMeta = useCallback((name: string, description: string) => {
    setState((prev) => ({
      ...prev,
      templateMeta: { name, description },
    }));
  }, []);

  const getCompletedTemplate = useCallback(
    (overrideName?: string, overrideDescription?: string): ExtractionTemplateDto | null => {
      const templateName = overrideName?.trim() || state.templateMeta.name.trim();
      const templateDescription = overrideDescription ?? state.templateMeta.description;

      if (!templateName) {
        return null;
      }

      const allItems = state.sections.flatMap((section) => {
        const items = state.sectionData.get(section.id) || [];
        return items
          .slice()
          .sort((a, b) => a.display_order - b.display_order)
          .map((item, index) => ({
            ...item,
            form_id: section.id,
            display_order: index + 1,
          }));
      });

      if (allItems.length === 0) {
        return null;
      }

      return dataItemsToTemplate(
        allItems,
        dataExtractionProcessId,
        templateName,
        templateDescription,
        existingTemplate?.templateId || undefined,
        state.matrixData,
        state.sections
      );
    },
    [dataExtractionProcessId, existingTemplate?.templateId, state]
  );

  const resetWizard = useCallback(() => {
    setState({
      currentStep: 1,
      sectionInProgress: null,
      sections: [],
      sectionData: new Map(),
      templateMeta: {
        name: "",
        description: "",
      },
      matrixData: new Map(),
    });
  }, []);

  return {
    state,
    goToStep,
    initializeSectionsForNewTemplate,
    startSectionSetup,
    updateSectionData,
    updateMatrixData,
    updateTemplateMeta,
    getCompletedTemplate,
    resetWizard,
  };
}
