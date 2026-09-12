"use client";

import { useEffect, useRef } from "react";

// 星海制图背景层：星图网格 + 星点 + 极光 + 噪点 + 跨页航线 + 滚动进度
// 桌面与手机通用；980px 以下隐藏航线层（避免干扰）
export default function CelestialBackground() {
  const starFieldRef = useRef(null);

  useEffect(() => {
    // 生成星点
    const field = starFieldRef.current;
    if (field) {
      field.innerHTML = "";
      const count = window.innerWidth < 768 ? 110 : 200;
      for (let i = 0; i < count; i++) {
        const s = document.createElement("span");
        s.className = "star";
        let size = Math.random() * 1.8 + 0.4;
        if (Math.random() > 0.92) {
          s.classList.add("bright");
          size *= 1.8;
        }
        s.style.width = `${size.toFixed(2)}px`;
        s.style.height = `${size.toFixed(2)}px`;
        s.style.left = `${(Math.random() * 100).toFixed(2)}%`;
        s.style.top = `${(Math.random() * 100).toFixed(2)}%`;
        s.style.opacity = (Math.random() * 0.6 + 0.3).toFixed(2);
        if (Math.random() > 0.6) s.classList.add("twinkle");
        s.style.animationDelay = `${(Math.random() * 5).toFixed(1)}s`;
        field.appendChild(s);
      }
    }

    // 滚动进度（航线绘制）
    const progress = document.querySelector(".route-progress");
    const routePath = document.querySelector(".global-route .route-path");
    const pathLength = routePath ? routePath.getTotalLength() : 0;
    if (routePath) {
      routePath.style.strokeDasharray = String(pathLength);
      routePath.style.strokeDashoffset = String(pathLength);
    }

    // 视差
    const starGrid = document.querySelector(".star-grid");
    const atmosphere = document.querySelector(".atmosphere");
    // 手机端 / 降低动效偏好下关闭视差，避免滚动掉帧
    const allowParallax =
      window.innerWidth >= 768 &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let ticking = false;

    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        const total = Math.max(
          1,
          document.documentElement.scrollHeight - window.innerHeight
        );
        const ratio = Math.min(y / total, 1);
        if (progress) progress.style.transform = `scaleX(${ratio})`;
        if (routePath) {
          routePath.style.strokeDashoffset = String(pathLength * (1 - ratio));
        }
        if (allowParallax) {
          if (field) field.style.transform = `translateY(${y * 0.15}px)`;
          if (starGrid) starGrid.style.transform = `translateY(${y * 0.08}px)`;
          if (atmosphere) atmosphere.style.transform = `translateY(${y * 0.05}px)`;
        }
        ticking = false;
      });
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    // 星辉涟漪：鼠标移入卡片时从指针位置扩散一圈星光
    const rippleHosts = document.querySelectorAll(
      ".feature-card, .dest-card, .value-card, .tech-item, .team-card, .pain-card, .card"
    );
    const cleanups = [];
    if (window.matchMedia("(hover: hover)").matches) {
      rippleHosts.forEach((host) => {
        host.classList.add("ripple-host");
        const onEnter = (event) => {
          const rect = host.getBoundingClientRect();
          const ripple = document.createElement("span");
          ripple.className = "star-ripple";
          const size = Math.max(rect.width, rect.height) * 0.6;
          ripple.style.left = `${event.clientX - rect.left}px`;
          ripple.style.top = `${event.clientY - rect.top}px`;
          ripple.style.width = `${size}px`;
          ripple.style.height = `${size}px`;
          host.appendChild(ripple);
          requestAnimationFrame(() => ripple.classList.add("go"));
          window.setTimeout(() => ripple.remove(), 1000);
        };
        host.addEventListener("mouseenter", onEnter);
        cleanups.push(() => host.removeEventListener("mouseenter", onEnter));
      });
    }

    return () => {
      window.removeEventListener("scroll", onScroll);
      cleanups.forEach((fn) => fn());
    };
  }, []);

  return (
    <>
      <div className="contour-layer" aria-hidden="true" />
      <div className="star-grid" aria-hidden="true" />
      <div className="star-field" ref={starFieldRef} aria-hidden="true" />
      <div className="atmosphere" aria-hidden="true" />
      <div className="noise-layer" aria-hidden="true" />
      <div className="global-route" aria-hidden="true">
        <svg viewBox="0 0 1440 900" preserveAspectRatio="none">
          <path
            className="route-path"
            d="M100,80 Q400,200 700,150 T1300,300 Q1100,500 800,550 T200,700 Q500,820 1200,820"
          />
        </svg>
      </div>
      <div className="route-progress" aria-hidden="true" />
    </>
  );
}
