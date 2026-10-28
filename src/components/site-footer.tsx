import Link from "next/link";
import { Logo } from "./logo";

const COLUMNS = [
  {
    title: "Platforma",
    links: [
      { href: "/oqish", label: "Qo'lyozma o'qish" },
      { href: "/qolyozmalar", label: "Qo'lyozmalar to'plami" },
      { href: "/aruz", label: "Aruz skaneri" },
      { href: "/dataset", label: "Ochiq dataset" },
    ],
  },
  {
    title: "Devon",
    links: [
      { href: "/devon", label: "Shoirlar" },
      { href: "/devon?janr=g'azal", label: "G'azallar" },
      { href: "/devon?janr=ruboiy", label: "Ruboiylar" },
      { href: "/aruz#vaznlar", label: "Aruz vaznlari" },
    ],
  },
  {
    title: "Kimlar uchun",
    links: [
      { href: "/loyiha#auditoriya", label: "Sharqshunoslar" },
      { href: "/loyiha#auditoriya", label: "Talaba va o'qituvchilar" },
      { href: "/loyiha#auditoriya", label: "Arxiv va kutubxonalar" },
      { href: "/loyiha#auditoriya", label: "Dasturchilar" },
    ],
  },
  {
    title: "Loyiha",
    links: [
      { href: "/loyiha", label: "G'oya va innovatsiya" },
      { href: "/loyiha#analoglar", label: "Analoglardan farqi" },
      { href: "/loyiha#smeta", label: "Xarajatlar smetasi" },
      { href: "/loyiha#natijalar", label: "Kutilayotgan natijalar" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-rail bg-paper">
      <div className="mx-auto max-w-[1320px] px-4 sm:px-6 py-14 grid gap-10 md:grid-cols-[1.3fr_repeat(4,1fr)]">
        <div className="space-y-4">
          <Logo />
          <p className="text-sm leading-relaxed text-ink-3 max-w-xs">
            Qo'lyozma merosimizni o'qiladigan, qidiriladigan va hamma uchun ochiq qiladigan platforma.
          </p>
          <Link href="/oqish" className="btn btn-navy text-sm">
            Qo'lyozma yuklash
          </Link>
        </div>
        {COLUMNS.map((c) => (
          <div key={c.title}>
            <h3 className="font-sans text-sm font-semibold text-navy mb-3">{c.title}</h3>
            <ul className="space-y-2 text-sm">
              {c.links.map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="text-ink-3 hover:text-navy">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-rail">
        <div className="mx-auto max-w-[1320px] px-4 sm:px-6 py-5 flex flex-wrap gap-3 justify-between text-xs text-ink-3">
          <span>DiwanUz · Toshkent davlat sharqshunoslik universiteti · «Eng innovatsion g'oya» tanlovi uchun</span>
          <span>Qo'lyozma tasvirlari ochiq litsenziyali manbalardan olingan</span>
        </div>
      </div>
    </footer>
  );
}
