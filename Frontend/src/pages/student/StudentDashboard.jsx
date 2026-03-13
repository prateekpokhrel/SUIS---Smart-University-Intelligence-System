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
  PlayCircle, CheckCircle, Mail, ShieldAlert, ShieldCheck, 
  AlertTriangle, MessageSquare, ArrowUpRight, Siren, Radio
} from "lucide-react";

export default function StudentDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const [profile, setProfile] = useState(null);
  const [userId, setUserId] = useState(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [teacherTasks, setTeacherTasks] = useState([]);
  const [trackingProgress, setTrackingProgress] = useState({ completed: 0, total: 0 });

  // --- NEW DYNAMIC STATE VARIABLES ---
  const [spamStats, setSpamStats] = useState({ detected: 0, deleted: 0 });
  const [importantMails, setImportantMails] = useState([]);
  const [segaAlerts, setSegaAlerts] = useState([]);
  const [careerNews, setCareerNews] = useState("No recent updates.");
  const [peerNews, setPeerNews] = useState("No recent peer group updates.");

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);
      
      // 1. Fetch Profile
      const { data: p } = await supabase.from("profiles").select("full_name, cgpa, interests, onboarding_completed, peer_group").eq("id", user.id).single();
      setProfile(p || {});
      if (p && p.onboarding_completed === false) setShowOnboarding(true);

      // 2. Fetch Tasks
      const { data: tasks } = await supabase.from("teacher_tasks").select("id, title, due_date, completed").eq("student_id", user.id).order("created_at", { ascending: false });
      setTeacherTasks(tasks || []);

      // 3. Fetch Career Predictions
      const { data: predictions } = await supabase.from("career_predictions").select("top_career, top_match_score, recommendations").eq("user_id", user.id).order("created_at", { ascending: false }).limit(1);
      if (predictions?.length > 0 && predictions[0].recommendations?.length > 0) {
        const recs = predictions[0].recommendations;
        const mapped = recs.map((r, i) => ({
          id: i + 1,
          title: r.career || "N/A",
          match: `${r.matching_score ?? 0}%`,
          confidence: (r.matching_score ?? 0) >= 75 ? "High" : (r.matching_score ?? 0) >= 45 ? "Medium" : "Low",
          status: i === 0 ? "Best Fit" : "Potential",
          isCurrent: i === 0,
        }));
        setSavedCareers(mapped);
        setActivePath(mapped[0]);
      }

      // 4. Fetch Career Progress
      const { data: progressItems } = await supabase.from("career_progress_items").select("id, completed").eq("user_id", user.id);
      const total = progressItems?.length ?? 0;
      const completed = progressItems?.filter((i) => i.completed).length ?? 0;
      setTrackingProgress({ completed, total });

      // ==========================================
      // NEW DATA FETCHING LOGIC (Replace table names as needed)
      // ==========================================

      // Fetch Important Emails
      const { data: mails } = await supabase.from("user_emails")
        .select("id, sender, subject, received_at, is_new")
        .eq("student_id", user.id)
        .eq("is_important", true)
        .order("received_at", { ascending: false })
        .limit(3);
      if (mails) setImportantMails(mails);

      // Fetch Spam Stats (assuming a daily log table or aggregate)
      const { data: spam } = await supabase.from("spam_logs")
        .select("detected, deleted")
        .eq("student_id", user.id)
        .single();
      if (spam) setSpamStats(spam);

      // Fetch SEGA (Structured Emergency Governance Architecture) Alerts
      // Assuming SEGA alerts are campus-wide, so we check for active ones
      const { data: alerts } = await supabase.from("sega_alerts")
        .select("id, type, message, severity")
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(2);
      if (alerts) setSegaAlerts(alerts);

      // Fetch Dashboard Insights (Career & Peer News)
      const { data: insights } = await supabase.from("dashboard_insights")
        .select("career_news, peer_news")
        .eq("student_id", user.id)
        .single();
      if (insights) {
        if (insights.career_news) setCareerNews(insights.career_news);
        if (insights.peer_news) setPeerNews(insights.peer_news);
      }
    };
    
    load();
  }, [location.pathname]); 

  const toggleTask = async (id, completed) => {
    await supabase.from("teacher_tasks").update({ completed }).eq("id", id);
    setTeacherTasks((prev) => prev.map((t) => (t.id === id ? { ...t, completed } : t)));
  };

  const defaultCareers = [
    { id: 1, title: "Run Career Prediction", match: "N/A", confidence: "0.00%", status: "Get started", isCurrent: true },
  ];
  const [savedCareers, setSavedCareers] = useState(defaultCareers);
  const [activePath, setActivePath] = useState(savedCareers[0]);

  const handleSwitchPath = (id) => {
    const updated = savedCareers.map(c => ({ ...c, isCurrent: c.id === id }));
    setSavedCareers(updated);
    setActivePath(updated.find(c => c.id === id));
  };

  const performanceData = [
    { Subject: "Artificial Intelligence", Score: "N/A", Grade: "0" },
    { Subject: "Machine Learning", Score: "N/A", Grade: "0" },
    { Subject: "Professional Elective", Score: "N/A", Grade: "0" },
    { Subject: "UHV", Score: "N/A", Grade: "0" },
    { Subject: "Open Elective", Score: "N/A", Grade: "0" },
    { Subject: "Mini Project", Score: "N/A", Grade: "0" },
  ];

  const firstName = profile?.full_name?.split(" ")[0] || "Student";
  const studentProfile = {
    firstName,
    fullName: profile?.full_name || "Student",
    cgpa: profile?.cgpa != null ? String(profile.cgpa) : "9.6",
    peerGroup: profile?.peer_group || "Assigning Group...",
  };

  return (
    <DashboardLayout role="student">
      {showOnboarding && userId && (
        <StudentOnboarding
          userId={userId}
          onComplete={async () => {
            setShowOnboarding(false);
            const { data: p } = await supabase.from("profiles").select("full_name, cgpa, interests, onboarding_completed, peer_group").eq("id", userId).single();
            if (p) setProfile(p);
          }}
        />
      )}
      
      {/* 1. HEADER SECTION */}
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
          <div className="text-slate-500 dark:text-slate-400 mt-1 font-medium flex items-center gap-2">
            <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" />
            Active Path: <span className="text-indigo-600 dark:text-indigo-400 font-bold">{activePath.title}</span>
          </div>
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
        <StatCard title="Career Match" value={activePath.match} subtitle={`${activePath.status} Rank`} variant="warning" icon={<Target size={20} />} />
        <StatCard title="Career Tracking" value={trackingProgress.total === 0 ? "N/A" : `${trackingProgress.completed} / ${trackingProgress.total}`} subtitle={trackingProgress.total === 0 ? "Add resources on Path" : "items completed"} variant="primary" icon={<PlayCircle size={20} />} />
        
        {/* Updated SEGA KPI to reflect Governance Status */}
        <div className="p-6 rounded-[2rem] bg-slate-900 text-white shadow-lg border border-slate-700 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <p className="font-bold text-sm text-slate-400">SEGA Status</p>
            <Radio size={20} className="text-rose-400" />
          </div>
          <div>
            <h4 className="text-2xl font-black leading-tight">
              {segaAlerts.length > 0 ? `${segaAlerts.length} Active` : "Clear"}
            </h4>
            <p className="text-xs font-medium text-slate-400 mt-1">Emergency Governance</p>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 mb-8">
        {/* LEFT COLUMN */}
        <div className="xl:col-span-8 flex flex-col gap-8">
          
          {/* DYNAMIC CAREER TRAJECTORY NEXUS */}
          <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 dark:bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="flex items-center justify-between mb-8 relative z-10">
              <h2 className="text-2xl font-bold flex items-center gap-3 tracking-tight text-slate-800 dark:text-white">
                <Rocket className="text-indigo-600" size={24} />
                Career Trajectory Nexus
              </h2>
              <button onClick={() => navigate("/student/career")} className="text-xs font-bold text-indigo-600 flex items-center gap-1 hover:underline">
                Predict New Path <ChevronRight size={14} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative z-10">
              {savedCareers.map((career) => (
                <div 
                  key={career.id}
                  onClick={() => handleSwitchPath(career.id)}
                  className={`p-5 rounded-3xl border-2 cursor-pointer transition-all duration-300 relative group ${
                    career.isCurrent 
                    ? "border-indigo-500 bg-indigo-50/50 dark:bg-indigo-500/10 shadow-lg shadow-indigo-100 dark:shadow-none scale-[1.02]" 
                    : "border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30 hover:border-slate-300 hover:shadow-md"
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
                  <h4 className="font-bold text-slate-900 dark:text-white mb-3 leading-tight group-hover:text-indigo-600 transition-colors">{career.title}</h4>
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

          {/* COMMUNICATION HUB (Dynamic Mails & Spam) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Important Mails */}
            <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
              <div className="flex items-center justify-between mb-6">
                 <h2 className="text-xl font-bold flex items-center gap-3 text-slate-800 dark:text-white">
                  <Mail className="text-blue-500" size={22} />
                  Inbox Highlights
                </h2>
                <span className="bg-blue-100 text-blue-600 text-[10px] font-bold px-2 py-1 rounded-full">{importantMails.length} Important</span>
              </div>
              <div className="space-y-3 flex-1">
                {importantMails.length > 0 ? importantMails.map((mail) => (
                  <div key={mail.id} className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 hover:bg-slate-100 transition-colors cursor-pointer group">
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                        {mail.sender} {mail.is_new && <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" />}
                      </span>
                      {/* Note: You might want to format the received_at timestamp properly here */}
                      <span className="text-[10px] text-slate-400">{new Date(mail.received_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <p className="text-sm font-semibold text-slate-800 dark:text-white group-hover:text-blue-600 transition-colors truncate">{mail.subject}</p>
                  </div>
                )) : (
                  <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-4">No important emails today.</p>
                )}
              </div>
            </div>

            {/* Dynamic Spam Detection Widget */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-8 rounded-[2.5rem] shadow-sm flex flex-col justify-between text-white relative overflow-hidden">
              <div className="absolute -right-4 -top-4 opacity-10 rotate-12">
                <ShieldAlert size={120} />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-white/10 rounded-xl backdrop-blur-sm">
                    <ShieldCheck className="text-emerald-400" size={22} />
                  </div>
                  <h2 className="text-xl font-bold">Mail Security</h2>
                </div>
                <p className="text-slate-400 text-sm mb-6">AI Spam detection is actively filtering your inbox.</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4">
                  <p className="text-3xl font-black text-amber-400">{spamStats.detected}</p>
                  <p className="text-[10px] uppercase tracking-wider font-bold text-slate-300 mt-1">Detected Today</p>
                </div>
                <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4">
                  <p className="text-3xl font-black text-emerald-400">{spamStats.deleted}</p>
                  <p className="text-[10px] uppercase tracking-wider font-bold text-slate-300 mt-1">Deleted Today</p>
                </div>
              </div>
            </div>
          </div>

          {/* PERFORMANCE HUB */}
          <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-8">
               <h2 className="text-2xl font-bold flex items-center gap-3 text-slate-800 dark:text-white">
                <LayoutDashboard className="text-indigo-600" size={24} />
                Current Semester Performance
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
        <aside className="xl:col-span-4 flex flex-col gap-6">
          
          {/* SEGA SYSTEM (Structured Emergency Governance Architecture) */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
            {/* Warning gradient background if there are high severity alerts */}
            {segaAlerts.some(a => a.severity === 'high') && (
              <div className="absolute top-0 left-0 w-full h-2 bg-rose-500 animate-pulse" />
            )}
            
            <div className="flex items-center gap-3 mb-4">
              <div className={`p-2 rounded-xl ${segaAlerts.length > 0 ? 'bg-rose-50 dark:bg-rose-950' : 'bg-slate-100 dark:bg-slate-800'}`}>
                <Siren className={segaAlerts.length > 0 ? 'text-rose-600' : 'text-slate-500'} size={20} />
              </div>
              <h3 className="font-bold text-lg text-slate-900 dark:text-white tracking-tight">SEGA Protocol</h3>
            </div>
            
            <p className="text-xs text-slate-500 mb-4 font-medium uppercase tracking-wider">Structured Emergency Governance</p>

            <div className="space-y-3">
              {segaAlerts.length > 0 ? (
                segaAlerts.map(alert => (
                  <div key={alert.id} className={`p-4 rounded-2xl border ${
                    alert.severity === 'high' 
                      ? 'bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/30' 
                      : 'bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/30'
                  }`}>
                    <p className={`text-xs font-bold mb-1 flex items-center gap-1 ${
                      alert.severity === 'high' ? 'text-rose-600 dark:text-rose-400' : 'text-amber-600 dark:text-amber-400'
                    }`}>
                      <AlertTriangle size={12}/> {alert.type}
                    </p>
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{alert.message}</p>
                  </div>
                ))
              ) : (
                <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 text-center">
                  <ShieldCheck className="mx-auto text-emerald-500 mb-2" size={24} />
                  <p className="text-sm font-bold text-emerald-700 dark:text-emerald-400">All Systems Normal</p>
                  <p className="text-xs text-emerald-600/70 dark:text-emerald-400/70 mt-1">No active governance alerts</p>
                </div>
              )}
            </div>
          </div>

          {/* CAREER TRACKING */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                <PlayCircle className="text-indigo-600" size={22} />
                Career Tracking
              </h3>
              <button onClick={() => navigate("/student/career-path")} className="text-xs font-bold text-indigo-600 flex items-center gap-1 hover:underline">
                Open <ChevronRight size={14} />
              </button>
            </div>
            
            {/* Dynamic Career Insight */}
            <div className="mb-4 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-700">
              <span className="text-[10px] uppercase font-bold text-emerald-500 mb-1 block">Latest Insight</span>
              <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">{careerNews}</p>
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
            <button onClick={() => navigate("/student/career-path")} className="mt-auto pt-3 w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold flex items-center justify-center gap-2">
              <PlayCircle size={16} /> Update Progress
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
                      {t.completed ? <span className="text-emerald-500"><CheckCircle size={20}/></span> : <span className="w-5 h-5 rounded border-2 border-slate-300" />}
                    </button>
                    <span className={`text-sm ${t.completed ? "line-through text-slate-400" : "text-slate-800 dark:text-white font-medium"}`}>{t.title}</span>
                    {t.due_date && <span className="text-xs text-slate-400 ml-auto bg-white dark:bg-slate-800 px-2 py-1 rounded-md">{t.due_date}</span>}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* PEER GROUPING & EVENTS */}
          <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 p-8 rounded-[2.5rem] text-white shadow-xl relative overflow-hidden">
             <div className="absolute top-0 right-0 p-8 opacity-20"><Users size={100} /></div>
             
            <div className="flex items-center gap-3 mb-6 relative z-10">
              <div className="p-2 bg-white/20 rounded-xl backdrop-blur-md">
                <Users size={20} className="text-white" />
              </div>
              <h3 className="font-bold text-lg">Peer Ecosystem</h3>
            </div>
            
            <div className="bg-white/10 p-5 rounded-3xl border border-white/20 backdrop-blur-md relative z-10">
              <p className="text-[10px] font-bold text-indigo-200 uppercase tracking-widest mb-1">Active Group</p>
              <p className="text-xl font-black italic mb-3">{studentProfile.peerGroup}</p>
              
              {/* Dynamic Peer Result/News */}
              <div className="bg-white/10 rounded-xl p-3 mb-4">
                 <p className="text-xs font-medium text-indigo-100 flex items-start gap-2">
                  <ArrowUpRight size={14} className="shrink-0 text-emerald-300" />
                  {peerNews}
                 </p>
              </div>

              <div className="flex items-center gap-2 text-[10px] font-black bg-white/20 w-fit px-3 py-1.5 rounded-full uppercase tracking-tighter cursor-pointer hover:bg-white/30 transition-colors">
                <Bell size={12} className="animate-bounce" /> Group Action Required
              </div>
            </div>
          </div>

          {/* RISK MODEL */}
          <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-xl">
                <Brain className="text-slate-600 dark:text-slate-400" size={24} />
              </div>
              <h3 className="font-black text-lg tracking-tight">Risk Projection</h3>
            </div>
            <RiskPrediction />
          </div>

        </aside>
      </div>

      {/* 3. OPTIMIZATION ROADMAP */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-10 rounded-[3rem] shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          <div className="col-span-1">
             <h3 className="text-2xl font-black text-slate-900 dark:text-white leading-tight">SUI<br/>Optimization Strategy</h3>
             <p className="text-slate-500 text-sm mt-4 italic">Tailored for your current "{activePath.title}" path.</p>
          </div>
          {[
            { title: "Skill Acquisition", desc: `Focus on modules that bridge the remaining ${(100 - parseFloat(activePath.match)).toFixed(2)}% gap.`, icon: <Zap className="text-amber-500" /> },
            { title: "Network Growth", desc: "Collaborate with peers in your career path to grow together.", icon: <Users className="text-indigo-500" /> },
            { title: "SEGA Compliance", desc: "Ensure you review all active Emergency Governance directives.", icon: <Siren className="text-rose-500" /> },
          ].map((item, idx) => (
            <div key={idx} className="group cursor-default">
              <div className="mb-4 bg-slate-50 dark:bg-slate-800 w-12 h-12 rounded-2xl flex items-center justify-center border border-slate-100 dark:border-slate-700 group-hover:scale-110 transition-transform">{item.icon}</div>
              <h4 className="font-bold text-slate-900 dark:text-white mb-2">{item.title}</h4>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium group-hover:text-indigo-600 transition-colors">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </DashboardLayout>
  );
}