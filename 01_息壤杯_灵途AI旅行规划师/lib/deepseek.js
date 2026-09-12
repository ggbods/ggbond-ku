// DeepSeek 模型封装 —— 唯一的"厂商文件"
// 换其他模型：新建一个同签名的文件（如 claude.js），然后在 lib/ai.js 改一行 import。

const BASE_URL = "https://api.deepseek.com";
// 模型名集中在此处，改模型只动这一行
const MODEL = "deepseek-v4-flash";

// 请求超时保护（生成长攻略可能较慢）
const REQUEST_TIMEOUT_MS = 120000;

export class ProviderError extends Error {
  constructor(code, message, status) {
    super(message);
    this.name = "ProviderError";
    this.code = code;
    this.status = status;
  }
}

const deepseek = {
  name: "deepseek",

  async complete({
    messages,
    temperature = 0.7,
    maxTokens = 6000,
    responseFormat = { type: "json_object" },
  }) {
    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey) {
      throw new ProviderError("CONFIG_MISSING", "DEEPSEEK_API_KEY 未配置");
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      const res = await fetch(`${BASE_URL}/chat/completions`, {
        method: "POST",
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: MODEL,
          messages,
          temperature,
          max_tokens: maxTokens,
          stream: false,
          response_format: responseFormat,
        }),
      });

      if (!res.ok) {
        const errText = (await res.text()).slice(0, 500);
        let code = "UPSTREAM_ERROR";
        if (res.status === 401) code = "AUTH_ERROR";
        else if (res.status === 429) code = "RATE_LIMITED";
        else if (res.status === 400) code = "PROMPT_JSON_ERR";
        throw new ProviderError(
          code,
          `DeepSeek 返回 ${res.status}: ${errText}`,
          res.status
        );
      }

      const data = await res.json();
      // 永远读 message.content，不是 reasoning_content（思考模式的隐藏字段）
      const content = data?.choices?.[0]?.message?.content;
      if (typeof content !== "string" || !content.trim()) {
        throw new ProviderError("EMPTY_CONTENT", "模型返回了空内容");
      }
      return { content, raw: data };
    } catch (err) {
      if (err.name === "AbortError") {
        throw new ProviderError("TIMEOUT", "请求超时（120 秒）");
      }
      throw err;
    } finally {
      clearTimeout(timer);
    }
  },
};

export default deepseek;
