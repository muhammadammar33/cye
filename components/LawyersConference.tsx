import { CalendarDays, Gavel, MapPin, Mic2, Users } from "lucide-react";
import { EVENT, FOCAL_PERSONS, GENDERS, LAWYERS_CONFERENCE } from "@/data/event";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { ClosedNotice } from "@/components/ui/ClosedNotice";
import { Container } from "@/components/ui/Container";
import { FadeIn } from "@/components/ui/FadeIn";
import { FocalPerson } from "@/components/ui/FocalPerson";
import { InterestForm } from "@/components/ui/InterestForm";
import { getSettings } from "@/lib/content";
import { CONSENT_FIELDS } from "@/lib/consent";
import { lawyersSeatsLeft } from "@/lib/lawyersConference";

export async function LawyersConference() {
  const [{ registration_open: open, inboxes }, seatsLeft] = await Promise.all([getSettings(), lawyersSeatsLeft().catch(() => LAWYERS_CONFERENCE.capacity)]);
  const full = seatsLeft <= 0;
  const focal = FOCAL_PERSONS.lawyersConference;
  return (
    <section className="bg-wash-mist pt-32 pb-20 sm:pt-36 sm:pb-24">
      <Container>
        <FadeIn>
          <Breadcrumbs current="Lawyers Conference" />
          <div className="mx-auto max-w-5xl text-center">
            <p className="font-heading text-xs font-bold uppercase tracking-[0.28em] text-cye-orange">
              {LAWYERS_CONFERENCE.format} · Lawyers Conference
            </p>
            {/* Each line stays on one line: the size follows the width of this box (container query units). */}
            <h1 className="@container mt-3 font-heading font-black uppercase text-cye-blue">
              <span className="block whitespace-nowrap text-[min(4rem,6.2cqw)] leading-[1.1] tracking-tight">{LAWYERS_CONFERENCE.headline}</span>
              <span className="mt-2 block whitespace-nowrap text-[min(2rem,3.4cqw)] leading-tight text-cye-orange">{LAWYERS_CONFERENCE.subtitle}</span>
            </h1>
            <p className="mx-auto mt-5 max-w-3xl text-base leading-relaxed text-cye-ink/70 sm:text-lg">{LAWYERS_CONFERENCE.about}</p>
            <p className="mt-3 text-sm font-semibold text-cye-blue">Free entry · registration confirms your seat</p>
          </div>
        </FadeIn>
        <div className="mt-12 grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <FadeIn className="space-y-6">
            <div className="rounded-3xl border border-cye-blue/10 bg-white p-6 shadow-card sm:p-7">
              <h3 className="flex items-center gap-2 font-heading text-sm font-bold uppercase tracking-wider text-cye-blue">
                <Mic2 className="h-4 w-4 text-cye-orange" aria-hidden />
                Expected guests
              </h3>
              <ul className="mt-4 space-y-3">
                {LAWYERS_CONFERENCE.guests.map((guest) => (
                  <li key={guest.name} className="flex gap-3">
                    <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-cye-blue/10 text-cye-blue">
                      <Gavel className="h-4 w-4" aria-hidden />
                    </span>
                    <span>
                      <span className="block font-heading font-bold leading-snug text-cye-blue">{guest.name}</span>
                      <span className="block text-sm text-cye-ink/65">{guest.role}</span>
                    </span>
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
              <p className="flex items-center gap-2">
                <Users className="h-4 w-4 text-cye-orange" aria-hidden />
                Open to law students, lawyers and young people from every field · free entry
              </p>
            </div>
            <FocalPerson title="Focal person, Lawyers Conference" name={focal.name} phone={focal.phone} />
          </FadeIn>
          <FadeIn delay={0.08} className="rounded-3xl border border-white/80 bg-white p-6 shadow-card sm:p-8">
            <h3 className="font-heading text-xl font-extrabold text-cye-blue">Register for your seat</h3>
            {full ? <p className="mt-2 text-sm font-semibold text-red-600">All seats are taken.</p> : null}
            <p className="mt-1 text-sm text-cye-ink/65">Once your registration is confirmed, you receive your Lawyers Conference pass by email. Bring it with your student card or bar card.</p>
            <div className="mt-6">
              {open.lawyers && !full ? (
                <InterestForm
                  type="lawyers"
                  to={inboxes.lawyers}
                  submitLabel="Register for the conference"
                  fields={[
                    { name: "name", label: "Full name", required: true, autoComplete: "name" },
                    { name: "email", label: "Email", type: "email", required: true, autoComplete: "email" },
                    { name: "phone", label: "Phone", type: "tel", required: true, autoComplete: "tel" },
                    { name: "gender", label: "Gender", type: "select", required: true, options: [...GENDERS], placeholder: "Select gender" },
                    { name: "status", label: "I am a", type: "select", required: true, options: [...LAWYERS_CONFERENCE.statuses], placeholder: "Choose one" },
                    { name: "institution", label: "University / organisation / bar", required: true, autoComplete: "organization" },
                    ...CONSENT_FIELDS,
                  ]}
                />
              ) : (
                <ClosedNotice what="Lawyers Conference registration" email={inboxes.lawyers} />
              )}
            </div>
          </FadeIn>
        </div>
      </Container>
    </section>
  );
}
