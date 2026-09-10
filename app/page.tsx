import { About } from "@/components/About";
import { Achievements } from "@/components/Achievements";
import { Audience } from "@/components/Audience";
import { ContactCTA } from "@/components/ContactCTA";
import { DirectorMessage } from "@/components/DirectorMessage";
import { Footer } from "@/components/Footer";
import { Gallery } from "@/components/Gallery";
import { Guests } from "@/components/Guests";
import { Hero } from "@/components/Hero";
import { Navbar } from "@/components/Navbar";
import { Sponsorship } from "@/components/Sponsorship";
import { Stalls } from "@/components/Stalls";
import { StatsBand } from "@/components/StatsBand";
import { Verticals } from "@/components/Verticals";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main id="main">
        <Hero />
        <About />
        <StatsBand />
        <Audience />
        <Verticals />
        <Achievements />
        <Gallery />
        <Guests />
        <Sponsorship />
        <Stalls />
        <DirectorMessage />
        <ContactCTA />
      </main>
      <Footer />
    </>
  );
}
