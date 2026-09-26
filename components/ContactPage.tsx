import { CalendarDays, Mail, MapPin, Phone } from "lucide-react";
import { CONTACTS, EMAILS, EVENT } from "@/data/event";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Card } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import { FadeIn } from "@/components/ui/FadeIn";
import { InterestForm } from "@/components/ui/InterestForm";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { SocialLinks } from "@/components/ui/SocialLinks";

export function ContactPage() {
  return (
    <section className="bg-wash pt-32 pb-20 sm:pt-36 sm:pb-24">
      <Container>
        <FadeIn>
          <Breadcrumbs current="Contact" />
          <SectionHeading
            eyebrow="Get in touch"
            title="Contact Us"
            description="Questions about competitions, sponsorship, stalls, or startups? Reach the right team directly or send us a message."
          />
        </FadeIn>
        <div className="mt-12 grid gap-5 sm:grid-cols-2">
          {CONTACTS.map((contact, index) => (
            <FadeIn key={contact.label} delay={index * 0.05}>
              <Card className="h-full p-6">
                <h3 className="font-heading text-base font-extrabold text-cye-blue">{contact.label}</h3>
                <ul className="mt-3 space-y-2 text-sm text-cye-ink/75">
                  {contact.phones.map((phone) => (
                    <li key={phone}>
                      <a href={`tel:${phone.replace(/\s/g, "")}`} className="inline-flex items-center gap-2 hover:text-cye-orange">
                        <Phone className="h-4 w-4 text-cye-orange" aria-hidden />
                        {phone}
                      </a>
                    </li>
                  ))}
                  <li>
                    <a href={`mailto:${contact.email}`} className="inline-flex items-center gap-2 break-words hover:text-cye-orange">
                      <Mail className="h-4 w-4 shrink-0 text-cye-orange" aria-hidden />
                      {contact.email}
                    </a>
                  </li>
                </ul>
              </Card>
            </FadeIn>
          ))}
        </div>
        <div className="mt-12 grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <FadeIn className="rounded-3xl bg-cye-blue-dk p-6 text-white sm:p-8">
            <h3 className="font-heading text-sm font-bold uppercase tracking-wider text-cye-orange-lt">Event venue</h3>
            <p className="mt-4 flex items-start gap-2 text-lg font-semibold">
              <MapPin className="mt-1 h-5 w-5 shrink-0 text-cye-orange-lt" aria-hidden />
              {EVENT.venue}, {EVENT.city}
            </p>
            <p className="mt-3 flex items-center gap-2 text-white/80">
              <CalendarDays className="h-5 w-5 text-cye-orange-lt" aria-hidden />
              {EVENT.date}
            </p>
            <p className="mt-8 font-heading text-sm font-bold uppercase tracking-wider text-cye-orange-lt">Follow CYE</p>
            <SocialLinks className="mt-4" />
          </FadeIn>
          <FadeIn delay={0.08} className="rounded-3xl border border-white/80 bg-white p-6 shadow-card sm:p-8">
            <h3 className="font-heading text-xl font-extrabold text-cye-blue">Send us a message</h3>
            <div className="mt-6">
              <InterestForm
                to={EMAILS.info}
                subjectPrefix="CYE 2026 enquiry"
                submitLabel="Send message"
                fields={[
                  { name: "name", label: "Your name", required: true, autoComplete: "name" },
                  { name: "email", label: "Your email", type: "email", required: true, autoComplete: "email" },
                  { name: "subject", label: "Subject", required: true, span: 2 },
                  { name: "message", label: "Message", type: "textarea", required: true },
                ]}
              />
            </div>
          </FadeIn>
        </div>
      </Container>
    </section>
  );
}
