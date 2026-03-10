import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../layouts/DashboardLayout";
import { supabase } from "../../lib/supabase";
import {
  Youtube,
  FileText,
  CheckCircle,
  Circle,
  ExternalLink,
  ChevronRight,
  Play,
  Plus,
  Building2,
  Sparkles,
  User,
  Link as LinkIcon,
} from "lucide-react";

const RESOURCES_BY_CAREER = {
  "Full Stack Developer": [
    { type: "youtube", title: "Full Stack Roadmap 2024", url: "https://www.youtube.com/watch?v=RGOj5yH7evk", video_embed_url: "https://www.youtube.com/embed/RGOj5yH7evk", video_duration_sec: 1800 },
    { type: "youtube", title: "React Crash Course", url: "https://www.youtube.com/watch?v=SqcY0GlETpg", video_embed_url: "https://www.youtube.com/embed/SqcY0GlETpg", video_duration_sec: 7200 },
    { type: "notes", title: "Web Dev Basics – Module 1", notes_content: "1. HTML structure and semantics.\n2. CSS layout (Flexbox, Grid).\n3. Responsive design.\n4. JavaScript DOM.\n5. Async and fetch.", total_pages: 5 },
    { type: "course", title: "University Web Dev Module", url: "https://example.com/course" },
  ],
  "Data Scientist": [
    { type: "youtube", title: "Data Science for Beginners", url: "https://www.youtube.com/watch?v=aircAruvnKk", video_embed_url: "https://www.youtube.com/embed/aircAruvnKk", video_duration_sec: 3600 },
    { type: "notes", title: "Statistics & ML – Chapter 1", notes_content: "Probability basics.\nDistributions.\nHypothesis testing.\nRegression intro.", total_pages: 4 },
    { type: "course", title: "Statistics & ML – Core Course", url: null },
  ],
  "Software Engineer": [
    { type: "youtube", title: "DSA & System Design", url: "https://www.youtube.com/watch?v=8hly31xKli0", video_embed_url: "https://www.youtube.com/embed/8hly31xKli0", video_duration_sec: 2400 },
    { type: "notes", title: "DSA Notes – Arrays & Strings", notes_content: "Arrays, 2D arrays.\nStrings, pattern matching.\nTwo pointers, sliding window.", total_pages: 3 },
    { type: "action", title: "Solve 10 problems on LeetCode", url: "https://leetcode.com" },
  ],
  default: [
    { type: "youtube", title: "Career Skills – Your Path", url: "https://www.youtube.com/watch?v=RGOj5yH7evk", video_embed_url: "https://www.youtube.com/embed/RGOj5yH7evk", video_duration_sec: 1200 },
    { type: "notes", title: "Getting Started Notes", notes_content: "Introduction.\nKey concepts.\nNext steps.", total_pages: 3 },
    { type: "course", title: "Relevant course", url: null },
  ],
};

function getResources(careerName) {
  const name = (careerName || "").toLowerCase();
  for (const key of Object.keys(RESOURCES_BY_CAREER)) {
    if (key !== "default" && name.includes(key.toLowerCase())) return RESOURCES_BY_CAREER[key];
  }
  return RESOURCES_BY_CAREER.default;
}

function SourceBadge({ source, compact }) {
  if (!source) return null;
  const cls = compact ? "text-[9px] px-1.5 py-0.5" : "text-[10px] px-2 py-0.5";
  if (source === "admin") return <span className={`inline-flex items-center rounded font-bold uppercase bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300 ${cls}`}><Building2 size={8} /></span>;
  if (source === "system") return <span className={`inline-flex items-center rounded font-bold uppercase bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 ${cls}`}><Sparkles size={8} /></span>;
  if (source === "student") return <span className={`inline-flex items-center rounded font-bold uppercase bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400 ${cls}`}><User size={8} /></span>;
  return null;
}

