import { FiShield, FiAlertTriangle } from "react-icons/fi";
import Button from "../ui/Button";
import DeduplicationTabContent from "./deduplication/DeduplicationTabContent";
import type { DuplicateResolution } from "../../types/deduplication";
import { useDuplicatePairs } from "../../hooks/useDuplicatePairs";
import toast from "react-hot-toast";

interface DeduplicationPageProps {
  projectId: string;
}

export default function DeduplicationPage({ projectId }: DeduplicationPageProps) {
  const {
    pairs: duplicatePairs,
    pendingPairs: pendingDuplicates,
    loading: isLoading,
    error,
    resolving: isResolving,
    resolvePair,
    refetch: onRefetch,
  } = useDuplicatePairs({ projectId });

  const handleResolveDuplicate = async (pairId: string, decision: DuplicateResolution) => {
    try {
      await resolvePair(pairId, decision);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to resolve duplicate");
    }
  };
  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Page Header */}
      <div className="flex items-center justify-between bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
              <FiShield className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">
                Project Deduplication
              </h2>
              <p className="text-xs font-black text-gray-400 uppercase tracking-widest mt-0.5">
                Maintain Data Integrity
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-red-50 border border-red-100 rounded-xl flex items-center gap-2">
            <FiAlertTriangle className="text-red-500" />
            <span className="text-sm font-bold text-red-700">
              {pendingDuplicates.length} Pending Conflicts
            </span>
          </div>
          <Button
            variant="outline"
            onClick={onRefetch}
            disabled={isLoading}
            className="rounded-xl font-bold uppercase tracking-wider text-xs"
          >
            Refresh Queue
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden min-h-[600px]">
        <DeduplicationTabContent
          duplicatePairs={duplicatePairs}
          pendingDuplicates={pendingDuplicates}
          onResolveDuplicate={handleResolveDuplicate}
          isLoading={isLoading}
          isResolving={isResolving}
          error={error}
          onRefetch={onRefetch}
        />
      </div>
    </div>
  );
}
