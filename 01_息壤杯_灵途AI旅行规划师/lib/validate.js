// 表单参数校验与默认值归一化

import { normalizeInterests } from "./interests";

// 预算规则：最低 100 元（太少没必要），无上限但封顶（超出按上限算）
export const BUDGET_MIN = 100;
export const BUDGET_MAX = 999999999;
export const PEOPLE_MIN = 1;
export const PEOPLE_MAX = 20;

const PACE = ["悠闲", "适中", "紧凑"];
const WITH_OPTIONS = ["独自", "情侣", "亲子", "朋友", "家庭"];
const FOOD = ["清淡", "微辣", "无辣不欢", "甜口", "无所谓"];
const PROFILE_TAGS = ["爱拍照", "爱美食", "少走路", "亲子友好", "预算优先", "小众探索"];

/** 预算：最低 100 元；超出上限按上限算；异常值（空/NaN/非数字）报错 */
function parseBudget(raw, errors) {
  const value = Number(raw);
  if (raw === "" || raw === null || raw === undefined || !Number.isFinite(value)) {
    errors.push("预算需为有效数字（至少 100 元）");
    return null;
  }
  if (value < BUDGET_MIN) {
    errors.push(`预算太少（至少需要 ${BUDGET_MIN} 元）`);
    return null;
  }
  return Math.min(BUDGET_MAX, Math.round(value)); // 超出上限按上限算
}

/** 人数：1~20 人；缺省按 1 人处理 */
function parsePeople(raw, errors) {
  if (raw === "" || raw === null || raw === undefined) return 1;
  const value = Number(raw);
  if (!Number.isInteger(value) || value < PEOPLE_MIN || value > PEOPLE_MAX) {
    errors.push(`出行人数需为 ${PEOPLE_MIN}~${PEOPLE_MAX} 的整数`);
    return null;
  }
  return value;
}

export function validateInput(body) {
  const errors = [];

  const destination = String(body.destination || "").trim();
  if (!destination) errors.push("请选择或填写目的地");
  else if (destination.length > 20) errors.push("目的地名称过长（最多20字）");

  const days = Number(body.days);
  if (!Number.isInteger(days) || days < 1 || days > 14) {
    errors.push("出行天数需为 1~14 的整数");
  }

  const people = parsePeople(body.people, errors);
  const budget = parseBudget(body.budget, errors);

  if (errors.length) return { ok: false, errors };

  return {
    ok: true,
    value: {
      destination,
      days,
      people,
      budget,
      departureCity: String(body.departureCity || "")
        .trim()
        .slice(0, 20) || undefined,
      pace: PACE.includes(body.pace) ? body.pace : "适中",
      with: WITH_OPTIONS.includes(body.with) ? body.with : undefined,
      foodPreference: FOOD.includes(body.foodPreference)
        ? body.foodPreference
        : undefined,
      // 有序多选，最多 3 个，顺序即权重
      interests: normalizeInterests(
        Array.isArray(body.interests)
          ? body.interests
          : body.interests
            ? [body.interests]
            : []
      ),
      extra: String(body.extra || "").trim().slice(0, 200) || undefined,
      profileTags: Array.isArray(body.profileTags)
        ? body.profileTags.filter((tag) => PROFILE_TAGS.includes(tag)).slice(0, 8)
        : [],
      variants: Math.max(1, Math.min(3, Number(body.variants) || 1)),
    },
  };
}

const TRAVEL_TYPES = [
  "海边度假",
  "山水自然",
  "历史古城",
  "都市时尚",
  "美食之旅",
  "亲子乐园",
  "全面体验",
];

/** 目的地推荐参数校验 */
export function validateRecommend(body) {
  const errors = [];

  const days = Number(body.days);
  if (!Number.isInteger(days) || days < 1 || days > 14) {
    errors.push("出行天数需为 1~14 的整数");
  }

  const people = parsePeople(body.people, errors);
  // 预算规则同攻略生成：最低 100 元，超出上限按上限算
  const budget = parseBudget(body.budget, errors);

  if (errors.length) return { ok: false, errors };

  return {
    ok: true,
    value: {
      travelType: TRAVEL_TYPES.includes(body.travelType)
        ? body.travelType
        : "全面体验",
      days,
      people,
      budget,
      with: WITH_OPTIONS.includes(body.with) ? body.with : undefined,
      preferences: normalizeInterests(
        Array.isArray(body.preferences)
          ? body.preferences
          : body.preferences
            ? [body.preferences]
            : []
      ),
      extra: String(body.extra || "").trim().slice(0, 200) || undefined,
    },
  };
}
