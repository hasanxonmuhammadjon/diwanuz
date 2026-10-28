// Client-side image preparation: downscale before upload so requests stay
// small (serverless body limits, free-tier tokens) without hurting legibility.

export interface PreparedImage {
  base64: string;
  mimeType: "image/jpeg";
  dataUrl: string;
  width: number;
  height: number;
  name: string;
}

export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

async function loadBitmap(src: Blob | string): Promise<HTMLImageElement> {
  const url = typeof src === "string" ? src : URL.createObjectURL(src);
  try {
    const img = new Image();
    img.decoding = "async";
    img.crossOrigin = "anonymous";
    img.src = url;
    await img.decode();
    return img;
  } finally {
    if (typeof src !== "string") setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
}

export async function prepareImage(
  src: File | Blob | string,
  maxSide = 2000,
  quality = 0.86,
  name = src instanceof File ? src.name : "sahifa.jpg",
): Promise<PreparedImage> {
  const img = await loadBitmap(src);
  const scale = Math.min(1, maxSide / Math.max(img.naturalWidth, img.naturalHeight));
  const width = Math.round(img.naturalWidth * scale);
  const height = Math.round(img.naturalHeight * scale);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas mavjud emas");
  ctx.drawImage(img, 0, 0, width, height);
  const dataUrl = canvas.toDataURL("image/jpeg", quality);
  return { base64: dataUrl.split(",")[1], mimeType: "image/jpeg", dataUrl, width, height, name };
}

export function downloadText(filename: string, text: string, type = "text/plain") {
  const blob = new Blob([text], { type: `${type};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
