import { site } from "@/lib/seo";

export default function sitemap() {
  const base = site.url;

  return [
    { url: base, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${base}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/account`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
  ];
}
