import Link from "next/link";
import { assetUrl } from "@/config/site";
import type { BrandInfo } from "@/config/types";

interface LogoProps {
  brand: BrandInfo;
}

export function Logo({ brand }: LogoProps) {
  const src = assetUrl(brand.logo);
  return (
    <Link href="/" className="inline-flex items-center gap-2 text-brand">
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={brand.logoAlt ?? brand.name} className="h-8 w-auto" />
      ) : (
        <span className="text-lg font-bold text-ink">{brand.name}</span>
      )}
    </Link>
  );
}
