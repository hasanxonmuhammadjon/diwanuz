"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Logo } from "./logo";

export const NAV = [
  { href: "/oqish", label: "Qo'lyozma o'qish" },
  { href: "/qolyozmalar", label: "Qo'lyozmalar" },
  { href: "/devon", label: "Devon" },
  { href: "/aruz", label: "Aruz skaneri" },
  { href: "/dataset", label: "Dataset" },
  { href: "/loyiha", label: "Loyiha haqida" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-rail bg-paper/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-[1440px] items-center gap-6 px-4 sm:px-6">
        <Logo />
        <nav className="hidden lg:flex items-center gap-1 text-[0.92rem]" aria-label="Asosiy menyu">
          {NAV.map((n) => {
            const active = pathname === n.href || pathname.startsWith(n.href + "/");
            return (
              <Link
                key={n.href}
                href={n.href}
                className={`rounded-md px-3 py-2 transition-colors ${
                  active ? "text-navy bg-cream-2" : "text-ink-2 hover:text-navy"
                }`}
              >
                {n.label}
              </Link>
            );
          })}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <Link href="/loyiha" className="hidden sm:inline-flex btn btn-white !py-2 text-sm">
            Hakamlar uchun
          </Link>
          <Link href="/oqish" className="btn btn-navy !py-2 text-sm">
            Bepul boshlash
          </Link>
          <button
            className="lg:hidden btn btn-ghost !px-2.5 !py-2"
            aria-expanded={open}
            aria-label="Menyuni ochish"
            onClick={() => setOpen((o) => !o)}
          >
            <svg viewBox="0 0 20 20" className="h-5 w-5" aria-hidden="true">
              <path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="1.6" />
            </svg>
          </button>
        </div>
      </div>
      {open && (
        <nav className="lg:hidden border-t border-rail bg-paper px-4 py-3" aria-label="Mobil menyu">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              onClick={() => setOpen(false)}
              className="block rounded-md px-3 py-2.5 text-ink-2 hover:bg-cream-2 hover:text-navy"
            >
              {n.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
