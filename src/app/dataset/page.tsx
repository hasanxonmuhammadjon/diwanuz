import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { connection } from "next/server";
import { datasetStats } from "@/lib/store";

export const metadata: Metadata = {
  title: "Ochiq dataset",
  description: "Inson tomonidan tuzatilgan qo'lyozma satrlari — chig'atoy HTR modeli uchun ochiq dataset.",
};

async function Stats() {
  await connection();
  const s = await datasetStats();
  return (
    <dl className="grid grid-cols-2 lg:grid-cols-4 gap-y-8">
      {[
        [s.pages, "sahifa yuborilgan"],
        [s.lines, "satr"],
        [s.editedLines, "satr inson tomonidan tuzatilgan"],
        [s.contributors, "ishtirokchi"],
      ].map(([n, l]) => (
        <div key={String(l)} className="border-l border-sand pl-5">
          <dd className="font-serif text-4xl text-navy tabular-nums">{n}</dd>
          <dt className="mt-1 text-sm text-ink-3">{l}</dt>
        </div>
      ))}
    </dl>
  );
}

export default function DatasetPage() {
  return (
    <>
      <section className="frame px-4 sm:px-8 pt-10 pb-12">
        <p className="text-sm text-gold">Ochiq ma'lumot</p>
        <h1 className="mt-1 text-4xl">Chig'atoy qo'lyozmalari dataseti</h1>
        <p className="mt-2 max-w-2xl text-ink-3">
          Hozircha chig'atoy qo'lyozmalarini o'qiydigan ochiq AI model ham, uni o'qitish uchun ochiq dataset ham yo'q.
          DiwanUz'da tuzatilgan har bir satr shu bo'shliqni to'ldiradi.
        </p>
        <div className="mt-10">
          <Suspense fallback={<div className="skeleton h-20 w-full" />}>
            <Stats />
          </Suspense>
        </div>
        <div className="mt-10 flex flex-wrap gap-3">
          <a href="/api/dataset" className="btn btn-navy">JSON yuklab olish</a>
          <Link href="/oqish" className="btn btn-white">Hissa qo'shish</Link>
        </div>
      </section>
      <div className="frame hatch" />
      <section className="frame px-4 sm:px-8 py-12">
        <h2 className="text-3xl">Qanday ishlaydi</h2>
        <ol className="mt-8 grid gap-5 md:grid-cols-4">
          {[
            ["1", "O'qish", "Foydalanuvchi sahifa yuklaydi, umumiy AI model uni o'qiydi."],
            ["2", "Tuzatish", "Inson xatolarni muharrirda tuzatadi — model qayerda adashgani ko'rinadi."],
            ["3", "Yig'ish", "Rasm, satr koordinatalari, AI varianti va to'g'ri matn datasetga tushadi."],
            ["4", "O'qitish", "Yetarli satr yig'ilgach, chig'atoy xatiga ixtisoslashgan o'z HTR modelimiz o'qitiladi."],
          ].map(([n, t, d]) => (
            <li key={n} className="card p-5">
              <span className="font-serif text-3xl text-gold">{n}</span>
              <h3 className="mt-2 text-xl">{t}</h3>
              <p className="mt-1 text-sm text-ink-2">{d}</p>
            </li>
          ))}
        </ol>
        <p className="mt-8 text-sm text-ink-3">
          Litsenziya: CC BY 4.0. Eksportda rasmlar yo'q (hajmi katta); rasm + matn juftliklari tadqiqotchilarga
          so'rov bo'yicha beriladi.
        </p>
      </section>
    </>
  );
}
