import { NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import { isCloudinaryConfigured, uploadImageToCloudinary } from "@/lib/cloudinary";

const MAX_IMAGE_SIZE_BYTES = 8 * 1024 * 1024; // 8 MB
const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
]);

function normalizeSlugSegment(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

// POST /api/admin/blog/upload-image - Upload a blog image to Cloudinary
export async function POST(request: Request) {
  try {
    const user = await getUser();
    if (!user?.id || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!isCloudinaryConfigured()) {
      return NextResponse.json(
        { error: "Cloudinary env vars are missing on the server." },
        { status: 500 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file");
    const scopeRaw = String(formData.get("scope") || "inline").toLowerCase();
    const scope = scopeRaw === "cover" ? "cover" : "inline";
    const slugRaw = String(formData.get("slug") || "");
    const normalizedSlug = normalizeSlugSegment(slugRaw);

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Image file is required." }, { status: 400 });
    }

    if (!ALLOWED_MIME_TYPES.has(file.type)) {
      return NextResponse.json(
        { error: "Unsupported file type. Use JPG, PNG, WEBP, or GIF." },
        { status: 400 }
      );
    }

    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      return NextResponse.json(
        { error: "File too large. Max size is 8MB." },
        { status: 400 }
      );
    }

    const folder = scope === "cover" ? "golfsimmap/blog/covers" : "golfsimmap/blog/inline";
    const coverPublicId = scope === "cover" && normalizedSlug ? `${normalizedSlug}-cover` : undefined;

    const uploaded = await uploadImageToCloudinary({
      file,
      folder,
      publicId: coverPublicId,
      overwrite: Boolean(coverPublicId),
    });

    return NextResponse.json({
      ok: true,
      url: uploaded.secureUrl,
      publicId: uploaded.publicId,
      width: uploaded.width,
      height: uploaded.height,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to upload image.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
