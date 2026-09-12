// 表单校验 / 提交错误提示
export default function StepError({ message }) {
  return (
    <div
      className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 t-fluid text-red-400"
      role="alert"
    >
      <i className="fa-solid fa-triangle-exclamation mr-2" aria-hidden="true" />
      {message}
    </div>
  );
}
