import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  Cloud,
  Download,
  Fingerprint,
  HardDrive,
  Lock,
  Mail,
  Shield,
  Upload,
} from "lucide-react";

import dashboardScreenshot from "../../../stitch-assets/landing-page-screenshot.png";
import interfaceScreenshot from "../../../stitch-assets/hero-interface.png";
import {
  OVERAGE_PRICE_PER_100GB,
  PLAN_ORDER,
  PLANS,
} from "@/lib/plans";
import { cn } from "@/lib/utils";

const siteLinks = [
  { label: "Features", href: "/features" },
  { label: "Pricing", href: "/pricing" },
  { label: "FAQ", href: "/faq" },
  { label: "Contact", href: "/contact" },
];

const workflowSteps = [
  {
    number: "01",
    title: "Create the delivery",
    description:
      "Open a gallery, assign the client, and generate a clean private link with its own access code.",
  },
  {
    number: "02",
    title: "Upload straight to storage",
    description:
      "Originals go from the browser to private R2 storage. The app never becomes an expensive upload relay.",
  },
  {
    number: "03",
    title: "Reveal the collection",
    description:
      "Clients unlock the gallery, browse fast previews, and download authenticated originals without a login wall.",
  },
];

const deliveryPillars = [
  {
    icon: Lock,
    title: "Private originals",
    description:
      "Original files never become public object URLs. Every download is gated through the application.",
  },
  {
    icon: Shield,
    title: "Access-code entry",
    description:
      "Each gallery is protected with a dedicated code so photographers can share confidently without creating client accounts.",
  },
  {
    icon: Cloud,
    title: "Fast previews",
    description:
      "Optimized thumbnails and viewer assets arrive quickly while full-resolution files stay reserved for explicit download requests.",
  },
  {
    icon: Download,
    title: "Billing clarity",
    description:
      "Storage limits and overage are visible product features instead of surprise invoices hidden behind a sales flow.",
  },
];

const workflowDetails = [
  "Private link delivery tuned for wedding, portrait, and commercial work",
  "Mobile-ready browsing with masonry layouts, keyboard support, and calm motion",
  "Direct upload architecture that protects margins as storage volume grows",
];

const testimonials = [
  {
    name: "Mila Santos",
    role: "Editorial wedding photographer",
    quote:
      "My couples notice the delivery experience immediately. It feels considered before they even reach the first download button.",
  },
  {
    name: "Rowan Ellis",
    role: "Brand and campaign photographer",
    quote:
      "The private delivery model gives commercial clients the control they expect without forcing me into bloated studio software.",
  },
  {
    name: "Aisha Moreau",
    role: "Portrait studio owner",
    quote:
      "The pricing is straightforward, the galleries load fast, and the product feels more premium than tools that cost twice as much.",
  },
];

const faqItems = [
  {
    question: "How does the free plan work?",
    answer:
      "Free includes 3 GB of secure storage, private gallery delivery, and full-resolution downloads for up to three active galleries.",
  },
  {
    question: "Do clients need accounts?",
    answer:
      "No. Clients unlock galleries with an access code and can move through the collection without creating their own login.",
  },
  {
    question: "Are originals ever public?",
    answer:
      "No. Originals remain in a private bucket and are served through authenticated download routes only after access validation.",
  },
  {
    question: "What happens when I exceed storage?",
    answer: `Additional storage is billed at $${OVERAGE_PRICE_PER_100GB} per 100 GB per month, with usage surfaced clearly in the product.`,
  },
];

const contactCards = [
  {
    title: "General product questions",
    detail: "hello@atelier.gallery",
    href: "mailto:hello@atelier.gallery?subject=Atelier%20question",
  },
  {
    title: "Book a studio demo",
    detail: "demo@atelier.gallery",
    href: "mailto:demo@atelier.gallery?subject=Atelier%20demo",
  },
  {
    title: "Billing and support",
    detail: "support@atelier.gallery",
    href: "mailto:support@atelier.gallery?subject=Atelier%20support",
  },
];

