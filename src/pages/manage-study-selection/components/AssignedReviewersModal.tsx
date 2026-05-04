import React from 'react';
import { Users } from 'lucide-react';
import Modal from '../../../components/ui/Modal';
import { cn } from '../../../utils/cn';
import type { AssignedReviewer } from '../../../types/studySelection';

interface AssignedReviewersModalProps {
    isOpen: boolean;
    onClose: () => void;
    paperTitle: string;
    reviewers: AssignedReviewer[];
}

const AssignedReviewersModal: React.FC<AssignedReviewersModalProps> = ({
    isOpen,
    onClose,
    paperTitle,
    reviewers
}) => {
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Assigned Reviewers"
            description={paperTitle}
            size="sm"
        >
            <div className="grid grid-cols-1 gap-3">
                {reviewers && reviewers.length > 0 ? (
                    reviewers.map((reviewer) => (
                        <div
                            key={reviewer.reviewerId}
                            className="flex flex-col gap-2 p-3 rounded-2xl bg-slate-50 border border-slate-100 group hover:border-indigo-100 hover:bg-white transition-all"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xs uppercase">
                                        {reviewer.reviewerName?.charAt(0) || "?"}
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-bold text-slate-700">
                                            {reviewer.reviewerName}
                                        </span>
                                        <span className="text-[10px] text-slate-400 font-medium leading-none">
                                            {reviewer.reviewerEmail}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    {reviewer.decision ? (
                                        <span
                                            className={cn(
                                                "px-2.5 py-1 text-[9px] font-black uppercase tracking-wider rounded-lg border",
                                                reviewer.decision.toLowerCase().includes("include")
                                                    ? "bg-green-100 text-green-700 border-green-300"
                                                    : reviewer.decision.toLowerCase().includes("exclude")
                                                        ? "bg-red-100 text-red-700 border-red-300"
                                                        : "bg-slate-100 text-slate-600 border-slate-300"
                                            )}
                                        >
                                            {reviewer.decision}
                                        </span>
                                    ) : (
                                        <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 bg-slate-100/50 px-2.5 py-1 rounded-lg border border-slate-200">
                                            Pending
                                        </span>
                                    )}
                                </div>
                            </div>

                            {reviewer.decision?.toLowerCase().includes("exclude") && (reviewer.exclusionReasonName || reviewer.exclusionNote) && (
                                <div className="mt-1 pt-2 border-t border-slate-200/50 space-y-2 animate-in fade-in slide-in-from-top-1">
                                    {reviewer.exclusionReasonName && (
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-100">
                                                {reviewer.exclusionReasonName}
                                            </span>
                                        </div>
                                    )}
                                    {reviewer.exclusionNote && (
                                        <div className="space-y-1.5">
                                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Reviewer Note</span>
                                            <textarea
                                                readOnly
                                                value={reviewer.exclusionNote}
                                                className="w-full text-xs text-slate-600 bg-white/50 border border-slate-200 rounded-xl p-2.5 focus:outline-none resize-none min-h-[60px] italic shadow-inner"
                                            />
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))
                ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-slate-400">
                        <Users className="w-8 h-8 mb-2 opacity-20" />
                        <p className="text-xs font-medium">No reviewers assigned yet</p>
                    </div>
                )}
            </div>
        </Modal>
    );
};

export default AssignedReviewersModal;
