import { EVENT } from "@/data/event";
import { Container } from "@/components/ui/Container";
import { FadeIn } from "@/components/ui/FadeIn";
import { SectionHeading } from "@/components/ui/SectionHeading";

export function About() {
  return (
    <section id="about" className="relative scroll-mt-24 bg-white py-20 sm:py-24">
      <Container>
        <FadeIn>
          <SectionHeading
            eyebrow="What is CYE"
            title="What is Capital Youth Expo"
            description="A leading youth engagement platform in Islamabad — education, innovation, and talent under one roof."
          />
        </FadeIn>
        <FadeIn delay={0.1} className="mx-auto mt-10 max-w-3xl space-y-5 text-center text-base leading-relaxed text-cye-ink/75 sm:text-lg">
          <p>
            Capital Youth Expo (CYE) is a leading youth engagement platform in Islamabad,
            organized by <strong className="text-cye-blue">{EVENT.organizers[0]}</strong> in
            collaboration with{" "}
            <strong className="text-cye-blue">{EVENT.organizers[1]}</strong>. Bringing together
            education, innovation, and talent under one roof, CYE serves as a dynamic space for
            young minds to learn, compete, and connect.
          </p>
          <p>
            CYE 2026 features five distinct verticals — TechNexus, Spectrum, VentureX, BioNova,
            and Talent Fiesta. Through competitions, exhibitions, workshops, and speaker sessions,
            the event aims to engage{" "}
            <strong className="text-cye-orange">40,000+</strong> students, educators, and young
            professionals, supported by outreach to{" "}
            <strong className="text-cye-orange">700+ educational institutions</strong> across
            Islamabad.
          </p>
        </FadeIn>
      </Container>
    </section>
  );
}
