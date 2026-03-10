import React, { useMemo, useState, useRef, useEffect } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";

// --- Internal Icons (No dependencies) ---
const IconShield = ({ className }) => <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;
const IconUser = ({ className }) => <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const IconTrash = ({ className }) => <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>;
const IconFlag = ({ className }) => <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>;
const IconChat = ({ className }) => <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>;
const IconX = ({ className }) => <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const IconSend = ({ className }) => <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>;
const IconSearch = ({ className }) => <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
const IconPlus = ({ className }) => <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const IconPhone = ({ className }) => <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>;
const IconPhoneOff = ({ className }) => <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.42 19.42 0 0 1-3.33-2.67m-2.67-3.34a19.79 19.79 0 0 1-3.07-8.63A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91"/><line x1="23" y1="1" x2="1" y2="23"/></svg>;
const IconMic = ({ className }) => <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>;
const IconMicOff = ({ className }) => <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="1" y1="1" x2="23" y2="23"/><path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"/><path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>;
const IconPaperclip = ({ className }) => <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>;
const IconImage = ({ className }) => <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>;

// --- Dummy Data ---
const generateDummyMembers = (count) => {
  return Array.from({ length: Math.min(count, 8) }).map((_, i) => ({
    id: `m-${i}`,
    name: i === 0 ? "Group Admin" : `Student ${i + 100}`,
    role: i === 0 ? "admin" : "member",
    votesToKick: 0,
    avatarColor: ['bg-blue-500', 'bg-purple-500', 'bg-emerald-500', 'bg-orange-500', 'bg-pink-500'][i % 5]
  }));
};

const generateDummyChat = () => [
  { id: 1, user: "Student 101", text: "Hey everyone! When is the next meet?", isAbusive: false, reported: false, time: "10:00 AM" },
  { id: 2, user: "Group Admin", text: "Tomorrow at 5 PM in Room 202. Bring your laptops!", isAbusive: false, reported: false, time: "10:05 AM" },
  { id: 3, user: "Student 104", text: "Click this link for free money!!!", isAbusive: true, reported: false, time: "10:15 AM" },
];

const CATEGORIES = ["All", "Study Group", "Hackathons", "Study Materials", "Events"];

