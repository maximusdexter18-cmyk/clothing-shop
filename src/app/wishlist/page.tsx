"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Heart, ShoppingBag } from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { useWishlist } from "@/lib/wishlist-context";
import { useCart } from "@/lib/cart-context";

export default function WishlistPage() {
  const { wishlist, clearWishlist } = useWishlist();
  const { addToCart, setLoginRequired } = useCart();

  const handleAddToCart = (product: any) => {
    const size = product.sizes?.find((s: any) => s.is_available)?.size || null;
    addToCart(product, size);
  };

  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-transparent pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="font-display text-5xl md:text-7xl font-bold text-cream-100 drop-shadow-[0_4px_12px_rgba(0,0,0,0.6)] mb-4"
            >
              My Wishlist
            </motion.h1>
            <div className="gold-line w-24 mx-auto mb-4" />
            <p className="font-body text-sm text-cream-100/60 uppercase tracking-[0.2em]">
              {wishlist.length} Products Saved
            </p>
          </div>

          {/* Content */}
          {wishlist.length === 0 ? (
            <div className="text-center py-20">
              <Heart className="w-16 h-16 mx-auto text-cream-100/20 mb-4" />
              <h3 className="font-display text-2xl text-cream-100 mb-2">
                Your wishlist is empty
              </h3>
              <p className="font-body text-sm text-cream-100/60 mb-6">
                Save your favorite products to find them here.
              </p>
              <Link href="/shop" className="btn-luxury">
                Start Shopping
              </Link>
            </div>
          ) : (
            <>
              <div className="flex justify-end mb-6">
                <button
                  onClick={clearWishlist}
                  className="text-xs font-body text-cream-100/60 hover:text-red-500 transition-colors"
                >
                  Clear All
                </button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {wishlist.map((product, i) => (
                  <div key={product.id} className="relative">
                    <ProductCard product={product} index={i} variant="grid" />
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}