"use client";

import { useEffect, useState } from "react";
import { createShareUrl, downloadMarkdown } from "@/lib/share";

async function copyText(value) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(value);
    return true;
  }
  const input = document.createElement("textarea");
  input.value = value;
  input.setAttribute("readonly", "true");
  input.style.position = "fixed";
  input.style.opacity = "0";
  document.body.appendChild(input);
  input.select();
  const copied = document.execCommand("copy");
  input.remove();
  return copied;
}

export default function PlanActions({ plan, bundle, onReplan, onHistory }) {
  const [status, setStatus] = useState("");
  const [speaking, setSpeaking] = useState(false);

  useEffect(() => () => window.speechSynthesis?.cancel(), []);

  // 操作提示 3 秒后自动消失，避免一直占位
  useEffect(() => {
    if (!status) return;
    const timer = window.setTimeout(() => setStatus(""), 3000);
    return () => window.clearTimeout(timer);
  }, [status]);

  async function handleShare() {
    try {
      const url = createShareUrl(bundle);
      if (navigator.share) {
        await navigator.share({ title: plan.title, text: plan.summary, url });
        setStatus("已打开分享面板");
      } else {
        setStatus((await copyText(url)) ? "分享链接已复制" : "复制失败，请重试");
      }
    } catch (error) {
      if (error?.name !== "AbortError") setStatus("分享失败，请重试");
    }
  }

  function handleSpeak() {
    if (!("speechSynthesis" in window)) {
      setStatus("当前浏览器不支持朗读");
      return;
    }
    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }
    const text = `${plan.title}。${plan.summary || ""}。${(plan.tips || []).join("。")}`;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "zh-CN";
    utterance.rate = 0.95;
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    window.speechSynthesis.speak(utterance);
    setSpeaking(true);
  }

  return (
    <div className="mt-[clamp(2.5rem,6vw,3.5rem)] border-t border-white/10 pt-[clamp(1.5rem,4vw,2rem)]">
      <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:justify-center sm:gap-3">
        <button type="button" onClick={onReplan} className="action-secondary" title="重新规划">
          <i className="fa-solid fa-arrow-left" aria-hidden="true" /> 重新规划
        </button>
        <button type="button" onClick={onHistory} className="action-secondary" title="打开攻略库">
          <i className="fa-solid fa-book-open" aria-hidden="true" /> 攻略库
        </button>
        <button type="button" onClick={handleShare} className="action-secondary" title="分享攻略">
          <i className="fa-solid fa-share-nodes" aria-hidden="true" /> 分享
        </button>
        <button type="button" onClick={() => downloadMarkdown(plan)} className="action-secondary" title="下载 Markdown 文件">
          <i className="fa-solid fa-file-arrow-down" aria-hidden="true" /> 下载攻略
        </button>
        <button type="button" onClick={handleSpeak} className="action-secondary" title={speaking ? "停止朗读" : "朗读攻略"}>
          <i className={`fa-solid ${speaking ? "fa-stop" : "fa-volume-high"}`} aria-hidden="true" /> {speaking ? "停止朗读" : "朗读攻略"}
        </button>
        <button type="button" onClick={() => window.print()} className="action-secondary" title="打印或保存为 PDF">
          <i className="fa-solid fa-print" aria-hidden="true" /> 打印 / PDF
        </button>
      </div>
      {status && (
        <p className="mt-3 text-center t-fluid text-accent" role="status">
          {status}
        </p>
      )}
    </div>
  );
}
