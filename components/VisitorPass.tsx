import { CalendarDays, Check, MapPin } from "lucide-react";
import { EDUCATION_LEVELS, EMAILS, EVENT, REGISTRATION_OPEN, VISITOR_PERKS } from "@/data/event";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { ClosedNotice } from "@/components/ui/ClosedNotice";
import { Container } from "@/components/ui/Container";
import { FadeIn } from "@/components/ui/FadeIn";
import { InterestForm } from "@/components/ui/InterestForm";
import { CONSENT_FIELDS } from "@/lib/consent";
import { SectionHeading } from "@/components/ui/SectionHeading";

export function VisitorPass() {
  return (
    <section className="bg-wash-mist pt-32 pb-20 sm:pt-36 sm:pb-24">
      <Container>
        <FadeIn>
          <Breadcrumbs current="Visitor Pass" />
          <SectionHeading
            eyebrow="Attend"
            title="Grab Your Visitor Pass"
            description="Register once to explore every vertical, sit in on sessions, meet employers at the job fair, and cheer on the competitions."
          />
        </FadeIn>
        <div className="mt-12 grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <FadeIn className="space-y-6">
            <div className="rounded-3xl border border-cye-blue/10 bg-white p-6 shadow-card sm:p-7">
              <h3 className="font-heading text-sm font-bold uppercase tracking-wider text-cye-blue">Your pass includes</h3>
              <ul className="mt-4 space-y-2.5">
                {VISITOR_PERKS.map((item) => (
                  <li key={item} className="flex gap-2 text-sm text-cye-ink/75 sm:text-base">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-cye-orange" aria-hidden />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="space-y-2 rounded-3xl bg-white/70 p-6 text-sm font-medium text-cye-ink/75 sm:p-7">
              <p className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-cye-orange" aria-hidden />
                {EVENT.date}
              </p>
              <p className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-cye-orange" aria-hidden />
                {EVENT.venue}, {EVENT.city}
              </p>
            </div>
          </FadeIn>
          <FadeIn delay={0.08} className="rounded-3xl border border-white/80 bg-white p-6 shadow-card sm:p-8">
            <h3 className="font-heading text-xl font-extrabold text-cye-blue">Visitor registration</h3>
            <div className="mt-6">
              {REGISTRATION_OPEN.visitors ? (
                <InterestForm
                  to={EMAILS.visitors}
                  subjectPrefix="CYE 2026 visitor registration"
                  submitLabel="Get my pass"
                  fields={[
                    { name: "name", label: "Full name", required: true, autoComplete: "name" },
                    { name: "email", label: "Email", type: "email", required: true, autoComplete: "email" },
                    { name: "phone", label: "Phone (WhatsApp preferred)", type: "tel", required: true, autoComplete: "tel" },
                    { name: "age", label: "Age", type: "number", required: true },
                    { name: "institution", label: "Institution / organization", required: true, autoComplete: "organization" },
                    {
                      name: "level",
                      label: "Current level",
                      type: "select",
                      required: true,
                      options: [...EDUCATION_LEVELS, "Professional"],
                      placeholder: "Select your level",
                    },
                    ...CONSENT_FIELDS,
                  ]}
                />
              ) : (
                <ClosedNotice what="Visitor registration" email={EMAILS.visitors} />
              )}
            </div>
          </FadeIn>
        </div>
      </Container>
    </section>
  );
}
