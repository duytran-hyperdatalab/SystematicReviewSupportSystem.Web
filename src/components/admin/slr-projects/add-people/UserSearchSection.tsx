import { FiSearch, FiCheck, FiChevronRight, FiPlus } from "react-icons/fi";
import { cn } from "../../../../utils/cn";
import LoadingSpinner from "../../../ui/LoadingSpinner";

interface User {
    id: string;
    fullName: string;
    userName: string;
    email: string;
    status: "available" | "added" | "invited";
}

interface UserSearchSectionProps {
    searchTerm: string;
    onSearchChange: (value: string) => void;
    isSearching: boolean;
    displayUsers: User[];
    selectedUserId: string | null;
    onSelectUser: (user: User) => void;
    assignedRoles: Record<string, "Leader" | "Member">;
    getInitials: (name: string) => string;
    // Pagination for admin list
    currentPage?: number;
    totalPages?: number;
    onPageChange?: (page: number) => void;
}

export default function UserSearchSection({
    searchTerm,
    onSearchChange,
    isSearching,
    displayUsers,
    selectedUserId,
    onSelectUser,
    assignedRoles,
    getInitials,
    currentPage,
    totalPages,
    onPageChange
}: UserSearchSectionProps) {

    return (
        <div className="space-y-4">
            <div className="relative group">
                <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-colors" size={16} />
                <input
                    type="text"
                    placeholder="Search username or email..."
                    value={searchTerm}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-[1.25rem] text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-200 focus:bg-white transition-all placeholder:text-slate-300 placeholder:font-medium"
                />
            </div>

            <div className="max-h-[340px] overflow-y-auto pr-2 -mr-2 space-y-2 custom-scrollbar relative">
                {isSearching && (
                    <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] z-10 flex items-center justify-center rounded-2xl">
                        <LoadingSpinner size="sm" />
                    </div>
                )}

                {displayUsers.length > 0 ? (
                    displayUsers.map((user: User) => {
                        const isSelected = selectedUserId === user.id;
                        const isAlreadyChosen = assignedRoles[user.id];
                        const isAdded = user.status === "added";
                        const isInvited = user.status === "invited";
                        const isSelectable = user.status === "available";

                        return (
                            <div
                                key={user.id}
                                onClick={() => onSelectUser(user)}
                                className={cn(
                                    "group flex items-center gap-3 p-3 rounded-2xl border transition-all duration-300 cursor-pointer select-none",
                                    isSelected ? "bg-indigo-600 border-indigo-600 shadow-xl shadow-indigo-100" : "bg-white border-slate-50 hover:border-slate-200 hover:bg-slate-50",
                                    !isSelectable && !isSelected && "opacity-50 cursor-not-allowed"
                                )}
                            >
                                <div className={cn(
                                    "w-10 h-10 rounded-xl flex items-center justify-center text-xs font-black shrink-0",
                                    isSelected ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
                                )}>
                                    {getInitials(user.fullName)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className={cn("text-sm font-black tracking-tight truncate", isSelected ? "text-white" : "text-slate-800")}>
                                        {user.fullName}
                                    </p>
                                    <div className="flex items-center gap-1.5 mt-0.5">
                                        <p className={cn("text-[9px] font-bold italic", isSelected ? "text-white/60" : "text-slate-400")}>@{user.userName}</p>
                                        <div className={cn("w-0.5 h-0.5 rounded-full", isSelected ? "bg-white/20" : "bg-slate-300")} />
                                        <p className={cn("text-[9px] font-medium truncate", isSelected ? "text-white/60" : "text-slate-400")}>{user.email}</p>
                                    </div>
                                </div>
                                {isAdded || isInvited ? (
                                    <span className={cn(
                                        "px-2 py-0.5 rounded-lg text-[7px] font-black uppercase tracking-widest",
                                        isSelected ? "bg-white/20 text-white" : "bg-slate-50 text-slate-400"
                                    )}>
                                        {isAdded ? "Member" : "Invited"}
                                    </span>
                                ) : isAlreadyChosen && !isSelected ? (
                                    <div className="flex items-center gap-1.5 px-2 py-1.5 bg-indigo-50 text-indigo-600 text-[8px] font-black uppercase tracking-widest rounded-lg">
                                        {assignedRoles[user.id]}
                                        <FiCheck size={10} />
                                    </div>
                                ) : isSelected ? (
                                    <FiChevronRight className="text-white animate-pulse" />
                                ) : isSelectable && (
                                    <div className="w-5 h-5 rounded-lg border-2 border-slate-100 group-hover:border-indigo-200 flex items-center justify-center transition-colors">
                                        <FiPlus className="text-slate-200 group-hover:text-indigo-400" size={12} />
                                    </div>
                                )}
                            </div>
                        );
                    })
                ) : searchTerm.length > 0 && searchTerm.length < 2 && !isSearching ? (
                    <div className="py-10 text-center space-y-2 text-slate-300">
                        <p className="text-xs font-bold">Continue typing to search...</p>
                    </div>
                ) : !isSearching && (
                    <div className="py-10 text-center space-y-2">
                        {currentPage !== undefined ? (
                            <>
                                <p className="text-xs font-bold text-slate-300">Browsing all active users</p>
                                <p className="text-[10px] text-slate-200 uppercase tracking-widest">Select members from the list below</p>
                            </>
                        ) : (
                            <p className="text-xs font-bold text-slate-300">Type at least 2 characters to search</p>
                        )}
                    </div>
                )}

                {/* Pagination Controls for Admin List */}
                {currentPage !== undefined && totalPages !== undefined && totalPages > 1 && (
                    <div className="flex items-center justify-between gap-4 py-3 border-t border-slate-50 sticky bottom-0 bg-white pt-3">
                        <button
                            onClick={() => onPageChange?.(Math.max(1, currentPage - 1))}
                            disabled={currentPage === 1}
                            className="p-1.5 bg-white border border-slate-200 rounded-lg text-slate-400 hover:bg-slate-50 hover:text-indigo-600 transition-all disabled:opacity-30 disabled:pointer-events-none shadow-sm active:scale-95"
                        >
                            <FiChevronRight className="rotate-180" size={14} />
                        </button>
                        <div className="flex items-center gap-2">
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{currentPage} / {totalPages}</span>
                        </div>
                        <button
                            onClick={() => onPageChange?.(Math.min(totalPages, currentPage + 1))}
                            disabled={currentPage === totalPages}
                            className="p-1.5 bg-white border border-slate-200 rounded-lg text-slate-400 hover:bg-slate-50 hover:text-indigo-600 transition-all disabled:opacity-30 disabled:pointer-events-none shadow-sm active:scale-95"
                        >
                            <FiChevronRight size={14} />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
