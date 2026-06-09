import { renderContactFormEmail } from "./contact-form-email";
import { renderOtpEmail } from "./otp-email";

import type { RenderedEmail } from "./types";
import type { ProductConfig } from "@/config/runtime";
import type { SendEmailRequest } from "@/modules/email/schemas/send-email.schema";

export async function renderRegisteredTemplate(
  payload: SendEmailRequest,
  product: ProductConfig,
): Promise<RenderedEmail> {
  switch (payload.template) {
    case "otp":
      return renderOtpEmail({
        branding: product.branding,
        otp: payload.data.otp,
        expiresIn: payload.data.expiresIn,
      });
    case "contact-form":
      return renderContactFormEmail({
        branding: product.branding,
        name: payload.data.name,
        email: payload.data.email,
        message: payload.data.message,
      });
  }
}
