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

  const [position, setPosition] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  
  const [cardWidth, setCardWidth] = useState(450);
  const [viewportWidth, setViewportWidth] = useState(0);
  const [isDesktop, setIsDesktop] = useState(true);

  const dragStartXRef = useRef(0);
  const dragStartPosRef = useRef(0);
  const rafRef = useRef<number>();
  const productsRef = useRef(products);

  // Keep products ref updated
  useEffect(() => {
    productsRef.current = products;
  }, [products]);

  // Duplicate products 4x for seamless ring
  const loopProducts = [...products, ...products, ...products, ...products];

  const getImageUrl = (product: Product) => {
    return (
      product.images?.filter((img) => img.image_type === "full-body")[0]?.image_url ||
      product.images?.find((img) => img.is_primary)?.image_url ||
      product.images?.[0]?.image_url ||
      "/placeholder.png"
    );
  };

  // ========== SEAMLESS CIRCLE LOGIC ==========
  const getSetWidth = useCallback(() => {
    return (cardWidth + (isDesktop ? 50 : 30)) * productsRef.current.length;
  }, [cardWidth, isDesktop]);

  const normalizePosition = useCallback((pos: number) => {
    const setWidth = getSetWidth();
    if (setWidth === 0) return pos;
    
    // Wrap position to stay within [-setWidth, 0] range
    const wrapped = ((pos % setWidth) + setWidth) % setWidth;
    return -wrapped; // Keeps it in negative range so it goes left
  }, [getSetWidth]);

  useEffect(() => {
    const updateMetrics = () => {
      const isLarge = window.innerWidth >= 1024;
      setIsDesktop(isLarge);
      setViewportWidth(window.innerWidth);
      setCardWidth(window.innerWidth < 768 ? 280 : 450);
    };
    updateMetrics();
    window.addEventListener("resize", updateMetrics);
    return () => window.removeEventListener("resize", updateMetrics);
  }, []);

  // ========== AUTO-SCROLL (NO JUMPING - Always smooth) ==========
  const animate = useCallback(() => {
    if (!isDragging && !isPaused) {
      const baseSpeed = isDesktop ? 0.8 : 0.5;
      setPosition((prev) => {
        // Normalize so it never goes below -setWidth or above 0
        return normalizePosition(prev - baseSpeed);
      });
    }

    rafRef.current = requestAnimationFrame(animate);
  }, [isDragging, isPaused, isDesktop, normalizePosition]);

  useEffect(() => {
    rafRef.current = requestAnimationFrame(animate);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [animate]);

  // ========== DRAG / TOUCH / WHEEL ==========
  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      if (!isDesktop) return;
      const delta = e.deltaY || e.deltaX;
      setPosition((prev) => normalizePosition(prev - delta));
    },
    [isDesktop, normalizePosition]
  );

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    dragStartXRef.current = e.clientX;
    dragStartPosRef.current = position;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const delta = e.clientX - dragStartXRef.current;
    setPosition(normalizePosition(dragStartPosRef.current + delta));
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    dragStartXRef.current = e.touches[0].clientX;
    dragStartPosRef.current = position;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const delta = e.touches[0].clientX - dragStartXRef.current;
    setPosition(normalizePosition(dragStartPosRef.current + delta));
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // ========== ARROW BUTTONS ==========
  const scrollByCard = (direction: "left" | "right") => {
    const moveBy = direction === "left" ? cardWidth + (isDesktop ? 50 : 30) : -(cardWidth + (isDesktop ? 50 : 30));
    setPosition((prev) => normalizePosition(prev + moveBy));

    setIsPaused(true);
    setTimeout(() => setIsPaused(false), 1500);
  };

  if (!products || products.length === 0) {
    return (
      <div className="flex items-center justify-center h-32 bg-transparent">
        <p className="text-sm text-white/40">No products available</p>
      </div>
    );
  }

  return (
    <div className="relative w-full bg-transparent">
      {/* Carousel Container - No fixed height, allows full image visibility */}
      <div
        ref={containerRef}
        className="relative w-full overflow-hidden py-10"
        style={{ perspective: "1200px" }}
      >
        {/* Arrow Buttons - ABSOLUTE, always visible on the sides */}
        <button
          onClick={() => scrollByCard("left")}
          className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-50 flex items-center justify-center w-12 h-12 rounded-full bg-white/10 text-white border border-white/20 backdrop-blur-md hover:bg-white hover:text-black transition-all duration-300"
          aria-label="Scroll left"
        >
          <ChevronLeft size={24} />
        </button>
        <button
          onClick={() => scrollByCard("right")}
          className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-50 flex items-center justify-center w-12 h-12 rounded-full bg-white/10 text-white border border-white/20 backdrop-blur-md hover:bg-white hover:text-black transition-all duration-300"
          aria-label="Scroll right"
        >
          <ChevronRight size={24} />
        </button>

        {/* Track - Uses translate3d, NO PADDING so edges touch */}
        <div
          ref={trackRef}
          className="flex items-center absolute left-0 will-change-transform"
          style={{
            transform: `translate3d(${position}px, 0, 0)`,
            transition: isDragging || isPaused ? "none" : "transform 0.05s linear",
            gap: isDesktop ? "50px" : "30px",
            cursor: isDragging ? "grabbing" : "grab",
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onWheel={handleWheel}
        >
          {loopProducts.map((product, index) => {
            const imageUrl = getImageUrl(product);

            return (
              <div
                key={`${product.id}-${index}`}
                className="flex-shrink-0 cursor-pointer"
                style={{
                  width: cardWidth,
                  height: isDesktop ? 'auto' : 'auto', // Auto height to prevent cropping!
                  minHeight: isDesktop ? '450px' : '300px', // Set minimum but allow growth
                }}
                onClick={() => onProductClick(product)}
              >
                {/* Fully rounded, NO crop, NO fixed height */}
                <div className="relative w-full h-auto rounded-[32px] overflow-hidden shadow-xl transition-transform duration-300 hover:scale-105">
                  <img
                    src={imageUrl}
                    alt={product.name}
                    draggable={false}
                    className="w-full h-auto object-contain"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default PosterCarousel;