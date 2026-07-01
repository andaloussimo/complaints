import type { Metadata } from "next";
import { PageLayout, ContentContainer } from "@/components/templates/PageLayout";
import { ContactCard } from "@/components/molecules/ContactCard";
import { getSite } from "@/config/site";

export function generateMetadata(): Metadata {
  const { content } = getSite();
  return { title: `${content.contact.title} — ${content.brand.name}` };
}

export default function ContactPage() {
  const { content } = getSite();
  const { contact } = content;
  return (
    <PageLayout>
      <ContentContainer>
        <h1 className="text-3xl font-bold text-ink">{contact.title}</h1>
        {contact.subtitle ? (
          <p className="mt-2 text-ink/60">{contact.subtitle}</p>
        ) : null}
        {contact.intro?.length ? (
          <div className="rich mt-6 max-w-2xl">
            {contact.intro.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        ) : null}
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {contact.channels.map((c, i) => (
            <ContactCard key={i} channel={c} />
          ))}
        </div>
      </ContentContainer>
    </PageLayout>
  );
}
