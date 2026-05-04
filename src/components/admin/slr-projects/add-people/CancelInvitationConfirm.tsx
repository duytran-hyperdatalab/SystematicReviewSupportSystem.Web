import { FiAlertCircle } from "react-icons/fi";
import Button from "../../../ui/Button";

interface CancelInvitationConfirmProps {
    isOpen: boolean;
    onConfirm: () => void;
    onCancel: () => void;
    invitedUserName?: string;
    isSubmitting?: boolean;
}

export default function CancelInvitationConfirm({
    isOpen,
    onConfirm,
    onCancel,
    invitedUserName,
    isSubmitting
}: CancelInvitationConfirmProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 animate-in fade-in duration-300">
            <div
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                onClick={onCancel}
            />
            <div className="relative bg-white rounded-[2.5rem] w-full max-w-sm p-8 shadow-2xl animate-in zoom-in-95 duration-300 space-y-6">
                <div className="w-16 h-16 bg-rose-50 rounded-[2rem] flex items-center justify-center text-rose-500 mb-6">
                    <FiAlertCircle size={32} />
                </div>
                <div className="space-y-2">
                    <h4 className="text-xl font-black text-slate-900 tracking-tight leading-tight">Cancel Invitation?</h4>
                    <p className="text-sm text-slate-500 font-medium leading-relaxed">
                        Are you sure you want to cancel the invitation for <span className="text-rose-600 font-bold">{invitedUserName}</span>? This action cannot be undone.
                    </p>
                </div>
                <div className="flex flex-col gap-3">
                    <Button
                        onClick={onConfirm}
                        disabled={isSubmitting}
                        className="w-full py-4 bg-rose-600 text-white text-xs font-black rounded-2xl hover:bg-rose-700 transition-all active:scale-95 uppercase tracking-widest shadow-lg shadow-rose-100"
                    >
                        {isSubmitting ? "Cancelling..." : "Yes, Cancel Invitation"}
                    </Button>
                    <button
                        onClick={onCancel}
                        disabled={isSubmitting}
                        className="w-full py-4 text-xs font-black text-slate-400 hover:text-slate-600 transition-all uppercase tracking-widest disabled:opacity-50"
                    >
                        Keep Invitation
                    </button>
                </div>
            </div>
        </div>
    );
}
