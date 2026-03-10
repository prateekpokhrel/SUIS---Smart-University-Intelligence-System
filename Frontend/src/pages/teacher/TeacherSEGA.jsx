import { useEffect, useState, useRef } from "react";
import {
  ShieldCheck,
  AlertTriangle,
  User,
  PhoneCall,
  Send,
  CheckCircle2,
  Mic,
  Camera,
  Square,
  ArrowRightCircle,
  FileText,
  Image as ImageIcon,
  Mic2,
  MapPin
} from "lucide-react";
import DashboardLayout from "../../layouts/DashboardLayout";

const API = "http://127.0.0.1:8003";

export default function TeacherSEGA() {
  const [incidents, setIncidents] = useState([]);
  const [filter, setFilter] = useState("All");
  const [selectedTeams, setSelectedTeams] = useState({});

  /* status of self report */
  const [category, setCategory] = useState("");
  const [type, setType] = useState("");
  const [explanation, setExplanation] = useState("");
  const [image, setImage] = useState(null);
  const [audioBlob, setAudioBlob] = useState(null);
  const [recording, setRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const basicTypes = ["Basic Illness", "Minor Injury", "Women Health Issue"];
  const advancedTypes = ["Harassment", "Fight", "Suspicious Activity", "Illegal Activity", "Fire"];
  const teams = ["Medical Team", "Security Team", "Maintenance", "Counselor"];

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

  /* Actions */
  const resolveBasic = async (id) => {
    try {
      const res = await fetch(`${API}/emergency/resolve/${id}`, { method: "POST" });
      if (res.ok) fetchIncidents();
    } catch (err) {
      console.error("Resolve failed", err);
    }
  };

  const forwardToAdmin = async (id) => {
    try {
      const res = await fetch(`${API}/emergency/escalate/${id}`, { method: "POST" });
      if (res.ok) {
        alert(`Incident forwarded to Admin`);
        fetchIncidents();
      }
    } catch (err) {
      console.error("Forward failed", err);
    }
  };

  const dispatchTeam = (id) => {
    const team = selectedTeams[id];
    if (!team) return alert("Please select a team first");
    alert(`${team} dispatched for case ${id}`);
  };

  const triggerSelfEmergency = async () => {
    if (!category || !type) return alert("Please select category and type");
    const form = new FormData();
    form.append("role", "teacher");
    form.append("category", category);
    form.append("type", type);
    form.append("explanation", explanation);
    form.append("is_direct_to_admin", "true");
    if (image) form.append("image", image);
    if (audioBlob) form.append("audio", audioBlob, "report_audio.webm");

    try {
      const response = await fetch(`${API}/emergency/report`, { method: "POST", body: form });
      if (response.ok) {
        alert("Emergency Report Sent Directly to Admin!");
        setCategory(""); setType(""); setExplanation(""); setImage(null); setAudioBlob(null);
        fetchIncidents();
      }
    } catch (error) {
      alert("Error connecting to server.");
    }
  };

  /* Logic for voice record */
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];
      mediaRecorderRef.current.ondataavailable = (e) => { if (e.data.size > 0) audioChunksRef.current.push(e.data); };
      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        setAudioBlob(blob);
      };
      mediaRecorderRef.current.start();
      setRecording(true);
    } catch (err) { alert("Microphone access denied"); }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setRecording(false);
    }
  };

  /* Helper to format media URLs safely - UPDATED to handle Base64 (data:) and Blobs */
  const getMediaUrl = (path) => {
    if (!path) return null;
    const strPath = String(path);
    if (strPath === "null" || strPath === "undefined" || strPath.trim() === "") return null;
    
    // If it's already a full URL, Base64 string, or Blob, return it directly
    if (strPath.startsWith('http') || strPath.startsWith('data:') || strPath.startsWith('blob:')) {
      return strPath;
    }
    
    // Otherwise, append the API URL for relative paths
    return `${API}/${strPath.replace(/^\/+/, '')}`;
  };

  const activeIncidents = incidents.filter((i) => i.status !== "Resolved");
  const filteredIncidents = filter === "All" ? activeIncidents : activeIncidents.filter((i) => i.category === filter);

  return (
    <DashboardLayout role="teacher">
      <div className="space-y-8 max-w-6xl mx-auto pb-10">
        
        {/* Header Section */}
        <section className="bg-gradient-to-r from-slate-900 to-indigo-950 rounded-3xl p-8 text-white shadow-2xl">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Teacher Command Center</h1>
              <p className="text-slate-400 mt-1">Manage active incidents and escalate if necessary.</p>
            </div>
            <div className="text-right bg-white/10 px-6 py-2 rounded-2xl backdrop-blur-md">
              <p className="text-4xl font-black text-red-400">{activeIncidents.length}</p>
              <p className="text-[10px] uppercase tracking-widest text-slate-300">Active Cases</p>
            </div>
          </div>
          <div className="flex gap-2 mt-6">
            {["All", "Basic", "Advanced"].map((f) => (
              <button key={f} onClick={() => setFilter(f)} className={`px-4 py-1.5 rounded-lg text-sm font-medium transition ${filter === f ? "bg-indigo-600 text-white" : "bg-white/5 text-slate-300 hover:bg-white/10"}`}>
                {f}
              </button>
            ))}
          </div>
        </section>

        {/* Incident Cards */}
        <div className="space-y-6">
          {filteredIncidents.length === 0 ? (
            <div className="text-center py-12 bg-slate-50 dark:bg-slate-900/50 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800">
              <p className="text-slate-500">No active incidents reported.</p>
            </div>
          ) : (
            filteredIncidents.map((i) => {
              // ==========================================
              // DEBUG: Check your browser console! (F12)
              // ==========================================
              console.log("INCIDENT DATA FROM BACKEND:", i);

              const rawImage = i.image_url || i.image_path || i.image || i.photo || i.photo_url || i.picture;
              const rawAudio = i.audio_url || i.audio_path || i.audio || i.voice || i.recording || i.sound;
              const rawLocation = i.location || i.gps || i.coordinates;
              const incidentText = i.explanation || i.description || i.details;

              const incidentImage = getMediaUrl(rawImage);
              const incidentAudio = getMediaUrl(rawAudio);
              const incidentLocation = (rawLocation && rawLocation !== "null" && rawLocation !== "undefined") ? rawLocation : null;

              return (
                <div key={i.id} className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm dark:shadow-xl text-slate-800 dark:text-slate-200 transition-all hover:border-slate-300 dark:hover:border-slate-700">
                  <div className="p-6 flex flex-col md:flex-row justify-between gap-6">
                    
                    {/* Left: Details */}
                    <div className="flex-1 space-y-6">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-amber-50 dark:bg-transparent rounded-lg">
                           <AlertTriangle className="text-amber-500 mt-1" size={24} />
                        </div>
                        <div>
                          <h2 className="text-xl font-bold uppercase tracking-wide text-slate-900 dark:text-white">{i.type}</h2>
                          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm text-slate-500 dark:text-slate-400">
                            <span>Category: <span className="font-medium text-slate-700 dark:text-slate-300">{i.category}</span></span>
                            <span className="flex items-center gap-1"><User size={14} /> Role: {i.role}</span>
                            <span className="font-bold text-indigo-600 dark:text-indigo-400">Status: {i.status}</span>
                          </div>
                        </div>
                      </div>

                      {/* Situation Details & Evidence Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* 1. Situation Details & Location */}
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <h4 className="text-xs font-bold uppercase text-slate-500 flex items-center gap-1">
                              <FileText size={14}/> Situation Details
                            </h4>
                            <div className="p-4 bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-700 dark:text-slate-300 min-h-[100px]">
                              {incidentText ? (
                                <span>{incidentText}</span>
                              ) : (
                                <span className="italic text-slate-400 dark:text-slate-500">No written explanation provided.</span>
                              )}
                            </div>
                          </div>

                          {/* DYNAMIC GPS LOCATION DISPLAY */}
                          {incidentLocation && (
                            <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-xl border border-blue-100 dark:border-blue-900/50 text-sm">
                              <MapPin size={18} className="shrink-0 mt-0.5" />
                              <div>
                                <span className="font-bold block text-xs uppercase mb-0.5">GPS Location Attached</span>
                                {incidentLocation}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* 2. Visual & Voice Evidence */}
                        <div className="space-y-6">
                          <div>
                            <h4 className="text-xs font-bold uppercase text-slate-500 flex items-center gap-1 mb-2">
                              <ImageIcon size={14}/> Visual Evidence
                            </h4>
                            {incidentImage ? (
                              <a href={incidentImage} target="_blank" rel="noreferrer">
                                <img 
                                  src={incidentImage} 
                                  alt="Evidence" 
                                  className="w-full max-h-32 object-cover rounded-xl border border-slate-200 dark:border-slate-700 hover:opacity-90 transition-opacity cursor-pointer" 
                                />
                              </a>
                            ) : (
                              <p className="text-xs italic text-slate-400 dark:text-slate-500">No image attached.</p>
                            )}
                          </div>

                          <div>
                            <h4 className="text-xs font-bold uppercase text-slate-500 flex items-center gap-1 mb-2">
                              <Mic2 size={14}/> Voice Report
                            </h4>
                            {incidentAudio ? (
                              <audio controls className="h-8 w-full rounded-md outline-none bg-slate-50 dark:bg-transparent">
                                <source src={incidentAudio} type="audio/webm" />
                                <source src={incidentAudio} type="audio/mp3" />
                                <source src={incidentAudio} type="audio/wav" />
                                Your browser does not support audio.
                              </audio>
                            ) : (
                              <p className="text-xs italic text-slate-400 dark:text-slate-500">No voice recording.</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right Action Column */}
                    <div className="flex flex-col gap-3 min-w-[240px] justify-start">
                      <div className="flex gap-2">
                        <select 
                          onChange={(e) => setSelectedTeams({...selectedTeams, [i.id]: e.target.value})}
                          className="flex-1 p-2 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                          <option value="">Select Team</option>
                          {teams.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                        <button onClick={() => dispatchTeam(i.id)} className="bg-indigo-600 text-white p-2 px-4 rounded-xl hover:bg-indigo-700 transition flex items-center gap-2 font-medium text-sm shadow-md">
                          <Send size={16} /> Dispatch
                        </button>
                      </div>

                      <button onClick={() => resolveBasic(i.id)} className="w-full bg-emerald-600 text-white py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-emerald-700 transition shadow-md">
                        <CheckCircle2 size={18} /> Mark Resolved
                      </button>

                      <button onClick={() => forwardToAdmin(i.id)} className="w-full bg-slate-900 dark:bg-black text-white py-2.5 rounded-xl font-bold border border-slate-700 dark:border-slate-700 flex items-center justify-center gap-2 hover:bg-slate-800 dark:hover:bg-slate-900 transition shadow-md">
                        <ArrowRightCircle size={18} /> Forward to Admin
                      </button>
                    </div>

                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Self Report Form */}
        <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-3xl shadow-xl space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl">
              <ShieldCheck className="text-indigo-600" size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-800 dark:text-white">New Emergency Report</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">Initiate a high-priority alert to the Admin Center.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800 dark:text-slate-200">
              <option value="">Select Category</option>
              <option value="Basic">Basic (Health/Injury)</option>
              <option value="Advanced">Advanced (Security/Danger)</option>
            </select>
            {category && (
              <select value={type} onChange={(e) => setType(e.target.value)} className="w-full p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800 dark:text-slate-200">
                <option value="">Select Specific Type</option>
                {(category === "Basic" ? basicTypes : advancedTypes).map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            )}
          </div>

          <textarea placeholder="Describe the situation in detail..." value={explanation} onChange={(e) => setExplanation(e.target.value)} className="w-full p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-none rounded-2xl h-32 focus:ring-2 focus:ring-indigo-500 outline-none resize-none text-slate-800 dark:text-slate-200" />

          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-200 dark:border-slate-800 pt-6">
            <div className="flex gap-2">
              <label className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-xl cursor-pointer hover:bg-indigo-50 dark:hover:bg-slate-700 transition">
                <Camera size={18} className="text-indigo-600 dark:text-indigo-400" />
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{image ? "Photo Added" : "Add Photo"}</span>
                <input type="file" hidden accept="image/*" onChange={(e) => setImage(e.target.files[0])} />
              </label>

              {!recording ? (
                <button onClick={startRecording} className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-xl hover:bg-rose-50 dark:hover:bg-slate-700 transition text-rose-600 dark:text-rose-400">
                  <Mic size={18} /> <span className="text-sm font-semibold">Voice</span>
                </button>
              ) : (
                <button onClick={stopRecording} className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-xl animate-pulse shadow-md">
                  <Square size={14} fill="white" /> <span className="text-sm font-semibold">Stop</span>
                </button>
              )}
            </div>

            <button onClick={triggerSelfEmergency} className="bg-red-600 hover:bg-red-700 text-white px-10 py-4 rounded-2xl font-black flex items-center gap-3 shadow-lg shadow-red-500/20 active:scale-95 transition-all uppercase tracking-tight">
              <AlertTriangle size={22} /> Trigger Emergency
            </button>
          </div>
        </section>

        {/* Contacts */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: "Ambulance", num: "108", color: "blue" },
            { label: "Police", num: "100", color: "indigo" },
            { label: "Fire Dept", num: "101", color: "orange" }
          ].map((c) => (
            <a key={c.num} href={`tel:${c.num}`} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl flex items-center justify-center gap-3 font-bold text-slate-700 dark:text-slate-300 hover:border-indigo-500 dark:hover:border-indigo-500 transition-colors shadow-sm">
              <PhoneCall size={18} className="text-indigo-600 dark:text-indigo-400" /> {c.label} ({c.num})
            </a>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}