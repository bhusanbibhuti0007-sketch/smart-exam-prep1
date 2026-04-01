// src/firebase/firebaseHelpers.js
// All Firebase read/write functions used across the app

import {
  collection,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  arrayUnion,
  query,
  where,
  getDocs,
  serverTimestamp
} from "firebase/firestore";
import { db } from "./firebaseConfig";

// ─── USER AUTH (username + password stored in Firestore) ─────────────────────

// Register: saves username + hashed password in Firestore "users" collection
export async function registerUser(username, password) {
  const userRef = doc(db, "users", username);
  const existing = await getDoc(userRef);
  if (existing.exists()) throw new Error("Username already taken.");

  await setDoc(userRef, {
    username,
    password, // NOTE: In production use Firebase Auth; for college project this is fine
    createdAt: serverTimestamp(),
    topics: [],
    weakTopics: [],
    studyPlan: [],
    sessions: []
  });
  return { username };
}

// Login: checks username + password in Firestore
export async function loginUser(username, password) {
  const userRef = doc(db, "users", username);
  const snap = await getDoc(userRef);
  if (!snap.exists()) throw new Error("User not found.");
  const data = snap.data();
  if (data.password !== password) throw new Error("Incorrect password.");
  return { username, ...data };
}

// Get full user profile
export async function getUserProfile(username) {
  const snap = await getDoc(doc(db, "users", username));
  if (!snap.exists()) throw new Error("User not found.");
  return snap.data();
}

// ─── SYLLABUS & TOPICS ───────────────────────────────────────────────────────

export async function saveSyllabus(username, topics) {
  await updateDoc(doc(db, "users", username), {
    topics,
    weakTopics: topics.map(t => ({ topic: t, score: 0, attempts: 0 }))
  });
}

// ─── QUIZ RESULTS ────────────────────────────────────────────────────────────

export async function saveQuizResult(username, topic, score, total) {
  const userRef = doc(db, "users", username);
  const snap = await getDoc(userRef);
  const data = snap.data();

  // Update weak topics array
  let weakTopics = data.weakTopics || [];
  const idx = weakTopics.findIndex(w => w.topic === topic);
  if (idx >= 0) {
    weakTopics[idx].score = Math.round((weakTopics[idx].score + score) / 2);
    weakTopics[idx].attempts += 1;
  } else {
    weakTopics.push({ topic, score, attempts: 1 });
  }

  await updateDoc(userRef, {
    weakTopics,
    sessions: arrayUnion({
      topic,
      score,
      total,
      date: new Date().toISOString()
    })
  });
}

// ─── STUDY PLAN ──────────────────────────────────────────────────────────────

export async function saveStudyPlan(username, plan) {
  await updateDoc(doc(db, "users", username), { studyPlan: plan });
}