"use client";

import Image from "next/image";
import { useState } from "react";
import { formatCurrency } from "@/lib/currency";
import { useCart } from "@/lib/cart-context";

export default function ProductCard({ product, category, onCustomize, style }) {
  const { items, addItem, updateQuantity } = useCart();
  const [brokenSrc, setBrokenSrc] = useState(null);
  const [isHovered, setIsHovered] = useState(false);

  const hasModifiers = product.modifiers && product.modifiers.length > 0;
  const cartItem = items.find((item) => item.productId === product.id && item.modifiers.length === 0);
  const candidateImage = product.imageURL || category?.imageURL || null;
  const image = candidateImage && candidateImage !== brokenSrc ? candidateImage : null;

  const handleAdd = () => {
    if (hasModifiers) {
      onCustomize(product);
    } else {
      addItem(product);
    }
  };

  return (
    <div
      style={style}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative flex animate-[fadeUp_0.5s_ease-out_backwards] flex-col overflow-hidden rounded-2xl bg-gradient-to-b from-char to-char-deep shadow-lg shadow-ink/20 ring-1 ring-char-line/60 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:shadow-brand/20 hover:ring-brand/30"
    >
      {/* Image Section - No gradient overlay */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-char-deep">
        {image ? (
          <Image
            src={image}
            alt={product.name}
            fill
            sizes="(min-width: 1024px) 280px, 50vw"
            className="object-cover transition-all duration-700 group-hover:scale-110"
            onError={() => setBrokenSrc(candidateImage)}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-char to-char-deep text-6xl opacity-30">
            {category?.icon || "🍽️"}
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="flex flex-1 flex-col p-4">
        {/* Name & Price Row */}
        <div className="flex items-start justify-between gap-2">
          <h3 className="flex-1 line-clamp-1 text-sm font-bold text-cream group-hover:text-brand transition-colors">
            {product.name}
          </h3>
          <span className="shrink-0 text-base font-bold text-brand">
            {formatCurrency(product.basePrice)}
          </span>
        </div>

        {/* Description */}
        {product.description && (
          <p className="mt-1.5 line-clamp-2 min-h-[2.5rem] text-xs leading-relaxed text-cream/50">
            {product.description}
          </p>
        )}

        {/* Action Section */}
        <div className="mt-4 flex items-center justify-between gap-2 pt-3 border-t border-char-line/30">
          {cartItem ? (
            <div className="flex items-center gap-2.5 rounded-full bg-cream/10 px-1.5 py-1.5 ring-1 ring-white/5">
              <button
                type="button"
                onClick={() => updateQuantity(cartItem.cartItemId, -1)}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-cream/10 text-cream/70 transition-all hover:bg-cream/20 hover:text-cream active:scale-90"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M20 12H4" />
                </svg>
              </button>
              <span className="w-6 text-center text-sm font-bold text-cream">{cartItem.quantity}</span>
              <button
                type="button"
                onClick={() => updateQuantity(cartItem.cartItemId, 1)}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-brand text-white shadow-lg shadow-brand/30 transition-all hover:bg-brand-dark hover:shadow-brand/50 active:scale-90"
              >
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleAdd}
              className="group/btn relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-full bg-gradient-to-r from-brand to-brand-dark px-4 py-2.5 text-[11px] font-bold tracking-wide text-white uppercase transition-all hover:shadow-lg hover:shadow-brand/30 active:scale-95"
            >
              <span className="relative z-10 flex items-center gap-2">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Add to Cart
              </span>
              <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-500 group-hover/btn:translate-x-full" />
            </button>
          )}
        </div>
      </div>

      {/* Hover Glow Effect */}
      <div className="absolute -inset-px rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100 pointer-events-none">
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-brand/20 via-transparent to-brand/20 blur-xl" />
      </div>
    </div>
  );
}