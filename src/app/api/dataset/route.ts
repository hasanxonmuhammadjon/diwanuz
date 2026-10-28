import { connection } from "next/server";
import { countEdited, datasetStats, store } from "@/lib/store";

/** Open dataset export: corrected line transcriptions (images omitted to keep it light). */
export async function GET() {
  await connection();
  const [stats, all] = await Promise.all([datasetStats(), store().listCorrections()]);
  const pages = all.map((c) => ({
    id: c.id,
    createdAt: c.createdAt,
    imageHash: c.imageHash,
    hasImage: !!c.image,
    language: c.language,
    contributor: c.contributor || null,
    editedLines: countEdited(c),
    lines: c.lines.map((l, i) => ({
      arabic: l.arabic,
      latin: l.latin,
      box: l.box,
      aiArabic: c.aiLines[i]?.arabic ?? null,
      aiLatin: c.aiLines[i]?.latin ?? null,
    })),
  }));
  return Response.json(
    { name: "DiwanUz ochiq qo'lyozma dataseti", license: "CC BY 4.0", stats, pages },
    { headers: { "Content-Disposition": 'attachment; filename="diwanuz-dataset.json"' } },
  );
}
