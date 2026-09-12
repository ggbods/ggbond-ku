import Hero from "@/components/home/Hero";
import Features from "@/components/home/Features";
import Process from "@/components/home/Process";
import DestinationGrid from "@/components/home/DestinationGrid";
import Why from "@/components/home/Why";
import Tech from "@/components/home/Tech";
import Team from "@/components/home/Team";

// 首页板块顺序与设计稿一致：Hero → 核心能力 → 流程 → 目的地 → 关于 → 技术 → 团队
export default function Home() {
  return (
    <>
      <Hero />
      <Features />
      <Process />
      <DestinationGrid />
      <Why />
      <Tech />
      <Team />
    </>
  );
}
