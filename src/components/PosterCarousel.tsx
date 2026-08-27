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
  const [isDesktop, setIsDesktop] = useState(true);

  const dragStartXRef = useRef(0);
  const dragStartPosRef = useRef(0);
  const rafRef = useRef<number>();
  const productsRef = useRef(products);

  useEffect(() => {
    productsRef.current = products;
  }, [products]);

  const loopProducts = [...products, ...products, ...products, ...products];

  const getImageUrl = (product: Product) => {
    return (
      product.images?.filter((img) => img.image_type === "full-body")[0]?.image_url ||
      product.images?.find((img) => img.is_primary)?.image_url ||
      product.images?.[0]?.image_url ||
      "/placeholder.png"
    );
  };

  const getSetWidth = useCallback(() => {
    return (cardWidth + (isDesktop ? 50 : 30)) * productsRef.current.length;
  }, [cardWidth, isDesktop]);

  const normalizePosition = useCallback((pos: number) => {
    const setWidth = getSetWidth();
    if (setWidth === 0) return pos;
    const wrapped = ((pos % setWidth) + setWidth) % setWidth;
    return -wrapped; 
  }, [getSetWidth]);

  useEffect(() => {
    const updateMetrics = () => {
      setIsDesktop(window.innerWidth >= 1024);
      setCardWidth(window.innerWidth < 768 ? 280 : 450);
    };
    updateMetrics();
    window.addEventListener("resize", updateMetrics);
    return () => window.removeEventListener("resize", updateMetrics);
  }, []);

  const animate = useCallback(() => {
    if (!isDragging && !isPaused) {
      const baseSpeed = isDesktop ? 0.8 : 0.5;
      setPosition((prev) => normalizePosition(prev - baseSpeed));
    }
    rafRef.current = requestAnimationFrame(animate);
  }, [isDragging, isPaused, isDesktop, normalizePosition]);

  useEffect(() => {
    rafRef.current = requestAnimationFrame(animate);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [animate]);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (!isDesktop) return;
    const delta = e.deltaY || e.deltaX;
    setPosition((prev) => normalizePosition(prev - delta));
  }, [isDesktop, normalizePosition]);

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

  const handleMouseUp = () => setIsDragging(false);

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

  const handleTouchEnd = () => setIsDragging(false);

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
    <div className="relative w-full bg-transparent py-10 overflow-hidden">
      {/* Carousel Container - MIN HEIGHT SET SO IT NEVER OVERLAPS */}
      <div
        ref={containerRef}
        className="relative w-full overflow-hidden"
        style={{ 
          minHeight: isDesktop ? '500px' : '350px', 
          perspective: "1200px",
          display: 'flex',
          alignItems: 'center' // Centers images vertically
        }}
      >
        {/* Arrow Buttons - Never hidden, perfectly centered */}
        <div className="absolute top-1/2 left-0 right-0 z-50 flex justify-between px-2 sm:px-4 pointer-events-none -translate-y-1/2">
          <button
            onClick={() => scrollByCard("left")}
            className="pointer-events-auto flex items-center justify-center w-12 h-12 rounded-full bg-black/60 text-white border border-white/20 backdrop-blur-md hover:bg-luxury-gold hover:text-black transition-all duration-300"
            aria-label="Scroll left"
          >
            <ChevronLeft size={24} />
          </button>
          <button
            onClick={() => scrollByCard("right")}
            className="pointer-events-auto flex items-center justify-center w-12 h-12 rounded-full bg-black/60 text-white border border-white/20 backdrop-blur-md hover:bg-luxury-gold hover:text-black transition-all duration-300"
            aria-label="Scroll right"
          >
            <ChevronRight size={24} />
          </button>
        </div>

        {/* Track - Items centered (items-center) */}
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
                style={{ width: cardWidth }}
                onClick={() => onProductClick(product)}
              >
                <div className="relative w-full h-auto rounded-[24px] overflow-hidden shadow-2xl transition-transform duration-300 hover:scale-105">
                  <img
                    src={imageUrl}
                    alt={product.name}
                    draggable={false}
                    className="w-full h-auto object-contain block"
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