"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AruzView } from "@/components/aruz-view";
import { scanPoem } from "@/lib/aruz/scan";
import {
  LANGUAGE_LABEL,
  readingToPageXml,
  readingToText,
  type Explanation,
  type PageReading,
  type ReadLine,
  type ReadResponse,
} from "@/lib/reading";
import { latinToCyrillic } from "@/lib/translit/cyrillic";
import { Dropzone } from "./dropzone";
import { downloadText, prepareImage, type PreparedImage } from "./image-prep";
import { ManuscriptViewer } from "./viewer";

export interface SampleOption {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  /** Stored reading; when missing the sample is read live like an upload. */
  reading: PageReading | null;
}

export const PENDING_KEY = "diwanuz:pending";

export interface PendingReading {
  image: Omit<PreparedImage, "base64">;
  response: ReadResponse;
}

type Phase =
  | { kind: "idle" }
  | { kind: "reading" }
  | { kind: "ready" }
  | { kind: "error"; message: string };

interface Doc {
  src: string;
  name: string;
  width: number;
  height: number;
  /** Set for user uploads; samples are already public. */
  prepared: PreparedImage | null;
  imageHash: string;
  model: string;
  cached: boolean;
  sampleId?: string;
  reading: PageReading;
}

type Tab = "matn" | "aruz" | "izoh";

export async function requestReading(img: PreparedImage): Promise<ReadResponse> {
  const res = await fetch("/api/read", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ image: img.base64, mimeType: img.mimeType }),
  });
  const json = await res.json().catch(() => null);
  if (!res.ok) throw new Error(json?.error?.message ?? "AI javob bermadi.");
  return json as ReadResponse;
}

