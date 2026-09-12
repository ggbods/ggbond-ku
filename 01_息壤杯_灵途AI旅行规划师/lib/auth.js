// 服务端认证：密码哈希（scrypt）+ HMAC 令牌 + 用量记录 + 历史同步
// 仅供服务端 route handler 使用，切勿 import 到客户端组件
import crypto from "node:crypto";
import { readDB, writeDB, getSecret } from "./db";

const TOKEN_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 天

/* ---------- 密码哈希 ---------- */
export function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(String(password), salt, 64).toString("hex");
  return { salt, hash };
}

export function verifyPassword(password, salt, hash) {
  const h = crypto.scryptSync(String(password), salt, 64).toString("hex");
  // 恒定时间比较
  const a = Buffer.from(h, "hex");
  const b = Buffer.from(String(hash), "hex");
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

/* ---------- HMAC 令牌 ---------- */
function sign(payload) {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = crypto.createHmac("sha256", getSecret()).update(body).digest("base64url");
  return `${body}.${sig}`;
}

export function verifyToken(token) {
  if (!token || typeof token !== "string") return null;
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;
  const expected = crypto
    .createHmac("sha256", getSecret())
    .update(body)
    .digest("base64url");
  if (sig !== expected) return null;
  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
    if (payload.exp && Date.now() > payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}

/** 从 Request 中读取并校验 Bearer token */
export function authFromRequest(request) {
  const header = request.headers.get("authorization") || "";
  const token = header.replace(/^Bearer\s+/i, "").trim();
  return token ? verifyToken(token) : null;
}

function issueAccountToken(username) {
  return sign({ u: username, exp: Date.now() + TOKEN_TTL_MS });
}
function issueGuestToken(guestId) {
  return sign({ g: guestId, guest: true, exp: Date.now() + TOKEN_TTL_MS });
}

/* ---------- 用户操作 ---------- */
export function registerUser(username, password) {
  const name = String(username || "").trim();
  if (name.length < 2 || name.length > 20) {
    return { ok: false, error: "用户名需为 2~20 个字符" };
  }
  if (!/^[a-zA-Z0-9_一-龥]+$/.test(name)) {
    return { ok: false, error: "用户名只能包含中文、字母、数字、下划线" };
  }
  if (String(password || "").length < 6) {
    return { ok: false, error: "密码至少 6 位" };
  }
  const db = readDB();
  if (db.users[name]) return { ok: false, error: "该用户名已被注册" };
  const { salt, hash } = hashPassword(password);
  db.users[name] = { salt, hash, createdAt: Date.now(), lastLoginAt: Date.now() };
  writeDB(db);
  return { ok: true, token: issueAccountToken(name), username: name };
}

export function loginUser(username, password) {
  const name = String(username || "").trim();
  const db = readDB();
  const user = db.users[name];
  if (!user || !verifyPassword(password, user.salt, user.hash)) {
    return { ok: false, error: "用户名或密码错误" };
  }
  user.lastLoginAt = Date.now();
  db.usage.logins.accounts += 1;
  db.usage.byUser[name] = db.usage.byUser[name] || { logins: 0, calls: 0, lastAt: 0 };
  db.usage.byUser[name].logins += 1;
  db.usage.byUser[name].lastAt = Date.now();
  writeDB(db);
  return { ok: true, token: issueAccountToken(name), username: name };
}

export function guestLogin() {
  const db = readDB();
  const guestId = crypto.randomBytes(8).toString("hex");
  db.usage.logins.guests += 1;
  db.usage.guest.logins += 1;
  db.usage.guest.lastAt = Date.now();
  writeDB(db);
  return { ok: true, token: issueGuestToken(guestId), guest: true };
}

/* ---------- 用量记录（尽量节约空间：只记次数 + 最近时间） ---------- */
export function recordCall(payload) {
  const db = readDB();
  if (payload?.guest) {
    db.usage.calls.guests += 1;
    db.usage.guest.calls += 1;
    db.usage.guest.lastAt = Date.now();
  } else if (payload?.u) {
    db.usage.calls.accounts += 1;
    const u = db.usage.byUser[payload.u] || { logins: 0, calls: 0, lastAt: 0 };
    u.calls += 1;
    u.lastAt = Date.now();
    db.usage.byUser[payload.u] = u;
  }
  writeDB(db);
}

/* ---------- 历史同步（仅账户用户） ---------- */
export function getHistory(username) {
  const db = readDB();
  return db.history[username] || [];
}

export function saveHistory(username, bundle) {
  const db = readDB();
  const list = db.history[username] || [];
  const entry = {
    id:
      bundle?.historyId ||
      (typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : String(Date.now())),
    createdAt: Date.now(),
    plans: bundle?.plans || (bundle?.plan ? [bundle.plan] : []),
    variantNames: bundle?.variantNames || [],
    meta: bundle?.meta || {},
    form: bundle?.form || {},
  };
  list.unshift(entry);
  db.history[username] = list.slice(0, 50);
  writeDB(db);
  return entry.id;
}

export function updateHistoryEntry(username, historyId, bundle) {
  const db = readDB();
  const list = db.history[username] || [];
  const i = list.findIndex((e) => e.id === historyId);
  if (i === -1) return false;
  if (bundle.plans) list[i].plans = bundle.plans;
  if (bundle.variantNames) list[i].variantNames = bundle.variantNames;
  if (bundle.meta) list[i].meta = bundle.meta;
  if (bundle.form) list[i].form = bundle.form;
  writeDB(db);
  return true;
}

export function removeHistory(username, id) {
  const db = readDB();
  db.history[username] = (db.history[username] || []).filter((e) => e.id !== id);
  writeDB(db);
}

export function clearUserHistory(username) {
  const db = readDB();
  db.history[username] = [];
  writeDB(db);
}
