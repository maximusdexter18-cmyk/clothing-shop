"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { X, Download, Share2, ChevronLeft, ChevronRight, Check, FileText, Tag } from "lucide-react";
import { CartItem } from "@/lib/cart-context";
import html2canvas from "html2canvas-pro";
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

  // On-screen browsing (Prev/Next Item) stays one product at a time.
  const totalItems = items.length;

  // PDF pages now hold TWO products each, so the actual PDF page count is half that
  // (rounded up, so an odd item count still gets a page for the leftover one).
  const pdfPageGroups = useMemo(() => {
    const groups: CartItem[][] = [];
    for (let i = 0; i < items.length; i += 2) {
      groups.push(items.slice(i, i + 2));
    }
    return groups;
  }, [items]);
  const pdfPageCount = pdfPageGroups.length;

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

  const generatePDF = async (): Promise<jsPDF | null> => {
    if (!hiddenPagesRef.current) return null;

    try {
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();

      for (let i = 0; i < pdfPageGroups.length; i++) {
        const pageEl = hiddenPagesRef.current.children[i] as HTMLElement;
        if (!pageEl) continue;

        const canvas = await html2canvas(pageEl, {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: "#FAF7F2",
          logging: false,
          onclone: (clonedDoc) => {
            const headings = clonedDoc.querySelectorAll("h1, h2, h3, h4, p, span, img, div");
            headings.forEach((el) => {
              (el as HTMLElement).style.overflow = "visible";
              (el as HTMLElement).style.lineHeight = "1.4";
            });
          },
        });

        const imgData = canvas.toDataURL("image/png");
        const imgWidth = pdfWidth - 20;
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

        {totalItems > 1 && (
          <div className="flex items-center justify-between w-full mb-3 px-1">
            <button
              onClick={() => setActivePageIndex((prev) => Math.max(0, prev - 1))}
              disabled={activePageIndex === 0}
              className="flex items-center gap-1 text-xs font-bold text-luxury-brown disabled:opacity-30 disabled:cursor-not-allowed hover:text-luxury-gold transition-colors"
            >
              <ChevronLeft size={16} /> Prev Item
            </button>
            <span className="font-body text-xs font-bold text-luxury-brown/80 bg-cream-200 px-3 py-1 rounded-full">
              Item {activePageIndex + 1} of {totalItems}
            </span>
            <button
              onClick={() => setActivePageIndex((prev) => Math.min(totalItems - 1, prev + 1))}
              disabled={activePageIndex === totalItems - 1}
              className="flex items-center gap-1 text-xs font-bold text-luxury-brown disabled:opacity-30 disabled:cursor-not-allowed hover:text-luxury-gold transition-colors"
            >
              Next Item <ChevronRight size={16} />
            </button>
          </div>
        )}

        <div className="w-full bg-[#FAF7F2] border border-luxury-brown/20 rounded-xl p-3 shadow-lg select-none relative overflow-hidden flex flex-col gap-3">
          {renderProductSlipCard(activeItem, activePageIndex, totalItems, dateString, refId)}
        </div>

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
                <Download size={16} /> Download PDF ({pdfPageCount} {pdfPageCount === 1 ? "Page" : "Pages"})
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
      </motion.div>

      {/* HIDDEN PAGES CONTAINER — two products stacked per A4 page now */}
      <div style={{ position: "absolute", top: 0, left: "-9999px", width: "210mm", pointerEvents: "none" }}>
        <div ref={hiddenPagesRef}>
          {pdfPageGroups.map((group, pageIdx) => (
            <div
              key={`pdf-page-${pageIdx}`}
              style={{
                width: "210mm",
                minHeight: "297mm",
                padding: "10mm",
                boxSizing: "border-box",
                backgroundColor: "#FAF7F2",
                display: "flex",
                flexDirection: "column",
                gap: "10mm",
              }}
            >
              {group.map((item, slotIdx) => {
                const globalIndex = pageIdx * 2 + slotIdx;
                return (
                  <div key={`pdf-card-${item.product.id}-${globalIndex}`} style={{ flex: 1, minHeight: 0 }}>
                    {renderProductSlipCard(item, globalIndex, totalItems, dateString, refId, true)}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

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
    return (
      <div style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#FAF7F2",
        border: "2px solid rgba(61,43,31,0.2)",
        borderRadius: "16px",
        padding: "15px",
        boxSizing: "border-box",
        color: "#3D2B1F",
        fontFamily: "Arial, sans-serif",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", paddingBottom: "10px", borderBottom: "1px solid rgba(61,43,31,0.1)", fontWeight: "bold", fontSize: "11px" }}>
          <span>clothing shop • CURATED SLIP</span>
          <span style={{ opacity: 0.6 }}>{dateString} • {refId}</span>
        </div>

        <div style={{ display: "flex", flex: 1, minHeight: 0, marginTop: "10px", marginBottom: "10px" }}>
          <div style={{
            width: "50%",
            backgroundColor: "white",
            borderRight: "1px solid rgba(61,43,31,0.1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "12px",
          }}>
            <div style={{ position: "relative", width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <img
                src={fullBodyImg}
                alt={item.product.name}
                crossOrigin="anonymous"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                  mixBlendMode: "multiply",
                }}
              />
              {isDiscounted && (
                <div style={{ position: "absolute", top: "8px", right: "8px", backgroundColor: "#3D2B1F", color: "#FAF7F2", fontWeight: "bold", fontSize: "11px", padding: "4px 9px", borderRadius: "50px", transform: "rotate(3deg)" }}>
                  -{discountPercent}%
                </div>
              )}
            </div>
          </div>

          <div style={{ width: "50%", display: "flex", flexDirection: "column", justifyContent: "center", padding: "18px" }}>
            <div style={{ marginBottom: "14px" }}>
              {item.product.brand?.name && (
                <div style={{ color: "#C5A55A", fontSize: "9px", fontWeight: "bold", letterSpacing: "2px", textTransform: "uppercase" }}>{item.product.brand.name}</div>
              )}
              <div style={{ fontSize: "20px", fontWeight: "bold", marginTop: "4px", lineHeight: "1.2" }}>{item.product.name}</div>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid rgba(61,43,31,0.1)", fontSize: "12px" }}>
              <span style={{ fontWeight: "bold" }}>Size Selected</span>
              <span style={{ color: "#C5A55A", fontWeight: "bold", fontSize: "16px" }}>{selectedSize}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid rgba(61,43,31,0.1)", fontSize: "12px" }}>
              <span style={{ fontWeight: "bold" }}>Quantity</span>
              <span style={{ fontWeight: "bold", fontSize: "16px" }}>{item.quantity}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0 0 0", fontSize: "12px" }}>
              <span style={{ fontWeight: "bold" }}>Final Price</span>
              <span style={{ fontSize: "18px", fontWeight: "bold" }}>₹{finalPrice.toFixed(0)}</span>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", paddingTop: "8px", borderTop: "1px solid rgba(61,43,31,0.1)", fontSize: "9px", fontWeight: "bold", opacity: 0.4 }}>
          <span>Item {pageIdx + 1} of {totalPages}</span>
          <span>Picked for easy item identification</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-3">
      <div className="flex items-center justify-between border-b border-luxury-brown/10 pb-2">
        <span className="font-mono text-[10px] font-bold tracking-[0.15em] text-luxury-brown">clothing shop • CURATED SLIP</span>
        <span className="font-mono text-[9px] text-luxury-brown/60">{dateString} • {refId}</span>
      </div>

      <div className="flex flex-row gap-3">
        <div className="w-1/2 bg-white rounded-lg border border-cream-300 p-2 flex items-center justify-center relative" style={{ minHeight: "280px" }}>
          <img src={fullBodyImg} alt={item.product.name} crossOrigin="anonymous" className="max-h-full max-w-full object-contain mix-blend-multiply" />
          {isDiscounted && (
            <div className="absolute top-2 right-2 bg-luxury-brown text-cream-100 text-[10px] font-extrabold px-2 py-1 rounded-full rotate-3 shadow">
              -{discountPercent}%
            </div>
          )}
        </div>

        <div className="w-1/2 flex flex-col justify-center space-y-3">
          <div>
            {item.product.brand?.name && (
              <span className="font-body text-[10px] font-bold text-luxury-gold uppercase tracking-[0.15em] block">{item.product.brand.name}</span>
            )}
            <h3 className="font-display text-xl font-bold text-luxury-brown mt-1">{item.product.name}</h3>
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
              <span className="font-display text-xl font-extrabold text-luxury-brown block">₹{finalPrice.toFixed(0)}</span>
              {isDiscounted && (
                <span className="font-body text-[10px] text-luxury-brown/40 line-through">₹{originalPrice.toFixed(0)}</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}