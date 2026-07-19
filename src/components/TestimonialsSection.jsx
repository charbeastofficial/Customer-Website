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
          <Eyebrow className="text-center">Reviews</Eyebrow>
          <h2 className="balance mx-auto mt-4 max-w-lg text-3xl font-bold text-ink sm:text-4xl">
            What people say after the first bite.
          </h2>
        </Reveal>

        <div className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-3">
          {items.map((t, i) => (
            <Reveal key={`${t.name}-${i}`} delay={i * 100}>
              <figure className="flex h-full flex-col rounded-3xl border border-stone/70 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg hover:shadow-ink/5">
                <div className="flex gap-0.5 text-brand">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <StarIcon key={i} filled={i < t.rating} />
                  ))}
                </div>
                <blockquote className="mt-4 flex-1 text-sm leading-relaxed text-ink-soft">"{t.quote}"</blockquote>
                <figcaption className="mt-5 flex items-center gap-3 border-t border-stone/60 pt-4">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-soft text-sm font-bold text-brand">
                    {t.name.charAt(0)}
                  </span>
                  <div>
                    <p className="text-sm font-bold text-ink">{t.name}</p>
                    <p className="text-xs text-ink-soft">{t.tag}</p>
                  </div>
                </figcaption>
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
