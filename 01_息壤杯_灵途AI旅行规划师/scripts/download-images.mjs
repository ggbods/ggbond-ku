// 一次性脚本：把目的地照片下载到 public/images/destinations/
// 运行：node scripts/download-images.mjs
//
// 策略：每张图依次尝试多个候选地址，第一个成功下载的生效。
// 优先用 Unsplash 直链（真实城市风光），失败则退回 picsum 占位图（保证首页不裂）。

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = path.resolve(__dirname, "../public/images/destinations");

// 候选图源。Unsplash 直链末尾追加宽高与压缩参数。
const TARGETS = [
  {
    id: "beijing",
    candidates: [
      "https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=1600&q=80&auto=format&fit=crop",
      "https://picsum.photos/seed/beijing/1600/1000",
    ],
  },
  {
    id: "shanghai",
    candidates: [
      "https://images.unsplash.com/photo-1478436127897-769e1b3f0f36?w=1600&q=80&auto=format&fit=crop",
      "https://picsum.photos/seed/shanghai/1600/1000",
    ],
  },
  {
    id: "chengdu",
    candidates: [
      "https://images.unsplash.com/photo-1564349683136-77e08dba1ef7?w=1600&q=80&auto=format&fit=crop",
      "https://picsum.photos/seed/chengdu/1600/1000",
    ],
  },
  {
    id: "xian",
    candidates: [
      "https://images.unsplash.com/photo-1547981609-4b6bfe67ca0b?w=1600&q=80&auto=format&fit=crop",
      "https://picsum.photos/seed/xian/1600/1000",
    ],
  },
  {
    id: "guilin",
    candidates: [
      "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=1600&q=80&auto=format&fit=crop",
      "https://picsum.photos/seed/guilin/1600/1000",
    ],
  },
  {
    id: "sanya",
    candidates: [
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1600&q=80&auto=format&fit=crop",
      "https://picsum.photos/seed/sanya/1600/1000",
    ],
  },
  {
    id: "hero",
    candidates: [
      "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=2000&q=80&auto=format&fit=crop",
      "https://picsum.photos/seed/hero/2000/1000",
    ],
  },
];

const TIMEOUT_MS = 10000; // 单个请求超时，避免网络卡死

async function download(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      redirect: "follow",
      signal: controller.signal,
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const type = res.headers.get("content-type") || "";
    if (!type.startsWith("image/")) throw new Error(`非图片响应: ${type}`);
    return Buffer.from(await res.arrayBuffer());
  } finally {
    clearTimeout(timer);
  }
}

async function main() {
  await mkdir(OUTPUT_DIR, { recursive: true });
  const results = [];

  for (const target of TARGETS) {
    let lastErr = null;
    for (const url of target.candidates) {
      try {
        const buf = await download(url);
        await writeFile(path.join(OUTPUT_DIR, `${target.id}.jpg`), buf);
        results.push({ id: target.id, ok: true, source: url });
        break;
      } catch (err) {
        lastErr = err;
      }
    }
    if (!results.some((r) => r.id === target.id)) {
      results.push({ id: target.id, ok: false, source: String(lastErr) });
    }
  }

  console.table(
    results.map((r) => ({
      图片: r.id,
      结果: r.ok ? "✓ 已下载" : "✗ 失败",
      来源: r.ok ? r.source.split("?")[0] : r.source,
    }))
  );

  const failed = results.filter((r) => !r.ok);
  if (failed.length) {
    console.log("\n以下图片下载失败，请检查网络或手动补充：");
    failed.forEach((f) => console.log(`  - ${f.id}`));
  } else {
    console.log("\n全部图片下载完成 ✅");
  }
}

main().catch((err) => {
  console.error("脚本出错：", err);
  process.exit(1);
});
