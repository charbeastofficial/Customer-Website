"use client";

import { useState } from "react";
import Header from "./Header";
import Footer from "./Footer";
import CartDrawer from "./CartDrawer";
import AuthModal from "./AuthModal";

export default function SiteChrome({ taxRate, children }) {
  const [authOpen, setAuthOpen] = useState(false);

  return (
    <>
      <Header onAccountClick={() => setAuthOpen(true)} />
      <main className="flex-1">{children}</main>
      <Footer />
      <CartDrawer taxRate={taxRate ?? 0} onRequireLogin={() => setAuthOpen(true)} />
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </>
  );
}
