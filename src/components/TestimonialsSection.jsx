import Container from "./Container";
import Reveal from "./Reveal";
import Eyebrow from "./Eyebrow";

const COLUMN_DURATIONS = [26, 32, 29];
const COLUMN_VISIBILITY = ["", "hidden md:block", "hidden lg:block"];

// Distributes reviews round-robin across up to 3 columns so each column
// stays a similar length regardless of how many reviews exist in total.
function splitIntoColumns(items, count) {
  const columns = Array.from({ length: count }, () => []);
  items.forEach((item, i) => columns[i % count].push(item));
  return columns.filter((col) => col.length > 0);
}

export default function TestimonialsSection({ reviews }) {
  const items = (reviews || []).slice(0, 15).map((r) => ({
    name: r.customerName,
    tag: "Verified order",
    quote: r.comment || "Great experience, would order again.",
    rating: r.rating,
  }));

  if (items.length === 0) return null;

  const columns = splitIntoColumns(items, Math.min(3, items.length));

  return (
    <section id="reviews" className="py-20 lg:py-28 overflow-hidden">
      <Container>
        <Reveal className="text-center">
          <Eyebrow center>Reviews</Eyebrow>
          <h2 className="balance mx-auto mt-4 max-w-lg text-3xl font-bold text-ink sm:text-4xl">
            What people say after the first bite.
          </h2>
        </Reveal>

        <div className="relative mt-12 flex max-h-[720px] justify-center gap-6 overflow-hidden [mask-image:linear-gradient(to_bottom,transparent,black_8%,black_92%,transparent)]">
          {columns.map((col, i) => (
            <TestimonialColumn
              key={i}
              items={col}
              duration={COLUMN_DURATIONS[i]}
              className={COLUMN_VISIBILITY[i]}
            />
          ))}
        </div>
      </Container>
    </section>
  );
}

function TestimonialColumn({ items, duration, className = "" }) {
  // Only loops smoothly with 2+ items -- a single-review column just sits
  // still instead of visibly jumping in place.
  const looped = items.length > 1 ? [...items, ...items] : items;

  return (
    <div className={`w-full max-w-xs ${className}`}>
      <ul
        className="m-0 flex list-none flex-col gap-6 p-0 [animation-play-state:running] hover:[animation-play-state:paused]"
        style={items.length > 1 ? { animation: `marqueeScroll ${duration}s linear infinite` } : undefined}
      >
        {looped.map((t, i) => (
          <TestimonialCard key={i} testimonial={t} aria-hidden={i >= items.length} />
        ))}
      </ul>
    </div>
  );
}

function TestimonialCard({ testimonial: t, ...rest }) {
  return (
    <li
      {...rest}
      className="group relative w-full overflow-hidden rounded-3xl border border-stone/20 bg-white p-6 shadow-sm ring-1 ring-stone/10 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:ring-brand/20"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-brand/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 pointer-events-none" />
      <div className="relative z-10 flex flex-col">
        <div className="flex gap-0.5 text-brand">
          {Array.from({ length: 5 }).map((_, i) => (
            <StarIcon key={i} filled={i < t.rating} />
          ))}
        </div>
        <blockquote className="mt-4 text-[15px] italic leading-relaxed text-ink-soft/80 group-hover:text-ink-soft transition-colors">
          "{t.quote}"
        </blockquote>
        <div className="mt-5 flex items-center gap-3 border-t border-stone/30 pt-4">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand to-brand-dark text-sm font-bold text-white shadow-md shadow-brand/20 group-hover:scale-110 transition-transform">
            {t.name.charAt(0)}
          </span>
          <div className="flex flex-col">
            <p className="text-sm font-bold text-ink">{t.name}</p>
            <p className="text-[11px] font-semibold tracking-wide uppercase text-ink-soft/50">{t.tag}</p>
          </div>
        </div>
      </div>
    </li>
  );
}

function StarIcon({ filled }) {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.6">
      <path d="M12 2.5l2.94 6.44 7.06.65-5.34 4.72 1.6 6.92L12 17.9l-6.26 3.33 1.6-6.92L2 10.59l7.06-.65L12 2.5z" strokeLinejoin="round" />
    </svg>
  );
}
