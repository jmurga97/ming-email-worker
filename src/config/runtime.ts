import { z } from "zod";

import type { Bindings } from "@/config/types";

const templateNameSchema = z.enum(["otp", "contact-form"]);

const senderProfileSchema = z
  .object({
    email: z.email().trim(),
    name: z.string().trim().min(1).max(120),
  })
  .strict();

const productSchema = z
  .object({
    branding: z
      .object({
        name: z.string().trim().min(1).max(120),
        locale: z.enum(["en", "es"]),
      })
      .strict(),
    allowedTemplates: z.array(templateNameSchema).min(1),
    allowedFromProfiles: z.array(z.string().trim().min(1)).min(1),
    subjects: z
      .object({
        otp: z.string().trim().min(1).max(200),
        contactForm: z.string().trim().min(1).max(200),
      })
      .strict(),
    contactRecipient: z.email().trim().optional(),
  })
  .strict()
  .superRefine((product, context) => {
    if (
      product.allowedTemplates.includes("contact-form") &&
      product.contactRecipient === undefined
    ) {
      context.addIssue({
        code: "custom",
        message: "contactRecipient is required when contact-form is enabled",
        path: ["contactRecipient"],
      });
    }
  });

const runtimeConfigSchema = z
  .object({
    allowedSenders: z.array(z.email().trim()).min(1),
    senderProfiles: z.record(z.string().trim().min(1), senderProfileSchema),
    products: z.record(z.string().trim().min(1), productSchema),
    nodeEnv: z.enum(["development", "test", "production"]),
    logLevel: z.enum(["debug", "info", "warn", "error"]),
  })
  .strict()
  .superRefine((config, context) => {
    for (const [profileId, profile] of Object.entries(config.senderProfiles)) {
      if (!config.allowedSenders.includes(profile.email)) {
        context.addIssue({
          code: "custom",
          message: `Sender profile "${profileId}" is not in ALLOWED_SENDERS`,
          path: ["senderProfiles", profileId, "email"],
        });
      }
    }

    for (const [productId, product] of Object.entries(config.products)) {
      for (const profileId of product.allowedFromProfiles) {
        if (config.senderProfiles[profileId] === undefined) {
          context.addIssue({
            code: "custom",
            message: `Unknown sender profile "${profileId}"`,
            path: ["products", productId, "allowedFromProfiles"],
          });
        }
      }
    }
  });

export type RuntimeConfig = z.infer<typeof runtimeConfigSchema>;
export type ProductConfig = RuntimeConfig["products"][string];
export type SenderProfile = RuntimeConfig["senderProfiles"][string];
export type TemplateName = z.infer<typeof templateNameSchema>;

function parseJson(value: string, variableName: string): unknown {
  try {
    return JSON.parse(value);
  } catch {
    throw new Error(`${variableName} must contain valid JSON`);
  }
}

export function parseRuntimeConfig(env: Bindings): RuntimeConfig {
  return runtimeConfigSchema.parse({
    allowedSenders: parseJson(env.ALLOWED_SENDERS, "ALLOWED_SENDERS"),
    senderProfiles: parseJson(env.SENDER_PROFILES, "SENDER_PROFILES"),
    products: parseJson(env.PRODUCTS, "PRODUCTS"),
    nodeEnv: env.NODE_ENV,
    logLevel: env.LOG_LEVEL,
  });
}
