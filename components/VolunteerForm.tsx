import { EMAILS, EVENT, REGISTRATION_OPEN, VOLUNTEER_ROLES } from "@/data/event";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Card } from "@/components/ui/Card";
import { ClosedNotice } from "@/components/ui/ClosedNotice";
import { Container } from "@/components/ui/Container";
import { FadeIn } from "@/components/ui/FadeIn";
import { InterestForm } from "@/components/ui/InterestForm";
import { SectionHeading } from "@/components/ui/SectionHeading";

export function VolunteerForm() {
  return (
    <section className="bg-wash-mist pt-32 pb-20 sm:pt-36 sm:pb-24">
      <Container>
        <FadeIn>
          <Breadcrumbs current="Volunteer" />
          <SectionHeading
            eyebrow="Join the team"
            title="Volunteer Form"
            description="CYE is built by a community of 2,000+ volunteers. Pick a role, tell us your availability, and help deliver Islamabad's largest youth expo."
          />
        </FadeIn>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {VOLUNTEER_ROLES.map((role, index) => (
            <FadeIn key={role.name} delay={index * 0.04}>
              <Card className="h-full p-5 sm:p-6">
                <h3 className="font-heading text-base font-extrabold text-cye-blue">{role.name}</h3>
                <p className="mt-2 text-sm leading-relaxed text-cye-ink/70">{role.desc}</p>
              </Card>
            </FadeIn>
          ))}
        </div>
        <FadeIn delay={0.1} className="mx-auto mt-12 max-w-2xl rounded-3xl border border-white/80 bg-white p-6 shadow-card sm:p-8">
          <h3 className="font-heading text-xl font-extrabold text-cye-blue">Volunteer sign-up</h3>
          <p className="mt-2 text-sm text-cye-ink/65">
            Pre-event outreach starts weeks before {EVENT.date}. Expo-day roles are assigned after a short briefing.
          </p>
          <div className="mt-6">
            {REGISTRATION_OPEN.volunteers ? (
              <InterestForm
                to={EMAILS.volunteers}
                subjectPrefix="CYE 2026 volunteer application"
                submitLabel="Submit volunteer form"
                fields={[
                  { name: "name", label: "Full name", required: true, autoComplete: "name" },
                  { name: "email", label: "Email", type: "email", required: true, autoComplete: "email" },
                  { name: "phone", label: "Phone", type: "tel", required: true, autoComplete: "tel" },
                  { name: "institution", label: "Institution / organization", required: true, autoComplete: "organization" },
                  {
                    name: "role",
                    label: "Preferred role",
                    type: "select",
                    required: true,
                    options: VOLUNTEER_ROLES.map((role) => role.name),
                    placeholder: "Select a role",
                  },
                  {
                    name: "availability",
                    label: "Availability",
                    type: "select",
                    required: true,
                    options: ["Expo day only", "Pre-event outreach only", "Both pre-event and expo day"],
                  },
                  { name: "message", label: "Relevant experience", type: "textarea", required: true },
                ]}
              />
            ) : (
              <ClosedNotice what="Volunteer registration" email={EMAILS.volunteers} />
            )}
          </div>
        </FadeIn>
      </Container>
    </section>
  );
}
