import { useState } from "react";
import { supabase } from "../lib/supabase";
import { GraduationCap, Heart } from "lucide-react";

export default function StudentOnboarding({ userId, onComplete }) {
  const [cgpa, setCgpa] = useState("");
  const [interests, setInterests] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const cgpaNum = parseFloat(cgpa);
    if (isNaN(cgpaNum) || cgpaNum < 0 || cgpaNum > 10) {
      setError("Please enter a valid CGPA (0–10).");
      return;
    }
    if (!interests.trim()) {
      setError("Please tell us your interests.");
      return;
    }
    setLoading(true);
    try {
      const { error: err } = await supabase
        .from("profiles")
        .update({
          cgpa: cgpaNum,
          interests: interests.trim(),
          onboarding_completed: true,
        })
        .eq("id", userId);
      if (err) throw err;
      onComplete?.();
    } catch (e) {
      setError(e.message || "Failed to save.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-md w-full p-8 border border-slate-200 dark:border-slate-700">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
          Welcome! Tell us a bit about you
        </h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">
          We use this to personalize your career recommendations.
        </p>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
              <GraduationCap size={18} className="text-indigo-600" />
              Current CGPA (0–10)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              max="10"
              value={cgpa}
              onChange={(e) => setCgpa(e.target.value)}
              placeholder="e.g. 8.5"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
              <Heart size={18} className="text-indigo-600" />
              Your interests
            </label>
            <textarea
              value={interests}
              onChange={(e) => setInterests(e.target.value)}
              placeholder="e.g. Machine Learning, Web Development, Research, Startups..."
              rows={4}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
            />
          </div>
          {error && (
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold disabled:opacity-50"
          >
            {loading ? "Saving..." : "Continue"}
          </button>
        </form>
      </div>
    </div>
  );
}
