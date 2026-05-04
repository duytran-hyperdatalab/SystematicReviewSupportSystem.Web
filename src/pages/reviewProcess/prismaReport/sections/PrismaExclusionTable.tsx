// PRISMA Exclusion Table — Breakdown of exclusion reasons across stages

import { FiInfo } from "react-icons/fi";
import type { PrismaNodeResponse, PrismaStage } from "../../../../types/prismaReport";

interface PrismaExclusionTableProps {
  nodes: PrismaNodeResponse[];
  isLoading: boolean;
}

/** Derive exclusion-related rows from flow nodes */
function buildExclusionRows(nodes: PrismaNodeResponse[]): { reason: string; count: number; percentage: number }[] {
  const exclusionStages: { stage: PrismaStage; reason: string }[] = [
    {
      stage: "DuplicateRecordsRemoved",
      reason: "Duplicate records removed before screening",
    },
    {
      stage: "RecordsExcluded",
      reason: "Records excluded during screening (title/abstract)",
    },
    {
      stage: "ReportsNotRetrieved",
      reason: "Reports not retrieved (full-text unavailable)",
    },
    {
      stage: "ReportsExcluded",
      reason: "Reports excluded after eligibility assessment",
    },
  ];

  const getCount = (stage: PrismaStage): number => {
    const node = nodes.find(n => n.stage === stage);
    if (node) return node.total;
    const sideNode = nodes.find(n => n.sideBox?.stage === stage);
    return sideNode?.sideBox?.total ?? 0;
  };

  const totalExcluded = exclusionStages.reduce((sum, { stage }) => sum + getCount(stage), 0);

  return exclusionStages.map(({ stage, reason }) => {
    const count = getCount(stage);
    return {
      reason,
      count,
      percentage: totalExcluded > 0 ? Math.round((count / totalExcluded) * 100) : 0,
    };
  });
}

function SkeletonRow() {
  return (
    <tr className="animate-pulse">
      <td className="px-4 py-3">
        <div className="h-4 w-48 bg-gray-200 rounded" />
      </td>
      <td className="px-4 py-3 text-right">
        <div className="h-4 w-12 bg-gray-200 rounded ml-auto" />
      </td>
      <td className="px-4 py-3 text-right">
        <div className="h-4 w-16 bg-gray-200 rounded ml-auto" />
      </td>
    </tr>
  );
}

export default function PrismaExclusionTable({
  nodes,
  isLoading,
}: PrismaExclusionTableProps) {
  const rows = isLoading ? [] : buildExclusionRows(nodes);
  const totalExcluded = rows.reduce((sum, r) => sum + r.count, 0);

  return (
    <section aria-label="Exclusion reasons breakdown">
      <div className="flex items-center gap-2 mb-4">
        <h3 className="text-base font-semibold text-gray-800">Exclusion Breakdown</h3>
        <div className="group relative">
          <FiInfo className="w-4 h-4 text-gray-400 cursor-help" />
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-64 p-2 bg-gray-800 text-white text-xs rounded shadow-lg z-10">
            Breakdown of records removed at each stage of the PRISMA flow. Percentages are relative
            to total exclusions.
          </div>
        </div>
      </div>

      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-4 py-3 text-left font-semibold text-gray-600 text-xs uppercase tracking-wider">
                Reason
              </th>
              <th className="px-4 py-3 text-right font-semibold text-gray-600 text-xs uppercase tracking-wider">
                Count
              </th>
              <th className="px-4 py-3 text-right font-semibold text-gray-600 text-xs uppercase tracking-wider">
                % of Total
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} />)
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-4 py-8 text-center text-gray-400 text-sm">
                  No exclusion data available.
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.reason} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-gray-700">{row.reason}</td>
                  <td className="px-4 py-3 text-right font-medium text-gray-900 tabular-nums">
                    {row.count.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-500 tabular-nums">
                    {row.percentage}%
                  </td>
                </tr>
              ))
            )}
          </tbody>
          {!isLoading && rows.length > 0 && (
            <tfoot>
              <tr className="bg-gray-50 border-t border-gray-200">
                <td className="px-4 py-3 font-semibold text-gray-800 text-sm">Total Excluded</td>
                <td className="px-4 py-3 text-right font-bold text-gray-900 tabular-nums">
                  {totalExcluded.toLocaleString()}
                </td>
                <td className="px-4 py-3 text-right text-gray-500 font-medium">100%</td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </section>
  );
}
