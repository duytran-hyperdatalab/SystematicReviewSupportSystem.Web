import UserSearchSection from "./UserSearchSection";
import InvitationWaitlist from "./InvitationWaitlist";

interface User {
    id: string;
    fullName: string;
    userName: string;
    email: string;
    status: "available" | "added" | "invited";
}

interface WaitlistUser {
    id: string;
    fullName: string;
    userName: string;
    role: "Leader" | "Member";
}

interface SelectionSectionProps {
    searchTerm: string;
    onSearchChange: (value: string) => void;
    isSearching: boolean;
    displayUsers: User[];
    selectedUserId: string | null;
    onSelectUser: (user: User) => void;
    onSelectFromWaitlist: (id: string) => void;
    assignedRoles: Record<string, "Leader" | "Member">;
    waitlistUsers: WaitlistUser[];
    onRemoveFromWaitlist: (userId: string) => void;
    getInitials: (name: string) => string;
    // Pagination for admin list
    currentPage?: number;
    totalPages?: number;
    onPageChange?: (page: number) => void;
}

export default function SelectionSection({
    searchTerm,
    onSearchChange,
    isSearching,
    displayUsers,
    selectedUserId,
    onSelectUser,
    onSelectFromWaitlist,
    assignedRoles,
    waitlistUsers,
    onRemoveFromWaitlist,
    getInitials,
    currentPage,
    totalPages,
    onPageChange
}: SelectionSectionProps) {
    return (
        <div className="space-y-6">
            <UserSearchSection
                searchTerm={searchTerm}
                onSearchChange={onSearchChange}
                isSearching={isSearching}
                displayUsers={displayUsers}
                selectedUserId={selectedUserId}
                onSelectUser={onSelectUser}
                assignedRoles={assignedRoles}
                getInitials={getInitials}
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={onPageChange}
            />

            <InvitationWaitlist
                users={waitlistUsers}
                onRemove={onRemoveFromWaitlist}
                onSelect={onSelectFromWaitlist}
                selectedUserId={selectedUserId}
                getInitials={getInitials}
            />
        </div>
    );
}
