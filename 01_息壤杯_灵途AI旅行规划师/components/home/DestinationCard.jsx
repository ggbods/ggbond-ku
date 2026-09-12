import Image from "next/image";
import Link from "next/link";

// 目的地卡：整卡可点，图上叠制图学标注（坐标 / 编号 / 标签）
export default function DestinationCard({ destination, index = 0 }) {
  const { name, slogan, description, image, tags, coord } = destination;

  return (
    <Link
      href={`/plan?city=${encodeURIComponent(name)}`}
      className="dest-card"
      aria-label={`规划${name}行程`}
    >
      <Image
        src={image}
        alt={`${name}风景`}
        fill
        sizes="(max-width: 560px) 92vw, (max-width: 980px) 46vw, 31vw"
      />
      {coord && <span className="dest-coord">{coord}</span>}
      <span className="dest-num">{String(index + 1).padStart(2, "0")}</span>
      <div className="dest-overlay">
        <h3 className="dest-title">{name}</h3>
        <p className="dest-sub">{slogan}</p>
        <p className="dest-desc">{description}</p>
        <div className="dest-tags">
          {tags.map((tag) => (
            <span className="dest-tag" key={tag}>
              {tag}
            </span>
          ))}
        </div>
      </div>
      <span className="dest-cta" aria-hidden="true">
        <i className="fa-solid fa-arrow-right" />
      </span>
    </Link>
  );
}
