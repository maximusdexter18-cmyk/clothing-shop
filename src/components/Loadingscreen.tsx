"use client";

import { motion } from "framer-motion";

export default function LoadingScreen() {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed inset-0 z-[9999] bg-white flex items-center justify-center"
    >
      <div className="flex flex-col items-center justify-center">
        
        {/* THIS IS THE LOGO - Updated to adidas.jpg */}
        <img 
          src="/adidas.jpg" 
          alt="Loading..." 
          className="w-40 h-auto object-contain"
          onError={(e) => {
            // If image fails to load, hide it and show text instead!
            (e.target as HTMLImageElement).style.display = 'none';
            const parent = (e.target as HTMLImageElement).parentElement;
            if (parent) {
              const text = document.createElement('p');
              text.innerText = 'clothing shop';
              text.className = 'font-display text-4xl font-bold text-gray-800';
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
  );
}