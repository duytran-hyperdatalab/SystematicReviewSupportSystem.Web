// PRISMA Report Workspace — Slim orchestrator page
// Wires the usePrismaReport hook to section components.

import { useParams, useNavigate } from "react-router";
import { useSelector } from "react-redux";
import type { RootState } from "../../../redux/store";
import { usePrismaReport } from "../../../hooks/usePrismaReport";
import { FiClipboard, FiAlertCircle, FiArrowLeft } from "react-icons/fi";

import PrismaReportHeader from "./sections/PrismaReportHeader";
// import PrismaExportActions from "./sections/PrismaExportActions";
import PrismaSummaryHeader from "./sections/PrismaSummaryHeader";
import PrismaFlowDiagram from "./sections/PrismaFlowDiagram";
import PrismaExclusionTable from "./sections/PrismaExclusionTable";
import PrismaReportHistory from "./sections/PrismaReportHistory";
import PrismaExportActions from "./sections/PrismaExportActions";

export default function PrismaReportWorkspace() {
  const { projectId, processId } = useParams<{
    projectId: string;
    processId: string;
  }>();
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);

  const {
    latestReport,
    activeReport,
    reportHistory,
    summaryStats,
    nodes,
    includedNode,
    hasReport,
    isLoadingLatest,
    isLoadingHistory,
    isGenerating,
    isLoadingSelected,
    latestError,
    generateError,
    selectedError,
    isViewingHistorical,
    activeReportId,
    generateReport,
    selectReport,
    clearSelection,
    refreshAll,
  } = usePrismaReport({ reviewProcessId: processId });

  // React Query fetches on mount automatically — no useEffect needed

  const handleBack = () => {
    navigate(`/projects/${projectId}/processes/${processId}`);
  };

  const handleGenerate = async () => {
    const nextVersion = latestReport ? (Number(latestReport.version) + 0.1).toFixed(1) : "1.0";
    const result = await generateReport({
      version: nextVersion,
      notes: "Generated from PRISMA Report workspace",
      generatedBy: user?.name ?? user?.email ?? undefined,
    });
    // Mutation onSuccess already invalidates latest + history queries
    if (!result) {
      // generateReport returns null on failure — error handled by hook
    }
  };

  const handleSelectReport = (reportId: string) => {
    // If clicking the report that's already active, do nothing
    if (reportId === activeReportId) return;
    // If clicking the latest report, clear selection instead
    if (reportId === latestReport?.id) {
      clearSelection();
      return;
    }
    selectReport(reportId);
  };

  const isLoading = isLoadingLatest || isLoadingSelected;

  return (
    <div className="min-h-screen bg-gray-50 print:bg-white">
      {/* ── Sticky Header ── */}
      <PrismaReportHeader onBack={handleBack}>
        <PrismaExportActions
          hasReport={hasReport}
          isGenerating={isGenerating}
          onGenerate={handleGenerate}
          version={activeReport?.version}
          generatedAt={activeReport?.generatedAt}
        />
      </PrismaReportHeader>

      {/* ── Main Content ── */}
      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Error banner */}
        {(latestError || generateError || selectedError) && (
          <div
            className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg"
            role="alert"
          >
            <FiAlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-800">
                {latestError || generateError || selectedError}
              </p>
              <button
                onClick={refreshAll}
                className="text-sm text-red-600 hover:text-red-800 underline mt-1"
              >
                Try again
              </button>
            </div>
          </div>
        )}

        {/* Historical version banner */}
        {isViewingHistorical && activeReport && (
          <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <FiAlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-amber-800">
                Viewing historical report — Version {activeReport.version}
                {activeReport.generatedAt && (
                  <span className="font-normal text-amber-600">
                    {" "}
                    generated on{" "}
                    {new Date(activeReport.generatedAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                )}
              </p>
            </div>
            <button
              onClick={clearSelection}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-amber-700 bg-amber-100 hover:bg-amber-200 rounded-md transition-colors"
            >
              <FiArrowLeft className="w-3.5 h-3.5" />
              Back to latest
            </button>
          </div>
        )}

        {/* Empty state — no report yet */}
        {!isLoading && !hasReport && !latestError && (
          <div className="text-center py-16 px-4">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-indigo-100 flex items-center justify-center">
              <FiClipboard className="w-8 h-8 text-indigo-500" />
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">No PRISMA Report Generated</h2>
            <p className="text-sm text-gray-500 max-w-md mx-auto mb-6">
              Generate a PRISMA 2020 flow diagram report to visualise the current state of your
              systematic review pipeline. The report is a snapshot calculated from your review data.
            </p>
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 transition-colors"
            >
              {isGenerating ? "Generating…" : "Generate PRISMA Report"}
            </button>
          </div>
        )}

        {/* Report content (visible when report exists or loading) */}
        {(isLoading || hasReport) && (
          <>
            {/* Summary cards */}
            <PrismaSummaryHeader
              stats={summaryStats}
              isLoading={isLoading}
              generatedAt={activeReport?.generatedAt}
            />

            {/* Flow diagram — core visual */}
            <section className="bg-white border border-gray-200 rounded-lg p-8 shadow-sm print:shadow-none print:border-0">
              <h2 className="text-lg font-bold text-gray-900 mb-1">PRISMA 2020 Flow Diagram</h2>
              <p className="text-xs text-gray-500 mb-6">
                Preferred Reporting Items for Systematic Reviews and Meta-Analyses
              </p>
              <PrismaFlowDiagram nodes={nodes} includedNode={includedNode} isLoading={isLoading} />
            </section>

            {/* Bottom grid: Exclusion table + Report history */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              <div className="lg:col-span-3">
                <PrismaExclusionTable nodes={nodes} isLoading={isLoading} />
              </div>
              <div className="lg:col-span-2">
                <PrismaReportHistory
                  reports={reportHistory}
                  isLoading={isLoadingHistory}
                  activeReportId={activeReportId}
                  onSelectReport={handleSelectReport}
                />
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
