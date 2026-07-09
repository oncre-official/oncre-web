import Link from "next/link";

import { site } from "@/config/site";

export function Navbar() {
  return (
    <header className="border-b border-ink-100">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="text-xl font-bold text-brand-700">
          {site.name}
        </Link>
        <Link
          href="/login"
          className="text-sm font-medium text-ink-700 hover:text-ink-900"
        >
          Log In
        </Link>
      </div>
    </header>
  );
}
