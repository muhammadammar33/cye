import { Check } from "lucide-react";
import { STALLS } from "@/data/event";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import { FadeIn } from "@/components/ui/FadeIn";
import { SectionHeading } from "@/components/ui/SectionHeading";

export function Stalls() {
  return (
    <section className="bg-wash-mist py-20 sm:py-24">
      <Container>
        <FadeIn>
          <SectionHeading
            eyebrow="Exhibit"
            title="Stall Packages"
            description="Secure a presence on the expo floor and put your brand in front of thousands of students, educators, and young professionals."
          />
        </FadeIn>
        <div className="mt-12 grid gap-5 lg:grid-cols-2">
          {STALLS.map((stall, index) => (
            <FadeIn key={stall.tier} delay={index * 0.08}>
              <Card className="h-full p-7 sm:p-8">
                <div className="flex flex-wrap items-end justify-between gap-3">
                  <h3 className="font-heading text-2xl font-black uppercase text-cye-blue">
                    {stall.tier}
                  </h3>
                  <p className="font-heading text-2xl font-extrabold text-cye-orange">{stall.price}</p>
                </div>
                <ul className="mt-6 space-y-2.5">
                  {stall.benefits.map((benefit) => (
                    <li key={benefit} className="flex gap-2 text-sm text-cye-ink/75 sm:text-base">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-cye-orange" aria-hidden />
                      {benefit}
                    </li>
                  ))}
                </ul>
                <Button href="#contact" className="mt-7">
                  Book {stall.tier}
                </Button>
              </Card>
            </FadeIn>
          ))}
        </div>
      </Container>
    </section>
  );
}
