import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getVerifiedServerAccessToken } from "@/lib/auth/server-session";
import sharp from "sharp";

const BUCKET = "product-images";
const MAX_INPUT_SIZE = 10 * 1024 * 1024; // 10MB raw input limit

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

async function ensureBucketExists(supabase: ReturnType<typeof getAdminClient>) {
  const { data: buckets } = await supabase.storage.listBuckets();
  const exists = buckets?.some((b) => b.id === BUCKET);
  if (!exists) {
    await supabase.storage.createBucket(BUCKET, {
      public: true,
      fileSizeLimit: 5 * 1024 * 1024,
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await getVerifiedServerAccessToken();
    if ("error" in auth) return auth.error;

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No se proporcionó archivo" }, { status: 400 });
    }

    if (file.size > MAX_INPUT_SIZE) {
      return NextResponse.json(
        { error: "El archivo supera el límite de 10MB." },
        { status: 400 }
      );
    }

    // Convert any image format to JPEG using sharp (supports HEIC, PNG, WEBP, etc.)
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const compressed = await sharp(buffer)
      .rotate() // auto-rotate based on EXIF
      .resize(1200, 1200, { fit: "inside", withoutEnlargement: true })
      .jpeg({ quality: 80 })
      .toBuffer();

    const supabase = getAdminClient();
    await ensureBucketExists(supabase);

    const path = `${Date.now()}.jpg`;

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(path, compressed, {
        contentType: "image/jpeg",
        upsert: false,
      });

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    const { data: publicData } = supabase.storage.from(BUCKET).getPublicUrl(path);

    return NextResponse.json({ url: publicData.publicUrl });
  } catch (error) {
    console.error("Error uploading product image:", error);
    return NextResponse.json({ error: "Error al subir la imagen" }, { status: 500 });
  }
}
