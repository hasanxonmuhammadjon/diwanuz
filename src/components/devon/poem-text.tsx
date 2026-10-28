"use client";

import { Fragment, useState } from "react";
import { ExplanationView } from "@/components/reader/workspace";
import { glossaryLookup } from "@/content/glossary";
import type { Explanation } from "@/lib/reading";
import { latinToCyrillic } from "@/lib/translit/cyrillic";

function Misra({ text, cyrillic }: { text: string; cyrillic: boolean }) {
  const parts = text.split(/(\s+)/);
  return (
    <p className="font-serif text-xl sm:text-[1.4rem] leading-relaxed text-ink">
      {parts.map((part, i) => {
        if (/^\s+$/.test(part)) return <Fragment key={i}>{part}</Fragment>;
        const shown = cyrillic ? latinToCyrillic(part) : part;
        const hit = glossaryLookup(part);
        return hit ? (
          <span
            key={i}
            tabIndex={0}
            className="group relative cursor-help underline decoration-dotted decoration-gold underline-offset-4"
          >
            {shown}
            <span
              role="tooltip"
              className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 hidden w-56 -translate-x-1/2 rounded-lg bg-navy px-3 py-2 font-sans text-xs leading-snug text-white shadow-lg group-hover:block group-focus:block"
            >
              <b>{hit.word}</b> — {hit.meaning}
            </span>
          </span>
        ) : (
          <Fragment key={i}>{shown}</Fragment>
        );
      })}
    </p>
  );
}

function BaytExplain({ lines, poet }: { lines: string[]; poet: string }) {
  const [state, setState] = useState<
    { kind: "idle" } | { kind: "loading" } | { kind: "done"; data: Explanation } | { kind: "error"; msg: string }
  >({ kind: "idle" });

  const run = async () => {
    setState({ kind: "loading" });
    try {
      const res = await fetch("/api/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lines, poet }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error?.message ?? "Xatolik");
      setState({ kind: "done", data: json.explanation });
    } catch (err) {
      setState({ kind: "error", msg: (err as Error).message });
    }
  };

  if (state.kind === "done")
    return (
      <div className="mt-3 rounded-lg border border-rail bg-cream/70 p-4">
        <ExplanationView data={state.data} />
      </div>
    );
  return (
    <div className="mt-2">
      <button
        onClick={run}
        disabled={state.kind === "loading"}
        className="text-xs font-semibold text-gold hover:text-navy disabled:opacity-60"
      >
        {state.kind === "loading" ? "Izohlanmoqda…" : "✦ Baytni izohlash (AI)"}
      </button>
      {state.kind === "error" && <p className="mt-1 text-xs text-warn">{state.msg}</p>}
    </div>
  );
}

export function PoemText({ lines, poet }: { lines: string[]; poet: string }) {
  const [cyrillic, setCyrillic] = useState(false);
  const bayts: string[][] = [];
  for (let i = 0; i < lines.length; i += 2) bayts.push(lines.slice(i, i + 2));

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <div className="flex rounded-md border border-sand p-0.5 text-sm" role="group" aria-label="Yozuv">
          <button
            aria-pressed={!cyrillic}
            className={`rounded px-3 py-1 ${!cyrillic ? "bg-cream-3 text-navy" : "text-ink-3"}`}
            onClick={() => setCyrillic(false)}
          >
            Lotin
          </button>
          <button
            aria-pressed={cyrillic}
            className={`rounded px-3 py-1 ${cyrillic ? "bg-cream-3 text-navy" : "text-ink-3"}`}
            onClick={() => setCyrillic(true)}
          >
            Кирилл
          </button>
        </div>
        <p className="text-xs text-ink-3">Nuqtali chiziq ostidagi so'z ustiga olib boring — ma'nosi chiqadi.</p>
      </div>
      <ol className="space-y-7">
        {bayts.map((b, i) => (
          <li key={i} className="grid grid-cols-[2rem_1fr] gap-2">
            <span className="pt-2 text-xs tabular-nums text-ink-3">{i + 1}</span>
            <div>
              {b.map((m, k) => (
                <Misra key={k} text={m} cyrillic={cyrillic} />
              ))}
              <BaytExplain lines={b} poet={poet} />
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
