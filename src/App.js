// src/App.js
// Root component — sets up routes + auth protection

import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider, useAuth } from "./utils/AuthContext";

import AuthPage       from "./pages/AuthPage";
import DashboardPage  from "./pages/DashboardPage";
import SyllabusPage   from "./pages/SyllabusPage";
import QuizPage       from "./pages/QuizPage";
import WeakTopicsPage from "./pages/WeakTopicsPage";
import StudyPlanPage  from "./pages/StudyPlanPage";

import "./styles/global.css";

// Protects routes — redirects to login if not authenticated
function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}><div className="loader" /></div>;
  return user ? children : <Navigate to="/" replace />;
}

function AppRoutes() {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/"             element={user ? <Navigate to="/dashboard" /> : <AuthPage />} />
      <Route path="/dashboard"    element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
      <Route path="/syllabus"     element={<PrivateRoute><SyllabusPage /></PrivateRoute>} />
      <Route path="/quiz"         element={<PrivateRoute><QuizPage /></PrivateRoute>} />
      <Route path="/weak-topics"  element={<PrivateRoute><WeakTopicsPage /></PrivateRoute>} />
      <Route path="/study-plan"   element={<PrivateRoute><StudyPlanPage /></PrivateRoute>} />
      <Route path="*"             element={<Navigate to="/" />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "#1a1f35",
              color: "#f0f0f8",
              border: "1px solid rgba(108,99,255,0.3)"
            }
          }}
        />
      </Router>
    </AuthProvider>
  );
}