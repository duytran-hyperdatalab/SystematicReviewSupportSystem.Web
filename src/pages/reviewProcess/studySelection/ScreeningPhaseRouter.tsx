import React from "react";
import { useParams, Navigate } from "react-router-dom";
import { useProjectMember } from "../../../hooks/useProjectMember";
import LoadingSpinner from "../../../components/ui/LoadingSpinner";
import TitleAbstractScreeningWorkspace from "./titleAbstractScreening/TitleAbstractScreeningWorkspace";
import ManageStudySelectionPage from "../../manage-study-selection/ManageStudySelectionPage";

/**
 * Routes based on roles for the Screening Phase.
 * 
 * - Leader (role = 1) -> Leads to the StudySelectionDashboard (Sidebar + Content)
 * - Member (role = 2) -> Leads to the TitleAbstractScreeningWorkspace (Full App Container)
 * 
 * This avoids duplicate paths and handles redirect loops in a centralized way.
 */
const ScreeningPhaseRouter: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();

  // Use the same centralized hook as ProtectedRouteForProject
  const { member, isLoading, error } = useProjectMember(projectId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  // Handle errors or missing membership by sending back to projects
  if (error || !member) {
    return <Navigate to="/projects" replace />;
  }

  // Role: Leader (1) 
  // Renders the Dashboard layout which contains an <Outlet /> for nested routes (Overview, Assignments, etc.)
  if (member.role === 1) {
    return <ManageStudySelectionPage />;
  }

  // Role: Member (2)
  // Renders the full screening workspace directly. 
  // Nested routes (like 'dashboard') won't apply here because this component doesn't have an <Outlet />.
  return <TitleAbstractScreeningWorkspace />;
};

export default ScreeningPhaseRouter;
