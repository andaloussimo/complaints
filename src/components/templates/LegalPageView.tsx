import { PageLayout, ContentContainer } from "@/components/templates/PageLayout";
import { Section } from "@/components/molecules/Section";
import type { LegalPage } from "@/config/types";

export function LegalPageView({ page }: { page: LegalPage }) {
  return (
    <PageLayout>
      <ContentContainer>
        <div className="mx-auto max-w-3xl">
          <h1 className="text-3xl font-bold text-ink">{page.title}</h1>
          {page.subtitle ? <p className="mt-2 text-ink/60">{page.subtitle}</p> : null}
          {page.updatedAt ? (
            <p className="mt-1 text-xs text-ink/40">Last updated: {page.updatedAt}</p>
          ) : null}
          <div className="mt-8">
            {page.sections.map((s, i) => (
              <Section key={i} section={s} />
            ))}
          </div>
        </div>
      </ContentContainer>
    </PageLayout>
  );
}
