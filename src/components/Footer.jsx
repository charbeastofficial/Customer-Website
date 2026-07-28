"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import Container from "./Container";
import Reveal from "./Reveal";
import { db } from "@/lib/db";

function parseHours(raw) {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length) return parsed;
  } catch { }
  return [];
}

function formatTime(time) {
  if (!time) return "";
  const [h, m] = time.split(":");
  const hour = parseInt(h, 10);
  const ampm = hour >= 12 ? "PM" : "AM";
  const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return `${hour12}:${m} ${ampm}`;
}

function SocialIcon({ platform }) {
  if (platform === "facebook")
    return <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>;
  if (platform === "instagram")
    return <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zM5.838 12a6.162 6.162 0 1112.324 0 6.162 6.162 0 01-12.324 0zM12 16a4 4 0 100-8 4 4 0 000 8zm4.965-10.405a1.44 1.44 0 112.881.001 1.44 1.44 0 01-2.881-.001z" /></svg>;
  if (platform === "tiktok")
    return <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" /></svg>;
  if (platform === "x" || platform === "twitter")
    return <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>;
  return null;
}

export default function Footer() {
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    db.getSiteSettings().then(setSettings).catch(() => { });
  }, []);

  const phone = settings?.contactPhone || "(555) 347-3278";
  const email = settings?.contactEmail || "charbeastofficial@gmail.com";
  const address = settings?.contactAddress || "42 Smokehouse Ave, Grill Town";
  const hours = parseHours(settings?.openHours);

  const socialLinks = [
    settings?.socialFacebook && { label: "Facebook", key: "facebook", href: settings.socialFacebook },
    settings?.socialInstagram && { label: "Instagram", key: "instagram", href: settings.socialInstagram },
    settings?.socialTiktok && { label: "TikTok", key: "tiktok", href: settings.socialTiktok },
    settings?.socialTwitter && { label: "Twitter / X", key: "x", href: settings.socialTwitter },
  ].filter(Boolean);

  const LINKS = [
    { label: "Home", href: "/" },
    { label: "Our Menu", href: "/#menu" },
    { label: "About Us", href: "/about" },
  ];

  return (
    <footer className="relative mt-20 bg-[#0a0f1a] text-cream overflow-hidden">
      {/* Decorative top border */}
      <div className="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-transparent via-brand to-transparent opacity-50" />

      {/* Background decoration */}
      <div className="absolute -top-40 right-0 w-[800px] h-[800px] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-brand/5 via-transparent to-transparent opacity-50 pointer-events-none" />

      <Container className="relative z-10 py-16 lg:py-24">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-4">
          <Reveal delay={0}>
            <div className="flex flex-col items-center text-center md:items-start md:text-left">
              <div className="flex flex-col items-center">
                <div className="relative inline-block mb-4">
                  <div className="absolute -inset-4 rounded-full bg-brand/10 blur-xl opacity-50" />
                  <Image src="/logo.png" alt="CharBeast" width={100} height={100} className="relative h-24 w-24 object-contain drop-shadow-[0_0_15px_rgba(255,102,0,0.3)]" />
                </div>
                <span className="font-display text-3xl tracking-[0.15em] text-white">
                  Char<span className="text-brand">Beast</span>
                </span>
              </div>
              <p className="mt-6 max-w-xs text-sm leading-relaxed text-cream/70">
                Fire-grilled burgers, crispy fried chicken, and stone-baked pizza —
                cooked fresh to order, every single time. Fast food, done properly.
              </p>
            </div>
          </Reveal>

          <Reveal delay={100}>
            <div className="flex flex-col items-center text-center md:items-start md:text-left">
              <h4 className="text-sm font-bold tracking-widest text-white uppercase mb-6">Explore</h4>
              <ul className="flex flex-col gap-4">
                {LINKS.map((link) => {
                  const isHashLink = link.href.startsWith("/#");
                  const LinkTag = isHashLink ? "a" : Link;
                  return (
                    <li key={link.href}>
                      <LinkTag href={link.href} className="group flex items-center gap-3 text-sm text-cream/70 transition-colors hover:text-white">
                        <span className="h-[2px] w-4 bg-brand/50 transition-all duration-300 group-hover:w-6 group-hover:bg-brand" />
                        {link.label}
                      </LinkTag>
                    </li>
                  );
                })}
              </ul>
            </div>
          </Reveal>

          <Reveal delay={200}>
            <div className="flex flex-col items-center text-center md:items-start md:text-left" id="contact">
              <h4 className="text-sm font-bold tracking-widest text-white uppercase mb-6">Contact</h4>
              <ul className="flex flex-col gap-4 text-sm text-cream/70">
                <li className="flex items-center gap-3 transition hover:text-white">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-brand ring-1 ring-white/10">
                    <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                  </div>
                  <span>{address}</span>
                </li>
                <li>
                  <a href={`tel:${phone.replace(/\D/g, '')}`} className="group flex items-center gap-3 transition hover:text-white">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-brand ring-1 ring-white/10 group-hover:bg-brand group-hover:text-white transition-colors">
                      <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                      </svg>
                    </div>
                    <span>{phone}</span>
                  </a>
                </li>
                <li>
                  <a href={`mailto:${email}`} className="group flex items-center gap-3 transition hover:text-white">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-brand ring-1 ring-white/10 group-hover:bg-brand group-hover:text-white transition-colors">
                      <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="2" y="4" width="20" height="16" rx="2" />
                        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                      </svg>
                    </div>
                    <span>{email}</span>
                  </a>
                </li>
              </ul>
              {socialLinks.length > 0 && (
                <div className="mt-8 flex gap-3">
                  {socialLinks.map((s) => (
                    <a key={s.key} href={s.href} target="_blank" rel="noopener noreferrer"
                      className="rounded-full bg-white/5 p-3 text-cream/70 ring-1 ring-white/10 transition-all duration-300 hover:-translate-y-1 hover:bg-brand hover:text-white hover:shadow-lg hover:shadow-brand/30"
                      aria-label={s.label}>
                      <SocialIcon platform={s.key} />
                    </a>
                  ))}
                </div>
              )}
            </div>
          </Reveal>

          <Reveal delay={300}>
            <div className="flex flex-col items-center text-center md:items-start md:text-left">
              <h4 className="text-sm font-bold tracking-widest text-white uppercase mb-6">Hours</h4>
              {hours.length > 0 ? (
                <ul className="flex flex-col gap-4 text-sm text-cream/70">
                  {hours.map((h) => (
                    <li key={h.day} className="flex flex-col">
                      <span className="text-brand font-semibold mb-0.5">{h.day}</span>
                      <span>{h.closed ? "Closed" : `${formatTime(h.open)} – ${formatTime(h.close)}`}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <ul className="flex flex-col gap-4 text-sm text-cream/70">
                  <li className="flex flex-col"><span className="text-brand font-semibold mb-0.5">Mon – Thu</span><span>12:00 PM – 11:00 PM</span></li>
                  <li className="flex flex-col"><span className="text-brand font-semibold mb-0.5">Fri – Sat</span><span>12:00 PM – 1:00 AM</span></li>
                  <li className="flex flex-col"><span className="text-brand font-semibold mb-0.5">Sunday</span><span>1:00 PM – 11:00 PM</span></li>
                </ul>
              )}
            </div>
          </Reveal>
        </div>

        <Reveal delay={400}>
          <div className="mt-16 flex flex-col items-center justify-between gap-4 rounded-3xl bg-white/5 px-6 py-5 text-xs text-cream/50 ring-1 ring-white/10 sm:flex-row lg:px-8">
            <span>© {new Date().getFullYear()} CharBeast. All rights reserved.</span>
            <span>
              Powered by{" "}
              <a href="https://abdulsalam78976.github.io/AppCrafters/" target="_blank" rel="noopener noreferrer"
                className="font-bold text-white transition hover:text-brand">AppCrafters</a>
            </span>
          </div>
        </Reveal>
      </Container>
    </footer>
  );
}
