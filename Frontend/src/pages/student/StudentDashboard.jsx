import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import DashboardLayout from "../../layouts/DashboardLayout";
import StatCard from "../../components/StatCard";
import ReportTable from "../../components/ReportTable";
import RiskPrediction from "./RiskPrediction";
import StudentOnboarding from "../../components/StudentOnboarding";
import { supabase } from "../../lib/supabase";
import { exportCSV } from "../../utils/exportCSV";
import { exportPDF } from "../../utils/exportPDF";
import { exportFullAcademicPDF } from "../../utils/exportFullAcademicPDF";
import {
  Download, Brain, Rocket, Target, Zap, Users,
  Bell, ChevronRight, Sparkles, Bookmark, LayoutDashboard,
  PlayCircle, CheckCircle,
} from "lucide-react";

export default function StudentDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const [profile, setProfile] = useState(null);
  const [userId, setUserId] = useState(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [teacherTasks, setTeacherTasks] = useState([]);
  const [trackingProgress, setTrackingProgress] = useState({ completed: 0, total: 0 });

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);
      const { data: p } = await supabase.from("profiles").select("full_name, cgpa, interests, onboarding_completed").eq("id", user.id).single();
      setProfile(p || {});
      if (p && p.onboarding_completed === false) setShowOnboarding(true);

      const { data: tasks } = await supabase.from("teacher_tasks").select("id, title, due_date, completed").eq("student_id", user.id).order("created_at", { ascending: false });
      setTeacherTasks(tasks || []);

      const { data: predictions } = await supabase.from("career_predictions").select("top_career, top_match_score, recommendations").eq("user_id", user.id).order("created_at", { ascending: false }).limit(1);
      if (predictions?.length > 0 && predictions[0].recommendations?.length > 0) {
        const recs = predictions[0].recommendations;
        const mapped = recs.map((r, i) => ({
          id: i + 1,
          title: r.career || "—",
          match: `${r.matching_score ?? 0}%`,
          confidence: (r.matching_score ?? 0) >= 75 ? "High" : (r.matching_score ?? 0) >= 45 ? "Medium" : "Low",
          status: i === 0 ? "Best Fit" : "Potential",
          isCurrent: i === 0,
        }));
        setSavedCareers(mapped);
        setActivePath(mapped[0]);
      }

      const { data: progressItems } = await supabase.from("career_progress_items").select("id, completed").eq("user_id", user.id);
      const total = progressItems?.length ?? 0;
      const completed = progressItems?.filter((i) => i.completed).length ?? 0;
      setTrackingProgress({ completed, total });
    };
    load();
  }, [location.pathname]); // refetch when user navigates to dashboard (e.g. after saving a prediction)

  const toggleTask = async (id, completed) => {
    await supabase.from("teacher_tasks").update({ completed }).eq("id", id);
    setTeacherTasks((prev) => prev.map((t) => (t.id === id ? { ...t, completed } : t)));
  };

  // --- CAREER DATA: load from DB (career_predictions), fallback to placeholder ---
  const defaultCareers = [
    { id: 1, title: "Run Career Prediction", match: "—", confidence: "—", status: "Get started", isCurrent: true },
  ];
  const [savedCareers, setSavedCareers] = useState(defaultCareers);
  const [activePath, setActivePath] = useState(savedCareers[0]);

  const handleSwitchPath = (id) => {
    const updated = savedCareers.map(c => ({ ...c, isCurrent: c.id === id }));
    setSavedCareers(updated);
    setActivePath(updated.find(c => c.id === id));
  };

  const performanceData = [
    { Subject: "Artificial Intelligence", Score: 92, Grade: "O" },
    { Subject: "Machine Learning", Score: 88, Grade: "E" },
    { Subject: "Software Engineering", Score: 80, Grade: "E" },
  ];

  const firstName = profile?.full_name?.split(" ")[0] || "Student";
  const studentProfile = {
    firstName,
    fullName: profile?.full_name || "Student",
    cgpa: profile?.cgpa != null ? String(profile.cgpa) : "—",
    peerGroup: "Neural Pioneers",
  };

  return (
    <DashboardLayout role="student">
      {showOnboarding && userId && (
        <StudentOnboarding
          userId={userId}
          onComplete={async () => {
            setShowOnboarding(false);
            const { data: p } = await supabase.from("profiles").select("full_name, cgpa, interests, onboarding_completed").eq("id", userId).single();
            if (p) setProfile(p);
          }}
        />
      )}
      {/* 1. HEADER SECTION: Dynamic Path Syncing */}
      <header className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-6 animate-in fade-in slide-in-from-top-4 duration-1000">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="flex items-center gap-1.5 px-3 py-1 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[10px] font-black uppercase tracking-[0.2em] rounded-full border border-indigo-500/20">
              <Sparkles size={12} /> Smart University Intelligence
            </span>
          </div>
          <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white">
            Welcome back, {studentProfile.firstName}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium flex items-center gap-2">
            <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" />
            Active Path: <span className="text-indigo-600 dark:text-indigo-400 font-bold">{activePath.title}</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-500 text-xs font-bold uppercase tracking-wider">
            Saved Predictions: {savedCareers.length}
          </div>
          <button
            onClick={() => exportFullAcademicPDF({ ...studentProfile, performance: performanceData })}
            className="flex items-center gap-2 px-6 py-3.5 text-sm font-bold rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:scale-[1.02] transition-all shadow-xl"
          >
            <Download size={18} />
            Report
          </button>
        </div>
      </header>

      {/* 2. KPI GRID */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="Current CGPA" value={studentProfile.cgpa} subtitle="Academic Excellence" variant="primary" />
        <StatCard
          title="Career Match"
          value={activePath.match}
          subtitle={`${activePath.status} Rank`}
          variant="warning"
          icon={<Target size={20} />}
        />
        <StatCard
          title="Career tracking"
          value={trackingProgress.total === 0 ? "—" : `${trackingProgress.completed} / ${trackingProgress.total}`}
          subtitle={trackingProgress.total === 0 ? "Add resources on Career Path" : "items completed"}
          variant="primary"
          icon={<PlayCircle size={20} />}
        />
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 mb-8">
        {/* LEFT COLUMN: CAREER NEXUS & ACADEMICS */}
        <div className="xl:col-span-8 flex flex-col gap-8">
          
          {/* DYNAMIC CAREER TRAJECTORY NEXUS */}
          <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold flex items-center gap-3 tracking-tight text-slate-800 dark:text-white">
                <Rocket className="text-indigo-600" size={24} />
                Career Trajectory Nexus
              </h2>
              <button onClick={() => navigate("/student/career")} className="text-xs font-bold text-indigo-600 flex items-center gap-1 hover:underline">
                Predict New Path <ChevronRight size={14} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {savedCareers.map((career) => (
                <div 
                  key={career.id}
                  onClick={() => handleSwitchPath(career.id)}
                  className={`p-5 rounded-3xl border-2 cursor-pointer transition-all duration-300 relative ${
                    career.isCurrent 
                    ? "border-indigo-500 bg-indigo-50/50 dark:bg-indigo-500/10 shadow-lg shadow-indigo-100 dark:shadow-none" 
                    : "border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30 hover:border-slate-300"
                  }`}
                >
                  {career.isCurrent && (
                    <div className="absolute -top-3 -right-3 p-1.5 bg-indigo-600 text-white rounded-full shadow-lg">
                      <Bookmark size={14} fill="white" />
                    </div>
                  )}
                  <p className={`text-[10px] font-black uppercase tracking-widest mb-2 ${career.isCurrent ? 'text-indigo-600' : 'text-slate-400'}`}>
                    {career.status}
                  </p>
                  <h4 className="font-bold text-slate-900 dark:text-white mb-3 leading-tight">{career.title}</h4>
                  <div className="flex items-center justify-between mt-auto">
                    <span className="text-xl font-black text-slate-900 dark:text-white">{career.match}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                      career.confidence === 'Low' ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'
                    }`}>
                      {career.confidence} Confidence
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* PERFORMANCE HUB */}
          <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-8">
               <h2 className="text-2xl font-bold flex items-center gap-3 text-slate-800 dark:text-white">
                <LayoutDashboard className="text-indigo-600" size={24} />
                Strategic Performance
              </h2>
              <div className="flex gap-2">
                <button onClick={() => exportCSV(performanceData, "performance")} className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-[10px] font-black rounded-xl hover:bg-slate-200 transition-colors uppercase">CSV</button>
                <button onClick={() => exportPDF(performanceData, "performance")} className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-[10px] font-black rounded-xl hover:bg-slate-200 transition-colors uppercase">PDF</button>
              </div>
            </div>
            <ReportTable columns={["Subject", "Score", "Grade"]} data={performanceData} />
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <aside className="xl:col-span-4 flex flex-col gap-8">
          {/* CAREER TRACKING */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                <PlayCircle className="text-indigo-600" size={22} />
                Career tracking
              </h3>
              <button onClick={() => navigate("/student/career-path")} className="text-xs font-bold text-indigo-600 flex items-center gap-1 hover:underline">
                Open <ChevronRight size={14} />
              </button>
            </div>
            {trackingProgress.total === 0 ? (
              <p className="text-slate-500 dark:text-slate-400 text-sm mb-4">Add videos, notes, and links on Career Path & Tracking to see progress here.</p>
            ) : (
              <div className="flex items-center gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-2">
                  <CheckCircle size={20} className="text-emerald-500 shrink-0" />
                  <span className="text-2xl font-black text-slate-900 dark:text-white">{trackingProgress.completed}</span>
                  <span className="text-slate-500 dark:text-slate-400 font-medium">/ {trackingProgress.total}</span>
                </div>
                <span className="text-sm text-slate-600 dark:text-slate-400">items completed</span>
              </div>
            )}
            <button onClick={() => navigate("/student/career-path")} className="mt-3 w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold flex items-center justify-center gap-2">
              <PlayCircle size={16} /> Career Path & Tracking
            </button>
          </div>

          {/* TASKS FROM TEACHER */}
          {teacherTasks.length > 0 && (
            <div className="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm">
              <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-4">Tasks from teacher</h3>
              <ul className="space-y-2">
                {teacherTasks.map((t) => (
                  <li key={t.id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                    <button type="button" onClick={() => toggleTask(t.id, !t.completed)} className="shrink-0">
                      {t.completed ? <span className="text-emerald-500">✓</span> : <span className="w-5 h-5 rounded border-2 border-slate-300" />}
                    </button>
                    <span className={t.completed ? "line-through text-slate-500" : "text-slate-800 dark:text-white"}>{t.title}</span>
                    {t.due_date && <span className="text-xs text-slate-400 ml-auto">{t.due_date}</span>}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* RISK MODEL */}
          <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-indigo-50 dark:bg-indigo-950 rounded-xl">
                <Brain className="text-indigo-600" size={24} />
              </div>
              <h3 className="font-black text-lg tracking-tight">Risk Projection</h3>
            </div>
            <RiskPrediction />
          </div>

          {/* PEER GROUPING & EVENTS */}
          <div className="bg-indigo-600 p-8 rounded-[2.5rem] text-white shadow-xl">
            <div className="flex items-center gap-3 mb-6">
              <Users size={24} className="text-indigo-200" />
              <h3 className="font-bold text-lg">Peer Ecosystem</h3>
            </div>
            <div className="bg-white/10 p-5 rounded-3xl border border-white/20 backdrop-blur-md">
              <p className="text-[10px] font-bold text-indigo-200 uppercase tracking-widest mb-1">Active Peer Group</p>
              <p className="text-lg font-black italic">{studentProfile.peerGroup}</p>
              <div className="mt-4 flex items-center gap-2 text-[10px] font-black bg-white/20 w-fit px-3 py-1.5 rounded-full uppercase tracking-tighter">
                <Bell size={12} className="animate-bounce" /> Group Hackathon Tonight
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* 3. OPTIMIZATION ROADMAP (Full Width Footer) */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-10 rounded-[3rem] shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          <div className="col-span-1">
             <h3 className="text-2xl font-black text-slate-900 dark:text-white leading-tight">SUI<br/>Optimization Strategy</h3>
             <p className="text-slate-500 text-sm mt-4 italic">Tailored for your current "{activePath.title}" path.</p>
          </div>
          {[
            { title: "Skill Acquisition", desc: `Focus on modules that bridge the remaining ${(100 - parseFloat(activePath.match)).toFixed(2)}% gap.`, icon: <Zap className="text-amber-500" /> },
            { title: "Network Growth", desc: "Collaborate with peers in your career path to grow together.", icon: <Users className="text-indigo-500" /> },
          ].map((item, idx) => (
            <div key={idx} className="group cursor-default">
              <div className="mb-4">{item.icon}</div>
              <h4 className="font-bold text-slate-900 dark:text-white mb-2">{item.title}</h4>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium group-hover:text-indigo-600 transition-colors">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </DashboardLayout>
  );
}