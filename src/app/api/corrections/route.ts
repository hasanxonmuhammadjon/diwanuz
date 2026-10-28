import { randomUUID } from "node:crypto";
import { jsonError, rateLimited } from "@/lib/api-utils";
import type { ReadLine } from "@/lib/reading";
import { store, type Correction } from "@/lib/store";

const MAX_LINES = 200;
const MAX_IMAGE = 1_500_000;

function cleanLines(v: unknown): ReadLine[] | null {
  if (!Array.isArray(v) || v.length > MAX_LINES) return null;
  const out: ReadLine[] = [];
  for (const l of v) {
    if (!l || typeof l !== "object") return null;
    const { arabic, latin, box, confidence } = l as Record<string, unknown>;
    if (typeof arabic !== "string" || typeof latin !== "string") return null;
    if (arabic.length > 600 || latin.length > 600) return null;
    const okBox =
      Array.isArray(box) && box.length === 4 && box.every((n) => typeof n === "number" && n >= 0 && n <= 1000);
    out.push({
      arabic,
      latin,
      box: okBox ? (box as ReadLine["box"]) : null,
      confidence: typeof confidence === "number" ? confidence : 0,
    });
  }
  return out;
}

export async function POST(req: Request) {
  if (rateLimited(req, 20, 10 * 60_000)) {
    return jsonError(429, "rate-limit", "Juda ko'p so'rov. Birozdan so'ng qayta urinib ko'ring.");
  }
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return jsonError(400, "bad-json", "So'rov noto'g'ri formatda.");
  }
  const lines = cleanLines(body.lines);
  const aiLines = cleanLines(body.aiLines);
  const imageHash = typeof body.imageHash === "string" ? body.imageHash.slice(0, 64) : "";
  if (!lines || !aiLines || lines.length === 0 || !imageHash) {
    return jsonError(400, "bad-correction", "Tuzatish ma'lumotlari to'liq emas.");
  }
  const image =
    typeof body.image === "string" && body.image.length <= MAX_IMAGE ? body.image : null;

  const correction: Correction = {
    id: randomUUID(),
    createdAt: new Date().toISOString(),
    imageHash,
    image,
    contributor: typeof body.contributor === "string" ? body.contributor.trim().slice(0, 60) : "",
    language: typeof body.language === "string" ? body.language.slice(0, 20) : "other",
    aiLines,
    lines,
  };
  await store().addCorrection(correction);
  return Response.json({ ok: true, id: correction.id });
}
