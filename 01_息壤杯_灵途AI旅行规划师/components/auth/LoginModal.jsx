"use client";

import { useState } from "react";
import { useAuth } from "@/components/providers/AuthProvider";

// 登录 / 注册 / 游客 弹窗（无验证码，直接账户密码）
export default function LoginModal({ open, onClose, onSuccess }) {
  const { setAuth } = useAuth();
  const [tab, setTab] = useState("login"); // login | register
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const pill = (active) =>
    `pill ${active ? "pill-active" : ""}`;

  async function submit() {
    setError(null);
    if (tab === "register" && password !== confirm) {
      setError("两次输入的密码不一致");
      return;
    }
    if (tab === "register" && String(password).length < 6) {
      setError("密码至少需要 6 位");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/auth/${tab}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!data.ok) {
        setError(data.error || "操作失败");
        return;
      }
      const info = data.guest ? { guest: true } : { username: data.username };
      setAuth(data.token, info);
      onSuccess?.(info);
      onClose?.();
    } catch {
      setError("网络异常，请重试");
    } finally {
      setLoading(false);
    }
  }

  async function guest() {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/guest", { method: "POST" });
      const data = await res.json();
      if (!data.ok) {
        setError(data.error || "操作失败");
        return;
      }
      setAuth(data.token, { guest: true });
      onSuccess?.({ guest: true });
      onClose?.();
    } catch {
      setError("网络异常，请重试");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[2000] flex items-center justify-center bg-deep/80 p-4 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="card brass-card card-pad w-[min(28rem,94vw)] max-h-[92dvh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !loading) submit();
          if (e.key === "Escape") onClose?.();
        }}
      >
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="font-display text-[clamp(1.3rem,3vw,1.5rem)] text-ink">
            {tab === "login" ? "登录灵途" : "注册账户"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 text-dim transition hover:text-ink"
            aria-label="关闭"
          >
            <i className="fa-solid fa-xmark" aria-hidden="true" />
          </button>
        </div>
        <p className="mb-5 t-fluid leading-relaxed text-body">
          注册后可在<b className="text-accent">手机与电脑间同步攻略</b>；
          游客方式无需注册，数据仅保存在当前设备。
        </p>

        <div className="mb-5 flex gap-2">
          <button type="button" onClick={() => setTab("login")} className={pill(tab === "login")}>
            登录
          </button>
          <button type="button" onClick={() => setTab("register")} className={pill(tab === "register")}>
            注册
          </button>
        </div>

        <div className="space-y-3">
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="用户名"
            className="input-dark"
            autoComplete="username"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={tab === "register" ? "设置密码（至少 6 位）" : "密码"}
            className="input-dark"
            autoComplete={tab === "register" ? "new-password" : "current-password"}
          />
          {tab === "register" && (
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="确认密码"
              className="input-dark"
              autoComplete="new-password"
            />
          )}
        </div>

        {error && (
          <p className="mt-3 rounded-lg bg-red-500/10 px-3 py-2 t-fluid text-red-400">
            {error}
          </p>
        )}

        <button
          type="button"
          onClick={submit}
          disabled={loading}
          className="btn-primary mt-5 w-full justify-center"
        >
          {loading ? "处理中…" : tab === "login" ? "登录" : "注册并登录"}
        </button>

        <div className="mt-3 text-center">
          <button
            type="button"
            onClick={guest}
            disabled={loading}
            className="t-fluid text-dim transition hover:text-accent"
          >
            或以游客身份继续 →
          </button>
        </div>
      </div>
    </div>
  );
}
