import { registerUser } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json(
      { ok: false, error: "请求体不是合法的 JSON" },
      { status: 400 }
    );
  }
  const result = registerUser(body.username, body.password);
  if (!result.ok) {
    return Response.json({ ok: false, error: result.error }, { status: 400 });
  }
  return Response.json({ ok: true, token: result.token, username: result.username });
}
