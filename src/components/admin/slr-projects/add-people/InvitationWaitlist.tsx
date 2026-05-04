import { FiTrash2 } from "react-icons/fi";
import { cn } from "../../../../utils/cn";
import Tooltip from "../../../ui/Tooltip";

interface WaitlistUser {
    id: string;
    fullName: string;
    userName: string;
    role: "Leader" | "Member";
}

interface InvitationWaitlistProps {
    users: WaitlistUser[];
    onRemove: (userId: string) => void;
    onSelect: (userId: string) => void;
    selectedUserId: string | null;
    getInitials: (name: string) => string;
}

export default function InvitationWaitlist({
    users,
    onRemove,
    onSelect,
    selectedUserId,
    getInitials
}: InvitationWaitlistProps) {
    if (users.length === 0) return null;

    return (
        <div className="space-y-3 animate-in fade-in slide-in-from-left-4 duration-500">
            <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Invitation Waitlist</span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-slate-100 text-[9px] font-black text-slate-500">
                    {users.length} {users.length === 1 ? 'Person' : 'People'}
                </span>
            </div>

            <div className="grid grid-cols-1 gap-2 max-h-[180px] overflow-y-auto pr-2 custom-scrollbar">
                {users.map((user) => (
                    <div
                        key={user.id}
                        onClick={() => onSelect(user.id)}
                        className={cn(
                            "group flex items-center justify-between p-2.5 rounded-2xl border transition-all duration-300 cursor-pointer",
                            selectedUserId === user.id
                                ? "bg-indigo-50/50 border-indigo-200"
                                : "bg-white border-slate-100 hover:border-slate-200"
                        )}
                    >
                        <div className="flex items-center gap-3 min-w-0">
                            <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                {getInitials(user.fullName)}
                            </div>
                            <div className="min-w-0">
                                <p className="text-[11px] font-black text-slate-800 truncate leading-none mb-1">{user.fullName}</p>
                                <div className="flex items-center gap-1.5">
                                    <span className={cn(
                                        "px-1.5 py-0.5 rounded text-[7px] font-black uppercase tracking-wider",
                                        user.role === "Leader" ? "bg-amber-50 text-amber-600" : "bg-blue-50 text-blue-600"
                                    )}>
                                        {user.role === "Leader" ? "Lead" : "Member"}
                                    </span>
                                    <span className="text-[9px] font-bold text-slate-300 italic">@{user.userName}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-1">
                            <Tooltip content="Remove from list" position="top">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onRemove(user.id);
                                    }}
                                    className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                >
                                    <FiTrash2 size={12} />
                                </button>
                            </Tooltip>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
