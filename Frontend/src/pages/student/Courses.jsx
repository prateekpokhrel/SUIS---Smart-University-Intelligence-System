import { useState, useMemo } from "react";
import { 
  BookOpen, CheckCircle2, Clock, Brain, Award, 
  ChevronRight, TrendingUp, Star, GraduationCap 
} from "lucide-react";
import DashboardLayout from "../../layouts/DashboardLayout";

/* =========================
   ENHANCED SEMESTER DATA (1-8)
========================= */
const semesterData = {
  1: [
    { title: "Differential Equations and Linear Algebra", value: "Completed", subtitle: "Score: B", credits: 4 },
    { title: "Chemistry", value: "Completed", subtitle: "Score: A", credits: 4 },
    { title: "English", value: "Completed", subtitle: "Score: A", credits: 2 },
    { title: "Basic Electronics", value: "Completed", subtitle: "Score: B", credits: 3 },
    { title: "Chemistry Lab", value: "Completed", subtitle: "Score: E", credits: 1 },
    { title: "Yoga", value: "Completed", subtitle: "Score: E", credits: 1 },
    { title: "Engineering Lab", value: "Completed", subtitle: "Score: E", credits: 1 },
    { title: "Workshop", value: "Completed", subtitle: "Score: O", credits: 2 },
    { title: "Creativity, Innovation and Entrepreneurship", value: "Completed", subtitle: "Score: O", credits: 2 },
    { title: "Communication Lab", value: "Completed", subtitle: "Score: O", credits: 1 },
    { title: "Basic Electrical Engineering", value: "Completed", subtitle: "Score: B", credits: 3 },
  ],
  2: [
    { title: "Physics", value: "Completed", subtitle: "Score: 8.0", credits: 4 },
    { title: "Science of Living Systems", value: "Completed", subtitle: "Score: 7.5", credits: 3 },
    { title: "Environmental Science", value: "Completed", subtitle: "Score: 9.0", credits: 2 },
    { title: "Physics Lab", value: "Completed", subtitle: "Score: 8.5", credits: 1 },
    { title: "Programming Lab", value: "Completed", subtitle: "Score: 9.5", credits: 2 },
    { title: "Engineering Drawing and Graphics", value: "Completed", subtitle: "Score: 7.0", credits: 3 },
    { title: "Biomedical Engineering", value: "Completed", subtitle: "Score: 8.0", credits: 3 },
    { title: "Nano Science", value: "Completed", subtitle: "Score: 8.0", credits: 3 },
  ],
  3: [
    { title: "Scientific and Technical Writing", value: "Completed", subtitle: "Score: 8.5", credits: 2 },
    { title: "Probability and Statistics", value: "Completed", subtitle: "Score: 7.5", credits: 4 },
    { title: "Industry 4.0 Technologies", value: "Completed", subtitle: "Score: 9.0", credits: 3 },
    { title: "Data Structures", value: "Completed", subtitle: "Score: 8.0", credits: 4 },
    { title: "Digital Systems Design", value: "Completed", subtitle: "Score: 7.0", credits: 4 },
    { title: "Automata Theory", value: "Completed", subtitle: "Score: 7.5", credits: 3 },
    { title: "Data Structures Lab", value: "Completed", subtitle: "Score: 9.0", credits: 1 },
    { title: "Digital Systems Lab", value: "Completed", subtitle: "Score: 8.5", credits: 1 },
  ],
  4: [
    { title: "Economics of Development", value: "Completed", subtitle: "Score: 8.0", credits: 3 },
    { title: "Discrete Mathematics", value: "Completed", subtitle: "Score: 7.5", credits: 4 },
    { title: "Operating Systems", value: "Completed", subtitle: "Score: 8.5", credits: 4 },
    { title: "Java Programming", value: "Completed", subtitle: "Score: 9.0", credits: 3 },
    { title: "DBMS", value: "Completed", subtitle: "Score: 8.0", credits: 4 },
    { title: "Computer Architecture", value: "Completed", subtitle: "Score: 7.5", credits: 4 },
    { title: "OS Laboratory", value: "Completed", subtitle: "Score: 9.5", credits: 1 },
    { title: "Java Laboratory", value: "Completed", subtitle: "Score: 9.0", credits: 1 },
  ],
  5: [
    { title: "Engineering Economics", value: "Completed", subtitle: "Score: 8.5", credits: 3 },
    { title: "Design & Analysis of Algorithms", value: "Completed", subtitle: "Score: 8.0", credits: 4 },
    { title: "Software Engineering", value: "Completed", subtitle: "Score: 9.0", credits: 3 },
    { title: "Computer Networks", value: "Completed", subtitle: "Score: 7.5", credits: 4 },
    { title: "Algorithms Lab", value: "Completed", subtitle: "Score: 9.5", credits: 1 },
    { title: "Network Lab", value: "Completed", subtitle: "Score: 9.0", credits: 1 },
    { title: "HPC", value: "Completed", subtitle: "Score: 8.5", credits: 3 },
    { title: "Computational Intelligence", value: "Completed", subtitle: "Score: 8.0", credits: 3 },
  ],
  6: [
    { title: "Universal Human Values", value: "Ongoing", subtitle: "Score: --", credits: 3 },
    { title: "Artificial Intelligence", value: "Ongoing", subtitle: "Score: --", credits: 4 },
    { title: "Machine Learning", value: "Ongoing", subtitle: "Score: --", credits: 4 },
    { title: "AI Laboratory", value: "Ongoing", subtitle: "Score: --", credits: 1 },
    { title: "App Development Lab", value: "Ongoing", subtitle: "Score: --", credits: 2 },
    { title: "Project Management", value: "Ongoing", subtitle: "Score: --", credits: 3 },
    { title: "German for Engineers", value: "Ongoing", subtitle: "Score: --", credits: 2 },
  ],
  7: [
    { title: "Compiler Design", value: "Upcoming", subtitle: "Next Semester", credits: 4 },
    { title: "Cyber Security", value: "Upcoming", subtitle: "Next Semester", credits: 3 },
    { title: "Cloud Computing", value: "Upcoming", subtitle: "Next Semester", credits: 3 },
    { title: "Major Project Phase I", value: "Upcoming", subtitle: "Next Semester", credits: 4 },
    { title: "Elective III", value: "Upcoming", subtitle: "Next Semester", credits: 3 },
  ],
  8: [
    { title: "Major Project Phase II", value: "Upcoming", subtitle: "Final Semester", credits: 12 },
    { title: "Industrial Internship", value: "Upcoming", subtitle: "Final Semester", credits: 6 },
    { title: "Professional Ethics", value: "Upcoming", subtitle: "Final Semester", credits: 2 },
  ],
};

