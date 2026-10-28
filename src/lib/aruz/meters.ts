// Catalogue of aruz metres common in Chagatai/Uzbek classical poetry.
// Patterns: "-" long (cho'ziq) hija, "u" short (qisqa) hija; feet separated by spaces.
// The last position of every misra is treated as free (anceps) when scanning.

export interface MeterVariant {
  pattern: string;
  feet: string[];
  /** Full name when variants of one entry carry their own names (ruboiy). */
  name?: string;
}

export interface Meter {
  id: string;
  name: string;
  family: "ramal" | "hazaj" | "rajaz" | "mutaqorib" | "muzore" | "mujtass" | "sare" | "xafif";
  afoil: string;
  variants: MeterVariant[];
  note?: string;
}

const v = (pattern: string, feet: string, name?: string): MeterVariant => ({ pattern, feet: feet.split(" "), name });

const FOOT: Record<string, string> = {
  "--u": "maf'uvlu", "---": "maf'uvlun", "u--u": "mafoiylu", "u-u-": "mafoilun",
  "u---": "mafoiylun", "-u-": "foilun", "--": "fa'lun", "u-": "faal", "-": "fa'",
};

// The twelve ruboiy forms (the other twelve of the traditional 24 only add a
// final short syllable). Source: F. Pritchett, "A Desertful of Roses", meters §6.3.
const RUBOIY: [string, string][] = [
  ["--u u--u u--u u-", "axrabi makfufi majbub"],
  ["--u u--u u--- -", "axrabi makfufi abtar"],
  ["--u u-u- u--- -", "axrabi maqbuzi abtar"],
  ["--u u-u- u--u u-", "axrabi maqbuzi makfufi majbub"],
  ["--- -u- u--u u-", "axrami ashtari makfufi majbub"],
  ["--- -u- u--- -", "axrami ashtari abtar"],
  ["--u u--- --- -", "axrabi axrami abtar"],
  ["--u u--- --u u-", "axrabi majbub"],
  ["--- --- --u u-", "axrami axrabi majbub"],
  ["--- --- --- -", "axrami abtar"],
  ["--- --u u--- -", "axrami axrabi abtar"],
  ["--- --u u--u u-", "axrami axrabi makfufi majbub"],
];

