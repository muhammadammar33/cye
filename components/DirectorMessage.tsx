import { EVENT } from "@/data/event";
import { Container } from "@/components/ui/Container";
import { FadeIn } from "@/components/ui/FadeIn";

const MESSAGE = `Our expectations from our valued sponsors are rooted in the vision and mission of the Capital Youth Expo (CYE). We look to our sponsors not only for financial support but also for their active engagement and commitment to the goals and objectives of the CYE. We expect sponsors to play a pivotal role in empowering the youth of the Islamabad Region by helping us create an exceptional event that offers valuable educational and career opportunities. This includes providing financial support to ensure the Expo's success, contributing expertise and resources to enhance the quality of the event, and actively participating in initiatives related to youth development. Additionally, we anticipate sponsors to see the long-term potential of our partnership, extending beyond the Expo, and to work collaboratively with us to make a lasting impact on the community. We are confident that our sponsors' commitment to our shared goals will not only enrich the Expo experience but also make a meaningful difference in the lives of young individuals striving for a brighter future.`;

export function DirectorMessage() {
  return (
    <section className="bg-white py-20 sm:py-24">
      <Container>
        <FadeIn>
          <p className="font-heading text-xs font-bold uppercase tracking-[0.28em] text-cye-orange">
            From the director
          </p>
          <h2 className="mt-3 max-w-4xl font-heading text-3xl font-black uppercase tracking-tight text-cye-blue sm:text-4xl">
            Director Message — {EVENT.director}, Director CYE
          </h2>
        </FadeIn>
        <FadeIn delay={0.08} className="mt-10 grid items-start gap-8 lg:grid-cols-[220px_1fr]">
          <div className="mx-auto flex h-44 w-44 items-center justify-center rounded-full bg-linear-to-br from-cye-blue to-cye-orange font-heading text-5xl font-black text-white shadow-card lg:mx-0">
            HI
          </div>
          <blockquote className="rounded-3xl bg-cye-mist p-6 text-base leading-relaxed text-cye-ink/80 sm:p-8 sm:text-lg">
            <p>{MESSAGE}</p>
            <footer className="mt-6 font-heading text-sm font-bold uppercase tracking-wide text-cye-blue">
              {EVENT.director}
              <span className="mt-1 block font-sans text-xs font-medium normal-case tracking-normal text-cye-ink/55">
                Director, Capital Youth Expo
              </span>
            </footer>
          </blockquote>
        </FadeIn>
      </Container>
    </section>
  );
}
