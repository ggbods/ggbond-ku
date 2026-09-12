"use client";

import { useState } from "react";
import Link from "next/link";
import ThemeMenu from "./ThemeMenu";
import LoginModal from "@/components/auth/LoginModal";
import { useAuth } from "@/components/providers/AuthProvider";

// 主导航：锚点用绝对路径，在 /plan 等子页面点击也能回首页对应板块
const LINKS = [
  { href: "/#features", label: "核心能力" },
  { href: "/#process", label: "使用流程" },
  { href: "/#destinations", label: "热门目的地" },
  { href: "/#story", label: "关于我们" },
];

const TOOLS = [
  { href: "/plan/recommend", label: "推荐目的地", icon: "fa-wand-magic-sparkles" },
  { href: "/plan/history", label: "攻略库", icon: "fa-book-open" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const { user, logout } = useAuth();

  return (
    <header className="site-header">
      <div className="wrap header-inner">
        <Link href="/" className="brand" onClick={() => setOpen(false)}>
          <span className="brand-mark">
            <i className="fa-solid fa-compass" aria-hidden="true" />
          </span>
          <span className="brand-name">
            灵<span>途</span>
          </span>
        </Link>

        <nav className="nav-links" aria-label="主导航">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href}>
              {l.label}
            </Link>
          ))}
          {TOOLS.map((t) => (
            <Link key={t.href} href={t.href}>
              <i className={`fa-solid ${t.icon} mr-1.5`} aria-hidden="true" />
              {t.label}
            </Link>
          ))}
        </nav>

        <div className="header-actions">
          {user ? (
            <button
              type="button"
              onClick={() => {
                if (window.confirm("退出登录？")) logout();
              }}
              className="chip-btn"
              title="退出登录"
            >
              <i className="fa-solid fa-user" aria-hidden="true" />
              <span className="hidden max-w-[6rem] truncate sm:inline">
                {user.username || "游客"}
              </span>
            </button>
          ) : (
            <button type="button" onClick={() => setLoginOpen(true)} className="chip-btn">
              <i className="fa-solid fa-right-to-bracket" aria-hidden="true" />
              <span className="hidden sm:inline">登录</span>
            </button>
          )}

          <ThemeMenu />

          <Link href="/plan" className="cta-pill">
            免费生成攻略
            <i className="fa-solid fa-arrow-right" aria-hidden="true" />
          </Link>

          <button
            type="button"
            className="icon-btn nav-toggle"
            onClick={() => setOpen((o) => !o)}
            aria-label={open ? "关闭菜单" : "打开菜单"}
            aria-expanded={open}
          >
            <i className={`fa-solid ${open ? "fa-xmark" : "fa-bars"}`} aria-hidden="true" />
          </button>
        </div>
      </div>

      {open && (
        <div className="nav-panel">
          {[...LINKS, ...TOOLS].map((l) => (
            <Link key={l.href} href={l.href} onClick={() => setOpen(false)}>
              {l.icon && <i className={`fa-solid ${l.icon} mr-2`} aria-hidden="true" />}
              {l.label}
            </Link>
          ))}
          <Link href="/plan" className="cta-pill mt-3 justify-center" onClick={() => setOpen(false)}>
            免费生成攻略
            <i className="fa-solid fa-arrow-right" aria-hidden="true" />
          </Link>
        </div>
      )}

      <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />
    </header>
  );
}
