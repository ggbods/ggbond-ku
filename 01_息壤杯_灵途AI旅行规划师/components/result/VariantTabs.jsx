// 多方案切换标签
export default function VariantTabs({ names, active, onChange }) {
  if (!names || names.length < 2) return null;

  return (
    <div className="mb-6 flex flex-wrap justify-center gap-2" role="tablist">
      {names.map((name, i) => (
        <button
          key={i}
          type="button"
          role="tab"
          aria-selected={active === i}
          onClick={() => onChange(i)}
          className={`pill ${active === i ? "pill-active" : ""}`}
        >
          {name}
        </button>
      ))}
    </div>
  );
}
