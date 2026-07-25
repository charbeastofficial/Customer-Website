"use client";

import { useState } from "react";
import { formatCurrency } from "@/lib/currency";
import { useCart } from "@/lib/cart-context";
import { useToast } from "./Toast";

export default function ModifierModal({ product, onClose }) {
  const { addItem } = useCart();
  const toast = useToast();
  const [selectedSize, setSelectedSize] = useState(null);
  const [selected, setSelected] = useState([]);

  if (!product) return null;

  const hasSizes = product.sizes && product.sizes.length > 0;

  const toggle = (mod) => {
    setSelected((prev) =>
      prev.find((m) => m.name === mod.name) ? prev.filter((m) => m.name !== mod.name) : [...prev, mod]
    );
  };

  const basePrice = selectedSize ? selectedSize.price : product.basePrice;
  const total = basePrice + selected.reduce((acc, m) => acc + m.price, 0);

  return (
    <div
      className="fixed inset-0 z-[60] flex animate-[fadeIn_0.15s_ease-out] items-center justify-center bg-ink/60 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm animate-[fadeUp_0.2s_ease-out] rounded-3xl bg-white p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold text-ink">{product.name}</h3>
            <p className="mt-0.5 text-sm text-ink-soft">{product.description}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-stone-soft text-ink transition hover:bg-stone"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {hasSizes && (
          <>
            <p className="mt-5 mb-2 text-xs font-bold tracking-wider text-ink-soft/60 uppercase">Size</p>
            <div className="flex flex-col gap-2">
              {product.sizes.map((size) => {
                const isActive = selectedSize?.id === size.id;
                return (
                  <button
                    type="button"
                    key={size.id}
                    onClick={() => setSelectedSize(size)}
                    className={`flex items-center justify-between rounded-xl border px-4 py-2.5 text-sm transition ${
                      isActive ? "border-brand bg-brand-soft" : "border-stone bg-cream-soft hover:border-brand/40"
                    }`}
                  >
                    <span className="font-medium text-ink">{size.name}</span>
                    <span className="font-bold text-brand">{formatCurrency(size.price)}</span>
                  </button>
                );
              })}
            </div>
          </>
        )}

        {product.modifiers.length > 0 && (
          <>
            <p className="mt-5 mb-2 text-xs font-bold tracking-wider text-ink-soft/60 uppercase">Extras</p>
            <div className="flex flex-col gap-2">
              {product.modifiers.map((mod) => {
                const isActive = selected.some((m) => m.name === mod.name);
                return (
                  <button
                    type="button"
                    key={mod.name}
                    onClick={() => toggle(mod)}
                    className={`flex items-center justify-between rounded-xl border px-4 py-2.5 text-sm transition ${
                      isActive ? "border-brand bg-brand-soft" : "border-stone bg-cream-soft hover:border-brand/40"
                    }`}
                  >
                    <span className="font-medium text-ink">{mod.name}</span>
                    <span className="font-bold text-brand">+{formatCurrency(mod.price)}</span>
                  </button>
                );
              })}
            </div>
          </>
        )}

        <button
          type="button"
          onClick={() => {
            addItem(product, selected, "", selectedSize);
            toast(`${product.name} added to cart`);
            onClose();
          }}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-brand py-3.5 text-sm font-bold text-white transition hover:bg-brand-dark active:scale-[0.98]"
        >
          Add to Cart — {formatCurrency(total)}
        </button>
      </div>
    </div>
  );
}
