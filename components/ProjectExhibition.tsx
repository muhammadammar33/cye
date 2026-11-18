import { FOCAL_PERSONS, GENDERS, VERTICALS } from "@/data/event";
import { FocalPerson } from "@/components/ui/FocalPerson";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { ClosedNotice } from "@/components/ui/ClosedNotice";
import { Container } from "@/components/ui/Container";
import { FadeIn } from "@/components/ui/FadeIn";
import { InterestForm } from "@/components/ui/InterestForm";
import { CONSENT_FIELDS } from "@/lib/consent";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getSettings } from "@/lib/content";

export async function ProjectExhibition() {
  const { registration_open: REGISTRATION_OPEN, inboxes: EMAILS } = await getSettings();
  return (
    <section className="bg-wash pt-32 pb-20 sm:pt-36 sm:pb-24">
      <Container>
        <FadeIn>
          <Breadcrumbs current="Project Exhibition" />
          <SectionHeading
            eyebrow="Showcase"
            title="Project Exhibition"
            description="Present the project you have been building (engineering, research, design, or social innovation) to judges, industry leaders, and 40,000+ visitors."
          />
        </FadeIn>


        <FadeIn delay={0.1} className="mx-auto mt-12 max-w-2xl rounded-3xl border border-white/80 bg-white p-6 shadow-card sm:p-8">
          <h3 className="font-heading text-xl font-extrabold text-cye-blue">Project submission</h3>
          <p className="mt-2 text-sm text-cye-ink/65">
            Share a link to your project document (Google Drive, Dropbox, or similar). Shortlisted teams get an
            exhibition space on expo day.
          </p>
          <FocalPerson
            className="mt-4"
            title="Focal person, Project Exhibition"
            name={FOCAL_PERSONS.projectExhibition.name}
            phone={FOCAL_PERSONS.projectExhibition.phone}
          />
          <div className="mt-6">
            {REGISTRATION_OPEN.projects ? (
              <InterestForm
                type="project"
                to={EMAILS.projects}
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
                  { name: "gender", label: "Team lead gender", type: "select", required: true, options: [...GENDERS], placeholder: "Select gender" },
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
