-- ============================================
-- CART ITEMS TABLE (per-user cloud carts)
-- Run this in Supabase SQL Editor
-- ============================================

-- Per-user cart items linked to Supabase Auth users
CREATE TABLE IF NOT EXISTS cart_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  size VARCHAR(20),
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity >= 1),
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, product_id, size)
);

CREATE INDEX IF NOT EXISTS idx_cart_items_user_id ON cart_items(user_id);

-- Enable Row Level Security
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;

-- Users can only read / write their OWN cart
DROP POLICY IF EXISTS "Users read own cart" ON cart_items;
CREATE POLICY "Users read own cart" ON cart_items
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users insert own cart" ON cart_items;
CREATE POLICY "Users insert own cart" ON cart_items
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users update own cart" ON cart_items;
CREATE POLICY "Users update own cart" ON cart_items
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users delete own cart" ON cart_items;
CREATE POLICY "Users delete own cart" ON cart_items
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================================
-- SETUP INSTRUCTIONS FOR SOCIAL LOGIN + PHONE (Supabase)
-- ============================================================
-- 1. Supabase Dashboard → Authentication → Providers
-- 2. Turn ON each provider below and fill in its keys:
--
--    GOOGLE:
--      - Go to https://console.cloud.google.com → create OAuth client
--      - Authorized redirect URI:
--        https://YOUR-PROJECT-REF.supabase.co/auth/v1/callback
--      - Paste Client ID + Client Secret into Supabase
--
--    GITHUB:
--      - Go to https://github.com/settings/developers → New OAuth App
--      - Authorization callback URL:
--        https://YOUR-PROJECT-REF.supabase.co/auth/v1/callback
--      - Paste Client ID + Client Secret into Supabase
--
--    FACEBOOK:
--      - Go to https://developers.facebook.com → your app
--      - Valid OAuth Redirect URI:
--        https://YOUR-PROJECT-REF.supabase.co/auth/v1/callback
--      - Paste App ID + App Secret into Supabase
--
--    APPLE:
--      - Requires an Apple Developer account ($99/year)
--      - Services ID + Private Key + Team ID + Key ID go into Supabase
--
-- 3. PHONE OTP (SMS):
--      - Supabase Dashboard → Authentication → Providers → Phone
--      - Turn ON "Enable Phone Signup"
--      - Choose provider: MessageBird or Twilio
--      - Enter your Twilio Account SID + Auth Token + service SID
--        (or MessageBird API key)
--      - Add a test phone number in "Test Phone Numbers" to test free
--
-- 4. Optional: more providers in the same menu
--      - X/Twitter, Discord, LinkedIn, WhatsApp, Email magic links
--
-- 5. Site URL (important for OAuth redirect after login):
--      - Supabase Dashboard → Authentication → URL Configuration
--      - Site URL: http://localhost:3000 (dev)
--      - Add Redirect URLs: http://localhost:3000/**