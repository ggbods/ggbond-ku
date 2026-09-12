import {
  authFromRequest,
  getHistory,
  saveHistory,
  updateHistoryEntry,
  removeHistory,
  clearUserHistory,
} from "@/lib/auth";

export const runtime = "nodejs";

function unauthorized() {
  return Response.json(
    { ok: false, error: "请先登录后再使用历史同步" },
    { status: 401 }
  );
}

// GET /api/history —— 获取账户的历史（跨设备同步）
export async function GET(request) {
  const payload = authFromRequest(request);
  if (!payload || payload.guest) return unauthorized();
  const history = getHistory(payload.u);
  return Response.json({ ok: true, history });
}

// POST /api/history —— 保存/更新一条历史
export async function POST(request) {
  const payload = authFromRequest(request);
  if (!payload || payload.guest) return unauthorized();
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, error: "请求体不是合法的 JSON" }, { status: 400 });
  }
  // body: { bundle, historyId? } —— 有 historyId 则更新，否则新增
  if (body.historyId) {
    const updated = updateHistoryEntry(payload.u, body.historyId, body.bundle || {});
    return Response.json({ ok: true, updated, historyId: body.historyId });
  }
  const historyId = saveHistory(payload.u, body.bundle || {});
  return Response.json({ ok: true, historyId });
}

// DELETE /api/history?id=xxx 或 ?all=1
export async function DELETE(request) {
  const payload = authFromRequest(request);
  if (!payload || payload.guest) return unauthorized();
  const url = new URL(request.url);
  const id = url.searchParams.get("id");
  if (url.searchParams.get("all")) {
    clearUserHistory(payload.u);
    return Response.json({ ok: true });
  }
  if (id) {
    removeHistory(payload.u, id);
    return Response.json({ ok: true });
  }
  return Response.json({ ok: false, error: "缺少 id 参数" }, { status: 400 });
}
