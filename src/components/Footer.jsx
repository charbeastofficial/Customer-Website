import Image from "next/image";
import Container from "./Container";

const HOURS = [
  { day: "Mon – Thu", time: "12:00 PM – 11:00 PM" },
  { day: "Fri – Sat", time: "12:00 PM – 1:00 AM" },
  { day: "Sunday", time: "1:00 PM – 11:00 PM" },
];

const LINKS = [
  { label: "Home", href: "/" },
  { label: "Our Menu", href: "/#menu" },
  { label: "About Us", href: "/about" },
];

const SOCIAL_ICONS = [
  { 
    label: "Facebook", 
    href: "https://facebook.com/charbeast",
    icon: (
      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
      </svg>
    )
  },
  { 
    label: "Instagram", 
    href: "https://instagram.com/charbeast",
    icon: (
      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zM5.838 12a6.162 6.162 0 1112.324 0 6.162 6.162 0 01-12.324 0zM12 16a4 4 0 100-8 4 4 0 000 8zm4.965-10.405a1.44 1.44 0 112.881.001 1.44 1.44 0 01-2.881-.001z"/>
      </svg>
    )
  },
  { 
    label: "TikTok", 
    href: "https://tiktok.com/@charbeast",
    icon: (
      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
      </svg>
    )
  }
];

export default function Footer() {
  return (
    <footer className="bg-ink text-cream">
      <Container className="py-8">
        {/* Main Footer Content - All columns start at top */}
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-4">
          {/* Logo Column - Starts at top */}
          <div className="flex flex-col items-center text-center md:items-start md:text-left">
            <div className="flex flex-col items-center md:items-center">
              <Image
                src="/logo.png"
                alt="CharBeast"
                width={120}
                height={120}
                className="h-50 w-50 object-contain"
              />
              <span className="font-display text-3xl tracking-tight text-cream">
                Char<span className="text-brand">Beast</span>
              </span>
            </div>

            <p className="mt-4 max-w-xs text-sm leading-relaxed text-cream/60">
              Fire-grilled burgers, crispy fried chicken, and stone-baked pizza —
              cooked fresh to order, every single time. Fast food, done properly.
            </p>

          
          </div>

          {/* Explore Column - Starts at top */}
          <div className="md:mt-0">
            <h4 className="text-sm font-bold tracking-wide text-cream/40 uppercase">Explore</h4>
            <ul className="mt-4 flex flex-col gap-3">
              {LINKS.map((link) => (
                <li key={link.href}>
                  <a href={link.href} className="text-sm text-cream/75 transition hover:text-brand">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Column - Starts at top */}
          <div  className="md:mt-0" id="contact">
            <h4 className="text-sm font-bold tracking-wide text-cream/40 uppercase">Contact</h4>
            <ul className="mt-4 flex flex-col gap-3 text-sm text-cream/75">
              <li>42 Smokehouse Ave, Grill Town</li>
              <li>
                <a href="tel:+15553473278" className="transition hover:text-brand">
                  (555) 347-3278
                </a>
              </li>
              <li>
                <a href="mailto:charbeastofficial@gmail.com" className="transition hover:text-brand">
                  charbeastofficial@gmail.com
                </a>
              </li>
            </ul>
              <div className="mt-6 flex gap-3">
              {SOCIAL_ICONS.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full bg-cream/10 p-2.5 text-cream/60 transition hover:bg-brand hover:text-white hover:scale-110"
                  aria-label={social.label}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Hours Column - Starts at top */}
          <div className="md:mt-0">
            <h4 className="text-sm font-bold tracking-wide text-cream/40 uppercase">Hours</h4>
            <ul className="mt-4 flex flex-col gap-3 text-sm text-cream/75">
              {HOURS.map((h) => (
                <li key={h.day} className="flex flex-col">
                  <span className="text-cream/50">{h.day}</span>
                  <span>{h.time}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="mt-14 flex flex-col items-center justify-between gap-3 border-t border-cream/10 pt-6 text-xs text-cream/40 sm:flex-row">
          <span>© {new Date().getFullYear()} CharBeast. All rights reserved.</span>
          <span>
            Powered by{" "}
            <a
              href="https://abdulsalam78976.github.io/AppCrafters/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-cream/70 transition hover:text-brand"
            >
              AppCrafters
            </a>
          </span>
        </div>
      </Container>
    </footer>
  );
}