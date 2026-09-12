"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import PlanHeader from "@/components/result/PlanHeader";
import DayTimeline from "@/components/result/DayTimeline";
import FoodList from "@/components/result/FoodList";
import TransportCard from "@/components/result/TransportCard";
import BudgetTable from "@/components/result/BudgetTable";
import TipsList from "@/components/result/TipsList";
import VariantTabs from "@/components/result/VariantTabs";
import CompareTable from "@/components/result/CompareTable";
import RefinePanel from "@/components/result/RefinePanel";
import PlanFeedback from "@/components/result/PlanFeedback";
import PlanActions from "@/components/result/PlanActions";
import { loadPlan, savePlan, updateHistoryEntry } from "@/lib/planStore";
import { readSharedBundle } from "@/lib/share";
import { isLoggedIn, authHeaders } from "@/lib/authClient";

export default function ResultPage() {
  const router = useRouter();
  const [data, setData] = useState(null);
  const [ready, setReady] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [showCompare, setShowCompare] = useState(false);

  // localStorage 必须在 useEffect 里读，避免 hydration 不一致；
  // 用异步任务调度状态恢复，也避免后台标签页暂停 requestAnimationFrame。
  useEffect(() => {
    const sharedValue = new URLSearchParams(window.location.search).get("share");
    const stored = sharedValue ? readSharedBundle(sharedValue) : loadPlan();
    if (!stored?.plan && !stored?.plans) {
      router.replace("/plan");
      return;
    }
    const timer = window.setTimeout(() => {
      setData(stored);
      setReady(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [router]);

  if (!ready) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-body">
        加载中…
      </div>
    );
  }

  const { plan, plans, variantNames, meta } = data;
  // 兼容旧数据：可能只存了 plan
  const allPlans =
    Array.isArray(plans) && plans.length > 0
      ? plans
      : plan
        ? [plan]
        : [];
  const names =
    Array.isArray(variantNames) && variantNames.length === allPlans.length
      ? variantNames
      : allPlans.map((_, i) => `方案 ${i + 1}`);
  const activePlan = allPlans[activeIndex] || allPlans[0];
  const multi = allPlans.length > 1;

  function handleRefined(refinedPlan, refineMeta) {
    const nextPlans = [...allPlans];
    nextPlans[activeIndex] = refinedPlan;
    const nextData = {
      ...data,
      plans: nextPlans,
      plan: nextPlans[0],
      meta: { ...data.meta, lastRefinedAt: Date.now(), refineMock: Boolean(refineMeta?.mock) },
    };
    setData(nextData);
    savePlan(nextData);
    updateHistoryEntry(data.historyId, nextData);
    // 账户用户：微调结果同步到服务器（游客会被拒绝，忽略）
    if (isLoggedIn() && data.historyId) {
      fetch("/api/history", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({ historyId: data.historyId, bundle: nextData }),
      }).catch(() => null);
    }
  }

  return (
    <div className="wrap-narrow page-pad">
      {meta?.mock && (
        <div className="mb-6 rounded-xl border border-warm/30 bg-warm/10 px-4 py-3 t-fluid text-warm">
          <i className="fa-solid fa-circle-exclamation mr-2" aria-hidden="true" />
          当前为<b>示例攻略</b>（未连接真实 AI）。在项目根目录的
          <code className="mx-1 rounded bg-warm/20 px-1.5 py-0.5">.env.local</code>
          配置 DeepSeek API 密钥后，即可生成真实攻略。
        </div>
      )}

      {meta?.shared && (
        <div className="mb-6 rounded-lg border border-accent/25 bg-accent/10 px-4 py-3 text-sm text-body">
          <i className="fa-solid fa-share-nodes mr-2 text-accent" aria-hidden="true" />
          你正在查看一份共享攻略。继续调整后会自动保存到本机。
        </div>
      )}

      {multi && (
        <>
          <VariantTabs
            names={names}
            active={activeIndex}
            onChange={setActiveIndex}
          />
          <div className="mb-6 text-center">
            <button
              type="button"
              onClick={() => setShowCompare((s) => !s)}
              className="rounded-full border border-accent/40 px-5 py-2 text-sm font-medium text-accent transition hover:bg-accent hover:text-deep"
            >
              <i className="fa-solid fa-scale-balanced mr-1.5" aria-hidden="true" />
              {showCompare ? "收起对比" : "多方案对比"}
            </button>
          </div>
          {showCompare && (
            <CompareTable plans={allPlans} names={names} />
          )}
        </>
      )}

      <PlanHeader plan={activePlan} />
      <DayTimeline days={activePlan.days} />
      <FoodList food={activePlan.food} />
      <TransportCard transport={activePlan.transport} />
      <BudgetTable budget={activePlan.budget} />
      <TipsList tips={activePlan.tips} />
      <RefinePanel plan={activePlan} onRefined={handleRefined} />
      <PlanFeedback plan={activePlan} />
      <PlanActions
        plan={activePlan}
        bundle={data}
        onReplan={() => router.push("/plan")}
        onHistory={() => router.push("/plan/history")}
      />
    </div>
  );
}
