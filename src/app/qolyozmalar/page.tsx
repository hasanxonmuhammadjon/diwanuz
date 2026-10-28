import type { Metadata } from "next";
import Link from "next/link";
import { MANUSCRIPTS } from "@/content/manuscripts";

export const metadata: Metadata = {
  title: "Qo'lyozmalar",
  description: "AI yordamida o'qilgan ochiq litsenziyali qo'lyozmalar to'plami.",
};

export default function ManuscriptsPage() {
  return (
    <section className="frame px-4 sm:px-8 pt-10 pb-16">
      <p className="text-sm text-gold">Nashr qilingan to'plam</p>
      <h1 className="mt-1 text-4xl">Qo'lyozmalar</h1>
      <p className="mt-2 max-w-2xl text-ink-3">
        Jahon kutubxonalarining ochiq litsenziyali raqamli nusxalari. Har bir sahifa AI tomonidan o'qilgan va
        transkripsiyasi tasvir bilan satrma-satr bog'langan.
      </p>
      {MANUSCRIPTS.length === 0 ? (
        <p className="mt-10 card p-8 text-center text-ink-3">To'plam tayyorlanmoqda.</p>
      ) : (
        <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {MANUSCRIPTS.map((m) => (
            <li key={m.slug}>
              <Link href={`/qolyozmalar/${m.slug}`} className="card block overflow-hidden hover:border-navy transition-colors">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={m.pages[0]?.image} alt="" className="h-56 w-full object-cover object-top" />
                <div className="p-5">
                  <p className="font-serif text-xl text-navy">{m.title}</p>
                  <p className="mt-1 text-sm text-ink-3">{m.author} · {m.date}</p>
                  <p className="mt-3 text-xs text-gold">
                    {m.institution} · {m.pages.length} sahifa
                    {m.pages.some((p) => p.reading) ? " · o'qilgan" : ""}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
