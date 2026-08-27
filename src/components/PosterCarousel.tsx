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

  const velocityRef = useRef(0);
  const dragStartXRef = useRef(0);
  const dragStartPosRef = useRef(0);
  const rafRef = useRef<number>();
  const productsRef = useRef(products);

  // Keep products ref updated
  useEffect(() => {
    productsRef.current = products;
  }, [products]);

  // Duplicate products for infinite loop (4x)
  const loopProducts = [...products, ...products, ...products, ...products];

  const getImageUrl = (product: Product) => {
    return (
      product.images?.filter((img) => img.image_type === "full-body")[0]?.image_url ||
      product.images?.find((img) => img.is_primary)?.image_url ||
      product.images?.[0]?.image_url ||
      "/placeholder.png"
    );
  };

  // Update dimensions
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

  // ========== INFINITE LOOP LOGIC (The key fix!) ==========
  const normalizePosition = useCallback((pos: number) => {
    const track = trackRef.current;
    if (!track) return pos;

    // Calculate the width of ONE full set of products (loop size)
    const setWidth = (cardWidth + 50) * productsRef.current.length;

    // Wrap the position into the middle set's range
    // We want it to loop from 0 to setWidth, but always stay within the middle
    if (Math.abs(pos) >= setWidth) {
      // If we go too far right, wrap to start of the next set
      return pos % setWidth;
    }
    
    return pos;
  }, [cardWidth]);

  // ========== AUTO-SCROLL (60fps) ==========
  const animate = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;

    if (!isDragging && !isPaused) {
      const baseSpeed = isDesktop ? 0.8 : 0.5; // Slow glide
      setPosition((prev) => {
        let next = prev - baseSpeed;
        const setWidth = (cardWidth + 50) * productsRef.current.length;
        
        // Seamless wrap: If we go past one full set, jump back to 0
        if (Math.abs(next) >= setWidth) {
          next = 0;
        }
        return next;
      });
    }

    rafRef.current = requestAnimationFrame(animate);
  }, [isDragging, isPaused, isDesktop, cardWidth]);

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
      setPosition((prev) => prev - delta);
    },
    [isDesktop]
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
    setPosition(dragStartPosRef.current + delta);
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
    setPosition(dragStartPosRef.current + delta);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // ========== ARROW BUTTONS ==========
  const scrollByCard = (direction: "left" | "right") => {
    const moveBy = direction === "left" ? cardWidth + 50 : -(cardWidth + 50);
    
    setPosition((prev) => {
      let next = prev + moveBy;
      const setWidth = (cardWidth + 50) * productsRef.current.length;
      
      // Seamless wrap when using arrows
      if (Math.abs(next) >= setWidth) {
        next = next % setWidth;
      }
      return next;
    });

    // Pause briefly for manual interaction
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
      {/* Carousel Container */}
      <div
        ref={containerRef}
        className="relative w-full overflow-hidden"
        style={{ height: isDesktop ? "650px" : "500px", perspective: "1200px" }}
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

        {/* Track (Uses transform for maximum performance) */}
        <div
          ref={trackRef}
          className="flex items-center absolute left-0 will-change-transform"
          style={{
            transform: `translate3d(${position}px, 0, 0)`,
            transition: isDragging || isPaused ? "none" : "transform 0.05s linear",
            gap: isDesktop ? "50px" : "30px",
            paddingLeft: viewportWidth / 2 - cardWidth / 2,
            paddingRight: viewportWidth / 2 - cardWidth / 2,
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
                  height: isDesktop ? 550 : 400,
                  transition: "transform 0.3s ease, opacity 0.3s ease",
                  transformStyle: "preserve-3d",
                  willChange: "transform",
                }}
                onClick={() => onProductClick(product)}
              >
                {/* Fully rounded corners + No cropping (object-contain) */}
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
      </div>

      {/* ========== APPLE-STYLE ARROW BUTTONS (Below Carousel) ========== */}
      <div className="flex items-center justify-center gap-6 mt-6 pb-2">
        <button
          onClick={() => scrollByCard("left")}
          className="flex items-center justify-center w-12 h-12 rounded-full bg-white/10 text-white border border-white/20 backdrop-blur-md hover:bg-white hover:text-black transition-all duration-300"
          aria-label="Scroll left"
        >
          <ChevronLeft size={24} />
        </button>
        <button
          onClick={() => scrollByCard("right")}
          className="flex items-center justify-center w-12 h-12 rounded-full bg-white/10 text-white border border-white/20 backdrop-blur-md hover:bg-white hover:text-black transition-all duration-300"
          aria-label="Scroll right"
        >
          <ChevronRight size={24} />
        </button>
      </div>
    </div>
  );
};

export default PosterCarousel;