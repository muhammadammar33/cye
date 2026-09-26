import { Award, Medal, Trophy } from "lucide-react";
import { EMAILS, PROJECT_PRIZES, REGISTRATION_OPEN, VERTICALS } from "@/data/event";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Card } from "@/components/ui/Card";
import { ClosedNotice } from "@/components/ui/ClosedNotice";
import { Container } from "@/components/ui/Container";
import { FadeIn } from "@/components/ui/FadeIn";
import { InterestForm } from "@/components/ui/InterestForm";
import { CONSENT_FIELDS } from "@/lib/consent";
import { SectionHeading } from "@/components/ui/SectionHeading";

const PLACE_ICONS = [Trophy, Medal, Award];

export function ProjectExhibition() {
  return (
    <section className="bg-wash pt-32 pb-20 sm:pt-36 sm:pb-24">
      <Container>
        <FadeIn>
          <Breadcrumbs current="Project Exhibition" />
          <SectionHeading
            eyebrow="Showcase"
            title="Project Exhibition"
            description="Present the project you have been building — engineering, research, design, or social innovation — to judges, industry leaders, and 40,000+ visitors."
          />
        </FadeIn>

        <FadeIn delay={0.05} className="mt-12 text-center">
          <p className="font-heading text-xs font-bold uppercase tracking-[0.28em] text-cye-orange">Total prize pool</p>
          <p className="mt-2 font-heading text-4xl font-black text-cye-blue sm:text-5xl">{PROJECT_PRIZES.pool}</p>
        </FadeIn>
        <div className="mx-auto mt-8 grid max-w-4xl gap-5 sm:grid-cols-3">
          {PROJECT_PRIZES.places.map((prize, index) => {
            const Icon = PLACE_ICONS[index] ?? Award;
            return (
              <FadeIn key={prize.place} delay={index * 0.06}>
                <Card className="h-full p-6 text-center">
                  <Icon className="mx-auto h-8 w-8 text-cye-orange" aria-hidden />
                  <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-cye-ink/45">{prize.place}</p>
                  <p className="mt-1 font-heading text-2xl font-black text-cye-blue">{prize.amount}</p>
                </Card>
              </FadeIn>
            );
          })}
        </div>
        <FadeIn delay={0.1} className="mx-auto mt-5 grid max-w-4xl gap-3 sm:grid-cols-2">
          {PROJECT_PRIZES.extras.map((extra) => (
            <div key={extra.label} className="rounded-3xl bg-cye-mist p-5">
              <p className="text-sm text-cye-ink/70">{extra.label}</p>
              <p className="mt-1 font-heading text-lg font-extrabold text-cye-blue">{extra.amount}</p>
            </div>
          ))}
        </FadeIn>

        <FadeIn delay={0.1} className="mx-auto mt-12 max-w-2xl rounded-3xl border border-white/80 bg-white p-6 shadow-card sm:p-8">
          <h3 className="font-heading text-xl font-extrabold text-cye-blue">Project submission</h3>
          <p className="mt-2 text-sm text-cye-ink/65">
            Share a link to your project document (Google Drive, Dropbox, or similar). Shortlisted teams get an
            exhibition space on expo day.
          </p>
          <div className="mt-6">
            {REGISTRATION_OPEN.projects ? (
              <InterestForm
                to={EMAILS.projects}
                subjectPrefix="CYE 2026 project submission"
                submitLabel="Submit project"
                fields={[
                  { name: "title", label: "Project title", required: true, span: 2 },
                  {
                    name: "vertical",
                    label: "Vertical",
                    type: "select",
                    required: true,
                    options: VERTICALS.map((vertical) => vertical.name),
                    placeholder: "Select a vertical",
                  },
                  { name: "institution", label: "Institution", required: true, autoComplete: "organization" },
                  { name: "name", label: "Team lead name", required: true, autoComplete: "name" },
                  { name: "email", label: "Team lead email", type: "email", required: true, autoComplete: "email" },
                  { name: "phone", label: "Team lead phone", type: "tel", required: true, autoComplete: "tel" },
                  { name: "members", label: "Other team members", placeholder: "Names, comma separated" },
                  { name: "description", label: "Project description", type: "textarea", required: true },
                  { name: "document", label: "Project document link", type: "url", required: true, placeholder: "https://", span: 2 },
                  { name: "video", label: "Demo video link (optional)", type: "url", placeholder: "https://" },
                  { name: "website", label: "Website or repo (optional)", type: "url", placeholder: "https://" },
                  ...CONSENT_FIELDS,
                ]}
              />
            ) : (
              <ClosedNotice what="Project submission" email={EMAILS.projects} />
            )}
          </div>
        </FadeIn>
      </Container>
    </section>
  );
}
