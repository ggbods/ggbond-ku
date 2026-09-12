// 多方案对比表
export default function CompareTable({ plans, names }) {
  if (!plans || plans.length < 2) return null;

  const spotCount = (p) =>
    p?.days?.reduce((s, d) => s + (d.items?.length || 0), 0) || 0;

  const rows = [
    { label: "方案标题", get: (p) => p?.title || "-" },
    { label: "出行天数", get: (p) => `${p?.days?.length || "-"} 天` },
    { label: "景点数量", get: (p) => `${spotCount(p)} 个` },
    { label: "美食推荐", get: (p) => `${p?.food?.length || "-"} 家` },
    { label: "预算总额", get: (p) => `¥${p?.budget?.total ?? "-"}` },
    {
      label: "行程特色",
      get: (p) =>
        p?.summary
          ? p.summary.slice(0, 42) + (p.summary.length > 42 ? "…" : "")
          : "-",
    },
  ];

  return (
    <div className="card mb-8 overflow-x-auto">
      <table className="w-full min-w-[min(560px,140vw)] t-fluid">
        <thead>
          <tr className="border-b border-white/5 bg-white/5 text-left text-dim">
            <th className="px-[clamp(0.6rem,1.6vw,1rem)] py-3 font-medium whitespace-nowrap">
              对比项
            </th>
            {names.map((n, i) => (
              <th key={i} className="px-[clamp(0.6rem,1.6vw,1rem)] py-3 font-medium text-accent">
                {n}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.label} className="border-b border-white/5 last:border-0">
              <td className="px-[clamp(0.6rem,1.6vw,1rem)] py-3 whitespace-nowrap text-dim">
                {row.label}
              </td>
              {plans.map((p, i) => (
                <td key={i} className="px-[clamp(0.6rem,1.6vw,1rem)] py-3 leading-relaxed text-body">
                  {row.get(p)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
