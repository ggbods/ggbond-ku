import Reveal from "./Reveal";

const members = [
  {
    avatar: "朱",
    name: "朱陈潘",
    role: "Product Designer · 产品设计师",
    desc: "专注 AI 产品设计，让技术真正服务于人。",
  },
  {
    avatar: "邓",
    name: "邓欣煜",
    role: "Tech Architect · 技术架构师",
    desc: "热爱技术，擅长把 AI 落地为轻量化产品。",
  },
  {
    avatar: "朱",
    name: "朱垚谙",
    role: "Producer · 监制",
    desc: "一直在团队里，负责把方向、把关整体。",
  },
];

export default function Team() {
  return (
    <section className="team section-pad scroll-mt-20" id="team">
      <div className="wrap">
        <Reveal className="section-head">
          <span className="eyebrow">The Cartographers · 03</span>
          <h2 className="section-title">
            热爱旅行、相信 AI 能让生活更美好的<em>年轻人</em>
          </h2>
        </Reveal>

        <Reveal className="team-grid">
          {members.map((m) => (
            <div className="team-card" key={m.name}>
              <div className="team-avatar">{m.avatar}</div>
              <div>
                <h3 className="team-name">{m.name}</h3>
                <div className="team-role">{m.role}</div>
                <p className="team-desc">{m.desc}</p>
              </div>
            </div>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
