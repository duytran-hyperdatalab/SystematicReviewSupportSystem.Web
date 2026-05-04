import type { ScreeningPaper } from "../../../../pages/reviewProcess/studySelection/titleAbstractScreening/types";

export interface PaperViewerProps {
  paper: ScreeningPaper | null;
  onInclude?: (paperId: string) => void;
  onExclude?: (paperId: string, exclusionReasonId: string | null, reason: string | null) => void;
  onUploadPdf?: (paperId: string, file: File, options?: any) => Promise<any>;
  onApplyMetadataSuggestion?: (
    paperId: string,
    sourceMetadataId: string,
    fields: string[],
  ) => Promise<void>;
  onRetryExtraction?: (paperId: string) => Promise<void>;
  isSubmitting?: boolean;
  isUploadingPdf?: boolean;
  isApplyingMetadataSuggestion?: boolean;
  isRetryingExtraction?: boolean;
  hideActions?: boolean;
  isLeaderView?: boolean;
  phase?: number;
}

export type PaperViewerTab = "abstract" | "references" | "citations" | "graph" | "fulltext";
