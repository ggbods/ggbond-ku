import Link from "next/link";
import { destinations } from "@/data/destinations";
import DestinationCard from "./DestinationCard";
import Reveal from "./Reveal";

export default function DestinationGrid() {
  return (
    <section className="destinations section-pad scroll-mt-20" id="destinations">
      <div className="wrap">
        <Reveal className="section-head">
          <span className="eyebrow">Destinations · 06</span>
          <h2 className="section-title">
            挑一个心动的城市，<em>让 AI 为你规划全程</em>
          </h2>
          <p className="section-sub">
            每一座城市都是一张待展开的地图。点开它，制图者已经为你绘好了路线。
          </p>
        </Reveal>

        <Reveal className="dest-grid">
          {destinations.map((d, i) => (
            <DestinationCard key={d.id} destination={d} index={i} />
          ))}
        </Reveal>

        <Reveal className="mt-[clamp(2rem,4vw,3rem)] text-center">
          <Link href="/plan/recommend" className="btn-ghost">
            <i className="fa-solid fa-wand-magic-sparkles" aria-hidden="true" />
            不知道去哪？让 AI 根据你的喜好推荐目的地
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
