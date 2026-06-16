import Stripe from "stripe";
import { prisma } from "./db";
import {
  PAYMENT_PROCESSOR_CATALOG,
  type PaymentProvider,
  type ProcessorPublicView,
  type StripePlanId
} from "./paymentProcessorShared";

export type { PaymentProvider, ProcessorPublicView, StripePlanId } from "./paymentProcessorShared";
export { STRIPE_PLAN_LABELS, PAYMENT_PROCESSOR_CATALOG } from "./paymentProcessorShared";

export type StripeProcessorConfig = {
  secretKey: string;
  publishableKey: string;
  webhookSecret: string;
  priceIds: Partial<Record<StripePlanId, string>>;
};

const STRIPE_PLAN_ENV: Record<StripePlanId, string> = {
  single_lesson: "STRIPE_PRICE_SINGLE_LESSON",
  monthly: "STRIPE_PRICE_MONTHLY",
  premium: "STRIPE_PRICE_PREMIUM",
  lifetime: "STRIPE_PRICE_LIFETIME",
  cgc_prep: "STRIPE_PRICE_CGC_PREP",
  cgc_prep_eval: "STRIPE_PRICE_CGC_PREP_EVAL"
};

function maskSecret(value: string | undefined | null): string {
  if (!value) return "";
  const trimmed = value.trim();
  if (trimmed.length <= 12) return "••••••••";
  return `${trimmed.slice(0, 8)}…${trimmed.slice(-4)}`;
}

function isMaskedPlaceholder(value: string | undefined): boolean {
  if (!value) return true;
  return value.includes("…") || value.includes("••••");
}

function stripeConfigFromEnv(): StripeProcessorConfig {
  const priceIds: Partial<Record<StripePlanId, string>> = {};
  for (const [planId, envKey] of Object.entries(STRIPE_PLAN_ENV) as [StripePlanId, string][]) {
    const value = process.env[envKey]?.trim();
    if (value) priceIds[planId] = value;
  }

  return {
    secretKey: process.env.STRIPE_SECRET_KEY?.trim() || "",
    publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.trim() || "",
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET?.trim() || "",
    priceIds
  };
}

function mergeStripeConfig(envConfig: StripeProcessorConfig, dbConfig: Partial<StripeProcessorConfig>): StripeProcessorConfig {
  const mergedPrices: Partial<Record<StripePlanId, string>> = { ...envConfig.priceIds };
  for (const [planId, value] of Object.entries(dbConfig.priceIds || {})) {
    if (value?.trim()) mergedPrices[planId as StripePlanId] = value.trim();
  }

  return {
    secretKey: dbConfig.secretKey?.trim() || envConfig.secretKey,
    publishableKey: dbConfig.publishableKey?.trim() || envConfig.publishableKey,
    webhookSecret: dbConfig.webhookSecret?.trim() || envConfig.webhookSecret,
    priceIds: mergedPrices
  };
}

function configSource(envConfig: StripeProcessorConfig, dbConfig: Partial<StripeProcessorConfig> | null, enabled: boolean): ProcessorPublicView["configSource"] {
  if (!enabled || !dbConfig) {
    const hasEnv = Boolean(envConfig.secretKey && envConfig.publishableKey);
    return hasEnv ? "environment" : "none";
  }

  const dbHasSecrets = Boolean(dbConfig.secretKey || dbConfig.publishableKey || dbConfig.webhookSecret);
  const dbHasPrices = Boolean(dbConfig.priceIds && Object.values(dbConfig.priceIds).some(Boolean));
  if (!dbHasSecrets && !dbHasPrices) {
    return envConfig.secretKey ? "environment" : "none";
  }

  const envAlsoUsed =
    (!dbConfig.secretKey && envConfig.secretKey) ||
    (!dbConfig.publishableKey && envConfig.publishableKey) ||
    Object.entries(envConfig.priceIds).some(([planId, value]) => value && !dbConfig.priceIds?.[planId as StripePlanId]);

  return envAlsoUsed ? "merged" : "database";
}

