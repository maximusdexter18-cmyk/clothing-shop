"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ShoppingBag, Plus, Minus, Trash2, FileText, Sparkles } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import StoreSlipModal from "@/components/StoreSlipModal";

export default function CartDrawer() {
  const { items, isOpen, setIsOpen, removeFromCart, updateQuantity, clearCart, totalCount, totalPrice } = useCart();
  const [showSlipModal, setShowSlipModal] = useState(false);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[90] bg-black/60"
            onClick={() => setIsOpen(false)}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 260, damping: 28 }}
            className="fixed top-0 right-0 bottom-0 z-[95] w-full max-w-md bg-cream-50 shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 bg-luxury-brown text-cream-100">
              <div className="flex items-center gap-3">
                <ShoppingBag size={20} />
                <h2 className="font-display text-lg font-bold tracking-wider">MY BAG</h2>
                {totalCount > 0 && (
                  <span className="bg-luxury-gold text-luxury-brown rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                    {totalCount}
                  </span>
                )}
              </div>
              <button onClick={() => setIsOpen(false)} className="hover:text-luxury-gold transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              {items.length === 0 ? (
                <div className="text-center mt-20">
                  <ShoppingBag size={48} className="mx-auto text-luxury-brown/20 mb-4" />
                  <p className="font-display text-lg text-luxury-brown/60">Your bag is empty</p>
                  <p className="font-body text-xs text-luxury-brown/40 mt-2">
                    Add products from the featured or trending sections
                  </p>
                </div>
              ) : (
                items.map((item, i) => {
                  const price =
                    item.product.is_discounted && item.product.discount_price
                      ? item.product.discount_price
                      : item.product.original_price;

                  return (
                    <div key={i} className="bg-white rounded-xl p-4 shadow-sm border border-cream-200 flex gap-4">
                      {/* Image */}
                      <div className="w-20 h-24 rounded-lg overflow-hidden bg-cream-200 flex-shrink-0">
                        <img src={item.imageUrl} alt={item.product.name} className="w-full h-full object-cover" />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start gap-2">
                          <div className="min-w-0">
                            <p className="font-display text-sm font-bold text-luxury-brown truncate">
                              {item.product.name}
                            </p>
                            <p className="font-body text-[10px] text-luxury-brown/50 uppercase tracking-wider mt-0.5">
                              {item.product.brand?.name || ""}
                            </p>
                            {item.size && (
                              <span className="inline-block mt-1 bg-cream-100 text-luxury-brown font-body text-[10px] font-semibold px-2 py-0.5 rounded">
                                Size: {item.size}
                              </span>
                            )}
                          </div>
                          <button
                            onClick={() => removeFromCart(i)}
                            className="text-luxury-brown/30 hover:text-red-500 transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>

                        <div className="flex items-center justify-between mt-3">
                          {/* Quantity */}
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => updateQuantity(i, item.quantity - 1)}
                              className="w-6 h-6 rounded-full border border-luxury-brown/20 flex items-center justify-center text-luxury-brown hover:bg-cream-100 transition-colors"
                            >
                              <Minus size={12} />
                            </button>
                            <span className="font-body text-sm font-semibold text-luxury-brown w-5 text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(i, item.quantity + 1)}
                              className="w-6 h-6 rounded-full border border-luxury-brown/20 flex items-center justify-center text-luxury-brown hover:bg-cream-100 transition-colors"
                            >
                              <Plus size={12} />
                            </button>
                          </div>

                          <p className="font-body text-sm font-bold text-luxury-gold">
                            ₹{(price * item.quantity).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t border-cream-300 px-6 py-5 bg-white">
                <div className="flex justify-between mb-2">
                  <p className="font-body text-xs uppercase tracking-wider text-luxury-brown/50">Subtotal</p>
                  <p className="font-body text-sm font-bold text-luxury-brown">₹{totalPrice.toFixed(2)}</p>
                </div>
                <div className="flex justify-between mb-4">
                  <p className="font-body text-xs uppercase tracking-wider text-luxury-brown/50">Items</p>
                  <p className="font-body text-sm font-semibold text-luxury-brown">{totalCount}</p>
                </div>
                <button className="btn-luxury w-full text-center mb-2">CHECKOUT</button>

                {/* Option to create Store Image Slip */}
                <button
                  onClick={() => setShowSlipModal(true)}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-cream-200 border border-luxury-brown/20 text-luxury-brown rounded-full font-body text-xs font-bold uppercase tracking-wider hover:bg-luxury-gold hover:text-luxury-brown transition-all shadow-sm mb-3"
                >
                  <Sparkles size={14} className="text-luxury-gold hover:text-luxury-brown" />
                  Save Store Slip (Image)
                </button>

                <button
                  onClick={clearCart}
                  className="w-full text-center font-body text-xs text-luxury-brown/40 hover:text-red-500 transition-colors uppercase tracking-wider"
                >
                  Clear Bag
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}

      {/* Store Pickup Slip Modal */}
      {showSlipModal && (
        <StoreSlipModal
          items={items}
          onClose={() => setShowSlipModal(false)}
        />
      )}
    </AnimatePresence>
  );
}
