import type { Metadata } from "next";
import Link from "next/link";
import { METERS } from "@/lib/aruz/meters";

export const metadata: Metadata = {
  title: "Loyiha haqida",
  description: "DiwanUz — «Eng innovatsion g'oya» tanlovi uchun: muammo, yechim, analoglardan farqi, smeta va kutilayotgan natijalar.",
};

// Fill in before submitting.
const TEAM = {
  author: "[Ism Familiya]",
  faculty: "[Fakultet, kurs]",
  supervisor: "[Ilmiy rahbar]",
  contact: "[Telegram / e-pochta]",
};

const CRITERIA = [
  { href: "#yangilik", n: "1", title: "Ilmiy va innovatsion yangiligi", text: "Chig'atoy qo'lyozmalari uchun birinchi ochiq AI o'qish platformasi va aruz skaneri." },
  { href: "#dolzarblik", n: "2", title: "Dolzarbligi", text: "Fondlardagi qo'lyozmalarni o'qiy oladigan mutaxassislar kam, qo'lda transkripsiya juda sekin." },
  { href: "#analoglar", n: "3", title: "Analoglardan farqi", text: "Chig'atoy + o'zbek transliteratsiya + aruz + ochiq dataset — bitta joyda." },
  { href: "#smeta", n: "4", title: "Xarajatlar smetasi", text: "Grant mablag'ining asosiy qismi datasetga va model o'qitishga sarflanadi." },
  { href: "#natijalar", n: "5", title: "Kutilayotgan natijalar", text: "Ochiq dataset, o'z HTR modelimiz, hamkor arxivlar, ta'lim vositasi." },
];

type Mark = "ha" | "yo'q" | "qisman";
const ANALOGS: { name: string; note: string; cells: Mark[] }[] = [
  { name: "DiwanUz", note: "bizning loyiha", cells: ["ha", "ha", "ha", "ha", "ha", "ha"] },
  { name: "Transkribus", note: "Avstriya, HTR platformasi", cells: ["qisman", "yo'q", "yo'q", "qisman", "yo'q", "qisman"] },
  { name: "eScriptorium / Kraken", note: "ochiq HTR vositasi", cells: ["qisman", "yo'q", "yo'q", "ha", "yo'q", "ha"] },
  { name: "Umumiy OCR (Google Lens va b.)", note: "bosma matn uchun", cells: ["qisman", "yo'q", "yo'q", "yo'q", "qisman", "ha"] },
  { name: "aldiwan.net", note: "arab she'riyati ensiklopediyasi", cells: ["yo'q", "yo'q", "qisman", "yo'q", "yo'q", "ha"] },
  { name: "ziyouz.uz", note: "o'zbek adabiyoti kutubxonasi", cells: ["yo'q", "ha", "yo'q", "yo'q", "ha", "ha"] },
];
const ANALOG_COLS = [
  "Chig'atoy qo'lyozmasini o'qish",
  "O'zbek lotin / kirill matn",
  "Aruz tahlili",
  "Ochiq dataset / ochiq kod",
  "O'zbek tilidagi interfeys",
  "Bepul foydalanish",
];

const BUDGET_1 = [
  ["Sahifalarni transkripsiya qilish va tekshirish (talabalar): 1 500 sahifa × 12 000 so'm", 18_000_000],
  ["Sharqshunos-mutaxassis ekspertizasi (dataset sifati): 6 oy × 1 500 000 so'm", 9_000_000],
  ["Model o'qitish uchun bulutli GPU ijarasi (~300 soat)", 8_000_000],
  ["Server, ma'lumotlar bazasi va domen (12 oy)", 4_800_000],
  ["Kitob skaneri / suratga olish stendi", 6_000_000],
  ["OTMlarda 4 ta master-klass va targ'ibot", 2_200_000],
  ["Kutilmagan xarajatlar (4%)", 2_000_000],
] as const;

const BUDGET_2 = [
  ["Datasetni kengaytirish: 20 000 sahifa transkripsiya va ekspert tekshiruvi", 200_000_000],
  ["Chig'atoy HTR modelini o'qitish va baholash (GPU, ML muhandis, 12 oy)", 120_000_000],
  ["Mobil ilova (Android / iOS) — telefonda suratga olib o'qish", 60_000_000],
  ["Infratuzilma: server, zaxira nusxa, xavfsizlik (2 yil)", 40_000_000],
  ["Arxiv va kutubxonalar bilan hamkorlik: raqamlashtirish uskunalari va safarlar", 50_000_000],
  ["Ilmiy maqolalar, konferensiyalar, targ'ibot", 15_000_000],
  ["Kutilmagan xarajatlar (3%)", 15_000_000],
] as const;

