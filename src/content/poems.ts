// Poetry corpus for the Devon (encyclopedia) section.
// Texts are copied from the open sources recorded in each entry's sourceUrl.

import data from "./poems.json";

export interface Poet {
  slug: string;
  name: string;
  penName: string | null;
  born: number | null;
  died: number | null;
  birthplace: string | null;
  era: string;
  bio: string;
  sourceUrl: string;
}

export interface Poem {
  slug: string;
  poet: string;
  title: string;
  genre: string;
  lines: string[];
  meter: string | null;
  collection: string | null;
  sourceUrl: string;
  truncated?: boolean;
}

export const POETS: Poet[] = data.poets as Poet[];
export const POEMS: Poem[] = data.poems as Poem[];

export const getPoet = (slug: string) => POETS.find((p) => p.slug === slug);
export const getPoem = (slug: string) => POEMS.find((p) => p.slug === slug);
export const poemsBy = (poet: string) => POEMS.filter((p) => p.poet === poet);

export const GENRES = Array.from(new Set(POEMS.map((p) => p.genre))).sort();

export function lifespan(p: Poet): string {
  if (p.born && p.died) return `${p.born}–${p.died}`;
  if (p.died) return `v. ${p.died}`;
  if (p.born) return `t. ${p.born}`;
  return "";
}
