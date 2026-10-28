// Server-only wrapper around the Gemini API (free tier, Flash models).
// Tries each model in GEMINI_MODELS in turn so a rate-limited or retired model
// doesn't take the live demo down.

import { GoogleGenAI } from "@google/genai";
import type { Explanation, PageReading } from "@/lib/reading";

const DEFAULT_MODELS = ["gemini-3.8-flash", "gemini-3.6-flash", "gemini-3.5-flash-lite"];

export function geminiModels(): string[] {
  const env = process.env.GEMINI_MODELS ?? process.env.GEMINI_MODEL;
  return env ? env.split(",").map((m) => m.trim()).filter(Boolean) : DEFAULT_MODELS;
}

export class AiUnavailableError extends Error {
  constructor(message: string, readonly reason: "no-key" | "rate-limit" | "failed") {
    super(message);
  }
}

function client(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new AiUnavailableError("GEMINI_API_KEY sozlanmagan", "no-key");
  return new GoogleGenAI({ apiKey });
}

async function generateJson<T>(
  parts: ({ text: string } | { inlineData: { mimeType: string; data: string } })[],
  schema: object,
): Promise<{ data: T; model: string }> {
  const ai = client();
  let lastError: unknown;
  let rateLimited = false;
  for (const model of geminiModels()) {
    try {
      const res = await ai.models.generateContent({
        model,
        contents: [{ role: "user", parts }],
        config: {
          responseMimeType: "application/json",
          responseJsonSchema: schema,
          temperature: 0.1,
        },
      });
      const text = res.text;
      if (!text) throw new Error("Bo'sh javob");
      return { data: JSON.parse(text) as T, model };
    } catch (err) {
      lastError = err;
      const msg = String((err as { message?: string })?.message ?? err);
      if (/429|RESOURCE_EXHAUSTED|quota/i.test(msg)) rateLimited = true;
      console.error(`[gemini] ${model} failed:`, msg.slice(0, 300));
    }
  }
  throw new AiUnavailableError(
    String((lastError as { message?: string })?.message ?? lastError),
    rateLimited ? "rate-limit" : "failed",
  );
}

const READ_PROMPT = `You are an expert palaeographer of Chagatai (Old Uzbek), Persian and Arabic manuscripts written in nasta'liq, naskh and related hands.

Read the manuscript page in the image and return every line of text in reading order (right-to-left, top-to-bottom).
- Poetry laid out in two columns: return each hemistich (misra) as its own line — first the right one, then the left one, bayt by bayt.
- Ignore page numbers, catchwords and ornament, but include rubricated headings.

For each line give:
- "arabic": the exact transcription in Arabic script as written. Keep the scribe's spelling; add no vowel marks that are not on the page.
- "latin": a transliteration into the modern Uzbek Latin alphabet, following the conventions of Uzbek academic editions of Navoiy (e.g. "ko'ngul", "g'am", "o'zluk", "ishq", "ma'shuq"). For Persian or Arabic lines also transliterate into Uzbek Latin letters.
- "box": the line's bounding box as [ymin, xmin, ymax, xmax], each normalised to 0–1000.
- "confidence": your confidence in the reading, 0–1.

Write "[...]" for characters you cannot read. Never invent text that is not visible on the page.
Also return "language", "script" (e.g. "nasta'liq") and "summary": one sentence in Uzbek (Latin script) describing what the page contains.`;

const READ_SCHEMA = {
  type: "object",
  properties: {
    language: { type: "string", enum: ["chagatai", "persian", "arabic", "ottoman", "other"] },
    script: { type: "string" },
    summary: { type: "string" },
    lines: {
      type: "array",
      items: {
        type: "object",
        properties: {
          arabic: { type: "string" },
          latin: { type: "string" },
          box: { type: "array", items: { type: "number" }, minItems: 4, maxItems: 4 },
          confidence: { type: "number" },
        },
        required: ["arabic", "latin", "confidence"],
      },
    },
  },
  required: ["language", "script", "summary", "lines"],
};

export async function readManuscript(image: { data: string; mimeType: string }) {
  const { data, model } = await generateJson<PageReading>(
    [{ inlineData: image }, { text: READ_PROMPT }],
    READ_SCHEMA,
  );
  const reading: PageReading = {
    language: data.language ?? "other",
    script: data.script ?? "",
    summary: data.summary ?? "",
    lines: (data.lines ?? []).map((l) => ({
      arabic: l.arabic ?? "",
      latin: l.latin ?? "",
      box: Array.isArray(l.box) && l.box.length === 4 ? (l.box as PageReading["lines"][0]["box"]) : null,
      confidence: typeof l.confidence === "number" ? Math.max(0, Math.min(1, l.confidence)) : 0.5,
    })),
  };
  return { reading, model };
}

const EXPLAIN_SCHEMA = {
  type: "object",
  properties: {
    bayon: { type: "string" },
    words: {
      type: "array",
      items: {
        type: "object",
        properties: { word: { type: "string" }, meaning: { type: "string" } },
        required: ["word", "meaning"],
      },
    },
    sanat: { type: "array", items: { type: "string" } },
  },
  required: ["bayon", "words", "sanat"],
};

export async function explainVerse(lines: string[], poet?: string) {
  const prompt = `Siz mumtoz o'zbek adabiyoti bo'yicha mutaxassissiz. Quyidagi bayt${poet ? ` (${poet})` : ""}ni bugungi o'zbek tilida tushuntiring.

${lines.join("\n")}

Javob o'zbek tilida (lotin yozuvi) bo'lsin:
- "bayon": baytning nasriy bayoni — 2–4 gapda, oddiy o'quvchi tushunadigan tilda.
- "words": baytdagi eskirgan yoki arab-fors so'zlari va ularning ma'nosi (5 tagacha).
- "sanat": baytdagi badiiy san'atlar (tashbeh, tajnis, tazod, iyhom, talmeh va h.k.), har biri qisqa izoh bilan; bo'lmasa bo'sh ro'yxat.
Ishonchingiz komil bo'lmagan joyda buni ochiq ayting, taxmin qilib to'qimang.`;
  return generateJson<Explanation>([{ text: prompt }], EXPLAIN_SCHEMA);
}
