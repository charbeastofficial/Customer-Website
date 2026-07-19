import { db } from "@/lib/db";
import HomeView from "@/components/HomeView";

export const revalidate = 0;

export default async function Home() {
  const [categories, products, deals, siteSettings, heroImages, reviews] = await Promise.all([
    db.getCategories(),
    db.getProducts(),
    db.getDeals(),
    db.getSiteSettings(),
    db.getHeroImages(),
    // Falls back to [] until the reviews migration has been applied.
    db.getReviews().catch(() => []),
  ]);

  const images = heroImages.length > 0 ? heroImages.map((h) => h.imageURL) : [siteSettings.heroImageUrl].filter(Boolean);

  return (
    <HomeView
      categories={categories}
      products={products}
      deals={deals}
      reviews={reviews}
      taxRate={siteSettings.taxRate}
      heroMode={siteSettings.heroMode}
      heroImages={images}
      heroTitle={siteSettings.heroTitle}
      heroSubtitle={siteSettings.heroSubtitle}
      heroDescription={siteSettings.heroDescription}
    />
  );
}
