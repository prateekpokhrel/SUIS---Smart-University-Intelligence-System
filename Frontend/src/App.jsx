import { Routes, Route, Navigate } from "react-router-dom";

// AUTH & UTILS
import AuthPage from "./pages/auth/AuthPage";
import AuthCallback from "./pages/auth/AuthCallback";
import ProtectedRoute from "./routes/ProtectedRoute";

// student pages
import StudentDashboard from "./pages/student/StudentDashboard";
import CareerPrediction from "./pages/student/CareerPrediction";
import CareerRecommendations from "./pages/student/CareerRecommendations";
import RiskPrediction from "./pages/student/RiskPrediction";
import Courses from "./pages/student/Courses";
import SpamDetection from "./pages/student/SpamDetection";
import PeerGroups from "./pages/student/PeerGroups";
import StudentSEGA from "./pages/student/StudentSEGA";  

// teacher pages
import TeacherDashboard from "./pages/teacher/TeacherDashboard";
import AtRiskStudents from "./pages/teacher/AtRiskStudents";
import PerformancePrediction from "./pages/teacher/PerformancePrediction";
import StudentsReports from "./pages/teacher/StudentsReports";
import TeacherSEGA from "./pages/teacher/TeacherSEGA";  

// admin pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import UniversityTrends from "./pages/admin/UniversityTrends";
import DropoutPrediction from "./pages/admin/DropoutPrediction";
import AdminSEGA from "./pages/admin/AdminSEGA";
import AdminStudentsProgress from "./pages/admin/AdminStudentsProgress";
import AdminUniversityResources from "./pages/admin/AdminUniversityResources";
import AdminMentees from "./pages/admin/AdminMentees";

// common/shared pages
import Settings from "./pages/Settings";


export default function App() {
  return (
    <Routes>

      {/* DEFAULT */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* AUTH */}
      <Route path="/login" element={<AuthPage />} />
      <Route path="/signup" element={<AuthPage />} />
      <Route path="/auth/callback" element={<AuthCallback />} />

      {/* student */}

      <Route
        path="/student"
        element={
          <ProtectedRoute role="student">
            <StudentDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/student/career"
        element={
          <ProtectedRoute role="student">
            <CareerPrediction />
          </ProtectedRoute>
        }
      />

      <Route
        path="/student/career-path"
        element={
          <ProtectedRoute role="student">
            <CareerRecommendations />
          </ProtectedRoute>
        }
      />

      <Route
        path="/student/risk"
        element={
          <ProtectedRoute role="student">
            <RiskPrediction />
          </ProtectedRoute>
        }
      />

      <Route
        path="/student/courses"
        element={
          <ProtectedRoute role="student">
            <Courses />
          </ProtectedRoute>
        }
      />

      <Route
        path="/student/PeerGroups"
        element={
          <ProtectedRoute role="student">
            <PeerGroups />
          </ProtectedRoute>
        }
      />

      <Route
        path="/student/spam"
        element={
          <ProtectedRoute role="student">
            <SpamDetection />
          </ProtectedRoute>
        }
      />

      {/* SEGA EMERGENCY SYSTEM */}
      <Route
        path="/student/sega"
        element={
          <ProtectedRoute role="student">
            <StudentSEGA />
          </ProtectedRoute>
        }
      />

      {/* teacher */}

      <Route
        path="/teacher"
        element={
          <ProtectedRoute role="teacher">
            <TeacherDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/teacher/atrisk"
        element={
          <ProtectedRoute role="teacher">
            <AtRiskStudents />
          </ProtectedRoute>
        }
      />

      <Route
        path="/teacher/performance"
        element={
          <ProtectedRoute role="teacher">
            <PerformancePrediction />
          </ProtectedRoute>
        }
      />

      <Route
        path="/teacher/reports"
        element={
          <ProtectedRoute role="teacher">
            <StudentsReports />
          </ProtectedRoute>
        }
      />

      <Route
        path="/teacher/sega"
        element={
          <ProtectedRoute role="teacher">
            <TeacherSEGA />
          </ProtectedRoute>
        }
      />

      {/* admin */}

      <Route
        path="/admin"
        element={
          <ProtectedRoute role="admin">
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/trends"
        element={
          <ProtectedRoute role="admin">
            <UniversityTrends />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/dropout"
        element={
          <ProtectedRoute role="admin">
            <DropoutPrediction />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/sega"
        element={
          <ProtectedRoute role="admin">
            <AdminSEGA />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/students"
        element={
          <ProtectedRoute role="admin">
            <AdminStudentsProgress />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/resources"
        element={
          <ProtectedRoute role="admin">
            <AdminUniversityResources />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/mentees"
        element={
          <ProtectedRoute role="admin">
            <AdminMentees />
          </ProtectedRoute>
        }
      />

      {/* shared */}

      <Route
        path="/settings"
        element={
          <ProtectedRoute role={["student", "teacher", "admin"]}>
            <Settings />
          </ProtectedRoute>
        }
      />

      {/* 404 */}
      <Route path="*" element={<Navigate to="/login" replace />} />

    </Routes>
  );
}
