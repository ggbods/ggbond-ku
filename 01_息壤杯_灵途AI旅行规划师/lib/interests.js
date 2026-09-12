// 「感兴趣的」有序多选：最多 3 个，越靠前权重越大（1 = 优先级最高）
// 前后端共用，保证 UI 顺序与提示词权重一致。

export const INTERESTS = [
  "自然风光",
  "历史文化",
  "美食探店",
  "购物休闲",
  "夜生活",
  "亲子游乐",
  "小众探索",
  "全面体验",
];

export const MAX_INTERESTS = 3;

/** 权重文案：第 1 位权重最高 */
const WEIGHT_LABEL = ["最重要", "次重要", "再次之"];

/** 点击切换：已选则移除（后续项自动前移），未选且未满则追加到末位 */
export function toggleInterest(list, value, max = MAX_INTERESTS) {
  const current = normalizeInterests(list, max);
  const index = current.indexOf(value);
  if (index >= 0) return current.filter((item) => item !== value);
  if (current.length >= max) return current;
  return [...current, value];
}

/** 返回 1 起的优先级序号；未选中返回 null */
export function interestRank(list, value) {
  const index = Array.isArray(list) ? list.indexOf(value) : -1;
  return index < 0 ? null : index + 1;
}

/** 去重、剔除非法值、截断到上限 */
export function normalizeInterests(list, max = MAX_INTERESTS) {
  if (!Array.isArray(list)) return [];
  const seen = new Set();
  const out = [];
  for (const item of list) {
    if (!INTERESTS.includes(item) || seen.has(item)) continue;
    seen.add(item);
    out.push(item);
    if (out.length >= max) break;
  }
  return out;
}

/** UI 展示：自然风光(1) · 美食探店(2) */
export function formatInterests(list) {
  const items = normalizeInterests(list);
  if (items.length === 0) return "";
  return items.map((item, i) => `${item}(${i + 1})`).join(" · ");
}

/** 提示词用：带权重说明，让 AI 知道靠前的更重要 */
export function describeInterests(list) {
  const items = normalizeInterests(list);
  if (items.length === 0) return "未指定";
  return items
    .map((item, i) => `${i + 1}. ${item}（${WEIGHT_LABEL[i] || "参考"}）`)
    .join("；");
}
