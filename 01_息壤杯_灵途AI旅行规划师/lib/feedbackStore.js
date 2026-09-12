const FEEDBACK_KEY = "lingtu_plan_feedback_v1";

export function saveFeedback(plan, feedback) {
  try {
    const all = JSON.parse(localStorage.getItem(FEEDBACK_KEY) || "[]");
    const entry = {
      id: crypto.randomUUID?.() || String(Date.now()),
      planTitle: String(plan?.title || "旅行攻略"),
      destination: String(plan?.destination || ""),
      rating: Number(feedback.rating) || 0,
      useful: feedback.useful ?? null,
      createdAt: Date.now(),
    };
    all.unshift(entry);
    localStorage.setItem(FEEDBACK_KEY, JSON.stringify(all.slice(0, 100)));
    return entry;
  } catch {
    return null;
  }
}
