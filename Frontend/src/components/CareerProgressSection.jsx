import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { CheckCircle, Circle, Youtube, BookOpen, ListTodo, ExternalLink, PlayCircle } from "lucide-react";

const SUGGESTIONS_BY_CAREER = {
  "Full Stack Developer": [
    { type: "youtube", title: "Full Stack Roadmap 2024", url: "https://www.youtube.com/results?search_query=full+stack+developer+roadmap" },
    { type: "course", title: "Web Dev – University Module", url: null },
    { type: "action", title: "Build a small CRUD project", url: null },
  ],
  "Data Scientist": [
    { type: "youtube", title: "Data Science for Beginners", url: "https://www.youtube.com/results?search_query=data+science+for+beginners" },
    { type: "course", title: "Statistics & ML – Core Course", url: null },
    { type: "action", title: "Complete one Kaggle dataset", url: null },
  ],
  "Software Engineer": [
    { type: "youtube", title: "DSA & System Design", url: "https://www.youtube.com/results?search_query=system+design+interview" },
    { type: "course", title: "DSA – University / Online", url: null },
    { type: "action", title: "Solve 10 problems on LeetCode", url: null },
  ],
  default: [
    { type: "youtube", title: "Career skills for your path", url: "https://www.youtube.com" },
    { type: "course", title: "Relevant university course", url: null },
    { type: "action", title: "One actionable goal this week", url: null },
  ],
};

function getSuggestions(topCareerName) {
  const name = topCareerName || "";
  for (const key of Object.keys(SUGGESTIONS_BY_CAREER)) {
    if (key !== "default" && name.toLowerCase().includes(key.toLowerCase()))
      return SUGGESTIONS_BY_CAREER[key];
  }
  return SUGGESTIONS_BY_CAREER.default;
}

export default function CareerProgressSection({ topCareerName }) {
  const navigate = useNavigate();
  const [userId, setUserId] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    if (!userId) return;
    const { data } = await supabase
      .from("career_progress_items")
      .select("id, type, title, url, completed")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    setItems(data || []);
    setLoading(false);
  };

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setUserId(user.id);
    });
  }, []);

  useEffect(() => {
    load();
  }, [userId]);

  const toggle = async (id, completed) => {
    await supabase.from("career_progress_items").update({ completed }).eq("id", id);
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, completed } : i)));
  };

  const addSuggestion = async (s) => {
    if (!userId) return;
    await supabase.from("career_progress_items").insert({
      user_id: userId,
      type: s.type,
      title: s.title,
      url: s.url || null,
      completed: false,
    });
    load();
  };

  const suggestions = getSuggestions(topCareerName);
  const done = items.filter((i) => i.completed).length;
  const total = items.length;

  if (loading && items.length === 0) return null;

  return (
    <div className="mt-10 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-2">
        <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <ListTodo className="text-indigo-600" />
          Your career progress
        </h3>
        <div className="flex items-center gap-3">
          {total > 0 && (
            <span className="text-sm font-semibold text-indigo-600">
              {done}/{total} completed
            </span>
          )}
          <button
            onClick={() => navigate("/student/career-path")}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold"
          >
            <PlayCircle size={18} /> Videos & tracking
          </button>
        </div>
      </div>

      {items.length === 0 ? (
        <p className="text-slate-500 dark:text-slate-400 text-sm mb-4">
          Get career recommendations above, then add tasks and track progress here. Teachers and admin can see your progress.
        </p>
      ) : (
        <ul className="space-y-3 mb-6">
          {items.map((i) => (
            <li
              key={i.id}
              className={`flex items-center gap-3 p-3 rounded-xl border ${
                i.completed ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800" : "bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700"
              }`}
            >
              <button
                type="button"
                onClick={() => toggle(i.id, !i.completed)}
                className="shrink-0 text-slate-400 hover:text-indigo-600"
              >
                {i.completed ? <CheckCircle size={22} className="text-emerald-500" /> : <Circle size={22} />}
              </button>
              <span className="shrink-0">
                {i.type === "youtube" && <Youtube size={18} className="text-red-500" />}
                {i.type === "course" && <BookOpen size={18} className="text-indigo-500" />}
                {i.type === "action" && <ListTodo size={18} className="text-amber-500" />}
              </span>
              <span className={`flex-1 text-sm font-medium ${i.completed ? "line-through text-slate-500" : "text-slate-800 dark:text-white"}`}>
                {i.title}
              </span>
              {i.url && (
                <a href={i.url} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">
                  <ExternalLink size={14} />
                </a>
              )}
            </li>
          ))}
        </ul>
      )}

      {topCareerName && (
        <div>
          <p className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-2">Suggested for you ({topCareerName})</p>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((s, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => addSuggestion(s)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 text-slate-700 dark:text-slate-200 text-sm font-medium border border-slate-200 dark:border-slate-700"
              >
                + {s.title}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
