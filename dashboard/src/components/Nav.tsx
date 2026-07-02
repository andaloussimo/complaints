"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/", label: "All sites" },
  { href: "/new", label: "New site" },
];

export function Nav() {
  const pathname = usePathname();
  return (
    <nav className="flex items-center gap-1">
      {LINKS.map((l) => {
        const active = pathname === l.href || (l.href !== "/" && pathname?.startsWith(l.href));
        return (
          <Link
            key={l.href}
            href={l.href}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
              active ? "bg-brand/10 text-brand" : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            }`}
          >
            {l.label}
          </Link>
        );
      })}
    </nav>
  );
}