export default function Courses() {
  const [selectedSem, setSelectedSem] = useState(6);
  
  // Calculate simulated CGPA (average of completed semesters 1-5)
  const currentCGPA = 8.42; 

  return (
    <DashboardLayout role="student">
      {/* TOP STATS & CGPA HERO */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-blue-600 to-violet-700 p-8 text-white shadow-2xl">
          <div className="relative z-10">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-extrabold tracking-tight">Academic Profile</h1>
                <p className="mt-1 text-blue-100 flex items-center gap-2">
                  <GraduationCap size={20} />
                  B.Tech CSE • School of Engineering
                </p>
              </div>
              <div className="bg-white/20 backdrop-blur-md p-3 rounded-2xl text-center min-w-[100px] border border-white/30">
                <p className="text-xs uppercase font-bold text-blue-100 tracking-wider">Current CGPA</p>
                <p className="text-3xl font-black">{currentCGPA}</p>
              </div>
            </div>
            
            <div className="mt-8 grid grid-cols-3 gap-4">
              <div className="bg-white/10 p-3 rounded-xl backdrop-blur-sm">
                <p className="text-xs text-blue-200">Completed Credits</p>
                <p className="text-lg font-bold">114 / 160</p>
              </div>
              <div className="bg-white/10 p-3 rounded-xl backdrop-blur-sm">
                <p className="text-xs text-blue-200">Rank in Batch</p>
                <p className="text-lg font-bold">#12</p>
              </div>
              <div className="bg-white/10 p-3 rounded-xl backdrop-blur-sm">
                <p className="text-xs text-blue-200">Attendance</p>
                <p className="text-lg font-bold">92%</p>
              </div>
            </div>
          </div>
          <div className="absolute -right-10 -bottom-10 h-64 w-64 rounded-full bg-white/5 blur-3xl"></div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-emerald-600 mb-2">
              <TrendingUp size={20} />
              <span className="text-sm font-bold uppercase">Performance Trend</span>
            </div>
            <p className="text-slate-500 text-sm">Your SGPA has improved by <span className="text-emerald-500 font-bold">4.2%</span> compared to last semester.</p>
          </div>
          <div className="h-24 w-full flex items-end gap-2 mt-4">
             {[6.8, 7.2, 7.8, 8.1, 8.5].map((val, i) => (
               <div key={i} className="flex-1 bg-indigo-100 dark:bg-slate-800 rounded-t-lg relative group transition-all" style={{height: `${val * 10}%`}}>
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-bold text-slate-400 opacity-0 group-hover:opacity-100">{val}</div>
               </div>
             ))}
          </div>
          <p className="text-[10px] text-center text-slate-400 mt-2 uppercase tracking-widest font-bold">Sem 1 — Sem 5</p>
        </div>
      </div>

      {/* SEMESTER NAVIGATION TABS (1-8) */}
      <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-4 no-scrollbar">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
          <button
            key={sem}
            onClick={() => setSelectedSem(sem)}
            className={`px-6 py-3 rounded-2xl text-sm font-bold transition-all duration-300 whitespace-nowrap
              ${selectedSem === sem 
                ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-lg scale-105" 
                : "bg-white dark:bg-slate-800 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700"
              }`}
          >
            Sem {sem}
          </button>
        ))}
      </div>

      {/* SUBJECT GRID */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <BookOpen className="text-indigo-500" />
                Curriculum for Semester {selectedSem}
            </h2>
            <span className="text-xs font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full uppercase">
                {semesterData[selectedSem].length} Courses
            </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {semesterData[selectedSem].map((course, index) => (
            <div 
              key={index}
              className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl hover:border-indigo-500/50 transition-all duration-300"
            >
              <div className="flex justify-between items-start mb-4">
                <div className={`p-2 rounded-xl ${
                  course.value === "Completed" ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500" : 
                  course.value === "Ongoing" ? "bg-amber-50 dark:bg-amber-500/10 text-amber-500" :
                  "bg-slate-50 dark:bg-slate-800 text-slate-400"
                }`}>
                  {course.value === "Completed" ? <CheckCircle2 size={20} /> : <Clock size={20} />}
                </div>
                <div className="flex flex-col items-end">
                   <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Credits: {course.credits}</span>
                   <span className={`text-[10px] font-black mt-1 ${course.value === "Completed" ? "text-emerald-500" : "text-amber-500"}`}>
                      {course.value}
                   </span>
                </div>
              </div>
              
              <h3 className="font-bold text-slate-800 dark:text-slate-100 leading-tight mb-2 min-h-[40px]">
                {course.title}
              </h3>
              
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-50 dark:border-slate-800">
                <span className="text-sm font-bold text-indigo-500">
                  {course.subtitle}
                </span>
                <div className="flex gap-1">
                   {[1,2,3].map(i => <div key={i} className="h-1 w-3 rounded-full bg-slate-200 dark:bg-slate-700" />)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* AI RECOMMENDATIONS SECTION */}
      <section className="bg-indigo-50/50 dark:bg-indigo-950/20 p-8 rounded-[2rem] border border-indigo-100 dark:border-indigo-900/50">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 bg-white dark:bg-slate-900 rounded-2xl text-indigo-600 shadow-sm">
            <Star size={24} fill="currentColor" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100">Specialization Path</h2>
            <p className="text-sm text-slate-500">AI-driven elective suggestions for Semester 7 & 8</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 relative overflow-hidden group">
            <div className="relative z-10">
              <span className="inline-block px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 text-[10px] font-bold mb-3 uppercase">Top Match: 98%</span>
              <h3 className="font-bold text-xl mb-2 text-slate-800 dark:text-slate-100">Natural Language Processing</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                Your performance in <span className="text-slate-800 dark:text-white font-semibold">Automata Theory</span> suggests you'll excel in Computational Linguistics.
              </p>
              <button className="flex items-center gap-2 text-indigo-600 font-bold text-sm">
                Explore Curriculum <ChevronRight size={16} />
              </button>
            </div>
          </div>
          {/* Add more recommendation cards as needed */}
        </div>
      </section>
    </DashboardLayout>
  );
}