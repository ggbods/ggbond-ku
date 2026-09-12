// AI 业务门面 —— 全系统唯一"拼提示词 + 调模型 + 解析结果"的地方
// 换模型：只改 import 的厂商文件即可。

import deepseek from "./deepseek";
import { buildMessages, buildRecommendMessages, buildRefineMessages } from "./prompts";
import { safeJsonParse } from "./json";

const MAX_ATTEMPTS = 2; // 偶发空返回 / 解析失败时自动重试次数

export class PlanError extends Error {
  constructor(code, message) {
    super(message);
    this.name = "PlanError";
    this.code = code;
  }
}

const ERROR_MESSAGES = {
  CONFIG_MISSING: "未配置 AI 密钥，已展示示例攻略",
  AUTH_ERROR: "API 密钥无效，请检查 .env.local 中的 DEEPSEEK_API_KEY",
  RATE_LIMITED: "请求太频繁，请稍后再试",
  PROMPT_JSON_ERR: "服务暂不可用，请重试",
  UPSTREAM_ERROR: "AI 服务暂时不稳定，请稍后重试",
  EMPTY_CONTENT: "AI 暂时没有返回内容，请重试",
  PARSE_ERROR: "AI 返回内容无法解析，请重试",
  TIMEOUT: "生成超时（攻略较长时首次可能需要更久），请重试",
};

function mapError(err) {
  if (err instanceof PlanError) return err;
  const code = err.code || "UPSTREAM_ERROR";
  return new PlanError(code, ERROR_MESSAGES[code] || "服务开小差了，请稍后重试");
}

const RETRYABLE = ["EMPTY_CONTENT", "PARSE_ERROR", "UPSTREAM_ERROR", "TIMEOUT"];

/** 调模型拿 JSON（含重试与容错解析） */
async function callForJson(messages, maxTokens = 6000) {
  let lastErr = null;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const { content } = await deepseek.complete({ messages, maxTokens });
      const parsed = safeJsonParse(content);
      if (!parsed) throw new PlanError("PARSE_ERROR", ERROR_MESSAGES.PARSE_ERROR);
      return parsed;
    } catch (err) {
      lastErr = err;
      const code = err.code || "UPSTREAM_ERROR";
      // 配置/密钥错误重试也没用，直接跳出；其余偶发错误重试一次
      if (!RETRYABLE.includes(code)) break;
    }
  }
  throw mapError(lastErr);
}

/** 规范化 AI 返回的攻略：只保留合法字段、补默认值 */
function normalizePlan(parsed) {
  if (!parsed || typeof parsed !== "object") return null;
  if (!Array.isArray(parsed.days) || parsed.days.length === 0) return null;

  return {
    destination: String(parsed.destination || ""),
    title: String(parsed.title || "旅行攻略"),
    summary: String(parsed.summary || ""),
    days: parsed.days.map((d) => ({
      day: Number(d.day) || 0,
      title: String(d.title || `第${d.day || ""}天`),
      theme: String(d.theme || ""),
      items: Array.isArray(d.items)
        ? d.items.map((it) => ({
            period: String(it.period || "全天"),
            spot: String(it.spot || ""),
            activity: String(it.activity || ""),
            duration: String(it.duration || ""),
            transport: String(it.transport || ""),
            tips: String(it.tips || ""),
          }))
        : [],
    })),
    food: Array.isArray(parsed.food)
      ? parsed.food.map((f) => ({
          name: String(f.name || ""),
          venue: String(f.venue || ""),
          avgPrice: Number(f.avgPrice) || 0,
          desc: String(f.desc || ""),
        }))
      : [],
    transport: {
      summary: String(parsed.transport?.summary || ""),
      items: Array.isArray(parsed.transport?.items)
        ? parsed.transport.items.map(String)
        : [],
    },
    budget: {
      total: Number(parsed.budget?.total) || 0,
      currency: String(parsed.budget?.currency || "CNY"),
      breakdown: Array.isArray(parsed.budget?.breakdown)
        ? parsed.budget.breakdown.map((b) => ({
            category: String(b.category || ""),
            amount: Number(b.amount) || 0,
            note: String(b.note || ""),
          }))
        : [],
    },
    tips: Array.isArray(parsed.tips) ? parsed.tips.map(String) : [],
  };
}

/** 生成一份完整旅行攻略；style 用于多方案对比时的风格提示 */
export async function generatePlan(input, { style } = {}) {
  const parsed = await callForJson(buildMessages(input, style));
  const plan = normalizePlan(parsed);
  if (!plan) throw new PlanError("PARSE_ERROR", ERROR_MESSAGES.PARSE_ERROR);
  return { plan, model: deepseek.name };
}

export async function refinePlan(plan, instruction, history = []) {
  const parsed = await callForJson(buildRefineMessages({ plan, instruction, history }), 7000);
  const refined = normalizePlan(parsed);
  if (!refined) throw new PlanError("PARSE_ERROR", ERROR_MESSAGES.PARSE_ERROR);
  return { plan: refined, model: deepseek.name };
}

/** 根据用户需求推荐目的地 */
export async function recommendDestinations(input) {
  const parsed = await callForJson(buildRecommendMessages(input), 3000);
  const recs = Array.isArray(parsed.recommendations)
    ? parsed.recommendations.slice(0, 3).map((r) => ({
        name: String(r.name || ""),
        tagline: String(r.tagline || ""),
        why: String(r.why || ""),
        bestFor: String(r.bestFor || ""),
        bestSeason: String(r.bestSeason || ""),
      }))
    : [];
  if (recs.length === 0) {
    throw new PlanError("PARSE_ERROR", ERROR_MESSAGES.PARSE_ERROR);
  }
  return { recommendations: recs, model: deepseek.name };
}