export async function getStripeProcessorRecord() {
  return prisma.paymentProcessorSettings.findUnique({ where: { provider: "stripe" } });
}

export async function resolveStripeConfig(): Promise<StripeProcessorConfig & { source: ProcessorPublicView["configSource"] }> {
  const envConfig = stripeConfigFromEnv();
  const record = await getStripeProcessorRecord();

  if (!record?.enabled) {
    return { ...envConfig, source: envConfig.secretKey ? "environment" : "none" };
  }

  let dbConfig: Partial<StripeProcessorConfig> = {};
  try {
    dbConfig = JSON.parse(record.config || "{}") as Partial<StripeProcessorConfig>;
  } catch {
    dbConfig = {};
  }

  const merged = mergeStripeConfig(envConfig, dbConfig);
  return { ...merged, source: configSource(envConfig, dbConfig, true) };
}

export async function getStripeClient(): Promise<Stripe | null> {
  const config = await resolveStripeConfig();
  if (!config.secretKey) return null;
  return new Stripe(config.secretKey);
}

export async function getStripePrices(): Promise<Record<StripePlanId, string>> {
  const config = await resolveStripeConfig();
  return {
    single_lesson: config.priceIds.single_lesson || "",
    monthly: config.priceIds.monthly || "",
    premium: config.priceIds.premium || "",
    lifetime: config.priceIds.lifetime || "",
    cgc_prep: config.priceIds.cgc_prep || "",
    cgc_prep_eval: config.priceIds.cgc_prep_eval || ""
  };
}

export async function getWebhookSecret(): Promise<string> {
  const config = await resolveStripeConfig();
  return config.webhookSecret;
}

export function stripeConnectionStatus(config: StripeProcessorConfig): { status: string; detail: string } {
  if (!config.secretKey || !config.publishableKey) {
    return { status: "not_configured", detail: "Secret and publishable keys required." };
  }

  const priceCount = Object.values(config.priceIds).filter(Boolean).length;
  if (priceCount === 0) {
    return { status: "warning", detail: "Stripe keys present but no price IDs configured." };
  }

  if (!config.webhookSecret) {
    return { status: "warning", detail: `${priceCount} price IDs configured — add webhook secret for purchase fulfillment.` };
  }

  return { status: "connected", detail: `${priceCount} price IDs configured with webhook secret.` };
}

export async function testStripeConnection(config?: StripeProcessorConfig): Promise<{ ok: boolean; message: string; status: string }> {
  const resolved = config || (await resolveStripeConfig());
  if (!resolved.secretKey) {
    return { ok: false, message: "Stripe secret key is missing.", status: "not_configured" };
  }

  try {
    const client = new Stripe(resolved.secretKey);
    const account = await client.accounts.retrieve();
    const priceCount = Object.values(resolved.priceIds).filter(Boolean).length;
    const mode = resolved.secretKey.startsWith("sk_live") ? "live" : "test";
    const business = account.settings?.dashboard?.display_name || account.email || account.id;

    return {
      ok: true,
      status: "connected",
      message: `Connected to Stripe (${mode}) — ${business}. ${priceCount} price ID${priceCount === 1 ? "" : "s"} configured.`
    };
  } catch (error) {
    return {
      ok: false,
      status: "error",
      message: error instanceof Error ? error.message : "Stripe connection failed."
    };
  }
}

