"use client";
import { useDarkMode } from "../context/DarkModeContext";

export default function DarkModeToggle() {
  const { isDark, toggle } = useDarkMode();

  return (
    <button
      className="btn"
      onClick={toggle}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      style={{
        padding: "8px 12px",
        fontSize: "16px",
        cursor: "pointer",
      }}
    >
      {isDark ? "☀️" : "🌙"}
    </button>
  );
}
