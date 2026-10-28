import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PoemBrowser } from "@/components/devon/poem-browser";
import { POETS, getPoet, lifespan, poemsBy } from "@/content/poems";
import { poemRows } from "@/content/rows";

export function generateStaticParams() {
  const params = POETS.map((p) => ({ poet: p.slug }));
  // Cache Components needs at least one entry; the placeholder renders notFound().
  return params.length ? params : [{ poet: "_" }];
}

export async function generateMetadata({ params }: PageProps<"/devon/[poet]">): Promise<Metadata> {
  const poet = getPoet((await params).poet);
  return poet ? { title: poet.name, description: poet.bio.slice(0, 160) } : {};
}

export default async function PoetPage({ params }: PageProps<"/devon/[poet]">) {
  const poet = getPoet((await params).poet);
  if (!poet) notFound();
  const poems = poemsBy(poet.slug);

  return (
    <>
      <section className="frame px-4 sm:px-8 pt-10 pb-12">
        <Link href="/devon" className="text-sm text-gold hover:text-navy">← Devon</Link>
        <div className="mt-4 grid gap-8 lg:grid-cols-[1.3fr_0.7fr]">
          <div>
            <h1 className="text-5xl">{poet.name}</h1>
            {poet.penName && <p className="mt-2 font-serif text-xl italic text-ink-3">Taxallusi: {poet.penName}</p>}
            <p className="mt-5 max-w-2xl leading-relaxed text-ink-2">{poet.bio}</p>
            <a href={poet.sourceUrl} target="_blank" rel="noreferrer" className="mt-3 inline-block text-xs text-ink-3 underline">
              Manba
            </a>
          </div>
          <dl className="card p-5 grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm h-fit">
            <dt className="text-ink-3">Yashagan yillari</dt>
            <dd className="text-navy">{lifespan(poet) || "—"}</dd>
            <dt className="text-ink-3">Tug'ilgan joyi</dt>
            <dd className="text-navy">{poet.birthplace ?? "—"}</dd>
            <dt className="text-ink-3">Davr</dt>
            <dd className="text-navy">{poet.era}</dd>
            <dt className="text-ink-3">Devonda</dt>
            <dd className="text-navy">{poems.length} ta she'r</dd>
          </dl>
        </div>
      </section>
      <div className="frame hatch" />
      <section className="frame px-4 sm:px-8 py-12">
        <PoemBrowser rows={poemRows(poems)} />
      </section>
    </>
  );
}
