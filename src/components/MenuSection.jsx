"use client";

import { useMemo, useState } from "react";
import Container from "./Container";
import Reveal from "./Reveal";
import Eyebrow from "./Eyebrow";
import ProductCard from "./ProductCard";
import ModifierModal from "./ModifierModal";

export default function MenuSection({ categories, products }) {
  const [activeCategory, setActiveCategory] = useState("all");
  const [customizeProduct, setCustomizeProduct] = useState(null);

  const topCategories = categories.filter((c) => !c.parentId);

  const filteredProducts = useMemo(() => {
    const childIds = categories.filter((c) => c.parentId === activeCategory).map((c) => c.id);

    return products.filter((p) => {
      return activeCategory === "all" || p.categoryID === activeCategory || childIds.includes(p.categoryID);
    });
  }, [products, categories, activeCategory]);

  const categoryOf = (product) => categories.find((c) => c.id === product.categoryID);

  return (
    <section id="menu" className="border-y border-stone-soft bg-cream-soft py-20 lg:py-28">
      <Container>
        <Reveal className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_460px] lg:items-end">
          <div>
            <h2 className="balance text-3xl font-bold text-ink sm:text-4xl">
              Our MENU
            </h2>
          </div>
          <p className="text-sm leading-relaxed text-ink-soft lg:text-right">
            From smash burgers to stone-baked pizza, everything on our menu is cooked fresh when you order it -
            no reheats, no shortcuts. Pick a category and build your order.
          </p>
        </Reveal>

        <div className="mt-12 flex gap-4 overflow-x-auto p-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <CategoryCard
            label="All Dishes"
            icon="🍽️"
            active={activeCategory === "all"}
            onClick={() => setActiveCategory("all")}
            style={{ animationDelay: "0ms" }}
          />
          {topCategories.map((cat, i) => (
            <CategoryCard
              key={cat.id}
              label={cat.name}
              icon={cat.icon}
              image={cat.imageURL}
              active={activeCategory === cat.id}
              onClick={() => setActiveCategory(cat.id)}
              style={{ animationDelay: `${(i + 1) * 50}ms` }}
            />
          ))}
        </div>

        {filteredProducts.length === 0 ? (
          <div className="mt-16 flex flex-col items-center gap-2 rounded-3xl border border-dashed border-stone py-20 text-center text-ink-soft">
            <span className="text-3xl">🔍</span>
            No dishes in this category right now.
          </div>
        ) : (
          <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {filteredProducts.map((product, i) => (
              <ProductCard
                key={product.id}
                product={product}
                category={categoryOf(product)}
                onCustomize={setCustomizeProduct}
                style={{ animationDelay: `${Math.min(i, 16) * 30}ms` }}
              />
            ))}
          </div>
        )}
      </Container>

      <ModifierModal product={customizeProduct} onClose={() => setCustomizeProduct(null)} />
    </section>
  );
}

function CategoryCard({ label, icon, image, active, onClick, style }) {
  const [broken, setBroken] = useState(false);
  
  return (
    <button
      type="button"
      onClick={onClick}
      style={style}
      className="group relative flex w-24 shrink-0 animate-[fadeUp_0.45s_ease-out_backwards] flex-col items-center gap-3 text-center transition-all duration-300 hover:-translate-y-1"
    >
      {/* Glow effect when active */}
      {active && (
        <div className="absolute -inset-2 rounded-full bg-brand/10 blur-xl opacity-60" />
      )}
      
      {/* Icon/Image Container */}
      <div className="relative">
        <span
          className={`relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl text-3xl shadow-sm transition-all duration-300 ${
            active
              ? "scale-110 bg-gradient-to-br from-brand to-brand/80 text-white shadow-[0_12px_32px_-12px_rgba(251,74,54,0.5)] ring-2 ring-brand/20 ring-offset-2 ring-offset-cream-soft"
              : "bg-white/80 backdrop-blur-sm ring-1 ring-stone/20 hover:scale-105 hover:shadow-md hover:ring-brand/30 group-hover:bg-white"
          }`}
        >
          {image && !broken ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img 
              src={image} 
              alt="" 
              className={`h-full w-full object-cover transition-transform duration-500 ${
                active ? "scale-110" : "group-hover:scale-105"
              }`}
              onError={() => setBroken(true)} 
            />
          ) : (
            <span className="transition-transform duration-300 group-hover:scale-110">
              {icon}
            </span>
          )}
        </span>
        
      
      </div>
      
      {/* Label */}
      <div className="relative">
        <span className={`text-sm font-bold leading-tight transition-colors duration-300 ${
          active ? "text-brand" : "text-ink-soft group-hover:text-ink"
        }`}>
          {label}
        </span>
        
        {/* Underline animation */}
        <span className={`absolute -bottom-1 left-0 h-0.5 rounded-full bg-brand transition-all duration-300 ${
          active ? "w-full" : "w-0 group-hover:w-1/2"
        }`} />
      </div>
    </button>
  );
}