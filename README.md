# DiwanUz

O'zbek (chig'atoy), fors va arab yozuvidagi qo'lyozmalarni sun'iy intellekt yordamida o'qiydigan ochiq platforma.
«Eng innovatsion g'oya» tanlovi (Toshkent davlat sharqshunoslik universiteti) uchun tayyorlangan.

## Imkoniyatlar

| Sahifa | Nima qiladi |
|---|---|
| `/oqish` | Qo'lyozma rasmini yuklash → AI satrlarni topadi, arab yozuvini o'qiydi, lotin yozuviga o'giradi → muharrirda tuzatish → TXT / JSON / PAGE XML eksport → datasetga yuborish |
| `/qolyozmalar` | Ochiq litsenziyali kutubxona qo'lyozmalari, tasvir va matn satrma-satr bog'langan |
| `/devon` | Mumtoz shoirlar va she'rlar: lotin/kirill, eski so'zlar lug'ati, AI izohi, aruz tahlili |
| `/aruz` | Aruz skaneri: baytni hijolarga ajratadi va vaznini aniqlaydi |
| `/dataset` | Inson tuzatgan satrlardan iborat ochiq dataset (JSON) |
| `/loyiha` | Hakamlar uchun: tanlovning 5 mezoni bo'yicha |

## 1. Gemini kalitini olish (bepul, 2 daqiqa)

1. https://aistudio.google.com/apikey sahifasiga Google hisobingiz bilan kiring.
2. **Create API key** tugmasini bosing va kalitni nusxalang.
3. Loyiha papkasida `.env.example` faylidan nusxa olib, nomini `.env.local` qiling va kalitni yozing:

   ```
   GEMINI_API_KEY=sizning_kalitingiz
   ```

Kalitni hech kimga yubormang va internetga joylamang.

## 2. Kompyuterda ishga tushirish

```bash
npm install
npm run dev
```

So'ng brauzerda http://localhost:3000 ni oching.

Namuna qo'lyozmalarni oldindan o'qib qo'yish (demo paytida AI limiti tugasa ham ishlashi uchun):

```bash
npm run precompute
```

## 3. Internetga joylash (Vercel, bepul)

1. https://github.com da hisob oching va loyihani yangi repozitoriyaga yuklang.
2. https://vercel.com ga GitHub orqali kiring → **Add New Project** → repozitoriyani tanlang.
3. **Environment Variables** bo'limiga `GEMINI_API_KEY` ni qo'shing → **Deploy**.
4. Tuzatishlar doimiy saqlanishi uchun: Vercel loyihasida **Storage → Neon (Postgres)** ni ulang.
   `DATABASE_URL` avtomatik qo'shiladi, jadvallar o'zi yaratiladi.

## Texnik ma'lumot

- Next.js 16, React 19, Tailwind CSS 4
- AI: Google Gemini (Flash modellari). Bir model ishlamasa, keyingisi sinaladi. Natijalar keshlanadi.
- Aruz skaneri: `src/lib/aruz/` — o'z algoritmimiz, testlar: `npm test`
- Lotin → kirill: `src/lib/translit/cyrillic.ts`
- Ma'lumotlar: `DATABASE_URL` bo'lsa Postgres, bo'lmasa `.data/store.json`
