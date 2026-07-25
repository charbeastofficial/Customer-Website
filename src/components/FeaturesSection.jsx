"use client";

import Container from "./Container";
import Reveal from "./Reveal";
import Eyebrow from "./Eyebrow";

const FEATURES = [
  {
    title: "Premium Ingredients",
    description: "We source only the finest meats and freshest vegetables. No compromises, just pure quality.",
    icon: (
      <svg className="h-8 w-8 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
      </svg>
    ),
  },
  {
    title: "Stone-Baked Ovens",
    description: "Authentic, artisan pizzas cooked at blistering temperatures for that perfect blistered crust.",
    icon: (
      <svg className="h-8 w-8 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.866 8.21 8.21 0 003 2.48z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18a3.75 3.75 0 00.495-7.467 5.99 5.99 0 00-1.925 3.546 5.974 5.974 0 01-2.133-1A3.75 3.75 0 0012 18z" />
      </svg>
    ),
  },
  {
    title: "Fast Delivery",
    description: "Hot, fresh, and straight to your door. We ensure your food arrives exactly how you expect it.",
    icon: (
      <svg className="h-8 w-8 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
      </svg>
    ),
  },
];

export default function FeaturesSection() {
  return (
    <section className="py-20 lg:py-28 bg-white relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cream-soft via-white to-white pointer-events-none" />
      <Container className="relative z-10">
        <Reveal className="text-center max-w-2xl mx-auto mb-16">
          <Eyebrow center>Why Choose Us</Eyebrow>
          <h2 className="text-3xl font-bold text-ink sm:text-4xl mt-3">
            The CharBeast Difference
          </h2>
          <p className="mt-4 text-ink-soft text-sm sm:text-base">
            We don't just make food. We craft experiences with passion, using the best ingredients and techniques.
          </p>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          {FEATURES.map((feature, i) => (
            <Reveal
              key={feature.title}
              className="group relative rounded-3xl bg-white p-8 shadow-sm ring-1 ring-stone/10 hover:shadow-xl hover:-translate-y-2 transition-all duration-300"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="absolute -inset-px rounded-3xl opacity-0 transition-opacity duration-300 group-hover:opacity-100 pointer-events-none">
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-brand/10 to-transparent" />
              </div>
              <div className="relative z-10 flex flex-col items-center text-center">
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-cream-soft text-brand shadow-inner group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-ink mb-3 group-hover:text-brand transition-colors">
                  {feature.title}
                </h3>
                <p className="text-sm text-ink-soft leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
