import React from "react";
import Modal from "../../ui/Modal";
import Button from "../../ui/Button";
import { FiAlertCircle, FiCheckCircle, FiXCircle } from "react-icons/fi";
import type { User } from "../../../types/user";

interface StatusConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: User | null;
    onConfirm: () => void;
    isLoading: boolean;
}

const StatusConfirmModal: React.FC<StatusConfirmModalProps> = ({ isOpen, onClose, user, onConfirm, isLoading }) => {
    if (!user) return null;

    const isActivating = !user.isActive;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={isActivating ? "Activate User Account" : "Deactivate User Account"}
            description={isActivating
                ? "This will restore access for the user to login and interact with the system."
                : "This will temporarily suspend the user's access. They will be unable to login or perform actions."}
            size="sm"
        >
            <div className="space-y-6">
                <div className={`p-4 rounded-2xl flex items-center gap-3 ${isActivating ? 'bg-emerald-50 text-emerald-800 border border-emerald-100' : 'bg-rose-50 text-rose-800 border border-rose-100'}`}>
                    {isActivating ? <FiCheckCircle size={24} className="text-emerald-500" /> : <FiXCircle size={24} className="text-rose-500" />}
                    <div>
                        <p className="text-sm font-black">Target Account: {user.fullName}</p>
                        <p className="text-xs font-medium opacity-80">@{user.username}</p>
                    </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex gap-3 text-slate-600">
                    <FiAlertCircle size={20} className="shrink-0 text-amber-500" />
                    <p className="text-xs leading-relaxed font-medium">
                        {isActivating
                            ? "Activating this account will enable all standard permissions associated with their role."
                            : "Deactivating this account is immediate. All active sessions will be invalidated on their next request."}
                    </p>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-50">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-6 py-2.5 text-sm font-bold text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded-xl transition-all"
                        disabled={isLoading}
                    >
                        Cancel
                    </button>
                    <Button
                        onClick={onConfirm}
                        isLoading={isLoading}
                        variant={isActivating ? "success" : "danger"}
                        className={`min-w-[140px] ${isActivating ? 'bg-emerald-600 hover:bg-emerald-700 hover:shadow-emerald-100 shadow-lg transition-transform active:scale-95' : 'bg-rose-600 hover:bg-rose-700 hover:shadow-rose-100 shadow-lg transition-transform active:scale-95'}`}
                    >
                        {isActivating ? "Confirm Activation" : "Confirm Deactivation"}
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

export default StatusConfirmModal;
