"use client";

import { useEffect, useState, useCallback } from "react";
import { useCart } from "@/lib/cart-context";
import { useAuth } from "@/lib/auth-context";
import { formatCurrency } from "@/lib/currency";
import { db } from "@/lib/db";
import { distanceKm } from "@/lib/geo";
import LocationPicker from "./LocationPicker";
import OrderSuccessOverlay from "./OrderSuccessOverlay";
import { useToast } from "./Toast";

const LAST_ORDER_KEY = "charbeast_last_order_id";

const STATUS_LABEL = {
  Pending: "Order received — waiting for the kitchen to confirm",
  Preparing: "Being fire-grilled in the kitchen",
  Ready: "Ready and heading out",
  Completed: "Delivered — enjoy!",
  Cancelled: "This order was cancelled",
};

const STATUS_COLORS = {
  Pending: "bg-amber-500",
  Preparing: "bg-blue-500",
  Ready: "bg-emerald-500",
  Completed: "bg-green-600",
  Cancelled: "bg-red-500",
};

export default function CartDrawer({ taxRate, onRequireLogin }) {
  const { items, updateQuantity, removeItem, subtotal, isOpen, setIsOpen, clearCart } = useCart();
  const { user } = useAuth();
  const toast = useToast();

  const [orderType, setOrderType] = useState("Takeaway");
  const [deliveryLocation, setDeliveryLocation] = useState(null);
  const [customerName, setCustomerName] = useState(user?.user_metadata?.display_name || "");
  const [customerPhone, setCustomerPhone] = useState(user?.user_metadata?.phone || "");
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState("");
  const [trackedOrderId, setTrackedOrderId] = useState(null);
  const [trackedOrder, setTrackedOrder] = useState(null);
  const [justPlaced, setJustPlaced] = useState(false);
  const [confirmRemoveId, setConfirmRemoveId] = useState(null);
  const [deliverySettings, setDeliverySettings] = useState({
    shopLat: null, shopLng: null, deliveryRadiusKm: 5,
    deliveryFreeMinAmount: 0, deliveryFreeMaxDistance: 0,
    deliveryBaseFee: 0, deliveryPerKmRate: 0, deliveryMaxDistance: 0,
    deliveryChargeType: 'per_km',
  });
  const [deliveryZones, setDeliveryZones] = useState([]);
  const [deliveryAreas, setDeliveryAreas] = useState([]);
  const [selectedArea, setSelectedArea] = useState(null);

  const deliveryDistance = orderType === "Delivery" && deliveryLocation?.lat != null && deliverySettings.shopLat != null
    ? distanceKm(deliveryLocation.lat, deliveryLocation.lng, deliverySettings.shopLat, deliverySettings.shopLng)
    : null;

  const deliveryFee = (() => {
    if (orderType !== "Delivery") return 0;
    if (deliverySettings.deliveryChargeType === 'area') {
      if (!selectedArea) return 0;
      return selectedArea.charge;
    }
    if (deliveryDistance == null) return 0;
    if (deliverySettings.deliveryFreeMinAmount > 0 && subtotal >= deliverySettings.deliveryFreeMinAmount) return 0;
    if (deliverySettings.deliveryFreeMaxDistance > 0 && deliveryDistance <= deliverySettings.deliveryFreeMaxDistance) return 0;

    if (deliverySettings.deliveryChargeType === 'tiered') {
      const match = deliveryZones.find((z) => deliveryDistance >= z.minKm && deliveryDistance <= z.maxKm);
      return match ? match.charge : (Number(deliverySettings.deliveryBaseFee) || 0);
    }

    const baseFee = Number(deliverySettings.deliveryBaseFee) || 0;
    const perKmRate = Number(deliverySettings.deliveryPerKmRate) || 0;
    const chargeableKm = Math.max(0, deliveryDistance - (deliverySettings.deliveryFreeMaxDistance || 0));
    return baseFee + chargeableKm * perKmRate;
  })();

  const tax = subtotal * taxRate;
  const total = subtotal + tax + deliveryFee;

  useEffect(() => {
    db.getSiteSettings()
      .then((s) => setDeliverySettings({
        shopLat: s.shopLat, shopLng: s.shopLng, deliveryRadiusKm: s.deliveryRadiusKm,
        deliveryFreeMinAmount: s.deliveryFreeMinAmount || 0,
        deliveryFreeMaxDistance: s.deliveryFreeMaxDistance || 0,
        deliveryBaseFee: s.deliveryBaseFee || 0,
        deliveryPerKmRate: s.deliveryPerKmRate || 0,
        deliveryMaxDistance: s.deliveryMaxDistance || 0,
        deliveryChargeType: s.deliveryChargeType || 'per_km',
      }))
      .catch(() => {});
    db.getDeliveryZones().then(setDeliveryZones).catch(() => {});
    db.getDeliveryAreas().then(setDeliveryAreas).catch(() => {});
  }, []);

  useEffect(() => {
    try {
      const lastId = localStorage.getItem(LAST_ORDER_KEY);
      if (lastId) setTrackedOrderId(lastId);
    } catch {
      // private browsing etc -- no persisted tracking available
    }
  }, []);

  useEffect(() => {
    if (!trackedOrderId) return;
    let cancelled = false;
    db.getOrder(trackedOrderId)
      .then((order) => {
        if (!cancelled) setTrackedOrder(order);
      })
      .catch(() => {
        try {
          localStorage.removeItem(LAST_ORDER_KEY);
        } catch {
          // ignore
        }
        setTrackedOrderId(null);
      });
    const unsubscribe = db.subscribeToOrder(trackedOrderId, setTrackedOrder);
    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [trackedOrderId]);

  const close = () => setIsOpen(false);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const handlePlaceOrder = async () => {
    if (!user) {
      onRequireLogin();
      return;
    }
    if (!customerName.trim() || !customerPhone.trim()) {
      setError("Please add your name and phone number.");
      return;
    }
    if (orderType === "Delivery") {
      if (!deliveryLocation) {
        setError("Please pick your delivery location on the map.");
        return;
      }
      if (!deliveryLocation.withinRadius) {
        setError(`Sorry, that location is outside our ${deliverySettings.deliveryRadiusKm} km delivery zone.`);
        return;
      }
    }
    setError("");
    setPlacing(true);
    try {
      const order = await db.createOrder({
        customerId: user.id,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        orderType,
        deliveryAddress: orderType === "Delivery" ? deliveryLocation.address : "",
        deliveryLat: orderType === "Delivery" ? deliveryLocation.lat : null,
        deliveryLng: orderType === "Delivery" ? deliveryLocation.lng : null,
        deliveryFee: parseFloat(deliveryFee.toFixed(2)),
        totalAmount: parseFloat(total.toFixed(2)),
        items: items.map((item) =>
          item.isDeal
            ? {
                productId: null,
                name: item.name,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                notes: item.includes?.length ? `Includes: ${item.includes.join(", ")}` : "",
              }
            : {
                productId: item.productId,
                name: item.name,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                notes: [
                  item.size && item.size.name,
                  ...item.modifiers.map((m) => m.name),
                  ...item.addons.map((a) => a.name),
                  item.note,
                ].filter(Boolean).join(" — "),
              }
        ),
      });
      setTrackedOrder(order);
      setTrackedOrderId(order.id);
      setJustPlaced(true);
      try {
        localStorage.setItem(LAST_ORDER_KEY, order.id);
      } catch {
        // private browsing etc -- tracking just won't persist across visits
      }
      clearCart();
      toast("Order placed successfully!");
    } catch (err) {
      console.error("Failed to place order:", err);
      setError("Something went wrong placing your order. Please try again.");
    } finally {
      setPlacing(false);
    }
  };

  if (!isOpen) return null;

  const showTrackedOrder = items.length === 0 && trackedOrder;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 animate-[fadeIn_0.2s_ease-out] bg-ink/60 backdrop-blur-sm" onClick={close} />
      <div role="dialog" aria-modal="true" aria-labelledby="cart-drawer-title" className="relative flex h-full w-full max-w-md animate-[slideIn_0.25s_ease-out] flex-col bg-cream shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone/70 px-6 py-5 bg-white/50 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <h2 id="cart-drawer-title" className="text-lg font-bold text-ink">
              {showTrackedOrder ? "Your Order" : "Your Cart"}
            </h2>
            {!showTrackedOrder && items.length > 0 && (
              <span className="rounded-full bg-brand/10 px-2.5 py-0.5 text-xs font-bold text-brand">
                {items.length} {items.length === 1 ? 'item' : 'items'}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={close}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-stone-soft/50 text-ink/60 transition hover:bg-stone-soft hover:text-ink hover:scale-105"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {showTrackedOrder ? (
          <OrderTracker order={trackedOrder} user={user} onClose={close} />
        ) : items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-stone-soft/50">
              <svg className="h-10 w-10 text-stone" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-bold text-ink">Your cart is empty</h3>
              <p className="mt-1 text-sm text-ink-soft">Add something fire-grilled!</p>
            </div>
            <button
              type="button"
              onClick={close}
              className="mt-2 rounded-full bg-brand px-6 py-2.5 text-sm font-bold text-white transition hover:bg-brand-dark active:scale-95"
            >
              Start Ordering
            </button>
          </div>
        ) : (
          <>
            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto px-6 py-5 bg-cream-soft/30">
              <div className="flex flex-col gap-4">
                {items.map((item) => (
                  <div key={item.cartItemId} className="group flex items-start gap-3 rounded-2xl bg-white p-3 shadow-sm ring-1 ring-stone/10 transition hover:shadow-md">
                    <CartItemThumb imageURL={item.imageURL} name={item.name} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        {item.isDeal && (
                          <span className="rounded-full bg-brand/10 px-2 py-0.5 text-[9px] font-bold text-brand uppercase">
                            Bundle
                          </span>
                        )}
                        <p className="truncate text-sm font-semibold text-ink">{item.name}</p>
                      </div>
                      {item.isDeal && item.includes?.length > 0 && (
                        <p className="mt-0.5 text-xs text-ink-soft/70 line-clamp-1">{item.includes.join(", ")}</p>
                      )}
                      {!item.isDeal && (
                        <p className="mt-0.5 truncate text-xs text-ink-soft/70">
                          {item.size && <span className="font-medium text-ink/60">{item.size.name} · </span>}
                          {[...item.modifiers, ...item.addons].map((m) => m.name).join(", ")}
                        </p>
                      )}
                      <p className="mt-1 text-sm font-bold text-brand">{formatCurrency(item.unitPrice)}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <button
                        type="button"
                        onClick={() => setConfirmRemoveId(item.cartItemId)}
                        className="text-xs text-ink-soft/50 transition hover:text-brand"
                      >
                        Remove
                      </button>
                      <div className="flex items-center gap-1 rounded-lg bg-stone-soft/50 px-1 py-1 ring-1 ring-stone/10">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.cartItemId, -1)}
                          className="flex h-8 w-8 items-center justify-center rounded-md bg-white text-ink-soft/70 shadow-sm transition hover:text-ink active:scale-90"
                        >
                          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5} strokeLinecap="round">
                            <path d="M20 12H4" />
                          </svg>
                        </button>
                        <span className="w-6 text-center text-sm font-semibold text-ink">{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.cartItemId, 1)}
                          className="flex h-8 w-8 items-center justify-center rounded-md bg-brand text-white shadow-sm transition hover:bg-brand-dark active:scale-90"
                        >
                          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5} strokeLinecap="round">
                            <path d="M12 4v16m8-8H4" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Details Form */}
              <div className="mt-6 space-y-4">
                <div>
                  <p className="text-xs font-bold tracking-wider text-ink-soft/60 uppercase mb-2">Order Type</p>
                  <div className="flex gap-2">
                    {["Takeaway", "Delivery"].map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setOrderType(type)}
                        className={`flex-1 rounded-full py-2.5 text-sm font-bold transition ${
                          orderType === type 
                            ? "bg-brand text-white shadow-lg shadow-brand/30" 
                            : "bg-white border border-stone/30 text-ink-soft hover:border-brand/50"
                        }`}
                      >
                          <span className="flex items-center justify-center gap-2">
                            {type === "Takeaway" ? (
                              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                                <polyline points="9 22 9 12 15 12 15 22" />
                              </svg>
                            ) : (
                              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M5 17h14l2-6H3l2 6z" />
                                <path d="M17 21a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" />
                                <path d="M7 21a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" />
                                <path d="M3 9h4l2-4h6l2 4h4" />
                              </svg>
                            )}
                            {type}
                          </span>
                      </button>
                    ))}
                  </div>
                  {orderType === "Delivery" && (
                    <div className="mt-3">
                      {deliverySettings.deliveryChargeType === 'area' && deliveryAreas.length > 0 && (
                        <div className="mb-3">
                          <p className="mb-1.5 text-xs font-semibold text-ink-soft">Select your area</p>
                          <select
                            className="w-full rounded-xl border border-stone/30 bg-white px-3.5 py-2.5 text-sm text-ink transition focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/10"
                            value={selectedArea?.id || ''}
                            onChange={(e) => {
                              const area = deliveryAreas.find((a) => a.id === e.target.value);
                              setSelectedArea(area || null);
                            }}
                          >
                            <option value="">-- Choose your area --</option>
                            {deliveryAreas.map((area) => (
                              <option key={area.id} value={area.id}>{area.name} — Rs {area.charge}</option>
                            ))}
                          </select>
                        </div>
                      )}
                      <p className="mb-2 text-xs text-ink-soft flex items-center gap-1">
                        <svg className="h-3.5 w-3.5 shrink-0 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                          <circle cx="12" cy="10" r="3" />
                        </svg>
                        Tap the map to drop a pin at your delivery location.
                      </p>
                      <LocationPicker
                        shopLat={deliverySettings.shopLat}
                        shopLng={deliverySettings.shopLng}
                        radiusKm={deliverySettings.deliveryRadiusKm}
                        onChange={setDeliveryLocation}
                      />
                      {deliveryLocation?.address && (
                        <p className="mt-2 text-xs text-ink-soft/70 leading-relaxed">
                          Address shown: <span className="font-medium text-ink">{deliveryLocation.address}</span>.
                          If this is not accurate, move the pin on the map above.
                        </p>
                      )}
                    </div>
                  )}
                </div>

                <div>
                  <p className="text-xs font-bold tracking-wider text-ink-soft/60 uppercase mb-2">Your Details</p>
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Full name"
                      className="w-full rounded-xl border border-stone/30 bg-white px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-soft/50 transition focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/10"
                    />
                    <input
                      type="tel"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="Phone number"
                      className="w-full rounded-xl border border-stone/30 bg-white px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-soft/50 transition focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/10"
                    />
                  </div>
                </div>

                {error && (
                  <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3">
                    <p className="text-sm font-medium text-red-600 flex items-center gap-2">
                      <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                        <line x1="12" y1="9" x2="12" y2="13" />
                        <line x1="12" y1="17" x2="12.01" y2="17" />
                      </svg>
                      {error}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-stone/70 bg-white px-6 py-5 shadow-lg shadow-ink/5">
              <div className="flex flex-col gap-1.5 text-sm">
                <div className="flex justify-between text-ink-soft">
                  <span>Subtotal</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-ink-soft">
                  <span>Tax</span>
                  <span>{formatCurrency(tax)}</span>
                </div>
                {orderType === "Delivery" && (
                  <div className="flex justify-between text-ink-soft">
                    <span>Delivery Fee</span>
                    <span>{deliveryFee > 0 ? formatCurrency(deliveryFee) : <span className="text-green-600 font-medium">Free</span>}</span>
                  </div>
                )}
                <div className="mt-1 flex justify-between border-t border-dashed border-stone/50 pt-2 text-base font-bold text-ink">
                  <span>Total</span>
                  <span className="text-brand text-lg">{formatCurrency(total)}</span>
                </div>
              </div>

              {user ? (
                <button
                  type="button"
                  disabled={placing || (orderType === "Delivery" && (
                    deliverySettings.deliveryChargeType === 'area'
                      ? !selectedArea || !deliveryLocation
                      : !deliveryLocation || !deliveryLocation.withinRadius
                  ))}
                  onClick={handlePlaceOrder}
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-brand py-3.5 text-sm font-bold text-white transition hover:bg-brand-dark hover:shadow-lg hover:shadow-brand/30 active:scale-[0.98] disabled:opacity-60"
                >
                  {placing ? (
                    <>
                      <svg className="h-4 w-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Placing Order…
                    </>
                  ) : (
                    <>
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="2" y="6" width="20" height="12" rx="2" />
                        <circle cx="12" cy="12" r="2" />
                        <path d="M6 12h.01M18 12h.01" />
                      </svg>
                      Place Order
                    </>
                  )}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onRequireLogin}
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-ink py-3.5 text-sm font-bold text-cream transition hover:bg-ink/85 hover:shadow-lg active:scale-[0.98]"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                  Log In to Order
                </button>
              )}
              <p className="mt-2.5 text-center text-[11px] text-ink-soft/60">
                Cash on delivery / at pickup — no online payment needed.
              </p>
            </div>
          </>
        )}

        {justPlaced && showTrackedOrder && (
          <OrderSuccessOverlay onDone={() => setJustPlaced(false)} />
        )}
      </div>

      {confirmRemoveId && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-ink/60 backdrop-blur-sm p-6" onClick={() => setConfirmRemoveId(null)}>
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl shadow-ink/20" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-ink">Remove Item</h3>
            <p className="mt-2 text-sm text-ink-soft">Are you sure you want to remove this item from your cart?</p>
            <div className="mt-5 flex justify-end gap-3">
              <button type="button" onClick={() => setConfirmRemoveId(null)} className="rounded-full border border-stone/30 bg-cream px-5 py-2.5 text-sm font-semibold text-ink-soft transition hover:border-stone/60 hover:text-ink">
                Cancel
              </button>
              <button type="button" onClick={() => { removeItem(confirmRemoveId); toast("Item removed from cart", "info"); setConfirmRemoveId(null); }} className="rounded-full bg-brand px-5 py-2.5 text-sm font-bold text-white transition hover:bg-brand-dark active:scale-95">
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CartItemThumb({ imageURL, name }) {
  const [broken, setBroken] = useState(false);
  return (
    <div className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-cream-soft shadow-sm ring-1 ring-stone/20">
      {imageURL && !broken ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={imageURL} alt={name || ""} className="h-full w-full object-cover" onError={() => setBroken(true)} />
      ) : (
        <svg className="h-7 w-7 text-stone" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <path d="m21 15-5-5L5 21" />
        </svg>
      )}
    </div>
  );
}

