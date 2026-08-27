import ImageKit from "imagekit";

const publicKey = process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY || "";
const privateKey = process.env.IMAGEKIT_PRIVATE_KEY || "";
const urlEndpoint = process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT || "";

const isImageKitConfigured =
  !!publicKey &&
  !!privateKey &&
  !!urlEndpoint &&
  !publicKey.includes("your_") &&
  !privateKey.includes("your_") &&
  !urlEndpoint.includes("your_");

export const imagekit: ImageKit | null = isImageKitConfigured
  ? new ImageKit({ publicKey, privateKey, urlEndpoint })
  : null;

// Client-side URL generation
export function getImageUrl(
  path: string,
  options?: {
    width?: number;
    height?: number;
    quality?: number;
    format?: string;
  }
): string {
  const endpoint = process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT || "";
  if (!endpoint || endpoint.includes("your_")) return path;

  let url = `${endpoint}${path}`;
  const params: string[] = [];

  if (options?.width) params.push(`w-${options.width}`);
  if (options?.height) params.push(`h-${options.height}`);
  if (options?.quality) params.push(`q-${options.quality}`);
  if (options?.format) params.push(`f-${options.format}`);

  if (params.length > 0) {
    url += `?${params.join(",")}`;
  }

  return url;
}

// Upload image (server-side only)
export async function uploadImage(
  file: Buffer,
  fileName: string,
  folder: string = "products"
): Promise<{ url: string; fileId: string }> {
  if (!imagekit) {
    throw new Error(
      "ImageKit is not configured. Add your ImageKit credentials to .env.local"
    );
  }
  const result = await imagekit.upload({
    file,
    fileName,
    folder: `/clothing-shop/${folder}`,
  });

  return {
    url: result.url,
    fileId: result.fileId,
  };
}

// Delete image (server-side only)
export async function deleteImage(fileId: string): Promise<void> {
  if (!imagekit) {
    throw new Error(
      "ImageKit is not configured. Add your ImageKit credentials to .env.local"
    );
  }
  await imagekit.deleteFile(fileId);
}