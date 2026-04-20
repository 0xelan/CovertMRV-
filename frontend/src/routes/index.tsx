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
