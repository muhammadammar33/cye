"use client";

import { FormEvent, useState } from "react";
import { CalendarDays, Loader2, MapPin, Send } from "lucide-react";
import { EVENT } from "@/data/event";
import { Container } from "@/components/ui/Container";
import { FadeIn } from "@/components/ui/FadeIn";
import { FormError, FormSuccess, Honeypot, type FormState } from "@/components/ui/FormStatus";
import { submitForm } from "@/lib/submit";

export function ContactCTA({ tiers, inbox }: { tiers: string[]; inbox: string }) {
  const [state, setState] = useState<FormState>({ status: "idle" });
  const options = [...tiers, "Not sure yet"];

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const get = (key: string) => String(form.get(key) ?? "");
    setState({ status: "sending" });
    const result = await submitForm(
      "sponsor",
      { name: get("name"), organization: get("organization"), email: get("email"), tier: get("tier"), message: get("message") },
      get("company_website"),
    );
    setState(result.ok ? { status: "sent" } : { status: "error", error: `${result.error} If this keeps happening, email ${inbox}.` });
  }

  return (
    <section id="contact" className="scroll-mt-24 overflow-hidden bg-grad-blue py-20 sm:py-24">
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
          {state.status === "sent" ? (
            <FormSuccess title="Thank you for your interest!">
              Our partnerships team has your enquiry and will contact you shortly. A confirmation is on its way to your email.
            </FormSuccess>
          ) : (
          <form onSubmit={onSubmit} className="relative grid gap-4 sm:grid-cols-2">
            <Honeypot />
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
                {options.map((tier) => (
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
            <FormError state={state} />
            <button
              type="submit"
              disabled={state.status === "sending"}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-grad-orange px-6 py-3 font-heading text-sm font-bold uppercase tracking-wide text-white shadow-lg shadow-cye-orange/25 transition-all hover:-translate-y-0.5 hover:brightness-110 disabled:cursor-wait disabled:opacity-70 sm:col-span-2"
            >
              {state.status === "sending" ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Send className="h-4 w-4" aria-hidden />}
              {state.status === "sending" ? "Sending..." : "Send sponsor interest"}
            </button>
          </form>
          )}
        </FadeIn>
      </Container>
    </section>
  );
}
