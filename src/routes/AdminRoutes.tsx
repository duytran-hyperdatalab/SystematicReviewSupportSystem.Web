import { Navigate, Route, Routes } from "react-router-dom";
import AdminDashboard from "../pages/admin/AdminDashboard";
import AdminOverview from "../pages/admin/AdminOverview";
import AuditLogPage from "../pages/admin/AuditLogPage";
import SLRProjectManagement from "../pages/admin/SLRProjectManagement";
import ProtectedRoute from "./ProtectedRoute";
import UserManagement from "../pages/admin/UserManagement";
import MasterSourcePage from "../pages/admin/MasterSourcePage";
import SystemSettings from "../pages/admin/SystemSettings";
import TemplateManager from "../pages/admin/TemplateManager";

function AdminRoutes() {
  return (
    <Routes>
      <Route element={<ProtectedRoute allowedRoles={["Admin"]} />}>
        <Route element={<AdminDashboard />}>
          <Route index element={<AdminOverview />} />
          <Route path="audit-logs" element={<AuditLogPage />} />
          <Route path="projects" element={<SLRProjectManagement />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="master-sources" element={<MasterSourcePage />} />
          <Route path="settings" element={<SystemSettings />} />
                    <Route path="templates" element={<TemplateManager />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  );
}

export default AdminRoutes;
