-- ============================================
-- CLOTHING SHOP DATABASE SCHEMA
-- Run this in Supabase SQL Editor
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- BRANDS TABLE
-- ============================================
CREATE TABLE brands (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL UNIQUE,
  slug VARCHAR(255) NOT NULL UNIQUE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- PRODUCTS TABLE
-- ============================================
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(500) NOT NULL,
  description TEXT,
  gender VARCHAR(50) NOT NULL CHECK (gender IN ('men', 'women', 'kids')),
  category VARCHAR(100) NOT NULL,
  brand_id UUID REFERENCES brands(id) ON DELETE SET NULL,
  original_price DECIMAL(10,2) NOT NULL,
  discount_price DECIMAL(10,2),
  is_discounted BOOLEAN DEFAULT false,
  is_new_arrival BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- PRODUCT IMAGES TABLE
-- ============================================
CREATE TABLE product_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  imagekit_file_id VARCHAR(255),
  is_primary BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  image_type VARCHAR(50) DEFAULT 'full-body' CHECK (image_type IN ('full-body', 'small', 'mockup')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- PRODUCT SIZES TABLE (with stock info)
-- ============================================
CREATE TABLE product_sizes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  size VARCHAR(20) NOT NULL,
  is_available BOOLEAN DEFAULT true,
  stock_quantity INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(product_id, size)
);

-- ============================================
-- HOMEPAGE CONTENT TABLE (editable by owner)
-- ============================================
CREATE TABLE homepage_content (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  section_type VARCHAR(100) NOT NULL UNIQUE,
  title VARCHAR(500),
  subtitle VARCHAR(500),
  description TEXT,
  image_url TEXT,
  button_text VARCHAR(255),
  button_link VARCHAR(500),
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- HERO IMAGES TABLE (model images for homepage)
-- ============================================
CREATE TABLE hero_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(500),
  subtitle VARCHAR(500),
  description TEXT,
  image_url TEXT NOT NULL,
  link_url VARCHAR(500),
  button_text VARCHAR(255),
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- SOCIAL MEDIA LINKS TABLE
-- ============================================
CREATE TABLE social_media (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  platform VARCHAR(100) NOT NULL UNIQUE,
  url VARCHAR(500),
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- SHOP INFO TABLE
-- ============================================
CREATE TABLE shop_info (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shop_name VARCHAR(255) NOT NULL DEFAULT 'LUXE WEAR',
  tagline VARCHAR(500) DEFAULT 'Redefining Fashion',
  logo_url TEXT,
  favicon_url TEXT,
  email VARCHAR(255),
  phone VARCHAR(50),
  address TEXT,
  about_us TEXT,
  map_embed_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- FILTER OPTIONS TABLE
-- ============================================
CREATE TABLE filter_options (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  filter_type VARCHAR(100) NOT NULL,
  filter_value VARCHAR(255) NOT NULL,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(filter_type, filter_value)
);

-- ============================================
-- INSERT DEFAULT BRANDS (major brands in descending order of popularity)
-- ============================================
INSERT INTO brands (name, slug) VALUES
('Nike', 'nike'),
('Adidas', 'adidas'),
('Gucci', 'gucci'),
('Louis Vuitton', 'louis-vuitton'),
('Prada', 'prada'),
('Balenciaga', 'balenciaga'),
('Versace', 'versace'),
('Dior', 'dior'),
('Chanel', 'chanel'),
('Burberry', 'burberry'),
('Ralph Lauren', 'ralph-lauren'),
('Calvin Klein', 'calvin-klein'),
('Tommy Hilfiger', 'tommy-hilfiger'),
('Levi''s', 'levis'),
('H&M', 'hm'),
('Zara', 'zara'),
('Uniqlo', 'uniqlo'),
('Puma', 'puma'),
('New Balance', 'new-balance'),
('Under Armour', 'under-armour'),
('Reebok', 'reebok'),
('Fendi', 'fendi'),
('Givenchy', 'givenchy'),
('Yves Saint Laurent', 'yves-saint-laurent'),
('Valentino', 'valentino'),
('Coach', 'coach'),
('Michael Kors', 'michael-kors'),
('Hugo Boss', 'hugo-boss'),
('Armani', 'armani'),
('Gap', 'gap');

-- ============================================
-- INSERT DEFAULT FILTER OPTIONS
-- ============================================
-- Men's subcategories
INSERT INTO filter_options (filter_type, filter_value, display_order) VALUES
('men', 'Shirts', 1),
('men', 'T-Shirts', 2),
('men', 'Polo Shirts', 3),
('men', 'Jeans', 4),
('men', 'Chinos', 5),
('men', 'Trousers', 6),
('men', 'Shorts', 7),
('men', 'Jackets', 8),
('men', 'Hoodies', 9),
('men', 'Sweatshirts', 10),
('men', 'Suits', 11),
('men', 'Blazers', 12),
('men', 'Coats', 13),
('men', 'Sweaters', 14),
('men', 'Tank Tops', 15),
('men', 'Activewear', 16),
('men', 'Sleepwear', 17),
('men', 'Swimwear', 18);

-- Women's subcategories
INSERT INTO filter_options (filter_type, filter_value, display_order) VALUES
('women', 'Dresses', 1),
('women', 'Tops', 2),
('women', 'Blouses', 3),
('women', 'T-Shirts', 4),
('women', 'Skirts', 5),
('women', 'Jeans', 6),
('women', 'Trousers', 7),
('women', 'Leggings', 8),
('women', 'Shorts', 9),
('women', 'Jackets', 10),
('women', 'Coats', 11),
('women', 'Blazers', 12),
('women', 'Hoodies', 13),
('women', 'Sweaters', 14),
('women', 'Cardigans', 15),
('women', 'Activewear', 16),
('women', 'Sleepwear', 17),
('women', 'Swimwear', 18);

-- Kids subcategories
INSERT INTO filter_options (filter_type, filter_value, display_order) VALUES
('kids', 'T-Shirts', 1),
('kids', 'Shirts', 2),
('kids', 'Dresses', 3),
('kids', 'Jeans', 4),
('kids', 'Shorts', 5),
('kids', 'Trousers', 6),
('kids', 'Skirts', 7),
('kids', 'Jackets', 8),
('kids', 'Hoodies', 9),
('kids', 'Sweaters', 10),
('kids', 'Activewear', 11),
('kids', 'Sleepwear', 12),
('kids', 'Swimwear', 13),
('kids', 'School Uniforms', 14);

-- Available sizes
INSERT INTO filter_options (filter_type, filter_value, display_order) VALUES
('sizes_men', 'XS', 1),
('sizes_men', 'S', 2),
('sizes_men', 'M', 3),
('sizes_men', 'L', 4),
('sizes_men', 'XL', 5),
('sizes_men', 'XXL', 6),
('sizes_men', '3XL', 7),
('sizes_men', '4XL', 8),

('sizes_women', 'XXS', 1),
('sizes_women', 'XS', 2),
('sizes_women', 'S', 3),
('sizes_women', 'M', 4),
('sizes_women', 'L', 5),
('sizes_women', 'XL', 6),
('sizes_women', 'XXL', 7),

('sizes_kids', '2-3Y', 1),
('sizes_kids', '4-5Y', 2),
('sizes_kids', '6-7Y', 3),
('sizes_kids', '8-9Y', 4),
('sizes_kids', '10-11Y', 5),
('sizes_kids', '12-13Y', 6),
('sizes_kids', '14-15Y', 7);

-- ============================================
-- INSERT DEFAULT HOMEPAGE CONTENT
-- ============================================
INSERT INTO homepage_content (section_type, title, subtitle, description, button_text, display_order) VALUES
('hero', 'NEW COLLECTION', 'S/S 2024', 'Discover the latest trends in fashion. Curated collections that define modern elegance and sophistication.', 'SHOP NOW', 1),
('model_showcase', 'FEATURED LOOK', 'Street Style Essentials', 'Explore our handpicked selection of premium streetwear that blends comfort with cutting-edge design.', 'EXPLORE', 2),
('explore_more', 'EXPLORE MORE', 'Discover Your Style', 'Browse through our complete collection and find pieces that speak to your unique sense of fashion.', 'VIEW ALL', 3);

-- ============================================
-- INSERT DEFAULT SOCIAL MEDIA PLATFORMS
-- ============================================
INSERT INTO social_media (platform, is_active, display_order) VALUES
('instagram', false, 1),
('facebook', false, 2),
('twitter', false, 3),
('tiktok', false, 4),
('youtube', false, 5),
('pinterest', false, 6);

-- ============================================
-- INSERT DEFAULT SHOP INFO
-- ============================================
INSERT INTO shop_info (shop_name, tagline) VALUES
('LUXE WEAR', 'Redefining Fashion');

-- ============================================
-- INDEXES for better performance
-- ============================================
CREATE INDEX idx_products_gender ON products(gender);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_brand_id ON products(brand_id);
CREATE INDEX idx_products_is_active ON products(is_active);
CREATE INDEX idx_products_is_new_arrival ON products(is_new_arrival);
CREATE INDEX idx_products_is_featured ON products(is_featured);
CREATE INDEX idx_products_created_at ON products(created_at DESC);
CREATE INDEX idx_product_images_product_id ON product_images(product_id);
CREATE INDEX idx_product_sizes_product_id ON product_sizes(product_id);
CREATE INDEX idx_filter_options_type ON filter_options(filter_type);

-- ============================================
-- ROW LEVEL SECURITY (RLS) Policies
-- ============================================
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_sizes ENABLE ROW LEVEL SECURITY;
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE homepage_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE hero_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE shop_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE filter_options ENABLE ROW LEVEL SECURITY;

-- Public read access for all tables
CREATE POLICY "Public read access" ON products FOR SELECT USING (true);
CREATE POLICY "Public read access" ON product_images FOR SELECT USING (true);
CREATE POLICY "Public read access" ON product_sizes FOR SELECT USING (true);
CREATE POLICY "Public read access" ON brands FOR SELECT USING (true);
CREATE POLICY "Public read access" ON homepage_content FOR SELECT USING (true);
CREATE POLICY "Public read access" ON hero_images FOR SELECT USING (true);
CREATE POLICY "Public read access" ON social_media FOR SELECT USING (true);
CREATE POLICY "Public read access" ON shop_info FOR SELECT USING (true);
CREATE POLICY "Public read access" ON filter_options FOR SELECT USING (true);

-- Admin full access (using service role key for admin operations)
-- Admin operations will use the service_role key which bypasses RLS