import {
  Bell,
  Sun,
  Moon,
  User,
  LogOut,
  Settings,
  Search,
  CheckCircle,
} from "lucide-react";

import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { getRealTimeNotifications } from "../data/notifications";
import { supabase } from "../lib/supabase";
import { logout as authLogout } from "../utils/auth";

export default function TopBar({ role = "student" }) {
  const navigate = useNavigate();
  const location = useLocation();

  const [showProfile, setShowProfile] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [dark, setDark] = useState(
    document.documentElement.classList.contains("dark")
  );

  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(false);

  // 🔥 SEGA LIVE ALERT STATE
  const [segaAlert, setSegaAlert] = useState(false);

  /* =========================
      UPDATED BREADCRUMBS
  ========================= */

  const breadcrumbsMap = {
    "/student": "Dashboard",
    "/student/career": "Career Prediction",
    "/student/career-path": "Career Path & Tracking",
    "/student/courses": "Courses",
    "/student/PeerGroups": "Peer Groups",
    "/student/spam": "Spam Detection",
    "/student/sega": "SEGA",

    "/teacher": "Dashboard",
    "/teacher/reports": "Student Reports",
    "/teacher/sega": "SEGA",

    "/admin": "Dashboard",
    "/admin/students": "Student Progress",
    "/admin/trends": "University Trends",
    "/admin/dropout": "Dropout Prediction",
    "/admin/sega": "SEGA",

    "/settings": "Settings",
  };

  const pageTitle = breadcrumbsMap[location.pathname] || "Dashboard";

  /* =========================
      REAL-TIME NOTIFICATIONS
  ========================= */

  useEffect(() => {
    const fetchNotes = () => {
      const notes = getRealTimeNotifications(role);
      setNotifications(notes);

      if (notes.length > 0 && !showNotifications) {
        setUnread(true);
      }
    };

    fetchNotes();
    const interval = setInterval(fetchNotes, 10000);

    return () => clearInterval(interval);
  }, [role, showNotifications]);

  /* =========================
      🔥 SEGA LIVE MONITOR
  ========================= */

  useEffect(() => {
    const checkEmergency = async () => {
      try {
        const res = await fetch("http://127.0.0.1:8003/emergency/all");
        const data = await res.json();

        if (Array.isArray(data)) {
          const active = data.find(i => i.status === "Active");
          setSegaAlert(!!active);
        }
      } catch {
        setSegaAlert(false);
      }
    };

    checkEmergency();
    const interval = setInterval(checkEmergency, 8000);

    return () => clearInterval(interval);
  }, []);

  /* =========================
      THEME LOGIC
  ========================= */

  const toggleTheme = () => {
    const isDark = document.documentElement.classList.toggle("dark");
    setDark(isDark);
    localStorage.setItem("theme", isDark ? "dark" : "light");
  };

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (saved === "dark") {
      document.documentElement.classList.add("dark");
      setDark(true);
    }
  }, []);

  /* =========================
      CLOSE DROPDOWNS
  ========================= */

  useEffect(() => {
    const close = () => {
      setShowProfile(false);
      setShowNotifications(false);
    };
    window.addEventListener("click", close);
    return () => window.removeEventListener("click", close);
  }, []);

  /* =========================
      ACTIONS
  ========================= */

  const handleLogout = async () => {
    await supabase.auth.signOut();
    authLogout();
    navigate("/login", { replace: true });
  };

  return (
    <header className="
      flex items-center justify-between
      px-8 py-4
      bg-white dark:bg-slate-900
      border-b border-slate-200 dark:border-slate-800
      font-sans
    ">

      {/* LEFT – BREADCRUMB */}
      <div className="flex flex-col">
        <h2 className="text-xl font-black text-slate-800 dark:text-white tracking-tight leading-tight">
          {pageTitle}
        </h2>
        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
          <span>{role}</span>
          <span>/</span>
          <span className="text-indigo-500">{pageTitle}</span>
        </div>
      </div>

      {/* SEARCH */}
      <div className="
        hidden lg:flex items-center gap-3
        bg-slate-100 dark:bg-slate-800/50
        px-4 py-2.5 rounded-2xl w-full max-w-md
        border border-transparent focus-within:border-indigo-500/50 transition-all
      ">
        <Search className="w-4 h-4 text-slate-400" />
        <input
          placeholder="Search academic records, security logs..."
          className="
            bg-transparent outline-none w-full text-sm font-medium
            text-slate-700 dark:text-slate-200
            placeholder:text-slate-400
          "
        />
      </div>

      {/* ACTIONS */}
      <div className="flex items-center gap-3">

        {/* THEME TOGGLE */}
        <button
          onClick={toggleTheme}
          className="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          {dark ? (
            <Sun className="w-5 h-5 text-amber-400" />
          ) : (
            <Moon className="w-5 h-5 text-slate-500" />
          )}
        </button>

        {/* 🔔 NOTIFICATIONS */}
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowNotifications(!showNotifications);
              setUnread(false);
            }}
            className="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative"
          >
            <Bell
              className={`w-5 h-5 ${
                segaAlert
                  ? "text-red-600 animate-pulse"
                  : "text-slate-500 dark:text-slate-400"
              }`}
            />

            {(unread || segaAlert) && (
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-indigo-600 rounded-full ring-2 ring-white dark:ring-slate-900" />
            )}
          </button>

          <AnimatePresence>
            {showNotifications && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="
                  absolute right-0 mt-4 w-80
                  bg-white dark:bg-slate-900
                  shadow-2xl rounded-[1.5rem] p-5 z-50
                  border border-slate-100 dark:border-slate-800
                "
              >
                <h4 className="font-bold mb-3 text-slate-800 dark:text-white">
                  Live Updates
                </h4>

                {notifications.length > 0 ? (
                  notifications.map((note) => (
                    <div key={note.id} className="flex gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <CheckCircle className="w-4 h-4 text-emerald-500 mt-1" />
                      <div>
                        <p className="text-xs font-bold text-slate-700 dark:text-slate-200">
                          {note.text}
                        </p>
                        <p className="text-[9px] font-bold text-slate-400 uppercase mt-1">
                          Just Now
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-slate-400 py-6">
                    No new notifications
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* PROFILE */}
        <div className="relative ml-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowProfile(!showProfile);
            }}
            className="flex items-center gap-3 p-1 pr-3 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
          >
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold">
              {role.charAt(0).toUpperCase()}
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-xs font-black text-slate-800 dark:text-white uppercase">
                {role}
              </p>
              <p className="text-[10px] font-bold text-slate-400">
                Verified User
              </p>
            </div>
          </button>

          <AnimatePresence>
            {showProfile && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="
                  absolute right-0 mt-4 w-56
                  bg-white dark:bg-slate-900
                  shadow-2xl rounded-[1.5rem] p-2 z-50
                  border border-slate-100 dark:border-slate-800
                "
              >
                <button
                  onClick={() => navigate("/settings")}
                  className="flex items-center gap-3 w-full p-3 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  <Settings className="w-4 h-4" /> System Settings
                </button>

                <div className="h-px bg-slate-100 dark:bg-slate-800 my-1 mx-2" />

                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 w-full p-3 rounded-xl text-sm font-bold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                >
                  <LogOut className="w-4 h-4" /> Terminate Session
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </header>
  );
}
