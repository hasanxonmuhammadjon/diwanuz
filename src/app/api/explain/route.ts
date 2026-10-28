import { explainVerse } from "@/lib/ai/gemini";
import { aiErrorResponse, jsonError, rateLimited, sha256 } from "@/lib/api-utils";
import type { Explanation } from "@/lib/reading";
import { store } from "@/lib/store";

export const maxDuration = 30;

export async function POST(req: Request) {
  let body: { lines?: unknown; poet?: unknown };
  try {
    body = await req.json();
  } catch {
    return jsonError(400, "bad-json", "So'rov noto'g'ri formatda.");
  }
  const lines = Array.isArray(body.lines)
    ? body.lines.filter((l): l is string => typeof l === "string" && l.trim() !== "").slice(0, 4)
    : [];
  const poet = typeof body.poet === "string" ? body.poet.slice(0, 80) : undefined;
  if (lines.length === 0 || lines.some((l) => l.length > 300)) {
    return jsonError(400, "bad-lines", "Izoh uchun 1–4 ta misra yuboring.");
  }

  const cacheKey = `explain:v1:${sha256(lines.join("\n") + "|" + (poet ?? ""))}`;
  const cached = (await store().getCache(cacheKey)) as Explanation | null;
  if (cached) return Response.json({ explanation: cached, cached: true });

  if (rateLimited(req, 30, 10 * 60_000)) {
    return jsonError(429, "rate-limit", "Juda ko'p so'rov. Birozdan so'ng qayta urinib ko'ring.");
  }

  try {
    const { data } = await explainVerse(lines, poet);
    await store().setCache(cacheKey, data);
    return Response.json({ explanation: data, cached: false });
  } catch (err) {
    return aiErrorResponse(err);
  }
}
