"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

export default function SplashScreen({ children }) {
  const [phase, setPhase] = useState("enter");
  const [show, setShow] = useState(true);

  useEffect(() => {
    const enterTimer = setTimeout(() => setPhase("exit"), 2000);
    const removeTimer = setTimeout(() => setShow(false), 2800);
    return () => {
      clearTimeout(enterTimer);
      clearTimeout(removeTimer);
    };
  }, []);

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
                className={`relative h-32 w-32 object-contain transition-all duration-700 sm:h-40 sm:w-40 ${
                  phase === "enter" ? "animate-pulse" : ""
                }`}
                priority
              />
            </div>
          </div>
        </div>

        {/* Brand Name */}
        <div className="flex flex-col items-center gap-1">
          <span className={`font-display text-4xl tracking-tight text-white transition-all duration-700 sm:text-5xl ${
            phase === "enter" ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}>
            Char<span className="text-brand">Beast</span>
          </span>
          <span className={`text-xs font-medium tracking-[0.2em] uppercase text-white/40 transition-all duration-700 delay-100 ${
            phase === "enter" ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}>
            Fire & Flavor
          </span>
        </div>

        {/* Loading Dots */}
        <div className={`mt-10 flex gap-2 transition-all duration-700 delay-200 ${
          phase === "enter" ? "opacity-100" : "opacity-0"
        }`}>
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="h-2.5 w-2.5 rounded-full bg-brand"
              style={{
                animation: `bounce 1s ease-in-out ${i * 0.15}s infinite`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div
        className={`transition-all duration-700 ${
          phase === "exit" ? "opacity-100" : "opacity-0"
        }`}
      >
        {children}
      </div>

      <style jsx>{`
        @keyframes bounce {
          0%, 100% {
            transform: translateY(0);
            opacity: 0.3;
          }
          50% {
            transform: translateY(-12px);
            opacity: 1;
          }
        }
      `}</style>
    </>
  );
}