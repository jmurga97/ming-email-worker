import { renderRegisteredTemplate } from "@/shared/templates/registry";

import { resolveEmailPolicy } from "./email-policy.service";

import type { RuntimeConfig } from "@/config/runtime";
import type { Bindings, EmailSendResult } from "@/config/types";
import type { SendEmailRequest } from "@/modules/email/schemas/send-email.schema";

export async function sendTransactionalEmail(
  env: Bindings,
  config: RuntimeConfig,
  productId: string,
  payload: SendEmailRequest,
): Promise<EmailSendResult> {
  const policy = resolveEmailPolicy(config, productId, payload);
  const rendered = await renderRegisteredTemplate(payload, policy.product, productId);

  return env.SEND_EMAIL.send({
    to: policy.to,
    from: policy.from,
    subject: policy.subject,
    html: rendered.html,
    text: rendered.text,
    ...(policy.replyTo ? { replyTo: { email: policy.replyTo } } : {}),
  });
}
