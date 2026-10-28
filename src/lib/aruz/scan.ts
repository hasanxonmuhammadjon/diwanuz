// Matches syllabified misras against the metre catalogue.
// Each syllable gets weighted readings (open syllables may be read short or long;
// closed ones with a long vowel or a consonant cluster may be overlong "-u").
// A dynamic programme finds the most probable reading per metre variant, allowing
// a few penalised mismatches so the UI can point at the syllable that breaks the metre.

import { METERS, type Meter, type MeterVariant } from "./meters";
import { syllabify, type Syllable, type Vowel } from "./syllables";

export type Weight = "-" | "u" | "-u";

export interface ScannedSyllable extends Syllable {
  weight: Weight;
  mismatch: boolean;
}

export interface Foot {
  name: string;
  pattern: string;
  syllables: ScannedSyllable[];
}

export interface LineScan {
  ok: true;
  text: string;
  /** Full metre name of the variant that fit (set for ruboiy forms). */
  variantName?: string;
  syllables: ScannedSyllable[];
  pattern: string;
  feet: Foot[];
  mismatches: number;
  score: number;
}

/** A misra that fits none of the metre's variants within the mismatch budget. */
export interface FailedLine {
  ok: false;
  text: string;
  syllables: Syllable[];
}

export interface MeterMatch {
  meter: Meter;
  lines: (LineScan | FailedLine)[];
  /** Misras that did not fit this metre at all. */
  failed: number;
  mismatches: number;
  score: number;
  confidence: number;
}

export interface PoemScan {
  candidates: MeterMatch[];
  best: MeterMatch | null;
}

const OPEN_LONG_PROB: Record<Vowel, number> = {
  o: 0.85, e: 0.6, "o'": 0.55, u: 0.5, i: 0.45, a: 0.3,
};
const MISMATCH = Math.log(0.01);
const MAX_MISMATCHES_PER_LINE = 2;
/** Score charged for a misra that does not fit — worse than any accepted alignment. */
const FAILED_LINE = 3 * MAX_MISMATCHES_PER_LINE * MISMATCH;

function readings(s: Syllable): { w: Weight; logp: number }[] {
  if (!s.closed) {
    const p = OPEN_LONG_PROB[s.vowel];
    return [{ w: "-", logp: Math.log(p) }, { w: "u", logp: Math.log(1 - p) }];
  }
  const overlong = s.codaSize >= 2 ? 0.6 : s.vowel === "o" ? 0.35 : 0;
  if (overlong === 0) return [{ w: "-", logp: 0 }];
  return [
    { w: "-", logp: Math.log(1 - overlong) },
    { w: "-u", logp: Math.log(overlong) },
  ];
}

