"use client";

import { useState } from "react";
import { saveFeedback } from "@/lib/feedbackStore";

export default function PlanFeedback({ plan }) {
  const [rating, setRating] = useState(0);
  const [useful, setUseful] = useState(null);
  const [saved, setSaved] = useState(false);

  function updateFeedback(next) {
    const value = { rating: next.rating ?? rating, useful: next.useful ?? useful };
    setRating(value.rating);
    setUseful(value.useful);
    saveFeedback(plan, value);
    setSaved(true);
  }

  return (
    <section
      className="mt-[clamp(2rem,4.5vw,2.75rem)] border-y border-white/10 py-[clamp(1.25rem,3vw,1.75rem)] text-center"
      aria-labelledby="feedback-title"
    >
      <h2 id="feedback-title" className="t-fluid font-semibold text-ink">
        这份攻略对你有帮助吗？
      </h2>
      <div className="mt-3 flex justify-center gap-1" aria-label="攻略评分">
        {[1, 2, 3, 4, 5].map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => updateFeedback({ rating: value })}
            className={`flex h-[clamp(2rem,4.5vw,2.25rem)] w-[clamp(2rem,4.5vw,2.25rem)] items-center justify-center rounded-md transition ${
              value <= rating ? "text-warm" : "text-dim hover:text-warm"
            }`}
            aria-label={`${value} 星`}
            aria-pressed={value <= rating}
          >
            <i
              className={`fa-${value <= rating ? "solid" : "regular"} fa-star`}
              aria-hidden="true"
            />
          </button>
        ))}
      </div>
      <div className="mt-2 flex flex-wrap justify-center gap-2">
        <button
          type="button"
          onClick={() => updateFeedback({ useful: true })}
          className={`feedback-chip ${useful === true ? "active" : ""}`}
          aria-label="有帮助"
        >
          <i className="fa-solid fa-thumbs-up" aria-hidden="true" /> 有帮助
        </button>
        <button
          type="button"
          onClick={() => updateFeedback({ useful: false })}
          className={`feedback-chip ${useful === false ? "active" : ""}`}
          aria-label="需要改进"
        >
          <i className="fa-solid fa-thumbs-down" aria-hidden="true" /> 需要改进
        </button>
      </div>
      {saved && (
        <p className="mt-2 t-small text-dim" role="status">
          反馈已保存到本机
        </p>
      )}
    </section>
  );
}
