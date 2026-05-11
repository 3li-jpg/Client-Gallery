"use client";

import dynamic from "next/dynamic";
import {
  type FormEvent,
  type KeyboardEvent,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Aperture,
  ArrowRight,
  Check,
  ChevronLeft,
  ImagePlus,
  Menu,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";
import Link from "next/link";

import { cn } from "@/lib/utils";

interface SignInPageProps {
  className?: string;
}

const CanvasRevealEffect = dynamic(
  () =>
    import("@/components/ui/sign-in-canvas-effect").then((module) => module.CanvasRevealEffect),
  {
    ssr: false,
    loading: () => <div className="h-full w-full bg-[rgba(248,248,244,0.92)]" />,
  },
);

const AnimatedNavLink = ({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) => {
  return (
    <a
      href={href}
      className="group font-ui relative inline-flex h-5 items-center overflow-hidden text-sm text-[var(--muted)]"
    >
      <div className="flex flex-col transition-transform duration-300 ease-out group-hover:-translate-y-1/2">
        <span>{children}</span>
        <span className="text-[var(--foreground)]">{children}</span>
      </div>
    </a>
  );
};

function MiniNavbar() {
  const [isOpen, setIsOpen] = useState(false);
  const headerShapeClass = isOpen ? "rounded-2xl" : "rounded-full";

  const navLinksData = [
    { label: "Pricing", href: "#pricing" },
    { label: "Portfolio Delivery", href: "#delivery" },
    { label: "FAQ", href: "#faq" },
  ];

  return (
    <header
      className={cn(
        "fixed left-1/2 top-6 z-20 flex w-[calc(100%-2rem)] max-w-5xl -translate-x-1/2 flex-col border border-[var(--line)] bg-[rgba(255,255,255,0.74)] px-5 py-3 backdrop-blur-md transition-[border-radius] duration-150 ease-out sm:w-auto sm:min-w-[780px]",
        headerShapeClass,
      )}
    >
      <div className="flex items-center justify-between gap-x-6 sm:gap-x-8">
        <div className="flex items-center gap-3 text-sm text-[var(--foreground)]">
          <div className="rounded-full border border-[var(--line)] bg-white/72 p-2">
            <Aperture className="h-4 w-4" />
          </div>
          <span className="font-ui hidden font-medium tracking-[0.18em] text-[var(--foreground)] sm:inline">
            ATELIER FOR PHOTOGRAPHERS
          </span>
        </div>

        <nav className="hidden items-center space-x-5 sm:flex">
          {navLinksData.map((link) => (
            <AnimatedNavLink key={link.href} href={link.href}>
              {link.label}
            </AnimatedNavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-3 sm:flex">
          <Link
            href="/admin/login"
            className="btn-secondary font-ui px-4 py-2 text-sm"
          >
            Admin login
          </Link>
          <Link
            href="/photographers/create-account"
            className="btn-primary font-ui px-4 py-2 text-sm font-semibold"
          >
            Create account
          </Link>
        </div>

        <button
          type="button"
          className="flex h-8 w-8 items-center justify-center text-[var(--muted)] sm:hidden"
          onClick={() => setIsOpen((current) => !current)}
          aria-label={isOpen ? "Close menu" : "Open menu"}
        >
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      <div
        className={cn(
          "overflow-hidden transition-all duration-300 ease-in-out sm:hidden",
          isOpen ? "max-h-[360px] pt-4 opacity-100" : "max-h-0 pt-0 opacity-0 pointer-events-none",
        )}
      >
        <nav className="flex flex-col items-center gap-4 text-base">
          {navLinksData.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="font-ui w-full text-center text-[var(--muted)] transition-colors hover:text-[var(--foreground)]"
            >
              {link.label}
            </a>
          ))}
        </nav>
        <div className="mt-4 flex flex-col gap-3">
          <Link
            href="/admin/login"
            className="btn-secondary font-ui px-4 py-3 text-center text-sm"
          >
            Admin login
          </Link>
          <Link
            href="/photographers/create-account"
            className="btn-primary font-ui px-4 py-3 text-center text-sm font-semibold"
          >
            Create account
          </Link>
        </div>
      </div>
    </header>
  );
}

const benefitCards = [
  {
    icon: ImagePlus,
    title: "Direct RAW delivery",
    description: "Upload finals once and push polished client galleries without juggling Dropbox folders.",
  },
  {
    icon: ShieldCheck,
    title: "Private originals",
    description: "Keep full-resolution files private until clients authenticate and download exactly what you approve.",
  },
  {
    icon: Sparkles,
    title: "Editorial presentation",
    description: "Present wedding, brand, and portrait work in a refined reveal flow that feels premium on mobile too.",
  },
];

export const SignInPage = ({ className }: SignInPageProps) => {
  const [studioName, setStudioName] = useState("");
  const [email, setEmail] = useState("");
  const [step, setStep] = useState<"email" | "code" | "success">("email");
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const codeInputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const [initialCanvasVisible, setInitialCanvasVisible] = useState(true);
  const [reverseCanvasVisible, setReverseCanvasVisible] = useState(false);

  const handleEmailSubmit = (event: FormEvent) => {
    event.preventDefault();

    if (!studioName || !email) {
      return;
    }

    setStep("code");
  };

  useEffect(() => {
    if (step !== "code") {
      return;
    }

    const timer = setTimeout(() => {
      codeInputRefs.current[0]?.focus();
    }, 450);

    return () => clearTimeout(timer);
  }, [step]);

  const handleCodeChange = (index: number, value: string) => {
    if (value.length > 1) {
      return;
    }

    const nextCode = [...code];
    nextCode[index] = value.replace(/\D/g, "");
    setCode(nextCode);

    if (nextCode[index] && index < 5) {
      codeInputRefs.current[index + 1]?.focus();
    }

    if (index === 5 && nextCode[index] && nextCode.every((digit) => digit.length === 1)) {
      setReverseCanvasVisible(true);

      window.setTimeout(() => {
        setInitialCanvasVisible(false);
      }, 50);

      window.setTimeout(() => {
        setStep("success");
      }, 2000);
    }
  };

  const handleKeyDown = (index: number, event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Backspace" && !code[index] && index > 0) {
      codeInputRefs.current[index - 1]?.focus();
    }
  };

  const handleBackClick = () => {
    setStep("email");
    setCode(["", "", "", "", "", ""]);
    setReverseCanvasVisible(false);
    setInitialCanvasVisible(true);
  };

  return (
    <div className={cn("page-backdrop relative flex min-h-screen w-full flex-col", className)}>
      <div className="absolute inset-0 z-0">
        {initialCanvasVisible ? (
          <div className="absolute inset-0">
            <CanvasRevealEffect
              animationSpeed={2.8}
              containerClassName="bg-[rgba(248,248,244,0.92)]"
              colors={[[255, 255, 255], [255, 255, 255]]}
              dotSize={6}
              reverse={false}
            />
          </div>
        ) : null}

        {reverseCanvasVisible ? (
          <div className="absolute inset-0">
            <CanvasRevealEffect
              animationSpeed={4}
              containerClassName="bg-[rgba(248,248,244,0.92)]"
              colors={[[255, 255, 255], [255, 255, 255]]}
              dotSize={6}
              reverse
            />
          </div>
        ) : null}

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.42)_0%,_rgba(248,248,244,0.92)_52%,_rgba(248,248,244,1)_100%)]" />
        <div className="absolute left-[10%] top-[16%] h-44 w-44 rounded-full bg-[rgba(255,255,255,0.44)] blur-3xl" />
        <div className="absolute bottom-[12%] right-[12%] h-56 w-56 rounded-full bg-[rgba(0,0,0,0.04)] blur-3xl" />
      </div>

      <div className="relative z-10 flex min-h-screen flex-col">
        <MiniNavbar />

        <div className="flex flex-1 flex-col lg:flex-row">
          <div className="flex flex-1 items-center justify-center px-6 pb-12 pt-32 sm:px-10 lg:pb-16 lg:pt-28">
            <div className="w-full max-w-md">
              <AnimatePresence mode="wait">
                {step === "email" ? (
                  <motion.div
                    key="email-step"
                    initial={{ opacity: 0, x: -80 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -80 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className="space-y-6"
                  >
                    <div className="space-y-2 text-center lg:text-left">
                      <p className="font-ui text-xs uppercase tracking-[0.32em] text-[var(--muted)]">
                        Photographer account setup
                      </p>
                      <h1 className="font-display text-[2.45rem] font-semibold leading-[1.02] tracking-tight text-[var(--foreground)] sm:text-[3rem]">
                        Build your studio portal in minutes.
                      </h1>
                      <p className="font-body text-base text-[var(--muted)]">
                        Create an account, verify your email, and start delivering curated client galleries with private originals.
                      </p>
                    </div>

                    <div className="space-y-4">
                      <button className="btn-secondary font-ui flex w-full items-center justify-center gap-2 px-4 py-3 text-[var(--foreground)]">
                        <Aperture className="h-4 w-4" />
                        <span>Continue with your studio identity</span>
                      </button>

                      <div className="flex items-center gap-4">
                        <div className="h-px flex-1 bg-[var(--line)]" />
                        <span className="font-body text-sm text-[var(--muted)]">or</span>
                        <div className="h-px flex-1 bg-[var(--line)]" />
                      </div>

                      <form className="space-y-3" onSubmit={handleEmailSubmit}>
                        <label htmlFor="photographer-studio-name" className="sr-only">
                          Studio name
                        </label>
                        <input
                          id="photographer-studio-name"
                          name="studioName"
                          type="text"
                          placeholder="Studio name"
                          value={studioName}
                          onChange={(event) => setStudioName(event.target.value)}
                          className="field rounded-full text-center"
                          autoComplete="organization"
                          spellCheck={false}
                          required
                        />
                        <label htmlFor="photographer-email" className="sr-only">
                          Studio email address
                        </label>
                        <div className="relative">
                          <input
                            id="photographer-email"
                            name="email"
                            type="email"
                            placeholder="studio@example.com"
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            className="field rounded-full pr-14 text-center"
                            autoComplete="email"
                            spellCheck={false}
                            required
                          />
                          <button
                            type="submit"
                            className="absolute right-1.5 top-1.5 flex h-10 w-10 items-center justify-center rounded-full bg-black text-white transition hover:opacity-92"
                            aria-label="Continue to verification"
                          >
                            <ArrowRight className="h-4 w-4" />
                          </button>
                        </div>
                      </form>
                    </div>

                    <p className="font-body pt-6 text-xs leading-6 text-[var(--muted)]">
                      By creating an account you agree to the{" "}
                      <Link href="#" className="underline hover:text-[var(--foreground)]">
                        Terms
                      </Link>
                      ,{" "}
                      <Link href="#" className="underline hover:text-[var(--foreground)]">
                        Privacy Policy
                      </Link>
                      , and{" "}
                      <Link href="#" className="underline hover:text-[var(--foreground)]">
                        Delivery Policies
                      </Link>
                      .
                    </p>
                  </motion.div>
                ) : null}

                {step === "code" ? (
                  <motion.div
                    key="code-step"
                    initial={{ opacity: 0, x: 80 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 80 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className="space-y-6"
                  >
                    <div className="space-y-2 text-center lg:text-left">
                      <p className="font-ui text-xs uppercase tracking-[0.32em] text-[var(--muted)]">
                        Verify studio email
                      </p>
                      <h2 className="font-display text-[2.3rem] font-semibold leading-[1.04] tracking-tight text-[var(--foreground)]">
                        We sent a six-digit code.
                      </h2>
                      <p className="font-body text-base text-[var(--muted)]">
                        Use the code sent to {email} to finish your photographer account setup.
                      </p>
                    </div>

                    <fieldset className="rounded-[2rem] border border-[var(--line)] bg-white/72 px-5 py-4">
                      <legend className="sr-only">Verification code</legend>
                      <div className="flex items-center justify-center">
                        {code.map((digit, index) => (
                          <div key={index} className="flex items-center">
                            <div className="relative">
                              <input
                                ref={(element) => {
                                  codeInputRefs.current[index] = element;
                                }}
                                aria-label={`Verification code digit ${index + 1}`}
                                name={`verification-digit-${index + 1}`}
                                type="text"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                maxLength={1}
                                value={digit}
                                onChange={(event) => handleCodeChange(index, event.target.value)}
                                onKeyDown={(event) => handleKeyDown(index, event)}
                                autoComplete={index === 0 ? "one-time-code" : "off"}
                                spellCheck={false}
                                className="w-8 rounded-md bg-transparent text-center text-2xl text-[var(--foreground)] outline-none focus-visible:ring-2 focus-visible:ring-black/15"
                                style={{ caretColor: "transparent" }}
                              />
                              {!digit ? (
                                <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-2xl text-black/22">
                                  0
                                </div>
                              ) : null}
                            </div>
                            {index < 5 ? <span className="px-1 text-xl text-black/20">|</span> : null}
                          </div>
                        ))}
                      </div>
                    </fieldset>

                    <div className="font-body flex items-center justify-between text-sm text-[var(--muted)]">
                      <button type="button" className="transition hover:text-[var(--foreground)]">
                        Resend code
                      </button>
                      <button type="button" className="transition hover:text-[var(--foreground)]">
                        Use a different email
                      </button>
                    </div>

                    <div className="flex gap-3">
                      <motion.button
                        type="button"
                        onClick={handleBackClick}
                        className="btn-secondary font-ui flex w-[34%] items-center justify-center gap-2 px-5 py-3 font-medium"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Back
                      </motion.button>
                      <motion.button
                        type="button"
                        className={cn(
                          "flex-1 rounded-full border py-3 font-medium transition-all duration-300",
                          code.every((digit) => digit !== "")
                            ? "border-transparent bg-black text-white hover:opacity-92"
                            : "cursor-not-allowed border-[var(--line)] bg-white/54 text-[var(--muted)]",
                        )}
                        disabled={!code.every((digit) => digit !== "")}
                      >
                        Complete account
                      </motion.button>
                    </div>
                  </motion.div>
                ) : null}

                {step === "success" ? (
                  <motion.div
                    key="success-step"
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45, ease: "easeOut", delay: 0.3 }}
                    className="space-y-6"
                  >
                    <div className="space-y-2 text-center lg:text-left">
                      <p className="font-ui text-xs uppercase tracking-[0.32em] text-[var(--muted)]">
                        Account ready
                      </p>
                      <h2 className="font-display text-[2.45rem] font-semibold leading-[1.04] tracking-tight text-[var(--foreground)]">
                        {studioName || "Your studio"} is ready to onboard clients.
                      </h2>
                      <p className="font-body text-base text-[var(--muted)]">
                        Your photographer account is active. Next up: create your first gallery and send a private reveal link.
                      </p>
                    </div>

                    <motion.div
                      initial={{ scale: 0.82, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.45, delay: 0.5 }}
                      className="py-8"
                    >
                      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-black to-[rgba(0,0,0,0.72)] lg:mx-0">
                        <Check className="h-8 w-8 text-white" />
                      </div>
                    </motion.div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <Link
                        href="/admin"
                        className="btn-primary font-ui px-5 py-3 text-center font-medium"
                      >
                        Open studio dashboard
                      </Link>
                      <Link
                        href="/admin/login"
                        className="btn-secondary font-ui px-5 py-3 text-center font-medium"
                      >
                        Go to admin login
                      </Link>
                    </div>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>
          </div>

          <aside className="relative flex flex-1 items-center px-6 pb-12 sm:px-10 lg:pb-16 lg:pr-12">
            <div className="mx-auto w-full max-w-xl space-y-6">
              <div className="glass-panel rounded-[2rem] p-6">
                <p className="font-ui text-xs uppercase tracking-[0.28em] text-[var(--muted)]">
                  Built for working photographers
                </p>
                <h3 className="font-display mt-3 text-3xl font-semibold tracking-tight text-[var(--foreground)]">
                  From inquiry to final delivery, keep the experience premium.
                </h3>
                <p className="font-body mt-3 text-sm leading-7 text-[var(--muted)]">
                  Give portrait, wedding, and brand clients a cleaner reveal than generic file folders, while keeping your originals private and organized.
                </p>
              </div>

              <div className="grid gap-4">
                {benefitCards.map((card, index) => {
                  const Icon = card.icon;

                  return (
                    <motion.div
                      key={card.title}
                      initial={{ opacity: 0, y: 24 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 + index * 0.1, duration: 0.35 }}
                      className="rounded-[1.75rem] border border-[var(--line)] bg-white/72 p-5 shadow-[0_18px_40px_rgba(0,0,0,0.06)]"
                    >
                      <div className="flex items-start gap-4">
                        <div className="rounded-2xl border border-[var(--line)] bg-white/84 p-3">
                          <Icon className="h-5 w-5 text-[var(--foreground)]" />
                        </div>
                        <div>
                          <h4 className="font-display text-lg font-medium text-[var(--foreground)]">{card.title}</h4>
                          <p className="font-body mt-2 text-sm leading-6 text-[var(--muted)]">
                            {card.description}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};
