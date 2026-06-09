import { z } from "@hono/zod-openapi";

import { createSuccessResponseSchema } from "@/shared/lib/http";
import { registeredTemplates } from "@/shared/templates/registry";

const identifierSchema = z
  .string()
  .trim()
  .min(1)
  .max(80)
  .regex(/^[a-z0-9][a-z0-9-]*$/);

const metadataSchema = z
  .object({
    requestId: z.string().trim().min(1).max(120).optional(),
    source: z.string().trim().min(1).max(80).optional(),
  })
  .strict();

const commonRequestFields = {
  fromProfile: identifierSchema,
  metadata: metadataSchema.optional(),
};

export const sendEmailQuerySchema = z
  .object({
    productId: identifierSchema,
  })
  .strict();

export const otpSendRequestSchema = z
  .object({
    ...commonRequestFields,
    template: z.literal("otp"),
    to: z.email().trim(),
    data: registeredTemplates.otp.dataSchema,
  })
  .strict();

export const contactFormSendRequestSchema = z
  .object({
    ...commonRequestFields,
    template: z.literal("contact-form"),
    replyTo: z.email().trim(),
    data: registeredTemplates["contact-form"].dataSchema,
  })
  .strict()
  .superRefine((payload, context) => {
    if (payload.replyTo.toLowerCase() !== payload.data.email.toLowerCase()) {
      context.addIssue({
        code: "custom",
        message: "replyTo must match data.email",
        path: ["replyTo"],
      });
    }
  });

export const sendEmailRequestSchema = z
  .discriminatedUnion("template", [otpSendRequestSchema, contactFormSendRequestSchema])
  .openapi("SendEmailRequest");

export const sendEmailResponseDataSchema = z.object({
  messageId: z.string().min(1),
});

export const sendEmailResponseSchema = createSuccessResponseSchema(
  sendEmailResponseDataSchema,
).openapi("SendEmailResponse");

export type SendEmailRequest = z.infer<typeof sendEmailRequestSchema>;
export type OtpSendRequest = z.infer<typeof otpSendRequestSchema>;
export type ContactFormSendRequest = z.infer<typeof contactFormSendRequestSchema>;
