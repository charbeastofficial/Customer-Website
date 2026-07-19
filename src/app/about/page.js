import Image from "next/image";
import { db } from "@/lib/db";
import SiteChrome from "@/components/SiteChrome";
import Container from "@/components/Container";
import Reveal from "@/components/Reveal";
import Eyebrow from "@/components/Eyebrow";
import TestimonialsSection from "@/components/TestimonialsSection";

export const revalidate = 0;

import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Our Story",
  description: "The story behind CharBeast's fire-grilled burgers, fried chicken, and stone-baked pizza.",
  path: "/about",
});

const PILLARS = [
  {
    icon: "🔥",
    title: "Fire-Grilled",
    text: "Every patty hits an open flame — never steamed, never microwaved.",
  },
  {
    icon: "🧊",
    title: "Never Frozen",
    text: "Prepped fresh each morning and cooked to order, every single time.",
  },
  {
    icon: "🧑",
    title: "Built by Cooks",
    text: "Started with a single grill and a stubborn belief in real food.",
  },
];

export default async function AboutPage() {
  const [siteSettings, heroImages, reviews] = await Promise.all([
    db.getSiteSettings(),
    db.getHeroImages(),
    db.getReviews().catch(() => []),
  ]);

  return (
    <SiteChrome taxRate={siteSettings.taxRate}>
 

      {/* Story Section */}
      <section className="mt-10 lg:py-20 bg-white">
        <Container>
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
            <Reveal>
              <Eyebrow>Our Story</Eyebrow>
              <h1 className="mt-3 text-2xl font-bold text-ink sm:text-3xl">
                We're a kitchen, not a chain.
              </h1>
              <p className="mt-4 text-sm leading-relaxed text-ink-soft">
                CharBeast opened with one grill, one fryer, and a menu short enough to actually get right. 
                Every burger is smashed and grilled to order, our chicken is breaded in-house, 
                and our pizza dough gets a full day to prove.
              </p>
              <p className="mt-3 text-sm leading-relaxed text-ink-soft">
                We'd rather make ten things well than fifty things forgettable.
              </p>
            </Reveal>

            <Reveal delay={100}>
              <div className="grid grid-cols-1 gap-4">
                {PILLARS.map((pillar) => (
                  <div key={pillar.title} className="flex items-start gap-4 rounded-2xl bg-cream-soft/50 p-5 ring-1 ring-stone/10">
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-soft text-2xl">
                      {pillar.icon}
                    </span>
                    <div>
                      <h3 className="font-bold text-ink">{pillar.title}</h3>
                      <p className="mt-0.5 text-sm text-ink-soft/70">{pillar.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </Container>
      </section>


      {/* Testimonials */}
      <TestimonialsSection reviews={reviews} />

      
    </SiteChrome>
  );
}