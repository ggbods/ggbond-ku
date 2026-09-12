// 攻略头部：目的地、标题、一句话概括
export default function PlanHeader({ plan }) {
  return (
    <header className="mb-[clamp(2rem,4.5vw,2.75rem)] text-center">
      <span className="inline-block rounded-full border border-accent/30 bg-accent/10 px-4 py-1 t-fluid font-medium text-accent">
        <i className="fa-solid fa-location-dot mr-1.5" aria-hidden="true" />
        {plan.destination}
      </span>
      <h1 className="h-section mt-4 text-ink">{plan.title}</h1>
      {plan.summary && (
        <p className="mx-auto mt-3 max-w-[56ch] t-lead text-body">
          {plan.summary}
        </p>
      )}
    </header>
  );
}
