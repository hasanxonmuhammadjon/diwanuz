import type { Metadata } from "next";
import { ReaderWorkspace } from "@/components/reader/workspace";
import { readerSamples } from "@/content/samples";

export const metadata: Metadata = {
  title: "Qo'lyozma o'qish",
  description: "Qo'lyozma rasmini yuklang — AI satrlarni topadi, arab yozuvini o'qiydi va lotin yozuviga o'giradi.",
};

export default function ReaderPage() {
  return (
    <div className="pb-16">
      <div className="frame px-4 sm:px-8 pt-10 pb-6">
        <p className="text-sm text-gold">Ish joyi</p>
        <h1 className="text-4xl mt-1">Qo'lyozma o'qish</h1>
        <p className="mt-2 max-w-2xl text-ink-3">
          Sahifa rasmini yuklang. Kotib satrlarni topadi, arab yozuvini o'qiydi va lotin yozuviga o'giradi. Natijani
          tuzating, eksport qiling yoki ochiq datasetga qo'shing.
        </p>
      </div>
      <ReaderWorkspace samples={readerSamples()} />
    </div>
  );
}
