"use client";

import { useEffect, useRef, useState } from "react";

// Animates in the first time the element actually scrolls into view (not on
// mount) -- below-the-fold sections used to fade in before anyone could see
// them happen, which defeated the point of a "reveal".
export default function Reveal({ children, className = "", delay = 0, as: Tag = "div" }) {
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
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const style = visible
    ? { animation: `fadeSlideUp 0.55s ease-out ${delay}ms both` }
    : { opacity: 0 };

  return (
    <Tag ref={ref} className={className} style={style}>
      {children}
    </Tag>
  );
}
