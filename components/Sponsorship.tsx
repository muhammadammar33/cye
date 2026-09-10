import { Check } from "lucide-react";
import { SPONSORSHIP } from "@/data/event";
import { ArcDecoration } from "@/components/ui/ArcDecoration";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { FadeIn } from "@/components/ui/FadeIn";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { cn } from "@/lib/cn";

export function Sponsorship() {
  return (
    <section id="sponsorship" className="relative scroll-mt-24 overflow-hidden bg-white py-20 sm:py-24">
      <ArcDecoration corner="top-right" className="opacity-50" />
      <ArcDecoration corner="bottom-left" size={380} className="opacity-40" />
      <Container className="relative">
        <FadeIn>
          <SectionHeading
            eyebrow="Partner with us"
            title="Sponsorship Tiers"
            description="Be the brand behind Islamabad's largest youth platform. Packages are designed for visibility, access, and lasting community impact."
          />
        </FadeIn>
        <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {SPONSORSHIP.map((tier, index) => (
            <FadeIn key={tier.tier} delay={index * 0.07} className={tier.highlight ? "xl:-mt-3" : undefined}>
              <article
                className={cn(
                  "flex h-full flex-col rounded-3xl border bg-white p-6 shadow-card",
                  tier.highlight
                    ? "border-cye-orange ring-2 ring-cye-orange/30 xl:scale-[1.03]"
                    : "border-cye-blue/10",
                )}
              >
                {tier.highlight ? (
                  <p className="mb-3 inline-flex w-fit rounded-full bg-cye-orange px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white">
                    Premier partnership
                  </p>
                ) : null}
                <h3 className="font-heading text-2xl font-black uppercase tracking-tight text-cye-blue">
                  {tier.tier}
                </h3>
                <p className="mt-2 font-heading text-2xl font-extrabold text-cye-orange">{tier.price}</p>
                <ul className="mt-5 flex-1 space-y-2.5">
                  {tier.benefits.map((benefit) => (
                    <li key={benefit} className="flex gap-2 text-sm text-cye-ink/75">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-cye-orange" aria-hidden />
                      {benefit}
                    </li>
                  ))}
                </ul>
                <Button href="#contact" className="mt-6 w-full" variant={tier.highlight ? "primary" : "secondary"}>
                  Choose {tier.tier}
                </Button>
              </article>
            </FadeIn>
          ))}
        </div>
      </Container>
    </section>
  );
}
