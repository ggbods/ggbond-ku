"use client";

import { createContext, useContext, useEffect, useState } from "react";

const THEME_KEY = "lingtu_theme_v1";
const ThemeContext = createContext(null);

// 主题色：brass = 跟随主题（浅色赤陶橙 / 深色蓝宝石），另两个为手动指定
const ACCENTS = {
  brass: null,
  star: { accent: "#4f9ef8", soft: "#7db8ff" },
  forest: { accent: "#1f5c3d", soft: "#3a8b5e" },
};

function applyTheme(mode, accent) {
  const root = document.documentElement;
  const resolvedMode =
    mode === "system"
      ? window.matchMedia("(prefers-color-scheme: light)").matches
        ? "light"
        : "dark"
      : mode;
  root.dataset.theme = resolvedMode;
  root.dataset.accent = accent;

  const colors = ACCENTS[accent];
  if (colors) {
    root.style.setProperty("--accent", colors.accent);
    root.style.setProperty("--accent-soft", colors.soft);
    root.style.setProperty("--color-accent", colors.accent);
    root.style.setProperty("--color-primary", colors.soft);
  } else {
    // 默认：交还给 CSS 主题变量，保证与设计稿一致
    root.style.removeProperty("--accent");
    root.style.removeProperty("--accent-soft");
    root.style.removeProperty("--color-accent");
    root.style.removeProperty("--color-primary");
  }
}

export function useTheme() {
  const value = useContext(ThemeContext);
  if (!value) throw new Error("useTheme must be used inside AppProvider");
  return value;
}

export default function AppProvider({ children }) {
  const [settings, setSettings] = useState(null);
  const mode = settings?.mode || "system";
  const accent = settings?.accent || "brass";
  const setMode = (value) => setSettings((current) => ({ ...(current || { accent }), mode: value }));
  const setAccent = (value) => setSettings((current) => ({ ...(current || { mode }), accent: value }));

  useEffect(() => {
    let savedSettings = { mode: "system", accent: "brass" };
    try {
      const saved = JSON.parse(localStorage.getItem(THEME_KEY) || "null");
      if (["light", "dark", "system"].includes(saved?.mode)) savedSettings.mode = saved.mode;
      if (Object.hasOwn(ACCENTS, saved?.accent)) savedSettings.accent = saved.accent;
    } catch {
      // Keep system defaults when saved settings are malformed.
    }
    const timer = window.setTimeout(() => setSettings(savedSettings), 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!settings) return undefined;
    applyTheme(mode, accent);
    localStorage.setItem(THEME_KEY, JSON.stringify({ mode, accent }));

    if (mode !== "system") return undefined;
    const media = window.matchMedia("(prefers-color-scheme: light)");
    const onChange = () => applyTheme(mode, accent);
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, [mode, accent, settings]);

  useEffect(() => {
    if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) {
      return undefined;
    }
    const register = () => navigator.serviceWorker.register("/sw.js").catch(() => null);
    window.addEventListener("load", register);
    return () => window.removeEventListener("load", register);
  }, []);

  const value = { mode, setMode, accent, setAccent, accents: Object.keys(ACCENTS) };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
