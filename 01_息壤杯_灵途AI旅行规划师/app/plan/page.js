import FormShell from "@/components/plan/FormShell";

export const metadata = { title: "开始规划" };

// 支持从首页卡片跳转过来：/plan?city=北京 会预填目的地
export default async function PlanPage({ searchParams }) {
  const params = await searchParams;
  const city = typeof params.city === "string" ? params.city : "";
  return <FormShell initialDestination={city} />;
}
