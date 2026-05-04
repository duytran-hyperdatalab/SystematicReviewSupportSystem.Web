/** A structured preset field definition with explicit type and options. */
export interface PresetFieldDef {
  name: string;
  /** Backend FieldType enum: 0=Text,1=Integer,2=Decimal,3=Boolean,4=SingleSelect,5=MultiSelect */
  fieldType: 0 | 1 | 2 | 3 | 4 | 5;
  isRequired: boolean;
  options: Array<{ value: string; displayOrder: number }>;
  orderIndex?: number;
}

export interface TemplateSection {
  id: string;
  name: string;
  displayName?: string;
  description: string;
  type: "flat" | "matrix";
  orderIndex: number;
  presetFieldDefs?: PresetFieldDef[];
  predefinedRowDefs?: PresetFieldDef[];
  predefinedCols?: string[];
}

export const TEMPLATE_SECTIONS: TemplateSection[] = [
  {
    id: "identification",
    name: "Identification",
    description: "Study identification and research goals",
    type: "flat",
    orderIndex: 1,
    presetFieldDefs: [
      {
        name: "Study Title",
        fieldType: 0, // Text
        isRequired: true,
        orderIndex: 1,
        options: [],
      },
      {
        name: "Author",
        fieldType: 0, // Text
        isRequired: false,
        orderIndex: 2,
        options: [],
      },
      {
        name: "Publication Year",
        fieldType: 1, // Integer (Testing Integer)
        isRequired: true,
        orderIndex: 3,
        options: [],
      },
      {
        name: "Is Peer Reviewed?",
        fieldType: 3, // Boolean (Testing Boolean)
        isRequired: false,
        orderIndex: 4,
        options: [],
      },
      {
        name: "Publication Type",
        fieldType: 4, // SingleSelect
        isRequired: true,
        orderIndex: 5,
        options: [
          { value: "Journal", displayOrder: 1 },
          { value: "Conference", displayOrder: 2 },
          { value: "Workshop/Symposium", displayOrder: 3 },
          { value: "Book Chapter", displayOrder: 4 },
        ],
      },
      {
        name: "DOI/URL",
        fieldType: 0, // Text
        isRequired: false,
        orderIndex: 6,
        options: [],
      },
    ],
  },
  {
    id: "context_subjects",
    name: "Context & Subjects",
    displayName: "Context & Subjects (PICOC - P & C)",
    description: "Environment, subjects, and artifacts analyzed in the study",
    type: "flat",
    orderIndex: 2,
    presetFieldDefs: [
      {
        name: "Context Setting",
        fieldType: 4, // SingleSelect
        isRequired: true,
        orderIndex: 1,
        options: [
          { value: "Industry / Commercial", displayOrder: 1 },
          { value: "Academia / Laboratory", displayOrder: 2 },
          { value: "Open Source Software (OSS)", displayOrder: 3 },
          { value: "Mixed (Industry + OSS)", displayOrder: 4 },
        ],
      },
      {
        name: "Number of Repositories/Projects Analyzed",
        fieldType: 1, // Integer (Testing Integer)
        isRequired: false,
        orderIndex: 2,
        options: [],
      },
      {
        name: "Total Lines of Code (KLOC)",
        fieldType: 2, // Decimal (Testing Decimal)
        isRequired: false,
        orderIndex: 3,
        options: [],
      },
      {
        name: "Has Public Replication Package/Dataset?",
        fieldType: 3, // Boolean (Testing Boolean)
        isRequired: false,
        orderIndex: 4,
        options: [],
      },
      {
        name: "Software Artifacts Analyzed",
        fieldType: 5, // MultiSelect
        isRequired: false,
        orderIndex: 5,
        options: [
          { value: "Source Code", displayOrder: 1 },
          { value: "Issue/Bug Reports", displayOrder: 2 },
          { value: "Version Control Commits/PRs", displayOrder: 3 },
          { value: "Execution Logs / Traces", displayOrder: 4 },
          { value: "Requirements / Specs", displayOrder: 5 },
        ],
      },
    ],
  },
  {
    id: "methods",
    name: "Methodology",
    description: "Study design, execution, and threats to validity",
    type: "flat",
    orderIndex: 3,
    presetFieldDefs: [
      {
        name: "Empirical Method",
        fieldType: 4, // SingleSelect
        isRequired: true,
        orderIndex: 1,
        options: [
          { value: "Controlled Experiment", displayOrder: 1 },
          { value: "Case Study", displayOrder: 2 },
          { value: "Survey / Questionnaire", displayOrder: 3 },
          { value: "Mining Software Repositories (MSR)", displayOrder: 4 },
          { value: "Literature Review (SLR/SMS)", displayOrder: 5 },
        ],
      },
      {
        name: "Study Duration (Months)",
        fieldType: 2, // Decimal (Testing Decimal)
        isRequired: false,
        orderIndex: 2,
        options: [],
      },
      {
        name: "Used Statistical Significance Testing? (e.g., p-value, Wilcoxon)",
        fieldType: 3, // Boolean (Testing Boolean)
        isRequired: false,
        orderIndex: 3,
        options: [],
      },
      {
        name: "Threats to Validity Highlighted",
        fieldType: 0, // Text
        isRequired: false,
        orderIndex: 4,
        options: [],
      },
    ],
  },
  {
    id: "interventions",
    name: "Interventions & Comparisons",
    displayName: "Interventions (PICOC - I & C)",
    description: "The proposed approach/tool and what it is compared against",
    type: "flat",
    orderIndex: 4,
    presetFieldDefs: [
      {
        name: "Name of Proposed Tool/Method",
        fieldType: 0, // Text
        isRequired: false,
        orderIndex: 1,
        options: [],
      },
      {
        name: "Is Proposed Tool Open Source?",
        fieldType: 3, // Boolean (Testing Boolean)
        isRequired: false,
        orderIndex: 2,
        options: [],
      },
      {
        name: "Number of Baseline Models Compared Against",
        fieldType: 1, // Integer (Testing Integer)
        isRequired: false,
        orderIndex: 3,
        options: [],
      },
      {
        name: "AI/ML Utilization",
        fieldType: 4, // SingleSelect
        isRequired: true,
        orderIndex: 4,
        options: [
          { value: "Not Using AI/ML", displayOrder: 1 },
          { value: "Traditional ML (SVM, Random Forest...)", displayOrder: 2 },
          { value: "Deep Learning (CNN, RNN, LSTM...)", displayOrder: 3 },
          { value: "Large Language Models (LLMs, GPT...)", displayOrder: 4 },
        ],
      },
      {
        name: "SDLC Phase Targeted",
        fieldType: 5, // MultiSelect
        isRequired: true,
        orderIndex: 5,
        options: [
          { value: "Requirements", displayOrder: 1 },
          { value: "Design & Architecture", displayOrder: 2 },
          { value: "Coding/Implementation", displayOrder: 3 },
          { value: "Testing & QA", displayOrder: 4 },
          { value: "Maintenance/DevOps", displayOrder: 5 },
        ],
      },
    ],
  },
  {
    id: "metrics_outcomes",
    name: "Metrics & Outcomes",
    displayName: "Metrics & Outcomes (PICOC - O)",
    description: "Quantitative and qualitative results of the study",
    type: "matrix",
    orderIndex: 5,
    predefinedRowDefs: [
      {
        name: "Best Accuracy / F1-Score (0.0 to 1.0)",
        fieldType: 2, // Decimal (Lý tưởng cho ma trận để so sánh các số thập phân)
        isRequired: false,
        orderIndex: 1,
        options: [],
      },
      {
        name: "Average Execution Time (Seconds)",
        fieldType: 2, // Decimal
        isRequired: false,
        orderIndex: 2,
        options: [],
      },
      {
        name: "Outperforms Baseline Significantly?",
        fieldType: 3, // Boolean (Reviewer có thể tick Yes/No cho từng thuật toán trong ma trận)
        isRequired: false,
        orderIndex: 3,
        options: [],
      },
      {
        name: "Qualitative Observations / Drawbacks",
        fieldType: 0, // Text
        isRequired: false,
        orderIndex: 4,
        options: [],
      },
    ],
    predefinedCols: ["Proposed Approach", "Baseline/State-of-the-Art"], 
  },
];