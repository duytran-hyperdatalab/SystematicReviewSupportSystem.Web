import { useMemo } from "react";
import { useParams } from "react-router-dom";
import Button from "../../../components/ui/Button";
import Card from "../../../components/ui/Card";
import DataExtractionConsensusWorkspace from "./components/DataExtractionConsensusWorkspace.tsx";
import DataExtractionDashboard from "./components/DataExtractionDashboard.tsx";
import DataExtractionReviewerWorkspace from "./components/DataExtractionReviewerWorkspace.tsx";
import { useDataExtractionWorkspace } from "./hooks/useDataExtractionWorkspace.ts";

export default function DataExtractionPhaseWorkspace() {
  const ws = useDataExtractionWorkspace();
  const { studyId } = useParams<{ studyId?: string }>();

  const dashboardPath = useMemo(() => {
    if (!ws.projectId || !ws.processId) {
      return "/projects";
    }

    return `/projects/${ws.projectId}/processes/${ws.processId}/extraction`;
  }, [ws.processId, ws.projectId]);

  if (ws.isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-slate-300 border-t-blue-600" />
      </div>
    );
  }

  if (ws.error) {
    return (
      <div className="min-h-screen bg-slate-50 px-6 py-10">
        <Card className="mx-auto max-w-4xl rounded-2xl border border-red-200 bg-red-50 shadow-lg shadow-red-100/50">
          <h2 className="text-lg font-semibold text-red-900">
            Data Extraction Error
          </h2>
          <p className="mt-2 text-sm text-red-700">{ws.error}</p>
          <div className="mt-6 flex gap-3">
            <Button variant="outline" onClick={() => window.location.reload()}>
              Retry
            </Button>
            <Button onClick={ws.handleBack}>Back to Workflow</Button>
          </div>
        </Card>
      </div>
    );
  }

  const selectedStudyStatus = studyId ? ws.getPaperStatus(studyId) : null;
  const isConsensusRouteTarget =
    selectedStudyStatus === "awaiting-consensus" ||
    selectedStudyStatus === "completed";

  return (
    <div className="h-screen bg-slate-50 overflow-hidden flex flex-col">
      {/* Main Content */}
      <div className="pt-0">
        {studyId && isConsensusRouteTarget ? (
          !ws.isCurrentUserLeader ? (
            <DataExtractionReviewerWorkspace
              ws={ws}
              dashboardPath={dashboardPath}
              documentUrl={ws.selectedStudy?.pdfUrl}
            />
          ) : (
            <DataExtractionConsensusWorkspace
              ws={ws}
              dashboardPath={dashboardPath}
              documentUrl={ws.selectedStudy?.pdfUrl}
            />
          )
        ) : studyId ? (
          <DataExtractionReviewerWorkspace
            ws={ws}
            dashboardPath={dashboardPath}
            documentUrl={ws.selectedStudy?.pdfUrl}
          />
        ) : (
          <DataExtractionDashboard ws={ws} dashboardPath={dashboardPath} />
        )}
      </div>
    </div>
  );
}
