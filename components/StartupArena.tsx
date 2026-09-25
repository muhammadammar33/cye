import { Check } from "lucide-react";
import { EMAILS, REGISTRATION_OPEN, STARTUP_PERKS, STARTUP_SECTORS, STARTUP_STAGES } from "@/data/event";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { ClosedNotice } from "@/components/ui/ClosedNotice";
import { Container } from "@/components/ui/Container";
import { FadeIn } from "@/components/ui/FadeIn";
import { InterestForm } from "@/components/ui/InterestForm";
import { CONSENT_FIELDS } from "@/lib/consent";
import { SectionHeading } from "@/components/ui/SectionHeading";

export function StartupArena() {
  return (
    <section className="bg-white pt-32 pb-20 sm:pt-36 sm:pb-24">
      <Container>
        <FadeIn>
          <Breadcrumbs current="Startup Arena" />
          <SectionHeading
            eyebrow="VentureX"
            title="Startup Arena"
            description="Submit your startup and pitch deck for a chance to be shortlisted for investor networking, mentorship, and exhibition space at CYE 2026."
          />
        </FadeIn>
        <div className="mt-12 grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <FadeIn className="space-y-6">
            <div className="rounded-3xl bg-cye-mist p-6 sm:p-7">
              <h3 className="font-heading text-sm font-bold uppercase tracking-wider text-cye-orange">
                What shortlisted startups get
              </h3>
              <ul className="mt-4 space-y-2.5">
                {STARTUP_PERKS.map((item) => (
                  <li key={item} className="flex gap-2 text-sm text-cye-ink/75 sm:text-base">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-cye-orange" aria-hidden />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-3xl border border-cye-blue/10 bg-white p-6 shadow-card sm:p-7">
              <p className="font-display text-2xl text-cye-orange">Pitch smart. Connect big.</p>
              <p className="mt-2 text-sm leading-relaxed text-cye-ink/70">
                Academic incubators and corporates who want to scout startups can reach the team at{" "}
                <a href={`mailto:${EMAILS.startups}`} className="font-semibold text-cye-blue hover:text-cye-orange">
                  {EMAILS.startups}
                </a>
                .
              </p>
            </div>
          </FadeIn>
          <FadeIn delay={0.08} className="rounded-3xl border border-white/80 bg-white p-6 shadow-card sm:p-8">
            <h3 className="font-heading text-xl font-extrabold text-cye-blue">Startup submission</h3>
            <div className="mt-6">
              {REGISTRATION_OPEN.startups ? (
                <InterestForm
                  to={EMAILS.startups}
                  subjectPrefix="CYE 2026 startup submission"
                  submitLabel="Submit startup"
                  fields={[
                    { name: "startup", label: "Startup name", required: true, autoComplete: "organization" },
                    { name: "name", label: "Founder name", required: true, autoComplete: "name" },
                    { name: "email", label: "Email", type: "email", required: true, autoComplete: "email" },
                    { name: "phone", label: "Phone", type: "tel", required: true, autoComplete: "tel" },
                    {
                      name: "sector",
                      label: "Sector",
                      type: "select",
                      required: true,
                      options: STARTUP_SECTORS,
                      placeholder: "Select a sector",
                    },
                    {
                      name: "stage",
                      label: "Stage",
                      type: "select",
                      required: true,
                      options: STARTUP_STAGES,
                      placeholder: "Select a stage",
                    },
                    { name: "team", label: "Team size", type: "number", required: true },
                    { name: "website", label: "Website (optional)", type: "url", placeholder: "https://" },
                    { name: "deck", label: "Pitch deck link", type: "url", required: true, placeholder: "https://", span: 2 },
                    { name: "description", label: "What problem are you solving?", type: "textarea", required: true },
                    ...CONSENT_FIELDS,
                  ]}
                />
              ) : (
                <ClosedNotice what="Startup submission" email={EMAILS.startups} />
              )}
            </div>
          </FadeIn>
        </div>
      </Container>
    </section>
  );
}
