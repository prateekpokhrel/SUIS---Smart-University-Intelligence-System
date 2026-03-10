import { useState, useEffect } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import { supabase } from "../../lib/supabase";
import {
  Building2,
  Plus,
  Pencil,
  Trash2,
  Youtube,
  FileText,
  Link as LinkIcon,
  BookOpen,
  X,
} from "lucide-react";

const TYPE_OPTIONS = [
  { value: "youtube", label: "Video (YouTube)", icon: Youtube },
  { value: "video", label: "Video (other)", icon: Youtube },
  { value: "link", label: "Link", icon: LinkIcon },
  { value: "document", label: "Document", icon: BookOpen },
  { value: "notes", label: "Notes", icon: FileText },
];

export default function AdminUniversityResources() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // null | 'add' | { id, ...edit }
  const [form, setForm] = useState({
    career_path: "",
    type: "youtube",
    title: "",
    url: "",
    video_embed_url: "",
    video_duration_sec: "",
    notes_content: "",
    total_pages: "",
  });

  const load = async () => {
    const { data } = await supabase
      .from("university_resources")
      .select("*")
      .order("career_path", { ascending: true, nullsFirst: false })
      .order("created_at", { ascending: false });
    setList(data || []);
  };

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, []);

  const openAdd = () => {
    setForm({ career_path: "", type: "youtube", title: "", url: "", video_embed_url: "", video_duration_sec: "", notes_content: "", total_pages: "" });
    setModal("add");
  };

  const openEdit = (r) => {
    setForm({
      career_path: r.career_path || "",
      type: r.type || "youtube",
      title: r.title || "",
      url: r.url || "",
      video_embed_url: r.video_embed_url || "",
      video_duration_sec: r.video_duration_sec ?? "",
      notes_content: r.notes_content || "",
      total_pages: r.total_pages ?? "",
    });
    setModal({ id: r.id, ...r });
  };

  const save = async () => {
    const payload = {
      career_path: form.career_path.trim() || null,
      type: form.type,
      title: form.title.trim(),
      url: form.url?.trim() || null,
      video_embed_url: form.video_embed_url?.trim() || form.url?.trim() || null,
      video_duration_sec: form.video_duration_sec ? parseInt(form.video_duration_sec, 10) : null,
      notes_content: form.notes_content?.trim() || null,
      total_pages: form.total_pages ? parseInt(form.total_pages, 10) : null,
    };
    if (modal === "add") {
      await supabase.from("university_resources").insert(payload);
    } else if (modal?.id) {
      await supabase.from("university_resources").update(payload).eq("id", modal.id);
    }
    setModal(null);
    load();
  };

  const remove = async (id) => {
    if (!window.confirm("Remove this resource from the university catalog?")) return;
    await supabase.from("university_resources").delete().eq("id", id);
    load();
  };

  const typeIcon = (type) => TYPE_OPTIONS.find((o) => o.value === type)?.icon || FileText;

  return (
    <DashboardLayout role="admin">
      <div className="max-w-5xl mx-auto">
        <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
              <Building2 className="text-violet-600" />
              University Resources
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">
              Suggest videos, links, documents, and notes to students. They appear as &quot;Suggested by University&quot; on the Career Path page.
            </p>
          </div>
          <button onClick={openAdd} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-semibold">
            <Plus size={18} /> Add resource
          </button>
        </header>

        {loading ? (
          <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-10 w-10 border-2 border-violet-600 border-t-transparent" /></div>
        ) : (
          <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500">Type</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500">Title</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500">Career path</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500">Details</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500 w-24">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {list.map((r) => {
                    const Icon = typeIcon(r.type);
                    return (
                      <tr key={r.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-700 dark:text-slate-300">
                            <Icon size={16} className="text-violet-500" /> {r.type}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-semibold text-slate-900 dark:text-white">{r.title}</td>
                        <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{r.career_path || "All"}</td>
                        <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400 max-w-xs truncate">
                          {r.url && <span>URL</span>}
                          {r.video_duration_sec != null && ` · ${Math.floor(r.video_duration_sec / 60)} min`}
                          {r.total_pages != null && ` · ${r.total_pages} pages`}
                          {r.notes_content && " · Notes"}
                        </td>
                        <td className="px-6 py-4 flex items-center gap-2">
                          <button onClick={() => openEdit(r)} className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400"><Pencil size={16} /></button>
                          <button onClick={() => remove(r.id)} className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600"><Trash2 size={16} /></button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {list.length === 0 && (
              <div className="text-center py-12 text-slate-500 dark:text-slate-400">
                No university resources yet. Add one to suggest videos, links, or notes to students.
              </div>
            )}
          </div>
        )}

        {/* Add/Edit modal */}
        {modal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setModal(null)}>
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto border border-slate-200 dark:border-slate-700" onClick={(e) => e.stopPropagation()}>
              <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">{modal === "add" ? "Add university resource" : "Edit resource"}</h3>
                <button onClick={() => setModal(null)} className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700"><X size={20} /></button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Career path (optional)</label>
                  <input type="text" value={form.career_path} onChange={(e) => setForm((f) => ({ ...f, career_path: e.target.value }))} placeholder="e.g. Full Stack Developer" className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Type</label>
                  <select value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))} className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white">
                    {TYPE_OPTIONS.map((o) => (<option key={o.value} value={o.value}>{o.label}</option>))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Title</label>
                  <input type="text" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="Resource title" className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white" />
                </div>
                {(form.type === "youtube" || form.type === "video" || form.type === "link" || form.type === "document") && (
                  <>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">URL</label>
                      <input type="url" value={form.url} onChange={(e) => setForm((f) => ({ ...f, url: e.target.value, video_embed_url: (form.type === "youtube" || form.type === "video") ? e.target.value.replace("watch?v=", "embed/") : f.video_embed_url }))} placeholder="https://..." className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white" />
                    </div>
                    {(form.type === "youtube" || form.type === "video") && (
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Duration (seconds)</label>
                        <input type="number" value={form.video_duration_sec} onChange={(e) => setForm((f) => ({ ...f, video_duration_sec: e.target.value }))} placeholder="e.g. 600" className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white" />
                      </div>
                    )}
                  </>
                )}
                {form.type === "notes" && (
                  <>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Notes content</label>
                      <textarea value={form.notes_content} onChange={(e) => setForm((f) => ({ ...f, notes_content: e.target.value }))} rows={4} placeholder="Paste or type notes..." className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white resize-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Total pages</label>
                      <input type="number" min={1} value={form.total_pages} onChange={(e) => setForm((f) => ({ ...f, total_pages: e.target.value }))} placeholder="e.g. 5" className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white" />
                    </div>
                  </>
                )}
              </div>
              <div className="p-6 border-t border-slate-200 dark:border-slate-700 flex gap-3">
                <button onClick={save} disabled={!form.title.trim()} className="flex-1 py-3 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-semibold disabled:opacity-50">Save</button>
                <button onClick={() => setModal(null)} className="px-5 py-3 rounded-xl border border-slate-200 dark:border-slate-700 font-medium">Cancel</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
