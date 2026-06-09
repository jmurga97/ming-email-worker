import { z } from "@hono/zod-openapi";

import { createSuccessResponseSchema } from "@/shared/lib/http";

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
  product: identifierSchema,
  fromProfile: identifierSchema,
  metadata: metadataSchema.optional(),
};

export const otpSendRequestSchema = z
  .object({
    ...commonRequestFields,
    template: z.literal("otp"),
    to: z.email().trim(),
    data: z
      .object({
        otp: z.string().trim().min(1).max(32),
        expiresIn: z.string().trim().min(1).max(100),
      })
      .strict(),
  })
  .strict();

export const contactFormSendRequestSchema = z
  .object({
    ...commonRequestFields,
    template: z.literal("contact-form"),
    replyTo: z.email().trim(),
    data: z
      .object({
        name: z.string().trim().min(1).max(120),
        email: z.email().trim(),
        message: z.string().trim().min(1).max(5000),
      })
      .strict(),
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
