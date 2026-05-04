import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { CheckCircle2, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import Button from '../../ui/Button';
import { useStudySelectionExclusionReasons, useBulkResolvePapers } from '../../../hooks/useStudySelection';
import Select from '../../ui/Select';
import { useSelector } from 'react-redux';
import type { RootState } from '../../../redux/store';
import { ScreeningDecisionType, PaperPhase } from '../../../types/studySelection';
import { toastSuccess, toastError } from '../../../utils/toast';

interface QuickDecisionPanelProps {
  processId?: string;
  selectedPaperIds: string[];
  onDecisionComplete: () => void;
  phase: PaperPhase;
}

const QuickDecisionPanel: React.FC<QuickDecisionPanelProps> = ({
  processId,
  selectedPaperIds,
  onDecisionComplete,
  phase,
}) => {
  const selectedCount = selectedPaperIds.length;
  const panelRef = useRef<HTMLDivElement>(null);
  const currentUser = useSelector((state: RootState) => state.auth.user);

  const [decisionType, setDecisionType] = React.useState<'include' | 'exclude' | null>(null);
  const [exclusionReasonId, setExclusionReasonId] = React.useState<string>("");
  const [resolutionNotes, setResolutionNotes] = React.useState("");
  const [reasonPageSize, setReasonPageSize] = React.useState(5);

  const { mutate: bulkResolve, isPending: isSubmitting } = useBulkResolvePapers();

  const { data: exclusionReasons = [], isLoading: isLoadingReasons } = useStudySelectionExclusionReasons(
    processId,
    { onlyActive: true, pageSize: reasonPageSize }
  );

  const hasMoreReasons = exclusionReasons.length >= reasonPageSize;

  useEffect(() => {
    if (selectedCount > 0) {
      gsap.to(panelRef.current, {
        y: 0,
        opacity: 1,
        duration: 0.5,
        ease: 'power3.out'
      });
    } else {
      gsap.to(panelRef.current, {
        y: 100,
        opacity: 0,
        duration: 0.3,
        ease: 'power3.in'
      });
    }
  }, [selectedCount]);

  const handleDecision = (decision: 'include' | 'exclude') => {
    if (!processId || !currentUser) return;

    if (decision === 'exclude' && !decisionType) {
      setDecisionType('exclude');
      return;
    }

    if (decision === 'exclude' && !exclusionReasonId) {
      toastError("Please select an exclusion reason");
      return;
    }

    bulkResolve({
      processId,
      request: {
        paperIds: selectedPaperIds,
        finalDecision: decision === 'include' ? ScreeningDecisionType.Include : ScreeningDecisionType.Exclude,
        phase: phase,
        resolvedBy: currentUser.id,
        exclusionReasonId: decision === 'exclude' ? exclusionReasonId : undefined,
        resolutionNotes: resolutionNotes.trim() || undefined,
      }
    }, {
      onSuccess: () => {
        toastSuccess(`Successfully ${decision}d ${selectedCount} papers`);
        onDecisionComplete();
        setDecisionType(null);
        setExclusionReasonId("");
        setResolutionNotes("");
      },
      onError: (error: any) => {
        toastError(error.message || `Failed to ${decision} papers`);
      }
    });
  };

  if (selectedCount === 0) return null;

  return (
    <div
      ref={panelRef}
      className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-3xl px-4 z-50 opacity-0 translate-y-[100px]"
    >
      <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-6 text-white overflow-visible relative">
        <div className="flex flex-col gap-6 relative">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            {/* Section 1: Stats */}
            <div className="flex items-center gap-4 flex-shrink-0">
              <div className="bg-indigo-600 p-3 rounded-xl shadow-inner ring-4 ring-indigo-600/20">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <div className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest mb-0.5">Quick Decision</div>
                <div className="text-xl font-black flex items-center gap-2 tabular-nums">
                  <span>{selectedCount}</span>
                  <span className="text-slate-400 text-xs font-medium uppercase">Papers Selected</span>
                </div>
              </div>
            </div>

            {/* Section 2: Action Buttons */}
            <div className="flex flex-col items-end gap-2 flex-shrink-0">
              {!isLoadingReasons && exclusionReasons.length === 0 && (
                <div className="animate-in fade-in slide-in-from-bottom-1 duration-500">
                  <span className="text-amber-500 text-[9px] font-black uppercase tracking-widest bg-amber-500/10 px-2 py-1 rounded border border-amber-500/20">
                    Please import exclusion reason code to exclude papers
                  </span>
                </div>
              )}
              <div className="flex items-center gap-3">
                {decisionType === 'exclude' && (
                  <Button
                    onClick={() => setDecisionType(null)}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-3 px-6 rounded-xl border-none transition-all active:scale-95"
                  >
                    Cancel
                  </Button>
                )}
                <Button
                  onClick={() => handleDecision('include')}
                  disabled={decisionType === 'exclude' || isSubmitting || isLoadingReasons}
                  className="bg-green-600 hover:bg-green-500 text-white font-bold py-3 px-6 rounded-xl shadow-lg shadow-green-900/40 border-none transition-all active:scale-95 flex items-center gap-2 disabled:opacity-40"
                >
                  {isSubmitting && decisionType !== 'exclude' ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  Include
                </Button>
                
                <Button
                  onClick={() => handleDecision('exclude')}
                  disabled={isSubmitting || isLoadingReasons || exclusionReasons.length === 0}
                  className="bg-red-600 hover:bg-red-500 text-white font-bold py-3 px-6 rounded-xl shadow-lg shadow-red-900/40 border-none transition-all active:scale-95 flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {isSubmitting && decisionType === 'exclude' ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  {decisionType === 'exclude' ? 'Confirm Exclusion' : 'Exclude'}
                </Button>
              </div>
            </div>
          </div>

          {/* Section 3: Exclusion Options - Only shown when Exclude is selected */}
          {decisionType === 'exclude' && (
            <div className="flex flex-col sm:flex-row gap-4 p-4 bg-slate-800/50 rounded-xl border border-slate-700/50 animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="flex-1">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2 block ml-1">
                  Exclusion Reason <span className="text-red-500">*</span>
                </label>
                <div className="relative group">
                  <Select
                    value={exclusionReasonId}
                    onChange={(e) => setExclusionReasonId(e.target.value)}
                    options={exclusionReasons.map((r) => ({
                      value: r.id,
                      label: r.name,
                    }))}
                    placeholder="Select a reason..."
                    className="!py-3.5 !text-xs !font-bold !bg-slate-900 !border-slate-700 !text-white !rounded-xl transition-all hover:!bg-slate-800 focus:!ring-4 focus:!ring-indigo-500/20"
                  />
                  
                  {/* Show More / Reset Reasons Button */}
                  {(hasMoreReasons || exclusionReasons.length > 5) && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (hasMoreReasons) {
                          setReasonPageSize((prev) => prev + 5);
                        } else {
                          setReasonPageSize(5);
                        }
                      }}
                      className="mt-2 text-[10px] font-black uppercase text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1.5 px-1 py-0.5"
                    >
                      {hasMoreReasons ? (
                        <><span>Show more reasons</span> <ChevronDown className="w-3 h-3" /></>
                      ) : (
                        <><span>Reset list</span> <ChevronUp className="w-3 h-3" /></>
                      )}
                    </button>
                  )}
                </div>
              </div>

              <div className="flex-1">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2 block ml-1">
                  Resolution Notes (Optional)
                </label>
                <textarea
                  placeholder="Explain why these papers are being excluded..."
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  className="w-full bg-slate-900 border-slate-700 border-2 rounded-xl text-[11px] font-medium px-4 py-3 min-h-[50px] focus:ring-4 focus:ring-indigo-500/20 focus:bg-slate-900 focus:border-indigo-500/50 transition-all outline-none resize-none text-white overflow-hidden"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuickDecisionPanel;
