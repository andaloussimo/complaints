import type { Metadata } from "next";
import { LegalPageView } from "@/components/templates/LegalPageView";
import { getSite } from "@/config/site";

export function generateMetadata(): Metadata {
  const { content } = getSite();
  return { title: `${content.confidentiality.title} — ${content.brand.name}` };
}

export default function ConfidentialityPage() {
  const { content } = getSite();
  return <LegalPageView page={content.confidentiality} />;
}
