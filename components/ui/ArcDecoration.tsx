import { cn } from "@/lib/cn";

type Corner = "top-right" | "top-left" | "bottom-right" | "bottom-left";

const position: Record<Corner, string> = {
  "top-right": "top-0 right-0 origin-top-right",
  "top-left": "top-0 left-0 origin-top-left -scale-x-100",
  "bottom-right": "bottom-0 right-0 origin-bottom-right -scale-y-100",
  "bottom-left": "bottom-0 left-0 origin-bottom-left -scale-x-100 -scale-y-100",
};

export function ArcDecoration({
  corner = "top-right",
  className,
  size = 520,
}: {
  corner?: Corner;
  className?: string;
  size?: number;
}) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 500 500"
      width={size}
      height={size}
      className={cn(
        "pointer-events-none absolute select-none overflow-visible opacity-80",
        position[corner],
        className,
      )}
    >
      <circle cx="500" cy="0" r="150" fill="none" stroke="#FF5A1F" strokeWidth="38" />
      <circle cx="500" cy="0" r="214" fill="none" stroke="#0B4DA2" strokeWidth="30" />
      <circle cx="500" cy="0" r="274" fill="none" stroke="#FF7A45" strokeWidth="20" opacity="0.85" />
      <circle cx="500" cy="0" r="328" fill="none" stroke="#0B4DA2" strokeWidth="14" opacity="0.55" />
      <circle cx="500" cy="0" r="376" fill="none" stroke="#FF5A1F" strokeWidth="8" opacity="0.35" />
    </svg>
  );
}
