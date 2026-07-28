"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { formatCurrency } from "@/lib/currency";
import { useCart } from "@/lib/cart-context";
import { useToast } from "./Toast";

function CloseIcon({ className }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

export default function DealDetailModal({ deal, products, onClose }) {
  const { addDeal } = useCart();
  const toast = useToast();
  const [quantity, setQuantity] = useState(1);
  const [brokenSrc, setBrokenSrc] = useState(null);
  const [imgLoaded, setImgLoaded] = useState(false);

  // This component stays mounted (DealsSection always renders it, gated by
  // `deal`), so quantity needs to reset whenever a different deal is opened.
  useEffect(() => {
    setQuantity(1);
    setBrokenSrc(null);
    setImgLoaded(false);
  }, [deal?.id]);

  useEffect(() => {
    if (!deal) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [deal, onClose]);

  if (!deal) return null;

  const includes = deal.items.map((item) => {
    const product = products.find((p) => p.id === item.productId);
    const name = product?.name || "Item";
    const modNames = item.modifierNames?.length ? ` (${item.modifierNames.join(", ")})` : "";
    const qty = item.quantity > 1 ? `${item.quantity}x ` : "";
    return `${qty}${name}${modNames}`;
  });

  const originalPrice = deal.items.reduce((sum, item) => {
    const product = products.find((p) => p.id === item.productId);
    return sum + (product?.basePrice || 0) * item.quantity;
  }, 0);
  const savings = originalPrice - deal.price;
  const total = deal.price * quantity;

  const image = deal.imageURL && deal.imageURL !== brokenSrc ? deal.imageURL : null;

  const handleAddToCart = () => {
    addDeal(deal, includes, quantity);
    toast(`${deal.title} added to cart`);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex animate-[fadeIn_0.15s_ease-out] items-center justify-center bg-ink/60 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="deal-detail-title"
        className="relative grid max-h-[90vh] w-full max-w-2xl grid-cols-1 overflow-y-auto rounded-3xl bg-white shadow-2xl sm:grid-cols-2 sm:overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          aria-label="Close"
          onClick={onClose}
          className="absolute top-3.5 right-3.5 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-ink shadow-md backdrop-blur-sm transition hover:bg-white"
        >
          <CloseIcon />
        </button>

        {/* Image */}
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-cream-soft sm:aspect-auto sm:h-full">
          {image ? (
            <>
              {!imgLoaded && (
                <div className="absolute inset-0 flex items-center justify-center bg-cream-soft">
                  <div className="h-6 w-6 animate-pulse rounded-full bg-stone" />
                </div>
              )}
              <Image
                src={image}
                alt={deal.title}
                fill
                sizes="(min-width: 640px) 50vw, 100vw"
                className={`object-cover transition-opacity duration-500 ${imgLoaded ? "opacity-100" : "opacity-0"}`}
                onError={() => setBrokenSrc(deal.imageURL)}
                onLoad={() => setImgLoaded(true)}
              />
            </>
          ) : (
            <div className="flex h-full w-full items-center justify-center opacity-40">
              <svg className="h-14 w-14 text-ink-soft" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 002-2V2" />
                <path d="M7 2v20" />
                <path d="M21 15V2v0a5 5 0 00-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" />
              </svg>
            </div>
          )}
          {deal.badge && (
            <div className="absolute left-3.5 top-3.5 rounded-full bg-brand px-2.5 py-1 text-[11px] font-bold tracking-wide text-white shadow-md">
              {deal.badge}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="flex flex-col p-6 sm:overflow-y-auto">
          <h2 id="deal-detail-title" className="pr-8 text-xl font-bold text-ink">
            {deal.title}
          </h2>
          {deal.description && (
            <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">{deal.description}</p>
          )}
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-lg font-bold text-brand">{formatCurrency(deal.price)}</span>
            {savings > 0 && (
              <span className="text-sm font-medium text-ink-soft/50 line-through">
                {formatCurrency(originalPrice)}
              </span>
            )}
          </div>
          {savings > 0 && (
            <span className="mt-1 text-xs font-medium text-green-600">
              You save {formatCurrency(savings)}
            </span>
          )}

          <div className="mt-5">
            <p className="mb-2 text-xs font-bold tracking-wider text-ink-soft/60 uppercase">Includes</p>
            <div className="flex flex-wrap gap-1.5">
              {includes.map((label, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center rounded-full bg-cream-soft px-2.5 py-1 text-xs text-ink-soft ring-1 ring-stone/20"
                >
                  {label}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between border-t border-stone/20 pt-5">
            <p className="text-xs font-bold tracking-wider text-ink-soft/60 uppercase">Quantity</p>
            <div className="flex items-center gap-3 rounded-full border border-stone bg-cream-soft px-2 py-1.5">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="flex h-7 w-7 items-center justify-center rounded-full text-ink-soft transition hover:bg-white hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
              >
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5} strokeLinecap="round">
                  <path d="M20 12H4" />
                </svg>
              </button>
              <span className="w-5 text-center text-sm font-bold text-ink">{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity((q) => q + 1)}
                className="flex h-7 w-7 items-center justify-center rounded-full bg-brand text-white transition hover:bg-brand-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
              >
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5} strokeLinecap="round">
                  <path d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={handleAddToCart}
            className="mt-4 flex w-full items-center justify-center rounded-full bg-brand py-3.5 text-sm font-bold text-white transition hover:bg-brand-dark active:scale-[0.98]"
          >
            Add To Cart — {formatCurrency(total)}
          </button>
        </div>
      </div>
    </div>
  );
}
