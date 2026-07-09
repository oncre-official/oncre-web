"use client";

import { cn } from "@/lib/utils/cn";

interface Tab {
  key: string;
  label: string;
}

interface TabsProps {
  tabs: Tab[];
  active: string;
  onChange: (key: string) => void;
}

export function Tabs({ tabs, active, onChange }: TabsProps) {
  return (
    <div className="flex gap-1 rounded-lg bg-ink-100 p-1" role="tablist">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          role="tab"
          aria-selected={active === tab.key}
          onClick={() => onChange(tab.key)}
          className={cn(
            "flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors",
            active === tab.key ? "bg-white text-ink-900 shadow-sm" : "text-ink-500 hover:text-ink-800",
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
