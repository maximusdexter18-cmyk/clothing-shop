"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { X, Download, Share2, ChevronLeft, ChevronRight, Check, FileText, Tag } from "lucide-react";
import { CartItem } from "@/lib/cart-context";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

interface StoreSlipModalProps {
  items: CartItem[];
  onClose: () => void;
}

export default function StoreSlipModal({ items, onClose }: StoreSlipModalProps) {
  const [mounted, setMounted] = useState(false);
  const [activePageIndex, setActivePageIndex] = useState(0);
  const [downloading, setDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());

  const hiddenPagesRef = useRef<HTMLDivElement>(null);
  const totalPages = items.length;

  useEffect(() => {
    setMounted(true);
  }, []);

  // Stable Date & Ref ID to avoid SSR hydration mismatches
  const dateString = useMemo(() => {
    return new Date().toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }, []);

  const refId = useMemo(() => {
    return `SLIP-${Math.floor(100000 + Math.random() * 900000)}`;
  }, []);

  const toggleCheck = (productId: string) => {
    setCheckedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(productId)) newSet.delete(productId);
      else newSet.add(productId);
      return newSet;
    });
  };

  const generatePDF = async (): Promise<jsPDF | null> => {
    if (!hiddenPagesRef.current) return null;
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    for (let i = 0; i < items.length; i++) {
      const pageEl = hiddenPagesRef.current.children[i] as HTMLElement;
      if (!pageEl) continue;

      const canvas = await html2canvas(pageEl, {
        scale: 2.5,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#FAF7F2",
        logging: false,
        onclone: (clonedDoc) => {
          const headings = clonedDoc.querySelectorAll("h1, h2, h3, h4, p, span");
          headings.forEach((el) => {
            (el as HTMLElement).style.overflow = "visible";
            (el as HTMLElement).style.lineHeight = "1.4";
          });
        },
      });

      const imgData = canvas.toDataURL("image/png");
      const imgHeight = (canvas.height * pdfWidth) / canvas.width;

      if (i > 0) pdf.addPage();
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, Math.min(imgHeight, pdfHeight));
    }

    return pdf;
  };

  const handleDownloadPDF = async () => {
    try {
      setDownloading(true);
      const pdf = await generatePDF();
      if (pdf) {
        pdf.save(`Curated_Slip_${Date.now()}.pdf`);
        setDownloadSuccess(true);
        setTimeout(() => setDownloadSuccess(false), 2500);
      }
    } catch (err) {
      console.error("Failed to generate PDF slip:", err);
    } finally {
      setDownloading(false);
    }
  };

  const handleSharePDF = async () => {
    try {
      setDownloading(true);
      const pdf = await generatePDF();
      if (!pdf) return;

      const pdfBlob = pdf.output("blob");
      const file = new File([pdfBlob], `Curated_Slip.pdf`, {
        type: "application/pdf",
      });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: `Curated Shopping Slip`,
          text: `Here is my curated list for easy item identification.`,
          files: [file],
        });
        setShareSuccess(true);
        setTimeout(() => setShareSuccess(false), 2500);
      } else {
        handleDownloadPDF();
      }
    } catch (err) {
      console.error("Failed to share PDF slip:", err);
    } finally {
      setDownloading(false);
    }
  };

  if (!mounted) return null;

  const activeItem = items[activePageIndex];
  if (!activeItem) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[110] bg-black/80 flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 30 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 30 }}
        transition={{ type: "spring", stiffness: 260, damping: 24 }}
        onClick={(e) => e.stopPropagation()}
        className="relative bg-cream-50 rounded-2xl w-full max-w-md shadow-2xl border border-cream-200 p-4 sm:p-5 flex flex-col items-center max-h-[92vh] overflow-y-auto"
      >
        {/* Header bar */}
        <div className="w-full flex items-center justify-between pb-3 mb-3 border-b border-cream-200">
          <div className="flex items-center gap-2">
            <FileText className="text-luxury-gold w-5 h-5" />
            <h3 className="font-display text-base font-bold text-luxury-brown">
              Curated Lookbook Slip
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 bg-cream-200 text-luxury-brown rounded-full flex items-center justify-center hover:bg-cream-300 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Page Switcher Navigation */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between w-full mb-3 px-1">
            <button
              onClick={() => setActivePageIndex((prev) => Math.max(0, prev - 1))}
              disabled={activePageIndex === 0}
              className="flex items-center gap-1 text-xs font-bold text-luxury-brown disabled:opacity-30 disabled:cursor-not-allowed hover:text-luxury-gold transition-colors"
            >
              <ChevronLeft size={16} /> Prev Item
            </button>
            <span className="font-body text-xs font-bold text-luxury-brown/80 bg-cream-200 px-3 py-1 rounded-full">
              Item {activePageIndex + 1} of {totalPages}
            </span>
            <button
              onClick={() => setActivePageIndex((prev) => Math.min(totalPages - 1, prev + 1))}
              disabled={activePageIndex === totalPages - 1}
              className="flex items-center gap-1 text-xs font-bold text-luxury-brown disabled:opacity-30 disabled:cursor-not-allowed hover:text-luxury-gold transition-colors"
            >
              Next Item <ChevronRight size={16} />
            </button>
          </div>
        )}

        {/* VISIBLE PAGE PREVIEW */}
        <div className="w-full bg-[#FAF7F2] border border-luxury-brown/20 rounded-xl p-4 shadow-lg flex flex-col text-luxury-brown select-none relative overflow-hidden">
          {renderProductSlipCard(activeItem, activePageIndex, totalPages, dateString, refId, checkedItems.has(activeItem.product.id), toggleCheck)}
        </div>

        {/* Action Buttons: Download PDF & Share PDF */}
        <div className="w-full flex gap-3 mt-4">
          <button
            onClick={handleDownloadPDF}
            disabled={downloading}
            className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-luxury-brown text-cream-100 rounded-full font-body text-xs font-bold uppercase tracking-wider hover:bg-luxury-darkBrown transition-all shadow-md disabled:opacity-50"
          >
            {downloadSuccess ? (
              <>
                <Check size={16} className="text-emerald-400" /> PDF Saved!
              </>
            ) : (
              <>
                <Download size={16} /> Download PDF ({totalPages} {totalPages === 1 ? "Page" : "Pages"})
              </>
            )}
          </button>

          <button
            onClick={handleSharePDF}
            disabled={downloading}
            className="flex items-center justify-center gap-2 py-3 px-4 bg-luxury-gold text-luxury-brown rounded-full font-body text-xs font-bold uppercase tracking-wider hover:bg-amber-400 transition-all shadow-md disabled:opacity-50"
          >
            {shareSuccess ? (
              <>
                <Check size={16} /> Shared!
              </>
            ) : (
              <>
                <Share2 size={16} /> Share PDF
              </>
            )}
          </button>
        </div>

        {/* HIDDEN PAGES CONTAINER (Used for generating multi-page PDF document) */}
        <div className="fixed top-[-9999px] left-[-9999px] pointer-events-none opacity-0">
          <div ref={hiddenPagesRef}>
            {items.map((item, idx) => (
              <div
                key={`pdf-page-${item.product.id}-${idx}`}
                style={{ width: "210mm", minHeight: "297mm", padding: "12mm", boxSizing: "border-box" }}
                className="bg-[#FAF7F2] text-luxury-brown flex flex-col justify-between"
              >
                {renderProductSlipCard(item, idx, totalPages, dateString, refId, false, () => {}, true)}
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// Render helper for single product slip card layout
function renderProductSlipCard(
  item: CartItem,
  pageIdx: number,
  totalPages: number,
  dateString: string,
  refId: string,
  isChecked: boolean,
  onToggleCheck?: (id: string) => void,
  isPdfExport = false
) {
  const fullBodyImg =
    item.product.images?.find((img) => img.image_type === "full-body")?.image_url ||
    item.imageUrl ||
    item.product.images?.find((img) => img.is_primary)?.image_url ||
    item.product.images?.[0]?.image_url ||
    "/placeholder.png";

  const isDiscounted = item.product.is_discounted && item.product.discount_price;
  const originalPrice = item.product.original_price;
  const finalPrice = isDiscounted ? item.product.discount_price! : originalPrice;
  const discountPercent = isDiscounted
    ? Math.round(((originalPrice - finalPrice) / originalPrice) * 100)
    : 0;

  const selectedSize = item.size || "Standard";

  if (isPdfExport) {
    return (
      <div className="w-full h-full bg-[#FAF7F2] p-4 flex flex-col justify-between text-[#3D2B1F] border-2 border-[#3D2B1F]/20 rounded-2xl box-border">
        {/* Top Bar: Elegant Gold Line */}
        <div className="flex flex-col items-center mb-2">
          <div className="w-24 h-[2px] bg-[#C5A55A] mb-2" />
          <span className="font-mono text-xs font-bold text-[#3D2B1F]/70 tracking-[0.2em]">OG WEAR • CURATED SLIP</span>
          <span className="font-mono text-[10px] text-[#3D2B1F]/40">{refId} • {dateString}</span>
        </div>

        {/* HUGE Dominant Product Image Container */}
        <div className="relative w-full flex-1 min-h-[600px] my-2 rounded-2xl overflow-hidden border border-[#3D2B1F]/10 shadow-lg flex items-center justify-center"
             style={{ background: "radial-gradient(circle, #FFFFFF 0%, #F5E6C4 100%)" }}>
          <img
            src={fullBodyImg}
            alt={item.product.name}
            className="max-h-[560px] w-auto max-w-full object-contain mix-blend-multiply"
            crossOrigin="anonymous"
          />
          {/* Discount Badge */}
          {isDiscounted && (
            <div className="absolute top-6 right-6 bg-[#3D2B1F] text-[#F5E6C4] font-sans text-sm font-extrabold px-5 py-2 rounded-full shadow-md rotate-3">
              <Tag size={14} className="inline mr-1" /> {discountPercent}% OFF
            </div>
          )}
          {/* Checked Badge */}
          {isChecked && (
            <div className="absolute top-6 left-6 bg-emerald-600 text-white font-sans text-sm font-extrabold px-5 py-2 rounded-full shadow-md">
              <Check size={14} className="inline mr-1" /> FOUND
            </div>
          )}
        </div>

        {/* Details Box: Elegant Luxury Tag */}
        <div className="bg-white rounded-xl p-6 border border-[#3D2B1F]/10 shadow-sm space-y-4">
          <div className="flex items-start justify-between">
            <div>
              {item.product.brand?.name && (
                <span className="font-sans text-[10px] font-bold text-[#C5A55A] uppercase tracking-[0.2em] block">
                  {item.product.brand.name}
                </span>
              )}
              <h2 className="font-serif text-3xl font-bold text-[#3D2B1F] leading-tight mt-1">
                {item.product.name}
              </h2>
            </div>
          </div>
          <div className="flex items-end justify-between border-t border-[#3D2B1F]/10 pt-4">
            <div className="flex items-center gap-4">
              <span className="bg-[#FAF7F2] border border-[#3D2B1F]/20 px-4 py-2 rounded-xl text-[#3D2B1F] font-sans text-xs font-bold">
                SIZE: <strong className="text-[#C5A55A] text-sm">{selectedSize}</strong>
              </span>
              <span className="bg-[#FAF7F2] border border-[#3D2B1F]/20 px-4 py-2 rounded-xl text-[#3D2B1F] font-sans text-xs font-bold">
                QTY: <strong>{item.quantity}</strong>
              </span>
            </div>
            <div className="text-right">
              <div className="font-serif text-3xl font-extrabold text-[#3D2B1F]">
                ₹{finalPrice.toFixed(0)}
              </div>
              {isDiscounted && (
                <span className="font-sans text-xs text-[#3D2B1F]/40 line-through block">
                  ₹{originalPrice.toFixed(0)}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Modal Screen Preview Layout
  return (
    <div className="flex flex-col space-y-3">
      {/* Elegant Top Bar */}
      <div className="flex flex-col items-center mb-1">
        <div className="w-16 h-[2px] bg-luxury-gold mb-1" />
        <span className="font-mono text-[9px] font-bold text-luxury-brown/60 tracking-[0.2em]">OG WEAR • CURATED SLIP</span>
        <span className="font-mono text-[8px] text-luxury-brown/40">{refId} • {dateString}</span>
      </div>

      {/* BIG Image Container with Gradient */}
      <div className="relative w-full h-80 sm:h-96 rounded-xl overflow-hidden border border-cream-300 flex items-center justify-center"
           style={{ background: "radial-gradient(circle, #FFFFFF 0%, #F5E6C4 100%)" }}>
        <img
          src={fullBodyImg}
          alt={item.product.name}
          className="max-h-full max-w-full object-contain mix-blend-multiply"
          crossOrigin="anonymous"
        />
        {isDiscounted && (
          <div className="absolute top-3 right-3 bg-luxury-brown text-cream-100 font-body text-xs font-extrabold px-4 py-1.5 rounded-full shadow-md rotate-3">
            <Tag size={12} className="inline mr-1" /> {discountPercent}% OFF
          </div>
        )}
        {isChecked && (
          <div className="absolute top-3 left-3 bg-emerald-600 text-white font-body text-xs font-extrabold px-4 py-1.5 rounded-full shadow-md">
            <Check size={12} className="inline mr-1" /> FOUND
          </div>
        )}
      </div>

      {/* Details Box */}
      <div className="bg-white rounded-xl p-4 border border-cream-300 space-y-3">
        <div className="flex items-start justify-between">
          <div>
            {item.product.brand?.name && (
              <span className="font-body text-[9px] font-bold text-luxury-gold uppercase tracking-[0.2em] block">
                {item.product.brand.name}
              </span>
            )}
            <h3 className="font-display text-lg font-bold text-luxury-brown">
              {item.product.name}
            </h3>
          </div>
        </div>
        <div className="flex items-end justify-between border-t border-cream-200 pt-2">
          <div className="flex items-center gap-2">
            <span className="bg-cream-100 border border-cream-300 px-3 py-1.5 rounded-lg">
              Size: <span className="text-luxury-gold font-extrabold">{selectedSize}</span>
            </span>
            <span className="bg-cream-100 border border-cream-300 px-3 py-1.5 rounded-lg">
              Qty: {item.quantity}
            </span>
          </div>
          <div className="text-right">
            <span className="font-display text-2xl font-extrabold text-luxury-brown block">
              ₹{finalPrice.toFixed(0)}
            </span>
            {isDiscounted && (
              <span className="font-body text-[10px] text-luxury-brown/40 line-through">
                ₹{originalPrice.toFixed(0)}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Interactive Check Button */}
      {onToggleCheck && (
        <button
          onClick={() => onToggleCheck(item.product.id)}
          className={`w-full py-3 rounded-full font-body text-xs font-bold uppercase tracking-wider transition-all ${
            isChecked
              ? "bg-emerald-600 text-white"
              : "bg-luxury-brown text-cream-100 hover:bg-luxury-darkBrown"
          }`}
        >
          {isChecked ? "✓ Found in Store" : "Mark as Found"}
        </button>
      )}
    </div>
  );
}