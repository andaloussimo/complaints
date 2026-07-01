import type { RichSection } from "@/config/types";

/** Renders a heading + ordered paragraphs from a RichSection. */
export function Section({ section }: { section: RichSection }) {
  return (
    <section className="mb-8">
      {section.heading ? (
        <h2 className="mb-3 text-xl font-semibold text-ink">{section.heading}</h2>
      ) : null}
      <div className="rich">
        {section.body.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>
    </section>
  );
}
