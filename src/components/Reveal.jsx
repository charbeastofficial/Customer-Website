"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";

export default function Reveal({ children, className = "", delay = 0, as: Tag = "div" }) {
  const ref = useRef(null);

  useGSAP(() => {
    const el = ref.current;
    if (!el) return;
    gsap.fromTo(
      el,
      { opacity: 0, y: 20 },
      {
        opacity: 1,
        y: 0,
        duration: 0.55,
        delay: delay / 1000,
        ease: "power2.out",
        scrollTrigger: { trigger: el, start: "top 88%" },
      }
    );
  });

  return (
    <Tag ref={ref} className={`opacity-0 ${className}`}>
      {children}
    </Tag>
  );
}
