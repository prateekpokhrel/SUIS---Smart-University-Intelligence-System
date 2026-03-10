import React, { useState, useEffect, useRef } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import "./spam.css";

export default function SpamDetection() {
  const [activeTab, setActiveTab] = useState("important");
  const [emails, setEmails] = useState({
    important: [],
    faculty: [],
    events: [],
    spam: [],
    regular: [],
  });

  const [stats, setStats] = useState({});
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastFetch, setLastFetch] = useState(null);

  const BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://127.0.0.1:5000";

  const isFetching = useRef(false);

  const fetchEmails = async (isAutoRefresh = false) => {
    if (isFetching.current) return;

    try {
      isFetching.current = true;
      if (!isAutoRefresh) setLoading(true);
      setError(null);

      const response = await fetch(`${BASE_URL}/api/check-emails`);
      if (!response.ok) throw new Error(`Server error: ${response.status}`);

      const data = await response.json();

      if (data.success) {
        // Display stored & pre-classified emails from backend
        setEmails({
          important: data.important || [],
          faculty: data.faculty || [],
          events: data.events || [],
          spam: data.spam || [],
          regular: data.regular || [],
        });
        setStats(data.stats || {});
        setLastFetch(new Date());
      } else {
        setError(data.error || "Failed to fetch emails");
      }
    } catch (err) {
      setError(`${err.message}. Ensure backend is running at ${BASE_URL}`);
    } finally {
      setLoading(false);
      isFetching.current = false;
    }
  };

  useEffect(() => {
    fetchEmails(false);
    const interval = setInterval(() => fetchEmails(true), 60000);
    return () => clearInterval(interval);
  }, []);

  const tabs = [
    { id: "important", label: "Important"},
    { id: "faculty", label: "Faculty"},
    { id: "events", label: "Events"},
    { id: "regular", label: "Inbox"},
    { id: "spam", label: "Spam (in bin)"},
  ];

  const currentEmails = emails[activeTab] || [];

  return (
    <DashboardLayout role="student">
      <div className="p-6 max-w-7xl mx-auto min-h-screen transition-colors duration-300">
        <h1 className="text-3xl font-bold mb-10 text-slate-900 dark:text-white">Spam Mail Detection</h1>
       
        {/* --- Header Section --- */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
             
                <span> <img
                src="https://www.gstatic.com/images/branding/product/1x/gmail_48dp.png"
                className="w-8 h-8"
                alt="logo"
              /></span>Mailbox
            </h1>

            {lastFetch && (
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 italic">
                Last synchronized: {lastFetch.toLocaleTimeString()}
              </p>
            )}
          </div>

          <button
            onClick={() => fetchEmails(false)}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2.5 
            bg-white dark:bg-slate-900
            border border-slate-200 dark:border-slate-700
            rounded-xl shadow-sm hover:shadow-md 
            transition-all font-semibold 
            text-slate-700 dark:text-slate-200 
            disabled:opacity-50"
          >
            {loading ? "Checking..." : "Refresh Inbox"}
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-2xl flex items-center gap-3
          bg-red-50 text-red-700 border border-red-200
          dark:bg-red-900/20 dark:text-red-200 dark:border-red-800/40">
            <span>⚠️</span> {error}
          </div>
        )}

        {/* --- Main Mail Container --- */}
        <div className="flex flex-col lg:flex-row gap-6 items-start w-full">
          {/* Sidebar Navigation */}
          <aside className="w-full lg:w-64 flex flex-col gap-2 sticky top-4">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setSelectedEmail(null);
                }}
                className={`flex items-center justify-between px-5 py-3.5 rounded-2xl transition-all font-bold text-sm
                ${
                  activeTab === tab.id
                    ? "bg-indigo-600 text-white shadow-lg"
                    : "bg-white text-slate-600 hover:bg-indigo-50 border border-slate-100 shadow-sm dark:bg-slate-900 dark:text-slate-300 dark:border-slate-700 dark:hover:bg-slate-800"
                }`}
              >
                <span className="flex items-center gap-3">
                  <span className="text-lg">{tab.icon}</span> {tab.label}
                </span>

                {stats[tab.id] > 0 && (
                  <span
                    className={`px-2 py-0.5 rounded-lg text-[10px]
                    ${
                      activeTab === tab.id
                        ? "bg-white/20 text-white"
                        : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-300"
                    }`}
                  >
                    {stats[tab.id]}
                  </span>
                )}
              </button>
            ))}
          </aside>

          {/* Content Area */}
          <main className="flex-1 w-full bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 min-h-[500px] max-h-[75vh] overflow-hidden">

            {selectedEmail ? (
              // ✅ Detail View
              <div className="h-full overflow-y-auto p-8 animate-in fade-in slide-in-from-right-4 duration-300">

                <button
                  onClick={() => setSelectedEmail(null)}
                  className="text-indigo-600 dark:text-indigo-400 font-bold text-sm mb-6 flex items-center gap-2 hover:underline"
                >
                  ← Back to {activeTab}
                </button>

                <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-6 leading-tight">
                  {selectedEmail.subject || "(No Subject)"}
                </h2>

                <div className="flex items-center gap-4 mb-8 pb-6 border-b border-slate-100 dark:border-slate-700">
                  <div className="w-12 h-12 bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-300 rounded-full flex items-center justify-center font-bold text-xl uppercase">
                    {(selectedEmail.from_name || selectedEmail.from || "U")[0]}
                  </div>

                  <div>
                    <p className="font-bold text-slate-800 dark:text-white">
                      {selectedEmail.from_name || "Unknown Sender"}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 italic">
                      {selectedEmail.from_email || selectedEmail.from}
                    </p>
                  </div>
                </div>

                <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800 max-h-[45vh] overflow-y-auto">

                  <pre className="whitespace-pre-wrap font-sans text-slate-700 dark:text-slate-200 leading-relaxed text-sm">
                    {selectedEmail.body || "This message has no content."}
                  </pre>
                </div>
              </div>
            ) : (
              // ✅ List View
              <div className="flex flex-col">
                <div className="p-6 border-b flex flex-col gap-1
                border-slate-100 dark:border-slate-700
                bg-slate-50/50 dark:bg-slate-800/50">
                  <h3 className="font-bold text-slate-800 dark:text-white uppercase tracking-wider text-xs">
                    {activeTab === "spam" ? "Spam (moved to bin)" : activeTab} ({currentEmails.length})
                  </h3>
                  {activeTab === "spam" && (
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      These emails were detected as spam and moved to your Gmail Trash. They are listed here for your reference.
                    </p>
                  )}
                </div>

                <div className="divide-y divide-slate-50 dark:divide-slate-700 max-h-[65vh] overflow-y-auto">

                  {loading ? (
                    <div className="flex flex-col items-center justify-center p-20">
                      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mb-4"></div>
                      <p className="text-slate-500 dark:text-slate-300 font-medium">
                        Syncing with you mail servers...
                      </p>
                    </div>
                  ) : currentEmails.length === 0 ? (
                    <div className="p-20 text-center text-slate-400 dark:text-slate-500">
                      <p className="text-5xl mb-4">📫</p>
                      <p className="font-bold italic">No messages found.</p>
                    </div>
                  ) : (
                    currentEmails.map((email, idx) => (
                      <div
                        key={idx}
                        onClick={() => setSelectedEmail(email)}
                        className="group flex items-center gap-4 px-6 py-4 cursor-pointer transition-all border-l-4 border-transparent
                        hover:border-indigo-500
                        hover:bg-indigo-50/30 dark:hover:bg-indigo-500/10"
                      >
                        <div className="min-w-[140px] max-w-[140px] font-bold text-sm truncate text-slate-800 dark:text-slate-200">
                          {email.from_name || email.from}
                        </div>

                        <div className="flex-1 truncate">
                          <span className="text-sm font-bold text-slate-900 dark:text-white">
                            {email.subject || "(No Subject)"}
                          </span>
                          <span className="text-sm text-slate-400 dark:text-slate-400 font-medium ml-2">
                            — {email.body?.substring(0, 80) || "No content"}...
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </DashboardLayout>
  );
}
