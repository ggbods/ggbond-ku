// localStorage 读写封装（浏览器端使用）
// 说明：未来要加"保存攻略/用户登录"，把这里换成数据库读写即可，页面代码不用动。

const KEY = "ai_plan_v1"; // 当前展示的攻略
const HISTORY_KEY = "ai_plan_history"; // 攻略历史库

export function savePlan(data) {
  try {
    localStorage.setItem(KEY, JSON.stringify(data));
  } catch {
    /* 隐私模式或禁用存储时静默失败 */
  }
}

export function loadPlan() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function clearPlan() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* 忽略 */
  }
}

/* ===== 攻略历史库 ===== */

export function saveToHistory({ plans, variantNames, meta, form }) {
  try {
    const list = loadHistory();
    const entry = {
      id:
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : String(Date.now()),
      createdAt: Date.now(),
      plans,
      variantNames,
      meta,
      form,
    };
    list.unshift(entry);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(list.slice(0, 50)));
    return entry.id;
  } catch {
    return null;
  }
}

export function updateHistoryEntry(id, bundle) {
  if (!id) return false;
  try {
    const list = loadHistory();
    const index = list.findIndex((entry) => entry.id === id);
    if (index < 0) return false;
    list[index] = {
      ...list[index],
      plans: bundle.plans,
      variantNames: bundle.variantNames,
      meta: bundle.meta,
      form: bundle.form,
      updatedAt: Date.now(),
    };
    localStorage.setItem(HISTORY_KEY, JSON.stringify(list));
    return true;
  } catch {
    return false;
  }
}

export function loadHistory() {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function removeFromHistory(id) {
  try {
    const list = loadHistory().filter((e) => e.id !== id);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(list));
  } catch {
    /* 忽略 */
  }
}

export function clearHistory() {
  try {
    localStorage.removeItem(HISTORY_KEY);
  } catch {
    /* 忽略 */
  }
}
