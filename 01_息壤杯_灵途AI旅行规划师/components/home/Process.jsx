import Reveal from "./Reveal";

// 五步流程：虚线航迹 + 黄铜节点
const steps = [
  { num: "01", title: "输入需求", desc: ["目的地 · 天数", "预算 · 偏好"] },
  { num: "02", title: "AI 规划", desc: ["智能匹配", "多方案生成"] },
  { num: "03", title: "行程展示", desc: ["完整行程", "可视化呈现"] },
  { num: "04", title: "行中调整", desc: ["实时修改", "重新规划"] },
  { num: "05", title: "行后整理", desc: ["游记生成", "数据沉淀"] },
];

export default function Process() {
  return (
    <section className="process section-pad scroll-mt-20" id="process">
      <div className="wrap">
        <Reveal className="section-head">
          <span className="eyebrow">The Journey · 05 Steps</span>
          <h2 className="section-title">
            从输入到出发，<em>AI 全程陪伴</em>
          </h2>
          <p className="section-sub">
            只需 5 步，完成一场完美旅行。每一步都标在地图上，不会走丢。
          </p>
        </Reveal>

        <Reveal className="process-track">
          <div className="steps">
            {steps.map((s) => (
              <div className="step" key={s.num}>
                <div className="step-node">
                  <span className="step-num">{s.num}</span>
                </div>
                <h3 className="step-title">{s.title}</h3>
                <p className="step-desc">
                  {s.desc[0]}
                  <br />
                  {s.desc[1]}
                </p>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
