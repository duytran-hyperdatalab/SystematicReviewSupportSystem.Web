// Context Panel Component - Right sidebar with team, progress, and alerts

import TeamMembersCard from "./TeamMembersCard";
import ProgressOverviewCard from "./ProgressOverviewCard";
import AlertsCard from "./AlertsCard";
import type { TeamMember, ProgressStats, Alert } from "../../types/reviewProcessWorkspace";

interface ContextPanelProps {
  teamMembers: TeamMember[];
  progressStats: ProgressStats;
  alerts: Alert[];
}

export default function ContextPanel({
  teamMembers,
  progressStats,
  alerts,
}: ContextPanelProps) {
  return (
    <div className="space-y-6">
      <TeamMembersCard teamMembers={teamMembers} />
      <ProgressOverviewCard progressStats={progressStats} />
      <AlertsCard alerts={alerts} />
    </div>
  );
}
