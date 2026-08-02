"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { db } from "@/lib/db";
import { formatCurrency } from "@/lib/currency";
import Container from "./Container";
import AuthModal from "./AuthModal";
import ReviewForm from "./ReviewForm";

const STATUS_PILL = {
  Pending: "bg-amber-500/10 text-amber-600 border-amber-200",
  Preparing: "bg-blue-500/10 text-blue-600 border-blue-200",
  Ready: "bg-emerald-500/10 text-emerald-600 border-emerald-200",
  Completed: "bg-green-500/10 text-green-600 border-green-200",
  Cancelled: "bg-red-500/10 text-red-600 border-red-200 line-through",
};

const STATUS_ICON = {
  Pending: "⏳",
  Preparing: "🔥",
  Ready: "✅",
  Completed: "🎉",
  Cancelled: "❌",
};

export default function AccountView() {
  const { user, loading, signOut, updateProfile } = useAuth();
  const router = useRouter();

  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [displayName, setDisplayName] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [myReviews, setMyReviews] = useState({});
  const [reviewingOrderId, setReviewingOrderId] = useState(null);

  useEffect(() => {
    if (user) setDisplayName(user.user_metadata?.display_name || "");
  }, [user]);

  useEffect(() => {
    if (!user) return;
    setOrdersLoading(true);
    db.getMyOrders(user.id)
      .then(setOrders)
      .finally(() => setOrdersLoading(false));
    db.getMyReviews(user.id)
      .then((reviews) => {
        setMyReviews(Object.fromEntries(reviews.map((r) => [r.orderId, r])));
      })
      .catch(() => {});
  }, [user]);

  if (loading) {
    return (
      <Container className="py-24 text-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-brand/20 border-t-brand" />
          <p className="text-sm text-ink-soft">Loading your account…</p>
        </div>
      </Container>
    );
  }

  if (!user) {
    return (
      <>
        <Container className="py-24 text-center">
          <div className="mx-auto max-w-md">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-brand-soft mx-auto text-4xl">
              🔐
            </div>
            <h1 className="mt-4 text-2xl font-bold text-ink">Log in to view your account</h1>
            <p className="mt-2 text-sm text-ink-soft">Track orders, leave reviews, and manage your details.</p>
            <button
              type="button"
              onClick={() => router.push("/")}
              className="mt-6 rounded-full bg-brand px-8 py-3 text-sm font-bold text-white transition hover:bg-brand-dark hover:shadow-lg hover:shadow-brand/30 active:scale-95"
            >
              Go to Home
            </button>
          </div>
        </Container>
        <AuthModal open onClose={() => router.push("/")} />
      </>
    );
  }

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      await updateProfile({ displayName: displayName.trim() });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error("Failed to update profile:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Container className=" mt-10 py-16 lg:py-24">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[340px_1fr]">
        {/* PROFILE CARD */}
        <div className="h-fit rounded-2xl border border-stone/20 bg-white p-6 shadow-sm ring-1 ring-stone/5">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="absolute -inset-1 rounded-full bg-gradient-to-br from-brand to-brand/50 blur-md opacity-30" />
              <span className="relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-brand to-brand-dark text-2xl font-bold text-white shadow-lg shadow-brand/30">
                {(displayName || user.email || "?").charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="min-w-0">
              <p className="truncate text-lg font-bold text-ink">
                {displayName || "Add your name"}
              </p>
              <p className="truncate text-sm text-ink-soft/70">{user.email}</p>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            <div>
              <label className="text-xs font-bold tracking-wider text-ink-soft/60 uppercase">
                Display Name
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Your name"
                className="mt-1.5 w-full rounded-xl border border-stone/30 bg-cream-soft/50 px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-soft/50 transition focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/10"
              />
            </div>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className={`flex w-full items-center justify-center gap-2 rounded-full py-2.5 text-sm font-bold text-white transition active:scale-[0.98] disabled:opacity-60 ${
                saved 
                  ? "bg-green-500 hover:bg-green-600" 
                  : "bg-brand hover:bg-brand-dark hover:shadow-lg hover:shadow-brand/30"
              }`}
            >
              {saving ? (
                <>
                  <svg className="h-4 w-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Saving…
                </>
              ) : saved ? (
                <>
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                  Saved!
                </>
              ) : (
                "Save Changes"
              )}
            </button>
          </div>

          <button
            type="button"
            onClick={signOut}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-full border border-stone/30 py-2.5 text-sm font-bold text-ink-soft/70 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Log Out
          </button>
        </div>

        {/* ORDER HISTORY */}
        <div>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-ink">Your Orders</h1>
              <p className="mt-1 text-sm text-ink-soft">Everything you've ordered from CharBeast.</p>
            </div>
            {orders.length > 0 && (
              <span className="rounded-full bg-brand-soft px-3 py-1 text-xs font-bold text-brand">
                {orders.length} {orders.length === 1 ? 'order' : 'orders'}
              </span>
            )}
          </div>

          <div className="mt-6 flex flex-col gap-4">
            {ordersLoading ? (
              <div className="flex flex-col items-center gap-4 py-12">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand/20 border-t-brand" />
                <p className="text-sm text-ink-soft">Loading orders…</p>
              </div>
            ) : orders.length === 0 ? (
              <div className="flex flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-stone/30 py-16 text-center">
                <span className="text-5xl">🧾</span>
                <div>
                  <h3 className="text-lg font-bold text-ink">No orders yet</h3>
                  <p className="mt-1 text-sm text-ink-soft">Time to fire up the grill and place your first order!</p>
                </div>
                <button
                  type="button"
                  onClick={() => router.push("/#menu")}
                  className="mt-2 rounded-full bg-brand px-6 py-2.5 text-sm font-bold text-white transition hover:bg-brand-dark active:scale-95"
                >
                  Browse Menu
                </button>
              </div>
            ) : (
              orders.map((order) => (
                <div 
                  key={order.id} 
                  className="group rounded-2xl border border-stone/20 bg-white p-5 shadow-sm transition hover:shadow-md hover:border-brand/20"
                >
                  {/* Header */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold text-ink">
                        #{order.id.slice(-6).toUpperCase()}
                      </span>
                      <span className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase ${STATUS_PILL[order.status] || "bg-stone-soft text-ink-soft"}`}>
                        <span>{STATUS_ICON[order.status] || "📦"}</span>
                        {order.status}
                      </span>
                      {order.status === "Cancelled" && order.cancelReason && (
                        <span className="text-[10px] text-red-400 italic">— {order.cancelReason}</span>
                      )}
                    </div>
                    <span className="text-xs text-ink-soft/60">
                      {new Date(order.createdAt).toLocaleString([], { 
                        dateStyle: "medium",
                        timeStyle: "short" 
                      })}
                    </span>
                  </div>

                  {/* Items */}
                  <div className="mt-3 space-y-1 border-t border-stone/20 pt-3">
                    {order.items.map((item, i) => (
                      <div key={i} className="flex justify-between text-sm">
                        <span className="text-ink-soft/80">
                          <span className="font-medium text-ink-soft">{item.quantity}x</span> {item.name}
                        </span>
                        <span className="font-medium text-ink-soft">
                          {formatCurrency(item.unitPrice * item.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Footer */}
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-stone/20 pt-3">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-medium text-ink-soft/60 flex items-center gap-1">
                        <span>{order.orderType === "Delivery" ? "🚗" : "🏠"}</span>
                        {order.orderType}
                      </span>
                      {order.orderType === "Delivery" && order.deliveryAddress && (
                        <span className="text-xs text-ink-soft/40 truncate max-w-[150px]">
                          {order.deliveryAddress}
                        </span>
                      )}
                    </div>
                    <span className="text-base font-bold text-brand">
                      {formatCurrency(order.totalAmount)}
                    </span>
                  </div>

                  {/* Review */}
                  {order.status === "Completed" && (
                    <div className="mt-3 border-t border-stone/20 pt-3">
                      {myReviews[order.id] ? (
                        <div>
                          <div className="flex items-center gap-1 text-lg leading-none">
                            {[1, 2, 3, 4, 5].map((n) => (
                              <span key={n} className={n <= myReviews[order.id].rating ? "text-brand" : "text-stone-soft"}>★</span>
                            ))}
                          </div>
                          {myReviews[order.id].comment && (
                            <p className="mt-1 text-sm text-ink-soft/70">"{myReviews[order.id].comment}"</p>
                          )}
                        </div>
                      ) : reviewingOrderId === order.id ? (
                        <ReviewForm
                          order={order}
                          user={user}
                          onSubmitted={() => {
                            db.getMyReviews(user.id).then((reviews) => {
                              setMyReviews(Object.fromEntries(reviews.map((r) => [r.orderId, r])));
                            });
                            setReviewingOrderId(null);
                          }}
                        />
                      ) : (
                        <button
                          type="button"
                          onClick={() => setReviewingOrderId(order.id)}
                          className="rounded-full border border-stone/30 px-4 py-2 text-xs font-bold text-ink-soft transition hover:border-brand hover:text-brand"
                        >
                          Leave a Review
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </Container>
  );
}