"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Field from "@/components/plan/Field";
import OptionPill from "@/components/plan/OptionPill";
import StepError from "@/components/plan/StepError";
import LoadingOverlay from "@/components/plan/LoadingOverlay";
import LoginModal from "@/components/auth/LoginModal";
import { isLoggedIn, authHeaders } from "@/lib/authClient";
import {
  INTERESTS,
  MAX_INTERESTS,
  toggleInterest,
  interestRank,
  normalizeInterests,
} from "@/lib/interests";

const TRAVEL_TYPES = [
  "海边度假",
  "山水自然",
  "历史古城",
  "都市时尚",
  "美食之旅",
  "亲子乐园",
  "全面体验",
];
const WITH = ["独自", "情侣", "亲子", "朋友", "家庭"];

const initialForm = {
  travelType: "全面体验",
  days: 4,
  people: 2,
  budget: 5000,
  with: "",
  preferences: [], // 有序多选，最多 3 个
  extra: "",
};

export default function RecommendPage() {
  const router = useRouter();
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [recs, setRecs] = useState(null);
  const [showLogin, setShowLogin] = useState(false);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function doRecommend() {
    setError(null);
    setRecs(null);
    setLoading(true);
    try {
      const res = await fetch("/api/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({
          ...form,
          days: Number(form.days),
          people: Number(form.people) || 1,
          preferences: normalizeInterests(form.preferences),
          // 预算封顶
          budget: Math.min(999999999, Math.max(100, Number(form.budget))),
        }),
      });
      const data = await res.json();
      if (!data.ok) {
        if (res.status === 401 && data.error?.code === "LOGIN_REQUIRED") {
          setShowLogin(true);
          return;
        }
        setError(data.error?.message || "推荐失败，请重试");
        return;
      }
      setRecs(data.recommendations);
    } catch {
      setError("网络异常，请检查服务是否在运行");
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit() {
    if (!isLoggedIn()) {
      setShowLogin(true);
      return;
    }
    doRecommend();
  }

  const preferences = Array.isArray(form.preferences) ? form.preferences : [];
  const preferencesFull = preferences.length >= MAX_INTERESTS;

  return (
    <div className="wrap-form page-pad">
      <div className="mb-8 text-center">
        <span className="eyebrow">Inspiration · 灵感探索</span>
        <h1 className="gradient-text h-display mt-4">
          不知道去哪？让 AI 帮你选
        </h1>
        <p className="mt-3 t-lead text-body">
          回答几个问题，AI 为你推荐最合适的旅行目的地
        </p>
      </div>

      {!recs && (
        <div className="card brass-card card-pad">
          <div className="space-y-6">
            <Field label="想去哪类地方">
              <div className="flex flex-wrap gap-2">
                {TRAVEL_TYPES.map((o) => (
                  <OptionPill
                    key={o}
                    label={o}
                    selected={form.travelType === o}
                    onClick={() => update("travelType", o)}
                  />
                ))}
              </div>
            </Field>

            <div className="grid gap-[clamp(0.7rem,1.6vw,1.2rem)] sm:grid-cols-3">
              <Field label="出行天数" hint="1~14 天">
                <input
                  type="number"
                  min={1}
                  max={14}
                  inputMode="numeric"
                  value={form.days}
                  onChange={(e) => update("days", e.target.value)}
                  className="input-dark"
                />
              </Field>
              <Field label="出行人数" hint="1~20 人">
                <input
                  type="number"
                  min={1}
                  max={20}
                  inputMode="numeric"
                  value={form.people}
                  onChange={(e) => update("people", e.target.value)}
                  className="input-dark"
                />
              </Field>
              <Field label="总预算（元）" hint="≥100 元">
                <input
                  type="number"
                  min={100}
                  max={999999999}
                  step={500}
                  inputMode="numeric"
                  value={form.budget}
                  onChange={(e) => update("budget", e.target.value)}
                  className="input-dark"
                />
              </Field>
            </div>

            <Field label="和谁一起">
              <div className="flex flex-wrap gap-2">
                {WITH.map((o) => (
                  <OptionPill
                    key={o}
                    label={o}
                    selected={form.with === o}
                    onClick={() => update("with", o)}
                  />
                ))}
              </div>
            </Field>

            {/* 有序多选：右下角角标即优先级，数字越小权重越大 */}
            <Field
              label="感兴趣的"
              hint={`可多选，最多 ${MAX_INTERESTS} 个；角标数字越小优先级越高`}
            >
              <div className="flex flex-wrap gap-x-2 gap-y-3">
                {INTERESTS.map((o) => {
                  const rank = interestRank(preferences, o);
                  return (
                    <OptionPill
                      key={o}
                      label={o}
                      selected={rank != null}
                      rank={rank}
                      disabled={preferencesFull && rank == null}
                      onClick={() =>
                        update("preferences", toggleInterest(preferences, o))
                      }
                    />
                  );
                })}
              </div>
              <p className="mt-2 t-small text-dim" aria-live="polite">
                {preferences.length === 0
                  ? "还没有选择，AI 将综合考虑"
                  : `已选 ${preferences.length}/${MAX_INTERESTS}：${preferences
                      .map((item, i) => `${i + 1} ${item}`)
                      .join(" · ")}`}
              </p>
            </Field>

            <Field label="其他要求" hint="如：带老人小孩、想玩水上项目等">
              <textarea
                rows={2}
                value={form.extra}
                onChange={(e) => update("extra", e.target.value)}
                placeholder="还有什么想让 AI 特别考虑的？"
                className="input-dark resize-none"
              />
            </Field>
          </div>

          {error && <StepError message={error} />}

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="btn-primary"
            >
              {loading ? "AI 正在思考…" : "让 AI 推荐目的地 ✨"}
            </button>
          </div>
        </div>
      )}

      {recs && (
        <div className="space-y-4">
          <p className="text-center t-lead text-body">
            根据你的需求，AI 为你推荐了这些目的地：
          </p>
          {recs.map((r, i) => (
            <div key={i} className="card card-hover card-pad">
              <div className="flex flex-wrap items-center gap-2">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-sm font-bold text-ink">
                  {i + 1}
                </span>
                <h3 className="h-section text-ink">{r.name}</h3>
                {r.tagline && (
                  <span className="t-small text-accent">{r.tagline}</span>
                )}
              </div>
              {r.why && <p className="mt-3 t-fluid leading-relaxed text-body">{r.why}</p>}
              <div className="mt-3 flex flex-wrap gap-2 t-small">
                {r.bestFor && (
                  <span className="rounded-full bg-white/5 px-3 py-1 text-body">
                    👥 {r.bestFor}
                  </span>
                )}
                {r.bestSeason && (
                  <span className="rounded-full bg-white/5 px-3 py-1 text-body">
                    🍂 最佳季节：{r.bestSeason}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() =>
                  router.push(`/plan?city=${encodeURIComponent(r.name)}`)
                }
                className="btn-primary mt-4"
              >
                去规划 {r.name} →
              </button>
            </div>
          ))}

          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={() => setRecs(null)}
              className="action-secondary"
            >
              ← 重新选择
            </button>
            <button
              type="button"
              onClick={() => router.push("/plan")}
              className="action-secondary"
            >
              直接开始规划
            </button>
          </div>
        </div>
      )}

      {loading && <LoadingOverlay />}
      <LoginModal
        open={showLogin}
        onClose={() => setShowLogin(false)}
        onSuccess={() => {
          setShowLogin(false);
          doRecommend();
        }}
      />
    </div>
  );
}
