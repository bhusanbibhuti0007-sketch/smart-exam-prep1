// src/firebase/firebaseConfig.js
// =============================================
// STEP 1: Go to https://console.firebase.google.com
// STEP 2: Create a new project (free Spark plan)
// STEP 3: Add a Web App, copy your config below
// STEP 4: Enable Authentication → Email/Password (we use username+password stored in Firestore)
// STEP 5: Enable Firestore Database → Start in test mode
// =============================================

import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// 🔴 REPLACE these values with your own Firebase project config
const firebaseConfig = {
  apiKey: "AIzaSyBU8sRfNgSmxsOUUmJoJbupE3ygcxWKfhM",
  authDomain: "smart-exam-preparation-system.firebaseapp.com",
  projectId: "smart-exam-preparation-system",
  storageBucket: "smart-exam-preparation-system.firebasestorage.app",
  messagingSenderId: "566284679196",
  appId: "1:566284679196:web:ed6ef383509066f46047d9",
  measurementId: "G-FJ2GH8NKNL"
};
const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
export default app;
