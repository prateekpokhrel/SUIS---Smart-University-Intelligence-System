import { useEffect, useState } from "react";
import {
  ShieldAlert,
  AlertTriangle,
  Send,
  Ban,
  CheckCircle2,
  User,
  Activity,
  FileText,
  Image as ImageIcon,
  Mic,
  Truck,
  MapPin
} from "lucide-react";
import DashboardLayout from "../../layouts/DashboardLayout";

const API = "http://127.0.0.1:8003";

export default function AdminSEGA() {
  const [incidents, setIncidents] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [roleFilter, setRoleFilter] = useState("All");
  
  // State for team selection per incident
  const [selectedTeams, setSelectedTeams] = useState({});

  const teamCategories = [
    "Medical Response", 
    "Security Detail", 
    "Fire Marshall", 
    "Mental Health Support"
  ];

  /* fetch */
  const fetchIncidents = async () => {
    try {
      const res = await fetch(`${API}/emergency/all`);
      const data = await res.json();
      setIncidents(data);
    } catch (err) {
      console.error("Fetch failed", err);
    }
  };

  useEffect(() => {
    fetchIncidents();
    const interval = setInterval(fetchIncidents, 5000);
    return () => clearInterval(interval);
  }, []);

  /* action */
  const dispatchTeam = async (id) => {
    const teamType = selectedTeams[id];
    if (!teamType) return alert("Please select a specific emergency team first.");

    try {
      await fetch(`${API}/emergency/dispatch/${id}`, { 
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ team: teamType })
      });
      alert(`${teamType} has been dispatched for Incident #${id}`);
      fetchIncidents();
    } catch (err) {
      console.error("Dispatch failed", err);
    }
  };

  const banStudent = async (roll) => {
    if (!roll) return alert("Roll number not found.");
    await fetch(`${API}/emergency/ban/${roll}`, { method: "POST" });
    fetchIncidents();
  };

  const resolveIncident = async (id) => {
    try {
      const res = await fetch(`${API}/emergency/resolve/${id}`, { method: "POST" });
      if (res.ok) {
        fetchIncidents();
      }
    } catch (err) {
      console.error("Resolve failed", err);
    }
  };

  /* Helper to format media URLs safely */
  const getMediaUrl = (path) => {
    if (!path) return null;
    const strPath = String(path);
    if (strPath === "null" || strPath === "undefined" || strPath.trim() === "") return null;
    
    if (strPath.startsWith('http') || strPath.startsWith('data:') || strPath.startsWith('blob:')) {
      return strPath;
    }
    return `${API}/${strPath.replace(/^\/+/, '')}`;
  };

  /* ========================================================
    ADMIN VISIBILITY LOGIC 
    Strictly filters out generic cases not meant for admin
    ========================================================
  */
  const adminIncidents = incidents.filter((i) => {
    // 1. Forwarded/Escalated by Teacher (or already dispatched by Admin)
    if (i.status === "Escalated to Admin" || i.status === "Emergency Team Dispatched") return true;

    // 2. Student forwards ADVANCED category directly to admin
    if (i.role === "student" && i.category === "Advanced" && i.route_to === "admin") return true;

    // 3. Teacher reports directly to admin
    if (i.role === "teacher" || String(i.route_to) === "admin" || String(i.is_direct_to_admin) === "true") return true;

    return false;
  });

  /* logic for filtering incidents based on category and role */
  const filteredIncidents = adminIncidents.filter((i) => {
    const categoryMatch = categoryFilter === "All" || i.category === categoryFilter;
    const roleMatch = roleFilter === "All" || i.role === roleFilter;
    return categoryMatch && roleMatch;
  });

  const activeCount = adminIncidents.filter((i) => i.status !== "Resolved").length;
  const criticalCount = adminIncidents.filter(
    (i) => i.category === "Advanced" && i.status !== "Resolved"
  ).length;
  const resolvedCount = adminIncidents.filter((i) => i.status === "Resolved").length;

  /* ui */
  return (
    <DashboardLayout role="admin">
      <div className="space-y-8">

        {/* header terminal */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-900 to-slate-800 rounded-3xl p-8 text-white shadow-2xl">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-extrabold tracking-tight">
                SUIS SEGA - Admin Command Terminal
              </h1>
              <p className="text-slate-300 mt-2">
                Monitor, dispatch, and enforce emergency governance across campus.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-6 text-center">
              <div>
                <p className="text-4xl font-black text-yellow-400">{activeCount}</p>
                <p className="text-xs uppercase tracking-widest text-slate-400">Active</p>
              </div>
              <div>
                <p className="text-4xl font-black text-red-400">{criticalCount}</p>
                <p className="text-xs uppercase tracking-widest text-slate-400">Critical</p>
              </div>
              <div>
                <p className="text-4xl font-black text-emerald-400">{resolvedCount}</p>
                <p className="text-xs uppercase tracking-widest text-slate-400">Resolved</p>
              </div>
            </div>
          </div>

          <div className="flex gap-4 mt-8 flex-wrap">
            {["All", "Basic", "Advanced"].map((f) => (
              <button
                key={f}
                onClick={() => setCategoryFilter(f)}
                className={`px-5 py-2 rounded-xl font-semibold transition ${
                  categoryFilter === f ? "bg-indigo-600 text-white" : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                }`}
              >
                {f}
              </button>
            ))}

            {["All", "student", "teacher"].map((r) => (
              <button
                key={r}
                onClick={() => setRoleFilter(r)}
                className={`px-5 py-2 rounded-xl font-semibold transition ${
                  roleFilter === r ? "bg-rose-600 text-white" : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                }`}
              >
                {r.charAt(0).toUpperCase() + r.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Incident List */}
        {filteredIncidents.length === 0 ? (
          <div className="text-center py-20 text-slate-400 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
            No relevant admin-level incidents active.
          </div>
        ) : (
          filteredIncidents.map((i) => {
            // Aggressive property checking for media/evidence
            const rawImage = i.image_url || i.image_path || i.image || i.photo || i.photo_url || i.picture;
            const rawAudio = i.audio_url || i.audio_path || i.audio || i.voice || i.recording || i.sound;
            const rawLocation = i.location || i.gps || i.coordinates;
            const incidentText = i.explanation || i.description || i.details;

            const incidentImage = getMediaUrl(rawImage);
            const incidentAudio = getMediaUrl(rawAudio);
            const incidentLocation = (rawLocation && rawLocation !== "null" && rawLocation !== "undefined") ? rawLocation : null;

            return (
              <div
                key={i.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-md space-y-4"
              >
                <div className="flex flex-col lg:flex-row justify-between gap-6">
                  
                  {/* Left Column: Details */}
                  <div className="flex-1 space-y-4">
                    <div className="space-y-1">
                      <h2 className="text-xl font-bold flex items-center gap-2 text-slate-900 dark:text-white uppercase tracking-wide">
                        <AlertTriangle
                          className={i.category === "Advanced" ? "text-red-500" : "text-yellow-500"}
                          size={22}
                        />
                        {i.type}
                      </h2>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm text-slate-500 dark:text-slate-400">
                        <span>Category: <span className="font-medium text-slate-700 dark:text-slate-300">{i.category}</span></span>
                        <span className="flex items-center gap-1"><User size={14} /> Role: {i.role} {i.roll_number && `(${i.roll_number})`}</span>
                        <span className={`font-bold ${i.status === 'Resolved' ? 'text-emerald-500' : 'text-indigo-500'}`}>Status: {i.status}</span>
                      </div>
                    </div>

                    {/* Evidence Details Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                      
                      {/* Situation Details & Location */}
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <h3 className="text-sm font-bold flex items-center gap-2 text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                            <FileText size={14} /> Situation Details
                          </h3>
                          <div className="text-sm bg-slate-50 dark:bg-slate-800/80 p-4 rounded-xl text-slate-700 dark:text-slate-300 min-h-[100px]">
                            {incidentText ? (
                              <span>{incidentText}</span>
                            ) : (
                              <span className="italic text-slate-400 dark:text-slate-500">No written explanation provided.</span>
                            )}
                          </div>
                        </div>

                        {/* Location Rendering */}
                        {incidentLocation && (
                          <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-xl border border-blue-100 dark:border-blue-900/50 text-sm">
                            <MapPin size={18} className="shrink-0 mt-0.5" />
                            <div>
                              <span className="font-bold block text-xs uppercase mb-0.5">Location Info</span>
                              {incidentLocation}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Visual & Voice Evidence */}
                      <div className="space-y-6">
                        <div className="space-y-2">
                          <h3 className="text-sm font-bold flex items-center gap-2 text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                            <ImageIcon size={14} /> Visual Evidence
                          </h3>
                          {incidentImage ? (
                            <a href={incidentImage} target="_blank" rel="noreferrer">
                              <img src={incidentImage} alt="Evidence" className="rounded-xl w-full max-h-32 object-cover border border-slate-200 dark:border-slate-700 hover:opacity-90 transition cursor-pointer" />
                            </a>
                          ) : (
                            <div className="text-xs text-slate-400 italic p-2 bg-slate-50 dark:bg-slate-800/50 rounded-lg">No image attached.</div>
                          )}
                        </div>

                        <div className="space-y-2">
                          <h3 className="text-sm font-bold flex items-center gap-2 text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                            <Mic size={14} /> Voice Report
                          </h3>
                          {incidentAudio ? (
                            <audio controls className="w-full h-8 outline-none rounded-md bg-slate-50 dark:bg-transparent">
                              <source src={incidentAudio} type="audio/webm" />
                              <source src={incidentAudio} type="audio/mp3" />
                              <source src={incidentAudio} type="audio/wav" />
                              Your browser does not support audio.
                            </audio>
                          ) : (
                            <div className="text-xs text-slate-400 italic p-2 bg-slate-50 dark:bg-slate-800/50 rounded-lg">No voice recording.</div>
                          )}
                        </div>
                      </div>

                    </div>
                  </div>

                  {/* Right Column: Actions */}
                  <div className="flex flex-col gap-3 min-w-[240px] pt-2 lg:pt-0 lg:border-l lg:pl-6 border-slate-100 dark:border-slate-800">
                    <div className="flex flex-col gap-2">
                      <select 
                        disabled={i.status === "Resolved"}
                        value={selectedTeams[i.id] || ""} 
                        onChange={(e) => setSelectedTeams({...selectedTeams, [i.id]: e.target.value})}
                        className="p-2.5 border border-slate-200 dark:border-slate-700 rounded-xl dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-sm outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
                      >
                        <option value="">Select Dispatch Team</option>
                        {teamCategories.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
                      </select>
                      <button
                        disabled={i.status === "Resolved"}
                        onClick={() => dispatchTeam(i.id)}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl flex items-center justify-center gap-2 transition disabled:bg-slate-400 dark:disabled:bg-slate-700 disabled:cursor-not-allowed shadow-md"
                      >
                        <Send size={16} /> Dispatch Team
                      </button>
                    </div>

                    {i.status === "Resolved" ? (
                      <div className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 px-4 py-3 rounded-xl flex items-center justify-center gap-2 font-bold text-sm border border-emerald-200 dark:border-emerald-800/50">
                        <CheckCircle2 size={18} /> Resolved
                      </div>
                    ) : (
                      <button
                        onClick={() => resolveIncident(i.id)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-3 rounded-xl flex items-center justify-center gap-2 transition font-bold text-sm shadow-md"
                      >
                        <CheckCircle2 size={18} /> Mark as Resolved
                      </button>
                    )}

                    {i.role === "student" && (
                      <button
                        onClick={() => banStudent(i.roll_number)}
                        className="bg-slate-900 dark:bg-black hover:bg-slate-800 dark:hover:bg-slate-900 text-white px-4 py-3 border border-slate-700 dark:border-slate-800 rounded-xl flex items-center justify-center gap-2 transition shadow-md mt-auto"
                      >
                        <Ban size={16} /> Ban Student
                      </button>
                    )}
                  </div>

                </div>
              </div>
            );
          })
        )}
      </div>
    </DashboardLayout>
  );
}