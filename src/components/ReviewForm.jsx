"use client";

import { useState } from "react";
import { db } from "@/lib/db";

export default function ReviewForm({ order, user, onSubmitted }) {
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
