import { createHash } from "node:crypto";
import { AiUnavailableError } from "@/lib/ai/gemini";

export const sha256 = (s: string) => createHash("sha256").update(s).digest("hex");

export function jsonError(status: number, code: string, message: string) {
  return Response.json({ error: { code, message } }, { status });
}

export function aiErrorResponse(err: unknown) {
  if (err instanceof AiUnavailableError) {
    if (err.reason === "no-key")
      return jsonError(503, "no-key", "AI kaliti sozlanmagan. Hozircha namuna qo'lyozmalardan foydalaning.");
    if (err.reason === "rate-limit")
      return jsonError(429, "rate-limit", "Bepul AI limiti vaqtincha tugadi. Bir ozdan so'ng qayta urinib ko'ring yoki namunalarni oching.");
  }
  console.error(err);
  return jsonError(502, "ai-failed", "AI javob bermadi. Qayta urinib ko'ring.");
}

// Best-effort per-IP limiter (per server instance) to protect the free AI quota.
const hits = new Map<string, number[]>();
export function rateLimited(req: Request, limit: number, windowMs: number): boolean {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < windowMs);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > limit;
}
