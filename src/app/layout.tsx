import type { Metadata } from "next";
import { Noto_Naskh_Arabic, Noto_Nastaliq_Urdu, Noto_Sans, Spectral } from "next/font/google";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import "./globals.css";

const notoSans = Noto_Sans({ variable: "--font-noto-sans", subsets: ["latin", "cyrillic"] });
const spectral = Spectral({
  variable: "--font-spectral",
  subsets: ["latin", "cyrillic"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
});
const naskh = Noto_Naskh_Arabic({ variable: "--font-naskh", subsets: ["arabic"] });
const nastaliq = Noto_Nastaliq_Urdu({ variable: "--font-nastaliq", subsets: ["arabic"] });

export const metadata: Metadata = {
  title: {
    default: "DiwanUz — qo'lyozmalarni AI bilan o'qing",
    template: "%s · DiwanUz",
  },
  description:
    "Chig'atoy, fors va arab yozuvidagi qo'lyozmalarni sun'iy intellekt yordamida o'qiydigan, lotin yozuviga o'giradigan va aruz vaznini aniqlaydigan ochiq platforma.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="uz"
      className={`${notoSans.variable} ${spectral.variable} ${naskh.variable} ${nastaliq.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-3 focus:bg-paper">
          Asosiy qismga o'tish
        </a>
        <SiteHeader />
        <main id="main" className="flex-1">
          {children}
        </main>
        <SiteFooter />
      </body>
    </html>
  );
}
