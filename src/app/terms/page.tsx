import type { Metadata } from "next";

import { MarketingShell, PageHero } from "@/components/marketing/site";

export const metadata: Metadata = {
  title: "Terms of service",
  description:
    "Terms covering account use, billing, private file delivery, and acceptable use for Atelier.",
};

const sections = [
  {
    title: "Service scope",
    body:
      "Atelier provides private gallery delivery, secure original downloads, and storage-aware account management for photographers and studios.",
  },
  {
    title: "Account responsibility",
    body:
      "Photographers are responsible for account credentials, gallery sharing decisions, and the content uploaded through the platform.",
  },
  {
    title: "Billing and plan limits",
    body:
      "Paid accounts are billed according to the selected plan and any disclosed storage overage. Plan limits are shown in-product so usage remains visible before overage occurs.",
  },
  {
    title: "Acceptable use",
    body:
      "You may not use Atelier to distribute unlawful content, bypass access controls, or attempt to expose private originals through unauthorized means.",
  },
  {
    title: "Support and termination",
    body:
      "We may suspend or terminate accounts that violate these terms or create material security risk. For account questions, contact support@atelier.gallery.",
  },
];

export default function TermsPage() {
  return (
    <MarketingShell currentPath="/terms">
      <PageHero
        eyebrow="Terms"
        title="Terms of service"
        description="These terms describe the operating rules around account use, billing, and secure delivery through Atelier."
        primaryHref="mailto:support@atelier.gallery?subject=Terms%20question"
        primaryLabel="Ask a question"
        secondaryHref="/privacy"
        secondaryLabel="Read privacy policy"
      />

      <section className="page-shell">
        <div className="section-card max-w-4xl px-6 py-8 sm:px-8">
          <div className="space-y-8">
            {sections.map((section) => (
              <article key={section.title} className="space-y-3">
                <h2 className="headline text-3xl text-[var(--foreground-strong)]">
                  {section.title}
                </h2>
                <p className="text-sm leading-7 text-[var(--muted-strong)]">
                  {section.body}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </MarketingShell>
  );
}
