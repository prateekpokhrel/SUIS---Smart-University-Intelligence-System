// pages/teacher/AtRiskStudents.jsx
import DashboardLayout from "../../layouts/DashboardLayout";
import ReportTable from "../../components/ReportTable";

export default function AtRiskStudents() {
  return (
    <DashboardLayout role="teacher">
      <h1 className="text-3xl font-bold mb-6">At-Risk Students</h1>

      <ReportTable
        title="Detected by ML Model"
        columns={["Student", "Risk Level"]}
        data={[
          { Student: "Riya", "Risk Level": "Medium" },
          { Student: "Karan", "Risk Level": "High" },
        ]}
      />
    </DashboardLayout>
  );
}
