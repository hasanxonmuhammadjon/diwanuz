"use client";

import { useState } from "react";

export interface FeatureTab {
  id: string;
  label: string;
  title: string;
  text: string;
  points: string[];
  visual: React.ReactNode;
}

export function FeatureTabs({ tabs }: { tabs: FeatureTab[] }) {
  const [active, setActive] = useState(tabs[0].id);
  const tab = tabs.find((t) => t.id === active) ?? tabs[0];

  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 border-y border-rail" role="tablist">
        {tabs.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={t.id === active}
            onClick={() => setActive(t.id)}
            className={`border-b-2 px-3 py-4 text-sm transition-colors lg:border-r lg:border-r-rail last:border-r-0 ${
              t.id === active ? "border-b-navy font-semibold text-navy" : "border-b-transparent text-ink-3 hover:text-navy"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="grid gap-10 px-4 sm:px-8 py-12 lg:grid-cols-[0.8fr_1.2fr] items-center" role="tabpanel">
        <div>
          <h3 className="text-3xl">{tab.title}</h3>
          <p className="mt-3 text-ink-2 leading-relaxed">{tab.text}</p>
          <ul className="mt-5 space-y-2 text-sm text-ink-2">
            {tab.points.map((p) => (
              <li key={p} className="flex gap-2">
                <span className="text-navy" aria-hidden="true">✓</span>
                {p}
              </li>
            ))}
          </ul>
        </div>
        <div>{tab.visual}</div>
      </div>
    </div>
  );
}
