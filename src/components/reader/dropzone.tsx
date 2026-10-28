"use client";

import { useRef, useState } from "react";
import { MAX_UPLOAD_BYTES } from "./image-prep";

export function Dropzone({
  onFile,
  disabled,
  className = "",
}: {
  onFile: (file: File) => void;
  disabled?: boolean;
  className?: string;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const accept = (file: File | undefined) => {
    if (!file) return;
    if (!/^image\/(jpeg|png|webp)$/.test(file.type)) {
      setError("Faqat PNG, JPG yoki WEBP rasm yuklang.");
      return;
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      setError("Rasm 10 MB dan oshmasin.");
      return;
    }
    setError(null);
    onFile(file);
  };

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setOver(false);
        if (!disabled) accept(e.dataTransfer.files[0]);
      }}
      className={`flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-6 py-10 text-center transition-colors ${
        over ? "border-navy bg-cream-2" : "border-sand bg-paper"
      } ${className}`}
    >
      <div className="grid h-12 w-12 place-items-center rounded-lg bg-cream-2 text-ink-3">
        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
          <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
          <path d="M14 3v5h5M12 11v6M9 14h6" />
        </svg>
      </div>
      <p className="font-semibold text-navy">Qo'lyozma rasmini shu yerga tashlang</p>
      <button type="button" className="btn btn-navy" disabled={disabled} onClick={() => input.current?.click()}>
        Fayl tanlash…
      </button>
      <p className="text-xs text-ink-3">PNG, JPG yoki WEBP · 10 MB gacha · telefon surati ham bo'ladi</p>
      {error && <p className="text-sm text-warn" role="alert">{error}</p>}
      <input
        ref={input}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        capture="environment"
        className="sr-only"
        onChange={(e) => {
          accept(e.target.files?.[0]);
          e.target.value = "";
        }}
      />
    </div>
  );
}
