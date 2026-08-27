-- Scroll Reveal Images table for admin-controlled scroll animations
CREATE TABLE IF NOT EXISTS scroll_reveal_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  src TEXT NOT NULL,
  alt TEXT NOT NULL,
  height INTEGER DEFAULT 400,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS (Row Level Security)
ALTER TABLE scroll_reveal_images ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Public can view active scroll reveal images" ON scroll_reveal_images
  FOR SELECT USING (is_active = true);

CREATE POLICY "Authenticated users can manage scroll reveal images" ON scroll_reveal_images
  FOR ALL USING (auth.role() = 'authenticated');

-- Index for ordering
CREATE INDEX IF NOT EXISTS idx_scroll_reveal_images_order ON scroll_reveal_images(display_order);
CREATE INDEX IF NOT EXISTS idx_scroll_reveal_images_active ON scroll_reveal_images(is_active);

-- Insert sample data
INSERT INTO scroll_reveal_images (src, alt, display_order) VALUES
  ('https://images.unsplash.com/photo-1506744038136-46273834b3fb', 'Beautiful nature landscape', 1),
  ('https://images.unsplash.com/photo-1519681393784-d120267933ba', 'Mountain view', 2),
  ('https://images.unsplash.com/photo-1504384308090-c894fdcc538d', 'City skyline', 3);