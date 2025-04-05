import "./App.css";
import axios from "axios";
import Navigation from "./components/layout/Navigation";
import ResumeOptimizer from "./components/resume/ResumeOptimizer";
import ApplicationList from "./components/applications/ApplicationList";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import FutureResumeLanding from "./components/landing/FutureResumeLanding";
import AnalyticsDashboard from "./components/analytics/AnalyticsDashboard";
import AdminLogin from "./components/admin/AdminLogin";
import AdminDashboard from "./components/admin/AdminDashboard";
import Login from "./components/auth/Login";
import Register from "./components/auth/Register";
import JobList from "./components/jobs/JobList";
import ResumeList from "./components/resume/ResumeList";
import ResumeForm from "./components/resume/ResumeForm";

// Set default base URL for axios
axios.defaults.baseURL = "http://localhost:5000";

function App() {
  return (
    <Router>
      <Routes>
        {/* Admin routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />

        {/* Auth routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* User routes with navigation */}
        <Route
          path="/"
          element={
            <>
              <Navigation />
              <FutureResumeLanding />
            </>
          }
        />
        <Route
          path="/resume-optimizer/:resumeId/:jobId?"
          element={
            <>
              <Navigation />
              <ResumeOptimizer />
            </>
          }
        />
        <Route
          path="/applications"
          element={
            <>
              <Navigation />
              <ApplicationList />
            </>
          }
        />
        <Route
          path="/analytics"
          element={
            <>
              <Navigation />
              <AnalyticsDashboard />
            </>
          }
        />
        <Route
          path="/jobs"
          element={
            <>
              <Navigation />
              <JobList />
            </>
          }
        />
        <Route
          path="/resumes"
          element={
            <>
              <Navigation />
              <ResumeList />
            </>
          }
        />
        <Route
          path="/resumes/new"
          element={
            <>
              <Navigation />
              <ResumeForm />
            </>
          }
        />
        <Route
          path="/resumes/edit/:id"
          element={
            <>
              <Navigation />
              <ResumeForm />
            </>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
