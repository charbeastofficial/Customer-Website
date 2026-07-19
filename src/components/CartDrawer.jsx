"use client";

import { useEffect, useState, useCallback } from "react";
import { useCart } from "@/lib/cart-context";
import { useAuth } from "@/lib/auth-context";
import { formatCurrency } from "@/lib/currency";
import { db } from "@/lib/db";
import LocationPicker from "./LocationPicker";

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

  const [orderType, setOrderType] = useState("Takeaway");
  const [deliveryLocation, setDeliveryLocation] = useState(null);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState("");
  const [trackedOrderId, setTrackedOrderId] = useState(null);
  const [trackedOrder, setTrackedOrder] = useState(null);
  const [confirmRemoveId, setConfirmRemoveId] = useState(null);
  const [deliverySettings, setDeliverySettings] = useState({ shopLat: null, shopLng: null, deliveryRadiusKm: 5 });

  const tax = subtotal * taxRate;
  const total = subtotal + tax;

  useEffect(() => {
    db.getSiteSettings()
      .then((s) => setDeliverySettings({ shopLat: s.shopLat, shopLng: s.shopLng, deliveryRadiusKm: s.deliveryRadiusKm }))
      .catch(() => {});
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
                name: item.modifiers.length
                  ? `${item.name} (${item.modifiers.map((m) => m.name).join(", ")})`
                  : item.name,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                notes: item.note || "",
              }
        ),
      });
      setTrackedOrder(order);
      setTrackedOrderId(order.id);
      try {
        localStorage.setItem(LAST_ORDER_KEY, order.id);
      } catch {
        // private browsing etc -- tracking just won't persist across visits
      }
      clearCart();
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
      <div className="relative flex h-full w-full max-w-md animate-[slideIn_0.25s_ease-out] flex-col bg-cream shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone/70 px-6 py-5 bg-white/50 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-bold text-ink">
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
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-stone-soft/50 text-5xl">
              🛒
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
                    <CartItemThumb imageURL={item.imageURL} />
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
                      {!item.isDeal && item.modifiers.length > 0 && (
                        <p className="mt-0.5 truncate text-xs text-ink-soft/70">
                          {item.modifiers.map((m) => m.name).join(", ")}
                        </p>
                      )}
                      <p className="mt-1 text-sm font-bold text-brand">{formatCurrency(item.unitPrice)}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <button
                        type="button"
                        onClick={() => setConfirmRemoveId(item.cartItemId)}
                        className="text-xs text-ink-soft/50 transition hover:text-brand opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
                      >
                        Remove
                      </button>
                      <div className="flex items-center gap-1 rounded-full bg-stone-soft/50 px-1 py-1 ring-1 ring-stone/10">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.cartItemId, -1)}
                          className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-ink shadow-sm transition hover:shadow active:scale-90"
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M20 12H4" />
                          </svg>
                        </button>
                        <span className="w-6 text-center text-sm font-bold text-ink">{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.cartItemId, 1)}
                          className="flex h-9 w-9 items-center justify-center rounded-full bg-brand text-white shadow-sm transition hover:shadow-md active:scale-90"
                        >
                          <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
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
                          {type === "Takeaway" ? "🏠" : "🚗"}
                          {type}
                        </span>
                      </button>
                    ))}
                  </div>
                  {orderType === "Delivery" && (
                    <div className="mt-3">
                      <p className="mb-2 text-xs text-ink-soft flex items-center gap-1">
                        <span>📍</span> Tap the map to drop a pin at your delivery location.
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
                      <span>⚠️</span> {error}
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
                <div className="mt-1 flex justify-between border-t border-dashed border-stone/50 pt-2 text-base font-bold text-ink">
                  <span>Total</span>
                  <span className="text-brand text-lg">{formatCurrency(total)}</span>
                </div>
              </div>

              {user ? (
                <button
                  type="button"
                  disabled={placing || (orderType === "Delivery" && (!deliveryLocation || !deliveryLocation.withinRadius))}
                  onClick={handlePlaceOrder}
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-brand to-brand-dark py-3.5 text-sm font-bold text-white transition hover:shadow-lg hover:shadow-brand/30 active:scale-[0.98] disabled:opacity-60"
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
                      <span>💰</span>
                      Place Order — Cash on Delivery
                    </>
                  )}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onRequireLogin}
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-ink py-3.5 text-sm font-bold text-cream transition hover:bg-ink/85 hover:shadow-lg active:scale-[0.98]"
                >
                  <span>🔐</span>
                  Log In to Order
                </button>
              )}
              <p className="mt-2.5 text-center text-[11px] text-ink-soft/60">
                Cash on delivery / at pickup — no online payment needed.
              </p>
            </div>
          </>
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
              <button type="button" onClick={() => { removeItem(confirmRemoveId); setConfirmRemoveId(null); }} className="rounded-full bg-brand px-5 py-2.5 text-sm font-bold text-white transition hover:bg-brand-dark active:scale-95">
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CartItemThumb({ imageURL }) {
  const [broken, setBroken] = useState(false);
  return (
    <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-stone-soft/50 text-2xl ring-1 ring-stone/10">
      {imageURL && !broken ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={imageURL} alt="" className="h-full w-full object-cover" onError={() => setBroken(true)} />
      ) : (
        "🍔"
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
        {isCompleted ? "🎉" : "🔥"}
      </div>
      
      <div>
        <h3 className="text-xl font-bold text-ink">
          {isCompleted ? "Enjoyed your order?" : "Thanks, it's on the grill!"}
        </h3>
        <p className="mt-1.5 text-sm text-ink-soft">{STATUS_LABEL[order.status] || "We've got your order."}</p>
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
          <span>✅</span> Thanks for the review! 🙌
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
        className="mt-3 flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-brand to-brand-dark py-2.5 text-sm font-bold text-white transition hover:shadow-lg hover:shadow-brand/30 active:scale-[0.98] disabled:opacity-60"
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