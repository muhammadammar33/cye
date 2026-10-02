import { About } from "@/components/About";
import { AdvisoryBoard } from "@/components/AdvisoryBoard";
import { Achievements } from "@/components/Achievements";
import { Audience } from "@/components/Audience";
import { ContactCTA } from "@/components/ContactCTA";
import { DirectorMessage } from "@/components/DirectorMessage";
import { Gallery } from "@/components/Gallery";
import { GetInvolved } from "@/components/GetInvolved";
import { Guests } from "@/components/Guests";
import { Hero } from "@/components/Hero";
import { SiteChrome } from "@/components/SiteChrome";
import { Sponsorship } from "@/components/Sponsorship";
import { Stalls } from "@/components/Stalls";
import { StatsBand } from "@/components/StatsBand";
import { Venue } from "@/components/Venue";
import { Verticals } from "@/components/Verticals";

export default function HomePage() {
  return (
    <SiteChrome>
      <main id="main">
        <Hero />
        <About />
        <StatsBand />
        <Audience />
        <Verticals />
        <GetInvolved />
        <Achievements />
        <Gallery />
        <AdvisoryBoard />
        <Guests />
        <Sponsorship />
        <Stalls />
        <Venue />
        <DirectorMessage />
        <ContactCTA />
      </main>
    </SiteChrome>
  );
}
