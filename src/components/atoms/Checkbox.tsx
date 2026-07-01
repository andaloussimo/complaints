import { forwardRef, type InputHTMLAttributes, type ReactNode } from "react";

interface CheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
  children: ReactNode;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  function Checkbox({ children, ...props }, ref) {
    return (
      <label className="flex items-start gap-3 text-sm text-ink/80">
        <input
          ref={ref}
          type="checkbox"
          className="mt-0.5 h-4 w-4 shrink-0 accent-[rgb(var(--color-accent))]"
          {...props}
        />
        <span>{children}</span>
      </label>
    );
  },
);
