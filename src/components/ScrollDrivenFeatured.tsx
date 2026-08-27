// src/components/ScrollDrivenFeatured.tsx
"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

interface ScrollDrivenFeaturedProps {
  images: {
    src: string;
    alt: string;
    height?: number;
  }[];
}

const ScrollDrivenFeatured: React.FC<ScrollDrivenFeaturedProps> = ({ images }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  if (!images || images.length === 0) {
    return null;
  }

  return (
    <div ref={containerRef} className="relative w-full bg-black">
      {/* Section Header - Sticky */}
      <div className="sticky top-0 z-10 flex items-center justify-center py-6 bg-black/80 backdrop-blur-sm border-b border-white/5">
        <div className="text-center">
          <p className="text-xs tracking-[0.3em] text-white/40 uppercase">
            Scroll to Explore
          </p>
          <h2 className="text-2xl md:text-3xl font-display text-white/80 mt-1">
            Featured Collection
          </h2>
          <div className="w-12 h-0.5 bg-white/20 mx-auto mt-2" />
        </div>
      </div>

      {/* Images that reveal on scroll */}
      <div className="relative z-0">
        {images.map((image, index) => (
          <RevealImage
            key={index}
            src={image.src}
            alt={image.alt}
            height={image.height || 500}
            index={index}
            total={images.length}
          />
        ))}
      </div>

      {/* Bottom indicator */}
      <div className="sticky bottom-0 z-10 flex items-center justify-center py-6 bg-black/80 backdrop-blur-sm border-t border-white/5">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-xs tracking-[0.2em] text-white/20 animate-pulse"
        >
          Continue to explore ↓
        </motion.p>
      </div>
    </div>
  );
};

// Individual reveal image component
const RevealImage = ({ 
  src, 
  alt, 
  height, 
  index, 
  total 
}: { 
  src: string; 
  alt: string; 
  height: number; 
  index: number; 
  total: number;
}) => {
  const ref = useRef<HTMLDivElement>(null);

  // Each image reveals at different scroll positions
  const startOffset = Math.min(index * 0.12, 0.5);
  const endOffset = Math.min(startOffset + 0.4, 1);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  // Scale: starts zoomed in, scales to normal
  const scale = useTransform(
    scrollYProgress,
    [startOffset, endOffset],
    [1.2, 1]
  );

  // Opacity: fades in
  const opacity = useTransform(
    scrollYProgress,
    [startOffset, startOffset + 0.2],
    [0, 1]
  );

  // Subtle parallax
  const y = useTransform(
    scrollYProgress,
    [startOffset, endOffset],
    [40, 0]
  );

  return (
    <div 
      ref={ref} 
      className="w-full relative"
      style={{ height: `${Math.max(70, 100 - index * 3)}vh` }}
    >
      {/* Progress bar for this image */}
      <div className="absolute top-0 left-0 right-0 z-10 flex items-center gap-4 px-4 py-2 bg-gradient-to-b from-black/60 to-transparent">
        <span className="text-xs text-white/30 font-light tracking-wider">
          {String(index + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
        </span>
        <div className="flex-1 h-0.5 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-white/40"
            style={{
              width: useTransform(
                scrollYProgress,
                [startOffset, endOffset],
                [0, 100]
              )
            }}
          />
        </div>
      </div>

      {/* The image */}
      <motion.div
        style={{
          opacity,
          scale,
          y,
          position: "relative",
          overflow: "hidden",
          width: "100%",
          height: "100%",
          willChange: "transform, opacity",
        }}
      >
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-cover"
        />
        {/* Subtle overlay for depth */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
      </motion.div>
    </div>
  );
};

export default ScrollDrivenFeatured;