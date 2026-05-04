import { Route, Routes } from "react-router-dom";
import HomePage from "../pages/home/HomePage";
import ProjectListPage from "../pages/projects/ProjectListPage";
import ProjectDetailPage from "../pages/projects/ProjectDetailPage";
import ProjectSettingsPage from "../pages/projects/ProjectSettingsPage";
import ReviewProcessWorkspace from "../pages/reviewProcess/ReviewProcessWorkspace";
import IdentificationPhaseWorkspace from "../pages/reviewProcess/IdentificationPhaseWorkspace";
import PrismaReportWorkspace from "../pages/reviewProcess/prismaReport/PrismaReportWorkspace";
import FullTextScreeningWorkspace from "../pages/reviewProcess/studySelection/fullTextScreening/FullTextScreeningWorkspace";
import QualityAssessmentWorkspace from "../pages/reviewProcess/qualityAssessment/QualityAssessmentWorkspace";
import SynthesisPhaseWorkspace from "../pages/reviewProcess/synthesisExecution/SynthesisPhaseWorkspace";
import MainLayout from "../layouts/MainLayout";
import ProjectLayout from "../layouts/ProjectLayout";
import InvitationDetailPage from "../pages/invitations/InvitationDetailPage";
import DataExtractionPhaseWorkspace from "../pages/reviewProcess/dataExtraction/DataExtractionPhaseWorkspace.tsx";
import ExtractionGridWorkspace from "../pages/reviewProcess/dataExtraction/components/gridWorkspace/ExtractionGridWorkspace";
import MyProfilePage from "../pages/profile/MyProfilePage";
import ChecklistDashboardWrapper from "../pages/checklist/ChecklistDashboardWrapper.tsx";
import ChecklistEditorPage from "../pages/checklist/ChecklistEditorPage.tsx";
import ProjectAuditLogPage from "../pages/projects/ProjectAuditLogPage";

import ProtectedRouteForProject from "../components/routes/ProtectedRouteForProject";
import ManageStudySelectionPage from "../pages/manage-study-selection/ManageStudySelectionPage.tsx";
import ScreeningPhaseRouter from "../pages/reviewProcess/studySelection/ScreeningPhaseRouter";

function MainRoutes() {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        {/* Home Page */}
        <Route index element={<HomePage />} />

        {/* Profile Page */}
        <Route path="profile" element={<MyProfilePage />} />

        {/* Project Routes */}
        <Route>
          <Route path="projects" element={<ProjectLayout />}>
            <Route index element={<ProjectListPage />} />
            <Route path=":id" element={<ProjectDetailPage />} />
            <Route path=":id/settings" element={<ProjectSettingsPage />} />

            {/* Checklist Routes */}
            <Route path=":projectId/checklists" element={<ChecklistDashboardWrapper />} />
            <Route path=":projectId/checklists/:checklistId" element={<ChecklistEditorPage />} />

            {/* Review Process Workspace (from dev branch) */}
            <Route path=":projectId/processes/:processId" element={<ReviewProcessWorkspace />} />

            {/* Identification Phase — Leader and Member */}
            <Route
              element={
                <ProtectedRouteForProject
                  allowedRoles={[1, 2]}
                  redirectTo="/projects"
                  forbiddenTo="/projects"
                />
              }
            >
              <Route
                path=":projectId/processes/:processId/identification/:identificationPhaseId"
                element={<IdentificationPhaseWorkspace />}
              />
            </Route>

            <Route
              path=":projectId/processes/:processId/screening/:screeningProcessId"
              element={<ProtectedRouteForProject allowedRoles={[1, 2]} redirectTo="/projects" />}
            >
              <Route index element={<ScreeningPhaseRouter />} />
              <Route path="dashboard" element={<ManageStudySelectionPage />} />
            </Route>

            <Route
              path=":projectId/processes/:processId/full-text-screening/:screeningProcessId"
              element={<FullTextScreeningWorkspace />}
            />
            {/* Quality Assessment Workspace */}
            <Route
              path=":projectId/processes/:processId/quality-assessment/:qualityAssessmentId"
              element={<QualityAssessmentWorkspace />}
            />
            <Route
              path=":projectId/processes/:processId/extraction"
              element={<DataExtractionPhaseWorkspace />}
            />
            <Route
              path=":projectId/processes/:processId/extraction/workspace/:studyId"
              element={<DataExtractionPhaseWorkspace />}
            />
            <Route
              path=":projectId/processes/:processId/extraction/grid"
              element={<ExtractionGridWorkspace />}
            />
            <Route
              path=":projectId/processes/:processId/synthesis/*"
              element={<SynthesisPhaseWorkspace />}
            />
            <Route
              path=":projectId/processes/:processId/prisma-report"
              element={<PrismaReportWorkspace />}
            />
            <Route path=":id/audit-logs" element={<ProjectAuditLogPage />} />
          </Route>

          {/* Invitation Routes */}
          <Route path="invitations">
            <Route path=":invitationId" element={<InvitationDetailPage />} />
          </Route>
        </Route>

        {/* 404 Page */}
        {/* <Route path="*" element={<Navigate to="/404" replace />} /> */}
      </Route>
    </Routes>
  );
}

export default MainRoutes;
