// 单个行程条目：时间段徽标 + 景点信息
const PERIOD_STYLE = {
  上午: "period-am",
  下午: "period-pm",
  晚上: "period-eve",
};

export default function SpotRow({ item }) {
  const periodStyle = PERIOD_STYLE[item.period] || "period-default";

  return (
    <div className="flex gap-[clamp(0.6rem,1.6vw,1rem)] border-b border-white/5 py-[clamp(0.75rem,1.8vw,1rem)] last:border-0">
      <span className={`period-badge mt-0.5 h-fit shrink-0 ${periodStyle}`}>
        {item.period}
      </span>
      <div className="min-w-0 flex-1">
        <p className="h-card text-ink">
          {item.spot}
          {item.duration && (
            <span className="ml-2 t-small font-normal text-dim">
              {item.duration}
            </span>
          )}
        </p>
        {item.activity && (
          <p className="mt-0.5 t-fluid text-body">{item.activity}</p>
        )}
        {item.transport && (
          <p className="mt-1 t-small text-dim">
            <i className="fa-solid fa-train-subway mr-1" aria-hidden="true" />
            {item.transport}
          </p>
        )}
        {item.tips && (
          <p className="mt-1 t-small text-accent">
            <i className="fa-solid fa-lightbulb mr-1" aria-hidden="true" />
            {item.tips}
          </p>
        )}
      </div>
    </div>
  );
}
