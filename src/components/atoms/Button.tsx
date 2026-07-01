import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type Variant = "brand" | "accent" | "outline";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

const variants: Record<Variant, string> = {
  brand: "bg-brand text-brand-fg hover:opacity-90",
  accent: "bg-accent text-accent-fg hover:opacity-90",
  outline: "border border-line bg-surface text-ink hover:bg-muted",
};

export function Button({ variant = "brand", className, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-theme px-5 py-2.5 text-sm font-semibold transition disabled:cursor-default disabled:opacity-60",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}
