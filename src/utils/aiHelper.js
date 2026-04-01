// src/utils/aiHelper.js
// Handles all AI calls (Claude API via Anthropic)
// =============================================
// Get your FREE API key at: https://console.anthropic.com
// Set it in your .env file as: REACT_APP_ANTHROPIC_KEY=your_key_here
// =============================================

const API_KEY = process.env.REACT_APP_GEMINI_KEY;

async function callClaude(prompt) {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.REACT_APP_GEMINI_KEY}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": API_KEY,
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true"
    },
    body: JSON.stringify({
      model: "GEMINI",
      max_tokens: 2000,
      messages: [{ role: "user", content: prompt }]
    })
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error.message);
  return data.content[0].text;
}

// Extract topics from syllabus text
export async function extractTopicsFromSyllabus(syllabusText) {
  const prompt = `Extract the main study topics from this syllabus. Return ONLY a JSON array of topic strings, nothing else. Example: ["Topic 1","Topic 2"]. Syllabus:\n\n${syllabusText}`;
  const text = await callClaude(prompt);
  const clean = text.replace(/```json|```/g, "").trim();
  return JSON.parse(clean);
}

// Generate practice questions for a topic + difficulty
export async function generateQuestions(topic, difficulty = "medium", count = 5) {
  const prompt = `Generate ${count} multiple choice questions about "${topic}" at ${difficulty} difficulty level.
Return ONLY a JSON array with this exact format:
[
  {
    "question": "Question text here?",
    "options": ["A) Option 1", "B) Option 2", "C) Option 3", "D) Option 4"],
    "answer": "A) Option 1",
    "explanation": "Brief explanation why this is correct."
  }
]
No extra text, just the JSON array.`;
  const text = await callClaude(prompt);
  const clean = text.replace(/```json|```/g, "").trim();
  return JSON.parse(clean);
}

// Generate a personalized daily study plan
export async function generateStudyPlan(topics, weakTopics, examDaysLeft = 14) {
  const weak = weakTopics.filter(w => w.score < 60).map(w => w.topic);
  const prompt = `Create a ${examDaysLeft}-day study plan for a student.
All topics: ${topics.join(", ")}
Weak topics needing more attention: ${weak.join(", ") || "none"}
Return ONLY a JSON array where each item is:
{ "day": 1, "topics": ["Topic A", "Topic B"], "focus": "brief focus note", "duration": "2 hours" }
Cover all topics, give extra days to weak topics. Just the JSON array, no extra text.`;
  const text = await callClaude(prompt);
  const clean = text.replace(/```json|```/g, "").trim();
  return JSON.parse(clean);
}

// Password strength checker
export function checkPasswordStrength(password) {
  const checks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[!@#$%^&*]/.test(password)
  };
  const score = Object.values(checks).filter(Boolean).length;
  const labels = ["", "Very Weak", "Weak", "Fair", "Strong", "Very Strong"];
  const colors = ["", "#e74c3c", "#e67e22", "#f1c40f", "#2ecc71", "#27ae60"];
  return { checks, score, label: labels[score], color: colors[score] };
}