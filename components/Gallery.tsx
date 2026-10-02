import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { FadeIn } from "@/components/ui/FadeIn";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { cn } from "@/lib/cn";

const SHOTS = [
  { src: "/gallery/01.webp", alt: "Students assembling electronics at a project stall", w: 443, h: 336, rotate: "-rotate-3" },
  { src: "/gallery/02.webp", alt: "Remote-controlled aircraft built by student teams", w: 425, h: 336, rotate: "rotate-2" },
  { src: "/gallery/03.webp", alt: "Visitors gathered around a robotics exhibit", w: 531, h: 283, rotate: "rotate-3" },
  { src: "/gallery/04.webp", alt: "Keynote speaker at the SAFE podium", w: 489, h: 301, rotate: "-rotate-2" },
  { src: "/gallery/05.webp", alt: "Guests standing for the national anthem at BizzTech", w: 549, h: 336, rotate: "rotate-1" },
  { src: "/gallery/06.webp", alt: "Students demonstrating a robotic arm", w: 460, h: 354, rotate: "-rotate-3" },
  { src: "/gallery/07.webp", alt: "Speaker presenting in front of a robot backdrop", w: 513, h: 265, rotate: "rotate-2" },
  { src: "/gallery/08.webp", alt: "Packed audience in the main hall", w: 513, h: 310, rotate: "-rotate-1" },
  { src: "/gallery/09.webp", alt: "Capital Youth Expo crowd filling the auditorium", w: 451, h: 318, rotate: "rotate-3" },
  { src: "/gallery/10.webp", alt: "Speaker addressing students during a session", w: 513, h: 226, rotate: "-rotate-2" },
  { src: "/gallery/11.webp", alt: "Guests touring the outdoor exhibition", w: 496, h: 265, rotate: "rotate-1" },
  { src: "/gallery/12.webp", alt: "Visitors arriving at the BizzTech hall", w: 308, h: 350, rotate: "-rotate-3" },
  { src: "/gallery/13.webp", alt: "Teams coding during the BizzTank hackathon", w: 513, h: 336, rotate: "rotate-2" },
  { src: "/gallery/14.webp", alt: "Speaker delivering a talk at the podium", w: 558, h: 363, rotate: "-rotate-1" },
];

export function Gallery() {
  return (
    <section className="bg-white py-20 sm:py-24">
      <Container>
        <FadeIn>
          <SectionHeading
            eyebrow="Memories"
            title="Glimpses from the Past"
            description="A look back at the energy of previous editions: crowds, stages, exhibitions, and celebrations that built CYE into Islamabad's defining youth gathering."
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
                  sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
                  className="h-auto w-full object-cover"
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
