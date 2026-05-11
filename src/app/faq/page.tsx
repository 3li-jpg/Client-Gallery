import type { Metadata } from "next";

import {
  ContactSection,
  FaqSection,
  MarketingShell,
  PageHero,
} from "@/components/marketing/site";

export const metadata: Metadata = {
  title: "FAQ",
  description:
    "Answers about secure originals, gallery access, storage limits, and how Atelier works for photographers.",
};

export default function FaqPage() {
  return (
    <MarketingShell currentPath="/faq">
      <PageHero
        eyebrow="FAQ"
        title="Clear answers on privacy, delivery, and pricing."
        description="The product is intentionally narrow, so the questions are usually about security posture, storage, and how clients move through galleries."
        primaryHref="/signup"
        primaryLabel="Create an account"
        secondaryHref="/contact"
        secondaryLabel="Ask a question"
      />
      <FaqSection />
      <ContactSection />
    </MarketingShell>
  );
}
