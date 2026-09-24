import { EVENT, NAV_LINKS } from "@/data/event";
import { Container } from "@/components/ui/Container";
import { Logo } from "@/components/ui/Logo";

const SOCIALS = [
  {
    href: "https://instagram.com",
    label: "Instagram",
    icon: (
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    href: "https://facebook.com",
    label: "Facebook",
    icon: (
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden>
        <path d="M14 9h3V6h-3c-2.2 0-4 1.8-4 4v2H8v3h2v7h3v-7h3l1-3h-4V10c0-.6.4-1 1-1Z" />
      </svg>
    ),
  },
  {
    href: "https://linkedin.com",
    label: "LinkedIn",
    icon: (
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden>
        <path d="M6.5 9H4v11h2.5V9ZM5.3 4A1.6 1.6 0 1 0 5.3 7.2 1.6 1.6 0 0 0 5.3 4ZM20 20h-2.5v-5.6c0-1.8-.8-2.4-1.8-2.4s-2 .9-2 2.5V20H11.2V9H13.7v1.5c.5-.9 1.7-1.8 3.4-1.8 2.4 0 2.9 1.7 2.9 4.3V20Z" />
      </svg>
    ),
  },
  {
    href: "https://youtube.com",
    label: "YouTube",
    icon: (
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden>
        <path d="M21.6 7.2a2.7 2.7 0 0 0-1.9-1.9C18 5 12 5 12 5s-6 0-7.7.3A2.7 2.7 0 0 0 2.4 7.2 28 28 0 0 0 2 12a28 28 0 0 0 .4 4.8 2.7 2.7 0 0 0 1.9 1.9C6 19 12 19 12 19s6 0 7.7-.3a2.7 2.7 0 0 0 1.9-1.9A28 28 0 0 0 22 12a28 28 0 0 0-.4-4.8ZM10 15.4V8.6L15.2 12 10 15.4Z" />
      </svg>
    ),
  },
];

export function Footer() {
  return (
    <footer className="border-t border-cye-blue/10 bg-white py-12">
      <Container className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <Logo />
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-cye-ink/65">
            {EVENT.tagline}
            <br />
            {EVENT.date} · {EVENT.venue}, {EVENT.city}
          </p>
        </div>
        <div>
          <p className="font-heading text-sm font-bold uppercase tracking-wider text-cye-blue">Explore</p>
          <ul className="mt-4 space-y-2">
            {NAV_LINKS.map((link) => (
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
          <div className="mt-4 flex gap-2">
            {SOCIALS.map((social) => (
              <a
                key={social.label}
                href={social.href}
                aria-label={social.label}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-cye-mist text-cye-blue hover:bg-cye-orange hover:text-white"
              >
                {social.icon}
              </a>
            ))}
          </div>
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
