"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface OpeningAnimationProps {
  onComplete: () => void;
  featuredImages?: string[];
  shopName?: string;
  tagline?: string;
}

const DEFAULT_CARD_IMAGES = [
  "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1445205170230-053b83016050?w=600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=600&auto=format&fit=crop",
];

export default function OpeningAnimation({
  onComplete,
  featuredImages = [],
  shopName = "LUXE WEAR",
  tagline = "Redefining Fashion",
}: OpeningAnimationProps) {
  const [stage, setStage] = useState<"logo" | "cards" | "reveal" | "done">("logo");
  const [cardImages, setCardImages] = useState<string[]>([]);

  useEffect(() => {
    // Load persisted images or fallback to default
    try {
      const saved = localStorage.getItem("opening_card_images");
      if (saved) {
        setCardImages(JSON.parse(saved));
      } else if (featuredImages.length > 0) {
        setCardImages(featuredImages);
      } else {
        setCardImages(DEFAULT_CARD_IMAGES);
      }
    } catch {
      setCardImages(DEFAULT_CARD_IMAGES);
    }
  }, [featuredImages]);

  const finishAnimation = () => {
    setStage("done");
    onComplete();
  };

  useEffect(() => {
    const timer1 = setTimeout(() => setStage("cards"), 1800);
    const timer2 = setTimeout(() => setStage("reveal"), 4500);
    const timer3 = setTimeout(() => {
      finishAnimation();
    }, 5600);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [onComplete]);

  return (
    <AnimatePresence>
      {stage !== "done" && (
        <motion.div
          className="fixed inset-0 z-[100] bg-luxury-brown flex items-center justify-center overflow-hidden pointer-events-none"
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* Logo reveal */}
          <AnimatePresence mode="wait">
            {stage === "logo" && (
              <motion.div
                key="logo"
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, y: -40 }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="text-center"
              >
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 1.2, delay: 0.2 }}
                  className="overflow-hidden"
                >
                  <h1 className="font-display text-5xl md:text-7xl font-bold text-cream-100 tracking-[0.15em]">
                    {shopName}
                  </h1>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.1 }}
                  className="gold-line w-32 mx-auto mt-4"
                />
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.7 }}
                  transition={{ delay: 1.3 }}
                  className="font-heading text-cream-200 text-base md:text-lg tracking-[0.3em] mt-3 uppercase"
                >
                  {tagline}
                </motion.p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Cards appear */}
          <AnimatePresence>
            {stage === "cards" && (
              <motion.div
                key="cards"
                className="absolute inset-0 flex items-center justify-center"
              >
                <div className="relative w-full h-full flex items-center justify-center">
                  {/* Central featured card */}
                  <motion.div
                    initial={{ scale: 0, rotateY: 180 }}
                    animate={{ scale: 1, rotateY: 0 }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="absolute z-20 w-48 h-64 md:w-60 md:h-76 bg-cream-100 rounded-lg shadow-2xl overflow-hidden"
                  >
                    <div className="w-full h-full bg-gradient-to-br from-cream-100 to-cream-300 flex items-center justify-center">
                      <div className="text-center p-4">
                        <p className="font-display text-luxury-brown text-base font-bold">
                          NEW
                        </p>
                        <p className="font-display text-luxury-brown text-2xl font-bold">
                          COLLECTION
                        </p>
                        <div className="gold-line w-16 mx-auto my-3" />
                        <p className="font-body text-luxury-brown/60 text-xs uppercase tracking-widest">
                          LUXURY WEAR
                        </p>
                      </div>
                    </div>
                  </motion.div>

                  {/* Surrounding cards */}
                  {cardImages.map((imgUrl, i) => {
                    const total = cardImages.length || 1;
                    const spread = 560;
                    const step = total > 1 ? spread / (total - 1) : 0;
                    const xPos = -spread / 2 + i * step;
                    const angle = -28 + (56 / Math.max(1, total - 1)) * i;

                    return (
                      <motion.div
                        key={i}
                        initial={{
                          scale: 0,
                          x: 0,
                          y: 80,
                          rotate: 0,
                          opacity: 0,
                        }}
                        animate={{
                          scale: 0.75,
                          x: xPos,
                          y: i % 2 === 0 ? -16 : 16,
                          rotate: angle,
                          opacity: 0.9,
                        }}
                        transition={{
                          duration: 0.8,
                          delay: 0.15 + i * 0.08,
                          ease: "easeOut",
                        }}
                        className="absolute z-10 w-36 h-52 md:w-44 md:h-60 bg-cream-200 rounded-lg shadow-xl overflow-hidden"
                      >
                        <img
                          src={imgUrl}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Reveal transition */}
          <AnimatePresence>
            {stage === "reveal" && (
              <motion.div
                key="reveal"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 flex items-center justify-center bg-luxury-brown"
              >
                <motion.div
                  initial={{ scale: 1 }}
                  animate={{ scale: 50, opacity: 0 }}
                  transition={{ duration: 1.2, ease: "easeInOut" }}
                  className="w-4 h-4 rounded-full bg-luxury-gold"
                />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}