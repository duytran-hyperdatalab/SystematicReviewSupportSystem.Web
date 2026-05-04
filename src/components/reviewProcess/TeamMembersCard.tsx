// Team Members Card Component

import { FiUsers } from "react-icons/fi";
import type { TeamMember } from "../../types/reviewProcessWorkspace";

interface TeamMembersCardProps {
  teamMembers: TeamMember[];
}

const AVATAR_COLOR_CLASSES = {
  blue: "bg-blue-100 text-blue-700",
  purple: "bg-purple-100 text-purple-700",
  green: "bg-green-100 text-green-700",
  orange: "bg-orange-100 text-orange-700",
  red: "bg-red-100 text-red-700",
  indigo: "bg-indigo-100 text-indigo-700",
} as const;

export default function TeamMembersCard({ teamMembers }: TeamMembersCardProps) {
  const getAvatarClass = (color: string): string => {
    return (
      AVATAR_COLOR_CLASSES[color as keyof typeof AVATAR_COLOR_CLASSES] || AVATAR_COLOR_CLASSES.blue
    );
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-5">
      <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <FiUsers className="w-5 h-5 text-blue-600" />
        Review Team
      </h3>
      <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
        {teamMembers.map((member) => (
          <div key={member.id} className="flex items-center gap-3">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm ${getAvatarClass(member.avatarColor)}`}
            >
              {member.initials}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">{member.name}</p>
              <p className="text-xs text-gray-500">{member.role}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
