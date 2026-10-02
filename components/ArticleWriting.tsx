import { CalendarDays, Check, ExternalLink, FileText, Languages, MapPin, PenLine, Trophy } from "lucide-react";
import { ARTICLE_COMPETITION as A } from "@/data/event";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Card } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import { FadeIn } from "@/components/ui/FadeIn";
import { SectionHeading } from "@/components/ui/SectionHeading";

const linkClass =
  "inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 font-heading text-sm font-bold uppercase tracking-wide transition-all duration-300 hover:-translate-y-0.5";

function ActionButtons({ className }: { className?: string }) {
  return (
    <div className={`flex flex-col items-center justify-center gap-3 sm:flex-row ${className ?? ""}`}>
      <a href={A.registerUrl} target="_blank" rel="noreferrer" className={`${linkClass} bg-grad-orange text-white shadow-lg shadow-cye-orange/25 hover:brightness-110`}>
        Register for the competition
        <ExternalLink className="h-4 w-4" aria-hidden />
      </a>
      <a href={A.submitUrl} target="_blank" rel="noreferrer" className={`${linkClass} border-2 border-cye-blue bg-white text-cye-blue hover:bg-cye-mist`}>
        Submit your article
        <ExternalLink className="h-4 w-4" aria-hidden />
      </a>
    </div>
  );
}

