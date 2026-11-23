import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { SiteChrome } from "@/components/SiteChrome";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Container } from "@/components/ui/Container";
import { FadeIn } from "@/components/ui/FadeIn";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { MEMBERSHIP_ORGS } from "@/data/event";

export const metadata: Metadata = {
  title: "Membership | Capital Youth Expo 2026",
  description: "Membership forms for Bazm-e-Paigham (school-going children), Youth Insight and IJT Islamabad.",
};

/** Membership landing page (printed as a QR code): one card per organization, each opening its form. */
export default function MembershipPage() {
  return (
    <SiteChrome>
      <main id="main">
        <section className="bg-wash pt-32 pb-20 sm:pt-36 sm:pb-24">
          <Container>
            <FadeIn>
              <Breadcrumbs current="Membership" />
              <SectionHeading eyebrow="Join us" title="Membership forms" description="Choose the organization you want to join and fill in its membership form." />
            </FadeIn>
            <div className="mx-auto mt-10 grid max-w-5xl gap-5 md:grid-cols-3">
              {MEMBERSHIP_ORGS.map((org, i) => {
                return (
                  <FadeIn key={org.slug} delay={i * 0.05}>
                    <Link
                      href={`/membership/${org.slug}`}
                      className="group flex h-full flex-col rounded-3xl border border-cye-blue/10 bg-white p-6 shadow-card transition hover:-translate-y-0.5 hover:border-cye-orange/40 sm:p-7"
                    >
                      {org.logo ? (
                        <span className="mb-5 flex h-20 items-center">
                          <Image src={org.logo} alt={`${org.name} logo`} width={240} height={100} sizes="180px" className="h-full w-auto max-w-[180px] object-contain" />
                        </span>
                      ) : null}
                      <p className="text-xs font-bold uppercase tracking-[0.2em] text-cye-orange">For</p>
                      <h2 className="mt-1 font-heading text-2xl font-extrabold leading-tight text-cye-blue">{org.name}</h2>
                      <p className="mt-2 text-sm font-semibold text-cye-ink/70">{org.audience}</p>
                      <span className="mt-auto inline-flex items-center gap-1.5 pt-6 font-heading text-sm font-bold uppercase tracking-wide text-cye-orange">
                        Open membership form
                        <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" aria-hidden />
                      </span>
                    </Link>
                  </FadeIn>
                );
              })}
            </div>
          </Container>
        </section>
      </main>
    </SiteChrome>
  );
}
