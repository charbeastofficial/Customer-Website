"use client";

import { usePathname } from "next/navigation";

// Keying on the pathname forces a remount on every route change, which
// retriggers the fadeIn animation -- a small bit of continuity between pages
// instead of an instant, jarring swap.
export default function PageTransition({ children }) {
  const pathname = usePathname();
  return (
    <div key={pathname} className="animate-[fadeIn_0.35s_ease-out]">
      {children}
    </div>
  );
}
