import { useEffect, useMemo, useState } from "react";
import { getRole } from "../../utils/auth";
import DashboardLayout from "../../layouts/DashboardLayout";
import {
  BookOpen,
  Clock,
  Calendar,
  BarChart3,
  Search,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  MoreVertical
} from "lucide-react";

const API = "http://localhost:8001";

export default function WorkloadManager() {
  const role = getRole() || "student";

  const [tasks, setTasks] = useState([]);
  const [analysis, setAnalysis] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  // ================= LOAD =================

  async function loadTasks() {
    setLoading(true);
    try {
      const res = await fetch(`${API}/task/my?role=${role}`);

      if (!res.ok) {
        setTasks([]);
        return;
      }

      const data = await res.json();
      setTasks(Array.isArray(data) ? data : []);
    } catch {
      setTasks([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTasks();
  }, [role]);

  // ================= ANALYZE =================

  async function analyze() {
    try {
      const res = await fetch(`${API}/workload/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tasks }),
      });

      if (res.ok) setAnalysis(await res.json());
    } catch {}
  }

  // ================= STATS =================

  const stats = useMemo(() => {
    const hours = tasks.reduce((a, t) => a + (Number(t.hours) || 0), 0);
    const upcoming = tasks.filter(
      t => t.deadline && new Date(t.deadline) > new Date()
    ).length;

    return { count: tasks.length, hours, upcoming };
  }, [tasks]);

  // ================= FILTER =================

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return tasks.filter(t =>
      (t.title || "").toLowerCase().includes(q) ||
      (t.subject || "").toLowerCase().includes(q)
    );
  }, [tasks, search]);

  // ================= UI =================

  return (
    <div className="space-y-8">

      {/* HEADER — MATCHES SUIS PAGE STYLE */}
      <div>
        <h1 className="text-3xl font-bold text-white">
          Workload Manager
        </h1>
        <p className="text-slate-400 mt-2">
          AI-assisted workload tracking & deadline risk analysis
        </p>
      </div>

      {/* ================= KPI CARDS ================= */}
      <div className="grid md:grid-cols-3 gap-6">

        <DashCard title="Total Tasks" value={stats.count} icon={BookOpen}/>
        <DashCard title="Workload Hours" value={stats.hours} icon={Clock}/>
        <DashCard title="Upcoming Deadlines" value={stats.upcoming} icon={Calendar}/>

      </div>

      {/* ================= SEARCH ================= */}
      <div className="bg-slate-900 rounded-xl border border-slate-800 p-3 flex items-center gap-3">
        <Search size={18} className="text-slate-400"/>
        <input
          className="bg-transparent flex-1 outline-none text-sm text-white"
          placeholder="Search tasks..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* ================= MAIN GRID ================= */}
      <div className="grid lg:grid-cols-3 gap-8">

        {/* LEFT — TASK TABLE */}
        <div className="lg:col-span-2 bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">

          <div className="p-6 border-b border-slate-800 flex justify-between">
            <h3 className="font-semibold text-white">Task Registry</h3>
            <span className="text-xs text-slate-400">
              {filtered.length} records
            </span>
          </div>

          <table className="w-full text-sm">
            <thead className="bg-slate-800 text-slate-400">
              <tr>
                <th className="px-6 py-3 text-left">Task</th>
                <th className="px-6 py-3 text-left">Due</th>
                <th className="px-6 py-3 text-left">Hours</th>
                <th className="px-6 py-3 text-right"></th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-800">

              {loading && (
                <tr>
                  <td colSpan="4" className="p-10 text-center text-slate-400">
                    <Loader2 className="animate-spin mx-auto"/>
                  </td>
                </tr>
              )}

              {!loading && filtered.length === 0 && (
                <tr>
                  <td colSpan="4" className="p-10 text-center text-slate-500">
                    No tasks found
                  </td>
                </tr>
              )}

              {!loading && filtered.map(t => (
                <tr key={t.id} className="hover:bg-slate-800/40">
                  <td className="px-6 py-3 text-white">
                    {t.title}
                    <div className="text-xs text-slate-400">
                      {t.subject}
                    </div>
                  </td>
                  <td className="px-6 py-3 text-slate-400">
                    {t.deadline}
                  </td>
                  <td className="px-6 py-3 text-slate-300 font-semibold">
                    {t.hours}h
                  </td>
                  <td className="px-6 py-3 text-right text-slate-500">
                    <MoreVertical size={16}/>
                  </td>
                </tr>
              ))}

            </tbody>
          </table>
        </div>

        {/* RIGHT — WORKLOAD HEALTH */}
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6">

          <div className="flex justify-between mb-6">
            <h3 className="font-semibold text-white">
              Workload Health
            </h3>

            <button
              onClick={analyze}
              className="text-xs font-semibold bg-indigo-600 px-3 py-1.5 rounded-lg hover:bg-indigo-500"
            >
              Refresh AI
            </button>
          </div>

          {!analysis ? (
            <EmptyHealth/>
          ) : (
            <HealthResult analysis={analysis}/>
          )}

        </div>

      </div>
    </div>
  );
}

/* ================= SMALL COMPONENTS ================= */

function DashCard({ title, value, icon: Icon }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
      <div className="flex justify-between">
        <div>
          <p className="text-slate-400 text-sm">{title}</p>
          <h3 className="text-3xl font-bold text-white mt-2">
            {value}
          </h3>
        </div>
        <Icon className="text-indigo-500"/>
      </div>
    </div>
  );
}

function EmptyHealth() {
  return (
    <div className="text-center text-slate-500 py-16">
      <BarChart3 size={40} className="mx-auto mb-4 opacity-20"/>
      Click refresh to analyze workload risk
    </div>
  );
}

function HealthResult({ analysis }) {
  return (
    <div className="text-center space-y-4">
      <div className="text-4xl font-bold text-white">
        {analysis.score}
      </div>

      <div className={`inline-flex gap-2 px-4 py-2 rounded-full text-sm font-semibold
        ${analysis.overload ? "bg-red-900 text-red-400" : "bg-emerald-900 text-emerald-400"}`}>
        {analysis.overload ? <AlertTriangle size={16}/> : <CheckCircle2 size={16}/>}
        {analysis.level}
      </div>

      <div className="text-slate-400 text-sm">
        {analysis.category}
      </div>
    </div>
  );
}
