"use client";

import { FormEvent, useState } from "react";
import { CalendarDays, MapPin, Send } from "lucide-react";
import { EVENT, SPONSORSHIP, STALLS } from "@/data/event";
import { Container } from "@/components/ui/Container";
import { FadeIn } from "@/components/ui/FadeIn";

const TIERS = [
  ...SPONSORSHIP.map((tier) => tier.tier),
  ...STALLS.map((stall) => stall.tier),
  "Not sure yet",
];

const CONTACT_EMAIL = "sponsors@capitalyouthexpo.com";

export function ContactCTA() {
  const [status, setStatus] = useState<"idle" | "sent">("idle");

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const name = String(data.get("name") ?? "");
    const organization = String(data.get("organization") ?? "");
    const email = String(data.get("email") ?? "");
    const tier = String(data.get("tier") ?? "");
    const message = String(data.get("message") ?? "");

    // TODO: POST to /api/sponsor-interest when a backend endpoint is available.
    const subject = encodeURIComponent(`CYE 2026 sponsor interest — ${tier} — ${organization || name}`);
    const body = encodeURIComponent(
      `Name: ${name}\nOrganization: ${organization}\nEmail: ${email}\nInterested tier: ${tier}\n\n${message}`,
    );
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
    setStatus("sent");
  }

  return (
    <section id="contact" className="scroll-mt-24 overflow-hidden bg-cye-blue-dk py-20 sm:py-24">
      <Container>
        <FadeIn className="text-center">
          <p className="font-display text-2xl text-cye-orange-lt sm:text-3xl">
            {EVENT.quote}
          </p>
          <h2 className="mt-4 font-heading text-3xl font-black uppercase tracking-tight text-white sm:text-5xl">
            Partner with Capital Youth Expo
          </h2>
          <p className="mx-auto mt-4 flex max-w-2xl flex-col items-center justify-center gap-2 text-white/75 sm:flex-row sm:gap-4">
            <span className="inline-flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-cye-orange-lt" aria-hidden />
              {EVENT.date}
            </span>
            <span className="inline-flex items-center gap-2">
              <MapPin className="h-4 w-4 text-cye-orange-lt" aria-hidden />
              {EVENT.venue}, {EVENT.city}
            </span>
          </p>
        </FadeIn>

        <FadeIn delay={0.1} className="mx-auto mt-12 max-w-2xl rounded-3xl bg-white p-6 shadow-lift sm:p-8">
          <form onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-semibold text-cye-blue">
              Name
              <input
                name="name"
                required
                autoComplete="name"
                className="mt-1.5 w-full rounded-2xl border border-cye-blue/15 bg-cye-mist px-4 py-3 font-medium text-cye-ink outline-none ring-cye-orange/40 focus:ring-2"
              />
            </label>
            <label className="block text-sm font-semibold text-cye-blue">
              Organization
              <input
                name="organization"
                required
                autoComplete="organization"
                className="mt-1.5 w-full rounded-2xl border border-cye-blue/15 bg-cye-mist px-4 py-3 font-medium text-cye-ink outline-none ring-cye-orange/40 focus:ring-2"
              />
            </label>
            <label className="block text-sm font-semibold text-cye-blue">
              Email
              <input
                name="email"
                type="email"
                required
                autoComplete="email"
                className="mt-1.5 w-full rounded-2xl border border-cye-blue/15 bg-cye-mist px-4 py-3 font-medium text-cye-ink outline-none ring-cye-orange/40 focus:ring-2"
              />
            </label>
            <label className="block text-sm font-semibold text-cye-blue">
              Interested tier
              <select
                name="tier"
                required
                defaultValue=""
                className="mt-1.5 w-full rounded-2xl border border-cye-blue/15 bg-cye-mist px-4 py-3 font-medium text-cye-ink outline-none ring-cye-orange/40 focus:ring-2"
              >
                <option value="" disabled>
                  Select a package
                </option>
                {TIERS.map((tier) => (
                  <option key={tier} value={tier}>
                    {tier}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm font-semibold text-cye-blue sm:col-span-2">
              Message
              <textarea
                name="message"
                rows={4}
                required
                className="mt-1.5 w-full resize-y rounded-2xl border border-cye-blue/15 bg-cye-mist px-4 py-3 font-medium text-cye-ink outline-none ring-cye-orange/40 focus:ring-2"
              />
            </label>
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-cye-orange px-6 py-3 font-heading text-sm font-bold uppercase tracking-wide text-white shadow-lg shadow-cye-orange/25 transition-all hover:-translate-y-0.5 hover:bg-cye-orange-lt sm:col-span-2"
            >
              <Send className="h-4 w-4" aria-hidden />
              Send sponsor interest
            </button>
            {status === "sent" ? (
              <p className="text-center text-sm text-cye-blue sm:col-span-2" role="status">
                Opening your email client — if nothing appears, write to {CONTACT_EMAIL}.
              </p>
            ) : null}
          </form>
        </FadeIn>
      </Container>
    </section>
  );
}
