import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteChrome } from "@/components/SiteChrome";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { ClosedNotice } from "@/components/ui/ClosedNotice";
import { Container } from "@/components/ui/Container";
import { FadeIn } from "@/components/ui/FadeIn";
import { InterestForm, type InterestField } from "@/components/ui/InterestForm";
import { GENDERS, MEMBERSHIP_ORGS, type MembershipOrg } from "@/data/event";
import { getSettings } from "@/lib/content";
import { CONSENT_FIELDS } from "@/lib/consent";

const find = (slug: string) => MEMBERSHIP_ORGS.find((o) => o.slug === slug);

export function generateStaticParams() {
  return MEMBERSHIP_ORGS.map((o) => ({ org: o.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ org: string }> }): Promise<Metadata> {
  const org = find((await params).org);
  return org ? { title: `${org.name} membership | Capital Youth Expo 2026`, description: `${org.name} membership form. ${org.audience}.` } : {};
}

function fieldsFor(org: MembershipOrg): InterestField[] {
  if (org.kids) {
    return [
      { name: "name", label: "Child's full name", required: true },
      { name: "age", label: "Age", type: "number", required: true },
      { name: "gender", label: "Gender", type: "select", required: true, options: [...GENDERS], placeholder: "Select gender" },
      { name: "level", label: "Class", required: true, placeholder: "e.g. Class 6" },
      { name: "institution", label: "School", required: true },
      { name: "city", label: "City", required: true, autoComplete: "address-level2" },
      { name: "guardian", label: "Parent / guardian's name", required: true },
      { name: "phone", label: "Parent / guardian's phone", type: "tel", required: true, autoComplete: "tel" },
      { name: "email", label: "Parent / guardian's email", type: "email", required: true, autoComplete: "email", span: 2 },
      ...CONSENT_FIELDS,
    ];
  }
  return [
    { name: "name", label: "Full name", required: true, autoComplete: "name" },
    { name: "email", label: "Email", type: "email", required: true, autoComplete: "email" },
    { name: "phone", label: "Phone", type: "tel", required: true, autoComplete: "tel" },
    { name: "gender", label: "Gender", type: "select", required: true, options: [...GENDERS], placeholder: "Select gender" },
    { name: "institution", label: org.slug === "islami-jamiat-talaba" ? "College / university" : "College / university / organisation", required: true, autoComplete: "organization" },
    { name: "level", label: org.slug === "islami-jamiat-talaba" ? "Programme and semester" : "Education or profession", required: true, placeholder: org.slug === "islami-jamiat-talaba" ? "e.g. BS Computer Science, 3rd semester" : "e.g. BBA student / software engineer" },
    { name: "city", label: "City", required: true, autoComplete: "address-level2" },
    { name: "age", label: "Age", type: "number" },
    { name: "interests", label: "Why do you want to join? (optional)", type: "textarea" },
    ...CONSENT_FIELDS,
  ];
}

/** One organization's membership form (printed as a QR code). */
export default async function MembershipFormPage({ params }: { params: Promise<{ org: string }> }) {
  const org = find((await params).org);
  if (!org) notFound();
  const { registration_open: open, inboxes } = await getSettings();
  return (
    <SiteChrome>
      <main id="main">
        <section className="bg-wash-mist pt-32 pb-20 sm:pt-36 sm:pb-24">
          <Container>
            <FadeIn className="mx-auto max-w-2xl text-center">
              <Breadcrumbs current={`${org.name} membership`} />
              <p className="font-heading text-xs font-bold uppercase tracking-[0.28em] text-cye-orange">Membership form</p>
              <h1 className="mt-3 font-heading text-4xl font-black text-cye-blue sm:text-5xl">{org.name}</h1>
              <p className="mt-2 text-base font-semibold text-cye-ink/70">{org.audience}</p>
              <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-cye-ink/65">{org.about}</p>
            </FadeIn>
            <FadeIn delay={0.08} className="mx-auto mt-10 max-w-2xl rounded-3xl border border-white/80 bg-white p-6 shadow-card sm:p-8">
              <h2 className="font-heading text-xl font-extrabold text-cye-blue">{org.kids ? "Child's details" : "Your details"}</h2>
              {org.kids ? <p className="mt-1 text-sm text-cye-ink/65">A parent or guardian fills this in for the child.</p> : null}
              <div className="mt-6">
                {open.membership ? (
                  <InterestForm key={org.slug} type="membership" to={inboxes.membership} submitLabel="Submit membership form" extra={{ organization: org.name }} fields={fieldsFor(org)} />
                ) : (
                  <ClosedNotice what={`${org.name} membership`} email={inboxes.membership} />
                )}
              </div>
            </FadeIn>
            <p className="mt-8 text-center">
              <Link href="/membership" className="inline-flex items-center gap-1.5 text-sm font-semibold text-cye-blue hover:text-cye-orange">
                <ArrowLeft className="h-4 w-4" aria-hidden />
                All membership forms
              </Link>
            </p>
          </Container>
        </section>
      </main>
    </SiteChrome>
  );
}
