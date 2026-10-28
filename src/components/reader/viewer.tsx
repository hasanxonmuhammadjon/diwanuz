"use client";

import { useState } from "react";
import type { ReadLine } from "@/lib/reading";

export function ManuscriptViewer({
  src,
  alt,
  lines,
  active,
  onSelect,
  onHover,
  scanning = false,
}: {
  src: string;
  alt: string;
  lines: ReadLine[];
  active: number | null;
  onSelect?: (i: number) => void;
  onHover?: (i: number | null) => void;
  scanning?: boolean;
}) {
  const [zoom, setZoom] = useState(1);

  return (
    <div className="relative flex h-full flex-col bg-cream-3/60">
      <div className="flex items-center gap-1 border-b border-rail bg-paper px-3 py-2 text-sm">
        <span className="text-ink-3 mr-auto">Tasvir</span>
        <button className="btn btn-ghost !px-2.5 !py-1" onClick={() => setZoom((z) => Math.max(0.5, z - 0.25))} aria-label="Kichiklashtirish">
          −
        </button>
        <span className="w-12 text-center tabular-nums text-ink-3">{Math.round(zoom * 100)}%</span>
        <button className="btn btn-ghost !px-2.5 !py-1" onClick={() => setZoom((z) => Math.min(3, z + 0.25))} aria-label="Kattalashtirish">
          +
        </button>
        <button className="btn btn-ghost !px-2.5 !py-1" onClick={() => setZoom(1)}>
          Moslash
        </button>
      </div>
      <div className="flex-1 overflow-auto p-4">
        <div className="relative mx-auto" style={{ width: `${zoom * 100}%` }}>
          {/* eslint-disable-next-line @next/next/no-img-element -- user uploads are data URLs */}
          <img src={src} alt={alt} className="block w-full rounded shadow-sm select-none" draggable={false} />
          {lines.map((l, i) =>
            l.box ? (
              <button
                key={i}
                type="button"
                aria-label={`${i + 1}-satr`}
                onClick={() => onSelect?.(i)}
                onMouseEnter={() => onHover?.(i)}
                onMouseLeave={() => onHover?.(null)}
                className={`absolute rounded-sm border transition-colors ${
                  active === i
                    ? "border-navy bg-navy/15"
                    : "border-sky/40 bg-sky/5 hover:border-navy hover:bg-navy/10"
                }`}
                style={{
                  top: `${l.box[0] / 10}%`,
                  left: `${l.box[1] / 10}%`,
                  height: `${(l.box[2] - l.box[0]) / 10}%`,
                  width: `${(l.box[3] - l.box[1]) / 10}%`,
                }}
              />
            ) : null,
          )}
          {scanning && (
            <div className="pointer-events-none absolute inset-0 overflow-hidden rounded">
              <div className="absolute inset-x-0 h-24 bg-gradient-to-b from-transparent via-sky/25 to-transparent animate-[scan_2.2s_ease-in-out_infinite]" />
            </div>
          )}
        </div>
      </div>
      <style>{`@keyframes scan { 0% { top: -10%; } 100% { top: 100%; } }`}</style>
    </div>
  );
}
