// src/components/AuthModal.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function AuthModal({
  isOpen,
  onClose,
  onSuccess,
}: AuthModalProps) {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  // Account panel (when already logged in)
  const [username, setUsername] = useState("");
  const [savingUsername, setSavingUsername] = useState(false);

  const { user, signInWithGoogle, signInWithEmail, signUpWithEmail, signOut } = useAuth();

  // Close modal + run onSuccess ONLY on a real login *transition*
  // (logged-out -> logged-in). If the user is already authenticated and
  // opens the modal manually, we keep it open and show the account panel
  // instead of instantly closing it (which previously made it look dead).
  const prevUserRef = useRef<any>(null);
  useEffect(() => {
    const prev = prevUserRef.current;
    prevUserRef.current = user;

    // Sync the editable username whenever an authenticated user opens the panel
    if (user) {
      setUsername((user.user_metadata?.username as string) || "");
    }

    if (user && !prev) {
      onClose();
      if (onSuccess) onSuccess();
    }
  }, [user, onClose, onSuccess]);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let result;
      if (mode === "login") {
        result = await signInWithEmail(email, password);
      } else {
        result = await signUpWithEmail(email, password);
      }

      if (result?.error) {
        throw result.error;
      }

      // Login (or signup where the session is returned immediately): the
      // auth-state-change listener will set `user` and the modal will close.
      // Reset loading so the spinner never gets stuck if we reopen later.
      if (mode === "signup" && !(result as any).session) {
        // Email confirmation required — Supabase did not return a session.
        // Show a message instead of hanging on the spinner forever.
        setSuccessMessage(
          "Account created! Please check your email to confirm your account before signing in."
        );
        setLoading(false);
      } else {
        setLoading(false);
      }
    } catch (err: any) {
      setError(err.message || "Authentication failed. Please try again.");
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);

    try {
      await signInWithGoogle();
    } catch (err: any) {
      setError(err.message || "Failed to sign in with Google. Please try again.");
      setLoading(false);
    }
  };

  const handleSaveUsername = async () => {
    if (!username.trim()) return;
    setSavingUsername(true);
    try {
      const { error: updateError } = await supabase.auth.updateUser({
        data: { username: username.trim() },
      });
      if (updateError) throw updateError;
    } catch (err: any) {
      console.error("Error saving username:", err);
      setError(err.message || "Failed to save username.");
    } finally {
      setSavingUsername(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (err) {
      console.error("Error signing out:", err);
    }
    onClose();
  };

  const handleClose = () => {
    setEmail("");
    setPassword("");
    setError(null);
    setSuccessMessage(null);
    setLoading(false);
    onClose();
  };

  if (!isOpen) return null;

  // ===== ACCOUNT PANEL (already authenticated) =====
  if (user) {
    const provider = (user.app_metadata?.provider as string) || "";
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={handleClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="bg-white rounded-3xl w-full max-w-md p-6 sm:p-8 shadow-2xl relative"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all duration-300"
          >
            <X size={20} />
          </button>

          <div className="text-center mb-8">
            <h2 className="font-display text-2xl font-bold text-gray-800">My Account</h2>
            <p className="font-body text-sm text-gray-500 mt-1">
              {provider ? `Signed in with ${provider}` : "You're signed in"}
            </p>
          </div>

          {/* Email */}
          <div className="mb-4">
            <label className="font-body text-xs font-semibold text-gray-600 uppercase tracking-[0.1em] block mb-2">
              Email
            </label>
            <div className="flex items-center gap-2 bg-gray-50 rounded-xl border border-gray-200 px-4 py-3.5">
              <Mail size={18} className="text-gray-400 flex-shrink-0" />
              <span className="font-body text-sm text-gray-700 truncate">
                {user.email}
              </span>
            </div>
          </div>

          {/* Username */}
          <div className="mb-6">
            <label className="font-body text-xs font-semibold text-gray-600 uppercase tracking-[0.1em] block mb-2">
              Username
            </label>
            <div className="flex items-center gap-2 bg-gray-50 rounded-xl border border-gray-200 focus-within:border-luxury-gold transition-all duration-300 px-4">
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Add a username"
                className="w-full bg-transparent font-body text-sm text-gray-700 outline-none py-3.5"
              />
              <button
                type="button"
                onClick={handleSaveUsername}
                disabled={savingUsername || !username.trim()}
                className="text-xs font-semibold text-luxury-gold hover:underline disabled:opacity-40 disabled:hover:no-underline flex-shrink-0"
              >
                {savingUsername ? "Saving..." : "Save"}
              </button>
            </div>
            <p className="mt-2 text-[11px] text-gray-400 font-body">
              Add a username so we can personalize your experience.
            </p>
          </div>

          <button
            onClick={handleSignOut}
            className="w-full py-3.5 bg-luxury-brown text-cream-100 font-body text-sm font-bold uppercase tracking-widest rounded-xl hover:bg-luxury-gold hover:text-luxury-brown transition-all duration-300"
          >
            Sign Out
          </button>
        </motion.div>
      </motion.div>
    );
  }

  // ===== LOGIN / SIGNUP FORM (not authenticated) =====
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={handleClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="bg-white rounded-3xl w-full max-w-md p-6 sm:p-8 shadow-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all duration-300"
        >
          <X size={20} />
        </button>

        <div className="text-center mb-8">
          <h2 className="font-display text-2xl font-bold text-gray-800">
            {mode === "login" ? "Welcome Back" : "Create Account"}
          </h2>
          <p className="font-body text-sm text-gray-500 mt-1">
            {mode === "login"
              ? "Sign in to access your cart"
              : "Create an account to start shopping"}
          </p>
        </div>

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm font-body"
            >
              {error}
            </motion.div>
          )}
          {successMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm font-body"
            >
              {successMessage}
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 py-3.5 bg-white border border-gray-200 rounded-xl hover:border-luxury-gold hover:shadow-lg transition-all duration-300"
        >
          <svg className="w-5 h-5" viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
          </svg>
          <span className="font-body text-sm font-medium text-gray-700">
            {loading ? "Signing in..." : "Continue with Google"}
          </span>
        </button>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center">
            <span className="px-3 bg-white font-body text-xs text-gray-400">OR</span>
          </div>
        </div>

        <form onSubmit={handleEmailSubmit} className="space-y-4">
          <div>
            <label className="font-body text-xs font-semibold text-gray-600 uppercase tracking-[0.1em] block mb-2">
              Email Address
            </label>
            <div className="flex items-center gap-2 bg-gray-50 rounded-xl border border-gray-200 focus-within:border-luxury-gold transition-all duration-300">
              <Mail size={18} className="ml-4 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full px-3 py-3.5 bg-transparent font-body text-sm text-gray-700 outline-none rounded-xl"
                required
              />
            </div>
          </div>

          <div>
            <label className="font-body text-xs font-semibold text-gray-600 uppercase tracking-[0.1em] block mb-2">
              Password
            </label>
            <div className="flex items-center gap-2 bg-gray-50 rounded-xl border border-gray-200 focus-within:border-luxury-gold transition-all duration-300">
              <Lock size={18} className="ml-4 text-gray-400" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full px-3 py-3.5 bg-transparent font-body text-sm text-gray-700 outline-none rounded-xl"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="mr-4 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-luxury-gold text-luxury-brown font-body text-sm font-bold uppercase tracking-widest rounded-xl hover:bg-luxury-brown hover:text-cream-100 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 size={20} className="animate-spin mx-auto" />
            ) : mode === "login" ? (
              "Sign In"
            ) : (
              "Create Account"
            )}
          </button>
        </form>

        <p className="mt-4 text-center font-body text-sm text-gray-500">
          {mode === "login" ? "Don't have an account? " : "Already have an account? "}
          <button
            onClick={() => {
              setMode(mode === "login" ? "signup" : "login");
              setError(null);
              setSuccessMessage(null);
            }}
            className="text-luxury-gold font-semibold hover:underline"
          >
            {mode === "login" ? "Create Account" : "Sign In"}
          </button>
        </p>

        <button
          onClick={handleClose}
          className="w-full mt-3 font-body text-xs text-gray-400 hover:text-gray-600 transition-colors duration-300"
        >
          Continue as Guest
        </button>
      </motion.div>
    </motion.div>
  );
}