import React from "react";
import Modal from "../../ui/Modal";
import type { User } from "../../../types/user";
import { FiArrowRight, FiCheckCircle } from "react-icons/fi";

interface ChangePreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    oldData: User | null;
    newData: User | null;
}

const ChangePreviewModal: React.FC<ChangePreviewModalProps> = ({ isOpen, onClose, oldData, newData }) => {
    if (!oldData || !newData) return null;

    const changes = [
        { label: "Full Name", old: oldData.fullName, new: newData.fullName },
        { label: "Email", old: oldData.email, new: newData.email },
        { label: "Username", old: oldData.username, new: newData.username },
    ].filter(item => item.old !== item.new);

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Profile Updated Successfully"
            description="The following changes have been recorded in the system."
            size="md"
        >
            <div className="space-y-6">
                <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl flex items-center gap-3">
                    <FiCheckCircle className="text-emerald-500 shrink-0" size={20} />
                    <p className="text-xs font-bold text-emerald-800">
                        Admin authorization confirmed. Records updated.
                    </p>
                </div>

                <div className="space-y-3">
                    {changes.length > 0 ? changes.map((change, i) => (
                        <div key={i} className="group p-4 bg-slate-50 rounded-2xl border border-slate-100/50 hover:bg-white hover:border-indigo-100 hover:shadow-lg hover:shadow-indigo-50/50 transition-all duration-300">
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">{change.label}</p>
                            <div className="flex items-center gap-3">
                                <span className="text-sm font-medium text-slate-400 line-through truncate max-w-[120px]">{change.old}</span>
                                <FiArrowRight className="text-indigo-400 shrink-0" />
                                <span className="text-sm font-black text-slate-900 bg-white px-3 py-1 rounded-lg border border-indigo-50 shadow-sm truncate">{change.new}</span>
                            </div>
                        </div>
                    )) : (
                        <div className="text-center py-10">
                            <p className="text-sm text-slate-500 font-medium italic">No structural changes detected (data remained identical).</p>
                        </div>
                    )}
                </div>

                <div className="flex justify-end pt-4">
                    <button
                        onClick={onClose}
                        className="px-8 py-3 bg-slate-900 text-white text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-indigo-600 shadow-xl shadow-slate-200 transition-all active:scale-95"
                    >
                        Acknowledge Changes
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default ChangePreviewModal;
