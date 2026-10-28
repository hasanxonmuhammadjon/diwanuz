// Uzbek Latin → Cyrillic. Deterministic, letter by letter with lookahead.

const APOSTROPHES = /[‘’ʻʼ`´]/g;

const SINGLE: Record<string, string> = {
  a: "а", b: "б", d: "д", f: "ф", g: "г", h: "ҳ", i: "и", j: "ж", k: "к",
  l: "л", m: "м", n: "н", o: "о", p: "п", q: "қ", r: "р", s: "с", t: "т",
  u: "у", v: "в", x: "х", y: "й", z: "з", c: "с", w: "в",
};

const VOWELS = new Set(["a", "e", "i", "o", "u"]);

const isLetter = (ch: string | undefined) => !!ch && /\p{L}/u.test(ch);

export function normalizeApostrophes(text: string): string {
  return text.replace(APOSTROPHES, "'");
}

export function latinToCyrillic(input: string): string {
  const s = normalizeApostrophes(input);
  const lower = s.toLowerCase();
  let out = "";
  let i = 0;

  const emit = (cyr: string, srcStart: number) => {
    const upper = s[srcStart] !== lower[srcStart];
    out += upper ? cyr[0].toUpperCase() + cyr.slice(1) : cyr;
  };

  while (i < s.length) {
    const c = lower[i];
    const next = lower[i + 1];
    const next2 = lower[i + 2];

    if (c === "o" && next === "'") { emit("ў", i); i += 2; continue; }
    if (c === "g" && next === "'") { emit("ғ", i); i += 2; continue; }
    if (c === "s" && next === "'" && next2 === "h") { emit("сҳ", i); i += 3; continue; }
    if (c === "s" && next === "h") { emit("ш", i); i += 2; continue; }
    if (c === "c" && next === "h") { emit("ч", i); i += 2; continue; }
    if (c === "y") {
      if (next === "o" && next2 !== "'") { emit("ё", i); i += 2; continue; }
      if (next === "u") { emit("ю", i); i += 2; continue; }
      if (next === "a") { emit("я", i); i += 2; continue; }
      if (next === "e") { emit("е", i); i += 2; continue; }
    }
    if (c === "e") {
      const prev = lower[i - 1];
      emit(!isLetter(prev) || VOWELS.has(prev) ? "э" : "е", i);
      i += 1;
      continue;
    }
    if (c === "'") {
      out += isLetter(s[i - 1]) ? "ъ" : "'";
      i += 1;
      continue;
    }
    if (SINGLE[c]) { emit(SINGLE[c], i); i += 1; continue; }

    out += s[i];
    i += 1;
  }
  return out;
}