export default function CareerRecommendations() {
  const navigate = useNavigate();
  const [userId, setUserId] = useState(null);
  const [topCareer, setTopCareer] = useState("");
  const [items, setItems] = useState([]);
  const [universityResources, setUniversityResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState({ type: "video", title: "", url: "", video_embed_url: "", video_duration_sec: "", notes_content: "", total_pages: "" });
  const [addedMessage, setAddedMessage] = useState(null);
  const [selectedId, setSelectedId] = useState(null); // curriculum: which item is open in main pane

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => user && setUserId(user.id));
  }, []);

  useEffect(() => {
    const load = async () => {
      if (!userId) return;
      const { data: pred } = await supabase.from("career_predictions").select("top_career").eq("user_id", userId).order("created_at", { ascending: false }).limit(1).single();
      setTopCareer(pred?.top_career || "");
      const { data: list } = await supabase.from("career_progress_items").select("*").eq("user_id", userId).order("display_order", { ascending: true }).order("created_at", { ascending: false });
      setItems(list || []);
      const { data: allUni } = await supabase.from("university_resources").select("*").order("created_at", { ascending: false });
      const career = pred?.top_career || "";
      setUniversityResources((allUni || []).filter((r) => !r.career_path || r.career_path === career));
      setLoading(false);
    };
    load();
  }, [userId]);

  // Auto-select first item when list loads or changes
  useEffect(() => {
    if (items.length > 0 && !selectedId) setSelectedId(items[0].id);
    if (items.length > 0 && selectedId && !items.some((i) => i.id === selectedId)) setSelectedId(items[0].id);
  }, [items, selectedId]);

  const addSystemResource = async (r) => {
    if (!userId) return;
    const { error } = await supabase.from("career_progress_items").insert({ user_id: userId, type: r.type, title: r.title, url: r.url || null, video_embed_url: r.video_embed_url || null, video_duration_sec: r.video_duration_sec || null, seconds_watched: 0, total_pages: r.total_pages || null, pages_read: 0, notes_content: r.notes_content || null, completed: false, source: "system" });
    if (error) { setAddedMessage({ text: "Could not add.", error: true }); setTimeout(() => setAddedMessage(null), 3000); return; }
    const { data } = await supabase.from("career_progress_items").select("*").eq("user_id", userId).order("created_at", { ascending: false });
    setItems(data || []);
    setAddedMessage({ text: `Added: ${r.title}` }); setTimeout(() => setAddedMessage(null), 2500);
  };

  const addUniversityResource = async (r) => {
    if (!userId) return;
    const { error } = await supabase.from("career_progress_items").insert({ user_id: userId, type: r.type, title: r.title, url: r.url || null, video_embed_url: r.video_embed_url || null, video_duration_sec: r.video_duration_sec || null, seconds_watched: 0, total_pages: r.total_pages || null, pages_read: 0, notes_content: r.notes_content || null, completed: false, source: "admin" });
    if (error) { setAddedMessage({ text: "Could not add.", error: true }); setTimeout(() => setAddedMessage(null), 3000); return; }
    const { data } = await supabase.from("career_progress_items").select("*").eq("user_id", userId).order("created_at", { ascending: false });
    setItems(data || []);
    setAddedMessage({ text: `Added: ${r.title}` }); setTimeout(() => setAddedMessage(null), 2500);
  };

  const addMyResource = async () => {
    if (!userId || !addForm.title.trim()) return;
    const type = addForm.type === "video" ? "youtube" : addForm.type === "doc" ? "document" : addForm.type;
    await supabase.from("career_progress_items").insert({ user_id: userId, type, title: addForm.title.trim(), url: addForm.url?.trim() || null, video_embed_url: addForm.video_embed_url?.trim() || addForm.url?.trim() || null, video_duration_sec: addForm.video_duration_sec ? parseInt(addForm.video_duration_sec, 10) : null, total_pages: addForm.total_pages ? parseInt(addForm.total_pages, 10) : null, pages_read: 0, notes_content: addForm.notes_content?.trim() || null, completed: false, source: "student" });
    setShowAddModal(false);
    setAddForm({ type: "video", title: "", url: "", video_embed_url: "", video_duration_sec: "", notes_content: "", total_pages: "" });
    const { data } = await supabase.from("career_progress_items").select("*").eq("user_id", userId).order("created_at", { ascending: false });
    setItems(data || []);
  };

  const updateProgress = async (id, updates) => {
    await supabase.from("career_progress_items").update(updates).eq("id", id);
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, ...updates } : i)));
  };

  const toggleComplete = async (id) => {
    const item = items.find((i) => i.id === id);
    if (!item) return;
    const completed = !item.completed;
    const updates = { completed };
    if (item.video_duration_sec && completed) updates.seconds_watched = item.video_duration_sec;
    if (item.total_pages != null && completed) updates.pages_read = item.total_pages;
    await updateProgress(id, updates);
  };

  const suggestions = getResources(topCareer);
  const videoItems = items.filter((i) => i.type === "youtube" || i.type === "video");
  const notesItems = items.filter((i) => i.type === "notes");
  const linkDocItems = items.filter((i) => i.type === "link" || i.type === "document" || i.type === "course" || i.type === "action");
  const doneCount = items.filter((i) => i.completed).length;
  const selectedItem = items.find((i) => i.id === selectedId);

  // Curriculum list: one flat list with section headers
  const curriculumSections = [
    { key: "videos", title: "Videos", icon: Youtube, items: videoItems },
    { key: "notes", title: "Reading & Notes", icon: FileText, items: notesItems },
    { key: "links", title: "Links & Documents", icon: LinkIcon, items: linkDocItems },
  ];

  return (
    <DashboardLayout role="student">
      <div className="h-[calc(100vh-4rem)] flex flex-col max-w-7xl mx-auto">
        {/* Compact header */}
        <div className="flex flex-wrap items-center justify-between gap-2 py-3 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3 flex-wrap">
            <button onClick={() => navigate("/student/career")} className="text-xs font-semibold text-indigo-600 hover:underline flex items-center gap-0.5">
              <ChevronRight className="rotate-180" size={14} /> Back
            </button>
            <h1 className="text-lg font-bold text-slate-900 dark:text-white">Career Path & Tracking</h1>
            {topCareer && <span className="text-xs text-slate-500">Path: <span className="font-semibold text-indigo-600">{topCareer}</span></span>}
            {items.length > 0 && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-xs font-semibold">
                <CheckCircle size={12} /> {doneCount}/{items.length}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button onClick={() => setShowAddModal(true)} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-900 text-xs font-semibold hover:bg-slate-700 dark:hover:bg-slate-300">
              <Plus size={14} /> Add resource
            </button>
          </div>
        </div>

        {!topCareer && (
          <div className="p-3 rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-200 text-sm">
            Run <button onClick={() => navigate("/student/career")} className="font-bold underline">Career Prediction</button> first for suggestions.
          </div>
        )}

        {/* Suggestions: compact one row */}
        {topCareer && (universityResources.length > 0 || suggestions.length > 0) && (
          <div className="flex flex-wrap items-center gap-2 py-2 border-b border-slate-100 dark:border-slate-800">
            {universityResources.length > 0 && (
              <span className="text-xs text-slate-500 mr-1">University:</span>
            )}
            {universityResources.slice(0, 5).map((r) => (
              <button key={r.id} type="button" onClick={() => addUniversityResource(r)} className="px-2.5 py-1 rounded-md bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 text-xs font-medium hover:bg-violet-200 dark:hover:bg-violet-800/50">
                + {r.title.length > 28 ? r.title.slice(0, 28) + "…" : r.title}
              </button>
            ))}
            {suggestions.length > 0 && <span className="text-xs text-slate-400 mx-1">|</span>}
            {suggestions.slice(0, 4).map((s, idx) => (
              <button key={idx} type="button" onClick={() => addSystemResource(s)} className="px-2.5 py-1 rounded-md bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-xs font-medium hover:bg-indigo-200 dark:hover:bg-indigo-800/50">
                + {s.title.length > 24 ? s.title.slice(0, 24) + "…" : s.title}
              </button>
            ))}
          </div>
        )}

        {addedMessage && (
          <div className={`fixed bottom-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-lg shadow-lg text-xs font-medium ${addedMessage.error ? "bg-red-100 text-red-800" : "bg-emerald-100 text-emerald-800"}`}>
            {addedMessage.text}
          </div>
        )}

        {loading ? (
          <div className="flex-1 flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-2 border-indigo-600 border-t-transparent" /></div>
        ) : items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-500 dark:text-slate-400 text-center px-4">
            <Play size={40} className="mb-2 opacity-50" />
            <p className="font-medium text-sm">No resources yet.</p>
            <p className="text-xs mt-1">Add suggestions above or add your own resource.</p>
          </div>
        ) : (
          <div className="flex-1 flex min-h-0">
            {/* Left: curriculum sidebar (Udemy/Coursera style) */}
            <aside className="w-72 shrink-0 border-r border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 flex flex-col overflow-hidden">
              <div className="flex-1 overflow-y-auto py-2">
                {curriculumSections.filter((s) => s.items.length > 0).map((section) => (
                  <div key={section.key} className="mb-3">
                    <div className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      <section.icon size={14} /> {section.title}
                    </div>
                    {section.items.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setSelectedId(item.id)}
                        className={`w-full text-left flex items-center gap-2 px-3 py-2 border-l-2 transition ${
                          selectedId === item.id
                            ? "border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300"
                            : "border-transparent hover:bg-slate-100 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300"
                        }`}
                      >
                        <span className="shrink-0 mt-0.5">
                          {item.completed ? <CheckCircle size={14} className="text-emerald-500" /> : <Circle size={14} className="text-slate-400" />}
                        </span>
                        <span className="flex-1 min-w-0 truncate text-sm font-medium">{item.title}</span>
                        <SourceBadge source={item.source} compact />
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            </aside>

            {/* Right: content viewer */}
            <main className="flex-1 min-w-0 flex flex-col bg-white dark:bg-slate-900 overflow-hidden">
              {!selectedItem ? (
                <div className="flex-1 flex items-center justify-center text-slate-400 dark:text-slate-500 text-sm">
                  Select an item from the list
                </div>
              ) : (selectedItem.type === "youtube" || selectedItem.type === "video") ? (
                <>
                  <div className="p-3 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-slate-900 dark:text-white text-sm">{selectedItem.title}</span>
                      <SourceBadge source={selectedItem.source} />
                    </div>
                    <button onClick={() => toggleComplete(selectedItem.id)} className="shrink-0 p-1 rounded">
                      {selectedItem.completed ? <CheckCircle size={20} className="text-emerald-500" /> : <Circle size={20} className="text-slate-400" />}
                    </button>
                  </div>
                  <div className="flex-1 min-h-0 flex flex-col p-3">
                    {(selectedItem.video_embed_url || selectedItem.url) ? (
                      <div className="aspect-video max-h-[40vh] w-full rounded-lg overflow-hidden bg-black shrink-0">
                        <iframe
                          title={selectedItem.title}
                          src={(selectedItem.video_embed_url || selectedItem.url).replace("youtube.com/", "youtube-nocookie.com/")}
                          className="w-full h-full"
                          allowFullScreen
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        />
                      </div>
                    ) : null}
                    <div className="mt-2 flex items-center gap-2 flex-wrap">
                      <a href={selectedItem.url || selectedItem.video_embed_url?.replace("/embed/", "/watch?v=") || "#"} target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1">
                        <ExternalLink size={12} /> Open in YouTube
                      </a>
                    </div>
                    {selectedItem.video_duration_sec != null && (
                      <div className="mt-3">
                        <p className="text-xs text-slate-500 mb-1">
                          Watched {Math.floor((selectedItem.seconds_watched || 0) / 60)} / {Math.floor(selectedItem.video_duration_sec / 60)} min
                          ({selectedItem.video_duration_sec ? Math.round(((selectedItem.seconds_watched || 0) / selectedItem.video_duration_sec) * 100) : 0}%)
                        </p>
                        <div className="flex gap-1 flex-wrap">
                          {[0.25, 0.5, 0.75, 1].map((pct) => (
                            <button key={pct} onClick={() => updateProgress(selectedItem.id, { seconds_watched: Math.round(selectedItem.video_duration_sec * pct), completed: pct >= 1 })} className="px-2 py-1 rounded bg-slate-200 dark:bg-slate-700 hover:bg-indigo-200 dark:hover:bg-indigo-800 text-xs font-medium">
                              {pct * 100}%
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : selectedItem.type === "notes" ? (
                <>
                  <div className="p-3 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-900 dark:text-white text-sm">{selectedItem.title}</span>
                      <SourceBadge source={selectedItem.source} />
                    </div>
                    <button onClick={() => toggleComplete(selectedItem.id)} className="shrink-0 p-1 rounded">
                      {selectedItem.completed ? <CheckCircle size={20} className="text-emerald-500" /> : <Circle size={20} className="text-slate-400" />}
                    </button>
                  </div>
                  <div className="flex-1 overflow-y-auto p-3">
                    {selectedItem.notes_content && (
                      <pre className="whitespace-pre-wrap text-sm text-slate-700 dark:text-slate-300 font-sans mb-4">{selectedItem.notes_content}</pre>
                    )}
                    {selectedItem.total_pages != null && (
                      <div>
                        <p className="text-xs text-slate-500 mb-1">Pages read: {selectedItem.pages_read ?? 0} / {selectedItem.total_pages}</p>
                        <div className="flex items-center gap-2">
                          <input type="range" min={0} max={selectedItem.total_pages} value={selectedItem.pages_read ?? 0} onChange={(e) => { const v = parseInt(e.target.value, 10); updateProgress(selectedItem.id, { pages_read: v, completed: v >= selectedItem.total_pages }); }} className="flex-1 h-2 rounded accent-indigo-600" />
                          <span className="text-xs font-semibold w-10">{selectedItem.pages_read ?? 0}/{selectedItem.total_pages}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                /* link / document / course / action */
                <div className="p-4">
                  <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-slate-900 dark:text-white">{selectedItem.title}</span>
                      <SourceBadge source={selectedItem.source} />
                    </div>
                    <button onClick={() => toggleComplete(selectedItem.id)} className="shrink-0 p-1 rounded">
                      {selectedItem.completed ? <CheckCircle size={22} className="text-emerald-500" /> : <Circle size={22} className="text-slate-400" />}
                    </button>
                  </div>
                  {selectedItem.url && (
                    <a href={selectedItem.url} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium">
                      <ExternalLink size={16} /> Open link
                    </a>
                  )}
                </div>
              )}
            </main>
          </div>
        )}

        {/* Add resource modal (unchanged) */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setShowAddModal(false)}>
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto border border-slate-200 dark:border-slate-700" onClick={(e) => e.stopPropagation()}>
              <div className="p-5 border-b border-slate-200 dark:border-slate-700">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Add my resource</h3>
                <p className="text-xs text-slate-500 mt-0.5">Only you and admin see this.</p>
              </div>
              <div className="p-5 space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Type</label>
                  <select value={addForm.type} onChange={(e) => setAddForm((f) => ({ ...f, type: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm">
                    <option value="video">Video</option>
                    <option value="link">Link</option>
                    <option value="doc">Document</option>
                    <option value="notes">Notes</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Title</label>
                  <input type="text" value={addForm.title} onChange={(e) => setAddForm((f) => ({ ...f, title: e.target.value }))} placeholder="e.g. React tutorial" className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm" />
                </div>
                {(addForm.type === "video" || addForm.type === "link" || addForm.type === "doc") && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">{addForm.type === "video" ? "Video URL" : "URL"}</label>
                    <input type="url" value={addForm.type === "video" ? addForm.video_embed_url || addForm.url : addForm.url} onChange={(e) => setAddForm((f) => ({ ...f, url: e.target.value, video_embed_url: addForm.type === "video" ? e.target.value.replace("watch?v=", "embed/") : f.video_embed_url }))} placeholder="https://..." className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm" />
                  </div>
                )}
                {addForm.type === "video" && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Duration (sec, optional)</label>
                    <input type="number" value={addForm.video_duration_sec} onChange={(e) => setAddForm((f) => ({ ...f, video_duration_sec: e.target.value }))} placeholder="600" className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm" />
                  </div>
                )}
                {addForm.type === "notes" && (
                  <>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Notes</label>
                      <textarea value={addForm.notes_content} onChange={(e) => setAddForm((f) => ({ ...f, notes_content: e.target.value }))} rows={3} placeholder="Paste or type notes..." className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm resize-none" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Total pages</label>
                      <input type="number" min={1} value={addForm.total_pages} onChange={(e) => setAddForm((f) => ({ ...f, total_pages: e.target.value }))} placeholder="5" className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm" />
                    </div>
                  </>
                )}
              </div>
              <div className="p-5 border-t border-slate-200 dark:border-slate-700 flex gap-2">
                <button onClick={addMyResource} disabled={!addForm.title.trim()} className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold disabled:opacity-50">Add</button>
                <button onClick={() => setShowAddModal(false)} className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-medium">Cancel</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
