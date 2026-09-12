// 实用贴士列表
export default function TipsList({ tips }) {
  if (!tips || tips.length === 0) return null;

  return (
    <section className="mt-[clamp(2rem,4.5vw,2.75rem)]">
      <h2 className="mb-[clamp(1rem,2.5vw,1.5rem)] text-[clamp(1.1rem,2.4vw,1.35rem)] font-bold text-ink">
        <i className="fa-solid fa-lightbulb mr-2 text-warm" aria-hidden="true" />
        实用贴士
      </h2>
      <div className="card card-pad-sm">
        <ul className="space-y-2.5">
          {tips.map((tip, i) => (
            <li key={i} className="flex gap-2 t-fluid leading-relaxed text-body">
              <span className="shrink-0 text-warm">✦</span>
              <span>{tip}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
