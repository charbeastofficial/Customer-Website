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

export default function ProductDetailModal({ product, category, onClose }) {
  const { addItem } = useCart();
  const toast = useToast();
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedModifiers, setSelectedModifiers] = useState([]);
  const [selectedAddons, setSelectedAddons] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [brokenSrc, setBrokenSrc] = useState(null);
  const [imgLoaded, setImgLoaded] = useState(false);

  // This component stays mounted (MenuSection always renders it, gated by
  // `product`), so its own selection state needs to reset whenever a
  // different product is opened -- otherwise a size/add-on picked for one
  // product would silently carry over into the next.
  useEffect(() => {
    setSelectedSize(null);
    setSelectedModifiers([]);
    setSelectedAddons([]);
    setQuantity(1);
    setBrokenSrc(null);
    setImgLoaded(false);
  }, [product?.id]);

  useEffect(() => {
    if (!product) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [product, onClose]);

  if (!product) return null;

  const hasSizes = product.sizes && product.sizes.length > 0;
  const hasModifiers = product.modifiers && product.modifiers.length > 0;
  const hasAddons = product.addons && product.addons.length > 0;

  const toggleModifier = (mod) => {
    setSelectedModifiers((prev) =>
      prev.find((m) => m.name === mod.name) ? prev.filter((m) => m.name !== mod.name) : [...prev, mod]
    );
  };

  const toggleAddon = (addon) => {
    setSelectedAddons((prev) =>
      prev.find((a) => a.id === addon.id) ? prev.filter((a) => a.id !== addon.id) : [...prev, addon]
    );
  };

  const discount = product.discountPercent > 0 ? product.discountPercent : (category?.discountPercent || 0);
  const basePrice = selectedSize ? selectedSize.price : product.basePrice;
  const displayBasePrice = discount > 0 ? basePrice * (1 - discount / 100) : basePrice;
  const unitTotal =
    displayBasePrice +
    selectedModifiers.reduce((acc, m) => acc + m.price, 0) +
    selectedAddons.reduce((acc, a) => acc + a.price, 0);
  const total = unitTotal * quantity;

  const candidateImage = product.imageURL || category?.imageURL || null;
  const image = candidateImage && candidateImage !== brokenSrc ? candidateImage : null;

  const handleAddToCart = () => {
    addItem(product, selectedModifiers, "", selectedSize, selectedAddons, quantity);
    toast(`${product.name} added to cart`);
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
        aria-labelledby="product-detail-title"
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
                alt={product.name}
                fill
                sizes="(min-width: 640px) 50vw, 100vw"
                className={`object-cover transition-opacity duration-500 ${imgLoaded ? "opacity-100" : "opacity-0"}`}
                onError={() => setBrokenSrc(candidateImage)}
                onLoad={() => setImgLoaded(true)}
              />
            </>
          ) : (
            <div className="flex h-full w-full items-center justify-center opacity-40">
              {category?.icon ? (
                <span className="text-5xl">{category.icon}</span>
              ) : (
                <svg className="h-14 w-14 text-ink-soft" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 002-2V2" />
                  <path d="M7 2v20" />
                  <path d="M21 15V2v0a5 5 0 00-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" />
                </svg>
              )}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="flex flex-col p-6 sm:overflow-y-auto">
          <h2 id="product-detail-title" className="pr-8 text-xl font-bold text-ink">
            {product.name}
          </h2>
          {product.description && (
            <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">{product.description}</p>
          )}
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-lg font-bold text-brand">{formatCurrency(displayBasePrice)}</span>
            {discount > 0 && (
              <span className="text-sm font-medium text-ink-soft/50 line-through">
                {formatCurrency(basePrice)}
              </span>
            )}
          </div>

          {hasSizes && (
            <div className="mt-5">
              <p className="mb-2 text-xs font-bold tracking-wider text-ink-soft/60 uppercase">Size</p>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((size) => {
                  const isActive = selectedSize?.id === size.id;
                  return (
                    <button
                      type="button"
                      key={size.id}
                      onClick={() => setSelectedSize(size)}
                      className={`rounded-lg border px-4 py-2 text-sm font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand ${
                        isActive
                          ? "border-brand bg-brand text-white"
                          : "border-stone bg-cream-soft text-ink hover:border-brand/40"
                      }`}
                    >
                      {size.name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {hasModifiers && (
            <div className="mt-5">
              <p className="mb-2 text-xs font-bold tracking-wider text-ink-soft/60 uppercase">Extras</p>
              <div className="flex flex-col gap-2">
                {product.modifiers.map((mod) => {
                  const isActive = selectedModifiers.some((m) => m.name === mod.name);
                  return (
                    <button
                      type="button"
                      key={mod.name}
                      onClick={() => toggleModifier(mod)}
                      className={`flex items-center justify-between rounded-lg border px-3 py-2 text-left text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand ${
                        isActive ? "border-brand bg-brand-soft" : "border-stone bg-cream-soft hover:border-brand/40"
                      }`}
                    >
                      <span className="text-ink">{mod.name}</span>
                      <span className="font-bold text-brand">+{formatCurrency(mod.price)}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {hasAddons && (
            <div className="mt-5">
              <p className="mb-2 text-xs font-bold tracking-wider text-ink-soft/60 uppercase">Add-ons (Optional)</p>
              <div className="flex gap-3 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {product.addons.map((addon) => {
                  const isActive = selectedAddons.some((a) => a.id === addon.id);
                  return (
                    <button
                      type="button"
                      key={addon.id}
                      onClick={() => toggleAddon(addon)}
                      className={`flex w-24 shrink-0 flex-col items-center gap-1.5 rounded-xl border p-2 text-center transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand ${
                        isActive ? "border-brand bg-brand-soft" : "border-stone bg-cream-soft hover:border-brand/40"
                      }`}
                    >
                      <span className="relative flex h-14 w-14 items-center justify-center overflow-hidden rounded-full bg-white ring-1 ring-stone/20">
                        {addon.imageURL ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={addon.imageURL} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <svg className="h-6 w-6 text-ink-soft/50" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                          </svg>
                        )}
                        {isActive && (
                          <span className="absolute inset-0 flex items-center justify-center bg-ink/40">
                            <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          </span>
                        )}
                      </span>
                      <span className="line-clamp-1 text-xs font-semibold text-ink">{addon.name}</span>
                      <span className="text-[11px] font-bold text-brand">+{formatCurrency(addon.price)}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

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
            disabled={!product.isAvailable}
            className="mt-4 flex w-full items-center justify-center rounded-full bg-brand py-3.5 text-sm font-bold text-white transition hover:bg-brand-dark active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {product.isAvailable ? `Add To Cart — ${formatCurrency(total)}` : "Currently unavailable"}
          </button>
        </div>
      </div>
    </div>
  );
}
