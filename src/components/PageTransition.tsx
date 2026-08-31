"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export default function PageTransition() {
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Show loader on route change
    setIsLoading(true);

    // Safety: Never block scrolling! Just let it fade out after 500ms.
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500); // Shortened to 500ms so it doesn't annoy users

    return () => clearTimeout(timer);
  }, [pathname]);

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }} // This fades it out
          transition={{ duration: 0.3 }}
          className="pointer-events-none fixed inset-0 z-[9999] bg-white flex items-center justify-center"
        >
          <div className="flex flex-col items-center">
            <img 
              src="/adidas.jpg" 
              alt="Loading..." 
              className="w-40 h-auto object-contain" 
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