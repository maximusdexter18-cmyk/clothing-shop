"use client";

import { useState } from "react";
import Link from "next/link";
import { MapPin, Phone, Mail, Instagram, Facebook, Twitter, Youtube, Star, Send } from "lucide-react";
import { ShopInfo, SocialMedia } from "@/lib/types";

interface FooterProps {
  shopInfo?: ShopInfo | null;
  socialMedia?: SocialMedia[];
}

// Helper function to extract the src URL from iframe code or embed links
function getEmbedUrl(location: string): string {
  if (!location) return "";

  // If the user accidentally pasted the entire iframe HTML code
  const iframeMatch = location.match(/src="([^"]+)"/);
  if (iframeMatch) {
    return iframeMatch[1]; // Extract just the URL inside src="..."
  }

  // If it's a direct embed link
  if (location.includes("/maps/embed")) {
    return location;
  }

  // If it's a standard address or query, use the search embed
  return `https://www.google.com/maps?q=${encodeURIComponent(location)}&output=embed`;
}

// Helper to create a Google Review link
function getGoogleReviewLink(location: string): string {
  if (!location) return "";
  if (location.startsWith("http")) return location; // Allow admin to paste a custom review link
  return `https://www.google.com/maps/search/${encodeURIComponent(location)}`; // Fallback search
}

