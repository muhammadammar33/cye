"use client";

import { useState } from "react";
import { EMAILS, REGISTRATION_OPEN } from "@/data/event";
import { CompetitionCatalog } from "@/components/competitions/CompetitionCatalog";
import { TeamRegistrationForm } from "@/components/competitions/TeamRegistrationForm";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { ClosedNotice } from "@/components/ui/ClosedNotice";
import { Container } from "@/components/ui/Container";
import { FadeIn } from "@/components/ui/FadeIn";
import { SectionHeading } from "@/components/ui/SectionHeading";

export function Competitions() {
  const [selected, setSelected] = useState("");

  return (
    <section className="bg-wash pt-32 pb-20 sm:pt-36 sm:pb-24">
      <Container>
        <FadeIn>
          <Breadcrumbs current="Competitions" />
          <SectionHeading
            eyebrow="Compete"
            title="Competitions"
            description="Register for CYE 2026 competitions across all five verticals — university challenges and school-level talent events. Enter solo or as a team."
          />
        </FadeIn>
        <CompetitionCatalog onSelect={setSelected} />
        <FadeIn delay={0.1} className="mx-auto mt-12 max-w-2xl rounded-3xl border border-white/80 bg-white p-6 shadow-card sm:p-8">
          <div id="competition-register" className="scroll-mt-28">
            <h3 className="font-heading text-xl font-extrabold text-cye-blue">Competition registration</h3>
            <p className="mt-2 text-sm text-cye-ink/65">
              Pick a competition and team size, then add details for every team member. Fee payment details are
              shared after your registration is confirmed.
            </p>
            <div className="mt-6">
              {REGISTRATION_OPEN.competitions ? (
                <TeamRegistrationForm selected={selected} onSelect={setSelected} />
              ) : (
                <ClosedNotice what="Competition registration" email={EMAILS.competitions} />
              )}
            </div>
          </div>
        </FadeIn>
      </Container>
    </section>
  );
}
