// PRISMA Export Actions — Export PNG, PDF, and copy data buttons (stubbed logic)

import { FiImage, FiFileText, FiCopy, FiRefreshCw, FiClock } from "react-icons/fi";

interface PrismaExportActionsProps {
  /** Whether a report exists to export */
  hasReport: boolean;
  /** Whether report generation is in progress */
  isGenerating: boolean;
  /** Trigger report generation */
  onGenerate: () => void;
  /** Version label of the latest report */
  version?: string;
  /** Timestamp of last generation */
  generatedAt?: string | null;
}

export default function PrismaExportActions({
  hasReport,
  isGenerating,
  onGenerate,
  version,
  generatedAt,
}: PrismaExportActionsProps) {
  const handleExportPNG = () => {
    // TODO: Implement with html-to-image or dom-to-image
  };

  const handleExportPDF = () => {
    // TODO: Implement with jsPDF or print-based export
    window.print();
  };

  const handleCopyNumbers = () => {
    // TODO: Copy formatted numbers to clipboard
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Generate / Regenerate button */}
      <button
        onClick={onGenerate}
        disabled={isGenerating}
        className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <FiRefreshCw className={`w-4 h-4 ${isGenerating ? "animate-spin" : ""}`} />
        {isGenerating ? "Generating…" : hasReport ? "Regenerate Report" : "Generate Report"}
      </button>

      {/* Export buttons — only enabled when a report exists */}
      <div className="flex items-center gap-2 border-l border-gray-200 pl-3">
        <button
          onClick={handleExportPNG}
          disabled={!hasReport}
          title="Export as PNG"
          className="inline-flex items-center gap-1.5 px-3 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <FiImage className="w-4 h-4" />
          <span className="hidden sm:inline">PNG</span>
        </button>

        <button
          onClick={handleExportPDF}
          disabled={!hasReport}
          title="Export as PDF (print)"
          className="inline-flex items-center gap-1.5 px-3 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <FiFileText className="w-4 h-4" />
          <span className="hidden sm:inline">PDF</span>
        </button>

        <button
          onClick={handleCopyNumbers}
          disabled={!hasReport}
          title="Copy numbers to clipboard"
          className="inline-flex items-center gap-1.5 px-3 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <FiCopy className="w-4 h-4" />
          <span className="hidden sm:inline">Copy</span>
        </button>
      </div>

      {/* Version / timestamp badge */}
      {hasReport && version && (
        <div className="flex items-center gap-1.5 text-xs text-gray-500 ml-auto">
          <FiClock className="w-3.5 h-3.5" />
          <span>v{version}</span>
          {generatedAt && (
            <>
              <span className="text-gray-300">·</span>
              <span>
                {new Date(generatedAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </>
          )}
        </div>
      )}
    </div>
  );
}
