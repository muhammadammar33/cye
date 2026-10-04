"use client";

import { CalendarClock } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { CompetitionCatalog } from "@/components/competitions/CompetitionCatalog";
import { TeamRegistrationForm } from "@/components/competitions/TeamRegistrationForm";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { ClosedNotice } from "@/components/ui/ClosedNotice";
import { Container } from "@/components/ui/Container";
import { FadeIn } from "@/components/ui/FadeIn";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { PaymentDetails } from "@/components/competitions/PaymentDetails";
import type { SlipMode } from "@/components/competitions/TeamRegistrationForm";
import type { Competition } from "@/lib/content";
import type { PaymentSettings } from "@/lib/defaults";

export function Competitions({
  competitions,
  open,
  inbox,
  payment,
  slipMode,
}: {
  competitions: Competition[];
  open: boolean;
  inbox: string;
  payment: PaymentSettings;
  slipMode: SlipMode;
}) {
  const [selected, setSelected] = useState("");

  return (
    <section className="bg-wash pt-32 pb-20 sm:pt-36 sm:pb-24">
      <Container>
        <FadeIn>
          <Breadcrumbs current="Competitions" />
          <SectionHeading
            eyebrow="Compete"
            title="Competitions"
            description="Register for CYE 2026 competitions in robotics, coding, and cyber security, startup pitches, creative and debate events, and literary contests for schools and universities. Enter solo or as a team."
          />
        </FadeIn>
        <FadeIn delay={0.05} className="mx-auto mt-8 flex max-w-3xl flex-col items-center justify-between gap-3 rounded-3xl border border-cye-blue/10 bg-white px-6 py-4 text-center shadow-card sm:flex-row sm:text-left">
          <p className="text-sm text-cye-ink/75">
            <span className="font-heading font-bold text-cye-blue">National Article Writing Competition 2026</span> runs
            separately with its own registration.
          </p>
          <Link href="/article-writing" className="shrink-0 font-heading text-sm font-bold uppercase tracking-wide text-cye-orange hover:text-cye-orange-lt">
            View details
          </Link>
        </FadeIn>
        {competitions.length === 0 ? (
          <ComingSoon />
        ) : (
          <>
        <CompetitionCatalog competitions={competitions} onSelect={setSelected} />
        <FadeIn delay={0.1} className="mx-auto mt-12 max-w-2xl rounded-3xl border border-white/80 bg-white p-6 shadow-card sm:p-8">
          <div id="competition-register" className="scroll-mt-28">
            <h3 className="font-heading text-xl font-extrabold text-cye-blue">Competition registration</h3>
            <p className="mt-2 text-sm text-cye-ink/65">
              Pick a competition and team size, then add details for every team member.{" "}
              {payment.accounts.length
                ? "Pay the registration fee using the details below and attach your payment slip."
                : "Fee payment details are shared after your registration is confirmed."}
            </p>
            {open && payment.accounts.length ? (
              <div className="mt-5">
                <PaymentDetails payment={payment} fee={competitions.find((item) => item.name === selected)?.fee} />
              </div>
            ) : null}
            <div className="mt-6">
              {open ? (
                <TeamRegistrationForm
                  competitions={competitions}
                  inbox={inbox}
                  selected={selected}
                  onSelect={setSelected}
                  slipMode={slipMode}
                />
              ) : (
                <ClosedNotice what="Competition registration" email={inbox} />
              )}
            </div>
          </div>
        </FadeIn>
          </>
        )}
      </Container>
    </section>
  );
}

/** Shown when every competition is hidden in the admin: no catalogue and no registration form. */
function ComingSoon() {
  return (
    <FadeIn delay={0.1} className="mx-auto mt-12 max-w-2xl rounded-3xl border border-white/80 bg-white px-6 py-12 text-center shadow-card sm:px-10">
      <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-grad-orange text-white shadow-lift">
        <CalendarClock className="h-8 w-8" aria-hidden />
      </span>
      <p className="mt-6 font-display text-2xl text-cye-orange">Coming soon</p>
      <h2 className="mt-1 font-heading text-2xl font-black uppercase tracking-tight text-cye-blue sm:text-3xl">
        Competitions are coming soon
      </h2>
      <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-cye-ink/70 sm:text-base">
        We are finalising the CYE 2026 competition line-up. Registrations will open here once it is announced, so check
        back soon.
      </p>
      <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <Button href="/visitors" className="w-full sm:w-auto">
          Get your visitor pass
        </Button>
        <Button href="/contact" variant="secondary" className="w-full sm:w-auto">
          Contact us
        </Button>
      </div>
    </FadeIn>
  );
}
