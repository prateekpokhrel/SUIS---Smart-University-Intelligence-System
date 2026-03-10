import { useEffect, useRef, useState } from "react";
import {
  AlertTriangle,
  PhoneCall,
  Clock,
  Mic,
  Camera,
  MapPin,
  CheckCircle2,
  Square,
  Activity,
  History,
  ShieldCheck
} from "lucide-react";
import DashboardLayout from "../../layouts/DashboardLayout";

const API = "http://127.0.0.1:8003";

export default function StudentSEGA() {
  const [category, setCategory] = useState("");
  const [type, setType] = useState("");
  const [explanation, setExplanation] = useState("");
  const [escalateAdmin, setEscalateAdmin] = useState(false);
  const [location, setLocation] = useState(""); // Location state

  const [active, setActive] = useState(null);
  const [timer, setTimer] = useState("00:00");

  const [photo, setPhoto] = useState(null);
  const [audioBlob, setAudioBlob] = useState(null);

  // New state for student dashboard history
  const [myIncidents, setMyIncidents] = useState([]);

  const [recording, setRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const startTimeRef = useRef(null);

  const basicTypes = [
    "Basic Illness",
    "Minor Injury",
    "Women Health Issue",
  ];

  const advancedTypes = [
    "Fight",
    "Fire",
    "Ragging",
    "Earthquake",
    "Harassment",
    "Suspicious Person",
    "Illegal Activity",
  ];

  /* Fetch Student's Incidents */
  const fetchMyIncidents = async () => {
    try {
      const res = await fetch(`${API}/emergency/all`);
      const data = await res.json();
      // Filter only student reports (in a real app, you'd filter by student ID)
      const studentCases = data.filter((i) => i.role === "student");
      setMyIncidents(studentCases);
    } catch (err) {
      console.error("Failed to fetch history", err);
    }
  };

  // Poll for updates every 5 seconds to catch resolutions
  useEffect(() => {
    fetchMyIncidents();
    const interval = setInterval(fetchMyIncidents, 5000);
    return () => clearInterval(interval);
  }, []);

  /* Location Capture */
  const captureLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // Auto-fill the input box with the coordinates
          setLocation(`${position.coords.latitude}, ${position.coords.longitude}`);
        },
        (error) => {
          alert("Could not fetch GPS. Please type your location manually.");
        }
      );
    } else {
      alert("Geolocation is not supported by your browser.");
    }
  };

  /* Voice Record */
  const startRecording = async () => {
    if (recording) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      const chunks = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: "audio/webm" });
        setAudioBlob(blob);
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      setRecording(true);
    } catch (err) {
      alert("Microphone access denied.");
    }
  };

  const stopRecording = () => {
    if (!recording || !mediaRecorderRef.current) return;
    mediaRecorderRef.current.stop();
    setRecording(false);
  };

  /* Trigger */
  const triggerEmergency = async () => {
    if (!category || !type) {
      alert("Select category and type");
      return;
    }

    // Require location (either typed or GPS)
    if (!location.trim()) {
      alert("Please provide a location (type it manually or use Live GPS).");
      return;
    }

    if (category === "Advanced" && escalateAdmin && !explanation) {
      alert("Explanation required for Admin escalation");
      return;
    }

    // stop recording if active
    if (recording) stopRecording();

    const form = new FormData();
    form.append("role", "student");
    form.append("category", category);
    form.append("type", type);
    form.append("route_to", escalateAdmin ? "admin" : "teacher");

    if (explanation) form.append("explanation", explanation);
    if (location) form.append("location", location);
    
    // Explicitly adding filename for backend compatibility
    if (photo) form.append("image", photo, photo.name || "evidence.jpg");
    if (audioBlob) form.append("audio", audioBlob, "report_audio.webm");

    try {
      await fetch(`${API}/emergency/report`, {
        method: "POST",
        body: form
      });

      startTimeRef.current = Date.now();
      setActive({ type, status: "Active", created_at: new Date() });
      
      // Fetch immediately to update dashboard counts
      fetchMyIncidents();

      // Reset evidence fields after successful submission
      setExplanation("");
      setPhoto(null);
      setAudioBlob(null);
      setLocation("");
      setEscalateAdmin(false);
      
    } catch (err) {
      alert("Failed to send emergency report.");
    }
  };

  /* Timer */
  useEffect(() => {
    if (!active) return;

    const interval = setInterval(() => {
      const diff = Date.now() - startTimeRef.current;
      const mins = String(Math.floor(diff / 60000)).padStart(2, "0");
      const secs = String(Math.floor((diff % 60000) / 1000)).padStart(2, "0");
      setTimer(`${mins}:${secs}`);
    }, 1000);

    return () => clearInterval(interval);
  }, [active]);

  /* Calculate Dashboard Stats */
  const totalCount = myIncidents.length;
  const activeCount = myIncidents.filter(i => i.status !== "Resolved").length;
  const resolvedCount = myIncidents.filter(i => i.status === "Resolved").length;

  /* UI */
  return (
    <DashboardLayout role="student">
      <div className="space-y-8 max-w-4xl mx-auto pb-10">

        <div>
          <h1 className="text-3xl font-bold text-red-600">
            SEGA – Structured Emergency Governance Architecture
          </h1>
          <p className="text-slate-500 mt-1">
            One Tap. Instant Protection.
          </p>
        </div>

        {/* STUDENT MINI DASHBOARD */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm text-center flex flex-col items-center justify-center">
            <History className="text-indigo-500 mb-2 opacity-80" size={24} />
            <p className="text-3xl font-black text-indigo-600 dark:text-indigo-400">{totalCount}</p>
            <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400 mt-1">Total Reports</p>
          </div>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm text-center flex flex-col items-center justify-center">
            <Activity className="text-red-500 mb-2 opacity-80" size={24} />
            <p className="text-3xl font-black text-red-500">{activeCount}</p>
            <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400 mt-1">Active Cases</p>
          </div>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm text-center flex flex-col items-center justify-center">
            <ShieldCheck className="text-emerald-500 mb-2 opacity-80" size={24} />
            <p className="text-3xl font-black text-emerald-500">{resolvedCount}</p>
            <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400 mt-1">Resolved</p>
          </div>
        </div>

        {/* ACTIVE INCIDENT TIMER */}
        {active && (
          <div className="bg-red-100 dark:bg-red-900/30 p-6 rounded-xl border border-red-200 dark:border-red-800 shadow-sm animate-pulse mt-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xl font-bold text-red-700 dark:text-red-400">
                  {active.type}
                </p>
                <p className="text-red-600 dark:text-red-300 font-medium mt-1">Status: {active.status}</p>
              </div>
              <div className="flex items-center gap-2 text-2xl font-mono font-bold text-red-600 dark:text-red-400">
                <Clock size={24}/> {timer}
              </div>
            </div>
          </div>
        )}

        {/* FORM */}
        <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border dark:border-slate-800 shadow-sm space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <select
              className="w-full p-4 rounded-xl border dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white focus:ring-2 focus:ring-red-500 outline-none"
              onChange={(e) => setCategory(e.target.value)}
              value={category}
            >
              <option value="">Select Category</option>
              <option value="Basic">Basic (Health/Injury)</option>
              <option value="Advanced">Advanced (Security/Threat)</option>
            </select>

            {category && (
              <select
                className="w-full p-4 rounded-xl border dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white focus:ring-2 focus:ring-red-500 outline-none"
                onChange={(e) => setType(e.target.value)}
                value={type}
              >
                <option value="">Select Specific Type</option>
                {(category === "Basic" ? basicTypes : advancedTypes).map((t, i) => (
                  <option key={i} value={t}>{t}</option>
                ))}
              </select>
            )}
          </div>

          {/* Description Section */}
          <div className="space-y-4 pt-2">
            <textarea
              placeholder="Describe the situation in detail (Optional)..."
              className="w-full p-4 rounded-xl border dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white focus:ring-2 focus:ring-red-500 outline-none resize-none h-28"
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
            />

            {category === "Advanced" && (
              <label className="flex items-center gap-3 text-sm font-semibold p-3 bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 rounded-lg border border-orange-200 dark:border-orange-900/50 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-5 h-5 accent-orange-600"
                  checked={escalateAdmin}
                  onChange={(e) => setEscalateAdmin(e.target.checked)}
                />
                Escalate directly to Admin Center
              </label>
            )}
          </div>

          {/* Location Choice Section */}
          <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <label className="text-sm font-bold text-slate-500 uppercase tracking-wider">
              Location Info <span className="text-red-500">*</span>
            </label>
            <div className="flex flex-col md:flex-row gap-3">
              <input
                type="text"
                placeholder="Type location manually (e.g., Library 2nd Floor)..."
                className="flex-1 p-4 rounded-xl border dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white focus:ring-2 focus:ring-red-500 outline-none"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
              <div className="flex items-center justify-center font-bold text-slate-400 px-2">OR</div>
              <button
                type="button"
                onClick={captureLocation}
                className="flex items-center justify-center gap-2 px-6 py-4 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800/50 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/40 transition whitespace-nowrap font-semibold shadow-sm"
              >
                <MapPin size={20} /> Use Live GPS
              </button>
            </div>
          </div>

          {/* Evidence Toolbar (Just Photo & Audio now) */}
          <div className="flex flex-wrap items-center gap-4 py-4 border-y border-slate-200 dark:border-slate-800">
            {/* CAMERA */}
            <label className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 transition">
              {photo ? <CheckCircle2 size={18} className="text-green-500" /> : <Camera size={18} className="text-indigo-600" />}
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{photo ? "Photo Attached" : "Add Photo"}</span>
              <input type="file" hidden accept="image/*" onChange={(e) => setPhoto(e.target.files[0])} />
            </label>

            {/* VOICE */}
            {!recording ? (
              <button type="button" onClick={startRecording} className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition">
                {audioBlob ? <CheckCircle2 size={18} className="text-green-500" /> : <Mic size={18} className="text-rose-600" />}
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{audioBlob ? "Audio Recorded" : "Record Voice"}</span>
              </button>
            ) : (
              <button type="button" onClick={stopRecording} className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg animate-pulse shadow-md">
                <Square size={14} fill="white" /> <span className="text-sm font-semibold">Stop Recording</span>
              </button>
            )}
          </div>

          {/* Submit Action */}
          <button
            onClick={triggerEmergency}
            className="w-full bg-red-600 hover:bg-red-700 text-white py-4 rounded-xl font-black text-lg flex justify-center items-center gap-3 shadow-lg shadow-red-500/20 active:scale-[0.98] transition-all uppercase tracking-wide"
          >
            <AlertTriangle size={22}/> Trigger Emergency
          </button>
        </div>

        {/* REAL WORKING EMERGENCY CONTACTS */}
        <div>
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">Direct National Hotlines</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <a href="tel:108" className="bg-white dark:bg-slate-900 border dark:border-slate-800 text-slate-800 dark:text-white p-4 rounded-xl text-center flex items-center justify-center gap-2 font-bold hover:border-blue-500 transition-colors shadow-sm">
              <PhoneCall size={16} className="text-blue-600"/> Ambulance (108)
            </a>
            <a href="tel:100" className="bg-white dark:bg-slate-900 border dark:border-slate-800 text-slate-800 dark:text-white p-4 rounded-xl text-center flex items-center justify-center gap-2 font-bold hover:border-blue-500 transition-colors shadow-sm">
              <PhoneCall size={16} className="text-blue-600"/> Police (100)
            </a>
            <a href="tel:101" className="bg-white dark:bg-slate-900 border dark:border-slate-800 text-slate-800 dark:text-white p-4 rounded-xl text-center flex items-center justify-center gap-2 font-bold hover:border-blue-500 transition-colors shadow-sm">
              <PhoneCall size={16} className="text-blue-600"/> Fire (101)
            </a>
            <a href="tel:112" className="bg-white dark:bg-slate-900 border dark:border-slate-800 text-slate-800 dark:text-white p-4 rounded-xl text-center flex items-center justify-center gap-2 font-bold hover:border-blue-500 transition-colors shadow-sm">
              <PhoneCall size={16} className="text-blue-600"/> National (112)
            </a>
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}