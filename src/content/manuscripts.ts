// Sample manuscripts shown in the collection and offered as one-click demos.
// Images live in /public/manuscripts; readings are produced by `npm run precompute`
// (Gemini) and stored in manuscripts.json so the demo works without a live AI call.

import type { PageReading } from "@/lib/reading";
import data from "./manuscripts.json";

export interface ManuscriptPage {
  image: string;
  folio: string;
  note?: string;
  reading: PageReading | null;
  readingModel?: string;
}

export interface Manuscript {
  slug: string;
  title: string;
  author: string;
  institution: string;
  shelfmark: string;
  date: string;
  script: string;
  rights: string;
  rightsUrl: string;
  recordUrl: string;
  pages: ManuscriptPage[];
}

export const MANUSCRIPTS: Manuscript[] = data as Manuscript[];

export function getManuscript(slug: string): Manuscript | undefined {
  return MANUSCRIPTS.find((m) => m.slug === slug);
}
