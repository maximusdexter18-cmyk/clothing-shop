"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { supabase } from "@/lib/supabase";
import { Product, ShopInfo, SocialMedia, CATEGORIES, MAJOR_BRANDS } from "@/lib/types";
import { X, SlidersHorizontal } from "lucide-react";

export default function NewArrivalsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [shopInfo, setShopInfo] = useState<ShopInfo | null>(null);
  const [socialMedia, setSocialMedia] = useState<SocialMedia[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedGender, setSelectedGender] = useState<string | null>(null);
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

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [productsRes, shopRes, socialRes] = await Promise.all([
        supabase
          .from("products")
          .select("*, brand:brands(*), images:product_images(*), sizes:product_sizes(*)")
          .eq("is_active", true)
          .eq("is_new_arrival", true)
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

  const categories = selectedGender
    ? CATEGORIES[selectedGender as keyof typeof CATEGORIES] || []
    : [];

  const filteredProducts = useMemo(() => {
    let filtered = [...products];
    if (selectedGender) filtered = filtered.filter((p) => p.gender === selectedGender);
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
  }, [products, selectedGender, selectedCategory, selectedBrand, availability, sortBy]);

  const activeFilterCount = 
    (selectedGender ? 1 : 0) + 
    (selectedCategory ? 1 : 0) + 
    (selectedBrand ? 1 : 0) + 
    (availability !== "all" ? 1 : 0);

  const clearFilters = () => {
    setSelectedGender(null);
    setSelectedCategory(null);
    setSelectedBrand(null);
    setAvailability("all");
    setSortBy("newest");
  };

  const removeFilter = (type: string) => {
    if (type === "gender") setSelectedGender(null);
    if (type === "category") setSelectedCategory(null);
    if (type === "brand") setSelectedBrand(null);
    if (type === "availability") setAvailability("all");
  };

  return (
    <>
      <Navigation shopInfo={shopInfo} showBack />
      <main className="min-h-screen bg-transparent pt-24">
        
        {/* Header */}
        <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center mb-4">
          <h1 className="font-display text-5xl md:text-7xl font-bold text-cream-100 drop-shadow-[0_4px_12px_rgba(0,0,0,0.6)]">
            NEW ARRIVALS
          </h1>
          <div className="gold-line w-24 mx-auto mt-4" />
          <p className="font-body text-sm text-cream-100/60 uppercase tracking-[0.2em] mt-2">
            {filteredProducts.length} Products
          </p>
        </div>

        {/* Selected Filters Bar */}
        {(selectedGender || selectedCategory || selectedBrand || availability !== "all") && (
          <div className="max-w-7xl mx-auto px-6 lg:px-8 mb-4">
            <div className="flex flex-wrap items-center gap-2 justify-center">
              <span className="font-body text-xs text-cream-100/60 uppercase tracking-wider">Filters:</span>
              {selectedGender && (
                <button onClick={() => removeFilter("gender")} className="flex items-center gap-1 px-3 py-1 bg-luxury-gold text-luxury-brown rounded-full text-xs font-bold hover:bg-white/80 transition-all">
                  {selectedGender.charAt(0).toUpperCase() + selectedGender.slice(1)} <X size={14} />
                </button>
              )}
              {selectedCategory && (
                <button onClick={() => removeFilter("category")} className="flex items-center gap-1 px-3 py-1 bg-luxury-gold text-luxury-brown rounded-full text-xs font-bold hover:bg-white/80 transition-all">
                  {selectedCategory} <X size={14} />
                </button>
              )}
              {selectedBrand && (
                <button onClick={() => removeFilter("brand")} className="flex items-center gap-1 px-3 py-1 bg-luxury-gold text-luxury-brown rounded-full text-xs font-bold hover:bg-white/80 transition-all">
                  {selectedBrand} <X size={14} />
                </button>
              )}
              {availability !== "all" && (
                <button onClick={() => removeFilter("availability")} className="flex items-center gap-1 px-3 py-1 bg-luxury-gold text-luxury-brown rounded-full text-xs font-bold hover:bg-white/80 transition-all">
                  {availability === "in-stock" ? "In Stock" : "Out of Stock"} <X size={14} />
                </button>
              )}
              <button onClick={clearFilters} className="text-xs font-body text-cream-100/60 underline underline-offset-2 hover:text-luxury-gold ml-2">
                Clear All
              </button>
            </div>
          </div>
        )}

        {/* ========== AMAZON-STYLE CHIP BAR ========== */}
        <div className="sticky top-20 z-30 bg-gradient-to-r from-black/70 to-black/40 backdrop-blur-md border-b border-white/10 py-3 px-4">
          <div className="max-w-7xl mx-auto flex items-center gap-2 overflow-x-auto hide-scrollbar">
            <button
              onClick={() => setShowFilters(true)}
              className="flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full border-2 border-luxury-gold text-luxury-gold bg-black/40 font-body text-xs font-bold uppercase tracking-wider hover:bg-luxury-gold hover:text-luxury-brown transition-all"
            >
              <SlidersHorizontal size={14} />
              Filters
              {activeFilterCount > 0 && (
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-luxury-gold text-luxury-brown text-[10px] font-bold">
                  {activeFilterCount}
                </span>
              )}
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
              {[null, "men", "women", "kids"].map((g) => (
                <button
                  key={g || "all"}
                  onClick={() => { setSelectedGender(g); setSelectedCategory(null); }}
                  className={`px-4 py-2 rounded-full border-2 font-body text-xs font-bold uppercase tracking-wider transition-all ${
                    selectedGender === g 
                      ? "border-luxury-gold text-luxury-gold bg-black/40" 
                      : "border-white/20 text-white/60 bg-black/40 hover:border-white/40"
                  }`}
                >
                  {g ? `${g.charAt(0).toUpperCase() + g.slice(1)}` : "All"}
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
                    <X size={24} />
                  </button>
                </div>

                <div className="border-b border-white/10 pb-6 mb-6">
                  <button onClick={() => setOpenFilterSections((prev) => ({ ...prev, category: !prev.category }))}
                    className="flex items-center justify-between w-full mb-4">
                    <span className="font-body text-xs uppercase tracking-[0.2em] text-cream-100 font-semibold">Gender</span>
                    <span className="text-cream-100/60 text-lg">{openFilterSections.category ? "−" : "+"}</span>
                  </button>
                  {openFilterSections.category && (
                    <div className="flex flex-col gap-2">
                      {[null, "men", "women", "kids"].map((g) => (
                        <button key={g || "all"} onClick={() => { setSelectedGender(g); setSelectedCategory(null); }}
                          className={`text-left font-body text-sm py-1 transition-colors ${selectedGender === g ? "text-luxury-gold" : "text-cream-100/70 hover:text-cream-100"}`}>
                          {g ? `${g.charAt(0).toUpperCase() + g.slice(1)}` : "All"}
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
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
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
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {filteredProducts.map((product, i) => (
                  <ProductCard key={product.id} product={product} index={i} variant="grid" />
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer shopInfo={shopInfo} socialMedia={socialMedia} />
    </>
  );
}