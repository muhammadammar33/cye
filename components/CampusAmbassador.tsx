import { Check } from "lucide-react";
import { AMBASSADOR_DUTIES, AMBASSADOR_PERKS, EMAILS, REGISTRATION_OPEN } from "@/data/event";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { ClosedNotice } from "@/components/ui/ClosedNotice";
import { Container } from "@/components/ui/Container";
import { FadeIn } from "@/components/ui/FadeIn";
import { InterestForm } from "@/components/ui/InterestForm";
import { SectionHeading } from "@/components/ui/SectionHeading";

export function CampusAmbassador() {
  return (
    <section className="bg-white pt-32 pb-20 sm:pt-36 sm:pb-24">
      <Container>
        <FadeIn>
          <Breadcrumbs current="Campus Ambassador" />
          <SectionHeading
            eyebrow="Lead your campus"
            title="Campus Ambassador Registration"
            description="Become the face of CYE 2026 at your institution. Ambassadors drive registrations, host campus activations, and help us reach 700+ educational institutions across Islamabad."
          />
        </FadeIn>
        <div className="mt-12 grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <FadeIn className="space-y-6">
            <div className="rounded-3xl bg-cye-mist p-6 sm:p-7">
              <h3 className="font-heading text-sm font-bold uppercase tracking-wider text-cye-orange">
                What you will do
              </h3>
              <ul className="mt-4 space-y-2.5">
                {AMBASSADOR_DUTIES.map((item) => (
                  <li key={item} className="flex gap-2 text-sm text-cye-ink/75 sm:text-base">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-cye-orange" aria-hidden />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-3xl border border-cye-blue/10 bg-white p-6 shadow-card sm:p-7">
              <h3 className="font-heading text-sm font-bold uppercase tracking-wider text-cye-blue">
                What you get
              </h3>
              <ul className="mt-4 space-y-2.5">
                {AMBASSADOR_PERKS.map((item) => (
                  <li key={item} className="flex gap-2 text-sm text-cye-ink/75 sm:text-base">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-cye-orange" aria-hidden />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </FadeIn>
          <FadeIn delay={0.08} className="rounded-3xl border border-cye-blue/10 bg-white p-6 shadow-card sm:p-8">
            <h3 className="font-heading text-xl font-extrabold text-cye-blue">Apply now</h3>
            <p className="mt-2 text-sm text-cye-ink/65">
              Open to students across Islamabad. We review applications on a rolling basis.
            </p>
            <div className="mt-6">
              {REGISTRATION_OPEN.ambassadors ? (
                <InterestForm
                  to={EMAILS.ambassadors}
                  subjectPrefix="CYE 2026 campus ambassador application"
                  submitLabel="Submit ambassador application"
                  fields={[
                    { name: "name", label: "Full name", required: true, autoComplete: "name" },
                    { name: "email", label: "Email", type: "email", required: true, autoComplete: "email" },
                    { name: "phone", label: "Phone", type: "tel", required: true, autoComplete: "tel" },
                    { name: "institution", label: "Institution", required: true, autoComplete: "organization" },
                    { name: "program", label: "Degree / program", required: true },
                    {
                      name: "year",
                      label: "Year of study",
                      type: "select",
                      required: true,
                      options: ["1st year", "2nd year", "3rd year", "4th year", "Graduate", "Other"],
                    },
                    { name: "city", label: "City", required: true, autoComplete: "address-level2", span: 2 },
                    {
                      name: "message",
                      label: "Why do you want to be a Campus Ambassador?",
                      type: "textarea",
                      required: true,
                    },
                  ]}
                />
              ) : (
                <ClosedNotice what="Campus Ambassador registration" email={EMAILS.ambassadors} />
              )}
            </div>
          </FadeIn>
        </div>
      </Container>
    </section>
  );
}
