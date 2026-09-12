// 选项胶囊：单选 / 多选通用
// rank 有值时在右下角显示优先级角标（1 = 优先级最高）
export default function OptionPill({
  label,
  selected,
  onClick,
  rank = null,
  disabled = false,
}) {
  const showRank = selected && rank != null;
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={selected}
      aria-label={showRank ? `${label}（优先级 ${rank}）` : label}
      className={`pill ${selected ? "pill-active" : ""} ${
        disabled && !selected ? "pill-disabled" : ""
      }`}
    >
      {label}
      {showRank && (
        <span className="pill-rank" aria-hidden="true">
          {rank}
        </span>
      )}
    </button>
  );
}
