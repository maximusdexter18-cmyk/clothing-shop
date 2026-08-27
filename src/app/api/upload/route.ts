import { NextRequest, NextResponse } from "next/server";
import { uploadImage } from "@/lib/imagekit";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const productId = formData.get("productId") as string;
    const isPrimary = formData.get("isPrimary") === "true";
    const displayOrder = parseInt(formData.get("displayOrder") as string) || 0;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "-")}`;

    const { url, fileId } = await uploadImage(buffer, fileName);

    // Save image record to Supabase
    const { error } = await supabaseAdmin.from("product_images").insert({
      product_id: productId,
      image_url: url,
      imagekit_file_id: fileId,
      is_primary: isPrimary,
      display_order: displayOrder,
    });

    if (error) throw error;

    return NextResponse.json({ url, fileId, success: true });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}