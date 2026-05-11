import type { Metadata } from "next";

import {
  MarketingShell,
  PageHero,
  PricingSection,
  TrustSection,
} from "@/components/marketing/site";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Transparent pricing for private client galleries, secure storage, and authenticated original downloads.",
};

export default function PricingPage() {
  return (
    <MarketingShell currentPath="/pricing">
      <PageHero
        eyebrow="Pricing"
        title="Premium delivery without the bloated software invoice."
        description="Every plan is centered on secure storage and private gallery delivery. The pricing model is visible because billing clarity is part of product trust."
        primaryHref="/signup"
        primaryLabel="Start free"
        secondaryHref="/contact"
        secondaryLabel="Talk to us"
      />
      <PricingSection />
      <TrustSection />
    </MarketingShell>
  );
}
