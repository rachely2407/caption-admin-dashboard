import Link from "next/link";
import ThemeToggle from "./ThemeToggle";

const links = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/images", label: "Images" },
  { href: "/admin/humor-flavors", label: "Humor Flavors" },
  { href: "/admin/humor-flavor-steps", label: "Flavor Steps" },
  { href: "/admin/captions", label: "Captions" },
  { href: "/admin/testing", label: "Testing" },
];

export default function AdminNavbar() {
  return (
    <div className="mb-10 w-full rounded-[2rem] border-4 border-[var(--ink)] bg-[var(--panel)] p-6 shadow-[12px_12px_0_var(--shadow-strong)]">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-3">
          <div className="flex gap-2">
            <span className="h-4 w-4 rounded-full bg-[var(--accent-red)]" />
            <span className="h-4 w-10 rounded-full bg-[var(--accent-yellow)]" />
            <span className="h-4 w-6 rounded-full bg-[var(--accent-blue)]" />
          </div>

          <Link
            href="/admin"
            className="block text-3xl font-bold uppercase tracking-[0.14em] text-[var(--ink)]"
          >
            Prompt Chain Studio
          </Link>

          <p className="max-w-2xl text-sm uppercase tracking-[0.2em] text-[var(--muted)]">
            Humor flavors, prompt steps, caption testing, and image test-set tools.
          </p>
        </div>

        <ThemeToggle />
      </div>

      <div className="flex flex-wrap gap-2">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="rounded-full border-2 border-[var(--ink)] bg-[var(--surface)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--ink)] transition hover:-translate-y-0.5 hover:bg-[var(--accent-yellow)]"
          >
            {link.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
