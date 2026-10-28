import type { Metadata } from "next";
import Link from "next/link";
import { PoemBrowser } from "@/components/devon/poem-browser";
import { POETS, lifespan, poemsBy } from "@/content/poems";
import { poemRows } from "@/content/rows";

export const metadata: Metadata = {
  title: "Devon",
  description: "Mumtoz o'zbek shoirlari va she'rlari — lotin va kirill yozuvida, aruz tahlili va izohlar bilan.",
};

export default function DevonPage() {
  return (
    <>
      <section className="frame px-4 sm:px-8 pt-10 pb-12">
        <p className="text-sm text-gold">Ensiklopediya</p>
        <h1 className="mt-1 text-4xl">Devon</h1>
        <p className="mt-2 max-w-2xl text-ink-3">
          Mumtoz o'zbek shoirlarining she'rlari. Har bir she'r lotin va kirill yozuvida, aruz tahlili, eski so'zlar
          izohi va AI nasriy bayoni bilan.
        </p>
        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {POETS.map((p) => (
            <li key={p.slug}>
              <Link href={`/devon/${p.slug}`} className="card block h-full p-5 hover:border-navy transition-colors">
                <p className="font-serif text-xl text-navy">{p.name}</p>
                <p className="mt-1 text-sm text-ink-3">{lifespan(p)}</p>
                <p className="text-sm text-ink-3">{p.era}</p>
                <p className="mt-3 text-xs text-gold">{poemsBy(p.slug).length} ta she'r</p>
              </Link>
            </li>
          ))}
        </ul>
      </section>
      <div className="frame hatch" />
      <section className="frame px-4 sm:px-8 py-12">
        <h2 className="text-3xl mb-6">She'rlar</h2>
        <PoemBrowser rows={poemRows()} />
      </section>
    </>
  );
}
