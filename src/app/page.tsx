import { PageLayout } from "@/components/templates/PageLayout";
import { Hero } from "@/components/organisms/Hero";
import { RefundForm } from "@/components/organisms/RefundForm";
import { Section } from "@/components/molecules/Section";
import { getSite } from "@/config/site";
import { getFormStrings, normalizeLang } from "@/lib/formStrings";

export default function HomePage() {
  const { content } = getSite();
  const { home } = content;

  const lang = normalizeLang(content.meta.formLang);
  const strings = getFormStrings(lang);
  // Empty string -> use the built-in Next route handler.
  const endpoint = process.env.NEXT_PUBLIC_REFUND_ENDPOINT?.trim() || "/api/refund";

  return (
    <PageLayout>
      <div className="mx-auto max-w-content px-4 py-12">
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-14">
          <div className="lg:pt-6">
            <Hero hero={home.hero} />
            {home.trust?.length ? (
              <div className="mt-10">
                {home.trust.map((s, i) => (
                  <Section key={i} section={s} />
                ))}
              </div>
            ) : null}
          </div>

          <div>
            {home.formTitle ? (
              <h2 className="mb-1 text-xl font-semibold text-ink">{home.formTitle}</h2>
            ) : null}
            {home.formIntro ? (
              <p className="mb-4 text-sm text-ink/60">{home.formIntro}</p>
            ) : null}
            <RefundForm
              strings={strings}
              lang={lang}
              endpoint={endpoint}
              operatorCode={home.operatorCode}
            />
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
