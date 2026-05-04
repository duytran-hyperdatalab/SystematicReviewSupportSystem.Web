import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FiCalendar, FiUser, FiInfo, FiArrowLeft, FiShield, FiClock, FiCheckCircle, FiXCircle, FiTrash2, FiAlertCircle } from "react-icons/fi";
import { useInvitation } from "../../hooks/useProjects";
import { InvitationStatus, ProjectRole } from "../../types/project";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import { cn } from "../../utils/cn";
import AcceptInvitationModal from "../../components/admin/slr-projects/invitation/AcceptInvitationModal";
import RejectInvitationModal from "../../components/admin/slr-projects/invitation/RejectInvitationModal";

export default function InvitationDetailPage() {
    const { invitationId } = useParams<{ invitationId: string }>();
    const navigate = useNavigate();
    const { invitation, isLoading, error, refetch } = useInvitation(invitationId);

    const [isAcceptModalOpen, setIsAcceptModalOpen] = useState(false);
    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);

    const getStatusConfig = (status: number) => {
        switch (status) {
            case InvitationStatus.Pending:
                return {
                    label: "Pending",
                    icon: FiClock,
                    color: "text-amber-600",
                    bg: "bg-amber-50",
                    border: "border-amber-100",
                    description: "This invitation is currently waiting for a response."
                };
            case InvitationStatus.Accepted:
                return {
                    label: "Accepted",
                    icon: FiCheckCircle,
                    color: "text-emerald-600",
                    bg: "bg-emerald-50",
                    border: "border-emerald-100",
                    description: "You have already joined this project."
                };
            case InvitationStatus.Rejected:
                return {
                    label: "Rejected",
                    icon: FiXCircle,
                    color: "text-rose-600",
                    bg: "bg-rose-50",
                    border: "border-rose-100",
                    description: "This invitation was declined."
                };
            case InvitationStatus.Cancelled:
                return {
                    label: "Cancelled",
                    icon: FiTrash2,
                    color: "text-slate-400",
                    bg: "bg-slate-50",
                    border: "border-slate-100",
                    description: "This invitation was revoked by the sender."
                };
            default:
                return {
                    label: "Expired",
                    icon: FiAlertCircle,
                    color: "text-slate-400",
                    bg: "bg-slate-50",
                    border: "border-slate-100",
                    description: "This invitation has expired."
                };
        }
    };

    const formatDate = (dateStr?: string) => {
        if (!dateStr) return "N/A";
        return new Date(dateStr).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (isLoading) {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center">
                <LoadingSpinner size="lg" />
                <p className="mt-4 text-slate-500 font-medium animate-pulse">Fetching invitation details...</p>
            </div>
        );
    }

    if (error || !invitation) {
        return (
            <div className="container mx-auto px-4 py-20 max-w-2xl">
                <Card className="text-center p-12 border-2 border-dashed border-slate-200 shadow-none">
                    <div className="w-20 h-20 bg-rose-50 rounded-3xl flex items-center justify-center text-rose-500 mx-auto mb-6">
                        <FiAlertCircle size={40} />
                    </div>

                    <h2 className="text-2xl font-black text-slate-900 mb-2">
                        Invitation Not Found
                    </h2>

                    <p className="text-slate-500 mb-8 max-w-md mx-auto">
                        The invitation link might be broken, expired, or you don't have permission to view it.
                    </p>

                    <div className="flex justify-center">
                        <Button
                            onClick={() => navigate("/")}
                            variant="outline"
                            className="px-8"
                        >
                            Return Home
                        </Button>
                    </div>
                </Card>
            </div>
        );
    }

    const sc = getStatusConfig(invitation.status);
    const StatusIcon = sc.icon;

    return (
        <div className="min-h-screen bg-slate-50/50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                {/* Back Button */}
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-bold text-xs uppercase tracking-widest mb-8 transition-colors group"
                >
                    <FiArrowLeft className="group-hover:-translate-x-1 transition-transform" />
                    Back
                </button>

                <div className="grid gap-8">
                    {/* Main Content Card */}
                    <Card className="p-0 overflow-hidden border-0 shadow-2xl shadow-slate-200/50 rounded-[2.5rem]">
                        <div className="bg-slate-900 p-10 sm:p-12 text-white relative overflow-hidden">
                            {/* Decorative elements */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -mr-32 -mt-32" />
                            <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl -ml-24 -mb-24" />

                            <div className="relative z-10">
                                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white/80 text-[10px] font-black uppercase tracking-widest mb-6">
                                    <FiInfo size={12} />
                                    Project Invitation
                                </span>
                                <h1 className="text-3xl sm:text-4xl font-black tracking-tight mb-4">
                                    {invitation.projectTitle}
                                </h1>
                                <p className="text-white/60 text-sm font-medium max-w-lg leading-relaxed">
                                    You've been invited by <span className="text-white font-bold">{invitation.invitedByUserFullName}</span> to collaborate on this systematic literature review project.
                                </p>
                            </div>
                        </div>

                        <div className="p-10 sm:p-12 bg-white">
                            <div className="grid gap-10">
                                {/* Details Grid */}
                                <div className="grid sm:grid-cols-2 gap-8">
                                    <div className="space-y-2">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Your Assigned Role</p>
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                                                <FiShield size={20} />
                                            </div>
                                            <div>
                                                <p className="text-lg font-black text-slate-900">
                                                    {invitation.role === ProjectRole.Leader ? "Project Leader" : "Standard Member"}
                                                </p>
                                                <p className="text-xs text-slate-400 font-medium">Full collaboration access</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Invitation Status</p>
                                        <div className="flex items-center gap-3">
                                            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", sc.bg, sc.color)}>
                                                <StatusIcon size={20} />
                                            </div>
                                            <div>
                                                <p className={cn("text-lg font-black", sc.color)}>{sc.label}</p>
                                                <p className="text-xs text-slate-400 font-medium">{sc.description}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <hr className="border-slate-100" />

                                {/* Timeline / Dates */}
                                <div className="space-y-6">
                                    <div className="flex items-start gap-4">
                                        <div className="w-8 h-8 rounded-lg bg-slate-50 text-slate-400 flex items-center justify-center shrink-0">
                                            <FiCalendar size={16} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Sent Date</p>
                                            <p className="text-sm font-bold text-slate-700">{formatDate(invitation.createdAt)}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-4">
                                        <div className="w-8 h-8 rounded-lg bg-slate-50 text-slate-400 flex items-center justify-center shrink-0">
                                            <FiClock size={16} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Expires On</p>
                                            <p className="text-sm font-bold text-slate-700">{formatDate(invitation.expiredAt)}</p>
                                        </div>
                                    </div>

                                    {invitation.respondedAt && (
                                        <div className="flex items-start gap-4">
                                            <div className="w-8 h-8 rounded-lg bg-slate-50 text-slate-400 flex items-center justify-center shrink-0">
                                                <FiCheckCircle size={16} />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Responded At</p>
                                                <p className="text-sm font-bold text-slate-700">{formatDate(invitation.respondedAt)}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Actions Overlay for Pending */}
                        {invitation.status === InvitationStatus.Pending && (
                            <div className="bg-slate-50/80 border-t border-slate-100 p-8 sm:px-12 flex flex-col sm:flex-row items-center justify-between gap-6 backdrop-blur-sm">

                                {/* Left Info */}
                                <div className="flex items-center gap-4 text-slate-500">
                                    <div className="w-12 h-12 rounded-full bg-white border border-slate-200 flex items-center justify-center">
                                        <FiUser size={20} />
                                    </div>
                                    <div className="text-sm">
                                        <p className="font-bold text-slate-900">Respond to this invitation</p>
                                        <p className="font-medium">Please accept or reject this request to continue.</p>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex items-center gap-3 w-full sm:w-auto">
                                    <Button
                                        variant="outline"
                                        onClick={() => setIsRejectModalOpen(true)}
                                        className="flex-1 sm:flex-none border-rose-200 text-rose-600 hover:bg-rose-50 hover:border-rose-300 transition-all duration-200"
                                    >
                                        Reject
                                    </Button>

                                    <Button
                                        onClick={() => setIsAcceptModalOpen(true)}
                                        className="flex-1 sm:flex-none bg-emerald-600 hover:bg-emerald-700 text-white transition-all duration-200 shadow-sm hover:shadow-md"
                                    >
                                        Accept
                                    </Button>
                                </div>
                            </div>
                        )}
                    </Card>

                    {/* Additional Info / Help */}
                    <div className="text-center px-12">
                        <p className="text-xs text-slate-400 font-medium">
                            If you have questions about this invitation, please contact <span className="text-indigo-600 font-bold">{invitation.invitedByUserFullName}</span> directly.
                        </p>
                    </div>
                </div>
            </div>

            <AcceptInvitationModal
                isOpen={isAcceptModalOpen}
                onClose={() => setIsAcceptModalOpen(false)}
                role={invitation.role}
                invitationId={invitation.id}
                onSuccess={() => {
                    // Refetch invitation data to show updated status
                    refetch();
                }}
            />

            <RejectInvitationModal
                isOpen={isRejectModalOpen}
                onClose={() => setIsRejectModalOpen(false)}
                invitationId={invitation.id}
                onSuccess={() => {
                    // Refetch invitation data to show updated status
                    refetch();
                }}
            />
        </div>
    );
}
