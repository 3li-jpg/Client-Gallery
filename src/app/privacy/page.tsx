import type { Metadata } from "next";

import { MarketingShell, PageHero } from "@/components/marketing/site";

export const metadata: Metadata = {
  title: "Privacy policy",
  description:
    "How Atelier handles account information, gallery access data, storage metadata, and support communications.",
};

const sections = [
  {
    title: "Information we collect",
    body:
      "Atelier collects account details you provide directly, billing and plan information required to run the service, and gallery metadata needed to deliver private client collections.",
  },
  {
    title: "Gallery and access data",
    body:
      "We store gallery records, upload metadata, and access events that help photographers understand delivery status and keep original downloads protected.",
  },
  {
    title: "Storage and file handling",
    body:
      "Original files are stored in private object storage. Preview assets may be optimized for faster viewing, but private originals are not exposed as public delivery links.",
  },
  {
    title: "Billing and support",
    body:
      "Billing details are handled through Stripe. Support requests and email conversations may be retained to resolve account, delivery, or billing issues.",
  },
  {
    title: "Questions",
    body:
      "If you need deletion, export, or privacy support, contact support@atelier.gallery and include the account email tied to the request.",
  },
];

export default function PrivacyPage() {
  return (
    <MarketingShell currentPath="/privacy">
      <PageHero
        eyebrow="Privacy"
        title="Privacy policy"
        description="This summary explains the operational data Atelier uses to run secure gallery delivery and account management."
        primaryHref="mailto:support@atelier.gallery?subject=Privacy%20request"
        primaryLabel="Privacy support"
        secondaryHref="/terms"
        secondaryLabel="Read terms"
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
