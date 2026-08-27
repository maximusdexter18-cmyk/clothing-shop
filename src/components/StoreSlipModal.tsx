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

    try {
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
          scale: 2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: "#FAF7F2",
          logging: false,
        });

        const imgData = canvas.toDataURL("image/png");
        const imgWidth = pdfWidth - 20; // 10mm margins on each side
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        if (i > 0) pdf.addPage();
        pdf.addImage(imgData, "PNG", 10, 10, imgWidth, imgHeight);
      }

      return pdf;
    } catch (err) {
      console.error("PDF generation failed:", err);
      return null;
    }
  };

  const handleDownloadPDF = async () => {
    try {
      setDownloading(true);
      const pdf = await generatePDF();
      if (pdf) {
        pdf.save(`Curated_Slip_${Date.now()}.pdf`);
        setDownloadSuccess(true);
        setTimeout(() => setDownloadSuccess(false), 2500);
      } else {
        alert("Sorry, the PDF could not be generated. Please try again.");
      }
    } catch (err) {
      console.error("Download error:", err);
      alert("Sorry, there was an error downloading the PDF.");
    } finally {
      setDownloading(false);
    }
  };

  const handleSharePDF = async () => {
    try {
      setDownloading(true);
      const pdf = await generatePDF();
      if (!pdf) {
        alert("Sorry, the PDF could not be generated. Please try again.");
        return;
      }

      const pdfBlob = pdf.output("blob");
      const file = new File([pdfBlob], `Curated_Slip.pdf`, { type: "application/pdf" });

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
      console.error("Share error:", err);
      alert("Sorry, sharing is not supported on this device. Downloading instead...");
      handleDownloadPDF();
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
        <div className="w-full bg-[#FAF7F2] border border-luxury-brown/20 rounded-xl p-3 shadow-lg select-none relative overflow-hidden flex flex-col gap-3">
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
                style={{ width: "210mm", minHeight: "297mm", padding: "10mm", boxSizing: "border-box" }}
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

// Render helper: 50% Image Left, 50% Details Right
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

  // ========== PDF LAYOUT (Split 50/50) ==========
  if (isPdfExport) {
    return (
      <div className="w-full h-full flex flex-col bg-[#FAF7F2] text-[#3D2B1F] border-2 border-[#3D2B1F]/20 rounded-2xl box-border">
        {/* Top Bar (Full Width) */}
        <div className="flex items-center justify-between p-4 border-b border-[#3D2B1F]/10">
          <span className="font-mono text-xs font-bold tracking-[0.2em] text-[#3D2B1F]">OG WEAR • CURATED SLIP</span>
          <span className="font-mono text-xs text-[#3D2B1F]/60">{dateString} • {refId}</span>
        </div>

        {/* 50/50 Split Content */}
        <div className="flex flex-1">
          
          {/* LEFT HALF - IMAGE */}
          <div className="w-1/2 p-4 flex items-center justify-center bg-white border-r border-[#3D2B1F]/10">
            <div className="relative w-full h-full flex items-center justify-center">
              <img
                src={fullBodyImg}
                alt={item.product.name}
                className="max-h-full max-w-full object-contain mix-blend-multiply"
                crossOrigin="anonymous"
              />
              
              {isDiscounted && (
                <div className="absolute top-2 right-2 bg-[#3D2B1F] text-[#FAF7F2] text-xs font-extrabold px-3 py-1 rounded-full rotate-3 shadow">
                  -{discountPercent}%
                </div>
              )}
            </div>
          </div>

          {/* RIGHT HALF - DETAILS */}
          <div className="w-1/2 p-6 flex flex-col justify-center space-y-6">
            <div>
              {item.product.brand?.name && (
                <span className="font-sans text-[10px] font-bold text-[#C5A55A] uppercase tracking-[0.2em] block">
                  {item.product.brand.name}
                </span>
              )}
              <h2 className="font-serif text-3xl font-bold leading-tight text-[#3D2B1F] mt-2">
                {item.product.name}
              </h2>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center border-b border-[#3D2B1F]/10 pb-2">
                <span className="text-xs font-bold uppercase">Size Selected</span>
                <span className="font-sans text-xl font-extrabold text-[#C5A55A]">{selectedSize}</span>
              </div>
              
              <div className="flex justify-between items-center border-b border-[#3D2B1F]/10 pb-2">
                <span className="text-xs font-bold uppercase">Quantity</span>
                <span className="font-sans text-xl font-extrabold">{item.quantity}</span>
              </div>

              <div className="flex justify-between items-center pt-2">
                <span className="text-xs font-bold uppercase">Final Price</span>
                <div className="text-right">
                  <div className="font-serif text-2xl font-extrabold text-[#3D2B1F]">
                    ₹{finalPrice.toFixed(0)}
                  </div>
                  {isDiscounted && (
                    <span className="text-xs text-[#3D2B1F]/40 line-through block">
                      ₹{originalPrice.toFixed(0)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Checkmark Bar */}
        <div className="p-4 border-t border-[#3D2B1F]/10 flex items-center justify-between">
          <span className="text-xs font-bold text-[#3D2B1F]/60">Picked for easy item identification</span>
          <div className="flex items-center gap-1 text-xs font-extrabold text-emerald-600">
            <Check size={14} /> FOUND
          </div>
        </div>
      </div>
    );
  }

  // ========== MODAL PREVIEW (Split 50/50) ==========
  return (
    <div className="flex flex-col space-y-3">
      {/* Top Bar */}
      <div className="flex items-center justify-between border-b border-luxury-brown/10 pb-2">
        <span className="font-mono text-[10px] font-bold tracking-[0.15em] text-luxury-brown">OG WEAR • CURATED SLIP</span>
        <span className="font-mono text-[9px] text-luxury-brown/60">{dateString} • {refId}</span>
      </div>

      {/* 50/50 Content */}
      <div className="flex flex-row gap-3">
        {/* Left: Image */}
        <div className="w-1/2 bg-white rounded-lg border border-cream-300 p-2 flex items-center justify-center relative" style={{ minHeight: "280px" }}>
          <img
            src={fullBodyImg}
            alt={item.product.name}
            className="max-h-full max-w-full object-contain mix-blend-multiply"
            crossOrigin="anonymous"
          />
          {isDiscounted && (
            <div className="absolute top-2 right-2 bg-luxury-brown text-cream-100 text-[10px] font-extrabold px-2 py-1 rounded-full rotate-3 shadow">
              -{discountPercent}%
            </div>
          )}
        </div>

        {/* Right: Details */}
        <div className="w-1/2 flex flex-col justify-center space-y-3">
          <div>
            {item.product.brand?.name && (
              <span className="font-body text-[10px] font-bold text-luxury-gold uppercase tracking-[0.15em] block">
                {item.product.brand.name}
              </span>
            )}
            <h3 className="font-display text-xl font-bold text-luxury-brown mt-1">
              {item.product.name}
            </h3>
          </div>

          <div className="flex justify-between items-center border-b border-cream-200 pb-2">
            <span className="text-[10px] font-bold uppercase text-luxury-brown/60">Size</span>
            <span className="font-body text-lg font-extrabold text-luxury-gold">{selectedSize}</span>
          </div>

          <div className="flex justify-between items-center border-b border-cream-200 pb-2">
            <span className="text-[10px] font-bold uppercase text-luxury-brown/60">Qty</span>
            <span className="font-body text-lg font-extrabold text-luxury-brown">{item.quantity}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold uppercase text-luxury-brown/60">Price</span>
            <div className="text-right">
              <span className="font-display text-xl font-extrabold text-luxury-brown block">
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
      </div>

      {/* Check Button */}
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