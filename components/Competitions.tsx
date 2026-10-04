"use client";

import Link from "next/link";
import { useState } from "react";
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
      </Container>
    </section>
  );
}
