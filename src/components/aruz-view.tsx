import { confidenceLabel, type FailedLine, type LineScan, type PoemScan, type Weight } from "@/lib/aruz/scan";

const MARK: Record<Weight, string> = { "-": "—", u: "∪", "-u": "—∪" };

function FailedLineView({ line, index }: { line: FailedLine; index: number }) {
  return (
    <div className="space-y-2">
      <p className="text-sm text-ink-3">
        <span className="text-ink-3/70 mr-2 tabular-nums">{index + 1}.</span>
        {line.text}
      </p>
      <p className="text-xs text-warn">
        Bu misra vaznga tushmadi ({line.syllables.map((s) => s.text).join("-")}). Imlo yoki o'qilishini tekshiring.
      </p>
    </div>
  );
}

function LineView({ line, index }: { line: LineScan; index: number }) {
  return (
    <div className="space-y-2">
      <p className="text-sm text-ink-3">
        <span className="text-ink-3/70 mr-2 tabular-nums">{index + 1}.</span>
        {line.text}
      </p>
      <div className="flex flex-wrap gap-1.5">
        {line.feet.map((foot, k) => (
          <div key={k} className="rounded-md border border-sand bg-paper px-2 py-1.5">
            <div className="flex gap-1">
              {foot.syllables.map((s, i) => (
                <div key={i} className="flex flex-col items-center min-w-[2.1rem]">
                  <span
                    className={`text-base leading-none font-semibold ${
                      s.mismatch ? "hija-bad" : s.weight === "u" ? "hija-short" : "hija-long"
                    }`}
                    title={s.mismatch ? "Vazn talabiga mos kelmadi" : undefined}
                  >
                    {MARK[s.weight]}
                  </span>
                  <span className={`mt-1 text-[0.8rem] ${s.mismatch ? "text-warn" : "text-ink-2"}`}>{s.text}</span>
                </div>
              ))}
            </div>
            <div className="mt-1 text-center text-[0.7rem] italic text-gold">{foot.name}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AruzView({ scan, compact = false }: { scan: PoemScan; compact?: boolean }) {
  const best = scan.best;
  if (!best) {
    return (
      <div className="card p-5 text-sm text-ink-2">
        Bu misralar katalogdagi vaznlarning birortasiga ham to'g'ri kelmadi. Matnni tekshiring:
        har bir misra alohida qatorda bo'lishi kerak.
      </div>
    );
  }
  const others = scan.candidates.slice(1, 3).filter((c) => c.confidence > 0.02);
  const label = confidenceLabel(best);
  const variant = best.lines.find((l): l is LineScan => l.ok && !!l.variantName)?.variantName;
  return (
    <div className="space-y-5">
      <div className="card p-5 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-wider text-ink-3">Aniqlangan vazn</p>
          <h3 className="text-2xl mt-1">{best.meter.name}</h3>
          {variant && <p className="mt-1 text-sm text-ink-2">{variant}</p>}
          <p className="mt-1 italic text-gold">{best.meter.afoil}</p>
          {best.meter.note && <p className="mt-2 text-sm text-ink-3">{best.meter.note}</p>}
        </div>
        <div className="text-right">
          <p className={`text-2xl font-serif ${label === "past" ? "text-warn" : "text-navy"}`}>{label}</p>
          <p className="text-xs text-ink-3">ishonch darajasi</p>
          {best.mismatches > 0 && (
            <p className="mt-1 text-xs text-warn">{best.mismatches} ta hija vazndan chetlashdi</p>
          )}
          {best.failed > 0 && (
            <p className="mt-1 text-xs text-warn">{best.failed} ta misra vaznga tushmadi</p>
          )}
        </div>
      </div>
      <div className={`space-y-5 ${compact ? "" : "card p-5"}`}>
        {best.lines.map((l, i) =>
          l.ok ? <LineView key={i} line={l} index={i} /> : <FailedLineView key={i} line={l} index={i} />,
        )}
        <p className="text-xs text-ink-3 border-t border-rail pt-3">
          <span className="hija-long font-semibold">—</span> cho'ziq hija ·{" "}
          <span className="hija-short font-semibold">∪</span> qisqa hija ·{" "}
          <span className="hija-long font-semibold">—∪</span> o'ta cho'ziq hija ·{" "}
          <span className="hija-bad">qizil</span> — vazndan chetlashish. Misra oxiridagi hija erkin hisoblanadi.
        </p>
      </div>
      {others.length > 0 && (
        <p className="text-sm text-ink-3">
          Boshqa ehtimollar:{" "}
          {others.map((c, i) => (
            <span key={c.meter.id}>
              {i > 0 && ", "}
              {c.meter.name} ({Math.round(c.confidence * 100)}%)
            </span>
          ))}
        </p>
      )}
    </div>
  );
}
