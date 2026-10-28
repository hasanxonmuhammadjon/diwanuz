import { describe, expect, it } from "vitest";
import { latinToCyrillic } from "./cyrillic";

describe("latinToCyrillic", () => {
  it("converts digraphs and special letters", () => {
    expect(latinToCyrillic("sho'x")).toBe("шўх");
    expect(latinToCyrillic("g'azal")).toBe("ғазал");
    expect(latinToCyrillic("chiroq")).toBe("чироқ");
    expect(latinToCyrillic("ko'ngil")).toBe("кўнгил");
  });

  it("keeps o' before treating yo as ё", () => {
    expect(latinToCyrillic("yo'l")).toBe("йўл");
    expect(latinToCyrillic("yor")).toBe("ёр");
    expect(latinToCyrillic("yuz")).toBe("юз");
    expect(latinToCyrillic("yaxshi")).toBe("яхши");
  });

  it("uses э for word-initial e", () => {
    expect(latinToCyrillic("emdi")).toBe("эмди");
    expect(latinToCyrillic("kelu")).toBe("келу");
  });

  it("maps the tutuq belgisi to ъ, but s'h to сҳ", () => {
    expect(latinToCyrillic("ma'shuq")).toBe("маъшуқ");
    expect(latinToCyrillic("Is'hoq")).toBe("Исҳоқ");
  });

  it("preserves capitalisation and punctuation", () => {
    expect(latinToCyrillic("Qaro ko'zum, kelu")).toBe("Қаро кўзум, келу");
    expect(latinToCyrillic("Navoiy")).toBe("Навоий");
    expect(latinToCyrillic("Sho'x")).toBe("Шўх");
  });

  it("accepts typographic apostrophes", () => {
    expect(latinToCyrillic("Oʻzbek gʻazali")).toBe("Ўзбек ғазали");
  });
});
