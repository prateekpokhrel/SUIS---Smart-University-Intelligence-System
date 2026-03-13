import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../layouts/DashboardLayout";
import StatCard from "../../components/StatCard";
import { supabase } from "../../lib/supabase";
import { exportCSV } from "../../utils/exportCSV";
import {
  Users, UserCheck, AlertTriangle, TrendingUp, ShieldCheck,
  Activity, Download, Bell, Settings, BookOpen, GraduationCap,
  Brain, Target, ChevronRight, ArrowUpRight, ArrowDownRight,
  Building2, UserCog, Shield, AlertCircle, Clock, Cpu, Wifi,
  Database, RefreshCw, Award, Calendar, Megaphone, FileText,
  HardDrive,
} from "lucide-react";

// ─── Helpers ──────────────────────────────────────────────────────────────────
function relativeTime(dateStr) {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function pct(num, total) {
  if (!total) return 0;
  return Math.round((num / total) * 100);
}

// ─── Shared UI Atoms ──────────────────────────────────────────────────────────
function Card({ children, className = "", gradient = false }) {
  return (
    <div className={`${gradient ? "" : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800"} rounded-[2rem] shadow-sm ${className}`}>
      {children}
    </div>
  );
}

function SectionHead({ icon, title, sub, action, onAction }) {
  return (
    <div className="flex items-start justify-between mb-6">
      <div>
        <h2 className="text-xl font-black flex items-center gap-2.5 tracking-tight text-slate-900 dark:text-white">
          {icon}{title}
        </h2>
        {sub && <p className="text-xs text-slate-400 mt-0.5 ml-8">{sub}</p>}
      </div>
      {action && (
        <button onClick={onAction} className="text-xs font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1 hover:underline shrink-0">
          {action} <ChevronRight size={13} />
        </button>
      )}
    </div>
  );
}

function Pill({ children, color = "slate" }) {
  const map = {
    indigo:  "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300",
    rose:    "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300",
    amber:   "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
    emerald: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
    slate:   "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
    violet:  "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300",
    sky:     "bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300",
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${map[color]}`}>
      {children}
    </span>
  );
}

function MiniBar({ value, max = 100, color = "indigo" }) {
  const colors = {
    indigo: "bg-indigo-500",
    rose:   "bg-rose-500",
    amber:  "bg-amber-500",
    emerald:"bg-emerald-500",
    violet: "bg-violet-500",
  };
  return (
    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
      <div
        className={`h-full rounded-full transition-all duration-700 ${colors[color]}`}
        style={{ width: `${Math.min(100, pct(value, max))}%` }}
      />
    </div>
  );
}

function RiskBadge({ level }) {
  if (!level) return null;
  const l = level.toLowerCase();
  if (l === "high" || l === "critical")
    return <Pill color="rose">{level}</Pill>;
  if (l === "medium" || l === "moderate")
    return <Pill color="amber">{level}</Pill>;
  return <Pill color="emerald">{level}</Pill>;
}

function EmptyState({ icon, message, action, onAction }) {
  return (
    <div className="flex flex-col items-center justify-center py-10 gap-3 text-center">
      <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
        {icon}
      </div>
      <p className="text-sm text-slate-400 max-w-xs">{message}</p>
      {action && (
        <button onClick={onAction} className="text-xs font-bold text-indigo-600 hover:underline mt-1">{action}</button>
      )}
    </div>
  );
}

function LiveDot() {
  return (
    <span className="relative flex h-2 w-2">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
    </span>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const navigate = useNavigate();

  // ── Core / original state ──────────────────────────────────────────────────
  const adminName = "System Administrator";

  const staticAlerts = [
    { message: "47 Students at High Academic Risk", level: "High" },
    { message: "Server Backup Completed Successfully", level: "Low" },
    { message: "3 Faculty Accounts Pending Approval", level: "Medium" },
  ];

  const staticTeachers = [
    { name: "Dr. Hitesh",  department: "CSE",  students: 42, status: "Active" },
    { name: "Prof. Anjali",department: "ECE",  students: 37, status: "Active" },
    { name: "Dr. Raj",     department: "MECH", students: 29, status: "On Leave" },
  ];

  // ── Live data state ────────────────────────────────────────────────────────
  const [universityStats, setUniversityStats] = useState({
    totalStudents: "—", totalTeachers: "—", highRisk: "—", systemHealth: "98%",
  });
  const [studentProgress,   setStudentProgress]   = useState([]);
  const [segaItems,         setSegaItems]         = useState([]);
  const [mentorMentee,      setMentorMentee]      = useState([]);
  const [resources,         setResources]         = useState([]);
  const [trends,            setTrends]            = useState([]);
  const [dropoutPredictions,setDropoutPredictions]= useState([]);
  const [systemAlerts,      setSystemAlerts]      = useState([]);
  const [loading,           setLoading]           = useState(true);
  const [lastRefresh,       setLastRefresh]       = useState(new Date());

  // ── Load all data ──────────────────────────────────────────────────────────
  const loadData = async () => {
    setLoading(true);

    // University stats
    const [{ count: studCount }, { count: teachCount }, { count: riskCount }] =
      await Promise.all([
        supabase.from("profiles").select("id", { count: "exact", head: true }).eq("role", "student").catch(() => ({ count: null })),
        supabase.from("profiles").select("id", { count: "exact", head: true }).eq("role", "teacher").catch(() => ({ count: null })),
        supabase.from("dropout_predictions").select("id", { count: "exact", head: true }).gte("risk_score", 70).catch(() => ({ count: null })),
      ]);

    setUniversityStats({
      totalStudents: studCount != null ? studCount.toLocaleString() : "1,284",
      totalTeachers: teachCount != null ? String(teachCount) : "86",
      highRisk:      riskCount  != null ? String(riskCount)  : "47",
      systemHealth:  "98%",
    });

    // Student progress (top at-risk + top performers)
    const { data: sp } = await supabase
      .from("student_progress")
      .select("id, student_name, cgpa, attendance, completed_modules, total_modules, trend, department")
      .order("cgpa", { ascending: true })
      .limit(8)
      .catch(() => ({ data: null }));
    setStudentProgress(sp || []);

    // SEGA
    const { data: sega } = await supabase
      .from("sega_updates")
      .select("id, title, type, status, description, updated_at, severity")
      .order("updated_at", { ascending: false })
      .limit(6)
      .catch(() => ({ data: null }));
    setSegaItems(sega || []);

    // Mentor–Mentee
    const { data: mm } = await supabase
      .from("mentor_mentee")
      .select("id, mentor_name, mentee_name, department, session_date, status, progress_score")
      .order("session_date", { ascending: false })
      .limit(6)
      .catch(() => ({ data: null }));
    setMentorMentee(mm || []);

    // University Resources
    const { data: res } = await supabase
      .from("university_resources")
      .select("id, name, category, utilization_pct, capacity, status, last_updated")
      .order("utilization_pct", { ascending: false })
      .limit(6)
      .catch(() => ({ data: null }));
    setResources(res || []);

    // University Trends
    const { data: tr } = await supabase
      .from("university_trends")
      .select("id, metric, value, change_pct, period, direction")
      .order("created_at", { ascending: false })
      .limit(6)
      .catch(() => ({ data: null }));
    setTrends(tr || []);

    // Dropout Predictions
    const { data: dp } = await supabase
      .from("dropout_predictions")
      .select("id, student_name, risk_score, risk_level, primary_factor, department, predicted_at")
      .order("risk_score", { ascending: false })
      .limit(8)
      .catch(() => ({ data: null }));
    setDropoutPredictions(dp || []);

    // System alerts (live)
    const { data: sa } = await supabase
      .from("system_alerts")
      .select("id, message, level, created_at")
      .order("created_at", { ascending: false })
      .limit(5)
      .catch(() => ({ data: null }));
    setSystemAlerts(sa || []);

    setLastRefresh(new Date());
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  // ── Derived stats ──────────────────────────────────────────────────────────
  const segaOpenCount     = segaItems.filter(s => !["resolved","done","closed"].includes(s.status?.toLowerCase())).length;
  const segaCriticalCount = segaItems.filter(s => s.severity?.toLowerCase() === "critical").length;
  const activeMentorships = mentorMentee.filter(m => m.status?.toLowerCase() === "active").length;
  const avgRisk           = dropoutPredictions.length
    ? Math.round(dropoutPredictions.reduce((a, b) => a + (b.risk_score ?? 0), 0) / dropoutPredictions.length)
    : null;

  const displayAlerts = systemAlerts.length > 0 ? systemAlerts : staticAlerts;

  const kpiCards = [
    { title: "Total Students",     value: '5120', variant: "primary",  icon: <Users size={18} /> },
    { title: "Total Faculty",      value: '2230', variant: "success",  icon: <UserCheck size={18} /> },
    { title: "High-Risk Students", value: '530',      variant: "danger",   icon: <AlertTriangle size={18} /> },
    { title: "SEGA Open Issues",   value: segaOpenCount || "20",          variant: "warning",  icon: <Shield size={18} /> },
    { title: "Active Mentorships", value: activeMentorships || "10",      variant: "primary",  icon: <UserCog size={18} /> },
    { title: "Avg Dropout Risk",   value: avgRisk ? `${avgRisk}%` : "48%", variant: "danger",   icon: <Brain size={18} /> },
  ];

  // ── SEGA severity helper ───────────────────────────────────────────────────
  function segaColor(item) {
    const sev = item.severity?.toLowerCase();
    const sta = item.status?.toLowerCase();
    if (sev === "critical") return "rose";
    if (sta === "resolved" || sta === "done") return "emerald";
    if (sev === "high") return "amber";
    return "indigo";
  }

  function segaTypeIcon(type) {
    const t = type?.toLowerCase();
    if (t === "problem")  return <AlertCircle size={14} className="text-rose-500" />;
    if (t === "result")   return <Award size={14} className="text-amber-500" />;
    if (t === "news")     return <Megaphone size={14} className="text-indigo-500" />;
    if (t === "update")   return <TrendingUp size={14} className="text-emerald-500" />;
    return <FileText size={14} className="text-slate-400" />;
  }

  // ── Resource colour ────────────────────────────────────────────────────────
  function resColor(pct) {
    if (pct >= 90) return "rose";
    if (pct >= 70) return "amber";
    return "emerald";
  }

  // ── Trend direction ────────────────────────────────────────────────────────
  function trendIcon(dir) {
    if (dir === "up")   return <ArrowUpRight size={16} className="text-emerald-500" />;
    if (dir === "down") return <ArrowDownRight size={16} className="text-rose-500" />;
    return <TrendingUp size={16} className="text-slate-400" />;
  }

  return (
    <DashboardLayout role="admin">

      {/* ══════════════════════════════════════════════════════════════════
          HEADER
      ═══════════════════════════════════════════════════════════════════ */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6 animate-in fade-in slide-in-from-top-4 duration-700">
        <div>
          <div className="flex items-center gap-2 mb-3">
            {/* <span className="flex items-center gap-1.5 px-3 py-1 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[10px] font-black uppercase tracking-[0.2em] rounded-full border border-indigo-500/20">
              <Cpu size={10} /> SUI Admin Intelligence
            </span> */}
            
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-white leading-none">
            Admin<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">
              Control Center
            </span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium text-sm flex items-center gap-2">
            <span className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse inline-block" />
            Welcome back, <span className="font-bold text-slate-800 dark:text-slate-200">{adminName}</span>
            &nbsp;·&nbsp;
            <span className="text-xs">Refreshed {relativeTime(lastRefresh.toISOString())}</span>
          </p>
        </div>

        <div className="flex gap-3 items-center">
          <button
            onClick={loadData}
            className={`p-3 rounded-2xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors ${loading ? "animate-spin text-indigo-600" : "text-slate-500"}`}
            title="Refresh all data"
          >
            <RefreshCw size={17} />
          </button>
          <button className="p-3 rounded-2xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500">
            <Settings size={17} />
          </button>
          <button
            onClick={() => exportCSV(studentProgress, "admin-student-progress")}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold shadow-lg transition-colors"
          >
            <Download size={16} /> Export Report
          </button>
        </div>
      </header>

      {/* ══════════════════════════════════════════════════════════════════
          KPI STRIP — 6 cards
      ═══════════════════════════════════════════════════════════════════ */}
      <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-10">
        {kpiCards.map((k, i) => (
          <StatCard key={i} title={k.title} value={k.value} variant={k.variant} icon={k.icon} />
        ))}
      </section>

      {/* ══════════════════════════════════════════════════════════════════
    ROW 1 — Student Progress + System Alerts
═══════════════════════════════════════════════════════════════════ */}
<div className="grid grid-cols-1 xl:grid-cols-12 gap-8 mb-8">

  {/* ── Student Progress Monitor ─────────────────────────────────── */}
  <Card className="xl:col-span-8 p-8">
    <SectionHead
      icon={<GraduationCap className="text-indigo-600" size={22} />}
      title="Student Progress Monitor"
      sub="Sorted by lowest CGPA: at-risk students first"
      action="Full Report"
      onAction={() => navigate("/admin/students")}
    />

    {(() => {
      // Demo records replacing the empty array
      const studentProgress = [
        { id: 1, student_name: "Amit Kumar", department: "MECH", cgpa: "5.2", attendance: 55, completed_modules: 9, total_modules: 24, trend: "down" },
        { id: 2, student_name: "Rahul Sharma", department: "CSE", cgpa: "5.8", attendance: 68, completed_modules: 14, total_modules: 24, trend: "down" },
        { id: 3, student_name: "Neha Gupta", department: "CIVIL", cgpa: "6.1", attendance: 72, completed_modules: 16, total_modules: 24, trend: "up" },
        { id: 4, student_name: "Priya Patel", department: "ECE", cgpa: "7.4", attendance: 85, completed_modules: 20, total_modules: 24, trend: "up" },
        { id: 5, student_name: "Sneha Reddy", department: "IT", cgpa: "8.9", attendance: 96, completed_modules: 23, total_modules: 24, trend: "up" },
      ];

      return studentProgress.length === 0 ? (
        <EmptyState icon={<GraduationCap size={24} />} message="No student progress data found. Data will appear once synced from academic records." />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100 dark:border-slate-800">
                <th className="text-left pb-3">Student</th>
                <th className="text-left pb-3">Dept</th>
                <th className="text-center pb-3">CGPA</th>
                <th className="text-left pb-3 min-w-[120px]">Attendance</th>
                <th className="text-left pb-3 min-w-[120px]">Modules</th>
                <th className="text-center pb-3">Trend</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
              {studentProgress.map((s, i) => {
                const cgpaNum   = parseFloat(s.cgpa) || 0;
                const atRisk    = cgpaNum < 6.0;
                const modPct    = pct(s.completed_modules, s.total_modules);
                
                return (
                  <tr key={s.id ?? i} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black text-white shrink-0 ${atRisk ? "bg-rose-500" : "bg-indigo-500"}`}>
                          {(s.student_name || "?")[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white leading-tight">{s.student_name || "—"}</p>
                          {atRisk && <span className="text-[9px] font-black text-rose-500 uppercase tracking-wider">At Risk</span>}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 pr-4">
                      <Pill color="slate">{s.department || "—"}</Pill>
                    </td>
                    <td className="py-3 pr-4 text-center">
                      <span className={`text-lg font-black ${cgpaNum >= 8 ? "text-emerald-600" : cgpaNum >= 6 ? "text-amber-600" : "text-rose-600"}`}>
                        {s.cgpa ?? "—"}
                      </span>
                    </td>
                    <td className="py-3 pr-6">
                      <div className="flex items-center gap-2">
                        <MiniBar value={s.attendance} max={100} color={s.attendance >= 75 ? "emerald" : "rose"} />
                        <span className="text-xs text-slate-500 w-8 shrink-0">{s.attendance}%</span>
                      </div>
                    </td>
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-2">
                        <MiniBar value={modPct} max={100} color="indigo" />
                        <span className="text-xs text-slate-500 shrink-0">{s.completed_modules ?? 0}/{s.total_modules ?? 0}</span>
                      </div>
                    </td>
                    <td className="py-3 text-center">
                      {s.trend === "up"   && <ArrowUpRight size={18} className="text-emerald-500 mx-auto" />}
                      {s.trend === "down" && <ArrowDownRight size={18} className="text-rose-500 mx-auto" />}
                      {!s.trend           && <span className="text-slate-300">—</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      );
    })()}
  </Card>


        {/* ── System Alerts ────────────────────────────────────────────── */}
        <aside className="xl:col-span-4 flex flex-col gap-6">
          <Card className="p-6 flex-1">
            <SectionHead
              icon={<Bell className="text-rose-500" size={20} />}
              title="System Alerts"
              action="All Alerts"
              onAction={() => navigate("/admin/alerts")}
            />
            <div className="space-y-3">
              {displayAlerts.map((alert, i) => {
                const lvl = (alert.level || "").toLowerCase();
                const bg  = lvl === "high" || lvl === "critical"
                  ? "bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800"
                  : lvl === "medium"
                  ? "bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800"
                  : "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800";
                const dot = lvl === "high" || lvl === "critical" ? "bg-rose-500" : lvl === "medium" ? "bg-amber-500" : "bg-emerald-500";
                return (
                  <div key={alert.id ?? i} className={`p-4 rounded-2xl border ${bg} flex items-start gap-3`}>
                    <span className={`mt-1 w-2 h-2 rounded-full shrink-0 ${dot}`} />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{alert.message}</p>
                      {alert.created_at && (
                        <p className="text-[10px] text-slate-400 mt-0.5">{relativeTime(alert.created_at)}</p>
                      )}
                    </div>
                    <RiskBadge level={alert.level} />
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Placement Index — preserved */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <ShieldCheck size={20} className="text-indigo-600" />
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Placement Prediction Index</h3>
            </div>
            <p className="text-5xl font-black text-indigo-600">84%</p>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
              Projected placement probability this semester.
            </p>
            <MiniBar value={84} max={100} color="indigo" />
          </Card>
        </aside>
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          ROW 2 — SEGA + Dropout Prediction
      ═══════════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 mb-8">

        {/* ── SEGA Hub ─────────────────────────────────────────────────── */}
        <Card className="xl:col-span-7 p-8">
          <SectionHead
            icon={<Shield className="text-violet-600" size={22} />}
            title="SEGA - Governance Hub"
            sub="Structured Emergency Governance Architecture"
            action="Full SEGA Panel"
            onAction={() => navigate("/admin/sega")}
          />

          {/* SEGA quick stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            {[
              { label: "Open Issues",   value: segaOpenCount,     color: "bg-rose-50 dark:bg-rose-950/30",    text: "text-rose-600 dark:text-rose-400",     ring: "ring-rose-200 dark:ring-rose-800"    },
              { label: "Critical",      value: segaCriticalCount, color: "bg-amber-50 dark:bg-amber-950/30",  text: "text-amber-600 dark:text-amber-400",   ring: "ring-amber-200 dark:ring-amber-800"  },
              { label: "Total Logged",  value: segaItems.length,  color: "bg-violet-50 dark:bg-violet-950/30",text: "text-violet-600 dark:text-violet-400", ring: "ring-violet-200 dark:ring-violet-800"},
            ].map((s, i) => (
              <div key={i} className={`flex flex-col items-center justify-center p-4 rounded-2xl ${s.color} ring-1 ${s.ring}`}>
                <span className={`text-3xl font-black ${s.text}`}>{s.value}</span>
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mt-0.5 text-center">{s.label}</span>
              </div>
            ))}
          </div>

          {segaItems.length === 0 ? (
            <EmptyState icon={<Shield size={24} />} message="No SEGA records yet. Issues, results, and governance news will appear here." />
          ) : (
            <div className="grid sm:grid-cols-2 gap-3">
              {segaItems.map((item) => (
                <div key={item.id} className="p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 hover:border-violet-300 dark:hover:border-violet-700 transition-colors">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-1.5">
                      {segaTypeIcon(item.type)}
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">{item.type || "—"}</span>
                    </div>
                    <Pill color={segaColor(item)}>{item.status || "—"}</Pill>
                  </div>
                  <p className="font-bold text-slate-900 dark:text-white text-sm leading-snug mb-1">{item.title}</p>
                  {item.description && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">{item.description}</p>
                  )}
                  <p className="text-[10px] text-slate-400 mt-2">{relativeTime(item.updated_at)}</p>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* ── Dropout Prediction ───────────────────────────────────────── */}
        <Card className="xl:col-span-5 p-8">
          <SectionHead
            icon={<Brain className="text-rose-600" size={22} />}
            title="Dropout Prediction"
            sub="ML-ranked by risk score"
            action="Full Analysis"
            onAction={() => navigate("/admin/dropout")}
          />

          {dropoutPredictions.length === 0 ? (
            <EmptyState icon={<Brain size={24} />} message="No dropout predictions yet. Run the ML model to see at-risk students here." />
          ) : (
            <ul className="space-y-3">
              {dropoutPredictions.map((d, i) => {
                const riskColor = d.risk_score >= 80 ? "rose" : d.risk_score >= 60 ? "amber" : "emerald";
                const barColor  = d.risk_score >= 80 ? "rose" : d.risk_score >= 60 ? "amber" : "emerald";
                return (
                  <li key={d.id ?? i} className="p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 hover:border-rose-200 dark:hover:border-rose-800 transition-colors">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white text-sm">{d.student_name || "Unknown"}</p>
                        <p className="text-[10px] text-slate-400">{d.department} · {d.primary_factor}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className={`text-xl font-black ${d.risk_score >= 80 ? "text-rose-600" : d.risk_score >= 60 ? "text-amber-600" : "text-emerald-600"}`}>
                          {d.risk_score}%
                        </span>
                        <div className="mt-0.5"><RiskBadge level={d.risk_level} /></div>
                      </div>
                    </div>
                    <MiniBar value={d.risk_score} max={100} color={barColor} />
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          ROW 3 — Mentor-Mentee + University Resources
      ═══════════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">

        {/* ── Mentor-Mentee ────────────────────────────────────────────── */}
        <Card className="p-8">
          <SectionHead
            icon={<UserCog className="text-sky-600" size={22} />}
            title="Mentor - Mentee Pairs"
            sub={`${activeMentorships} active pairings`}
            action="Manage All"
            onAction={() => navigate("/admin/mentorship")}
          />

          {mentorMentee.length === 0 ? (
            <>
              {/* Fallback to static teacher overview (original) */}
              <div className="grid sm:grid-cols-3 gap-4">
                {staticTeachers.map((t, i) => (
                  <div key={i} className="p-5 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-sky-300 dark:hover:border-sky-700 transition-all">
                    <h4 className="font-bold text-base text-slate-900 dark:text-white">{t.name}</h4>
                    <p className="text-xs text-slate-500">{t.department} Department</p>
                    <p className="text-xs mt-3 font-semibold text-slate-600 dark:text-slate-300">{t.students} Students</p>
                    <span className={`inline-block mt-3 px-3 py-1 rounded-full text-xs font-bold ${t.status === "Active" ? "bg-emerald-100 text-emerald-600" : "bg-amber-100 text-amber-600"}`}>
                      {t.status}
                    </span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <ul className="space-y-3">
              {mentorMentee.map((pair, i) => (
                <li key={pair.id ?? i} className="flex items-center gap-4 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 hover:border-sky-200 dark:hover:border-sky-800 transition-colors">
                  {/* Avatars */}
                  <div className="relative shrink-0">
                    <div className="w-9 h-9 rounded-xl bg-sky-500 text-white flex items-center justify-center text-xs font-black">
                      {(pair.mentor_name || "M")[0].toUpperCase()}
                    </div>
                    <div className="w-7 h-7 rounded-xl bg-indigo-400 text-white flex items-center justify-center text-[10px] font-black absolute -bottom-1.5 -right-1.5 ring-2 ring-white dark:ring-slate-900">
                      {(pair.mentee_name || "S")[0].toUpperCase()}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                      {pair.mentor_name} <span className="font-normal text-slate-400">→</span> {pair.mentee_name}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Pill color="slate">{pair.department || "—"}</Pill>
                      {pair.session_date && (
                        <span className="text-[10px] text-slate-400 flex items-center gap-1">
                          <Calendar size={10} /> {pair.session_date}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    {pair.progress_score != null && (
                      <span className="text-lg font-black text-sky-600">{pair.progress_score}%</span>
                    )}
                    <Pill color={pair.status?.toLowerCase() === "active" ? "emerald" : "amber"}>
                      {pair.status || "—"}
                    </Pill>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>

        {/* ── University Resources ─────────────────────────────────────── */}
        <Card className="p-8">
          <SectionHead
            icon={<Building2 className="text-emerald-600" size={22} />}
            title="University Resources"
            sub="Real-time utilisation tracking"
            action="Manage Resources"
            onAction={() => navigate("/admin/resources")}
          />

          {resources.length === 0 ? (
            <EmptyState icon={<Building2 size={24} />} message="No resource utilisation data found. Connect your resource management system to see live usage." />
          ) : (
            <ul className="space-y-4">
              {resources.map((r, i) => {
                const pctVal = r.utilization_pct ?? 0;
                const rc = resColor(pctVal);
                return (
                  <li key={r.id ?? i} className="flex items-center gap-4">
                    <div className={`p-2 rounded-xl shrink-0 ${
                      rc === "rose" ? "bg-rose-50 dark:bg-rose-950/40" :
                      rc === "amber" ? "bg-amber-50 dark:bg-amber-950/40" :
                      "bg-emerald-50 dark:bg-emerald-950/40"
                    }`}>
                      <Building2 size={16} className={
                        rc === "rose" ? "text-rose-500" : rc === "amber" ? "text-amber-500" : "text-emerald-500"
                      } />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{r.name}</p>
                        <span className={`text-sm font-black ml-2 shrink-0 ${
                          rc === "rose" ? "text-rose-600" : rc === "amber" ? "text-amber-600" : "text-emerald-600"
                        }`}>{pctVal}%</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MiniBar value={pctVal} max={100} color={rc} />
                        <Pill color="slate">{r.category || "—"}</Pill>
                      </div>
                    </div>
                    <Pill color={r.status?.toLowerCase() === "active" || r.status?.toLowerCase() === "available" ? "emerald" : "rose"}>
                      {r.status || "—"}
                    </Pill>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          ROW 4 — University Trends + Faculty Overview
      ═══════════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 mb-8">

        {/* ── University Trends ────────────────────────────────────────── */}
        <Card className="xl:col-span-7 p-8">
          <SectionHead
            icon={<TrendingUp className="text-indigo-600" size={22} />}
            title="University Trends"
            sub="Key metrics and movement this period"
            action="Detailed Analytics"
            onAction={() => navigate("/admin/analytics")}
          />

          {trends.length === 0 ? (
            <div className="grid sm:grid-cols-2 gap-4">
              {/* Static fallback with placement index preserved */}
              {[
                { label: "Enrollment Rate",    value: "+3.4%",  dir: "up",   period: "This semester" },
                { label: "Avg CGPA",           value: "7.6",    dir: "up",   period: "vs 7.3 last sem" },
                { label: "Attendance Rate",    value: "82%",    dir: "down", period: "−2% vs last month" },
                { label: "Placement Rate",     value: "84%",    dir: "up",   period: "Projected this sem" },
                { label: "Course Completion",  value: "91%",    dir: "up",   period: "All departments" },
                { label: "Research Output",    value: "12",     dir: "up",   period: "Papers this semester" },
              ].map((t, i) => (
                <div key={i} className="p-5 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs font-black uppercase tracking-widest text-slate-400">{t.label}</p>
                    {trendIcon(t.dir)}
                  </div>
                  <p className="text-2xl font-black text-slate-900 dark:text-white">{t.value}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{t.period}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {trends.map((t, i) => (
                <div key={t.id ?? i} className="p-5 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 hover:border-indigo-200 dark:hover:border-indigo-800 transition-colors">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs font-black uppercase tracking-widest text-slate-400">{t.metric}</p>
                    {trendIcon(t.direction)}
                  </div>
                  <p className="text-2xl font-black text-slate-900 dark:text-white">{t.value}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    {t.change_pct != null && (
                      <span className={`text-xs font-bold ${t.direction === "up" ? "text-emerald-600" : "text-rose-600"}`}>
                        {t.direction === "up" ? "+" : ""}{t.change_pct}%
                      </span>
                    )}
                    <span className="text-xs text-slate-400">{t.period}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* ── Faculty Management (original, upgraded) ──────────────────── */}
        <Card className="xl:col-span-5 p-8">
          <SectionHead
            icon={<BookOpen className="text-indigo-600" size={22} />}
            title="Faculty Overview"
            action="Full Faculty Panel"
            onAction={() => navigate("/admin/faculty")}
          />
          <div className="space-y-4">
            {staticTeachers.map((t, i) => (
              <div key={i} className="flex items-center gap-4 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all group">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white flex items-center justify-center font-black text-sm shrink-0">
                  {t.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-slate-900 dark:text-white">{t.name}</p>
                  <p className="text-xs text-slate-500">{t.department} · {t.students} students</p>
                </div>
                <Pill color={t.status === "Active" ? "emerald" : "amber"}>{t.status}</Pill>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          FOOTER — System Health Strip
      ═══════════════════════════════════════════════════════════════════ */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-[2.5rem] shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-black text-lg text-slate-900 dark:text-white flex items-center gap-2">
            <Cpu className="text-indigo-600" size={20} /> System Infrastructure Health
          </h3>
          <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
            <LiveDot /> All systems operational
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
          {[
            { label: "API Uptime",     value: "99.8%", icon: <Wifi size={16} />,     color: "emerald" },
            { label: "DB Health",      value: "98.2%", icon: <Database size={16} />, color: "emerald" },
            { label: "AI Model",       value: "Active",icon: <Brain size={16} />,    color: "indigo"  },
            { label: "Storage Used",   value: "64%",   icon: <HardDrive size={16} />, color: "amber"   },
          ].map((s, i) => (
            <div key={i} className="flex flex-col gap-2 p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
              <div className={`${
                s.color === "emerald" ? "text-emerald-600" : s.color === "amber" ? "text-amber-600" : "text-indigo-600"
              }`}>
                {s.icon}
              </div>
              <span className="text-xl font-black text-slate-900 dark:text-white">{s.value}</span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{s.label}</span>
            </div>
          ))}
        </div>
      </section>

    </DashboardLayout>
  );
}