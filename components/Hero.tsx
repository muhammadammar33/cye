"use client";

import { CalendarDays, Hourglass, MapPin } from "lucide-react";
import Image from "next/image";
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

/** Calendar days from today to the registration deadline, both in Pakistan time (null before the clock starts). */
function useDaysToDeadline(isoDate: string) {
  const now = useSyncExternalStore(subscribeToClock, getClockSnapshot, getServerClockSnapshot);
  if (!now) return null;
  const today = new Date(now + 5 * 3_600_000).toISOString().slice(0, 10); // UTC+5, no daylight saving
  return Math.round((Date.parse(isoDate) - Date.parse(today)) / 86_400_000);
}

const dayLabel = (iso: string) => new Date(`${iso}T12:00:00+05:00`).toLocaleDateString("en-GB", { day: "numeric", month: "long", timeZone: "Asia/Karachi" });
const DEADLINE_LABEL = dayLabel(EVENT.registrationDeadline);
const ORIGINAL_DEADLINE = EVENT.registrationDeadlineExtendedFrom;
const ORIGINAL_LABEL = dayLabel(ORIGINAL_DEADLINE);

export function Hero() {
  const countdown = useCountdown(EVENT.isoDate);
  const daysLeft = useDaysToDeadline(EVENT.registrationDeadline);
  // Still on or before the original deadline: show that one. Afterwards the extension is announced as a last call.
  const originalDaysLeft = useDaysToDeadline(ORIGINAL_DEADLINE);
  const extended = originalDaysLeft !== null && originalDaysLeft < 0;

  return (
    <section id="top" className="relative overflow-hidden bg-white pt-28 pb-16 sm:pt-32 sm:pb-24">
      <Image
        src="/venue/auditorium.webp"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover object-center"
      />
      {/* Light wash over the photo keeps the existing blue/orange text readable. */}
      <div className="absolute inset-0 bg-white/72" aria-hidden />
      <div className="bg-wash absolute inset-0 opacity-60" aria-hidden />
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
          <p className="mt-3 flex items-center justify-center gap-3 text-[11px] font-semibold uppercase tracking-[0.3em] text-cye-ink/50">
            Powered by
            <Image
              src="/brand/youth-insight.png"
              alt={EVENT.poweredBy}
              width={420}
              height={174}
              sizes="104px"
              className="h-auto w-26"
              priority
            />
          </p>
          {daysLeft === null || daysLeft >= 0 ? (
            <Link
              href="/competitions"
              className="mx-auto mt-8 inline-flex max-w-full flex-wrap items-center justify-center gap-x-2 gap-y-1 rounded-2xl bg-grad-orange px-5 py-3 text-center text-white shadow-card transition hover:brightness-110 sm:rounded-full"
            >
              <Hourglass className="h-5 w-5 shrink-0" aria-hidden />
              {extended ? (
                <>
                  <span className="font-heading text-base font-extrabold uppercase tracking-wide sm:text-lg">
                    Last call! {daysLeft === 0 ? "Last day to register" : "Registration extended"}
                  </span>
                  <span className="text-sm font-semibold text-white/90">
                    <span className="hidden sm:inline">· </span>
                    {daysLeft === 0 ? `Deadline: today, ${DEADLINE_LABEL}` : `Now open till ${DEADLINE_LABEL} (${daysLeft} day${daysLeft === 1 ? "" : "s"} left)`}
                  </span>
                </>
              ) : (
                <>
                  <span className="font-heading text-base font-extrabold uppercase tracking-wide sm:text-lg">
                    {originalDaysLeft === null ? "Registration closing soon" : originalDaysLeft === 0 ? "Last day to register" : `${originalDaysLeft} day${originalDaysLeft === 1 ? "" : "s"} left to register`}
                  </span>
                  <span className="text-sm font-semibold text-white/90">
                    <span className="hidden sm:inline">· </span>Deadline: {originalDaysLeft === 0 ? "today, " : ""}
                    {ORIGINAL_LABEL}
                  </span>
                </>
              )}
            </Link>
          ) : null}
          <div className="mt-5 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button href="/competitions" className="w-full sm:w-auto sm:px-9">
              Register Now
            </Button>
            <Button href="/#contact" variant="secondary" className="w-full sm:w-auto">
              Become a Sponsor
            </Button>
          </div>
          <p className="mt-5 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm font-semibold">
            <Link href="/visitors" className="text-cye-blue hover:text-cye-orange">
              Visitor Pass
            </Link>
            <Link href="/projects" className="text-cye-blue hover:text-cye-orange">
              Project Exhibition
            </Link>
            <Link href="/startups" className="text-cye-blue hover:text-cye-orange">
              Startup Arena
            </Link>
            <Link href="/lawyers-conference" className="text-cye-blue hover:text-cye-orange">
              Lawyers Conference
            </Link>
            <Link href="/medical-conference" className="text-cye-blue hover:text-cye-orange">
              Medical Conference
            </Link>
            <Link href="/ambassadors" className="text-cye-blue hover:text-cye-orange">
              Campus Ambassadors
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
