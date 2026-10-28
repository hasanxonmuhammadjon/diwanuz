import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AruzView } from "@/components/aruz-view";
import { PoemText } from "@/components/devon/poem-text";
import { POEMS, getPoem, getPoet, poemsBy } from "@/content/poems";
import { poemMeter } from "@/content/rows";
import { metersForGenre, scanPoem } from "@/lib/aruz/scan";

export function generateStaticParams() {
  const params = POEMS.map((p) => ({ slug: p.slug }));
  // Cache Components needs at least one entry; the placeholder renders notFound().
  return params.length ? params : [{ slug: "_" }];
}

export async function generateMetadata({ params }: PageProps<"/sher/[slug]">): Promise<Metadata> {
  const poem = getPoem((await params).slug);
  if (!poem) return {};
  const poet = getPoet(poem.poet);
  return { title: `${poem.lines[0] ?? poem.title} — ${poet?.name ?? ""}`, description: poem.lines.slice(0, 2).join(" / ") };
}

export default async function PoemPage({ params }: PageProps<"/sher/[slug]">) {
  const poem = getPoem((await params).slug);
  if (!poem) notFound();
  const poet = getPoet(poem.poet);
  const meter = poemMeter(poem);
  const scan = scanPoem(poem.lines, metersForGenre(poem.genre));
  const more = poemsBy(poem.poet).filter((p) => p.slug !== poem.slug).slice(0, 5);

  return (
    <>
      <section className="frame px-4 sm:px-8 pt-10 pb-14">
        <Link href={poet ? `/devon/${poet.slug}` : "/devon"} className="text-sm text-gold hover:text-navy">
          ← {poet?.name ?? "Devon"}
        </Link>
        <div className="mt-4 grid gap-10 lg:grid-cols-[1.25fr_0.75fr]">
          <article>
            <div className="flex flex-wrap gap-2">
              <span className="chip">{poem.genre}</span>
              {meter && (
                <span className="chip" title={meter.fromSource ? "Manbada ko'rsatilgan" : "Aruz skaneri aniqlagan"}>
                  {meter.name}
                  {!meter.fromSource && " · skaner"}
                </span>
              )}
              {poem.collection && <span className="chip">{poem.collection}</span>}
            </div>
            <h1 className="mt-4 text-3xl sm:text-4xl leading-snug">{poem.lines[0] ?? poem.title}</h1>
            <p className="mt-1 text-ink-3">{poet?.name}</p>
            <div className="mt-8">
              <PoemText lines={poem.lines} poet={poet?.name ?? ""} />
            </div>
            {poem.truncated && <p className="mt-6 text-sm text-ink-3">She'rning boshlang'ich baytlari keltirildi.</p>}
            <p className="mt-8 text-xs text-ink-3">
              Matn manbasi:{" "}
              <a href={poem.sourceUrl} target="_blank" rel="noreferrer" className="underline break-all">
                {poem.sourceUrl}
              </a>
            </p>
          </article>
          <aside className="space-y-6">
            <div>
              <h2 className="text-2xl">Aruz tahlili</h2>
              <p className="mt-1 mb-4 text-sm text-ink-3">Barcha misralar avtomatik skanerlandi.</p>
              <AruzView scan={scan} compact />
            </div>
            {more.length > 0 && (
              <div className="card p-5">
                <h2 className="text-xl">{poet?.name} — yana</h2>
                <ul className="mt-3 space-y-2 text-sm">
                  {more.map((p) => (
                    <li key={p.slug}>
                      <Link href={`/sher/${p.slug}`} className="text-navy hover:underline">{p.lines[0] ?? p.title}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </aside>
        </div>
      </section>
    </>
  );
}
