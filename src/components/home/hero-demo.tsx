"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Dropzone } from "@/components/reader/dropzone";
import { prepareImage, type PreparedImage } from "@/components/reader/image-prep";
import { ManuscriptViewer } from "@/components/reader/viewer";
import { PENDING_KEY, requestReading, type PendingReading } from "@/components/reader/workspace";
import { LogoMark } from "@/components/logo";
import type { ReadResponse } from "@/lib/reading";

type State =
  | { kind: "idle" }
  | { kind: "reading"; img: PreparedImage }
  | { kind: "done"; img: PreparedImage; res: ReadResponse }
  | { kind: "error"; img: PreparedImage | null; message: string };

function Bubble({ children, tone = "plain" }: { children: React.ReactNode; tone?: "plain" | "soft" }) {
  return (
    <div
      className={`w-fit max-w-full rounded-xl px-3.5 py-2 text-sm ${
        tone === "plain" ? "bg-cream-3 text-ink" : "bg-cream-2 text-ink-2"
      }`}
    >
      {children}
    </div>
  );
}

export function HeroDemo() {
  const router = useRouter();
  const [state, setState] = useState<State>({ kind: "idle" });

  const onFile = async (file: File) => {
    let img: PreparedImage | null = null;
    try {
      img = await prepareImage(file);
      setState({ kind: "reading", img });
      const res = await requestReading(img);
      setState({ kind: "done", img, res });
    } catch (err) {
      setState({ kind: "error", img, message: (err as Error).message });
    }
  };

  const openEditor = () => {
    if (state.kind !== "done") return;
    const { base64: _omit, ...image } = state.img;
    void _omit;
    const pending: PendingReading = { image, response: state.res };
    try {
      sessionStorage.setItem(PENDING_KEY, JSON.stringify(pending));
    } catch {
      // Storage full or blocked: the editor will simply start empty.
    }
    router.push("/oqish");
  };

  const img = state.kind === "idle" ? null : state.img;

  return (
    <div className="card overflow-hidden shadow-[0_20px_60px_-30px_rgba(25,48,96,0.35)]">
      <div className="grid md:grid-cols-2">
        <div className="p-3 sm:p-4 md:border-r border-rail">
          {img ? (
            <div className="h-[380px] sm:h-[440px] overflow-hidden rounded-xl border border-sand">
              <ManuscriptViewer
                src={img.dataUrl}
                alt="Yuklangan qo'lyozma"
                lines={state.kind === "done" ? state.res.reading.lines : []}
                active={null}
                scanning={state.kind === "reading"}
              />
            </div>
          ) : (
            <Dropzone onFile={onFile} className="h-[380px] sm:h-[440px]" />
          )}
        </div>
        <div className="flex flex-col p-4 sm:p-5 min-h-[200px] md:min-h-[380px]">
          <div className="flex items-center gap-2.5">
            <div className="grid h-9 w-9 place-items-center rounded-full bg-cream-2">
              <LogoMark className="h-5 w-5" />
            </div>
            <div className="leading-tight">
              <p className="text-sm font-semibold text-navy">Kotib</p>
              <p className="text-xs text-ink-3">AI yordamchi</p>
            </div>
          </div>
          <div className="mt-4 flex-1 space-y-2.5 overflow-auto" aria-live="polite">
            <Bubble>Assalomu alaykum!</Bubble>
            <Bubble tone="soft">Qo'lyozma rasmini yuklang — men uni o'qib, lotin yozuviga o'girib beraman.</Bubble>
            {state.kind === "reading" && (
              <Bubble tone="soft">
                <span className="inline-flex items-center gap-2">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-navy" />
                  Satrlarni topyapman va o'qiyapman…
                </span>
              </Bubble>
            )}
            {state.kind === "error" && (
              <Bubble tone="soft">
                <span className="text-warn">{state.message}</span>{" "}
                <Link href="/oqish" className="underline text-navy">Namuna qo'lyozmani oching</Link>
              </Bubble>
            )}
            {state.kind === "done" && (
              <>
                <Bubble>
                  {state.res.reading.summary || "Tayyor!"} {state.res.reading.lines.length} ta satr o'qildi.
                </Bubble>
                <div className="rounded-xl border border-sand bg-paper p-3 space-y-2">
                  {state.res.reading.lines.slice(0, 6).map((l, i) => (
                    <div key={i}>
                      <p className="arabic text-lg text-ink leading-snug">{l.arabic}</p>
                      <p className="text-sm text-ink-2">{l.latin}</p>
                    </div>
                  ))}
                  {state.res.reading.lines.length > 6 && <p className="text-xs text-ink-3">…va yana {state.res.reading.lines.length - 6} satr</p>}
                </div>
                <div className="flex flex-wrap gap-2 pt-1">
                  <button className="btn btn-navy text-sm" onClick={openEditor}>Muharrirda ochish</button>
                  <button className="btn btn-ghost text-sm" onClick={() => setState({ kind: "idle" })}>Boshqa rasm</button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      <p className="border-t border-rail px-4 py-2.5 text-center text-xs text-ink-3">
        Rasm yuklash orqali siz uni AI yordamida qayta ishlashga rozilik bildirasiz. Rasm datasetga faqat siz
        yuborsangiz qo'shiladi.
      </p>
    </div>
  );
}
