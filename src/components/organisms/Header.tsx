import Link from "next/link";
import { Logo } from "@/components/atoms/Logo";
import type { BrandInfo, NavLink } from "@/config/types";

interface HeaderProps {
  brand: BrandInfo;
  nav: NavLink[];
}

export function Header({ brand, nav }: HeaderProps) {
  return (
    <header className="border-b border-line bg-surface">
      <div className="mx-auto flex max-w-content items-center justify-between px-4 py-4">
        <Logo brand={brand} />
        <nav className="hidden gap-6 sm:flex">
          {nav.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-ink/70 transition hover:text-brand"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
