import Link from "next/link";
import { AruzView } from "@/components/aruz-view";
import { FeatureTabs, type FeatureTab } from "@/components/home/feature-tabs";
import { HeroDemo } from "@/components/home/hero-demo";
import { METERS } from "@/lib/aruz/meters";
import { scanPoem } from "@/lib/aruz/scan";
import { latinToCyrillic } from "@/lib/translit/cyrillic";
import { MANUSCRIPTS } from "@/content/manuscripts";
import { POEMS, POETS, lifespan, poemsBy } from "@/content/poems";

const DEMO_BAYT = POEMS.find((p) => p.genre === "g'azal")?.lines.slice(0, 2) ?? [
  "Qaro ko'zum, kelu mardumlug' emdi fan qilg'il,",
  "Ko'zum qarosida mardum kibi vatan qilg'il.",
];

function ManuscriptPair() {
  const page = MANUSCRIPTS.flatMap((m) => m.pages).find((p) => p.reading);
  if (!page?.reading) {
    const first = MANUSCRIPTS[0];
    return (
      <div className="card overflow-hidden grid sm:grid-cols-2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={first?.pages[0]?.image} alt={first?.title ?? "Qo'lyozma"} className="h-full max-h-[460px] w-full object-cover object-top" />
        <div className="p-6 flex flex-col justify-center gap-3">
          <p className="font-serif text-xl text-navy">{first?.title}</p>
          <p className="text-sm text-ink-3">{first?.institution} · {first?.date}</p>
          <p className="text-sm text-ink-2">Sahifani Kotibga bering — satrlar arab yozuvida va lotin transliteratsiyasida yonma-yon chiqadi.</p>
          <Link href="/oqish" className="btn btn-navy w-fit text-sm">Ish joyida o'qish</Link>
        </div>
      </div>
    );
  }
  return (
    <div className="card overflow-hidden grid sm:grid-cols-2">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={page.image} alt="Qo'lyozma sahifasi" className="h-full max-h-[460px] w-full object-cover object-top" />
      <div className="p-5 space-y-2 max-h-[460px] overflow-hidden">
        {page.reading.lines.slice(0, 9).map((l, i) => (
          <div key={i}>
            <p className="arabic text-lg leading-snug text-ink">{l.arabic}</p>
            <p className="font-serif text-[0.95rem] text-navy">{l.latin}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function EditorMock() {
  const lines = MANUSCRIPTS.flatMap((m) => m.pages).find((p) => p.reading)?.reading?.lines.slice(0, 4) ?? [];
  return (
    <div className="card overflow-hidden">
      <div className="flex gap-2 border-b border-rail px-4 py-2.5 text-xs">
        <span className="chip">Chig'atoy</span>
        <span className="chip">nasta'liq</span>
        <span className="chip !text-ok !border-ok/40">2 ta tuzatish</span>
        <span className="ml-auto btn btn-navy !py-1 !px-2.5 text-xs">Datasetga yuborish</span>
      </div>
      <ol className="divide-y divide-rail">
        {(lines.length ? lines : DEMO_BAYT.map((l) => ({ arabic: "", latin: l }))).map((l, i) => (
          <li key={i} className={`grid grid-cols-[2rem_1fr] px-4 py-3 ${i === 1 ? "bg-cream-2" : ""}`}>
            <span className="text-xs text-ink-3 pt-1">{i + 1}</span>
            <div>
              {l.arabic && <p className="arabic text-lg text-ink">{l.arabic}</p>}
              <p className={`text-sm ${i === 1 ? "rounded border border-navy bg-paper px-2 py-1 text-ink" : "text-ink-2"}`}>{l.latin}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

function TranslitMock() {
  return (
    <div className="card p-6 space-y-5">
      {DEMO_BAYT.map((l) => (
        <div key={l} className="grid sm:grid-cols-2 gap-3 items-center">
          <p className="font-serif text-lg text-navy">{l}</p>
          <p className="font-serif text-lg text-ink-2">{latinToCyrillic(l)}</p>
        </div>
      ))}
      <p className="text-xs text-ink-3 border-t border-rail pt-3">
        Arab yozuvi → lotin (AI) → kirill (qoidaga asoslangan, 100% aniq). Har bir variant alohida eksport qilinadi.
      </p>
    </div>
  );
}

const GLOSSARY = [
  ["mardum", "ko'z qorachig'i; ayni paytda «odam» — iyhom san'ati"],
  ["fan", "hiyla, nayrang; hunar"],
  ["firoq", "ayriliq, judolik"],
  ["visol", "yorga yetishish, vasl"],
  ["sabo", "tong shabadasi — oshiq va yor o'rtasidagi elchi"],
  ["la'l", "qizil qimmatbaho tosh; yorning labi tashbehi"],
];

function GlossaryMock() {
  return (
    <div className="card p-6">
      <dl className="grid sm:grid-cols-2 gap-4">
        {GLOSSARY.map(([w, m]) => (
          <div key={w} className="rounded-lg border border-rail bg-cream/60 p-3">
            <dt className="font-serif text-lg text-navy">{w}</dt>
            <dd className="text-sm text-ink-2">{m}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

function DatasetMock() {
  return (
    <div className="card p-6 font-mono text-[0.8rem] leading-relaxed text-ink-2 overflow-x-auto">
      <pre>{`{
  "imageHash": "9f2c…",
  "language": "chagatai",
  "lines": [
    {
      "box": [112, 80, 168, 920],
      "aiLatin": "Qaro ko'zim kelu…",
      "latin":   "Qaro ko'zum, kelu…"   // inson tuzatdi
    }
  ]
}`}</pre>
    </div>
  );
}

const TABS: FeatureTab[] = [
  {
    id: "tanish",
    label: "Matnni tanish",
    title: "Matnni tanish",
    text: "Qo'lyozma sahifasini suratga oling yoki skanerdan yuklang. AI satrlarni topadi, nasta'liq va naskh xatini o'qiydi — chig'atoy, fors va arab tillarida.",
    points: ["Telefon surati ham yetarli", "Har bir satr tasvirdagi o'rni bilan bog'lanadi", "O'qib bo'lmagan joylar [...] bilan belgilanadi"],
    visual: <ManuscriptPair />,
  },
  {
    id: "muharrir",
    label: "Muharrir",
    title: "Muharrir",
    text: "AI xato qilsa — satr ustiga bosib tuzating. Tasvir va matn sinxron: satrni tanlasangiz, qo'lyozmadagi o'rni yonadi.",
    points: ["Arab yozuvi va lotin transliteratsiya yonma-yon", "Past ishonchli satrlar belgilanadi", "TXT, JSON va PAGE XML eksport"],
    visual: <EditorMock />,
  },
  {
    id: "translit",
    label: "Transliteratsiya",
    title: "Uch yozuvda",
    text: "Bir sahifa — uch xil o'quvchi uchun: asl arab yozuvi, ilmiy nashrlardagi lotin transliteratsiya va keng kitobxon uchun kirill.",
    points: ["Navoiy nashrlari an'anasidagi imlo", "Lotin ↔ kirill bir bosishda", "Har biri alohida eksport"],
    visual: <TranslitMock />,
  },
  {
    id: "aruz",
    label: "Aruz skaneri",
    title: "Aruz skaneri",
    text: "Baytni hijolarga ajratadi, cho'ziq va qisqa hijolarni belgilaydi va vaznini aniqlaydi. Vasl (ulanish) va o'ta cho'ziq hijolarni hisobga oladi.",
    points: [`${METERS.length} ta mumtoz vazn katalogi`, "Vazndan chetlashgan hija qizil bilan ko'rsatiladi", "AI emas — tekshirsa bo'ladigan algoritm"],
    visual: <AruzView scan={scanPoem(DEMO_BAYT)} compact />,
  },
  {
    id: "izoh",
    label: "Lug'at va izoh",
    title: "Lug'at va izoh",
    text: "Eski so'zlar ma'nosi, baytning nasriy bayoni va undagi badiiy san'atlar — talaba ham, oddiy kitobxon ham mumtoz she'rni tushunsin.",
    points: ["Nasriy bayon bugungi tilda", "Tashbeh, tajnis, iyhom va boshqa san'atlar", "AI izohi «tekshirilmagan» deb belgilanadi"],
    visual: <GlossaryMock />,
  },
  {
    id: "dataset",
    label: "Ochiq dataset",
    title: "Har bir tuzatish — kelajak modeli uchun",
    text: "Foydalanuvchi tuzatgan har bir satr «rasm + to'g'ri matn» juftligi sifatida ochiq datasetga tushadi. Bu — chig'atoy qo'lyozmalari uchun birinchi ochiq HTR datasetining poydevori.",
    points: ["CC BY 4.0 litsenziyasi", "AI varianti va inson tuzatishi birga saqlanadi", "JSON formatda yuklab olish"],
    visual: <DatasetMock />,
  },
];

const SHOWCASE_IMAGES = [
  "/manuscripts/navoiy-met-1499-p1.jpg",
  "/manuscripts/navoiy-princeton-66g-p3.jpg",
  "/manuscripts/navoiy-berlin-4054-p2.jpg",
];

const SHOWCASE = [
  {
    label: "Sharqshunoslar va tadqiqotchilar uchun",
    title: "Skanerdan iqtibos qilinadigan matngacha",
    text: "Qo'lyozma nusxalarini tez o'qing, tuzating va PAGE XML formatida boshqa ilmiy vositalarga o'tkazing.",
    href: "/oqish",
    cta: "Qo'lyozma o'qish",
  },
  {
    label: "Talaba va o'qituvchilar uchun",
    title: "Mumtoz she'rni tushunib o'qish",
    text: "Devondagi har bir she'r — lotin va kirill yozuvida, aruz tahlili va eski so'zlar izohi bilan.",
    href: "/devon",
    cta: "Devonni ochish",
  },
  {
    label: "Arxiv va kutubxonalar uchun",
    title: "Har bir varaqni qidiriladigan qilish",
    text: "Fondlardagi qo'lyozmalarni raqamlashtiring va matni bilan birga ochiq to'plam sifatida e'lon qiling.",
    href: "/qolyozmalar",
    cta: "To'plamni ko'rish",
  },
];

export default function Home() {
  const featuredPoets = POETS.slice(0, 6);
  return (
    <>
      {/* Hero */}
      <section className="frame relative overflow-hidden px-4 sm:px-8 pt-14 pb-12">
        <div className="absolute inset-0 dotgrid opacity-60" aria-hidden="true" />
        <div className="relative text-center">
          <h1 className="text-[2.6rem] sm:text-6xl leading-tight">
            O'tmishni <span className="text-sky">AI</span> bilan o'qing
          </h1>
          <p className="mx-auto mt-4 max-w-2xl font-serif text-lg sm:text-xl italic text-ink-3">
            Qo'lyozma merosimiz uchun ochiq platforma — chig'atoy, fors va arab yozuvidagi sahifalarni o'qiydi,
            lotin yozuviga o'giradi va aruz vaznini aniqlaydi.
          </p>
        </div>
        <div className="relative mx-auto mt-10 max-w-5xl">
          <HeroDemo />
        </div>
        <div className="relative mt-6 flex flex-wrap justify-center gap-3">
          <Link href="/oqish" className="btn btn-navy">Bepul boshlash</Link>
          <Link href="/qolyozmalar" className="btn btn-white">Imkoniyatlarni ko'rish</Link>
        </div>
      </section>

      <div className="frame hatch" />

      {/* Tagline + stats */}
      <section className="frame grid gap-10 px-4 sm:px-8 py-14 lg:grid-cols-[1fr_1.2fr] items-center">
        <div>
          <h2 className="text-3xl sm:text-4xl leading-snug">O'tmish yo'qolmagan — uni shunchaki o'qib bo'lmasdi.</h2>
          <p className="mt-4 text-ink-2 leading-relaxed">
            O'zbekiston fondlarida o'n minglab qo'lyozma saqlanadi, lekin ularni eski yozuvda o'qiy oladiganlar kam.
            DiwanUz bu sahifalarni hamma o'qiy oladigan, qidiriladigan matnga aylantiradi.
          </p>
        </div>
        <dl className="grid grid-cols-2 gap-y-8">
          {[
            [`${METERS.length}`, "aruz vazni katalogda"],
            ["3", "til: chig'atoy, fors, arab"],
            [`${POEMS.length || "40+"}`, "she'r devonda"],
            ["5", "eksport formati, PAGE XML bilan"],
          ].map(([n, l]) => (
            <div key={l} className="border-l border-sand pl-5">
              <dt className="sr-only">{l}</dt>
              <dd className="font-serif text-4xl text-navy">{n}</dd>
              <dd className="mt-1 text-sm text-ink-3">{l}</dd>
            </div>
          ))}
        </dl>
      </section>

      <div className="frame hatch" />

      {/* Platform tabs */}
      <section className="frame pt-14">
        <div className="px-4 text-center">
          <h2 className="text-3xl sm:text-4xl">Qo'lyozmalar uchun to'liq platforma</h2>
          <p className="mx-auto mt-3 max-w-xl text-ink-3">
            Avtomatik o'qishdan ochiq nashrgacha — hammasi bitta ish joyida.
          </p>
        </div>
        <div className="mt-10">
          <FeatureTabs tabs={TABS} />
        </div>
      </section>

      <div className="frame hatch" />

      {/* Audiences */}
      <section className="frame divide-y divide-rail">
        {SHOWCASE.map((s, i) => (
          <div key={s.label} className={`grid gap-6 px-4 sm:px-8 py-12 md:grid-cols-2 items-center ${i % 2 ? "md:[&>*:first-child]:order-2" : ""}`}>
            <div>
              <p className="text-sm text-gold">{s.label}</p>
              <h2 className="mt-2 text-3xl sm:text-4xl">{s.title}</h2>
              <p className="mt-3 text-ink-2 leading-relaxed max-w-md">{s.text}</p>
              <Link href={s.href} className="mt-5 inline-flex items-center gap-1 font-semibold text-navy hover:underline">
                {s.cta} →
              </Link>
            </div>
            <div className="card overflow-hidden h-48 sm:h-64">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={SHOWCASE_IMAGES[i] ?? SHOWCASE_IMAGES[0]}
                alt=""
                className="h-full w-full object-cover object-center"
              />
            </div>
          </div>
        ))}
      </section>

      <div className="frame hatch" />

      {/* Devon preview */}
      {featuredPoets.length > 0 && (
        <section className="frame px-4 sm:px-8 py-14">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-3xl sm:text-4xl">Devon: mumtoz shoirlar</h2>
              <p className="mt-2 text-ink-3">She'rlarni shoir, janr va vazn bo'yicha o'qing.</p>
            </div>
            <Link href="/devon" className="btn btn-white">Barcha shoirlar</Link>
          </div>
          <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featuredPoets.map((p) => (
              <li key={p.slug}>
                <Link href={`/devon/${p.slug}`} className="card block p-5 hover:border-navy transition-colors">
                  <p className="font-serif text-xl text-navy">{p.name}</p>
                  <p className="mt-1 text-sm text-ink-3">
                    {lifespan(p)} · {p.era}
                  </p>
                  <p className="mt-3 text-xs text-gold">{poemsBy(p.slug).length} ta she'r</p>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Banner */}
      <section className="frame px-4 sm:px-8 py-6">
        <div className="rounded-2xl bg-navy px-6 sm:px-10 py-10 grid gap-6 md:grid-cols-[1fr_auto] items-center">
          <h2 className="text-2xl sm:text-3xl text-white">
            Yangi: Aruz skaneri baytning vaznini soniyalarda aniqlaydi
          </h2>
          <Link href="/aruz" className="btn btn-white">Skanerni sinash</Link>
        </div>
      </section>

      {/* Trust */}
      <section className="frame px-4 sm:px-8 py-14">
        <h2 className="text-3xl sm:text-4xl text-center">Jamoa bilan o'sadigan platforma</h2>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {[
            ["Ma'lumotingiz sizniki", "Yuklagan rasmingiz faqat siz «Datasetga yuborish»ni bossangiz saqlanadi. Aks holda faqat o'qish uchun ishlatiladi."],
            ["Har tuzatish modelni kuchaytiradi", "Inson tuzatgan satrlar o'zbek qo'lyozmalari uchun o'z HTR modelimizni o'qitishga xizmat qiladi."],
            ["Ochiq va erkin", "Dataset CC BY 4.0, eksport formatlari xalqaro standartda — hech qanday yopiq formatga bog'lanib qolmaysiz."],
          ].map(([t, d]) => (
            <div key={t} className="card p-6">
              <h3 className="text-xl">{t}</h3>
              <p className="mt-2 text-sm text-ink-2 leading-relaxed">{d}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="frame hatch" />

      {/* CTA */}
      <section className="frame px-4 sm:px-8 py-16 text-center">
        <h2 className="text-4xl sm:text-5xl">O'tmish sizni kutmoqda.</h2>
        <p className="mx-auto mt-3 max-w-lg text-ink-3">
          Bugunoq qo'lyozma o'qishni boshlang. Ro'yxatdan o'tish shart emas.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link href="/oqish" className="btn btn-navy">Bepul boshlash</Link>
          <Link href="/loyiha" className="btn btn-ghost">Loyiha haqida</Link>
        </div>
      </section>
    </>
  );
}
