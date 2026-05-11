import type { Metadata } from "next";

import {
  ContactSection,
  MarketingShell,
  PageHero,
  TrustSection,
} from "@/components/marketing/site";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Contact Atelier for demos, product questions, billing help, or implementation guidance.",
};

export default function ContactPage() {
  return (
    <MarketingShell currentPath="/contact">
      <PageHero
        eyebrow="Contact"
        title="Questions before you move your client delivery stack?"
        description="Reach the product team directly for demos, onboarding questions, pricing discussions, or support with an existing account."
        primaryHref="mailto:demo@atelier.gallery?subject=Atelier%20demo"
        primaryLabel="Book demo"
        secondaryHref="mailto:hello@atelier.gallery?subject=Atelier%20question"
        secondaryLabel="Email us"
      />
      <ContactSection />
      <TrustSection />
    </MarketingShell>
  );
}
