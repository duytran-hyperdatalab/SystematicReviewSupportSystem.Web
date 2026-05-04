import QAPaperDetails from "./QAPaperDetails";
import type { WorkspaceQAPaper } from "../QualityAssessmentWorkspace";
import { Worker, Viewer } from '@react-pdf-viewer/core';
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';
import { highlightPlugin, Trigger } from '@react-pdf-viewer/highlight';
import type { HighlightArea, RenderHighlightTargetProps, RenderHighlightsProps } from '@react-pdf-viewer/highlight';
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';
import '@react-pdf-viewer/highlight/lib/styles/index.css';
import type { HighlightData } from "../sections/QAPapersTabContent";

interface AssessmentPaperViewerProps {
  paper?: WorkspaceQAPaper;
  highlights?: any[];
  onAddHighlight?: (highlight: HighlightArea[]) => void;
  onRemoveHighlight?: (index: number) => void;
  isLeader?: boolean;
}

export default function AssessmentPaperViewer({ paper, highlights = [], onAddHighlight, onRemoveHighlight, isLeader }: AssessmentPaperViewerProps) {
  const defaultLayoutPluginInstance = defaultLayoutPlugin();

  const renderHighlights = (props: RenderHighlightsProps) => (
    <div>
      {
        highlights.map((highlightGroup: HighlightData, groupIndex: number) => {
          const areas = highlightGroup.areas || highlightGroup;
          const bgColor = highlightGroup.bgColor || 'rgba(245, 158, 11, 0.4)';
          const reviewerInitials = highlightGroup.reviewerInitials || null;

          return areas
            .filter((area: HighlightArea) => area.pageIndex === props.pageIndex)
            .map((area: HighlightArea, areaIndex: number) => (
              <div
                key={`${groupIndex}-${areaIndex}`}
                className="group"
                style={{
                  ...props.getCssProperties(area, props.rotation),
                  background: bgColor,
                  position: 'absolute',
                  cursor: isLeader ? 'default' : 'pointer',
                  zIndex: 1,
                  display: 'flex',
                  alignItems: 'center',
                }}
                onClick={() => {
                  if (!isLeader) {
                    if (window.confirm("Are you sure you want to remove this highlight?")) {
                      onRemoveHighlight?.(groupIndex);
                    }
                  }
                }}
                title={reviewerInitials === "YOU" ? "Click to remove highlight" : `Highlighted by ${reviewerInitials}`}
              >
                {reviewerInitials && (
                  <div
                    className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none"
                    style={{
                      position: 'absolute',
                      right: '-10px',
                      top: '-10px',
                      background: bgColor.replace('0.4', '1'),
                      color: 'white',
                      fontSize: '9px',
                      width: '22px',
                      height: '22px',
                      borderRadius: '50%',
                      fontWeight: 'bold',
                      zIndex: 2,
                      boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                    }}
                  >
                    {reviewerInitials.substring(0, 3)}
                  </div>
                )}
              </div>
            ));
        })
      }
    </div>
  );

  const renderHighlightTarget = (props: RenderHighlightTargetProps) => {
    if (isLeader) return <></>;
    return (
      <div
        style={{
          background: 'rgba(0, 0, 0, 0.8)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '4px',
          color: '#fff',
          cursor: 'pointer',
          padding: '4px 8px',
          position: 'absolute',
          left: `${props.selectionRegion.left}%`,
          top: `${props.selectionRegion.top + props.selectionRegion.height}%`,
          transform: 'translate(0, 8px)',
          zIndex: 10,
        }}
        onClick={() => {
          onAddHighlight?.(props.highlightAreas);
          props.cancel();
        }}
      >
        <span className="text-xs font-semibold">Highlight for selected criterion</span>
      </div>
    );
  };

  const highlightPluginInstance = highlightPlugin({
    renderHighlights,
    renderHighlightTarget,
    trigger: isLeader ? Trigger.None : Trigger.TextSelection,
  });

  return (
    <div className="flex-1 min-w-0 bg-white flex flex-col h-full overflow-y-auto">
      {paper ? (
        <div className="p-8 flex flex-col gap-8">
          <QAPaperDetails paper={paper} />

          {paper.pdfUrl && (
            <div className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden mt-2 flex flex-col h-[800px]">
              <div className="px-6 py-4 border-b border-gray-200 bg-white shadow-sm flex-none">
                <h3 className="text-base font-semibold text-gray-900">Full Text PDF</h3>
                {!isLeader && (
                  <p className="text-xs text-gray-500 mt-1">Select text to add highlight to the selected criterion. Click a highlight to remove it.</p>
                )}
              </div>
              <div className="flex-[1] w-full bg-gray-100 overflow-hidden relative">
                <Worker workerUrl={`https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js`}>
                  <div className="absolute inset-0 font-sans">
                    <Viewer
                      fileUrl={paper.pdfUrl}
                      plugins={[
                        defaultLayoutPluginInstance,
                        highlightPluginInstance
                      ]}
                    />
                  </div>
                </Worker>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-gray-400 h-full">
          Select a paper to begin assessment
        </div>
      )}
    </div>
  );
}
