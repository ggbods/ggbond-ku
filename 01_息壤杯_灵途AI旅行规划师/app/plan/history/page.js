"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  loadHistory,
  removeFromHistory,
  clearHistory,
  savePlan,
} from "@/lib/planStore";
import { isLoggedIn, authHeaders } from "@/lib/authClient";

function formatDate(ts) {
  try {
    return new Date(ts).toLocaleString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

export default function HistoryPage() {
  const router = useRouter();
  const [list, setList] = useState(null);

  // #5 历史同步：账户用户读服务器（跨设备），游客/未登录读本地；
  // 首次登录若服务器为空、本地有历史，自动迁移到账户。
  async function reload() {
    if (!isLoggedIn()) {
      setList(loadHistory());
      return;
    }
    try {
      let res = await fetch("/api/history", { headers: authHeaders() });
      let data = await res.json();
      if (!data.ok) {
        setList(loadHistory());
        return;
      }
      let serverList = data.history || [];
      const local = loadHistory();
      if (serverList.length === 0 && local.length > 0) {
        for (const entry of local) {
          await fetch("/api/history", {
            method: "POST",
            headers: { "Content-Type": "application/json", ...authHeaders() },
            body: JSON.stringify({
              bundle: {
                plans: entry.plans,
                variantNames: entry.variantNames,
                meta: entry.meta,
                form: entry.form,
                historyId: entry.id,
              },
            }),
          }).catch(() => null);
        }
        res = await fetch("/api/history", { headers: authHeaders() });
        data = await res.json();
        serverList = data.history || [];
      }
      setList(serverList);
    } catch {
      setList(loadHistory());
    }
  }

  useEffect(() => {
    const raf = window.requestAnimationFrame(() => {
      reload();
    });
    return () => window.cancelAnimationFrame(raf);
  }, []);

  if (list === null) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-body">
        加载中…
      </div>
    );
  }

  function openEntry(entry) {
    savePlan({
      plans: entry.plans,
      variantNames: entry.variantNames,
      meta: entry.meta,
      form: entry.form,
      historyId: entry.id,
    });
    router.push("/plan/result");
  }

  async function handleDelete(id) {
    removeFromHistory(id); // 本地同步删除（游客/本地模式）
    if (isLoggedIn()) {
      await fetch(`/api/history?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
        headers: authHeaders(),
      }).catch(() => null);
    }
    await reload();
  }

  async function handleClear() {
    if (!window.confirm("确定清空全部攻略历史吗？")) return;
    clearHistory();
    if (isLoggedIn()) {
      await fetch("/api/history?all=1", {
        method: "DELETE",
        headers: authHeaders(),
      }).catch(() => null);
    }
    await reload();
  }

  return (
    <div className="wrap-narrow page-pad">
      <div className="mb-8 text-center">
        <span className="eyebrow">Archive · 攻略库</span>
        <h1 className="gradient-text h-display mt-4">
          我的攻略历史
        </h1>
        <p className="mt-3 t-lead text-body">
          登录后跨设备同步，最多保留最近 50 份
        </p>
      </div>

      {list.length === 0 ? (
        <div className="card card-pad text-center">
          <div className="mb-3 text-5xl">🗂️</div>
          <p className="text-body">还没有保存的攻略</p>
          <button
            type="button"
            onClick={() => router.push("/plan")}
            className="btn-primary mt-6"
          >
            去生成第一份攻略 →
          </button>
        </div>
      ) : (
        <>
          <div className="mb-6 text-right">
            <button
              type="button"
              onClick={handleClear}
              className="text-sm text-dim transition hover:text-red-400"
            >
              <i className="fa-solid fa-trash-can mr-1" aria-hidden="true" />
              清空全部
            </button>
          </div>

          <div className="space-y-4">
            {list.map((entry) => {
              const first = entry.plans?.[0] || entry.plan;
              if (!first) return null;
              const count = Array.isArray(entry.plans) ? entry.plans.length : 1;
              return (
                <div
                  key={entry.id}
                  className="card card-hover card-pad-sm flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <button
                    type="button"
                    onClick={() => openEntry(entry)}
                    className="min-w-0 flex-1 text-left"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full border border-accent/30 bg-accent/10 px-3 py-0.5 t-small font-medium text-accent">
                        📍 {first.destination}
                      </span>
                      {count > 1 && (
                        <span className="rounded-full bg-white/10 px-2.5 py-0.5 t-small text-body">
                          {count} 个方案
                        </span>
                      )}
                    </div>
                    <h3 className="mt-2 h-card text-ink">{first.title}</h3>
                    <p className="mt-1 line-clamp-2 t-fluid text-body">
                      {first.summary}
                    </p>
                    <p className="mt-1 t-small text-dim">
                      {formatDate(entry.createdAt)} · {first.days?.length || "-"} 天
                      {entry.form?.people ? ` · ${entry.form.people} 人` : ""} ·
                      ¥{first.budget?.total ?? "-"}
                    </p>
                  </button>
                  <div className="flex shrink-0 gap-2">
                    <button
                      type="button"
                      onClick={() => openEntry(entry)}
                      className="pill pill-active"
                    >
                      查看
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(entry.id)}
                      className="rounded-full border border-white/15 px-4 py-2 t-small text-body transition hover:border-red-500/40 hover:text-red-400"
                    >
                      删除
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      <div className="mt-10 text-center">
        <button
          type="button"
          onClick={() => router.push("/plan")}
          className="text-sm text-dim transition hover:text-accent"
        >
          ← 返回规划
        </button>
      </div>
    </div>
  );
}
