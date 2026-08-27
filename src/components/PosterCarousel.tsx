"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import { Product } from "@/lib/types";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PosterCarouselProps {
  products: Product[];
  onProductClick: (product: Product) => void;
}

const PosterCarousel: React.FC<PosterCarouselProps> = ({ products, onProductClick }) => {
  const trackRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [isDragging, setIsDragging] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  const [scrollLeftStart, setScrollLeftStart] = useState(0);
  const [autoScrollPaused, setAutoScrollPaused] = useState(false);

  const [cardWidth, setCardWidth] = useState(450);
  const [viewportWidth, setViewportWidth] = useState(0);
  const [isDesktop, setIsDesktop] = useState(true);

  // Duplicate products for infinite loop
  const loopProducts = [...products, ...products, ...products];

  const getImageUrl = (product: Product) => {
    return product.images?.filter((img) => img.image_type === "full-body")[0]?.image_url ||
      product.images?.find((img) => img.is_primary)?.image_url ||
      product.images?.[0]?.image_url ||
      "/placeholder.png";
  };

  // Update dimensions - HUGE CARDS
  useEffect(() => {
    const updateMetrics = () => {
      setIsDesktop(window.innerWidth >= 1024);
      setViewportWidth(window.innerWidth);
      setCardWidth(window.innerWidth < 768 ? 280 : 450);
    };
    updateMetrics();
    window.addEventListener("resize", updateMetrics);
    return () => window.removeEventListener("resize", updateMetrics);
  }, []);

  // Center Spotlight 3D
  const updateSpotlight = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;

    const cards = el.querySelectorAll<HTMLElement>(".carousel-card");
    const center = viewportWidth / 2;

    cards.forEach((card) => {
      const cardCenter = card.offsetLeft - el.scrollLeft + card.offsetWidth / 2;
      const distance = Math.abs(cardCenter - center);
      
      const maxDistance = viewportWidth / 2 + cardWidth;
      const normalizedDistance = Math.min(distance / maxDistance, 1);

      const scale = 1.1 - (normalizedDistance * 0.35);
      const rotateY = normalizedDistance * -25;
      const translateZ = normalizedDistance * -100;

      card.style.transform = `perspective(1200px) scale(${scale}) rotateY(${rotateY}deg) translateZ(${translateZ}px)`;
      card.style.opacity = `${1 - (normalizedDistance * 0.4)}`;
      card.style.zIndex = `${10 - Math.round(normalizedDistance * 10)}`;
    });
  }, [viewportWidth, cardWidth]);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;

    const handleScroll = () => updateSpotlight();
    el.addEventListener("scroll", handleScroll, { passive: true });
    updateSpotlight();
    
    return () => el.removeEventListener("scroll", handleScroll);
  }, [updateSpotlight]);

  // Infinite Auto-Scroll (Mobile + Desktop)
  useEffect(() => {
    if (isDragging || autoScrollPaused) return;

    const el = trackRef.current;
    if (!el) return;

    let animationFrameId: number;
    const scroll = () => {
      el.scrollLeft += 0.8;
      
      const halfWidth = el.scrollWidth / 3;
      if (el.scrollLeft >= halfWidth) {
        el.scrollLeft = 0;
      }
      animationFrameId = requestAnimationFrame(scroll);
    };
    
    animationFrameId = requestAnimationFrame(scroll);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isDragging, autoScrollPaused]);

  // ========== DRAG / SWIPE ==========
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setAutoScrollPaused(true);
    setDragStartX(e.pageX);
    setScrollLeftStart(trackRef.current?.scrollLeft || 0);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    const walk = (e.pageX - dragStartX);
    if (trackRef.current) {
      trackRef.current.scrollLeft = scrollLeftStart - walk;
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setAutoScrollPaused(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    setAutoScrollPaused(true);
    setDragStartX(e.touches[0].pageX);
    setScrollLeftStart(trackRef.current?.scrollLeft || 0);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const walk = (e.touches[0].pageX - dragStartX);
    if (trackRef.current) {
      trackRef.current.scrollLeft = scrollLeftStart - walk;
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    setAutoScrollPaused(false);
  };

  // ========== ARROW BUTTONS ==========
  const scrollLeft = () => {
    if (trackRef.current) {
      trackRef.current.scrollBy({ left: -cardWidth - 50, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (trackRef.current) {
      trackRef.current.scrollBy({ left: cardWidth + 50, behavior: "smooth" });
    }
  };

  if (!products || products.length === 0) {
    return <div className="flex items-center justify-center h-32 bg-transparent"><p className="text-sm text-white/40">No products available</p></div>;
  }

  return (
    <div 
      ref={containerRef}
      className="relative w-full flex items-center justify-center overflow-hidden py-6"
      style={{ perspective: "1200px", height: isDesktop ? '650px' : '500px' }}
    >
      {/* Arrow Buttons */}
      <button
        onClick={scrollLeft}
        className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-50 p-3 rounded-full bg-black/50 text-white border border-white/20 backdrop-blur-md hover:bg-luxury-gold hover:text-luxury-brown transition-all"
        aria-label="Scroll left"
      >
        <ChevronLeft size={24} />
      </button>
      <button
        onClick={scrollRight}
        className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-50 p-3 rounded-full bg-black/50 text-white border border-white/20 backdrop-blur-md hover:bg-luxury-gold hover:text-luxury-brown transition-all"
        aria-label="Scroll right"
      >
        <ChevronRight size={24} />
      </button>

      {/* Background Letters */}
      <div className="absolute inset-0 pointer-events-none z-0 flex items-center justify-center">
        <div className="relative w-full h-full">
          <div className="absolute top-8 left-10 text-4xl md:text-6xl font-serif font-light text-white/10 select-none">S</div>
          <div className="absolute top-8 right-10 text-3xl md:text-5xl font-serif font-light text-white/10 select-none">(O)</div>
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-4xl md:text-6xl font-serif font-light text-white/10 select-none">F</div>
          <div className="absolute bottom-8 right-10 text-4xl md:text-6xl font-serif font-light text-white/10 select-none">IA</div>
        </div>
      </div>

      <div
        ref={trackRef}
        className="flex items-center gap-8 overflow-x-auto w-full h-full"
        style={{
          scrollBehavior: isDragging ? "auto" : "smooth",
          WebkitOverflowScrolling: "touch",
          overflowY: "hidden",
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          cursor: isDragging ? "grabbing" : "grab",
          paddingLeft: viewportWidth / 2 - cardWidth / 2,
          paddingRight: viewportWidth / 2 - cardWidth / 2,
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {loopProducts.map((product, index) => {
          const imageUrl = getImageUrl(product);

          return (
            <div
              key={`${product.id}-${index}`}
              className="carousel-card flex-shrink-0 cursor-pointer"
              style={{
                width: cardWidth,
                height: isDesktop ? 550 : 400,
                transition: "transform 0.3s ease, opacity 0.3s ease",
                transformStyle: "preserve-3d",
                willChange: "transform, opacity",
              }}
              onClick={() => onProductClick(product)}
            >
              <div className="relative w-full h-full rounded-[32px] overflow-hidden">
                <img
                  src={imageUrl}
                  alt={product.name}
                  draggable={false}
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-20 text-[10px] tracking-[0.2em] text-white/60 animate-pulse pointer-events-none hidden md:block">
        ← scroll →
      </div>
    </div>
  );
};

export default PosterCarousel;