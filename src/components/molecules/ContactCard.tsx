import type { ContactChannel } from "@/config/types";

export function ContactCard({ channel }: { channel: ContactChannel }) {
  return (
    <div className="rounded-theme border border-line bg-surface p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-ink/50">
        {channel.label}
      </p>
      {channel.href ? (
        <a href={channel.href} className="mt-1 block font-medium text-brand hover:underline">
          {channel.value}
        </a>
      ) : (
        <p className="mt-1 font-medium text-ink">{channel.value}</p>
      )}
    </div>
  );
}
