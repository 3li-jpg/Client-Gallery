import Link from "next/link";
import {
  ArrowRight,
  ChevronDown,
  KeyRound,
  LayoutDashboard,
  MonitorSmartphone,
  ShieldCheck,
  Star,
} from "lucide-react";

import { VideoBackground } from "@/components/marketing/video-background";

function HeroBadge() {
  return (
    <div className="font-ui inline-flex items-center rounded-full bg-white px-2 py-2 shadow-[0_12px_25px_rgba(0,0,0,0.08)]">
      <span className="inline-flex items-center gap-1 rounded-full bg-[#0e1311] px-3 py-1 text-[14px] text-white">
        <Star className="h-3.5 w-3.5 fill-current" />
        New
      </span>
      <span className="px-3 text-[14px] text-black">Built for polished client reveals</span>
    </div>
  );
}

const platformCards = [
  {
    title: "Studio control panel",
    description:
      "Create private galleries, issue access codes, and keep delivery organized without piecing together multiple tools.",
    icon: LayoutDashboard,
  },
  {
    title: "Client-first reveal",
    description:
      "Present final images in a polished gallery experience that feels like your brand, not a generic file dump.",
    icon: MonitorSmartphone,
  },
  {
    title: "Protected full-resolution files",
    description:
      "Serve previews fast, keep originals private, and let downloads happen only behind authenticated access.",
    icon: ShieldCheck,
  },
];

const workflowSteps = [
  {
    title: "Create the gallery",
    description: "Name the shoot, add the client, and generate a private link with its own access code.",
  },
  {
    title: "Upload the finals",
    description: "Send originals straight to private storage while lightweight previews are prepared automatically.",
  },
  {
    title: "Deliver with confidence",
    description: "Clients unlock the gallery, browse fast previews, and download approved files at full quality.",
  },
];

