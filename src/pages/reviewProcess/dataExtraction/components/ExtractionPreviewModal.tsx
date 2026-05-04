import Modal from "../../../../components/ui/Modal";
import { Pencil } from "lucide-react";
import Button from "../../../../components/ui/Button";
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../../components/ui/Table";
import type {
  ExtractionPreviewDto,
  ExtractionPreviewRowDto,
} from "../../../../types/dataExtraction";

interface ExtractionPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  preview: ExtractionPreviewDto | null;
  isLoading: boolean;
  isFetching: boolean;
  onEditPaper: (paperId: string) => void;
}

function getPreviewCellValue(
  row: ExtractionPreviewRowDto,
  columnName: string,
  columnIndex: number
): unknown {
  if (Array.isArray(row)) {
    return row[columnIndex];
  }

  return row[columnName];
}

function formatPreviewValue(value: unknown): string {
  if (value === null || value === undefined) {
    return "-";
  }

  if (typeof value === "boolean") {
    return value ? "True" : "False";
  }

  if (Array.isArray(value)) {
    if (value.length === 0) {
      return "-";
    }

    return value.map((item) => formatPreviewValue(item)).join(", ");
  }

  if (typeof value === "object") {
    try {
      return JSON.stringify(value);
    } catch {
      return "[Unserializable Value]";
    }
  }

  const stringValue = String(value).trim();
  return stringValue.length > 0 ? stringValue : "-";
}

function getPaperIdFromPreviewRow(
  row: ExtractionPreviewRowDto,
  headers: string[]
): string | null {
  const normalizeKey = (value: string): string =>
    value
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "");

  const normalizedHeaderIndex = headers.reduce<Record<string, number>>(
    (accumulator, header, index) => {
      accumulator[normalizeKey(header)] = index;
      return accumulator;
    },
    {}
  );

  const candidateKeys = [
    "paperId",
    "paper id",
    "studyId",
    "study id",
    "study id (system)",
    "id",
  ].map(normalizeKey);

  if (Array.isArray(row)) {
    for (const candidateKey of candidateKeys) {
      const index = normalizedHeaderIndex[candidateKey];
      if (index === undefined) {
        continue;
      }

      const candidateValue = row[index];
      if (typeof candidateValue === "string" && candidateValue.trim()) {
        return candidateValue.trim();
      }
    }

    return null;
  }

  const normalizedRow = Object.entries(row).reduce<Record<string, unknown>>(
    (accumulator, [key, value]) => {
      accumulator[normalizeKey(key)] = value;
      return accumulator;
    },
    {}
  );

  for (const candidateKey of candidateKeys) {
    const candidateValue = normalizedRow[candidateKey];
    if (typeof candidateValue === "string" && candidateValue.trim()) {
      return candidateValue.trim();
    }
  }

  return null;
}

export default function ExtractionPreviewModal({
  isOpen,
  onClose,
  preview,
  isLoading,
  isFetching,
  onEditPaper,
}: ExtractionPreviewModalProps) {
  const headers = preview?.headers ?? [];
  const rows = preview?.rows ?? [];
  const hasRows = rows.length > 0;
  const hasHeaders = headers.length > 0;
  const hasPreviewData = hasRows && hasHeaders;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Preview Extracted Data"
      description="Review a tabular snapshot before downloading the final export file."
      size="xl"
    >
      <div className="space-y-4">
        {isFetching && preview ? (
          <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-medium text-blue-700">
            Refreshing preview data...
          </div>
        ) : null}

        {isLoading && !preview ? (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-6 py-16 text-center text-sm text-slate-500">
            Loading preview data...
          </div>
        ) : hasPreviewData ? (
          <>
            <div className="mb-4 rounded-lg bg-blue-50 px-3 py-2 text-xs text-blue-700">
              <strong>Note:</strong> If a study contains Matrix Grid data with multiple items, it will be displayed across multiple rows. The general study information is duplicated for each matrix item to maintain a flat export format.
            </div>

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
              <div className="max-h-[62vh] overflow-y-auto overflow-x-auto">
                <table className="w-max min-w-[960px] border-collapse text-left">
                <TableHeader className="sticky top-0 bg-slate-50/95 backdrop-blur">
                  <tr>
                    {headers.map((column) => (
                      <TableHead key={column} className="whitespace-nowrap">
                        {column}
                      </TableHead>
                    ))}
                    <TableHead className="whitespace-nowrap text-right">
                      Actions
                    </TableHead>
                  </tr>
                </TableHeader>

                <TableBody>
                  {rows.map((row, rowIndex) => (
                    <TableRow
                      key={`preview-row-${rowIndex}`}
                      className="cursor-default hover:bg-slate-50/80"
                    >
                      {headers.map((columnName, columnIndex) => {
                        const value = formatPreviewValue(
                          getPreviewCellValue(row, columnName, columnIndex)
                        );

                        return (
                          <TableCell
                            key={`${rowIndex}-${columnName}`}
                            title={value}
                            className="max-w-[280px] truncate text-sm text-slate-700"
                          >
                            {value}
                          </TableCell>
                        );
                      })}

                      <TableCell className="text-right">
                        {(() => {
                          const paperId = getPaperIdFromPreviewRow(row, headers);

                          if (!paperId) {
                            return <span className="text-xs text-slate-400">N/A</span>;
                          }

                          return (
                            <Button
                              variant="outline"
                              size="sm"
                              className="!px-2"
                              onClick={() => onEditPaper(paperId)}
                              title="Edit final consensus data"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                          );
                        })()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                </table>
              </div>
            </div>
          </>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-16 text-center">
            <p className="text-base font-semibold text-slate-700">
              No preview data available
            </p>
            <p className="mt-2 text-sm text-slate-500">
              Generate extraction results first, then retry previewing the export.
            </p>
          </div>
        )}
      </div>
    </Modal>
  );
}
