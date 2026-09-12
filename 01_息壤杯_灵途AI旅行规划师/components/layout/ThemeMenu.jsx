"use client";

import { useState } from "react";
import { useTheme } from "@/components/providers/AppProvider";

const MODES = [
  { value: "system", label: "跟随系统", icon: "fa-circle-half-stroke" },
  { value: "light", label: "浅色", icon: "fa-sun" },
  { value: "dark", label: "深色", icon: "fa-moon" },
];

const SWATCHES = {
  brass: "#b8841c",
  star: "#4f9ef8",
  forest: "#1f5c3d",
};

export default function ThemeMenu() {
  const [open, setOpen] = useState(false);
  const { mode, setMode, accent, setAccent, accents } = useTheme();

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="icon-btn"
        aria-label="外观设置"
        aria-expanded={open}
        title="外观设置"
      >
        <i className="fa-solid fa-palette" aria-hidden="true" />
      </button>

      {open && (
        <div className="theme-menu absolute right-0 top-[calc(100%+0.6rem)] z-[900] w-48 p-2">
          {MODES.map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => setMode(item.value)}
              className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left t-fluid transition ${
                mode === item.value
                  ? "bg-accent/12 text-accent"
                  : "text-body hover:text-accent"
              }`}
              aria-pressed={mode === item.value}
            >
              <i className={`fa-solid ${item.icon} w-4`} aria-hidden="true" />
              {item.label}
            </button>
          ))}
          <div className="my-2 hairline" />
          <div className="flex items-center justify-between px-3 py-1">
            <span className="t-small text-dim">主题色</span>
            <div className="flex gap-2">
              {accents.map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setAccent(value)}
                  className="h-6 w-6 rounded-full border-2"
                  style={{
                    backgroundColor: SWATCHES[value],
                    borderColor: accent === value ? "var(--ink)" : "transparent",
                  }}
                  aria-label={`切换为${value}主题色`}
                  aria-pressed={accent === value}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
