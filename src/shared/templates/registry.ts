import { contactFormEmailDataSchema, renderContactFormEmail } from "./ming/contact-form-email";
import { otpEmailDataSchema, renderOtpEmail } from "./ming/otp-email";

import type { RenderedEmail } from "./types";
import type { ProductConfig } from "@/config/runtime";
import type { SendEmailRequest } from "@/modules/email/schemas/send-email.schema";

export const registeredTemplates = {
  "contact-form": {
    dataSchema: contactFormEmailDataSchema,
    render: renderContactFormEmail,
  },
  otp: {
    dataSchema: otpEmailDataSchema,
    render: renderOtpEmail,
  },
} as const;

export async function renderRegisteredTemplate(
  payload: SendEmailRequest,
  product: ProductConfig,
): Promise<RenderedEmail> {
  switch (payload.template) {
    case "otp":
      return registeredTemplates.otp.render({
        branding: product.branding,
        otp: payload.data.otp,
        expiresIn: payload.data.expiresIn,
      });
    case "contact-form":
      return registeredTemplates["contact-form"].render({
        branding: product.branding,
        name: payload.data.name,
        email: payload.data.email,
        message: payload.data.message,
      });
  }
}
