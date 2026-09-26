import { EVENT } from "@/data/event";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { FadeIn } from "@/components/ui/FadeIn";

export function RegisterCTA() {
  return (
    <section aria-label="Register for CYE 2026" className="bg-wash-mist py-14 sm:py-16">
      <Container>
        <FadeIn className="flex flex-col items-center justify-between gap-6 rounded-3xl border border-white/80 bg-white px-6 py-8 text-center shadow-card sm:px-10 lg:flex-row lg:text-left">
          <div>
            <p className="font-display text-xl text-cye-orange sm:text-2xl">What are you waiting for?</p>
            <h2 className="mt-1 font-heading text-2xl font-black uppercase tracking-tight text-cye-blue sm:text-3xl">
              Be part of {EVENT.shortName}
            </h2>
            <p className="mt-2 text-sm text-cye-ink/65">
              {EVENT.date} · {EVENT.venue}, {EVENT.city}
            </p>
          </div>
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <Button href="/competitions" className="w-full sm:w-auto">
              Register now
            </Button>
            <Button href="/visitors" variant="secondary" className="w-full sm:w-auto">
              Get visitor pass
            </Button>
          </div>
        </FadeIn>
      </Container>
    </section>
  );
}
