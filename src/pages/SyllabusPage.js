// src/pages/SyllabusPage.js
// Upload syllabus (PDF or paste text) → AI extracts topics → Save to Firebase

import React, { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import Sidebar from "../components/Sidebar";
import { useAuth } from "../utils/AuthContext";
import { extractTopicsFromSyllabus } from "../utils/aiHelper";
import { extractTextFromPDF } from "../utils/pdfHelper";
import { saveSyllabus } from "../firebase/firebaseHelpers";
import toast from "react-hot-toast";
import "../styles/dashboard.css";
import "../styles/quiz.css";

export default function SyllabusPage() {
  const { user, updateUser } = useAuth();
  const [text, setText] = useState("");
  const [topics, setTopics] = useState(user?.topics || []);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(topics.length > 0 ? "done" : "upload"); // upload | extracting | done

  // Handle PDF drop
  const onDrop = useCallback(async (files) => {
    const file = files[0];
    if (!file) return;
    setLoading(true);
    toast("📄 Reading PDF...");
    try {
      const extracted = await extractTextFromPDF(file);
      setText(extracted);
      toast.success("PDF text extracted! Click 'Extract Topics'.");
    } catch {
      toast.error("Could not read PDF. Try pasting text instead.");
    }
    setLoading(false);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    maxFiles: 1
  });

  const handleExtract = async () => {
    if (!text.trim()) { toast.error("Please paste or upload syllabus content."); return; }
    setLoading(true);
    setStep("extracting");
    try {
      const extracted = await extractTopicsFromSyllabus(text);
      setTopics(extracted);
      setStep("done");
      toast.success(`Found ${extracted.length} topics!`);
    } catch {
      toast.error("AI extraction failed. Check your API key in .env");
      setStep("upload");
    }
    setLoading(false);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await saveSyllabus(user.username, topics);
      updateUser({ topics });
      toast.success("Syllabus saved! 🎉");
    } catch {
      toast.error("Could not save. Check Firebase config.");
    }
    setLoading(false);
  };

  const removeTopics = (t) => setTopics(topics.filter(x => x !== t));

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="main-content page-enter">
        <h1 className="page-title">📋 Upload Syllabus</h1>
        <p className="page-subtitle">Upload your syllabus — AI will extract the key topics</p>

        {step !== "done" && (
          <div className="card" style={{ marginBottom: "1.5rem" }}>
            {/* PDF Drop Zone */}
            <div {...getRootProps()} className={`upload-zone ${isDragActive ? "drag-active" : ""}`}>
              <input {...getInputProps()} />
              <div className="upload-icon">📄</div>
              <h3>{isDragActive ? "Drop it here!" : "Drag & Drop PDF"}</h3>
              <p>or click to browse — PDF files only</p>
            </div>

            <p style={{ textAlign: "center", margin: "1rem 0", color: "var(--text-secondary)" }}>— or paste text below —</p>

            <textarea
              className="syllabus-textarea"
              placeholder="Paste your syllabus text here..."
              value={text}
              onChange={e => setText(e.target.value)}
            />

            <button
              className="btn-primary"
              style={{ marginTop: "1rem", width: "100%" }}
              onClick={handleExtract}
              disabled={loading}
            >
              {loading ? "⏳ Extracting..." : "🤖 Extract Topics with AI"}
            </button>
          </div>
        )}

        {step === "done" && topics.length > 0 && (
          <div className="card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <h3>✅ Extracted Topics ({topics.length})</h3>
              <button className="btn-outline" onClick={() => setStep("upload")}>Re-upload</button>
            </div>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.88rem", marginBottom: "1rem" }}>
              Click a topic to remove it if it's not relevant.
            </p>
            <div className="topics-list">
              {topics.map((t, i) => (
                <span key={i} className="topic-chip" onClick={() => removeTopics(t)} title="Click to remove">
                  {t} ✕
                </span>
              ))}
            </div>
            <button
              className="btn-primary"
              style={{ marginTop: "1.5rem" }}
              onClick={handleSave}
              disabled={loading}
            >
              {loading ? "Saving..." : "💾 Save Topics"}
            </button>
          </div>
        )}
      </main>
    </div>
  );
}