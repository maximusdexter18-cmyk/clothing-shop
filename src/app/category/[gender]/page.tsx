"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag } from "lucide-react";
import { useParams } from "next/navigation";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import ProductPopup from "@/components/ProductPopup";
import LoadingScreen from "@/components/LoadingScreen"; // ADDED THE LOADER
import { supabase } from "@/lib/supabase";
import { Product, ShopInfo, SocialMedia, CATEGORIES, MAJOR_BRANDS } from "@/lib/types";
import { useCart } from "@/lib/cart-context";
import { useAuth } from "@/lib/auth-context";

export default function CategoryPage() {
  const { gender: rawGender } = useParams();
  const gender = Array.isArray(rawGender) ? rawGender[0] : rawGender;
  const { addToCart, items, removeFromCartByProductId } = useCart();
  const { user } = useAuth();

  const [products, setProducts] = useState<Product[]>([]);
  const [shopInfo, setShopInfo] = useState<ShopInfo | null>(null);
  const [socialMedia, setSocialMedia] = useState<SocialMedia[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [availability, setAvailability] = useState<"all" | "in-stock" | "out-of-stock">("all");
  const [sortBy, setSortBy] = useState<"newest" | "price-low" | "price-high">("newest");
  const [showFilters, setShowFilters] = useState(false);
  const [openFilterSections, setOpenFilterSections] = useState<Record<string, boolean>>({
    category: true,
    brand: true,
    availability: true,
  });

  // Product Popup State
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | undefined>();
  const [addedSuccessId, setAddedSuccessId] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, [gender]);

  const fetchData = async () => {
    try {
      const [productsRes, shopRes, socialRes] = await Promise.all([
        supabase
          .from("products")
          .select("*, brand:brands(*), images:product_images(*), sizes:product_sizes(*)")
          .eq("is_active", true)
          .eq("gender", gender)
          .order("created_at", { ascending: false }),
        supabase.from("shop_info").select("*").limit(1).single(),
        supabase.from("social_media").select("*").order("display_order"),
      ]);
      setProducts(productsRes.data || []);
      setShopInfo(shopRes.data);
      setSocialMedia(socialRes.data || []);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const availableBrands = useMemo(() => {
    const brandNames = new Set(products.map((p) => p.brand?.name).filter(Boolean));
    return MAJOR_BRANDS.filter((b) => brandNames.has(b));
  }, [products]);

  const categories = CATEGORIES[gender as keyof typeof CATEGORIES] || [];
  const genderTitle = gender ? gender.charAt(0).toUpperCase() + gender.slice(1) : "";

  const filteredProducts = useMemo(() => {
    let filtered = [...products];
    if (selectedCategory) filtered = filtered.filter((p) => p.category === selectedCategory);
    if (selectedBrand) filtered = filtered.filter((p) => p.brand?.name === selectedBrand);
    if (availability === "in-stock") filtered = filtered.filter((p) => p.sizes?.some((s) => s.is_available));
    else if (availability === "out-of-stock") filtered = filtered.filter((p) => !p.sizes?.some((s) => s.is_available));

    if (sortBy === "price-low") filtered.sort((a, b) => {
      const pa = a.is_discounted && a.discount_price ? a.discount_price : a.original_price;
      const pb = b.is_discounted && b.discount_price ? b.discount_price : b.original_price;
      return pa - pb;
    });
    else if (sortBy === "price-high") filtered.sort((a, b) => {
      const pa = a.is_discounted && a.discount_price ? a.discount_price : a.original_price;
      const pb = b.is_discounted && b.discount_price ? b.discount_price : b.original_price;
      return pb - pa;
    });
    return filtered;
  }, [products, selectedCategory, selectedBrand, availability, sortBy]);

  const clearFilters = () => {
    setSelectedCategory(null);
    setSelectedBrand(null);
    setAvailability("all");
    setSortBy("newest");
  };

  return (
    <>
      {/* LOADING SCREEN - SHOWS ON THIS PAGE TOO! */}
      {loading && <LoadingScreen />}

      <Navigation shopInfo={shopInfo} showBack />
      <main className="min-h-screen bg-transparent pt-32">
        
        {/* Header */}
        <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center mb-4">
          <h1 className="font-display text-5xl md:text-7xl font-bold text-cream-100 drop-shadow-[0_4px_12px_rgba(0,0,0,0.6)]">
            {genderTitle}
          </h1>
          <div className="gold-line w-24 mx-auto mt-4" />
          <p className="font-body text-sm text-cream-100/60 uppercase tracking-[0.2em] mt-2">
            {filteredProducts.length} Products
          </p>
        </div>

        {/* Selected Filters Bar */}
        {(selectedCategory || selectedBrand || availability !== "all") && (
          <div className="max-w-7xl mx-auto px-6 lg:px-8 mb-4">
            <div className="flex flex-wrap items-center gap-2 justify-center">
              <span className="font-body text-xs text-cream-100/60 uppercase tracking-wider">Filters:</span>
              {selectedCategory && (
                <button onClick={() => setSelectedCategory(null)} className="flex items-center gap-1 px-3 py-1 bg-luxury-gold text-luxury-brown rounded-full text-xs font-bold hover:bg-white/80 transition-all">
                  {selectedCategory} <span className="text-xs">×</span>
                </button>
              )}
              {selectedBrand && (
                <button onClick={() => setSelectedBrand(null)} className="flex items-center gap-1 px-3 py-1 bg-luxury-gold text-luxury-brown rounded-full text-xs font-bold hover:bg-white/80 transition-all">
                  {selectedBrand} <span className="text-xs">×</span>
                </button>
              )}
              {availability !== "all" && (
                <button onClick={() => setAvailability("all")} className="flex items-center gap-1 px-3 py-1 bg-luxury-gold text-luxury-brown rounded-full text-xs font-bold hover:bg-white/80 transition-all">
                  {availability === "in-stock" ? "In Stock" : "Out of Stock"} <span className="text-xs">×</span>
                </button>
              )}
              <button onClick={clearFilters} className="text-xs font-body text-cream-100/60 underline underline-offset-2 hover:text-luxury-gold ml-2">
                Clear All
              </button>
            </div>
          </div>
        )}

        {/* Amazon-style Chip Bar */}
        <div className="sticky top-20 z-30 bg-gradient-to-r from-black/70 to-black/40 backdrop-blur-md border-b border-white/10 py-3 px-4">
          <div className="max-w-7xl mx-auto flex items-center gap-2 overflow-x-auto hide-scrollbar">
            <button
              onClick={() => setShowFilters(true)}
              className="flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full border-2 border-luxury-gold text-luxury-gold bg-black/40 font-body text-xs font-bold uppercase tracking-wider hover:bg-luxury-gold hover:text-luxury-brown transition-all"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
              Filters
              {(selectedBrand || availability !== "all" || selectedCategory) && <span className="w-2 h-2 rounded-full bg-luxury-gold" />}
            </button>

            <div className="flex-shrink-0 relative">
              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="appearance-none pl-4 pr-8 py-2 rounded-full border-2 border-white/20 bg-black/40 text-white font-body text-xs font-bold uppercase tracking-wider focus:outline-none"
              >
                <option value="newest">Popular</option>
                <option value="price-low">Price: Low → High</option>
                <option value="price-high">Price: High → Low</option>
              </select>
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-white/60 text-xs">▼</span>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
                  className={`px-4 py-2 rounded-full border-2 font-body text-xs font-bold uppercase tracking-wider transition-all ${
                    selectedCategory === cat 
                      ? "border-luxury-gold text-luxury-gold bg-black/40" 
                      : "border-white/20 text-white/60 bg-black/40 hover:border-white/40"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Filter Sidebar */}
        <AnimatePresence>
          {showFilters && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowFilters(false)}
                className="fixed inset-0 bg-black/60 z-40"
              />
              <motion.div
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="fixed right-0 top-0 h-full w-[85%] max-w-sm bg-black/90 backdrop-blur-xl z-50 overflow-y-auto p-6"
              >
                <div className="flex items-center justify-between mb-6">
                  <h4 className="font-display text-xl font-bold text-cream-100">Refine Results</h4>
                  <button onClick={() => setShowFilters(false)} className="p-2 text-cream-100 hover:text-luxury-gold">
                    <span className="text-2xl">×</span>
                  </button>
                </div>

                <div className="border-b border-white/10 pb-6 mb-6">
                  <button onClick={() => setOpenFilterSections((prev) => ({ ...prev, category: !prev.category }))}
                    className="flex items-center justify-between w-full mb-4">
                    <span className="font-body text-xs uppercase tracking-[0.2em] text-cream-100 font-semibold">Category</span>
                    <span className="text-cream-100/60 text-lg">{openFilterSections.category ? "−" : "+"}</span>
                  </button>
                  {openFilterSections.category && (
                    <div className="flex flex-col gap-2">
                      <button onClick={() => setSelectedCategory(null)}
                        className={`text-left font-body text-sm py-1 transition-colors ${!selectedCategory ? "text-luxury-gold" : "text-cream-100/70 hover:text-cream-100"}`}>
                        All Categories
                      </button>
                      {categories.map((cat) => (
                        <button key={cat} onClick={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
                          className={`text-left font-body text-sm py-1 transition-colors ${selectedCategory === cat ? "text-luxury-gold" : "text-cream-100/70 hover:text-cream-100"}`}>
                          {cat}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="border-b border-white/10 pb-6 mb-6">
                  <button onClick={() => setOpenFilterSections((prev) => ({ ...prev, brand: !prev.brand }))}
                    className="flex items-center justify-between w-full mb-4">
                    <span className="font-body text-xs uppercase tracking-[0.2em] text-cream-100 font-semibold">Brand</span>
                    <span className="text-cream-100/60 text-lg">{openFilterSections.brand ? "−" : "+"}</span>
                  </button>
                  {openFilterSections.brand && (
                    <div className="flex flex-col gap-2">
                      <button onClick={() => setSelectedBrand(null)}
                        className={`text-left font-body text-sm py-1 transition-colors ${!selectedBrand ? "text-luxury-gold" : "text-cream-100/70 hover:text-cream-100"}`}>
                        All Brands
                      </button>
                      {availableBrands.map((brand) => (
                        <button key={brand} onClick={() => setSelectedBrand(selectedBrand === brand ? null : brand)}
                          className={`text-left font-body text-sm py-1 transition-colors ${selectedBrand === brand ? "text-luxury-gold" : "text-cream-100/70 hover:text-cream-100"}`}>
                          {brand}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="border-b border-white/10 pb-6 mb-6">
                  <button onClick={() => setOpenFilterSections((prev) => ({ ...prev, availability: !prev.availability }))}
                    className="flex items-center justify-between w-full mb-4">
                    <span className="font-body text-xs uppercase tracking-[0.2em] text-cream-100 font-semibold">Availability</span>
                    <span className="text-cream-100/60 text-lg">{openFilterSections.availability ? "−" : "+"}</span>
                  </button>
                  {openFilterSections.availability && (
                    <div className="flex flex-col gap-2">
                      {(["all", "in-stock", "out-of-stock"] as const).map((opt) => (
                        <button key={opt} onClick={() => setAvailability(opt)}
                          className={`text-left font-body text-sm py-1 transition-colors ${availability === opt ? "text-luxury-gold" : "text-cream-100/70 hover:text-cream-100"}`}>
                          {opt === "all" ? "All Availability" : opt === "in-stock" ? "In Stock" : "Out of Stock"}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <button onClick={clearFilters} className="w-full mt-4 py-3 text-center text-xs font-body uppercase tracking-[0.2em] text-cream-100 border border-white/20 rounded-full hover:border-luxury-gold hover:text-luxury-gold transition-all">
                  Clear All
                </button>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Products Grid */}
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {Array(8).fill(null).map((_, i) => (
                  <div key={i} className="space-y-3">
                    <div className="skeleton aspect-[3/4] rounded-sm" />
                    <div className="skeleton h-3 w-1/3 rounded" />
                    <div className="skeleton h-4 w-2/3 rounded" />
                  </div>
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-20">
                <h3 className="font-display text-2xl text-cream-100 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] mb-2">No Products Found</h3>
                <p className="font-body text-sm text-cream-100/60 mb-6">Try adjusting your filters</p>
                <button onClick={clearFilters} className="btn-luxury">Clear Filters</button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
                {filteredProducts.map((product, i) => {
                  const smallImages = product.images?.filter((img) => img.image_type === "small") || [];
                  const smallImage = smallImages[0]?.image_url || product.images?.find((img) => img.is_primary)?.image_url || product.images?.[0]?.image_url || "/placeholder.png";
                  const availableSizes = product.sizes?.filter((s) => s.is_available) || [];
                  const inStock = availableSizes.length > 0;
                  const price = product.is_discounted && product.discount_price ? product.discount_price : product.original_price;
                  const originalPrice = product.original_price;

                  return (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: i * 0.05 }}
                      className="cursor-pointer group"
                      onClick={() => {
                        const fb = product.images?.filter((img) => img.image_type === "full-body")[0]?.image_url || product.images?.find((img) => img.is_primary)?.image_url || product.images?.[0]?.image_url;
                        setSelectedImage(fb);
                        setSelectedProduct(product);
                      }}
                    >
                      <div className="bg-transparent rounded-xl shadow-lg overflow-hidden border border-cream-200/20 hover:shadow-2xl transition-shadow duration-300">
                        <div className="relative aspect-[3/4] overflow-hidden">
                          <img src={smallImage} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                          <div className="absolute top-3 left-3 hidden md:block">
                            <span className={`font-body text-[10px] font-semibold px-3 py-1 rounded-full shadow bg-white/95 ${inStock ? "text-emerald-600" : "text-red-500"}`}>
                              {inStock ? "IN STOCK" : "OUT OF STOCK"}
                            </span>
                          </div>
                        </div>

                        <div className="p-4">
                          <p className="font-body text-[10px] uppercase tracking-[0.15em] text-cream-200/70 mb-1">
                            {product.brand?.name || ""}
                          </p>
                          <h3 className="font-display text-sm md:text-base font-semibold text-cream-100 truncate mb-3">
                            {product.name}
                          </h3>

                          <div className="flex items-center justify-between mb-3 gap-2">
                            <div>
                              {product.is_discounted && product.discount_price ? (
                                <div className="flex items-center gap-2">
                                  <span className="font-body text-xs text-cream-200/60 line-through">₹{originalPrice.toFixed(2)}</span>
                                  <span className="font-body text-base font-bold text-luxury-gold">₹{price.toFixed(2)}</span>
                                </div>
                              ) : (
                                <span className="font-body text-base font-bold text-cream-100">₹{price.toFixed(2)}</span>
                              )}
                            </div>
                          </div>

                          {(() => {
                            const isItemInBag = items.some((item) => item.product.id === product.id);
                            const isJustAdded = addedSuccessId === product.id;
                            return (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (!user) {
                                    addToCart(product, null, smallImage);
                                    return;
                                  }
                                  if (isItemInBag) {
                                    removeFromCartByProductId(product.id);
                                    setAddedSuccessId(null);
                                  } else if (inStock) {
                                    const defaultSize = availableSizes[0]?.size || null;
                                    addToCart(product, defaultSize, smallImage);
                                    setAddedSuccessId(product.id);
                                    setTimeout(() => setAddedSuccessId(null), 2500);
                                  }
                                }}
                                disabled={!inStock}
                                className={`mt-3 w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-full font-body text-[10px] font-bold tracking-wider uppercase transition-all shadow-lg ${
                                  !inStock
                                    ? "bg-white/10 text-cream-200/40 cursor-not-allowed"
                                    : user && (isItemInBag || isJustAdded)
                                    ? "bg-emerald-600 text-white hover:bg-emerald-700"
                                    : "bg-luxury-gold text-luxury-brown hover:bg-cream-100"
                                }`}
                              >
                                <ShoppingBag size={12} />
                                {!inStock ? "Sold Out" : user && (isItemInBag || isJustAdded) ? "✓ Added" : "Add to Bag"}
                              </button>
                            );
                          })()}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Product Popup */}
      <AnimatePresence>
        {selectedProduct && (
          <ProductPopup
            product={selectedProduct}
            centerImage={selectedImage}
            onClose={() => {
              setSelectedProduct(null);
              setSelectedImage(undefined);
            }}
          />
        )}
      </AnimatePresence>

      <Footer shopInfo={shopInfo} socialMedia={socialMedia} />
    </>
  );
}