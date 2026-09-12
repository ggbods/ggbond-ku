"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { getToken, setToken, clearToken } from "@/lib/authClient";

const AuthContext = createContext(null);

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used inside AuthProvider");
  return value;
}

// 登录状态：user = { username }（账户）| { guest: true }（游客）| null（未登录）
export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // 用 rAF 异步调度，避免在 effect 内同步 setState 级联渲染
    let cancelled = false;
    const raf = window.requestAnimationFrame(() => {
      const token = getToken();
      if (cancelled) return;
      if (!token) {
        setReady(true);
        return;
      }
      fetch("/api/auth/me", { headers: { Authorization: `Bearer ${token}` } })
        .then((r) => r.json())
        .then((data) => {
          if (data.ok) setUser(data.user);
          else clearToken();
        })
        .catch(() => {
          /* 网络异常时保留本地状态 */
        })
        .finally(() => {
          if (!cancelled) setReady(true);
        });
    });
    return () => {
      cancelled = true;
      window.cancelAnimationFrame(raf);
    };
  }, []);

  function setAuth(token, userInfo) {
    setToken(token);
    setUser(userInfo);
  }

  function logout() {
    clearToken();
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, ready, setAuth, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
