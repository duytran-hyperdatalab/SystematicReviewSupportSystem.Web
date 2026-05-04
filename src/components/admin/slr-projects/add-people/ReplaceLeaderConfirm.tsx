import { FiAlertTriangle } from "react-icons/fi";

interface ReplaceLeaderConfirmProps {
    isOpen: boolean;
    onConfirm: () => void;
    onCancel: () => void;
    selectedUserName?: string;
}

export default function ReplaceLeaderConfirm({
    isOpen,
    onConfirm,
    onCancel,
    selectedUserName
}: ReplaceLeaderConfirmProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
            <div className="relative bg-white rounded-[2.5rem] w-full max-w-sm p-8 shadow-2xl animate-in zoom-in-95 duration-300 space-y-6">
                <div className="w-16 h-16 bg-amber-50 rounded-[2rem] flex items-center justify-center text-amber-500 mb-6">
                    <FiAlertTriangle size={32} />
                </div>
                <div className="space-y-2">
                    <h4 className="text-xl font-black text-slate-900 tracking-tight leading-tight">Replace Current Leader?</h4>
                    <p className="text-sm text-slate-500 font-medium leading-relaxed">
                        This project already has a lead researcher. Assigning this role to <span className="text-indigo-600 font-bold">{selectedUserName}</span> will revoke the current leadership status.
                    </p>
                </div>
                <div className="flex flex-col gap-3">
                    <button
                        onClick={onConfirm}
                        className="w-full py-4 bg-amber-500 text-white text-xs font-black rounded-2xl hover:bg-amber-600 transition-all active:scale-95 uppercase tracking-widest shadow-lg shadow-amber-100"
                    >
                        Confirm Replace
                    </button>
                    <button
                        onClick={onCancel}
                        className="w-full py-4 text-xs font-black text-slate-400 hover:text-slate-600 transition-all uppercase tracking-widest"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}
