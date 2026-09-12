import { guestLogin } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST() {
  const result = guestLogin();
  return Response.json({
    ok: true,
    token: result.token,
    guest: true,
  });
}