export function LandingHero() {
  const navItems = [
    { label: "Platform", href: "#platform" },
    { label: "Features", href: "#features", dropdown: true },
    { label: "Workflow", href: "#workflow" },
    { label: "Community", href: "#community" },
    { label: "Contact", href: "#contact" },
  ];

  return (
    <main className="relative overflow-hidden bg-[#f8f8f4]">
      <section className="relative min-h-screen overflow-hidden">
        <VideoBackground />

        <div className="relative z-10 min-h-screen px-6 py-4 md:px-10 xl:px-[120px]">
          <nav className="flex items-center justify-between gap-8 py-4">
            <Link href="/" className="font-sans text-[24px] font-semibold tracking-[-1.44px] text-black">
              Atelier
            </Link>

            <div className="font-sans hidden items-center gap-8 text-[16px] font-medium tracking-[-0.2px] text-black lg:flex">
              {navItems.map((item) => (
                <a key={item.label} href={item.href} className="inline-flex items-center gap-1.5">
                  {item.label}
                  {item.dropdown ? <ChevronDown className="h-4 w-4" /> : null}
                </a>
              ))}
            </div>

            <div className="font-sans flex items-center gap-2">
              <Link
                href="/photographers/create-account"
                className="btn-ghost px-4 text-[16px] font-medium tracking-[-0.2px] text-black"
              >
                Sign Up
              </Link>
              <Link
                href="/admin/login"
                className="btn-primary px-5 text-[16px] font-medium tracking-[-0.2px] text-white"
              >
                Log In
              </Link>
            </div>
          </nav>

          <section className="-mt-[50px] flex min-h-[calc(100vh-124px)] flex-col items-center justify-center pt-[60px] pb-16 text-center">
            <div className="flex flex-col items-center gap-[34px]">
              <HeroBadge />

              <div className="flex flex-col items-center gap-[34px]">
                <h1 className="font-display max-w-[1000px] text-center text-[54px] font-bold leading-none tracking-[-3.2px] text-black sm:text-[68px] lg:text-[80px] lg:tracking-[-4.8px]">
                  Deliver client galleries that feel editorial.
                </h1>

                <p className="font-display w-full max-w-[736px] px-4 text-center text-[18px] font-medium tracking-[-0.36px] text-[#505050] sm:text-[20px] sm:tracking-[-0.4px] lg:w-[620px]">
                  Build a premium handoff flow for portrait, wedding, and brand
                  work with private originals, curated previews, and polished
                  client access from one control room.
                </p>
              </div>
            </div>
          </section>
        </div>
      </section>

      <section id="platform" className="page-shell pt-8">
        <div className="section-card grid gap-6 px-6 py-8 lg:grid-cols-3 lg:px-8">
          {platformCards.map((card) => {
            const Icon = card.icon;

            return (
              <article key={card.title} className="rounded-[1.5rem] border border-[rgba(0,0,0,0.08)] bg-white/54 p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-black text-white">
                  <Icon className="h-5 w-5" />
                </div>
                <h2 className="font-display mt-6 text-[30px] leading-none tracking-[-0.04em] text-black">
                  {card.title}
                </h2>
                <p className="font-body mt-4 text-[16px] leading-7 text-[#505050]">
                  {card.description}
                </p>
              </article>
            );
          })}
        </div>
      </section>

      <section id="features" className="page-shell pt-2">
        <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="section-card px-6 py-8 lg:px-8">
            <p className="kicker">Designed for working studios</p>
            <h2 className="font-display mt-4 max-w-2xl text-[42px] leading-[0.98] tracking-[-0.05em] text-black lg:text-[56px]">
              One delivery system for uploads, branding, access, and approvals.
            </h2>
            <p className="font-body mt-5 max-w-2xl text-[17px] leading-8 text-[#505050]">
              Instead of juggling transfer tools, password emails, and ad hoc
              download folders, Atelier keeps the entire handoff in one elegant
              experience for both photographers and clients.
            </p>
            <div className="mt-10 grid gap-5 md:grid-cols-3">
              {workflowSteps.map((step, index) => (
                <div key={step.title} className="rounded-[1.4rem] border border-[rgba(0,0,0,0.08)] bg-white/52 p-5">
                  <span className="font-ui text-[12px] font-semibold uppercase tracking-[0.24em] text-[#505050]">
                    0{index + 1}
                  </span>
                  <h3 className="font-display mt-4 text-[24px] tracking-[-0.04em] text-black">
                    {step.title}
                  </h3>
                  <p className="font-body mt-3 text-[15px] leading-7 text-[#505050]">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="section-card flex flex-col justify-between px-6 py-8 lg:px-8">
            <div>
              <p className="kicker">What clients notice</p>
              <h2 className="font-display mt-4 text-[38px] leading-[0.98] tracking-[-0.05em] text-black lg:text-[48px]">
                Fast previews, protected downloads, and a calmer review flow.
              </h2>
            </div>

            <div className="mt-8 space-y-4">
              {[
                "Gallery pages tuned for desktop and mobile",
                "Signed delivery routes for original downloads",
                "A lighter preview experience with bigger-image loading only when it matters",
              ].map((item) => (
                <div key={item} className="flex items-start gap-3 rounded-[1.25rem] border border-[rgba(0,0,0,0.08)] bg-white/52 p-4">
                  <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-full bg-black text-white">
                    <KeyRound className="h-4 w-4" />
                  </div>
                  <p className="font-body text-[15px] leading-7 text-[#505050]">{item}</p>
                </div>
              ))}
            </div>

            <div className="mt-10">
              <Link
                href="/photographers/create-account"
                className="font-sans inline-flex items-center gap-2 rounded-full bg-black px-5 py-3 text-[15px] font-semibold text-white"
              >
                Start setting up your studio
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section id="workflow" className="page-shell pt-2">
        <div className="section-card flex flex-col gap-8 px-6 py-8 lg:px-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="kicker">Reference flow</p>
              <h2 className="font-display mt-4 text-[40px] leading-[0.98] tracking-[-0.05em] text-black lg:text-[56px]">
                Built around the way photographers actually deliver.
              </h2>
            </div>
            <p className="font-body max-w-xl text-[16px] leading-7 text-[#505050]">
              The product is simple on purpose: create the gallery, upload the
              work, share the link, and let clients browse a refined preview
              while originals stay private.
            </p>
          </div>

          <div className="grid gap-5 lg:grid-cols-4">
            {[
              {
                title: "Create account",
                body: "Set up the studio workspace and keep the photographer-facing controls in one private admin area.",
              },
              {
                title: "Create gallery",
                body: "Add the client, give the delivery a meaningful slug, and generate its access code instantly.",
              },
              {
                title: "Upload finals",
                body: "Push files directly to storage while lightweight previews and viewer assets are prepared in the background.",
              },
              {
                title: "Share reveal",
                body: "Clients unlock a branded gallery, review quickly, and download the originals you’ve approved.",
              },
            ].map((step) => (
              <div key={step.title} className="rounded-[1.5rem] border border-[rgba(0,0,0,0.08)] bg-white/56 p-5">
                <h3 className="font-display text-[26px] tracking-[-0.04em] text-black">{step.title}</h3>
                <p className="font-body mt-3 text-[15px] leading-7 text-[#505050]">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="community" className="page-shell pt-2">
        <div className="section-card flex flex-col gap-8 px-6 py-8 lg:flex-row lg:items-end lg:justify-between lg:px-8">
          <div className="max-w-2xl">
            <p className="kicker">Ready to make delivery feel premium?</p>
            <h2 className="font-display mt-4 text-[40px] leading-[0.98] tracking-[-0.05em] text-black lg:text-[58px]">
              Use the marketing language up front, then back it with a gallery flow that actually feels finished.
            </h2>
            <p className="font-body mt-5 text-[16px] leading-8 text-[#505050]">
              Atelier is built for photographers who care about the handoff as
              much as the shoot itself. The same visual system carries from the
              landing page into the admin and the client gallery.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/photographers/create-account"
              className="font-sans inline-flex items-center justify-center rounded-full bg-black px-6 py-3 text-[15px] font-semibold text-white"
            >
              Create photographer account
            </Link>
            <Link
              href="/admin/login"
              className="font-sans inline-flex items-center justify-center rounded-full border border-[rgba(0,0,0,0.12)] bg-white/76 px-6 py-3 text-[15px] font-semibold text-black"
            >
              Open admin
            </Link>
          </div>
        </div>
      </section>

      <section id="contact" className="page-shell pb-12 pt-2">
        <div className="section-card flex flex-col gap-6 px-6 py-8 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div className="max-w-2xl">
            <p className="kicker">Contact</p>
            <h2 className="font-display mt-4 text-[36px] leading-[0.98] tracking-[-0.05em] text-black lg:text-[48px]">
              Need a branded gallery workflow for your studio?
            </h2>
            <p className="font-body mt-4 text-[16px] leading-8 text-[#505050]">
              Start with a photographer account, shape the delivery experience
              inside the studio admin, and send clients into a calmer review
              flow with fast previews and private originals.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/photographers/create-account"
              className="font-sans inline-flex items-center justify-center rounded-full bg-black px-6 py-3 text-[15px] font-semibold text-white"
            >
              Create account
            </Link>
            <Link
              href="/admin/login"
              className="font-sans inline-flex items-center justify-center rounded-full border border-[rgba(0,0,0,0.12)] bg-white/76 px-6 py-3 text-[15px] font-semibold text-black"
            >
              Open admin
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
