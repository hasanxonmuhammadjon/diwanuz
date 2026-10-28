"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

export interface PoemRow {
  slug: string;
  title: string;
  genre: string;
  poet: string;
  poetName: string;
  era: string;
  meter: string | null;
  firstLine: string;
}

export function PoemBrowser({ rows }: { rows: PoemRow[] }) {
  const [q, setQ] = useState("");
  const [genre, setGenre] = useState("");
  const [poet, setPoet] = useState("");

  // Footer links pass ?janr=… ; read it after hydration so the page can stay static.
  useEffect(() => {
    const janr = new URLSearchParams(window.location.search).get("janr");
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time sync from the URL
    if (janr) setGenre(janr);
  }, []);

  const genres = useMemo(() => Array.from(new Set(rows.map((r) => r.genre))).sort(), [rows]);
  const poets = useMemo(
    () => Array.from(new Map(rows.map((r) => [r.poet, r.poetName])).entries()),
    [rows],
  );
  const filtered = rows.filter((r) => {
    if (genre && r.genre !== genre) return false;
    if (poet && r.poet !== poet) return false;
    if (q) {
      const needle = q.toLowerCase().replace(/[‘’ʻʼ`]/g, "'");
      return (r.title + " " + r.firstLine + " " + r.poetName).toLowerCase().includes(needle);
    }
    return true;
  });

  return (
    <div>
      <div className="flex flex-wrap gap-3 items-center">
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="She'r yoki misra bo'yicha qidirish…"
          aria-label="Qidirish"
          className="min-w-0 flex-1 basis-64 rounded-md border border-sand bg-paper px-3 py-2 outline-none focus:border-navy"
        />
        <select
          value={poet}
          onChange={(e) => setPoet(e.target.value)}
          aria-label="Shoir"
          className="rounded-md border border-sand bg-paper px-3 py-2 text-sm"
        >
          <option value="">Barcha shoirlar</option>
          {poets.map(([slug, name]) => (
            <option key={slug} value={slug}>{name}</option>
          ))}
        </select>
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Janr">
          {["", ...genres].map((g) => (
            <button
              key={g || "all"}
              onClick={() => setGenre(g)}
              aria-pressed={genre === g}
              className={`rounded-full border px-3 py-1 text-sm ${
                genre === g ? "border-navy bg-navy text-white" : "border-sand text-ink-2 hover:border-navy"
              }`}
            >
              {g || "Hammasi"}
            </button>
          ))}
        </div>
      </div>
      <p className="mt-4 text-sm text-ink-3">{filtered.length} ta she'r</p>
      <ul className="mt-3 divide-y divide-rail card">
        {filtered.map((r) => (
          <li key={r.slug}>
            <Link href={`/sher/${r.slug}`} className="flex flex-wrap items-baseline gap-x-4 gap-y-1 px-5 py-4 hover:bg-cream-2">
              <span className="font-serif text-lg text-navy">{r.firstLine}</span>
              <span className="text-sm text-ink-3">{r.poetName}</span>
              <span className="ml-auto flex gap-1.5">
                <span className="chip">{r.genre}</span>
                {r.meter && <span className="chip hidden sm:inline-flex">{r.meter}</span>}
              </span>
            </Link>
          </li>
        ))}
        {filtered.length === 0 && <li className="px-5 py-8 text-center text-ink-3">Hech narsa topilmadi.</li>}
      </ul>
    </div>
  );
}
