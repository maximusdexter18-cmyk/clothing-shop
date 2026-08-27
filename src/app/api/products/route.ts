import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { uploadImage } from "@/lib/imagekit";

export async function GET() {
  try {
    // Try full select first; if foreign key relationship for category or brand doesn't exist in Supabase schema, fall back safely
    let data = null;
    let { data: resData, error } = await supabaseAdmin
      .from("products")
      .select("*, images:product_images(*), sizes:product_sizes(*), brand:brands(*)")
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (error) {
      // Fallback without relations if tables/relations differ
      const fallback = await supabaseAdmin
        .from("products")
        .select("*, images:product_images(*), sizes:product_sizes(*)")
        .eq("is_active", true)
        .order("created_at", { ascending: false });
      if (fallback.error) throw fallback.error;
      data = fallback.data;
    } else {
      data = resData;
    }

    return NextResponse.json(data || []);
  } catch (error) {
    console.error("GET Products error:", error);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    // Extract product fields
    const name = formData.get("name") as string;
    const description = (formData.get("description") as string) || null;
    const gender = formData.get("gender") as string;
    const category = formData.get("category") as string;
    const brandId = (formData.get("brandId") as string) || null;
    const originalPrice = parseFloat(formData.get("originalPrice") as string);
    const discountPriceRaw = formData.get("discountPrice") as string;
    const discountPrice = discountPriceRaw ? parseFloat(discountPriceRaw) : null;
    const isDiscounted = !!discountPrice && discountPrice > 0;
    const isNewArrival = formData.get("isNewArrival") === "true";
    const isFeatured = formData.get("isFeatured") === "true";
    const productId = (formData.get("productId") as string) || null;

    if (!name || !gender || !category || isNaN(originalPrice)) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const productData = {
      name,
      description,
      gender,
      category,
      brand_id: brandId,
      original_price: originalPrice,
      discount_price: isDiscounted ? discountPrice : null,
      is_discounted: isDiscounted,
      is_new_arrival: isNewArrival,
      is_featured: isFeatured,
      is_active: true,
    };

    let savedProductId: string;

    if (productId) {
      // Update existing product
      const { data, error } = await supabaseAdmin
        .from("products")
        .update(productData)
        .eq("id", productId)
        .select("id")
        .single();
      if (error) throw error;
      savedProductId = data.id;

      // Delete old sizes and images (service-role bypasses RLS)
      await supabaseAdmin.from("product_sizes").delete().eq("product_id", savedProductId);
      await supabaseAdmin.from("product_images").delete().eq("product_id", savedProductId);
    } else {
      // Insert new product
      const { data, error } = await supabaseAdmin
        .from("products")
        .insert(productData)
        .select("id")
        .single();
      if (error) throw error;
      savedProductId = data.id;
    }

    // Insert sizes
    const sizeValues = formData.getAll("sizes[]") as string[];
    if (sizeValues.length > 0) {
      const sizeInserts = sizeValues.map((size) => ({
        product_id: savedProductId,
        size,
        is_available: true,
        stock_quantity: 10,
      }));
      const { error: sizeError } = await supabaseAdmin
        .from("product_sizes")
        .insert(sizeInserts);
      if (sizeError) throw sizeError;
    }

    // Upload images in three categories: full-body, small, mockup
    const uploadGroups: { key: string; type: "full-body" | "small" | "mockup" }[] = [
      { key: "fullBodyImages[]", type: "full-body" },
      { key: "smallImages[]", type: "small" },
      { key: "mockupImages[]", type: "mockup" },
    ];

    for (const group of uploadGroups) {
      const imageFiles = formData.getAll(group.key) as File[];
      let isPrimaryAssigned = false;

      for (let i = 0; i < imageFiles.length; i++) {
        const file = imageFiles[i];
        const buffer = Buffer.from(await file.arrayBuffer());
        const fileName = `${Date.now()}-${group.type}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "-")}`;

        const { url, fileId } = await uploadImage(buffer, fileName);

        const imageRecord = {
          product_id: savedProductId,
          image_url: url,
          imagekit_file_id: fileId,
          is_primary: group.type === "full-body" && !isPrimaryAssigned,
          display_order: i,
          image_type: group.type,
        };

        // Try inserting with image_type first; if the column doesn't exist in live DB,
        // fall back to inserting without it so images always save.
        const { error: imgError } = await supabaseAdmin
          .from("product_images")
          .insert(imageRecord);

        if (imgError && imgError.message?.includes("image_type")) {
          const { is_primary, display_order } = imageRecord;
          const { error: fallbackError } = await supabaseAdmin
            .from("product_images")
            .insert({
              product_id: savedProductId,
              image_url: url,
              imagekit_file_id: fileId,
              is_primary,
              display_order,
            });
          if (fallbackError) throw fallbackError;
        } else if (imgError) {
          throw imgError;
        }

        if (group.type === "full-body") isPrimaryAssigned = true;
      }
    }

    return NextResponse.json({ id: savedProductId, success: true });
  } catch (error) {
    console.error("Products API error:", error);
    return NextResponse.json({ error: "Failed to save product" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Missing product id" }, { status: 400 });
    }

    const { error } = await supabaseAdmin.from("products").delete().eq("id", id);
    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete error:", error);
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { id, is_available } = await request.json();
    if (!id) {
      return NextResponse.json({ error: "Missing product id" }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from("product_sizes")
      .update({ is_available, stock_quantity: is_available ? 10 : 0 })
      .eq("product_id", id);
    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Toggle stock error:", error);
    return NextResponse.json({ error: "Failed to update stock" }, { status: 500 });
  }
}