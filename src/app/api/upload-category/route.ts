import { NextRequest, NextResponse } from "next/server";
import { uploadImage } from "@/lib/imagekit";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const gender = formData.get("gender") as string; // men, women, kids

    if (!file || !gender) {
      return NextResponse.json({ error: "No file or gender provided" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const fileName = `category-${gender}-${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "-")}`;

    const { url, fileId } = await uploadImage(buffer, fileName);

    // Upsert into homepage_content with section_type = "category_{gender}"
    const sectionType = `category_${gender}`;

    // Check if record exists
    const { data: existing } = await supabaseAdmin
      .from("homepage_content")
      .select("id")
      .eq("section_type", sectionType)
      .limit(1)
      .single();

    if (existing) {
      // Update existing
      const { error } = await supabaseAdmin
        .from("homepage_content")
        .update({ image_url: url, is_active: true })
        .eq("id", existing.id);
      if (error) throw error;
    } else {
      // Insert new
      const { error } = await supabaseAdmin.from("homepage_content").insert({
        section_type: sectionType,
        title: `${gender} Category`,
        image_url: url,
        is_active: true,
        display_order: 10,
      });
      if (error) throw error;
    }

    return NextResponse.json({ url, fileId, success: true });
  } catch (error) {
    console.error("Category upload error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}