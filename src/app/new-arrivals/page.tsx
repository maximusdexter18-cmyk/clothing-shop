"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import BackButton from "@/components/BackButton";
import { supabase } from "@/lib/supabase";
import { Product, ShopInfo, SocialMedia, CATEGORIES, MAJOR_BRANDS } from "@/lib/types";

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

  const clearFilters = () => {
    setSelectedGender(null);
    setSelectedCategory(null);
    setSelectedBrand(null);
    setAvailability("all");
    setSortBy("newest");
  };

  return (
    <>
      <Navigation shopInfo={shopInfo} showBack />
      <main className="min-h-screen bg-transparent pt-32">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <BackButton />
        </div>

        <section className="bg-transparent">
          <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center">
            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="font-display text-5xl md:text-7xl font-bold text-cream-100 drop-shadow-[0_4px_12px_rgba(0,0,0,0.6)] mb-4">
              NEW ARRIVALS
            </motion.h1>
            <div className="gold-line w-24 mx-auto mb-4" />
            <p className="font-body text-sm text-cream-100/60 uppercase tracking-[0.2em]">
              {filteredProducts.length} Products
            </p>
          </div>
        </section>

        {/* STICKY FILTER BAR - Transparent & Blurred */}
        <section className="sticky top-20 z-30 bg-gradient-to-r from-black/70 to-black/40 backdrop-blur-md border-b border-white/10">
          <div className="max-w-7xl mx-auto px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex gap-2 overflow-x-auto hide-scrollbar flex-1">
                {[null, "men", "women", "kids"].map((g) => (
                  <button key={g || "all"} onClick={() => { setSelectedGender(g); setSelectedCategory(null); }}
                    className={`filter-pill whitespace-nowrap bg-white text-luxury-brown ${selectedGender === g ? "active" : ""}`}>
                    {g ? `${g.charAt(0).toUpperCase() + g.slice(1)}` : "All"}
                  </button>
                ))}
              </div>

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

        {/* FILTER MENU */}
        <AnimatePresence>
          {showFilters && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.4, ease: "easeInOut" }}
              className="overflow-hidden bg-black/80 backdrop-blur-xl border-b border-white/10">
              <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
                <div className="flex items-center justify-between mb-6">
                  <h4 className="font-display text-xl font-bold text-cream-100">Refine Results</h4>
                  <button onClick={clearFilters} className="text-xs font-body text-luxury-gold underline underline-offset-2">Clear All</button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {/* Category */}
                  <div className="border-b md:border-b-0 md:border-r border-white/10 pr-0 md:pr-8 pb-6 md:pb-0">
                    <button onClick={() => setOpenFilterSections((prev) => ({ ...prev, category: !prev.category }))} className="flex items-center justify-between w-full mb-4">
                      <span className="font-body text-xs uppercase tracking-[0.2em] text-cream-100 font-semibold">Category</span>
                      <span className="text-cream-100/60 text-lg">{openFilterSections.category ? "−" : "+"}</span>
                    </button>
                    {openFilterSections.category && (
                      <div className="flex flex-col gap-2">
                        <button onClick={() => setSelectedCategory(null)} className={`text-left font-body text-sm py-1 transition-colors ${!selectedCategory ? "text-luxury-gold" : "text-cream-100/70 hover:text-cream-100"}`}>All Categories</button>
                        {categories.map((cat) => (
                          <button key={cat} onClick={() => setSelectedCategory(selectedCategory === cat ? null : cat)} className={`text-left font-body text-sm py-1 transition-colors ${selectedCategory === cat ? "text-luxury-gold" : "text-cream-100/70 hover:text-cream-100"}`}>{cat}</button>
                        ))}
                      </div>
                    )}
                  </div>
                  {/* Brand */}
                  <div className="border-b md:border-b-0 md:border-r border-white/10 pr-0 md:pr-8 pb-6 md:pb-0">
                    <button onClick={() => setOpenFilterSections((prev) => ({ ...prev, brand: !prev.brand }))} className="flex items-center justify-between w-full mb-4">
                      <span className="font-body text-xs uppercase tracking-[0.2em] text-cream-100 font-semibold">Brand</span>
                      <span className="text-cream-100/60 text-lg">{openFilterSections.brand ? "−" : "+"}</span>
                    </button>
                    {openFilterSections.brand && (
                      <div className="flex flex-col gap-2">
                        <button onClick={() => setSelectedBrand(null)} className={`text-left font-body text-sm py-1 transition-colors ${!selectedBrand ? "text-luxury-gold" : "text-cream-100/70 hover:text-cream-100"}`}>All Brands</button>
                        {availableBrands.map((brand) => (
                          <button key={brand} onClick={() => setSelectedBrand(selectedBrand === brand ? null : brand)} className={`text-left font-body text-sm py-1 transition-colors ${selectedBrand === brand ? "text-luxury-gold" : "text-cream-100/70 hover:text-cream-100"}`}>{brand}</button>
                        ))}
                      </div>
                    )}
                  </div>
                  {/* Availability */}
                  <div>
                    <button onClick={() => setOpenFilterSections((prev) => ({ ...prev, availability: !prev.availability }))} className="flex items-center justify-between w-full mb-4">
                      <span className="font-body text-xs uppercase tracking-[0.2em] text-cream-100 font-semibold">Availability</span>
                      <span className="text-cream-100/60 text-lg">{openFilterSections.availability ? "−" : "+"}</span>
                    </button>
                    {openFilterSections.availability && (
                      <div className="flex flex-col gap-2">
                        {(["all", "in-stock", "out-of-stock"] as const).map((opt) => (
                          <button key={opt} onClick={() => setAvailability(opt)} className={`text-left font-body text-sm py-1 transition-colors ${availability === opt ? "text-luxury-gold" : "text-cream-100/70 hover:text-cream-100"}`}>{opt === "all" ? "All Availability" : opt === "in-stock" ? "In Stock" : "Out of Stock"}</button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* PRODUCTS GRID */}
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