export function ReaderWorkspace({ samples }: { samples: SampleOption[] }) {
  const [phase, setPhase] = useState<Phase>({ kind: "idle" });
  const [doc, setDoc] = useState<Doc | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [lines, setLines] = useState<ReadLine[]>([]);
  const [active, setActive] = useState<number | null>(null);
  const [hover, setHover] = useState<number | null>(null);
  const [cyrillic, setCyrillic] = useState(false);
  const [tab, setTab] = useState<Tab>("matn");
  const [submitOpen, setSubmitOpen] = useState(false);

  const open = (d: Doc) => {
    setDoc(d);
    setLines(d.reading.lines.map((l) => ({ ...l })));
    setActive(null);
    setTab("matn");
    setPhase({ kind: "ready" });
  };

  // Pick up a reading started on the home page.
  useEffect(() => {
    let pending: PendingReading | null = null;
    try {
      const raw = sessionStorage.getItem(PENDING_KEY);
      if (raw) {
        sessionStorage.removeItem(PENDING_KEY);
        pending = JSON.parse(raw) as PendingReading;
      }
    } catch {
      pending = null;
    }
    if (!pending) return;
    const { image, response } = pending;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time hydration from sessionStorage
    open({
      src: image.dataUrl,
      name: image.name,
      width: image.width,
      height: image.height,
      prepared: { ...image, base64: image.dataUrl.split(",")[1] },
      imageHash: response.imageHash,
      model: response.model,
      cached: response.cached,
      reading: response.reading,
    });
  }, []);

  const readFile = async (file: File) => {
    setPhase({ kind: "reading" });
    setDoc(null);
    try {
      const img = await prepareImage(file);
      setPreview(img.dataUrl);
      const res = await requestReading(img);
      open({
        src: img.dataUrl,
        name: img.name,
        width: img.width,
        height: img.height,
        prepared: img,
        imageHash: res.imageHash,
        model: res.model,
        cached: res.cached,
        reading: res.reading,
      });
    } catch (err) {
      setPhase({ kind: "error", message: (err as Error).message });
    }
  };

  const openSample = async (s: SampleOption) => {
    if (!s.reading) {
      setPhase({ kind: "reading" });
      try {
        const blob = await (await fetch(s.image)).blob();
        await readFile(new File([blob], s.image.split("/").pop() ?? "sahifa.jpg", { type: blob.type || "image/jpeg" }));
      } catch (err) {
        setPhase({ kind: "error", message: (err as Error).message });
      }
      return;
    }
    const img = await loadSize(s.image);
    open({
      src: s.image,
      name: s.image.split("/").pop() ?? "sahifa.jpg",
      width: img.width,
      height: img.height,
      prepared: null,
      imageHash: `sample:${s.id}`,
      model: "oldindan o'qilgan namuna",
      cached: true,
      sampleId: s.id,
      reading: s.reading,
    });
  };

  const reset = () => {
    setDoc(null);
    setPreview(null);
    setLines([]);
    setPhase({ kind: "idle" });
  };

  const edited = useMemo(
    () =>
      doc
        ? lines.filter((l, i) => l.arabic !== doc.reading.lines[i]?.arabic || l.latin !== doc.reading.lines[i]?.latin).length
        : 0,
    [lines, doc],
  );

  if (phase.kind !== "ready" || !doc) {
    return (
      <div className="frame bg-paper/60">
        <div className="grid gap-0 lg:grid-cols-[1.1fr_0.9fr] min-h-[560px]">
          <div className="p-6 sm:p-10 border-b lg:border-b-0 lg:border-r border-rail">
            {phase.kind === "reading" && preview ? (
              <div className="h-[460px] overflow-hidden rounded-xl border border-sand">
                <ManuscriptViewer src={preview} alt="Yuklangan qo'lyozma" lines={[]} active={null} scanning />
              </div>
            ) : (
              <Dropzone onFile={readFile} disabled={phase.kind === "reading"} className="h-[460px]" />
            )}
          </div>
          <div className="p-6 sm:p-10 space-y-5">
            {phase.kind === "reading" ? (
              <div className="space-y-4" aria-live="polite">
                <p className="font-semibold text-navy">Kotib qo'lyozmani o'qiyapti…</p>
                <p className="text-sm text-ink-3">
                  Satrlar ajratilmoqda, arab yozuvi o'qilmoqda va lotin yozuviga o'girilmoqda. Odatda 10–40 soniya.
                </p>
                {[90, 75, 82, 60, 70].map((w, i) => (
                  <div key={i} className="skeleton h-4" style={{ width: `${w}%` }} />
                ))}
              </div>
            ) : (
              <>
                {phase.kind === "error" && (
                  <div className="rounded-lg border border-warn/30 bg-warn/5 p-4 text-sm text-warn" role="alert">
                    {phase.message}
                  </div>
                )}
                <div>
                  <h2 className="text-2xl">Namuna bilan sinab ko'ring</h2>
                  <p className="mt-1 text-sm text-ink-3">
                    Ochiq litsenziyali kutubxona qo'lyozmalari — bir bosishda muharrirda ochiladi.
                  </p>
                </div>
                {samples.length === 0 ? (
                  <p className="text-sm text-ink-3">Namunalar tez orada qo'shiladi.</p>
                ) : (
                  <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                    {samples.map((s) => (
                      <li key={s.id}>
                        <button
                          onClick={() => openSample(s)}
                          className="card w-full overflow-hidden text-left hover:border-navy transition-colors"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={s.image} alt="" className="h-28 w-full object-cover object-top" />
                          <div className="p-3">
                            <p className="text-sm font-semibold text-navy line-clamp-1">{s.title}</p>
                            <p className="text-xs text-ink-3 line-clamp-1">{s.subtitle}</p>
                          </div>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  const focus = hover ?? active;
  const latinLines = lines.map((l) => l.latin).filter((l) => l.trim());
  const exportBase = doc.name.replace(/\.[a-z]+$/i, "");

  return (
    <div className="frame bg-paper">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 border-b border-rail px-4 py-3">
        <button className="btn btn-ghost !py-1.5 text-sm" onClick={reset}>
          ← Yangi rasm
        </button>
        <span className="chip">{LANGUAGE_LABEL[doc.reading.language]}</span>
        {doc.reading.script && <span className="chip">{doc.reading.script}</span>}
        <span className="chip" title="Matnni o'qigan model">
          {doc.model}
          {doc.cached && !doc.sampleId ? " · keshdan" : ""}
        </span>
        <span className="chip">{lines.length} satr</span>
        {edited > 0 && <span className="chip !border-ok/40 !text-ok">{edited} ta tuzatish</span>}
        <div className="ml-auto flex flex-wrap gap-2">
          <ExportMenu
            onExport={(kind) => {
              if (kind === "latin") downloadText(`${exportBase}-lotin.txt`, readingToText(lines, "latin"));
              if (kind === "cyrillic")
                downloadText(`${exportBase}-kirill.txt`, latinToCyrillic(readingToText(lines, "latin")));
              if (kind === "arabic") downloadText(`${exportBase}-arab.txt`, readingToText(lines, "arabic"));
              if (kind === "json")
                downloadText(
                  `${exportBase}.json`,
                  JSON.stringify({ ...doc.reading, lines, image: doc.name }, null, 2),
                  "application/json",
                );
              if (kind === "page")
                downloadText(
                  `${exportBase}.xml`,
                  readingToPageXml(lines, { name: doc.name, width: doc.width, height: doc.height }),
                  "application/xml",
                );
            }}
          />
          <button className="btn btn-navy !py-1.5 text-sm" onClick={() => setSubmitOpen(true)}>
            Datasetga yuborish
          </button>
        </div>
      </div>

      {doc.reading.summary && (
        <p className="border-b border-rail bg-cream-2/60 px-4 py-2 text-sm text-ink-2">
          <span className="font-semibold text-navy">Kotib: </span>
          {doc.reading.summary}
        </p>
      )}

      <div className="grid lg:grid-cols-2 lg:h-[calc(100vh-11rem)] min-h-[560px]">
        <div className="h-[60vh] lg:h-auto border-b lg:border-b-0 lg:border-r border-rail overflow-hidden">
          <ManuscriptViewer
            src={doc.src}
            alt={doc.name}
            lines={lines}
            active={focus}
            onSelect={(i) => {
              setActive(i);
              document.getElementById(`line-${i}`)?.scrollIntoView({ block: "nearest", behavior: "smooth" });
            }}
            onHover={setHover}
          />
        </div>

        <div className="flex min-h-0 flex-col">
          <div className="flex items-center gap-1 border-b border-rail px-3 py-2 text-sm" role="tablist">
            {(
              [
                ["matn", "Transkripsiya"],
                ["aruz", "Aruz tahlili"],
                ["izoh", "Izoh (AI)"],
              ] as [Tab, string][]
            ).map(([t, label]) => (
              <button
                key={t}
                role="tab"
                aria-selected={tab === t}
                onClick={() => setTab(t)}
                className={`rounded-md px-3 py-1.5 ${tab === t ? "bg-navy text-white" : "text-ink-2 hover:bg-cream-2"}`}
              >
                {label}
              </button>
            ))}
            {tab === "matn" && (
              <div className="ml-auto flex rounded-md border border-sand p-0.5 text-xs" aria-label="Yozuv">
                <button
                  className={`rounded px-2 py-1 ${!cyrillic ? "bg-cream-3 text-navy" : "text-ink-3"}`}
                  onClick={() => setCyrillic(false)}
                >
                  Lotin
                </button>
                <button
                  className={`rounded px-2 py-1 ${cyrillic ? "bg-cream-3 text-navy" : "text-ink-3"}`}
                  onClick={() => setCyrillic(true)}
                >
                  Кирилл
                </button>
              </div>
            )}
          </div>

          <div className="flex-1 overflow-auto">
            {tab === "matn" && (
              <ol className="divide-y divide-rail">
                {lines.map((l, i) => (
                  <li
                    key={i}
                    id={`line-${i}`}
                    onMouseEnter={() => setHover(i)}
                    onMouseLeave={() => setHover(null)}
                    onFocus={() => setActive(i)}
                    className={`grid grid-cols-[2rem_1fr] gap-x-3 px-4 py-3 transition-colors ${
                      focus === i ? "bg-cream-2" : ""
                    }`}
                  >
                    <span className="pt-2 text-xs tabular-nums text-ink-3">
                      {i + 1}
                      {l.confidence < 0.6 && (
                        <span className="mt-1 block h-2 w-2 rounded-full bg-warn" title="AI ishonchi past — tekshiring" />
                      )}
                    </span>
                    <div className="space-y-1.5 min-w-0">
                      <input
                        dir="rtl"
                        lang="fa"
                        aria-label={`${i + 1}-satr, arab yozuvi`}
                        value={l.arabic}
                        onChange={(e) => setLines((ls) => ls.map((x, k) => (k === i ? { ...x, arabic: e.target.value } : x)))}
                        className="arabic w-full rounded-md border border-transparent bg-transparent px-2 py-1 text-xl text-ink hover:border-sand focus:border-navy focus:bg-paper outline-none"
                      />
                      {cyrillic ? (
                        <p className="px-2 py-1 text-[0.95rem] text-ink-2">{latinToCyrillic(l.latin)}</p>
                      ) : (
                        <input
                          aria-label={`${i + 1}-satr, lotin yozuvi`}
                          value={l.latin}
                          onChange={(e) => setLines((ls) => ls.map((x, k) => (k === i ? { ...x, latin: e.target.value } : x)))}
                          className="w-full rounded-md border border-transparent bg-transparent px-2 py-1 text-[0.95rem] text-ink-2 hover:border-sand focus:border-navy focus:bg-paper outline-none"
                        />
                      )}
                    </div>
                  </li>
                ))}
              </ol>
            )}
            {tab === "aruz" && (
              <div className="p-4">
                {latinLines.length === 0 ? (
                  <p className="text-sm text-ink-3">Tahlil uchun lotin yozuvidagi matn kerak.</p>
                ) : (
                  <AruzView scan={scanPoem(latinLines.slice(0, 12))} compact />
                )}
                {latinLines.length > 12 && (
                  <p className="mt-3 text-xs text-ink-3">Birinchi 12 misra tahlil qilindi.</p>
                )}
              </div>
            )}
            {tab === "izoh" && <ExplainPanel lines={lines} active={active} onPick={setActive} />}
          </div>
        </div>
      </div>

      {submitOpen && (
        <SubmitDialog
          doc={doc}
          lines={lines}
          edited={edited}
          onClose={() => setSubmitOpen(false)}
        />
      )}
    </div>
  );
}

function loadSize(src: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
    img.onerror = () => resolve({ width: 1000, height: 1400 });
    img.src = src;
  });
}

function ExportMenu({ onExport }: { onExport: (k: "latin" | "cyrillic" | "arabic" | "json" | "page") => void }) {
  const [open, setOpen] = useState(false);
  const items: [Parameters<typeof onExport>[0], string][] = [
    ["latin", "Matn — lotin (.txt)"],
    ["cyrillic", "Matn — kirill (.txt)"],
    ["arabic", "Matn — arab yozuvi (.txt)"],
    ["json", "JSON (satrlar + koordinatalar)"],
    ["page", "PAGE XML (Transkribus/eScriptorium)"],
  ];
  return (
    <div className="relative">
      <button className="btn btn-white !py-1.5 text-sm" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
        Eksport ▾
      </button>
      {open && (
        <ul className="absolute right-0 z-20 mt-1 w-72 card p-1 shadow-lg">
          {items.map(([k, label]) => (
            <li key={k}>
              <button
                className="w-full rounded-md px-3 py-2 text-left text-sm hover:bg-cream-2"
                onClick={() => {
                  onExport(k);
                  setOpen(false);
                }}
              >
                {label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function ExplainPanel({
  lines,
  active,
  onPick,
}: {
  lines: ReadLine[];
  active: number | null;
  onPick: (i: number) => void;
}) {
  const start = active === null ? 0 : active - (active % 2);
  const pair = lines.slice(start, start + 2).map((l) => l.latin).filter(Boolean);
  const [state, setState] = useState<
    { kind: "idle" } | { kind: "loading" } | { kind: "done"; data: Explanation; key: string } | { kind: "error"; message: string }
  >({ kind: "idle" });
  const key = pair.join("\n");

  const run = async () => {
    setState({ kind: "loading" });
    try {
      const res = await fetch("/api/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lines: pair }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error?.message ?? "Xatolik");
      setState({ kind: "done", data: json.explanation, key });
    } catch (err) {
      setState({ kind: "error", message: (err as Error).message });
    }
  };

  return (
    <div className="p-4 space-y-4">
      <p className="text-sm text-ink-3">
        Matndan baytni tanlang (satr ustiga bosing) — AI uning nasriy bayonini, eski so'zlar ma'nosini va badiiy
        san'atlarini tushuntiradi.
      </p>
      <div className="flex flex-wrap gap-1.5">
        {Array.from({ length: Math.ceil(lines.length / 2) }, (_, b) => (
          <button
            key={b}
            onClick={() => onPick(b * 2)}
            className={`rounded-md border px-2.5 py-1 text-xs tabular-nums ${
              start === b * 2 ? "border-navy bg-navy text-white" : "border-sand text-ink-2 hover:border-navy"
            }`}
          >
            {b + 1}-bayt
          </button>
        ))}
      </div>
      <blockquote className="card p-4 font-serif text-lg italic text-navy">
        {pair.map((l, i) => (
          <p key={i}>{l}</p>
        ))}
      </blockquote>
      <button className="btn btn-navy text-sm" onClick={run} disabled={pair.length === 0 || state.kind === "loading"}>
        {state.kind === "loading" ? "Tahlil qilinmoqda…" : "Baytni izohlash"}
      </button>
      {state.kind === "error" && <p className="text-sm text-warn">{state.message}</p>}
      {state.kind === "done" && state.key === key && <ExplanationView data={state.data} />}
    </div>
  );
}

export function ExplanationView({ data }: { data: Explanation }) {
  return (
    <div className="space-y-4 text-sm">
      <div>
        <h4 className="font-sans text-xs font-semibold uppercase tracking-wider text-ink-3">Nasriy bayon</h4>
        <p className="mt-1 leading-relaxed text-ink">{data.bayon}</p>
      </div>
      {data.words.length > 0 && (
        <div>
          <h4 className="font-sans text-xs font-semibold uppercase tracking-wider text-ink-3">Lug'at</h4>
          <dl className="mt-1 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1">
            {data.words.map((w) => (
              <div key={w.word} className="contents">
                <dt className="font-semibold text-navy">{w.word}</dt>
                <dd className="text-ink-2">{w.meaning}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}
      {data.sanat.length > 0 && (
        <div>
          <h4 className="font-sans text-xs font-semibold uppercase tracking-wider text-ink-3">Badiiy san'atlar</h4>
          <ul className="mt-1 list-disc pl-5 text-ink-2 space-y-0.5">
            {data.sanat.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        </div>
      )}
      <p className="text-xs text-ink-3">AI izohi — mutaxassis tekshiruvidan o'tmagan.</p>
    </div>
  );
}

function SubmitDialog({
  doc,
  lines,
  edited,
  onClose,
}: {
  doc: Doc;
  lines: ReadLine[];
  edited: number;
  onClose: () => void;
}) {
  const [name, setName] = useState("");
  const [shareImage, setShareImage] = useState(true);
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [error, setError] = useState("");

  const send = async () => {
    setState("sending");
    try {
      const image =
        shareImage && doc.prepared ? (await prepareImage(doc.prepared.dataUrl, 1200, 0.8)).base64 : null;
      const res = await fetch("/api/corrections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageHash: doc.imageHash,
          image,
          contributor: name,
          language: doc.reading.language,
          aiLines: doc.reading.lines,
          lines,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error?.message ?? "Xatolik");
      setState("done");
    } catch (err) {
      setError((err as Error).message);
      setState("error");
    }
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-ink/40 p-4" role="dialog" aria-modal="true" aria-labelledby="submit-title">
      <div className="card w-full max-w-md p-6 shadow-xl space-y-4">
        {state === "done" ? (
          <>
            <h2 id="submit-title" className="text-2xl">Rahmat!</h2>
            <p className="text-sm text-ink-2">
              Sahifa ochiq datasetga qo'shildi. Har bir tuzatilgan satr o'zbek qo'lyozmalarini o'qiydigan o'z AI
              modelimizni o'qitish uchun xizmat qiladi.
            </p>
            <div className="flex gap-2">
              <Link href="/dataset" className="btn btn-navy text-sm">Datasetni ko'rish</Link>
              <button className="btn btn-ghost text-sm" onClick={onClose}>Yopish</button>
            </div>
          </>
        ) : (
          <>
            <h2 id="submit-title" className="text-2xl">Datasetga yuborish</h2>
            <p className="text-sm text-ink-2">
              {lines.length} satr, shundan {edited} tasi siz tomondan tuzatilgan. AI varianti ham saqlanadi — model
              qayerda adashganini o'rganish uchun.
            </p>
            <label className="block text-sm">
              <span className="text-ink-2">Ismingiz (ixtiyoriy)</span>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={60}
                className="mt-1 w-full rounded-md border border-sand bg-paper px-3 py-2 outline-none focus:border-navy"
                placeholder="Masalan: Malika, 3-kurs"
              />
            </label>
            {doc.prepared && (
              <label className="flex items-start gap-2 text-sm text-ink-2">
                <input type="checkbox" checked={shareImage} onChange={(e) => setShareImage(e.target.checked)} className="mt-1" />
                Rasmni ham datasetga qo'shish (model o'qitish uchun rasm + matn juftligi kerak)
              </label>
            )}
            <p className="text-xs text-ink-3">Yuborilgan ma'lumotlar CC BY 4.0 litsenziyasi bilan ochiq e'lon qilinadi.</p>
            {state === "error" && <p className="text-sm text-warn">{error}</p>}
            <div className="flex gap-2">
              <button className="btn btn-navy text-sm" onClick={send} disabled={state === "sending"}>
                {state === "sending" ? "Yuborilmoqda…" : "Yuborish"}
              </button>
              <button className="btn btn-ghost text-sm" onClick={onClose}>Bekor qilish</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
