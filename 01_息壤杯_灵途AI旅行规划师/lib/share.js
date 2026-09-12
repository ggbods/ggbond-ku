function toBase64Url(value) {
  const bytes = new TextEncoder().encode(JSON.stringify(value));
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
}

function fromBase64Url(value) {
  const normalized = value.replaceAll("-", "+").replaceAll("_", "/");
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
  const binary = atob(padded);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return JSON.parse(new TextDecoder().decode(bytes));
}

export function createShareUrl(bundle) {
  const portable = {
    plans: bundle.plans,
    variantNames: bundle.variantNames,
    form: bundle.form,
    meta: { shared: true },
  };
  return `${window.location.origin}/plan/result?share=${toBase64Url(portable)}`;
}

export function readSharedBundle(value) {
  try {
    const bundle = fromBase64Url(value);
    return Array.isArray(bundle?.plans) && bundle.plans.length ? bundle : null;
  } catch {
    return null;
  }
}

export function planToMarkdown(plan) {
  const lines = [`# ${plan.title}`, "", plan.summary || "", ""];
  for (const day of plan.days || []) {
    lines.push(`## 第 ${day.day} 天：${day.title}`, "");
    for (const item of day.items || []) {
      lines.push(`- **${item.period}｜${item.spot}**：${item.activity}`);
      if (item.transport) lines.push(`  - 交通：${item.transport}`);
      if (item.tips) lines.push(`  - 提醒：${item.tips}`);
    }
    lines.push("");
  }
  if (plan.food?.length) {
    lines.push("## 美食", "", ...plan.food.map((item) => `- ${item.name}（${item.venue}）：${item.desc}`), "");
  }
  if (plan.transport?.summary || plan.transport?.items?.length) {
    lines.push("## 交通", "");
    if (plan.transport.summary) lines.push(plan.transport.summary, "");
    if (plan.transport.items?.length) {
      lines.push(...plan.transport.items.map((item) => `- ${item}`), "");
    }
  }
  if (plan.budget?.breakdown?.length) {
    lines.push("## 预算", "");
    lines.push(
      ...plan.budget.breakdown.map(
        (item) => `- ${item.category}：¥${item.amount}${item.note ? `（${item.note}）` : ""}`
      )
    );
    lines.push(`- **合计：¥${plan.budget.total ?? "-"}**`, "");
  }
  if (plan.tips?.length) lines.push("## 出行提醒", "", ...plan.tips.map((tip) => `- ${tip}`), "");
  return lines.join("\n");
}

export function downloadMarkdown(plan) {
  const blob = new Blob([planToMarkdown(plan)], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${plan.destination || "旅行"}-攻略.md`;
  link.click();
  URL.revokeObjectURL(url);
}
