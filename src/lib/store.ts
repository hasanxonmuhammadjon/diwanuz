// Persistence for AI reading cache and the crowd-corrected dataset.
// Uses Postgres (Neon) when DATABASE_URL is set; otherwise a JSON file under
// .data/ (local dev), falling back to memory on read-only hosts.

import { neon } from "@neondatabase/serverless";
import { promises as fs } from "node:fs";
import path from "node:path";
import type { ReadLine } from "@/lib/reading";

export interface Correction {
  id: string;
  createdAt: string;
  imageHash: string;
  /** Downscaled JPEG as base64, only when the contributor agreed to share the image. */
  image: string | null;
  contributor: string;
  language: string;
  aiLines: ReadLine[];
  lines: ReadLine[];
}

export interface DatasetStats {
  pages: number;
  lines: number;
  editedLines: number;
  contributors: number;
}

interface Backend {
  getCache(key: string): Promise<unknown | null>;
  setCache(key: string, value: unknown): Promise<void>;
  addCorrection(c: Correction): Promise<void>;
  listCorrections(): Promise<Correction[]>;
}

export function countEdited(c: Pick<Correction, "aiLines" | "lines">): number {
  return c.lines.filter((l, i) => {
    const ai = c.aiLines[i];
    return !ai || ai.arabic !== l.arabic || ai.latin !== l.latin;
  }).length;
}

function postgresBackend(url: string): Backend {
  const sql = neon(url);
  let ready: Promise<unknown> | null = null;
  const init = () =>
    (ready ??= Promise.all([
      sql`CREATE TABLE IF NOT EXISTS ai_cache (key text PRIMARY KEY, value jsonb NOT NULL, created_at timestamptz DEFAULT now())`,
      sql`CREATE TABLE IF NOT EXISTS corrections (id text PRIMARY KEY, data jsonb NOT NULL, created_at timestamptz DEFAULT now())`,
    ]));
  return {
    async getCache(key) {
      await init();
      const rows = await sql`SELECT value FROM ai_cache WHERE key = ${key}`;
      return rows[0]?.value ?? null;
    },
    async setCache(key, value) {
      await init();
      await sql`INSERT INTO ai_cache (key, value) VALUES (${key}, ${JSON.stringify(value)}::jsonb)
                ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`;
    },
    async addCorrection(c) {
      await init();
      await sql`INSERT INTO corrections (id, data) VALUES (${c.id}, ${JSON.stringify(c)}::jsonb)`;
    },
    async listCorrections() {
      await init();
      const rows = await sql`SELECT data FROM corrections ORDER BY created_at DESC`;
      return rows.map((r) => r.data as Correction);
    },
  };
}

function fileBackend(dir: string): Backend {
  const file = path.join(dir, "store.json");
  type Shape = { cache: Record<string, unknown>; corrections: Correction[] };
  let mem: Shape | null = null;
  let writable = true;

  const load = async (): Promise<Shape> => {
    if (mem) return mem;
    try {
      mem = JSON.parse(await fs.readFile(file, "utf8")) as Shape;
    } catch {
      mem = { cache: {}, corrections: [] };
    }
    return mem;
  };
  const save = async () => {
    if (!writable || !mem) return;
    try {
      await fs.mkdir(dir, { recursive: true });
      await fs.writeFile(file, JSON.stringify(mem));
    } catch {
      writable = false; // read-only filesystem: keep data in memory only
    }
  };
  return {
    async getCache(key) {
      return (await load()).cache[key] ?? null;
    },
    async setCache(key, value) {
      (await load()).cache[key] = value;
      await save();
    },
    async addCorrection(c) {
      (await load()).corrections.unshift(c);
      await save();
    },
    async listCorrections() {
      return (await load()).corrections;
    },
  };
}

let backend: Backend | null = null;
export function store(): Backend {
  if (!backend) {
    const url = process.env.DATABASE_URL;
    backend = url ? postgresBackend(url) : fileBackend(path.join(process.cwd(), ".data"));
  }
  return backend;
}

export async function datasetStats(): Promise<DatasetStats> {
  const all = await store().listCorrections();
  return {
    pages: all.length,
    lines: all.reduce((a, c) => a + c.lines.length, 0),
    editedLines: all.reduce((a, c) => a + countEdited(c), 0),
    contributors: new Set(all.map((c) => c.contributor.trim().toLowerCase()).filter(Boolean)).size,
  };
}
