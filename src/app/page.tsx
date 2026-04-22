import Link from "next/link";
import {
  ArrowRight,
  Check,
  ChevronDown,
  Cloud,
  Download,
  Eye,
  Lock,
  Minus,
  Monitor,
  Plus,
  Shield,
  Smartphone,
  Upload,
  Zap,
} from "lucide-react";

import { PLAN_ORDER, PLANS } from "@/lib/plans";

/* ═══════════════════════════════════════════════
   Navigation
   ═══════════════════════════════════════════════ */

function LandingNav() {
  return (
    <nav className="fixed left-1/2 top-5 z-50 flex w-[calc(100%-2rem)] max-w-4xl -translate-x-1/2 items-center justify-between rounded-full border border-[var(--line)] bg-[rgba(10,10,11,0.82)] px-5 py-3 backdrop-blur-xl sm:px-6">
      <Link
        href="/"
        className="font-display text-lg font-semibold tracking-tight text-[var(--foreground-strong)]"
      >
        Atelier
      </Link>

      <div className="hidden items-center gap-6 sm:flex">
        {[
          { label: "Features", href: "#features" },
          { label: "Pricing", href: "#pricing" },
          { label: "FAQ", href: "#faq" },
        ].map((item) => (
          <a
            key={item.href}
            href={item.href}
            className="font-ui text-[13px] text-[var(--muted-strong)] transition hover:text-[var(--foreground)]"
          >
            {item.label}
          </a>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <Link
          href="/login"
          className="font-ui hidden rounded-full px-4 py-2 text-[13px] text-[var(--muted-strong)] transition hover:text-[var(--foreground)] sm:inline-flex"
        >
          Log in
        </Link>
        <Link
          href="/signup"
          className="btn-primary px-5 py-2 text-[13px] font-semibold"
        >
          Start free
        </Link>
      </div>
    </nav>
  );
}

/* ═══════════════════════════════════════════════
   Hero
   ═══════════════════════════════════════════════ */

function HeroSection() {
  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center px-6 pt-32 pb-20 text-center">
      {/* Atmospheric gradient background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-0 h-[600px] w-[800px] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse,rgba(255,255,255,0.03)_0%,transparent_70%)]" />
        <div className="absolute bottom-0 left-1/2 h-[400px] w-full -translate-x-1/2 bg-[linear-gradient(to_top,var(--background),transparent)]" />
      </div>

      <div className="relative z-10 flex flex-col items-center gap-8">
        <div className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--surface)] px-4 py-2">
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--success)]" />
          <span className="font-ui text-[11px] uppercase tracking-[0.22em] text-[var(--muted)]">
            Now in public beta
          </span>
        </div>

        <h1 className="font-display max-w-[900px] text-[clamp(2.5rem,7vw,5.5rem)] font-bold leading-[0.95] tracking-[-0.04em] text-[var(--foreground-strong)]">
          Premium client galleries without overpriced subscriptions
        </h1>

        <p className="font-body max-w-[560px] text-lg leading-8 text-[var(--muted-strong)]">
          Deliver full-resolution galleries through private links with protected
          access and secure original downloads. Starting free.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/signup"
            className="btn-primary inline-flex items-center gap-2 px-7 py-3.5 text-[15px] font-semibold"
          >
            Start free
            <ArrowRight className="h-4 w-4" />
          </Link>
          <a
            href="#features"
            className="btn-secondary inline-flex items-center gap-2 px-7 py-3.5 text-[15px]"
          >
            See features
          </a>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-[var(--muted)]">
          {[
            "No credit card required",
            "3 GB free storage",
            "Cancel anytime",
          ].map((item) => (
            <div key={item} className="flex items-center gap-2 text-sm">
              <Check className="h-3.5 w-3.5 text-[var(--success)]" />
              <span className="font-body">{item}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════
   How It Works
   ═══════════════════════════════════════════════ */

const steps = [
  {
    number: "01",
    title: "Create a gallery",
    description:
      "Name the shoot, add the client, and generate a private link with its own access code.",
    icon: Plus,
  },
  {
    number: "02",
    title: "Upload your finals",
    description:
      "Push originals directly to private cloud storage. Preview assets optimize in the background.",
    icon: Upload,
  },
  {
    number: "03",
    title: "Share the reveal",
    description:
      "Send clients a clean gallery link. They unlock it, browse fast previews, and download originals.",
    icon: Eye,
  },
];

function HowItWorksSection() {
  return (
    <section className="page-shell pt-4" id="how-it-works">
      <div className="text-center mb-12">
        <p className="kicker">How it works</p>
        <h2 className="headline mt-4 text-[clamp(2rem,4vw,3.2rem)] text-[var(--foreground-strong)]">
          Three steps to premium delivery
        </h2>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {steps.map((step) => {
          const Icon = step.icon;
          return (
            <div
              key={step.number}
              className="subtle-card p-6 transition hover:border-[var(--line-strong)]"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--line)] bg-[var(--surface)]">
                  <Icon className="h-4 w-4 text-[var(--muted-strong)]" />
                </div>
                <span className="font-ui text-xs uppercase tracking-[0.24em] text-[var(--muted)]">
                  {step.number}
                </span>
              </div>
              <h3 className="headline mt-5 text-xl text-[var(--foreground-strong)]">
                {step.title}
              </h3>
              <p className="font-body mt-3 text-sm leading-7 text-[var(--muted)]">
                {step.description}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════
   Features
   ═══════════════════════════════════════════════ */

const features = [
  {
    icon: Shield,
    title: "Private originals",
    description:
      "Full-resolution files stay in private cloud storage. No public URLs, no expiring links. Downloads route through your authenticated app.",
  },
  {
    icon: Upload,
    title: "Direct browser uploads",
    description:
      "Files go straight from the browser to cloud storage using signed upload URLs. Never routes through your server.",
  },
  {
    icon: Lock,
    title: "Access-code delivery",
    description:
      "Each gallery gets its own private access code. Clients unlock their gallery, browse previews, and download approved originals.",
  },
  {
    icon: Smartphone,
    title: "Mobile-first experience",
    description:
      "Gallery pages work beautifully on any device. Responsive masonry layouts, smooth lightbox transitions, and tap-friendly controls.",
  },
  {
    icon: Zap,
    title: "Fast preview delivery",
    description:
      "Lightweight thumbnails and viewer images load instantly. Full originals download only when the client explicitly requests them.",
  },
  {
    icon: Monitor,
    title: "Studio dashboard",
    description:
      "Create galleries, manage uploads, track storage, and monitor client access from one clean control panel.",
  },
];

function FeaturesSection() {
  return (
    <section className="page-shell pt-4" id="features">
      <div className="text-center mb-12">
        <p className="kicker">Platform</p>
        <h2 className="headline mt-4 text-[clamp(2rem,4vw,3.2rem)] text-[var(--foreground-strong)]">
          Everything a working photographer needs
        </h2>
        <p className="font-body mx-auto mt-4 max-w-xl text-[var(--muted)]">
          Secure storage, fast delivery, and a polished client experience — without the enterprise price tag.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {features.map((feature) => {
          const Icon = feature.icon;
          return (
            <div
              key={feature.title}
              className="subtle-card p-6 transition hover:border-[var(--line-strong)]"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--line)] bg-[var(--surface)]">
                <Icon className="h-4 w-4 text-[var(--muted-strong)]" />
              </div>
              <h3 className="headline mt-5 text-lg text-[var(--foreground-strong)]">
                {feature.title}
              </h3>
              <p className="font-body mt-3 text-sm leading-7 text-[var(--muted)]">
                {feature.description}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════
   Pricing
   ═══════════════════════════════════════════════ */

function PricingSection() {
  return (
    <section className="page-shell pt-4" id="pricing">
      <div className="text-center mb-12">
        <p className="kicker">Pricing</p>
        <h2 className="headline mt-4 text-[clamp(2rem,4vw,3.2rem)] text-[var(--foreground-strong)]">
          Transparent pricing, no surprises
        </h2>
        <p className="font-body mx-auto mt-4 max-w-xl text-[var(--muted)]">
          Start free with 3 GB. Upgrade when you need more. Additional storage at $5 per 100 GB/month.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {PLAN_ORDER.map((planId) => {
          const plan = PLANS[planId]!;
          return (
            <div
              key={planId}
              className={`relative flex flex-col rounded-[var(--radius-2xl)] border p-6 transition ${
                plan.popular
                  ? "border-[rgba(255,255,255,0.16)] bg-[rgba(255,255,255,0.04)] shadow-[0_0_60px_rgba(255,255,255,0.03)]"
                  : "border-[var(--line)] bg-[var(--surface)]"
              }`}
            >
              {plan.popular ? (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-white px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-black">
                  Most popular
                </div>
              ) : null}

              <div>
                <h3 className="font-ui text-sm font-medium text-[var(--foreground)]">
                  {plan.name}
                </h3>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="font-display text-4xl font-bold tracking-tight text-[var(--foreground-strong)]">
                    ${plan.price}
                  </span>
                  <span className="font-body text-sm text-[var(--muted)]">
                    /mo
                  </span>
                </div>
                <p className="font-body mt-3 text-xs text-[var(--muted)]">
                  {plan.bestFor}
                </p>
              </div>

              <div className="mt-6 space-y-3 flex-1">
                {plan.features.map((feature) => (
                  <div key={feature} className="flex items-start gap-2.5">
                    <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--success)]" />
                    <span className="font-body text-sm text-[var(--muted-strong)]">
                      {feature}
                    </span>
                  </div>
                ))}
              </div>

              <Link
                href="/signup"
                className={`mt-6 font-ui text-center text-sm font-semibold ${
                  plan.popular
                    ? "btn-primary px-5 py-3"
                    : "btn-secondary px-5 py-3"
                }`}
              >
                {plan.price === 0 ? "Start free" : `Start with ${plan.name}`}
              </Link>
            </div>
          );
        })}
      </div>

      <p className="font-body mt-8 text-center text-sm text-[var(--muted)]">
        Need more storage? Additional capacity at $5 per 100 GB/month. No hidden fees.
      </p>
    </section>
  );
}

/* ═══════════════════════════════════════════════
   Trust / Security
   ═══════════════════════════════════════════════ */

const trustItems = [
  {
    icon: Lock,
    title: "Private bucket storage",
    description: "Originals are stored in private cloud buckets with no public access. Nothing leaks.",
  },
  {
    icon: Shield,
    title: "Authenticated downloads",
    description: "Downloads stream through your app's server-side routes. Every request is verified.",
  },
  {
    icon: Cloud,
    title: "Global CDN delivery",
    description: "Thumbnails and previews served from edge locations worldwide for fast client access.",
  },
  {
    icon: Download,
    title: "Full-resolution originals",
    description: "Clients download exactly what you uploaded. No compression, no watermarks, no quality loss.",
  },
];

function TrustSection() {
  return (
    <section className="page-shell pt-4" id="trust">
      <div className="section-card p-8 lg:p-12">
        <div className="text-center mb-10">
          <p className="kicker">Security & trust</p>
          <h2 className="headline mt-4 text-[clamp(1.8rem,3.5vw,2.8rem)] text-[var(--foreground-strong)]">
            Your clients&apos; work is safe with us
          </h2>
          <p className="font-body mx-auto mt-4 max-w-lg text-[var(--muted)]">
            Security isn&apos;t hidden infrastructure — it&apos;s visible product value. Every download is authenticated, every original is private.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {trustItems.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-[var(--line)] bg-[var(--surface)]">
                  <Icon className="h-5 w-5 text-[var(--muted-strong)]" />
                </div>
                <h3 className="headline mt-4 text-base text-[var(--foreground)]">
                  {item.title}
                </h3>
                <p className="font-body mt-2 text-sm leading-6 text-[var(--muted)]">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════
   Testimonials (placeholder)
   ═══════════════════════════════════════════════ */

function TestimonialsSection() {
  const testimonials = [
    {
      quote: "Finally a gallery platform that doesn't cost more than my editing software. Clean, fast, and clients love it.",
      name: "Sarah Chen",
      role: "Wedding Photographer",
    },
    {
      quote: "The private delivery links give my commercial clients exactly the confidence they need. Professional workflow, fair price.",
      name: "Marcus Rivera",
      role: "Brand Photographer",
    },
    {
      quote: "I switched from Pixieset and saved $30/month. The galleries look better and my clients get their downloads faster.",
      name: "Emily Nakamura",
      role: "Portrait Photographer",
    },
  ];

  return (
    <section className="page-shell pt-4" id="testimonials">
      <div className="text-center mb-12">
        <p className="kicker">Photographers love Atelier</p>
        <h2 className="headline mt-4 text-[clamp(1.8rem,3.5vw,2.8rem)] text-[var(--foreground-strong)]">
          Trusted by photographers who care about delivery
        </h2>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {testimonials.map((t) => (
          <div
            key={t.name}
            className="subtle-card flex flex-col justify-between p-6"
          >
            <p className="font-body text-sm leading-7 text-[var(--muted-strong)]">
              &ldquo;{t.quote}&rdquo;
            </p>
            <div className="mt-6 border-t border-[var(--line)] pt-4">
              <p className="font-ui text-sm font-medium text-[var(--foreground)]">
                {t.name}
              </p>
              <p className="font-body mt-0.5 text-xs text-[var(--muted)]">
                {t.role}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════
   FAQ
   ═══════════════════════════════════════════════ */

const faqs = [
  {
    q: "How does the free plan work?",
    a: "You get 3 GB of secure cloud storage with up to 3 active galleries. No credit card needed. Upgrade anytime when you need more.",
  },
  {
    q: "Are my clients' files safe?",
    a: "Yes. Originals are stored in private cloud buckets with no public access. Downloads are streamed through authenticated server routes. No files are ever exposed publicly.",
  },
  {
    q: "Can clients download full-resolution originals?",
    a: "Yes. When clients click download, they receive exactly what you uploaded — no compression, no watermarks, no quality loss.",
  },
  {
    q: "How do uploads work?",
    a: "Files go directly from the browser to private cloud storage using signed upload URLs. Your server never touches the file data, so uploads are fast and efficient.",
  },
  {
    q: "Can I upgrade or downgrade anytime?",
    a: "Absolutely. Change your plan at any time from your billing settings. Upgrades take effect immediately. Downgrades apply at the end of the billing period.",
  },
  {
    q: "What happens if I exceed my storage limit?",
    a: "We'll notify you before you hit your limit. Additional storage is available at $5 per 100 GB/month. No surprise charges — you control when to upgrade.",
  },
];

function FAQItem({ question, answer }: { question: string; answer: string }) {
  return (
    <details className="group subtle-card overflow-hidden" id={`faq-${question.slice(0, 20).replace(/\s+/g, "-").toLowerCase()}`}>
      <summary className="flex cursor-pointer items-center justify-between gap-4 p-5 text-left font-ui text-sm font-medium text-[var(--foreground)] [&::-webkit-details-marker]:hidden">
        {question}
        <Plus className="h-4 w-4 shrink-0 text-[var(--muted)] transition group-open:hidden" />
        <Minus className="hidden h-4 w-4 shrink-0 text-[var(--muted)] transition group-open:block" />
      </summary>
      <div className="px-5 pb-5">
        <p className="font-body text-sm leading-7 text-[var(--muted)]">
          {answer}
        </p>
      </div>
    </details>
  );
}

function FAQSection() {
  return (
    <section className="page-shell pt-4" id="faq">
      <div className="text-center mb-12">
        <p className="kicker">FAQ</p>
        <h2 className="headline mt-4 text-[clamp(1.8rem,3.5vw,2.8rem)] text-[var(--foreground-strong)]">
          Common questions
        </h2>
      </div>

      <div className="mx-auto max-w-2xl space-y-3">
        {faqs.map((faq) => (
          <FAQItem key={faq.q} question={faq.q} answer={faq.a} />
        ))}
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════
   CTA
   ═══════════════════════════════════════════════ */

function CTASection() {
  return (
    <section className="page-shell pt-4 pb-8">
      <div className="section-card flex flex-col items-center gap-6 px-8 py-16 text-center lg:px-16">
        <h2 className="headline max-w-2xl text-[clamp(2rem,4vw,3rem)] text-[var(--foreground-strong)]">
          Ready to deliver galleries that feel premium?
        </h2>
        <p className="font-body max-w-lg text-[var(--muted)]">
          Start with the free plan today. No credit card required.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/signup"
            className="btn-primary inline-flex items-center gap-2 px-7 py-3.5 text-[15px] font-semibold"
          >
            Create free account
            <ArrowRight className="h-4 w-4" />
          </Link>
          <a
            href="#pricing"
            className="btn-secondary inline-flex items-center gap-2 px-7 py-3.5 text-[15px]"
          >
            View pricing
          </a>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════
   Footer
   ═══════════════════════════════════════════════ */

function Footer() {
  return (
    <footer className="border-t border-[var(--line)] bg-[var(--background)]">
      <div className="page-shell py-12">
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <Link
              href="/"
              className="font-display text-lg font-semibold tracking-tight text-[var(--foreground-strong)]"
            >
              Atelier
            </Link>
            <p className="font-body mt-3 text-sm leading-6 text-[var(--muted)]">
              Premium client galleries for photographers. Secure delivery, fair pricing, beautiful experience.
            </p>
          </div>

          <div>
            <p className="font-ui text-xs font-medium uppercase tracking-[0.2em] text-[var(--muted)]">
              Product
            </p>
            <div className="mt-4 flex flex-col gap-3">
              {[
                { label: "Features", href: "#features" },
                { label: "Pricing", href: "#pricing" },
                { label: "FAQ", href: "#faq" },
              ].map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="font-body text-sm text-[var(--muted-strong)] transition hover:text-[var(--foreground)]"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>

          <div>
            <p className="font-ui text-xs font-medium uppercase tracking-[0.2em] text-[var(--muted)]">
              Account
            </p>
            <div className="mt-4 flex flex-col gap-3">
              {[
                { label: "Sign up", href: "/signup" },
                { label: "Log in", href: "/login" },
                { label: "Dashboard", href: "/admin" },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="font-body text-sm text-[var(--muted-strong)] transition hover:text-[var(--foreground)]"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <p className="font-ui text-xs font-medium uppercase tracking-[0.2em] text-[var(--muted)]">
              Legal
            </p>
            <div className="mt-4 flex flex-col gap-3">
              {[
                { label: "Terms", href: "#" },
                { label: "Privacy", href: "#" },
                { label: "Security", href: "#trust" },
              ].map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="font-body text-sm text-[var(--muted-strong)] transition hover:text-[var(--foreground)]"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-[var(--line)] pt-6 text-center">
          <p className="font-body text-xs text-[var(--muted)]">
            © {new Date().getFullYear()} Atelier. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

/* ═══════════════════════════════════════════════
   Composed Landing Page
   ═══════════════════════════════════════════════ */

export default function HomePage() {
  return (
    <main className="bg-[var(--background)]">
      <LandingNav />
      <HeroSection />
      <HowItWorksSection />
      <FeaturesSection />
      <PricingSection />
      <TestimonialsSection />
      <TrustSection />
      <FAQSection />
      <CTASection />
      <Footer />
    </main>
  );
}
