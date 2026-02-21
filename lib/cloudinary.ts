import "server-only";

import { createHash } from "node:crypto";

const cloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim() || "";
const apiKey = process.env.CLOUDINARY_API_KEY?.trim() || "";
const apiSecret = process.env.CLOUDINARY_API_SECRET?.trim() || "";
const defaultFolder = process.env.CLOUDINARY_FOLDER?.trim() || "golfsimmap/blog";

export function isCloudinaryConfigured(): boolean {
  return Boolean(cloudName && apiKey && apiSecret);
}

function buildSignature(params: Record<string, string>, secret: string): string {
  const toSign = Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== null && value !== "")
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join("&");

  return createHash("sha1")
    .update(`${toSign}${secret}`)
    .digest("hex");
}

export interface UploadImageOptions {
  file: File;
  folder?: string;
  publicId?: string;
  overwrite?: boolean;
}

export interface UploadImageResult {
  originalUrl: string;
  webpUrl: string;
  secureUrl: string;
  publicId: string;
  width?: number;
  height?: number;
}

export async function uploadImageToCloudinary({
  file,
  folder = defaultFolder,
  publicId,
  overwrite = false,
}: UploadImageOptions): Promise<UploadImageResult> {
  if (!isCloudinaryConfigured()) {
    throw new Error("Cloudinary is not configured.");
  }

  const timestamp = Math.floor(Date.now() / 1000).toString();
  const overwriteFlag = overwrite ? "true" : "";
  const signature = buildSignature(
    {
      folder,
      timestamp,
      public_id: publicId || "",
      overwrite: overwriteFlag,
    },
    apiSecret
  );
  const endpoint = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

  const formData = new FormData();
  formData.append("file", file);
  formData.append("timestamp", timestamp);
  formData.append("api_key", apiKey);
  formData.append("signature", signature);
  formData.append("folder", folder);
  if (publicId) {
    formData.append("public_id", publicId);
  }
  if (overwrite) {
    formData.append("overwrite", "true");
  }

  const response = await fetch(endpoint, {
    method: "POST",
    body: formData,
  });

  const payload = (await response.json()) as {
    secure_url?: string;
    public_id?: string;
    version?: number;
    width?: number;
    height?: number;
    error?: { message?: string };
  };

  if (!response.ok || !payload.secure_url || !payload.public_id) {
    throw new Error(payload.error?.message || "Cloudinary upload failed.");
  }

  const versionSegment = typeof payload.version === "number" ? `/v${payload.version}` : "";
  const webpUrl = `https://res.cloudinary.com/${cloudName}/image/upload/f_webp,q_auto${versionSegment}/${payload.public_id}.webp`;

  return {
    originalUrl: payload.secure_url,
    webpUrl,
    secureUrl: webpUrl,
    publicId: payload.public_id,
    width: payload.width,
    height: payload.height,
  };
}
