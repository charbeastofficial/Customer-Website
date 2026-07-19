"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import Container from "./Container";

const STATS = [
  { value: "5+", label: "Years serving the community" },
  { value: "50K+", label: "Orders fire-grilled to perfection" },
  { value: "4.9★", label: "Average rating from our guests" },
];

export default function Hero({ heroMode, heroImages, heroTitle, heroSubtitle, heroDescription }) {
  const images = heroImages?.length ? heroImages : [];
  const isCarousel = heroMode === "carousel";
  const isImageOnly = heroMode === "imageOnly";
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!isCarousel || images.length < 2) return;
    const timer = setInterval(() => setIndex((current) => (current + 1) % images.length), 4500);
    return () => clearInterval(timer);
  }, [isCarousel, images.length]);

  // If imageOnly mode, show only the image without any text overlay
  if (isImageOnly && images.length > 0) {
    return (
      <section id="home" className="pt-20 sm:pt-24 lg:pt-28 pb-6 sm:pb-8 lg:pb-10">
        <Container>
          <div className="relative flex min-h-[400px] w-full overflow-hidden rounded-[2rem] bg-ink shadow-2xl shadow-ink/15 sm:min-h-[450px] lg:min-h-[500px]">
            <Image 
              src={images[0]} 
              alt="CharBeast flame-grilled feast" 
              fill 
              priority 
              sizes="(min-width: 1240px) 1240px, 100vw" 
              className="object-cover" 
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/30 via-ink/10 to-transparent" />
          </div>
        </Container>
      </section>
    );
  }

  // If carousel mode, show carousel without text
  if (isCarousel && images.length > 0) {
    return (
      <section id="home" className="pt-20 sm:pt-24 lg:pt-28 pb-6 sm:pb-8 lg:pb-10">
        <Container>
          <div className="relative flex min-h-[400px] w-full overflow-hidden  bg-ink shadow-2xl shadow-ink/15 sm:min-h-[450px] lg:min-h-[500px]">
            {images.map((src, imageIndex) => (
              <Image 
                key={src} 
                src={src} 
                alt="" 
                fill 
                priority={imageIndex === 0} 
                sizes="(min-width: 1240px) 1240px, 100vw" 
                className={`object-cover transition-opacity duration-1000 ease-in-out ${imageIndex === index ? "opacity-100" : "opacity-0"}`} 
              />
            ))}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/30 via-ink/10 to-transparent" />
            
            {/* Carousel Dots */}
            {images.length > 1 && (
              <div className="absolute right-6 bottom-6 flex gap-2 sm:right-10 sm:bottom-10">
                {images.map((src, imageIndex) => (
                  <button 
                    key={src} 
                    type="button" 
                    aria-label={`Show slide ${imageIndex + 1}`} 
                    onClick={() => setIndex(imageIndex)} 
                    className={`h-2 rounded-full transition-all ${imageIndex === index ? "w-7 bg-brand" : "w-2 bg-white/50 hover:bg-white"}`} 
                  />
                ))}
              </div>
            )}
          </div>
        </Container>
      </section>
    );
  }

  // Default mode with text overlay (when text is set by admin)
  const hasTextContent = heroTitle || heroSubtitle || heroDescription;
  
  return (
    <section id="home" className="pt-20 sm:pt-24 lg:pt-28 pb-6 sm:pb-8 lg:pb-10">
      <Container>
        <div className="relative flex min-h-[500px] w-full items-end overflow-hidden rounded-[2rem] bg-ink shadow-2xl shadow-ink/15 sm:min-h-[540px] lg:min-h-[600px]">
          {images.length > 0 ? (
            <Image 
              src={images[0]} 
              alt="" 
              fill 
              priority 
              sizes="(min-width: 1240px) 1240px, 100vw" 
              className="object-cover" 
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-char via-ink to-char-deep" />
          )}
          
          {/* Gradients */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink via-ink/75 to-ink/10" />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-ink/80 via-ink/35 to-transparent" />
          <div className="pointer-events-none absolute -top-20 -right-20 h-72 w-72 rounded-full bg-brand/25 blur-3xl" />

          {/* Content with text */}
          <div className="relative w-full px-6 pb-7 sm:px-10 sm:pb-10 lg:px-14 lg:pb-14">
            <div className="max-w-2xl">
              {(heroSubtitle || hasTextContent) && (
                <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-[11px] font-bold tracking-[0.14em] text-brand uppercase backdrop-blur-sm">
                  <span className="h-1.5 w-1.5 rounded-full bg-brand shadow-[0_0_12px_3px_rgba(251,74,54,0.65)]" />
                  {heroSubtitle || "Fire-grilled. Fast."}
                </span>
              )}
              <h1 className="balance mt-5 text-4xl leading-[0.98] font-extrabold text-cream sm:text-5xl lg:text-6xl">
                {heroTitle || <>Flavors that hit<br />harder than hunger.</>}
              </h1>
              <p className="mt-5 max-w-xl text-sm leading-relaxed text-cream/75 sm:text-base">
                {heroDescription || "Flame-grilled burgers, crispy fried chicken, and stone-baked pizza - cooked to order and delivered fast."}
              </p>
              <div className="mt-7 flex flex-wrap items-center gap-4">
                <a href="#menu" className="inline-flex items-center gap-2 rounded-full bg-brand px-6 py-3.5 text-sm font-bold text-white shadow-[0_14px_30px_-8px_rgba(251,74,54,0.7)] transition hover:-translate-y-0.5 hover:bg-brand-dark active:scale-[0.98]">
                  Order now <ArrowIcon />
                </a>
                <a href="#deals" className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold text-cream transition hover:bg-white/10">
                  View offers
                </a>
              </div>
              <div className="mt-9 grid max-w-xl grid-cols-3 gap-3 border-t border-white/15 pt-5 sm:gap-5">
                {STATS.map((stat) => (
                  <div key={stat.label}>
                    <div className="text-lg font-extrabold text-brand sm:text-xl">{stat.value}</div>
                    <p className="mt-1 max-w-[9rem] text-[10px] leading-snug text-cream/65 sm:text-[11px]">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

function ArrowIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></svg>;
}