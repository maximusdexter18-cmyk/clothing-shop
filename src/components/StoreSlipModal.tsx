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
        pdf.save(`Product_Catalog_Slip_${Date.now()}.pdf`);
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
      const file = new File([pdfBlob], `Product_Catalog_Slip.pdf`, {
        type: "application/pdf",
      });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: `Product Catalog Slip`,
          text: `Here is the product catalog slip with full image for easy item identification.`,
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
              Product Catalog Slip
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
          {renderProductSlipCard(activeItem, activePageIndex, totalPages, dateString, refId)}
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
                {renderProductSlipCard(item, idx, totalPages, dateString, refId, true)}
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
    // PDF A4 Layout: HUGE product image dominating top 75%, compact details bar at bottom
    return (
      <div className="w-full h-full bg-[#FAF7F2] p-6 flex flex-col justify-between text-[#3D2B1F] border-2 border-[#3D2B1F]/20 rounded-2xl box-border">
        {/* Top Minimal Bar (No Shop Name, just Date & Item Count) */}
        <div className="flex items-center justify-between border-b border-[#3D2B1F]/15 pb-3 mb-2">
          <span className="font-mono text-sm font-bold text-[#3D2B1F]">
            DATE: {dateString}
          </span>
          <span className="font-mono text-sm font-bold text-[#3D2B1F] bg-[#F5E6C4] px-4 py-1 rounded-full">
            ITEM #{pageIdx + 1 < 10 ? `0${pageIdx + 1}` : pageIdx + 1} OF {totalPages}
          </span>
        </div>

        {/* HUGE Dominant Product Image Container */}
        <div className="relative w-full flex-1 min-h-[580px] my-2 rounded-2xl overflow-hidden bg-white border border-[#3D2B1F]/15 shadow-md flex items-center justify-center p-6">
          <img
            src={fullBodyImg}
            alt={item.product.name}
            className="max-h-[540px] w-auto max-w-full object-contain mix-blend-multiply"
            crossOrigin="anonymous"
          />

          {/* Discount Badge overlay on image */}
          {isDiscounted && (
            <div className="absolute top-6 right-6 bg-[#C5A55A] text-[#3D2B1F] font-sans text-sm font-extrabold px-4 py-2 rounded-full shadow flex items-center gap-1.5">
              <Tag size={16} /> {discountPercent}% OFF
            </div>
          )}
        </div>

        {/* Compact Details Box at Bottom */}
        <div className="bg-white rounded-xl p-5 border border-[#3D2B1F]/15 shadow-sm space-y-3 mt-2">
          {/* Row 1: Brand & Product Title */}
          <div className="flex items-baseline justify-between border-b border-[#3D2B1F]/10 pb-2">
            <div>
              {item.product.brand?.name && (
                <span className="font-sans text-xs font-bold text-[#C5A55A] uppercase tracking-wider block">
                  {item.product.brand.name}
                </span>
              )}
              <h2 className="font-serif text-2xl font-bold text-[#3D2B1F] leading-snug">
                {item.product.name}
              </h2>
            </div>
            <div className="text-right">
              <div className="font-serif text-2xl font-extrabold text-[#3D2B1F]">
                ₹{finalPrice.toFixed(0)}
              </div>
              {isDiscounted && (
                <span className="font-sans text-xs text-[#3D2B1F]/50 line-through block">
                  ₹{originalPrice.toFixed(0)}
                </span>
              )}
            </div>
          </div>

          {/* Row 2: Selected Size & Quantity & Ref Code */}
          <div className="flex items-center justify-between text-xs font-bold text-[#3D2B1F]/90">
            <div className="flex items-center gap-3">
              <span className="bg-[#FAF7F2] border border-[#3D2B1F]/20 px-3 py-1.5 rounded-lg">
                SIZE: <strong className="text-[#C5A55A] font-extrabold text-sm">{selectedSize}</strong>
              </span>
              <span className="bg-[#FAF7F2] border border-[#3D2B1F]/20 px-3 py-1.5 rounded-lg">
                QTY: <strong>{item.quantity}</strong>
              </span>
            </div>
            <span className="font-mono text-[11px] text-[#3D2B1F]/60">
              REF: {refId}
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Modal Screen Preview Layout
  return (
    <div className="flex flex-col space-y-3">
      {/* Minimal Date & Item Header (No Shop Name) */}
      <div className="flex items-center justify-between border-b border-luxury-brown/15 pb-2 text-xs font-bold text-luxury-brown">
        <span>DATE: {dateString}</span>
        <span className="bg-cream-200 px-3 py-0.5 rounded-full font-mono">
          ITEM #{pageIdx + 1} OF {totalPages}
        </span>
      </div>

      {/* BIG Image Container */}
      <div className="relative w-full h-80 sm:h-96 rounded-xl overflow-hidden bg-white border border-cream-300 flex items-center justify-center p-3">
        <img
          src={fullBodyImg}
          alt={item.product.name}
          className="max-h-full max-w-full object-contain mix-blend-multiply"
          crossOrigin="anonymous"
        />

        {isDiscounted && (
          <div className="absolute top-3 right-3 bg-luxury-gold text-luxury-brown font-body text-xs font-extrabold px-3 py-1 rounded-full shadow-md flex items-center gap-1">
            <Tag size={12} /> {discountPercent}% OFF
          </div>
        )}
      </div>

      {/* Compact Details Section */}
      <div className="bg-white rounded-xl p-3 border border-cream-300 space-y-2">
        <div className="flex items-baseline justify-between border-b border-cream-200 pb-2">
          <div>
            {item.product.brand?.name && (
              <span className="font-body text-[10px] font-bold text-luxury-gold uppercase tracking-wider block">
                {item.product.brand.name}
              </span>
            )}
            <h3 className="font-display text-base font-bold text-luxury-brown">
              {item.product.name}
            </h3>
          </div>
          <div className="text-right">
            <span className="font-display text-lg font-extrabold text-luxury-brown block">
              ₹{finalPrice.toFixed(0)}
            </span>
            {isDiscounted && (
              <span className="font-body text-[10px] text-luxury-brown/40 line-through">
                ₹{originalPrice.toFixed(0)}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between text-xs font-bold text-luxury-brown">
          <div className="flex items-center gap-2">
            <span className="bg-cream-100 border border-cream-300 px-2.5 py-1 rounded-md">
              Size: <span className="text-luxury-gold font-extrabold">{selectedSize}</span>
            </span>
            <span className="bg-cream-100 border border-cream-300 px-2.5 py-1 rounded-md">
              Qty: {item.quantity}
            </span>
          </div>
          <span className="font-mono text-[10px] text-luxury-brown/50">
            REF: {refId}
          </span>
        </div>
      </div>
    </div>
  );
}