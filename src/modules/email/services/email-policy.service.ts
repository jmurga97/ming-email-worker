import { PolicyError } from "@/shared/errors/policy-error";

import type { ProductConfig, RuntimeConfig, SenderProfile } from "@/config/runtime";
import type { SendEmailRequest } from "@/modules/email/schemas/send-email.schema";

export interface ResolvedEmailPolicy {
  from: SenderProfile;
  product: ProductConfig;
  replyTo?: string;
  subject: string;
  to: string;
}

export function resolveEmailPolicy(
  config: RuntimeConfig,
  productId: string,
  payload: SendEmailRequest,
): ResolvedEmailPolicy {
  const product = config.products[productId];

  if (!product) {
    throw new PolicyError("PRODUCT_NOT_ALLOWED", "Product is not configured");
  }

  if (!product.allowedTemplates.includes(payload.template)) {
    throw new PolicyError("TEMPLATE_NOT_ALLOWED", "Template is not allowed for this product");
  }

  if (!product.allowedFromProfiles.includes(payload.fromProfile)) {
    throw new PolicyError(
      "SENDER_PROFILE_NOT_ALLOWED",
      "Sender profile is not allowed for this product",
    );
  }

  const from = config.senderProfiles[payload.fromProfile];

  if (!from) {
    throw new PolicyError("SENDER_NOT_ALLOWED", "Sender is not allowed");
  }

  if (payload.template === "otp") {
    return {
      from,
      product,
      subject: product.subjects.otp,
      to: payload.to,
    };
  }

  if (!product.contactRecipient) {
    throw new PolicyError(
      "CONTACT_RECIPIENT_NOT_CONFIGURED",
      "Contact recipient is not configured",
    );
  }

  return {
    from,
    product,
    replyTo: payload.replyTo,
    subject: product.subjects.contactForm,
    to: product.contactRecipient,
  };
}
