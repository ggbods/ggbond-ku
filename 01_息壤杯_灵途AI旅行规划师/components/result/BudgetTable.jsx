// 预算明细表格
export default function BudgetTable({ budget }) {
  if (!budget || !Array.isArray(budget.breakdown) || budget.breakdown.length === 0) {
    return null;
  }

  const total = budget.breakdown.reduce((s, b) => s + (Number(b.amount) || 0), 0);

  return (
    <section className="mt-[clamp(2rem,4.5vw,2.75rem)]">
      <h2 className="mb-[clamp(1rem,2.5vw,1.5rem)] text-[clamp(1.1rem,2.4vw,1.35rem)] font-bold text-ink">
        <i className="fa-solid fa-coins mr-2 text-accent" aria-hidden="true" />
        预算明细
      </h2>
      <div className="card overflow-hidden">
        <table className="w-full t-fluid">
          <thead>
            <tr className="border-b border-white/5 bg-white/5 text-left text-dim">
              <th className="px-[clamp(0.75rem,2vw,1.25rem)] py-3 font-medium">类别</th>
              <th className="px-[clamp(0.75rem,2vw,1.25rem)] py-3 text-right font-medium">金额</th>
              <th className="hidden px-[clamp(0.75rem,2vw,1.25rem)] py-3 font-medium sm:table-cell">说明</th>
            </tr>
          </thead>
          <tbody>
            {budget.breakdown.map((b, i) => (
              <tr key={i} className="border-b border-white/5 last:border-0">
                <td className="px-[clamp(0.75rem,2vw,1.25rem)] py-3 font-medium text-ink">
                  {b.category}
                  {b.note && (
                    <span className="mt-0.5 block t-small font-normal text-dim sm:hidden">
                      {b.note}
                    </span>
                  )}
                </td>
                <td className="px-[clamp(0.75rem,2vw,1.25rem)] py-3 text-right whitespace-nowrap text-ink">
                  ¥{Number(b.amount) || 0}
                </td>
                <td className="hidden px-[clamp(0.75rem,2vw,1.25rem)] py-3 text-body sm:table-cell">
                  {b.note}
                </td>
              </tr>
            ))}
            <tr className="bg-accent/10">
              <td className="px-[clamp(0.75rem,2vw,1.25rem)] py-3 font-bold text-accent">合计</td>
              <td className="px-[clamp(0.75rem,2vw,1.25rem)] py-3 text-right font-bold whitespace-nowrap text-accent">
                ¥{total}
              </td>
              <td className="hidden px-[clamp(0.75rem,2vw,1.25rem)] py-3 sm:table-cell" />
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  );
}
