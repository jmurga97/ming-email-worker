import type { Bindings, EmailBinding, EmailMessageInput } from "@/config/types";

export const allowedSenders = ["noreply@mail.murga.ing"];

export const senderProfiles = {
  "roncalphoto-default": {
    email: "noreply@mail.murga.ing",
    name: "RoncalPhoto",
  },
};

export const products = {
  roncalphoto: {
    branding: {
      name: "RoncalPhoto",
      locale: "es",
    },
    allowedTemplates: ["otp", "contact-form"],
    allowedFromProfiles: ["roncalphoto-default"],
    subjects: {
      otp: "Tu codigo de acceso a RoncalPhoto",
      contactForm: "Nuevo contacto desde RoncalPhoto",
    },
    contactRecipient: "studio@example.com",
  },
};

export function createBindings(
  send: EmailBinding["send"] = () => Promise.resolve({ messageId: "message-123" }),
): Bindings {
  return {
    SEND_EMAIL: { send },
    ALLOWED_SENDERS: JSON.stringify(allowedSenders),
    SENDER_PROFILES: JSON.stringify(senderProfiles),
    PRODUCTS: JSON.stringify(products),
    NODE_ENV: "test",
    LOG_LEVEL: "error",
  };
}

export function createOtpPayload() {
  return {
    product: "roncalphoto",
    template: "otp" as const,
    fromProfile: "roncalphoto-default",
    to: "admin@example.com",
    data: {
      otp: "123456",
      expiresIn: "5 minutos",
    },
    metadata: {
      requestId: "request-123",
      source: "auth",
    },
  };
}

export function createContactPayload() {
  return {
    product: "roncalphoto",
    template: "contact-form" as const,
    fromProfile: "roncalphoto-default",
    replyTo: "person@example.com",
    data: {
      name: "Person",
      email: "person@example.com",
      message: "I would like more information.",
    },
    metadata: {
      requestId: "request-456",
      source: "contact-form",
    },
  };
}

export type CapturedEmail = EmailMessageInput;