export async function listPaymentProcessorsForAdmin(): Promise<ProcessorPublicView[]> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "";
  const stripeResolved = await resolveStripeConfig();
  const stripeRecord = await getStripeProcessorRecord();
  const stripeStatus = stripeRecord?.status || stripeConnectionStatus(stripeResolved).status;

  const records = await prisma.paymentProcessorSettings.findMany();
  const recordMap = new Map(records.map((row) => [row.provider, row]));

  return PAYMENT_PROCESSOR_CATALOG.map((item) => {
    const record = recordMap.get(item.provider);
    const enabled = record?.enabled ?? false;

    if (item.provider === "stripe") {
      const connection = stripeConnectionStatus(stripeResolved);
      return {
        provider: item.provider,
        label: item.label,
        description: item.description,
        enabled: enabled || Boolean(stripeResolved.secretKey),
        status: stripeRecord?.lastTestedAt ? stripeStatus : connection.status,
        lastTestedAt: stripeRecord?.lastTestedAt?.toISOString() ?? null,
        lastError: stripeRecord?.lastError ?? null,
        configSource: stripeResolved.source,
        fields: {
          secretKey: maskSecret(stripeResolved.secretKey),
          publishableKey: maskSecret(stripeResolved.publishableKey),
          webhookSecret: maskSecret(stripeResolved.webhookSecret)
        },
        priceIds: stripeResolved.priceIds,
        webhookUrl: baseUrl ? `${baseUrl}/api/stripe/webhook` : null,
        dashboardUrl: item.dashboardUrl,
        linkable: item.linkable
      };
    }

    let fields: Record<string, string> = {};
    if (record?.config) {
      try {
        const parsed = JSON.parse(record.config) as Record<string, string>;
        fields = Object.fromEntries(Object.entries(parsed).map(([key, value]) => [key, maskSecret(value)]));
      } catch {
        fields = {};
      }
    }

    return {
      provider: item.provider,
      label: item.label,
      description: item.description,
      enabled,
      status: record?.status || "not_configured",
      lastTestedAt: record?.lastTestedAt?.toISOString() ?? null,
      lastError: record?.lastError ?? null,
      configSource: enabled ? "database" : "none",
      fields,
      priceIds: {},
      webhookUrl: null,
      dashboardUrl: item.dashboardUrl,
      linkable: item.linkable
    };
  });
}

export async function savePaymentProcessor(input: {
  provider: PaymentProvider;
  enabled: boolean;
  config: Record<string, unknown>;
  updatedById: string;
}) {
  const existing = await prisma.paymentProcessorSettings.findUnique({
    where: { provider: input.provider }
  });

  let nextConfig: Record<string, unknown> = {};
  if (existing?.config) {
    try {
      nextConfig = JSON.parse(existing.config) as Record<string, unknown>;
    } catch {
      nextConfig = {};
    }
  }

  for (const [key, value] of Object.entries(input.config)) {
    if (typeof value !== "string") continue;
    if (isMaskedPlaceholder(value)) continue;
    if (!value.trim()) continue;
    nextConfig[key] = value.trim();
  }

  if (input.provider === "stripe") {
    const existingPrices = (nextConfig.priceIds as Record<string, string> | undefined) || {};
    const incomingPrices = (input.config.priceIds as Record<string, string> | undefined) || {};
    const mergedPrices = { ...existingPrices };
    for (const [planId, value] of Object.entries(incomingPrices)) {
      if (typeof value !== "string") continue;
      if (isMaskedPlaceholder(value)) continue;
      if (!value.trim()) continue;
      mergedPrices[planId] = value.trim();
    }
    nextConfig.priceIds = mergedPrices;
  }

  const saved = await prisma.paymentProcessorSettings.upsert({
    where: { provider: input.provider },
    update: {
      enabled: input.enabled,
      config: JSON.stringify(nextConfig),
      updatedById: input.updatedById,
      status: input.enabled ? "pending" : "not_configured",
      lastError: null
    },
    create: {
      provider: input.provider,
      enabled: input.enabled,
      config: JSON.stringify(nextConfig),
      updatedById: input.updatedById,
      status: input.enabled ? "pending" : "not_configured"
    }
  });

  return saved;
}

export async function markProcessorTestResult(provider: PaymentProvider, result: { ok: boolean; message: string; status: string }) {
  await prisma.paymentProcessorSettings.upsert({
    where: { provider },
    update: {
      status: result.status,
      lastTestedAt: new Date(),
      lastError: result.ok ? null : result.message
    },
    create: {
      provider,
      enabled: provider === "stripe",
      config: "{}",
      status: result.status,
      lastTestedAt: new Date(),
      lastError: result.ok ? null : result.message
    }
  });
}
