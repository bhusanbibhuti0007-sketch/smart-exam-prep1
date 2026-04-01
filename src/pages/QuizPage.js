// src/pages/QuizPage.js
// Select topic + difficulty → AI generates questions → Track score → Save results

import React, { useState } from "react";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import Sidebar from "../components/Sidebar";
import { useAuth } from "../utils/AuthContext";
import { generateQuestions } from "../utils/aiHelper";
import { saveQuizResult } from "../firebase/firebaseHelpers";
import toast from "react-hot-toast";
import "../styles/dashboard.css";
import "../styles/quiz.css";

const DIFFICULTIES = ["easy", "medium", "hard"];

export default function QuizPage() {
  const { user } = useAuth();
  const topics = user?.topics || [];

  const [selectedTopic, setSelectedTopic] = useState("");
  const [difficulty, setDifficulty] = useState("medium");
  const [questions, setQuestions] = useState([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const [score, setScore] = useState(0);
  const [step, setStep] = useState("setup"); // setup | loading | quiz | result
  const [nextDifficulty, setNextDifficulty] = useState("medium");

  const startQuiz = async () => {
    if (!selectedTopic) { toast.error("Pick a topic first!"); return; }
    setStep("loading");
    try {
      const qs = await generateQuestions(selectedTopic, difficulty, 5);
      setQuestions(qs);
      setCurrentQ(0);
      setScore(0);
      setSelected(null);
      setRevealed(false);
      setStep("quiz");
    } catch {
      toast.error("Failed to generate questions. Check your API key.");
      setStep("setup");
    }
  };

  const handleSelect = (opt) => {
    if (revealed) return;
    setSelected(opt);
    setRevealed(true);
    const correct = opt === questions[currentQ].answer;
    if (correct) setScore(s => s + 1);
    // Auto-adjust next difficulty
    if (correct) {
      setNextDifficulty(difficulty === "easy" ? "medium" : "hard");
    } else {
      setNextDifficulty(difficulty === "hard" ? "medium" : "easy");
    }
  };

  const handleNext = async () => {
    if (currentQ + 1 >= questions.length) {
      // Quiz done
      const finalScore = score + (selected === questions[currentQ]?.answer ? 0 : 0);
      setStep("result");
      try {
        await saveQuizResult(user.username, selectedTopic, score, questions.length);
      } catch { /* fail silently */ }
    } else {
      setCurrentQ(c => c + 1);
      setSelected(null);
      setRevealed(false);
      setDifficulty(nextDifficulty); // auto-adjust difficulty
    }
  };

  const pct = questions.length > 0 ? Math.round((score / questions.length) * 100) : 0;

  if (!topics.length) return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="main-content page-enter">
        <div className="card" style={{ textAlign: "center", padding: "3rem" }}>
          <p style={{ fontSize: "3rem", marginBottom: "1rem" }}>📋</p>
          <h2>No topics found</h2>
          <p style={{ color: "var(--text-secondary)", margin: "1rem 0" }}>Upload your syllabus first to generate quizzes.</p>
          <button className="btn-primary" onClick={() => window.location.href = "/syllabus"}>Go to Syllabus Upload</button>
        </div>
      </main>
    </div>
  );

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="main-content page-enter">
        <h1 className="page-title">🧠 Practice Quiz</h1>
        <p className="page-subtitle">Test yourself — difficulty auto-adjusts based on your answers</p>

        {/* SETUP */}
        {step === "setup" && (
          <div className="card">
            <h3 style={{ marginBottom: "1rem" }}>Select Topic</h3>
            <div className="topics-list">
              {topics.map((t, i) => (
                <span
                  key={i}
                  className={`topic-chip ${selectedTopic === t ? "selected" : ""}`}
                  onClick={() => setSelectedTopic(t)}
                >{t}</span>
              ))}
            </div>

            <h3 style={{ margin: "1.5rem 0 0.75rem" }}>Starting Difficulty</h3>
            <div style={{ display: "flex", gap: "0.75rem" }}>
              {DIFFICULTIES.map(d => (
                <span
                  key={d}
                  className={`badge badge-${d} ${difficulty === d ? "selected" : ""}`}
                  style={{
                    cursor: "pointer", padding: "0.5rem 1rem",
                    border: difficulty === d ? "2px solid var(--accent)" : "2px solid transparent"
                  }}
                  onClick={() => setDifficulty(d)}
                >{d.charAt(0).toUpperCase() + d.slice(1)}</span>
              ))}
            </div>

            <button className="btn-primary" style={{ marginTop: "1.5rem" }} onClick={startQuiz}>
              Generate Questions 🚀
            </button>
          </div>
        )}

        {/* LOADING */}
        {step === "loading" && (
          <div className="card" style={{ textAlign: "center", padding: "3rem" }}>
            <div className="loader" />
            <p style={{ color: "var(--text-secondary)" }}>AI is generating your questions...</p>
          </div>
        )}

        {/* QUIZ */}
        {step === "quiz" && questions.length > 0 && (
          <>
            <div className="quiz-header">
              <div>
                <span className="badge badge-medium">{selectedTopic}</span>
                <span className={`badge badge-${difficulty}`} style={{ marginLeft: "0.5rem" }}>
                  {difficulty}
                </span>
              </div>
              <span style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>
                Score: {score}/{currentQ}
              </span>
            </div>
            <div className="quiz-progress-bar">
              <div className="quiz-progress-fill" style={{ width: `${((currentQ) / questions.length) * 100}%` }} />
            </div>

            <div className="question-card">
              <div className="question-number">Question {currentQ + 1} of {questions.length}</div>
              <div className="question-text">{questions[currentQ].question}</div>
              <div className="options-grid">
                {questions[currentQ].options.map((opt, i) => {
                  let cls = "option-btn";
                  if (revealed) {
                    if (opt === questions[currentQ].answer) cls += " correct";
                    else if (opt === selected) cls += " wrong";
                  } else if (opt === selected) cls += " selected";
                  return (
                    <button key={i} className={cls} onClick={() => handleSelect(opt)} disabled={revealed}>
                      {opt}
                    </button>
                  );
                })}
              </div>
              {revealed && (
                <div className="explanation-box">
                  💡 {questions[currentQ].explanation}
                </div>
              )}
            </div>

            {revealed && (
              <button className="btn-primary" onClick={handleNext}>
                {currentQ + 1 >= questions.length ? "See Results 🎉" : `Next Question →`}
              </button>
            )}
          </>
        )}

        {/* RESULT */}
        {step === "result" && (
          <div className="result-screen">
            <div className="score-circle">
              <CircularProgressbar
                value={pct}
                text={`${pct}%`}
                styles={buildStyles({
                  textColor: "var(--text-primary)",
                  pathColor: pct >= 70 ? "var(--success)" : pct >= 50 ? "var(--warning)" : "var(--danger)",
                  trailColor: "var(--bg-card2)"
                })}
              />
            </div>
            <h2>{pct >= 70 ? "Great Job! 🎉" : pct >= 50 ? "Keep Practicing 💪" : "Needs More Work 📖"}</h2>
            <p>You scored {score} out of {questions.length} on <strong>{selectedTopic}</strong></p>
            <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
              <button className="btn-primary" onClick={() => setStep("setup")}>Try Another Topic</button>
              <button className="btn-outline" onClick={() => { setStep("setup"); setSelectedTopic(selectedTopic); startQuiz(); }}>
                Retry Same Topic
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}