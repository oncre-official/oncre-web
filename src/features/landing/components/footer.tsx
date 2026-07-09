import { site } from "@/config/site";

export function Footer() {
  return (
    <footer className="border-t border-ink-100 py-8">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-2 px-4 text-sm text-ink-500 sm:px-6">
        <p>
          &copy; {new Date().getFullYear()} {site.name}. All rights reserved.
        </p>
        <p>
          Questions? <a href={`mailto:${site.supportEmail}`} className="text-brand-700 hover:underline">{site.supportEmail}</a>
        </p>
      </div>
    </footer>
  );
}
