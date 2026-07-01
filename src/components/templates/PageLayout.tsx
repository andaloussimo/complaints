import type { ReactNode } from "react";
import { Header } from "@/components/organisms/Header";
import { Footer } from "@/components/organisms/Footer";
import { getSite } from "@/config/site";

/**
 * Template layer: the consistent chrome (header + footer) wrapping every page.
 * Pages compose this with organisms/molecules for their body content.
 */
export function PageLayout({ children }: { children: ReactNode }) {
  const { content } = getSite();
  return (
    <div className="flex min-h-screen flex-col">
      <Header brand={content.brand} nav={content.nav} />
      <main className="flex-1">{children}</main>
      <Footer footer={content.footer} brandName={content.brand.name} />
    </div>
  );
}

/** Centered content column used by the legal / contact pages. */
export function ContentContainer({ children }: { children: ReactNode }) {
  return <div className="mx-auto max-w-content px-4 py-12">{children}</div>;
}
