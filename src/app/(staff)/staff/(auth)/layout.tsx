import Link from "next/link";

import { site } from "@/config/site";

export default function StaffAuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-1 items-center justify-center bg-ink-50 px-4 py-12">
      <div className="w-full max-w-md">
        <Link href="/" className="mb-2 block text-center text-2xl font-bold text-brand-700">
          {site.name}
        </Link>
        <p className="mb-8 text-center text-sm text-ink-500">Staff Console</p>
        <div className="rounded-2xl border border-ink-100 bg-white p-8 shadow-sm">{children}</div>
      </div>
    </div>
  );
}
