"use client";

import Image from "next/image";
import { useState } from "react";
import Container from "./Container";
import Reveal from "./Reveal";
import Eyebrow from "./Eyebrow";
import { formatCurrency } from "@/lib/currency";
import { useCart } from "@/lib/cart-context";
import DealDetailModal from "./DealDetailModal";

export default function DealsSection({ deals, products }) {
  const [customizeDeal, setCustomizeDeal] = useState(null);

  if (!deals || deals.length === 0) return null;

  return (
    <section id="deals" className="py-6 lg:py-10 bg-gradient-to-b from-cream-soft to-white">
      <Container>
        <Reveal className="text-center max-w-2xl mx-auto">
          <Eyebrow center>Meal Deals & Combos</Eyebrow>
          <h2 className="balance text-3xl font-bold text-ink sm:text-4xl">
            Perfect pairings, better value.
          </h2>
          <p className="mt-3 text-sm text-ink-soft">
            Get more of what you love with our hand-picked meal combos.
            Big flavour, generous portions, and your next easy decision.
          </p>
        </Reveal>

        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {deals.map((deal, i) => (
            <DealCard
              key={deal.id}
              deal={deal}
              products={products}
              onCustomize={() => setCustomizeDeal(deal)}
              style={{ animationDelay: `${i * 60}ms` }}
            />
          ))}
        </div>
      </Container>

      <DealDetailModal
        deal={customizeDeal}
        products={products}
        onClose={() => setCustomizeDeal(null)}
      />
    </section>
  );
}

function DealCard({ deal, products, onCustomize, style }) {
  const { items, updateQuantity } = useCart();
  const [imgBroken, setImgBroken] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Mirrors ProductCard: a deal already in the cart shows a quick +/-
  // stepper instead of the "Add Bundle" button, which reopens the dialog.
  const cartItem = items.find((item) => item.cartItemId === `deal-${deal.id}`);

  // Calculate total items and savings
  const totalItems = deal.items.reduce((sum, item) => sum + item.quantity, 0);
  const originalPrice = deal.items.reduce((sum, item) => {
    const product = products.find((p) => p.id === item.productId);
    return sum + (product?.basePrice || 0) * item.quantity;
  }, 0);
  const savings = originalPrice - deal.price;

  return (
    <div
      style={style}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative flex animate-[fadeUp_0.5s_ease-out_backwards] flex-col overflow-hidden rounded-2xl bg-white shadow-lg shadow-ink/5 ring-1 ring-stone/20 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:shadow-brand/10 hover:ring-brand/30"
    >
      {/* Image Section - No pills on image */}
      <button
        type="button"
        onClick={onCustomize}
        aria-label={`View ${deal.title}`}
        className="relative aspect-[16/10] w-full overflow-hidden bg-char-deep text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
      >
        {deal.imageURL && !imgBroken ? (
          <Image
            src={deal.imageURL}
            alt={deal.title}
            fill
            sizes="(min-width: 1024px) 380px, 90vw"
            className="object-cover transition-all duration-700 group-hover:scale-110"
            onError={() => setImgBroken(true)}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-char to-char-deep opacity-30">
            <svg className="h-10 w-10 text-cream" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 002-2V2" />
              <path d="M7 2v20" />
              <path d="M21 15V2v0a5 5 0 00-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" />
            </svg>
          </div>
        )}

        {/* Gradient Overlay */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-white/90 via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      </button>

      {/* Content Section */}
      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-base font-bold text-ink group-hover:text-brand transition-colors line-clamp-1">
          {deal.title}
        </h3>
        
        {deal.description && (
          <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-ink-soft/70">
            {deal.description}
          </p>
        )}

        {/* Items List - Shows all items in the deal */}
        <div className="mt-3 space-y-1.5">
          <p className="text-[10px] font-semibold text-ink-soft/40 uppercase tracking-wider">
            Includes:
          </p>
          <div className="flex flex-wrap gap-1.5">
            {deal.items.map((item, idx) => {
              const product = products.find((p) => p.id === item.productId);
              return (
                <span 
                  key={idx}
                  className="inline-flex items-center gap-1 text-[10px] px-2.5 py-1 rounded-full bg-stone-soft/30 text-ink-soft/70 ring-1 ring-stone/10"
                >
                  {item.quantity > 1 && (
                    <span className="font-bold text-brand">{item.quantity}x</span>
                  )}
                  {product?.name || "Item"}
                  {item.modifierNames?.length > 0 && (
                    <span className="text-ink-soft/40">
                      ({item.modifierNames.join(", ")})
                    </span>
                  )}
                </span>
              );
            })}
          </div>
        </div>

        {/* Price & Action Section */}
        <div className="mt-4 flex items-center justify-between gap-3 pt-3 border-t border-stone/20">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-brand">
                {formatCurrency(deal.price)}
              </span>
              {savings > 0 && (
                <span className="text-xs line-through text-ink-soft/40">
                  {formatCurrency(originalPrice)}
                </span>
              )}
            </div>
            {savings > 0 && (
              <span className="text-[10px] text-green-600 font-medium">
                You save {formatCurrency(savings)}
              </span>
            )}
          </div>
          
          {cartItem ? (
            <div className="flex items-center gap-3 rounded-full border border-stone bg-cream-soft px-2 py-1.5 shadow-inner">
              <button
                type="button"
                onClick={() => updateQuantity(cartItem.cartItemId, -1)}
                className="flex h-7 w-7 items-center justify-center rounded-full text-ink-soft transition hover:bg-white hover:text-ink active:scale-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
              >
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5} strokeLinecap="round">
                  <path d="M20 12H4" />
                </svg>
              </button>
              <span className="w-5 text-center text-sm font-bold text-ink">{cartItem.quantity}</span>
              <button
                type="button"
                onClick={() => updateQuantity(cartItem.cartItemId, 1)}
                className="flex h-7 w-7 items-center justify-center rounded-full bg-brand text-white transition hover:bg-brand-dark hover:scale-105 active:scale-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
              >
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5} strokeLinecap="round">
                  <path d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={onCustomize}
              className="group/btn relative flex items-center gap-2 overflow-hidden rounded-full bg-brand px-5 py-2.5 text-[11px] font-bold tracking-wide uppercase text-white shadow-lg shadow-brand/30 transition-all duration-300 hover:scale-105 hover:bg-brand-dark hover:shadow-brand/50 active:scale-95"
            >
              <span className="relative z-10 flex items-center gap-2">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Bundle
              </span>
              <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-500 group-hover/btn:translate-x-full" />
            </button>
          )}
        </div>
      </div>

      {/* Hover Glow Effect */}
      <div className="absolute -inset-px rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100 pointer-events-none">
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-brand/10 via-transparent to-brand/10 blur-xl" />
      </div>
    </div>
  );
}