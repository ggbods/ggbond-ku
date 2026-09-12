import Link from "next/link";

const PRODUCT = [
  { href: "/#features", label: "核心能力" },
  { href: "/#process", label: "使用流程" },
  { href: "/#destinations", label: "热门目的地" },
  { href: "/plan", label: "免费生成攻略" },
];

const ABOUT = [
  { href: "/#story", label: "为什么做" },
  { href: "/#tech", label: "技术底气" },
  { href: "/#team", label: "幕后团队" },
];

const TOOLS = [
  { href: "/plan/recommend", label: "AI 推荐目的地", icon: "fa-wand-magic-sparkles" },
  { href: "/plan/history", label: "我的攻略库", icon: "fa-book-open" },
];

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="wrap">
        <div className="footer-grid">
          <div className="footer-brand">
            <Link href="/" className="brand">
              <span className="brand-mark">
                <i className="fa-solid fa-compass" aria-hidden="true" />
              </span>
              <span className="brand-name">
                灵<span>途</span>
              </span>
            </Link>
            <p>
              你的专属 AI 旅行管家——懂预算、懂偏好、懂你。由 DeepSeek AI 驱动，
              攻略由 AI 生成，仅供参考，出行前请以官方信息为准。
            </p>
          </div>

          <div className="footer-col">
            <h4>产品</h4>
            {PRODUCT.map((l) => (
              <Link key={l.href} href={l.href}>
                {l.label}
              </Link>
            ))}
          </div>

          <div className="footer-col">
            <h4>关于</h4>
            {ABOUT.map((l) => (
              <Link key={l.href} href={l.href}>
                {l.label}
              </Link>
            ))}
          </div>

          <div className="footer-col">
            <h4>工具</h4>
            {TOOLS.map((l) => (
              <Link key={l.href} href={l.href}>
                <i className={`fa-solid ${l.icon} mr-2`} aria-hidden="true" />
                {l.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="footer-bottom">
          <div>
            © 2026 灵途 Lingtu · 由 DeepSeek AI 驱动 · 攻略仅供参考
            <span className="hidden sm:inline"> · 上海外滩夜景摄影：Daniel Case（CC BY-SA 3.0）</span>
          </div>
          <div className="fb-coord">N 31°14′ E 121°28′ · ALT 0m</div>
        </div>
      </div>
    </footer>
  );
}
