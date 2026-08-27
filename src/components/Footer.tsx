"use client";

import Link from "next/link";
import { MapPin, Phone, Mail, Instagram, Facebook, Twitter } from "lucide-react";
import { ShopInfo, SocialMedia } from "@/lib/types";

interface FooterProps {
  shopInfo?: ShopInfo | null;
  socialMedia?: SocialMedia[];
}

export default function Footer({ shopInfo, socialMedia }: FooterProps) {
  return (
    <footer className="bg-luxury-darkBrown text-cream-100 py-16 border-t border-luxury-gold/20">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          
          {/* Brand Column */}
          <div className="md:col-span-2">
            <h2 className="font-display text-3xl font-bold tracking-wider text-cream-100 mb-4">
              {shopInfo?.shop_name || "OG WEAR"}
            </h2>
            <div className="gold-line w-16 mb-6" />
            <p className="font-body text-sm text-cream-200/60 leading-relaxed max-w-md">
              {shopInfo?.about_us ||
                "Discover the latest trends in luxury fashion. Premium clothing collections for Men, Women, and Kids."}
            </p>
            <div className="flex gap-4 mt-6">
              {socialMedia?.map((social) => (
                <a
                  key={social.platform}
                  href={social.url || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-luxury-brown text-cream-100 flex items-center justify-center hover:bg-luxury-gold hover:text-luxury-brown transition-all"
                  aria-label={social.platform}
                >
                  {social.platform === "instagram" && <Instagram size={18} />}
                  {social.platform === "facebook" && <Facebook size={18} />}
                  {social.platform === "twitter" && <Twitter size={18} />}
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-display text-lg font-bold text-cream-100 mb-4">Quick Links</h3>
            <div className="space-y-3">
              <Link href="/shop" className="font-body text-sm text-cream-200/60 hover:text-luxury-gold transition-colors">
                Shop All
              </Link>
              <Link href="/category/men" className="font-body text-sm text-cream-200/60 hover:text-luxury-gold transition-colors">
                Men
              </Link>
              <Link href="/category/women" className="font-body text-sm text-cream-200/60 hover:text-luxury-gold transition-colors">
                Women
              </Link>
              <Link href="/category/kids" className="font-body text-sm text-cream-200/60 hover:text-luxury-gold transition-colors">
                Kids
              </Link>
              <Link href="/new-arrivals" className="font-body text-sm text-cream-200/60 hover:text-luxury-gold transition-colors">
                New Arrivals
              </Link>
            </div>
          </div>

          {/* Contact & Location */}
          <div>
            <h3 className="font-display text-lg font-bold text-cream-100 mb-4">Contact & Visit Us</h3>
            <div className="space-y-4">
              
              {/* Location */}
              {shopInfo?.location && (
                <div className="flex items-start gap-3">
                  <MapPin size={18} className="text-luxury-gold flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-body text-sm text-cream-200/80 leading-relaxed">
                      {shopInfo.location}
                    </p>
                    {shopInfo.location.startsWith("http") && (
                      <a 
                        href={shopInfo.location} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-xs font-body text-luxury-gold hover:underline"
                      >
                        Open in Maps →
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Phone */}
              {shopInfo?.phone && (
                <div className="flex items-start gap-3">
                  <Phone size={18} className="text-luxury-gold flex-shrink-0 mt-0.5" />
                  <a href={`tel:${shopInfo.phone}`} className="font-body text-sm text-cream-200/80 hover:text-luxury-gold transition-colors">
                    {shopInfo.phone}
                  </a>
                </div>
              )}

              {/* Email */}
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
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-luxury-gold/20 mt-12 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
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