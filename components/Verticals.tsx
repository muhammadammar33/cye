import { Cpu, Leaf, Palette, Sparkles, TrendingUp } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { ACTIVITIES, VERTICALS } from "@/data/event";
import { ArcDecoration } from "@/components/ui/ArcDecoration";
import { Card } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import { FadeIn } from "@/components/ui/FadeIn";
import { SectionHeading } from "@/components/ui/SectionHeading";

const META: Record<string, { icon: LucideIcon; accent: string }> = {
  TechNexus: { icon: Cpu, accent: "bg-cye-blue/10 text-cye-blue" },
  Spectrum: { icon: Palette, accent: "bg-cye-orange/10 text-cye-orange" },
  VentureX: { icon: TrendingUp, accent: "bg-amber-100 text-amber-700" },
  BioNova: { icon: Leaf, accent: "bg-emerald-100 text-emerald-700" },
  "Talent Fiesta": { icon: Sparkles, accent: "bg-violet-100 text-violet-700" },
};

export function Verticals() {
  return (
    <section id="verticals" className="relative scroll-mt-24 overflow-hidden bg-white py-20 sm:py-24">
      <ArcDecoration corner="top-right" className="opacity-40" size={440} />
      <Container className="relative">
        <FadeIn>
          <SectionHeading
            eyebrow="What We're Offering"
            title="Five Distinct Verticals"
            description="CYE 2026 unites five distinct verticals, each designed to serve a specific academic and professional audience through specialized competitions, workshops, exhibitions, and speaker sessions."
          />
        </FadeIn>
        {/* Flex-wrap so the short last row is centered (2 columns on md, 3 on xl). */}
        <div className="mt-12 flex flex-wrap justify-center gap-5">
          {VERTICALS.map((vertical, index) => {
            const meta = META[vertical.name] ?? META.TechNexus;
            const Icon = meta.icon;
            return (
              <FadeIn
                key={vertical.name}
                delay={index * 0.06}
                className="w-full md:w-[calc((100%-1.25rem)/2)] xl:w-[calc((100%-2.5rem)/3)]"
              >
                <Card className="h-full p-6 sm:p-7">
                  <span className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl ${meta.accent}`}>
                    <Icon className="h-6 w-6" aria-hidden />
                  </span>
                  <h3 className="mt-5 font-heading text-xl font-extrabold text-cye-blue">
                    {vertical.name}
                  </h3>
                  <p className="mt-1 text-sm font-semibold uppercase tracking-wide text-cye-orange">
                    {vertical.subtitle}
                  </p>
                  <p className="mt-3 text-sm leading-relaxed text-cye-ink/70 sm:text-base">
                    {vertical.desc}
                  </p>
                </Card>
              </FadeIn>
            );
          })}
        </div>
        <FadeIn delay={0.15} className="mt-10 flex flex-wrap justify-center gap-2">
          {ACTIVITIES.map((activity) => (
            <span
              key={activity}
              className="rounded-full border border-cye-blue/15 bg-cye-mist px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wide text-cye-blue sm:text-sm"
            >
              {activity}
            </span>
          ))}
        </FadeIn>
      </Container>
    </section>
  );
}
