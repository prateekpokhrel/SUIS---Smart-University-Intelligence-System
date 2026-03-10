// pages/admin/UniversityTrends.jsx
import DashboardLayout from "../../layouts/DashboardLayout";
import StatCard from "../../components/StatCard";

export default function UniversityTrends() {
  return (
    <DashboardLayout role="admin">
      <h1 className="text-3xl font-bold mb-6">University Trends</h1>

      <div className="grid grid-cols-3 gap-6">
        <StatCard title="Avg CGPA" value="7.8" />
        <StatCard title="Risk Students" value="12%" />
        <StatCard title="Placement Readiness" value="High" />
      </div>
    </DashboardLayout>
  );
}
