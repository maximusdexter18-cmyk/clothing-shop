// src/lib/auth-context.tsx
"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { User, AuthError } from "@supabase/supabase-js";

// ===== TYPES =====
interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signUpWithEmail: (email: string, password: string) => Promise<{ error: AuthError | null; session?: any | null }>;
  signOut: () => Promise<void>;
  migrateGuestCart: () => Promise<void>;
}

// ===== CONTEXT =====
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // ===== CHECK SESSION ON MOUNT =====
  useEffect(() => {
    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user ?? null);
      } catch (error) {
        console.error("Error getting session:", error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    // ===== LISTEN FOR AUTH CHANGES =====
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
        
        if (session?.user) {
          setTimeout(() => {
            migrateGuestCart();
          }, 500);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // ===== SIGN IN WITH GOOGLE =====
  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      
      if (error) throw error;
    } catch (error) {
      console.error("Error signing in with Google:", error);
      throw error;
    }
  };

  // ===== SIGN IN WITH EMAIL =====
  const signInWithEmail = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        console.error("Sign in error:", error);
        return { error };
      }
      
      console.log("User signed in:", data.user?.email);
      return { error: null };
    } catch (error) {
      console.error("Error signing in with email:", error);
      return { error: error as AuthError };
    }
  };

  // ===== SIGN UP WITH EMAIL =====
  const signUpWithEmail = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      
      if (error) {
        console.error("Sign up error:", error);
        return { error };
      }
      
      console.log("User signed up:", data.user?.email);
      return { error: null, session: data.session };
    } catch (error) {
      console.error("Error signing up with email:", error);
      return { error: error as AuthError, session: null };
    }
  };

  // ===== SIGN OUT =====
  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      console.error("Error signing out:", error);
      throw error;
    }
  };

  // ===== MIGRATE GUEST CART =====
  const migrateGuestCart = async () => {
    try {
      const saved = localStorage.getItem("guest_cart");
      if (!saved) return;

      const guestItems = JSON.parse(saved);
      if (guestItems.length === 0) return;

      const { data: cartData, error: fetchError } = await supabase
        .from("carts")
        .select("items")
        .eq("user_id", user?.id)
        .single();

      if (fetchError && fetchError.code !== "PGRST116") {
        console.error("Error fetching user cart:", fetchError);
        return;
      }

      let existingItems = cartData?.items || [];

      guestItems.forEach((guestItem: any) => {
        const exists = existingItems.some(
          (item: any) => 
            item.product.id === guestItem.product.id && 
            item.size === guestItem.size
        );
        if (!exists) {
          existingItems.push(guestItem);
        }
      });

      const { error: upsertError } = await supabase
        .from("carts")
        .upsert(
          { user_id: user?.id, items: existingItems },
          { onConflict: "user_id" }
        );

      if (upsertError) {
        console.error("Error saving merged cart:", upsertError);
        return;
      }

      localStorage.removeItem("guest_cart");
      console.log("✅ Guest cart migrated successfully!");
    } catch (error) {
      console.error("Error migrating guest cart:", error);
    }
  };

  // ===== PROVIDER VALUE =====
  const value = {
    user,
    loading,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    signOut,
    migrateGuestCart,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// ===== HOOK =====
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}