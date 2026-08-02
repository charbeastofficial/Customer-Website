"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { supabase, setRememberMe } from "./supabase";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isMember, setIsMember] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) {
      setIsMember(false);
      return;
    }
    let cancelled = false;
    supabase
      .from("profiles")
      .select("is_member")
      .eq("id", user.id)
      .single()
      .then(({ data }) => {
        if (!cancelled) setIsMember(data?.is_member ?? false);
      });
    return () => {
      cancelled = true;
    };
  }, [user]);

  const signUp = async (email, password, displayName, phone) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { display_name: displayName, phone: phone || '' } },
    });
    if (error) throw error;
    // Supabase returns a 200 with no error for an already-registered email (to
    // avoid leaking which emails exist) but marks it with an empty identities
    // array -- that's the only way to detect the duplicate and tell the user.
    if (data?.user?.identities && data.user.identities.length === 0) {
      throw new Error("An account with this email already exists. Please log in instead.");
    }
    return data;
  };

  const signIn = async (email, password, remember = true) => {
    setRememberMe(remember);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const resetPassword = async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) throw error;
  };

  const updatePassword = async (newPassword) => {
    const { data, error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw error;
    setUser(data.user);
    return data.user;
  };

  const updateProfile = async ({ displayName, phone }) => {
    const { data, error } = await supabase.auth.updateUser({
      data: {
        ...(displayName !== undefined ? { display_name: displayName } : {}),
        ...(phone !== undefined ? { phone } : {}),
      },
    });
    if (error) throw error;
    setUser(data.user);
    return data.user;
  };

  return (
    <AuthContext.Provider value={{ user, loading, isMember, signUp, signIn, signOut, updateProfile, resetPassword, updatePassword }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
