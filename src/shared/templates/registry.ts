import { contactFormEmailDataSchema, renderContactFormEmail } from "./ming/contact-form-email";
import { otpEmailDataSchema, renderOtpEmail } from "./ming/otp-email";
import { quoteRequestEmailDataSchema, renderQuoteRequestEmail } from "./ming/quote-request-email";
import {
  analyticsDigestEmailDataSchema,
  renderQmenutAnalyticsDigestEmail,
} from "./qmenut/analytics-digest-email";
import { renderQmenutOtpEmail } from "./qmenut/otp-email";
import { renderUserInviteEmail, userInviteEmailDataSchema } from "./qmenut/user-invite-email";

import type { RenderedEmail } from "./types";
import type { ProductConfig } from "@/config/runtime";
import type { SendEmailRequest } from "@/modules/email/schemas/send-email.schema";

export const registeredTemplates = {
  "analytics-digest": {
    dataSchema: analyticsDigestEmailDataSchema,
    render: renderQmenutAnalyticsDigestEmail,
  },
  "contact-form": {
    dataSchema: contactFormEmailDataSchema,
    render: renderContactFormEmail,
  },
  otp: {
    dataSchema: otpEmailDataSchema,
    render: renderOtpEmail,
  },
  "quote-request": {
    dataSchema: quoteRequestEmailDataSchema,
    render: renderQuoteRequestEmail,
  },
  "user-invite": {
    dataSchema: userInviteEmailDataSchema,
    render: renderUserInviteEmail,
  },
} as const;

export async function renderRegisteredTemplate(
  payload: SendEmailRequest,
  product: ProductConfig,
  productId: string,
): Promise<RenderedEmail> {
  switch (payload.template) {
    case "otp":
      return (productId === "qmenut" ? renderQmenutOtpEmail : registeredTemplates.otp.render)({
        branding: product.branding,
        otp: payload.data.otp,
        expiresIn: payload.data.expiresIn,
      });
    case "analytics-digest":
      return renderQmenutAnalyticsDigestEmail({
        branding: product.branding,
        data: payload.data,
      });
    case "contact-form":
      return registeredTemplates["contact-form"].render({
        branding: product.branding,
        name: payload.data.name,
        email: payload.data.email,
        fields: payload.data.fields,
        message: payload.data.message,
      });
    case "quote-request":
      return registeredTemplates["quote-request"].render({
        branding: product.branding,
        email: payload.data.email,
        fields: payload.data.fields,
        items: payload.data.items,
        name: payload.data.name,
        phone: payload.data.phone,
      });
    case "user-invite":
      return renderUserInviteEmail({
        branding: product.branding,
        data: payload.data,
      });
  }
}
