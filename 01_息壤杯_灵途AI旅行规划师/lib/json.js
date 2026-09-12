// 容错的 JSON 解析工具
// DeepSeek JSON mode 只保证"语法合法"，不保证格式干净。
// 这里处理常见脏数据：代码围栏、尾逗号、非法字面量、前后多余文本。

function extractBalancedObject(text) {
  const start = text.indexOf("{");
  if (start === -1) return null;
  let depth = 0;
  let inString = false;
  let escaped = false;
  for (let i = start; i < text.length; i++) {
    const ch = text[i];
    if (inString) {
      if (escaped) escaped = false;
      else if (ch === "\\") escaped = true;
      else if (ch === '"') inString = false;
      continue;
    }
    if (ch === '"') inString = true;
    else if (ch === "{") depth++;
    else if (ch === "}") {
      depth--;
      if (depth === 0) return text.slice(start, i + 1);
    }
  }
  return null;
}

export function safeJsonParse(text) {
  if (typeof text !== "string") return null;
  let t = text.trim();

  // 1) 去掉 ```json ... ``` 代码围栏
  t = t.replace(/```(?:json)?\s*([\s\S]*?)```/g, "$1").trim();

  // 2) 直接解析
  try {
    return JSON.parse(t);
  } catch {}

  // 3) 修复尾逗号
  t = t.replace(/,\s*([}\]])/g, "$1");

  // 4) 替换非法字面量 NaN / Infinity
  t = t.replace(/\b(NaN|Infinity|-Infinity)\b/g, "null");

  // 5) 再次解析
  try {
    return JSON.parse(t);
  } catch {}

  // 6) 兜底：截取第一个完整平衡括号片段
  const frag = extractBalancedObject(t);
  if (frag) {
    try {
      return JSON.parse(frag);
    } catch {}
  }
  return null;
}
