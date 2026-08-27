// src/components/Footer.tsx
"use client";

import Link from "next/link";
import { Instagram, Facebook, Twitter, Youtube, Mail, Phone, MapPin } from "lucide-react";
import { ShopInfo } from "@/lib/types";

interface FooterProps {
  shopInfo?: ShopInfo | null;
  socialMedia?: { platform: string; url: string | null }[];
}

const Footer: React.FC<FooterProps> = ({ shopInfo, socialMedia }) => {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { name: "Shop All", href: "/shop" },
    { name: "Men's Collection", href: "/category/men" },
    { name: "Women's Collection", href: "/category/women" },
    { name: "Kids Collection", href: "/category/kids" },
    { name: "New Arrivals", href: "/new-arrivals" },
  ];

  const socialIcons: Record<string, any> = {
    instagram: Instagram,
    facebook: Facebook,
    twitter: Twitter,
    youtube: Youtube,
  };

  return (
    <footer className="relative bg-transparent">
      {/* Dark Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/90 pointer-events-none" />
      
      {/* Decorative top border */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-luxury-gold/50 to-transparent z-10" />

      {/* Main Footer Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 py-16 md:py-20">
        {/* Mobile: Single Column, Desktop: 3 Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 lg:gap-8">
          
          {/* Brand Column - Adjusts font size on mobile */}
          <div className="space-y-4">
            <h3 className="font-display text-2xl lg:text-3xl font-bold tracking-wider text-cream-100">
              {shopInfo?.shop_name || "OG WEAR"}
            </h3>
            <p className="font-body text-sm text-cream-200/60 leading-relaxed max-w-xs">
              {shopInfo?.tagline || "Redefining fashion for the modern era."}
            </p>
            <div className="flex gap-4 pt-2">
              {socialMedia?.map((social) =>
                social.url ? (
                  (() => {
                    const Icon = socialIcons[social.platform.toLowerCase()];
                    return Icon ? (
                      <a
                        key={social.platform}
                        href={social.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-cream-200/40 hover:text-luxury-gold transition-colors duration-300"
                      >
                        <Icon size={18} />
                      </a>
                    ) : null;
                  })()
                ) : null
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-body text-xs uppercase tracking-[0.2em] text-cream-200/50 mb-4">
              Quick Links
            </h4>
            <ul className="space-y-2.5">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="font-body text-sm text-cream-200/60 hover:text-luxury-gold transition-colors duration-300"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-body text-xs uppercase tracking-[0.2em] text-cream-200/50 mb-4">
              Contact
            </h4>
            <ul className="space-y-3">
              {shopInfo?.email && (
                <li className="flex items-start gap-3">
                  <Mail size={14} className="text-cream-200/30 mt-0.5 flex-shrink-0" />
                  <span className="font-body text-sm text-cream-200/60">
                    {shopInfo.email}
                  </span>
                </li>
              )}
              {shopInfo?.phone && (
                <li className="flex items-start gap-3">
                  <Phone size={14} className="text-cream-200/30 mt-0.5 flex-shrink-0" />
                  <span className="font-body text-sm text-cream-200/60">
                    {shopInfo.phone}
                  </span>
                </li>
              )}
              {shopInfo?.address && (
                <li className="flex items-start gap-3">
                  <MapPin size={14} className="text-cream-200/30 mt-0.5 flex-shrink-0" />
                  <span className="font-body text-sm text-cream-200/60">
                    {shopInfo.address}
                  </span>
                </li>
              )}
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-cream-200/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="font-body text-xs text-cream-200/30">
            © {currentYear} {shopInfo?.shop_name || "OG WEAR"}. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link href="/privacy" className="font-body text-xs text-cream-200/30 hover:text-cream-200/60 transition-colors duration-300">Privacy Policy</Link>
            <Link href="/terms" className="font-body text-xs text-cream-200/30 hover:text-cream-200/60 transition-colors duration-300">Terms & Conditions</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;