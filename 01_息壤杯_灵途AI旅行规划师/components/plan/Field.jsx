// 表单字段容器：标签 + 提示 + 控件
// 同一行的多个字段用 flex 列布局 + mt-auto，保证输入框底部对齐（提示换行也不会错位）
export default function Field({ label, hint, children }) {
  return (
    <div className="flex h-full flex-col">
      <label className="block t-fluid font-semibold text-ink">
        {label}
        {hint && <span className="ml-2 t-small font-normal text-dim">{hint}</span>}
      </label>
      <div className="mt-auto pt-2">{children}</div>
    </div>
  );
}
