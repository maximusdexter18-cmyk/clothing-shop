"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Mic, MicOff, X } from "lucide-react";
import { Product } from "@/lib/types";
import { supabase } from "@/lib/supabase";
import ProductPopup from "@/components/ProductPopup";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  /* eslint-disable @typescript-eslint/no-explicit-any */
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (!isOpen) return;
    fetchProducts();
  }, [isOpen]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/products");
      if (res.ok) {
        const apiData = await res.json();
        if (Array.isArray(apiData)) {
          setProducts(apiData);
          setLoading(false);
          return;
        }
      }
      // Supabase direct fallback if API returns non-ok
      const { data, error } = await supabase
        .from("products")
        .select("*, images:product_images(*), sizes:product_sizes(*), brand:brands(*), category:categories(*)")
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (!error && data) {
        setProducts(data as Product[]);
      }
    } catch (e) {
      console.error("Fetch products error:", e);
    } finally {
      setLoading(false);
    }
  };

  /** Voice recognition / microphone trigger */
  const startListening = () => {
    if (typeof window === "undefined") return;
    setVoiceError(null);

    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setVoiceError("Voice recognition is not supported in this browser. Please type your search.");
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      recognition.onstart = () => {
        setIsListening(true);
        setVoiceError(null);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
        setIsListening(false);
        if (event.error === "not-allowed") {
          setVoiceError("Microphone access denied. Please allow microphone permission in your browser.");
        } else if (event.error === "no-speech") {
          setVoiceError("No speech detected. Please try speaking again.");
        } else {
          setVoiceError("Microphone error. Please try typing.");
        }
      };

      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0].transcript)
          .join("");
        setQuery(transcript);
      };

      recognition.start();
    } catch (err) {
      console.error("Speech start error:", err);
      setIsListening(false);
      setVoiceError("Could not start microphone search.");
    }
  };

  const filteredProducts = query.trim()
    ? products.filter((p) => {
        const q = query.toLowerCase();
        /* eslint-disable @typescript-eslint/no-explicit-any */
        const brandObj = p.brand as any;
        const catObj = p.category as any;
        const brandName = typeof brandObj === "object" ? brandObj?.name : brandObj;
        const categoryName = typeof catObj === "object" ? catObj?.name : catObj;
        return (
          p.name.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q) ||
          (brandName && String(brandName).toLowerCase().includes(q)) ||
          (categoryName && String(categoryName).toLowerCase().includes(q))
        );
      })
    : products;

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/80 flex items-start justify-center pt-16 sm:pt-24 p-4 overflow-y-auto"
            onClick={onClose}
          >
            <motion.div
              initial={{ scale: 0.95, y: -20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: -20, opacity: 0 }}
              transition={{ type: "spring", stiffness: 280, damping: 24 }}
              onClick={(e) => e.stopPropagation()}
              className="relative bg-cream-50 rounded-2xl w-full max-w-3xl p-6 sm:p-8 shadow-2xl border border-cream-200"
            >
              {/* Close */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 w-9 h-9 bg-luxury-darkBrown/80 text-cream-100 rounded-full flex items-center justify-center hover:bg-luxury-brown transition-colors z-10"
              >
                <X size={18} />
              </button>

              <h2 className="font-display text-xl sm:text-2xl font-bold text-luxury-brown mb-4">
                Search Products
              </h2>

              {/* Search Bar with Microphone */}
              <div className="relative mb-6">
                <Search
                  size={20}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-luxury-brown/40"
                />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Type product name, brand, or style..."
                  className="w-full pl-12 pr-14 py-3.5 rounded-xl border border-cream-300 bg-white font-body text-sm text-luxury-brown focus:outline-none focus:ring-2 focus:ring-luxury-gold shadow-inner"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={startListening}
                  title="Search with Microphone"
                  className={`absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg transition-all ${
                    isListening
                      ? "bg-red-500 text-white animate-pulse"
                      : "text-luxury-brown/60 hover:text-luxury-brown hover:bg-cream-200"
                  }`}
                >
                  {isListening ? <MicOff size={18} /> : <Mic size={18} />}
                </button>
              </div>

              {isListening && (
                <p className="text-xs text-red-500 font-body mb-4 animate-pulse font-semibold">
                  🎙️ Listening... speak into your microphone!
                </p>
              )}

              {voiceError && (
                <p className="text-xs text-amber-700 bg-amber-50 p-2 rounded-md font-body mb-4 border border-amber-200">
                  ⚠️ {voiceError}
                </p>
              )}

              {/* Results List */}
              <div className="max-h-[60vh] overflow-y-auto pr-1">
                {loading ? (
                  <p className="text-center py-8 font-body text-sm text-luxury-brown/50">
                    Loading products...
                  </p>
                ) : filteredProducts.length === 0 ? (
                  <div className="text-center py-12 px-4 bg-white/60 rounded-xl border border-cream-200">
                    <p className="font-display text-lg font-bold text-luxury-brown mb-1">
                      no products match this request
                    </p>
                    <p className="font-body text-xs text-luxury-brown/50">
                      Try searching with different keywords or check spelling.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {filteredProducts.map((p) => {
                      const img = p.images?.[0]?.image_url || "/placeholder.png";
                      const price =
                        p.is_discounted && p.discount_price
                          ? p.discount_price
                          : p.original_price;

                      return (
                        <div
                          key={p.id}
                          onClick={() => setSelectedProduct(p)}
                          className="bg-white rounded-xl overflow-hidden shadow border border-cream-200 cursor-pointer group hover:shadow-md transition-all"
                        >
                          <div className="aspect-[3/4] overflow-hidden bg-cream-100 relative">
                            <img
                              src={img}
                              alt={p.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          </div>
                          <div className="p-3">
                            <h3 className="font-display text-sm font-semibold text-luxury-brown truncate">
                              {p.name}
                            </h3>
                            <p className="font-body text-xs text-luxury-gold font-bold mt-0.5">
                              ₹{price.toFixed(2)}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Product Detail Popup when clicking a search item */}
      {selectedProduct && (
        <ProductPopup
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </>
  );
}