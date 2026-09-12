"use client";

import { useState } from "react";
import { authHeaders } from "@/lib/authClient";

const QUICK_REQUESTS = ["第 2 天少走路", "把早餐换成素食", "整体预算节约一些"];

export default function RefinePanel({ plan, onRefined }) {
  const [instruction, setInstruction] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(value = instruction) {
    const request = value.trim();
    if (!request || loading) return;
    setError("");
    setLoading(true);
    const nextMessages = [...messages, { role: "user", content: request }];
    setMessages(nextMessages);
    setInstruction("");
    try {
      const response = await fetch("/api/refine-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({ plan, instruction: request, history: messages }),
      });
      const data = await response.json();
      if (!data.ok) throw new Error(data.error?.message || "修改失败，请重试");
      setMessages([...nextMessages, { role: "assistant", content: "已按你的要求更新相关安排。" }]);
      onRefined(data.plan, data.meta);
    } catch (err) {
      setMessages(messages);
      setError(err.message || "网络异常，请稍后重试");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section
      className="mt-[clamp(2rem,4.5vw,2.75rem)] border-y border-white/10 py-[clamp(1.5rem,3.5vw,2rem)]"
      aria-labelledby="refine-title"
    >
      <div className="flex items-start gap-3">
        <span
          className="flex h-[clamp(2rem,4vw,2.25rem)] w-[clamp(2rem,4vw,2.25rem)] shrink-0 items-center justify-center rounded-full bg-accent/15 text-accent"
          aria-hidden="true"
        >
          <i className="fa-solid fa-wand-magic-sparkles" />
        </span>
        <div className="min-w-0">
          <h2 id="refine-title" className="h-card text-ink">
            继续调整这份攻略
          </h2>
          <p className="mt-1 t-fluid text-body">
            告诉灵途你想改哪一处，已完成的内容会尽量保留。
          </p>
        </div>
      </div>
      {messages.length > 0 && (
        <div className="mt-4 space-y-2" aria-live="polite">
          {messages.map((message, index) => (
            <p
              key={`${message.role}-${index}`}
              className={`rounded-lg px-3 py-2 t-fluid ${
                message.role === "user"
                  ? "ml-[clamp(1rem,6vw,2rem)] bg-accent/10 text-ink"
                  : "mr-[clamp(1rem,6vw,2rem)] bg-white/5 text-body"
              }`}
            >
              {message.content}
            </p>
          ))}
        </div>
      )}
      <div className="mt-4 flex flex-wrap gap-2">
        {QUICK_REQUESTS.map((request) => (
          <button
            key={request}
            type="button"
            onClick={() => submit(request)}
            className="rounded-full border border-accent/25 px-3 py-1.5 t-small text-accent transition hover:bg-accent/10 disabled:opacity-50"
            disabled={loading}
          >
            {request}
          </button>
        ))}
      </div>
      <form
        className="mt-4 flex flex-col gap-2 sm:flex-row"
        onSubmit={(event) => {
          event.preventDefault();
          submit();
        }}
      >
        <label className="sr-only" htmlFor="refine-instruction">
          输入修改要求
        </label>
        <input
          id="refine-instruction"
          value={instruction}
          onChange={(event) => setInstruction(event.target.value)}
          maxLength={300}
          placeholder="例如：把第 2 天晚餐换成清淡口味"
          className="input-dark min-w-0 flex-1"
          disabled={loading}
        />
        <button
          type="submit"
          className="btn-primary shrink-0"
          disabled={loading || !instruction.trim()}
        >
          {loading ? "调整中…" : "发送"}
        </button>
      </form>
      {error && (
        <p className="mt-2 t-fluid text-red-400" role="alert">
          {error}
        </p>
      )}
    </section>
  );
}
