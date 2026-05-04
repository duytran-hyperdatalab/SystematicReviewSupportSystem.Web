import { useCallback, useEffect } from "react";
import { Viewer, Worker } from "@react-pdf-viewer/core";
import { highlightPlugin, type RenderHighlightsProps } from "@react-pdf-viewer/highlight";
import { ExternalLink } from "lucide-react";
import Button from "../../../../../components/ui/Button";
import Drawer from "../../../../../components/ui/Drawer";
import type { PdfHighlightCoordinate } from "../../types";
import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/highlight/lib/styles/index.css";

interface ConsensusDocumentDrawerProps {
  isOpen: boolean;
  effectiveDocumentUrl: string;
  isUsingFallbackDocument: boolean;
  activeHighlights: PdfHighlightCoordinate[];
  onClose: () => void;
}

const PAGE_WIDTH = 612;
const PAGE_HEIGHT = 792;

export default function ConsensusDocumentDrawer({
  isOpen,
  effectiveDocumentUrl,
  isUsingFallbackDocument,
  activeHighlights,
  onClose,
}: ConsensusDocumentDrawerProps) {
  const renderHighlights = useCallback((renderProps: RenderHighlightsProps) => {
    const { pageIndex, getCssProperties } = renderProps;
    const pageNumber = pageIndex + 1;

    return (
      <>
        {activeHighlights
          .filter((coordinate) => coordinate.page === pageNumber)
          .map((coordinate, index) => {
            const highlightArea = {
              pageIndex,
              left: (coordinate.x / PAGE_WIDTH) * 100,
              top: (coordinate.y / PAGE_HEIGHT) * 100,
              width: (coordinate.w / PAGE_WIDTH) * 100,
              height: (coordinate.h / PAGE_HEIGHT) * 100,
            };

            return (
              <div
                key={`consensus-evidence-${pageNumber}-${index}`}
                className="pointer-events-none absolute bg-yellow-300/60 mix-blend-multiply"
                style={getCssProperties(highlightArea, 1)}
              />
            );
          })}
      </>
    );
  }, [activeHighlights]);

  const highlightPluginInstance = highlightPlugin({ renderHighlights });

  const jumpToFirstEvidence = useCallback(() => {
    if (!isOpen || activeHighlights.length === 0) {
      return;
    }

    const firstHighlight = activeHighlights[0];
    highlightPluginInstance.jumpToHighlightArea({
      pageIndex: firstHighlight.page - 1,
      left: (firstHighlight.x / PAGE_WIDTH) * 100,
      top: (firstHighlight.y / PAGE_HEIGHT) * 100,
      width: (firstHighlight.w / PAGE_WIDTH) * 100,
      height: (firstHighlight.h / PAGE_HEIGHT) * 100,
    });
  }, [activeHighlights, highlightPluginInstance, isOpen]);

  useEffect(() => {
    if (!isOpen || activeHighlights.length === 0) {
      return;
    }

    const rafId = window.requestAnimationFrame(() => {
      jumpToFirstEvidence();
    });

    return () => {
      window.cancelAnimationFrame(rafId);
    };
  }, [activeHighlights, isOpen, jumpToFirstEvidence]);

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title="Article Document"
      side="right"
      maxWidth="max-w-5xl"
      footer={
        <div className="flex items-center justify-between gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              window.open(effectiveDocumentUrl, "_blank", "noopener,noreferrer")
            }
          >
            <ExternalLink className="mr-2 h-4 w-4" />
            Open in New Tab
          </Button>

          <Button size="sm" onClick={onClose}>
            Done
          </Button>
        </div>
      }
    >
      <div className="flex h-full flex-col gap-3">
        {isUsingFallbackDocument ? (
          <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700">
            This study has no PDF URL yet, so a mock PDF is shown for UI testing.
          </p>
        ) : null}

        <div className="min-h-0 flex-1 overflow-hidden rounded-xl border border-slate-200 bg-white">
          <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js">
            <Viewer
              fileUrl={effectiveDocumentUrl}
              plugins={[highlightPluginInstance]}
              onDocumentLoad={jumpToFirstEvidence}
            />
          </Worker>
        </div>
      </div>
    </Drawer>
  );
}
