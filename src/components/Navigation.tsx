// src/components/Navigation.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ShoppingBag, User, Search, ArrowLeft, Home, Heart } from "lucide-react";
import { ShopInfo } from "@/lib/types";
import { useCart } from "@/lib/cart-context";
import { useAuth } from "@/lib/auth-context";
import { useWishlist } from "@/lib/wishlist-context";
import CartDrawer from "@/components/CartDrawer";
import AuthModal from "@/components/AuthModal";
import SearchModal from "@/components/SearchModal";

interface NavProps {
  shopInfo?: ShopInfo | null;
  showBack?: boolean;
}

export default function Navigation({ shopInfo, showBack = false }: NavProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { totalCount, setIsOpen, loginRequired, setLoginRequired } = useCart();
  const { user } = useAuth();
  const { wishlistCount } = useWishlist();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (loginRequired) {
      setAuthOpen(true);
      setLoginRequired(false);
    }
  }, [loginRequired, setLoginRequired]);

  const isHomepage = pathname === "/";
  const isWishlist = pathname === "/wishlist";

  const navLinks = [
    { label: "SHOP", href: "/shop" },
    { label: "MEN", href: "/category/men" },
    { label: "WOMEN", href: "/category/women" },
    { label: "KIDS", href: "/category/kids" },
    { label: "NEW ARRIVALS", href: "/new-arrivals" },
  ];

  const handleAuthClick = () => {
    setAuthOpen(true);
  };

  return (
    <>
      {/* Top bar - DARK GRADIENT + BLUR (Same as Filter Bar) */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
        className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-black/70 to-black/40 backdrop-blur-md border-b border-white/10"
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-8 h-20 flex items-center justify-between">
          
          {/* Left Side: Back button (Wishlist only) + Brand Logo */}
          <div className="flex items-center gap-3 lg:gap-5">
            {isWishlist && (
              <button
                onClick={() => router.back()}
                className="p-2 rounded-full transition-all bg-black/30 text-white hover:bg-black/50 backdrop-blur-md border border-white/20"
                title="Go back"
                aria-label="Go back"
              >
                <ArrowLeft size={18} />
              </button>
            )}

            <Link href="/" className="flex flex-col">
              <span className="font-display text-3xl lg:text-4xl font-extrabold tracking-wider text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
                {shopInfo?.shop_name || "OG WEAR"}
              </span>
            </Link>
          </div>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center space-x-10">
            {navLinks.map((link, i) => (
              <Link
                key={link.label}
                href={link.href}
                className="relative text-xs font-body uppercase tracking-[0.15em] text-white/90 hover:text-luxury-gold group transition-colors duration-500 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
              >
                {link.label}
                <span className="absolute -bottom-1 left-0 w-0 h-px bg-luxury-gold group-hover:w-full transition-all duration-300" />
              </Link>
            ))}
          </div>

          {/* Right section - Gradient Buttons */}
          <div className="flex items-center gap-3">
            {/* HOME BUTTON - Only visible when NOT on homepage */}
            {!isHomepage && (
              <Link
                href="/"
                className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-gradient-to-r from-black/40 to-black/20 text-white hover:text-luxury-gold backdrop-blur-md border border-white/20 transition-all duration-500"
                aria-label="Go to Homepage"
                title="Home"
              >
                <Home size={18} />
                <span className="hidden sm:inline text-xs font-body uppercase tracking-wider">
                  Home
                </span>
              </Link>
            )}

            {/* Search */}
            <button
              onClick={() => setSearchOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-gradient-to-r from-black/40 to-black/20 text-white hover:text-luxury-gold backdrop-blur-md border border-white/20 transition-all duration-500"
              aria-label="Search"
              title="Search products"
            >
              <Search size={18} />
              <span className="hidden sm:inline text-xs font-body uppercase tracking-wider">
                Search
              </span>
            </button>

            {/* WISHLIST HEART BUTTON */}
            <Link
              href="/wishlist"
              className="relative p-2.5 rounded-full bg-gradient-to-r from-black/40 to-black/20 text-white hover:text-luxury-gold backdrop-blur-md border border-white/20 transition-all duration-500"
              aria-label="Wishlist"
              title="Wishlist"
            >
              <Heart size={18} />
              {mounted && wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-luxury-gold text-luxury-brown rounded-full w-4 h-4 flex items-center justify-center text-[9px] font-bold">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Account */}
            <button
              onClick={handleAuthClick}
              className="relative p-2.5 rounded-full bg-gradient-to-r from-black/40 to-black/20 text-white hover:text-luxury-gold backdrop-blur-md border border-white/20 transition-all duration-500"
              aria-label={user ? "Account" : "Sign in"}
            >
              <User size={18} />
              {mounted && user && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-luxury-gold rounded-full border-2 border-black/50" />
              )}
            </button>

            {/* Cart */}
            <button
              onClick={() => setIsOpen(true)}
              className="relative p-2.5 rounded-full bg-gradient-to-r from-black/40 to-black/20 text-white hover:text-luxury-gold backdrop-blur-md border border-white/20 transition-all duration-500"
              aria-label="Open cart"
            >
              <ShoppingBag size={20} />
              {mounted && totalCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-luxury-gold text-luxury-brown rounded-full w-4 h-4 flex items-center justify-center text-[9px] font-bold">
                  {totalCount}
                </span>
              )}
            </button>

            {/* Mobile Menu */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2.5 rounded-full bg-gradient-to-r from-black/40 to-black/20 text-white hover:text-luxury-gold backdrop-blur-md border border-white/20 transition-all duration-500"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </motion.div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/80 backdrop-blur-xl lg:hidden pt-20"
          >
            <div className="flex flex-col items-center justify-center h-full space-y-8">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="font-display text-3xl text-white hover:text-luxury-gold transition-colors drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
                >
                  {link.label}
                </Link>
              ))}
              <div className="gold-line w-20 mx-0 my-8" />
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setAuthOpen(true);
                }}
                className="font-body text-xs uppercase tracking-[0.2em] text-white border border-white/30 px-6 py-3 hover:border-luxury-gold hover:text-luxury-gold transition-all"
              >
                {user ? "My Account" : "Sign In / Sign Up"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Auth Modal */}
      <AuthModal 
        isOpen={authOpen} 
        onClose={() => setAuthOpen(false)} 
      />

      {/* Search Modal */}
      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />

      {/* Cart Drawer */}
      <CartDrawer />
    </>
  );
}