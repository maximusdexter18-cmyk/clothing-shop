"use client";

import Link from "next/link";
import { MapPin, Phone, Mail, Instagram, Facebook, Twitter, Youtube } from "lucide-react";
import { ShopInfo, SocialMedia } from "@/lib/types";

interface FooterProps {
  shopInfo?: ShopInfo | null;
  socialMedia?: SocialMedia[];
}

// Helper function to extract the src URL from iframe code
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

export default function Footer({ shopInfo, socialMedia }: FooterProps) {
  const mapUrl = shopInfo?.location ? getEmbedUrl(shopInfo.location) : "";

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

          {/* Quick Links - Fixed spacing */}
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

          {/* Contact Info */}
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
          </div>

          {/* Location & Google Map Column */}
          <div>
            <h3 className="font-display text-lg font-bold text-cream-100 mb-4">Find Us</h3>
            <div className="space-y-4">
              {/* Show Location text */}
              {shopInfo?.location && (
                <div className="flex items-start gap-3">
                  <MapPin size={18} className="text-luxury-gold flex-shrink-0 mt-0.5" />
                  <p className="font-body text-sm text-cream-200/80 leading-relaxed break-all">
                    {shopInfo.location}
                  </p>
                </div>
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