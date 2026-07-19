import { db } from "@/lib/db";
import SiteChrome from "@/components/SiteChrome";
import AccountView from "@/components/AccountView";

export const revalidate = 0;

import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Your Account",
  description: "View your order history, track deliveries, and manage your CharBeast account settings.",
  path: "/account",
});

export default async function AccountPage() {
  const siteSettings = await db.getSiteSettings();

  return (
    <SiteChrome taxRate={siteSettings.taxRate}>
      <AccountView />
    </SiteChrome>
  );
}
