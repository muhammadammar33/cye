import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { FadeIn } from "@/components/ui/FadeIn";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { cn } from "@/lib/cn";

const SHOTS = [
  { src: "/gallery/01.svg", alt: "Crowd gathered at a previous Capital Youth Expo", w: 1200, h: 900, rotate: "-rotate-3" },
  { src: "/gallery/02.svg", alt: "Keynote session on the main stage", w: 900, h: 1200, rotate: "rotate-2" },
  { src: "/gallery/03.svg", alt: "Students presenting a project exhibition", w: 1200, h: 800, rotate: "rotate-6" },
  { src: "/gallery/04.svg", alt: "Award ceremony at Capital Youth Expo", w: 1000, h: 1000, rotate: "-rotate-2" },
  { src: "/gallery/05.svg", alt: "Workshop in progress with student participants", w: 1200, h: 1500, rotate: "rotate-3" },
  { src: "/gallery/06.svg", alt: "Guests and organizers on the expo floor", w: 1400, h: 900, rotate: "-rotate-6" },
  { src: "/gallery/07.svg", alt: "Talent performance during a past edition", w: 900, h: 1100, rotate: "rotate-1" },
  { src: "/gallery/08.svg", alt: "Expo booths and sponsor stalls", w: 1100, h: 800, rotate: "-rotate-1" },
];

export function Gallery() {
  return (
    <section className="bg-white py-20 sm:py-24">
      <Container>
        <FadeIn>
          <SectionHeading
            eyebrow="Memories"
            title="Glimpses from the Past"
            description="A look back at the energy of previous editions — crowds, stages, exhibitions, and celebrations that built CYE into Islamabad's defining youth gathering."
          />
        </FadeIn>
        <div className="mt-12 columns-2 gap-4 sm:columns-3 lg:columns-4">
          {SHOTS.map((shot, index) => (
            <FadeIn key={shot.src} delay={index * 0.04} className="mb-4 break-inside-avoid">
              <figure
                className={cn(
                  "bg-white p-2 shadow-card ring-1 ring-cye-blue/5 transition-transform duration-300 hover:-translate-y-1 hover:rotate-0",
                  shot.rotate,
                )}
              >
                <Image
                  src={shot.src}
                  alt={shot.alt}
                  width={shot.w}
                  height={shot.h}
                  className="h-auto w-full object-cover"
                  unoptimized
                />
                <figcaption className="px-1 py-2 text-center font-display text-sm text-cye-blue">
                  CYE Archives
                </figcaption>
              </figure>
            </FadeIn>
          ))}
        </div>
      </Container>
    </section>
  );
}
