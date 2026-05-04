import { FiUser, FiShield, FiCheck, FiAlertTriangle, FiTrash2, FiUsers } from "react-icons/fi";
import { cn } from "../../../../utils/cn";
import type { ResolvedLeader } from "../../../../utils/projectUtils";
import Tooltip from "../../../ui/Tooltip";

interface User {
    id: string;
    fullName: string;
    userName: string;
    email: string;
}

interface RoleAssignmentPanelProps {
    selectedUser: User | null | undefined;
    previewRole: "Leader" | "Member";
    canAssignLeaderRole: boolean;
    isLeaderResolved: boolean;
    currentLeader: ResolvedLeader | null;
    onRoleChange: (role: "Leader" | "Member") => void;
    onRemoveFromWaitlist: (userId: string) => void;
    getInitials: (name: string) => string;
    hideLeaderRole?: boolean;
    disableMemberRole?: boolean;
}

export default function RoleAssignmentPanel({
    selectedUser,
    previewRole,
    canAssignLeaderRole,
    isLeaderResolved,
    currentLeader,
    onRoleChange,
    onRemoveFromWaitlist,
    getInitials,
    hideLeaderRole = false,
    disableMemberRole = false
}: RoleAssignmentPanelProps) {
    const isAdded = !!selectedUser;
    return (
        <div className="h-full">
            {selectedUser ? (
                <div className="bg-slate-50 border border-indigo-100 rounded-[2rem] p-6 space-y-6 animate-in slide-in-from-right-4 duration-500">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center text-sm font-black shadow-lg shadow-indigo-100">
                                    {getInitials(selectedUser.fullName)}
                                </div>
                                <div>
                                    <h6 className="text-sm font-black text-slate-900 tracking-tight leading-none mb-1">{selectedUser.fullName}</h6>
                                    <p className="text-[10px] font-bold text-slate-500 leading-none mb-1">@{selectedUser.userName}</p>
                                    <p className="text-[10px] font-medium text-slate-400 truncate">{selectedUser.email}</p>
                                </div>
                            </div>
                            <Tooltip content={isAdded ? "Remove from waitlist" : "Dismiss preview"} position="left">
                                <button
                                    onClick={() => onRemoveFromWaitlist(selectedUser.id)}
                                    className={cn(
                                        "p-2 rounded-xl transition-all",
                                        isAdded ? "text-red-400 hover:text-red-500 hover:bg-red-50" : "text-slate-300 hover:text-slate-500 hover:bg-slate-100"
                                    )}
                                >
                                    <FiTrash2 size={16} />
                                </button>
                            </Tooltip>
                        </div>

                        <div className="h-px bg-slate-200" />

                        <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Assign Permission Tier</label>
                            <div className="grid grid-cols-1 gap-3">
                                {!disableMemberRole && (
                                    <button
                                        onClick={() => onRoleChange("Member")}
                                        className={cn(
                                            "group flex items-center justify-between p-4 rounded-2xl border-2 transition-all text-left",
                                            previewRole === "Member"
                                                ? "bg-white border-indigo-600 shadow-lg shadow-indigo-100/50"
                                                : "bg-white/50 border-slate-100 hover:border-slate-200"
                                        )}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={cn(
                                                "p-2 rounded-xl transition-colors",
                                                previewRole === "Member" ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-400"
                                            )}>
                                                <FiUser size={16} />
                                            </div>
                                            <div>
                                                <p className="text-xs font-black text-slate-800 tracking-tight leading-none mb-1">Standard Member</p>
                                                <p className="text-[9px] font-bold text-slate-400">Read & contribute access</p>
                                            </div>
                                        </div>
                                        {previewRole === "Member" && <FiCheck className="text-indigo-600" size={18} />}
                                    </button>
                                )}

                                {!hideLeaderRole && (
                                    <button
                                        disabled={!canAssignLeaderRole && previewRole !== "Leader"}
                                        onClick={() => onRoleChange("Leader")}
                                        className={cn(
                                            "group flex items-center justify-between p-4 rounded-2xl border-2 transition-all text-left relative overflow-hidden",
                                            previewRole === "Leader"
                                                ? "bg-indigo-900 border-indigo-900 shadow-xl shadow-slate-200"
                                                : "bg-white/50 border-slate-100 hover:border-slate-200",
                                            !canAssignLeaderRole && previewRole !== "Leader" && "opacity-60 cursor-not-allowed bg-slate-50"
                                        )}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={cn(
                                                "p-2 rounded-xl transition-colors",
                                                previewRole === "Leader" ? "bg-white text-indigo-900" : "bg-slate-100 text-slate-400"
                                            )}>
                                                <FiShield size={16} />
                                            </div>
                                            <div>
                                                <p className={cn("text-xs font-black tracking-tight leading-none mb-1", previewRole === "Leader" ? "text-white" : "text-slate-800")}>Lead Researcher</p>
                                                <p className={cn("text-[9px] font-bold", previewRole === "Leader" ? "text-white/60" : "text-slate-400")}>
                                                    {!isLeaderResolved ? "Checking leadership..." :
                                                        currentLeader?.type === "Accepted" ? "Project already has a Leader" :
                                                            currentLeader?.type === "Pending" ? "Leader invitation is pending" :
                                                                "Full workspace management"}
                                                </p>
                                            </div>
                                        </div>
                                        {previewRole === "Leader" ? (
                                            <FiCheck className="text-white" size={18} />
                                        ) : (
                                            !canAssignLeaderRole && isLeaderResolved && (
                                                <Tooltip content={currentLeader?.type === "Accepted" ? "This project already has a Leader" : "A Leader invitation is currently pending acceptance."}>
                                                    <FiAlertTriangle className="text-amber-500" size={14} />
                                                </Tooltip>
                                            )
                                        )}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-center gap-2 py-3 bg-emerald-50/50 border border-emerald-100 rounded-2xl">
                        <div className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-500 text-white">
                            <FiCheck size={12} />
                        </div>
                        <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Saved into Batch</p>
                    </div>

                    <div className="p-4 bg-white/30 border border-slate-100 border-dashed rounded-2xl">
                        <p className="text-[9px] text-slate-400 font-bold leading-relaxed italic text-center">
                            Role updates are saved instantly. Send invitations when ready.
                        </p>
                    </div>
                </div>
            ) : (
                <div className="h-full flex flex-col items-center justify-center border-2 border-dashed border-slate-100 rounded-[2rem] p-10 text-center space-y-4">
                    <div className="w-16 h-16 bg-slate-50 rounded-[2rem] flex items-center justify-center text-slate-200">
                        <FiUsers size={32} />
                    </div>
                    <div className="space-y-1">
                        <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Awaiting Selection</p>
                        <p className="text-xs font-bold text-slate-300 italic">Select a contributor to assign role</p>
                    </div>
                </div>
            )}
        </div>
    );
}