export default function Footer({ shopInfo, socialMedia }: FooterProps) {
  const mapUrl = shopInfo?.location ? getEmbedUrl(shopInfo.location) : "";
  const reviewLink = shopInfo?.location ? getGoogleReviewLink(shopInfo.location) : "";
  
  // Only show the text if it's NOT a URL (hide the long link!)
  const showLocationText = shopInfo?.location && !shopInfo.location.startsWith("http");

  // Feedback form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send feedback");

      setSuccess(true);
      setName("");
      setEmail("");
      setMessage("");
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <footer className="bg-transparent border-t border-white/10 py-16"> {/* TRANSPARENT BACKGROUND */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          
          {/* Brand & Social Column */}
          <div>
            <h2 className="font-display text-3xl font-bold tracking-wider text-cream-100 mb-4">
              {shopInfo?.shop_name || "OG WEAR"}
            </h2>
            <div className="gold-line w-16 mb-6" />
            <p className="font-body text-sm text-cream-200/60 leading-relaxed mb-6">
              {shopInfo?.about_us ||
                "Discover the latest trends in luxury fashion. Premium clothing collections for Men, Women, and Kids."}
            </p>
            
            {/* Social Media - Only show icons if URL exists */}
            <div className="flex gap-3">
              {socialMedia?.filter((s) => s.url).map((social) => (
                <a
                  key={social.platform}
                  href={social.url || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-white/10 text-cream-100 flex items-center justify-center hover:bg-luxury-gold hover:text-luxury-brown transition-all backdrop-blur-md border border-white/10"
                  aria-label={social.platform}
                >
                  {social.platform === "instagram" && <Instagram size={18} />}
                  {social.platform === "facebook" && <Facebook size={18} />}
                  {social.platform === "twitter" && <Twitter size={18} />}
                  {social.platform === "youtube" && <Youtube size={18} />}
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="lg:pl-4">
            <h3 className="font-display text-lg font-bold text-cream-100 mb-4">Quick Links</h3>
            <div className="space-y-3">
              <Link href="/shop" className="block font-body text-sm text-cream-200/60 hover:text-luxury-gold transition-colors">
                Shop All
              </Link>
              <Link href="/category/men" className="block font-body text-sm text-cream-200/60 hover:text-luxury-gold transition-colors">
                Men
              </Link>
              <Link href="/category/women" className="block font-body text-sm text-cream-200/60 hover:text-luxury-gold transition-colors">
                Women
              </Link>
              <Link href="/category/kids" className="block font-body text-sm text-cream-200/60 hover:text-luxury-gold transition-colors">
                Kids
              </Link>
              <Link href="/new-arrivals" className="block font-body text-sm text-cream-200/60 hover:text-luxury-gold transition-colors">
                New Arrivals
              </Link>
            </div>
          </div>

          {/* Contact Info & Feedback */}
          <div className="lg:pl-4">
            <h3 className="font-display text-lg font-bold text-cream-100 mb-4">Contact Us</h3>
            <div className="space-y-4">
              {shopInfo?.phone && (
                <div className="flex items-start gap-3">
                  <Phone size={18} className="text-luxury-gold flex-shrink-0 mt-0.5" />
                  <a href={`tel:${shopInfo.phone}`} className="font-body text-sm text-cream-200/80 hover:text-luxury-gold transition-colors">
                    {shopInfo.phone}
                  </a>
                </div>
              )}
              {shopInfo?.email && (
                <div className="flex items-start gap-3">
                  <Mail size={18} className="text-luxury-gold flex-shrink-0 mt-0.5" />
                  <a href={`mailto:${shopInfo.email}`} className="font-body text-sm text-cream-200/80 hover:text-luxury-gold transition-colors">
                    {shopInfo.email}
                  </a>
                </div>
              )}
            </div>

            {/* Feedback Form */}
            <div className="mt-8">
              <h4 className="font-display text-base font-bold text-cream-100 mb-4">Share Your Feedback</h4>
              <form onSubmit={handleFeedbackSubmit} className="space-y-3">
                <input 
                  type="text" 
                  placeholder="Your Name" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full bg-white/10 border border-white/10 rounded px-3 py-2 text-sm text-cream-100 placeholder-cream-200/40 focus:outline-none focus:border-luxury-gold"
                />
                <input 
                  type="email" 
                  placeholder="Your Email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-white/10 border border-white/10 rounded px-3 py-2 text-sm text-cream-100 placeholder-cream-200/40 focus:outline-none focus:border-luxury-gold"
                />
                <textarea 
                  placeholder="Tell us what you think..." 
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  rows={3}
                  className="w-full bg-white/10 border border-white/10 rounded px-3 py-2 text-sm text-cream-100 placeholder-cream-200/40 focus:outline-none focus:border-luxury-gold"
                />
                {error && <p className="text-xs text-red-400">{error}</p>}
                {success && <p className="text-xs text-emerald-400">Thank you! Your feedback has been sent.</p>}
                <button 
                  type="submit" 
                  disabled={submitting}
                  className="w-full flex items-center justify-center gap-2 bg-luxury-gold text-luxury-brown py-2 rounded-full text-xs font-bold uppercase tracking-wider hover:bg-amber-400 transition-all disabled:opacity-50"
                >
                  {submitting ? "Sending..." : <><Send size={14} /> Send Feedback</>}
                </button>
              </form>
            </div>
          </div>

          {/* Location, Review Link & Google Map */}
          <div>
            <h3 className="font-display text-lg font-bold text-cream-100 mb-4">Find Us</h3>
            <div className="space-y-4">
              {/* Show Location text ONLY if it's not a URL */}
              {showLocationText && (
                <div className="flex items-start gap-3">
                  <MapPin size={18} className="text-luxury-gold flex-shrink-0 mt-0.5" />
                  <p className="font-body text-sm text-cream-200/80 leading-relaxed">
                    {shopInfo.location}
                  </p>
                </div>
              )}

              {/* Google Review Link */}
              {reviewLink && (
                <a
                  href={reviewLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-sm font-body text-cream-200/80 hover:text-luxury-gold transition-colors"
                >
                  <Star size={18} className="text-luxury-gold flex-shrink-0" />
                  <span>Review us on Google Maps</span>
                </a>
              )}
              
              {/* Embedded Google Map */}
              <div className="w-full h-40 rounded-lg overflow-hidden border border-white/10 shadow-lg">
                {mapUrl ? (
                  <iframe
                    title="Store Location Map"
                    src={mapUrl}
                    className="w-full h-full border-0"
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                ) : (
                  <div className="w-full h-full bg-white/5 flex items-center justify-center text-cream-200/40 text-xs text-center px-4">
                    Map preview will appear here once you add a location in Admin.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 mt-12 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="font-body text-xs text-cream-200/40">
            © {new Date().getFullYear()} {shopInfo?.shop_name || "OG WEAR"}. All rights reserved.
          </p>
          <p className="font-body text-xs text-cream-200/40">
            Crafted with <span className="text-luxury-gold">♥</span> for fashion lovers.
          </p>
        </div>
      </div>
    </footer>
  );
}