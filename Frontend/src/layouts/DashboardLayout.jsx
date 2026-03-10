import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import TopBar from "../components/TopBar";
import { Clock, CloudSun, Calendar } from "lucide-react";
export default function DashboardLayout({ role, children }) {
  const [time, setTime] = useState(new Date());

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const formattedTime = time.toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
  
  const formattedDate = time.toLocaleDateString([], { 
    weekday: 'short', 
    day: 'numeric', 
    month: 'short' 
  });

  return (
    /**
     * FONT UPDATE: Added 'antialiased' for smoother text rendering 
     * and 'tracking-tight' to give the Inter/Sans font a premium look.
     */
    <div className="flex h-screen w-full overflow-hidden bg-slate-50 dark:bg-slate-950 font-sans antialiased tracking-tight">
      
      {/* SIDEBAR - Fixed width, high contrast */}
      <Sidebar role={role} />
      
      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        
        {/* TOP BAR */}
        <TopBar role={role} />

        {/* UTILITY HEADER (Live Time & Weather) */}
        <div className="px-8 py-2.5 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-6">
            {/* Live Clock */}
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
              <Clock size={14} className="text-indigo-500" />
              <span className="text-[11px] font-bold uppercase tracking-wider">
                {formattedTime}
              </span>
            </div>

            {/* Live Date */}
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
              <Calendar size={14} className="text-indigo-500" />
              <span className="text-[11px] font-bold uppercase tracking-wider">
                {formattedDate}
              </span>
            </div>
          </div>

          {/* Contextual Weather */}
          <div className="hidden sm:flex items-center gap-2 bg-slate-100 dark:bg-slate-800/50 px-3 py-1 rounded-full border border-slate-200/50 dark:border-slate-700/50">
            <CloudSun size={14} className="text-amber-500" />
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
              24°C • Bhubaneswar
            </span>
          </div>
        </div>

        {/* PAGE CONTENT */}
        <main
          className="
            flex-1 overflow-y-auto
            px-8 py-8
            bg-slate-50 dark:bg-slate-950
            text-slate-900 dark:text-slate-100
            selection:bg-indigo-100 selection:text-indigo-700
          "
          role="main"
          aria-label="Main Content"
        >
          {/* ACCESSIBILITY & UTILITY WRAPPER:
              Ensures content is centered on ultra-wide screens and 
              provides a clean container for all interactive tables.
          */}
          <div className="max-w-[1600px] mx-auto focus:outline-none transition-all duration-300">
             {children}
          </div>
        </main>

        {/* ACCESSIBILITY FOOTER */}
        <footer className="px-8 py-2 text-[9px] text-slate-400 dark:text-slate-600 font-bold uppercase tracking-[0.2em] text-center border-t border-slate-100 dark:border-slate-900 bg-white dark:bg-slate-950">
          Academic Management System • AI Powered Analytics
        </footer>

      </div>
    </div>
  );
}