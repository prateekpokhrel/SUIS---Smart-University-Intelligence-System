import DashboardLayout from "../../layouts/DashboardLayout";
import ReportTable from "../../components/ReportTable";
import StatCard from "../../components/StatCard";
import { exportCSV } from "../../utils/exportCSV";
import { 
  Users, 
  AlertTriangle, 
  TrendingUp, 
  Download, 
  UserCheck, 
  Search, 
  Filter,
  MoreVertical,
  CheckCircle,
  Clock
} from "lucide-react";

export default function TeacherDashboard() {
  const teacherName = "Dr. Hitesh Mohapatra";
  
  const studentData = [
    { Name: "Aman", CGPA: 8.2, Risk: "Low", Attendance: "95%", Status: "Stable" },
    { Name: "Riya", CGPA: 7.1, Risk: "Medium", Attendance: "82%", Status: "Improving" },
    { Name: "Vikram", CGPA: 6.5, Risk: "High", Attendance: "65%", Status: "Declining" },
    { Name: "Sara", CGPA: 8.7, Risk: "Low", Attendance: "98%", Status: "Stable" },
    { Name: "John", CGPA: 5.9, Risk: "High", Attendance: "58%", Status: "Critical" },
    { Name: "Emily", CGPA: 7.8, Risk: "Medium", Attendance: "88%", Status: "Stable" },
    { Name: "Michael", CGPA: 8.0, Risk: "Low", Attendance: "92%", Status: "Stable" },
    { Name: "Sophia", CGPA: 6.7, Risk: "High", Attendance: "71%", Status: "Declining" },
    { Name: "David", CGPA: 7.5, Risk: "Medium", Attendance: "85%", Status: "Stable" },
    { Name: "Olivia", CGPA: 8.3, Risk: "Low", Attendance: "94%", Status: "Improving" },
  ];

  return (
    <DashboardLayout role="teacher">
      {/* 1. WELCOME HEADER */}
      <header className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6 font-sans">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-5xl">
            Dashboard, {teacherName.split(' ')[0]}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 flex items-center gap-2 font-medium text-lg">
            <Users size={20} className="text-indigo-600" />
            Class B.Tech CSE (Section A) • 42 Enrolled Students
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700">
            <button className="px-4 py-2 text-xs font-bold rounded-xl bg-white dark:bg-slate-900 shadow-sm text-indigo-600 uppercase">Live View</button>
            <button className="px-4 py-2 text-xs font-bold rounded-xl text-slate-500 uppercase hover:text-slate-700">Historical</button>
          </div>
          <button
            onClick={() => exportCSV(studentData, "student_performance_report")}
            className="flex items-center gap-2 px-6 py-3 text-sm font-bold rounded-2xl bg-indigo-600 text-white hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 dark:shadow-none"
          >
            <Download size={18} />
            Export Class Data
          </button>
        </div>
      </header>

      {/* 2. CLASS ANALYTICS GRID */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10 font-sans">
        <StatCard
          title="Class Average CGPA"
          value="7.48"
          subtitle="+0.2 from Mid-term"
          variant="primary" 
        />
        <StatCard
          title="Students at High Risk"
          value="3"
          subtitle="Immediate intervention required"
          variant="danger"
        />
        <StatCard
          title="Avg. Attendance"
          value="86%"
          subtitle="Above department average"
          variant="success"
        />
        <StatCard
          title="Active Projects"
          value="12"
          subtitle="4 Due this week"
          variant="warning"
        />
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-10 font-sans">
        {/* 3. MAIN STUDENT TABLE HUB */}
        <div className="xl:col-span-2 flex flex-col gap-6">
          <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
              <h2 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-white flex items-center gap-3">
                <UserCheck className="text-indigo-600" size={24} />
                Student Performance Registry
              </h2>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input 
                    type="text" 
                    placeholder="Search name..." 
                    className="pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs focus:ring-2 focus:ring-indigo-500 outline-none w-48"
                  />
                </div>
                <button className="p-2 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800">
                  <Filter size={16} className="text-slate-500" />
                </button>
              </div>
            </div>
            
            <div className="overflow-hidden rounded-xl border border-slate-100 dark:border-slate-800">
                <ReportTable
                  columns={["Name", "CGPA", "Attendance", "Risk", "Status"]}
                  data={studentData.map(student => ({
                    ...student,
                    Risk: (
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                        student.Risk === 'Low' ? 'bg-emerald-100 text-emerald-600' : 
                        student.Risk === 'Medium' ? 'bg-amber-100 text-amber-600' : 
                        'bg-rose-100 text-rose-600'
                      }`}>
                        {student.Risk}
                      </span>
                    ),
                    Status: (
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400">
                        {student.Status === 'Improving' && <TrendingUp size={14} className="text-emerald-500" />}
                        {student.Status === 'Declining' && <AlertTriangle size={14} className="text-rose-500" />}
                        {student.Status === 'Stable' && <CheckCircle size={14} className="text-indigo-400" />}
                        {student.Status === 'Critical' && <Clock size={14} className="text-rose-600 animate-pulse" />}
                        {student.Status}
                      </div>
                    )
                  }))}
                />
            </div>
          </div>
        </div>

        {/* 4. TEACHER INSIGHTS SIDEBAR */}
        <aside className="flex flex-col gap-8">
          {/* RISK WATCHLIST */}
          <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-lg tracking-tight">Risk Watchlist</h3>
              <AlertTriangle className="text-rose-500" size={20} />
            </div>
            <div className="space-y-4">
              {studentData.filter(s => s.Risk === "High").map((student, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30">
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white text-sm">{student.Name}</p>
                    <p className="text-[10px] text-rose-600 font-bold uppercase tracking-wider">{student.CGPA} CGPA • {student.Attendance} Attn.</p>
                  </div>
                  <button className="p-2 bg-white dark:bg-slate-800 rounded-lg shadow-sm">
                    <MoreVertical size={14} className="text-slate-400" />
                  </button>
                </div>
              ))}
            </div>
            <button className="w-full mt-6 py-3 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-bold text-slate-400 hover:border-indigo-400 hover:text-indigo-500 transition-all">
              Schedule Intervention Meet
            </button>
          </div>

          {/* CURRICULUM PROGRESS */}
          <div className="bg-indigo-600 p-8 rounded-[2rem] text-white shadow-xl shadow-indigo-100 dark:shadow-none relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="font-bold text-lg tracking-tight mb-6">Syllabus Progress</h3>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between text-[10px] font-black uppercase mb-2 tracking-widest text-indigo-100">
                    <span>Machine Learning</span>
                    <span>82%</span>
                  </div>
                  <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-white rounded-full" style={{ width: '82%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-[10px] font-black uppercase mb-2 tracking-widest text-indigo-100">
                    <span>Neural Networks</span>
                    <span>45%</span>
                  </div>
                  <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-400 rounded-full shadow-[0_0_10px_rgba(251,191,36,0.5)]" style={{ width: '45%' }}></div>
                  </div>
                </div>
              </div>
              <p className="mt-8 text-xs font-medium text-indigo-100 leading-relaxed">
                You are 4 days ahead of the departmental schedule for this semester.
              </p>
            </div>
            <TrendingUp className="absolute -right-6 -bottom-6 w-32 h-32 text-white/10" />
          </div>
        </aside>
      </div>

      {/* 5. QUICK ACTIONS / SYSTEM RECOMMENDATIONS */}
      <section className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 p-8 rounded-[2rem] font-sans">
        <h3 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-white mb-8">Management Suite</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { title: "Review Assessment", desc: "Mid-term lab results are ready for final moderation.", action: "Open Gradebook" },
            { title: "Automated Reports", desc: "Generate monthly risk reports for the Dean's office.", action: "Download PDF" },
            { title: "Broadcast Update", desc: "Send an automated notification to students with < 75% attendance.", action: "Send Alert" }
          ].map((item, idx) => (
            <div key={idx} className="p-8 rounded-[1.5rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:border-indigo-300 transition-all group shadow-sm">
              <h4 className="font-bold text-slate-900 dark:text-white text-lg mb-2">{item.title}</h4>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium mb-6">{item.desc}</p>
              <button className="text-indigo-600 font-bold text-xs uppercase tracking-widest flex items-center gap-2 group-hover:gap-3 transition-all">
                {item.action} <TrendingUp size={14} />
              </button>
            </div>
          ))}
        </div>
      </section>
    </DashboardLayout>
  );
}