import { useQuery } from "@tanstack/react-query";
import { dataExtractionConductingService } from "../../../../services/dataExtractionConductingService";
import type { ExtractedDataAuditLogDto } from "../../../../types/dataExtraction";

const CELL_AUDIT_LOGS_QUERY_KEY = ["data-extraction-conducting", "cell-audit-logs"] as const;

export interface UseCellAuditLogsParams {
  extractionProcessId?: string;
  paperId?: string | null;
  fieldId?: string | null;
  matrixColumnId?: string | null;
  matrixRowIndex?: number | null;
  isOpen: boolean;
}

export function useCellAuditLogs({
  extractionProcessId,
  paperId,
  fieldId,
  matrixColumnId,
  matrixRowIndex,
  isOpen,
}: UseCellAuditLogsParams) {
  return useQuery<ExtractedDataAuditLogDto[]>({
    queryKey: [
      ...CELL_AUDIT_LOGS_QUERY_KEY,
      extractionProcessId,
      paperId,
      fieldId,
      matrixColumnId,
      matrixRowIndex,
    ],
    queryFn: async () => {
      if (!extractionProcessId || !paperId || !fieldId) {
        throw new Error("Missing required cell coordinates for audit logs");
      }

      const response = await dataExtractionConductingService.getCellAuditLogs(
        extractionProcessId,
        paperId,
        fieldId,
        matrixColumnId ?? null,
        matrixRowIndex ?? null
      );

      if (!response.isSuccess) {
        throw new Error(response.message || "Failed to load cell audit logs");
      }

      return response.data ?? [];
    },
    enabled: Boolean(isOpen && extractionProcessId && paperId && fieldId),
    staleTime: 30_000,
    placeholderData: (previousData) => previousData,
  });
}

export default useCellAuditLogs;
