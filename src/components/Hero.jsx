"use client";

import { useEffect, useState } from "react";
import Container from "./Container";

function ArrowIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></svg>;
}

export default function Hero({ heroMode, heroImages, heroTitle, heroSubtitle, heroDescription }) {
  const images = heroImages?.length ? heroImages : [];
  const isCarousel = heroMode === "carousel";
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!isCarousel || images.length < 2) return;
    const timer = setInterval(() => setIndex((current) => (current + 1) % images.length), 4500);
    return () => clearInterval(timer);
  }, [isCarousel, images.length]);

  const displayTitle = heroTitle || "UNLEASH YOUR HUNGER";
  const displaySubtitle = heroSubtitle || "Fiery Grill & Stone Crust";
  const displayDescription = heroDescription || "Savor CharBeast's premium burgers and artisan stone-baked pizzas, made with hand-crafted dough, fiery spice blends, and the freshest ingredients.";

  return (
    <section id="home" className="relative bg-[#0a0f1a] overflow-hidden pt-20 sm:pt-24 lg:pt-28">
      {isCarousel ? (
        <>
          {images.length > 0 && (
            <>
              {images.map((src, i) => (
                <div
                  key={src}
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
              <Container className="relative z-10 flex min-h-[500px] flex-col justify-center sm:min-h-[540px] lg:min-h-[600px]">
                <div />
              </Container>
            </>
          )}
          {images.length === 0 && (
            <Container className="flex min-h-[500px] flex-col items-center justify-center gap-2 text-center text-white/50 sm:min-h-[540px] lg:min-h-[600px]">
              <svg className="h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-sm">No hero images configured yet.</p>
            </Container>
          )}
        </>
      ) : (
        <>
          {images[0] && (
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${images[0]})` }}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-[#0a0f1a] via-[#0a0f1a]/80 to-transparent" />

          <Container className="relative z-10 flex min-h-[500px] flex-col justify-center py-16 sm:min-h-[540px] lg:min-h-[600px]">
            <div className="max-w-xl">
              <h1 className="text-3xl leading-tight font-extrabold text-white sm:text-4xl">
                {displayTitle} <span className="text-brand-orange">{displaySubtitle}</span>
              </h1>
              <p className="mt-4 max-w-md text-sm text-white/80 sm:text-base">
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
          </Container>
        </>
      )}
    </section>
  );
}
