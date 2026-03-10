import { useEffect, useMemo, useRef, useState } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import {
  User,
  Mail,
  Phone,
  GraduationCap,
  Camera,
  Bell,
  Shield,
  Paintbrush,
  Save,
  Trash2,
  RotateCcw,
  LogOut,
  EyeOff,
  Eye,
} from "lucide-react";
import { supabase } from "../lib/supabase";
import { getRole, logout as authLogout } from "../utils/auth";

export default function Settings() {
  const role = getRole() || "student";
  const [userId, setUserId] = useState(null);

  // -----------------------------
  // STATES
  // -----------------------------
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");

  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    department: "CSE",
    year: "1st Year",
    bio: "",
    avatar: "", // base64 string
  });

  const [uiPrefs, setUiPrefs] = useState({
    compactMode: localStorage.getItem("compactMode") === "true",
    fontSize: localStorage.getItem("fontSize") || "medium", // small, medium, large
  });

  const [notifications, setNotifications] = useState({
    emailNoti: localStorage.getItem("emailNoti") !== "false",
    pushNoti: localStorage.getItem("pushNoti") === "true",
    spamAlerts: localStorage.getItem("spamAlerts") !== "false",
    importantAlerts: localStorage.getItem("importantAlerts") !== "false",
  });

  const [privacy, setPrivacy] = useState({
    hideEmail: localStorage.getItem("hideEmail") === "true",
    autoLogout: localStorage.getItem("autoLogout") || "30m", // 15m / 30m / 1h / off
  });

  const [readonlyEmail, setReadonlyEmail] = useState(true);

  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success", // success | danger | info
  });

  const fileRef = useRef(null);

  // -----------------------------
  // LOAD INITIAL DATA (from Supabase + localStorage fallback)
  // -----------------------------
  useEffect(() => {
    const loadProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);

      const { data: row } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      if (row) {
        setProfile({
          name: row.full_name || "User",
          email: row.email || user.email || "user@university.edu",
          phone: row.phone || "",
          department: row.department || "CSE",
          year: row.year || "1st Year",
          bio: row.bio || "",
          avatar: row.avatar_url || "",
        });
      } else {
        const savedName = localStorage.getItem("name") || "User";
        const savedEmail = localStorage.getItem("email") || user?.email || "user@university.edu";
        setProfile((p) => ({ ...p, name: savedName, email: savedEmail }));
      }
    };
    loadProfile();
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, []);

  // Apply theme changes
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("theme", theme);
  }, [theme]);

  // -----------------------------
  // UTIL: TOAST
  // -----------------------------
  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast((p) => ({ ...p, show: false })), 2000);
  };

  const toastClasses = useMemo(() => {
    if (toast.type === "success")
      return "bg-emerald-600 text-white";
    if (toast.type === "danger")
      return "bg-rose-600 text-white";
    return "bg-slate-900 text-white";
  }, [toast.type]);

  // -----------------------------
  // HANDLERS
  // -----------------------------
  const handleAvatarUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Basic validation
    if (!file.type.includes("image/")) {
      showToast("Please select an image file.", "danger");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result;
      setProfile((prev) => ({ ...prev, avatar: base64 }));
      showToast("Profile photo updated ✅", "success");
    };
    reader.readAsDataURL(file);
  };

  const saveSettings = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { error } = await supabase.from("profiles").upsert({
        id: user.id,
        email: profile.email,
        full_name: profile.name,
        phone: profile.phone,
        department: profile.department,
        year: profile.year,
        bio: profile.bio,
        avatar_url: profile.avatar || null,
      });
      if (error) {
        showToast("Failed to save profile: " + error.message, "danger");
        return;
      }
    }
    localStorage.setItem("name", profile.name);
    localStorage.setItem("email", profile.email);
    localStorage.setItem("phone", profile.phone);
    localStorage.setItem("department", profile.department);
    localStorage.setItem("year", profile.year);
    localStorage.setItem("bio", profile.bio);
    localStorage.setItem("avatar", profile.avatar);
    localStorage.setItem("compactMode", String(uiPrefs.compactMode));
    localStorage.setItem("fontSize", uiPrefs.fontSize);
    localStorage.setItem("emailNoti", String(notifications.emailNoti));
    localStorage.setItem("pushNoti", String(notifications.pushNoti));
    localStorage.setItem("spamAlerts", String(notifications.spamAlerts));
    localStorage.setItem("importantAlerts", String(notifications.importantAlerts));
    localStorage.setItem("hideEmail", String(privacy.hideEmail));
    localStorage.setItem("autoLogout", privacy.autoLogout);
    showToast("Settings saved successfully", "success");
  };

  const resetProfile = () => {
    setProfile((prev) => ({
      ...prev,
      name: "User",
      email: "user@university.edu",
      phone: "",
      department: "CSE",
      year: "1st Year",
      bio: "",
      avatar: "",
    }));
    showToast("Profile reset done", "info");
  };

  const clearLocalData = () => {
    const keepKeys = ["role"]; // keep role if you want
    const backup = {};
    keepKeys.forEach((k) => (backup[k] = localStorage.getItem(k)));

    localStorage.clear();

    keepKeys.forEach((k) => {
      if (backup[k]) localStorage.setItem(k, backup[k]);
    });

    showToast("Local settings cleared", "info");
    window.location.reload();
  };

  const logout = async () => {
    showToast("Logged out", "info");
    await supabase.auth.signOut();
    authLogout();
    setTimeout(() => {
      window.location.href = "/login";
    }, 700);
  };

  // -----------------------------
  // UI HELPERS
  // -----------------------------
  const cardClass =
    "bg-white dark:bg-slate-900 rounded-2xl shadow-soft border border-slate-100 dark:border-slate-800";

  const labelClass =
    "text-sm font-semibold text-slate-700 dark:text-slate-200";

  const inputClass =
    "w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none border border-transparent focus:border-slate-300 dark:focus:border-slate-600 transition";

  const sectionTitle =
    "flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-white";

  const tiny =
    "text-xs text-slate-500 dark:text-slate-400";

  return (
    <DashboardLayout role={role}>
      {/* Toast */}
      {toast.show && (
        <div className="fixed top-6 right-6 z-50">
          <div className={`px-4 py-3 rounded-xl shadow-lg ${toastClasses}`}>
            {toast.message}
          </div>
        </div>
      )}

      <div
        className={`w-full ${
          uiPrefs.fontSize === "small"
            ? "text-sm"
            : uiPrefs.fontSize === "large"
            ? "text-[15px]"
            : "text-base"
        }`}
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">
              Settings
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">
              Manage your profile, appearance, notifications and privacy.
            </p>
          </div>

          <button
            onClick={saveSettings}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow transition"
          >
            <Save size={18} />
            Save
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT: Profile */}
          <div className={`lg:col-span-2 ${cardClass} p-6`}>
            <div className="flex items-center justify-between">
              <h2 className={sectionTitle}>
                <User size={20} />
                Profile
              </h2>

              <button
                onClick={resetProfile}
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
              >
                <RotateCcw size={16} />
                Reset
              </button>
            </div>

            <div className="mt-5 flex flex-col sm:flex-row gap-5">
              {/* Avatar */}
              <div className="w-full sm:w-[180px]">
                <div className="relative w-[140px] h-[140px] rounded-full overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-xl dark:shadow-black/40">
                  {profile.avatar ? (
                    <img
                    src={profile.avatar}
                    alt="avatar"
                    className="w-full h-full object-cover rounded-full"
                    />

                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-500 dark:text-slate-400">
                      <User size={48} />
                    </div>
                  )}

                  <button
                  onClick={() => fileRef.current?.click()}
                  className="absolute bottom-2 right-2 p-3 rounded-full 
                bg-black/70 text-white hover:bg-black transition 
                  shadow-lg"
                  title="Upload profile photo"
                >
                  <Camera size={16} />
                </button>

                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                  />
                </div>

                <p className={`${tiny} mt-3`}>
                  Upload photo (PNG/JPG). This will be stored in localStorage.
                </p>
              </div>

              {/* Fields */}
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Name */}
                <div className="sm:col-span-1">
                  <label className={labelClass}>Full Name</label>
                  <div className="relative mt-2">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                      <User size={18} />
                    </span>
                    <input
                      className={`${inputClass} pl-11`}
                      value={profile.name}
                      onChange={(e) =>
                        setProfile((p) => ({ ...p, name: e.target.value }))
                      }
                      placeholder="Your name"
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="sm:col-span-1">
                  <div className="flex items-center justify-between">
                    <label className={labelClass}>Email</label>
                    <button
                      onClick={() => setReadonlyEmail((p) => !p)}
                      className="text-xs font-semibold text-emerald-600 hover:text-emerald-700"
                    >
                      {readonlyEmail ? "Edit" : "Lock"}
                    </button>
                  </div>

                  <div className="relative mt-2">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                      <Mail size={18} />
                    </span>
                    <input
                      className={`${inputClass} pl-11 ${
                        readonlyEmail ? "opacity-80" : ""
                      }`}
                      value={privacy.hideEmail ? "••••••••@••••.•••" : profile.email}
                      readOnly={readonlyEmail || privacy.hideEmail}
                      onChange={(e) =>
                        setProfile((p) => ({ ...p, email: e.target.value }))
                      }
                      placeholder="Email"
                    />
                  </div>

                  <p className={`${tiny} mt-2`}>
                    Tip: Turn ON “Hide Email” in privacy if you don’t want to show it.
                  </p>
                </div>

                {/* Phone */}
                <div className="sm:col-span-1">
                  <label className={labelClass}>Phone</label>
                  <div className="relative mt-2">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                      <Phone size={18} />
                    </span>
                    <input
                      className={`${inputClass} pl-11`}
                      value={profile.phone}
                      onChange={(e) =>
                        setProfile((p) => ({ ...p, phone: e.target.value }))
                      }
                      placeholder="98XXXXXXXX"
                    />
                  </div>
                </div>

                {/* Dept */}
                <div className="sm:col-span-1">
                  <label className={labelClass}>Department</label>
                  <div className="relative mt-2">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                      <GraduationCap size={18} />
                    </span>
                    <select
                      className={`${inputClass} pl-11 cursor-pointer`}
                      value={profile.department}
                      onChange={(e) =>
                        setProfile((p) => ({ ...p, department: e.target.value }))
                      }
                    >
                      <option value="CSE">CSE</option>
                      <option value="CSIT">CSIT</option>
                      <option value="IT">IT</option>
                      <option value="ECE">ECE</option>
                      <option value="EEE">EEE</option>
                      <option value="MECH">MECH</option>
                      <option value="CIVIL">CIVIL</option>
                      <option value="MBBS">MBBS</option>
                      <option value="BBA">BBA</option>
                      <option value="MBA">MBA</option>
                      <option value="LAW">LAW</option>
                    </select>
                  </div>
                </div>

                {/* Year */}
                <div className="sm:col-span-1">
                  <label className={labelClass}>Year / Semester</label>
                  <select
                    className={`${inputClass} mt-2 cursor-pointer`}
                    value={profile.year}
                    onChange={(e) =>
                      setProfile((p) => ({ ...p, year: e.target.value }))
                    }
                  >
                    <option>1st Year</option>
                    <option>2nd Year</option>
                    <option>3rd Year</option>
                    <option>4th Year</option>
                    <option>5th Year</option>
                  </select>
                </div>

                {/* Bio */}
                <div className="sm:col-span-2">
                  <label className={labelClass}>Bio</label>
                  <textarea
                    className={`${inputClass} mt-2 min-h-[110px] resize-none`}
                    value={profile.bio}
                    onChange={(e) =>
                      setProfile((p) => ({ ...p, bio: e.target.value }))
                    }
                    placeholder="Write something about you..."
                  />
                  <p className={tiny}>
                    Keep it short. This is stored in your browser storage.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: Appearance + Notifications + Privacy */}
          <div className="space-y-6">
            {/* Appearance */}
            <div className={`${cardClass} p-6`}>
              <h2 className={sectionTitle}>
                <Paintbrush size={20} />
                Appearance
              </h2>

              <div className="mt-5 space-y-4">

                {/* Compact */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-slate-800 dark:text-slate-100">
                      Compact Mode
                    </p>
                    <p className={tiny}>
                      Reduce spacing for more content
                    </p>
                  </div>

                  <button
                    onClick={() =>
                      setUiPrefs((p) => ({ ...p, compactMode: !p.compactMode }))
                    }
                    className={`px-4 py-2 rounded-xl font-semibold transition ${
                      uiPrefs.compactMode
                        ? "bg-emerald-600 text-white"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white"
                    }`}
                  >
                    {uiPrefs.compactMode ? "ON" : "OFF"}
                  </button>
                </div>

                {/* Font size */}
                <div>
                  <p className="font-semibold text-slate-800 dark:text-slate-100">
                    Font Size
                  </p>
                  <p className={tiny}>Adjust readability</p>

                  <div className="mt-3 grid grid-cols-3 gap-2">
                    {["small", "medium", "large"].map((size) => (
                      <button
                        key={size}
                        onClick={() => setUiPrefs((p) => ({ ...p, fontSize: size }))}
                        className={`py-2 rounded-xl font-semibold border transition ${
                          uiPrefs.fontSize === size
                            ? "bg-emerald-600 text-white border-emerald-600"
                            : "bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Notifications */}
            <div className={`${cardClass} p-6`}>
              <h2 className={sectionTitle}>
                <Bell size={20} />
                Notifications
              </h2>

              <div className="mt-5 space-y-4">
                <ToggleRow
                  title="Email Notifications"
                  desc="Receive updates in your inbox"
                  value={notifications.emailNoti}
                  onChange={() =>
                    setNotifications((p) => ({ ...p, emailNoti: !p.emailNoti }))
                  }
                />

                <ToggleRow
                  title="Push Notifications"
                  desc="Browser notifications (optional)"
                  value={notifications.pushNoti}
                  onChange={() =>
                    setNotifications((p) => ({ ...p, pushNoti: !p.pushNoti }))
                  }
                />

                <ToggleRow
                  title="Spam Alerts"
                  desc="Notify when spam is detected"
                  value={notifications.spamAlerts}
                  onChange={() =>
                    setNotifications((p) => ({ ...p, spamAlerts: !p.spamAlerts }))
                  }
                />

                <ToggleRow
                  title="Important Mail Alerts"
                  desc="University head mails get priority"
                  value={notifications.importantAlerts}
                  onChange={() =>
                    setNotifications((p) => ({
                      ...p,
                      importantAlerts: !p.importantAlerts,
                    }))
                  }
                />
              </div>
            </div>

            {/* Privacy & Security */}
            <div className={`${cardClass} p-6`}>
              <h2 className={sectionTitle}>
                <Shield size={20} />
                Privacy & Security
              </h2>

              <div className="mt-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-slate-800 dark:text-slate-100">
                      Hide Email
                    </p>
                    <p className={tiny}>Mask your email on UI</p>
                  </div>

                  <button
                    onClick={() =>
                      setPrivacy((p) => ({ ...p, hideEmail: !p.hideEmail }))
                    }
                    className={`px-4 py-2 rounded-xl font-semibold transition flex items-center gap-2 ${
                      privacy.hideEmail
                        ? "bg-emerald-600 text-white"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white"
                    }`}
                  >
                    {privacy.hideEmail ? <EyeOff size={16} /> : <Eye size={16} />}
                    {privacy.hideEmail ? "Hidden" : "Visible"}
                  </button>
                </div>

                <div>
                  <p className="font-semibold text-slate-800 dark:text-slate-100">
                    Auto Logout
                  </p>
                  <p className={tiny}>For safety in lab/shared PC</p>

                  <select
                    className={`${inputClass} mt-2 cursor-pointer`}
                    value={privacy.autoLogout}
                    onChange={(e) =>
                      setPrivacy((p) => ({ ...p, autoLogout: e.target.value }))
                    }
                  >
                    <option value="off">Off</option>
                    <option value="15m">15 minutes</option>
                    <option value="30m">30 minutes</option>
                    <option value="1h">1 hour</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  <button
                    onClick={clearLocalData}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition font-semibold"
                  >
                    <Trash2 size={18} />
                    Clear Local Settings
                  </button>

                  <button
                    onClick={logout}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white transition font-semibold"
                  >
                    <LogOut size={18} />
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Save */}
        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <button
            onClick={saveSettings}
            className="w-full sm:w-auto flex-1 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow transition"
          >
            Save Changes
          </button>

          <button
            onClick={() => showToast("No changes were saved (demo action)", "info")}
            className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition font-semibold"
          >
            Test Toast
          </button>
        </div>

        <p className="mt-4 text-xs text-slate-500 dark:text-slate-400">
          Academic Management System • Settings are stored locally in your browser.
        </p>
      </div>
    </DashboardLayout>
  );
}

/* -----------------------------
   Small Component: Toggle Row
------------------------------ */
function ToggleRow({ title, desc, value, onChange }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="font-semibold text-slate-800 dark:text-slate-100">{title}</p>
        <p className="text-xs text-slate-500 dark:text-slate-400">{desc}</p>
      </div>

      <button
        onClick={onChange}
        className={`px-4 py-2 rounded-xl font-semibold transition ${
          value
            ? "bg-emerald-600 text-white"
            : "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white"
        }`}
      >
        {value ? "ON" : "OFF"}
      </button>
    </div>
  );
}
