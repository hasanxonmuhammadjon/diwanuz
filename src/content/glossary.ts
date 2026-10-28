// Small glossary of classical (Chagatai / Persian-Arabic) words common in the divans.
// Used for inline hints on poem pages; the AI "Izoh" button covers everything else.

export const GLOSSARY: Record<string, string> = {
  ishq: "kuchli muhabbat",
  oshiq: "sevuvchi, ishq ahli",
  "ma'shuq": "sevilgan, yor",
  visol: "yorga yetishish",
  vasl: "yorga yetishish, visol",
  hijron: "ayriliq, yordan uzoqlik",
  hajr: "ayriliq, hijron",
  firoq: "ayriliq, judolik",
  furqat: "ayriliq, judolik",
  "ko'ngul": "ko'ngil, qalb",
  dil: "ko'ngil (forscha)",
  mardum: "ko'z qorachig'i; ayni paytda «odam»",
  "la'l": "qizil qimmatbaho tosh; yor labi tashbehi",
  zulf: "soch, kokil",
  xol: "yuzdagi qora xol",
  "g'amza": "noz bilan qarash",
  jafo: "zulm, azob",
  vafo: "sadoqat, ahdga sodiqlik",
  sabo: "tong shabadasi",
  sarv: "sarv daraxti; tik qomat tashbehi",
  may: "sharob; tasavvufda ilohiy ishq ramzi",
  soqiy: "may quyuvchi; tasavvufda murshid ramzi",
  rind: "zohiriy taqvodan yiroq, erkin fikrli kishi",
  zohid: "zohiriy ibodatga berilgan taqvodor",
  dahr: "zamona, dunyo",
  falak: "osmon; taqdir",
  charx: "falak, aylanuvchi osmon",
  "ag'yor": "begonalar, raqiblar",
  raqib: "oshiqning raqibi",
  mahvash: "oyday go'zal",
  husn: "go'zallik",
  jamol: "go'zallik, chiroy",
  oraz: "yuz, chehra",
  ruxsor: "yuz, yonoq",
  chashm: "ko'z (forscha)",
  ashk: "ko'z yoshi",
  sirishk: "ko'z yoshi",
  nola: "faryod, ingrash",
  "afg'on": "faryod, nola",
  mehnat: "mashaqqat, azob",
  emdi: "endi",
  kibi: "kabi",
  birla: "bilan",
  bila: "bilan",
  erur: "-dir, ekan (bog'lama)",
  ermas: "emas",
  emish: "ekan",
  "o'zga": "boshqa",
  nechuk: "qanday; nega",
  qayu: "qaysi",
  mahzun: "g'amgin",
  devona: "telba; ishqda o'zini yo'qotgan",
  xirad: "aql",
  "ko'y": "ko'cha, mahalla (yor ko'yi)",
  fan: "hiyla, nayrang; hunar",
  bazm: "ziyofat, majlis",
  nogah: "birdan, to'satdan",
  "sarg'ardon": "sarson, adashgan",
  farzona: "oqil, dono",
  "g'urbat": "g'ariblik, musofirlik",
  "g'arib": "musofir, yurtidan uzoqdagi",
};

const SUFFIXES = ["", "ning", "ni", "ga", "g'a", "qa", "ka", "da", "dan", "din", "im", "ing", "i", "in", "lar", "larning", "u", "yu", "dek"];

export function glossaryLookup(rawWord: string): { word: string; meaning: string } | null {
  const w = rawWord.toLowerCase().replace(/[‘’ʻʼ`]/g, "'").replace(/[^a-z']/g, "");
  if (w.length < 2) return null;
  for (const suf of SUFFIXES) {
    if (suf && !w.endsWith(suf)) continue;
    const base = suf ? w.slice(0, -suf.length) : w;
    if (GLOSSARY[base]) return { word: base, meaning: GLOSSARY[base] };
  }
  return null;
}
