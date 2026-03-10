import { useState, useEffect } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import { supabase } from "../../lib/supabase";
import { Users, CheckCircle, Plus, X, Youtube, FileText, Link as LinkIcon, BookOpen } from "lucide-react";

const SUGGEST_TYPES = [
  { value: "youtube", label: "Video (YouTube)", icon: Youtube },
  { value: "video", label: "Video (other)", icon: Youtube },
  { value: "link", label: "Link", icon: LinkIcon },
  { value: "document", label: "Document", icon: BookOpen },
  { value: "notes", label: "Notes", icon: FileText },
];

export default function AdminStudentsProgress() {
  const [students, setStudents] = useState([]);
  const [progressMap, setProgressMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [suggestFor, setSuggestFor] = useState(null); // { id, full_name, email }
  const [suggestForm, setSuggestForm] = useState({
    type: "youtube",
    title: "",
    url: "",
    video_embed_url: "",
    video_duration_sec: "",
    notes_content: "",
    total_pages: "",
  });
  const [suggestSaving, setSuggestSaving] = useState(false);
  const [suggestDone, setSuggestDone] = useState(false);

  useEffect(() => {
    const load = async () => {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, email, role, cgpa, interests, department, year")
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
        (items || []).forEach((i) => {
          completed[i.user_id] = (completed[i.user_id] || 0) + (i.completed ? 1 : 0);
        });
        const total = {};
        (items || []).forEach((i) => {
          total[i.user_id] = (total[i.user_id] || 0) + 1;
        });
        setProgressMap(
          profiles.reduce((acc, p) => {
            acc[p.id] = {
              completed: completed[p.id] || 0,
              total: total[p.id] || 0,
            };
            return acc;
          }, {})
        );
      }
      setLoading(false);
    };
    load();
  }, []);

  const submitSuggest = async () => {
    if (!suggestFor || !suggestForm.title.trim()) return;
    setSuggestSaving(true);
    const type = suggestForm.type;
    let video_embed_url = null;
    if (type === "youtube" || type === "video") {
      const u = suggestForm.url?.trim();
      if (u) video_embed_url = u.includes("youtube.com/embed/") ? u : u.replace("youtube.com/watch?v=", "youtube.com/embed/").replace("youtu.be/", "youtube.com/embed/");
    }
    const payload = {
      user_id: suggestFor.id,
      type,
      title: suggestForm.title.trim(),
      url: suggestForm.url?.trim() || null,
      video_embed_url: video_embed_url || null,
      video_duration_sec: suggestForm.video_duration_sec ? parseInt(suggestForm.video_duration_sec, 10) : null,
      notes_content: suggestForm.notes_content?.trim() || null,
      total_pages: suggestForm.total_pages ? parseInt(suggestForm.total_pages, 10) : null,
      seconds_watched: 0,
      pages_read: 0,
      completed: false,
      source: "admin",
    };
    const { error } = await supabase.from("career_progress_items").insert(payload);
    setSuggestSaving(false);
    if (error) {
      alert("Could not add suggestion. Ensure RLS allows admin to insert (run supabase_migration_admin_suggest_student.sql).");
      return;
    }
    setSuggestDone(true);
    setProgressMap((prev) => ({
      ...prev,
      [suggestFor.id]: {
        ...prev[suggestFor.id],
        total: (prev[suggestFor.id]?.total || 0) + 1,
      },
    }));
    setTimeout(() => {
      setSuggestFor(null);
      setSuggestDone(false);
      setSuggestForm({ type: "youtube", title: "", url: "", video_embed_url: "", video_duration_sec: "", notes_content: "", total_pages: "" });
    }, 1200);
  };

  return (
    <DashboardLayout role="admin">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
          <Users className="text-indigo-600" />
          Student Progress Reports
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Overview of all students. Suggest videos, links, or notes for any student—they’ll see it under &quot;Suggested by University&quot; on Career Path.
        </p>
      </header>

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
                  <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500">Department</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500">Year</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500">CGPA</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500">Interests</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500">Career progress</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500 w-32">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {students.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                    <td className="px-6 py-4">
                      <p className="font-semibold text-slate-900 dark:text-white">{s.full_name || "—"}</p>
                      <p className="text-xs text-slate-500">{s.email}</p>
                    </td>
                    <td className="px-6 py-4 text-sm">{s.department || "—"}</td>
                    <td className="px-6 py-4 text-sm">{s.year || "—"}</td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-indigo-600">{s.cgpa != null ? s.cgpa : "—"}</span>
                    </td>
                    <td className="px-6 py-4 text-sm max-w-xs truncate">{s.interests || "—"}</td>
                    <td className="px-6 py-4">
                      {progressMap[s.id] ? (
                        <span className="inline-flex items-center gap-1 text-sm">
                          <CheckCircle size={14} className="text-emerald-500" />
                          {progressMap[s.id].completed}/{progressMap[s.id].total} done
                        </span>
                      ) : (
                        <span className="text-slate-400 text-sm">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        type="button"
                        onClick={() => { setSuggestFor({ id: s.id, full_name: s.full_name, email: s.email }); setSuggestForm({ type: "youtube", title: "", url: "", video_embed_url: "", video_duration_sec: "", notes_content: "", total_pages: "" }); setSuggestDone(false); }}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold"
                      >
                        <Plus size={14} /> Suggest resource
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

      {/* Suggest resource for this student modal */}
      {suggestFor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => !suggestSaving && setSuggestFor(null)}>
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto border border-slate-200 dark:border-slate-700" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Suggest resource for {suggestFor.full_name || suggestFor.email}</h3>
              <button type="button" onClick={() => !suggestSaving && setSuggestFor(null)} className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700"><X size={20} /></button>
            </div>
            {suggestDone ? (
              <div className="p-8 text-center">
                <CheckCircle className="mx-auto text-emerald-500 mb-2" size={48} />
                <p className="font-semibold text-slate-800 dark:text-white">Added. The student will see it under &quot;Suggested by University&quot; on Career Path.</p>
              </div>
            ) : (
              <>
                <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Type</label>
                    <select value={suggestForm.type} onChange={(e) => setSuggestForm((f) => ({ ...f, type: e.target.value }))} className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white">
                      {SUGGEST_TYPES.map((o) => (<option key={o.value} value={o.value}>{o.label}</option>))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Title</label>
                    <input type="text" value={suggestForm.title} onChange={(e) => setSuggestForm((f) => ({ ...f, title: e.target.value }))} placeholder="e.g. React basics video" className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white" />
                  </div>
                  {(suggestForm.type === "youtube" || suggestForm.type === "video" || suggestForm.type === "link" || suggestForm.type === "document") && (
                    <>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">URL</label>
                        <input type="url" value={suggestForm.url} onChange={(e) => setSuggestForm((f) => ({ ...f, url: e.target.value }))} placeholder="https://..." className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white" />
                      </div>
                      {(suggestForm.type === "youtube" || suggestForm.type === "video") && (
                        <div>
                          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Duration (seconds, optional)</label>
                          <input type="number" value={suggestForm.video_duration_sec} onChange={(e) => setSuggestForm((f) => ({ ...f, video_duration_sec: e.target.value }))} placeholder="600" className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white" />
                        </div>
                      )}
                    </>
                  )}
                  {suggestForm.type === "notes" && (
                    <>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Notes content</label>
                        <textarea value={suggestForm.notes_content} onChange={(e) => setSuggestForm((f) => ({ ...f, notes_content: e.target.value }))} rows={3} placeholder="Paste or type notes..." className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white resize-none" />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Total pages</label>
                        <input type="number" min={1} value={suggestForm.total_pages} onChange={(e) => setSuggestForm((f) => ({ ...f, total_pages: e.target.value }))} placeholder="5" className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white" />
                      </div>
                    </>
                  )}
                </div>
                <div className="p-6 border-t border-slate-200 dark:border-slate-700 flex gap-3">
                  <button type="button" onClick={submitSuggest} disabled={!suggestForm.title.trim() || suggestSaving} className="flex-1 py-3 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-semibold disabled:opacity-50">
                    {suggestSaving ? "Adding…" : "Add suggestion"}
                  </button>
                  <button type="button" onClick={() => setSuggestFor(null)} disabled={suggestSaving} className="px-5 py-3 rounded-xl border border-slate-200 dark:border-slate-700 font-medium">Cancel</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
