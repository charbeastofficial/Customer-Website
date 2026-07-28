"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AuthCallback() {
  const router = useRouter();
  const [status, setStatus] = useState("verifying");

  useEffect(() => {
    const hash = window.location.hash;
    if (!hash || !hash.includes("access_token")) {
      setStatus("error");
      return;
    }

    const sub = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session) {
        setStatus("success");
        setTimeout(() => router.replace("/"), 2500);
        sub.data.subscription.unsubscribe();
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setStatus("success");
        setTimeout(() => router.replace("/"), 2500);
        sub.data.subscription.unsubscribe();
      }
    });

    const timeout = setTimeout(() => {
      if (status === "verifying") setStatus("error");
    }, 6000);

    return () => { clearTimeout(timeout); sub.data.subscription.unsubscribe(); };
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-cream-soft px-6">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 text-center shadow-lg ring-1 ring-stone/10">
        {status === "verifying" && (
          <>
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-brand/10">
              <svg className="h-8 w-8 animate-spin text-brand" fill="none" viewBox="0 0 24 24" strokeWidth="1.5"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
            </div>
            <h2 className="mt-5 text-xl font-bold text-ink">Verifying your email…</h2>
            <p className="mt-2 text-sm text-ink-soft">Please wait while we confirm your email address.</p>
          </>
        )}
        {status === "success" && (
          <>
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
            </div>
            <h2 className="mt-5 text-xl font-bold text-ink">Email verified!</h2>
            <p className="mt-2 text-sm text-ink-soft">Your account is now active. Redirecting…</p>
          </>
        )}
        {status === "error" && (
          <>
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
              <svg className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" strokeWidth="1.5"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
            </div>
            <h2 className="mt-5 text-xl font-bold text-ink">Verification failed</h2>
            <p className="mt-2 text-sm text-ink-soft">The confirmation link may be invalid or expired.</p>
            <button type="button" onClick={() => router.replace("/")} className="mt-5 rounded-full bg-brand px-6 py-2.5 text-sm font-bold text-white transition hover:bg-brand-dark active:scale-95">Go Home</button>
          </>
        )}
      </div>
    </div>
  );
}
