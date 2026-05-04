import type { DataItemDefinitionExtended, ExtractionTemplateDto } from "./dataExtraction";
import type { SectionTypeEnum } from "./dataExtraction";

export type WizardStep = 1 | 2 | 3 | 4;

export interface WizardState {
  currentStep: WizardStep;
  sectionInProgress: string | null;
  sections: WizardSection[];
  sectionData: Map<string, DataItemDefinitionExtended[]>;
  templateMeta: {
    name: string;
    description: string;
  };
  matrixData: Map<string, MatrixSectionData>;
}

export interface WizardSection {
  id: string;
  name: string;
  orderIndex: number;
  sectionType: SectionTypeEnum;
  isPicoc?: boolean;
  linkedResearchQuestionId?: string | null;
  isLockedName?: boolean;
  isLegacy?: boolean;
}

export interface MatrixSectionData {
  rows: string[];
  columns: string[];
}

export interface WizardContextType {
  state: WizardState;
  goToStep: (step: WizardStep) => void;
  startSectionSetup: (sectionId: string) => void;
  updateSectionData: (sectionId: string, items: DataItemDefinitionExtended[]) => void;
  updateMatrixData: (sectionId: string, data: MatrixSectionData) => void;
  updateTemplateMeta: (name: string, description: string) => void;
  getCompletedTemplate: () => ExtractionTemplateDto | null;
  resetWizard: () => void;
}