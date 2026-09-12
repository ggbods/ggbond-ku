import Reveal from "./Reveal";

// 技术底气：八张说明卡（与设计稿一致的 4 列网格）
const items = [
  { tag: "TECH · 01", name: "RAG 检索增强", desc: "实时检索最新攻略与官方信息，减少过时数据。" },
  { tag: "TECH · 02", name: "多模态理解", desc: "同时理解文字、图片、语音，输入更自由。" },
  { tag: "TECH · 03", name: "个性化推荐", desc: "基于画像与偏好，越用越懂你的目的地。" },
  { tag: "TECH · 04", name: "NLP 自然语言", desc: "像和人一样对话，无需填表，开口即规划。" },
  { tag: "TECH · 05", name: "语音识别", desc: "行中解放双手，一句话即可临时调整。" },
  { tag: "TECH · 06", name: "知识图谱", desc: "景点、美食、交通关联推理，路线更合理。" },
  { tag: "TECH · 07", name: "实时数据处理", desc: "天气、排队、路况秒级响应，动态更新行程。" },
  { tag: "TECH · 08", name: "端侧缓存", desc: "弱网也能用，关键信息本地缓存不掉线。" },
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

export default function Tech() {
  return (
    <section className="tech section-pad scroll-mt-20" id="tech">
      <div className="wrap">
        <Reveal className="section-head">
          <span className="eyebrow">Under the Hood · 08</span>
          <h2 className="section-title">
            我们的<em>技术底气</em>
          </h2>
          <p className="section-sub">
            从大模型到端侧缓存，八项核心能力，撑起每一次靠谱的规划。
          </p>
        </Reveal>

        <Reveal className="tech-grid">
          {items.map((t) => (
            <div className="tech-item" key={t.tag}>
              <Rivets />
              <div className="ttag">{t.tag}</div>
              <div className="tname">{t.name}</div>
              <p className="tdesc">{t.desc}</p>
            </div>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
