import { validateRecommend } from "@/lib/validate";
import { recommendDestinations } from "@/lib/ai";
import { buildMockRecommend } from "@/lib/mockPlan";
import { authFromRequest, recordCall } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(request) {
  const startedAt = Date.now();

  // 0) 登录门槛：使用 AI 推荐同样要求登录
  const authPayload = authFromRequest(request);
  if (!authPayload) {
    return Response.json(
      {
        ok: false,
        error: {
          code: "LOGIN_REQUIRED",
          message: "使用 AI 推荐目的地前需要先登录（也可选择游客方式）",
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
  const result = validateRecommend(body);
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

  // 3) 未配置 Key -> mock
  if (!process.env.DEEPSEEK_API_KEY) {
    recordCall(authPayload);
    return Response.json({
      ok: true,
      recommendations: buildMockRecommend(input),
      meta: { mock: true, model: "mock", latencyMs: Date.now() - startedAt },
    });
  }

  // 4) 真实 AI 推荐
  try {
    const { recommendations, model } = await recommendDestinations(input);
    recordCall(authPayload);
    return Response.json({
      ok: true,
      recommendations,
      meta: { mock: false, model, latencyMs: Date.now() - startedAt },
    });
  } catch (err) {
    const code = err.code || "UPSTREAM_ERROR";
    const statusMap = {
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
