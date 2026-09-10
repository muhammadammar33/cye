import { GUESTS } from "@/data/event";
import { Container } from "@/components/ui/Container";
import { FadeIn } from "@/components/ui/FadeIn";
import { SectionHeading } from "@/components/ui/SectionHeading";

function initials(name: string) {
  const skip = new Set(["dr", "lt", "retd", "ex", "hafiz"]);
  const parts = name
    .replace(/[().]/g, " ")
    .split(/\s+/)
    .filter((part) => part && !skip.has(part.toLowerCase()));
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export function Guests() {
  return (
    <section id="guests" className="scroll-mt-24 bg-wash-mist py-20 sm:py-24">
      <Container>
        <FadeIn>
          <SectionHeading
            eyebrow="Line-up"
            title="Expected Guests"
            description="Leaders from government, academia, industry, media, and civil society expected at CYE 2026."
          />
        </FadeIn>
        <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
          {GUESTS.map((guest, index) => (
            <FadeIn key={guest.name} delay={(index % 5) * 0.04}>
              <article className="h-full rounded-3xl border border-white/80 bg-white/90 p-5 text-center shadow-card transition-transform duration-300 hover:-translate-y-1">
                <div
                  className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-linear-to-br from-cye-blue to-cye-orange font-heading text-lg font-black text-white sm:h-24 sm:w-24 sm:text-xl"
                  aria-hidden
                >
                  {initials(guest.name)}
                </div>
                <h3 className="mt-4 font-heading text-sm font-extrabold leading-snug text-cye-blue sm:text-base">
                  {guest.name}
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-cye-ink/65 sm:text-[13px]">
                  {guest.role}
                </p>
              </article>
            </FadeIn>
          ))}
        </div>
      </Container>
    </section>
  );
}
