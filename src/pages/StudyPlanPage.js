// src/pages/StudyPlanPage.js
// AI generates a personalized study plan based on topics + weak areas

import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import { useAuth } from "../utils/AuthContext";
import { generateStudyPlan } from "../utils/aiHelper";
import { saveStudyPlan, getUserProfile } from "../firebase/firebaseHelpers";
import toast from "react-hot-toast";
import "../styles/dashboard.css";

export default function StudyPlanPage() {
  const { user, updateUser } = useAuth();
  const [plan, setPlan] = useState(user?.studyPlan || []);
  const [days, setDays] = useState(14);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!user?.topics?.length) {
      toast.error("Upload your syllabus first!"); return;
    }
    setLoading(true);
    try {
      const profile = await getUserProfile(user.username);
      const generated = await generateStudyPlan(profile.topics, profile.weakTopics || [], days);
      setPlan(generated);
      await saveStudyPlan(user.username, generated);
      updateUser({ studyPlan: generated });
      toast.success("Study plan generated! 📅");
    } catch {
      toast.error("Failed to generate plan. Check your API key.");
    }
    setLoading(false);
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="main-content page-enter">
        <h1 className="page-title">📅 Daily Study Planner</h1>
        <p className="page-subtitle">AI creates a personalized plan, giving extra time to your weak topics</p>

        <div className="card" style={{ marginBottom: "1.5rem" }}>
          <div style={{ display: "flex", gap: "1rem", alignItems: "center", flexWrap: "wrap" }}>
            <div>
              <label style={{ color: "var(--text-secondary)", fontSize: "0.85rem", display: "block", marginBottom: "0.3rem" }}>
                Days until exam
              </label>
              <input
                type="number"
                min="3" max="60"
                value={days}
                onChange={e => setDays(Number(e.target.value))}
                style={{
                  background: "var(--bg-card2)", border: "1px solid var(--border)",
                  borderRadius: "var(--radius-sm)", color: "var(--text-primary)",
                  padding: "0.6rem 1rem", width: "100px", outline: "none"
                }}
              />
            </div>
            <button
              className="btn-primary"
              onClick={handleGenerate}
              disabled={loading}
              style={{ marginTop: "1.2rem" }}
            >
              {loading ? "⏳ Generating..." : "🤖 Generate Plan"}
            </button>
          </div>
        </div>

        {plan.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {plan.map((day, i) => (
              <div key={i} className="card" style={{ display: "flex", gap: "1rem", alignItems: "flex-start" }}>
                {/* Day number */}
                <div style={{
                  minWidth: "50px", height: "50px", borderRadius: "50%",
                  background: "var(--accent-glow)", border: "2px solid var(--accent)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontFamily: "var(--font-head)", fontWeight: 800, fontSize: "1rem",
                  color: "var(--accent-light)"
                }}>
                  {day.day}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "0.5rem" }}>
                    <div>
                      <div className="topics-list" style={{ marginTop: 0 }}>
                        {day.topics.map((t, j) => (
                          <span key={j} className="topic-chip" style={{ cursor: "default" }}>{t}</span>
                        ))}
                      </div>
                      <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", marginTop: "0.4rem" }}>
                        {day.focus}
                      </p>
                    </div>
                    <span style={{ color: "var(--accent-light)", fontSize: "0.85rem", fontWeight: 600, whiteSpace: "nowrap" }}>
                      ⏱ {day.duration}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {plan.length === 0 && !loading && (
          <div className="card" style={{ textAlign: "center", padding: "3rem" }}>
            <p style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>📅</p>
            <h3>No plan yet</h3>
            <p style={{ color: "var(--text-secondary)" }}>Set your exam date and click Generate Plan.</p>
          </div>
        )}
      </main>
    </div>
  );
}