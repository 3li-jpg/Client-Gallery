import type { Metadata } from "next";

import {
  ContactSection,
  MarketingShell,
  PageHero,
  SecureDeliverySection,
  TrustSection,
  WorkflowSection,
} from "@/components/marketing/site";

export const metadata: Metadata = {
  title: "Features",
  description:
    "See how Atelier handles private delivery, direct uploads, secure downloads, and premium gallery presentation.",
};

export default function FeaturesPage() {
  return (
    <MarketingShell currentPath="/features">
      <PageHero
        eyebrow="Features"
        title="A gallery platform built around delivery, not software sprawl."
        description="Atelier focuses on the parts photographers and clients feel immediately: presentation, privacy, download confidence, and storage visibility."
        primaryHref="/signup"
        primaryLabel="Start free"
        secondaryHref="/pricing"
        secondaryLabel="See pricing"
      />
      <SecureDeliverySection />
      <WorkflowSection />
      <TrustSection />
      <ContactSection />
    </MarketingShell>
  );
}
