"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

const CartContext = createContext(null);
const CART_STORAGE_KEY = "charbeast_cart";

function loadStoredCart() {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    // private browsing, corrupted JSON, etc. -- start with an empty cart
    return [];
  }
}

export function CartProvider({ children }) {
  // Starts empty (matches server-rendered markup) and hydrates from
  // localStorage after mount, so a page refresh doesn't silently empty an
  // in-progress order without triggering a hydration mismatch.
  const [items, setItems] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setItems(loadStoredCart());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch {
      // private browsing etc. -- cart just won't persist across reloads
    }
  }, [items, hydrated]);

  const addItem = (product, modifiers = [], note = "", size = null) => {
    const sizeId = size ? `-${size.id}` : "";
    const modId = modifiers.map((m) => m.name).sort().join("|");
    const cartItemId = `${product.id}${sizeId}-${modId}`;
    const basePrice = size ? size.price : product.basePrice;
    const unitPrice = basePrice + modifiers.reduce((acc, m) => acc + m.price, 0);

    setItems((prev) => {
      const existing = prev.find((item) => item.cartItemId === cartItemId);
      if (existing) {
        return prev.map((item) =>
          item.cartItemId === cartItemId ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [
        ...prev,
        {
          cartItemId,
          productId: product.id,
          name: product.name,
          imageURL: product.imageURL,
          categoryID: product.categoryID,
          unitPrice,
          modifiers,
          size,
          quantity: 1,
          note,
        },
      ];
    });
  };

  // A deal is added as one bundled cart line (its own name + price), not as
  // its individual component items -- `includes` just lists what's inside
  // for display/kitchen purposes.
  const addDeal = (deal, includes = []) => {
    const cartItemId = `deal-${deal.id}`;

    setItems((prev) => {
      const existing = prev.find((item) => item.cartItemId === cartItemId);
      if (existing) {
        return prev.map((item) =>
          item.cartItemId === cartItemId ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [
        ...prev,
        {
          cartItemId,
          isDeal: true,
          dealId: deal.id,
          name: deal.title,
          imageURL: deal.imageURL,
          categoryID: null,
          unitPrice: deal.price,
          modifiers: [],
          includes,
          quantity: 1,
          note: "",
        },
      ];
    });
  };

  const updateQuantity = (cartItemId, change) => {
    setItems((prev) =>
      prev
        .map((item) => {
          if (item.cartItemId !== cartItemId) return item;
          const newQty = item.quantity + change;
          return newQty > 0 ? { ...item, quantity: newQty } : null;
        })
        .filter(Boolean)
    );
  };

  const removeItem = (cartItemId) => {
    setItems((prev) => prev.filter((item) => item.cartItemId !== cartItemId));
  };

  const clearCart = () => setItems([]);

  const subtotal = useMemo(
    () => items.reduce((acc, item) => acc + item.unitPrice * item.quantity, 0),
    [items]
  );
  const itemCount = useMemo(() => items.reduce((acc, item) => acc + item.quantity, 0), [items]);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        addDeal,
        updateQuantity,
        removeItem,
        clearCart,
        subtotal,
        itemCount,
        isOpen,
        setIsOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