function OrderTracker({ order, user, onClose }) {
  const isCompleted = order.status === "Completed";
  const [checkingReview, setCheckingReview] = useState(isCompleted);
  const [alreadyReviewed, setAlreadyReviewed] = useState(false);
  const [justReviewed, setJustReviewed] = useState(false);

  useEffect(() => {
    if (!isCompleted) return;
    let cancelled = false;
    setCheckingReview(true);
    db.hasReview(order.id)
      .then((has) => {
        if (!cancelled) setAlreadyReviewed(has);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setCheckingReview(false);
      });
    return () => {
      cancelled = true;
    };
  }, [isCompleted, order.id]);

  return (
    <div className="flex flex-1 flex-col items-center gap-4 overflow-y-auto px-8 py-8 text-center">
      {/* Status Icon */}
      <div className={`flex h-20 w-20 items-center justify-center rounded-full text-4xl shadow-lg ${
        isCompleted 
          ? "bg-green-100 shadow-green-200" 
          : "bg-amber-100 shadow-amber-200 animate-pulse"
      }`}>
        {isCompleted ? (
          <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="9" />
            <path d="M8 12l2 2 4-4" />
          </svg>
        ) : (
          <svg className="h-8 w-8 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M8.5 14.5A2.5 2.5 0 0011 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 11-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 002.5 2.5z" />
          </svg>
        )}
      </div>
      
      <div>
        <h3 className="text-xl font-bold text-ink">
          {isCompleted ? "Enjoyed your order?" : "Thanks, it's on the grill!"}
        </h3>
        <p className="mt-1.5 text-sm text-ink-soft">{STATUS_LABEL[order.status] || "We've got your order."}</p>
        {order.status === "Cancelled" && order.cancelReason && (
          <p className="mt-2 text-sm font-medium text-red-500">Reason: {order.cancelReason}</p>
        )}
      </div>

      {/* Status Progress */}
      <div className="w-full max-w-xs">
        <div className="flex justify-between text-xs text-ink-soft/60 mb-1">
          <span>Received</span>
          <span>Preparing</span>
          <span>Ready</span>
          <span>Delivered</span>
        </div>
        <div className="relative h-1.5 w-full rounded-full bg-stone-soft overflow-hidden">
          <div 
            className={`absolute inset-0 rounded-full transition-all duration-500 ${
              order.status === "Pending" ? "w-1/4 bg-amber-500" :
              order.status === "Preparing" ? "w-1/2 bg-blue-500" :
              order.status === "Ready" ? "w-3/4 bg-emerald-500" :
              order.status === "Completed" ? "w-full bg-green-600" :
              "w-0 bg-red-500"
            }`}
          />
        </div>
      </div>

      {/* Order Details */}
      <div className="w-full rounded-2xl border border-stone/30 bg-white/80 backdrop-blur-sm p-4 text-left text-sm shadow-sm">
        <div className="flex justify-between text-ink-soft">
          <span>Order #</span>
          <span className="font-mono font-bold text-ink">{order.id.slice(-6).toUpperCase()}</span>
        </div>
        <div className="mt-1.5 flex justify-between text-ink-soft">
          <span>Total</span>
          <span className="font-bold text-brand">{formatCurrency(order.totalAmount)}</span>
        </div>
        <div className="mt-1.5 flex justify-between text-ink-soft">
          <span>Type</span>
          <span className="font-medium text-ink">{order.orderType || "Takeaway"}</span>
        </div>
      </div>

      {/* Review Section */}
      {isCompleted && !checkingReview && !alreadyReviewed && !justReviewed && (
        <ReviewForm order={order} user={user} onSubmitted={() => setJustReviewed(true)} />
      )}
      {isCompleted && (alreadyReviewed || justReviewed) && (
        <div className="flex items-center gap-2 rounded-2xl bg-green-50 border border-green-200 px-4 py-3 text-sm font-semibold text-green-700">
          <svg className="h-5 w-5 shrink-0 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
          Thanks for the review!
        </div>
      )}

      <button
        type="button"
        onClick={onClose}
        className="mt-2 rounded-full bg-ink px-8 py-3 text-sm font-bold text-cream transition hover:bg-ink/85 hover:shadow-lg active:scale-95"
      >
        Continue Browsing
      </button>
    </div>
  );
}

