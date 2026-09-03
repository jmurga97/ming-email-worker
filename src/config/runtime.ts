import { z } from "zod";

import emailPolicy from "@/config/email-policy.json";

import type { Bindings } from "@/config/types";

const templateNameSchema = z.enum([
  "analytics-digest",
  "contact-form",
  "otp",
  "quote-request",
  "user-invite",
]);

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
        quoteRequest: z.string().trim().min(1).max(200).optional(),
        analyticsDigest: z.string().trim().min(1).max(200).optional(),
        userInvite: z.string().trim().min(1).max(200).optional(),
      })
      .strict(),
    contactRecipient: z.email().trim().optional(),
    quoteRecipient: z.email().trim().optional(),
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
    if (
      product.allowedTemplates.includes("quote-request") &&
      product.quoteRecipient === undefined &&
      product.contactRecipient === undefined
    ) {
      context.addIssue({
        code: "custom",
        message: "quoteRecipient or contactRecipient is required when quote-request is enabled",
        path: ["quoteRecipient"],
      });
    }
    if (
      product.allowedTemplates.includes("quote-request") &&
      product.subjects.quoteRequest === undefined
    ) {
      context.addIssue({
        code: "custom",
        message: "subjects.quoteRequest is required when quote-request is enabled",
        path: ["subjects", "quoteRequest"],
      });
    }
    if (
      product.allowedTemplates.includes("analytics-digest") &&
      product.subjects.analyticsDigest === undefined
    ) {
      context.addIssue({
        code: "custom",
        message: "subjects.analyticsDigest is required when analytics-digest is enabled",
        path: ["subjects", "analyticsDigest"],
      });
    }
    if (
      product.allowedTemplates.includes("user-invite") &&
      product.subjects.userInvite === undefined
    ) {
      context.addIssue({
        code: "custom",
        message: "subjects.userInvite is required when user-invite is enabled",
        path: ["subjects", "userInvite"],
      });
    }
  });

const runtimeConfigSchema = z
  .object({
    senderProfiles: z.record(z.string().trim().min(1), senderProfileSchema),
    products: z.record(z.string().trim().min(1), productSchema),
    nodeEnv: z.enum(["development", "test", "production"]),
    logLevel: z.enum(["debug", "info", "warn", "error"]),
  })
  .strict()
  .superRefine((config, context) => {
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

export function parseRuntimeConfig(env: Bindings): RuntimeConfig {
  const result = runtimeConfigSchema.safeParse({
    ...emailPolicy,
    nodeEnv: env.NODE_ENV,
    logLevel: env.LOG_LEVEL,
  });

  if (!result.success) {
    throw new Error("Invalid Config");
  }

  return result.data;
}
