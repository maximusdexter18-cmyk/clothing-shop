// src/components/ProductPopup.tsx
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ShoppingBag, Heart, Share2 } from "lucide-react";
import { Product } from "@/lib/types";
import { useCart } from "@/lib/cart-context";
import { useAuth } from "@/lib/auth-context";
import AuthModal from "./AuthModal";

interface ProductPopupProps {
  product: Product;
  onClose: () => void;
  centerImage?: string;
}

// ===== COLOR PALETTES (Darker, Classy, Luxurious) =====
const COLOR_PALETTES = {
  classy: [
    "#2C3E50", // Dark Slate Blue
    "#4A235A", // Deep Purple
    "#1B4F72", // Deep Navy
    "#145A32", // Forest Green
    "#6E2C00", // Deep Burnt Orange
    "#4A148C", // Rich Violet
    "#0E6251", // Deep Teal
    "#78281F", // Dark Maroon
    "#212F3D", // Charcoal Blue
    "#3E2723", // Dark Coffee Brown
  ],
};

export default function ProductPopup({
  product,
  onClose,
  centerImage,
}: ProductPopupProps) {
  const images = product.images || [];
  const { addToCart, items } = useCart();
  const { user } = useAuth();

  const defaultCenter =
    centerImage ||
    images.find((img) => img.is_primary)?.image_url ||
    images[0]?.image_url ||
    "/placeholder.png";

  const [mainImage, setMainImage] = useState(defaultCenter);
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"all" | "mockups">("all");
  const [addedSuccess, setAddedSuccess] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);

  // ===== AUTH MODAL STATE =====
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [pendingProduct, setPendingProduct] = useState<Product | null>(null);
  const [pendingSize, setPendingSize] = useState<string | null>(null);

  // ===== BACKGROUND COLOR STATE =====
  const [bgColor, setBgColor] = useState("#2C3E50");
  const [textColor, setTextColor] = useState("#FFFFFF"); // Always white for classy dark colors

  const isProductInBag = items.some((item) => item.product.id === product.id);

  const displayedImages =
    activeTab === "mockups"
      ? images.filter((img) => img.image_type === "mockup")
      : images;

  const availableSizes = product.sizes?.filter((s) => s.is_available) || [];
  const inStock = availableSizes.length > 0;
  const price = product.is_discounted && product.discount_price
    ? product.discount_price
    : product.original_price;
  const originalPrice = product.original_price;

  // ===== AUTO-CHANGING BACKGROUND COLORS =====
  useEffect(() => {
    const palette = COLOR_PALETTES.classy;
    const initialColor = palette[Math.floor(Math.random() * palette.length)];
    setBgColor(initialColor);
    setTextColor("#FFFFFF"); // Dark colors always get white text

    const interval = setInterval(() => {
      let newColor;
      do {
        newColor = palette[Math.floor(Math.random() * palette.length)];
      } while (newColor === bgColor);
      setBgColor(newColor);
      setTextColor("#FFFFFF");
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  // Prevent background scroll + escape to close
  useEffect(() => {
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  useEffect(() => {
    setMainImage(defaultCenter);
    setSelectedSize("");
    setActiveTab("all");
  }, [defaultCenter]);

  // ===== HANDLE ADD TO BAG WITH AUTH CHECK =====
  const handleAddToBag = () => {
    if (!inStock) return;

    // Check if user is logged in
    if (!user) {
      setPendingProduct(product);
      setPendingSize(selectedSize || null);
      setShowAuthModal(true);
      return;
    }

    // User is logged in - add to cart normally
    addToCart(product, selectedSize || null, mainImage);
    setAddedSuccess(true);
    setTimeout(() => setAddedSuccess(false), 2500);
  };

  // ===== HANDLE AUTH SUCCESS =====
  const handleAuthSuccess = () => {
    if (pendingProduct) {
      addToCart(pendingProduct, pendingSize || null, mainImage);
      setAddedSuccess(true);
      setTimeout(() => setAddedSuccess(false), 2500);
      setPendingProduct(null);
      setPendingSize(null);
    }
  };

  const thumbnailList = displayedImages.length > 0
    ? displayedImages.map((img, i) => (
        <button
          key={img.id || i}
          type="button"
          onClick={() => setMainImage(img.image_url)}
          className={`w-14 h-20 rounded-2xl overflow-hidden border-2 transition-all flex-shrink-0 ${
            mainImage === img.image_url
              ? "border-luxury-gold scale-95"
              : "border-white/20 opacity-70 hover:opacity-100"
          }`}
        >
          <img
            src={img.image_url}
            alt={`${product.name} ${i + 1}`}
            className="w-full h-full object-cover"
          />
        </button>
      ))
    : null;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4"
        onClick={onClose}
      >
        <div
          className="relative rounded-3xl w-full max-w-3xl max-h-[88vh] overflow-hidden shadow-2xl border border-white/20 flex flex-col"
          style={{
            backgroundColor: bgColor,
            transition: 'background-color 1.5s ease-in-out',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 z-50 w-10 h-10 bg-black/30 text-white rounded-full flex items-center justify-center hover:bg-black/50 transition-colors backdrop-blur-sm"
            aria-label="Close"
          >
            <X size={20} />
          </button>

          <div className="overflow-y-auto">
            <div className="flex flex-col md:flex-row">
              {/* LEFT - Image gallery */}
              <div className="md:w-1/2 p-5 sm:p-6 flex flex-col items-center sm:items-start">
                <div className="w-full aspect-[3/4] rounded-2xl overflow-hidden mb-4 shadow-lg bg-white/10">
                  <img
                    src={mainImage}
                    alt={product.name}
                    className="w-full h-full object-cover transition-opacity duration-500"
                  />
                </div>

                {thumbnailList && thumbnailList.length > 0 && (
                  <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar justify-center w-full">
                    {thumbnailList}
                  </div>
                )}

                <div className="flex gap-3 mt-4 w-full">
                  <button
                    type="button"
                    onClick={() => setActiveTab("all")}
                    className={`flex-1 rounded-2xl px-4 py-2 font-body text-xs uppercase tracking-wider transition-all ${
                      activeTab === "all"
                        ? "bg-white/20 text-white backdrop-blur-sm"
                        : "bg-black/20 text-white/70 hover:bg-black/30"
                    }`}
                  >
                    All Photos
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("mockups")}
                    className={`flex-1 rounded-2xl px-4 py-2 font-body text-xs uppercase tracking-wider transition-all ${
                      activeTab === "mockups"
                        ? "bg-white/20 text-white backdrop-blur-sm"
                        : "bg-black/20 text-white/70 hover:bg-black/30"
                    }`}
                  >
                    Mockups ({images.filter((i) => i.image_type === "mockup").length})
                  </button>
                </div>
              </div>

              {/* RIGHT - Product details */}
              <div className="md:w-1/2 p-5 sm:p-7 flex flex-col justify-center">
                <p 
                  className="font-body text-xs uppercase tracking-[0.3em] mb-2"
                  style={{ 
                    color: "rgba(255,255,255,0.6)" 
                  }}
                >
                  {product.brand?.name || "clothing shop"}
                </p>

                <h2 
                  className="font-display text-2xl sm:text-3xl font-bold leading-tight mb-6"
                  style={{ color: textColor }}
                >
                  {product.name}
                </h2>

                <div className="flex items-center gap-4 mb-5">
                  {product.is_discounted && product.discount_price ? (
                    <>
                      <span 
                        className="font-body text-sm line-through"
                        style={{ color: "rgba(255,255,255,0.5)" }}
                      >
                        ₹{originalPrice.toFixed(2)}
                      </span>
                      <span className="font-display text-2xl font-bold text-luxury-gold">
                        ₹{price.toFixed(2)}
                      </span>
                    </>
                  ) : (
                    <span className="font-display text-2xl font-bold" style={{ color: textColor }}>
                      ₹{price.toFixed(2)}
                    </span>
                  )}
                  <span
                    className={`ml-auto font-body text-xs font-bold px-3 py-1 rounded-full ${
                      inStock
                        ? "bg-emerald-500/20 text-emerald-300"
                        : "bg-red-500/20 text-red-300"
                    }`}
                  >
                    {inStock ? "In Stock" : "Out of Stock"}
                  </span>
                </div>

                <div className="w-full h-px bg-gradient-to-r from-luxury-gold/50 via-luxury-gold/20 to-transparent my-4" />

                {product.description && (
                  <p 
                    className="font-body text-sm leading-relaxed mb-5"
                    style={{ color: "rgba(255,255,255,0.8)" }}
                  >
                    {product.description}
                  </p>
                )}

                {inStock ? (
                  <div className="flex flex-wrap gap-3 mb-4">
                    <span 
                      className="w-full font-body text-[10px] uppercase tracking-[0.2em] mb-1"
                      style={{ color: "rgba(255,255,255,0.4)" }}
                    >
                      Select Size
                    </span>
                    {availableSizes.map((s) => (
                      <button
                        key={s.id || s.size}
                        type="button"
                        onClick={() => setSelectedSize(s.size)}
                        className={`rounded-xl px-4 py-2 font-body text-sm font-semibold transition-all ${
                          selectedSize === s.size
                            ? "bg-luxury-gold text-luxury-brown shadow-lg"
                            : "bg-white/20 text-white hover:bg-white/30"
                        }`}
                      >
                        {s.size}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="font-body text-sm text-red-300 mb-4">Out of stock</p>
                )}

                <div className="flex flex-col gap-3">
                  <button
                    type="button"
                    onClick={handleAddToBag}
                    disabled={!inStock}
                    className={`w-full rounded-3xl px-8 py-3.5 font-body text-sm font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                      !inStock
                        ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                        : addedSuccess || isProductInBag
                        ? "bg-emerald-600 text-white hover:bg-emerald-700"
                        : "bg-luxury-gold text-luxury-brown hover:bg-luxury-brown hover:text-cream-100"
                    }`}
                  >
                    <ShoppingBag size={16} />
                    {!inStock
                      ? "Out of Stock"
                      : addedSuccess || isProductInBag
                      ? "✓ Added to Bag"
                      : user
                      ? "Add to Bag"
                      : "Login to Add to Bag"}
                  </button>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setIsWishlisted(!isWishlisted)}
                      className={`flex-1 rounded-2xl px-4 py-2.5 font-body text-xs font-medium tracking-wider transition-all flex items-center justify-center gap-2 ${
                        isWishlisted
                          ? "bg-red-500/20 text-red-300"
                          : "bg-white/20 text-white/70 hover:bg-white/30"
                      }`}
                    >
                      <Heart size={14} className={isWishlisted ? "fill-red-300" : ""} />
                      {isWishlisted ? "Wishlisted" : "Wishlist"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (navigator.share) {
                          navigator.share({
                            title: product.name,
                            text: `Check out ${product.name}`,
                            url: window.location.href,
                          });
                        }
                      }}
                      className="flex-1 rounded-2xl px-4 py-2.5 bg-white/20 text-white/70 hover:bg-white/30 transition-all flex items-center justify-center gap-2"
                    >
                      <Share2 size={14} />
                      Share
                    </button>
                  </div>
                </div>

                {!user && (
                  <p className="mt-4 text-center font-body text-xs" style={{
                    color: "rgba(255,255,255,0.4)"
                  }}>
                    Login to save items to your cart and wishlist
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => {
          setShowAuthModal(false);
          setPendingProduct(null);
          setPendingSize(null);
        }}
        onSuccess={handleAuthSuccess}
      />
    </>
  );
}