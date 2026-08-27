import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    if (action === "shop-info") {
      const { id, shop_name, tagline, email, phone, address, about_us, map_embed_url, location, review_link } = body;
      const { error } = await supabaseAdmin.from("shop_info").upsert({
        id,
        shop_name,
        tagline,
        email,
        phone,
        address,
        about_us,
        map_embed_url,
        location,
        review_link,
      });
      if (error) throw error;
      return NextResponse.json({ success: true });
    }

    if (action === "add-brand") {
      const { name } = body;
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      const { error } = await supabaseAdmin.from("brands").insert({ name, slug });
      if (error) throw error;
      return NextResponse.json({ success: true });
    }

    if (action === "save-social") {
      const { platform, url, is_active } = body;
      const { error } = await supabaseAdmin
        .from("social_media")
        .upsert({ platform, url, is_active }, { onConflict: "platform" });
      if (error) throw error;
      return NextResponse.json({ success: true });
    }

    if (action === "homepage-content") {
      const { section_type, title, subtitle, description, button_text } = body;
      const { error } = await supabaseAdmin.from("homepage_content").upsert(
        { section_type, title, subtitle, description, button_text },
        { onConflict: "section_type" }
      );
      if (error) throw error;
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (error) {
    console.error("Settings API error:", error);
    return NextResponse.json({ error: "Failed to save settings" }, { status: 500 });
  }
}