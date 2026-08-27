"use client";

import BackgroundVideo from "@/components/BackgroundVideo";
import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { useAuth } from "@/lib/auth-context";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import PosterCarousel from "@/components/PosterCarousel";
import ProductPopup from "@/components/ProductPopup";
import { supabase } from "@/lib/supabase";
import {
  Product,
  HeroImage,
  HomepageContent,
  ShopInfo,
  SocialMedia,
  CATEGORIES,
  ScrollRevealImage,
} from "@/lib/types";
import ImageReveal from "@/components/ImageReveal";
import ScrollDrivenFeatured from "@/components/ScrollDrivenFeatured";

export default function HomePage() {
  const { addToCart, items, removeFromCartByProductId } = useCart();
  const { user } = useAuth();
  const [addedSuccessId, setAddedSuccessId] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [heroImages, setHeroImages] = useState<HeroImage[]>([]);
  const [homepageContent, setHomepageContent] = useState<HomepageContent[]>([]);
  const [categoryImages, setCategoryImages] = useState<Record<string, string>>({});
  const [shopInfo, setShopInfo] = useState<ShopInfo | null>(null);
  const [socialMedia, setSocialMedia] = useState<SocialMedia[]>([]);
  const [scrollRevealImages, setScrollRevealImages] = useState<ScrollRevealImage[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | undefined>();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [productsRes, heroRes, contentRes, shopRes, socialRes, catMenRes, catWomenRes, catKidsRes, srRes] =
        await Promise.all([
          supabase
            .from("products")
            .select("*, brand:brands(*), images:product_images(*), sizes:product_sizes(*)")
            .eq("is_active", true)
            .order("created_at", { ascending: false })
            .limit(20),
          supabase
            .from("hero_images")
            .select("*")
            .eq("is_active", true)
            .order("display_order"),
          supabase
            .from("homepage_content")
            .select("*")
            .eq("is_active", true)
            .order("display_order"),
          supabase.from("shop_info").select("*").limit(1).single(),
          supabase
            .from("social_media")
            .select("*")
            .order("display_order"),
          supabase.from("homepage_content").select("image_url").eq("section_type", "category_men").limit(1).maybeSingle(),
          supabase.from("homepage_content").select("image_url").eq("section_type", "category_women").limit(1).maybeSingle(),
          supabase.from("homepage_content").select("image_url").eq("section_type", "category_kids").limit(1).maybeSingle(),
          supabase
            .from("scroll_reveal_images")
            .select("*")
            .eq("is_active", true)
            .order("display_order"),
        ]);

        const catImgs: Record<string, string> = {};
        if (catMenRes.data?.image_url) catImgs.men = catMenRes.data.image_url;
        if (catWomenRes.data?.image_url) catImgs.women = catWomenRes.data.image_url;
        if (catKidsRes.data?.image_url) catImgs.kids = catKidsRes.data.image_url;
        setCategoryImages(catImgs);

      setProducts(productsRes.data || []);
      setHeroImages(heroRes.data || []);
      setHomepageContent(contentRes.data || []);
      setShopInfo(shopRes.data);
      setSocialMedia(socialRes.data || []);
      setScrollRevealImages(srRes.data || []);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const heroContent = homepageContent.find((c) => c.section_type === "hero");
  const modelContent = homepageContent.find(
    (c) => c.section_type === "model_showcase"
  );

  const taglineText =
    shopInfo?.tagline || heroContent?.title || "Redefining Fashion";

  const carouselProducts = useMemo(() => {
    return products.slice(0, 12);
  }, [products]);

  const featuredProducts = products.filter((p) => p.is_featured).slice(0, 6);
  const newArrivals = products.filter((p) => p.is_new_arrival).slice(0, 9);

  return (
    <>
      <BackgroundVideo 
        videoSrc="/fashion.mp4" 
        posterSrc="/fallback.jpg"
      />

      <Navigation shopInfo={shopInfo} />

      <main className="min-h-screen">
        
               {/* ==================== SCROLL REVEAL IMAGES (Responsive for Mobile & PC) ==================== */}
        {!loading && scrollRevealImages.length > 0 && (
          <section className="relative">
            <div className="space-y-0">
              {scrollRevealImages.map((srImage, index) => {
                // Check if the screen is mobile (less than 768px) or desktop
                const isMobile = window.innerWidth < 768;
                
                return (
                  <div 
                    key={srImage.id} 
                    className={`w-full px-0 ${
                      index === 0 
                        ? "h-screen w-full" // Full viewport height
                        : "py-12 md:py-24" // Proper spacing for others
                    }`}
                  >
                    <ImageReveal
                      // USE DIFFERENT IMAGES FOR MOBILE & DESKTOP
                      src={
                        isMobile 
                          ? (srImage.mobile_src || srImage.src) // Fallback to main src if no mobile image
                          : srImage.src
                      }
                      alt={srImage.alt}
                      height={srImage.height || 500}
                      className={`w-full ${
                        index === 0 
                          ? "h-full object-cover" // Full screen cover
                          : "h-auto object-contain" 
                      }`}
                    />
                  </div>
                );
              })}
            </div>
          </section>
        )}
        {/* Poster Carousel */}
        {!loading && carouselProducts.length > 0 && (
          <section className="relative py-12">
            <PosterCarousel
              products={carouselProducts}
              onProductClick={(p) => {
                const fb =
                  p.images?.filter((img) => img.image_type === "full-body")[0]
                    ?.image_url ||
                  p.images?.find((img) => img.is_primary)?.image_url ||
                  p.images?.[0]?.image_url;
                setSelectedImage(fb);
                setSelectedProduct(p);
              }}
            />
          </section>
        )}

        {/* More Picks - Bigger on Mobile (2 in a row) */}
        {!loading && carouselProducts.length > 0 && (
          <section className="relative py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-8">
                {carouselProducts.map((product, i) => {
                  const smallImages =
                    product.images?.filter((img) => img.image_type === "small") || [];
                  const smallImage =
                    smallImages[0]?.image_url ||
                    product.images?.find((img) => img.is_primary)?.image_url ||
                    product.images?.[0]?.image_url ||
                    "/placeholder.png";

                  const availableSizes = product.sizes?.filter((s) => s.is_available) || [];
                  const inStock = availableSizes.length > 0;
                  const price =
                    product.is_discounted && product.discount_price
                      ? product.discount_price
                      : product.original_price;
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
                        setSelectedImage(smallImage);
                        setSelectedProduct(product);
                      }}
                    >
                      <div className="bg-transparent rounded-xl shadow-lg overflow-hidden border border-cream-200/20 hover:shadow-2xl transition-shadow duration-300">
                        <div className="relative aspect-[3/4] overflow-hidden">
                          <img
                            src={smallImage}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute top-3 left-3 hidden md:block">
                            <span
                              className={`font-body text-[10px] font-semibold px-3 py-1 rounded-full shadow bg-white/95 ${
                                inStock ? "text-emerald-600" : "text-red-500"
                              }`}
                            >
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
                                  <span className="font-body text-xs text-cream-200/60 line-through">
                                    ₹{originalPrice.toFixed(2)}
                                  </span>
                                  <span className="font-body text-base font-bold text-luxury-gold">
                                    ₹{price.toFixed(2)}
                                  </span>
                                </div>
                              ) : (
                                <span className="font-body text-base font-bold text-cream-100">
                                  ₹{price.toFixed(2)}
                                </span>
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
                                {!inStock
                                  ? "Sold Out"
                                  : user && (isItemInBag || isJustAdded)
                                  ? "✓ Added"
                                  : "Add to Bag"}
                              </button>
                            );
                          })()}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* Model Showcase */}
        {heroImages.length > 3 && (
          <section className="py-24">
            <div className="max-w-7xl mx-auto px-6 lg:px-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <motion.div
                  initial={{ opacity: 0, x: -50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8 }}
                >
                  <p className="font-body text-xs text-luxury-gold uppercase tracking-[0.3em] mb-4">
                    {modelContent?.subtitle || "Featured Look"}
                  </p>
                  <h2 className="font-display text-3xl md:text-5xl font-bold text-cream-100 mb-6 leading-tight">
                    {modelContent?.title || "STREET STYLE ESSENTIALS"}
                  </h2>
                  <div className="gold-line w-16 mb-6" />
                  <p className="font-body text-sm text-cream-200/70 leading-relaxed max-w-md mb-8">
                    {modelContent?.description ||
                      "Explore our handpicked selection of premium streetwear that blends comfort with cutting-edge design."}
                  </p>
                  <Link
                    href="/shop"
                    className="inline-block px-8 py-3 border border-cream-100/30 text-cream-100 font-body text-xs uppercase tracking-[0.2em] hover:bg-cream-100 hover:text-luxury-brown transition-all duration-300"
                  >
                    {modelContent?.button_text || "EXPLORE"}
                  </Link>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8 }}
                  className="relative"
                >
                  <div className="aspect-[3/4] overflow-hidden rounded-sm">
                    <img
                      src={heroImages[3]?.image_url || heroImages[0]?.image_url || ""}
                      alt="Model showcase"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="absolute -bottom-6 -left-6 bg-luxury-gold text-cream-100 px-6 py-3 rounded-sm">
                    <p className="font-body text-xs uppercase tracking-wider">
                      S/S 2024
                    </p>
                  </div>
                </motion.div>
              </div>
            </div>
          </section>
        )}

        {/* New Arrivals */}
        {newArrivals.length > 0 && (
          <section className="py-24">
            <div className="max-w-7xl mx-auto px-6 lg:px-8">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="flex items-end justify-between mb-12"
              >
                <div>
                  <p className="font-body text-xs text-luxury-gold uppercase tracking-[0.3em] mb-2">
                    Just Dropped
                  </p>
                  <h2 className="font-display text-2xl md:text-4xl font-bold text-cream-100">
                    New Arrivals
                  </h2>
                </div>
                <Link
                  href="/new-arrivals"
                  className="font-body text-xs text-cream-100 uppercase tracking-[0.15em] border-b border-cream-100/30 pb-1 hover:border-luxury-gold hover:text-luxury-gold transition-all hidden md:block"
                >
                  View All →
                </Link>
              </motion.div>

              <div className="flex overflow-x-auto gap-6 pb-8 swipe-container hide-scrollbar">
                {newArrivals.map((product, i) => (
                  <div
                    key={product.id}
                    className="flex-shrink-0 w-[85vw] md:w-[25vw] lg:w-[19vw] cursor-pointer"
                    onClick={() => {
                      const fb =
                        product.images?.filter((img) => img.image_type === "full-body")[0]
                          ?.image_url ||
                        product.images?.find((img) => img.is_primary)?.image_url ||
                        product.images?.[0]?.image_url;
                      setSelectedImage(fb);
                      setSelectedProduct(product);
                    }}
                  >
                    <div className="relative aspect-[3/4] rounded-sm overflow-hidden bg-black/30">
                      <img
                        src={
                          product.images?.filter((img) => img.image_type === "full-body")[0]
                            ?.image_url ||
                          product.images?.find((img) => img.is_primary)?.image_url ||
                          product.images?.[0]?.image_url ||
                          "/placeholder.png"
                        }
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-3 left-3">
                        <span
                          className={`font-body text-[10px] font-semibold px-3 py-1 rounded-full shadow bg-white/95 ${
                            product.sizes?.some((s) => s.is_available)
                              ? "text-emerald-600"
                              : "text-red-500"
                          }`}
                        >
                          {product.sizes?.some((s) => s.is_available) ? "IN STOCK" : "OUT OF STOCK"}
                        </span>
                      </div>
                    </div>
                    <div className="mt-3 px-1">
                      <p className="font-body text-[10px] uppercase tracking-[0.12em] text-cream-200/70 mb-0.5">
                        {product.brand?.name || ""}
                      </p>
                      <h4 className="font-display text-sm text-cream-100 font-medium truncate">
                        {product.name}
                      </h4>
                      <div className="flex items-center gap-2">
                        {product.is_discounted && product.discount_price ? (
                          <>
                            <span className="font-body text-xs text-cream-200/60 line-through">
                              ₹{product.original_price.toFixed(2)}
                            </span>
                            <span className="font-body text-sm font-bold text-luxury-gold">
                              ₹{product.discount_price.toFixed(2)}
                            </span>
                          </>
                        ) : (
                          <span className="font-body text-sm font-bold text-cream-100">
                            ₹{product.original_price.toFixed(2)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Featured Products */}
        {featuredProducts.length > 0 && (
          <section className="py-12">
            <div className="max-w-7xl mx-auto px-6 lg:px-8">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-center mb-8"
              >
                <p className="font-body text-xs text-luxury-gold uppercase tracking-[0.3em] mb-2">
                  Curated Selection
                </p>
                <h2 className="font-display text-2xl md:text-4xl font-bold text-cream-100">
                  Featured
                </h2>
                <div className="gold-line w-20 mx-auto mt-4" />
              </motion.div>

              <ScrollDrivenFeatured
                images={featuredProducts.map(product => ({
                  src: product.images?.filter(img => img.image_type === "full-body")[0]?.image_url ||
                       product.images?.find(img => img.is_primary)?.image_url ||
                       product.images?.[0]?.image_url ||
                       "/placeholder.png",
                  alt: product.name,
                  height: 500,
                }))}
              />

              <div className="mt-8">
                <div className="flex overflow-x-auto gap-6 pb-8 swipe-container hide-scrollbar">
                  {featuredProducts.map((product, i) => (
                    <div
                      key={product.id}
                      className="flex-shrink-0 w-[85vw] md:w-[25vw] lg:w-[19vw] cursor-pointer"
                      onClick={() => {
                        const fb =
                          product.images?.filter((img) => img.image_type === "full-body")[0]
                            ?.image_url ||
                          product.images?.find((img) => img.is_primary)?.image_url ||
                          product.images?.[0]?.image_url;
                        setSelectedImage(fb);
                        setSelectedProduct(product);
                      }}
                    >
                      <div className="relative aspect-[3/4] rounded-sm overflow-hidden bg-black/30">
                        <img
                          src={
                            product.images?.filter((img) => img.image_type === "full-body")[0]
                              ?.image_url ||
                            product.images?.find((img) => img.is_primary)?.image_url ||
                            product.images?.[0]?.image_url ||
                            "/placeholder.png"
                          }
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="mt-3 px-1">
                        <p className="font-body text-[10px] uppercase tracking-[0.12em] text-cream-200/70 mb-0.5">
                          {product.brand?.name || ""}
                        </p>
                        <h4 className="font-display text-sm text-cream-100 font-medium truncate">
                          {product.name}
                        </h4>
                        <span className="font-body text-sm font-bold text-cream-100">
                          ₹{(product.is_discounted && product.discount_price
                            ? product.discount_price
                            : product.original_price
                          ).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}
      </main>

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