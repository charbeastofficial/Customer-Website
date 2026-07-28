"use client";

import { useEffect, useState } from "react";
import LottiePlayer from "./LottiePlayer";

// Drop the animation file at this path (public/animations/order-success.json)
// -- lottie-web fetches it directly, no rebuild needed.
const ANIMATION_PATH = "/animations/order-success.json";
// Fallback in case the animation file is missing or never fires "complete"
// (e.g. it's set to loop) -- the overlay shouldn't get stuck forever.
const AUTO_DISMISS_MS = 4000;

export default function OrderSuccessOverlay({ onDone }) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const timer = setTimeout(onDone, AUTO_DISMISS_MS);
    return () => clearTimeout(timer);
  }, [onDone]);

  return (
    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 bg-cream/95 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
      {failed ? (
        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-green-100 shadow-lg shadow-green-200">
          <svg className="h-10 w-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="9" />
            <path d="M8 12l2 2 4-4" />
          </svg>
        </div>
      ) : (
        <LottiePlayer
          path={ANIMATION_PATH}
          loop={false}
          className="h-56 w-56"
          onComplete={onDone}
          onError={() => setFailed(true)}
        />
      )}
      <div className="text-center">
        <h3 className="text-xl font-bold text-ink">Order Confirmed!</h3>
        <p className="mt-1 text-sm text-ink-soft">We&apos;re firing up the grill.</p>
      </div>
    </div>
  );
}
