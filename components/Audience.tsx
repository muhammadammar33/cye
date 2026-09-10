import { Building2, Globe, GraduationCap } from "lucide-react";
import { AUDIENCE } from "@/data/event";
import { Card } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import { FadeIn } from "@/components/ui/FadeIn";
import { SectionHeading } from "@/components/ui/SectionHeading";

const ICONS = [GraduationCap, Building2, Globe];

export function Audience() {
  return (
    <section className="bg-wash-mist py-20 sm:py-24">
      <Container>
        <FadeIn>
          <SectionHeading
            eyebrow="Reach"
            title="Meet the Diverse Audience of Expo"
          />
        </FadeIn>
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {AUDIENCE.map((item, index) => {
            const Icon = ICONS[index] ?? Globe;
            return (
              <FadeIn key={item.label} delay={index * 0.08}>
                <Card className="flex items-center gap-5 px-6 py-7 sm:px-8">
                  <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-cye-orange/10 text-cye-orange">
                    <Icon className="h-7 w-7" aria-hidden />
                  </span>
                  <div>
                    <p className="font-heading text-3xl font-black text-cye-blue sm:text-4xl">
                      {item.value}
                    </p>
                    <p className="mt-1 font-medium text-cye-ink/65">{item.label}</p>
                  </div>
                </Card>
              </FadeIn>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
