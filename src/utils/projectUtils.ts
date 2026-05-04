import type { ProjectMember, ProjectInvitation } from "../types/project";
import { ProjectRole, InvitationStatus } from "../types/project";

export interface ResolvedLeader {
  type: "Accepted" | "Pending";
  user: {
    id: string;
    fullName: string;
    userName: string;
    email: string;
  };
}

/**
 * Resolves the project leader from members and invitations.
 * Enforces rule: 1 PROJECT = ONLY 1 LEADER (accepted OR pending)
 * Priority: 1. Accepted Leader, 2. Pending Leader
 */
export const resolveProjectLeader = (
  members: ProjectMember[],
  invitations: ProjectInvitation[]
): ResolvedLeader | null => {
  // 1. Check for Accepted Leader
  const acceptedLeader = members.find((m) => m.role === ProjectRole.Leader);
  if (acceptedLeader) {
    return {
      type: "Accepted",
      user: {
        id: acceptedLeader.userId,
        fullName: acceptedLeader.fullName,
        userName: acceptedLeader.userName,
        email: acceptedLeader.email,
      },
    };
  }

  // 2. Check for Pending Leader Invitation
  const pendingLeaderInv = invitations.find(
    (inv) => inv.role === ProjectRole.Leader && inv.status === InvitationStatus.Pending
  );
  if (pendingLeaderInv) {
    return {
      type: "Pending",
      user: {
        id: pendingLeaderInv.invitedUserId,
        fullName: pendingLeaderInv.invitedUserFullName,
        userName: pendingLeaderInv.invitedUserFullName, // Using fullName as placeholder since userName isn't in invitation
        email: pendingLeaderInv.invitedUserEmail,
      },
    };
  }

  return null;
};
