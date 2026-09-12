import Reveal from "./Reveal";

// 九大核心功能：三组（行前 / 行中 / 行后），四列黄铜镶边卡
const groups = [
  {
    num: "01.",
    title: "行前智能规划",
    features: [
      {
        tag: "F·01",
        icon: "fa-wand-magic-sparkles",
        title: "AI 行程生成",
        desc: "输入目的地、天数、预算、偏好，AI 一键生成完整行程，支持多方案对比。",
        sub: "灵活调整 · 随心定制",
      },
      {
        tag: "F·02",
        icon: "fa-coins",
        title: "智能预算管理",
        desc: "自动估算交通、住宿、餐饮、门票等费用，实时更新防止超支。",
        sub: "花多少 · 心里有数",
      },
      {
        tag: "F·03",
        icon: "fa-map-location-dot",
        title: "景点推荐 + 路线",
        desc: "基于偏好智能推荐景点，自动优化游览路线，避开人群、合理安排时间。",
        sub: "热门与小众 · 智能平衡",
      },
      {
        tag: "F·04",
        icon: "fa-utensils",
        title: "美食规划 + 订位",
        desc: "推荐地道美食，AI 预估排队时间，支持一键订位，涵盖本地人私藏好店。",
        sub: "吃得好 · 不排队",
      },
    ],
  },
  {
    num: "02.",
    title: "行中实时助手",
    features: [
      {
        tag: "F·05",
        icon: "fa-signs-post",
        title: "实时导航 + 提醒",
        desc: "结合实时交通动态规划最优路线，智能提醒出发时间，避免走弯路。",
        sub: "实时避堵 · 准时到达",
      },
      {
        tag: "F·06",
        icon: "fa-language",
        title: "语音翻译 + 文化助手",
        desc: "实时语音翻译，AI 讲解景点文化背景，当地习俗提示，支持 30+ 语言。",
        sub: "沟通无界 · 旅行更深",
      },
      {
        tag: "F·07",
        icon: "fa-arrows-rotate",
        title: "临时调整",
        desc: "遇到天气变化、景点关闭等突发情况，AI 秒级重新规划，保留已定行程。",
        sub: "变化再快 · AI 跟得上",
      },
    ],
  },
  {
    num: "03.",
    title: "行后智能整理",
    features: [
      {
        tag: "F·08",
        icon: "fa-feather-pointed",
        title: "AI 游记生成",
        desc: "自动整理行程、照片、路线，生成精美图文游记，支持一键分享朋友圈。",
        sub: "美好回忆 · 自动珍藏",
      },
      {
        tag: "F·09",
        icon: "fa-chart-line",
        title: "数据沉淀 + 推荐",
        desc: "分析旅行偏好，生成个人旅行画像，推荐下次目的地，越用越懂你。",
        sub: "越旅行 · 越懂你",
      },
    ],
  },
];

function Rivets() {
  return (
    <>
      <span className="rivet tl" aria-hidden="true" />
      <span className="rivet tr" aria-hidden="true" />
      <span className="rivet bl" aria-hidden="true" />
      <span className="rivet br" aria-hidden="true" />
    </>
  );
}

export default function Features() {
  return (
    <section className="features section-pad scroll-mt-20" id="features">
      <div className="wrap">
        <Reveal className="section-head">
          <span className="eyebrow">Core Capabilities · 09</span>
          <h2 className="section-title">
            九大核心功能，<em>覆盖旅行全流程</em>
          </h2>
          <p className="section-sub">
            从出发到归来，一路省心。制图者把每个环节都替你走过一遍——你只需带着好奇上路。
          </p>
        </Reveal>

        <div className="feature-groups">
          {groups.map((group, gi) => (
            <Reveal key={group.title} delay={gi * 60}>
              <div className="group-label">
                <span className="gnum">{group.num}</span>
                <span className="gtitle">{group.title}</span>
                <span className="gline" aria-hidden="true" />
              </div>
              <div className="feature-cards">
                {group.features.map((f) => (
                  <article key={f.tag} className="feature-card">
                    <Rivets />
                    <span className="fc-tag">{f.tag}</span>
                    <div className="fc-icon">
                      <i className={`fa-solid ${f.icon}`} aria-hidden="true" />
                    </div>
                    <h3 className="fc-title">{f.title}</h3>
                    <p className="fc-desc">{f.desc}</p>
                    <div className="fc-sub">{f.sub}</div>
                  </article>
                ))}
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
