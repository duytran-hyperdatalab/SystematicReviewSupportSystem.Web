// PRISMA Summary Header — Top summary cards showing key metrics

import { FiDatabase, FiCopy, FiFilter, FiCheckCircle, FiRefreshCw } from "react-icons/fi";
import type { PrismaSummaryStats } from "../../../../types/prismaReport";
import { SUMMARY_CARDS } from "../constants";

interface PrismaSummaryHeaderProps {
  stats: PrismaSummaryStats;
  isLoading: boolean;
  generatedAt?: string | null;
}

const CARD_ICONS: Record<string, React.ReactNode> = {
  totalIdentified: <FiDatabase className="w-5 h-5" />,
  duplicatesRemoved: <FiCopy className="w-5 h-5" />,
  recordsScreened: <FiFilter className="w-5 h-5" />,
  studiesIncluded: <FiCheckCircle className="w-5 h-5" />,
};

const COLOR_MAP: Record<string, { card: string; icon: string; value: string }> = {
  indigo: {
    card: "from-indigo-50 to-indigo-100/60 border-indigo-200",
    icon: "text-indigo-600",
    value: "text-indigo-900",
  },
  orange: {
    card: "from-orange-50 to-orange-100/60 border-orange-200",
    icon: "text-orange-600",
    value: "text-orange-900",
  },
  blue: {
    card: "from-blue-50 to-blue-100/60 border-blue-200",
    icon: "text-blue-600",
    value: "text-blue-900",
  },
  green: {
    card: "from-green-50 to-green-100/60 border-green-200",
    icon: "text-green-600",
    value: "text-green-900",
  },
};

function SkeletonCard() {
  return (
    <div className="bg-linear-to-br from-gray-50 to-gray-100/60 border border-gray-200 rounded-lg p-5 animate-pulse">
      <div className="flex items-center justify-between mb-3">
        <div className="w-8 h-8 bg-gray-200 rounded" />
        <FiRefreshCw className="w-4 h-4 text-gray-300 animate-spin" />
      </div>
      <div className="h-8 w-16 bg-gray-200 rounded mb-2" />
      <div className="h-4 w-24 bg-gray-200 rounded mb-1" />
      <div className="h-3 w-32 bg-gray-200 rounded" />
    </div>
  );
}

export default function PrismaSummaryHeader({
  stats,
  isLoading,
  generatedAt,
}: PrismaSummaryHeaderProps) {
  return (
    <section aria-label="PRISMA summary statistics">
      {/* Timestamp label */}
      {generatedAt && (
        <p className="text-xs text-gray-500 mb-3 font-medium tracking-wide uppercase">
          Snapshot from{" "}
          {new Date(generatedAt).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
          : SUMMARY_CARDS.map((card) => {
              const colors = COLOR_MAP[card.colorScheme];
              const value = stats[card.key];
              return (
                <div
                  key={card.key}
                  className={`bg-linear-to-br ${colors.card} border rounded-lg p-5 transition-shadow hover:shadow-sm`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className={colors.icon}>{CARD_ICONS[card.key]}</span>
                  </div>
                  <div className={`text-3xl font-bold ${colors.value} mb-1 tabular-nums`}>
                    {value.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-700 font-medium">{card.label}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{card.description}</div>
                </div>
              );
            })}
      </div>
    </section>
  );
}
