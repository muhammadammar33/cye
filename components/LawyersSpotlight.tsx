import { CalendarDays, Gavel, MapPin, Ticket } from "lucide-react";
import { EVENT, LAWYERS_CONFERENCE } from "@/data/event";
import { ArcDecoration } from "@/components/ui/ArcDecoration";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { FadeIn } from "@/components/ui/FadeIn";

/** Home page spotlight for the Lawyers Conference panel discussion. */
export function LawyersSpotlight() {
  return (
    <section className="relative overflow-hidden bg-grad-blue py-20 text-white sm:py-24">
      <ArcDecoration corner="top-right" size={360} className="-translate-y-[30%] translate-x-[30%] opacity-40" />
      <Container className="relative z-10">
        <div className="grid items-center gap-10 lg:grid-cols-[1.25fr_0.75fr]">
          <FadeIn>
            <p className="font-heading text-xs font-bold uppercase tracking-[0.28em] text-[#ffc9ad]">
              Lawyers Conference · {LAWYERS_CONFERENCE.format}
            </p>
            <h2 className="mt-3 font-heading text-3xl font-black uppercase leading-tight tracking-tight sm:text-5xl">
              {LAWYERS_CONFERENCE.headline}
              <span className="mt-2 block text-xl tracking-normal text-[#ffc9ad] sm:text-2xl">{LAWYERS_CONFERENCE.subtitle}</span>
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/80">{LAWYERS_CONFERENCE.about}</p>
            <ul className="mt-6 grid gap-3 sm:grid-cols-3">
              {LAWYERS_CONFERENCE.guests.map((guest) => (
                <li key={guest.name} className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm">
                  <Gavel className="h-4 w-4 text-cye-orange-lt" aria-hidden />
                  <p className="mt-2 font-heading font-bold leading-snug">{guest.name}</p>
                  <p className="mt-1 text-xs leading-snug text-white/70">{guest.role}</p>
                </li>
              ))}
            </ul>
          </FadeIn>
          <FadeIn delay={0.08} className="rounded-3xl bg-white p-6 text-cye-ink shadow-card sm:p-8">
            <p className="flex items-center gap-2 font-heading text-sm font-bold uppercase tracking-wider text-cye-orange">
              <Ticket className="h-4 w-4" aria-hidden />
              Free entry · {LAWYERS_CONFERENCE.capacity} seats only
            </p>
            <div className="mt-4 space-y-2 text-sm font-medium text-cye-ink/75">
              <p className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-cye-orange" aria-hidden />
                {EVENT.date}
              </p>
              <p className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-cye-orange" aria-hidden />
                {EVENT.venue}, {EVENT.city}
              </p>
            </div>
            <p className="mt-4 text-sm text-cye-ink/65">Register to confirm your seat. Confirmed participants receive their Lawyers Conference pass by email.</p>
            <Button href="/lawyers-conference" className="mt-6 w-full">
              Register for your seat
            </Button>
          </FadeIn>
        </div>
      </Container>
    </section>
  );
}