function ReviewForm({ order, user, onSubmitted }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    setSubmitting(true);
    setError("");
    try {
      await db.submitReview({
        orderId: order.id,
        customerId: user.id,
        customerName: order.customerName || user.user_metadata?.display_name || "Customer",
        rating,
        comment: comment.trim(),
      });
      onSubmitted();
    } catch (err) {
      console.error("Failed to submit review:", err);
      setError("Couldn't submit your review. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full rounded-2xl border border-stone/30 bg-white/80 backdrop-blur-sm p-5 text-left shadow-sm">
      <p className="text-xs font-bold tracking-wider text-ink-soft/60 uppercase">Leave a Review</p>
      <div className="mt-2 flex gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setRating(n)}
            aria-label={`${n} star${n > 1 ? "s" : ""}`}
            className="text-2xl leading-none transition hover:scale-110 active:scale-90"
          >
            <span className={n <= rating ? "text-brand" : "text-stone-soft"}>★</span>
          </button>
        ))}
      </div>
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows={3}
        placeholder="How was it? (optional)"
        className="mt-3 w-full resize-none rounded-xl border border-stone/30 bg-cream-soft/50 px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-soft/50 transition focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/10"
      />
      {error && <p className="mt-2 text-sm font-medium text-red-600">{error}</p>}
      <button
        type="button"
        disabled={submitting}
        onClick={handleSubmit}
        className="mt-3 flex w-full items-center justify-center gap-2 rounded-full bg-brand py-2.5 text-sm font-bold text-white transition hover:bg-brand-dark hover:shadow-lg hover:shadow-brand/30 active:scale-[0.98] disabled:opacity-60"
      >
        {submitting ? (
          <>
            <svg className="h-4 w-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Submitting…
          </>
        ) : (
          "Submit Review"
        )}
      </button>
    </div>
  );
}