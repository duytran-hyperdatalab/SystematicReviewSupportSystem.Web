import React, { useState } from "react";
import Sidebar, { type SidebarItem } from "../../components/ui/Sidebar";
import AdminHeader from "../../components/admin/AdminHeader";
import Drawer from "../../components/ui/Drawer";
import SystemSignature from "../../components/logo/SystemSignature";
import {
  FiGrid,
  FiUsers,
  FiSettings,
  FiPieChart,
  FiLogOut,
  FiHome,
  FiDatabase,
  FiFileText,
} from "react-icons/fi";
import { SiTask } from "react-icons/si";
import { MdChecklist } from "react-icons/md";
import { useDispatch } from "react-redux";
import { useNavigate, Outlet } from "react-router-dom";
import { logout } from "../../redux/slices/authSlice";
import SectionGuard from "../../components/auth/SectionGuard";

const AdminDashboard: React.FC = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate("/auth/signin");
  };

  const handleSwitchHome = () => {
    navigate("/");
  };

  const menuItems: SidebarItem[] = [
    { icon: FiGrid, label: "Overview", path: "/admin" },
    { icon: FiFileText, label: "Audit Logs", path: "/admin/audit-logs" },
    { icon: SiTask, label: "SLR Projects", path: "/admin/projects" },
    { icon: FiDatabase, label: "Search Sources", path: "/admin/master-sources" },
    { icon: MdChecklist, label: "Checklist Templates", path: "/admin/templates" },
    { icon: FiPieChart, label: "Analytics", path: "/admin/analytics" },
    { icon: FiUsers, label: "Users Management", path: "/admin/users" },
    { icon: FiSettings, label: "System Settings", path: "/admin/settings" },
  ];

  const footerItems: SidebarItem[] = [
    {
      icon: FiHome,
      label: "Switch to Client Home",
      path: "/",
      onClick: handleSwitchHome,
    },
    {
      icon: FiLogOut,
      label: "Sign out",
      path: "",
      onClick: handleLogout,
    },
  ];

  return (
    <SectionGuard section="admin">
      <div className="flex h-screen bg-slate-50 overflow-hidden relative">
        {/* Background decorative elements */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none" />

        {/* Mobile Sidebar (Drawer) */}
        <Drawer
          isOpen={isMobileMenuOpen}
          onClose={() => setIsMobileMenuOpen(false)}
          side="left"
          maxWidth="max-w-[280px]"
          title={
            <SystemSignature
              primaryClassName="text-indigo-900"
              accentClassName="text-indigo-500"
              className="mb-0 text-xl"
            />
          }
        >
          <div className="flex flex-col h-full -mx-6 -my-8">
            <nav className="flex-1 py-4 px-4 space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.label}
                    onClick={() => {
                      if (item.onClick) item.onClick();
                      else navigate(item.path);
                      setIsMobileMenuOpen(false);
                    }}
                    className="flex items-center gap-4 w-full p-4 text-base font-bold text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 rounded-2xl transition-all"
                  >
                    <Icon className="w-5 h-5 opacity-50" />
                    {item.label}
                  </button>
                );
              })}
            </nav>
            <div className="p-4 border-t border-gray-100 space-y-2">
              {footerItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.label}
                    onClick={() => {
                      if (item.onClick) item.onClick();
                      else navigate(item.path);
                      setIsMobileMenuOpen(false);
                    }}
                    className="flex items-center gap-4 w-full p-4 text-sm font-bold text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-2xl transition-all"
                  >
                    <Icon className="w-5 h-5 opacity-50" />
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>
        </Drawer>

        {/* Desktop Sidebar */}
        <Sidebar
          className="hidden lg:flex"
          items={menuItems}
          footerItems={footerItems}
          isCollapsed={isSidebarCollapsed}
          onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Top Navbar */}
          <AdminHeader onMenuClick={() => setIsMobileMenuOpen(true)} />

          {/* Dynamic Content */}
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-10 no-scrollbar">
            <Outlet />
          </main>
        </div>
      </div>
    </SectionGuard>
  );
};

export default AdminDashboard;
