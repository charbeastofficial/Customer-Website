"use client";

import { useEffect, useRef } from "react";
import lottie from "lottie-web";

// Thin wrapper around lottie-web (not the lottie-react package) so this
// works regardless of React version -- lottie-web has no React peer
// dependency at all, it just needs a DOM node to render into.
export default function LottiePlayer({ path, loop = false, autoplay = true, className, onComplete, onError }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const anim = lottie.loadAnimation({
      container: containerRef.current,
      renderer: "svg",
      loop,
      autoplay,
      path,
    });
    if (onComplete) anim.addEventListener("complete", onComplete);
    if (onError) anim.addEventListener("data_failed", onError);
    return () => anim.destroy();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path]);

  return <div ref={containerRef} className={className} />;
}
