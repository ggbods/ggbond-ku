import Reveal from "./Reveal";

// 关于我们：调研数字 + 三个痛点 + 四项价值主张
const pains = [
  {
    icon: "fa-clock-rotate-left",
    title: "行前规划焦虑",
    desc: "攻略做不完、选择困难、预算难把控、怕踩坑——刷了 30 篇攻略，还是定不下来去哪。",
    badge: "78% 旅行者行前焦虑",
  },
  {
    icon: "fa-cloud-bolt",
    title: "行中体验痛点",
    desc: "计划赶不上变化，排队、堵车、天气突变，临时找餐厅还容易踩雷。",
    badge: "65% 途中遇突发状况",
  },
  {
    icon: "fa-shapes",
    title: "工具分散",
    desc: "小红书看攻略、携程订酒店、高德看路线、大众点评找吃的……多个 App 来回切换。",
    badge: "平均使用 4.3 个工具",
  },
];

const stats = [
  { num: "78%", label: ["旅行者", "行前焦虑"] },
  { num: "65%", label: ["途中遇", "突发状况"] },
  { num: "4.3", label: ["平均使用", "工具数量"] },
];

const values = [
  {
    icon: "fa-people-group",
    stat: "普惠",
    title: "普惠旅行",
    desc: "让每个人都能轻松规划高品质旅行，不分年龄、收入。",
  },
  {
    icon: "fa-hourglass-half",
    stat: "3h",
    title: "省时省力",
    desc: "平均节省 3 小时攻略时间，5 分钟搞定行程规划。",
  },
  {
    icon: "fa-brain",
    stat: "80%",
    title: "减负决策",
    desc: "减少 80% 规划焦虑，让旅行回归轻松惬意。",
  },
  {
    icon: "fa-leaf",
    stat: "低碳",
    title: "环保出行",
    desc: "推荐低碳路线和公共交通方案，绿色旅行。",
  },
];

export default function Why() {
  return (
    <section className="story section-pad scroll-mt-20" id="story">
      <div className="wrap">
        <Reveal className="section-head">
          <span className="eyebrow">Why We Made This</span>
          <h2 className="section-title">
            把复杂交给 AI，<em>把纯粹留给旅行</em>
          </h2>
          <p className="section-sub">
            因为我们都曾为一次旅行，刷了 30 篇攻略，还是定不下来去哪。做攻略太累、踩坑太疼——
            所以我们想用 AI 把「规划旅行」这件复杂的事，变得简单。
          </p>
        </Reveal>

        <div className="story-grid">
          <Reveal className="story-left">
            <h3 className="h-section">
              旅行者的<em className="not-italic text-accent">「烦心事」</em>
            </h3>
            <p className="mt-4">
              我们访谈了一百多位旅行者，发现 <strong>78% 的人会在出发前感到焦虑</strong>，
              <strong>65% 在途中遇到突发状况</strong>，平均一次旅行要在 <strong>4.3 个 App</strong>
              之间来回切换。
            </p>
            <p>
              攻略做不完、选择困难、预算难把控、怕踩坑——刷了 30 篇攻略，还是定不下来去哪。
              计划赶不上变化，排队、堵车、天气突变，临时找餐厅还容易踩雷。
            </p>
            <p>于是，我们做了「灵途」。</p>

            <div className="stats-row">
              {stats.map((s) => (
                <div className="stat" key={s.num}>
                  <div className="snum">{s.num}</div>
                  <div className="slabel">
                    {s.label[0]}
                    <br />
                    {s.label[1]}
                  </div>
                </div>
              ))}
            </div>
          </Reveal>

          <Reveal className="story-right" delay={80}>
            <div className="pain-points">
              {pains.map((p) => (
                <div className="pain-card" key={p.title}>
                  <div className="pain-icon">
                    <i className={`fa-solid ${p.icon}`} aria-hidden="true" />
                  </div>
                  <div>
                    <h4 className="pain-title">{p.title}</h4>
                    <p className="pain-desc">{p.desc}</p>
                    <span className="pain-badge">{p.badge}</span>
                  </div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>

        <Reveal className="values">
          {values.map((v) => (
            <div className="value-card" key={v.title}>
              <div className="vicon">
                <i className={`fa-solid ${v.icon}`} aria-hidden="true" />
              </div>
              <div className="vstat">{v.stat}</div>
              <h4 className="vtitle">{v.title}</h4>
              <p className="vdesc">{v.desc}</p>
            </div>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
