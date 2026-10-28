import type { PoemRow } from "@/components/devon/poem-browser";
import { metersForGenre, scanPoem } from "@/lib/aruz/scan";
import { POEMS, getPoet, type Poem } from "./poems";

/** Meter from the source if it names one, otherwise the scanner's clean match on the opening bayt. */
export function poemMeter(p: Poem): { name: string; fromSource: boolean } | null {
  if (p.meter) return { name: p.meter, fromSource: true };
  const best = scanPoem(p.lines.slice(0, 2), metersForGenre(p.genre)).best;
  return best && best.mismatches === 0 ? { name: best.meter.name, fromSource: false } : null;
}

export function poemRows(poems: Poem[] = POEMS): PoemRow[] {
  return poems.map((p) => {
    const poet = getPoet(p.poet);
    return {
      slug: p.slug,
      title: p.title,
      genre: p.genre,
      poet: p.poet,
      poetName: poet?.name ?? p.poet,
      era: poet?.era ?? "",
      meter: poemMeter(p)?.name ?? null,
      firstLine: p.lines[0] ?? p.title,
    };
  });
}