export const METERS: Meter[] = [
  {
    id: "ramal-musamman-mahzuf",
    name: "Ramali musammani mahzuf",
    family: "ramal",
    afoil: "foilotun foilotun foilotun foilun",
    variants: [v("-u-- -u-- -u-- -u-", "foilotun foilotun foilotun foilun")],
    note: "G'azaliyotda eng ko'p qo'llangan vaznlardan biri.",
  },
  {
    id: "hazaj-musamman-solim",
    name: "Hazaji musammani solim",
    family: "hazaj",
    afoil: "mafoiylun mafoiylun mafoiylun mafoiylun",
    variants: [v("u--- u--- u--- u---", "mafoiylun mafoiylun mafoiylun mafoiylun")],
  },
  {
    id: "mujtass-musamman-maxbun-mahzuf",
    name: "Mujtassi musammani maxbuni mahzuf",
    family: "mujtass",
    afoil: "mafoilun failotun mafoilun failun",
    variants: [
      v("u-u- uu-- u-u- uu-", "mafoilun failotun mafoilun failun"),
      v("u-u- uu-- u-u- --", "mafoilun failotun mafoilun fa'lun"),
    ],
  },
  {
    id: "ramal-musamman-maxbun-mahzuf",
    name: "Ramali musammani maxbuni mahzuf",
    family: "ramal",
    afoil: "foilotun failotun failotun failun",
    variants: [
      v("-u-- uu-- uu-- uu-", "foilotun failotun failotun failun"),
      v("-u-- uu-- uu-- --", "foilotun failotun failotun fa'lun"),
      v("uu-- uu-- uu-- uu-", "failotun failotun failotun failun"),
      v("uu-- uu-- uu-- --", "failotun failotun failotun fa'lun"),
    ],
  },
  {
    id: "hazaj-musamman-axrab-makfuf-mahzuf",
    name: "Hazaji musammani axrabi makfufi mahzuf",
    family: "hazaj",
    afoil: "maf'uvlu mafoiylu mafoiylu fauvlun",
    variants: [v("--u u--u u--u u--", "maf'uvlu mafoiylu mafoiylu fauvlun")],
  },
  {
    id: "hazaj-ruboiy",
    name: "Ruboiy vazni (hazaji axrab va axram)",
    family: "hazaj",
    afoil: "maf'uvlu mafoiylu mafoiylu faal",
    variants: RUBOIY.map(([p, n]) =>
      v(p, p.split(" ").map((f) => FOOT[f]).join(" "), `Hazaji musammani ${n}`),
    ),
    note: "Ruboiy hazajning axrab va axram tarmoqlaridagi 24 vaznda yoziladi; ulardan 12 tasi asosiy shakl.",
  },
  {
    id: "muzore-musamman-axrab-makfuf-mahzuf",
    name: "Muzore'i musammani axrabi makfufi mahzuf",
    family: "muzore",
    afoil: "maf'uvlu foilotu mafoiylu foilun",
    variants: [v("--u -u-u u--u -u-", "maf'uvlu foilotu mafoiylu foilun")],
  },
  {
    id: "muzore-musamman-axrab",
    name: "Muzore'i musammani axrab",
    family: "muzore",
    afoil: "maf'uvlu foilotun maf'uvlu foilotun",
    variants: [v("--u -u-- --u -u--", "maf'uvlu foilotun maf'uvlu foilotun")],
  },
  {
    id: "rajaz-musamman-solim",
    name: "Rajazi musammani solim",
    family: "rajaz",
    afoil: "mustaf'ilun mustaf'ilun mustaf'ilun mustaf'ilun",
    variants: [v("--u- --u- --u- --u-", "mustaf'ilun mustaf'ilun mustaf'ilun mustaf'ilun")],
  },
  {
    id: "ramal-musaddas-mahzuf",
    name: "Ramali musaddasi mahzuf",
    family: "ramal",
    afoil: "foilotun foilotun foilun",
    variants: [v("-u-- -u-- -u-", "foilotun foilotun foilun")],
    note: "Navoiyning «Lison ut-tayr» dostoni shu vaznda.",
  },
  {
    id: "hazaj-musaddas-mahzuf",
    name: "Hazaji musaddasi mahzuf",
    family: "hazaj",
    afoil: "mafoiylun mafoiylun fauvlun",
    variants: [v("u--- u--- u--", "mafoiylun mafoiylun fauvlun")],
    note: "Navoiyning «Farhod va Shirin» dostoni shu vaznda.",
  },
  {
    id: "hazaj-musaddas-axrab-maqbuz-mahzuf",
    name: "Hazaji musaddasi axrabi maqbuzi mahzuf",
    family: "hazaj",
    afoil: "maf'uvlu mafoilun fauvlun",
    variants: [v("--u u-u- u--", "maf'uvlu mafoilun fauvlun")],
    note: "Navoiyning «Layli va Majnun» dostoni shu vaznda.",
  },
  {
    id: "sare-musaddas-matviy-makshuf",
    name: "Sare'i musaddasi matviyi makshuf",
    family: "sare",
    afoil: "muftailun muftailun foilun",
    variants: [v("-uu- -uu- -u-", "muftailun muftailun foilun")],
    note: "Navoiyning «Hayrat ul-abror» dostoni shu vaznda.",
  },
  {
    id: "xafif-musaddas-maxbun-mahzuf",
    name: "Xafifi musaddasi maxbuni mahzuf",
    family: "xafif",
    afoil: "foilotun mafoilun failun",
    variants: [
      v("-u-- u-u- uu-", "foilotun mafoilun failun"),
      v("-u-- u-u- --", "foilotun mafoilun fa'lun"),
      v("uu-- u-u- uu-", "failotun mafoilun failun"),
      v("uu-- u-u- --", "failotun mafoilun fa'lun"),
    ],
    note: "Navoiyning «Sab'ai sayyor» dostoni shu vaznda.",
  },
  {
    id: "mutaqorib-musamman-mahzuf",
    name: "Mutaqoribi musammani mahzuf",
    family: "mutaqorib",
    afoil: "fauvlun fauvlun fauvlun faal",
    variants: [v("u-- u-- u-- u-", "fauvlun fauvlun fauvlun faal")],
    note: "Navoiyning «Saddi Iskandariy» dostoni shu vaznda.",
  },
  {
    id: "mutaqorib-musamman-solim",
    name: "Mutaqoribi musammani solim",
    family: "mutaqorib",
    afoil: "fauvlun fauvlun fauvlun fauvlun",
    variants: [v("u-- u-- u-- u--", "fauvlun fauvlun fauvlun fauvlun")],
  },
];
