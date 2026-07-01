import type { ReactNode } from "react";
import { Tooltip } from "@/components/atoms/Tooltip";

interface FieldProps {
  label: string;
  tip?: string;
  hint?: string;
  htmlFor?: string;
  children: ReactNode;
}

export function Field({ label, tip, hint, htmlFor, children }: FieldProps) {
  return (
    <div className="mb-5">
      <label htmlFor={htmlFor} className="mb-1.5 block text-sm text-ink/70">
        {label}
        {tip ? <Tooltip text={tip} /> : null}
      </label>
      {children}
      {hint ? <p className="mt-1.5 text-xs text-ink/50">{hint}</p> : null}
    </div>
  );
}
