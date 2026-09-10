import { cn } from "@/lib/cn";

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
  light = false,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "center" | "left";
  light?: boolean;
}) {
  return (
    <div className={cn(align === "center" ? "mx-auto max-w-3xl text-center" : "max-w-3xl text-left")}>
      {eyebrow ? (
        <p
          className={cn(
            "font-heading text-xs font-bold uppercase tracking-[0.28em]",
            light ? "text-cye-orange-lt" : "text-cye-orange",
          )}
        >
          {eyebrow}
        </p>
      ) : null}
      <h2
        className={cn(
          "mt-3 font-heading text-3xl font-black uppercase tracking-tight sm:text-4xl lg:text-[2.75rem] lg:leading-[1.1]",
          light ? "text-white" : "text-cye-blue",
        )}
      >
        {title}
      </h2>
      {description ? (
        <p
          className={cn(
            "mt-4 text-base leading-relaxed sm:text-lg",
            light ? "text-white/80" : "text-cye-ink/70",
          )}
        >
          {description}
        </p>
      ) : null}
    </div>
  );
}
