import type { OpenAPIHono } from "@hono/zod-openapi";

export interface EmailAddress {
  email: string;
  name?: string;
}

export interface EmailMessageInput {
  to: string | string[];
  from: EmailAddress;
  subject: string;
  html?: string;
  text?: string;
  replyTo?: EmailAddress;
}

export interface EmailSendResult {
  messageId: string;
}

export interface EmailBinding {
  send(message: EmailMessageInput): Promise<EmailSendResult>;
}

export interface Bindings {
  SEND_EMAIL: EmailBinding;
  ALLOWED_SENDERS: string;
  SENDER_PROFILES: string;
  PRODUCTS: string;
  NODE_ENV: string;
  LOG_LEVEL: string;
}

export type AppBindings = {
  Bindings: Bindings;
};

export type App = OpenAPIHono<AppBindings>;
