"use client";

import { useEffect, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";
import Container from "./Container";

function ArrowIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></svg>;
}

export default function Hero({ heroMode, heroImages, heroTitle, heroSubtitle, heroDescription }) {
  const images = heroImages?.length ? heroImages : [];
  const isCarousel = heroMode === "carousel";
  const [index, setIndex] = useState(0);
  const sectionRef = useRef(null);
  const textRef = useRef(null);
  const bgRef = useRef(null);

  useEffect(() => {
    if (!isCarousel || images.length < 2) return;
    const timer = setInterval(() => setIndex((current) => (current + 1) % images.length), 4500);
    return () => clearInterval(timer);
  }, [isCarousel, images.length]);

  useGSAP(() => {
    if (!isCarousel && bgRef.current) {
      gsap.to(bgRef.current, {
        yPercent: 8,
        ease: "none",
        scrollTrigger: { trigger: sectionRef.current, start: "top top", end: "bottom top", scrub: 0.6 },
      });
    }
    if (textRef.current) {
      gsap.fromTo(textRef.current, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.7, delay: 0.3, ease: "power2.out" });
    }
  }, { scope: sectionRef });

  const displayTitle = heroTitle || "UNLEASH YOUR HUNGER";
  const displaySubtitle = heroSubtitle || "Fiery Grill & Stone Crust";
  const displayDescription = heroDescription || "Savor CharBeast's premium burgers and artisan stone-baked pizzas, made with hand-crafted dough, fiery spice blends, and the freshest ingredients.";

  return (
    <section id="home" ref={sectionRef} className="relative w-full px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 lg:pt-32 pb-8 sm:pb-12">
      <div className="relative mx-auto w-full max-w-7xl overflow-hidden rounded-3xl bg-[#0a0f1a] shadow-2xl ring-1 ring-white/10">
        {isCarousel ? (
          <>
            {images.length > 0 && (
              <>
                {images.map((src, i) => (
                  <div
                    key={src}
                    ref={i === index ? bgRef : null}
                    className={`absolute inset-0 bg-cover bg-center transition-opacity duration-700 ${i === index ? "opacity-100" : "opacity-0"}`}
                    style={{ backgroundImage: `url(${src})` }}
                  />
                ))}
                {images.length > 1 && (
                  <div className="absolute right-6 bottom-5 z-20 flex gap-1.5">
                    {images.map((src, i) => (
                      <button
                        key={src}
                        type="button"
                        aria-label={`Show slide ${i + 1}`}
                        onClick={() => setIndex(i)}
                        className={`h-1.5 rounded-full transition-all ${i === index ? "w-5 bg-brand-orange" : "w-1.5 bg-white/40 hover:bg-white/70"}`}
                      />
                    ))}
                  </div>
                )}
                <div className="relative z-10 flex min-h-[500px] flex-col justify-center px-6 sm:px-10 lg:px-14 sm:min-h-[540px] lg:min-h-[600px]">
                  <div />
                </div>
              </>
            )}
            {images.length === 0 && (
              <div className="flex min-h-[500px] flex-col items-center justify-center gap-2 text-center text-white/50 px-6 sm:min-h-[540px] lg:min-h-[600px]">
                <svg className="h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-sm">No hero images configured yet.</p>
              </div>
            )}
          </>
        ) : (
          <>
            {images[0] && (
              <div
                ref={bgRef}
                className="absolute inset-0 bg-cover bg-center will-change-transform"
                style={{ backgroundImage: `url(${images[0]})` }}
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-r from-[#0a0f1a] via-[#0a0f1a]/80 to-transparent" />

            <div className="relative z-10 flex min-h-[500px] flex-col justify-center px-6 sm:px-10 lg:px-14 py-16 sm:min-h-[540px] lg:min-h-[600px]">
              <div ref={textRef} className="max-w-xl">
                <h1 className="text-3xl leading-tight font-extrabold text-white sm:text-4xl lg:text-5xl">
                  {displayTitle} <span className="text-brand-orange">{displaySubtitle}</span>
                </h1>
                <p className="mt-4 max-w-md text-sm text-white/80 sm:text-base lg:text-lg">
                  {displayDescription}
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <a
                    href="#menu"
                    className="inline-flex items-center gap-2 rounded-full bg-brand-orange px-7 py-3 text-sm font-bold text-white shadow-[0_0_20px_rgba(255,102,0,0.4)] transition hover:brightness-110 active:scale-[0.97]"
                  >
                    Order Now <ArrowIcon />
                  </a>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
