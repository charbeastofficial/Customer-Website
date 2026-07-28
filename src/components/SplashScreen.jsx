"use client";

import Image from "next/image";
import { useEffect, useLayoutEffect, useState } from "react";

export default function SplashScreen({ children }) {
  const [phase, setPhase] = useState("enter");
  // Always starts true so server and client render the same markup on first
  // paint (sessionStorage doesn't exist during server prerendering). The
  // layout effect below then hides it synchronously, before the browser
  // paints, if this session has already shown it -- no flash, no mismatch.
  const [show, setShow] = useState(true);

  useLayoutEffect(() => {
    try {
      if (sessionStorage.getItem("charbeast_splash_shown")) setShow(false);
    } catch {
      // private browsing etc. -- worst case it just shows once per tab
    }
  }, []);

  useEffect(() => {
    if (!show) return;
    // Mark it shown immediately (not just when it finishes) so a quick
    // reload/navigation mid-animation still won't replay it this session.
    try {
      sessionStorage.setItem("charbeast_splash_shown", "1");
    } catch {
      // private browsing etc.
    }
    const enterTimer = setTimeout(() => setPhase("exit"), 1200);
    const removeTimer = setTimeout(() => setShow(false), 2000);
    return () => {
      clearTimeout(enterTimer);
      clearTimeout(removeTimer);
    };
  }, [show]);

  if (!show) return children;

  return (
    <>
      <div
        className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-gradient-to-br from-ink via-char to-ink transition-all duration-700 ease-in-out ${
          phase === "exit" ? "opacity-0 scale-110 blur-sm" : "opacity-100 scale-100 blur-0"
        }`}
      >
        {/* Background glow orbs */}
        <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-brand/10 blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-brand/5 blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-64 w-64 rounded-full bg-brand-orange/5 blur-3xl animate-pulse" style={{ animationDelay: "0.5s" }} />
        
        {/* Logo Container */}
        <div className="relative mb-6">
          <div
            className={`absolute inset-0 rounded-full bg-brand/20 blur-3xl transition-all duration-1000 ${
              phase === "enter" ? "scale-100 opacity-100" : "scale-150 opacity-0"
            }`}
          />
          <div
            className={`relative transition-all duration-1000 ease-out ${
              phase === "enter" ? "scale-100 opacity-100" : "scale-75 opacity-0"
            }`}
          >
            <div className="relative">
              {/* Outer ring pulse */}
              <div className={`absolute -inset-4 rounded-full border-2 border-brand/20 transition-all duration-1000 ${
                phase === "enter" ? "scale-100 opacity-100" : "scale-50 opacity-0"
              }`} />
              <div className={`absolute -inset-8 rounded-full border border-brand/10 transition-all duration-1000 delay-200 ${
                phase === "enter" ? "scale-100 opacity-100" : "scale-50 opacity-0"
              }`} />
              
              <Image
                src="/logo.png"
                alt="CharBeast"
                width={120}
                height={120}
                className={`relative h-32 w-32 object-contain transition-all duration-700 motion-safe:animate-pulse sm:h-40 sm:w-40 ${
                  phase === "enter" ? "scale-100" : "scale-75 opacity-0"
                }`}
                priority
              />
            </div>
          </div>
        </div>

        {/* Brand Name */}
        <div className="flex flex-col items-center gap-1">
          <span className={`font-display text-4xl tracking-[0.15em] text-white sm:text-5xl ${
            phase === "enter" ? "animate-[logoReveal_0.8s_ease-out_both]" : "opacity-0 -translate-y-4 transition-all duration-700"
          }`}>
            Char<span className="text-brand">Beast</span>
          </span>
          <span className={`text-xs font-medium tracking-[0.2em] uppercase text-white/40 transition-all duration-700 delay-150 ${
            phase === "enter" ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}>
            Fire & Flavor
          </span>
        </div>

      
      </div>

      {/* Main Content */}
      <div
        className={`transition-all duration-500 ${
          phase === "exit" ? "opacity-100" : "opacity-0"
        }`}
      >
        {children}
      </div>

    </>
  );
}
