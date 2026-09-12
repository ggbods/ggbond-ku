import { validateInput } from "@/lib/validate";
import { generatePlan } from "@/lib/ai";
import { buildMockPlan } from "@/lib/mockPlan";
import { authFromRequest, recordCall } from "@/lib/auth";

export const runtime = "nodejs";

// 多方案对比的风格提示（按生成数量依次取用）
const VARIANT_STYLES = [
  "经典平衡版：经典景点 + 合理节奏，适合大多数人的首选方案",
  "悠闲慢游版：行程宽松，少赶路多体验，适合放松享受的慢旅行",
  "紧凑打卡版：高效串联热门景点，一天多玩几个地方，适合精力充沛的旅行者",
];

export async function POST(request) {
  const startedAt = Date.now();

  // 0) 登录门槛：#5 只有在使用 AI 生成规划时才要求登录
  const authPayload = authFromRequest(request);
  if (!authPayload) {
    return Response.json(
      {
        ok: false,
        error: {
          code: "LOGIN_REQUIRED",
          message: "使用 AI 生成攻略前需要先登录（也可选择游客方式，不注册）",
        },
      },
      { status: 401 }
    );
  }

  // 1) 读取 body
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json(
      {
        ok: false,
        error: { code: "VALIDATION_ERROR", message: "请求体不是合法的 JSON" },
      },
      { status: 400 }
    );
  }

  // 2) 参数校验
  const result = validateInput(body);
  if (!result.ok) {
    return Response.json(
      {
        ok: false,
        error: {
          code: "VALIDATION_ERROR",
          message: result.errors.join("；"),
        },
      },
      { status: 400 }
    );
  }
  const input = result.value;
  const variantCount = Math.max(
    1,
    Math.min(3, Number(body.variants) || input.variants || 1)
  );

  // 3) 未配置 Key -> 返回示例攻略（mock），保证全流程可跑通
  if (!process.env.DEEPSEEK_API_KEY) {
    const plans = Array.from({ length: variantCount }, (_, i) =>
      buildMockPlan(input, i)
    );
    const variantNames = VARIANT_STYLES.slice(0, variantCount).map((s) =>
      s.split("：")[0]
    );
    recordCall(authPayload);
    return Response.json({
      ok: true,
      plans,
      plan: plans[0],
      variantNames,
      meta: { mock: true, model: "mock", latencyMs: Date.now() - startedAt },
    });
  }

  // 4) 真实 AI 生成（多方案并行生成，失败的方案单独丢弃，至少返回一个）
  try {
    const styleHints = VARIANT_STYLES.slice(0, variantCount);
    const results = await Promise.allSettled(
      styleHints.map((style) => generatePlan(input, { style }))
    );
    const plans = results
      .filter((r) => r.status === "fulfilled")
      .map((r) => r.value.plan);

    if (plans.length === 0) {
      const reason = results.find((r) => r.status === "rejected")?.reason;
      throw reason;
    }

    const variantNames = styleHints.map((s) => s.split("：")[0]);
    recordCall(authPayload);
    return Response.json({
      ok: true,
      plans,
      plan: plans[0],
      variantNames,
      meta: {
        mock: false,
        model: "deepseek",
        latencyMs: Date.now() - startedAt,
      },
    });
  } catch (err) {
    const code = err.code || "UPSTREAM_ERROR";
    const statusMap = {
      VALIDATION_ERROR: 400,
      AUTH_ERROR: 401,
      RATE_LIMITED: 429,
      PARSE_ERROR: 422,
      TIMEOUT: 504,
    };
    const status = statusMap[code] || 500;
    return Response.json(
      { ok: false, error: { code, message: err.message } },
      { status }
    );
  }
}
