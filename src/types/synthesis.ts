export type SynthesisType =
  | "DescriptiveStatistics"
  | "NarrativeThematic"
  | "CrossTabulation"
  | "QuantitativeMetaAnalysis";

export interface DataSynthesisStrategy {
  synthesis_strategy_id: string;
  protocol_id: string;
  target_research_question_ids: string[];
  synthesis_type: SynthesisType | "";
  data_grouping_plan?: string;
  sensitivity_analysis_plan?: string;
  description: string;
}

export interface DisseminationStrategy {
  dissemination_id: string;
  protocol_id: string;
  channel: string;
  description: string;
}

export interface ProjectTimetable {
  timetable_id: string;
  project_id: string;
  milestone: string;
  planned_date?: string;
}
