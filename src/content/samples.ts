import type { SampleOption } from "@/components/reader/workspace";
import { MANUSCRIPTS } from "./manuscripts";

/** One-click demos: every page with a stored reading, else each manuscript's first page (read live). */
export function readerSamples(): SampleOption[] {
  const all = MANUSCRIPTS.flatMap((m) =>
    m.pages.map((p, i) => ({
      id: `${m.slug}-${i + 1}`,
      title: m.title,
      subtitle: `${m.institution} · ${p.folio}`,
      image: p.image,
      reading: p.reading,
      first: i === 0,
    })),
  );
  const read = all.filter((s) => s.reading);
  return (read.length ? read : all.filter((s) => s.first)).map(({ first: _first, ...s }) => {
    void _first;
    return s;
  });
}
