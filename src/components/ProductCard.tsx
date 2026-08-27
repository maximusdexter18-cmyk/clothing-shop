// src/components/ProductCard.tsx
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, X, ChevronLeft, ChevronRight, ShoppingBag } from "lucide-react";
import { Product } from "@/lib/types";
import { useCart } from "@/lib/cart-context";
import { useAuth } from "@/lib/auth-context";
import { useWishlist } from "@/lib/wishlist-context";

interface ProductCardProps {
  product: Product;
  index?: number;
  variant?: "full" | "grid";
}

export default function ProductCard({
  product,
  index = 0,
  variant = "grid",
}: ProductCardProps) {
  const { addToCart, items } = useCart();
  const { user } = useAuth(); // ADDED USER
  const { isInWishlist, toggleWishlist } = useWishlist();
  const [showModal, setShowModal] = useState(false);
  const [modalImage, setModalImage] = useState("");
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [fullBodyIndex, setFullBodyIndex] = useState(0);
  const [addedSuccess, setAddedSuccess] = useState(false);

  const isItemInBag = items.some((item) => item.product.id === product.id);
  const isWishlisted = isInWishlist(product.id);

  const fullBodyImages = product.images?.filter((img) => img.image_type === "full-body") || [];
  const smallImages = product.images?.filter((img) => img.image_type === "small") || [];
  const mockupImages = product.images?.filter((img) => img.image_type === "mockup") || [];

  const primaryImage =
    product.images?.find((img) => img.is_primary)?.image_url ||
    fullBodyImages[0]?.image_url ||
    product.images?.[0]?.image_url ||
    "/placeholder.png";

  const availableSizes = product.sizes?.filter((s) => s.is_available) || [];
  const isAnySizeAvailable = availableSizes.length > 0;
  const isOutOfStock = !isAnySizeAvailable;

  const brandName = product.brand?.name || "";

  const openModal = () => {
    setModalImage(smallImages[0]?.image_url || mockupImages[0]?.image_url || primaryImage);
    setSelectedSize(null);
    setShowModal(true);
  };

  const priceDisplay = (
    <div className="flex items-center space-x-3">
      {product.is_discounted && product.discount_price ? (
        <>
          <span className="price-strike font-body text-sm text-luxury-brown/40">
            ₹{product.original_price.toFixed(2)}
          </span>
          <span className="font-body text-base font-bold text-luxury-gold">
            ₹{product.discount_price.toFixed(2)}
          </span>
        </>
      ) : (
        <span className="font-body text-base font-bold text-luxury-brown">
          ₹{product.original_price.toFixed(2)}
        </span>
      )}
    </div>
  );

  const stockBadge = isOutOfStock ? (
    <span className="badge-out-of-stock text-[10px]">Out of Stock</span>
  ) : (
    <span className="badge-in-stock text-[10px]">In Stock</span>
  );

  const discountPercent =
    product.is_discounted && product.discount_price
      ? Math.round(((product.original_price - product.discount_price) / product.original_price) * 100)
      : 0;

  if (variant === "grid") {
    return (
      <>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.05 }}
          className="card-hover cursor-pointer bg-white rounded-md overflow-hidden shadow-sm border border-gray-100 flex flex-col h-full"
          onClick={openModal}
        >
          <div className="relative aspect-[3/4] overflow-hidden bg-cream-200 img-zoom">
            {fullBodyImages.length > 1 ? (
              <div className="w-full h-full flex overflow-x-auto snap-x snap-mandatory hide-scrollbar">
                {fullBodyImages.map((img, i) => (
                  <div key={img.id || i} className="w-full h-full flex-shrink-0 snap-center">
                    <img
                      src={img.image_url}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <img
                src={primaryImage}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            )}

            {product.is_discounted && discountPercent > 0 && (
              <div className="absolute top-2 left-2">
                <span className="bg-luxury-gold text-luxury-brown text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
                  {discountPercent}% OFF
                </span>
              </div>
            )}

            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleWishlist(product);
              }}
              className="absolute top-2 right-2 z-20 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-colors shadow-sm"
            >
              <Heart
                size={16}
                className={isWishlisted ? "text-red-500 fill-red-500" : "text-gray-500"}
              />
            </button>
          </div>

          <div className="p-2.5 flex flex-col justify-between flex-1 bg-white">
            <div>
              <p className="font-bold text-xs uppercase text-gray-900 tracking-wider mb-0.5 truncate">
                {brandName || "BRAND"}
              </p>
              <h4 className="font-body text-xs text-gray-700 font-normal line-clamp-2 leading-snug mb-1">
                {product.name}
              </h4>

              <div className="flex flex-wrap items-baseline gap-1 mt-1">
                <span className="text-base font-extrabold text-gray-900">
                  ₹{product.is_discounted && product.discount_price ? product.discount_price.toFixed(0) : product.original_price.toFixed(0)}
                </span>
                {product.is_discounted && product.discount_price && (
                  <>
                    <span className="text-xs text-gray-400 line-through">
                      M.R.P: ₹{product.original_price.toFixed(0)}
                    </span>
                    <span className="text-xs font-bold text-amber-700">
                      ({discountPercent}% off)
                    </span>
                  </>
                )}
              </div>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                if (!user) {
                  addToCart(product, null, primaryImage); // Triggers login modal
                  return;
                }
                const defaultSize = availableSizes[0]?.size || null;
                addToCart(product, defaultSize, primaryImage);
                setAddedSuccess(true);
                setTimeout(() => setAddedSuccess(false), 2000);
              }}
              disabled={isOutOfStock}
              className={`w-full mt-3 py-1.5 px-3 font-semibold text-xs rounded-full shadow-sm transition-all text-center ${
                isOutOfStock
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : user && (addedSuccess || isItemInBag)
                  ? "bg-emerald-600 text-white hover:bg-emerald-700"
                  : "bg-luxury-gold hover:bg-luxury-brown hover:text-white text-luxury-brown"
              }`}
            >
              {isOutOfStock
                ? "Out of Stock"
                : user && (addedSuccess || isItemInBag)
                ? "✓ Added to Bag"
                : "Add to Bag"}
            </button>
          </div>
        </motion.div>

        {showModal && (
          <ProductDetailModal
            product={product}
            modalImage={modalImage}
            setModalImage={setModalImage}
            selectedSize={selectedSize}
            setSelectedSize={setSelectedSize}
            onClose={() => setShowModal(false)}
          />
        )}
      </>
    );
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: index * 0.1 }}
        className="flex-shrink-0 w-[85vw] md:w-[60vw] lg:w-[45vw] snap-center"
      >
        <div className="relative group cursor-pointer" onClick={openModal}>
          <div className="relative aspect-[3/4] overflow-hidden rounded-sm bg-cream-200">
            {fullBodyImages.length > 1 ? (
              <div className="w-full h-full flex overflow-x-auto snap-x snap-mandatory hide-scrollbar">
                {fullBodyImages.map((img, i) => (
                  <div key={img.id || i} className="w-full h-full flex-shrink-0 snap-center">
                    <img
                      src={img.image_url}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <img
                src={primaryImage}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            )}

            <div className="absolute top-4 left-4">{stockBadge}</div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleWishlist(product);
              }}
              className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-colors shadow-sm"
            >
              <Heart
                size={16}
                className={isWishlisted ? "text-red-500 fill-red-500" : "text-gray-500"}
              />
            </button>

            {product.is_discounted && (
              <div className="absolute top-4 right-4">
                <span className="bg-luxury-gold text-white text-xs font-body px-3 py-1 rounded-full uppercase tracking-wider">
                  Sale
                </span>
              </div>
            )}

            <motion.div
              initial={false}
              animate={{ opacity: 0 }}
              whileHover={{ opacity: 1 }}
              className="absolute inset-0 gradient-overlay flex items-end p-6 md:p-8"
            >
              <button className="btn-luxury text-xs mb-2 w-full">Quick View</button>
            </motion.div>
          </div>

          <div className="mt-4 px-1">
            <p className="font-body text-[10px] uppercase tracking-[0.15em] text-luxury-brown/50 mb-1">
              {brandName}
            </p>
            <h3 className="font-display text-lg text-luxury-brown font-semibold truncate">
              {product.name}
            </h3>
            {priceDisplay}
          </div>
        </div>
      </motion.div>

      {showModal && (
        <ProductDetailModal
          product={product}
          modalImage={modalImage}
          setModalImage={setModalImage}
          selectedSize={selectedSize}
          setSelectedSize={setSelectedSize}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
}

interface DetailModalProps {
  product: Product;
  modalImage: string;
  setModalImage: (url: string) => void;
  selectedSize: string | null;
  setSelectedSize: (size: string | null) => void;
  onClose: () => void;
}

function ProductDetailModal({
  product,
  modalImage,
  setModalImage,
  selectedSize,
  setSelectedSize,
  onClose,
}: DetailModalProps) {
  const { addToCart, items } = useCart();
  const { user } = useAuth(); // ADDED USER
  const isItemInBag = items.some((item) => item.product.id === product.id);
  const smallImages = product.images?.filter((img) => img.image_type === "small") || [];
  const mockupImages = product.images?.filter((img) => img.image_type === "mockup") || [];
  const fullBodyImages = product.images?.filter((img) => img.image_type === "full-body") || [];
  const allImages = product.images || [];
  const primaryImage =
    product.images?.find((img) => img.is_primary)?.image_url ||
    fullBodyImages[0]?.image_url ||
    product.images?.[0]?.image_url ||
    "/placeholder.png";

  const availableSizes = product.sizes?.filter((s) => s.is_available) || [];
  const allSizes = product.sizes || [];
  const isOutOfStock = availableSizes.length === 0;

  const [activeTab, setActiveTab] = useState<"all" | "mockups">("all");

  const displayedThumbnails = activeTab === "mockups" ? (mockupImages.length > 0 ? mockupImages : allImages) : allImages;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-black/75 flex items-center justify-center p-2 md:p-4 overflow-x-hidden overflow-y-auto"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, y: 15 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 15 }}
        transition={{ duration: 0.25 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-cream-50 rounded-lg w-full max-w-sm sm:max-w-lg md:max-w-4xl max-h-[85vh] md:max-h-[90vh] overflow-y-auto overflow-x-hidden relative shadow-2xl my-auto"
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-20 w-7 h-7 md:w-8 md:h-8 bg-black/60 text-white rounded-full flex items-center justify-center hover:bg-black/80 transition-colors"
        >
          <X size={15} />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          <div className="p-3 md:p-6 flex flex-col items-center">
            <div className="relative aspect-[3/4] max-h-[220px] sm:max-h-[280px] md:max-h-[380px] w-auto rounded-md overflow-hidden bg-cream-200 mb-3 border border-cream-300 shadow-sm">
              <img
                src={modalImage || primaryImage}
                alt={product.name}
                className="w-full h-full object-contain bg-white"
              />
            </div>

            <div className="flex gap-2 mb-3">
              <button
                onClick={() => setActiveTab("all")}
                className={`px-3 py-1 text-[11px] font-bold rounded-full transition-colors ${
                  activeTab === "all"
                    ? "bg-luxury-brown text-cream-100"
                    : "bg-cream-200 text-luxury-brown/70 hover:bg-cream-300"
                }`}
              >
                All Pics ({allImages.length})
              </button>
              {mockupImages.length > 0 && (
                <button
                  onClick={() => setActiveTab("mockups")}
                  className={`px-3 py-1 text-[11px] font-bold rounded-full transition-colors ${
                    activeTab === "mockups"
                      ? "bg-luxury-brown text-cream-100"
                      : "bg-cream-200 text-luxury-brown/70 hover:bg-cream-300"
                  }`}
                >
                  Mockups ({mockupImages.length})
                </button>
              )}
            </div>

            <div className="w-full">
              <div className="grid grid-cols-5 md:grid-cols-4 gap-1.5 max-h-[110px] overflow-y-auto p-1">
                {displayedThumbnails.map((img) => (
                  <button
                    key={img.id}
                    onClick={() => setModalImage(img.image_url)}
                    className={`aspect-square rounded overflow-hidden border-2 transition-all bg-white ${
                      modalImage === img.image_url
                        ? "border-luxury-gold ring-1 ring-luxury-gold scale-95"
                        : "border-gray-200 opacity-70 hover:opacity-100"
                    }`}
                  >
                    <img src={img.image_url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="p-3 md:p-6 md:pl-0 flex flex-col justify-between">
            <div>
              <p className="font-body text-[10px] uppercase tracking-[0.2em] text-luxury-brown/50 mb-0.5">
                {product.brand?.name || "BRAND"}
              </p>
              <h2 className="font-display text-lg md:text-2xl font-bold text-luxury-brown mb-1 leading-snug">
                {product.name}
              </h2>
              <p className="font-body text-xs text-luxury-brown/70 mb-3 line-clamp-2">
                {product.description || "Premium quality clothing piece from our collection."}
              </p>

              <div className="flex items-center space-x-2 mb-4 flex-wrap gap-y-1">
                {product.is_discounted && product.discount_price ? (
                  <>
                    <span className="price-strike font-body text-xs md:text-sm text-luxury-brown/40">
                      ₹{product.original_price.toFixed(0)}
                    </span>
                    <span className="font-body text-lg md:text-xl font-bold text-luxury-gold">
                      ₹{product.discount_price.toFixed(0)}
                    </span>
                  </>
                ) : (
                  <span className="font-body text-lg md:text-xl font-bold text-luxury-brown">
                    ₹{product.original_price.toFixed(0)}
                  </span>
                )}

                {isOutOfStock ? (
                  <span className="bg-red-100 text-red-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    Out of Stock
                  </span>
                ) : (
                  <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    In Stock
                  </span>
                )}
              </div>

              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <p className="font-body text-[11px] uppercase tracking-wider text-luxury-brown/70 font-semibold">
                    Available Sizes:
                  </p>
                </div>
                {allSizes.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {allSizes.map((s) => (
                      <button
                        key={s.id}
                        disabled={!s.is_available}
                        onClick={() => setSelectedSize(selectedSize === s.size ? null : s.size)}
                        className={`px-3 py-1.5 rounded text-xs font-semibold border transition-all ${
                          !s.is_available
                            ? "bg-gray-100 text-gray-400 border-gray-200 line-through cursor-not-allowed opacity-50"
                            : selectedSize === s.size
                            ? "bg-luxury-brown text-cream-100 border-luxury-brown shadow-sm"
                            : "bg-white border-gray-300 text-luxury-brown hover:border-luxury-brown"
                        }`}
                      >
                        {s.size}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="font-body text-xs text-red-500">No sizes currently available.</p>
                )}
              </div>
            </div>

            <button
              disabled={!selectedSize || isOutOfStock}
              onClick={() => {
                if (!user) {
                  addToCart(product, null, primaryImage); // Triggers login modal
                  return;
                }
                if (!selectedSize) return;
                const activeImg = modalImage || primaryImage;
                addToCart(product, selectedSize, activeImg);
                onClose();
              }}
              className={`w-full py-2.5 text-xs font-bold uppercase tracking-wider rounded-full shadow-md transition-all mt-2 ${
                !selectedSize || isOutOfStock
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : user && isItemInBag
                  ? "bg-emerald-600 text-white hover:bg-emerald-700"
                  : "bg-luxury-gold text-luxury-brown hover:bg-luxury-brown hover:text-white"
              }`}
            >
              {!selectedSize
                ? "Select a Size"
                : user && isItemInBag
                ? `✓ Added (${selectedSize}) - Add More`
                : `Add to Bag - ${selectedSize}`}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}