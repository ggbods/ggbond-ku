"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import StepBasics from "./StepBasics";
import StepPreferences from "./StepPreferences";
import StepError from "./StepError";
import LoadingOverlay from "./LoadingOverlay";
import { savePlan, saveToHistory } from "@/lib/planStore";
import { loadProfile, saveProfile } from "@/lib/profileStore";
import LoginModal from "@/components/auth/LoginModal";
import { isLoggedIn, authHeaders } from "@/lib/authClient";
import { formatInterests, normalizeInterests } from "@/lib/interests";

const STEPS = ["基本信息", "偏好问答", "确认提交"];

const initialForm = {
  destination: "",
  days: 4,
  people: 2,
  budget: 5000,
  departureCity: "",
  pace: "适中",
  with: "",
  foodPreference: "",
  interests: [], // 有序多选，最多 3 个，越靠前权重越大
  extra: "",
  variants: 1,
  profileTags: [],
};

function ReviewRow({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg bg-white/5 px-4 py-2.5">
      <span className="shrink-0 t-small text-dim">{label}</span>
      <span className="text-right t-fluid font-medium text-ink">
        {value || "—"}
      </span>
    </div>
  );
}

export default function FormShell({ initialDestination = "" }) {
  const router = useRouter();
  const [form, setForm] = useState({
    ...initialForm,
    destination: initialDestination || initialForm.destination,
  });
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  // 是否已有目的地：null=先询问，has=有，none=无（跳推荐）
  const [gate, setGate] = useState(null);
  // 生成前登录门槛
  const [showLogin, setShowLogin] = useState(false);

  useEffect(() => {
    const profile = loadProfile();
    const timer = window.setTimeout(() => {
      setForm((current) => ({
        ...current,
        pace: current.pace === initialForm.pace ? profile.pace || current.pace : current.pace,
        with: current.with || profile.with,
        foodPreference: current.foodPreference || profile.foodPreference,
        interests:
          current.interests?.length > 0
            ? current.interests
            : normalizeInterests(profile.interests),
        people: Number(profile.people) > 0 ? Number(profile.people) : current.people,
        profileTags: profile.profileTags || [],
      }));
    });
    return () => window.clearTimeout(timer);
  }, []);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function validateBasics() {
    const errs = [];
    if (!form.destination.trim()) errs.push("请填写目的地");
    const days = Number(form.days);
    if (!Number.isInteger(days) || days < 1 || days > 14) {
      errs.push("出行天数需为 1~14 的整数");
    }
    const people = Number(form.people);
    if (!Number.isInteger(people) || people < 1 || people > 20) {
      errs.push("出行人数需为 1~20 的整数");
    }
    // 预算规则：至少 100 元；异常值提示重新输入；超出上限提交时按上限算
    const budgetRaw = Number(form.budget);
    if (form.budget === "" || form.budget === null || !Number.isFinite(budgetRaw)) {
      errs.push("预算需为有效数字（至少 100 元）");
    } else if (budgetRaw < 100) {
      errs.push("预算太少（至少需要 100 元），否则没必要规划");
    }
    return errs;
  }

  function handleNext() {
    setError(null);
    if (step === 0) {
      const errs = validateBasics();
      if (errs.length) {
        setError(errs.join("；"));
        return;
      }
    }
    setStep((s) => s + 1);
  }

  async function doGenerate() {
    setError(null);
    setLoading(true);
    saveProfile(form);
    try {
      const res = await fetch("/api/generate-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({
          ...form,
          days: Number(form.days),
          people: Number(form.people) || 1,
          interests: normalizeInterests(form.interests),
          // 预算封顶：超出上限按上限算
          budget: Math.min(999999999, Math.max(100, Number(form.budget))),
          variants: Number(form.variants) || 1,
        }),
      });
      const data = await res.json();
      if (!data.ok) {
        // 登录已过期/游客：弹出登录
        if (res.status === 401 && data.error?.code === "LOGIN_REQUIRED") {
          setShowLogin(true);
          return;
        }
        setError(data.error?.message || "生成失败，请重试");
        return;
      }
      const plans = Array.isArray(data.plans) && data.plans.length > 0
        ? data.plans
        : [data.plan];
      const bundle = {
        plans,
        variantNames: Array.isArray(data.variantNames)
          ? data.variantNames
          : ["默认方案"],
        meta: data.meta,
        form,
      };
      const historyId = saveToHistory(bundle);
      savePlan({ ...bundle, historyId }); // 当前展示
      // 有登录态则同步历史到服务器（游客会被服务端拒绝，忽略即可）
      if (isLoggedIn()) {
        fetch("/api/history", {
          method: "POST",
          headers: { "Content-Type": "application/json", ...authHeaders() },
          body: JSON.stringify({ bundle: { ...bundle, historyId } }),
        }).catch(() => null);
      }
      router.push("/plan/result");
    } catch {
      setError("网络异常，请检查服务是否在运行");
    } finally {
      setLoading(false);
    }
  }

  // #5 生成前要求登录（游客也可继续）
  function handleSubmit() {
    if (!isLoggedIn()) {
      setShowLogin(true);
      return;
    }
    doGenerate();
  }

  const progress = ((step + 1) / STEPS.length) * 100;

  // #6 先询问是否有目的地；没有则跳转到 AI 推荐目的地
  if (gate === null) {
    return (
      <div className="wrap-form page-pad">
        <div className="text-center">
          <span className="eyebrow">Step 00 · Orientation</span>
          <h1 className="gradient-text h-display mt-4">开始 AI 规划</h1>
          <p className="mt-3 t-lead text-body">
            先告诉我，你已经有想去的目的地了吗？
          </p>
        </div>
        <div className="card brass-card card-pad mt-8 grid gap-4 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => setGate("has")}
            className="card card-hover card-pad-sm flex flex-col items-center gap-2 text-center"
          >
            <span className="text-3xl" aria-hidden="true">📍</span>
            <span className="h-card text-ink">有目的地</span>
            <span className="t-small text-body">我知道要去哪，直接开始规划</span>
          </button>
          <button
            type="button"
            onClick={() => router.push("/plan/recommend")}
            className="card card-hover card-pad-sm flex flex-col items-center gap-2 text-center"
          >
            <span className="text-3xl" aria-hidden="true">✨</span>
            <span className="h-card text-ink">还没有目的地</span>
            <span className="t-small text-body">让 AI 根据我的喜好推荐</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="wrap-form page-pad">
      <div className="text-center">
        <span className="eyebrow">Step {String(step + 1).padStart(2, "0")} · {STEPS[step]}</span>
        <h1 className="gradient-text h-display mt-4">开始 AI 规划</h1>
        <p className="mt-3 t-lead text-body">
          三步填写需求，AI 为你生成专属旅行攻略
        </p>
      </div>

      {/* 进度条 */}
      <div className="mt-8">
        <div className="flex justify-between gap-2 t-small font-medium text-dim">
          {STEPS.map((s, i) => (
            <span key={s} className={i <= step ? "text-accent" : ""}>
              {i + 1}. {s}
            </span>
          ))}
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* 步骤内容 */}
      <div className="card brass-card card-pad mt-8">
        {step === 0 && <StepBasics form={form} update={update} />}
        {step === 1 && <StepPreferences form={form} update={update} />}
        {step === 2 && (
          <div className="space-y-2">
            <p className="mb-4 t-fluid font-semibold text-body">
              请确认以下信息，点击「生成攻略」开始：
            </p>
            <ReviewRow label="目的地" value={form.destination} />
            <ReviewRow label="出行天数" value={`${form.days} 天`} />
            <ReviewRow label="出行人数" value={`${form.people} 人`} />
            <ReviewRow label="总预算" value={`${form.budget} 元`} />
            <ReviewRow label="出发城市" value={form.departureCity} />
            <ReviewRow label="旅行节奏" value={form.pace} />
            <ReviewRow label="同游人群" value={form.with} />
            <ReviewRow label="美食口味" value={form.foodPreference} />
            <ReviewRow label="感兴趣的" value={formatInterests(form.interests)} />
            <ReviewRow label="偏好画像" value={form.profileTags?.join("、")} />
            <ReviewRow label="生成方案" value={`${form.variants} 个`} />
            <ReviewRow label="其他要求" value={form.extra} />
          </div>
        )}

        {error && <StepError message={error} />}
      </div>

      {/* 操作按钮 */}
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        {step > 0 ? (
          <button
            type="button"
            onClick={() => {
              setError(null);
              setStep((s) => s - 1);
            }}
            className="action-secondary"
          >
            <i className="fa-solid fa-arrow-left" aria-hidden="true" />
            上一步
          </button>
        ) : (
          <span />
        )}
        {step < STEPS.length - 1 ? (
          <button
            type="button"
            onClick={handleNext}
            className="btn-primary"
          >
            下一步 →
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="btn-primary"
          >
            {loading ? "正在生成…" : "生成攻略 🎉"}
          </button>
        )}
      </div>

      {loading && <LoadingOverlay />}
      <LoginModal
        open={showLogin}
        onClose={() => setShowLogin(false)}
        onSuccess={() => {
          setShowLogin(false);
          doGenerate();
        }}
      />
    </div>
  );
}
