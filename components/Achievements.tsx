"use client";

import { motion, useInView, useReducedMotion } from "framer-motion";
import { useRef } from "react";
import { ACHIEVEMENTS } from "@/data/event";
import { Container } from "@/components/ui/Container";
import { FadeIn } from "@/components/ui/FadeIn";
import { SectionHeading } from "@/components/ui/SectionHeading";

const MAX = Math.max(...ACHIEVEMENTS.map((item) => item.visitors));

export function Achievements() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const reduceMotion = useReducedMotion();

  return (
    <section id="achievements" className="scroll-mt-24 bg-wash-mist py-20 sm:py-24">
      <Container>
        <FadeIn>
          <SectionHeading
            eyebrow="CYE Recap"
            title="A Decade of Growing Momentum"
            description="Visitor growth across editions — a platform that has become Islamabad's defining youth gathering."
          />
        </FadeIn>
        <div ref={ref} className="mt-12 rounded-3xl border border-white/80 bg-white/80 p-5 shadow-card backdrop-blur-sm sm:p-8">
          <div className="flex h-64 items-end gap-2 sm:h-80 sm:gap-4" role="img" aria-label="Bar chart of CYE visitor growth from 2015 to 2024">
            {ACHIEVEMENTS.map((item, index) => {
              const height = `${Math.max(12, (item.visitors / MAX) * 100)}%`;
              return (
                <div key={item.year} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
                  <p className="text-[10px] font-bold text-cye-blue sm:text-sm">
                    {item.visitors.toLocaleString()}
                  </p>
                  <motion.div
                    className="w-full max-w-16 rounded-t-2xl bg-linear-to-t from-cye-blue to-cye-orange"
                    initial={{ height: reduceMotion ? height : "8%" }}
                    animate={inView ? { height } : undefined}
                    transition={{ duration: 0.9, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
                  />
                  <p className="font-heading text-xs font-bold text-cye-ink/60 sm:text-sm">{item.year}</p>
                </div>
              );
            })}
          </div>
          <ol className="sr-only">
            {ACHIEVEMENTS.map((item) => (
              <li key={item.year}>
                {item.year}: {item.visitors.toLocaleString()} visitors
              </li>
            ))}
          </ol>
        </div>
      </Container>
    </section>
  );
}
