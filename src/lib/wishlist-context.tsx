"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Product } from "@/lib/types";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth-context";

interface WishlistContextType {
  wishlist: Product[];
  isInWishlist: (productId: string) => boolean;
  toggleWishlist: (product: Product) => void;
  clearWishlist: () => void;
  wishlistCount: number;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [wishlist, setWishlist] = useState<Product[]>([]);

  // Load wishlist from local storage first
  useEffect(() => {
    const saved = localStorage.getItem("luxe-wear-wishlist");
    if (saved) setWishlist(JSON.parse(saved));
  }, []);

  // Sync with Supabase when user logs in
  useEffect(() => {
    if (!user) {
      // If no user, just keep local storage
      return;
    }

    const fetchWishlist = async () => {
      const { data } = await supabase
        .from("wishlist")
        .select("*, products(*)")
        .eq("user_id", user.id);
      
      if (data) {
        const products = data.map((item: any) => item.products);
        setWishlist(products);
      }
    };

    fetchWishlist();
  }, [user]);

  // Save to local storage
  useEffect(() => {
    localStorage.setItem("luxe-wear-wishlist", JSON.stringify(wishlist));
  }, [wishlist]);

  const isInWishlist = (productId: string) => {
    return wishlist.some((p) => p.id === productId);
  };

  const toggleWishlist = async (product: Product) => {
    // Toggle local state
    setWishlist((prev) => {
      const exists = prev.some((p) => p.id === product.id);
      if (exists) {
        return prev.filter((p) => p.id !== product.id);
      } else {
        return [...prev, product];
      }
    });

    // Sync with Supabase if logged in
    if (user) {
      const exists = wishlist.some((p) => p.id === product.id);
      if (exists) {
        await supabase.from("wishlist").delete().eq("user_id", user.id).eq("product_id", product.id);
      } else {
        await supabase.from("wishlist").insert({ user_id: user.id, product_id: product.id });
      }
    }
  };

  const clearWishlist = () => {
    setWishlist([]);
    if (user) {
      supabase.from("wishlist").delete().eq("user_id", user.id);
    }
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        isInWishlist,
        toggleWishlist,
        clearWishlist,
        wishlistCount: wishlist.length,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) throw new Error("useWishlist must be used within a WishlistProvider");
  return context;
}