"use client";

import { useMemo, useState } from "react";
import { AruzView } from "@/components/aruz-view";
import { scanPoem } from "@/lib/aruz/scan";

export function AruzTool({ examples }: { examples: { label: string; lines: string[] }[] }) {
  const [text, setText] = useState(examples[0]?.lines.join("\n") ?? "");
  const lines = useMemo(() => text.split("\n").map((l) => l.trim()).filter(Boolean).slice(0, 16), [text]);
  const scan = useMemo(() => (lines.length ? scanPoem(lines) : null), [lines]);

  return (
    <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
      <div className="space-y-4">
        <label htmlFor="aruz-input" className="block text-sm font-semibold text-navy">
          Misralarni kiriting — har birini yangi qatordan
        </label>
        <textarea
          id="aruz-input"
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={8}
          className="w-full rounded-xl border border-sand bg-paper p-4 font-serif text-lg leading-relaxed text-ink outline-none focus:border-navy"
          placeholder={"Birinchi misra\nIkkinchi misra"}
        />
        {examples.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <span className="text-sm text-ink-3">Namunalar:</span>
            {examples.map((e) => (
              <button
                key={e.label}
                onClick={() => setText(e.lines.join("\n"))}
                className="chip hover:border-navy hover:text-navy"
              >
                {e.label}
              </button>
            ))}
          </div>
        )}
        <p className="text-xs leading-relaxed text-ink-3">
          Skaner lotin yozuvidagi matnni hijolarga ajratadi, vasl (so'z oxiridagi undoshning keyingi unli bilan
          ulanishi) va o'ta cho'ziq hijolarni hisobga oladi, so'ng har bir vazn bilan solishtiradi. Ochiq hijolar
          turkiy so'zlarda ham qisqa, ham cho'ziq o'qilishi mumkinligi sababli natija ehtimollik bilan beriladi.
        </p>
      </div>
      <div aria-live="polite">{scan ? <AruzView scan={scan} /> : <p className="text-ink-3">Matn kiriting.</p>}</div>
    </div>
  );
}
