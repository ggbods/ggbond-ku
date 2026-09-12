"use client";

import { useEffect, useRef, useState } from "react";

// 滚入显示动画（类似 AOS 的 fade-up）
// 用法：<Reveal delay={100} className="..." style={{ width: "min(700px, 92vw)" }}>内容</Reveal>
export default function Reveal({ children, delay = 0, className = "", style }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`reveal ${visible ? "visible" : ""} ${className}`}
      style={delay ? { transitionDelay: `${delay}ms`, ...style } : style}
    >
      {children}
    </div>
  );
}
