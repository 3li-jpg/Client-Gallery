export interface PlanDefinition {
  id: string;
  name: string;
  price: number;
  interval: "month";
  storageLimitBytes: number;
  storageLimitLabel: string;
  galleryLimit: number | null;
  features: string[];
  bestFor: string;
  popular?: boolean;
  stripePriceId?: string;
}

const GB = 1024 * 1024 * 1024;
const TB = 1024 * GB;

export const PLANS: Record<string, PlanDefinition> = {
  free: {
    id: "free",
    name: "Free",
    price: 0,
    interval: "month",
    storageLimitBytes: 3 * GB,
    storageLimitLabel: "3 GB",
    galleryLimit: 3,
    bestFor: "New photographers testing the platform",
    features: [
      "3 GB secure cloud storage",
      "Up to 3 active galleries",
      "Private access-code delivery",
      "Full-resolution downloads",
      "Mobile-friendly gallery experience",
      "Secure original file protection",
    ],
  },
  starter: {
    id: "starter",
    name: "Starter",
    price: 8,
    interval: "month",
    storageLimitBytes: 100 * GB,
    storageLimitLabel: "100 GB",
    galleryLimit: null,
    bestFor: "Portrait & family photographers",
    stripePriceId: process.env.STRIPE_STARTER_PRICE_ID,
    features: [
      "100 GB secure cloud storage",
      "Unlimited client galleries",
      "Private access-code delivery",
      "Full-resolution downloads",
      "Photographer admin dashboard",
      "Direct browser uploads",
      "Secure original file protection",
    ],
  },
  pro: {
    id: "pro",
    name: "Pro",
    price: 15,
    interval: "month",
    storageLimitBytes: 300 * GB,
    storageLimitLabel: "300 GB",
    galleryLimit: null,
    bestFor: "Wedding & event photographers",
    popular: true,
    stripePriceId: process.env.STRIPE_PRO_PRICE_ID,
    features: [
      "300 GB secure cloud storage",
      "Everything in Starter",
      "Gallery workflow management",
      "Faster delivery workflow",
      "Priority support",
    ],
  },
  studio: {
    id: "studio",
    name: "Studio",
    price: 24,
    interval: "month",
    storageLimitBytes: 1 * TB,
    storageLimitLabel: "1 TB",
    galleryLimit: null,
    bestFor: "Studios & high-volume photographers",
    stripePriceId: process.env.STRIPE_STUDIO_PRICE_ID,
    features: [
      "1 TB secure cloud storage",
      "Everything in Pro",
      "Advanced delivery workflow",
      "Multi-user support (coming soon)",
      "Studio-scale management",
    ],
  },
};

export const OVERAGE_PRICE_PER_100GB = 5;
export const OVERAGE_BLOCK_BYTES = 100 * GB;

export const PLAN_ORDER = ["free", "starter", "pro", "studio"] as const;

export function getPlan(planId: string): PlanDefinition {
  return PLANS[planId] ?? PLANS.free!;
}

export function getStoragePercentage(usedBytes: number, planId: string): number {
  const plan = getPlan(planId);
  return Math.min(100, Math.round((usedBytes / plan.storageLimitBytes) * 100));
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  let value = bytes;
  let index = 0;
  while (value >= 1024 && index < units.length - 1) {
    value /= 1024;
    index++;
  }
  return `${value.toFixed(index === 0 ? 0 : 1)} ${units[index]}`;
}
