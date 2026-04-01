// src/pages/DashboardPage.js
// Home screen after login — shows stats, weak topics summary, today's plan

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { useAuth } from "../utils/AuthContext";
import { getUserProfile } from "../firebase/firebaseHelpers";
import "../styles/dashboard.css";

export default function DashboardPage() {
  const { user, updateUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    getUserProfile(user.username).then(data => {
      setProfile(data);
      updateUser(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const totalSessions   = profile?.sessions?.length || 0;
  const topics          = profile?.topics || [];
  const weakTopics      = (profile?.weakTopics || []).filter(w => w.score < 60);
  const avgScore        = totalSessions > 0
    ? Math.round((profile.sessions.reduce((a, s) => a + s.score, 0)) / totalSessions)
    : 0;
  const todayPlan = profile?.studyPlan?.find(d => d.day === 1);

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="main-content page-enter">
        <h1 className="page-title">Welcome back, {user.username}! 👋</h1>
        <p className="page-subtitle">Here's your study overview</p>

        {loading ? <div className="loader" /> : (
          <>
            {/* Stats */}
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon">📋</div>
                <div className="stat-value">{topics.length}</div>
                <div className="stat-label">Topics Loaded</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">🧠</div>
                <div className="stat-value">{totalSessions}</div>
                <div className="stat-label">Quiz Sessions</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">🎯</div>
                <div className="stat-value">{avgScore}%</div>
                <div className="stat-label">Avg Score</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">⚠️</div>
                <div className="stat-value">{weakTopics.length}</div>
                <div className="stat-label">Weak Topics</div>
              </div>
            </div>

            <div className="two-col">
              {/* Quick Actions */}
              <div className="card">
                <h3 style={{ marginBottom: "1rem" }}>Quick Actions</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  {topics.length === 0 ? (
                    <button className="btn-primary" onClick={() => navigate("/syllabus")}>
                      📋 Upload Your Syllabus First
                    </button>
                  ) : (
                    <>
                      <button className="btn-primary" onClick={() => navigate("/quiz")}>
                        🧠 Start Practice Quiz
                      </button>
                      <button className="btn-outline" onClick={() => navigate("/study-plan")}>
                        📅 Generate Study Plan
                      </button>
                      <button className="btn-outline" onClick={() => navigate("/weak-topics")}>
                        📊 View Weak Topics
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Today's Plan */}
              <div className="card">
                <h3 style={{ marginBottom: "1rem" }}>📅 Today's Plan</h3>
                {todayPlan ? (
                  <>
                    <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", marginBottom: "0.75rem" }}>
                      {todayPlan.focus}
                    </p>
                    <div className="topics-list" style={{ marginTop: 0 }}>
                      {todayPlan.topics.map((t, i) => (
                        <span key={i} className="topic-chip" style={{ cursor: "default" }}>{t}</span>
                      ))}
                    </div>
                    <p style={{ marginTop: "0.75rem", color: "var(--accent-light)", fontSize: "0.85rem" }}>
                      ⏱ {todayPlan.duration}
                    </p>
                  </>
                ) : (
                  <div style={{ color: "var(--text-secondary)", textAlign: "center", padding: "1rem 0" }}>
                    <p>No plan yet.</p>
                    <button
                      className="btn-outline"
                      style={{ marginTop: "0.75rem" }}
                      onClick={() => navigate("/study-plan")}
                    >
                      Generate Plan
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Recent Sessions */}
            {totalSessions > 0 && (
              <div className="card" style={{ marginTop: "1.5rem" }}>
                <h3 style={{ marginBottom: "1rem" }}>Recent Sessions</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  {(profile.sessions || []).slice(-5).reverse().map((s, i) => (
                    <div key={i} style={{
                      display: "flex", justifyContent: "space-between", alignItems: "center",
                      padding: "0.6rem 0", borderBottom: "1px solid var(--border)"
                    }}>
                      <span>{s.topic}</span>
                      <span style={{
                        color: s.score >= 70 ? "var(--success)" : s.score >= 50 ? "var(--warning)" : "var(--danger)",
                        fontWeight: 600
                      }}>
                        {s.score}/{s.total} ({Math.round((s.score / s.total) * 100)}%)
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}