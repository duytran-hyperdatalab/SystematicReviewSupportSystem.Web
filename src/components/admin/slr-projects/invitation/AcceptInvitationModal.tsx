import { FiCheckCircle } from "react-icons/fi";
import Modal from "../../../ui/Modal";
import Button from "../../../ui/Button";
import { ProjectRole } from "../../../../types/project";

import { useAcceptInvitation } from "../../../../hooks/useProjects";
import { toastSuccess, toastError } from "../../../../utils/toast";

interface AcceptInvitationModalProps {
    isOpen: boolean;
    onClose: () => void;
    role: number;
    invitationId: string;
    onSuccess?: () => void;
}

export default function AcceptInvitationModal({
    isOpen,
    onClose,
    role,
    invitationId,
    onSuccess
}: AcceptInvitationModalProps) {
    const { acceptInvitation, isAccepting } = useAcceptInvitation();

    const handleAccept = async () => {
        try {
            await acceptInvitation(invitationId);
            toastSuccess("Successfully joined the project!");
            onSuccess?.();
            onClose();
        } catch (error) {
            toastError("Failed to join the project.");
        }
    };
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Join Project"
        >
            <div className="p-6">
                <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <FiCheckCircle size={32} />
                </div>
                <p className="text-center text-slate-600 font-medium mb-8">
                    Do you want to join this project as <span className="text-slate-900 font-black">{role === ProjectRole.Leader ? "Project Leader" : "Standard Member"}</span>?
                </p>
                <div className="flex gap-3">
                    <Button
                        variant="secondary"
                        onClick={onClose}
                        className="flex-1"
                    >
                        No, Cancel
                    </Button>
                    <Button
                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                        onClick={handleAccept}
                        disabled={isAccepting}
                    >
                        {isAccepting ? "Joining..." : "Yes, Join Now"}
                    </Button>
                </div>
            </div>
        </Modal>
    );
}
