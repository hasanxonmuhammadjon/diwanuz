import { describe, expect, it } from "vitest";
import { syllabify } from "./syllables";
import { scanPoem } from "./scan";

const texts = (line: string) => syllabify(line).map((s) => s.text);

describe("syllabify", () => {
  it("splits single words by Uzbek rules", () => {
    expect(texts("do'stlar")).toEqual(["do'st", "lar"]);
    expect(texts("ko'ngil")).toEqual(["ko'", "ngil"]);
    expect(texts("ko'nglung")).toEqual(["ko'ng", "lung"]);
    expect(texts("mening")).toEqual(["me", "ning"]);
    expect(texts("ma'shuq")).toEqual(["ma'", "shuq"]);
  });

  it("applies vasl across word boundaries", () => {
    expect(texts("mardumlug' emdi")).toEqual(["mar", "dum", "lu", "g'em", "di"]);
    expect(texts("debon ul")).toEqual(["de", "bo", "nul"]);
  });

  it("marks closed syllables as long and open ones as ambiguous", () => {
    const [qa, ro, ko, zum] = syllabify("Qaro ko'zum");
    expect(zum.closed).toBe(true);
    expect(qa.closed).toBe(false);
    expect(ro.vowel).toBe("o");
    expect(ko.vowel).toBe("o'");
  });

  it("keeps a pointer back to the word each syllable came from", () => {
    const syl = syllabify("Qaro ko'zum");
    expect(syl.map((s) => s.word)).toEqual([0, 0, 1, 1]);
  });
});

describe("scanPoem", () => {
  it("detects mujtass in Navoiy's 'Qaro ko'zum'", () => {
    const r = scanPoem([
      "Qaro ko'zum, kelu mardumlug' emdi fan qilg'il,",
      "Ko'zum qarosida mardum kibi vatan qilg'il.",
    ]);
    expect(r.best?.meter.id).toBe("mujtass-musamman-maxbun-mahzuf");
    const line = r.best?.lines[0];
    expect(line?.ok && line.pattern).toBe("u-u-uu--u-u---");
  });

  it("detects ramal in 'Kecha kelgumdur debon...'", () => {
    const r = scanPoem(["Kecha kelgumdur debon ul sarvi gulro' kelmadi"]);
    expect(r.best?.meter.id).toBe("ramal-musamman-mahzuf");
  });

  it("detects the ruboiy (hazaj axrab) metre in Bobur's line", () => {
    const r = scanPoem(["Yod etmas emish kishini g'urbatda kishi"]);
    expect(r.best?.meter.id).toBe("hazaj-ruboiy");
    expect(r.best?.mismatches).toBe(0);
    // "kishini" has open syllables either way, so two ruboiy forms fit equally well.
    const line = r.best?.lines[0];
    expect(line?.ok && line.pattern).toMatch(/^--uu-(-uu|u-u)--uu-$/);
    expect(line?.ok && line.variantName).toMatch(/^Hazaji musammani axrabi (makfufi|maqbuzi makfufi) majbub$/);
  });

  it("groups each scanned line into feet", () => {
    const r = scanPoem(["Kecha kelgumdur debon ul sarvi gulro' kelmadi"]);
    const line = r.best!.lines[0];
    if (!line.ok) throw new Error("line did not scan");
    const feet = line.feet.map((f) => f.syllables.map((s) => s.text).join("-"));
    expect(feet).toEqual(["ke-cha-kel-gum", "dur-de-bo-nul", "sar-vi-gul-ro'", "kel-ma-di"]);
  });

  it("scans ko'ngul as ko'-ngul so the mujtass line fits", () => {
    const r = scanPoem(["Yuzung guliga ko'ngul ravzasin yasa gulshan,"]);
    expect(r.best?.meter.id).toBe("mujtass-musamman-maxbun-mahzuf");
    expect(r.best?.mismatches).toBe(0);
  });

  it("keeps the poem's metre when a minority of misras fail", () => {
    const r = scanPoem([
      "Kecha kelgumdur debon ul sarvi gulro' kelmadi",
      "Bu",
      "Kecha kelgumdur debon ul sarvi gulro' kelmadi",
    ]);
    expect(r.best?.meter.id).toBe("ramal-musamman-mahzuf");
    expect(r.best?.failed).toBe(1);
    expect(r.best?.lines[1].ok).toBe(false);
  });

  it("returns no match for prose that fits no metre", () => {
    const r = scanPoem(["Bu"]);
    expect(r.best).toBeNull();
  });
});
