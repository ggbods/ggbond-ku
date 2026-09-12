import DayCard from "./DayCard";

// 每日行程时间线容器
export default function DayTimeline({ days }) {
  if (!days || days.length === 0) return null;

  return (
    <section className="mt-[clamp(2rem,4.5vw,2.75rem)]">
      <h2 className="mb-[clamp(1rem,2.5vw,1.5rem)] text-[clamp(1.1rem,2.4vw,1.35rem)] font-bold text-ink">
        <i className="fa-regular fa-calendar mr-2 text-accent" aria-hidden="true" />
        每日行程
      </h2>
      <div className="space-y-[clamp(1rem,2.5vw,1.5rem)]">
        {days.map((day, i) => (
          <DayCard key={day.day ?? i} day={day} />
        ))}
      </div>
    </section>
  );
}
