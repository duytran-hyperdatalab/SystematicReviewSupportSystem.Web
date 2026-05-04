/**
 * Mock data for PRISMA 2020 checklist items
 * Based on the official PRISMA 2020 guidelines
 */

import {
  ChecklistTemplate,
  ChecklistType,
  type ChecklistItemTemplate,
  type ChecklistTemplateDetail,
} from "../types/checklist";

/**
 * Sample PRISMA 2020 Main Checklist Items
 */
export const PRISMA_2020_MAIN_ITEMS: ChecklistItemTemplate[] = [
  // TITLE section
  {
    id: "item-1",
    itemNumber: "1",
    topic: "Identification as a systematic review",
    description:
      "Authors should clearly identify the systematic review in the title or abstract. For example, use phrases such as 'a systematic review', 'a meta-analysis', 'a scoping review', 'a rapid review', 'a realist review', 'a living systematic review', 'a network meta-analysis', 'a summary of findings', or 'an overview of reviews'.",
    section: "TITLE",
    isRequired: true,
    isSubItem: false,
    order: 0,
    defaultSampleAnswer:
      "Systematic Review and Meta-Analysis of the Efficacy of Exercise Interventions on Quality of Life in Patients with Heart Failure",
  },

  // ABSTRACT section
  {
    id: "item-2",
    itemNumber: "2",
    topic: "Structured summary",
    description:
      "Authors should provide a structured summary that includes: background and objectives, eligibility criteria, information sources, risk of bias assessment, data synthesis, results, and conclusions.",
    section: "ABSTRACT",
    isRequired: true,
    isSubItem: false,
    order: 1,
    defaultSampleAnswer:
      "Background: Exercise is a potential intervention for improving quality of life in heart failure patients. Objectives: To evaluate the efficacy of exercise interventions on quality of life. Eligibility criteria: RCTs comparing exercise to control. Data sources: MEDLINE, EMBASE (2000-2023). Results: 45 trials involving 3,200 participants were included. Meta-analysis showed significant improvement (MD 2.5, 95% CI 1.8-3.2). Conclusions: Exercise interventions improve quality of life in heart failure patients.",
  },

  // INTRODUCTION section
  {
    id: "item-3",
    itemNumber: "3",
    topic: "Rationale",
    description:
      "Authors should describe the rationale for the review in the context of what is already known. They might consider how the review adds to existing knowledge, whether it is an update of a previous systematic review, and whether it addresses a gap in the literature.",
    section: "INTRODUCTION",
    isRequired: true,
    isSubItem: false,
    order: 2,
  },

  {
    id: "item-4",
    itemNumber: "4",
    topic: "Objectives",
    description:
      "Authors should provide an explicit statement of the objective(s) or question(s) the systematic review addresses. For example, the objective could be stated in terms of participant populations, interventions, comparisons, outcomes, and study design (PICOS).",
    section: "INTRODUCTION",
    isRequired: true,
    isSubItem: false,
    order: 3,
  },

  // METHODS section
  {
    id: "item-5",
    itemNumber: "5",
    topic: "PICOS framework",
    description:
      "Authors should report the eligibility criteria for included studies, using the PICOS framework (Participants, Interventions, Comparisons, Outcomes, Study design).",
    section: "METHODS",
    isRequired: true,
    isSubItem: false,
    order: 4,
  },

  {
    id: "item-6",
    itemNumber: "6",
    topic: "Information sources",
    description:
      "Authors should report the information sources used (including databases, registers, websites, organizations, reference lists, and correspondence with study authors), the search dates, and any language or publication status restrictions.",
    section: "METHODS",
    isRequired: true,
    isSubItem: false,
    order: 5,
  },

  {
    id: "item-7",
    itemNumber: "7",
    topic: "Search strategy",
    description:
      "Authors should present the full search strategies for at least one major database, including any filters used. This allows readers to evaluate the comprehensiveness of the search.",
    section: "METHODS",
    isRequired: true,
    isSubItem: false,
    order: 6,
  },

  {
    id: "item-8",
    itemNumber: "8",
    topic: "Study selection process",
    description:
      "Authors should specify the process for selecting studies (such as independent review by multiple authors, consensus procedures for disagreement, etc.).",
    section: "METHODS",
    isRequired: true,
    isSubItem: false,
    order: 7,
  },

  {
    id: "item-9",
    itemNumber: "9",
    topic: "Data extraction",
    description:
      "Authors should provide a list of extracted data elements, including how data were extracted (independently, in duplicate, by one reviewer, etc.).",
    section: "METHODS",
    isRequired: true,
    isSubItem: false,
    order: 8,
  },

  {
    id: "item-10",
    itemNumber: "10",
    topic: "Risk of bias assessment",
    description:
      "Authors should specify the methods used to assess risk of bias of included studies, including details of the tool used and how it was applied.",
    section: "METHODS",
    isRequired: true,
    isSubItem: false,
    order: 9,
    customNotes: "Consider using standard tools like RoB-2 or ROBINS-I",
  },

  {
    id: "item-11",
    itemNumber: "10a",
    topic: "Effect measures",
    description:
      "Authors should specify how they defined effect estimates (e.g., risk ratios, odds ratios, or mean differences).",
    section: "METHODS",
    isRequired: false,
    isSubItem: true,
    parentId: "item-10",
    order: 9.1,
  },

  {
    id: "item-12",
    itemNumber: "10b",
    topic: "Synthesis methods",
    description:
      "Authors should describe the synthesis methods (e.g., meta-analysis, pairwise meta-analysis, network meta-analysis, or other synthesis methods). If meta-analysis was performed, they should report whether a fixed or random effects model was used.",
    section: "METHODS",
    isRequired: false,
    isSubItem: true,
    parentId: "item-10",
    order: 9.2,
  },

  // RESULTS section
  {
    id: "item-13",
    itemNumber: "11",
    topic: "Study characteristics",
    description:
      "Authors should report characteristics of the included studies in tables or text. This should include author, year, country, study design, study population, interventions compared, and other key characteristics relevant to the research question.",
    section: "RESULTS",
    isRequired: true,
    isSubItem: false,
    order: 10,
  },

  {
    id: "item-14",
    itemNumber: "12",
    topic: "Risk of bias in included studies",
    description:
      "Authors should present the risk of bias assessment for each study using a table, graph, or other visual representation.",
    section: "RESULTS",
    isRequired: true,
    isSubItem: false,
    order: 11,
  },

  {
    id: "item-15",
    itemNumber: "13",
    topic: "Synthesis of results",
    description:
      "Authors should report the results of the synthesis methods used. If meta-analysis was performed, they should report the findings including effect estimates with confidence intervals.",
    section: "RESULTS",
    isRequired: true,
    isSubItem: false,
    order: 12,
  },

  // DISCUSSION section
  {
    id: "item-16",
    itemNumber: "14",
    topic: "Interpretation",
    description:
      "Authors should discuss the findings, including the interpretation of the results in the context of existing evidence and any clinical implications.",
    section: "DISCUSSION",
    isRequired: true,
    isSubItem: false,
    order: 13,
  },

  {
    id: "item-17",
    itemNumber: "15",
    topic: "Strengths and limitations",
    description:
      "Authors should discuss the strengths and limitations of their review, including those related to the search strategy, study selection process, risk of bias assessment, and synthesis methods.",
    section: "DISCUSSION",
    isRequired: true,
    isSubItem: false,
    order: 14,
  },

  // OTHER INFORMATION section
  {
    id: "item-18",
    itemNumber: "16",
    topic: "Funding information",
    description:
      "Authors should report funding information, including the source(s) of funding for the systematic review and any declarations of conflicts of interest.",
    section: "OTHER_INFORMATION",
    isRequired: false,
    isSubItem: false,
    order: 15,
  },

  {
    id: "item-19",
    itemNumber: "17",
    topic: "Registration and protocol",
    description:
      "Authors should report whether the systematic review was registered (such as in PROSPERO) and provide the registration number. If a protocol was published, they should report the DOI.",
    section: "OTHER_INFORMATION",
    isRequired: false,
    isSubItem: false,
    order: 16,
  },
];

