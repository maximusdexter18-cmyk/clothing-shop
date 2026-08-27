// src/components/PosterCarousel.tsx
"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import { Product } from "@/lib/types";

interface PosterCarouselProps {
  products: Product[];
  onProductClick: (product: Product) => void;
}

const PosterCarousel: React.FC<PosterCarouselProps> = ({ products, onProductClick }) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [isDesktop, setIsDesktop] = useState(true);
  const [scrollPos, setScrollPos] = useState(0);

  // Check Desktop
  useEffect(() => {
    const checkScreen = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };
    checkScreen();
    window.addEventListener('resize', checkScreen);
    return () => window.removeEventListener('resize', checkScreen);
  }, []);

  // Duplicate products for infinite loop (visually)
  const loopProducts = [...products, ...products, ...products];

  // Handle Native Scroll (for 3D Arc effect)
  const handleScroll = useCallback(() => {
    if (wrapperRef.current) {
      setScrollPos(wrapperRef.current.scrollLeft);
    }
  }, []);

  // Calculate 3D Arc Transform
  const getArcTransform = (index: number): React.CSSProperties => {
    if (!isDesktop) return {}; // No 3D on mobile to keep swipe smooth

    const wrapper = wrapperRef.current;
    const cardWidth = 320 + 50; // Card width + gap
    const cardCenter = (index * cardWidth) - scrollPos + (cardWidth / 2);
    
    // Center of viewport
    const viewportCenter = (wrapper?.clientWidth || 0) / 2;
    
    // Distance from center
    const distance = cardCenter - viewportCenter;
    
    // Invert rotation so the left card curves right, and right card curves left
    const rotY = Math.max(-25, Math.min(25, -distance / 15)); 

    return {
      transform: `perspective(1000px) rotateY(${rotY}deg)`,
      transformStyle: 'preserve-3d',
    };
  };

  // Auto-scroll effect
  useEffect(() => {
    if (!isDesktop || !wrapperRef.current) return;
    
    let animationFrameId: number;
    
    const scroll = () => {
      const el = wrapperRef.current;
      if (el) {
        // Calculate when to reset to start (0) for infinite loop
        const halfWidth = el.scrollWidth / 3;
        if (el.scrollLeft >= halfWidth) {
          el.scrollLeft = 0;
        } else {
          el.scrollLeft += 0.8; // Very slow auto-scroll
        }
      }
      animationFrameId = requestAnimationFrame(scroll);
    };
    
    animationFrameId = requestAnimationFrame(scroll);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isDesktop]);

  // Reset scroll when products change
  useEffect(() => {
    if (wrapperRef.current) {
      wrapperRef.current.scrollLeft = 0;
    }
  }, [products]);

  if (!products || products.length === 0) {
    return <div className="flex items-center justify-center h-32 bg-transparent"><p className="text-sm text-white/40">No products available</p></div>;
  }

  const getImageUrl = (product: Product) => {
    return product.images?.filter((img) => img.image_type === "full-body")[0]?.image_url ||
      product.images?.find((img) => img.is_primary)?.image_url ||
      product.images?.[0]?.image_url ||
      "/placeholder.png";
  };

  return (
    <div className="relative w-full bg-transparent py-4">
      <div
        ref={wrapperRef}
        onScroll={handleScroll}
        className="relative w-full overflow-x-auto scroll-smooth hide-scrollbar"
        style={{ 
          perspective: '1500px',
          WebkitOverflowScrolling: 'touch', // iOS native scrolling
          height: isDesktop ? '420px' : '320px',
          scrollBehavior: 'smooth',
          touchAction: 'pan-x', // Allows native left/right swipe
        }}
      >
        {/* Background Letters */}
        <div className="absolute inset-0 pointer-events-none z-0 flex items-center justify-center">
          <div className="relative w-full h-full">
            <div className="absolute top-8 left-10 text-4xl md:text-6xl font-serif font-light text-white/10 select-none">S</div>
            <div className="absolute top-8 right-10 text-3xl md:text-5xl font-serif font-light text-white/10 select-none">(O)</div>
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-4xl md:text-6xl font-serif font-light text-white/10 select-none">F</div>
            <div className="absolute bottom-8 right-10 text-4xl md:text-6xl font-serif font-light text-white/10 select-none">IA</div>
          </div>
        </div>

        {/* Cards - Native Scrollable Track */}
        <div
          ref={trackRef}
          className="flex items-center w-max will-change-transform"
          style={{ 
            gap: isDesktop ? '50px' : '30px', 
            padding: isDesktop ? '0 120px' : '0 20px' 
          }}
        >
          {loopProducts.map((product, index) => {
            const imageUrl = getImageUrl(product);

            return (
              <div
                key={`${product.id}-${index}`}
                className="flex-shrink-0 rounded-sm overflow-hidden shadow-xl cursor-pointer transition-transform duration-200"
                style={{
                  width: isDesktop ? '320px' : '220px',
                  height: isDesktop ? '400px' : '300px',
                  marginRight: isDesktop ? '50px' : '30px',
                  ...getArcTransform(index) // Apply the 3D arc effect
                }}
                onClick={() => onProductClick(product)}
              >
                {/* No background color behind image */}
                <img src={imageUrl} alt={product.name} className="w-full h-full object-contain" />
              </div>
            );
          })}
        </div>

        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-20 text-[10px] tracking-[0.2em] text-white/60 animate-pulse pointer-events-none hidden md:block">
          ← scroll →
        </div>
      </div>
    </div>
  );
};

export default PosterCarousel;