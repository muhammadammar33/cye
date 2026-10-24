import { Award, CalendarDays, Check, MapPin } from "lucide-react";
import { EVENT } from "@/data/event";
import { TalentForm } from "@/components/talent/TalentForm";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { ClosedNotice } from "@/components/ui/ClosedNotice";
import { Container } from "@/components/ui/Container";
import { FadeIn } from "@/components/ui/FadeIn";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getSettings } from "@/lib/content";
import { ELIGIBLE_PERCENT, minGpa } from "@/lib/eligibility";

const RULES = [
  `Students from Class 9 to BS with ${ELIGIBLE_PERCENT}% or above in their latest result`,
  `Marks: obtained ÷ total of ${ELIGIBLE_PERCENT}% or more, e.g. 880 out of 1100`,
  `GPA / CGPA: ${minGpa(4)} or above out of 4.0, or ${minGpa(5)} or above out of 5.0`,
  "Upload your result card (photo, screenshot or PDF) as proof",
  "Free to apply",
];

export async function TalentTribute() {
  const { registration_open: open, inboxes } = await getSettings();
  return (
    <section className="bg-wash-mist pt-32 pb-20 sm:pt-36 sm:pb-24">
      <Container>
        <FadeIn>
          <Breadcrumbs current="Talent Tribute" />
          <SectionHeading
            eyebrow="Recognition"
            title="Talent Tribute"
            description={`Capital Youth Expo 2026 honours students who scored ${ELIGIBLE_PERCENT}% or above, from Class 9 to BS. Check your eligibility and apply with your result card.`}
          />
        </FadeIn>
        <div className="mt-12 grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <FadeIn className="space-y-6">
            <div className="rounded-3xl border border-cye-blue/10 bg-white p-6 shadow-card sm:p-7">
              <h3 className="flex items-center gap-2 font-heading text-sm font-bold uppercase tracking-wider text-cye-blue">
                <Award className="h-4 w-4 text-cye-orange" aria-hidden />
                Who can apply
              </h3>
              <ul className="mt-4 space-y-2.5">
                {RULES.map((item) => (
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
            <h3 className="font-heading text-xl font-extrabold text-cye-blue">Apply for Talent Tribute</h3>
            <div className="mt-6">
              {open.talent ? <TalentForm inbox={inboxes.talent} /> : <ClosedNotice what="Talent Tribute applications" email={inboxes.talent} />}
            </div>
          </FadeIn>
        </div>
      </Container>
    </section>
  );
}
