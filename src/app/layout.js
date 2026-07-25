import { Lexend, Bebas_Neue, Anton } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/lib/cart-context";
import { AuthProvider } from "@/lib/auth-context";
import SplashScreen from "@/components/SplashScreen";
import { ToastProvider } from "@/components/Toast";
import JsonLd from "@/components/JsonLd";
import { buildMetadata } from "@/lib/seo";

const bebasNeue = Bebas_Neue({
  variable: "--font-bebas",
  subsets: ["latin"],
  weight: "400",
});

const anton = Anton({
  variable: "--font-anton",
  subsets: ["latin"],
  weight: "400",
});

const lexend = Lexend({
  variable: "--font-lexend",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata = buildMetadata({
  description:
    "Flame-grilled burgers, crispy fried chicken, stone-baked pizza, and more — order online for delivery or takeaway from CharBeast.",
});

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${bebasNeue.variable} ${anton.variable} ${lexend.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-cream text-ink font-sans">
        <JsonLd />
        <AuthProvider>
          <CartProvider>
            <ToastProvider>
              <SplashScreen>{children}</SplashScreen>
            </ToastProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
