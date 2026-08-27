"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  ReactNode,
} from "react";
import { Product } from "@/lib/types";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth-context";

export interface CartItem {
  product: Product;
  size: string | null;
  quantity: number;
  imageUrl: string;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, size: string | null, imageUrl?: string) => void;
  removeFromCart: (index: number) => void;
  removeFromCartByProductId: (productId: string) => void;
  updateQuantity: (index: number, quantity: number) => void;
  clearCart: () => void;
  totalCount: number;
  totalPrice: number;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  setLoginRequired: (value: boolean) => void;
  loginRequired: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const STORAGE_KEY = "luxe-wear-cart";
const DB_TABLE = "cart_items";

function loadLocal(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveLocal(items: CartItem[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // ignore
  }
}

function mergeCarts(local: CartItem[], cloud: CartItem[]): CartItem[] {
  const merged = [...cloud];
  for (const l of local) {
    const idx = merged.findIndex(
      (c) => c.product.id === l.product.id && c.size === l.size
    );
    if (idx >= 0) {
      merged[idx] = { ...merged[idx], quantity: merged[idx].quantity + l.quantity };
    } else {
      merged.push(l);
    }
  }
  return merged;
}

interface CloudRow {
  product_id: string;
  size: string | null;
  quantity: number;
  image_url: string | null;
  products: Product;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const [items, setItems] = useState<CartItem[]>(() => loadLocal());
  const [isOpen, setIsOpen] = useState(false);
  const [loginRequired, setLoginRequired] = useState(false);
  const prevUserRef = useRef<string | null | undefined>(undefined);

  const loadCloudAndReplace = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from(DB_TABLE)
        .select("product_id, size, quantity, image_url, products(*)")
        .eq("user_id", userId);
      if (error) throw error;

      const cloudItems: CartItem[] = ((data as unknown as CloudRow[]) || [])
        .filter((r) => r.products)
        .map((r) => ({
          product: r.products,
          size: r.size,
          quantity: r.quantity,
          imageUrl: r.image_url || "",
        }));

      setItems(cloudItems);
      saveLocal(cloudItems);
    } catch (e) {
      console.error("Failed to load cloud cart:", e);
    }
  }, []);

  const mergeAndLoadCloud = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from(DB_TABLE)
        .select("product_id, size, quantity, image_url, products(*)")
        .eq("user_id", userId);
      if (error) throw error;

      const cloudItems: CartItem[] = ((data as unknown as CloudRow[]) || [])
        .filter((r) => r.products)
        .map((r) => ({
          product: r.products,
          size: r.size,
          quantity: r.quantity,
          imageUrl: r.image_url || "",
        }));

      setItems((local) => {
        const merged = mergeCarts(local, cloudItems);
        saveLocal(merged);
        return merged;
      });
    } catch (e) {
      console.error("Failed to merge cloud cart:", e);
    }
  }, []);

  useEffect(() => {
    if (authLoading) return;

    const prevUser = prevUserRef.current;
    prevUserRef.current = user?.id ?? null;

    if (user) {
      if (prevUser === null) {
        mergeAndLoadCloud(user.id);
      } else {
        loadCloudAndReplace(user.id);
      }
    } else if (prevUser !== undefined && prevUser !== null) {
      setItems([]);
      saveLocal([]);
    }
  }, [user, authLoading, loadCloudAndReplace, mergeAndLoadCloud]);

  useEffect(() => {
    if (authLoading) return;
    saveLocal(items);
    if (user) {
      (async () => {
        try {
          await supabase.from(DB_TABLE).delete().eq("user_id", user.id);
          if (items.length > 0) {
            const payload = items.map((item) => ({
              user_id: user.id,
              product_id: item.product.id,
              size: item.size,
              quantity: item.quantity,
              image_url: item.imageUrl,
            }));
            const { error } = await supabase.from(DB_TABLE).insert(payload);
            if (error) throw error;
          }
        } catch (e) {
          console.error("Failed to sync cart to cloud:", e);
        }
      })();
    }
  }, [items, user, authLoading]);

  const addToCart = (product: Product, size: string | null, imageUrl?: string) => {
    if (!user) {
      setLoginRequired(true);
      return;
    }

    const img =
      imageUrl ||
      product.images?.find((i) => i.is_primary)?.image_url ||
      product.images?.[0]?.image_url ||
      "/placeholder.png";

    setItems((prev) => {
      const existingIdx = prev.findIndex(
        (item) => item.product.id === product.id && item.size === size
      );
      if (existingIdx >= 0) {
        const updated = [...prev];
        updated[existingIdx] = {
          ...updated[existingIdx],
          quantity: updated[existingIdx].quantity + 1,
        };
        return updated;
      }
      return [...prev, { product, size, quantity: 1, imageUrl: img }];
    });

    setIsOpen(true);
  };

  // NEW FUNCTION: Remove item by product ID
  const removeFromCartByProductId = (productId: string) => {
    setItems((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const removeFromCart = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const updateQuantity = (index: number, quantity: number) => {
    if (quantity < 1) {
      removeFromCart(index);
      return;
    }
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, quantity } : item))
    );
  };

  const clearCart = () => setItems([]);

  const totalCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => {
    const price =
      item.product.is_discounted && item.product.discount_price
        ? item.product.discount_price
        : item.product.original_price;
    return sum + price * item.quantity;
  }, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        removeFromCartByProductId,
        updateQuantity,
        clearCart,
        totalCount,
        totalPrice,
        isOpen,
        setIsOpen,
        setLoginRequired,
        loginRequired,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within a CartProvider");
  return context;
}