import type { ReactNode } from "react";
import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { RegisterCTA } from "@/components/RegisterCTA";

export function SiteChrome({ children }: { children: ReactNode }) {
  return (
    <>
      <Navbar />
      {children}
      <RegisterCTA />
      <Footer />
    </>
  );
}
