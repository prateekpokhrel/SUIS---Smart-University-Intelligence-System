import { useState, useEffect } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import StatCard from "../../components/StatCard";
import { supabase } from "../../lib/supabase";
import { Users, Plus, CheckCircle, Calendar } from "lucide-react";

export default function StudentsReports() {
  const [students, setStudents] = useState([]);
  const [progressMap, setProgressMap] = useState({});
  const [teacherId, setTeacherId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [taskModal, setTaskModal] = useState(null);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDue, setTaskDue] = useState("");

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setTeacherId(user.id);

      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, email, cgpa, interests, department, year")
        .eq("role", "student")
        .order("full_name");
      setStudents(profiles || []);

      if (profiles?.length) {
        const ids = profiles.map((p) => p.id);
        const { data: items } = await supabase
          .from("career_progress_items")
          .select("user_id, completed")
          .in("user_id", ids);
        const completed = {};
        const total = {};
        (items || []).forEach((i) => {
          completed[i.user_id] = (completed[i.user_id] || 0) + (i.completed ? 1 : 0);
          total[i.user_id] = (total[i.user_id] || 0) + 1;
        });
        setProgressMap(
          profiles.reduce((acc, p) => {
            acc[p.id] = { completed: completed[p.id] || 0, total: total[p.id] || 0 };
            return acc;
          }, {})
        );
      }
      setLoading(false);
    };
    load();
  }, []);

  const addTask = async () => {
    if (!taskModal || !taskTitle.trim() || !teacherId) return;
    await supabase.from("teacher_tasks").insert({
      teacher_id: teacherId,
      student_id: taskModal.id,
      title: taskTitle.trim(),
      due_date: taskDue || null,
    });
    setTaskModal(null);
    setTaskTitle("");
    setTaskDue("");
  };

  const avgCgpa =
    students.length > 0
      ? (students.reduce((s, p) => s + (parseFloat(p.cgpa) || 0), 0) / students.filter((p) => p.cgpa != null).length).toFixed(1)
      : "—";

  return (
    <DashboardLayout role="teacher">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
          <Users className="text-indigo-600" />
          Student Reports
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          You only see students assigned to you as mentees (by admin). View CGPA, interests, and progress on suggested resources. Students&apos; own reading list is private.
        </p>
      </header>

      <section className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <StatCard title="Total Students" value={String(students.length)} />
        <StatCard title="Class Avg CGPA" value={avgCgpa} subtitle="From reported CGPAs" />
        <StatCard title="With career progress" value={Object.values(progressMap).filter((p) => p.total > 0).length} subtitle="Students" />
      </section>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-indigo-600 border-t-transparent" />
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500">Student</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500">Department / Year</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500">CGPA</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500">Interests</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500">Suggested items</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {students.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                    <td className="px-6 py-4">
                      <p className="font-semibold text-slate-900 dark:text-white">{s.full_name || "—"}</p>
                      <p className="text-xs text-slate-500">{s.email}</p>
                    </td>
                    <td className="px-6 py-4 text-sm">{[s.department, s.year].filter(Boolean).join(" · ") || "—"}</td>
                    <td className="px-6 py-4 font-semibold text-indigo-600">{s.cgpa != null ? s.cgpa : "—"}</td>
                    <td className="px-6 py-4 text-sm max-w-xs truncate">{s.interests || "—"}</td>
                    <td className="px-6 py-4">
                      {progressMap[s.id] ? (
                        <span className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-700 dark:text-slate-300">
                          <CheckCircle size={14} className="text-emerald-500 shrink-0" />
                          {progressMap[s.id].completed} / {progressMap[s.id].total} completed
                        </span>
                      ) : (
                        <span className="text-slate-400 text-sm">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => setTaskModal(s)}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold"
                      >
                        <Plus size={14} /> Add task
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {students.length === 0 && (
            <div className="text-center py-12 text-slate-500">No students yet.</div>
          )}
        </div>
      )}

      {taskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-700">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Add task for {taskModal.full_name || taskModal.email}</h3>
            <p className="text-sm text-slate-500 mb-4">The student will see this in their dashboard.</p>
            <input
              type="text"
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              placeholder="Task title (e.g. Complete DSA Module 2)"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white mb-3"
            />
            <input
              type="date"
              value={taskDue}
              onChange={(e) => setTaskDue(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white mb-4"
            />
            <div className="flex gap-2">
              <button onClick={addTask} disabled={!taskTitle.trim()} className="flex-1 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold disabled:opacity-50">
                Add task
              </button>
              <button onClick={() => { setTaskModal(null); setTaskTitle(""); setTaskDue(""); }} className="px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 font-medium">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
