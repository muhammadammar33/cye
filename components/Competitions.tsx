import { COMPETITIONS, EMAILS } from "@/data/event";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import { FadeIn } from "@/components/ui/FadeIn";
import { InterestForm } from "@/components/ui/InterestForm";
import { SectionHeading } from "@/components/ui/SectionHeading";

const ACCENT: Record<string, string> = {
  TechNexus: "text-cye-blue bg-cye-blue/10",
  Spectrum: "text-cye-orange bg-cye-orange/10",
  VentureX: "text-amber-700 bg-amber-100",
  BioNova: "text-emerald-700 bg-emerald-100",
  "Talent Fiesta": "text-violet-700 bg-violet-100",
};

export function Competitions() {
  return (
    <section className="bg-wash pt-32 pb-20 sm:pt-36 sm:pb-24">
      <Container>
        <FadeIn>
          <SectionHeading
            eyebrow="Compete"
            title="Competitions"
            description="Register your interest for CYE 2026 competitions across all five verticals — university challenges and school-level talent events."
          />
        </FadeIn>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {COMPETITIONS.map((item, index) => (
            <FadeIn key={item.name} delay={index * 0.04}>
              <Card className="flex h-full flex-col p-6">
                <span
                  className={`inline-flex w-fit rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wide ${ACCENT[item.vertical] ?? ACCENT.TechNexus}`}
                >
                  {item.vertical}
                </span>
                <h3 className="mt-4 font-heading text-lg font-extrabold text-cye-blue">{item.name}</h3>
                <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-cye-ink/45">
                  {item.audience}
                </p>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-cye-ink/70">{item.desc}</p>
                <Button href="#competition-register" variant="secondary" className="mt-5 w-full">
                  Register interest
                </Button>
              </Card>
            </FadeIn>
          ))}
        </div>
        <FadeIn delay={0.1} className="mx-auto mt-12 max-w-2xl rounded-3xl border border-white/80 bg-white p-6 shadow-card sm:p-8">
          <div id="competition-register" className="scroll-mt-28">
            <h3 className="font-heading text-xl font-extrabold text-cye-blue">Competition registration</h3>
            <p className="mt-2 text-sm text-cye-ink/65">
              Tell us which event you want to enter. Teams are welcome — add your team name if you have one.
            </p>
            <div className="mt-6">
              <InterestForm
                to={EMAILS.competitions}
                subjectPrefix="CYE 2026 competition registration"
                submitLabel="Submit registration"
                fields={[
                  { name: "name", label: "Full name", required: true, autoComplete: "name" },
                  { name: "email", label: "Email", type: "email", required: true, autoComplete: "email" },
                  { name: "phone", label: "Phone", type: "tel", required: true, autoComplete: "tel" },
                  { name: "institution", label: "Institution", required: true, autoComplete: "organization" },
                  {
                    name: "competition",
                    label: "Competition",
                    type: "select",
                    required: true,
                    options: COMPETITIONS.map((item) => item.name),
                    placeholder: "Select a competition",
                    span: 2,
                  },
                  { name: "team", label: "Team name (optional)", placeholder: "Solo or team name" },
                  { name: "size", label: "Team size (optional)", placeholder: "e.g. 3" },
                  { name: "message", label: "Message", type: "textarea", required: true, placeholder: "Experience, project idea, or notes" },
                ]}
              />
            </div>
          </div>
        </FadeIn>
      </Container>
    </section>
  );
}
