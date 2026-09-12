import SpotRow from "./SpotRow";

// 单日卡片：日期徽标 + 当天安排
export default function DayCard({ day }) {
  return (
    <div className="card brass-card overflow-hidden">
      <div className="flex items-center gap-3 border-b border-white/5 bg-white/5 px-[clamp(0.9rem,2vw,1.25rem)] py-[clamp(0.75rem,1.6vw,1rem)]">
        <span
          className="flex h-[clamp(2.1rem,4.5vw,2.5rem)] w-[clamp(2.1rem,4.5vw,2.5rem)] shrink-0 items-center justify-center rounded-full border font-mono t-small font-bold"
          style={{
            borderColor: "var(--brass)",
            color: "var(--brass)",
            background: "color-mix(in srgb, var(--brass) 12%, transparent)",
          }}
        >
          D{day.day}
        </span>
        <div className="min-w-0">
          <h3 className="h-card text-ink">{day.title}</h3>
          {day.theme && <p className="t-small text-dim">{day.theme}</p>}
        </div>
      </div>
      <div className="px-[clamp(0.9rem,2vw,1.25rem)] py-2">
        {day.items?.map((item, i) => (
          <SpotRow key={i} item={item} />
        ))}
      </div>
    </div>
  );
}
