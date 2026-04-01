// src/pages/WeakTopicsPage.js
// Shows bar chart of performance per topic + weak topic badges

import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import { useAuth } from "../utils/AuthContext";
import { getUserProfile } from "../firebase/firebaseHelpers";
import "../styles/dashboard.css";

export default function WeakTopicsPage() {
  const { user } = useAuth();
  const [weakTopics, setWeakTopics] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getUserProfile(user.username).then(data => {
      setWeakTopics(data.weakTopics || []);
      setLoading(false);
    });
  }, [user.username]);

  const sorted = [...weakTopics].sort((a, b) => a.score - b.score);
  const getColor = (score) => {
    if (score >= 70) return "var(--success)";
    if (score >= 50) return "var(--warning)";
    return "var(--danger)";
  };
  const getLabel = (score) => {
    if (score >= 70) return "Strong";
    if (score >= 50) return "Average";
    if (score > 0)   return "Weak";
    return "Not tested";
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="main-content page-enter">
        <h1 className="page-title">📊 Topic Performance</h1>
        <p className="page-subtitle">See where you're strong and where to improve</p>

        {loading ? <div className="loader" /> : sorted.length === 0 ? (
          <div className="card" style={{ textAlign: "center", padding: "3rem" }}>
            <p style={{ fontSize: "2rem", marginBottom: "1rem" }}>🧪</p>
            <h3>No quiz data yet</h3>
            <p style={{ color: "var(--text-secondary)" }}>Take some quizzes to see your weak topics.</p>
          </div>
        ) : (
          <>
            {/* Weak topics highlight */}
            {sorted.filter(w => w.score < 60 && w.attempts > 0).length > 0 && (
              <div className="card" style={{ marginBottom: "1.5rem", borderColor: "rgba(231,76,60,0.3)" }}>
                <h3 style={{ color: "var(--danger)", marginBottom: "0.75rem" }}>⚠️ Focus Areas</h3>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.88rem", marginBottom: "1rem" }}>
                  These topics need more practice:
                </p>
                <div className="topics-list">
                  {sorted.filter(w => w.score < 60 && w.attempts > 0).map((w, i) => (
                    <span key={i} style={{
                      background: "rgba(231,76,60,0.12)", border: "1px solid rgba(231,76,60,0.3)",
                      color: "var(--danger)", padding: "0.35rem 0.9rem",
                      borderRadius: "99px", fontSize: "0.85rem", fontWeight: 500
                    }}>{w.topic}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Per-topic bars */}
            <div className="card">
              <h3 style={{ marginBottom: "1.5rem" }}>All Topics</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                {sorted.map((w, i) => (
                  <div key={i}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.4rem" }}>
                      <span style={{ fontWeight: 500, fontSize: "0.9rem" }}>{w.topic}</span>
                      <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
                        <span style={{ color: "var(--text-secondary)", fontSize: "0.8rem" }}>
                          {w.attempts} attempt{w.attempts !== 1 ? "s" : ""}
                        </span>
                        <span style={{ color: getColor(w.score), fontSize: "0.85rem", fontWeight: 600 }}>
                          {w.attempts > 0 ? `${w.score}% — ${getLabel(w.score)}` : "Not tested"}
                        </span>
                      </div>
                    </div>
                    <div style={{ height: "8px", background: "var(--bg-card2)", borderRadius: "4px", overflow: "hidden" }}>
                      <div style={{
                        height: "100%",
                        width: `${w.score}%`,
                        background: getColor(w.score),
                        borderRadius: "4px",
                        transition: "width 1s ease"
                      }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}