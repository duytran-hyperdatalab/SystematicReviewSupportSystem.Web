export type Step = 1 | 2 | 3 | 4 | 5;
export type ViewMode = "wizard" | "summary" | "edit";

export type ScopeForm = {
  objectives: string;
  domain: string;
};

export type PicoCForm = {
  population: string;
  intervention: string;
  comparator: string;
  outcome: string;
  context: string;
};

export type EditableResearchQuestion = {
  id: string | null;
  questionText: string;
};

export type SetupSnapshot = {
  topic: string;
  language: string;
  scope: ScopeForm;
  picoc: PicoCForm;
  researchQuestions: EditableResearchQuestion[];
};

export interface AIProjectSetupWizardProps {
  embedded?: boolean;
  projectId?: string;
  onSetupSaved?: () => void;
}
