"use client";

import { useState } from "react";
import type { PageReading } from "@/lib/reading";
import { latinToCyrillic } from "@/lib/translit/cyrillic";
import { ManuscriptViewer } from "./viewer";

/** Read-only manuscript page: image with line boxes, synced to the transcription. */
export function PageView({ image, alt, reading }: { image: string; alt: string; reading: PageReading }) {
  const [active, setActive] = useState<number | null>(null);
  const [cyrillic, setCyrillic] = useState(false);

  return (
    <div className="card overflow-hidden grid lg:grid-cols-2">
      <div className="h-[70vh] border-b lg:border-b-0 lg:border-r border-rail">
        <ManuscriptViewer
          src={image}
          alt={alt}
          lines={reading.lines}
          active={active}
          onSelect={setActive}
          onHover={setActive}
        />
      </div>
      <div className="flex h-[70vh] flex-col">
        <div className="flex items-center gap-2 border-b border-rail px-4 py-2 text-sm">
          <span className="text-ink-3 mr-auto">Transkripsiya · {reading.lines.length} satr</span>
          <div className="flex rounded-md border border-sand p-0.5 text-xs" role="group" aria-label="Yozuv">
            <button aria-pressed={!cyrillic} className={`rounded px-2 py-1 ${!cyrillic ? "bg-cream-3 text-navy" : "text-ink-3"}`} onClick={() => setCyrillic(false)}>
              Lotin
            </button>
            <button aria-pressed={cyrillic} className={`rounded px-2 py-1 ${cyrillic ? "bg-cream-3 text-navy" : "text-ink-3"}`} onClick={() => setCyrillic(true)}>
              Кирилл
            </button>
          </div>
        </div>
        <ol className="flex-1 overflow-auto divide-y divide-rail">
          {reading.lines.map((l, i) => (
            <li
              key={i}
              onMouseEnter={() => setActive(i)}
              onMouseLeave={() => setActive(null)}
              className={`grid grid-cols-[2rem_1fr] px-4 py-3 ${active === i ? "bg-cream-2" : ""}`}
            >
              <span className="pt-1 text-xs tabular-nums text-ink-3">{i + 1}</span>
              <div>
                <p className="arabic text-xl text-ink">{l.arabic}</p>
                <p className="font-serif text-base text-navy">{cyrillic ? latinToCyrillic(l.latin) : l.latin}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
