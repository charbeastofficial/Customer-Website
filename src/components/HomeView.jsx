"use client";

import { useState } from "react";
import Header from "./Header";
import Hero from "./Hero";
import DealsSection from "./DealsSection";
import MenuSection from "./MenuSection";
import TestimonialsSection from "./TestimonialsSection";
import Footer from "./Footer";
import CartDrawer from "./CartDrawer";
import AuthModal from "./AuthModal";

export default function HomeView({
  categories,
  products,
  deals,
  reviews,
  taxRate,
  heroMode,
  heroImages,
  heroTitle,
  heroSubtitle,
  heroDescription,
}) {
  const [authOpen, setAuthOpen] = useState(false);

  return (
    <>
      <Header onAccountClick={() => setAuthOpen(true)} />
      <main>
        <Hero
          heroMode={heroMode}
          heroImages={heroImages}
          heroTitle={heroTitle}
          heroSubtitle={heroSubtitle}
          heroDescription={heroDescription}
        />
        <DealsSection deals={deals} products={products} />
        <MenuSection categories={categories} products={products} />
       
      </main>
      <Footer />
      <CartDrawer taxRate={taxRate} onRequireLogin={() => setAuthOpen(true)} />
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </>
  );
}
