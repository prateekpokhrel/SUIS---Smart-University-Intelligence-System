import React, { useMemo, useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";

const GROUP_CATEGORIES = [
  "Study Group",
  "Campus Events",
  "Hackathons / Intercampus",
  "Study Materials (Year/Section)",
  "Mental Wellbeing",
  "General Discussion",
];

const YEARS = ["1st Year", "2nd Year", "3rd Year", "4th Year"];
const SECTIONS = ["A", "B", "C", "D", "E"];

const initialGroups = [
  {
    id: 1,
    name: "DSA Daily Practice",
    category: "Study Group",
    description:
      "Daily 1 problem + discussion. Focus on arrays, strings, recursion, and basics.",
    year: "1st Year",
    section: "A",
    members: 28,
    isJoined: false,
    createdBy: "Student",
    tags: ["DSA", "C", "Problem Solving"],
  },
  {
    id: 2,
    name: "Hackathon Squad - KIIT",
    category: "Hackathons / Intercampus",
    description:
      "Forming a team for hackathons. Need UI/UX, Frontend, Backend, ML contributors.",
    year: "2nd Year",
    section: "B",
    members: 12,
    isJoined: true,
    createdBy: "Student",
    tags: ["Hackathon", "Team", "Projects"],
  },
  {
    id: 3,
    name: "Campus Event Volunteers",
    category: "Campus Events",
    description:
      "Join if you want to participate and help organize campus events and competitions.",
    year: "1st Year",
    section: "C",
    members: 19,
    isJoined: false,
    createdBy: "Student",
    tags: ["Events", "Leadership"],
  },
  {
    id: 4,
    name: "1st Year Notes Sharing - Section A",
    category: "Study Materials (Year/Section)",
    description:
      "Share PDFs, handwritten notes, PPTs, previous year questions and exam tips.",
    year: "1st Year",
    section: "A",
    members: 64,
    isJoined: true,
    createdBy: "Student",
    tags: ["Notes", "PYQ", "Materials"],
  },
  {
    id: 5,
    name: "Mental Wellness & Study Stress",
    category: "Mental Wellbeing",
    description:
      "A safe space to discuss stress, anxiety, motivation, and healthy habits during exams.",
    year: "All",
    section: "All",
    members: 41,
    isJoined: false,
    createdBy: "Student",
    tags: ["Wellbeing", "Support", "Motivation"],
  },
];

function getBadgeColor(category) {
  switch (category) {
    case "Study Group":
      return "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-500/20 dark:text-blue-200 dark:border-blue-400/30";
    case "Campus Events":
      return "bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-500/20 dark:text-purple-200 dark:border-purple-400/30";
    case "Hackathons / Intercampus":
      return "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-200 dark:border-emerald-400/30";
    case "Study Materials (Year/Section)":
      return "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-500/20 dark:text-yellow-200 dark:border-yellow-400/30";
    case "Mental Wellbeing":
      return "bg-pink-100 text-pink-700 border-pink-200 dark:bg-pink-500/20 dark:text-pink-200 dark:border-pink-400/30";
    default:
      return "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-500/20 dark:text-slate-200 dark:border-slate-400/30";
  }
}

export default function PeerGroups() {
  const [groups, setGroups] = useState(initialGroups);

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedYear, setSelectedYear] = useState("All");
  const [selectedSection, setSelectedSection] = useState("All");

  const [showCreate, setShowCreate] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    category: "Study Group",
    description: "",
    year: "1st Year",
    section: "A",
    tags: "",
  });

  const filteredGroups = useMemo(() => {
    const s = search.trim().toLowerCase();

    return groups.filter((g) => {
      const matchesSearch =
        !s ||
        g.name.toLowerCase().includes(s) ||
        g.description.toLowerCase().includes(s) ||
        (g.tags || []).some((t) => t.toLowerCase().includes(s));

      const matchesCategory =
        selectedCategory === "All" || g.category === selectedCategory;

      const matchesYear = selectedYear === "All" || g.year === selectedYear;

      const matchesSection =
        selectedSection === "All" || g.section === selectedSection;

      return matchesSearch && matchesCategory && matchesYear && matchesSection;
    });
  }, [groups, search, selectedCategory, selectedYear, selectedSection]);

  const joinedCount = useMemo(
    () => groups.filter((g) => g.isJoined).length,
    [groups]
  );

  const handleJoinToggle = (groupId) => {
    setGroups((prev) =>
      prev.map((g) => {
        if (g.id !== groupId) return g;
        const joinedNow = !g.isJoined;
        return {
          ...g,
          isJoined: joinedNow,
          members: joinedNow ? g.members + 1 : Math.max(0, g.members - 1),
        };
      })
    );
  };

  const handleCreateGroup = (e) => {
    e.preventDefault();

    if (!formData.name.trim()) return alert("Group name is required!");
    if (!formData.description.trim())
      return alert("Group description is required!");

    const newGroup = {
      id: Date.now(),
      name: formData.name.trim(),
      category: formData.category,
      description: formData.description.trim(),
      year: formData.year,
      section: formData.section,
      members: 1,
      isJoined: true,
      createdBy: "You",
      tags: formData.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean)
        .slice(0, 6),
    };

    setGroups((prev) => [newGroup, ...prev]);
    setShowCreate(false);

    setFormData({
      name: "",
      category: "Study Group",
      description: "",
      year: "1st Year",
      section: "A",
      tags: "",
    });
  };

  return (
    <DashboardLayout>
      {/* ✅ IMPORTANT: Remove text-white from root */}
      <div className="min-h-screen p-4 md:p-6 bg-transparent text-slate-900 dark:text-white">
        {/* Header */}
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold">
              Peer Grouping Formation
            </h1>
            <p className="mt-1 text-slate-600 dark:text-white/60">
              Create and join study groups, hackathon teams, event squads,
              year/section material groups, and wellbeing discussion spaces.
            </p>
          </div>

          <button
            onClick={() => setShowCreate(true)}
            className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white transition shadow-lg shadow-emerald-500/20"
          >
            + Create Group
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-white/5">
            <p className="text-slate-500 dark:text-white/60 text-sm">
              Total Groups
            </p>
            <p className="text-2xl font-semibold mt-1">{groups.length}</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-white/5">
            <p className="text-slate-500 dark:text-white/60 text-sm">
              Groups You Joined
            </p>
            <p className="text-2xl font-semibold mt-1">{joinedCount}</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-white/5">
            <p className="text-slate-500 dark:text-white/60 text-sm">
              Smart Tip
            </p>
            <p className="text-sm mt-2 text-slate-700 dark:text-white/80">
              Join a <b>Study Group</b> + a <b>Materials Group</b> for faster
              growth 🔥
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-white/5">
          <div className="flex flex-col lg:flex-row gap-3 lg:items-center lg:justify-between">
            <div className="flex-1">
              <label className="text-sm text-slate-500 dark:text-white/60">
                Search Groups
              </label>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by group name, tags, description..."
                className="w-full mt-2 px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:border-emerald-400 dark:bg-black/30 dark:border-white/10 dark:focus:border-emerald-400/40"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full lg:w-[60%]">
              <div>
                <label className="text-sm text-slate-500 dark:text-white/60">
                  Category
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full mt-2 px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 outline-none dark:bg-black/30 dark:border-white/10"
                >
                  <option value="All">All</option>
                  {GROUP_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm text-slate-500 dark:text-white/60">
                  Year
                </label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="w-full mt-2 px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 outline-none dark:bg-black/30 dark:border-white/10"
                >
                  <option value="All">All</option>
                  {YEARS.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                  <option value="All">All Years</option>
                </select>
              </div>

              <div>
                <label className="text-sm text-slate-500 dark:text-white/60">
                  Section
                </label>
                <select
                  value={selectedSection}
                  onChange={(e) => setSelectedSection(e.target.value)}
                  className="w-full mt-2 px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 outline-none dark:bg-black/30 dark:border-white/10"
                >
                  <option value="All">All</option>
                  {SECTIONS.map((sec) => (
                    <option key={sec} value={sec}>
                      {sec}
                    </option>
                  ))}
                  <option value="All">All Sections</option>
                </select>
              </div>
            </div>
          </div>

          <p className="text-xs text-slate-500 dark:text-white/50 mt-3">
            Showing <b>{filteredGroups.length}</b> group(s)
          </p>
        </div>

        {/* Group Cards */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredGroups.map((g) => (
            <div
              key={g.id}
              className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm hover:shadow-md transition dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold leading-tight">
                    {g.name}
                  </h2>

                  <div className="flex flex-wrap gap-2 mt-2">
                    <span
                      className={`px-2 py-1 rounded-full border text-xs ${getBadgeColor(
                        g.category
                      )}`}
                    >
                      {g.category}
                    </span>

                    <span className="px-2 py-1 rounded-full border border-slate-200 text-xs text-slate-600 bg-slate-50 dark:border-white/10 dark:text-white/70 dark:bg-black/20">
                      {g.year} • Sec {g.section}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-xs text-slate-500 dark:text-white/50">
                    Members
                  </p>
                  <p className="text-xl font-semibold">{g.members}</p>
                </div>
              </div>

              <p className="text-slate-600 dark:text-white/70 text-sm mt-3 leading-relaxed">
                {g.description}
              </p>

              {g.tags?.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {g.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="text-xs px-2 py-1 rounded-full bg-slate-50 border border-slate-200 text-slate-600 dark:bg-black/30 dark:border-white/10 dark:text-white/60"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              <div className="flex items-center justify-between mt-4">
                <p className="text-xs text-slate-500 dark:text-white/50">
                  Created by{" "}
                  <span className="text-slate-800 dark:text-white/80">
                    {g.createdBy}
                  </span>
                </p>

                <button
                  onClick={() => handleJoinToggle(g.id)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
                    g.isJoined
                      ? "bg-red-500/10 border border-red-200 text-red-600 hover:bg-red-500/20 dark:bg-red-500/20 dark:border-red-400/30 dark:text-red-200 dark:hover:bg-red-500/30"
                      : "bg-emerald-500/10 border border-emerald-200 text-emerald-700 hover:bg-emerald-500/20 dark:bg-emerald-500/20 dark:border-emerald-400/30 dark:text-emerald-200 dark:hover:bg-emerald-500/30"
                  }`}
                >
                  {g.isJoined ? "Leave" : "Join"}
                </button>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2">
                <button className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 hover:bg-slate-100 transition dark:bg-black/30 dark:border-white/10 dark:text-white/70 dark:hover:bg-white/10">
                  View Details
                </button>
                <button className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 hover:bg-slate-100 transition dark:bg-black/30 dark:border-white/10 dark:text-white/70 dark:hover:bg-white/10">
                  Share Material
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredGroups.length === 0 && (
          <div className="mt-10 text-center text-slate-500 dark:text-white/60">
            <p className="text-lg font-semibold text-slate-700 dark:text-white/70">
              No groups found 😅
            </p>
            <p className="text-sm mt-2">
              Try changing filters or create a new group.
            </p>
          </div>
        )}

        {/* Create Group Modal */}
        {showCreate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <div className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl dark:border-white/10 dark:bg-[#0b1220]">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Create a New Group</h2>
                <button
                  onClick={() => setShowCreate(false)}
                  className="px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 transition dark:bg-white/10 dark:hover:bg-white/20"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateGroup} className="mt-4 space-y-3">
                <div>
                  <label className="text-sm text-slate-500 dark:text-white/60">
                    Group Name
                  </label>
                  <input
                    value={formData.name}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, name: e.target.value }))
                    }
                    placeholder="Eg: DBMS Exam Prep - Section B"
                    className="w-full mt-2 px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:border-emerald-400 dark:bg-black/30 dark:border-white/10 dark:focus:border-emerald-400/40"
                  />
                </div>

                <div>
                  <label className="text-sm text-slate-500 dark:text-white/60">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, category: e.target.value }))
                    }
                    className="w-full mt-2 px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 outline-none dark:bg-black/30 dark:border-white/10"
                  >
                    {GROUP_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm text-slate-500 dark:text-white/60">
                      Year
                    </label>
                    <select
                      value={formData.year}
                      onChange={(e) =>
                        setFormData((p) => ({ ...p, year: e.target.value }))
                      }
                      className="w-full mt-2 px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 outline-none dark:bg-black/30 dark:border-white/10"
                    >
                      {YEARS.map((y) => (
                        <option key={y} value={y}>
                          {y}
                        </option>
                      ))}
                      <option value="All">All Years</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-sm text-slate-500 dark:text-white/60">
                      Section
                    </label>
                    <select
                      value={formData.section}
                      onChange={(e) =>
                        setFormData((p) => ({ ...p, section: e.target.value }))
                      }
                      className="w-full mt-2 px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 outline-none dark:bg-black/30 dark:border-white/10"
                    >
                      {SECTIONS.map((sec) => (
                        <option key={sec} value={sec}>
                          {sec}
                        </option>
                      ))}
                      <option value="All">All Sections</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-sm text-slate-500 dark:text-white/60">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, description: e.target.value }))
                    }
                    rows={3}
                    placeholder="Write what this group is for, rules, and what students will do..."
                    className="w-full mt-2 px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:border-emerald-400 resize-none dark:bg-black/30 dark:border-white/10 dark:focus:border-emerald-400/40"
                  />
                </div>

                <div>
                  <label className="text-sm text-slate-500 dark:text-white/60">
                    Tags (comma separated)
                  </label>
                  <input
                    value={formData.tags}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, tags: e.target.value }))
                    }
                    placeholder="Eg: DSA, Notes, Hackathon, React"
                    className="w-full mt-2 px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:border-emerald-400 dark:bg-black/30 dark:border-white/10 dark:focus:border-emerald-400/40"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowCreate(false)}
                    className="w-1/2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 transition dark:bg-white/10 dark:hover:bg-white/20"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="w-1/2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white transition shadow-lg shadow-emerald-500/20"
                  >
                    Create & Join
                  </button>
                </div>
              </form>

              <p className="text-xs text-slate-500 dark:text-white/40 mt-3">
                ✅ Later you can connect backend: members, chat, shared files, and group rules.
              </p>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