export function ArticleWriting() {
  return (
    <section className="bg-wash pt-32 pb-20 sm:pt-36 sm:pb-24">
      <Container>
        <FadeIn>
          <Breadcrumbs current="Article Writing" />
          <SectionHeading eyebrow={`Organized by ${A.organizerShort}`} title={A.title} description={A.organizer} />
          <ActionButtons className="mt-8" />
        </FadeIn>

        <FadeIn delay={0.05} className="mx-auto mt-12 max-w-3xl space-y-4 text-center text-base leading-relaxed text-cye-ink/75 sm:text-lg">
          {A.overview.map((para) => (
            <p key={para.slice(0, 24)}>{para}</p>
          ))}
        </FadeIn>

        <div className="mt-12 grid gap-5 md:grid-cols-2">
          <FadeIn>
            <Card hover={false} className="h-full p-6 sm:p-7">
              <h2 className="flex items-center gap-2 font-heading text-lg font-extrabold uppercase text-cye-blue">
                <PenLine className="h-5 w-5 text-cye-orange" aria-hidden />
                Themes (choose one)
              </h2>
              <ol className="mt-4 space-y-3">
                {A.themes.map((theme, i) => (
                  <li key={theme} className="flex gap-3 text-sm text-cye-ink/75 sm:text-base">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-grad-orange text-xs font-bold text-white">
                      {i + 1}
                    </span>
                    {theme}
                  </li>
                ))}
              </ol>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-cye-mist p-4">
                  <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-cye-ink/50">
                    <Languages className="h-4 w-4 text-cye-orange" aria-hidden />
                    Languages
                  </p>
                  <p className="mt-1 font-heading font-bold text-cye-blue">{A.languages.join(" or ")}</p>
                </div>
                <div className="rounded-2xl bg-cye-mist p-4">
                  <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-cye-ink/50">
                    <FileText className="h-4 w-4 text-cye-orange" aria-hidden />
                    Word count
                  </p>
                  <p className="mt-1 font-heading font-bold text-cye-blue">{A.wordCount}</p>
                </div>
              </div>
            </Card>
          </FadeIn>
          <FadeIn delay={0.06}>
            <Card hover={false} className="h-full p-6 sm:p-7">
              <h2 className="font-heading text-lg font-extrabold uppercase text-cye-blue">Who can participate?</h2>
              <ul className="mt-4 space-y-2.5">
                {A.eligibility.map((item) => (
                  <li key={item} className="flex gap-2 text-sm text-cye-ink/75 sm:text-base">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-cye-orange" aria-hidden />
                    {item}
                  </li>
                ))}
              </ul>
            </Card>
          </FadeIn>
        </div>

        <FadeIn delay={0.05} className="mt-12 text-center">
          <h2 className="font-heading text-2xl font-black uppercase text-cye-blue sm:text-3xl">Winning Prizes</h2>
        </FadeIn>
        <div className="mx-auto mt-6 grid max-w-4xl gap-5 sm:grid-cols-3">
          {A.prizes.map((prize, i) => (
            <FadeIn key={prize.place} delay={i * 0.06}>
              <Card className="h-full p-6 text-center">
                <Trophy className="mx-auto h-8 w-8 text-cye-orange" aria-hidden />
                <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-cye-ink/45">{prize.place}</p>
                <p className="mt-1 font-heading text-2xl font-black text-cye-blue">{prize.amount}</p>
              </Card>
            </FadeIn>
          ))}
        </div>
        <FadeIn delay={0.08} className="mx-auto mt-5 max-w-4xl rounded-3xl bg-cye-mist p-5 text-center">
          <p className="text-sm text-cye-ink/75">{A.prizeExtras}</p>
          <p className="mt-2 flex flex-wrap justify-center gap-x-4 gap-y-1 text-sm font-semibold text-cye-blue">
            {A.benefits.map((b) => (
              <span key={b}>{b}</span>
            ))}
          </p>
        </FadeIn>

        <div className="mt-12 grid gap-5 lg:grid-cols-3">
          <FadeIn>
            <Card hover={false} className="h-full p-6 sm:p-7">
              <h2 className="flex items-center gap-2 font-heading text-lg font-extrabold uppercase text-cye-blue">
                <CalendarDays className="h-5 w-5 text-cye-orange" aria-hidden />
                Important dates
              </h2>
              <dl className="mt-4 space-y-3">
                {A.dates.map((d) => (
                  <div key={d.label}>
                    <dt className="text-xs font-semibold uppercase tracking-wide text-cye-ink/50">{d.label}</dt>
                    <dd className="font-heading font-bold text-cye-blue">{d.value}</dd>
                  </div>
                ))}
              </dl>
            </Card>
          </FadeIn>
          <FadeIn delay={0.06}>
            <Card hover={false} className="h-full p-6 sm:p-7">
              <h2 className="flex items-center gap-2 font-heading text-lg font-extrabold uppercase text-cye-blue">
                <MapPin className="h-5 w-5 text-cye-orange" aria-hidden />
                Closing events
              </h2>
              <ul className="mt-4 space-y-3">
                {A.closingEvents.map((e) => (
                  <li key={e.city}>
                    <p className="font-heading font-bold text-cye-blue">{e.city}</p>
                    <p className="text-sm text-cye-ink/70">{e.venue}</p>
                  </li>
                ))}
              </ul>
            </Card>
          </FadeIn>
          <FadeIn delay={0.12}>
            <Card hover={false} className="h-full p-6 sm:p-7">
              <h2 className="font-heading text-lg font-extrabold uppercase text-cye-blue">Rules &amp; guidelines</h2>
              <ul className="mt-4 space-y-2">
                {A.rules.map((rule) => (
                  <li key={rule} className="flex gap-2 text-sm text-cye-ink/75">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-cye-orange" aria-hidden />
                    {rule}
                  </li>
                ))}
              </ul>
            </Card>
          </FadeIn>
        </div>

        <FadeIn delay={0.05} className="mt-12 rounded-3xl bg-grad-blue px-6 py-10 text-center text-white">
          <h2 className="font-heading text-2xl font-black uppercase sm:text-3xl">Ready to write?</h2>
          <p className="mx-auto mt-3 max-w-2xl text-white/80">
            Register first, then submit your finished article through the official link. Full details on the{" "}
            <a href={A.source} target="_blank" rel="noreferrer" className="font-semibold text-white underline underline-offset-4">
              {A.organizerShort} website
            </a>
            .
          </p>
          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a href={A.registerUrl} target="_blank" rel="noreferrer" className={`${linkClass} bg-grad-orange text-white hover:brightness-110`}>
              Register
              <ExternalLink className="h-4 w-4" aria-hidden />
            </a>
            <a href={A.submitUrl} target="_blank" rel="noreferrer" className={`${linkClass} border-2 border-white text-white hover:bg-white/10`}>
              Submit your article
              <ExternalLink className="h-4 w-4" aria-hidden />
            </a>
          </div>
        </FadeIn>
      </Container>
    </section>
  );
}
