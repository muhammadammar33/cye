"use client";

import { CalendarDays, MapPin } from "lucide-react";
import Link from "next/link";
import { useMemo, useSyncExternalStore } from "react";
import { EVENT } from "@/data/event";
import { ArcDecoration } from "@/components/ui/ArcDecoration";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { FadeIn } from "@/components/ui/FadeIn";

function pad(value: number) {
  return String(value).padStart(2, "0");
}

let clockNow = 0;

function subscribeToClock(onStoreChange: () => void) {
  clockNow = Date.now();
  const id = window.setInterval(() => {
    clockNow = Date.now();
    onStoreChange();
  }, 1000);
  return () => window.clearInterval(id);
}

function getClockSnapshot() {
  return clockNow;
}

function getServerClockSnapshot() {
  return 0;
}

function useCountdown(isoDate: string) {
  const target = useMemo(
    () => new Date(`${isoDate}T09:00:00+05:00`).getTime(),
    [isoDate],
  );
  const now = useSyncExternalStore(
    subscribeToClock,
    getClockSnapshot,
    getServerClockSnapshot,
  );

  if (!now) {
    return { days: "--", hours: "--", minutes: "--", seconds: "--" };
  }

  const diff = Math.max(0, target - now);
  return {
    days: String(Math.floor(diff / 86_400_000)),
    hours: pad(Math.floor((diff / 3_600_000) % 24)),
    minutes: pad(Math.floor((diff / 60_000) % 60)),
    seconds: pad(Math.floor((diff / 1000) % 60)),
  };
}

export function Hero() {
  const countdown = useCountdown(EVENT.isoDate);

  return (
    <section id="top" className="relative overflow-hidden bg-wash pt-28 pb-16 sm:pt-32 sm:pb-24">
      <ArcDecoration corner="top-right" className="-translate-y-[18%] translate-x-[18%] opacity-90" />
      <ArcDecoration
        corner="bottom-left"
        size={420}
        className="translate-y-[22%] -translate-x-[18%] opacity-70"
      />
      <Container className="relative z-10">
        <FadeIn className="mx-auto max-w-4xl text-center">
          <p className="font-heading text-xs font-bold uppercase tracking-[0.35em] text-cye-blue sm:text-sm">
            {EVENT.tagline}
          </p>
          <h1 className="mt-5 font-heading text-4xl font-black uppercase tracking-tight text-cye-blue sm:text-6xl lg:text-7xl">
            The stage is set for{" "}
            <span className="text-cye-blue">CYE</span>{" "}
            <span className="font-display normal-case text-cye-orange">2026</span>
          </h1>
          <p className="mt-6 flex flex-col items-center justify-center gap-2 text-base text-cye-ink/75 sm:flex-row sm:gap-4 sm:text-lg">
            <span className="inline-flex items-center gap-2 font-medium">
              <CalendarDays className="h-5 w-5 text-cye-orange" aria-hidden />
              {EVENT.date}
            </span>
            <span className="hidden h-1.5 w-1.5 rounded-full bg-cye-orange sm:inline-block" />
            <span className="inline-flex items-center gap-2 font-medium">
              <MapPin className="h-5 w-5 text-cye-orange" aria-hidden />
              {EVENT.venue}, {EVENT.city}
            </span>
          </p>
          <p className="mt-4 text-sm font-medium text-cye-ink/60">
            Organized by {EVENT.organizers.join(" in collaboration with ")}
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button href="/#contact" className="w-full sm:w-auto">
              Become a Sponsor
            </Button>
            <Button href="/#about" variant="secondary" className="w-full sm:w-auto">
              Explore the Expo
            </Button>
          </div>
          <p className="mt-5 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm font-semibold">
            <Link href="/competitions" className="text-cye-blue hover:text-cye-orange">
              Competitions
            </Link>
            <Link href="/ambassadors" className="text-cye-blue hover:text-cye-orange">
              Campus Ambassador
            </Link>
            <Link href="/volunteers" className="text-cye-blue hover:text-cye-orange">
              Volunteer
            </Link>
          </p>
          <div className="mt-10 grid grid-cols-4 gap-2 sm:mx-auto sm:max-w-lg sm:gap-3" aria-label="Countdown to Capital Youth Expo 2026">
            {[
              { label: "Days", value: countdown.days },
              { label: "Hours", value: countdown.hours },
              { label: "Minutes", value: countdown.minutes },
              { label: "Seconds", value: countdown.seconds },
            ].map((unit) => (
              <div
                key={unit.label}
                className="rounded-2xl border border-cye-blue/10 bg-white/80 px-2 py-3 shadow-card backdrop-blur-sm"
              >
                <div className="font-heading text-xl font-black text-cye-blue sm:text-3xl">
                  {unit.value}
                </div>
                <div className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-cye-ink/50">
                  {unit.label}
                </div>
              </div>
            ))}
          </div>
        </FadeIn>
      </Container>
    </section>
  );
}
