function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

export function refineMockPlan(source, instruction) {
  const plan = clone(source);
  const request = String(instruction || "").trim();
  const dayMatch = request.match(/第\s*(\d+)\s*天/);
  const dayNumber = dayMatch ? Number(dayMatch[1]) : null;
  const day = dayNumber ? plan.days?.find((item) => item.day === dayNumber) : null;

  if (day && /少走路|不想走|腿脚|老人/.test(request)) {
    day.items = day.items.map((item) => ({
      ...item,
      transport: item.transport ? `${item.transport}；优先短距离接驳，减少步行` : "优先打车或接驳，减少步行",
    }));
  }

  if (/素食|清真|不吃肉|早餐/.test(request)) {
    plan.food = (plan.food || []).map((item) => ({
      ...item,
      desc: `${item.desc}；可向店家备注${/素食/.test(request) ? "素食" : "饮食偏好"}`,
    }));
    const target = day || plan.days?.[0];
    if (target?.items?.[0]) {
      target.items[0].activity = `${target.items[0].activity}；早餐按${/素食/.test(request) ? "素食" : "你的口味"}安排`;
    }
  }

  if (/预算|省钱|便宜|节约/.test(request) && plan.budget) {
    plan.budget.breakdown = plan.budget.breakdown.map((item) =>
      item.category === "购物" ? { ...item, amount: Math.round(item.amount * 0.5), note: "按需购买，优先体验" } : item
    );
    plan.budget.total = plan.budget.breakdown.reduce((sum, item) => sum + item.amount, 0);
  }

  plan.summary = `${plan.summary || ""} 已根据“${request}”完成局部调整。`;
  plan.tips = [...new Set([...(plan.tips || []), `本次调整：${request}`])].slice(0, 10);
  return plan;
}
