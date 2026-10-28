import { readManuscript } from "@/lib/ai/gemini";
import { aiErrorResponse, jsonError, rateLimited, sha256 } from "@/lib/api-utils";
import type { PageReading, ReadResponse } from "@/lib/reading";
import { store } from "@/lib/store";

export const maxDuration = 60;

const MIME = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_BASE64 = 4_000_000; // stays under the 4.5 MB serverless body limit

export async function POST(req: Request) {
  let body: { image?: unknown; mimeType?: unknown };
  try {
    body = await req.json();
  } catch {
    return jsonError(400, "bad-json", "So'rov noto'g'ri formatda.");
  }
  const { image, mimeType } = body;
  if (typeof image !== "string" || typeof mimeType !== "string" || !MIME.has(mimeType)) {
    return jsonError(400, "bad-image", "PNG, JPG yoki WEBP rasm yuboring.");
  }
  if (image.length > MAX_BASE64) {
    return jsonError(413, "too-large", "Rasm juda katta. 4 MB dan kichik rasm yuboring.");
  }

  const imageHash = sha256(image);
  const cacheKey = `read:v1:${imageHash}`;
  const cached = (await store().getCache(cacheKey)) as { reading: PageReading; model: string } | null;
  if (cached) {
    return Response.json({ ...cached, cached: true, imageHash } satisfies ReadResponse);
  }

  if (rateLimited(req, 15, 10 * 60_000)) {
    return jsonError(429, "rate-limit", "Juda ko'p so'rov. 10 daqiqadan so'ng qayta urinib ko'ring.");
  }

  try {
    const { reading, model } = await readManuscript({ data: image, mimeType });
    await store().setCache(cacheKey, { reading, model });
    return Response.json({ reading, model, cached: false, imageHash } satisfies ReadResponse);
  } catch (err) {
    return aiErrorResponse(err);
  }
}
