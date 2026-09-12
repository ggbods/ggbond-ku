"use client";

export default function ErrorPage({ reset }) {
  return (
    <div
      className="mx-auto flex min-h-[70vh] flex-col items-center justify-center px-4 text-center"
      style={{ width: "min(36rem, 92vw)" }}
    >
      <span
        className="flex h-[clamp(2.75rem,7vw,3rem)] w-[clamp(2.75rem,7vw,3rem)] items-center justify-center rounded-full bg-red-500/10 text-red-400"
        aria-hidden="true"
      >
        <i className="fa-solid fa-triangle-exclamation" />
      </span>
      <h1 className="h-section mt-5 text-ink">页面暂时无法加载</h1>
      <p className="mt-2 t-lead text-body">
        你的本地攻略数据仍然保留，可以重新加载当前页面。
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-6 rounded-full bg-accent px-[clamp(1.25rem,3.5vw,1.75rem)] py-2.5 t-fluid font-semibold text-deep transition hover:opacity-90"
      >
        重新加载
      </button>
    </div>
  );
}
