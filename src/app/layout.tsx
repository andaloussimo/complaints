import type { Metadata } from "next";
import "./globals.css";
import { getSite, assetUrl, siteMetadataBase } from "@/config/site";
import { themeToCssVars } from "@/lib/theme";

export function generateMetadata(): Metadata {
  const { content } = getSite();
  const og = assetUrl(content.meta.ogImage);
  return {
    metadataBase: siteMetadataBase(content.meta.siteUrl),
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
