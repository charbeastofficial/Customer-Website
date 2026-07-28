"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { supabase, setRememberMe } from "./supabase";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

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

  const signUp = async (email, password, displayName, phone) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { display_name: displayName, phone: phone || '' } },
    });
    if (error) throw error;
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
    <AuthContext.Provider value={{ user, loading, signUp, signIn, signOut, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
