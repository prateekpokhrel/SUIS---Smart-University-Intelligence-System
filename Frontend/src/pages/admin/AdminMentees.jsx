import { useState, useEffect } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import { supabase } from "../../lib/supabase";
import { Users, UserPlus, Trash2, GraduationCap, X } from "lucide-react";

export default function AdminMentees() {
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);
  const [assignments, setAssignments] = useState([]); // { teacher_id, student_id }[]
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignStudentId, setAssignStudentId] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const [teachersRes, studentsRes, assignRes] = await Promise.all([
      supabase.from("profiles").select("id, full_name, email").eq("role", "teacher").order("full_name"),
      supabase.from("profiles").select("id, full_name, email, department, year").eq("role", "student").order("full_name"),
      supabase.from("mentor_mentee").select("teacher_id, student_id"),
    ]);
    setTeachers(teachersRes.data || []);
    setStudents(studentsRes.data || []);
    setAssignments(assignRes.data || []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const menteesFor = (teacherId) =>
    assignments
      .filter((a) => a.teacher_id === teacherId)
      .map((a) => students.find((s) => s.id === a.student_id))
      .filter(Boolean);

  const assignedStudentIdsFor = (teacherId) =>
    assignments.filter((a) => a.teacher_id === teacherId).map((a) => a.student_id);

  const availableToAssign = selectedTeacher
    ? students.filter((s) => !assignedStudentIdsFor(selectedTeacher.id).includes(s.id))
    : [];

  const addMentee = async () => {
    if (!selectedTeacher || !assignStudentId || saving) return;
    setSaving(true);
    const { error } = await supabase.from("mentor_mentee").insert({
      teacher_id: selectedTeacher.id,
      student_id: assignStudentId,
    });
    setSaving(false);
    if (error) {
      alert(error.message || "Could not assign. Run supabase_migration_mentor_mentee.sql if you haven’t.");
      return;
    }
    setShowAssignModal(false);
    setAssignStudentId("");
    load();
  };

  const removeMentee = async (teacherId, studentId) => {
    if (!window.confirm("Remove this student from the teacher’s mentee list? The teacher will no longer see them.")) return;
    await supabase.from("mentor_mentee").delete().eq("teacher_id", teacherId).eq("student_id", studentId);
    load();
  };

  if (loading) {
    return (
      <DashboardLayout role="admin">
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-indigo-600 border-t-transparent" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="admin">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <UserPlus className="text-indigo-600" size={28} />
            Mentor–Mentee
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Assign students to teachers. Each teacher only sees their assigned mentees in Student Reports and progress.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Teachers list */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
              <h2 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <GraduationCap size={18} /> Teachers
              </h2>
            </div>
            <ul className="divide-y divide-slate-100 dark:divide-slate-800 max-h-[400px] overflow-y-auto">
              {teachers.map((t) => {
                const count = menteesFor(t.id).length;
                const isSelected = selectedTeacher?.id === t.id;
                return (
                  <li key={t.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedTeacher(t)}
                      className={`w-full text-left px-6 py-4 flex items-center justify-between gap-2 transition ${
                        isSelected
                          ? "bg-indigo-50 dark:bg-indigo-900/20 border-l-4 border-indigo-600"
                          : "hover:bg-slate-50 dark:hover:bg-slate-800/50"
                      }`}
                    >
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-900 dark:text-white truncate">{t.full_name || t.email}</p>
                        <p className="text-xs text-slate-500 truncate">{t.email}</p>
                      </div>
                      <span className="shrink-0 text-xs font-bold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                        {count} mentee{count !== 1 ? "s" : ""}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
            {teachers.length === 0 && (
              <div className="px-6 py-8 text-center text-slate-500 dark:text-slate-400 text-sm">No teachers in the system.</div>
            )}
          </div>

          {/* Mentees for selected teacher */}
          <div className="lg:col-span-2 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between flex-wrap gap-2">
              <h2 className="font-bold text-slate-900 dark:text-white">
                {selectedTeacher ? `Mentees of ${selectedTeacher.full_name || selectedTeacher.email}` : "Select a teacher"}
              </h2>
              {selectedTeacher && (
                <button
                  type="button"
                  onClick={() => { setShowAssignModal(true); setAssignStudentId(availableToAssign[0]?.id || ""); }}
                  disabled={availableToAssign.length === 0}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold disabled:opacity-50"
                >
                  <UserPlus size={16} /> Assign mentee
                </button>
              )}
            </div>
            <div className="p-6">
              {!selectedTeacher ? (
                <p className="text-slate-500 dark:text-slate-400 text-sm">Select a teacher from the list to view and manage their mentees.</p>
              ) : (
                <ul className="space-y-2">
                  {menteesFor(selectedTeacher.id).map((s) => (
                    <li
                      key={s.id}
                      className="flex items-center justify-between gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700"
                    >
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-white">{s.full_name || "—"}</p>
                        <p className="text-sm text-slate-500">{s.email}</p>
                        {(s.department || s.year) && (
                          <p className="text-xs text-slate-400 mt-0.5">{[s.department, s.year].filter(Boolean).join(" · ")}</p>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => removeMentee(selectedTeacher.id, s.id)}
                        className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600"
                        title="Remove from mentees"
                      >
                        <Trash2 size={18} />
                      </button>
                    </li>
                  ))}
                  {menteesFor(selectedTeacher.id).length === 0 && (
                    <p className="text-slate-500 dark:text-slate-400 text-sm py-4">No mentees assigned yet. Click “Assign mentee” to add students.</p>
                  )}
                </ul>
              )}
            </div>
          </div>
        </div>

        {/* Assign mentee modal */}
        {showAssignModal && selectedTeacher && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => !saving && setShowAssignModal(false)}>
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 dark:border-slate-700" onClick={(e) => e.stopPropagation()}>
              <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Assign mentee to {selectedTeacher.full_name || selectedTeacher.email}</h3>
                <button type="button" onClick={() => !saving && setShowAssignModal(false)} className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700"><X size={20} /></button>
              </div>
              <div className="p-6">
                {availableToAssign.length === 0 ? (
                  <p className="text-slate-500 dark:text-slate-400">All students are already assigned to this teacher.</p>
                ) : (
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Student</label>
                    <select
                      value={assignStudentId}
                      onChange={(e) => setAssignStudentId(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                    >
                      {availableToAssign.map((s) => (
                        <option key={s.id} value={s.id}>{s.full_name || s.email} ({s.email})</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
              <div className="p-6 border-t border-slate-200 dark:border-slate-700 flex gap-3">
                <button
                  type="button"
                  onClick={addMentee}
                  disabled={saving || !assignStudentId || availableToAssign.length === 0}
                  className="flex-1 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold disabled:opacity-50"
                >
                  {saving ? "Adding…" : "Assign"}
                </button>
                <button type="button" onClick={() => setShowAssignModal(false)} disabled={saving} className="px-5 py-3 rounded-xl border border-slate-200 dark:border-slate-700 font-medium">Cancel</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