function alignLine(text: string, syl: Syllable[], variant: MeterVariant): LineScan | null {
  const template = variant.pattern.replace(/ /g, "");
  const n = syl.length;
  const T = template.length;
  if (n === 0) return null;

  type Cell = { score: number; mism: number; prevJ: number; weight: Weight; mismatch: boolean };
  const dp: (Cell | undefined)[][] = Array.from({ length: n + 1 }, () => new Array(T + 1));
  dp[0][0] = { score: 0, mism: 0, prevJ: -1, weight: "-", mismatch: false };

  for (let i = 0; i < n; i++) {
    const last = i === n - 1;
    for (let j = 0; j < T; j++) {
      const cur = dp[i][j];
      if (!cur) continue;
      const moves: { len: number; w: Weight; logp: number; mismatch: boolean }[] = [];

      if (last) {
        // Misra-final syllable is free, but it must land on the final position.
        if (j === T - 1) moves.push({ len: 1, w: template[j] as Weight, logp: 0, mismatch: false });
      } else {
        const opts = readings(syl[i]);
        const one = template[j] as "-" | "u";
        const exact = opts.find((o) => o.w === one);
        if (exact) moves.push({ len: 1, w: one, logp: exact.logp, mismatch: false });
        else moves.push({ len: 1, w: one, logp: MISMATCH, mismatch: true });
        const over = opts.find((o) => o.w === "-u");
        if (over && template.slice(j, j + 2) === "-u" && j + 2 < T) {
          moves.push({ len: 2, w: "-u", logp: over.logp, mismatch: false });
        }
      }

      for (const m of moves) {
        const nj = j + m.len;
        const score = cur.score + m.logp;
        const mism = cur.mism + (m.mismatch ? 1 : 0);
        const prev = dp[i + 1][nj];
        if (!prev || score > prev.score) {
          dp[i + 1][nj] = { score, mism, prevJ: j, weight: m.w, mismatch: m.mismatch };
        }
      }
    }
  }

  const end = dp[n][T];
  if (!end || end.mism > MAX_MISMATCHES_PER_LINE) return null;

  // Walk back to recover each syllable's weight and template start position.
  const scanned: ScannedSyllable[] = new Array(n);
  const startPos: number[] = new Array(n);
  let j = T;
  for (let i = n; i > 0; i--) {
    const cell = dp[i][j]!;
    scanned[i - 1] = { ...syl[i - 1], weight: cell.weight, mismatch: cell.mismatch };
    startPos[i - 1] = cell.prevJ;
    j = cell.prevJ;
  }

  const footLens = variant.pattern.split(" ").map((f) => f.length);
  const footStarts = footLens.map((_, k) => footLens.slice(0, k).reduce((a, b) => a + b, 0));
  const feet: Foot[] = variant.pattern.split(" ").map((p, k) => ({
    name: variant.feet[k],
    pattern: p,
    syllables: [],
  }));
  scanned.forEach((s, i) => {
    let k = footStarts.length - 1;
    while (k > 0 && footStarts[k] > startPos[i]) k--;
    feet[k].syllables.push(s);
  });

  return {
    ok: true,
    text,
    variantName: variant.name,
    syllables: scanned,
    pattern: template,
    feet,
    mismatches: end.mism,
    score: end.score,
  };
}

/**
 * Genre narrows the catalogue the way classical theory does: ruboiy metres are
 * reserved for the ruboiy, and a tuyuq is always ramali musaddasi mahzuf.
 */
export function metersForGenre(genre?: string): Meter[] {
  if (!genre) return METERS;
  if (genre === "ruboiy") return METERS.filter((m) => m.id === "hazaj-ruboiy");
  if (genre === "tuyuq") return METERS.filter((m) => m.id === "ramal-musaddas-mahzuf");
  return METERS.filter((m) => m.id !== "hazaj-ruboiy");
}

export function confidenceLabel(m: MeterMatch): "yuqori" | "o'rta" | "past" {
  const lines = m.lines.length;
  if (m.confidence >= 0.9 && m.failed === 0 && m.mismatches <= lines / 4) return "yuqori";
  if (m.confidence >= 0.6 && m.failed * 4 <= lines) return "o'rta";
  return "past";
}

export function scanPoem(lines: string[], meters: Meter[] = METERS): PoemScan {
  const misras = lines.map((l) => l.trim()).filter(Boolean);
  const sylls = misras.map((l) => syllabify(l));

  const candidates: MeterMatch[] = [];
  if (misras.length === 0) return { candidates, best: null };
  for (const meter of meters) {
    const lines: (LineScan | FailedLine)[] = misras.map((text, k) => {
      let best: LineScan | null = null;
      for (const variant of meter.variants) {
        const s = alignLine(text, sylls[k], variant);
        if (s && (!best || s.score > best.score)) best = s;
      }
      return best ?? { ok: false, text, syllables: sylls[k] };
    });
    const fitted = lines.filter((l): l is LineScan => l.ok);
    const failed = lines.length - fitted.length;
    // A poem keeps one metre throughout; tolerate a few misras the scanner misreads.
    if (fitted.length === 0 || failed * 2 > lines.length) continue;
    candidates.push({
      meter,
      lines,
      failed,
      mismatches: fitted.reduce((a, s) => a + s.mismatches, 0),
      score: fitted.reduce((a, s) => a + s.score, 0) + failed * FAILED_LINE,
      confidence: 0,
    });
  }

  candidates.sort((a, b) => b.score - a.score);
  const top = candidates[0]?.score ?? 0;
  const z = candidates.reduce((a, c) => a + Math.exp(c.score - top), 0);
  for (const c of candidates) c.confidence = Math.exp(c.score - top) / z;

  return { candidates, best: candidates[0] ?? null };
}
