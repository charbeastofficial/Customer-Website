"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";

function CloseIcon({ className }) {
  return (
    <svg className={className} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function MailIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}

function EyeIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a20.3 20.3 0 0 1 4.22-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a20.4 20.4 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

export default function AuthModal({ open, onClose }) {
  const { signIn, signUp, signOut, user } = useAuth();
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [signedUp, setSignedUp] = useState(false);

  const reset = () => {
    setName("");
    setEmail("");
    setPhone("");
    setPassword("");
    setShowPassword(false);
    setRememberMe(true);
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
        await signIn(email, password, rememberMe);
        handleClose();
      } else {
        await signUp(email, password, name, phone);
        setSignedUp(true);
      }
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (!open) return null;

  if (user) {
    return (
      <div className="fixed inset-0 z-[70] flex animate-[fadeIn_0.15s_ease-out] items-center justify-center bg-ink/60 p-4 backdrop-blur-sm" onClick={handleClose}>
        <div role="dialog" aria-modal="true" aria-labelledby="auth-modal-account-title" className="w-full max-w-sm rounded-3xl bg-white p-7 text-center shadow-2xl" onClick={(e) => e.stopPropagation()}>
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-soft text-2xl font-bold text-brand">
            {(user.user_metadata?.display_name || user.email || "?").charAt(0).toUpperCase()}
          </span>
          <h3 id="auth-modal-account-title" className="mt-4 text-lg font-bold text-ink">
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
      <div role="dialog" aria-modal="true" aria-labelledby={signedUp ? "auth-modal-confirm-title" : "auth-modal-form-title"} className="w-full max-w-sm rounded-3xl bg-white p-7 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        {signedUp ? (
          <div className="text-center">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-soft text-brand">
              <MailIcon className="h-6 w-6" />
            </span>
            <h3 id="auth-modal-confirm-title" className="mt-4 text-lg font-bold text-ink">Almost there</h3>
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
              <h3 id="auth-modal-form-title" className="text-lg font-bold text-ink">{mode === "login" ? "Log In" : "Create Account"}</h3>
              <button
                type="button"
                aria-label="Close"
                onClick={handleClose}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-stone-soft text-ink transition hover:bg-stone"
              >
                <CloseIcon />
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
              {mode === "signup" && (
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Phone number"
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
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full rounded-xl border border-stone bg-cream-soft px-3.5 py-2.5 pr-10 text-sm text-ink placeholder:text-ink-soft/60 focus:border-brand focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  aria-pressed={showPassword}
                  className="absolute top-1/2 right-3 -translate-y-1/2 text-ink-soft/60 transition hover:text-ink"
                >
                  {showPassword ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                </button>
              </div>

              {mode === "login" && (
                <label className="flex cursor-pointer items-center gap-2.5 py-1">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 rounded border-stone text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                  />
                  <span className="text-sm text-ink-soft">Remember me</span>
                </label>
              )}

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
