import Link from "next/link";

export default function NotFound() {
  return (
    <div
      className="mx-auto flex min-h-[70vh] flex-col items-center justify-center px-4 text-center"
      style={{ width: "min(36rem, 92vw)" }}
    >
      <p className="t-fluid font-semibold text-accent">404</p>
      <h1 className="h-section mt-3 text-ink">这条路线还不存在</h1>
      <p className="mt-2 t-lead text-body">返回首页，或者直接开始规划一段新旅程。</p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Link href="/" className="action-secondary">
          返回首页
        </Link>
        <Link
          href="/plan"
          className="rounded-full bg-accent px-[clamp(1.1rem,3vw,1.5rem)] py-2.5 t-fluid font-semibold text-deep transition hover:opacity-90"
        >
          开始规划
        </Link>
      </div>
    </div>
  );
}
