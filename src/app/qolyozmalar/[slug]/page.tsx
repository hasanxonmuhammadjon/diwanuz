import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageView } from "@/components/reader/page-view";
import { MANUSCRIPTS, getManuscript } from "@/content/manuscripts";
import { LANGUAGE_LABEL } from "@/lib/reading";

export function generateStaticParams() {
  const params = MANUSCRIPTS.map((m) => ({ slug: m.slug }));
  // Cache Components needs at least one entry; the placeholder renders notFound().
  return params.length ? params : [{ slug: "_" }];
}

export async function generateMetadata({ params }: PageProps<"/qolyozmalar/[slug]">): Promise<Metadata> {
  const m = getManuscript((await params).slug);
  return m ? { title: m.title, description: `${m.author} · ${m.institution} · ${m.shelfmark}` } : {};
}

export default async function ManuscriptPage({ params }: PageProps<"/qolyozmalar/[slug]">) {
  const m = getManuscript((await params).slug);
  if (!m) notFound();

  return (
    <section className="frame px-4 sm:px-8 pt-10 pb-16">
      <Link href="/qolyozmalar" className="text-sm text-gold hover:text-navy">← Qo'lyozmalar</Link>
      <div className="mt-4 grid gap-6 lg:grid-cols-[1.4fr_0.6fr]">
        <div>
          <h1 className="text-4xl">{m.title}</h1>
          <p className="mt-2 text-lg text-ink-3">{m.author}</p>
        </div>
        <dl className="card p-5 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-sm">
          <dt className="text-ink-3">Saqlanadi</dt><dd className="text-navy">{m.institution}</dd>
          <dt className="text-ink-3">Shifr</dt><dd className="text-navy">{m.shelfmark}</dd>
          <dt className="text-ink-3">Sana</dt><dd className="text-navy">{m.date}</dd>
          <dt className="text-ink-3">Xat</dt><dd className="text-navy">{m.script}</dd>
          <dt className="text-ink-3">Litsenziya</dt>
          <dd><a href={m.rightsUrl} target="_blank" rel="noreferrer" className="text-navy underline">{m.rights}</a></dd>
          <dt className="text-ink-3">Manba</dt>
          <dd><a href={m.recordUrl} target="_blank" rel="noreferrer" className="text-navy underline">Kutubxona yozuvi</a></dd>
        </dl>
      </div>
      <div className="mt-10 space-y-12">
        {m.pages.map((p, i) => (
          <div key={p.image}>
            <div className="mb-3 flex flex-wrap items-baseline gap-3">
              <h2 className="text-2xl">Varaq {p.folio}</h2>
              {p.reading && <span className="chip">{LANGUAGE_LABEL[p.reading.language]}</span>}
              {p.reading && <span className="chip">AI o'qigan · tekshirilmagan</span>}
              {p.note && <span className="text-sm text-ink-3">{p.note}</span>}
            </div>
            {p.reading ? (
              <PageView image={p.image} alt={`${m.title}, ${p.folio}`} reading={p.reading} />
            ) : (
              <div className="card overflow-hidden grid md:grid-cols-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.image} alt={`${m.title}, ${i + 1}-sahifa`} className="w-full" />
                <div className="p-6 grid place-items-center text-center text-ink-3">
                  <div>
                    <p>Bu sahifa hali o'qilmagan.</p>
                    <Link href="/oqish" className="btn btn-navy mt-4 text-sm">Ish joyida o'qish</Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
