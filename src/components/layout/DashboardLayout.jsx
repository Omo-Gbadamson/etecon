import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, User, Briefcase, FileText, BookmarkIcon,
  GraduationCap, LogOut, Bell, Menu,
  Building2, Users, PlusCircle, ClipboardList, MessageSquare
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useNotifications } from "../../context/NotificationsContext";
import { logoutUser } from "../../firebase/auth";
import { Avatar } from "../shared";
import { cn } from "../../utils/cn";

const teacherNav = [
  { to: "/dashboard/teacher", label: "Overview", icon: LayoutDashboard, end: true },
  { to: "/dashboard/teacher/profile", label: "My Profile", icon: User },
  { to: "/dashboard/teacher/jobs", label: "Browse Jobs", icon: Briefcase },
  { to: "/dashboard/teacher/applications", label: "Applications", icon: FileText },
  { to: "/dashboard/teacher/saved-jobs", label: "Saved Jobs", icon: BookmarkIcon },
  { to: "/messages", label: "Messages", icon: MessageSquare },
];

const schoolNav = [
  { to: "/dashboard/school", label: "Overview", icon: LayoutDashboard, end: true },
  { to: "/dashboard/school/profile", label: "School Profile", icon: Building2 },
  { to: "/dashboard/school/jobs", label: "Manage Jobs", icon: Briefcase },
  { to: "/dashboard/school/jobs/new", label: "Post a Job", icon: PlusCircle },
  { to: "/dashboard/school/applications", label: "All Applications", icon: ClipboardList },
  { to: "/dashboard/school/teachers", label: "Browse Teachers", icon: Users },
  { to: "/messages", label: "Messages", icon: MessageSquare },
];

function SidebarContent({ mobile, navItems, role, user, userDoc, handleLogout, setSidebarOpen }) {
  return (
    <aside className={cn(
      "flex flex-col bg-white border-r border-slate-100 h-full",
      mobile ? "w-full" : "w-64"
    )}>
      {/* Logo */}
      <div className="px-6 py-5 border-b border-slate-100">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-700 flex items-center justify-center">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-slate-900 text-lg">TeachConnect</span>
        </Link>
      </div>

      {/* User */}
      <div className="px-4 py-4 border-b border-slate-50">
        <div className="flex items-center gap-3 p-2 rounded-lg bg-slate-50">
          <Avatar src={user?.photoURL} name={userDoc?.displayName} size="sm" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-900 truncate">{userDoc?.displayName}</p>
            <p className="text-xs text-slate-500 capitalize">{role}</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map(({ to, label, icon: Icon, end }) => (
          <NavLink key={to} to={to} end={end}
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) => cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
              isActive
                ? "bg-indigo-50 text-indigo-700"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            )}>
            <Icon className="w-5 h-5 flex-shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-slate-100">
        <button onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm font-medium text-slate-600 hover:bg-rose-50 hover:text-rose-600 transition">
          <LogOut className="w-5 h-5" />
          Sign out
        </button>
      </div>
    </aside>
  );
}

export function DashboardLayout({ children }) {
  const { user, userDoc } = useAuth();
  const { unreadCount } = useNotifications();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const role = userDoc?.role;
  const navItems = role === "school" ? schoolNav : teacherNav;

  const handleLogout = async () => {
    await logoutUser();
    navigate("/");
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Desktop sidebar */}
      <div className="hidden md:flex flex-shrink-0">
        <SidebarContent navItems={navItems} role={role} user={user} userDoc={userDoc} handleLogout={handleLogout} setSidebarOpen={setSidebarOpen} />
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-72 z-10">
            <SidebarContent mobile navItems={navItems} role={role} user={user} userDoc={userDoc} handleLogout={handleLogout} setSidebarOpen={setSidebarOpen} />
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="bg-white border-b border-slate-100 px-4 py-3 flex items-center justify-between md:px-6 flex-shrink-0">
          <button onClick={() => setSidebarOpen(true)} className="md:hidden p-2 rounded-lg hover:bg-slate-100 text-slate-600">
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex-1" />
          <div className="flex items-center gap-2">
            <Link to="/notifications" className="relative p-2 rounded-lg hover:bg-slate-100 text-slate-600 transition">
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </Link>
          </div>
        </header>

        {/* Page */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 py-6 md:px-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
