import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import { FadeIn } from "@/components/ui/FadeIn";
import { SectionHeading } from "@/components/ui/SectionHeading";

const PATHS = [
  {
    href: "/competitions",
    title: "Competitions",
    desc: "Enter hackathons, pitches, exhibitions, and school talent events across all five verticals.",
    cta: "Open competitions",
  },
  {
    href: "/ambassadors",
    title: "Campus Ambassador",
    desc: "Represent CYE 2026 at your institution and drive campus registrations.",
    cta: "Apply now",
  },
  {
    href: "/volunteers",
    title: "Volunteer",
    desc: "Join operations, hospitality, media, and stage teams before and on expo day.",
    cta: "Volunteer form",
  },
];

export function GetInvolved() {
  return (
    <section className="bg-wash py-20 sm:py-24">
      <Container>
        <FadeIn>
          <SectionHeading
            eyebrow="Get involved"
            title="Register to Compete or Join the Team"
            description="Campus ambassadors, volunteers, and competition teams each have their own registration page."
          />
        </FadeIn>
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {PATHS.map((item, index) => (
            <FadeIn key={item.href} delay={index * 0.06}>
              <Card className="flex h-full flex-col p-6 sm:p-7">
                <h3 className="font-heading text-xl font-extrabold text-cye-blue">{item.title}</h3>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-cye-ink/70">{item.desc}</p>
                <Button href={item.href} className="mt-6 w-full">
                  {item.cta}
                </Button>
              </Card>
            </FadeIn>
          ))}
        </div>
      </Container>
    </section>
  );
}
