// src/pages/AuthPage.js
// Login + Register combined page

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser, loginUser } from "../firebase/firebaseHelpers";
import { useAuth } from "../utils/AuthContext";
import { checkPasswordStrength } from "../utils/aiHelper";
import "../styles/auth.css";

export default function AuthPage() {
  const [mode, setMode] = useState("login"); // "login" | "register"
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const strength = checkPasswordStrength(password);

  const handleSubmit = async () => {
    setError("");
    if (!username.trim() || !password.trim()) {
      setError("Please fill in all fields."); return;
    }
    if (mode === "register" && strength.score < 3) {
      setError("Password is too weak. Please follow the strength hints."); return;
    }
    setLoading(true);
    try {
      let userData;
      if (mode === "register") {
        userData = await registerUser(username.trim(), password);
      } else {
        userData = await loginUser(username.trim(), password);
      }
      login(userData);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-box card">
        <div className="auth-logo">
          <h1>📚 S.E.P.S </h1>
          <p>Your smart study companion</p>
        </div>

        <div className="auth-form">
          <h2 style={{ marginBottom: "0.25rem" }}>
            {mode === "login" ? "Welcome back" : "Create account"}
          </h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginBottom: "0.5rem" }}>
            {mode === "login" ? "Log in to continue studying" : "Join and start preparing smarter"}
          </p>

          {error && <div className="error-msg">{error}</div>}

          <div className="form-group">
            <label>Username</label>
            <input
              type="text"
              placeholder="e.g. john_doe"
              value={username}
              onChange={e => setUsername(e.target.value)}
              autoComplete="username"
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSubmit()}
            />
            {/* Password strength — only shown on register */}
            {mode === "register" && password.length > 0 && (
              <div className="password-strength">
                <div className="strength-bar">
                  <div
                    className="strength-fill"
                    style={{
                      width: `${(strength.score / 5) * 100}%`,
                      background: strength.color
                    }}
                  />
                </div>
                <span className="strength-label" style={{ color: strength.color }}>
                  {strength.label}
                </span>
                <div className="strength-hints">
                  {[
                    { key: "length",    label: "8+ chars" },
                    { key: "uppercase", label: "Uppercase" },
                    { key: "lowercase", label: "Lowercase" },
                    { key: "number",    label: "Number" },
                    { key: "special",   label: "Special (!@#)" }
                  ].map(h => (
                    <span key={h.key} className={`hint ${strength.checks[h.key] ? "pass" : ""}`}>
                      {strength.checks[h.key] ? "✓" : "○"} {h.label}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <button
            className="btn-primary"
            onClick={handleSubmit}
            disabled={loading}
            style={{ width: "100%", marginTop: "0.5rem" }}
          >
            {loading ? "Please wait..." : mode === "login" ? "Log In" : "Register"}
          </button>

          <div className="auth-switch">
            {mode === "login" ? (
              <>Don't have an account?{" "}
                <button onClick={() => { setMode("register"); setError(""); }}>Register here</button>
              </>
            ) : (
              <>Already have an account?{" "}
                <button onClick={() => { setMode("login"); setError(""); }}>Log in</button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}