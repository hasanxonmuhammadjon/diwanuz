// Shared types for a manuscript page reading (client + server).

/** [ymin, xmin, ymax, xmax], normalised to 0–1000 of the image size. */
export type Box = [number, number, number, number];

export interface ReadLine {
  arabic: string;
  latin: string;
  box: Box | null;
  confidence: number;
}

export interface PageReading {
  language: "chagatai" | "persian" | "arabic" | "ottoman" | "other";
  script: string;
  summary: string;
  lines: ReadLine[];
}

export interface ReadResponse {
  reading: PageReading;
  model: string;
  cached: boolean;
  imageHash: string;
}

export interface Explanation {
  bayon: string;
  words: { word: string; meaning: string }[];
  sanat: string[];
}

export const LANGUAGE_LABEL: Record<PageReading["language"], string> = {
  chagatai: "Chig'atoy (eski o'zbek)",
  persian: "Fors",
  arabic: "Arab",
  ottoman: "Usmonli turk",
  other: "Boshqa",
};

export function readingToText(lines: ReadLine[], field: "arabic" | "latin"): string {
  return lines.map((l) => l[field]).join("\n");
}

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** Minimal PAGE XML (2019 schema), the exchange format used by Transkribus and eScriptorium. */
export function readingToPageXml(
  lines: ReadLine[],
  image: { name: string; width: number; height: number },
): string {
  const pts = (b: Box) => {
    const [y0, x0, y1, x1] = b.map((v) => v / 1000);
    const X0 = Math.round(x0 * image.width), X1 = Math.round(x1 * image.width);
    const Y0 = Math.round(y0 * image.height), Y1 = Math.round(y1 * image.height);
    return `${X0},${Y0} ${X1},${Y0} ${X1},${Y1} ${X0},${Y1}`;
  };
  const textLines = lines
    .map((l, i) => {
      const coords = l.box ? `\n        <Coords points="${pts(l.box)}"/>` : "";
      return `      <TextLine id="l${i + 1}">${coords}
        <TextEquiv index="0"><Unicode>${esc(l.arabic)}</Unicode></TextEquiv>
        <TextEquiv index="1"><Unicode>${esc(l.latin)}</Unicode></TextEquiv>
      </TextLine>`;
    })
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>
<PcGts xmlns="http://schema.primaresearch.org/PAGE/gts/pagecontent/2019-07-15">
  <Metadata><Creator>DiwanUz</Creator><Created>${new Date().toISOString()}</Created></Metadata>
  <Page imageFilename="${esc(image.name)}" imageWidth="${image.width}" imageHeight="${image.height}">
    <TextRegion id="r1">
${textLines}
    </TextRegion>
  </Page>
</PcGts>
`;
}
