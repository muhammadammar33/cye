import Image from "next/image";
import { ADVISORY_BOARD } from "@/data/event";
import { Container } from "@/components/ui/Container";
import { FadeIn } from "@/components/ui/FadeIn";
import { SectionHeading } from "@/components/ui/SectionHeading";

export function AdvisoryBoard() {
  return (
    <section id="advisory" className="scroll-mt-24 bg-white py-20 sm:py-24">
      <Container>
        <FadeIn>
          <SectionHeading
            eyebrow="Guiding CYE"
            title="Board of Advisory"
            description="Leaders from technology, higher education, healthcare, and business who guide the vision of Capital Youth Expo."
          />
        </FadeIn>
        <div className="mt-12 grid gap-5 md:grid-cols-2">
          {ADVISORY_BOARD.map((member, index) => (
            <FadeIn key={member.name} delay={index * 0.06}>
              <article className="flex h-full flex-col gap-5 rounded-3xl border border-cye-blue/10 bg-cye-mist p-6 sm:flex-row sm:p-7">
                <Image
                  src={`/advisory/${member.photo}.webp`}
                  alt={member.name}
                  width={480}
                  height={480}
                  sizes="(min-width: 640px) 128px, 112px"
                  className="h-28 w-28 shrink-0 rounded-3xl bg-white object-cover object-top shadow-card sm:h-32 sm:w-32"
                />
                <div>
                  <h3 className="font-heading text-lg font-extrabold uppercase text-cye-blue">{member.name}</h3>
                  <p className="mt-0.5 text-sm font-semibold text-cye-orange">{member.role}</p>
                  <p className="mt-3 text-sm leading-relaxed text-cye-ink/70">{member.bio}</p>
                </div>
              </article>
            </FadeIn>
          ))}
        </div>
      </Container>
    </section>
  );
}
