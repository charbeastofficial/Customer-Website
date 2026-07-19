"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";

export default function AuthModal({ open, onClose }) {
  const { signIn, signUp, signOut, user } = useAuth();
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [signedUp, setSignedUp] = useState(false);

  if (!open) return null;

  const reset = () => {
    setName("");
    setEmail("");
    setPassword("");
    setError("");
    setSignedUp(false);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (mode === "login") {
        await signIn(email, password);
        handleClose();
      } else {
        await signUp(email, password, name);
        setSignedUp(true);
      }
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (user) {
    return (
      <div className="fixed inset-0 z-[70] flex animate-[fadeIn_0.15s_ease-out] items-center justify-center bg-ink/60 p-4 backdrop-blur-sm" onClick={handleClose}>
        <div className="w-full max-w-sm rounded-3xl bg-white p-7 text-center shadow-2xl" onClick={(e) => e.stopPropagation()}>
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-soft text-2xl font-bold text-brand">
            {(user.user_metadata?.display_name || user.email || "?").charAt(0).toUpperCase()}
          </span>
          <h3 className="mt-4 text-lg font-bold text-ink">
            {user.user_metadata?.display_name || "Welcome back"}
          </h3>
          <p className="mt-1 text-sm text-ink-soft">{user.email}</p>
          <button
            type="button"
            onClick={async () => {
              await signOut();
              handleClose();
            }}
            className="mt-6 w-full rounded-full border border-stone py-3 text-sm font-bold text-ink transition hover:border-brand hover:text-brand"
          >
            Log Out
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[70] flex animate-[fadeIn_0.15s_ease-out] items-center justify-center bg-ink/60 p-4 backdrop-blur-sm" onClick={handleClose}>
      <div className="w-full max-w-sm rounded-3xl bg-white p-7 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        {signedUp ? (
          <div className="text-center">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-soft text-2xl">
              ✉️
            </span>
            <h3 className="mt-4 text-lg font-bold text-ink">Almost there</h3>
            <p className="mt-1 text-sm text-ink-soft">
              We've sent a confirmation link to <strong className="text-ink">{email}</strong>. Confirm it, then log
              in below.
            </p>
            <button
              type="button"
              onClick={() => {
                setSignedUp(false);
                setMode("login");
              }}
              className="mt-6 w-full rounded-full bg-brand py-3 text-sm font-bold text-white transition hover:bg-brand-dark"
            >
              Back to Log In
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-ink">{mode === "login" ? "Log In" : "Create Account"}</h3>
              <button
                type="button"
                onClick={handleClose}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-stone-soft text-ink transition hover:bg-stone"
              >
                ✕
              </button>
            </div>
            <p className="mt-1 text-sm text-ink-soft">
              {mode === "login" ? "Log in to place an order." : "Sign up to start ordering."}
            </p>

            <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-3">
              {mode === "signup" && (
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Full name"
                  className="rounded-xl border border-stone bg-cream-soft px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-soft/60 focus:border-brand focus:outline-none"
                />
              )}
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address"
                className="rounded-xl border border-stone bg-cream-soft px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-soft/60 focus:border-brand focus:outline-none"
              />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="rounded-xl border border-stone bg-cream-soft px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-soft/60 focus:border-brand focus:outline-none"
              />

              {error && <p className="text-sm font-medium text-brand">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="mt-1 flex w-full items-center justify-center rounded-full bg-brand py-3.5 text-sm font-bold text-white transition hover:bg-brand-dark active:scale-[0.98] disabled:opacity-60"
              >
                {loading ? "Please wait…" : mode === "login" ? "Log In" : "Sign Up"}
              </button>
            </form>

            <p className="mt-4 text-center text-sm text-ink-soft">
              {mode === "login" ? "New to CharBeast?" : "Already have an account?"}{" "}
              <button
                type="button"
                onClick={() => {
                  setMode(mode === "login" ? "signup" : "login");
                  setError("");
                }}
                className="font-bold text-brand"
              >
                {mode === "login" ? "Sign up" : "Log in"}
              </button>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
