import { useState, useRef, useEffect } from "react";
import { FiBell, FiMenu, FiX, FiLayers, FiUser, FiLogOut, FiShield } from "react-icons/fi";
import SystemSignature from "../logo/SystemSignature";
import NotificationDropdown from "./NotificationDropdown";
import { Link, useLocation, useNavigate } from "react-router";
import Drawer from "../ui/Drawer";
import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "../../redux/store";
import { logout } from "../../redux/slices/authSlice";
import { clearCurrentProject } from "../../redux/slices/projectSlice";
import Button from "../ui/Button";
import { toastWarning } from "../../utils/toast";
import { useUnreadCount } from "../../hooks/useNotifications";

const Header: React.FC = () => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);
  const userDropdownRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const { unreadCount } = useUnreadCount();

  const handleLogout = () => {
    dispatch(logout());
    dispatch(clearCurrentProject());
    navigate("/auth/signin");
  };

  const handleSwitchAdmin = () => {
    navigate("/admin");
  };

  const getUserInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (notificationRef.current && !notificationRef.current.contains(target)) {
        setShowNotifications(false);
      }
      if (userDropdownRef.current && !userDropdownRef.current.contains(target)) {
        setShowUserDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close mobile menu and dropdowns on route change
  useEffect(() => {
    setIsMenuOpen(false);
    setShowNotifications(false);
    setShowUserDropdown(false);
  }, [location.pathname]);

  const navLinks = [{ name: "Projects", path: "/projects", icon: FiLayers }];

  const handleHeaderInteraction = (e: React.MouseEvent | React.KeyboardEvent) => {
    if (user?.role !== "Admin") return;

    const target = e.target as HTMLElement;
    const button = target.closest("button");
    const isLink = target.closest("a");

    // Allow Admin Console button
    const isAdminConsole = button?.textContent?.includes("Admin Console");
    // Allow Mobile Menu toggle
    const isMenuToggle = button?.getAttribute("aria-label") === "Toggle Menu";
    // Allow standard navigation links
    if (isLink || isAdminConsole || isMenuToggle) return;

    // Block other interactive elements (Notifications, Profile dropdown, etc.)
    const isForbiddenAction = button || target.closest("input, select, textarea");
    if (isForbiddenAction) {
      e.preventDefault();
      e.stopPropagation();
      toastWarning("Read-only Mode", "Only client can perform actions on these components.");
    }
  };

  return (
    <>
      <header
        className="bg-white border-b border-gray-200 sticky top-0 z-1000 transition-all duration-300"
        onClickCapture={handleHeaderInteraction}
        onKeyDownCapture={handleHeaderInteraction}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 sm:h-20">
            {/* Left Side: Logo & Desktop Nav */}
            <div className="flex items-center gap-4 lg:gap-8">
              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden p-2 -ml-2 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                aria-label="Toggle Menu"
              >
                {isMenuOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
              </button>

              <Link to="/" className="flex items-center gap-2 group shrink-0">
                <SystemSignature
                  primaryClassName="text-indigo-900"
                  accentClassName="text-indigo-500"
                  className="mb-0 text-2xl lg:text-3xl"
                />
              </Link>

              {/* Desktop Navigation */}
              <nav className="hidden md:flex items-center gap-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    to={link.path}
                    className="px-4 py-2 text-sm font-semibold text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all whitespace-nowrap"
                  >
                    {link.name}
                  </Link>
                ))}
              </nav>
            </div>

            {/* Right Side: Actions & User Profile */}
            <div className="flex items-center gap-2 sm:gap-4">
              {isAuthenticated ? (
                <>
                  {/* Notification Area */}
                  <div className="relative" ref={notificationRef}>
                    <button
                      onClick={() => setShowNotifications(!showNotifications)}
                      className={`relative p-2.5 rounded-full transition-all duration-300 ${
                        showNotifications
                          ? "bg-indigo-50 text-indigo-600 ring-4 ring-indigo-50/50"
                          : "text-gray-500 hover:text-indigo-600 hover:bg-indigo-50"
                      }`}
                    >
                      <span className="sr-only">Notifications</span>
                      <FiBell className="w-6 h-6" />
                      {/* Badge */}
                      {unreadCount > 0 && (
                        <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full flex items-center justify-center animate-pulse">
                          {unreadCount > 9 ? (
                            <span className="text-[6px] text-white">9+</span>
                          ) : null}
                        </span>
                      )}
                    </button>

                    {/* Dropdown */}
                    {showNotifications && <NotificationDropdown />}
                  </div>

                  {/* Admin Dashboard Access */}
                  {user?.role === "Admin" && (
                    <button
                      onClick={handleSwitchAdmin}
                      className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-slate-900 hover:bg-indigo-600 text-white rounded-xl transition-all duration-300 shadow-md hover:shadow-indigo-100 group"
                    >
                      <FiShield className="w-4 h-4 group-hover:scale-110 group-hover:rotate-12 transition-transform" />
                      <span className="hidden sm:inline text-[11px] font-black uppercase tracking-wider">
                        Admin Console
                      </span>
                    </button>
                  )}

                  {/* Desktop Separator */}
                  <div className="hidden sm:block h-8 w-px bg-gray-200 mx-1"></div>

                  {/* User Profile Dropdown */}
                  <div className="relative" ref={userDropdownRef}>
                    <button
                      onClick={() => setShowUserDropdown(!showUserDropdown)}
                      className={`flex items-center gap-3 pl-2 sm:pl-3 pr-1 py-1 rounded-full transition-all border group ${
                        showUserDropdown
                          ? "bg-indigo-50 border-indigo-100 ring-4 ring-indigo-50/50"
                          : "hover:bg-slate-50 border-transparent hover:border-slate-100"
                      }`}
                    >
                      <div className="hidden lg:block text-right">
                        <p className="text-sm font-bold text-gray-800 group-hover:text-indigo-600 transition-colors">
                          {user?.name || "User"}
                        </p>
                        <p className="text-[10px] uppercase font-bold tracking-wider text-gray-400">
                          {user?.role || "User"}
                        </p>
                      </div>
                      <div className="h-9 w-9 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-full flex items-center justify-center font-bold text-sm shadow-md ring-2 ring-white group-hover:ring-indigo-100 transition-all">
                        {user?.name ? getUserInitials(user.name) : "U"}
                      </div>
                    </button>

                    {/* Profile Dropdown Menu */}
                    {showUserDropdown && (
                      <div className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                        <div className="px-4 py-3 border-b border-gray-50 mb-1 lg:hidden">
                          <p className="text-sm font-bold text-gray-900 truncate">{user?.name}</p>
                          <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider truncate">
                            {user?.role}
                          </p>
                        </div>

                        <Link
                          to="/profile"
                          onClick={() => setShowUserDropdown(false)}
                          className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 transition-all"
                        >
                          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600">
                            <FiUser className="w-4 h-4" />
                          </div>
                          Profile
                        </Link>

                        <div className="h-px bg-gray-50 my-1 mx-2"></div>

                        <button
                          onClick={() => {
                            setShowUserDropdown(false);
                            handleLogout();
                          }}
                          className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-red-600 hover:bg-red-50 transition-all"
                        >
                          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-red-50 text-red-600">
                            <FiLogOut className="w-4 h-4" />
                          </div>
                          Sign Out
                        </button>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <Link to="/auth/signin">
                  <Button
                    variant="primary"
                    size="sm"
                    className="px-5 py-2.5 h-auto rounded-xl shadow-none"
                  >
                    Sign In
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      <Drawer
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        side="left"
        maxWidth="max-w-[85%] md:hidden"
        title={
          <Link to="/" onClick={() => setIsMenuOpen(false)}>
            <SystemSignature
              primaryClassName="text-indigo-900"
              accentClassName="text-indigo-500"
              className="mb-0 text-2xl"
            />
          </Link>
        }
        footer={
          <p className="text-[10px] font-bold text-gray-400 text-center uppercase tracking-widest leading-loose">
            PRISMA SLR System
            <br />
            v1.0.2 • 2026
          </p>
        }
      >
        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-6">
          Navigation
        </p>
        <nav className="space-y-2">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className="flex items-center gap-4 p-4 text-base font-bold text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 rounded-2xl transition-all"
            >
              <link.icon className="w-5 h-5 opacity-50" />
              {link.name}
            </Link>
          ))}
        </nav>

        <div className="mt-12">
          {user?.role === "Admin" && (
            <div className="mb-6">
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-4">
                Management
              </p>
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  handleSwitchAdmin();
                }}
                className="w-full flex items-center gap-4 p-4 bg-slate-900 text-white rounded-2xl shadow-lg transition-all active:scale-[0.98]"
              >
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                  <FiShield className="w-4 h-4" />
                </div>
                <span className="font-bold">Admin Dashboard</span>
              </button>
            </div>
          )}
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-6">
            Account
          </p>
          {isAuthenticated ? (
            <>
              <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl">
                <div className="h-12 w-12 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-2xl flex items-center justify-center font-bold text-lg shadow-sm">
                  {user?.name ? getUserInitials(user.name) : "U"}
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">{user?.name || "User"}</p>
                  <p className="text-xs font-medium text-gray-500">{user?.role || "User"}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="w-full mt-4 flex items-center gap-4 p-4 text-sm font-bold text-red-600 hover:bg-red-50 rounded-2xl transition-all"
              >
                <FiUser className="w-5 h-5" />
                Sign Out
              </button>
            </>
          ) : (
            <Link to="/auth/signin" onClick={() => setIsMenuOpen(false)}>
              <Button className="w-full">Sign In</Button>
            </Link>
          )}
        </div>
      </Drawer>
    </>
  );
};

export default Header;
