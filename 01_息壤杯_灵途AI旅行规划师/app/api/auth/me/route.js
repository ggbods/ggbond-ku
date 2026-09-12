import { authFromRequest } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET(request) {
  const payload = authFromRequest(request);
  if (!payload) {
    return Response.json({ ok: false }, { status: 401 });
  }
  if (payload.guest) {
    return Response.json({ ok: true, user: { guest: true } });
  }
  return Response.json({ ok: true, user: { username: payload.u } });
}
