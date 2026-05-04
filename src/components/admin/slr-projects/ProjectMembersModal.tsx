import { useState, useMemo, useEffect } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "../../../redux/store";
import Modal from "../../ui/Modal";
import {
    FiUsers,
    FiUserPlus,
    FiSend,
    FiSearch,
    FiTrash2,
    FiMail,
    FiCalendar,
    FiChevronLeft,
    FiChevronRight
} from "react-icons/fi";
import { cn } from "../../../utils/cn";
import { formatDate } from "../../../utils/dateFormat";
import Tooltip from "../../ui/Tooltip";
import LoadingSpinner from "../../ui/LoadingSpinner";
import { toastSuccess, toastError } from "../../../utils/toast";

// Hooks & Services
import {
    useProjectMembers,
    useProjectInvitations,
    useReplaceLeaderMutation,
    useSendInvitations,
    useProject
} from "../../../hooks/useProjects";
import { useUserSearch, useUsers } from "../../../hooks/useUsers";
import { useDebounce } from "../../../hooks/useDebounce";

// Types & Utils
import { ProjectRole, InvitationStatus, type UserSearchResult } from "../../../types/project";
import { resolveProjectLeader } from "../../../utils/projectUtils";

// Reusable Sub-components from add-people directory
import ProjectLeaderStatus from "./add-people/ProjectLeaderStatus";
import SelectionSection from "./add-people/SelectionSection";
import RoleAssignmentPanel from "./add-people/RoleAssignmentPanel";
import ReplaceLeaderConfirm from "./add-people/ReplaceLeaderConfirm";
import SentInvitations from "./add-people/SentInvitations";

interface ProjectMembersModalProps {
    isOpen: boolean;
    onClose: () => void;
    projectId?: string;
    projectName?: string;
    hideLeaderRole?: boolean; // Prop to hide Leader role management (for project leaders)
}

interface User {
    id: string;
    fullName: string;
    userName: string;
    email: string;
    status: "available" | "added" | "invited";
}

const getInitials = (name: string) => {
    return name
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase();
};

const mapSearchResultToUser = (result: UserSearchResult): User => ({
    id: result.id,
    fullName: result.fullName,
    userName: result.username,
    email: result.email,
    status: result.isAlreadyMember ? "added" : "available",
});

