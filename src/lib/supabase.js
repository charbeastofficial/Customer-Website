import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY. Copy customer-website/.env.example to .env.local and fill in your Supabase project credentials."
  );
}

const REMEMBER_KEY = "charbeast_remember_me";

// "Remember me" toggles where the session itself is kept: localStorage
// (survives closing the browser) when checked, sessionStorage (cleared when
// the tab/browser closes) when not. The choice flag always lives in
// localStorage -- it's not sensitive, and a returning tab needs a stable
// place to look up which storage to check. Defaults to remembered so
// existing logged-in sessions (from before this flag existed) aren't lost.
// This module also loads on the server (db.js is used from RSCs), so every
// storage access is guarded -- window/localStorage don't exist in Node.
function isRemembered() {
  if (typeof window === "undefined") return true;
  try {
    return window.localStorage.getItem(REMEMBER_KEY) !== "0";
  } catch {
    return true;
  }
}

export function setRememberMe(remember) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(REMEMBER_KEY, remember ? "1" : "0");
  } catch {
    // private browsing etc. -- falls back to always-remembered this tab
  }
}

function activeStorage() {
  if (typeof window === "undefined") return null;
  return isRemembered() ? window.localStorage : window.sessionStorage;
}

const dynamicStorage = {
  getItem: (key) => activeStorage()?.getItem(key) ?? null,
  setItem: (key, value) => activeStorage()?.setItem(key, value),
  removeItem: (key) => activeStorage()?.removeItem(key),
};

export const supabase = createClient(
  supabaseUrl || "https://placeholder.supabase.co",
  supabaseAnonKey || "placeholder-key",
  { auth: { storage: dynamicStorage } }
);
