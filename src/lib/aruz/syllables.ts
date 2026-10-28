// Splits a misra (Uzbek Latin) into syllables the way aruz scansion needs:
// syllables run across word boundaries, so a word-final consonant joins a
// following word that starts with a vowel (vasl): "mardumlug' emdi" → lu-g'em-di.

import { normalizeApostrophes } from "@/lib/translit/cyrillic";

export type Vowel = "a" | "e" | "i" | "o" | "u" | "o'";

export interface Syllable {
  text: string;
  vowel: Vowel;
  closed: boolean;
  /** Number of consonants after the vowel (2+ makes an overlong syllable likely). */
  codaSize: number;
  /** Index of the word (within the misra) the syllable's vowel belongs to. */
  word: number;
}

interface Unit {
  text: string;
  vowel: boolean;
  word: number;
}

const VOWEL_CHARS = new Set(["a", "e", "i", "o", "u"]);
const CONSONANT_CHARS = new Set("bcdfghjklmnpqrstvwxyz".split(""));

function toUnits(line: string): { units: Unit[]; words: string[] } {
  const s = normalizeApostrophes(line).toLowerCase();
  const words: string[] = [];
  const units: Unit[] = [];
  let word = -1;
  let inWord = false;

  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    const next = s[i + 1];
    const isLetter = VOWEL_CHARS.has(c) || CONSONANT_CHARS.has(c);

    if (!isLetter && !(c === "'" && inWord)) {
      inWord = false;
      continue;
    }
    if (!inWord) {
      inWord = true;
      word += 1;
      words.push("");
    }
    words[word] += c;

    if (c === "o" && next === "'") {
      units.push({ text: "o'", vowel: true, word });
      words[word] += "'";
      i += 1;
    } else if (VOWEL_CHARS.has(c)) {
      units.push({ text: c, vowel: true, word });
    } else if (c === "'") {
      // s'h is just a separator (Is'hoq); elsewhere it is the tutuq belgisi.
      if (!(s[i - 1] === "s" && next === "h")) units.push({ text: "'", vowel: false, word });
    } else if ((c === "s" || c === "c") && next === "h") {
      units.push({ text: c + "h", vowel: false, word });
      words[word] += "h";
      i += 1;
    } else if (c === "g" && next === "'") {
      units.push({ text: "g'", vowel: false, word });
      words[word] += "'";
      i += 1;
    } else if (c === "n" && next === "g" && s[i + 2] !== "'") {
      // ng is one consonant (Chagatai ڭ), so ko'ngul scans ko'-ngul.
      units.push({ text: "ng", vowel: false, word });
      words[word] += "g";
      i += 1;
    } else {
      units.push({ text: c, vowel: false, word });
    }
  }
  return { units, words };
}

export function syllabify(line: string): Syllable[] {
  const { units } = toUnits(line);
  const vowelIdx = units.flatMap((u, i) => (u.vowel ? [i] : []));
  if (vowelIdx.length === 0) return [];

  const syllables: Syllable[] = [];
  let onsetStart = 0;

  vowelIdx.forEach((v, k) => {
    const nextV = vowelIdx[k + 1];
    let codaEnd: number; // exclusive
    if (nextV === undefined) {
      codaEnd = units.length;
    } else {
      const clusterLen = nextV - v - 1;
      codaEnd = clusterLen <= 1 ? v + 1 : nextV - 1;
    }
    const parts = units.slice(onsetStart, codaEnd);
    const codaSize = codaEnd - v - 1;
    syllables.push({
      text: parts.map((u) => u.text).join(""),
      vowel: units[v].text as Vowel,
      closed: codaSize > 0,
      codaSize,
      word: units[v].word,
    });
    onsetStart = codaEnd;
  });
  return syllables;
}

export function splitWords(line: string): string[] {
  return toUnits(line).words;
}
