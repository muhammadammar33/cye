import Image from "next/image";
import { TEAM } from "@/data/event";
import { Container } from "@/components/ui/Container";
import { FadeIn } from "@/components/ui/FadeIn";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { cn } from "@/lib/cn";

const [featured, rest] = [TEAM.slice(0, 2), TEAM.slice(2)];

function Member({ member, large = false }: { member: (typeof TEAM)[number]; large?: boolean }) {
  return (
    <article className="h-full rounded-3xl border border-white/80 bg-white p-4 text-center shadow-card transition-transform duration-300 hover:-translate-y-1 sm:p-5">
      <div className="overflow-hidden rounded-2xl bg-cye-mist">
        <Image
          src={`/team/${member.photo}.webp`}
          alt={member.name}
          width={480}
          height={480}
          sizes={large ? "(min-width: 640px) 288px, 90vw" : "(min-width: 1280px) 200px, (min-width: 640px) 30vw, 45vw"}
          className="aspect-square h-auto w-full object-cover"
        />
      </div>
      <h3 className={cn("mt-4 font-heading font-extrabold leading-snug text-cye-blue", large ? "text-lg sm:text-xl" : "text-sm sm:text-base")}>
        {member.name}
      </h3>
      <p className={cn("mt-1 font-semibold text-cye-orange", large ? "text-sm" : "text-xs sm:text-[13px]")}>{member.role}</p>
    </article>
  );
}

export function Team() {
  return (
    <section id="team" className="scroll-mt-24 bg-wash-mist py-20 sm:py-24">
      <Container>
        <FadeIn>
          <SectionHeading
            eyebrow="Meet the Team"
            title="The People Behind CYE 2026"
            description="The leads who plan, build, and run Capital Youth Expo, backed by 105 core team members, 90 associates, and 3,000+ volunteers."
          />
        </FadeIn>
        <div className="mt-12 flex flex-wrap justify-center gap-5">
          {featured.map((member, index) => (
            <FadeIn key={member.name} delay={index * 0.06} className="w-full max-w-72 sm:w-72">
              <Member member={member} large />
            </FadeIn>
          ))}
        </div>
        {/* Flex-wrap so the short last row is centered: 2 columns, 3 on sm, 5 on xl, gap-4. */}
        <div className="mt-5 flex flex-wrap justify-center gap-4">
          {rest.map((member, index) => (
            <FadeIn
              key={member.name}
              delay={(index % 5) * 0.04}
              className="w-[calc((100%-1rem)/2)] sm:w-[calc((100%-2rem)/3)] xl:w-[calc((100%-4rem)/5)]"
            >
              <Member member={member} />
            </FadeIn>
          ))}
        </div>
      </Container>
    </section>
  );
}
