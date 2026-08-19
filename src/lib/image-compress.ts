// Client-side image downscale/re-encode, shared by every "upload a small
// branded image" flow in this app (tenant logo, user avatar). Mirrors
// auth-api's internal/pkg/imageutil server-side cap — the server is
// authoritative, but shrinking client-side first avoids a slow upload of a
// multi-MB file just to have the server reject or downscale it.
// Extracted from BrandingTab.tsx (Phase 10) so the profile page's avatar
// upload reuses this exact logic instead of a second copy.

export interface ImageCompressOptions {
  maxDimension: number;
  maxBytes: number;
}

export function blobToDataURL(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

/** Downscales/re-encodes an image file to fit within the given dimension/byte
 * caps, returning a data URL. Tries PNG first (preserves transparency), then
 * falls back to JPEG at decreasing quality. */
export async function compressImageFile(file: File, opts: ImageCompressOptions): Promise<string> {
  const { maxDimension, maxBytes } = opts;
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height));
  const w = Math.max(1, Math.round(bitmap.width * scale));
  const h = Math.max(1, Math.round(bitmap.height * scale));

  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('canvas unavailable');
  ctx.drawImage(bitmap, 0, 0, w, h);

  const toBlob = (type: string, quality?: number) =>
    new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, quality));

  const pngBlob = await toBlob('image/png');
  if (pngBlob && pngBlob.size <= maxBytes) return blobToDataURL(pngBlob);

  for (const quality of [0.85, 0.7, 0.55, 0.4]) {
    const jpegBlob = await toBlob('image/jpeg', quality);
    if (jpegBlob && jpegBlob.size <= maxBytes) return blobToDataURL(jpegBlob);
  }
  throw new Error(`Could not compress this image under ${Math.round(maxBytes / 1024)}KB. Please use a smaller or simpler image.`);
}