export default function ProjectMembersModal({ isOpen, onClose, projectId, projectName, hideLeaderRole = false }: ProjectMembersModalProps) {
    const [activeTab, setActiveTab] = useState<"collaboration" | "add" | "invites">("collaboration");
    const [memberSearchTerm, setMemberSearchTerm] = useState("");
    const debouncedMemberSearch = useDebounce(memberSearchTerm, 400);
    const [memberPageNumber, setMemberPageNumber] = useState(1);
    const [memberPageSize] = useState(10);

    const [inviteSearchTerm, setInviteSearchTerm] = useState("");
    const debouncedInviteSearch = useDebounce(inviteSearchTerm, 400);
    const [addMemberPageNumber, setAddMemberPageNumber] = useState(1);
    const [addMemberPageSize] = useState(10);

    const { user: currentUser } = useSelector((state: RootState) => state.auth);
    const { project } = useProject(isOpen ? projectId : undefined);

    // Check permission: Global Admin or Project Leader
    const isGlobalAdmin = currentUser?.role === "Admin";
    const isProjectLeader = project?.isLeader || project?.role === ProjectRole.Leader;
    const canManageMembers = isGlobalAdmin || isProjectLeader;

    // 1. Data Fetching
    const {
        members,
        data: membersPaginatedData,
        isLoading: isLoadingMembers,
        error: membersError,
        refetch: refetchMembers
    } = useProjectMembers(isOpen ? projectId : undefined, {
        search: debouncedMemberSearch,
        pageNumber: memberPageNumber,
        pageSize: memberPageSize
    });

    const {
        invitations,
        isLoading: isLoadingInvitations,
        refetch: refetchInvitations
    } = useProjectInvitations(projectId, undefined, { enabled: isOpen });

    // Search API Hook for Adding People (Old search function)
    const { users: searchResults, isLoading: isSearchingByKeyword } = useUserSearch(
        debouncedInviteSearch,
        projectId,
        activeTab === "add" && debouncedInviteSearch.length >= 2
    );

    // Admin List API Hook (New requirement)
    const { 
        users: adminListUsers, 
        data: adminListData, 
        isLoading: isLoadingAdminList 
    } = useUsers(
        isGlobalAdmin && activeTab === "add" && !debouncedInviteSearch ? {
            isActive: true,
            pageNumber: addMemberPageNumber,
            pageSize: addMemberPageSize
        } : undefined,
        isGlobalAdmin && activeTab === "add" && !debouncedInviteSearch
    );

    const isSearching = isSearchingByKeyword || isLoadingAdminList;

    // 2. Invitation Flow State
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
    const [assignedRoles, setAssignedRoles] = useState<Record<string, "Leader" | "Member">>({});
    const [userCache, setUserCache] = useState<Record<string, User>>({});
    const [previewRole, setPreviewRole] = useState<"Leader" | "Member">("Member");
    const [showReplaceConfirm, setShowReplaceConfirm] = useState(false);

    const { replaceLeader } = useReplaceLeaderMutation();
    const { sendInvitations, isSending: isSendingInvitations } = useSendInvitations(projectId);

    // 3. Derived State
    const users = useMemo(() => {
        // If it's an admin and they aren't searching, show the full user list
        if (isGlobalAdmin && !debouncedInviteSearch) {
            return adminListUsers
                .filter(u => u.role !== "Admin") // Hide other admins from the list
                .map(u => {
                    const isMember = members.some(m => m.userId === u.id);
                    const hasPendingInvite = invitations?.some(
                        inv => inv.invitedUserId === u.id && inv.status === InvitationStatus.Pending
                    );
                    return {
                        id: u.id,
                        fullName: u.fullName,
                        userName: u.username,
                        email: u.email,
                        status: isMember ? "added" : hasPendingInvite ? "invited" : "available",
                    } as User;
                });
        }

        // Otherwise use the search results
        // Note: UserSearchResult doesn't explicitly have a 'role' field in its type, 
        // but if it exists in the response, we should filter it.
        return searchResults
            .filter((result: any) => result.role !== "Admin")
            .map(result => {
                const user = mapSearchResultToUser(result);
                const hasPendingInvite = invitations?.some(
                    inv => inv.invitedUserId === result.id && inv.status === InvitationStatus.Pending
                );
                if (hasPendingInvite) user.status = "invited";
                return user;
            });
    }, [isGlobalAdmin, debouncedInviteSearch, adminListUsers, searchResults, invitations, members]);

    // Update user cache for invitations whenever the list of display users changes
    useEffect(() => {
        if (users.length > 0) {
            setUserCache(prev => {
                const next = { ...prev };
                let changed = false;
                users.forEach(user => {
                    // Update cache if user is missing or status has changed (e.g. from available to added)
                    if (!prev[user.id] || prev[user.id].status !== user.status) {
                        next[user.id] = user;
                        changed = true;
                    }
                });
                return changed ? next : prev;
            });
        }
    }, [users]);

    const currentLeader = useMemo(() => {
        return resolveProjectLeader(members, invitations);
    }, [members, invitations]);

    const isLeaderResolved = !isLoadingMembers && !isLoadingInvitations;

    const canAssignLeaderRole = useMemo(() => {
        if (!isLeaderResolved) return false;
        if (currentLeader) return false;
        return true;
    }, [isLeaderResolved, currentLeader]);

    const selectedUser = useMemo(() =>
        selectedUserId ? userCache[selectedUserId] : null,
        [userCache, selectedUserId]);

    const waitlistUsers = useMemo(() => {
        return Object.keys(assignedRoles).map(id => {
            const cachedUser = userCache[id];
            return {
                id,
                fullName: cachedUser?.fullName || "Loading...",
                userName: cachedUser?.userName || "...",
                role: assignedRoles[id]
            };
        });
    }, [assignedRoles, userCache]);

    // 4. Handlers
    const handleSelectUser = (user: User) => {
        if (user.status !== "available") return;
        setSelectedUserId(user.id);
        if (!assignedRoles[user.id]) {
            const role = isGlobalAdmin ? "Leader" : "Member";
            
            // Re-use single leader logic if assigning Leader role
            if (role === "Leader") {
                const otherWaitlistLeaderId = Object.entries(assignedRoles).find(
                    ([, r]) => r === "Leader"
                )?.[0];
                
                if (otherWaitlistLeaderId) {
                    const otherUser = userCache[otherWaitlistLeaderId];
                    setAssignedRoles(prev => {
                        const next = { ...prev };
                        if (isGlobalAdmin) {
                            delete next[otherWaitlistLeaderId];
                        } else {
                            next[otherWaitlistLeaderId] = "Member";
                        }
                        next[user.id] = "Leader";
                        return next;
                    });
                    setPreviewRole("Leader");
                    const message = isGlobalAdmin
                        ? `${otherUser?.fullName || "User"} was removed from the list. Only one Leader allowed in batch.`
                        : `${otherUser?.fullName || "User"} was moved to Standard Member. Only one Leader allowed in batch.`;
                    toastSuccess(message);
                    return;
                }
            }

            setAssignedRoles(prev => ({ ...prev, [user.id]: role }));
            setPreviewRole(role);
        } else {
            setPreviewRole(assignedRoles[user.id]);
        }
    };

    const handleRemoveFromWaitlist = (userId: string) => {
        setAssignedRoles((prev) => {
            const updated = { ...prev };
            delete updated[userId];
            return updated;
        });
        if (selectedUserId === userId) setSelectedUserId(null);
    };

    const handleSelectFromWaitlist = (userId: string) => {
        setSelectedUserId(userId);
        if (assignedRoles[userId]) setPreviewRole(assignedRoles[userId]);
    };

    const effectivelyHideLeaderRole = hideLeaderRole && !isGlobalAdmin;

    const handleRoleChange = (role: "Leader" | "Member") => {
        if (!selectedUserId || effectivelyHideLeaderRole) return;
        if (isGlobalAdmin && role === "Member") return; // Admin cannot add standard member
        if (role === "Leader") {
            if (currentLeader) {
                setShowReplaceConfirm(true);
                return;
            }
            const otherWaitlistLeaderId = Object.entries(assignedRoles).find(
                ([id, r]) => r === "Leader" && id !== selectedUserId
            )?.[0];

            if (otherWaitlistLeaderId) {
                const otherUser = userCache[otherWaitlistLeaderId];
                setAssignedRoles(prev => {
                    const next = { ...prev };
                    if (isGlobalAdmin) {
                        delete next[otherWaitlistLeaderId];
                    } else {
                        next[otherWaitlistLeaderId] = "Member";
                    }
                    next[selectedUserId] = "Leader";
                    return next;
                });
                setPreviewRole("Leader");
                const message = isGlobalAdmin
                    ? `${otherUser?.fullName || "User"} was removed from the list. Only one Leader allowed in batch.`
                    : `${otherUser?.fullName || "User"} was moved to Standard Member. Only one Leader allowed in batch.`;
                toastSuccess(message);
                return;
            }
        }
        setPreviewRole(role);
        setAssignedRoles(prev => ({ ...prev, [selectedUserId]: role }));
    };

    const handleSendInvitations = async () => {
        if (!projectId || waitlistUsers.length === 0) return;
        const leaderIds = waitlistUsers.filter(u => u.role === "Leader").map(u => u.id);
        const memberIds = waitlistUsers.filter(u => u.role === "Member").map(u => u.id);
        const expiredAt = new Date();
        expiredAt.setDate(expiredAt.getDate() + 7);
        const expiredAtStr = expiredAt.toISOString();

        try {
            const requests = [];
            if (leaderIds.length > 0) {
                requests.push(sendInvitations({ userIds: leaderIds, role: ProjectRole.Leader, expiredAt: expiredAtStr }));
            }
            if (memberIds.length > 0) {
                requests.push(sendInvitations({ userIds: memberIds, role: ProjectRole.Member, expiredAt: expiredAtStr }));
            }
            await Promise.all(requests);
            toastSuccess(`Successfully staged ${waitlistUsers.length} invitations!`);
            setAssignedRoles({});
            setSelectedUserId(null);
            setInviteSearchTerm("");
            refetchInvitations();
            refetchMembers();
        } catch (error: any) {
            toastError(error?.message || "Failed to send some invitations.");
        }
    };

    const confirmReplaceLeader = async () => {
        if (!selectedUserId || !projectId) return;
        try {
            await replaceLeader({ projectId, newLeaderUserId: selectedUserId });
            setAssignedRoles((prev) => {
                const updated = { ...prev };
                delete updated[selectedUserId];
                return updated;
            });
            setShowReplaceConfirm(false);
            toastSuccess("Project leader has been replaced successfully");
        } catch (error) {
            toastError("Failed to replace project leader");
        }
    };

    const totalSelections = Object.keys(assignedRoles).length;

    const totalMembersPages = membersPaginatedData?.totalPages || 0;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Team Management"
            description={projectName ? `Administering collaborators for ${projectName}` : "Manage project participants and invitations."}
            size="xl"
            closeOnOutsideClick={false}
        >
            <div className="space-y-6">
                {/* Unified Tab Switcher */}
                <div className="flex p-1 bg-slate-100/80 rounded-2xl w-fit border border-slate-200/50">
                    <button
                        onClick={() => setActiveTab("collaboration")}
                        className={cn(
                            "flex items-center gap-2 px-6 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all duration-300",
                            activeTab === "collaboration"
                                ? "bg-white text-indigo-600 shadow-sm shadow-slate-200 border border-slate-100"
                                : "text-slate-400 hover:text-slate-600"
                        )}
                    >
                        <FiUsers size={14} />
                        Collaboration
                    </button>
                    {canManageMembers && (
                        <button
                            onClick={() => setActiveTab("add")}
                            className={cn(
                                "flex items-center gap-2 px-6 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all duration-300",
                                activeTab === "add"
                                    ? "bg-white text-indigo-600 shadow-sm shadow-slate-200 border border-slate-100"
                                    : "text-slate-400 hover:text-slate-600"
                            )}
                        >
                            <FiUserPlus size={14} />
                            Add Member
                        </button>
                    )}
                    {canManageMembers && (
                        <button
                            onClick={() => setActiveTab("invites")}
                            className={cn(
                                "flex items-center gap-2 px-6 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all duration-300",
                                activeTab === "invites"
                                    ? "bg-white text-indigo-600 shadow-sm shadow-slate-200 border border-slate-100"
                                    : "text-slate-400 hover:text-slate-600"
                            )}
                        >
                            <FiSend size={14} />
                            Sent Invitations
                        </button>
                    )}
                </div>

                {/* Tab Content */}
                <div className="min-h-[500px]">
                    {activeTab === "collaboration" && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300 flex flex-col h-full">
                            {/* Collaboration Search */}
                            <div className="relative group max-w-md">
                                <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={16} />
                                <input
                                    type="text"
                                    placeholder="Search active team members..."
                                    value={memberSearchTerm}
                                    onChange={(e) => {
                                        setMemberSearchTerm(e.target.value);
                                        setMemberPageNumber(1);
                                    }}
                                    className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold text-slate-700 outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-200 focus:bg-white transition-all placeholder:text-slate-300 placeholder:font-medium"
                                />
                            </div>

                            {isLoadingMembers ? (
                                <div className="flex flex-col items-center justify-center py-20 space-y-4">
                                    <LoadingSpinner size="lg" />
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest animate-pulse">Synchronizing Registry</p>
                                </div>
                            ) : membersError ? (
                                <div className="p-6 bg-red-50 border border-red-100 rounded-[2rem] text-center space-y-2">
                                    <p className="text-sm font-black text-red-600 uppercase tracking-tight">Sync Failed</p>
                                    <p className="text-xs text-red-400 font-medium">{membersError}</p>
                                </div>
                            ) : (
                                <>
                                    <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar flex-1">
                                        {members.length > 0 ? (
                                            members.map((member) => (
                                                <div
                                                    key={member.userId}
                                                    className="group relative flex items-center gap-4 p-4 bg-white border border-slate-100 rounded-3xl hover:border-indigo-100 hover:shadow-xl hover:shadow-indigo-50/50 transition-all duration-300"
                                                >
                                                    <div className={cn(
                                                        "w-14 h-14 rounded-2xl flex items-center justify-center text-lg font-black shrink-0 transition-transform group-hover:scale-105",
                                                        member.role === ProjectRole.Leader ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100" : "bg-slate-100 text-slate-500 border border-slate-100"
                                                    )}>
                                                        {getInitials(member.fullName)}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 mb-0.5">
                                                            <h4 className="font-black text-slate-800 tracking-tight truncate">{member.fullName}</h4>
                                                            <span className={cn(
                                                                "px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest border",
                                                                member.role === ProjectRole.Leader ? "bg-indigo-50 text-indigo-600 border-indigo-100" : "bg-slate-50 text-slate-500 border-slate-100"
                                                            )}>
                                                                {member.role === ProjectRole.Leader ? "Leader" : "Member"}
                                                            </span>
                                                        </div>
                                                        <div className="flex flex-wrap items-center gap-3 text-xs font-bold text-slate-400">
                                                            <span className="text-indigo-500/80 lowercase italic font-medium">@{member.userName}</span>
                                                            <div className="w-1 h-1 rounded-full bg-slate-200" />
                                                            <div className="flex items-center gap-1.5"><FiMail size={12} className="text-slate-300" />{member.email}</div>
                                                        </div>
                                                    </div>
                                                    <div className="hidden sm:flex flex-col items-end gap-1 text-right shrink-0">
                                                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest leading-none">Joined Pipeline</p>
                                                        <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100/50">
                                                            <FiCalendar size={12} className="text-slate-300" />
                                                            {formatDate(member.joinedAt)}
                                                        </div>
                                                    </div>
                                                    {canManageMembers && (
                                                        <div className="pl-2 border-l border-slate-50 ml-2">
                                                            <Tooltip content="Remove from project">
                                                                <button className="p-2.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all active:scale-95 group/del">
                                                                    <FiTrash2 size={18} className="transition-transform group-hover/del:rotate-6" />
                                                                </button>
                                                            </Tooltip>
                                                        </div>
                                                    )}
                                                </div>
                                            ))
                                        ) : (
                                            <div className="py-20 flex flex-col items-center justify-center text-center opacity-30 grayscale">
                                                <FiUsers size={48} className="text-slate-300 mb-4" />
                                                <p className="text-sm font-black text-slate-900 uppercase">{debouncedMemberSearch ? "No Search Results" : "Registry Empty"}</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Pagination Controls */}
                                    {totalMembersPages > 1 && (
                                        <div className="flex items-center justify-center gap-4 py-4 border-t border-slate-50 mt-auto">
                                            <button
                                                onClick={() => setMemberPageNumber(prev => Math.max(1, prev - 1))}
                                                disabled={memberPageNumber === 1}
                                                className="p-2 bg-white border border-slate-200 rounded-xl text-slate-400 hover:bg-slate-50 hover:text-indigo-600 transition-all disabled:opacity-30 disabled:pointer-events-none shadow-sm active:scale-95"
                                            >
                                                <FiChevronLeft size={18} />
                                            </button>
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Page</span>
                                                <span className="text-xs font-black text-indigo-600 bg-indigo-50 px-3 py-1 rounded-lg border border-indigo-100">{memberPageNumber}</span>
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">of</span>
                                                <span className="text-xs font-black text-slate-600">{totalMembersPages}</span>
                                            </div>
                                            <button
                                                onClick={() => setMemberPageNumber(prev => Math.min(totalMembersPages, prev + 1))}
                                                disabled={memberPageNumber === totalMembersPages}
                                                className="p-2 bg-white border border-slate-200 rounded-xl text-slate-400 hover:bg-slate-50 hover:text-indigo-600 transition-all disabled:opacity-30 disabled:pointer-events-none shadow-sm active:scale-95"
                                            >
                                                <FiChevronRight size={18} />
                                            </button>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    )}

                    {activeTab === "add" && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
                            {!effectivelyHideLeaderRole && (
                                <ProjectLeaderStatus
                                    currentLeader={currentLeader}
                                    onReplaceClick={() => setActiveTab("add")}
                                    getInitials={getInitials}
                                />
                            )}

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                                <SelectionSection
                                    searchTerm={inviteSearchTerm}
                                    onSearchChange={setInviteSearchTerm}
                                    isSearching={isSearching}
                                    displayUsers={users}
                                    selectedUserId={selectedUserId}
                                    onSelectUser={handleSelectUser}
                                    onSelectFromWaitlist={handleSelectFromWaitlist}
                                    assignedRoles={assignedRoles}
                                    waitlistUsers={waitlistUsers}
                                    onRemoveFromWaitlist={handleRemoveFromWaitlist}
                                    getInitials={getInitials}
                                    currentPage={isGlobalAdmin && !debouncedInviteSearch ? addMemberPageNumber : undefined}
                                    totalPages={isGlobalAdmin && !debouncedInviteSearch ? adminListData?.totalPages : undefined}
                                    onPageChange={setAddMemberPageNumber}
                                />

                                <RoleAssignmentPanel
                                    selectedUser={selectedUser}
                                    previewRole={previewRole}
                                    canAssignLeaderRole={canAssignLeaderRole && !effectivelyHideLeaderRole}
                                    isLeaderResolved={isLeaderResolved}
                                    currentLeader={currentLeader}
                                    onRoleChange={handleRoleChange}
                                    onRemoveFromWaitlist={handleRemoveFromWaitlist}
                                    getInitials={getInitials}
                                    hideLeaderRole={effectivelyHideLeaderRole}
                                    disableMemberRole={isGlobalAdmin}
                                />
                            </div>
                        </div>
                    )}

                    {activeTab === "invites" && (
                        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <SentInvitations projectId={projectId || ""} />
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                    <div className="flex items-center gap-3">
                        {totalSelections > 0 && activeTab === "add" && (
                            <div className="flex items-center gap-2 px-4 py-2 bg-indigo-50 rounded-2xl border border-indigo-100/50">
                                <div className="flex -space-x-2 overflow-hidden">
                                    {waitlistUsers.slice(0, 3).map((u) => (
                                        <div key={u.id} className="h-6 w-6 rounded-full bg-slate-900 border-2 border-white flex items-center justify-center text-[8px] font-black text-white">
                                            {getInitials(u.fullName)}
                                        </div>
                                    ))}
                                </div>
                                <p className="text-[10px] font-black text-indigo-600 uppercase tracking-wider">
                                    {totalSelections} Ready for Invite
                                </p>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={onClose}
                            className="px-8 py-3.5 text-[11px] font-black text-slate-400 hover:text-slate-600 transition-all uppercase tracking-widest active:scale-95"
                        >
                            Close
                        </button>
                        {activeTab === "add" && (
                            <button
                                onClick={handleSendInvitations}
                                disabled={totalSelections === 0 || isSendingInvitations}
                                className={cn(
                                    "flex items-center gap-2 px-12 py-4 text-[11px] font-black rounded-2xl transition-all active:scale-95 uppercase tracking-widest shadow-lg min-w-[200px] justify-center",
                                    totalSelections > 0 && !isSendingInvitations
                                        ? "bg-slate-900 text-white hover:bg-indigo-600 hover:shadow-indigo-100"
                                        : "bg-slate-100 text-slate-300 cursor-not-allowed shadow-none"
                                )}
                            >
                                {isSendingInvitations ? (
                                    <>
                                        <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Sending...
                                    </>
                                ) : (
                                    <>
                                        Send Invitations
                                        {totalSelections > 0 && <span className="ml-1 flex items-center justify-center min-w-[20px] h-5 px-1 rounded-full bg-white/20 text-[10px]">{totalSelections}</span>}
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <ReplaceLeaderConfirm
                isOpen={showReplaceConfirm}
                onConfirm={confirmReplaceLeader}
                onCancel={() => setShowReplaceConfirm(false)}
                selectedUserName={selectedUser?.fullName}
            />
        </Modal>
    );
}
