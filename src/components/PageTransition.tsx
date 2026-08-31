"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export default function PageTransition() {
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true); // Start as TRUE so it shows first

  useEffect(() => {
    // Reset loading to true every time pathname changes
    setIsLoading(true);

    // Wait for the page to fully load (800ms, or adjust if needed)
    const timer = setTimeout(() => setIsLoading(false), 800);

    // Cleanup
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
            {/* REPLACE WITH YOUR LOGO */}
            <img 
              src="adidas.jpg" 
              alt="Loading..." 
              className="w-40 h-auto object-contain" 
            />
            {/* Loading Bar */}
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