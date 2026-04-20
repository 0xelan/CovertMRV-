import { createFileRoute } from "@tanstack/react-router";
import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";
import { Hero } from "@/components/site/Hero";
import {
  ProblemSection,
  HowItWorks,
  DisclosureSpectrum,
  MarketSection,
  ContractsSection,
  WhyFHE,
  Roadmap,
  TechStack,
  ClosingCTA,
} from "@/components/site/Sections";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      {
        title:
          "CovertMRV — Prove Compliance. Reveal Nothing. | Encrypted Climate MRV",
      },
      {
        name: "description",
        content:
          "The first encrypted Measurement, Reporting & Verification protocol for climate compliance. Prove emissions caps without exposing facility data, supplier secrets, or trade strategy. Built on FHE.",
      },
      {
        property: "og:title",
        content: "CovertMRV — Prove Compliance. Reveal Nothing.",
      },
      {
        property: "og:description",
        content:
          "Encrypted MRV protocol for climate compliance, built on Fully Homomorphic Encryption.",
      },
      { property: "og:type", content: "website" },
    ],
  }),
  component: IndexPage,
});

function IndexPage() {
  return (
    <div className="relative bg-background text-foreground">
      <Nav />
      <main>
        <Hero />
        <ProblemSection />
        <HowItWorks />
        <DisclosureSpectrum />
        <MarketSection />
        <ContractsSection />
        <WhyFHE />
        <Roadmap />
        <TechStack />
        <ClosingCTA />
      </main>
      <Footer />
    </div>
  );
}
