// pages/teacher/PerformancePrediction.jsx
import DashboardLayout from "../../layouts/DashboardLayout";
import ReportTable from "../../components/ReportTable";

export default function PerformancePrediction() {
  return (
    <DashboardLayout role="teacher">
      <h1 className="text-3xl font-bold mb-6">Performance Prediction</h1>

      <ReportTable
        title="Predicted Scores"
        columns={["Student", "Next Score"]}
        data={[
          { Student: "Aman", "Next Score": 88 },
          { Student: "Riya", "Next Score": 74 },
        ]}
      />
    </DashboardLayout>
  );
}
