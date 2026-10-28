// Reads every sample manuscript page that has no stored reading yet and saves
// the Gemini result into src/content/manuscripts.json.
//   npm run precompute            (needs GEMINI_API_KEY in .env.local)
//   npm run precompute -- --force (re-read pages that already have a reading)

import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { readManuscript } from "../src/lib/ai/gemini.ts";

const root = path.resolve(import.meta.dirname, "..");
const file = path.join(root, "src/content/manuscripts.json");
const force = process.argv.includes("--force");

const manuscripts = JSON.parse(await readFile(file, "utf8"));
let done = 0;
let failed = 0;

for (const m of manuscripts) {
  for (const page of m.pages) {
    if (page.reading && !force) continue;
    const imgPath = path.join(root, "public", page.image);
    const data = (await readFile(imgPath)).toString("base64");
    process.stdout.write(`${m.slug} ${page.folio} … `);
    try {
      const { reading, model } = await readManuscript({ data, mimeType: "image/jpeg" });
      page.reading = reading;
      page.readingModel = model;
      done++;
      console.log(`${reading.lines.length} satr (${model})`);
      await writeFile(file, JSON.stringify(manuscripts, null, 2) + "\n");
    } catch (err) {
      failed++;
      console.log(`xato: ${(err as Error).message.slice(0, 200)}`);
    }
  }
}
console.log(`\nTayyor: ${done} ta sahifa o'qildi, ${failed} ta xato.`);
