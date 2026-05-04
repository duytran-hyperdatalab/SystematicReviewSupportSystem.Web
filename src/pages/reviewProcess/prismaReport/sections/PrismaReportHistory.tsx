// PRISMA Report History — List of previously generated report snapshots

import { FiClock, FiFileText, FiChevronRight } from "react-icons/fi";
import type { PrismaReportListResponse } from "../../../../types/prismaReport";

interface PrismaReportHistoryProps {
  reports: PrismaReportListResponse[];
  isLoading: boolean;
  /** ID of the report currently being viewed (latest or historical) */
  activeReportId?: string | null;
  onSelectReport?: (reportId: string) => void;
}

function SkeletonItem() {
  return (
    <div className="flex items-center gap-4 px-4 py-3 animate-pulse">
      <div className="w-8 h-8 bg-gray-200 rounded-full" />
      <div className="flex-1 space-y-2">
        <div className="h-4 w-32 bg-gray-200 rounded" />
        <div className="h-3 w-48 bg-gray-200 rounded" />
      </div>
      <div className="h-4 w-16 bg-gray-200 rounded" />
    </div>
  );
}

export default function PrismaReportHistory({
  reports,
  isLoading,
  activeReportId,
  onSelectReport,
}: PrismaReportHistoryProps) {
  return (
    <section aria-label="Report generation history">
      <h3 className="text-base font-semibold text-gray-800 mb-4">Report History</h3>

      <div className="border border-gray-200 rounded-lg overflow-hidden">
        {isLoading ? (
          <div className="divide-y divide-gray-100">
            {Array.from({ length: 3 }).map((_, i) => (
              <SkeletonItem key={i} />
            ))}
          </div>
        ) : reports.length === 0 ? (
          <div className="px-4 py-8 text-center">
            <FiFileText className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500">No reports generated yet.</p>
            <p className="text-xs text-gray-400 mt-1">
              Click "Generate Report" to create your first PRISMA snapshot.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {reports.map((report) => {
              const isActive = report.id === activeReportId;
              return (
                <li key={report.id}>
                  <button
                    onClick={() => onSelectReport?.(report.id)}
                    className={`w-full flex items-center gap-4 px-4 py-3 transition-colors text-left group ${
                      isActive
                        ? "bg-indigo-50 border-l-2 border-indigo-500"
                        : "hover:bg-gray-50 border-l-2 border-transparent"
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                        isActive ? "bg-indigo-200" : "bg-indigo-100"
                      }`}
                    >
                      <FiFileText
                        className={`w-4 h-4 ${isActive ? "text-indigo-700" : "text-indigo-600"}`}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800">
                        Version {report.version}
                        {isActive && (
                          <span className="ml-2 inline-block px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide bg-indigo-100 text-indigo-700 rounded">
                            Viewing
                          </span>
                        )}
                        {report.generatedBy && (
                          <span className="text-gray-400 font-normal">
                            {" "}
                            by {report.generatedBy}
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                        <FiClock className="w-3 h-3" />
                        {new Date(report.generatedAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    <div className="text-xs text-gray-500 tabular-nums shrink-0">
                      {report.totalRecords.toLocaleString()} records
                    </div>
                    <FiChevronRight
                      className={`w-4 h-4 shrink-0 ${
                        isActive ? "text-indigo-500" : "text-gray-300 group-hover:text-gray-500"
                      }`}
                    />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}
