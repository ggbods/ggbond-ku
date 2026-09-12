// 交通指南卡片
export default function TransportCard({ transport }) {
  if (
    !transport ||
    (!transport.summary &&
      (!Array.isArray(transport.items) || transport.items.length === 0))
  ) {
    return null;
  }

  return (
    <section className="mt-[clamp(2rem,4.5vw,2.75rem)]">
      <h2 className="mb-[clamp(1rem,2.5vw,1.5rem)] text-[clamp(1.1rem,2.4vw,1.35rem)] font-bold text-ink">
        <i className="fa-solid fa-train-subway mr-2 text-accent" aria-hidden="true" />
        交通指南
      </h2>
      <div className="card card-pad-sm">
        {transport.summary && (
          <p className="t-fluid leading-relaxed text-body">{transport.summary}</p>
        )}
        {Array.isArray(transport.items) && transport.items.length > 0 && (
          <ul className="mt-3 space-y-2">
            {transport.items.map((item, i) => (
              <li key={i} className="flex gap-2 t-fluid text-body">
                <span className="text-accent">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
