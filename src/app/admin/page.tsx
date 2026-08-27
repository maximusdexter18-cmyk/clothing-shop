"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Lock, Mail, Eye, EyeOff, Package, BarChart3, Settings, Plus, Edit, Trash2, Upload, LogOut, Image, GripVertical } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Product, Brand, ShopInfo, SocialMedia, HomepageContent, ProductImage, ProductSize, Gender, CATEGORIES, MAJOR_BRANDS, SIZES, IMAGE_TYPES, IMAGE_TYPE_LABELS, ImageType, ScrollRevealImage } from "@/lib/types";

export default function AdminPage() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [activeTab, setActiveTab] = useState<"dashboard" | "products" | "add-product" | "edit-product" | "shop-settings" | "social" | "scroll-reveal" | "feedback">("dashboard");

  // Data
  const [products, setProducts] = useState<Product[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [shopInfo, setShopInfo] = useState<ShopInfo | null>(null);
  const [socialMedia, setSocialMedia] = useState<SocialMedia[]>([]);
  const [feedback, setFeedback] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Product form
  const [formGender, setFormGender] = useState<Gender>("men");
  const [formCategory, setFormCategory] = useState("");
  const [formName, setFormName] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formOriginalPrice, setFormOriginalPrice] = useState("");
  const [formDiscountPrice, setFormDiscountPrice] = useState("");
  const [formBrandId, setFormBrandId] = useState("");
  const [formIsNewArrival, setFormIsNewArrival] = useState(false);
  const [formIsFeatured, setFormIsFeatured] = useState(false);
  const [formSizes, setFormSizes] = useState<Record<string, boolean>>({});
  const [formImagesByType, setFormImagesByType] = useState<Record<string, File[]>>({
    "full-body": [],
    small: [],
    mockup: [],
  });
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  // Shop settings form
  const [shopName, setShopName] = useState("");
  const [shopTagline, setShopTagline] = useState("");
  const [shopEmail, setShopEmail] = useState("");
  const [shopPhone, setShopPhone] = useState("");
  const [shopAddress, setShopAddress] = useState("");
  const [shopAbout, setShopAbout] = useState("");
  const [shopLocation, setShopLocation] = useState("");
  const [shopReviewLink, setShopReviewLink] = useState("");

  // Category image uploads
  const [categoryImages, setCategoryImages] = useState<Record<string, string>>({});
  const [categoryUploading, setCategoryUploading] = useState<Record<string, boolean>>({});

  // Scroll Reveal images
  const [scrollRevealImages, setScrollRevealImages] = useState<ScrollRevealImage[]>([]);
  const [srFormSrc, setSrFormSrc] = useState("");
  const [srFormMobileSrc, setSrFormMobileSrc] = useState("");
  const [srFormAlt, setSrFormAlt] = useState("");
  const [srFormHeight, setSrFormHeight] = useState(400);
  const [srFormOrder, setSrFormOrder] = useState(0);
  const [srFormActive, setSrFormActive] = useState(true);
  const [editingSrImage, setEditingSrImage] = useState<ScrollRevealImage | null>(null);
  const [srSaving, setSrSaving] = useState(false);

  useEffect(() => {
    const adminSession = localStorage.getItem("admin_session");
    if (adminSession) {
      setIsLoggedIn(true);
      fetchAdminData();
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    const adminEmail = process.env.ADMIN_EMAIL || "admin@clothingshop.com";
    const adminPassword = process.env.ADMIN_PASSWORD || "admin123";
    if (loginEmail === adminEmail && loginPassword === adminPassword) {
      localStorage.setItem("admin_session", "true");
      setIsLoggedIn(true);
      fetchAdminData();
    } else {
      setLoginError("Invalid credentials");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("admin_session");
    setIsLoggedIn(false);
  };

  const handleCategoryImageUpload = async (gender: string, file: File) => {
    setCategoryUploading((prev) => ({ ...prev, [gender]: true }));
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("gender", gender);
      const res = await fetch("/api/upload-category", { method: "POST", body: formData });
      const data = await res.json();
      if (data.success) {
        setCategoryImages((prev) => ({ ...prev, [gender]: data.url }));
      }
    } catch (err) {
      console.error("Category upload error:", err);
    } finally {
      setCategoryUploading((prev) => ({ ...prev, [gender]: false }));
    }
  };

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      // Fetch main data
      const [productsRes, brandsRes, shopRes, socialRes] = await Promise.all([
        supabase.from("products").select("*, brand:brands(*), images:product_images(*), sizes:product_sizes(*)").order("created_at", { ascending: false }),
        supabase.from("brands").select("*").order("name"),
        supabase.from("shop_info").select("*").limit(1).single(),
        supabase.from("social_media").select("*").order("display_order"),
      ]);

      // Fetch category images
      const [catMenRes, catWomenRes, catKidsRes] = await Promise.all([
        supabase.from("homepage_content").select("image_url").eq("section_type", "category_men").limit(1).maybeSingle(),
        supabase.from("homepage_content").select("image_url").eq("section_type", "category_women").limit(1).maybeSingle(),
        supabase.from("homepage_content").select("image_url").eq("section_type", "category_kids").limit(1).maybeSingle(),
      ]);
      
      // Fetch Feedback SEPARATELY so it NEVER crashes the entire fetch!
      const feedbackRes = await supabase
        .from("site_feedback")
        .select("*")
        .order("created_at", { ascending: false });

      setProducts(productsRes.data || []);
      setBrands(brandsRes.data || []);
      setShopInfo(shopRes.data);
      setSocialMedia(socialRes.data || []);
      setFeedback(feedbackRes.data || []);

      const catImages: Record<string, string> = {};
      if (catMenRes.data?.image_url) catImages.men = catMenRes.data.image_url;
      if (catWomenRes.data?.image_url) catImages.women = catWomenRes.data.image_url;
      if (catKidsRes.data?.image_url) catImages.kids = catKidsRes.data.image_url;
      setCategoryImages(catImages);

      if (shopRes.data) {
        setShopName(shopRes.data.shop_name);
        setShopTagline(shopRes.data.tagline);
        setShopEmail(shopRes.data.email || "");
        setShopPhone(shopRes.data.phone || "");
        setShopAddress(shopRes.data.address || "");
        setShopAbout(shopRes.data.about_us || "");
        setShopLocation(shopRes.data.location || "");
        setShopReviewLink(shopRes.data.review_link || "");
      }

      const srRes = await supabase
        .from("scroll_reveal_images")
        .select("*")
        .order("display_order", { ascending: true });
      setScrollRevealImages(srRes.data || []);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormGender("men");
    setFormCategory("");
    setFormName("");
    setFormDescription("");
    setFormOriginalPrice("");
    setFormDiscountPrice("");
    setFormBrandId("");
    setFormIsNewArrival(false);
    setFormIsFeatured(false);
    setFormSizes({});
    setFormImagesByType({
      "full-body": [],
      small: [],
      mockup: [],
    });
    setEditingProduct(null);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setFormGender(product.gender);
    setFormCategory(product.category);
    setFormName(product.name);
    setFormDescription(product.description || "");
    setFormOriginalPrice(product.original_price.toString());
    setFormDiscountPrice(product.discount_price?.toString() || "");
    setFormBrandId(product.brand_id || "");
    setFormIsNewArrival(product.is_new_arrival);
    setFormIsFeatured(product.is_featured);
    const sizes: Record<string, boolean> = {};
    product.sizes?.forEach((s) => { sizes[s.size] = s.is_available; });
    setFormSizes(sizes);
    setActiveTab("edit-product");
  };

  const handleSaveProduct = async () => {
    setSaving(true);
    setSaveError("");
    try {
      const formData = new FormData();
      formData.append("name", formName);
      formData.append("description", formDescription);
      formData.append("gender", formGender);
      formData.append("category", formCategory);
      formData.append("brandId", formBrandId);
      formData.append("originalPrice", formOriginalPrice);
      formData.append("discountPrice", formDiscountPrice);
      formData.append("isNewArrival", formIsNewArrival ? "true" : "false");
      formData.append("isFeatured", formIsFeatured ? "true" : "false");
      if (editingProduct) formData.append("productId", editingProduct.id);

      const selectedSizes = Object.entries(formSizes)
        .filter(([_, available]) => available)
        .map(([size]) => size);
      selectedSizes.forEach((size) => formData.append("sizes[]", size));

      IMAGE_TYPES.forEach((type) => {
        const files = formImagesByType[type] || [];
        files.forEach((file) => {
          if (type === "full-body") {
            formData.append("fullBodyImages[]", file);
          } else if (type === "small") {
            formData.append("smallImages[]", file);
          } else {
            formData.append("mockupImages[]", file);
          }
        });
      });

      const res = await fetch("/api/products", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save product");

      resetForm();
      setActiveTab("products");
      fetchAdminData();
      alert("Product saved successfully!");
    } catch (error) {
      console.error("Save error:", error);
      setSaveError(error instanceof Error ? error.message : "Failed to save product");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm("Delete this product?")) return;
    await fetch(`/api/products?id=${id}`, { method: "DELETE" });
    fetchAdminData();
  };

  const handleToggleStock = async (product: Product) => {
    const allSizes = product.sizes || [];
    const allUnavailable = allSizes.every((s) => !s.is_available);
    const newAvailability = allUnavailable;
    await fetch("/api/products", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: product.id, is_available: newAvailability }),
    });
    fetchAdminData();
  };

  const handleSaveShopInfo = async () => {
    setSaving(true);
    try {
      await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "shop-info",
          id: shopInfo?.id,
          shop_name: shopName,
          tagline: shopTagline,
          email: shopEmail,
          phone: shopPhone,
          address: shopAddress,
          about_us: shopAbout,
          location: shopLocation,
          review_link: shopReviewLink,
        }),
      });
      fetchAdminData();
      alert("Shop info saved!");
    } catch (error) {
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const handleAddBrand = async (name: string) => {
    await fetch("/api/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "add-brand", name }),
    });
    fetchAdminData();
  };

  const handleSaveSocial = async (platform: string, url: string, isActive: boolean) => {
    await fetch("/api/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "save-social", platform, url, is_active: isActive }),
    });
    fetchAdminData();
  };

  // Scroll Reveal handlers
  const resetSrForm = () => {
    setSrFormSrc("");
    setSrFormMobileSrc("");
    setSrFormAlt("");
    setSrFormHeight(400);
    setSrFormOrder(0);
    setSrFormActive(true);
    setEditingSrImage(null);
  };

  const handleEditSrImage = (image: ScrollRevealImage) => {
    setEditingSrImage(image);
    setSrFormSrc(image.src);
    setSrFormMobileSrc(image.mobile_src || "");
    setSrFormAlt(image.alt);
    setSrFormHeight(image.height);
    setSrFormOrder(image.display_order);
    setSrFormActive(image.is_active);
  };

  const handleSaveSrImage = async () => {
    if (!srFormSrc || !srFormAlt || !srFormMobileSrc) {
      alert("Please fill in all required fields (Desktop URL, Mobile URL, and Alt Text)");
      return;
    }
    setSrSaving(true);
    try {
      const body = {
        src: srFormSrc,
        mobile_src: srFormMobileSrc,
        alt: srFormAlt,
        height: srFormHeight,
        display_order: srFormOrder,
        is_active: srFormActive,
      };

      let res: Response;
      if (editingSrImage) {
        res = await fetch("/api/scroll-reveal", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editingSrImage.id, ...body }),
        });
      } else {
        res = await fetch("/api/scroll-reveal", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
      }

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save scroll reveal image");

      resetSrForm();
      fetchAdminData();
      alert(editingSrImage ? "Scroll reveal image updated!" : "Scroll reveal image added!");
    } catch (error) {
      console.error("Save scroll reveal error:", error);
      alert(error instanceof Error ? error.message : "Failed to save scroll reveal image");
    } finally {
      setSrSaving(false);
    }
  };

  const handleDeleteSrImage = async (id: string) => {
    if (!confirm("Delete this scroll reveal image?")) return;
    try {
      const res = await fetch(`/api/scroll-reveal?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete");
      fetchAdminData();
    } catch (error) {
      console.error("Delete scroll reveal error:", error);
      alert("Failed to delete scroll reveal image");
    }
  };

  // LOGIN
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-luxury-brown flex items-center justify-center px-4">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-cream-50 rounded-sm p-8 shadow-2xl">
          <div className="text-center mb-8">
            <h1 className="font-display text-3xl font-bold text-luxury-brown mb-1">Admin Panel</h1>
            <div className="gold-line w-16 mx-auto" />
          </div>
          <form onSubmit={handleLogin} className="space-y-5">
            {loginError && <p className="text-red-500 text-sm font-body">{loginError}</p>}
            <div>
              <label className="font-body text-xs uppercase tracking-wider text-luxury-brown/60 mb-1 block">Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-luxury-brown/30" />
                <input type="email" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-luxury-brown/20 rounded bg-transparent font-body text-sm focus:outline-none focus:border-luxury-gold" placeholder="admin@email.com" required />
              </div>
            </div>
            <div>
              <label className="font-body text-xs uppercase tracking-wider text-luxury-brown/60 mb-1 block">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-luxury-brown/30" />
                <input type={showPassword ? "text" : "password"} value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-3 border border-luxury-brown/20 rounded bg-transparent font-body text-sm focus:outline-none focus:border-luxury-gold" placeholder="••••••••" required />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-luxury-brown/30">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <button type="submit" className="w-full btn-luxury text-center">Sign In</button>
          </form>
          <p className="text-center mt-4 font-body text-xs text-luxury-brown/40">
            Default: admin@clothingshop.com / admin123
          </p>
        </motion.div>
      </div>
    );
  }

  // ADMIN DASHBOARD
  const tabs = [
    { id: "dashboard" as const, label: "Dashboard", icon: BarChart3 },
    { id: "products" as const, label: "Products", icon: Package },
    { id: "add-product" as const, label: "Add Product", icon: Plus },
    { id: "shop-settings" as const, label: "Shop Settings", icon: Settings },
    { id: "social" as const, label: "Social Media", icon: Settings },
    { id: "scroll-reveal" as const, label: "Scroll Reveal", icon: Image },
    { id: "feedback" as const, label: "Feedback", icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen bg-cream-50">
      {/* Header */}
      <header className="bg-luxury-brown text-cream-100 py-4 px-6 flex items-center justify-between">
        <h1 className="font-display text-xl font-bold tracking-wider">Admin Dashboard</h1>
        <button onClick={handleLogout} className="flex items-center gap-2 text-xs font-body text-cream-200/60 hover:text-cream-100">
          <LogOut size={16} /> Logout
        </button>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-56 min-h-[calc(100vh-64px)] bg-luxury-darkBrown p-4 hidden md:block">
          <nav className="space-y-1">
            {tabs.map((tab) => (
              <button key={tab.id} onClick={() => { setActiveTab(tab.id); resetForm(); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded text-sm font-body transition-colors ${
                  activeTab === tab.id ? "bg-luxury-brown text-cream-100" : "text-cream-200/50 hover:text-cream-100 hover:bg-luxury-brown/50"}`}>
                <tab.icon size={16} /> {tab.label}
              </button>
            ))}
          </nav>
        </aside>

                {/* Mobile tabs - SHOWS ALL TABS */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-luxury-brown flex z-40 overflow-x-auto">
          {tabs.map((tab) => (
            <button key={tab.id} onClick={() => { setActiveTab(tab.id); resetForm(); }}
              className={`flex-1 flex flex-col items-center py-3 text-[10px] font-body whitespace-nowrap ${
                activeTab === tab.id ? "text-luxury-gold" : "text-cream-200/50"}`}>
              <tab.icon size={16} /> {tab.label}
            </button>
          ))}
        </div>

        {/* Main content */}
        <main className="flex-1 p-6 pb-24 md:pb-6">
          {/* Dashboard */}
          {activeTab === "dashboard" && (
            <div className="space-y-6">
              <h2 className="font-display text-2xl font-bold text-luxury-brown">Overview</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: "Total Products", value: products.length },
                  { label: "In Stock", value: products.filter((p) => p.sizes?.some((s) => s.is_available)).length },
                  { label: "New Arrivals", value: products.filter((p) => p.is_new_arrival).length },
                  { label: "Featured", value: products.filter((p) => p.is_featured).length },
                ].map((stat) => (
                  <div key={stat.label} className="bg-white p-6 rounded-sm border border-cream-300/50">
                    <p className="font-body text-xs text-luxury-brown/50 uppercase tracking-wider">{stat.label}</p>
                    <p className="font-display text-3xl font-bold text-luxury-brown mt-2">{stat.value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Products List */}
          {(activeTab === "products" || activeTab === "edit-product") && activeTab === "products" && (
            <div className="space-y-4">
              <button onClick={() => setActiveTab("dashboard")}
                className="flex items-center gap-1 text-xs font-body text-luxury-brown/50 hover:text-luxury-gold transition-colors">
                ← Back to Dashboard
              </button>
              <div className="flex items-center justify-between">
                <h2 className="font-display text-2xl font-bold text-luxury-brown">Products</h2>
                <button onClick={() => { resetForm(); setActiveTab("add-product"); }} className="btn-luxury text-xs">
                  + Add Product
                </button>
              </div>
              <div className="bg-white rounded-sm border border-cream-300/50 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full font-body text-sm">
                    <thead className="bg-cream-100 text-luxury-brown text-xs uppercase tracking-wider">
                      <tr>
                        <th className="text-left px-4 py-3">Product</th>
                        <th className="text-left px-4 py-3">Category</th>
                        <th className="text-left px-4 py-3">Price</th>
                        <th className="text-left px-4 py-3">Status</th>
                        <th className="text-left px-4 py-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map((product) => {
                        const inStock = product.sizes?.some((s) => s.is_available);
                        return (
                          <tr key={product.id} className="border-t border-cream-200 hover:bg-cream-50">
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-12 bg-cream-200 rounded overflow-hidden flex-shrink-0">
                                  {product.images?.[0] && <img src={product.images[0].image_url} alt="" className="w-full h-full object-cover" />}
                                </div>
                                <div>
                                  <p className="font-medium text-luxury-brown truncate max-w-[200px]">{product.name}</p>
                                  <p className="text-xs text-luxury-brown/40 capitalize">{product.gender}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-luxury-brown/60">{product.category}</td>
                            <td className="px-4 py-3">
                              {product.is_discounted ? (
                                <div><span className="text-luxury-brown/40 line-through text-xs">₹{product.original_price}</span>
                                <span className="text-luxury-gold font-bold ml-1">₹{product.discount_price}</span></div>
                              ) : (
                                <span className="text-luxury-brown">₹{product.original_price}</span>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              <button onClick={() => handleToggleStock(product)}
                                className={inStock ? "badge-in-stock" : "badge-out-of-stock"}>
                                {inStock ? "In Stock" : "Out of Stock"}
                              </button>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex gap-2">
                                <button onClick={() => handleEditProduct(product)} className="text-luxury-brown/40 hover:text-luxury-gold"><Edit size={16} /></button>
                                <button onClick={() => handleDeleteProduct(product.id)} className="text-luxury-brown/40 hover:text-red-500"><Trash2 size={16} /></button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Add/Edit Product Form */}
          {(activeTab === "add-product" || activeTab === "edit-product") && (
            <div className="space-y-6 max-w-2xl">
              <button onClick={() => { resetForm(); setActiveTab("products"); }}
                className="flex items-center gap-1 text-xs font-body text-luxury-brown/50 hover:text-luxury-gold transition-colors">
                ← Back to Products
              </button>
              <h2 className="font-display text-2xl font-bold text-luxury-brown">
                {editingProduct ? "Edit Product" : "Add New Product"}
              </h2>
              {saveError && (
                <p className="bg-red-50 text-red-600 text-sm font-body px-4 py-3 rounded border border-red-200">
                  {saveError}
                </p>
              )}

              <div className="space-y-4 bg-white p-6 rounded-sm border border-cream-300/50">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="font-body text-xs uppercase tracking-wider text-luxury-brown/60 mb-1 block">Gender</label>
                    <select value={formGender} onChange={(e) => { setFormGender(e.target.value as Gender); setFormCategory(""); setFormSizes({}); }}
                      className="w-full border border-luxury-brown/20 rounded px-3 py-2 font-body text-sm bg-cream-50">
                      <option value="men">Men</option>
                      <option value="women">Women</option>
                      <option value="kids">Kids</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-body text-xs uppercase tracking-wider text-luxury-brown/60 mb-1 block">Category</label>
                    <select value={formCategory} onChange={(e) => setFormCategory(e.target.value)}
                      className="w-full border border-luxury-brown/20 rounded px-3 py-2 font-body text-sm bg-cream-50">
                      <option value="">Select...</option>
                      {(CATEGORIES[formGender] || []).map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="font-body text-xs uppercase tracking-wider text-luxury-brown/60 mb-1 block">Product Name</label>
                  <input value={formName} onChange={(e) => setFormName(e.target.value)}
                    className="w-full border border-luxury-brown/20 rounded px-3 py-2 font-body text-sm" placeholder="e.g. Classic Oxford Shirt" />
                </div>

                <div>
                  <label className="font-body text-xs uppercase tracking-wider text-luxury-brown/60 mb-1 block">Description</label>
                  <textarea value={formDescription} onChange={(e) => setFormDescription(e.target.value)} rows={3}
                    className="w-full border border-luxury-brown/20 rounded px-3 py-2 font-body text-sm" placeholder="Product description..." />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="font-body text-xs uppercase tracking-wider text-luxury-brown/60 mb-1 block">Original Price (₹)</label>
                    <input type="number" value={formOriginalPrice} onChange={(e) => setFormOriginalPrice(e.target.value)}
                      className="w-full border border-luxury-brown/20 rounded px-3 py-2 font-body text-sm" placeholder="99.99" />
                  </div>
                  <div>
                    <label className="font-body text-xs uppercase tracking-wider text-luxury-brown/60 mb-1 block">Discount Price (₹)</label>
                    <input type="number" value={formDiscountPrice} onChange={(e) => setFormDiscountPrice(e.target.value)}
                      className="w-full border border-luxury-brown/20 rounded px-3 py-2 font-body text-sm" placeholder="79.99" />
                  </div>
                </div>

                <div>
                  <label className="font-body text-xs uppercase tracking-wider text-luxury-brown/60 mb-1 block">Brand</label>
                  <select value={formBrandId} onChange={(e) => setFormBrandId(e.target.value)}
                    className="w-full border border-luxury-brown/20 rounded px-3 py-2 font-body text-sm bg-cream-50">
                    <option value="">No Brand</option>
                    {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                </div>

                {/* Sizes */}
                <div>
                  <label className="font-body text-xs uppercase tracking-wider text-luxury-brown/60 mb-2 block">Available Sizes</label>
                  <div className="flex flex-wrap gap-2">
                    {(SIZES[formGender] || []).map((size) => (
                      <button key={size} type="button"
                        onClick={() => setFormSizes((prev) => ({ ...prev, [size]: !prev[size] }))}
                        className={`size-chip ${formSizes[size] ? "selected" : ""}`}>
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Image uploads: Full Body, Small, Mockup */}
                {[
                  { type: "full-body" as ImageType, label: "Full Body Images", hint: "Used in the FULL BODY poster carousel on the homepage." },
                  { type: "small" as ImageType, label: "Small Images", hint: "Used in the small images grid (Section 2) on the homepage." },
                  { type: "mockup" as ImageType, label: "Mockup Images", hint: "Product detail mockups shown in the popup viewer." },
                ].map(({ type, label, hint }) => (
                  <div key={type} className="p-4 border border-dashed border-luxury-brown/20 rounded">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-body text-sm font-semibold text-luxury-brown">
                        {label}
                      </span>
                      <span className="font-body text-xs text-luxury-brown/40">
                        {(formImagesByType[type] || []).length} selected
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {(formImagesByType[type] || []).map((file, i) => (
                        <div key={i} className="relative w-20 h-24 bg-cream-100 border border-cream-300 rounded overflow-hidden">
                          <img src={URL.createObjectURL(file)} alt="" className="w-full h-full object-cover" />
                          <button type="button"
                            onClick={() => setFormImagesByType((prev) => ({
                              ...prev,
                              [type]: (prev[type] || []).filter((_, idx) => idx !== i),
                            }))}
                            className="absolute top-0 right-0 bg-red-500 text-white w-5 h-5 flex items-center justify-center text-xs">
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                    <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-body text-luxury-gold hover:underline">
                      <Upload size={14} />
                      Add {label} (multiple allowed)
                      <input type="file" accept="image/*" multiple className="hidden"
                        onChange={(e) => {
                          const files = Array.from(e.target.files || []);
                          setFormImagesByType((prev) => ({ ...prev, [type]: [...(prev[type] || []), ...files] }));
                          e.target.value = "";
                        }} />
                    </label>
                    <p className="font-body text-xs text-luxury-brown/40 mt-2">
                      {hint}
                    </p>
                  </div>
                ))}

                <div className="flex gap-6">
                  <label className="flex items-center gap-2 font-body text-sm text-luxury-brown cursor-pointer">
                    <input type="checkbox" checked={formIsNewArrival} onChange={(e) => setFormIsNewArrival(e.target.checked)}
                      className="accent-luxury-gold" /> New Arrival
                  </label>
                  <label className="flex items-center gap-2 font-body text-sm text-luxury-brown cursor-pointer">
                    <input type="checkbox" checked={formIsFeatured} onChange={(e) => setFormIsFeatured(e.target.checked)}
                      className="accent-luxury-gold" /> Featured
                  </label>
                </div>
              </div>

              <div className="flex gap-4">
                <button onClick={handleSaveProduct} disabled={saving || !formName || !formCategory || !formOriginalPrice}
                  className="btn-luxury disabled:opacity-50">
                  {saving ? "Saving..." : editingProduct ? "Update Product" : "Add Product"}
                </button>
                <button onClick={() => { resetForm(); setActiveTab("products"); }}
                  className="px-6 py-3 border border-luxury-brown/20 text-luxury-brown font-body text-sm uppercase tracking-wider hover:bg-cream-200">
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Shop Settings */}
          {activeTab === "shop-settings" && (
            <div className="space-y-6 max-w-2xl">
              <button onClick={() => setActiveTab("dashboard")}
                className="flex items-center gap-1 text-xs font-body text-luxury-brown/50 hover:text-luxury-gold transition-colors">
                ← Back to Dashboard
              </button>
              <h2 className="font-display text-2xl font-bold text-luxury-brown">Shop Settings</h2>
              <div className="space-y-4 bg-white p-6 rounded-sm border border-cream-300/50">
                <div>
                  <label className="font-body text-xs uppercase tracking-wider text-luxury-brown/60 mb-1 block">Shop Name</label>
                  <input value={shopName} onChange={(e) => setShopName(e.target.value)}
                    className="w-full border border-luxury-brown/20 rounded px-3 py-2 font-body text-sm" />
                </div>
                <div>
                  <label className="font-body text-xs uppercase tracking-wider text-luxury-brown/60 mb-1 block">Tagline</label>
                  <input value={shopTagline} onChange={(e) => setShopTagline(e.target.value)}
                    className="w-full border border-luxury-brown/20 rounded px-3 py-2 font-body text-sm" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="font-body text-xs uppercase tracking-wider text-luxury-brown/60 mb-1 block">Email</label>
                    <input value={shopEmail} onChange={(e) => setShopEmail(e.target.value)}
                      className="w-full border border-luxury-brown/20 rounded px-3 py-2 font-body text-sm" />
                  </div>
                  <div>
                    <label className="font-body text-xs uppercase tracking-wider text-luxury-brown/60 mb-1 block">Phone</label>
                    <input value={shopPhone} onChange={(e) => setShopPhone(e.target.value)}
                      className="w-full border border-luxury-brown/20 rounded px-3 py-2 font-body text-sm" />
                  </div>
                </div>
                <div>
                  <label className="font-body text-xs uppercase tracking-wider text-luxury-brown/60 mb-1 block">Address</label>
                  <textarea value={shopAddress} onChange={(e) => setShopAddress(e.target.value)} rows={2}
                    className="w-full border border-luxury-brown/20 rounded px-3 py-2 font-body text-sm" />
                </div>

                <div>
                  <label className="font-body text-xs uppercase tracking-wider text-luxury-brown/60 mb-1 block">Store Location (Text or Google Maps URL)</label>
                  <input 
                    value={shopLocation} 
                    onChange={(e) => setShopLocation(e.target.value)}
                    className="w-full border border-luxury-brown/20 rounded px-3 py-2 font-body text-sm" 
                    placeholder="e.g. 123 Main Street, Mumbai, India (or Google Maps URL)"
                  />
                </div>

                <div>
                  <label className="font-body text-xs uppercase tracking-wider text-luxury-brown/60 mb-1 block">Google Maps Review Link</label>
                  <input 
                    value={shopReviewLink} 
                    onChange={(e) => setShopReviewLink(e.target.value)}
                    className="w-full border border-luxury-brown/20 rounded px-3 py-2 font-body text-sm" 
                    placeholder="Paste the link to review your shop on Google Maps"
                  />
                </div>

                <div>
                  <label className="font-body text-xs uppercase tracking-wider text-luxury-brown/60 mb-1 block">About Us</label>
                  <textarea value={shopAbout} onChange={(e) => setShopAbout(e.target.value)} rows={4}
                    className="w-full border border-luxury-brown/20 rounded px-3 py-2 font-body text-sm" />
                </div>
              </div>
              <button onClick={handleSaveShopInfo} disabled={saving} className="btn-luxury">
                {saving ? "Saving..." : "Save Settings"}
              </button>

              {/* Category Images */}
              <div className="space-y-4 bg-white p-6 rounded-sm border border-cream-300/50">
                <h3 className="font-display text-lg font-bold text-luxury-brown">Category Images</h3>
                <p className="font-body text-xs text-luxury-brown/50">
                  Upload images for the MEN / WOMEN / KIDS category boxes on the homepage.
                </p>
                {(["men", "women", "kids"] as const).map((gender) => (
                  <div key={gender} className="flex items-center gap-4">
                    <span className="font-body text-sm uppercase tracking-wider text-luxury-brown w-24">{gender}</span>
                    {categoryImages[gender] && (
                      <img src={categoryImages[gender]} alt={gender} className="w-16 h-20 object-cover rounded border border-cream-300" />
                    )}
                    <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-body text-luxury-gold hover:underline">
                      <Upload size={14} />
                      {categoryImages[gender] ? "Replace" : "Upload"}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleCategoryImageUpload(gender, file);
                          e.target.value = "";
                        }}
                      />
                    </label>
                    {categoryUploading[gender] && (
                      <span className="font-body text-xs text-luxury-brown/40">Uploading...</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Social Media */}
          {activeTab === "social" && (
            <div className="space-y-6 max-w-2xl">
              <button onClick={() => setActiveTab("dashboard")}
                className="flex items-center gap-1 text-xs font-body text-luxury-brown/50 hover:text-luxury-gold transition-colors">
                ← Back to Dashboard
              </button>
              <h2 className="font-display text-2xl font-bold text-luxury-brown">Social Media Links</h2>
              <div className="space-y-4 bg-white p-6 rounded-sm border border-cream-300/50">
                {socialMedia.map((social) => (
                  <div key={social.platform} className="flex items-center gap-4">
                    <span className="font-body text-sm uppercase tracking-wider text-luxury-brown w-24">{social.platform}</span>
                    <input value={social.url || ""} onChange={(e) => {
                      const updated = socialMedia.map((s) => s.platform === social.platform ? { ...s, url: e.target.value } : s);
                      setSocialMedia(updated);
                    }}
                      className="flex-1 border border-luxury-brown/20 rounded px-3 py-2 font-body text-sm"
                      placeholder={`Enter ${social.platform} URL`} />
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={social.is_active} onChange={(e) => {
                        const updated = socialMedia.map((s) => s.platform === social.platform ? { ...s, is_active: e.target.checked } : s);
                        setSocialMedia(updated);
                      }} className="accent-luxury-gold" />
                      <span className="font-body text-xs text-luxury-brown/60">Active</span>
                    </label>
                    <button onClick={() => handleSaveSocial(social.platform, social.url || "", social.is_active)}
                      className="text-xs font-body text-luxury-gold hover:underline">Save</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Scroll Reveal Images */}
          {activeTab === "scroll-reveal" && (
            <div className="space-y-6 max-w-3xl">
              <button onClick={() => setActiveTab("dashboard")}
                className="flex items-center gap-1 text-xs font-body text-luxury-brown/50 hover:text-luxury-gold transition-colors">
                ← Back to Dashboard
              </button>
              <h2 className="font-display text-2xl font-bold text-luxury-brown">Scroll Reveal Images</h2>
              <p className="font-body text-xs text-luxury-brown/50">
                Manage the full-screen images that appear between content sections. You must add a separate image for Desktop and Mobile.
              </p>

              {/* Add/Edit Form */}
              <div className="space-y-6 bg-white p-6 rounded-sm border border-cream-300/50">
                <h3 className="font-display text-lg font-bold text-luxury-brown">
                  {editingSrImage ? "Edit Scroll Reveal Image" : "Add New Scroll Reveal Image"}
                </h3>

                {/* DESKTOP SECTION */}
                <div className="p-4 border-2 border-luxury-gold rounded bg-cream-50">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-body text-xs font-bold text-luxury-brown uppercase tracking-wider">
                      🖥️ Desktop / PC Version (Required)
                    </span>
                    <span className="text-[10px] font-bold text-red-500 bg-red-50 px-2 py-1 rounded">REQUIRED</span>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="font-body text-xs uppercase tracking-wider text-luxury-brown/60 mb-1 block">Desktop Image URL</label>
                      <input value={srFormSrc} onChange={(e) => setSrFormSrc(e.target.value)}
                        className="w-full border border-luxury-brown/20 rounded px-3 py-2 font-body text-sm" placeholder="https://example.com/desktop-wide.jpg" />
                    </div>

                    {srFormSrc && (
                      <div className="relative w-full aspect-video bg-cream-100 rounded border border-cream-300 overflow-hidden">
                        <img src={srFormSrc} alt={srFormAlt || "Desktop Preview"} className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                </div>

                {/* MOBILE SECTION */}
                <div className="p-4 border-2 border-emerald-500 rounded bg-emerald-50/30">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-body text-xs font-bold text-luxury-brown uppercase tracking-wider">
                      📱 Mobile Version (Required)
                    </span>
                    <span className="text-[10px] font-bold text-red-500 bg-red-50 px-2 py-1 rounded">REQUIRED</span>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="font-body text-xs uppercase tracking-wider text-luxury-brown/60 mb-1 block">Mobile Image URL</label>
                      <input value={srFormMobileSrc} onChange={(e) => setSrFormMobileSrc(e.target.value)}
                        className="w-full border border-luxury-brown/20 rounded px-3 py-2 font-body text-sm" placeholder="https://example.com/mobile-tall.jpg" />
                    </div>

                    {srFormMobileSrc && (
                      <div className="relative w-full max-w-[200px] aspect-[9/16] mx-auto bg-cream-100 rounded border border-cream-300 overflow-hidden">
                        <img src={srFormMobileSrc} alt={srFormAlt || "Mobile Preview"} className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                </div>

                {/* SHARED SETTINGS */}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="font-body text-xs uppercase tracking-wider text-luxury-brown/60 mb-1 block">Alt Text</label>
                    <input value={srFormAlt} onChange={(e) => setSrFormAlt(e.target.value)}
                      className="w-full border border-luxury-brown/20 rounded px-3 py-2 font-body text-sm" placeholder="Outdoor collection" />
                  </div>
                  <div>
                    <label className="font-body text-xs uppercase tracking-wider text-luxury-brown/60 mb-1 block">Height (px)</label>
                    <input type="number" value={srFormHeight} onChange={(e) => setSrFormHeight(parseInt(e.target.value) || 400)}
                      className="w-full border border-luxury-brown/20 rounded px-3 py-2 font-body text-sm" placeholder="600" min="200" max="1200" />
                  </div>
                  <div>
                    <label className="font-body text-xs uppercase tracking-wider text-luxury-brown/60 mb-1 block">Display Order</label>
                    <input type="number" value={srFormOrder} onChange={(e) => setSrFormOrder(parseInt(e.target.value) || 0)}
                      className="w-full border border-luxury-brown/20 rounded px-3 py-2 font-body text-sm" placeholder="0" min="0" />
                  </div>
                </div>

                <div className="flex items-center">
                  <label className="flex items-center gap-2 font-body text-sm text-luxury-brown cursor-pointer">
                    <input type="checkbox" checked={srFormActive} onChange={(e) => setSrFormActive(e.target.checked)}
                      className="accent-luxury-gold" /> Active
                  </label>
                </div>

                <div className="flex gap-4">
                  <button onClick={handleSaveSrImage} disabled={srSaving || !srFormSrc || !srFormMobileSrc} className="btn-luxury disabled:opacity-50">
                    {srSaving ? "Saving..." : editingSrImage ? "Update Image" : "Add Image"}
                  </button>
                  <button onClick={resetSrForm}
                    className="px-6 py-3 border border-luxury-brown/20 text-luxury-brown font-body text-sm uppercase tracking-wider hover:bg-cream-200">
                    Cancel
                  </button>
                </div>

                {(!srFormSrc || !srFormMobileSrc) && (
                  <p className="text-xs text-red-500 font-body mt-2">
                    ⚠️ You must fill in BOTH the Desktop URL and Mobile URL to save.
                  </p>
                )}
              </div>

              {/* List of Images */}
              <div className="bg-white rounded-sm border border-cream-300/50 overflow-hidden">
                <div className="p-4 border-b border-cream-300/50 flex items-center justify-between">
                  <h3 className="font-display text-lg font-bold text-luxury-brown">All Scroll Reveal Images</h3>
                  <span className="font-body text-xs text-luxury-brown/50">{scrollRevealImages.length} images</span>
                </div>
                {scrollRevealImages.length === 0 ? (
                  <div className="p-8 text-center">
                    <Image size={48} className="mx-auto text-luxury-brown/30 mb-4" />
                    <p className="font-body text-luxury-brown/50">No scroll reveal images yet. Add one above.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-cream-200">
                    {scrollRevealImages.map((image) => (
                      <div key={image.id} className="p-4 flex items-center gap-4">
                        <button
                          onClick={() => handleEditSrImage(image)}
                          className="flex gap-2 flex-shrink-0"
                          title="Click to edit"
                        >
                          {/* Desktop Preview */}
                          <div className="w-20 h-28 bg-cream-100 rounded border border-cream-300 overflow-hidden">
                            <img src={image.src} alt={image.alt} className="w-full h-full object-cover" />
                          </div>
                          {/* Mobile Preview */}
                          {image.mobile_src && (
                            <div className="w-14 h-28 bg-cream-100 rounded border border-cream-300 overflow-hidden">
                              <img src={image.mobile_src} alt={`${image.alt} Mobile`} className="w-full h-full object-cover" />
                            </div>
                          )}
                        </button>
                        <div className="flex-1 min-w-0">
                          <p className="font-body text-sm font-medium text-luxury-brown truncate">{image.alt}</p>
                          <p className="font-body text-xs text-luxury-brown/40 truncate">Desktop: {image.src}</p>
                          {image.mobile_src && (
                            <p className="font-body text-xs text-luxury-brown/40 truncate">Mobile: {image.mobile_src}</p>
                          )}
                          <div className="flex items-center gap-4 mt-1">
                            <span className="font-body text-xs text-luxury-brown/50">Height: {image.height}px</span>
                            <span className="font-body text-xs text-luxury-brown/50">Order: {image.display_order}</span>
                            <span className={`font-body text-xs px-2 py-0.5 rounded ${image.is_active ? "bg-luxury-gold/20 text-luxury-gold" : "bg-luxury-brown/10 text-luxury-brown/50"}`}>
                              {image.is_active ? "Active" : "Inactive"}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDeleteSrImage(image.id)}
                          className="text-luxury-brown/40 hover:text-red-500 text-luxury-gold"
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Feedback */}
          {activeTab === "feedback" && (
            <div className="space-y-6 max-w-3xl">
              <button onClick={() => setActiveTab("dashboard")}
                className="flex items-center gap-1 text-xs font-body text-luxury-brown/50 hover:text-luxury-gold transition-colors">
                ← Back to Dashboard
              </button>
              <h2 className="font-display text-2xl font-bold text-luxury-brown">Customer Feedback</h2>
              {feedback.length === 0 ? (
                <p className="font-body text-luxury-brown/50">No feedback submitted yet.</p>
              ) : (
                <div className="space-y-4">
                  {feedback.map((fb: any) => (
                    <div key={fb.id} className="bg-white p-4 rounded-sm border border-cream-300/50">
                      <div className="flex justify-between">
                        <p className="font-body text-sm font-bold text-luxury-brown">
                          {fb.name || "Anonymous"} 
                          {fb.email && fb.email !== "Not provided" && (
                            <span className="font-normal text-luxury-brown/50"> ({fb.email})</span>
                          )}
                        </p>
                        <span className="text-xs text-luxury-brown/40">{new Date(fb.created_at).toLocaleString()}</span>
                      </div>
                      <p className="font-body text-sm text-luxury-brown mt-2">{fb.message}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}