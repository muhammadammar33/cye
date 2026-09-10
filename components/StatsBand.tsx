"use client";

import { COMMUNITY } from "@/data/event";
import { AnimatedCounter } from "@/components/ui/AnimatedCounter";
import { Container } from "@/components/ui/Container";
import { FadeIn } from "@/components/ui/FadeIn";

export function StatsBand() {
  return (
    <section className="relative overflow-hidden bg-cye-blue-dk py-16 sm:py-20">
      <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full border-[18px] border-cye-orange/40" aria-hidden />
      <div className="pointer-events-none absolute -bottom-28 -right-16 h-80 w-80 rounded-full border-[14px] border-white/10" aria-hidden />
      <Container className="relative">
        <FadeIn>
          <p className="text-center font-heading text-xs font-bold uppercase tracking-[0.28em] text-cye-orange-lt">
            Built by a Community of Leaders
          </p>
        </FadeIn>
        <div className="mt-10 grid gap-8 sm:grid-cols-3">
          {COMMUNITY.map((item, index) => (
            <FadeIn key={item.label} delay={index * 0.08} className="text-center">
              <p className="font-heading text-5xl font-black text-white sm:text-6xl">
                <AnimatedCounter value={item.value} suffix={item.suffix} />
              </p>
              <p className="mt-3 text-sm leading-relaxed text-white/75 sm:text-base">{item.label}</p>
            </FadeIn>
          ))}
        </div>
        <p className="mx-auto mt-10 max-w-3xl text-center text-sm italic text-white/70 sm:text-base">
          Together, they form the organizational force behind Capital Youth Expo 2026, working
          year-round to deliver one of the region&apos;s largest youth engagement platforms.
        </p>
      </Container>
    </section>
  );
}
