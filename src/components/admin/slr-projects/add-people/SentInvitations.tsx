import { useState } from "react";
import { FiClock, FiXCircle, FiCheckCircle, FiBell, FiTrash2 } from "react-icons/fi";
import { cn } from "../../../../utils/cn";
import { useProjectInvitations, useCancelInvitation } from "../../../../hooks/useProjects";
import { ProjectRole, InvitationStatus, type ProjectInvitation } from "../../../../types/project";
import { toastSuccess, toastError } from "../../../../utils/toast";
import { getErrorMessage } from "../../../../utils/errorUtils";
import Tooltip from "../../../ui/Tooltip";
import CancelInvitationConfirm from "./CancelInvitationConfirm";

interface SentInvitationsProps {
    projectId: string;
}

const getStatusBadge = (status: number) => {
    switch (status) {
        case InvitationStatus.Pending:
            return (
                <span className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-600 border border-amber-100 text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5">
                    <FiClock size={10} />
                    Pending
                </span>
            );
        case InvitationStatus.Accepted:
            return (
                <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100 text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5">
                    <FiCheckCircle size={10} />
                    Accepted
                </span>
            );
        case InvitationStatus.Rejected:
            return (
                <span className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-600 border border-rose-100 text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5">
                    <FiXCircle size={10} />
                    Rejected
                </span>
            );
        case InvitationStatus.Cancelled:
            return (
                <span className="px-2.5 py-1 rounded-lg bg-slate-50 text-slate-400 border border-slate-100 text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5">
                    <FiTrash2 size={10} />
                    Cancelled
                </span>
            );
        default:
            return (
                <span className="px-2.5 py-1 rounded-lg bg-slate-50 text-slate-400 border border-slate-100 text-[9px] font-black uppercase tracking-widest">
                    Expired
                </span>
            );
    }
};

const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
};

export default function SentInvitations({ projectId }: SentInvitationsProps) {
    const { invitations, isLoading, refetch } = useProjectInvitations(projectId);
    const { cancelInvitation, isCancelling } = useCancelInvitation(projectId);
    const [invitationToCancel, setInvitationToCancel] = useState<{ id: string, name: string } | null>(null);

    const handleConfirmCancel = async () => {
        if (!invitationToCancel) return;

        try {
            await cancelInvitation(invitationToCancel.id);
            toastSuccess(`Invitation for ${invitationToCancel.name} has been cancelled.`);
            setInvitationToCancel(null);
            refetch();
        } catch (error: any) {
            toastError(getErrorMessage(error, "Failed to cancel invitation."));
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
                <div className="w-8 h-8 border-4 border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin" />
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Loading invitations...</p>
            </div>
        );
    }

    if (!invitations || invitations.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 px-8 text-center bg-slate-50/50 rounded-[2.5rem] border-2 border-dashed border-slate-100">
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-slate-300 mb-4 shadow-sm">
                    <FiBell size={24} />
                </div>
                <h4 className="text-sm font-black text-slate-800 uppercase tracking-tight">No Active Invitations</h4>
                <p className="text-[11px] font-medium text-slate-400 mt-1 max-w-[200px]">You haven't sent any invitations for this project yet.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="flex items-center justify-between px-2">
                <h6 className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Status Overview ({invitations.length})
                </h6>
            </div>

            <div className="grid gap-3">
                {invitations.map((inv: ProjectInvitation) => (
                    <div
                        key={inv.id}
                        className="group bg-white border border-slate-100 rounded-2xl p-4 transition-all duration-300 hover:shadow-lg hover:shadow-slate-100/50 hover:border-indigo-100"
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center text-xs font-black">
                                    {inv.invitedUserFullName[0].toUpperCase()}
                                </div>
                                <div className="space-y-0.5">
                                    <div className="flex items-center gap-2">
                                        <p className="text-sm font-black text-slate-900 tracking-tight">
                                            {inv.invitedUserFullName}
                                        </p>
                                        <span className={cn(
                                            "text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-lg",
                                            inv.role === ProjectRole.Leader ? "bg-indigo-50 text-indigo-600" : "bg-slate-100 text-slate-500"
                                        )}>
                                            {inv.role === ProjectRole.Leader ? "Lead" : "Std Member"}
                                        </span>
                                    </div>
                                    <p className="text-[10px] font-medium text-slate-400">{inv.invitedUserEmail}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="text-right hidden sm:block">
                                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-300">Sent Date</p>
                                    <p className="text-[10px] font-bold text-slate-600 italic">
                                        {formatDate(inv.createdAt)}
                                    </p>
                                </div>
                                <div className="min-w-[100px] flex justify-end">
                                    {getStatusBadge(inv.status)}
                                </div>

                                {inv.status === InvitationStatus.Pending && (
                                    <Tooltip content="Cancel Invitation" position="left">
                                        <button
                                            onClick={() => setInvitationToCancel({ id: inv.id, name: inv.invitedUserFullName })}
                                            disabled={isCancelling}
                                            className="p-2 text-slate-300 hover:text-rose-500 transition-colors active:scale-90"
                                        >
                                            <FiXCircle size={18} />
                                        </button>
                                    </Tooltip>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <CancelInvitationConfirm
                isOpen={!!invitationToCancel}
                invitedUserName={invitationToCancel?.name}
                onConfirm={handleConfirmCancel}
                onCancel={() => setInvitationToCancel(null)}
                isSubmitting={isCancelling}
            />
        </div>
    );
}
