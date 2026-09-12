import Link from "next/link";
import Reveal from "./Reveal";

// Hero：左文案 + 右浑天仪（多环差速旋转 · 罗盘指针微摆）
export default function Hero() {
  return (
    <section className="hero" id="hero">
      <div className="wrap hero-grid">
        <Reveal className="hero-left">
          <div className="hero-badge">
            <i className="fa-solid fa-location-crosshairs" aria-hidden="true" />
            你的专属 AI 旅行管家
            <span className="coord">N 31°14′ · E 121°28′</span>
          </div>

          <h1 className="hero-title">
            <span className="line-1">让每一次出发，</span>
            <span className="line-2">都心中有数。</span>
          </h1>

          <p className="hero-sub">
            你的专属 AI 旅行管家——<strong>懂预算、懂偏好、懂你</strong>。
            把复杂的规划交给制图者，把纯粹的远方，留给你自己。
          </p>

          <div className="hero-pills">
            <span className="hero-pill">
              <i className="fa-solid fa-route" aria-hidden="true" /> 行前规划
            </span>
            <span className="hero-pill">
              <i className="fa-solid fa-location-dot" aria-hidden="true" /> 行中助手
            </span>
            <span className="hero-pill">
              <i className="fa-solid fa-book-open" aria-hidden="true" /> 行后整理
            </span>
          </div>

          <div className="hero-cta-row">
            <Link href="/plan" className="btn-primary">
              免费生成我的攻略
              <i className="fa-solid fa-arrow-right" aria-hidden="true" />
            </Link>
            <Link href="/#features" className="btn-ghost">
              了解核心能力
              <i className="fa-solid fa-arrow-right" aria-hidden="true" />
            </Link>
          </div>

          <div className="hero-title-annotation" aria-hidden="true">
            <span>RA 12h 34m</span>
            <span>DEC +23°27′</span>
            <span>MAG 4.2</span>
            <span>EPOCH 2026</span>
          </div>
        </Reveal>

        <Reveal className="hero-right">
          <div className="armillary">
            <svg viewBox="0 0 400 400" fill="none" aria-hidden="true">
              {/* 外层黄铜基座环（静止） */}
              <circle cx="200" cy="200" r="195" stroke="var(--brass-rim)" strokeWidth="1" />
              <circle
                cx="200"
                cy="200"
                r="188"
                stroke="var(--brass)"
                strokeWidth="0.5"
                strokeDasharray="1 5"
                opacity="0.55"
              />

              {/* 外环 · 方位环（60s 顺时针） */}
              <g className="ring-outer">
                <circle cx="200" cy="200" r="180" stroke="var(--brass)" strokeWidth="1.2" opacity="0.7" />
                <circle
                  cx="200"
                  cy="200"
                  r="172"
                  stroke="var(--brass)"
                  strokeWidth="0.6"
                  strokeDasharray="3 6"
                  opacity="0.5"
                />
                <g stroke="var(--brass)" strokeWidth="1.3">
                  <line x1="200" y1="10" x2="200" y2="30" />
                  <line x1="200" y1="370" x2="200" y2="390" />
                  <line x1="10" y1="200" x2="30" y2="200" />
                  <line x1="370" y1="200" x2="390" y2="200" />
                </g>
                <g stroke="var(--brass-soft)" strokeWidth="0.9" opacity="0.6">
                  <line x1="73" y1="73" x2="83" y2="83" />
                  <line x1="327" y1="73" x2="317" y2="83" />
                  <line x1="73" y1="327" x2="83" y2="317" />
                  <line x1="327" y1="327" x2="317" y2="317" />
                </g>
                <text x="200" y="8" textAnchor="middle" fill="var(--brass)" fontFamily="var(--font-display)" fontSize="13" fontWeight="600">N</text>
                <text x="200" y="397" textAnchor="middle" fill="var(--brass-soft)" fontFamily="var(--font-display)" fontSize="11">S</text>
                <text x="8" y="205" textAnchor="middle" fill="var(--brass-soft)" fontFamily="var(--font-display)" fontSize="11">W</text>
                <text x="392" y="205" textAnchor="middle" fill="var(--brass-soft)" fontFamily="var(--font-display)" fontSize="11">E</text>
                <circle cx="80" cy="80" r="2.5" fill="var(--brass)" />
                <circle cx="320" cy="80" r="2" fill="var(--brass)" />
                <circle cx="80" cy="320" r="2" fill="var(--brass)" />
                <circle cx="320" cy="320" r="2.5" fill="var(--brass)" />
              </g>
              {/* 中环 · 星图环（90s 逆时针） */}
              <g className="ring-mid">
                <circle cx="200" cy="200" r="160" stroke="var(--brass)" strokeWidth="0.8" opacity="0.5" />
                <ellipse cx="200" cy="200" rx="160" ry="50" stroke="var(--brass-soft)" strokeWidth="1" opacity="0.55" />
                <ellipse cx="200" cy="200" rx="50" ry="160" stroke="var(--brass-soft)" strokeWidth="1" opacity="0.55" />
                <g stroke="var(--brass)" strokeWidth="0.8" opacity="0.7" fill="none">
                  <path d="M140,140 L160,170 L190,160 L210,180" />
                  <path d="M260,240 L240,260 L210,250" />
                </g>
                <g fill="var(--star-glow)">
                  <circle cx="140" cy="140" r="2" className="armillary-star" />
                  <circle cx="160" cy="170" r="2.5" className="armillary-star" />
                  <circle cx="190" cy="160" r="2" className="armillary-star" />
                  <circle cx="210" cy="180" r="2" className="armillary-star" />
                  <circle cx="260" cy="240" r="2" className="armillary-star" />
                  <circle cx="240" cy="260" r="2.5" className="armillary-star" />
                </g>
              </g>

              {/* 内环 · 航线环（30s 顺时针） */}
              <g className="ring-inner">
                <circle cx="200" cy="200" r="110" stroke="var(--brass)" strokeWidth="0.6" strokeDasharray="4 4" opacity="0.5" />
                <circle cx="200" cy="200" r="80" stroke="var(--accent)" strokeWidth="1" opacity="0.6" />
                <path
                  className="route-dash"
                  d="M120,260 Q160,180 200,210 T300,150"
                  stroke="var(--accent)"
                  strokeWidth="2"
                  fill="none"
                  strokeLinecap="round"
                />
                <circle cx="120" cy="260" r="6" fill="var(--accent)" />
                <circle cx="120" cy="260" r="12" fill="none" stroke="var(--accent)" strokeWidth="1" opacity="0.5" />
                <g transform="translate(300,150)">
                  <path d="M0,-18 L5,-5 L18,0 L5,5 L0,18 L-5,5 L-18,0 L-5,-5 Z" fill="var(--accent)" />
                  <circle cx="0" cy="0" r="4" fill="var(--bg-deep)" />
                </g>
              </g>
              {/* 中心罗盘指针（微幅摆动） */}
              <g className="compass-needle">
                <path d="M200,138 L208,200 L200,212 L192,200 Z" fill="var(--accent)" />
                <path d="M200,262 L208,200 L200,188 L192,200 Z" fill="var(--brass-soft)" opacity="0.75" />
                <circle cx="200" cy="200" r="7" fill="var(--ink)" />
                <circle cx="200" cy="200" r="4" fill="var(--brass)" />
                <circle cx="200" cy="200" r="24" fill="none" stroke="var(--star-glow)" strokeWidth="0.5" opacity="0.5" />
              </g>

              {/* 四象希腊字母标注 + 装饰星点 */}
              <g fill="var(--brass)" fontFamily="var(--font-mono)" fontSize="11" opacity="0.65">
                <text x="34" y="46">α</text>
                <text x="352" y="46">β</text>
                <text x="34" y="366">γ</text>
                <text x="352" y="366">δ</text>
              </g>
              <g fill="var(--star-glow)" opacity="0.55">
                <circle cx="100" cy="110" r="1" />
                <circle cx="300" cy="110" r="1" />
                <circle cx="100" cy="300" r="1" />
                <circle cx="300" cy="300" r="1" />
                <circle cx="150" cy="52" r="0.8" />
                <circle cx="250" cy="52" r="0.8" />
                <circle cx="150" cy="352" r="0.8" />
                <circle cx="250" cy="352" r="0.8" />
              </g>
              <text
                x="200"
                y="230"
                textAnchor="middle"
                fill="var(--brass)"
                fontFamily="var(--font-display)"
                fontStyle="italic"
                fontSize="6"
                letterSpacing="0.15em"
                opacity="0.5"
              >
                COMPASS · 灵途
              </text>
            </svg>
          </div>
        </Reveal>
      </div>

      <div className="scroll-hint" aria-hidden="true">
        <span>SCROLL</span>
        <span className="line" />
      </div>
    </section>
  );
}
