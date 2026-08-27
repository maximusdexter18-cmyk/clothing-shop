"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export default function PageTransition() {
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Show overlay when route changes
    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), 800); 
    // 800ms covers most page loads in your app, adjust if needed
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
          className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-md flex items-center justify-center"
        >
          <div className="w-12 h-12 border-4 border-luxury-gold border-t-transparent rounded-full animate-spin" />
        </motion.div>
      )}
    </AnimatePresence>
  );
}