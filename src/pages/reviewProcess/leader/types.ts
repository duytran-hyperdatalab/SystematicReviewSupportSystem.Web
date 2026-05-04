export type Status = "Done" | "In Progress" | "Not Started";
export type Phase = "Title/Abstract" | "Full-text";

export interface PaperProgress {
  id: string;
  paperTitle: string;
  titleAbstractStatus: string;
  fullTextStatus: string;
  overallStatus: "Completed" | "In Progress" | "Not Started";
}

export interface ReviewerProgress {
  id: string;
  reviewerName: string;
  assigned: number;
  completed: number;
  inProgress: number;
  notStarted: number;
  progress: number;
  status: Status;
  phase: Phase;
  papers: PaperProgress[];
}
