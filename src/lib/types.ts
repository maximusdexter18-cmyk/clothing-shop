export interface Brand {
  id: string;
  name: string;
  slug: string;
  is_active: boolean;
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  description: string | null;
  gender: "men" | "women" | "kids";
  category: string;
  brand_id: string | null;
  original_price: number;
  discount_price: number | null;
  is_discounted: boolean;
  is_new_arrival: boolean;
  is_featured: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // Joined fields
  brand?: Brand;
  images?: ProductImage[];
  sizes?: ProductSize[];
}

export type ImageType = "full-body" | "small" | "mockup";

export const IMAGE_TYPES: ImageType[] = ["full-body", "small", "mockup"];

export const IMAGE_TYPE_LABELS: Record<ImageType, string> = {
  "full-body": "Full Body",
  small: "Small",
  mockup: "Mockup",
};

export interface ProductImage {
  id: string;
  product_id: string;
  image_url: string;
  imagekit_file_id: string | null;
  is_primary: boolean;
  display_order: number;
  image_type: ImageType | null;
  created_at: string;
}

export interface ProductSize {
  id: string;
  product_id: string;
  size: string;
  is_available: boolean;
  stock_quantity: number;
  created_at: string;
}

export interface HomepageContent {
  id: string;
  section_type: string;
  title: string | null;
  subtitle: string | null;
  description: string | null;
  image_url: string | null;
  button_text: string | null;
  button_link: string | null;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface HeroImage {
  id: string;
  title: string | null;
  subtitle: string | null;
  description: string | null;
  image_url: string;
  link_url: string | null;
  button_text: string | null;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface SocialMedia {
  id: string;
  platform: string;
  url: string | null;
  is_active: boolean;
  display_order: number;
  created_at: string;
}

export interface ShopInfo {
  id: string;
  shop_name: string;
  tagline: string;
  logo_url: string | null;
  favicon_url: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  about_us: string | null;
  map_embed_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface FilterOption {
  id: string;
  filter_type: string;
  filter_value: string;
  display_order: number;
  is_active: boolean;
}

export type Gender = "men" | "women" | "kids";

export const CATEGORIES: Record<Gender, string[]> = {
  men: [
    "Shirts",
    "T-Shirts",
    "Polo Shirts",
    "Jeans",
    "Chinos",
    "Trousers",
    "Shorts",
    "Jackets",
    "Hoodies",
    "Sweatshirts",
    "Suits",
    "Blazers",
    "Coats",
    "Sweaters",
    "Tank Tops",
    "Activewear",
    "Sleepwear",
    "Swimwear",
  ],
  women: [
    "Dresses",
    "Jumpsuits",
    "Coordinated Sets",
    "Gowns",
    "Tops",
    "Blouses",
    "T-Shirts",
    "Skirts",
    "Jeans",
    "Trousers",
    "Leggings",
    "Shorts",
    "Jackets",
    "Coats",
    "Blazers",
    "Hoodies",
    "Sweaters",
    "Cardigans",
    "Activewear",
    "Sleepwear",
    "Swimwear",
  ],
  kids: [
    "T-Shirts",
    "Shirts",
    "Dresses",
    "Jeans",
    "Shorts",
    "Trousers",
    "Skirts",
    "Jackets",
    "Hoodies",
    "Sweaters",
    "Activewear",
    "Sleepwear",
    "Swimwear",
    "School Uniforms",
  ],
};

export const SIZES: Record<Gender, string[]> = {
  men: ["XS", "S", "M", "L", "XL", "XXL", "3XL", "4XL"],
  women: ["XXS", "XS", "S", "M", "L", "XL", "XXL"],
  kids: ["2-3Y", "4-5Y", "6-7Y", "8-9Y", "10-11Y", "12-13Y", "14-15Y"],
};

export interface ScrollRevealImage {
  id: string;
  src: string;
  mobile_src?: string;
  alt: string;
  height: number;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const MAJOR_BRANDS = [
  "Nike",
  "Adidas",
  "Gucci",
  "Louis Vuitton",
  "Prada",
  "Balenciaga",
  "Versace",
  "Dior",
  "Chanel",
  "Burberry",
  "Ralph Lauren",
  "Calvin Klein",
  "Tommy Hilfiger",
  "Levi's",
  "H&M",
  "Zara",
  "Uniqlo",
  "Puma",
  "New Balance",
  "Under Armour",
  "Reebok",
  "Fendi",
  "Givenchy",
  "Yves Saint Laurent",
  "Valentino",
  "Coach",
  "Michael Kors",
  "Hugo Boss",
  "Armani",
  "Gap",
];
