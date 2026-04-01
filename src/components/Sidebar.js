// src/components/Sidebar.js
// Navigation sidebar — desktop fixed sidebar + mobile hamburger drawer

import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../utils/AuthContext";
import "../styles/dashboard.css";

const NAV_ITEMS = [
  { path: "/dashboard",   icon: "🏠", label: "Dashboard"      },
  { path: "/syllabus",    icon: "📋", label: "Upload Syllabus" },
  { path: "/quiz",        icon: "🧠", label: "Practice Quiz"   },
  { path: "/weak-topics", icon: "📊", label: "Weak Topics"     },
  { path: "/study-plan",  icon: "📅", label: "Study Planner"   }
];

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  // Close drawer when route changes
  useEffect(() => { setIsOpen(false); }, [location.pathname]);

  // Prevent body scroll when drawer open on mobile
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  const handleLogout = () => { logout(); navigate("/"); };

  const handleNav = (path) => { navigate(path); setIsOpen(false); };

  const SidebarContent = () => (
    <>
      <div className="sidebar-logo">
        📚 SEPS
        <span>Smart study system</span>
      </div>
      <nav className="sidebar-nav">
        {NAV_ITEMS.map(item => (
          <button
            key={item.path}
            className={`nav-item ${location.pathname === item.path ? "active" : ""}`}
            onClick={() => handleNav(item.path)}
          >
            <span className="icon">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>
      <div className="sidebar-user">
        <span className="username">👤 {user?.username}</span>
        <button className="logout-btn" onClick={handleLogout}>Logout</button>
      </div>
    </>
  );

  return (
    <>
      {/* ── Desktop Sidebar ── */}
      <aside className="sidebar" style={{ transform: undefined }}>
        <SidebarContent />
      </aside>

      {/* ── Mobile Top Bar ── */}
      <div className="mobile-topbar">
        <button className="hamburger" onClick={() => setIsOpen(true)} aria-label="Open menu">
          ☰
        </button>
        <span className="logo-text">📚 ExamPrep AI</span>
        <button className="logout-btn" onClick={handleLogout} style={{ fontSize: "0.78rem" }}>
          Logout
        </button>
      </div>

      {/* ── Mobile Drawer Overlay ── */}
      {isOpen && (
        <div className="sidebar-overlay" onClick={() => setIsOpen(false)} />
      )}

      {/* ── Mobile Drawer ── */}
      <aside className={`sidebar ${isOpen ? "open" : ""}`} style={{ zIndex: 200 }}>
        {/* Close button inside drawer */}
        <button
          onClick={() => setIsOpen(false)}
          style={{
            alignSelf: "flex-end",
            background: "none",
            color: "var(--text-secondary)",
            fontSize: "1.3rem",
            marginBottom: "0.5rem",
            padding: "0.25rem 0.5rem",
            borderRadius: "8px"
          }}
          aria-label="Close menu"
        >✕</button>
        <SidebarContent />
      </aside>
    </>
  );
}