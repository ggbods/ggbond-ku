// 美食推荐卡片网格
export default function FoodList({ food }) {
  if (!food || food.length === 0) return null;

  return (
    <section className="mt-[clamp(2rem,4.5vw,2.75rem)]">
      <h2 className="mb-[clamp(1rem,2.5vw,1.5rem)] text-[clamp(1.1rem,2.4vw,1.35rem)] font-bold text-ink">
        <i className="fa-solid fa-utensils mr-2 text-accent" aria-hidden="true" />
        美食推荐
      </h2>
      <div className="auto-grid">
        {food.map((f, i) => (
          <div key={i} className="card card-pad-sm h-full">
            <div className="flex items-start justify-between gap-2">
              <h3 className="h-card text-ink">{f.name}</h3>
              {f.avgPrice > 0 && (
                <span className="shrink-0 rounded-full bg-warm/15 px-2.5 py-0.5 t-small font-medium text-warm">
                  ¥{f.avgPrice}
                </span>
              )}
            </div>
            {f.venue && (
              <p className="mt-1 t-fluid text-accent">
                <i className="fa-solid fa-location-dot mr-1" aria-hidden="true" />
                {f.venue}
              </p>
            )}
            {f.desc && <p className="mt-1 t-fluid text-body">{f.desc}</p>}
          </div>
        ))}
      </div>
    </section>
  );
}
