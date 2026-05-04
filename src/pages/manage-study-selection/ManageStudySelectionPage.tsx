import React, { useState, useCallback, useRef } from 'react';
import { toastSuccess, toastError } from '../../utils/toast';
import { useParams } from 'react-router-dom';
import { PaperList } from './components/PaperList';
import { SelectionActionPanel } from './components/SelectionActionPanel';
import { StuSePhaseHeaderController, type SelectionPhase } from './components/StuSePhaseHeaderController';
import { useConflictStatus, usePaperDetails, useResolveConflict } from '../../hooks/useStudySelection';
import { useSelector } from 'react-redux';
import { useQueryClient } from '@tanstack/react-query';
import type { RootState } from '../../redux/store';
import PaperViewer from '../../components/shared/paper/PaperViewer';
import { PaperPhase } from '../../types/studySelection';
import Button from '../../components/ui/Button';
import { Users, X, AlertCircle } from 'lucide-react';
import { cn } from '../../utils/cn';
import BulkAssignmentPanel from '../../components/reviewProcess/leader/BulkAssignmentPanel';


export default function ManageStudySelectionPage() {
    const { screeningProcessId } = useParams<{
        screeningProcessId: string;
    }>();
    const [currentPhase, setCurrentPhase] = useState<SelectionPhase>('TITLE_ABSTRACT');
    const [isAssignmentMode, setIsAssignmentMode] = useState(false);
    const [selectedPaperId, setSelectedPaperId] = useState<string | null>(null);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [leftWidth, setLeftWidth] = useState(350); // px
    const [rightWidth, setRightWidth] = useState(300); // px
    const currentPhaseNumeric = currentPhase === 'TITLE_ABSTRACT' ? PaperPhase.TitleAbstract : PaperPhase.FullText;
    const queryClient = useQueryClient();

    const isResizingLeft = useRef(false);
    const isResizingRight = useRef(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Fetch full paper details when a paper is selected
    const { paper: selectedPaper } = usePaperDetails(
        screeningProcessId,
        selectedPaperId || undefined
    );

    // Fetch conflict status to check for conflicts on the selected paper
    const { data: conflictStatusList } = useConflictStatus(
        screeningProcessId,
        currentPhaseNumeric,
        { enabled: !!screeningProcessId }
    );

    const paperHasConflict = React.useMemo(() => {
        if (!selectedPaperId || !conflictStatusList) return false;
        return conflictStatusList.find(c => c.paperId === selectedPaperId)?.hasConflict || false;
    }, [selectedPaperId, conflictStatusList]);

    const startResizingLeft = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        isResizingLeft.current = true;
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', stopResizing);
        document.body.style.cursor = 'col-resize';
    }, []);

    const startResizingRight = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        isResizingRight.current = true;
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', stopResizing);
        document.body.style.cursor = 'col-resize';
    }, []);

    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (!containerRef.current) return;
        const containerRect = containerRef.current.getBoundingClientRect();

        if (isResizingLeft.current) {
            const newWidth = e.clientX - containerRect.left;
            if (newWidth > 250 && newWidth < containerRect.width * 0.4) {
                setLeftWidth(newWidth);
            }
        } else if (isResizingRight.current) {
            const newWidth = containerRect.right - e.clientX;
            if (newWidth > 200 && newWidth < containerRect.width * 0.4) {
                setRightWidth(newWidth);
            }
        }
    }, []);

    const stopResizing = useCallback(() => {
        isResizingLeft.current = false;
        isResizingRight.current = false;
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', stopResizing);
        document.body.style.cursor = 'default';
    }, [handleMouseMove]);

    // ---- Resolution Logic ----
    const currentUser = useSelector((state: RootState) => state.auth.user);
    const { mutate: resolveConflict, isPending: isResolving } = useResolveConflict();

    const handleInclude = useCallback((paperId: string) => {
        if (!screeningProcessId || !currentUser?.id) return;

        resolveConflict({
            processId: screeningProcessId,
            paperId,
            request: {
                finalDecision: 0, // Include
                phase: currentPhaseNumeric,
                resolvedBy: currentUser.id,
                resolutionNotes: 'Leader resolution'
            }
        }, {
            onSuccess: () => {
                toastSuccess('Included', 'Paper included successfully');
                queryClient.invalidateQueries({
                    queryKey: ["study-selection", screeningProcessId, "conflict-status"]
                });
            },
            onError: (err: any) => toastError('Error', err.message || 'Failed to include paper')
        });
    }, [screeningProcessId, currentUser, currentPhaseNumeric, resolveConflict]);

    const handleExclude = useCallback((paperId: string, exclusionReasonId: string | null, reason: string | null) => {
        if (!screeningProcessId || !currentUser?.id) return;

        resolveConflict({
            processId: screeningProcessId,
            paperId,
            request: {
                finalDecision: 1, // Exclude
                phase: currentPhaseNumeric,
                resolvedBy: currentUser.id,
                exclusionReasonId,
                resolutionNotes: reason
            }
        }, {
            onSuccess: () => {
                toastSuccess('Excluded', 'Paper excluded successfully');
                queryClient.invalidateQueries({
                    queryKey: ["study-selection", screeningProcessId, "conflict-status"]
                });
            },
            onError: (err: any) => toastError('Error', err.message || 'Failed to exclude paper')
        });
    }, [screeningProcessId, currentUser, currentPhaseNumeric, resolveConflict]);

    return (
        <div className="flex flex-col h-screen bg-slate-50 overflow-hidden">
            <StuSePhaseHeaderController
                currentPhase={currentPhase}
                onPhaseChange={(phase) => {
                    setCurrentPhase(phase);
                    setSelectedPaperId(null);
                    setSelectedIds([]);
                }}
            />

            <div
                ref={containerRef}
                className="flex flex-1 overflow-hidden select-none"
            >
                {/* Left Side: Paper List */}
                <div
                    style={{ width: `${leftWidth}px` }}
                    className={cn(
                        "flex-shrink-0 flex flex-col border-r border-slate-200 transition-colors duration-300",
                        isAssignmentMode ? "bg-indigo-50/30" : "bg-white"
                    )}
                >
                    <div className={cn(
                        "p-4 border-b border-slate-200 transition-colors duration-300",
                        isAssignmentMode ? "bg-indigo-50/50" : "bg-white"
                    )}>
                        <Button
                            onClick={() => {
                                setIsAssignmentMode(!isAssignmentMode);
                                if (isAssignmentMode) setSelectedIds([]);
                            }}
                            className={cn(
                                "w-full gap-2 transition-all duration-300 shadow-md",
                                isAssignmentMode
                                    ? "bg-rose-500 hover:bg-rose-600 text-white border-none"
                                    : "bg-indigo-600 hover:bg-indigo-700 text-white"
                            )}
                            size="sm"
                        >
                            {isAssignmentMode ? (
                                <>
                                    <X className="w-4 h-4" />
                                    Exit Assignment
                                </>
                            ) : (
                                <>
                                    <Users className="w-4 h-4" />
                                    Assign Reviewers
                                </>
                            )}
                        </Button>
                        {isAssignmentMode && (
                            <div className="mt-3 space-y-2 animate-in fade-in slide-in-from-top-1 duration-300">
                                <div className="text-[10px] font-black text-indigo-500 uppercase tracking-widest flex items-center gap-2 animate-pulse">
                                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                                    Assignment Mode Active
                                </div>
                                <div className="p-2.5 bg-amber-50/50 border border-amber-100 rounded-lg flex gap-2">
                                    <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                                    <p className="text-[10px] text-slate-600 leading-relaxed font-medium">
                                        Select papers to assign reviewers. <span className="text-amber-700 font-bold">Resolved papers</span> cannot be assigned.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="flex-1 overflow-hidden">
                        <PaperList
                            studySelectionProcessId={screeningProcessId || ''}
                            currentPhase={currentPhase}
                            selectedPaperId={selectedPaperId}
                            onSelectPaper={setSelectedPaperId}
                            selectedIds={selectedIds}
                            onSelectionChange={setSelectedIds}
                            isAssignmentMode={isAssignmentMode}
                        />
                    </div>
                </div>

                {/* Resize Handle Left */}
                <div
                    onMouseDown={startResizingLeft}
                    className="w-1.5 hover:w-2 bg-transparent hover:bg-blue-400/30 cursor-col-resize flex-shrink-0 transition-all flex items-center justify-center group"
                >
                    <div className="w-0.5 h-8 bg-slate-200 group-hover:bg-blue-400 rounded-full" />
                </div>

                <div className="flex-1 min-w-0 bg-white shadow-[inset_0_0_20px_rgba(0,0,0,0.02)]">
                    <PaperViewer
                        paper={selectedPaper ? { ...selectedPaper, hasConflict: paperHasConflict } : null}
                        isLeaderView={true}
                        onInclude={
                            selectedPaper && 
                            (!selectedPaper.resolution || selectedPaper.resolution.phase < currentPhaseNumeric)
                                ? handleInclude 
                                : undefined
                        }
                        onExclude={
                            selectedPaper && 
                            (!selectedPaper.resolution || selectedPaper.resolution.phase < currentPhaseNumeric)
                                ? handleExclude 
                                : undefined
                        }
                        isSubmitting={isResolving}
                        phase={currentPhaseNumeric}
                    />
                </div>

                {/* Resize Handle Right */}
                <div
                    onMouseDown={startResizingRight}
                    className="w-1.5 hover:w-2 bg-transparent hover:bg-blue-400/30 cursor-col-resize flex-shrink-0 transition-all flex items-center justify-center group"
                >
                    <div className="w-0.5 h-8 bg-slate-200 group-hover:bg-blue-400 rounded-full" />
                </div>

                {/* Right Side: Action Panel */}
                <div
                    style={{ width: `${rightWidth}px` }}
                    className="flex-shrink-0"
                >
                    <SelectionActionPanel />
                </div>
            </div>

            {isAssignmentMode && selectedIds.length > 0 && (
                <BulkAssignmentPanel
                    selectedPaperIds={selectedIds}
                    currentPhase={currentPhaseNumeric}
                    onAssignmentComplete={() => {
                        setSelectedIds([]);
                        queryClient.invalidateQueries({
                            queryKey: ["infinite-title-abstract-assignment-papers", screeningProcessId]
                        });
                        queryClient.invalidateQueries({
                            queryKey: ["infinite-full-text-assignment-papers", screeningProcessId]
                        });
                        queryClient.invalidateQueries({
                            queryKey: ["reviewer-decisions"]
                        });
                        queryClient.invalidateQueries({
                            queryKey: ["study-selection", screeningProcessId, "conflict-status"]
                        });
                    }}
                />
            )}
        </div>
    );
}
