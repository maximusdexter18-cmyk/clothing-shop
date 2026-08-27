import type { Metadata } from "next";
import { Playfair_Display, Cormorant_Garamond } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import { CartProvider } from "@/lib/cart-context";
import SmoothScroll from "@/components/SmoothScroll";
import BackgroundVideo from "@/components/BackgroundVideo";
import PageTransition from "@/components/PageTransition";
import { WishlistProvider } from "@/lib/wishlist-context";
import { cn } from "@/lib/utils";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
  weight: ["400", "500", "600", "700", "800", "900"],
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-cormorant",
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "OG wear - Redefining Fashion",
  description:
    "Discover the latest trends in luxury fashion. Premium clothing collections for Men, Women, and Kids.",
  keywords: [
    "fashion",
    "luxury clothing",
    "men wear",
    "women wear",
    "kids wear",
    "premium fashion",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={cn(playfair.variable, cormorant.variable, "font-sans")}>
      <body className="font-body bg-cream-50 text-luxury-black min-h-screen">
        {/* GLOBAL BACKGROUND VIDEO FOR ALL PAGES */}
        <BackgroundVideo videoSrc="/fashion.mp4" posterSrc="/fallback.jpg" />

        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <SmoothScroll>
                <PageTransition />
                {children}
              </SmoothScroll>
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}