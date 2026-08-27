const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigration() {
  console.log('Running scroll_reveal_images migration...');
  
  // First, let's check if the table exists by trying to query it
  const { data: testData, error: testError } = await supabase
    .from('scroll_reveal_images')
    .select('id')
    .limit(1);
  
  if (testError) {
    console.log('Table does not exist or error:', testError.message);
    console.log('You need to run the migration SQL in the Supabase dashboard SQL editor.');
    console.log('');
    console.log('Go to: https://supabase.com/dashboard/project/ysodriatejlkejonkqti/sql');
    console.log('And run this SQL:');
    console.log(`
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
  ('https://images.unsplash.com/photo-1504384308090-c894fdcc538d', 'City skyline', 3)
ON CONFLICT DO NOTHING;
`);
  } else {
    console.log('Table exists! Checking data...');
    const { data, error } = await supabase
      .from('scroll_reveal_images')
      .select('*');
    
    if (error) {
      console.error('Error fetching data:', error.message);
    } else {
      console.log(`Found ${data.length} scroll reveal images:`);
      data.forEach(img => console.log(`  - ${img.alt} (order: ${img.display_order})`));
      
      // Insert sample data if empty
      if (data.length === 0) {
        console.log('Table is empty, inserting sample data...');
        const { error: insertError } = await supabase
          .from('scroll_reveal_images')
          .insert([
            { src: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb', alt: 'Beautiful nature landscape', display_order: 1 },
            { src: 'https://images.unsplash.com/photo-1519681393784-d120267933ba', alt: 'Mountain view', display_order: 2 },
            { src: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d', alt: 'City skyline', display_order: 3 }
          ]);
        
        if (insertError) {
          console.error('Insert error:', insertError.message);
        } else {
          console.log('Sample data inserted successfully!');
        }
      }
    }
  }
}

runMigration();