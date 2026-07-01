interface TooltipProps {
  text: string;
}

/** Small info bubble used next to form labels (mirrors the plugin's "i" tip). */
export function Tooltip({ text }: TooltipProps) {
  return (
    <span
      title={text}
      className="ml-1 inline-flex h-4 w-4 cursor-help items-center justify-center rounded-full bg-brand text-[10px] font-bold text-brand-fg"
      aria-label={text}
    >
      i
    </span>
  );
}