const som = (n: number) => n.toLocaleString("ru-RU").replace(/,/g, " ") + " so'm";

function Budget({ title, rows }: { title: string; rows: readonly (readonly [string, number])[] }) {
  const total = rows.reduce((a, [, v]) => a + v, 0);
  return (
    <div className="card overflow-hidden">
      <h3 className="border-b border-rail px-5 py-4 text-xl">{title}</h3>
      <table className="w-full text-sm">
        <tbody className="divide-y divide-rail">
          {rows.map(([item, v]) => (
            <tr key={item}>
              <td className="px-5 py-3 text-ink-2">{item}</td>
              <td className="px-5 py-3 text-right tabular-nums text-navy whitespace-nowrap">{som(v)}</td>
            </tr>
          ))}
          <tr className="bg-cream-2">
            <td className="px-5 py-3 font-semibold text-navy">Jami</td>
            <td className="px-5 py-3 text-right font-semibold tabular-nums text-navy whitespace-nowrap">{som(total)}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

function Cell({ v }: { v: Mark }) {
  const style = v === "ha" ? "text-ok" : v === "qisman" ? "text-gold" : "text-ink-3";
  const sign = v === "ha" ? "✓" : v === "qisman" ? "◐" : "—";
  return (
    <td className={`px-3 py-3 text-center ${style}`}>
      <span aria-hidden="true">{sign}</span>
      <span className="sr-only">{v}</span>
    </td>
  );
}

export default function ProjectPage() {
  return (
    <>
      <section className="frame px-4 sm:px-8 pt-12 pb-12">
        <p className="text-sm text-gold">«Eng innovatsion g'oya» tanlovi · Toshkent davlat sharqshunoslik universiteti</p>
        <h1 className="mt-2 text-4xl sm:text-5xl leading-tight max-w-4xl">
          DiwanUz — o'zbek qo'lyozmalarini sun'iy intellekt bilan o'qiydigan ochiq platforma
        </h1>
        <p className="mt-4 max-w-3xl text-lg text-ink-2 leading-relaxed">
          Qo'lyozma sahifasini suratga oling — DiwanUz satrlarni topadi, arab yozuvini o'qiydi, lotin va kirill
          yozuviga o'giradi, she'r bo'lsa aruz vaznini aniqlaydi. Har bir inson tuzatishi chig'atoy xati uchun ochiq
          datasetga qo'shiladi va o'z AI modelimizni o'qitishga xizmat qiladi.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/oqish" className="btn btn-navy">Jonli demoni ochish</Link>
          <Link href="/aruz" className="btn btn-white">Aruz skaneri</Link>
        </div>
        <ol className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {CRITERIA.map((c) => (
            <li key={c.n}>
              <a href={c.href} className="card block h-full p-4 hover:border-navy transition-colors">
                <span className="font-serif text-2xl text-gold">{c.n}</span>
                <p className="mt-1 font-semibold text-navy text-sm">{c.title}</p>
                <p className="mt-1 text-xs text-ink-3 leading-relaxed">{c.text}</p>
              </a>
            </li>
          ))}
        </ol>
      </section>

      <div className="frame hatch" />

      <section id="dolzarblik" className="frame px-4 sm:px-8 py-12 grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
        <div>
          <p className="text-sm text-gold">2-mezon</p>
          <h2 className="mt-1 text-3xl">Muammo va dolzarblik</h2>
        </div>
        <div className="space-y-4 text-ink-2 leading-relaxed">
          <p>
            O'zbekiston kutubxona va institut fondlarida o'n minglab sharq qo'lyozmalari saqlanadi. 1929-yildan
            o'zbek yozuvi avval lotin, 1940-yildan kirill alifbosiga o'tgach, arab yozuvidagi matnlarni o'qiy
            oladiganlar doirasi tor mutaxassislar bilan cheklanib qoldi.
          </p>
          <p>
            Bitta sahifani qo'lda transkripsiya qilish mutaxassisdan soatlab vaqt oladi. Umumiy OCR vositalari bosma
            matnga mo'ljallangan, nasta'liq xatidagi qo'lyozmalarni esa yaxshi o'qimaydi. Chig'atoy tili uchun ochiq
            HTR (qo'lyozma matnini tanish) modeli va uni o'qitish uchun ochiq dataset hozircha yo'q.
          </p>
          <p>
            Natijada meros raqamli ko'rinishda saqlansa ham, matn sifatida qidirib bo'lmaydi, talabalar va keng
            kitobxon esa undan foydalana olmaydi.
          </p>
        </div>
      </section>

      <div className="frame hatch" />

      <section id="yangilik" className="frame px-4 sm:px-8 py-12">
        <p className="text-sm text-gold">1-mezon</p>
        <h2 className="mt-1 text-3xl">Ilmiy va innovatsion yangiligi</h2>
        <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {[
            ["Chig'atoy uchun AI o'quvchi", "Multimodal AI qo'lyozma sahifasini satrlarga ajratadi, arab yozuvini o'qiydi va Navoiy nashrlari an'anasidagi lotin imlosiga o'giradi."],
            ["Tasvir ↔ matn bog'lanishi", "Har bir satr qo'lyozmadagi koordinatasi bilan saqlanadi: tadqiqotchi matndan tasvirga bir bosishda o'tadi. Eksport xalqaro PAGE XML standartida."],
            [`Aruz skaneri (${METERS.length} vazn)`, "Hijolarga ajratish, vasl va o'ta cho'ziq hijolarni hisobga oluvchi, natijasi tekshiriladigan algoritm — AI emas, avtomatik testlar bilan qoplangan."],
            ["Ma'lumotlar g'ildiragi", "Har bir inson tuzatishi «rasm + to'g'ri matn» juftligi sifatida ochiq datasetga tushadi — bu chig'atoy HTR modelini o'qitish uchun poydevor."],
            ["Uch yozuvda natija", "Bir sahifa — asl arab yozuvi, ilmiy lotin transliteratsiya va kirill. Ham mutaxassis, ham keng kitobxon uchun."],
            ["Tushunib o'qish", "Eski so'zlar lug'ati, baytning nasriy bayoni va badiiy san'atlar tahlili — mumtoz she'rni talabaga yaqinlashtiradi."],
          ].map(([t, d]) => (
            <div key={t} className="card p-5">
              <h3 className="text-xl">{t}</h3>
              <p className="mt-2 text-sm text-ink-2 leading-relaxed">{d}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="frame hatch" />

      <section id="analoglar" className="frame px-4 sm:px-8 py-12">
        <p className="text-sm text-gold">3-mezon</p>
        <h2 className="mt-1 text-3xl">Mavjud analoglardan farqi</h2>
        <p className="mt-2 max-w-3xl text-ink-3">
          Mavjud vositalar yo umumiy (har qanday til, lekin chig'atoyga moslashmagan), yo faqat matn kutubxonasi.
          DiwanUz ularning kuchli tomonlarini o'zbek merosi uchun birlashtiradi.
        </p>
        <div className="mt-6 card overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr className="border-b border-rail text-left text-ink-3">
                <th className="px-4 py-3 font-semibold">Platforma</th>
                {ANALOG_COLS.map((c) => (
                  <th key={c} className="px-3 py-3 text-center font-semibold">{c}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-rail">
              {ANALOGS.map((a) => (
                <tr key={a.name} className={a.name === "DiwanUz" ? "bg-cream-2" : ""}>
                  <td className="px-4 py-3">
                    <p className="font-semibold text-navy">{a.name}</p>
                    <p className="text-xs text-ink-3">{a.note}</p>
                  </td>
                  {a.cells.map((v, i) => (
                    <Cell key={i} v={v} />
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-ink-3">
          ✓ bor · ◐ qisman (masalan, arab yozuvi uchun umumiy modellar bor, lekin chig'atoyga ixtisoslashgan ochiq
          model yo'q yoki pullik kredit tizimi) · — yo'q. 2026-yil oktyabr holatiga ko'ra.
        </p>
      </section>

      <div className="frame hatch" />

      <section id="smeta" className="frame px-4 sm:px-8 py-12">
        <p className="text-sm text-gold">4-mezon</p>
        <h2 className="mt-1 text-3xl">Xarajatlar smetasi</h2>
        <p className="mt-2 max-w-3xl text-ink-3">
          Mablag'ning asosiy qismi texnologiyaga emas, ma'lumotga — inson tomonidan tekshirilgan datasetga sarflanadi.
          Platformaning o'zi bepul AI va ochiq vositalar asosida qurilgan, shu sababli joriy xarajati past.
        </p>
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <Budget title="1-bosqich: OTM granti (50 mln so'm)" rows={BUDGET_1} />
          <Budget title="2-bosqich: Respublika bosqichi (500 mln so'm)" rows={BUDGET_2} />
        </div>
        <p className="mt-3 text-xs text-ink-3">Taxminiy hisob-kitob; bozor narxlariga ko'ra aniqlashtiriladi.</p>
      </section>

      <div className="frame hatch" />

      <section id="natijalar" className="frame px-4 sm:px-8 py-12">
        <p className="text-sm text-gold">5-mezon</p>
        <h2 className="mt-1 text-3xl">Kutilayotgan natijalar</h2>
        <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {[
            ["6 oy", "1 500 sahifa", "inson tekshirgan ochiq dataset (taxminan 25–30 ming satr)"],
            ["12 oy", "O'z HTR modeli", "chig'atoy nasta'liqi uchun; belgi xatosi (CER) umumiy modeldan past bo'lishi maqsad"],
            ["12 oy", "3 ta hamkor", "arxiv, kutubxona yoki ilmiy institut bilan raqamlashtirish"],
            ["12 oy", "1 000+ foydalanuvchi", "talabalar, o'qituvchilar va tadqiqotchilar"],
          ].map(([when, what, d]) => (
            <div key={what} className="card p-5">
              <p className="text-xs text-gold">{when}</p>
              <p className="mt-1 font-serif text-2xl text-navy">{what}</p>
              <p className="mt-2 text-sm text-ink-2">{d}</p>
            </div>
          ))}
        </div>
        <div className="mt-8 grid gap-6 md:grid-cols-3 text-sm text-ink-2 leading-relaxed">
          <div>
            <h3 className="text-xl">Ilmiy natija</h3>
            <p className="mt-2">Chig'atoy qo'lyozmalari uchun birinchi ochiq HTR dataseti va modeli; ilmiy maqolalar.</p>
          </div>
          <div>
            <h3 className="text-xl">Ijtimoiy natija</h3>
            <p className="mt-2">Mumtoz merosni keng kitobxonga ochish; sharqshunoslik talabalari uchun amaliy o'quv vositasi.</p>
          </div>
          <div>
            <h3 className="text-xl">Iqtisodiy natija</h3>
            <p className="mt-2">Arxivlar uchun raqamlashtirish xizmati va API — loyihaning o'zini o'zi qoplash manbai.</p>
          </div>
        </div>
      </section>

      <div className="frame hatch" />

      <section id="auditoriya" className="frame px-4 sm:px-8 py-12 grid gap-10 lg:grid-cols-2">
        <div>
          <h2 className="text-3xl">Kimlar uchun</h2>
          <ul className="mt-5 space-y-3 text-ink-2">
            <li><b className="text-navy">Sharqshunoslar va matnshunoslar</b> — tezkor transkripsiya va PAGE XML eksport.</li>
            <li><b className="text-navy">Talaba va o'qituvchilar</b> — qo'lyozma o'qishni o'rganish, aruz va izohlar.</li>
            <li><b className="text-navy">Arxiv va kutubxonalar</b> — fondlarni qidiriladigan matnga aylantirish.</li>
            <li><b className="text-navy">Dasturchilar</b> — ochiq dataset va JSON API.</li>
          </ul>
        </div>
        <div>
          <h2 className="text-3xl">Yo'l xaritasi</h2>
          <ol className="mt-5 space-y-3 text-ink-2">
            <li><b className="text-navy">2026 IV chorak</b> — ishlaydigan prototip (shu sayt): AI o'qish, muharrir, aruz, dataset.</li>
            <li><b className="text-navy">2027 I chorak</b> — TDSHU talabalari bilan pilot: 1 500 sahifa transkripsiyasi.</li>
            <li><b className="text-navy">2027 II–III chorak</b> — o'z HTR modelini o'qitish va umumiy model bilan solishtirish.</li>
            <li><b className="text-navy">2027 IV chorak</b> — mobil ilova, hamkor arxivlar bilan keng ko'lamli raqamlashtirish.</li>
          </ol>
        </div>
      </section>

      <div className="frame hatch" />

      <section className="frame px-4 sm:px-8 py-12">
        <h2 className="text-3xl">Muallif</h2>
        <dl className="mt-5 card p-5 grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-sm max-w-xl">
          <dt className="text-ink-3">Muallif</dt><dd className="text-navy">{TEAM.author}</dd>
          <dt className="text-ink-3">Fakultet</dt><dd className="text-navy">{TEAM.faculty}</dd>
          <dt className="text-ink-3">Ilmiy rahbar</dt><dd className="text-navy">{TEAM.supervisor}</dd>
          <dt className="text-ink-3">Aloqa</dt><dd className="text-navy">{TEAM.contact}</dd>
        </dl>
        <p className="mt-6 text-sm text-ink-3">
          Texnologiyalar: Next.js, multimodal AI (Gemini), o'z aruz algoritmi, PostgreSQL, PAGE XML standarti.
        </p>
      </section>
    </>
  );
}
