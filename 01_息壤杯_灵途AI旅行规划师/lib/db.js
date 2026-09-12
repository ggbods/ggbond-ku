// 轻量 JSON 文件存储（单进程、同步读写）
// 账户 / 历史同步 / 用量记录 全部存在 data/db.json（不随代码上传，重建网站时保留）
import { mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const DATA_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DATA_DIR, "db.json");
const SECRET_FILE = path.join(DATA_DIR, ".secret");

function emptyDB() {
  return {
    users: {},
    history: {},
    usage: {
      logins: { accounts: 0, guests: 0 },
      calls: { accounts: 0, guests: 0 },
      byUser: {},
      guest: { logins: 0, calls: 0, lastAt: 0 },
    },
  };
}

function ensure() {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
  if (!existsSync(DB_FILE)) writeFileSync(DB_FILE, JSON.stringify(emptyDB(), null, 2));
}

export function readDB() {
  ensure();
  try {
    const parsed = JSON.parse(readFileSync(DB_FILE, "utf8"));
    return { ...emptyDB(), ...parsed };
  } catch {
    return emptyDB();
  }
}

export function writeDB(db) {
  ensure();
  writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
}

// HMAC 令牌签名密钥（首次生成后持久化，重启/重建网站不失效）
export function getSecret() {
  ensure();
  if (!existsSync(SECRET_FILE)) {
    writeFileSync(SECRET_FILE, crypto.randomBytes(32).toString("hex"), {
      mode: 0o600,
    });
  }
  return readFileSync(SECRET_FILE, "utf8").trim();
}
