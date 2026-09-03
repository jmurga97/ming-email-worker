export type PolicyErrorCode =
  | "PRODUCT_NOT_ALLOWED"
  | "TEMPLATE_NOT_ALLOWED"
  | "SENDER_PROFILE_NOT_ALLOWED"
  | "SENDER_NOT_ALLOWED"
  | "CONTACT_RECIPIENT_NOT_CONFIGURED"
  | "QUOTE_RECIPIENT_NOT_CONFIGURED"
  | "QUOTE_SUBJECT_NOT_CONFIGURED"
  | "DIGEST_SUBJECT_NOT_CONFIGURED"
  | "INVITE_SUBJECT_NOT_CONFIGURED";

export class PolicyError extends Error {
  constructor(
    readonly code: PolicyErrorCode,
    message: string,
  ) {
    super(message);
    this.name = "PolicyError";
  }
}
