import { ExternalLink, MapPin } from "lucide-react";
import Image from "next/image";
import { EVENT, VENUE } from "@/data/event";
import { Container } from "@/components/ui/Container";
import { FadeIn } from "@/components/ui/FadeIn";
import { SectionHeading } from "@/components/ui/SectionHeading";

export function Venue() {
  return (
    <section id="venue" className="scroll-mt-24 bg-white py-20 sm:py-24">
      <Container>
        <FadeIn>
          <SectionHeading
            eyebrow="The Venue"
            title="The Stage is Set for CYE 2026"
            description={`${EVENT.date} at ${VENUE.name}, ${VENUE.city}. Plan your visit, stall, or session with the floor plan below.`}
          />
        </FadeIn>
        <FadeIn delay={0.05} className="mt-12 overflow-hidden rounded-3xl shadow-card">
          <Image
            src="/venue/pak-china-friendship-center.webp"
            alt={`${VENUE.name}, ${VENUE.city}`}
            width={1800}
            height={265}
            sizes="(min-width: 1280px) 1216px, 100vw"
            className="h-40 w-full object-cover sm:h-auto"
          />
        </FadeIn>

        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          {VENUE.floors.map((floor, index) => (
            <FadeIn key={floor.name} delay={index * 0.08}>
              <figure className="h-full rounded-3xl border border-cye-blue/10 bg-cye-mist p-5 sm:p-6">
                <figcaption className="font-heading text-lg font-extrabold uppercase text-cye-blue">
                  {floor.name} Plan
                </figcaption>
                <a href={floor.image} target="_blank" rel="noreferrer" className="mt-4 block overflow-hidden rounded-2xl bg-white">
                  <Image
                    src={floor.image}
                    alt={`${floor.name} plan of ${VENUE.name}`}
                    width={floor.width}
                    height={floor.height}
                    sizes="(min-width: 1024px) 50vw, 100vw"
                    className="h-auto w-full"
                  />
                </a>
                <ul className="mt-4 grid gap-1.5 text-sm text-cye-ink/70 sm:grid-cols-2">
                  {floor.zones.map((zone) => (
                    <li key={zone} className="flex gap-2">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-cye-orange" aria-hidden />
                      {zone}
                    </li>
                  ))}
                </ul>
              </figure>
            </FadeIn>
          ))}
        </div>

        <FadeIn delay={0.1} className="mt-6 overflow-hidden rounded-3xl border border-cye-blue/10 bg-cye-mist">
          <div className="flex flex-col items-start justify-between gap-3 p-5 sm:flex-row sm:items-center sm:p-6">
            <p className="flex items-center gap-2 font-heading font-bold text-cye-blue">
              <MapPin className="h-5 w-5 text-cye-orange" aria-hidden />
              {VENUE.name}, {VENUE.city}
            </p>
            <a
              href={VENUE.mapLink}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-cye-orange hover:text-cye-orange-lt"
            >
              Get directions
              <ExternalLink className="h-4 w-4" aria-hidden />
            </a>
          </div>
          <iframe
            title={`Map of ${VENUE.name}, ${VENUE.city}`}
            src={VENUE.mapEmbed}
            className="h-72 w-full border-0 sm:h-96"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </FadeIn>
      </Container>
    </section>
  );
}
