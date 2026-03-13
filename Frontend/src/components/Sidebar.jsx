import {
  Home,
  Brain,
  BookOpen,
  Users,
  BarChart3,
  MailWarning,
  Settings,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  PlayCircle,
  Building2,
  UserPlus,
} from "lucide-react";

import { NavLink } from "react-router-dom";
import { useState, useEffect } from "react";

export default function Sidebar({ role = "student" }) {
  const [collapsed, setCollapsed] = useState(
    localStorage.getItem("sidebar") === "collapsed"
  );

  useEffect(() => {
    localStorage.setItem("sidebar", collapsed ? "collapsed" : "expanded");
  }, [collapsed]);

  // ================= MENUS =================

  const menus = {
    student: [
      { name: "Dashboard", icon: Home, path: "/student" },
      { name: "SEGA", icon: ShieldAlert, path: "/student/sega" },
      { name: "Career Prediction", icon: Brain, path: "/student/career" },
      { name: "Career Path & Tracking", icon: PlayCircle, path: "/student/career-path" },
      { name: "Courses", icon: BookOpen, path: "/student/courses" },
      { name: "Peer Groups", icon: Users, path: "/student/PeerGroups" },
      { name: "Spam Detection", icon: MailWarning, path: "/student/spam" },
      { name: "Settings", icon: Settings, path: "/settings" },
    ],

    teacher: [
      { name: "Dashboard", icon: Home, path: "/teacher" },
      { name: "SEGA", icon: ShieldAlert, path: "/teacher/sega" },
      { name: "Student Reports", icon: Users, path: "/teacher/reports" },
      { name: "Settings", icon: Settings, path: "/settings" },
    ],

    admin: [
      { name: "Dashboard", icon: Home, path: "/admin" },
      { name: "Student Progress", icon: Users, path: "/admin/students" },
      { name: "SEGA", icon: ShieldAlert, path: "/admin/sega" },
      { name: "Mentor-Mentee", icon: UserPlus, path: "/admin/mentees" },
      { name: "University Resources", icon: Building2, path: "/admin/resources" },
      { name: "University Trends", icon: BarChart3, path: "/admin/trends" },
      { name: "Dropout Prediction", icon: Brain, path: "/admin/dropout" },
      { name: "Settings", icon: Settings, path: "/settings" },
    ],
  };

  const roleMenus = menus[role] || menus.student;

  return (
    <aside
      className={`
        h-screen flex flex-col
        bg-gradient-to-b from-slate-900 to-slate-800
        text-white
        transition-all duration-300 ease-in-out
        ${collapsed ? "w-20" : "w-64"}
      `}
    >
      <div className="flex items-center justify-between px-4 py-6">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold tracking-tight">SUIS</span>
          </div>
        )}

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 rounded-lg hover:bg-white/10 transition text-slate-400 hover:text-white"
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      <nav className="flex-1 space-y-1 px-2">
        {roleMenus.map(({ name, icon: Icon, path }) => (
          <NavLink
            key={name}
            to={path}
            className={({ isActive }) =>
              `
              group relative flex items-center gap-3
              px-3 py-3 rounded-xl
              text-sm font-medium
              transition-all duration-200
              ${
                isActive
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-900/20"
                  : "text-slate-400 hover:bg-white/5 hover:text-white"
              }
              `
            }
          >
            <Icon className="w-5 h-5 shrink-0" />
            {!collapsed && <span>{name}</span>}
          </NavLink>
        ))}
      </nav>

      {!collapsed && (
        <div className="border-t border-white/5 py-4 text-center text-[10px] uppercase tracking-widest text-slate-500">
          © {new Date().getFullYear()} SUIS System
        </div>
      )}
    </aside>
  );
}
