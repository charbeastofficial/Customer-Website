import Container from "./Container";
import Reveal from "./Reveal";
import Eyebrow from "./Eyebrow";

const FALLBACK_TESTIMONIALS = [
  {
    name: "Ayesha K.",
    tag: "Regular, Zinger Burger",
    quote:
      "Ordered on a whim during a late shift and now it's a weekly thing. The zinger actually stays crispy by the time it's delivered, which never happens anywhere else.",
    rating: 5,
  },
  {
    name: "Bilal M.",
    tag: "Dine-in",
    quote:
      "You can taste the difference between grilled and reheated the second you bite in. The Beast Combo is stupid good for the price.",
    rating: 5,
  },
  {
    name: "Hina S.",
    tag: "Weekend regular",
    quote:
      "Ordered the Pizza deal for a family night and there was nothing left. Dough was properly proofed, not the usual cardboard base.",
    rating: 4,
  },
];

export default function TestimonialsSection({ reviews }) {
  const items =
    reviews && reviews.length > 0
      ? reviews.slice(0, 6).map((r) => ({
          name: r.customerName,
          tag: "Verified order",
          quote: r.comment || "Great experience, would order again.",
          rating: r.rating,
        }))
      : FALLBACK_TESTIMONIALS;

  return (
    <section id="reviews" className="py-20 lg:py-28">
      <Container>
        <Reveal className="text-center">
          <Eyebrow center>Reviews</Eyebrow>
          <h2 className="balance mx-auto mt-4 max-w-lg text-3xl font-bold text-ink sm:text-4xl">
            What people say after the first bite.
          </h2>
        </Reveal>

        <div className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-3">
          {items.map((t, i) => (
            <Reveal key={`${t.name}-${i}`} delay={i * 100}>
              <figure className="group relative flex h-full flex-col overflow-hidden rounded-3xl bg-white p-6 sm:p-8 shadow-sm ring-1 ring-stone/10 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:ring-brand/20">
                <div className="absolute inset-0 bg-gradient-to-br from-brand/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 pointer-events-none" />
                <div className="relative z-10 flex flex-col h-full">
                  <div className="flex gap-0.5 text-brand">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <StarIcon key={i} filled={i < t.rating} />
                    ))}
                  </div>
                  <blockquote className="mt-5 flex-1 text-[15px] italic leading-relaxed text-ink-soft/80 group-hover:text-ink-soft transition-colors">"{t.quote}"</blockquote>
                  <figcaption className="mt-6 flex items-center gap-4 pt-5 border-t border-stone/30">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand to-brand-dark text-sm font-bold text-white shadow-md shadow-brand/20 group-hover:scale-110 transition-transform">
                      {t.name.charAt(0)}
                    </span>
                    <div className="flex flex-col">
                      <p className="text-sm font-bold text-ink">{t.name}</p>
                      <p className="text-[11px] font-semibold tracking-wide uppercase text-ink-soft/50">{t.tag}</p>
                    </div>
                  </figcaption>
                </div>
              </figure>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}

function StarIcon({ filled }) {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.6">
      <path d="M12 2.5l2.94 6.44 7.06.65-5.34 4.72 1.6 6.92L12 17.9l-6.26 3.33 1.6-6.92L2 10.59l7.06-.65L12 2.5z" strokeLinejoin="round" />
    </svg>
  );
}
