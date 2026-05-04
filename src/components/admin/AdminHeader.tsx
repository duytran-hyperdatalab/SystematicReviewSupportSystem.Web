import React, { useState, useRef, useEffect, useMemo } from "react";
import { FiSearch, FiMenu, FiUser, FiLogOut, FiChevronDown } from "react-icons/fi";
import { useSelector, useDispatch } from "react-redux";
import { Link, useLocation, useNavigate } from "react-router-dom";
import type { RootState } from "../../redux/store";
import { logout } from "../../redux/slices/authSlice";
import AdminNotification from "./AdminNotification";

interface AdminHeaderProps {
  onMenuClick?: () => void;
}

const AdminHeader: React.FC<AdminHeaderProps> = ({ onMenuClick }) => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const userDropdownRef = useRef<HTMLDivElement>(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const pageTitle = useMemo(() => {
    const titles: Record<string, string> = {
      "/admin": "Dashboard",
      "/admin/audit-logs": "Audit Logs",
      "/admin/projects": "SLR Projects",
      "/admin/users": "Users Management",
      "/admin/master-sources": "Search Sources",
      "/admin/analytics": "Analytics",
      "/admin/settings": "System Settings",
    };

    return titles[location.pathname] || "Dashboard";
  }, [location.pathname]);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/auth/signin");
  };

  const getUserInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
        setShowUserDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-6 shrink-0 z-20">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="p-2 -ml-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all lg:hidden"
          aria-label="Toggle Menu"
        >
          <FiMenu className="w-6 h-6" />
        </button>
        <h2 className="text-lg sm:text-xl font-bold text-gray-800">{pageTitle}</h2>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden md:flex relative group">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
          <input
            type="text"
            placeholder="Search anything..."
            className="pl-10 pr-4 py-2 bg-slate-50 border-transparent focus:border-indigo-100 focus:bg-white focus:ring-4 focus:ring-indigo-50/50 rounded-xl text-sm transition-all outline-none border w-64"
          />
        </div>

        <AdminNotification />

        <div className="h-8 w-px bg-gray-200 mx-1"></div>

        {/* User Profile Dropdown */}
        <div className="relative" ref={userDropdownRef}>
          <button
            onClick={() => setShowUserDropdown(!showUserDropdown)}
            className={`flex items-center gap-3 p-1 rounded-xl transition-all ${
              showUserDropdown ? "bg-indigo-50" : "hover:bg-slate-50"
            }`}
          >
            <div className="hidden sm:block text-right ml-2">
              <p className="text-sm font-bold text-gray-800 leading-tight">
                {user?.name || "Admin Account"}
              </p>
              <p className="text-[10px] uppercase font-bold text-indigo-600 tracking-wider">
                {user?.role || "Super Admin"}
              </p>
            </div>
            <div className="h-9 w-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-lg shadow-indigo-100 ring-2 ring-white">
              {user?.name ? getUserInitials(user.name) : "AD"}
            </div>
            <FiChevronDown
              className={`text-gray-400 transition-transform duration-200 ${showUserDropdown ? "rotate-180" : ""}`}
            />
          </button>

          {showUserDropdown && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              <Link
                to="/profile"
                onClick={() => setShowUserDropdown(false)}
                className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 transition-all"
              >
                <FiUser className="w-4 h-4 opacity-50" />
                My Profile
              </Link>

              <div className="h-px bg-gray-50 my-1 mx-2"></div>

              <button
                onClick={() => {
                  setShowUserDropdown(false);
                  handleLogout();
                }}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-red-600 hover:bg-red-50 transition-all"
              >
                <FiLogOut className="w-4 h-4 opacity-50" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
