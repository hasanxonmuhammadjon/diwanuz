import type { Metadata } from "next";
import Link from "next/link";
import { AruzTool } from "@/components/aruz-tool";
import { METERS } from "@/lib/aruz/meters";
import { metersForGenre, scanPoem } from "@/lib/aruz/scan";
import { POEMS, getPoet } from "@/content/poems";

export const metadata: Metadata = {
  title: "Aruz skaneri",
  description: "Mumtoz o'zbek she'rining aruz vaznini avtomatik aniqlaydigan skaner.",
};

/** Poems whose opening bayt the scanner recognises — used as one-click examples. */
function examples() {
  const out: { label: string; lines: string[] }[] = [];
  for (const p of POEMS) {
    if (out.length >= 6) break;
    const bayt = p.lines.slice(0, 2);
    const best = scanPoem(bayt).best;
    // Only offer examples the open scanner reads cleanly and agrees with the genre.
    if (bayt.length === 2 && best?.mismatches === 0 && best.failed === 0 && metersForGenre(p.genre).includes(best.meter)) {
      const poet = getPoet(p.poet)?.name.split(" ").pop() ?? "";
      out.push({ label: `${poet}: ${p.title.slice(0, 28)}…`, lines: bayt });
    }
  }
  return out;
}

export default function AruzPage() {
  return (
    <>
      <section className="frame px-4 sm:px-8 pt-10 pb-12">
        <p className="text-sm text-gold">Vosita</p>
        <h1 className="mt-1 text-4xl">Aruz skaneri</h1>
        <p className="mt-2 max-w-2xl text-ink-3">
          Baytni kiriting — skaner uni hijolarga bo'lib, cho'ziq (—) va qisqa (∪) hijolarni belgilaydi va
          {` ${METERS.length} `}ta mumtoz vazn ichidan eng mosini topadi.
        </p>
        <div className="mt-8">
          <AruzTool examples={examples()} />
        </div>
      </section>
      <div className="frame hatch" />
      <section id="vaznlar" className="frame px-4 sm:px-8 py-12">
        <h2 className="text-3xl">Vaznlar katalogi</h2>
        <p className="mt-2 text-ink-3">
          Chig'atoy she'riyatida eng ko'p qo'llangan vaznlar. Vazn nomini o'rganish uchun{" "}
          <Link href="/devon" className="text-navy underline">devondagi</Link> she'rlarni ham skanerlab ko'ring.
        </p>
        <div className="mt-6 overflow-x-auto card">
          <table className="w-full text-sm">
            <thead className="text-left text-ink-3">
              <tr className="border-b border-rail">
                <th className="px-4 py-3 font-semibold">Vazn</th>
                <th className="px-4 py-3 font-semibold">Afoil</th>
                <th className="px-4 py-3 font-semibold">Chizma</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-rail">
              {METERS.map((m) => (
                <tr key={m.id}>
                  <td className="px-4 py-3 align-top">
                    <p className="font-serif text-base text-navy">{m.name}</p>
                    {m.note && <p className="mt-0.5 text-xs text-ink-3">{m.note}</p>}
                  </td>
                  <td className="px-4 py-3 align-top italic text-gold">{m.afoil}</td>
                  <td className="px-4 py-3 align-top font-mono tracking-wider text-navy whitespace-nowrap">
                    {m.variants[0].pattern.replace(/-/g, "—").replace(/u/g, "∪")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
