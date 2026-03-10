// pages/admin/DropoutPrediction.jsx

import { useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import StatCard from "../../components/StatCard";
import ReportTable from "../../components/ReportTable";
import {
  AlertTriangle,
  TrendingDown,
  Download,
  Brain,
  Filter,
  Search,
  ShieldCheck
} from "lucide-react";

export default function DropoutPrediction() {

  const [search, setSearch] = useState("");

  const students = [
    {
      Roll: 23053487,
      CGPA: 6.2,
      Attendance: "64%",
      Risk: "High",
      Confidence: "91%"
    },
    {
      Roll: 23053488,
      CGPA: 7.0,
      Attendance: "78%",
      Risk: "Medium",
      Confidence: "74%"
    },
    {
      Roll: 23053489,
      CGPA: 5.8,
      Attendance: "58%",
      Risk: "Critical",
      Confidence: "96%"
    },
    {
      Roll: 23053498,
      CGPA: 9.5,
      Attendance: "92%",
      Risk: "Low",
      Confidence: "98%"
    }
  ];

  const filteredStudents = students.filter((s) =>
    s.Roll.toString().includes(search)
  );

  return (
    <DashboardLayout role="admin">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-12">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight">
            Dropout Intelligence Center
          </h1>
          <p className="text-slate-500 mt-2">
            AI-powered prediction engine for identifying high-risk students.
          </p>
        </div>

        <button className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg hover:bg-indigo-700">
          <Download size={18}/> Export Risk Report
        </button>
      </div>

      {/* STAT GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <StatCard title="Total Students Analysed" value="1,284" variant="primary" />
        <StatCard title="High Risk" value="47" variant="danger" />
        <StatCard title="Medium Risk" value="132" variant="warning" />
        <StatCard title="Prediction Accuracy" value="93%" variant="success" />
      </div>

      {/* MAIN GRID */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-12">

        {/* STUDENT TABLE */}
        <div className="xl:col-span-2 bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm">

          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold flex items-center gap-3">
              <AlertTriangle className="text-rose-600"/> High Risk Students
            </h2>

            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16}/>
                <input
                  type="text"
                  placeholder="Search student..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <button className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50">
                <Filter size={16}/>
              </button>
            </div>
          </div>

          <ReportTable
            columns={["Roll No.", "CGPA", "Attendance", "Risk", "Confidence"]}
            data={filteredStudents.map((s) => ({
              ...s,
              Risk: (
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  s.Risk === "Low"
                    ? "bg-emerald-100 text-emerald-600"
                    : s.Risk === "Medium"
                    ? "bg-amber-100 text-amber-600"
                    : s.Risk === "High"
                    ? "bg-rose-100 text-rose-600"
                    : "bg-red-200 text-red-700"
                }`}>
                  {s.Risk}
                </span>
              ),
              Confidence: (
                <span className="font-bold text-indigo-600">
                  {s.Confidence}
                </span>
              )
            }))}
          />
        </div>

        {/* AI EXPLANATION PANEL */}
        <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Brain className="text-indigo-600"/> AI Model Explanation
          </h3>

          <div className="space-y-4 text-sm text-slate-600">
            <p>
              • Attendance below 70% increases dropout probability by 32%.
            </p>
            <p>
              • CGPA decline to 1.0 in one semester increases risk by 41%.
            </p>
            <p>
              • Low LMS engagement correlates strongly with high dropout risk.
            </p>
          </div>

          <div className="mt-8 p-4 bg-indigo-50 rounded-xl border border-indigo-100">
            <p className="text-xs font-semibold text-indigo-600 uppercase tracking-widest">
              Intervention Recommendation
            </p>
            <p className="mt-2 text-sm">
              Schedule academic counseling within 7 days for students marked High or Critical.
            </p>
          </div>
        </div>

      </div>

      {/* MODEL PERFORMANCE */}
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-500 p-10 rounded-[2rem] text-white shadow-xl">
        <h3 className="text-2xl font-bold mb-4 flex items-center gap-3">
          <ShieldCheck /> Model Performance Overview
        </h3>
        <p className="text-sm opacity-90 leading-relaxed">
          The dropout prediction model uses ensemble learning with weighted attendance,
          academic trend slope, behavioral engagement metrics, and historical patterns.
          Current validation accuracy: 93.4% with 0.88 F1-score.
        </p>
      </div>

    </DashboardLayout>
  );
}
