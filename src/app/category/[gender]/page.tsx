"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useParams } from "next/navigation";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import BackButton from "@/components/BackButton";
import { supabase } from "@/lib/supabase";
import { Product, ShopInfo, SocialMedia, CATEGORIES, MAJOR_BRANDS } from "@/lib/types";
import { X } from "lucide-react";

export default function CategoryPage() {
  const { gender: rawGender } = useParams();
  const gender = Array.isArray(rawGender) ? rawGender[0] : rawGender;
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
      <Navigation shopInfo={shopInfo} showBack />
      <main className="min-h-screen bg-transparent pt-32">
        
        {/* ========== HEADER WITH BACK BUTTON (Heading Centered) ========== */}
        <div className="relative max-w-7xl mx-auto px-6 lg:px-8 mb-8">
          <div className="absolute top-0 left-6 lg:left-8">
            <BackButton />
          </div>
          <div className="text-center pt-10 md:pt-0">
            <h1 className="font-display text-5xl md:text-7xl font-bold text-cream-100 drop-shadow-[0_4px_12px_rgba(0,0,0,0.6)]">
              {genderTitle}
            </h1>
            <div className="gold-line w-24 mx-auto mt-4" />
            <p className="font-body text-sm text-cream-100/60 uppercase tracking-[0.2em] mt-2">
              {filteredProducts.length} Products
            </p>
          </div>
        </div>

        {/* ========== FILTER BAR (DESKTOP ONLY) ========== */}
        <section className="sticky top-20 z-30 bg-gradient-to-r from-black/70 to-black/40 backdrop-blur-md border-b border-white/10 hidden md:block">
          <div className="max-w-7xl mx-auto px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              
              {/* Category Pills - ONLY ON DESKTOP */}
              <div className="flex gap-2 overflow-x-auto hide-scrollbar flex-1">
                <button onClick={() => setSelectedCategory(null)}
                  className={`filter-pill whitespace-nowrap bg-white text-luxury-brown ${!selectedCategory ? "active" : ""}`}>
                  All
                </button>
                {categories.map((cat) => (
                  <button key={cat} onClick={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
                    className={`filter-pill whitespace-nowrap bg-white text-luxury-brown ${selectedCategory === cat ? "active" : ""}`}>
                    {cat}
                  </button>
                ))}
              </div>

              {/* Sort + Filter Buttons - ONLY ON DESKTOP */}
              <div className="flex items-center gap-3">
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                  className="font-body text-xs border border-white/20 rounded px-3 py-2 bg-black/40 text-white backdrop-blur-md focus:outline-none">
                  <option value="newest">Newest</option>
                  <option value="price-low">Price: Low → High</option>
                  <option value="price-high">Price: High → Low</option>
                </select>
                <button onClick={() => setShowFilters(!showFilters)} className="flex items-center gap-2 px-4 py-2 rounded-full text-white bg-black/40 backdrop-blur-md border border-white/20 hover:bg-black/60">
                  <span>Filters</span>
                  {(selectedBrand || availability !== "all" || selectedCategory) && <span className="w-2 h-2 rounded-full bg-luxury-gold" />}
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ========== MOBILE FILTERS (Only Filter Button) ========== */}
        <div className="md:hidden sticky top-20 z-30 bg-gradient-to-r from-black/70 to-black/40 backdrop-blur-md border-b border-white/10 py-3 px-4">
          <button 
            onClick={() => setShowFilters(true)}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-full text-white bg-black/40 backdrop-blur-md border border-white/20 hover:bg-black/60"
          >
            <span>Filters</span>
            {(selectedBrand || availability !== "all" || selectedCategory) && <span className="w-2 h-2 rounded-full bg-luxury-gold" />}
          </button>
        </div>

        {/* ========== FILTER SIDEBAR / PANEL ========== */}
        <AnimatePresence>
          {showFilters && (
            <>
              {/* Overlay */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowFilters(false)}
                className="fixed inset-0 bg-black/60 z-40"
              />

              {/* Sidebar (Mobile) / Top Panel (Desktop) */}
              <motion.div
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="fixed right-0 top-0 h-full w-[85%] max-w-sm bg-black/90 backdrop-blur-xl z-50 overflow-y-auto p-6 md:hidden"
              >
                <div className="flex items-center justify-between mb-6">
                  <h4 className="font-display text-xl font-bold text-cream-100">Refine Results</h4>
                  <button onClick={() => setShowFilters(false)} className="p-2 text-cream-100 hover:text-luxury-gold">
                    <X size={24} />
                  </button>
                </div>

                {/* Category */}
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

                {/* Brand */}
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

                {/* Availability */}
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

              {/* Desktop Panel */}
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
                className="hidden md:block overflow-hidden bg-black/80 backdrop-blur-xl border-b border-white/10 absolute w-full z-30"
              >
                <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
                  <div className="flex items-center justify-between mb-6">
                    <h4 className="font-display text-xl font-bold text-cream-100">Refine Results</h4>
                    <button onClick={clearFilters} className="text-xs font-body text-luxury-gold underline underline-offset-2">
                      Clear All
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Same filter sections here for desktop */}
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* ========== PRODUCTS GRID ========== */}
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