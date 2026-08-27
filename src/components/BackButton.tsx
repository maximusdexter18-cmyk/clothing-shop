"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

interface BackButtonProps {
  className?: string;
  label?: string;
  onClick?: () => void;
}

export default function BackButton({
  className = "",
  label = "Back",
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
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-body text-xs font-bold uppercase tracking-wider bg-black/40 text-cream-100 border border-white/20 backdrop-blur-md hover:bg-black/60 hover:text-luxury-gold transition-all shadow-md active:scale-95 ${className}`}
      aria-label="Go back"
    >
      <ArrowLeft size={16} className="stroke-[2.5]" />
      <span>{label}</span>
    </button>
  );
}