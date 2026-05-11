import {
  ContactSection,
  FaqSection,
  HeroSection,
  HowItWorksSection,
  MarketingShell,
  PricingSection,
  SecureDeliverySection,
  TestimonialsSection,
  TrustSection,
  WorkflowSection,
} from "@/components/marketing/site";

export default function Home() {
  return (
    <MarketingShell currentPath="/">
      <HeroSection />
      <HowItWorksSection />
      <SecureDeliverySection />
      <WorkflowSection />
      <PricingSection />
      <TestimonialsSection />
      <TrustSection />
      <FaqSection />
      <ContactSection />
    </MarketingShell>
  );
}
