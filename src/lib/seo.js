export const site = {
  name: "CharBeast",
  url: "https://charbeast.com",
  logo: "/logo.png",
  phone: "+15553473278",
  email: "charbeastofficial@gmail.com",
  address: {
    street: "42 Smokehouse Ave",
    city: "Grill Town",
    region: "GT",
    zip: "12345",
    country: "US",
  },
  hours: [
    { day: "Monday–Thursday", opens: "12:00", closes: "23:00" },
    { day: "Friday–Saturday", opens: "12:00", closes: "01:00" },
    { day: "Sunday", opens: "13:00", closes: "23:00" },
  ],
  social: {
    facebook: "https://facebook.com/charbeast",
    instagram: "https://instagram.com/charbeast",
    tiktok: "https://tiktok.com/@charbeast",
  },
};

const titleTemplate = (page) => (page ? `${page} — ${site.name}` : site.name);

export function buildMetadata({ title, description, path, ogImage } = {}) {
  const url = `${site.url}${path || ""}`;
  const resolvedTitle = titleTemplate(title);

  return {
    title: resolvedTitle,
    description,
    metadataBase: new URL(site.url),
    alternates: { canonical: url },
    openGraph: {
      title: resolvedTitle,
      description,
      url,
      siteName: site.name,
      locale: "en_GB",
      type: "website",
      ...(ogImage && { images: [{ url: ogImage, width: 1200, height: 630 }] }),
    },
    twitter: {
      card: "summary_large_image",
      title: resolvedTitle,
      description,
    },
    robots: { index: true, follow: true },
    icons: { icon: "/favicon.ico" },
  };
}
