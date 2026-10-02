import Image from "next/image";
import Link from "next/link";
import { EMAILS, EVENT, NAV_LINKS, REGISTER_LINKS } from "@/data/event";
import { Container } from "@/components/ui/Container";
import { SocialLinks } from "@/components/ui/SocialLinks";

const EXPLORE_LINKS = NAV_LINKS.filter((link) => !link.children);

export function Footer() {
  return (
    <footer className="border-t border-cye-blue/10 bg-white py-12">
      <Container className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <Link href="/" aria-label="Capital Youth Expo 2026 home" className="inline-block">
            <Image
              src="/brand/cye-logo.png"
              alt="Capital Youth Expo"
              width={773}
              height={760}
              sizes="112px"
              className="h-28 w-auto"
            />
          </Link>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-cye-ink/65">
            {EVENT.tagline}
            <br />
            {EVENT.date} · {EVENT.venue}, {EVENT.city}
          </p>
          <p className="mt-5 flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.25em] text-cye-ink/50">
            Powered by
            <Image
              src="/brand/youth-insight.png"
              alt={EVENT.poweredBy}
              width={420}
              height={174}
              sizes="96px"
              className="h-auto w-24"
            />
          </p>
        </div>
        <div>
          <p className="font-heading text-sm font-bold uppercase tracking-wider text-cye-blue">Explore</p>
          <ul className="mt-4 space-y-2">
            {EXPLORE_LINKS.map((link) => (
              <li key={link.href}>
                <a href={link.href} className="text-sm text-cye-ink/70 hover:text-cye-orange">
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="font-heading text-sm font-bold uppercase tracking-wider text-cye-blue">Register</p>
          <ul className="mt-4 space-y-2">
            {REGISTER_LINKS.map((link) => (
              <li key={link.href}>
                <a href={link.href} className="text-sm text-cye-ink/70 hover:text-cye-orange">
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="font-heading text-sm font-bold uppercase tracking-wider text-cye-blue">Connect</p>
          <a
            href={`https://${EVENT.website}`}
            className="mt-4 inline-block text-sm font-semibold text-cye-orange hover:text-cye-orange-lt"
          >
            {EVENT.website}
          </a>
          <a href={`mailto:${EMAILS.info}`} className="mt-2 block text-sm text-cye-ink/70 hover:text-cye-orange">
            {EMAILS.info}
          </a>
          <SocialLinks className="mt-4" />
        </div>
      </Container>
      <Container className="mt-10 border-t border-cye-blue/10 pt-6">
        <p className="text-center text-xs text-cye-ink/50">
          © {new Date().getFullYear()} {EVENT.name}. All rights reserved.
        </p>
      </Container>
    </footer>
  );
}
