// src/components/PosterCarousel.tsx
"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import { Product } from "@/lib/types";

interface PosterCarouselProps {
  products: Product[];
  onProductClick: (product: Product) => void;
}

const PosterCarousel: React.FC<PosterCarouselProps> = ({ products, onProductClick }) => {
  const trackRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState(0);
  const [isDesktop, setIsDesktop] = useState(true);
  const targetPositionRef = useRef(0);
  const velocityRef = useRef(0);
  const animationRef = useRef<number>();

  // Check desktop
  useEffect(() => {
    const checkScreen = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };
    checkScreen();
    window.addEventListener('resize', checkScreen);
    return () => window.removeEventListener('resize', checkScreen);
  }, []);

  // Duplicate products for infinite loop
  const loopProducts = [...products, ...products, ...products];

  // Animation Loop (Auto-scroll)
  const animate = useCallback(() => {
    if (!trackRef.current || !wrapperRef.current) return;

    const diff = targetPositionRef.current - position;
    const followSpeed = 0.08;
    const newPosition = position + diff * followSpeed + velocityRef.current;
    setPosition(newPosition);

    velocityRef.current *= 0.95;
    if (Math.abs(velocityRef.current) < 0.001) {
      velocityRef.current = 0;
    }

    if (velocityRef.current === 0) {
      const baseSpeed = isDesktop ? 0.6 : 0.8;
      targetPositionRef.current -= baseSpeed;
    }

    const halfWidth = trackRef.current.scrollWidth / 3;
    if (Math.abs(targetPositionRef.current) > halfWidth) {
      targetPositionRef.current = 0;
      setPosition(0);
    }

    trackRef.current.style.transform = `translateX(${newPosition}px)`;
    animationRef.current = requestAnimationFrame(animate);
  }, [position, isDesktop]);

  // Start animation
  useEffect(() => {
    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [animate]);

  // Touch / Wheel support
  useEffect(() => {
    const wrapperEl = wrapperRef.current;
    if (!wrapperEl) return;

    let touchStartX = 0;

    // Mouse Wheel (Desktop only)
    const handleWheel = (e: WheelEvent) => {
      if (!isDesktop) return;
      e.preventDefault();
      const delta = Math.abs(e.deltaY) > Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
      targetPositionRef.current -= delta;
    };

    // Touch (Mobile)
    const handleTouchStart = (e: TouchEvent) => {
      touchStartX = e.touches[0].clientX;
      velocityRef.current = 0;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (isDesktop) return;
      const touchEndX = e.touches[0].clientX;
      const delta = touchEndX - touchStartX;
      targetPositionRef.current -= delta;
      touchStartX = touchEndX;
    };

    wrapperEl.addEventListener('wheel', handleWheel, { passive: false });
    wrapperEl.addEventListener('touchstart', handleTouchStart, { passive: true });
    wrapperEl.addEventListener('touchmove', handleTouchMove, { passive: true });

    return () => {
      wrapperEl.removeEventListener('wheel', handleWheel);
      wrapperEl.removeEventListener('touchstart', handleTouchStart);
      wrapperEl.removeEventListener('touchmove', handleTouchMove);
    };
  }, [isDesktop]);

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
    <div className="relative w-full bg-transparent overflow-hidden py-4">
      <div
        ref={wrapperRef}
        className="relative w-full overflow-hidden"
        style={{ height: isDesktop ? '420px' : '320px' }}
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

        {/* Cards - PURE CSS FLEX CONTAINER */}
        <div
          ref={trackRef}
          className="flex items-center absolute left-0 will-change-transform"
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
                className="flex-shrink-0 rounded-sm overflow-hidden shadow-xl cursor-pointer"
                style={{
                  width: isDesktop ? '320px' : '220px', // WIDER CARDS
                  height: isDesktop ? '400px' : '300px',
                  marginRight: isDesktop ? '50px' : '30px',
                }}
                onClick={() => onProductClick(product)}
              >
                {/* Changed object-cover to object-contain so NO CROPPING, Removed bg-black/20 */}
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