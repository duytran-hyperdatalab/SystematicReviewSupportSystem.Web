import { useCallback, useEffect } from "react";
import { Viewer, Worker } from "@react-pdf-viewer/core";
import {
  highlightPlugin,
  Trigger,
  type HighlightArea,
  type RenderHighlightTargetProps,
  type RenderHighlightsProps,
} from "@react-pdf-viewer/highlight";
import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/highlight/lib/styles/index.css";
import type { PdfHighlightCoordinate } from "../../types";

interface ReviewerPdfPanelProps {
  effectiveDocumentUrl: string;
  isUsingFallbackDocument: boolean;
  activeHighlights: PdfHighlightCoordinate[];
  activeEvidenceTargetLabel: string | null;
  canUseEvidenceSelection: boolean;
  canRemoveEvidence: boolean;
  onUseEvidenceSelection: (coordinates: PdfHighlightCoordinate[]) => void;
  onRemoveEvidence: () => void;
}

// Khai báo kích thước chuẩn của trang PDF (US Letter) tính bằng points
const PAGE_WIDTH = 612;
const PAGE_HEIGHT = 792;

export default function ReviewerPdfPanel({
  effectiveDocumentUrl,
  isUsingFallbackDocument,
  activeHighlights,
  activeEvidenceTargetLabel,
  canUseEvidenceSelection,
  canRemoveEvidence,
  onUseEvidenceSelection,
  onRemoveEvidence,
}: ReviewerPdfPanelProps) {

  const mapAreaToCoordinate = useCallback((area: HighlightArea): PdfHighlightCoordinate => {
    return {
      page: area.pageIndex + 1,
      x: (area.left / 100) * PAGE_WIDTH,
      y: (area.top / 100) * PAGE_HEIGHT,
      w: (area.width / 100) * PAGE_WIDTH,
      h: (area.height / 100) * PAGE_HEIGHT,
    };
  }, []);

  const renderHighlightTarget = useCallback(
    (props: RenderHighlightTargetProps) => {
      const { highlightAreas, selectionRegion, cancel } = props;

      return (
        <div
          style={{
            position: "absolute",
            left: `${selectionRegion.left}%`,
            top: `${selectionRegion.top + selectionRegion.height + 1}%`,
            zIndex: 10,
          }}
          className="inline-flex items-center gap-1 rounded-md bg-white/95 p-1 shadow"
        >
          <button
            type="button"
            onClick={() => {
              const nextCoordinates = highlightAreas.map(mapAreaToCoordinate);
              if (!canUseEvidenceSelection) {
                cancel();
                return;
              }

              onUseEvidenceSelection(nextCoordinates);
              cancel();
            }}
            className="rounded-md border border-blue-200 bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-700 shadow-sm transition-colors hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-60"
            title={
              canUseEvidenceSelection
                ? "Use selection as evidence for the selected field"
                : "Select a field with the crosshair button first"
            }
            aria-label="Use selected PDF highlight as evidence"
            disabled={!canUseEvidenceSelection}
          >
            Use as Evidence
          </button>

          <button
            type="button"
            onClick={() => {
              if (!canUseEvidenceSelection) {
                cancel();
                return;
              }

              onRemoveEvidence();
              cancel();
            }}
            className="rounded-md border border-red-200 bg-red-50 px-2 py-1 text-xs font-semibold text-red-700 shadow-sm transition-colors hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
            title={
              canRemoveEvidence
                ? "Remove linked evidence from selected field"
                : "Selected field has no linked evidence"
            }
            aria-label="Remove evidence from selected field"
            disabled={!canRemoveEvidence}
          >
            Remove Evidence
          </button>
        </div>
      );
    },
    [
      canRemoveEvidence,
      canUseEvidenceSelection,
      mapAreaToCoordinate,
      onRemoveEvidence,
      onUseEvidenceSelection,
    ]
  );
  
  const renderHighlights = useCallback(
    (renderProps: RenderHighlightsProps) => {
      const { pageIndex, getCssProperties } = renderProps;
      const pageNumber = pageIndex + 1;

      return (
        <>
          {activeHighlights
            .filter((coordinate) => coordinate.page === pageNumber)
            .map((coordinate, index) => {
              
              // CÔNG THỨC CHUẨN: ÉP TOẠ ĐỘ GROBID SANG % CỦA TRANG
              const highlightArea = {
                pageIndex: pageIndex,
                left: (coordinate.x / PAGE_WIDTH) * 100,
                top: (coordinate.y / PAGE_HEIGHT) * 100,
                width: (coordinate.w / PAGE_WIDTH) * 100,
                height: (coordinate.h / PAGE_HEIGHT) * 100,
              };

              return (
                <div
                  key={`evidence-${pageNumber}-${index}`}
                  className="pointer-events-none absolute bg-yellow-300/60 mix-blend-multiply"
                  // Tham số thứ 2 là 1 để lấy giá trị % trực tiếp thay vì tự nhân 100
                  style={getCssProperties(highlightArea, 1)} 
                />
              );
            })}
        </>
      );
    },
    [activeHighlights]
  );

  const highlightPluginInstance = highlightPlugin({
    trigger: Trigger.None,
    renderHighlightTarget,
    renderHighlights,
  });

  useEffect(() => {
    highlightPluginInstance.switchTrigger(
      canUseEvidenceSelection ? Trigger.TextSelection : Trigger.None
    );
  }, [canUseEvidenceSelection, highlightPluginInstance]);

  return (
    <section className="w-[55%] p-4">
      <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white">
        {isUsingFallbackDocument ? (
          <p className="border-b border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-700">
            This study has no PDF URL yet, so a mock PDF is shown for UI testing.
          </p>
        ) : null}
        <div className="flex items-center justify-between gap-3 border-b border-slate-200 bg-slate-50 px-4 py-2">
          <p className="text-xs font-medium text-slate-600">
            {activeEvidenceTargetLabel
              ? `Evidence mode: ${activeEvidenceTargetLabel}. Select text then click Use as Evidence.`
              : "Click a field crosshair button first to enter evidence mode for that field."}
          </p>

          {canUseEvidenceSelection ? (
            <span className="shrink-0 rounded-md border border-blue-200 bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-700">
              Selection enabled
            </span>
          ) : null}
        </div>
        <div className="h-full min-h-0 flex-1 overflow-hidden relative">
          <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js">
            <Viewer
              fileUrl={effectiveDocumentUrl}
              plugins={[highlightPluginInstance]}
            />
          </Worker>
        </div>
      </div>
    </section>
  );
}