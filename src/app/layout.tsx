import type { Metadata } from "next";
import "./globals.css";
import { getSite, assetUrl } from "@/config/site";
import { themeToCssVars } from "@/lib/theme";

export function generateMetadata(): Metadata {
  const { content } = getSite();
  const og = assetUrl(content.meta.ogImage);
  const base = content.meta.siteUrl?.trim();
  return {
    metadataBase: base ? new URL(base) : undefined,
    title: content.meta.title,
    description: content.meta.description,
    openGraph: {
      title: content.meta.title,
      description: content.meta.description,
      images: og ? [og] : undefined,
    },
  };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const { content, theme } = getSite();
  return (
    <html lang={content.meta.locale}>
      <head>
        {theme.fontUrl ? <link rel="stylesheet" href={theme.fontUrl} /> : null}
      </head>
      <body style={themeToCssVars(theme)}>{children}</body>
    </html>
  );
}
