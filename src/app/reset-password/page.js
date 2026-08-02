"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth-context";

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

export default function ResetPasswordPage() {
  const router = useRouter();
  const { updatePassword } = useAuth();
  const [status, setStatus] = useState("verifying");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Supabase sends recovery links in one of two formats depending on the
    // project's auth flow setting: a #access_token hash (implicit flow) or a
    // ?code= query param (PKCE) -- handle both instead of assuming one.
    const hash = window.location.hash;
    const code = new URL(window.location.href).searchParams.get("code");
    const hasHashToken = hash && hash.includes("access_token");

    if (!hasHashToken && !code) {
      setStatus("error");
      return;
    }

    let cancelled = false;

    const sub = supabase.auth.onAuthStateChange((event, session) => {
      if ((event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") && session) {
        if (!cancelled) setStatus("ready");
        sub.data.subscription.unsubscribe();
      }
    });

    (async () => {
      if (code) {
        const { data, error } = await supabase.auth.exchangeCodeForSession(code);
        if (cancelled) return;
        if (data?.session) setStatus((s) => (s === "verifying" ? "ready" : s));
        else if (error) setStatus((s) => (s === "verifying" ? "error" : s));
        return;
      }
      const { data: { session } } = await supabase.auth.getSession();
      if (!cancelled && session) {
        setStatus((s) => (s === "verifying" ? "ready" : s));
      }
    })();

    const timeout = setTimeout(() => {
      if (!cancelled) setStatus((s) => (s === "verifying" ? "error" : s));
    }, 6000);

    return () => {
      cancelled = true;
      clearTimeout(timeout);
      sub.data.subscription.unsubscribe();
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }
    setSaving(true);
    try {
      await updatePassword(password);
      setStatus("success");
      setTimeout(() => router.replace("/"), 2500);
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-cream-soft px-6">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 text-center shadow-lg ring-1 ring-stone/10">
        {status === "verifying" && (
          <>
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-brand/10">
              <svg className="h-8 w-8 animate-spin text-brand" fill="none" viewBox="0 0 24 24" strokeWidth="1.5"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
            </div>
            <h2 className="mt-5 text-xl font-bold text-ink">Verifying your link…</h2>
            <p className="mt-2 text-sm text-ink-soft">Please wait while we confirm your reset link.</p>
          </>
        )}

        {status === "ready" && (
          <>
            <h2 className="text-xl font-bold text-ink">Choose a new password</h2>
            <p className="mt-2 text-sm text-ink-soft">Enter and confirm your new password below.</p>
            <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-3 text-left">
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="New password"
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
              <input
                type={showPassword ? "text" : "password"}
                required
                minLength={6}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                className="rounded-xl border border-stone bg-cream-soft px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-soft/60 focus:border-brand focus:outline-none"
              />
              {error && <p className="text-sm font-medium text-brand">{error}</p>}
              <button
                type="submit"
                disabled={saving}
                className="mt-1 flex w-full items-center justify-center rounded-full bg-brand py-3.5 text-sm font-bold text-white transition hover:bg-brand-dark active:scale-[0.98] disabled:opacity-60"
              >
                {saving ? "Saving…" : "Save New Password"}
              </button>
            </form>
          </>
        )}

        {status === "success" && (
          <>
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
            </div>
            <h2 className="mt-5 text-xl font-bold text-ink">Password updated!</h2>
            <p className="mt-2 text-sm text-ink-soft">You're all set. Redirecting you home…</p>
          </>
        )}

        {status === "error" && (
          <>
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
              <svg className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" strokeWidth="1.5"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
            </div>
            <h2 className="mt-5 text-xl font-bold text-ink">Link expired</h2>
            <p className="mt-2 text-sm text-ink-soft">This reset link is invalid or has expired. Please request a new one.</p>
            <button type="button" onClick={() => router.replace("/")} className="mt-5 rounded-full bg-brand px-6 py-2.5 text-sm font-bold text-white transition hover:bg-brand-dark active:scale-95">Go Home</button>
          </>
        )}
      </div>
    </div>
  );
}
