import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import MainLayout from "./layouts/MainLayout";

import Login from "./pages/Login/Login";

import Dashboard from "./pages/Dashboard/Dashboard";
import Students from "./pages/Students/Students";
import Assessments from "./pages/Assessments/Assessments";
import Responses from "./pages/Responses/Responses";
import Evaluation from "./pages/Evaluation/Evaluation";
import Results from "./pages/Results/Results";
import Reports from "./pages/Reports/Reports";

import StudentDashboard from "./pages/StudentDashboard/StudentDashboard";
import StudentInstructions from "./pages/StudentInstructions/StudentInstructions";
import StudentTest from "./pages/StudentTest/StudentTest";
import StudentResult from "./pages/StudentResult/StudentResult";

function App() {
  return (
    <BrowserRouter>

      <Routes>

        {/* LOGIN */}

        <Route
          path="/"
          element={<Navigate to="/login" />}
        />

        <Route
          path="/login"
          element={<Login />}
        />

        {/* TEACHER */}

        <Route element={<MainLayout />}>

          <Route
            path="/teacher/dashboard"
            element={<Dashboard />}
          />

          <Route
            path="/teacher/students"
            element={<Students />}
          />

          <Route
            path="/teacher/assessments"
            element={<Assessments />}
          />

          <Route
            path="/teacher/responses"
            element={<Responses />}
          />

          <Route
            path="/teacher/evaluation"
            element={<Evaluation />}
          />

          <Route
            path="/teacher/results"
            element={<Results />}
          />

          <Route
            path="/teacher/reports"
            element={<Reports />}
          />

        </Route>

        {/* STUDENT */}

        <Route
          path="/student/dashboard"
          element={<StudentDashboard />}
        />

        <Route
          path="/student/instructions/:assessmentId"
          element={<StudentInstructions />}
        />

        <Route
          path="/student/test/:assessmentId"
          element={<StudentTest />}
        />

        <Route
          path="/student/result/:assessmentId"
          element={<StudentResult />}
        />

      </Routes>

    </BrowserRouter>
  );
}

export default App;