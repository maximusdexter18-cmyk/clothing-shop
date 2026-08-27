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
  const hasInitializedPosition = useRef(false);

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

  // Single source of truth for gap, used everywhere so desktop/mobile never drift apart
  const gap = isDesktop ? 50 : 30;
  const step = cardWidth + gap;
  const setWidth = step * productsRef.current.length;

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

  // Start already one full set deep into the loop, so there's always a
  // full "previous" set sitting to the left from the very first frame —
  // this is what makes it look circular immediately instead of only after scrolling.
  useEffect(() => {
    if (!hasInitializedPosition.current && viewportWidth > 0 && products.length > 0) {
      const initialStep = cardWidth + (isDesktop ? 50 : 30);
      setPosition(-(initialStep * products.length));
      hasInitializedPosition.current = true;
    }
  }, [viewportWidth, cardWidth, isDesktop, products.length]);

  // ========== AUTO-SCROLL (60fps) ==========
  const animate = useCallback(() => {
    if (!isDragging && !isPaused) {
      const baseSpeed = isDesktop ? 0.8 : 0.5;
      setPosition((prev) => {
        const currentGap = isDesktop ? 50 : 30;
        const currentStep = cardWidth + currentGap;
        const currentSetWidth = currentStep * productsRef.current.length;
        let next = prev - baseSpeed;

        // Seamless wrap: once we've drifted a full set past our starting offset,
        // snap back by exactly one set width — since the sets are identical,
        // this snap is visually invisible.
        if (Math.abs(next) >= currentSetWidth * 2) {
          next += currentSetWidth;
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

  // ========== WHEEL: trackpad-only (horizontal gesture), mouse wheel ignored ==========
  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      if (!isDesktop) return;
      // A traditional mouse wheel only ever produces vertical deltaY with deltaX at 0.
      // A trackpad's two-finger horizontal swipe produces a real deltaX — that's the
      // only signal we act on, so plain mouse-wheel spinning no longer moves the carousel.
      if (e.deltaX === 0) return;

      setPosition((prev) => {
        let next = prev - e.deltaX;
        if (Math.abs(next) >= setWidth * 2) {
          next += setWidth;
        }
        return next;
      });
    },
    [isDesktop, setWidth]
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
    const moveBy = direction === "left" ? step : -step;

    setPosition((prev) => {
      let next = prev + moveBy;
      if (Math.abs(next) >= setWidth * 2) {
        next += direction === "left" ? -setWidth : setWidth;
      }
      return next;
    });

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

        {/* Track */}
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

        {/* Arrow buttons now overlay the carousel itself, near its bottom edge,
            instead of sitting in normal flow below it where they got pushed
            off-screen by whatever section comes next. */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-6 z-20">
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
    </div>
  );
};

export default PosterCarousel;