export default function PeerGroups() {
  const [groups, setGroups] = useState([
    {
      id: 1,
      name: "DSA Daily Practice",
      category: "Study Group",
      description: "Daily 1 problem + discussion. Focus on arrays, strings.",
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
      category: "Hackathons",
      description: "Forming a team for hackathons. Need UI/UX contributors.",
      year: "2nd Year",
      section: "B",
      members: 12,
      isJoined: true,
      createdBy: "Student",
      tags: ["Hackathon", "Team", "Projects"],
    },
  ]);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [toasts, setToasts] = useState([]);

  // Filters
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Modals
  const [showCreate, setShowCreate] = useState(false);
  const [activeGroup, setActiveGroup] = useState(null);

  // Forms
  const [formData, setFormData] = useState({
    name: "", category: "", description: "", year: "", section: "", tags: "", isAnonymous: false,
  });

  // Chat/Details Data
  const [groupMembers, setGroupMembers] = useState([]);
  const [groupChat, setGroupChat] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const fileInputRef = useRef(null);

  // Voice Call State
  const [isCallActive, setIsCallActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [callDuration, setCallDuration] = useState(0);

  // --- Helpers ---
  const showToast = (msg, type = "success") => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, msg, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
  };

  const getBadgeColor = (category) => {
    const c = category?.toLowerCase() || "";
    if (c.includes("study")) return "bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-500/10 dark:text-blue-300 dark:border-blue-500/20";
    if (c.includes("hackathon")) return "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/20";
    if (c.includes("event")) return "bg-purple-50 text-purple-600 border-purple-200 dark:bg-purple-500/10 dark:text-purple-300 dark:border-purple-500/20";
    return "bg-slate-50 text-slate-600 border-slate-200 dark:bg-white/5 dark:text-slate-300 dark:border-white/10";
  };

  // --- Logic ---
  const handleCreateGroup = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.category.trim()) return showToast("Name & Category required!", "error");

    const newGroup = {
      id: Date.now(),
      ...formData,
      year: formData.year || "General",
      section: formData.section || "General",
      members: 1,
      isJoined: true,
      createdBy: formData.isAnonymous ? "Anonymous" : (isAdminMode ? "Admin" : "You"),
      tags: formData.tags.split(",").map(t => t.trim()).filter(Boolean).slice(0, 5),
    };

    setGroups([newGroup, ...groups]);
    setShowCreate(false);
    showToast("Group created successfully!");
    setFormData({ name: "", category: "", description: "", year: "", section: "", tags: "", isAnonymous: false });
  };

  const handleJoinToggle = (id) => {
    setGroups(prev => prev.map(g => {
      if (g.id !== id) return g;
      const isJoining = !g.isJoined;
      showToast(isJoining ? "Joined group!" : "Left group.", "info");
      return { ...g, isJoined: isJoining, members: g.members + (isJoining ? 1 : -1) };
    }));
  };

  const handleOpenDetails = (group) => {
    setActiveGroup(group);
    setGroupMembers(generateDummyMembers(group.members));
    setGroupChat(generateDummyChat());
    setIsCallActive(false);
  };

  // --- Chat Logic Enhanced ---

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    setGroupChat([...groupChat, { 
      id: Date.now(), user: "You", text: newMessage, isAbusive: false, reported: false, time: "Just now", type: 'text'
    }]);
    setNewMessage("");
  };

  const handleImageUpload = (e) => {
      const file = e.target.files[0];
      if (file) {
          const reader = new FileReader();
          reader.onloadend = () => {
              setGroupChat(prev => [...prev, {
                  id: Date.now(), user: "You", image: reader.result, isAbusive: false, reported: false, time: "Just now", type: 'image'
              }]);
          };
          reader.readAsDataURL(file);
      }
  };

  const handleReport = (id) => {
    const reason = prompt("Reason for reporting?");
    if (reason) {
      setGroupChat(prev => prev.map(c => c.id === id ? { ...c, reported: true } : c));
      showToast("Report submitted to Admins.", "error");
    }
  };

  const handleKick = (member) => {
     if(isAdminMode) {
         if(window.confirm(`Ban ${member.name}?`)) {
             setGroupMembers(prev => prev.filter(m => m.id !== member.id));
             showToast(`${member.name} has been banned.`, "error");
         }
     } else {
         showToast(`Voted to kick ${member.name}. (1/3)`, "info");
     }
  }

  // --- Voice Call Logic ---
  useEffect(() => {
      let interval;
      if (isCallActive) {
          interval = setInterval(() => setCallDuration(p => p + 1), 1000);
      } else {
          setCallDuration(0);
      }
      return () => clearInterval(interval);
  }, [isCallActive]);

  const formatTime = (s) => {
      const mins = Math.floor(s / 60).toString().padStart(2, '0');
      const secs = (s % 60).toString().padStart(2, '0');
      return `${mins}:${secs}`;
  };

  // Filter Logic
  const filteredGroups = useMemo(() => {
    const s = search.toLowerCase();
    return groups.filter(g => 
      (selectedCategory === "All" || g.category === selectedCategory) &&
      (g.name.toLowerCase().includes(s) || g.description.toLowerCase().includes(s) || g.tags.some(t => t.toLowerCase().includes(s)))
    );
  }, [groups, search, selectedCategory]);

  return (
    <DashboardLayout>
      <div className="min-h-screen p-4 md:p-8 bg-slate-50/50 dark:bg-transparent text-slate-800 dark:text-slate-100 relative">
        
        {/* --- Toast Container --- */}
        <div className="fixed top-20 right-5 z-[60] flex flex-col gap-2 pointer-events-none">
          {toasts.map(t => (
            <div key={t.id} className={`px-4 py-3 rounded-xl shadow-lg border animate-slideIn flex items-center gap-2 text-sm font-medium backdrop-blur-md pointer-events-auto ${
              t.type === 'error' ? 'bg-red-50/90 text-red-600 border-red-100 dark:bg-red-900/50 dark:text-red-200 dark:border-red-800' : 
              t.type === 'info' ? 'bg-blue-50/90 text-blue-600 border-blue-100 dark:bg-blue-900/50 dark:text-blue-200 dark:border-blue-800' : 
              'bg-emerald-50/90 text-emerald-600 border-emerald-100 dark:bg-emerald-900/50 dark:text-emerald-200 dark:border-emerald-800'
            }`}>
              {t.type === 'error' ? <IconFlag className="w-4 h-4"/> : <IconShield className="w-4 h-4"/>}
              {t.msg}
            </div>
          ))}
        </div>

        {/* --- Header & Controls --- */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-8">
          <div>
             <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Peer Groups</h1>
             <p className="text-slate-500 mt-2 dark:text-slate-400">Join study circles, hackathon teams, and event squads.</p>
          </div>

          <div className="flex items-center gap-4">
            {/* Admin Toggle */}
            <div 
              onClick={() => { setIsAdminMode(!isAdminMode); showToast(`Switched to ${!isAdminMode ? 'Admin' : 'Student'} View`, 'info'); }}
              className={`cursor-pointer px-4 py-2 rounded-full flex items-center gap-3 transition-all select-none border ${
                isAdminMode ? 'bg-slate-900 text-white border-slate-900 shadow-lg' : 'bg-white text-slate-600 border-slate-200 dark:bg-white/10 dark:text-white dark:border-white/10'
              }`}
            >
              <span className="text-xs font-bold uppercase tracking-wider">{isAdminMode ? "Admin Mode" : "Student View"}</span>
              <div className={`w-10 h-5 rounded-full relative transition-colors ${isAdminMode ? 'bg-red-500' : 'bg-slate-200 dark:bg-white/20'}`}>
                <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all shadow-sm ${isAdminMode ? 'left-6' : 'left-1'}`} />
              </div>
            </div>

            <button 
              onClick={() => setShowCreate(true)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-medium shadow-lg shadow-emerald-500/20 flex items-center gap-2 transition-transform active:scale-95"
            >
              <IconPlus className="w-5 h-5" /> New Group
            </button>
          </div>
        </div>

        {/* --- Search & Categories --- */}
        <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 p-2 rounded-2xl shadow-sm mb-8 flex flex-col md:flex-row gap-2 backdrop-blur-sm">
            <div className="relative flex-1">
                <IconSearch className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                <input 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Find a group by name or tag..." 
                  className="w-full pl-10 pr-4 py-2.5 bg-transparent outline-none text-slate-700 dark:text-white placeholder:text-slate-400"
                />
            </div>
            <div className="flex items-center gap-1 overflow-x-auto pb-2 md:pb-0 px-2 no-scrollbar">
                {CATEGORIES.map(cat => (
                    <button 
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`whitespace-nowrap px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                          selectedCategory === cat 
                          ? 'bg-slate-900 text-white dark:bg-white dark:text-black' 
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-white/10 dark:text-slate-300 dark:hover:bg-white/20'
                      }`}
                    >
                        {cat}
                    </button>
                ))}
            </div>
        </div>

        {/* --- Grid --- */}
        {filteredGroups.length === 0 ? (
            <div className="text-center py-20 opacity-50">
                <IconUser className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                <h3 className="text-lg font-medium">No groups found</h3>
                <p>Try adjusting your search or create a new one.</p>
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredGroups.map(g => (
                <div key={g.id} className="group bg-white dark:bg-[#0b1220] border border-slate-200 dark:border-white/5 rounded-2xl p-5 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 relative overflow-hidden">
                    <div className={`absolute top-0 left-0 w-full h-1 ${g.category.includes('Study') ? 'bg-blue-500' : 'bg-emerald-500'}`} />
                    
                    <div className="flex justify-between items-start mb-3">
                        <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wide border ${getBadgeColor(g.category)}`}>
                            {g.category}
                        </span>
                        <div className="text-right">
                            <span className="block text-xl font-bold text-slate-800 dark:text-white">{g.members}</span>
                            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Members</span>
                        </div>
                    </div>

                    <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-1 leading-snug">{g.name}</h3>
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-2">
                        {g.year} <span className="w-1 h-1 bg-slate-300 rounded-full"/> {g.section}
                    </p>
                    
                    <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2 mb-4 h-10 leading-relaxed">
                        {g.description}
                    </p>

                    <div className="flex flex-wrap gap-2 mb-5">
                        {g.tags.slice(0, 3).map(tag => (
                            <span key={tag} className="text-[10px] bg-slate-100 dark:bg-white/10 text-slate-500 px-2 py-1 rounded-md">#{tag}</span>
                        ))}
                    </div>

                    <div className="flex items-center gap-3 mt-auto">
                        <button 
                          onClick={() => handleOpenDetails(g)}
                          className="flex-1 bg-slate-50 hover:bg-slate-100 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-slate-200 py-2.5 rounded-xl text-sm font-semibold transition-colors"
                        >
                            View & Chat
                        </button>
                        <button 
                          onClick={() => handleJoinToggle(g.id)}
                          className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-colors ${
                              g.isJoined 
                              ? 'bg-red-50 text-red-600 border border-red-100 hover:bg-red-100 dark:bg-red-500/10 dark:text-red-300 dark:border-red-500/20' 
                              : 'bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-black'
                          }`}
                        >
                            {g.isJoined ? "Leave" : "Join"}
                        </button>
                    </div>
                </div>
            ))}
            </div>
        )}

        {/* --- Create Modal --- */}
        {showCreate && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
                <div className="bg-white dark:bg-[#1a202c] w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-white/10 animate-slideUp">
                    <div className="px-6 py-4 border-b border-slate-100 dark:border-white/5 flex justify-between items-center bg-slate-50/50 dark:bg-white/5">
                        <h2 className="text-lg font-bold text-slate-800 dark:text-white">Start a New Circle</h2>
                        <button onClick={() => setShowCreate(false)} className="text-slate-400 hover:text-slate-600"><IconX className="w-5 h-5"/></button>
                    </div>
                    
                    <form onSubmit={handleCreateGroup} className="p-6 space-y-4">
                        {/* Form Inputs (Same as previous) */}
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Group Name</label>
                            <input 
                                className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 outline-none focus:border-emerald-500 transition-colors" 
                                placeholder="e.g. Finals Prep 2026"
                                value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                            />
                        </div>
                        {/* More inputs omitted for brevity but present in logic... */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Category</label>
                                <input className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 outline-none focus:border-emerald-500 text-sm" placeholder="Study..." value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}/>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Tags</label>
                                <input className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 outline-none focus:border-emerald-500 text-sm" placeholder="Math, React..." value={formData.tags} onChange={e => setFormData({...formData, tags: e.target.value})}/>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Year</label>
                                <input className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 outline-none focus:border-emerald-500 text-sm" placeholder="3rd Year" value={formData.year} onChange={e => setFormData({...formData, year: e.target.value})}/>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Section</label>
                                <input className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 outline-none focus:border-emerald-500 text-sm" placeholder="CS-12" value={formData.section} onChange={e => setFormData({...formData, section: e.target.value})}/>
                            </div>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Description</label>
                            <textarea rows={3} className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 outline-none focus:border-emerald-500 text-sm resize-none" placeholder="What is this group about? rules..." value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}/>
                        </div>

                        <div className="flex items-center gap-3 p-3 bg-blue-50/50 dark:bg-blue-900/10 rounded-xl border border-blue-100 dark:border-blue-800/30">
                            <input type="checkbox" id="anon" className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500" checked={formData.isAnonymous} onChange={e => setFormData({...formData, isAnonymous: e.target.checked})}/>
                            <label htmlFor="anon" className="text-sm font-medium text-slate-700 dark:text-blue-200 cursor-pointer select-none">Post as Anonymous</label>
                        </div>

                        <button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-emerald-500/20 transition-transform active:scale-95">Create & Join Group</button>
                    </form>
                </div>
            </div>
        )}

        {/* --- Details / Chat Modal --- */}
        {activeGroup && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-fadeIn">
                <div className="bg-white dark:bg-[#0f1218] w-full max-w-6xl h-[90vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row border border-slate-200 dark:border-white/5 animate-scaleUp">
                    
                    {/* Sidebar: Group Info & Members */}
                    <div className="w-full md:w-80 bg-slate-50/80 dark:bg-[#13161c] border-r border-slate-200 dark:border-white/5 flex flex-col hidden md:flex">
                        <div className="p-6 border-b border-slate-200 dark:border-white/5">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{activeGroup.name}</h2>
                            <div className="flex flex-wrap gap-2 mb-3">
                                <span className="px-2 py-0.5 rounded bg-white dark:bg-white/10 border border-slate-200 dark:border-white/5 text-[10px] font-bold uppercase dark:text-slate-300">{activeGroup.category}</span>
                            </div>
                            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{activeGroup.description}</p>
                        </div>

                        <div className="p-4 flex-1 overflow-hidden flex flex-col">
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Members ({groupMembers.length})</h3>
                            <div className="space-y-2 overflow-y-auto pr-1">
                                {groupMembers.map(m => (
                                    <div key={m.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-white dark:hover:bg-white/5 hover:shadow-sm transition-all group">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-8 h-8 rounded-full ${m.avatarColor} flex items-center justify-center text-white text-xs font-bold shadow-sm`}>
                                                {m.name[0]}
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{m.name}</p>
                                                <p className="text-[10px] text-slate-400 font-medium uppercase">{m.role}</p>
                                            </div>
                                        </div>
                                        {m.role !== 'admin' && (
                                            <button 
                                                onClick={() => handleKick(m)}
                                                className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-400 hover:text-red-500 transition-opacity"
                                                title={isAdminMode ? "Ban User" : "Vote to Kick"}
                                            >
                                                {isAdminMode ? <IconTrash className="w-4 h-4" /> : <IconUser className="w-4 h-4"/>}
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Chat Area */}
                    <div className="flex-1 flex flex-col bg-slate-100 dark:bg-[#0b0e14] relative">
                        
                        {/* Chat Header */}
                        <div className="h-16 px-6 border-b border-slate-200 dark:border-white/5 flex justify-between items-center bg-white/80 dark:bg-[#0b0e14]/90 backdrop-blur z-20">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-white/10 flex items-center justify-center">
                                    <IconChat className="w-5 h-5 text-slate-500 dark:text-white"/>
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-800 dark:text-white leading-tight">{activeGroup.name}</h3>
                                    <div className="flex items-center gap-1.5">
                                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"/>
                                        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">{groupMembers.length} online</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                                {/* Voice Call Button */}
                                {!isCallActive ? (
                                    <button 
                                        onClick={() => { setIsCallActive(true); showToast("Connected to Voice Channel", "success"); }}
                                        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 transition-colors"
                                    >
                                        <IconPhone className="w-4 h-4" />
                                        <span className="text-xs font-bold hidden sm:block">Join Voice</span>
                                    </button>
                                ) : (
                                    <button 
                                        onClick={() => setIsCallActive(false)}
                                        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors animate-pulse"
                                    >
                                        <IconPhoneOff className="w-4 h-4" />
                                        <span className="text-xs font-bold hidden sm:block">{formatTime(callDuration)}</span>
                                    </button>
                                )}

                                <button onClick={() => setActiveGroup(null)} className="p-2 hover:bg-slate-200 dark:hover:bg-white/10 rounded-full transition-colors text-slate-500">
                                    <IconX className="w-6 h-6"/>
                                </button>
                            </div>
                        </div>

                        {/* Floating Call Widget (If Active) */}
                        {isCallActive && (
                            <div className="absolute top-20 right-6 z-30 bg-white dark:bg-[#1a1f2e] border border-slate-200 dark:border-white/10 shadow-2xl rounded-2xl p-4 w-64 animate-slideIn">
                                <div className="flex justify-between items-center mb-3">
                                    <span className="text-xs font-bold uppercase text-slate-400 tracking-wider">Voice Connected</span>
                                    <span className="text-xs font-mono text-emerald-500">{formatTime(callDuration)}</span>
                                </div>
                                <div className="flex -space-x-2 mb-4 justify-center">
                                    {[0,1,2].map(i => (
                                        <div key={i} className={`w-10 h-10 rounded-full border-2 border-white dark:border-[#1a1f2e] ${['bg-blue-500','bg-purple-500','bg-orange-500'][i]} flex items-center justify-center text-white text-xs font-bold`}>
                                            S{i+1}
                                        </div>
                                    ))}
                                    <div className="w-10 h-10 rounded-full border-2 border-white dark:border-[#1a1f2e] bg-slate-200 dark:bg-white/10 flex items-center justify-center text-xs font-bold">+2</div>
                                </div>
                                <div className="flex justify-center gap-4">
                                    <button 
                                        onClick={() => setIsMuted(!isMuted)}
                                        className={`p-3 rounded-full transition-all ${isMuted ? 'bg-red-500 text-white' : 'bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-200'}`}
                                    >
                                        {isMuted ? <IconMicOff className="w-5 h-5"/> : <IconMic className="w-5 h-5"/>}
                                    </button>
                                    <button 
                                        onClick={() => setIsCallActive(false)}
                                        className="p-3 rounded-full bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all"
                                    >
                                        <IconPhoneOff className="w-5 h-5"/>
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Messages Feed */}
                        <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6">
                            <div className="text-center">
                                <span className="px-3 py-1 rounded-full bg-slate-200 dark:bg-white/5 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Today</span>
                            </div>
                            {groupChat.map(msg => (
                                <div key={msg.id} className={`flex ${msg.user === 'You' ? 'justify-end' : 'justify-start'} animate-fadeIn`}>
                                    <div className={`max-w-[85%] md:max-w-[70%] ${msg.user === 'You' ? 'order-1' : 'order-2'}`}>
                                        <div className={`flex items-end gap-2 ${msg.user === 'You' ? 'flex-row-reverse' : 'flex-row'}`}>
                                            {/* Avatar if not me */}
                                            {msg.user !== 'You' && <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 text-[10px] flex items-center justify-center text-white font-bold mb-1 shadow-md">{msg.user[0]}</div>}
                                            
                                            <div className={`relative px-4 py-3 shadow-sm ${
                                                msg.reported 
                                                ? 'bg-red-50 border border-red-200 text-slate-500 italic rounded-2xl'
                                                : msg.user === 'You' 
                                                    ? 'bg-blue-600 text-white rounded-2xl rounded-tr-sm shadow-blue-500/20' 
                                                    : 'bg-white dark:bg-[#1e2430] border border-slate-100 dark:border-white/5 text-slate-800 dark:text-slate-200 rounded-2xl rounded-tl-sm shadow-sm'
                                            }`}>
                                                {/* Header in bubble */}
                                                {!msg.reported && msg.user !== 'You' && (
                                                    <div className="flex justify-between items-center gap-4 mb-1">
                                                        <span className="text-[10px] font-bold text-indigo-500">{msg.user}</span>
                                                        <button onClick={() => handleReport(msg.id)} className="text-slate-300 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100" title="Report">
                                                            <IconFlag className="w-3 h-3" />
                                                        </button>
                                                    </div>
                                                )}

                                                {/* Content: Text or Image */}
                                                {msg.type === 'image' ? (
                                                    <img src={msg.image} alt="uploaded" className="max-w-full h-auto rounded-lg mb-1 border-2 border-white/20" />
                                                ) : (
                                                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.reported ? "This message has been flagged for review." : msg.text}</p>
                                                )}
                                                
                                                <div className={`text-[9px] mt-1 text-right ${msg.user === 'You' ? 'text-blue-200' : 'text-slate-400'}`}>
                                                    {msg.time}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Input Area */}
                        <div className="p-4 md:p-6 border-t border-slate-200 dark:border-white/5 bg-white dark:bg-[#0b0e14]">
                            <form onSubmit={handleSendMessage} className="flex gap-3 items-end">
                                {/* Hidden File Input */}
                                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload}/>
                                
                                <button 
                                    type="button" 
                                    onClick={() => fileInputRef.current?.click()}
                                    className="p-3 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                                >
                                    <IconPaperclip className="w-5 h-5"/>
                                </button>
                                <button 
                                    type="button" 
                                    onClick={() => fileInputRef.current?.click()}
                                    className="p-3 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors hidden sm:block"
                                >
                                    <IconImage className="w-5 h-5"/>
                                </button>

                                <div className="flex-1 bg-slate-100 dark:bg-white/5 rounded-2xl flex items-center px-4 border border-transparent focus-within:border-blue-500 transition-all">
                                    <input 
                                        className="flex-1 bg-transparent py-3 outline-none text-sm text-slate-800 dark:text-white placeholder:text-slate-400" 
                                        placeholder="Type a message..."
                                        value={newMessage}
                                        onChange={e => setNewMessage(e.target.value)}
                                    />
                                </div>
                                
                                <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-xl transition-colors shadow-lg shadow-blue-500/30 active:scale-95">
                                    <IconSend className="w-5 h-5" />
                                </button>
                            </form>
                        </div>
                    </div>

                </div>
            </div>
        )}

      </div>
      
      {/* CSS for animations */}
      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes scaleUp { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        @keyframes slideIn { from { transform: translateX(20px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        .animate-slideUp { animation: slideUp 0.3s ease-out; }
        .animate-fadeIn { animation: fadeIn 0.2s ease-out; }
        .animate-scaleUp { animation: scaleUp 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
        .animate-slideIn { animation: slideIn 0.3s ease-out; }
      `}</style>
    </DashboardLayout>
  );
}