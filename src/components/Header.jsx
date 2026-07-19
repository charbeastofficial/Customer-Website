"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Container from "./Container";
import { useCart } from "@/lib/cart-context";
import { useAuth } from "@/lib/auth-context";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Our Menu", href: "/#menu" },
  { label: "About Us", href: "/about" },
];

export default function Header({ onAccountClick, floating = false }) {
  const { itemCount, setIsOpen } = useCart();
  const { user } = useAuth();
  const pathname = usePathname();
  const [active, setActive] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const activeHref = active ?? (pathname === "/about" ? "/about" : "/");

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isFloating = floating && !scrolled;

  return (
    <header
      className={`
        fixed top-0 right-0 left-0 z-50 transition-all duration-500
        ${isFloating 
          ? "bg-transparent" 
          : "bg-cream/95 backdrop-blur-xl shadow-[0_4px_30px_-10px_rgba(0,0,0,0.1)] border-b border-stone/10"
        }
      `}
    >
      <Container className="flex h-20 items-center justify-between gap-4 sm:h-22">
        {/* Logo */}
        <Link
          href="/"
          onClick={() => setActive("/")}
          className="group flex shrink-0 items-center  py-2 transition-transform hover:scale-105"
        >
          <div className="relative">
            <div className={`
              absolute -inset-1 rounded-full blur-xl transition-opacity duration-500
              ${isFloating ? "bg-white/10 opacity-0 group-hover:opacity-100" : "bg-brand/10 opacity-0 group-hover:opacity-100"}
            `} />
            <Image
              src="/logo.png"
              alt="CharBeast"
              width={64}
              height={64}
              className="relative h-16 w-16 object-contain transition-all duration-500 group-hover:rotate-[-5deg]"
              priority
            />
          </div>

          <div className="flex flex-col leading-none">
            <span className={`
              font-display text-2xl tracking-[0.15em] transition-colors duration-300
              ${isFloating ? "text-white" : "text-ink"}
            `}>
              Char<span className="text-brand">Beast</span>
            </span>
           
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setActive(link.href)}
              className={`
                relative py-2 text-sm font-medium transition-all duration-300
                ${activeHref === link.href
                  ? "text-brand"
                  : isFloating
                    ? "text-white/70 hover:text-white"
                    : "text-ink-soft/80 hover:text-ink"
                }
                before:absolute before:-bottom-1 before:left-0 before:h-[2px] before:rounded-full before:transition-all before:duration-300
                ${activeHref === link.href
                  ? "before:w-full before:bg-brand"
                  : "before:w-0 hover:before:w-full hover:before:bg-brand/50"
                }
              `}
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-1.5">
          {/* Cart Button */}
          <button
            type="button"
            aria-label="Cart"
            onClick={() => setIsOpen(true)}
            className={`
              group relative flex h-11 w-11 items-center justify-center rounded-full transition-all duration-300
              ${isFloating 
                ? "text-white/80 hover:bg-white/10 hover:text-white" 
                : "text-ink-soft/80 hover:bg-stone-soft/80 hover:text-ink"
              }
              hover:scale-105 active:scale-95
            `}
          >
            <ShoppingBagIcon className="h-5 w-5 transition-transform duration-300 group-hover:rotate-[-5deg]" />
            {itemCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex h-5 min-w-[20px] animate-bounce-once items-center justify-center rounded-full bg-brand px-1.5 text-[10px] font-bold text-white shadow-lg shadow-brand/30">
                {itemCount}
              </span>
            )}
          </button>

          {/* User/Account */}
          {user ? (
            <a
              href="/account"
              aria-label="Your account"
              className={`
                group relative flex h-11 w-11 items-center justify-center rounded-full transition-all duration-300
                ${isFloating 
                  ? "hover:bg-white/10" 
                  : "hover:bg-stone-soft/80"
                }
                hover:scale-105 active:scale-95
              `}
            >
              <div className="relative">
                <div className={`
                  absolute -inset-1 rounded-full blur-md transition-opacity duration-300
                  ${isFloating ? "bg-white/20 opacity-0 group-hover:opacity-100" : "bg-brand/20 opacity-0 group-hover:opacity-100"}
                `} />
                <span className="relative flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-brand to-brand/80 text-xs font-bold text-white shadow-lg shadow-brand/30">
                  {(user.user_metadata?.display_name || user.email || "?").charAt(0).toUpperCase()}
                </span>
              </div>
            </a>
          ) : (
            <button
              type="button"
              aria-label="Log in"
              onClick={onAccountClick}
              className={`
                group relative flex h-11 w-11 items-center justify-center rounded-full transition-all duration-300
                ${isFloating 
                  ? "text-white/80 hover:bg-white/10 hover:text-white" 
                  : "text-ink-soft/80 hover:bg-stone-soft/80 hover:text-ink"
                }
                hover:scale-105 active:scale-95
              `}
            >
              <UserIcon className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" />
            </button>
          )}

          {/* Mobile Menu Toggle */}
          <button
            type="button"
            aria-label="Toggle navigation"
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((open) => !open)}
            className={`
              relative flex h-11 w-11 items-center justify-center rounded-full transition-all duration-300 md:hidden
              ${isFloating 
                ? "text-white/80 hover:bg-white/10 hover:text-white" 
                : "text-ink-soft/80 hover:bg-stone-soft/80 hover:text-ink"
              }
              hover:scale-105 active:scale-95
            `}
          >
            <MenuIcon open={mobileOpen} />
          </button>
        </div>
      </Container>

      {/* Mobile Navigation */}
      {mobileOpen && (
        <div className={`
          border-t px-6 py-4 md:hidden animate-slideDown
          ${isFloating 
            ? "border-white/10 bg-ink/95 backdrop-blur-xl" 
            : "border-stone/10 bg-cream/98 backdrop-blur-xl"
          }
        `}>
          <nav className="mx-auto flex max-w-7xl flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => { 
                  setActive(link.href); 
                  setMobileOpen(false); 
                }}
                className={`
                  rounded-xl px-4 py-3.5 text-sm font-semibold transition-all duration-300
                  ${activeHref === link.href
                    ? "bg-brand/10 text-brand"
                    : isFloating
                      ? "text-white/70 hover:bg-white/5 hover:text-white"
                      : "text-ink-soft/80 hover:bg-stone-soft/50 hover:text-ink"
                  }
                  active:scale-95
                `}
              >
                <span className="flex items-center gap-3">
                  <span className="h-1.5 w-1.5 rounded-full bg-brand/60" />
                  {link.label}
                </span>
              </a>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}

// Modern Icons
function ShoppingBagIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
  );
}

function UserIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
      <circle cx="12" cy="7" r="3" className="opacity-30" />
    </svg>
  );
}

function MenuIcon({ open }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {open ? (
        <>
          <line x1="18" y1="6" x2="6" y2="18" className="transition-transform duration-300 rotate-0" />
          <line x1="6" y1="6" x2="18" y2="18" className="transition-transform duration-300 rotate-0" />
        </>
      ) : (
        <>
          <line x1="4" y1="7" x2="20" y2="7" className="transition-all duration-300" />
          <line x1="4" y1="12" x2="20" y2="12" className="transition-all duration-300" />
          <line x1="4" y1="17" x2="20" y2="17" className="transition-all duration-300" />
        </>
      )}
    </svg>
  );
}