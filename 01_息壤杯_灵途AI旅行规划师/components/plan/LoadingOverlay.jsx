// 生成攻略时的全屏加载动画
export default function LoadingOverlay() {
  return (
    <div className="fixed inset-0 z-[1500] flex flex-col items-center justify-center bg-deep/85 px-6 text-center backdrop-blur-sm">
      <div className="h-[clamp(2.5rem,7vw,3rem)] w-[clamp(2.5rem,7vw,3rem)] animate-spin rounded-full border-4 border-accent/20 border-t-accent" />
      <p className="mt-4 text-[clamp(1rem,2.4vw,1.125rem)] font-medium text-ink">
        AI 正在为你规划行程…
      </p>
      <p className="mt-1 t-fluid text-dim">
        生成方案越多耗时越长（约 30~60 秒/个），请耐心等待
      </p>
    </div>
  );
}
