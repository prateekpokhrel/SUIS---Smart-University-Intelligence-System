import DashboardLayout from "../../layouts/DashboardLayout";
import StatCard from "../../components/StatCard";
import { exportCSV } from "../../utils/exportCSV";
import {
  Users,
  UserCheck,
  AlertTriangle,
  TrendingUp,
  ShieldCheck,
  Activity,
  Download,
  Search,
  Bell,
  Settings,
  Server,
  BookOpen,
  GraduationCap,
  MoreVertical
} from "lucide-react";

export default function AdminDashboard() {

  const adminName = "System Administrator";

  const universityStats = [
    { title: "Total Students", value: "1,284", variant: "primary", icon: Users },
    { title: "Total Teachers", value: "86", variant: "success", icon: UserCheck },
    { title: "High Risk Students", value: "47", variant: "danger", icon: AlertTriangle },
    { title: "System Health", value: "98%", variant: "warning", icon: Activity },
  ];

  const teacherOverview = [
    { name: "Dr. Hitesh", department: "CSE", students: 42, status: "Active" },
    { name: "Prof. Anjali", department: "ECE", students: 37, status: "Active" },
    { name: "Dr. Raj", department: "MECH", students: 29, status: "On Leave" },
  ];

  const alerts = [
    { message: "47 Students at High Academic Risk", level: "High" },
    { message: "Server Backup Completed Successfully", level: "Low" },
    { message: "3 Faculty Accounts Pending Approval", level: "Medium" }
  ];

  return (
    <DashboardLayout role="admin">

      {/* HEADER */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Admin Control Center
          </h1>
          <p className="text-slate-500 mt-2 text-lg font-medium">
            Welcome back, {adminName}. Monitor university performance & system intelligence.
          </p>
        </div>

        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-indigo-600 text-white font-bold shadow-lg hover:bg-indigo-700">
            <Download size={18}/> Export Full Report
          </button>
          <button className="p-3 rounded-2xl border border-slate-200 hover:bg-slate-50">
            <Settings size={18}/>
          </button>
        </div>
      </header>

      {/* TOP STAT GRID */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {universityStats.map((stat, i) => (
          <StatCard
            key={i}
            title={stat.title}
            value={stat.value}
            variant={stat.variant}
          />
        ))}
      </section>

      {/* MAIN GRID */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-10 mb-12">

        {/* STUDENT PERFORMANCE MONITOR */}
        <div className="xl:col-span-2 bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold flex items-center gap-3">
              <GraduationCap className="text-indigo-600"/> University Analytics
            </h2>
            <button className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50">
              <MoreVertical size={16}/>
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-8">

            {/* Student Growth */}
            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <TrendingUp size={18}/> Academic Growth Trend
              </h3>
              <div className="h-32 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center text-indigo-600 font-bold">
                Graph Placeholder (Integrate Chart.js later)
              </div>
            </div>

            {/* Placement Insight */}
            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <ShieldCheck size={18}/> Placement Prediction Index
              </h3>
              <p className="text-3xl font-extrabold text-indigo-600">84%</p>
              <p className="text-sm text-slate-500 mt-2">
                Projected placement probability this semester.
              </p>
            </div>

          </div>
        </div>

        {/* ALERT PANEL */}
        <aside className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm">
          <h3 className="font-bold text-xl mb-6 flex items-center gap-2">
            <Bell className="text-rose-500"/> System Alerts
          </h3>

          <div className="space-y-4">
            {alerts.map((alert, i) => (
              <div key={i} className={`p-4 rounded-2xl border ${
                alert.level === "High" ? "bg-rose-50 border-rose-200" :
                alert.level === "Medium" ? "bg-amber-50 border-amber-200" :
                "bg-emerald-50 border-emerald-200"
              }`}>
                <p className="text-sm font-semibold">{alert.message}</p>
              </div>
            ))}
          </div>
        </aside>

      </div>

      {/* TEACHER MANAGEMENT */}
      <section className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm">
        <h3 className="text-2xl font-bold mb-8 flex items-center gap-3">
          <BookOpen className="text-indigo-600"/> Faculty Management Overview
        </h3>

        <div className="grid md:grid-cols-3 gap-6">
          {teacherOverview.map((teacher, i) => (
            <div key={i} className="p-6 rounded-2xl border border-slate-100 hover:border-indigo-300 transition-all">
              <h4 className="font-bold text-lg">{teacher.name}</h4>
              <p className="text-sm text-slate-500">{teacher.department} Department</p>
              <p className="text-xs mt-3 font-semibold text-slate-600">
                {teacher.students} Students Assigned
              </p>
              <span className={`inline-block mt-3 px-3 py-1 rounded-full text-xs font-bold ${
                teacher.status === "Active" 
                ? "bg-emerald-100 text-emerald-600" 
                : "bg-amber-100 text-amber-600"
              }`}>
                {teacher.status}
              </span>
            </div>
          ))}
        </div>
      </section>

    </DashboardLayout>
  );
}
