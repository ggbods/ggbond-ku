import { refinePlan } from "@/lib/ai";
import { refineMockPlan } from "@/lib/refineMock";
import { authFromRequest, recordCall } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(request) {
  // 0) 登录门槛：微调行程同样使用 AI，要求登录
  const authPayload = authFromRequest(request);
  if (!authPayload) {
    return Response.json(
      {
        ok: false,
        error: { code: "LOGIN_REQUIRED", message: "使用 AI 微调行程前需要先登录" },
      },
      { status: 401 }
    );
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, error: { message: "请求体不是合法的 JSON" } }, { status: 400 });
  }

  const instruction = String(body.instruction || "").trim();
  if (!body.plan || typeof body.plan !== "object" || !instruction) {
    return Response.json({ ok: false, error: { message: "请提供攻略和修改要求" } }, { status: 400 });
  }
  if (instruction.length > 300) {
    return Response.json({ ok: false, error: { message: "修改要求最多 300 个字" } }, { status: 400 });
  }

  try {
    if (!process.env.DEEPSEEK_API_KEY) {
      recordCall(authPayload);
      return Response.json({
        ok: true,
        plan: refineMockPlan(body.plan, instruction),
        changes: [instruction],
        meta: { mock: true, model: "mock" },
      });
    }
    const result = await refinePlan(body.plan, instruction, Array.isArray(body.history) ? body.history : []);
    recordCall(authPayload);
    return Response.json({ ok: true, plan: result.plan, changes: [instruction], meta: { mock: false, model: result.model } });
  } catch (error) {
    return Response.json({ ok: false, error: { code: error.code || "UPSTREAM_ERROR", message: error.message || "修改失败，请稍后重试" } }, { status: 500 });
  }
}