/**
 * PRISMA 2020 Main Template
 */
export const PRISMA_2020_MAIN_TEMPLATE: ChecklistTemplateDetail = {
  id: "tmpl-prisma-main",
  name: "PRISMA 2020 Main Checklist",
  description:
    "Comprehensive 27-item checklist for systematic reviews and meta-analyses as per PRISMA 2020 guidelines",
  type: ChecklistType.FULL,
  templateType: ChecklistTemplate.PRISMA_2020_MAIN,
  isCustom: false,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  items: PRISMA_2020_MAIN_ITEMS,
  totalItems: PRISMA_2020_MAIN_ITEMS.length,
};

/**
 * Sample PRISMA 2020 Abstract Checklist Items (simplified)
 */
export const PRISMA_2020_ABSTRACT_ITEMS: ChecklistItemTemplate[] = [
  {
    id: "item-abs-1",
    itemNumber: "1",
    topic: "Title identification",
    description: "Identify the report as a systematic review.",
    section: "ABSTRACT",
    isRequired: true,
    isSubItem: false,
    order: 0,
  },
  {
    id: "item-abs-2",
    itemNumber: "2",
    topic: "Objectives",
    description: "State the objectives of the systematic review.",
    section: "ABSTRACT",
    isRequired: true,
    isSubItem: false,
    order: 1,
  },
  {
    id: "item-abs-3",
    itemNumber: "3",
    topic: "Eligibility criteria",
    description: "Describe the study eligibility criteria.",
    section: "ABSTRACT",
    isRequired: true,
    isSubItem: false,
    order: 2,
  },
  {
    id: "item-abs-4",
    itemNumber: "4",
    topic: "Data sources",
    description: "State the data sources used.",
    section: "ABSTRACT",
    isRequired: true,
    isSubItem: false,
    order: 3,
  },
  {
    id: "item-abs-5",
    itemNumber: "5",
    topic: "Results",
    description:
      "Present the main findings (e.g., 'We included 40 trials with 5,400 participants').",
    section: "ABSTRACT",
    isRequired: true,
    isSubItem: false,
    order: 4,
  },
  {
    id: "item-abs-6",
    itemNumber: "6",
    topic: "Conclusions",
    description: "State the main conclusions.",
    section: "ABSTRACT",
    isRequired: true,
    isSubItem: false,
    order: 5,
  },
];

/**
 * PRISMA 2020 Abstract Template
 */
export const PRISMA_2020_ABSTRACT_TEMPLATE: ChecklistTemplateDetail = {
  id: "tmpl-prisma-abstract",
  name: "PRISMA 2020 Abstract Checklist",
  description:
    "Abbreviated 6-item checklist for abstract reporting following PRISMA 2020 guidelines",
  type: ChecklistType.ABSTRACT,
  templateType: ChecklistTemplate.PRISMA_2020_ABSTRACT,
  isCustom: false,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  items: PRISMA_2020_ABSTRACT_ITEMS,
  totalItems: PRISMA_2020_ABSTRACT_ITEMS.length,
};
