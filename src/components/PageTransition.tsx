"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export default function PageTransition() {
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true); // Starts as true so it shows FIRST

  useEffect(() => {
    // Reset to true on every route change
    setIsLoading(true);

    // Wait exactly 1 second so it covers all data fetching
    const timer = setTimeout(() => setIsLoading(false), 1000);

    return () => clearTimeout(timer);
  }, [pathname]);

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[9999] bg-white flex items-center justify-center"
        >
          <div className="flex flex-col items-center">
            {/* YOUR LOGO HERE - UPDATED TO /adidas.jpg */}
            <img 
              src="/adidas.jpg" 
              alt="Loading..." 
              className="w-40 h-auto object-contain" 
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
                const parent = (e.target as HTMLImageElement).parentElement;
                if (parent) {
                  const text = document.createElement('p');
                  text.innerText = 'OG WEAR';
                  text.className = 'font-display text-3xl font-bold text-gray-800';
                  parent.appendChild(text);
                }
              }}
            />
            <div className="mt-6 w-8 h-1 bg-gray-200 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-gray-400"
                animate={{ x: ["-100%", "100%"] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}