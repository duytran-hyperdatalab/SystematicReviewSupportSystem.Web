import { useState } from "react";
import { FiXCircle } from "react-icons/fi";
import Modal from "../../../ui/Modal";
import Button from "../../../ui/Button";

import { useRejectInvitation } from "../../../../hooks/useProjects";
import { toastSuccess, toastError } from "../../../../utils/toast";

interface RejectInvitationModalProps {
    isOpen: boolean;
    onClose: () => void;
    invitationId: string;
    onSuccess?: () => void;
}

export default function RejectInvitationModal({
    isOpen,
    onClose,
    invitationId,
    onSuccess
}: RejectInvitationModalProps) {
    const [message, setMessage] = useState("");
    const { rejectInvitation, isRejecting } = useRejectInvitation();

    const handleReject = async () => {
        try {
            await rejectInvitation({ invitationId, message });
            toastSuccess("Invitation declined successfully.");
            onSuccess?.();
            onClose();
        } catch (error) {
            toastError("Failed to decline invitation.");
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Decline Invitation"
        >
            <div className="p-6">
                <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <FiXCircle size={32} />
                </div>
                <p className="text-center text-slate-600 font-medium mb-4">
                    Please provide a reason for declining this invitation (optional).
                </p>
                <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type your message here..."
                    className="w-full h-32 p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-200 outline-none transition-all resize-none mb-6"
                />
                <div className="flex gap-3">
                    <Button
                        variant="secondary"
                        onClick={onClose}
                        className="flex-1"
                    >
                        Cancel
                    </Button>
                    <Button
                        className="flex-1 bg-rose-600 hover:bg-rose-700 text-white"
                        onClick={handleReject}
                        disabled={isRejecting}
                    >
                        {isRejecting ? "Declining..." : "Submit"}
                    </Button>
                </div>
            </div>
        </Modal>
    );
}