export function MarketingShell({
  children,
  currentPath = "/",
}: {
  children: React.ReactNode;
  currentPath?: string;
}) {
  return (
    <div className="page-backdrop">
      <div className="page-noise" aria-hidden="true" />
      <SiteHeader currentPath={currentPath} />
      <main id="main-content" className="relative z-10 pb-20 pt-24">
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}

export function SiteHeader({ currentPath = "/" }: { currentPath?: string }) {
  return (
    <header className="fixed inset-x-0 top-0 z-50 px-4 py-4 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-[90rem] items-center justify-between rounded-[1.75rem] border border-white/10 bg-[rgba(12,13,12,0.82)] px-5 py-4 shadow-[0_24px_80px_rgba(0,0,0,0.32)] backdrop-blur-2xl">
        <div className="flex items-center gap-8">
          <Link
            href="/"
            className="font-display text-[1.4rem] tracking-[-0.05em] text-[var(--foreground-strong)]"
          >
            Atelier
          </Link>
          <nav className="hidden items-center gap-6 md:flex">
            {siteLinks.map((link) => {
              const isActive = currentPath === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "text-sm tracking-[0.02em] transition-colors",
                    isActive
                      ? "text-[var(--foreground-strong)]"
                      : "text-[var(--muted-strong)] hover:text-[var(--foreground-strong)]",
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link href="/login" className="btn-ghost px-4 py-2 text-sm">
            Log in
          </Link>
          <Link href="/signup" className="btn-primary px-4 py-2 text-sm">
            Start free
          </Link>
        </div>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="relative z-10 border-t border-white/8">
      <div className="page-shell grid gap-10 py-10 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-4">
          <p className="kicker">Atelier</p>
          <h2 className="headline max-w-xl text-3xl text-[var(--foreground-strong)] sm:text-4xl">
            Premium client delivery for photographers who want the software to
            feel as intentional as the work.
          </h2>
          <p className="max-w-xl text-sm leading-7 text-[var(--muted-strong)]">
            Secure originals. Clear pricing. A gallery experience clients
            remember.
          </p>
        </div>

        <div className="grid gap-8 sm:grid-cols-2">
          <div className="space-y-3">
            <p className="text-xs uppercase tracking-[0.24em] text-[var(--muted)]">
              Navigate
            </p>
            {siteLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block text-sm text-[var(--muted-strong)] transition-colors hover:text-[var(--foreground-strong)]"
              >
                {link.label}
              </Link>
            ))}
          </div>
          <div className="space-y-3">
            <p className="text-xs uppercase tracking-[0.24em] text-[var(--muted)]">
              Legal
            </p>
            <Link
              href="/privacy"
              className="block text-sm text-[var(--muted-strong)] transition-colors hover:text-[var(--foreground-strong)]"
            >
              Privacy policy
            </Link>
            <Link
              href="/terms"
              className="block text-sm text-[var(--muted-strong)] transition-colors hover:text-[var(--foreground-strong)]"
            >
              Terms of service
            </Link>
            <a
              href="mailto:hello@atelier.gallery"
              className="block text-sm text-[var(--muted-strong)] transition-colors hover:text-[var(--foreground-strong)]"
            >
              hello@atelier.gallery
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

function SectionIntro({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="max-w-2xl space-y-4">
      <p className="kicker">{eyebrow}</p>
      <h2 className="headline text-[clamp(2.4rem,5vw,4.2rem)] leading-[0.95] text-[var(--foreground-strong)]">
        {title}
      </h2>
      <p className="max-w-xl text-base leading-8 text-[var(--muted-strong)]">
        {description}
      </p>
    </div>
  );
}

export function PageHero({
  eyebrow,
  title,
  description,
  primaryHref,
  primaryLabel,
  secondaryHref,
  secondaryLabel,
}: {
  eyebrow: string;
  title: string;
  description: string;
  primaryHref: string;
  primaryLabel: string;
  secondaryHref?: string;
  secondaryLabel?: string;
}) {
  const PrimaryAction = primaryHref.startsWith("mailto:") ? "a" : Link;
  const SecondaryAction =
    secondaryHref && secondaryHref.startsWith("mailto:") ? "a" : Link;

  return (
    <section className="page-shell pt-10">
      <div className="section-card overflow-hidden px-6 py-10 sm:px-10 lg:px-12 lg:py-14">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
          <SectionIntro
            eyebrow={eyebrow}
            title={title}
            description={description}
          />

          <div className="flex flex-wrap gap-3 lg:justify-end">
            <PrimaryAction href={primaryHref} className="btn-primary px-5 py-3 text-sm">
              {primaryLabel}
            </PrimaryAction>
            {secondaryHref && secondaryLabel ? (
              <SecondaryAction
                href={secondaryHref}
                className="btn-secondary px-5 py-3 text-sm"
              >
                {secondaryLabel}
              </SecondaryAction>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}

export function HeroSection() {
  return (
    <section className="page-shell pt-8">
      <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
        <div className="space-y-7">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/4 px-4 py-2 text-[11px] uppercase tracking-[0.24em] text-[var(--accent)]">
            <span className="h-2 w-2 rounded-full bg-[var(--accent)]" />
            Private gallery delivery for photographers
          </div>

          <div className="space-y-5">
            <h1 className="headline max-w-[12ch] text-[clamp(3.6rem,8vw,7.5rem)] leading-[0.88] text-[var(--foreground-strong)]">
              Premium client galleries without overpriced subscriptions.
            </h1>
            <p className="max-w-xl text-lg leading-8 text-[var(--muted-strong)]">
              Atelier pairs an editorial-first gallery experience with secure
              originals, direct browser uploads, and pricing that remains clear
              as your archive grows.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link href="/signup" className="btn-primary px-5 py-3 text-sm">
              Start free
              <ArrowRight className="h-4 w-4" />
            </Link>
            <a href="#gallery-preview" className="btn-secondary px-5 py-3 text-sm">
              View gallery flow
            </a>
            <a
              href="mailto:demo@atelier.gallery?subject=Atelier%20demo"
              className="btn-ghost px-4 py-3 text-sm text-[var(--muted-strong)] hover:text-[var(--foreground-strong)]"
            >
              Book demo
            </a>
          </div>

          <div className="flex flex-wrap gap-6 text-sm text-[var(--muted-strong)]">
            {["3 GB free storage", "No credit card required", "Authenticated downloads"].map(
              (item) => (
                <div key={item} className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-[var(--accent)]" />
                  <span>{item}</span>
                </div>
              ),
            )}
          </div>
        </div>

        <div id="gallery-preview" className="relative">
          <div className="absolute inset-x-[14%] top-[8%] h-40 rounded-full bg-[radial-gradient(circle,rgba(212,182,136,0.22),transparent_70%)] blur-3xl" />
          <div className="section-card overflow-hidden p-3 sm:p-4">
            <Image
              src={dashboardScreenshot}
              alt="Atelier dashboard preview showing gallery management and premium UI."
              className="w-full rounded-[1.35rem] border border-white/10 object-cover"
              priority
            />
          </div>
          <div className="absolute -bottom-6 left-4 hidden w-[38%] rounded-[1.4rem] border border-white/10 bg-[rgba(12,13,12,0.84)] p-3 shadow-[0_18px_50px_rgba(0,0,0,0.3)] backdrop-blur-xl sm:block">
            <Image
              src={interfaceScreenshot}
              alt="Close crop of Atelier interface components."
              className="rounded-[1rem] object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

export function HowItWorksSection() {
  return (
    <section className="page-shell">
      <div className="grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <SectionIntro
            eyebrow="How it works"
            title="A delivery workflow designed to stay elegant under pressure."
            description="Atelier keeps the photographer path fast and operationally lean while the client experience remains calm, secure, and premium."
          />
        </div>

        <div className="grid gap-4 lg:col-span-7 lg:grid-cols-2">
          {workflowSteps.map((step, index) => (
            <article
              key={step.number}
              className={cn(
                "editorial-card relative overflow-hidden px-6 py-6",
                index === 2 ? "lg:col-span-2" : "",
              )}
            >
              <p className="font-mono text-xs tracking-[0.26em] text-[var(--accent)]">
                {step.number}
              </p>
              <h3 className="headline mt-6 text-2xl text-[var(--foreground-strong)]">
                {step.title}
              </h3>
              <p className="mt-4 max-w-md text-sm leading-7 text-[var(--muted-strong)]">
                {step.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function SecureDeliverySection() {
  return (
    <section className="page-shell">
      <div className="grid gap-6 lg:grid-cols-[0.88fr_1.12fr]">
        <div className="section-card px-6 py-8 sm:px-8">
          <SectionIntro
            eyebrow="Security made visible"
            title="Trust is not a hidden implementation detail."
            description="The product tells photographers and clients exactly how delivery stays secure: private originals, verified access, and clear storage boundaries."
          />

          <div className="mt-8 grid gap-4">
            {[
              "Originals remain private in Cloudflare R2",
              "Access codes create fast client entry without account friction",
              "Authenticated download routes keep full-resolution files off public links",
            ].map((item) => (
              <div
                key={item}
                className="rounded-[1.2rem] border border-white/8 bg-white/4 px-4 py-4 text-sm leading-7 text-[var(--muted-strong)]"
              >
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {deliveryPillars.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <article key={pillar.title} className="editorial-card px-6 py-7">
                <div className="flex h-11 w-11 items-center justify-center rounded-[0.95rem] border border-white/10 bg-white/4">
                  <Icon className="h-5 w-5 text-[var(--accent)]" />
                </div>
                <h3 className="headline mt-6 text-[1.7rem] leading-[0.95] text-[var(--foreground-strong)]">
                  {pillar.title}
                </h3>
                <p className="mt-4 text-sm leading-7 text-[var(--muted-strong)]">
                  {pillar.description}
                </p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function WorkflowSection() {
  return (
    <section className="page-shell">
      <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="section-card overflow-hidden p-4">
          <Image
            src={interfaceScreenshot}
            alt="Atelier product detail showing gallery and settings surfaces."
            className="h-full w-full rounded-[1.5rem] border border-white/10 object-cover"
          />
        </div>

        <div className="section-card px-6 py-8 sm:px-8">
          <SectionIntro
            eyebrow="Photographer workflow"
            title="Clean control on the studio side, calm confidence on the client side."
            description="The product avoids the old all-in-one photography suite pattern. It focuses on delivery, storage, billing transparency, and polished presentation."
          />

          <div className="mt-8 space-y-4">
            {workflowDetails.map((item) => (
              <div
                key={item}
                className="flex items-start gap-3 rounded-[1.15rem] border border-white/8 bg-white/4 px-4 py-4"
              >
                <span className="mt-1 h-2.5 w-2.5 rounded-full bg-[var(--accent)]" />
                <p className="text-sm leading-7 text-[var(--muted-strong)]">
                  {item}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export function PricingSection() {
  return (
    <section className="page-shell" id="pricing">
      <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
        <SectionIntro
          eyebrow="Pricing"
          title="Storage-led pricing that stays understandable."
          description="Free lowers signup friction. Pro is positioned as the daily working plan. Overage is explicit before photographers commit."
        />
        <p className="max-w-sm text-sm leading-7 text-[var(--muted-strong)]">
          Additional storage is billed at ${OVERAGE_PRICE_PER_100GB} per 100 GB
          per month. No hidden enterprise tiers, no surprise download charges.
        </p>
      </div>

      <div className="mt-10 grid gap-4 xl:grid-cols-4">
        {PLAN_ORDER.map((planId) => {
          const plan = PLANS[planId];
          const isPopular = Boolean(plan?.popular);

          if (!plan) {
            return null;
          }

          return (
            <article
              key={plan.id}
              className={cn(
                "editorial-card flex h-full flex-col px-6 py-6",
                isPopular ? "border-[var(--accent)]/45 bg-[rgba(214,184,140,0.09)]" : "",
              )}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm tracking-[0.02em] text-[var(--foreground-strong)]">
                    {plan.name}
                  </p>
                  <div className="mt-4 flex items-end gap-2">
                    <span className="headline text-5xl text-[var(--foreground-strong)]">
                      ${plan.price}
                    </span>
                    <span className="pb-2 text-sm text-[var(--muted)]">/month</span>
                  </div>
                </div>
                {isPopular ? (
                  <span className="rounded-full border border-[var(--accent)]/40 bg-[var(--accent)]/10 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-[var(--accent)]">
                    Most used
                  </span>
                ) : null}
              </div>

              <div className="mt-4 min-h-20">
                <p className="text-sm text-[var(--muted-strong)]">
                  {plan.bestFor}
                </p>
                <p className="mt-3 font-mono text-xs uppercase tracking-[0.24em] text-[var(--muted)]">
                  {plan.storageLimitLabel} storage
                </p>
              </div>

              <div className="mt-6 flex-1 space-y-3">
                {plan.features.map((feature) => (
                  <div key={feature} className="flex items-start gap-3">
                    <Check className="mt-1 h-4 w-4 shrink-0 text-[var(--accent)]" />
                    <span className="text-sm leading-7 text-[var(--muted-strong)]">
                      {feature}
                    </span>
                  </div>
                ))}
              </div>

              <Link
                href="/signup"
                className={cn(
                  "mt-8 inline-flex items-center justify-between rounded-[1rem] px-4 py-3 text-sm transition-colors",
                  isPopular
                    ? "bg-[var(--accent)] text-[#141311]"
                    : "border border-white/10 bg-white/4 text-[var(--foreground-strong)] hover:bg-white/7",
                )}
              >
                <span>{plan.price === 0 ? "Start free" : `Choose ${plan.name}`}</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </article>
          );
        })}
      </div>
    </section>
  );
}

export function TestimonialsSection() {
  return (
    <section className="page-shell">
      <div className="grid gap-6 lg:grid-cols-[0.82fr_1.18fr]">
        <SectionIntro
          eyebrow="What photographers notice"
          title="A calmer product earns trust before anyone reads the feature list."
          description="The strongest referral engine in a client gallery platform is the gallery itself. These reactions are the standard the product aims for."
        />

        <div className="grid gap-4 md:grid-cols-2">
          {testimonials.map((testimonial, index) => (
            <article
              key={testimonial.name}
              className={cn(
                "editorial-card flex h-full flex-col justify-between px-6 py-6",
                index === 1 ? "md:translate-y-8" : "",
              )}
            >
              <p className="text-base leading-8 text-[var(--foreground)]">
                “{testimonial.quote}”
              </p>
              <div className="mt-8 border-t border-white/8 pt-5">
                <p className="text-sm text-[var(--foreground-strong)]">
                  {testimonial.name}
                </p>
                <p className="mt-1 text-sm text-[var(--muted)]">
                  {testimonial.role}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function TrustSection() {
  return (
    <section className="page-shell">
      <div className="section-card px-6 py-8 sm:px-8 lg:px-10">
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
          <SectionIntro
            eyebrow="Trust"
            title="Built for margins, privacy, and confidence."
            description="Uploads bypass the server, storage remains private, and the product makes pricing legible. The operational model is simple on purpose."
          />
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              {
                icon: Upload,
                label: "Upload path",
                value: "Browser → R2",
              },
              {
                icon: HardDrive,
                label: "Storage posture",
                value: "Private only",
              },
              {
                icon: Fingerprint,
                label: "Download model",
                value: "Authenticated",
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.label}
                  className="rounded-[1.4rem] border border-white/8 bg-white/4 px-5 py-5"
                >
                  <Icon className="h-5 w-5 text-[var(--accent)]" />
                  <p className="mt-5 text-xs uppercase tracking-[0.22em] text-[var(--muted)]">
                    {item.label}
                  </p>
                  <p className="headline mt-3 text-2xl text-[var(--foreground-strong)]">
                    {item.value}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

export function FaqSection() {
  return (
    <section className="page-shell">
      <div className="grid gap-6 lg:grid-cols-[0.72fr_1.28fr]">
        <SectionIntro
          eyebrow="FAQ"
          title="Direct answers for the parts photographers actually weigh."
          description="Atelier is intentionally narrow: secure delivery, private originals, and clear pricing. These are the recurring questions around that promise."
        />

        <div className="grid gap-4">
          {faqItems.map((item) => (
            <article key={item.question} className="editorial-card px-6 py-5">
              <h3 className="text-lg text-[var(--foreground-strong)]">
                {item.question}
              </h3>
              <p className="mt-3 text-sm leading-7 text-[var(--muted-strong)]">
                {item.answer}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function ContactSection() {
  return (
    <section className="page-shell">
      <div className="grid gap-6 lg:grid-cols-[0.78fr_1.22fr]">
        <SectionIntro
          eyebrow="Contact"
          title="Talk to a human before you commit."
          description="Questions about onboarding, billing, or fit are handled directly. No routed enterprise queue, no generic contact form with no owner."
        />

        <div className="grid gap-4 md:grid-cols-3">
          {contactCards.map((card) => (
            <a
              key={card.title}
              href={card.href}
              className="editorial-card flex h-full flex-col justify-between px-6 py-6 transition-transform hover:-translate-y-1"
            >
              <div>
                <div className="flex h-11 w-11 items-center justify-center rounded-[1rem] border border-white/10 bg-white/4">
                  <Mail className="h-5 w-5 text-[var(--accent)]" />
                </div>
                <h3 className="headline mt-6 text-2xl text-[var(--foreground-strong)]">
                  {card.title}
                </h3>
              </div>
              <div className="mt-8 flex items-center justify-between gap-4 text-sm text-[var(--muted-strong)]">
                <span>{card.detail}</span>
                <ArrowRight className="h-4 w-4" />
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
