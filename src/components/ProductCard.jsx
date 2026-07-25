"use client";

import Image from "next/image";
import { useState } from "react";
import { formatCurrency } from "@/lib/currency";
import { useCart } from "@/lib/cart-context";

export default function ProductCard({ product, category, onCustomize, style }) {
  const { items, addItem, updateQuantity } = useCart();
  const [brokenSrc, setBrokenSrc] = useState(null);
  const [imgLoaded, setImgLoaded] = useState(false);

  const hasModifiers = product.modifiers?.length > 0;
  const hasSizes = product.sizes?.length > 0;
  const needsCustomization = hasModifiers || hasSizes;
  const cartItem = items.find((item) => item.productId === product.id && item.modifiers.length === 0);
  const candidateImage = product.imageURL || category?.imageURL || null;
  const image = candidateImage && candidateImage !== brokenSrc ? candidateImage : null;
  const discount = product.discountPercent > 0 ? product.discountPercent : (category?.discountPercent || 0);
  const discountedPrice = discount > 0 ? product.basePrice * (1 - discount / 100) : null;

  const handleAdd = () => {
    if (needsCustomization) {
      onCustomize(product);
    } else {
      addItem(product);
    }
  };

  return (
    <div
      style={style}
      className="group relative flex animate-[fadeUp_0.5s_ease-out_backwards] flex-col overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-stone/20 transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:ring-brand/30"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-cream-soft">
        {discount > 0 && (
          <div className="absolute left-2 top-2 z-10 rounded-md bg-brand px-2 py-0.5 text-[11px] font-bold tracking-wide text-white shadow-md">
            -{discount}%
          </div>
        )}
        {image ? (
          <>
            {!imgLoaded && (
              <div className="absolute inset-0 flex items-center justify-center bg-cream-soft">
                <div className="h-6 w-6 animate-pulse rounded-full bg-stone" />
              </div>
            )}
            <Image
              src={image}
              alt={product.name}
              fill
              sizes="(min-width: 1024px) 280px, 50vw"
              className={`object-cover transition-all duration-500 group-hover:scale-105 ${imgLoaded ? "opacity-100" : "opacity-0"}`}
              onError={() => setBrokenSrc(candidateImage)}
              onLoad={() => setImgLoaded(true)}
            />
          </>
        ) : (
          <div className="flex h-full w-full items-center justify-center opacity-40">
            {category?.icon ? (
              <span className="text-4xl">{category.icon}</span>
            ) : (
              <svg className="h-10 w-10 text-ink-soft" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 002-2V2" />
                <path d="M7 2v20" />
                <path d="M21 15V2v0a5 5 0 00-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" />
              </svg>
            )}
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-3.5 sm:p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="flex-1 line-clamp-1 text-sm font-semibold text-ink">
            {product.name}
          </h3>
          {discountedPrice ? (
            <div className="shrink-0 text-right">
              <span className="block text-xs font-semibold text-ink-soft/50 line-through">
                {formatCurrency(product.basePrice)}
              </span>
              <span className="text-sm font-bold text-brand">
                {formatCurrency(discountedPrice)}
              </span>
            </div>
          ) : (
            <span className="shrink-0 text-sm font-bold text-brand">
              {formatCurrency(product.basePrice)}
            </span>
          )}
        </div>

        {product.description && (
          <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-ink-soft/70">
            {product.description}
          </p>
        )}

        <div className="mt-auto pt-3">
          {cartItem ? (
            <div className="flex items-center justify-between rounded-lg border border-stone/20 bg-cream-soft/50 px-2 py-1.5 shadow-inner">
              <button
                type="button"
                onClick={() => updateQuantity(cartItem.cartItemId, -1)}
                className="flex h-8 w-8 items-center justify-center rounded-md bg-white text-ink-soft/70 shadow-sm transition hover:bg-stone-soft/50 hover:text-ink active:scale-90 ring-1 ring-stone/10"
              >
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5} strokeLinecap="round">
                  <path d="M20 12H4" />
                </svg>
              </button>
              <span className="min-w-[1.5rem] text-center text-sm font-bold text-ink">{cartItem.quantity}</span>
              <button
                type="button"
                onClick={() => updateQuantity(cartItem.cartItemId, 1)}
                className="flex h-8 w-8 items-center justify-center rounded-md bg-gradient-to-br from-brand to-brand-dark text-white shadow-md shadow-brand/30 transition hover:scale-105 active:scale-90"
              >
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5} strokeLinecap="round">
                  <path d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleAdd}
              className="group/btn relative flex w-full items-center justify-center gap-1.5 overflow-hidden rounded-lg bg-gradient-to-r from-brand to-brand-dark px-3 py-2 text-xs font-bold tracking-wide text-white shadow-md shadow-brand/20 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-brand/40 active:scale-[0.97]"
            >
              <span className="relative z-10 flex items-center gap-1.5">
                <svg className="h-4 w-4 transition-transform duration-300 group-hover/btn:-rotate-12 group-hover/btn:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Add to Cart
              </span>
              <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-500 group-hover/btn:translate-x-full" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}