"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

interface BackButtonProps {
  className?: string;
  onClick?: () => void;
}

export default function BackButton({
  className = "",
  onClick,
}: BackButtonProps) {
  const router = useRouter();

  const handleBack = () => {
    if (onClick) {
      onClick();
    } else {
      router.back();
    }
  };

  return (
    <button
      onClick={handleBack}
      className={`inline-flex items-center justify-center w-10 h-10 rounded-full font-body text-xs font-bold uppercase tracking-wider bg-black/40 text-cream-100 border border-white/20 backdrop-blur-md hover:bg-black/60 hover:text-luxury-gold transition-all shadow-md active:scale-95 ${className}`}
      aria-label="Go back"
    >
      <ArrowLeft size={18} className="stroke-[2.5]" />
    </button>
  );
}